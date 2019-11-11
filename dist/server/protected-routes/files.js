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
const fs = __importStar(require("fs"));
const util = __importStar(require("util"));
const rename = util.promisify(fs.rename);
exports.default = (protectedRouter) => {
    protectedRouter.get("/files", (ctx) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            let fileObjects = fs.readdirSync("./public/files").map(fileName => {
                const splitName = fileName.split(".");
                const type = splitName[splitName.length - 1].toLowerCase();
                return {
                    serverPath: "./public/files/" + fileName,
                    path: "/files/" + fileName,
                    name: fileName,
                    type: type,
                };
            });
            ctx.status = 200;
            ctx.body = {
                files: fileObjects,
            };
        }
        catch (error) {
            ctx.status = 404;
            ctx.body = {
                error: error
            };
        }
    }));
    protectedRouter.post("/files", (ctx) => __awaiter(void 0, void 0, void 0, function* () {
        const errors = [];
        for (let fileName in ctx.request.files) {
            const file = ctx.request.files[fileName];
            const err = yield rename(file.path, "./public/files/" + fileName);
            // const copyError = await copyFile("./build/images/"+fileName, "./public/images/"+fileName)
            if (err) {
                errors.push(err);
            }
        }
        if (errors.length === 0) {
            ctx.status = 201;
        }
        else {
            ctx.status = 400;
            ctx.body = {
                error: errors
            };
        }
    }));
    protectedRouter.delete("/files/:name", (ctx) => __awaiter(void 0, void 0, void 0, function* () {
        const fileName = ctx.params.name;
        const publicPath = "./public/files/" + fileName;
        const buildPath = "./build/files/" + fileName;
        try {
            if (fs.existsSync(publicPath)) {
                fs.unlinkSync(publicPath);
            }
            if (fs.existsSync(buildPath)) {
                fs.unlinkSync(buildPath);
            }
            ctx.status = 200;
        }
        catch (error) {
            console.log(error);
            ctx.status = 400;
        }
    }));
    return protectedRouter;
};
//# sourceMappingURL=files.js.map