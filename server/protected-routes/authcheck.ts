const jwt = require('jsonwebtoken')


export default (protectedRouter) => {
    protectedRouter.get("/authcheck", ctx => {
        const token = jwt.sign({
            exp: Math.floor(Date.now() / 1000) + (60 * 60),
            data: ctx.auth["token"]["data"],
        }, process.env.JWT_SECRET)
    
        // console.log("New Token in authcheck: ", token)
    
        ctx.status = 200
        ctx.set('Authorization', token)
        ctx.body = {
            user: ctx.auth["token"]["data"],
            token: token, 
        }
    })
    return protectedRouter;
}