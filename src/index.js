import React from 'react';
import ReactDOM from 'react-dom';
import * as serviceWorker from './serviceWorker';
import katex from 'katex';
import App from './App'

import './css/app.sass' 
import './css/navigation.sass'
import './css/section.sass'
import './css/file-uploader.sass'
import './css/auth.sass'
import './css/quill.extentions.sass'
import './css/css-manager.sass'
import './css/class-selector.sass'

import './css/quill.core.css'
import './css/quill.snow.css'

// Don't know if I can remove
import 'react-quill/dist/quill.snow.css';


window.katex = katex

/*
window.hljs.configure({   // optionally configure hljs
    languages: ['javascript', 'python', 'go', 'php', 'html', 'css']
});
*/
ReactDOM.render(<App />, document.getElementById('root'));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
