const fs = require("fs")
const util = require("util")

const rename = util.promisify(fs.rename)

export default (protectedRouter) => {

    protectedRouter.get('/images', async (ctx) => {
        try {
            let imagePaths = fs.readdirSync("./public/images").map(imageFile => {
                return {
                    serverPath: "./public/images/" + imageFile,
                    path: "/images/" + imageFile,
                }
            })
            const imageObjects = await Promise.all(imagePaths.map(async imagePaths => {
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
    
    protectedRouter.post("/images", async(ctx) => {
        const errors = []
    
        for(let fileName in ctx.request.files) {
            const file = ctx.request.files[fileName]
            const err = await rename(file.path, "./public/images/"+fileName)
    
            // const copyError = await copyFile("./build/images/"+fileName, "./public/images/"+fileName)
            if (err) {
                errors.push(err)
            }   
        }
    
        if (errors.length > 0) {
            ctx.staus = 400
            ctx.body = {
                error: errors
            }
        } else {
            ctx.status = 201
        }
    
    
    })
    
    protectedRouter.post("/images/:name", async ctx => {
    // if exists then delete and replace
        // if not exists, just create
        const errors = []
        
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
            const file = ctx.request.files[fileName]
            const err = await rename(file.path, "./public/images/"+fileName)
    
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
    
    protectedRouter.delete("/images/:name", async (ctx) => {
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
    
            ctx.status = 200
        } catch (error) {
            console.log(error)
            ctx.status = 400
        }
    })

    return protectedRouter;
}