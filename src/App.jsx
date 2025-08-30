import React, { useEffect, useState } from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import TheChallenge from './components/TheChallenge';
import TheSolution from './components/TheSolution';
import MainPlatform from './components/MainPlatform';
import './index.css'; // Ensure your Tailwind CSS is imported here

function App() {
  // Global filter state: selected Indian state and selected transport modes
  const [filters, setFilters] = useState({ state: '', modes: [] });
  // Load saved preferences when visiting the home page
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('h2_filters') || '{}');
      if (saved && (saved.state !== undefined || saved.modes !== undefined)) {
        setFilters({ state: saved.state || '', modes: saved.modes || [] });
      }
    } catch {}
  }, []);
  return (
    <div className="App font-sans bg-[#F8F9FA] min-h-screen"> {/* Overall light gray background */}
      <Header />
      <main className="pt-16"> {/* Add padding to account for fixed header */}
        <Hero />
        <TheChallenge />
        <TheSolution />
        <MainPlatform filters={filters} />
      </main>
    </div>
  );
}

export default App;