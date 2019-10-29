import * as ReactDOM from 'react-dom';
import * as React from 'react';
import * as serviceWorker from './serviceWorker';
import * as katex from 'katex';
import App from './App';

import './css/main.sass'; 
import './components/navigation/navigation.sass';
import './components/core/section.sass';
import './components/uploaders/file-uploader.sass';
import './components/authentication/auth.sass';
import './components/rich-text/quill.extensions.sass';
import './components/css-manager/css-manager.sass';
import './components/css-manager/class-selector.sass';

import './components/rich-text/quill.core.css';
import './components/rich-text/quill.snow.css';

// Don't know if I can remove
import 'react-quill/dist/quill.snow.css';


(window as any).katex = katex;

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
