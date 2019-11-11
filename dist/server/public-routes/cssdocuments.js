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
exports.default = (publicRouter) => {
    publicRouter.get("/cssdocuments", (ctx) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            // No support for css documents per user site...
            // const ownerEmail = ctx.auth.user.email;
            const docs = yield models_1.CSSDocument.find().exec(); // {owner: ownerEmail}
            ctx.status = 200;
            ctx.body = docs;
        }
        catch (e) {
            console.log("/cssdocuments error: ", e);
            ctx.status = 400;
            ctx.body = {
                error: "Failed to get css documents",
            };
        }
    }));
    return publicRouter;
};
//# sourceMappingURL=cssdocuments.js.map