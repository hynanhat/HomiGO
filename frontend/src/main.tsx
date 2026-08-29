import React from 'react'
import ReactDOM from 'react-dom/client'
import '@fontsource/be-vietnam-pro/700.css'
import '@fontsource/be-vietnam-pro/800.css'
import '@fontsource-variable/noto-sans/wght.css'
import App from './App.tsx'
import './index.css'
import { AppProviders } from './app/providers.tsx'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AppProviders>
      <App />
    </AppProviders>
  </React.StrictMode>,
)
