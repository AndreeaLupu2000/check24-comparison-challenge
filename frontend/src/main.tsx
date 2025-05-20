import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { AuthContextProvider } from './context/AuthContext'
import { AddressContextProvider } from './context/AddressContext'


createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthContextProvider>
      <AddressContextProvider>
      <App />
      </AddressContextProvider>
    </AuthContextProvider>
  </StrictMode>,
)
