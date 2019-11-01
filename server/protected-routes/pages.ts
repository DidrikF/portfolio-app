import { Context } from "koa";

import { Page } from '../models';

export default (protectedRouter: any): any => {
    protectedRouter.post("/pages", async (ctx: Context) => {
        try {
            console.log(ctx.request.body)
            const ownerEmail = ctx.auth.user.email;
            const page = ctx.request.body;
            page["owner"] = ownerEmail;
            let newPage = new Page(page)
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
    
    protectedRouter.put("/pages/:pathTitle", async (ctx: Context) => {
        console.log("/pages", ctx.request.body)
        try {
            const updatedPage = await Page.findOneAndUpdate({ 
                pathTitle: ctx.params.pathTitle, 
                owner: ctx.auth.user.email
            }, ctx.request.body)
    
            console.log("updated page: ", updatedPage)
    
            ctx.status = 200
            ctx.body = updatedPage
    
        } catch(error) {
            ctx.status = 400
            ctx.body = {
                error: `Failed to update page: "${ctx.params.pathTitle}"`,
            }
        }
    })
    
    protectedRouter.delete("/pages/:pathTitle", async (ctx: Context) => {
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

    return protectedRouter;
}