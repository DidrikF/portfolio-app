const validator = require('validator');
const bcrypt = require('bcrypt');

const User = require('../models/user_model')



module.exports = function (publicRouter: Router) {
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
    
            createDefaultUserResources(user);
    
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
    
    return publicRouter;
}





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
