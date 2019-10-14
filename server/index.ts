require('dotenv').config();
import * as Koa from 'koa';
import * as koaBody from 'koa-body';

import { authorize } from './middleware';
import publicRouter from './public-routes';
import protectedRouter from './protected-routes';

require('./server/db');

const app = new Koa();
app.use(require('koa-static')('./build'));
app.use(require('koa-static')('./public'));
app.use(koaBody({ 
    // formidable:{uploadDir: './uploads'},
    multipart: true 
}));


app.use(publicRouter.routes());
app.use(publicRouter.allowedMethods());

app.use(authorize); 

app.use(protectedRouter.routes());
app.use(protectedRouter.allowedMethods());


app.on('error', (err: Error) => {
    console.error('server error', err);
    // Serve 404 or 500?
});


app.listen(4000);

