import * as fs from 'fs';
import * as util from 'util';

import * as Router from 'koa-router';
import { Context } from 'koa';

const rename = util.promisify(fs.rename);
const sizeOf = util.promisify(require('image-size'));

interface ImagePaths {
    serverPath: string,
    path: string
}

export default (protectedRouter: Router): Router => {

    protectedRouter.get('/images', async (ctx: Context) => {
        try {
            let imagePaths = fs.readdirSync("./public/images").map((imageFile: string): ImagePaths => {
                return {
                    serverPath: "./public/images/" + imageFile,
                    path: "/images/" + imageFile,
                }
            })
            const imageObjects = await Promise.all(imagePaths.map(async (imagePaths: ImagePaths) => {
                const dimensions = await sizeOf(imagePaths.serverPath)
    
                return {
                    path: imagePaths.path,
                    width: dimensions.width,
                    height: dimensions.height,
                    name: imagePaths.path.split("/")[2],
                }
            }))
    
            ctx.status = 200
            ctx.body = {
                images: imageObjects,
            }
        } catch (error) {
            ctx.status = 404
            ctx.body = {
                error: error
            }
        }
    
    })
    
    protectedRouter.post("/images", async (ctx: Context) => {
        const errors: Error[] = []
    
        for(let fileName in ctx.request.files) {
            const file = ctx.request.files[fileName]
            const err: any = await rename(file.path, "./public/images/"+fileName)
    
            // const copyError = await copyFile("./build/images/"+fileName, "./public/images/"+fileName)
            if (err) {
                errors.push(err)
            }   
        }

        if (errors.length > 0) {
            ctx.status = 400
            ctx.body = {
                error: errors
            }
        } else {
            ctx.status = 201
        }
    
    
    })
    
    protectedRouter.post("/images/:name", async (ctx: Context) => {
        const errors: Error[] = []
        
        const fileName = ctx.params.name
        const publicPath = "./public/images/"+fileName
        const buildPath = "./build/images/"+fileName
        try {
            if (fs.existsSync(publicPath)) {
                fs.unlinkSync(publicPath)
            } 
            
            if (fs.existsSync(buildPath)) {
                fs.unlinkSync(buildPath)
            }
        } catch (error) {
            ctx.status = 400
            ctx.body = {
                errors:  [{
                    text: "Filed to remove the old image when updating.",
                    error: error
                }]
            }    
            return
        }
        
        for(let fileName in ctx.request.files) { // should only be one file...
            const file: any = ctx.request.files[fileName]
            const err: any = await rename(file.path, "./public/images/"+fileName)
    
            if (err) {
                errors.push(err)
            }   
        }
    
        if (errors.length > 0) {
            ctx.status = 400
            ctx.body = {
                error: errors
            }
        } else {
            ctx.status = 201
        }
    })
    
    protectedRouter.delete("/images/:name", async (ctx: Context) => {
        const fileName: string = ctx.params.name
        const publicPath: string = "./public/images/"+fileName
        const buildPath: string = "./build/images/"+fileName
        try {
            if (fs.existsSync(publicPath)) {
                fs.unlinkSync(publicPath)
            } 
            
            if (fs.existsSync(buildPath)) {
                fs.unlinkSync(buildPath)
            }
    
            ctx.status = 200
        } catch (error) {
            console.log(error)
            ctx.status = 400
        }
    })

    return protectedRouter;
}