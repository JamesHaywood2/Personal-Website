import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'


//This creates a root element and renders the App component.
createRoot(document.getElementById('root')).render(
   <App />
)
