import Router from 'koa-router';

let publicRouter = new Router();

import authRoutes from './auth';
import cssDocumentRoutes from './cssdocuments';
import pagesRoutes from './pages'

publicRouter = authRoutes(publicRouter);
publicRouter = cssDocumentRoutes(publicRouter);
publicRouter = pagesRoutes(publicRouter);

export default publicRouter;