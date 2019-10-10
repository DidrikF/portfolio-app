const CSSDocument = require("../models/css_document_model")


publicRouter.get("/cssdocuments", async ctx => {
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
})