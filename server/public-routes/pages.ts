import * as Router from "koa-router";
import { Context } from "koa";

import { Page } from '../models'; 


export default function (publicRouter: Router): Router {

    publicRouter.get("/pages", async (ctx: Context) => {
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
    
    publicRouter.get("/pages/:pathTitle", async (ctx: Context) => {
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