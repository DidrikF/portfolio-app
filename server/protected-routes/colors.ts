const ColorPallets = require("../models/color_pallets_model") 

export default (protectedRouter) => {
    protectedRouter.get("/colors", async ctx => {
        try {
            const colors = await ColorPallets.findOne().exec() // dont know if findOne needs parameters
            ctx.status = 200
            ctx.body = colors
        } catch(error) {
            console.log(error)
            ctx.status = 400
            ctx.body = {
                error: "Failed to get colors",
            }
        }
    })
    
    
    protectedRouter.post("/colors", async ctx => {
        
        try {
            const ownerEmail = ctx.auth.user.email;
            if (!ownerEmail) throw new Error("No user.email on ctx.auth!")
    
            let colorPallets = new ColorPallets({
                owner: ownerEmail, // is unique
                pallets: [],
            })
    
            colorPallets = await colorPallets.save()
    
            ctx.status = 200
            ctx.body = colorPallets
        } catch(error) {
            console.log(error)
            ctx.status = 400
            ctx.body = {
                error: "Failed to create color pallets",
            }
        }
    })
    
    protectedRouter.put("/colors", async ctx => {
        try {
            const ownerEmail = ctx.auth.user.email;
            const updatedPallets = await ColorPallets.findOneAndUpdate({ owner: ownerEmail}, {
                pallets: ctx.request.body
            });
            ctx.status = 200;
            ctx.body = updatedPallets;
        } catch (e) {
            console.log(e)
            ctx.status = 400
            ctx.body = {
                error: "Failed to update color pallets",
            }
        }
    })
    
    protectedRouter.delete("/colors", async ctx => {
        try {
            const ownerEmail = ctx.auth.user.email;
            await ColorPallets.findByIdAndRemove({owner: ownerEmail});
            ctx.status = 200;
        } catch (e) {
            console.log(e)
            ctx.status = 400;
            ctx.body = {
                error: "Failed to delete color pallets"
            };
        }
    })

    return protectedRouter;

} 