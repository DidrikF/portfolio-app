import Koa from 'koa';
import koaStatic from 'koa-static';
import koaBody from 'koa-body';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

import { authorize } from './middleware';
import publicRouter from './public-routes';
import protectedRouter from './protected-routes';

dotenv.config();

// let db_uri = 'mongodb://' + process.env.DB_USERNAME + ':' + process.env.DB_PASSWORD + '/localhost:27017/' + process.env.DB_NAME
let db_uri = 'mongodb://localhost:27017/' + process.env.DB_NAME

mongoose.set('useFindAndModify', false);
mongoose.connect(db_uri, { useNewUrlParser: true, useUnifiedTopology: true  })
const db = mongoose.connection

db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function () {
    console.log('connected to database')
});

const app = new Koa();
app.use(koaStatic('./build'));
app.use(koaStatic('./public'));
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

app.on("connection", (...args) => {
    console.log("Connection on port 4000");
})
