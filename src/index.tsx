import React from 'react';
import ReactDOM from 'react-dom/client';

import './index.css';
import App from './App';
// import * as serviceWorker from './serviceWorker';
import {BrowserRouter as Router} from "react-router-dom";
import 'bootstrap/dist/css/bootstrap.min.css';
import 'react-toastify/dist/ReactToastify.css';
import {ThemeProvider} from "@material-tailwind/react";

const root = ReactDOM.createRoot(
    document.getElementById('root') as HTMLElement
);

root.render(
    <React.StrictMode>
        <Router>
            <ThemeProvider>
                <App/>
            </ThemeProvider>
        </Router>
    </React.StrictMode>
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
// serviceWorker.unregister();
