"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const koa_router_1 = __importDefault(require("koa-router"));
let publicRouter = new koa_router_1.default();
const auth_1 = __importDefault(require("./auth"));
const cssdocuments_1 = __importDefault(require("./cssdocuments"));
const pages_1 = __importDefault(require("./pages"));
publicRouter = auth_1.default(publicRouter);
publicRouter = cssdocuments_1.default(publicRouter);
publicRouter = pages_1.default(publicRouter);
exports.default = publicRouter;
//# sourceMappingURL=index.js.map