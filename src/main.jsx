import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import { SelectionProvider } from './selection';
import './index.css';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <SelectionProvider>
      <App />
    </SelectionProvider>
  </StrictMode>,
);
