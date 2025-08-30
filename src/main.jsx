import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import Preferences from './components/components.jsx'
import Report from './components/Report.jsx'
import Predict from './pages/Predict.jsx'
import About from './pages/About.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/preferences" element={<Preferences />} />
        <Route path="/report" element={<Report />} />
        <Route path="/predict" element={<Predict />} />
        <Route path="/about" element={<About />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)
