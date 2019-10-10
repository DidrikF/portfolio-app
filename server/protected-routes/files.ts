import protectedRouter from "."

const fs = require('fs')
const util = require('util')

const rename = util.promisify(fs.rename)

const writeFile = util.promisify(fs.writeFile)
const copyFile = util.promisify(fs.copyFile)


export default (protectedRouter) => {
    protectedRouter.get("/files", async ctx => {
        try {
            let fileObjects = fs.readdirSync("./public/files").map(fileName => {
                const splitName = fileName.split(".")
                const type = splitName[splitName.length - 1].toLowerCase()
                return {
                    serverPath: "./public/files/" + fileName,
                    path: "/files/" + fileName,
                    name: fileName,
                    type: type,
                }
            })
    
            ctx.status = 200
            ctx.body = {
                files: fileObjects,
            }
        } catch (error) {
            ctx.status = 404
            ctx.body = {
                error: error
            }
        }
    })
    
    protectedRouter.post("/files", async ctx => {
        const errors = []
    
        for(let fileName in ctx.request.files) {
            const file = ctx.request.files[fileName]
            const err = await rename(file.path, "./public/files/"+fileName)
    
            // const copyError = await copyFile("./build/images/"+fileName, "./public/images/"+fileName)
            if (err) {
                errors.push(err)
            }   
        }
    
        if (errors.length === 0) {
            ctx.status = 201
        } else {
            ctx.status = 400
            ctx.body = {
                error: errors
            }
        }
    })
    
    protectedRouter.delete("/files/:name", async ctx => {
        const fileName = ctx.params.name
        const publicPath = "./public/files/"+fileName
        const buildPath = "./build/files/"+fileName
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