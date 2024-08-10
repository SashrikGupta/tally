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
domain="dev-wsy813w1pt6yvgsv.us.auth0.com"
clientId="H7mr0Tyx9RkCyw1iAFXEyrGmAgw3Gp6h"
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



