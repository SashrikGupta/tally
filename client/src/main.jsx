import React from 'react';
import ReactDOM from 'react-dom/client';
import { Providers } from './app/providers';
import { AppRouter } from './app/router';
import { ErrorBoundary } from './app/ErrorBoundary';
import './styles/index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <Providers>
        <AppRouter />
      </Providers>
    </ErrorBoundary>
  </React.StrictMode>,
);
