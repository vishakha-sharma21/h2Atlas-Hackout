import React, { useEffect, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import IndiaMap from './IndiaMap.jsx';

export default function Report() {
  const navigate = useNavigate();
  const location = useLocation();

  const filters = useMemo(() => {
    try { return JSON.parse(localStorage.getItem('h2_filters') || '{}'); } catch { return {}; }
  }, []);

  const region = filters?.state && filters.state.length > 0 ? filters.state : 'All India';
  const modes = Array.isArray(filters?.modes) ? filters.modes : [];
  const modesLabel = modes.length === 0 ? 'No modes selected' : (modes.includes('All') ? 'All transportation modes' : modes.join(', '));

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('print') === '1') {
      // Wait a tick to ensure map renders before print
      setTimeout(() => window.print(), 600);
    }
  }, [location.search]);

  return (
    <div className="min-h-screen bg-[#F8F9FA]">
      <header className="sticky top-0 z-[1100] bg-[#1A202C] text-white shadow-md print:hidden">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-[#4A90E2]" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L12 10.75M12 10.75L14.25 17M12 10.75V3M21 12c0-4.97-4.03-9-9-9S3 7.03 3 12s4.03 9 9 9 9-4.03 9-9z"/></svg>
            <span className="font-bold">H2Atlas · Report</span>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => window.print()} className="px-3 py-2 rounded-md bg-[#4A90E2] hover:bg-[#3A7EDC] text-white text-sm font-medium shadow">Download PDF</button>
            <button onClick={() => navigate('/')} className="px-3 py-2 rounded-md bg-gray-700 hover:bg-gray-800 text-gray-200 text-sm">Back to Home</button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-6">
        <div className="bg-white border border-gray-200 rounded-xl shadow print:shadow-none print:border-0">
          <div className="px-6 py-5 border-b border-gray-200 bg-gradient-to-r from-[#F8FBFF] to-white print:bg-white print:border-0">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Project Report</h1>
            <p className="text-gray-600 mt-1">Summary of your current selections and map view.</p>
          </div>

          <div className="p-6 grid grid-cols-1 md:grid-cols-10 gap-6 items-start">
            <div className="md:col-span-4 space-y-3">
              <div>
                <div className="text-sm text-gray-500">Region</div>
                <div className="text-lg font-semibold text-gray-800">{region}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Transportation Modes</div>
                <div className="text-lg font-semibold text-gray-800">{modesLabel}</div>
              </div>
              {/* You can add compact stats here if needed later */}
            </div>

            <div className="md:col-span-6 border border-gray-200 rounded-md overflow-hidden relative z-0">
              <IndiaMap selectedState={region} />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
