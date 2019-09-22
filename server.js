//require('dotenv').config()
//let koa = require('koa')
//let mongoose = require('mongoose')
const fs = require("fs")
const util = require("util")

const writeFile = util.promisify(fs.writeFile)
const rename = util.promisify(fs.rename)
const copyFile = util.promisify(fs.copyFile)

const Koa = require('koa')
const mongoose = require('mongoose')
var Router = require('koa-router');
const koaBody = require('koa-body');
require('dotenv').config()
const jwt = require('jsonwebtoken')
const validator = require('validator');
const bcrypt = require('bcrypt');

const { promisify } = require('util');
const sizeOf = promisify(require('image-size'));


const app = new Koa();

const publicRouter = new Router();
const protectedRouter = new Router()

const User = require('./models/user_model')
const Page = require('./models/page_model')
const ColorPallets = require("./models/color_pallets_model") 
const Template = require("./models/template_model")
const CSSDocument = require("./models/css_document_model")


// let db_uri = 'mongodb://' + process.env.DB_USERNAME + ':' + process.env.DB_PASSWORD + '/localhost:27017/' + process.env.DB_NAME
let db_uri = 'mongodb://localhost:27017/' + process.env.DB_NAME
mongoose.connect(db_uri, { useNewUrlParser: true })

const db = mongoose.connection

db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function () {
    console.log('connected to database')
});

// static assets 
app.use(require('koa-static')('./build'))
app.use(require('koa-static')('./public'))
app.use(koaBody({ 
    // formidable:{uploadDir: './uploads'},
    multipart: true 
}))

// pages everyone can reach
/* Registration, Login, Logout */
function register_validator(ctx) {
    if (validator.isEmail(ctx.request.body.email) === false) return false

    return true
}

async function createDefaultUserResources(user) {
    try {
        let colorPallets = new ColorPallets({
            owner: user.email,
            pallets: [],
        });
        colorPallets = await colorPallets.save();
    } catch(e) {
        console.log("Critical failure: The creation of a resouce the app expects to be avialable failed. Error: ", e);
    }
}


/* Remove this, user have to be added manyally and all resources belong to the "site" not the one editing */ 
publicRouter.post('/register', async ctx => {
    if (!register_validator(ctx)) {
        ctx.status = 400
        ctx.body = {
            error: 'Validation Failed'
        }
        return
    }
    try {
        let password = await bcrypt.hash(ctx.request.body.password, 10)
    
        ctx.request.body.password = password

        let user = new User(ctx.request.body)
        user = await user.save()
        console.log('### ' + user.email + ' registered successfully!')

        createDefaultUserResources();

        const token = jwt.sign({
            exp: Math.floor(Date.now() / 1000) + (60 * 60),
            data: user,
        }, process.env.JWT_SECRET)
    
        ctx.status = 200
        ctx.set('Authorization', token)
        ctx.body = {
            user: user,
            token: token, 
        }

    } catch(error) {
        ctx.status = 400
        ctx.set('Content-Type', 'application/json')
        ctx.body = { error: error }
    }
    // not calling next will cause the nested functions to resolve
})

publicRouter.post('/login', async (ctx) => {
    try {
        let user = await User.findOne({ email: ctx.request.body.email }).select('+password').exec()

        if (!user) throw Error("Failed to find user.")

        let pass_compare_result = await bcrypt.compare(ctx.request.body.password, user.password)
        
        if (!pass_compare_result) {
            ctx.status = 400
            ctx.body = {
                error: 'Wrong password'
            }
            return 
        }
        delete user.password

        const token = jwt.sign({
            exp: Math.floor(Date.now() / 1000) + (60 * 60),
            data: user,
        }, process.env.JWT_SECRET)
    
        ctx.status = 200
        ctx.set('Authorization', token)
        ctx.body = {
            user: user,
            token: token, 
        }
    } catch(error) {
        console.log("Login exception caught: ", error)
        ctx.status = 400
        ctx.body = {
            error: "Login Failed"
        }
    }


})

publicRouter.post("/logout", async ctx => {
    ctx.set("Authorization", null)
    ctx.status = 200
})

publicRouter.get("/user", async ctx => {
    try {
        const user = await User.findOne({ email: "didrik.fleischer@gmail.com"}).exec()
        ctx.status = 200
        ctx.body = user
    } catch(error) {
        ctx.status = 400
        ctx.body = {
            error: "Failed to get user"
        }
    }
})

publicRouter.get("/pages", async ctx => {
    // Need to figure out this...
    // Maybe I assume that this app will only support one admin/owner/user and 
    // s that users must be manually added to get be able to modify the resources of the site

    try {
        const pages = await Page.find().exec()

        ctx.status = 200
        ctx.body = pages
    } catch (error) {
        ctx.status = 400
        ctx.body = {
            error: "Failed to get pages from the database",
        }
    }
})

publicRouter.get("/pages/:pathTitle", async ctx => {
    try {
        const pages = await Page.findOne({ pathTitle: ctx.params.pathTitle }).exec()

        ctx.status = 200
        ctx.body = pages
    } catch(error) {
        ctx.status = 400
        ctx.body = {
            error: "Failed to get page from the database",
        }
    }
})

// auth middleware

async function authorize(ctx, next) {
    try {
        const token = ctx.request.header['authorization']

        var decoded = jwt.verify(token, process.env.JWT_SECRET);
        ctx.auth = {}
        ctx.auth['token'] = decoded
        ctx.auth['user'] = decoded.data
        console.log("Decoded token: ", decoded)

    } catch (err) {
        console.log("Not authorized! Error: ", err)
        ctx.status = 401
        ctx.body = {
            error: "Not Authorized!"
        }
        return
    }


    await next()
}


// protected pages 

protectedRouter.get("/authcheck", ctx => {
    const token = jwt.sign({
        exp: Math.floor(Date.now() / 1000) + (60 * 60),
        data: ctx.auth["token"]["data"],
    }, process.env.JWT_SECRET)

    console.log("New Token in authcheck: ", token)

    ctx.status = 200
    ctx.set('Authorization', token)
    ctx.body = {
        user: ctx.auth["token"]["data"],
        token: token, 
    }
})

/* Protected Router */
protectedRouter.post("/pages", async ctx => {
    try {
        console.log(ctx.request.body)
        let newPage = Page(ctx.request.body)
        newPage = await newPage.save()
        ctx.status = 201
        ctx.body = newPage

    } catch(error) {
        console.log(error)

        ctx.status = 400
        ctx.body = {
            error: "Failed to create new page",
        }
    }
})

protectedRouter.put("/pages/:pathTitle", async ctx => {
    try {
        const updatedPage = await Page.findOneAndUpdate({ 
            pathTitle: ctx.params.pathTitle, 
            owner: ctx.auth.user.email
        }, ctx.request.body)

        ctx.status = 200
        ctx.body = updatedPage

    } catch(error) {
        ctx.status = 400
        ctx.body = {
            error: `Failed to update page: "${ctx.params.pathTitle}"`,
        }
    }
})

protectedRouter.delete("/pages/:pathTitle", async ctx => {
    try {
        await Page.findOneAndRemove({ pathTitle: ctx.params.pathTitle})

        ctx.status = 200
    } catch(error) {
        ctx.status = 400
        ctx.body = {
            error: `Failed to delete page: "${ctx.params.pathTitle}"`,
        }
    }
})

protectedRouter.get("/colors", async ctx => {
    try {
        const colors = await ColorPallets.findOne().exec() // dont know if findOne needs parameters
        ctx.status = 200
        ctx.body = colors
    } catch(error) {
        console.log(error)
        ctx.status = 400
        ctx.body = {
            error: "Failed to get colors",
        }
    }
})


protectedRouter.post("/colors", async ctx => {
    
    try {
        const ownerEmail = ctx.auth.user.email;
        if (!ownerEmail) throw new Error("No user.email on ctx.auth!")

        let colorPallets = new ColorPallets({
            owner: ownerEmail, // is unique
            pallets: [],
        })

        colorPallets = await colorPallets.save()

        ctx.status = 200
        ctx.body = colorPallets
    } catch(error) {
        console.log(error)
        ctx.status = 400
        ctx.body = {
            error: "Failed to create color pallets",
        }
    }
})

protectedRouter.put("/colors", async ctx => {
    try {
        const ownerEmail = ctx.auth.user.email;
        const updatedPallets = await ColorPallets.findOneAndUpdate({ owner: ownerEmail}, {
            pallets: ctx.request.body
        });
        ctx.status = 200;
        ctx.body = updatedPallets;
    } catch (e) {
        console.log(e)
        ctx.status = 400
        ctx.body = {
            error: "Failed to update color pallets",
        }
    }
})

protectedRouter.delete("/colors", async ctx => {
    try {
        const ownerEmail = ctx.auth.user.email;
        await ColorPallets.findByIdAndRemove({owner: ownerEmail});
        ctx.status = 200;
    } catch (e) {
        console.log(e)
        ctx.status = 400;
        ctx.body = {
            error: "Failed to delete color pallets"
        };
    }
})


protectedRouter.post("/cssdocuments", async ctx => {
    try {
        const ownerEmail = ctx.auth.user.email;
        let doc = new CSSDocument({
            owner: ownerEmail,
            ...ctx.request.body,
        });
        doc = await doc.save();
        ctx.status = 200;
        ctx.body = doc;
    } catch(e) {
        console.log("post cssdocuments error: ", e);
        ctx.status = 400;
        ctx.body = {
            error: "Failed to create css document"
        }
    }
})

protectedRouter.get("/cssdocuments", async ctx => {
    try {
        const ownerEmail = ctx.auth.user.email;
        const docs = await CSSDocument.find({owner: ownerEmail}).exec();
        ctx.status = 200;
        ctx.body = docs;
    } catch(e) {
        console.log("/cssdocuments error: ", e);
        ctx.status = 400;
        ctx.body = {
            error: "Failed to get css documents",
        }
    }
})

protectedRouter.put("/cssdocuments/:id", async ctx => {
    try {
        const ownerEmail = ctx.auth.user.email;
        const doc = await CSSDocument.findOneAndUpdate({_id: ctx.params.id, owner: ownerEmail}, ctx.request.body);
        ctx.status = 200;
        ctx.body = doc;
    } catch(e) {
        ctx.status = 400;
        ctx.body = {
            error: "Failed to update css document with id " + ctx.params.id,
        }
    }
})

protectedRouter.delete("/cssdocuments/:id", async ctx => {
    try {
        const ownerEmail = ctx.auth.user.email;
        const doc = await CSSDocument.findOneAndDelete({_id: ctx.params.id, owner: ownerEmail});
        ctx.status = 200;
    } catch(e) {
        ctx.status = 200;
        ctx.body = {
            error: "Failed to delete css document with id: " + ctx.params.id,
        }
    }
})

protectedRouter.get("/templates", async ctx => {
    try {
        const templates = await Template.find({owner: ctx.auth.user.email}).exec() // templates are shared???

        ctx.status = 200
        ctx.body = templates
    } catch(error) {
        console.log("Get templates error: ", error);
        ctx.status = 400
        ctx.body = {
            error: `Failed to get templates`,
        }
    }
})

protectedRouter.get("/templates/:id", async ctx => {
    try {
        const template = await Template.findOne({ _id: ctx.params.id, owner: ctx.auth.user.email}).exec()

        ctx.status = 200
        ctx.body = template
    } catch(error) {
        ctx.status = 400
        ctx.body = {
            error: `Failed to get templates`,
        }
    }
})


protectedRouter.post("/templates", async ctx => {
    try {

        const userEmail = ctx.auth.user.email;
        if (!userEmail) throw new Error("No user.email on ctx.auth")
        const template = {}
        Object.assign(template, ctx.request.body)
        template["owner"] = userEmail;
        let newTemplate = new Template(template);
        newTemplate = await newTemplate.save();
        ctx.status = 200
        ctx.body = newTemplate
    } catch(error) {
        console.log("Failed to create new template: ", error)
        ctx.status = 400
        ctx.body = {
            error: `Failed to create new template`,
        }
    }
})


protectedRouter.delete("/templates/:id", async ctx => {
    try {
        await Template.findOneAndDelete({ _id: ctx.params.id, owner: ctx.auth.user.email}); // Is this a decent way to do authorization, probably not?

        ctx.status = 200
    } catch(error) {
        ctx.status = 400
        ctx.body = {
            error: `Failed to delete template`,
        }
    }
})


protectedRouter.get('/images', async (ctx) => {
    try {
        let imagePaths = fs.readdirSync("./public/images").map(imageFile => {
            return {
                serverPath: "./public/images/" + imageFile,
                path: "/images/" + imageFile,
            }
        })
        const imageObjects = await Promise.all(imagePaths.map(async imagePaths => {
            const dimensions = await sizeOf(imagePaths.serverPath)

            return {
                path: imagePaths.path,
                width: dimensions.width,
                height: dimensions.height,
                name: imagePaths.path.split("/")[2],
            }
        }))

        ctx.status = 200
        ctx.body = {
            images: imageObjects,
        }
    } catch (error) {
        ctx.status = 404
        ctx.body = {
            error: error
        }
    }

})

protectedRouter.post("/images", async(ctx) => {
    const errors = []

    for(let fileName in ctx.request.files) {
        const file = ctx.request.files[fileName]
        const err = await rename(file.path, "./public/images/"+fileName)

        // const copyError = await copyFile("./build/images/"+fileName, "./public/images/"+fileName)
        if (err) {
            errors.push(err)
        }   
    }

    if (errors.length > 0) {
        ctx.staus = 400
        ctx.body = {
            error: errors
        }
    } else {
        ctx.status = 201
    }


})

protectedRouter.post("/images/:name", async ctx => {
// if exists then delete and replace
    // if not exists, just create
    const errors = []
    
    const fileName = ctx.params.name
    const publicPath = "./public/images/"+fileName
    const buildPath = "./build/images/"+fileName
    try {
        if (fs.existsSync(publicPath)) {
            fs.unlinkSync(publicPath)
        } 
        
        if (fs.existsSync(buildPath)) {
            fs.unlinkSync(buildPath)
        }
    } catch (error) {
        ctx.status = 400
        ctx.body = {
            errors:  [{
                text: "Filed to remove the old image when updating.",
                error: error
            }]
        }

        return
    }
    
    for(let fileName in ctx.request.files) { // should only be one file...
        const file = ctx.request.files[fileName]
        const err = await rename(file.path, "./public/images/"+fileName)

        // const copyError = await copyFile("./build/images/"+fileName, "./public/images/"+fileName)
        if (err) {
            errors.push(err)
        }   
    }

    if (errors.length > 0) {
        ctx.status = 400
        ctx.body = {
            error: errors
        }
    } else {
        ctx.status = 201
    }
})

protectedRouter.delete("/images/:name", async (ctx) => {
    const fileName = ctx.params.name
    const publicPath = "./public/images/"+fileName
    const buildPath = "./build/images/"+fileName
    try {
        if (fs.existsSync(publicPath)) {
            fs.unlinkSync(publicPath)
        } 
        
        if (fs.existsSync(buildPath)) {
            fs.unlinkSync(buildPath)
        }

        ctx.status = 200
    } catch (error) {
        console.log(error)
        ctx.status = 400
    }
})


protectedRouter.get("/files", async ctx => {
    try {
        let fileObjects = fs.readdirSync("./public/files").map(fileName => {
            const splitName = fileName.split(".")
            const type = splitName[splitName.length - 1].toLowerCase()
            return {
                serverPath: "./public/files/" + fileName,
                path: "/files/" + fileName,
                name: fileName,
                type: type,
            }
        })

        ctx.status = 200
        ctx.body = {
            files: fileObjects,
        }
    } catch (error) {
        ctx.status = 404
        ctx.body = {
            error: error
        }
    }
})

protectedRouter.post("/files", async ctx => {
    const errors = []

    for(let fileName in ctx.request.files) {
        const file = ctx.request.files[fileName]
        const err = await rename(file.path, "./public/files/"+fileName)

        // const copyError = await copyFile("./build/images/"+fileName, "./public/images/"+fileName)
        if (err) {
            errors.push(err)
        }   
    }

    if (errors.length === 0) {
        ctx.status = 201
    } else {
        ctx.status = 400
        ctx.body = {
            error: errors
        }
    }
})

protectedRouter.delete("/files/:name", async ctx => {
    const fileName = ctx.params.name
    const publicPath = "./public/files/"+fileName
    const buildPath = "./build/files/"+fileName
    try {
        if (fs.existsSync(publicPath)) {
            fs.unlinkSync(publicPath)
        } 
        
        if (fs.existsSync(buildPath)) {
            fs.unlinkSync(buildPath)
        }

        ctx.status = 200
    } catch (error) {
        console.log(error)
        ctx.status = 400
    }
})



app.use(publicRouter.routes())
app.use(publicRouter.allowedMethods());

app.use(authorize); 

app.use(protectedRouter.routes())
app.use(protectedRouter.allowedMethods());


app.on('error', err => {
    console.error('server error', err)
});


app.listen(4000);







/*
publicRouter.put("/files/:name", async ctx => {
    // if exists then delete and replace
    // if not exists, just create
    const errors = []
    
    const fileName = ctx.params.name
    const publicPath = "./public/files/"+fileName
    const buildPath = "./build/files/"+fileName
    try {
        if (fs.existsSync(publicPath)) {
            fs.unlinkSync(publicPath)
        } 
        
        if (fs.existsSync(buildPath)) {
            fs.unlinkSync(buildPath)
        }
    } catch (error) {
        ctx.status = 400
        ctx.body = {
            errors:  [{
                text: "Filed to remove the old file when updating.",
                error: error
            }]
        }
        return
    }
    
    for(let fileName in ctx.request.files) { // should only be one file...
        const file = ctx.request.files[fileName]
        const err = await rename(file.path, "./public/files/"+fileName)

        // const copyError = await copyFile("./build/images/"+fileName, "./public/images/"+fileName)
        if (err) {
            errors.push(err)
        }   
    }

    if (errors.length > 0) {
        ctx.staus = 400
        ctx.body = {
            error: errors
        }
    } else {
        ctx.status = 201
    }
})
*/


// ctx.query['some-key']
// 
/*

publicRouter.post('/logout', function (ctx) {
    ctx.clearCookie('Authorization').status(200).send({ message: "Successfully logged out" })
})



protectedRouter.get('/projects', async ctx => {
    let projects = await Project.find().catch(error => {
        ctx.status = 400
        ctx.body = {
            error: 'Failed to get projects from database with error: ' + error
        }
    })
    ctx.status = 200
    ctx.body = projects
})

protectedRouter.get('/projects/:id', async ctx => {
    let project = await Project.findOne({ _id: ctx.params.id }).catch(error => {
        ctx.status = 400
        ctx.body = {
            error: 'Failed to get projects from database with error: ' + error
        }
    })
    ctx.status = 200
    ctx.body = project
})


protectedRouter.post('/projects', async (ctx, next) => {
    let project = new Project({
        state: ctx.request.body.title,
        title: ctx.request.body.title,
        id: ctx.request.body.id,
        show: ctx.request.body.show,
    })
    project = await project.save().catch(error => {
        console.log(error)
        ctx.status = 400
        ctx.body = {
            error: 'Failed to create new project in database'
        }
        return
    })

    ctx.status = 200
    ctx.body = project
}) 


protectedRouter.put('/projects/:id', async (ctx, next) => {
    let project = await Project.findOne({ _id: ctx.params.id }).catch(error => {
        ctx.status = 400
        ctx.body = {
            error: 'Failed to get project from database when updating'
        }
        return
    })


    project.title = ctx.request.body.title
    project.description = ctx.request.body.description 
    project.page_state = ctx.request.body.page_state
    project.show = ctx.request.body.show

    project = await project.save().catch(error => {
        ctx.status = 400
        ctx.body = {
            error: 'Failed to save project to database when updating'
        } 
        return
    })

    ctx.status = 200
    ctx.body = project
}) 



*/