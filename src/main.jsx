import React, { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

console.log("Main.jsx is loading!");

try {
  const root = document.getElementById('root');
  console.log("Root element:", root);
  const reactRoot = createRoot(root);
  reactRoot.render(
    <StrictMode>
      <App />
    </StrictMode>
  );
  console.log("Render called!");
} catch (e) {
  console.error("Error during render:", e);
}
