import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './renderer/src/app/App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
