import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// Setup basic entry mounting without unused default modules
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);