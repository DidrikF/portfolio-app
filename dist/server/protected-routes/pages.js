"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const models_1 = require("../models");
exports.default = (protectedRouter) => {
    protectedRouter.post("/pages", (ctx) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            console.log(ctx.request.body);
            const ownerEmail = ctx.auth.user.email;
            const page = ctx.request.body;
            page["owner"] = ownerEmail;
            let newPage = new models_1.Page(page);
            newPage = yield newPage.save();
            ctx.status = 201;
            ctx.body = newPage;
        }
        catch (error) {
            console.log(error);
            ctx.status = 400;
            ctx.body = {
                error: "Failed to create new page",
            };
        }
    }));
    protectedRouter.put("/pages/:pathTitle", (ctx) => __awaiter(void 0, void 0, void 0, function* () {
        console.log("/pages", ctx.request.body);
        try {
            const updatedPage = yield models_1.Page.findOneAndUpdate({
                pathTitle: ctx.params.pathTitle,
                owner: ctx.auth.user.email
            }, ctx.request.body);
            console.log("updated page: ", updatedPage);
            ctx.status = 200;
            ctx.body = updatedPage;
        }
        catch (error) {
            ctx.status = 400;
            ctx.body = {
                error: `Failed to update page: "${ctx.params.pathTitle}"`,
            };
        }
    }));
    protectedRouter.delete("/pages/:pathTitle", (ctx) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            yield models_1.Page.findOneAndRemove({ pathTitle: ctx.params.pathTitle });
            ctx.status = 200;
        }
        catch (error) {
            ctx.status = 400;
            ctx.body = {
                error: `Failed to delete page: "${ctx.params.pathTitle}"`,
            };
        }
    }));
    return protectedRouter;
};
//# sourceMappingURL=pages.js.map