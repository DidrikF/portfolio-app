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
const sizeOf = util.promisify(require('image-size'));
exports.default = (protectedRouter) => {
    protectedRouter.get('/images', (ctx) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            let imagePaths = fs.readdirSync("./public/images").map((imageFile) => {
                return {
                    serverPath: "./public/images/" + imageFile,
                    path: "/images/" + imageFile,
                };
            });
            const imageObjects = yield Promise.all(imagePaths.map((imagePaths) => __awaiter(void 0, void 0, void 0, function* () {
                const dimensions = yield sizeOf(imagePaths.serverPath);
                return {
                    path: imagePaths.path,
                    width: dimensions.width,
                    height: dimensions.height,
                    name: imagePaths.path.split("/")[2],
                };
            })));
            ctx.status = 200;
            ctx.body = {
                images: imageObjects,
            };
        }
        catch (error) {
            ctx.status = 404;
            ctx.body = {
                error: error
            };
        }
    }));
    protectedRouter.post("/images", (ctx) => __awaiter(void 0, void 0, void 0, function* () {
        const errors = [];
        for (let fileName in ctx.request.files) {
            const file = ctx.request.files[fileName];
            const err = yield rename(file.path, "./public/images/" + fileName);
            // const copyError = await copyFile("./build/images/"+fileName, "./public/images/"+fileName)
            if (err) {
                errors.push(err);
            }
        }
        if (errors.length > 0) {
            ctx.status = 400;
            ctx.body = {
                error: errors
            };
        }
        else {
            ctx.status = 201;
        }
    }));
    protectedRouter.post("/images/:name", (ctx) => __awaiter(void 0, void 0, void 0, function* () {
        const errors = [];
        const fileName = ctx.params.name;
        const publicPath = "./public/images/" + fileName;
        const buildPath = "./build/images/" + fileName;
        try {
            if (fs.existsSync(publicPath)) {
                fs.unlinkSync(publicPath);
            }
            if (fs.existsSync(buildPath)) {
                fs.unlinkSync(buildPath);
            }
        }
        catch (error) {
            ctx.status = 400;
            ctx.body = {
                errors: [{
                        text: "Filed to remove the old image when updating.",
                        error: error
                    }]
            };
            return;
        }
        for (let fileName in ctx.request.files) { // should only be one file...
            const file = ctx.request.files[fileName];
            const err = yield rename(file.path, "./public/images/" + fileName);
            if (err) {
                errors.push(err);
            }
        }
        if (errors.length > 0) {
            ctx.status = 400;
            ctx.body = {
                error: errors
            };
        }
        else {
            ctx.status = 201;
        }
    }));
    protectedRouter.delete("/images/:name", (ctx) => __awaiter(void 0, void 0, void 0, function* () {
        const fileName = ctx.params.name;
        const publicPath = "./public/images/" + fileName;
        const buildPath = "./build/images/" + fileName;
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
//# sourceMappingURL=images.js.map