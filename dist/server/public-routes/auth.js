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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const validator = __importStar(require("validator"));
const bcrypt = require('bcrypt');
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const models_1 = require("../models");
function default_1(publicRouter) {
    publicRouter.post('/register', (ctx) => __awaiter(this, void 0, void 0, function* () {
        if (!register_validator(ctx)) {
            ctx.status = 400;
            ctx.body = {
                error: 'Validation Failed'
            };
            return;
        }
        try {
            let password = yield bcrypt.hash(ctx.request.body.password, 10);
            ctx.request.body.password = password;
            let user = new models_1.User(ctx.request.body);
            user = yield user.save();
            console.log('### ' + user.email + ' registered successfully!');
            createDefaultUserResources(user);
            const jwtSecret = process.env.JWT_SECRET || "";
            const token = jsonwebtoken_1.default.sign({
                exp: Math.floor(Date.now() / 1000) + (60 * 60),
                data: user,
            }, jwtSecret);
            ctx.status = 200;
            ctx.set('Authorization', token);
            ctx.body = {
                user: user,
                token: token,
            };
        }
        catch (error) {
            ctx.status = 400;
            ctx.set('Content-Type', 'application/json');
            ctx.body = { error: error };
        }
    }));
    publicRouter.post('/login', (ctx) => __awaiter(this, void 0, void 0, function* () {
        console.log("login context: ", ctx);
        try {
            let user = yield models_1.User.findOne({ email: ctx.request.body.email }).select('+password').exec();
            if (!user)
                throw Error("Failed to find user.");
            let pass_compare_result = yield bcrypt.compare(ctx.request.body.password, user.password);
            if (!pass_compare_result) {
                ctx.status = 400;
                ctx.body = {
                    error: 'Wrong password'
                };
                return;
            }
            delete user.password;
            const jwtSecret = process.env.JWT_SECRET || "";
            const token = jsonwebtoken_1.default.sign({
                exp: Math.floor(Date.now() / 1000) + (60 * 60),
                data: user,
            }, jwtSecret);
            ctx.status = 200;
            ctx.set('Authorization', token);
            ctx.body = {
                user: user,
                token: token,
            };
        }
        catch (error) {
            console.log("Login exception caught: ", error);
            ctx.status = 400;
            ctx.body = {
                error: "Login Failed"
            };
        }
    }));
    publicRouter.post("/logout", (ctx) => __awaiter(this, void 0, void 0, function* () {
        ctx.remove("Authorization");
        ctx.status = 200;
    }));
    publicRouter.get("/user", (ctx) => __awaiter(this, void 0, void 0, function* () {
        try {
            const user = yield models_1.User.findOne({ email: "didrik.fleischer@gmail.com" }).exec();
            ctx.status = 200;
            ctx.body = user;
        }
        catch (error) {
            ctx.status = 400;
            ctx.body = {
                error: "Failed to get user"
            };
        }
    }));
    return publicRouter;
}
exports.default = default_1;
function register_validator(ctx) {
    if (validator.isEmail(ctx.request.body.email) === false)
        return false;
    return true;
}
function createDefaultUserResources(user) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            let colorPallets = new models_1.ColorPallets({
                owner: user.email,
                pallets: [],
            });
            colorPallets = yield colorPallets.save();
        }
        catch (e) {
            console.log("Critical failure: The creation of a resouce the app expects to be avialable failed. Error: ", e);
        }
    });
}
//# sourceMappingURL=auth.js.map