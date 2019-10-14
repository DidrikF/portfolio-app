import * as Router from 'koa-router';
import * as jwt from 'jsonwebtoken';
import { Context } from 'koa';

export default (protectedRouter: Router): Router => {
    protectedRouter.get("/authcheck", (ctx: Context) => {
        const secret: string = process.env.JWT_SECRET || "";
        const token = jwt.sign({
            exp: Math.floor(Date.now() / 1000) + (60 * 60),
            data: ctx.auth["token"]["data"],
        }, secret);

        ctx.status = 200
        ctx.set('Authorization', token)
        ctx.body = {
            user: ctx.auth["token"]["data"],
            token: token, 
        }
    })
    return protectedRouter;
}

