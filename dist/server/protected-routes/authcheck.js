"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const jwt = __importStar(require("jsonwebtoken"));
exports.default = (protectedRouter) => {
    protectedRouter.get("/authcheck", (ctx) => {
        const secret = process.env.JWT_SECRET || "";
        const token = jwt.sign({
            exp: Math.floor(Date.now() / 1000) + (60 * 60),
            data: ctx.auth["token"]["data"],
        }, secret);
        ctx.status = 200;
        ctx.set('Authorization', token);
        ctx.body = {
            user: ctx.auth["token"]["data"],
            token: token,
        };
    });
    return protectedRouter;
};
//# sourceMappingURL=authcheck.js.map