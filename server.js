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
    if (ctx.request.body.password !== ctx.request.body.password_verify) return false
    return true
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
    let password = await bcrypt.hash(ctx.request.body.password, 10)

    let user = new User({
        email: ctx.request.body.email,
        password: password,
    })
    try {
        user = await user.save()
        console.log('### ' + user.username + ' registered successfully!')

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
    let user = await User.findOne({ email: ctx.body.email }).select('+password').exec().catch(error => {
        console.log(error)
        ctx.status = 200
        ctx.body = { error: 'An error ocurred, please try again.'}
    })
    let pass_compare_result = await bcrypt.compare(ctx.body.password, user.password)

    if (!pass_compare_result) {
        ctx.status = 400
        ctx.body = {
            error: 'Wrong password'
        }
        return 
    }

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
})

publicRouter.post("/logout", async ctx => {
    ctx.set("Authorization", null)
    ctx.status = 200
})


publicRouter.get("/colors", async ctx => {
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

/* Quick and dirty route to both create new and update a users color pallets */ 
publicRouter.post("/colors", async ctx => {

    const unknownResponse = await ColorPallets.remove().exec().catch(error => { // PARAMS? 
        console.log("Failed to delete color pallet, probably because it does not exists. In this case, just carry on.")
    })

    try {
        let colorPallets = new ColorPallets({
            owner: ctx.auth.user,
            colorPallets: ctx.body.colorPallets
        })

        colorPallets = await colorPallets.save()

        ctx.status = 200
        ctx.body = colorPallets
    } catch(error) {
        console.log(error)
        ctx.status = 400
        ctx.body = {
            error: "Failed to set colors",
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

publicRouter.get("/pages/:name", async ctx => {
    try {
        const pages = await Page.findOne({ name: ctx.params.name }).exec()

        ctx.status = 200
        ctx.body = pages
    } catch(error) {
        ctx.status = 400
        ctx.body = {
            error: "Failed to get page from the database",
        }
    }
})

/* Protected Router */
publicRouter.post("/pages", async ctx => {
    try {
        let newPage = Page(ctx.body)
        newPage = await newPage.save()
        ctx.status = 201
        ctx.body = newPage

    } catch(error) {
        ctx.status = 400
        ctx.body = {
            error: "Failed to create new page",
        }
    }
})

publicRouter.put("/pages/:name", async ctx => {
    try {
        const updatedPage = await Page.findOneAndUpdate({ name: ctx.params.name}, ctx.body)

        ctx.status = 200
        ctx.body = updatedPage

    } catch(error) {
        ctx.status = 400
        ctx.body = {
            error: `Failed to update page: "${ctx.params.name}"`,
        }
    }
})

publicRouter.delete("/pages/:name", async ctx => {
    try {
        await Page.findOneAndRemove({ name: ctx.params.name})

        ctx.status = 200
    } catch(error) {
        ctx.status = 400
        ctx.body = {
            error: `Failed to delete page: "${ctx.params.name}"`,
        }
    }
})


publicRouter.get("/templates", async ctx => {
    try {
        const templates = await Template.find().exec()

        ctx.status = 200
        ctx.body = templates
    } catch(error) {
        ctx.status = 400
        ctx.body = {
            error: `Failed to get templates`,
        }
    }
})

publicRouter.get("/templates/:id", async ctx => {
    try {
        const template = await Template.findOne({ _id: ctx.params.id}).exec()

        ctx.status = 200
        ctx.body = template
    } catch(error) {
        ctx.status = 400
        ctx.body = {
            error: `Failed to get templates`,
        }
    }
})


publicRouter.post("/templates", async ctx => {
    try {
        let newTemplate = new Template(ctx.body)
        newTemplate = await newTemplate.save()

        ctx.status = 200
        ctx.body = newTemplate
    } catch(error) {
        ctx.status = 400
        ctx.body = {
            error: `Failed to create new template`,
        }
    }
})

publicRouter.put("/templates/:id", async ctx => {
    try {
        const updatedTemplate = await Template.findOneAndUpdate({ _id: ctx.props.id }, ctx.body)

        ctx.status = 200
        ctx.body = updatedTemplate
    } catch(error) {
        ctx.status = 400
        ctx.body = {
            error: `Failed to update template`,
        }
    }
})

publicRouter.delete("/templates/:id", async ctx => {
    try {
        await Template.findOneAndDelete({ _id: ctx.params.id })

        ctx.status = 200
    } catch(error) {
        ctx.status = 400
        ctx.body = {
            error: `Failed to delete template`,
        }
    }
})


publicRouter.get('/images', async (ctx) => {
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

publicRouter.post("/images", async(ctx) => {
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

publicRouter.post("/images/:name", async ctx => {
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

publicRouter.delete("/images/:name", async (ctx) => {
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


publicRouter.get("/files", async ctx => {
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

publicRouter.post("/files", async ctx => {
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

publicRouter.delete("/files/:name", async ctx => {
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

// auth middleware
/*
function authorize(ctx, next) {
    try {
        const token = ctx.cookies['Authorization']
        var decoded = jwt.verify(token, process.env.JWT_SECRET);
        ctx['decodedJWT'] = decoded
        next()
    } catch (err) {
        next(new Error('Missing or invalid Authorization token'))
    }
}

app.use(authorize); 
*/
// protected pages 
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

protectedRouter.get('/cards', async (ctx, next) => {
    let cards = await Cards.find().catch(error => {
        ctx.status = 400
        ctx.body = {
            error: 'Failed to load cards from database'
        }
        return 
    })
    ctx.status = 200
    ctx.body = cards
})

app.use(protectedRouter.routes())

app.on('error', err => {
    // log.error('server error', err)
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

*/