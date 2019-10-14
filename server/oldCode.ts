/*
publicRouter.put("/files/:name", async ctx => {
    // if exists then delete and replace
    // if not exists, just create
    const errors = []
    
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
    } catch (error) {
        ctx.status = 400
        ctx.body = {
            errors:  [{
                text: "Filed to remove the old file when updating.",
                error: error
            }]
        }
        return
    }
    
    for(let fileName in ctx.request.files) { // should only be one file...
        const file = ctx.request.files[fileName]
        const err = await rename(file.path, "./public/files/"+fileName)

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
*/


// ctx.query['some-key']
// 
/*

publicRouter.post('/logout', function (ctx) {
    ctx.clearCookie('Authorization').status(200).send({ message: "Successfully logged out" })
})



protectedRouter.get('/projects', async ctx => {
    let projects = await Project.find().catch(error => {
        ctx.status = 400
        ctx.body = {
            error: 'Failed to get projects from database with error: ' + error
        }
    })
    ctx.status = 200
    ctx.body = projects
})

protectedRouter.get('/projects/:id', async ctx => {
    let project = await Project.findOne({ _id: ctx.params.id }).catch(error => {
        ctx.status = 400
        ctx.body = {
            error: 'Failed to get projects from database with error: ' + error
        }
    })
    ctx.status = 200
    ctx.body = project
})


protectedRouter.post('/projects', async (ctx, next) => {
    let project = new Project({
        state: ctx.request.body.title,
        title: ctx.request.body.title,
        id: ctx.request.body.id,
        show: ctx.request.body.show,
    })
    project = await project.save().catch(error => {
        console.log(error)
        ctx.status = 400
        ctx.body = {
            error: 'Failed to create new project in database'
        }
        return
    })

    ctx.status = 200
    ctx.body = project
}) 


protectedRouter.put('/projects/:id', async (ctx, next) => {
    let project = await Project.findOne({ _id: ctx.params.id }).catch(error => {
        ctx.status = 400
        ctx.body = {
            error: 'Failed to get project from database when updating'
        }
        return
    })


    project.title = ctx.request.body.title
    project.description = ctx.request.body.description 
    project.page_state = ctx.request.body.page_state
    project.show = ctx.request.body.show

    project = await project.save().catch(error => {
        ctx.status = 400
        ctx.body = {
            error: 'Failed to save project to database when updating'
        } 
        return
    })

    ctx.status = 200
    ctx.body = project
}) 

*/