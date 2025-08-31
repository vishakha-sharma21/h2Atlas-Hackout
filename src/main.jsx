import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import Preferences from './components/components.jsx'
import Report from './components/Report.jsx'
import Predict from './pages/Predict.jsx'
import About from './pages/About.jsx'
import MainApp from './components/MainApp.jsx'
import GenReport from './components/GenReport.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/preferences" element={<Preferences />} />
        <Route path="/report" element={<Report />} />
        <Route path="/predict" element={<Predict />} />
        <Route path="/about" element={<About />} />
        <Route path="/predictdata" element={<MainApp />} />
        <Route path="/reportpredict" element={<GenReport />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)
