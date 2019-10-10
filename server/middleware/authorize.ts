const jwt = require('jsonwebtoken')

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

export default authorize; 