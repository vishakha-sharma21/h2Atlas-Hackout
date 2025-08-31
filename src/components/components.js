// src/components/Preferences.js
import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import IndiaMap from '../components/IndiaMap'; // Import the new map component

const INDIA_STATES = [
  'All India',
  'Andhra Pradesh','Arunachal Pradesh','Assam','Bihar','Chhattisgarh','Goa','Gujarat','Haryana','Himachal Pradesh','Jharkhand','Karnataka','Kerala','Madhya Pradesh','Maharashtra','Manipur','Meghalaya','Mizoram','Nagaland','Odisha','Punjab','Rajasthan','Sikkim','Tamil Nadu','Telangana','Tripura','Uttar Pradesh','Uttarakhand','West Bengal',
  'Andaman and Nicobar Islands','Chandigarh','Dadra and Nagar Haveli and Daman and Diu','Delhi','Jammu and Kashmir','Ladakh','Lakshadweep','Puducherry'
];

const TRANSPORT_OPTIONS = [
  { id: 'All', label: 'All' },
  { id: 'Railways', label: 'Railways' },
  { id: 'Roadways', label: 'Roadways' },
  { id: 'Airways', label: 'Airways' },
  { id: 'Waterways', label: 'Waterways (Inland/Coastal)' },
  { id: 'Pipelines', label: 'Pipelines' },
  { id: 'Metro', label: 'Metro / Urban Transit' },
  { id: 'SeaPorts', label: 'Sea Ports' },
  { id: 'Multimodal', label: 'Multimodal Logistics' },
];

export default function Preferences() {
  const navigate = useNavigate();
  const initial = useMemo(() => {
    try { return JSON.parse(localStorage.getItem('h2_filters') || '{}'); } catch { return {}; }
  }, []);
  const [stateVal, setStateVal] = useState(initial.state || 'All India'); // Set 'All India' as default
  const [modes, setModes] = useState(initial.modes || []);

  const onToggle = (id) => (e) => {
    const checked = e.target.checked;
    if (id === 'All') {
      setModes(checked ? ['All'] : []);
      return;
    }
    const next = new Set(modes.includes('All') ? [] : modes);
    if (checked) next.add(id); else next.delete(id);
    setModes(Array.from(next));
  };

  const onSubmit = (e) => {
    e.preventDefault();
    const payload = { state: stateVal === 'All India' ? '' : stateVal, modes };
    localStorage.setItem('h2_filters', JSON.stringify(payload));
    navigate('/');
  };

  const onClear = () => { setStateVal('All India'); setModes([]); };

  return (
    <div className="min-h-screen bg-[#F8F9FA]">
      <header className="sticky top-0 z-40 bg-[#6495ED] text-white shadow-md">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-[#4A90E2]" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L12 10.75M12 10.75L14.25 17M12 10.75V3M21 12c0-4.97-4.03-9-9-9S3 7.03 3 12s4.03 9 9 9 9-4.03 9-9z"/></svg>
            <span className="font-bold">H2Atlas</span>
          </div>
          <button onClick={()=>navigate('/')} className="bg-gray-700 hover:bg-gray-800 text-gray-200 text-sm px-4 py-2 rounded-md transition-colors">Back to Home</button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-10">
        <div className="bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-200 bg-gradient-to-r from-[#F8FBFF] to-white">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Preferences</h1>
            <p className="text-gray-600 mt-1">Choose your region and preferred transportation layers.</p>
          </div>

          <form onSubmit={onSubmit} className="p-6 space-y-8">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Region (State/UT)</label>
              <select
                className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#4A90E2]"
                value={stateVal || 'All India'}
                onChange={(e)=>setStateVal(e.target.value)}
              >
                {INDIA_STATES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            
            {/* The Leaflet Map Component */}
            <div className="border border-gray-200 rounded-md overflow-hidden">
              <IndiaMap selectedState={stateVal} />
            </div>

            <div>
              <span className="block text-sm font-medium text-gray-700 mb-2">Transportation</span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {TRANSPORT_OPTIONS.map(opt => (
                  <label key={opt.id} className="flex items-center gap-3 p-3 border rounded-md hover:bg-gray-50 cursor-pointer">
                    <input
                      type="checkbox"
                      className="h-4 w-4"
                      checked={opt.id === 'All' ? modes.includes('All') : (!modes.includes('All') && modes.includes(opt.id))}
                      onChange={onToggle(opt.id)}
                    />
                    <span className="text-sm text-gray-800">{opt.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between">
              <button type="button" onClick={onClear} className="px-4 py-2 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50">Clear</button>
              <button type="submit" className="px-5 py-2 rounded-md bg-[#4A90E2] hover:bg-[#3A7EDC] text-white font-medium shadow">Save & Continue</button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}