var Router = require('koa-router');


const publicRouter = new Router();


require('./auth')(publicRouter)
require('./cssdocuments')(publicRouter)

export default publicRouter;