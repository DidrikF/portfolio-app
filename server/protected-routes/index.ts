var Router = require('koa-router');
const protectedRouter = new Router();

require('./authcheck')(protectedRouter);
require('./pages')(protectedRouter);
require('./colors')(protectedRouter);
require('./cssdocuments')(protectedRouter);
require('./images')(protectedRouter);
require('./files')(protectedRouter);

export default protectedRouter;