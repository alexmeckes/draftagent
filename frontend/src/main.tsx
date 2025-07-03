import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

console.log('main.tsx is loading');

const rootElement = document.getElementById('root');
console.log('Root element:', rootElement);

if (!rootElement) {
  console.error('Root element not found!');
  document.body.innerHTML = '<h1 style="color: red;">Root element not found!</h1>';
} else {
  console.log('Creating React root...');
  createRoot(rootElement).render(
    <StrictMode>
      <App />
    </StrictMode>,
  )
  console.log('React app rendered');
}
