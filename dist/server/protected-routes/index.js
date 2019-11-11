"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const koa_router_1 = __importDefault(require("koa-router"));
const authcheck_1 = __importDefault(require("./authcheck"));
const pages_1 = __importDefault(require("./pages"));
const cssdocuments_1 = __importDefault(require("./cssdocuments"));
const images_1 = __importDefault(require("./images"));
const files_1 = __importDefault(require("./files"));
const templates_1 = __importDefault(require("./templates"));
let protectedRouter = new koa_router_1.default();
protectedRouter = authcheck_1.default(protectedRouter);
protectedRouter = pages_1.default(protectedRouter);
protectedRouter = cssdocuments_1.default(protectedRouter);
protectedRouter = images_1.default(protectedRouter);
protectedRouter = files_1.default(protectedRouter);
protectedRouter = templates_1.default(protectedRouter);
exports.default = protectedRouter;
//# sourceMappingURL=index.js.map