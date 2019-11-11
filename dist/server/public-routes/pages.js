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
function default_1(publicRouter) {
    publicRouter.get("/pages", (ctx) => __awaiter(this, void 0, void 0, function* () {
        // Need to figure out this...
        // Maybe I assume that this app will only support one admin/owner/user and 
        // s that users must be manually added to get be able to modify the resources of the site
        try {
            const pages = yield models_1.Page.find().exec();
            ctx.status = 200;
            ctx.body = pages;
        }
        catch (error) {
            ctx.status = 400;
            ctx.body = {
                error: "Failed to get pages from the database",
            };
        }
    }));
    publicRouter.get("/pages/:pathTitle", (ctx) => __awaiter(this, void 0, void 0, function* () {
        try {
            const pages = yield models_1.Page.findOne({ pathTitle: ctx.params.pathTitle }).exec();
            ctx.status = 200;
            ctx.body = pages;
        }
        catch (error) {
            ctx.status = 400;
            ctx.body = {
                error: "Failed to get page from the database",
            };
        }
    }));
    return publicRouter;
}
exports.default = default_1;
//# sourceMappingURL=pages.js.map