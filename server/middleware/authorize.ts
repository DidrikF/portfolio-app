import { Context } from "koa";

import * as jwt from 'jsonwebtoken';

export async function authorize(ctx: Context, next: Function): Promise<void> {
    try {
        const token = ctx.request.header['authorization']
        Object.keys(token).forEach(key => {
            console.log(`Token key: ${key}: ${token[key]}`)
        })

        const jwtSecret: string = process.env.JWT_SECRET || "";
        var decoded: any = jwt.verify(token, jwtSecret);
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