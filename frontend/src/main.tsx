import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { AuthContextProvider } from './context/AuthContext'
import { AddressContextProvider } from './context/AddressContext'
import { LoadScript } from '@react-google-maps/api'


createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthContextProvider>
      <AddressContextProvider>
      <LoadScript googleMapsApiKey={import.meta.env.VITE_GOOGLE_PLACE_API!} libraries={['places']}>
        <App />
      </LoadScript>
      </AddressContextProvider>
    </AuthContextProvider>
  </StrictMode>,
)
