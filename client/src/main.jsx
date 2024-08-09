import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import {BrowserRouter}  from "react-router-dom" 
import { createRoot } from 'react-dom/client';
import { Auth0Provider } from '@auth0/auth0-react';
import Config from '../contexts/Conf.jsx'
ReactDOM.createRoot(document.getElementById('root')).render(


<Auth0Provider
domain="dev-6afnus4k3roj8psj.us.auth0.com"
clientId="dlz2HThDkxPUte1zqUQoT2q1pWCXKtDI"
authorizationParams={{
  redirect_uri: window.location.origin
}}
>
<BrowserRouter>
<Config>
  <App />
  </Config>
</BrowserRouter>
</Auth0Provider>,
);



