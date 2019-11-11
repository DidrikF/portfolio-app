"use strict";
exports.__esModule = true;
var ReactDOM = require("react-dom");
var React = require("react");
// import * as serviceWorker from './serviceWorker';
var katex = require("katex");
var App_1 = require("./App");
require("./css/main.sass");
require("./components/navigation/navigation.sass");
require("./components/core/section.sass");
require("./components/uploaders/file-uploader.sass");
require("./components/authentication/auth.sass");
require("./components/rich-text/quill.extensions.sass");
require("./components/css-manager/css-manager.sass");
require("./components/css-manager/class-selector.sass");
require("./components/rich-text/quill.core.css");
require("./components/rich-text/quill.snow.css");
// Don't know if I can remove
// import 'react-quill/dist/quill.snow.css';
window.katex = katex;
/*
window.hljs.configure({   // optionally configure hljs
    languages: ['javascript', 'python', 'go', 'php', 'html', 'css']
});
*/
ReactDOM.render(<App_1["default"] />, document.getElementById('root'));
// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
// serviceWorker.unregister();
