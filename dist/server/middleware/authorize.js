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
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const jwt = __importStar(require("jsonwebtoken"));
function authorize(ctx, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const token = ctx.request.header['authorization'] || "";
            console.log("Token: ", token);
            const jwtSecret = process.env.JWT_SECRET || "";
            var decoded = jwt.verify(token, jwtSecret);
            ctx.auth = {};
            ctx.auth['token'] = decoded;
            ctx.auth['user'] = decoded.data;
            console.log("Decoded token: ", decoded);
        }
        catch (err) {
            console.log("Not authorized! Error: ", err);
            ctx.status = 401;
            ctx.body = {
                error: "Not Authorized!"
            };
            return;
        }
        yield next();
    });
}
exports.authorize = authorize;
//# sourceMappingURL=authorize.js.map