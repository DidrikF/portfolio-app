import * as Router from 'koa-router';
import authCheckRoutes from './authcheck';
import pagesRoutes from './pages';
import cssDocumentsRoutes from './cssdocuments';
import imagesRoutes from './images';
import filesRoutes from './files';
import templateRoutes from './templates';

let protectedRouter = new Router();

protectedRouter = authCheckRoutes(protectedRouter);
protectedRouter = pagesRoutes(protectedRouter);
protectedRouter = cssDocumentsRoutes(protectedRouter);
protectedRouter = imagesRoutes(protectedRouter);
protectedRouter = filesRoutes(protectedRouter);
protectedRouter = templateRoutes(protectedRouter);


export default protectedRouter;