"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const koa_1 = __importDefault(require("koa"));
const koa_static_1 = __importDefault(require("koa-static"));
const koa_body_1 = __importDefault(require("koa-body"));
const mongoose = __importStar(require("mongoose"));
const dotenv = __importStar(require("dotenv"));
const middleware_1 = require("./middleware");
const public_routes_1 = __importDefault(require("./public-routes"));
const protected_routes_1 = __importDefault(require("./protected-routes"));
dotenv.config();
// let db_uri = 'mongodb://' + process.env.DB_USERNAME + ':' + process.env.DB_PASSWORD + '/localhost:27017/' + process.env.DB_NAME
let db_uri = 'mongodb://localhost:27017/' + process.env.DB_NAME;
mongoose.set('useFindAndModify', false);
mongoose.connect(db_uri, { useNewUrlParser: true, useUnifiedTopology: true });
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function () {
    console.log('connected to database');
});
const app = new koa_1.default();
app.use(koa_static_1.default('./build'));
app.use(koa_static_1.default('./public'));
app.use(koa_body_1.default({
    // formidable:{uploadDir: './uploads'},
    multipart: true
}));
app.use(public_routes_1.default.routes());
app.use(public_routes_1.default.allowedMethods());
app.use(middleware_1.authorize);
app.use(protected_routes_1.default.routes());
app.use(protected_routes_1.default.allowedMethods());
app.on('error', (err) => {
    console.error('server error', err);
    // Serve 404 or 500?
});
app.listen(4000);
//# sourceMappingURL=index.js.map