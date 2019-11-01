import { Context } from "koa";
import * as Router from "koa-router";

import { CSSDocument } from '../models';

export default (publicRouter: Router): Router => {
    publicRouter.get("/cssdocuments", async (ctx: Context) => {
        try {
            // No support for css documents per user site...
            // const ownerEmail = ctx.auth.user.email;
            const docs = await CSSDocument.find().exec(); // {owner: ownerEmail}
            ctx.status = 200;
            ctx.body = docs;
        } catch(e) {
            console.log("/cssdocuments error: ", e);
            ctx.status = 400;
            ctx.body = {
                error: "Failed to get css documents",
            }
        }
    });

    return publicRouter;
}
