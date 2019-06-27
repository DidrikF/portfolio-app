//require('dotenv').config()
//let koa = require('koa')
//let mongoose = require('mongoose')

const Koa = require('koa')
const mongoose = require('mongoose')
var Router = require('koa-router');
const koaBody = require('koa-body');
require('dotenv').config()
const jwt = require('jsonwebtoken')
const validator = require('validator');
const bcrypt = require('bcrypt');

const app = new Koa();
const publicRouter = new Router();
const protectedRouter = new Router()

const User = require('./user_model')
const Project = require('./project_model')

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
app.use(koaBody());

// pages everyone can reach
/* Registration, Login, Logout */
function register_validator(ctx) {
    if (validator.isEmail(ctx.request.body.email) === false) return false
    if (ctx.request.body.password !== ctx.request.body.password_verify) return false
    return true
}

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

// ctx.query['some-key']
// 
/*

publicRouter.post('/logout', function (ctx) {
    ctx.clearCookie('Authorization').status(200).send({ message: "Successfully logged out" })
})

*/
app.use(publicRouter.routes())

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
        page_state: {},
        title: ctx.request.body.title,
        description: '',
        show: true
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



app.use(protectedRouter.routes())

app.on('error', err => {
    // log.error('server error', err)
});


app.listen(3000);



