import * as Router from 'koa-router';
import { Context } from "koa"

import { Template } from '../models';


export default (protectedRouter: Router): Router => {
    protectedRouter.get("/templates", async (ctx: Context) => {
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
    
    protectedRouter.get("/templates/:id", async (ctx: Context) => {
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
    
    
    protectedRouter.post("/templates", async (ctx: Context) => {
        try {
    
            const userEmail = ctx.auth.user.email;
            if (!userEmail) throw new Error("No user.email on ctx.auth")
            const template: any = {}
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
    
    
    protectedRouter.delete("/templates/:id", async (ctx: Context) => {
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
    
    return protectedRouter;
}
