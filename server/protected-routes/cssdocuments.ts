import { CSSDocument } from '../models';
import { Context } from 'koa';
import * as Router from 'koa-router';

export default (protectedRouter: Router): Router => {

    protectedRouter.post("/cssdocuments", async (ctx: Context) => {
        try {
            const ownerEmail = ctx.auth.user.email;
            let doc = new CSSDocument({
                owner: ownerEmail,
                ...ctx.request.body,
            });
            doc = await doc.save();
            ctx.status = 200;
            ctx.body = doc;
        } catch(e) {
            console.log("post cssdocuments error: ", e);
            ctx.status = 400;
            ctx.body = {
                error: "Failed to create css document"
            }
        }
    })
    
    protectedRouter.put("/cssdocuments/:id", async (ctx: Context) => {
        try {
            const ownerEmail = ctx.auth.user.email;
            const doc = await CSSDocument.findOneAndUpdate({_id: ctx.params.id, owner: ownerEmail}, ctx.request.body);
            ctx.status = 200;
            ctx.body = doc;
        } catch(e) {
            ctx.status = 400;
            ctx.body = {
                error: "Failed to update css document with id " + ctx.params.id,
            }
        }
    })
    
    protectedRouter.delete("/cssdocuments/:id", async (ctx: Context) => {
        try {
            const ownerEmail = ctx.auth.user.email;
            const doc = await CSSDocument.findOneAndDelete({_id: ctx.params.id, owner: ownerEmail});
            ctx.status = 200;
        } catch(e) {
            ctx.status = 200;
            ctx.body = {
                error: "Failed to delete css document with id: " + ctx.params.id,
            }
        }
    })

    return protectedRouter;
}
