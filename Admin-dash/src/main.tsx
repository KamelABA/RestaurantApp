import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './index.css'
import Index from './pages/Index.tsx'
import NotFound from './pages/NotFound.tsx'
import { Toaster } from '@/components/ui/toaster'
import { LanguageProvider } from '@/contexts/language-context'
import App from './App'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <LanguageProvider>
        <App />
    </LanguageProvider>
  </StrictMode>,
)
