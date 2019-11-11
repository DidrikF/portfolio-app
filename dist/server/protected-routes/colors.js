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
    protectedRouter.get("/colors", (ctx) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const colors = yield models_1.ColorPallets.findOne().exec(); // dont know if findOne needs parameters
            ctx.status = 200;
            ctx.body = colors;
        }
        catch (error) {
            console.log(error);
            ctx.status = 400;
            ctx.body = {
                error: "Failed to get colors",
            };
        }
    }));
    protectedRouter.post("/colors", (ctx) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const ownerEmail = ctx.auth.user.email;
            if (!ownerEmail)
                throw new Error("No user.email on ctx.auth!");
            let colorPallets = new models_1.ColorPallets({
                owner: ownerEmail,
                pallets: [],
            });
            colorPallets = yield colorPallets.save();
            ctx.status = 200;
            ctx.body = colorPallets;
        }
        catch (error) {
            console.log(error);
            ctx.status = 400;
            ctx.body = {
                error: "Failed to create color pallets",
            };
        }
    }));
    protectedRouter.put("/colors", (ctx) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const ownerEmail = ctx.auth.user.email;
            const updatedPallets = yield models_1.ColorPallets.findOneAndUpdate({ owner: ownerEmail }, {
                pallets: ctx.request.body,
            });
            ctx.status = 200;
            ctx.body = updatedPallets;
        }
        catch (e) {
            console.log(e);
            ctx.status = 400;
            ctx.body = {
                error: "Failed to update color pallets",
            };
        }
    }));
    protectedRouter.delete("/colors", (ctx) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const ownerEmail = ctx.auth.user.email;
            yield models_1.ColorPallets.findByIdAndRemove({ owner: ownerEmail });
            ctx.status = 200;
        }
        catch (e) {
            console.log(e);
            ctx.status = 400;
            ctx.body = {
                error: "Failed to delete color pallets"
            };
        }
    }));
    return protectedRouter;
};
//# sourceMappingURL=colors.js.map