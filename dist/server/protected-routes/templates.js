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
    protectedRouter.get("/templates", (ctx) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const templates = yield models_1.Template.find({ owner: ctx.auth.user.email }).exec(); // templates are shared???
            ctx.status = 200;
            ctx.body = templates;
        }
        catch (error) {
            console.log("Get templates error: ", error);
            ctx.status = 400;
            ctx.body = {
                error: `Failed to get templates`,
            };
        }
    }));
    protectedRouter.get("/templates/:id", (ctx) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const template = yield models_1.Template.findOne({ _id: ctx.params.id, owner: ctx.auth.user.email }).exec();
            ctx.status = 200;
            ctx.body = template;
        }
        catch (error) {
            ctx.status = 400;
            ctx.body = {
                error: `Failed to get templates`,
            };
        }
    }));
    protectedRouter.post("/templates", (ctx) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const userEmail = ctx.auth.user.email;
            if (!userEmail)
                throw new Error("No user.email on ctx.auth");
            const template = {};
            Object.assign(template, ctx.request.body);
            template["owner"] = userEmail;
            let newTemplate = new models_1.Template(template);
            newTemplate = yield newTemplate.save();
            ctx.status = 200;
            ctx.body = newTemplate;
        }
        catch (error) {
            console.log("Failed to create new template: ", error);
            ctx.status = 400;
            ctx.body = {
                error: `Failed to create new template`,
            };
        }
    }));
    protectedRouter.delete("/templates/:id", (ctx) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            yield models_1.Template.findOneAndDelete({ _id: ctx.params.id, owner: ctx.auth.user.email }); // Is this a decent way to do authorization, probably not?
            ctx.status = 200;
        }
        catch (error) {
            ctx.status = 400;
            ctx.body = {
                error: `Failed to delete template`,
            };
        }
    }));
    return protectedRouter;
};
//# sourceMappingURL=templates.js.map