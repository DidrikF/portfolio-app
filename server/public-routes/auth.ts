import * as Router from 'koa-router';
import { Context } from "koa";
import * as validator from 'validator';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';

import { ColorPallets, IColorPallets, User, UserDocument } from '../models';


export default function (publicRouter: Router): Router {
    publicRouter.post('/register', async (ctx: Context) => {
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
    
            let user: UserDocument = new User(ctx.request.body)
            user = await user.save()
            console.log('### ' + user.email + ' registered successfully!')
    
            createDefaultUserResources(user);

            const jwtSecret: string = process.env.JWT_SECRET || "";
            const token = jwt.sign({
                exp: Math.floor(Date.now() / 1000) + (60 * 60),
                data: user,
            }, jwtSecret)
        
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
    })
    
    publicRouter.post('/login', async (ctx: Context) => {
        console.log("login context: ", ctx)
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

            const jwtSecret: string = process.env.JWT_SECRET || "";            
            const token = jwt.sign({
                exp: Math.floor(Date.now() / 1000) + (60 * 60),
                data: user,
            }, jwtSecret)
        
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
    
    publicRouter.post("/logout", async (ctx: Context) => {
        ctx.remove("Authorization");
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
        
    return publicRouter;
}


function register_validator(ctx: Context) {
    if (validator.isEmail(ctx.request.body.email) === false) return false
    return true
}

async function createDefaultUserResources(user: UserDocument) {
    try {
        let colorPallets: IColorPallets = new ColorPallets({
            owner: user.email,
            pallets: [],
        });
        colorPallets = await colorPallets.save();
    } catch(e) {
        console.log("Critical failure: The creation of a resouce the app expects to be avialable failed. Error: ", e);
    }
}
