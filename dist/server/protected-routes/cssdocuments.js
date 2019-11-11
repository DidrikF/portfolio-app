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
    protectedRouter.post("/cssdocuments", (ctx) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const ownerEmail = ctx.auth.user.email;
            let doc = new models_1.CSSDocument(Object.assign({ owner: ownerEmail }, ctx.request.body));
            doc = yield doc.save();
            ctx.status = 200;
            ctx.body = doc;
        }
        catch (e) {
            console.log("post cssdocuments error: ", e);
            ctx.status = 400;
            ctx.body = {
                error: "Failed to create css document"
            };
        }
    }));
    protectedRouter.put("/cssdocuments/:id", (ctx) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const ownerEmail = ctx.auth.user.email;
            const doc = yield models_1.CSSDocument.findOneAndUpdate({ _id: ctx.params.id, owner: ownerEmail }, ctx.request.body);
            ctx.status = 200;
            ctx.body = doc;
        }
        catch (e) {
            ctx.status = 400;
            ctx.body = {
                error: "Failed to update css document with id " + ctx.params.id,
            };
        }
    }));
    protectedRouter.delete("/cssdocuments/:id", (ctx) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const ownerEmail = ctx.auth.user.email;
            const doc = yield models_1.CSSDocument.findOneAndDelete({ _id: ctx.params.id, owner: ownerEmail });
            ctx.status = 200;
        }
        catch (e) {
            ctx.status = 200;
            ctx.body = {
                error: "Failed to delete css document with id: " + ctx.params.id,
            };
        }
    }));
    return protectedRouter;
};
//# sourceMappingURL=cssdocuments.js.map