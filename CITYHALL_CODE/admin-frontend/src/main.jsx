import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import matomo from './utils/matomo.js';

// ✅ Optional: Import Flowbite JS (only if you're using Flowbite's interactive components like modals, dropdowns)
import 'flowbite';

// Initialize Matomo analytics
matomo.initialize();

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
