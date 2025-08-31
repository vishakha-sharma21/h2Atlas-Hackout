// src/components/Preferences.jsx
import React, { useMemo, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import IndiaMap from './IndiaMap.jsx';

const INDIA_STATES = [
  'All India',
  'Andhra Pradesh','Arunachal Pradesh','Assam','Bihar','Chhattisgarh','Goa','Gujarat','Haryana','Himachal Pradesh','Jharkhand','Karnataka','Kerala','Madhya Pradesh','Maharashtra','Manipur','Meghalaya','Mizoram','Nagaland','Odisha','Punjab','Rajasthan','Sikkim','Tamil Nadu','Telangana','Tripura','Uttar Pradesh','Uttarakhand','West Bengal',
  'Andaman and Nicobar Islands','Chandigarh','Dadra and Nagar Haveli and Daman and Diu','Delhi','Jammu and Kashmir','Ladakh','Lakshadweep','Puducherry'
];

// Simplified bounding boxes for all states and UTs in India (used to filter GeoJSON)
const STATE_BOUNDS = {
  'All India': { minLat: 8.4, maxLat: 37.6, minLng: 68.7, maxLng: 97.2 },
  'Andhra Pradesh': { minLat: 12.5, maxLat: 19.3, minLng: 76.5, maxLng: 84.7 },
  'Arunachal Pradesh': { minLat: 26.6, maxLat: 29.5, minLng: 91.6, maxLng: 97.4 },
  'Assam': { minLat: 24.1, maxLat: 28.2, minLng: 89.7, maxLng: 96.0 },
  'Bihar': { minLat: 24.3, maxLat: 27.5, minLng: 83.3, maxLng: 88.1 },
  'Chhattisgarh': { minLat: 17.8, maxLat: 24.1, minLng: 80.2, maxLng: 84.4 },
  'Goa': { minLat: 14.9, maxLat: 15.8, minLng: 73.7, maxLng: 74.3 },
  'Gujarat': { minLat: 20.1, maxLat: 24.5, minLng: 68.1, maxLng: 74.4 },
  'Haryana': { minLat: 27.7, maxLat: 30.9, minLng: 74.5, maxLng: 77.4 },
  'Himachal Pradesh': { minLat: 30.2, maxLat: 33.2, minLng: 75.5, maxLng: 79.0 },
  'Jharkhand': { minLat: 21.9, maxLat: 25.3, minLng: 83.3, maxLng: 87.9 },
  'Karnataka': { minLat: 11.5, maxLat: 18.5, minLng: 74.0, maxLng: 78.6 },
  'Kerala': { minLat: 8.2, maxLat: 12.8, minLng: 74.9, maxLng: 77.4 },
  'Madhya Pradesh': { minLat: 21.1, maxLat: 26.9, minLng: 74.0, maxLng: 82.8 },
  'Maharashtra': { minLat: 15.5, maxLat: 22.0, minLng: 72.6, maxLng: 80.9 },
  'Manipur': { minLat: 23.8, maxLat: 25.7, minLng: 93.0, maxLng: 94.8 },
  'Meghalaya': { minLat: 25.0, maxLat: 26.1, minLng: 89.9, maxLng: 92.8 },
  'Mizoram': { minLat: 21.9, maxLat: 24.5, minLng: 92.2, maxLng: 93.7 },
  'Nagaland': { minLat: 25.2, maxLat: 27.0, minLng: 93.3, maxLng: 95.8 },
  'Odisha': { minLat: 17.8, maxLat: 22.6, minLng: 81.4, maxLng: 87.5 },
  'Punjab': { minLat: 29.5, maxLat: 32.5, minLng: 73.9, maxLng: 76.9 },
  'Rajasthan': { minLat: 23.0, maxLat: 30.1, minLng: 69.5, maxLng: 78.1 },
  'Sikkim': { minLat: 27.0, maxLat: 28.1, minLng: 88.0, maxLng: 88.9 },
  'Tamil Nadu': { minLat: 8.0, maxLat: 13.5, minLng: 76.8, maxLng: 80.3 },
  'Telangana': { minLat: 15.8, maxLat: 19.9, minLng: 77.3, maxLng: 81.1 },
  'Tripura': { minLat: 22.9, maxLat: 24.5, minLng: 91.1, maxLng: 92.7 },
  'Uttar Pradesh': { minLat: 23.9, maxLat: 30.4, minLng: 77.1, maxLng: 84.6 },
  'Uttarakhand': { minLat: 28.4, maxLat: 31.5, minLng: 77.6, maxLng: 81.0 },
  'West Bengal': { minLat: 21.5, maxLat: 27.2, minLng: 85.8, maxLng: 89.9 },
  'Andaman and Nicobar Islands': { minLat: 6.7, maxLat: 13.5, minLng: 92.1, maxLng: 94.0 },
  'Chandigarh': { minLat: 30.7, maxLat: 30.8, minLng: 76.7, maxLng: 76.8 },
  'Dadra and Nagar Haveli and Daman and Diu': { minLat: 20.0, maxLat: 20.9, minLng: 72.8, maxLng: 73.2 },
  'Delhi': { minLat: 28.4, maxLat: 28.9, minLng: 76.8, maxLng: 77.3 },
  'Jammu and Kashmir': { minLat: 32.3, maxLat: 37.1, minLng: 73.0, maxLng: 80.3 },
  'Ladakh': { minLat: 32.2, maxLat: 36.0, minLng: 75.9, maxLng: 79.9 },
  'Lakshadweep': { minLat: 8.2, maxLat: 12.3, minLng: 71.0, maxLng: 74.0 },
  'Puducherry': { minLat: 11.7, maxLat: 12.0, minLng: 79.7, maxLng: 79.9 }
};

// Note: Removed fallback SAMPLE_DATA. We rely solely on public GeoJSON files.

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

// Stats will be derived dynamically from loaded GeoJSON layers

export default function Preferences() {
  const navigate = useNavigate();
  const initial = useMemo(() => {
    try { return JSON.parse(localStorage.getItem('h2_filters') || '{}'); } catch { return {}; }
  }, []);
  const [stateVal, setStateVal] = useState(initial.state || 'All India');
  const [modes, setModes] = useState(initial.modes || []);
  // New: geo layers state
  const [layers, setLayers] = useState([]);
  // Map layer visibility: default all ON as requested
  const [visibleLayers, setVisibleLayers] = useState({ demands: true, plants: true, hydrogen: true });
  const [selectedStats, setSelectedStats] = useState([]);
  // Heatmap removed from Preferences; see Site Selection page for scoring overlays

  // Always start at All India to show pan-India data by default
  useEffect(() => {
    setStateVal('All India');
  }, []);

  // Lenient JSON parser to handle invalid tokens like NaN/Infinity from data exports
  const parseGeoJsonLenient = (text, fileName) => {
    try {
      return JSON.parse(text);
    } catch (e1) {
      try {
        const sanitized = text
          .replace(/\bNaN\b/g, 'null')
          .replace(/\bInfinity\b/g, 'null')
          .replace(/\b-Infinity\b/g, 'null');
        return JSON.parse(sanitized);
      } catch (e2) {
        console.error(`Failed to parse GeoJSON from ${fileName}`, e2);
        return { type: 'FeatureCollection', features: [] };
      }
    }
  };

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
    const payload = { state: stateVal === 'All India' ? '' : stateVal, modes, visibleLayers };
    try {
      localStorage.setItem('h2_filters', JSON.stringify(payload));
      localStorage.setItem('h2_filters_saved_at', new Date().toISOString());
    } catch {}
    // Stay on the same page (no redirect)
  };

  // Removed nearest transport summary above the map (duplicate of popup content)

  // New: fetch GeoJSON layers once
  useEffect(() => {
    const files = [
      { name: 'plants', url: '/india_solar_wind.geojson' },
      { name: 'demands', url: '/major_industrial_plants.geojson' },
      { name: 'hydrogen', url: '/final_hydrogen_plants.geojson' },
    ];
    let cancelled = false;
    Promise.all(
      files.map(async (f) => {
        const res = await fetch(f.url);
        const text = await res.text();
        const data = parseGeoJsonLenient(text, f.url);
        return { name: f.name, data };
      })
    )
      .then(layersArr => {
        if (cancelled) return;
        // Log raw feature counts per layer
        try {
          const counts = Object.fromEntries(layersArr.map(l => [l.name, (l.data.features||[]).length]));
          console.log('[GeoJSON loaded] feature counts:', counts);
        } catch {}
        setLayers(layersArr);
      })
      .catch(err => console.error('Error loading geojson files:', err));
    return () => { cancelled = true; };
  }, []);

  // New: filter features by selected state bounds
  const filterGeoByState = (geojson, state) => {
    if (!geojson) return null;
    if (state === 'All India') return geojson;
    const bounds = STATE_BOUNDS[state];
    if (!bounds) {
      console.warn(`No bounds data available for state: ${state}.`);
      return { ...geojson, features: [] };
    }

    const within = (lng, lat) => (
      lat >= bounds.minLat && lat <= bounds.maxLat &&
      lng >= bounds.minLng && lng <= bounds.maxLng
    );

    const checkPair = (pair) => {
      if (!Array.isArray(pair) || pair.length < 2) return false;
      const [a, b] = pair;
      if (typeof a !== 'number' || typeof b !== 'number') return false;
      // Try normal [lng, lat]
      if (within(a, b)) return true;
      // Try swapped [lat, lng]
      if (within(b, a)) return true;
      return false;
    };

    const featureInBounds = (f) => {
      const g = f.geometry;
      if (!g || !g.coordinates) return false;
      const t = g.type;
      if (t === 'Point') return checkPair(g.coordinates);
      if (t === 'MultiPoint') return g.coordinates.some(checkPair);
      if (t === 'LineString') return g.coordinates.some(checkPair);
      if (t === 'MultiLineString') return g.coordinates.flat(1).some(checkPair);
      if (t === 'Polygon') return g.coordinates.flat(1).some(checkPair);
      if (t === 'MultiPolygon') return g.coordinates.flat(2).some(checkPair);
      return false;
    };

    const filtered = (geojson.features || []).filter(featureInBounds);
    return { ...geojson, features: filtered };
  };

  const filteredLayers = useMemo(() => (
    layers.map(l => ({ name: l.name, data: filterGeoByState(l.data, stateVal) }))
  ), [layers, stateVal]);

  // Only pass visible layers to the map; stats use all filtered data (independent of visibility)
  const visibleFilteredLayers = useMemo(() => (
    filteredLayers.filter(l => !!visibleLayers[l.name])
  ), [filteredLayers, visibleLayers]);

  // Log filtered counts whenever state/layers change
  useEffect(() => {
    try {
      const counts = Object.fromEntries(filteredLayers.map(l => [l.name, (l.data.features||[]).length]));
      console.log(`[GeoJSON filtered @ ${stateVal}] feature counts:`, counts);
    } catch {}
  }, [filteredLayers, stateVal]);

  // Heatmap generation removed from Preferences; see Site Selection page

  const saveFilters = () => {
    const payload = { state: stateVal === 'All India' ? '' : stateVal, modes };
    localStorage.setItem('h2_filters', JSON.stringify(payload));
  };

  // Auto-save filters whenever state or modes change
  useEffect(() => {
    const payload = { state: stateVal === 'All India' ? '' : stateVal, modes };
    try { localStorage.setItem('h2_filters', JSON.stringify(payload)); } catch {}
  }, [stateVal, modes]);


  const onClear = () => { setStateVal('All India'); setModes([]); };
  const toggleStat = (id, checked) => {
    setSelectedStats(prev => checked ? [...prev, id] : prev.filter(x => x !== id));
  };
  // Derive dynamic stats from filteredLayers (independent of layer visibility)
  const derivedStats = useMemo(() => {
    const layerBy = (name) => filteredLayers.find(l => l.name === name)?.data || { type: 'FeatureCollection', features: [] };
    const feats = (name) => (layerBy(name).features || []);

    const demandFeats = feats('demands');
    const plantFeats = feats('plants');
    const hydrogenFeats = feats('hydrogen');

    const allFeats = [...demandFeats, ...plantFeats, ...hydrogenFeats];
    const sumCapacity = allFeats.reduce((acc, f) => {
      const p = f.properties || {};
      const val = Number(p.capacity_mw ?? p.capacity ?? 0);
      return acc + (Number.isFinite(val) ? val : 0);
    }, 0);

    const owners = new Set(demandFeats.map(f => (f.properties?.owner || '').trim()).filter(Boolean));

    return [
      { id: 'demandsCount', label: 'Demand Nodes', value: demandFeats.length, color: 'text-red-600' },
      { id: 'renewablePlants', label: 'Renewable Plants', value: plantFeats.length, color: 'text-green-600' },
      { id: 'hydrogenPlants', label: 'Hydrogen Plants', value: hydrogenFeats.length, color: 'text-emerald-600' },
      { id: 'totalMW', label: 'Total Capacity (MW)', value: Math.round(sumCapacity), color: 'text-blue-600' },
      { id: 'uniqueOwners', label: 'Unique Owners (Demand)', value: owners.size, color: 'text-orange-600' },
    ];
  }, [filteredLayers]);

  // Keep a stable order for stats; do not reorder when checked/unchecked
  const sortedStats = derivedStats;

  return (
    <div className="min-h-screen bg-[#F8F9FA]">
      <header className="sticky top-0 z-[1100] bg-[#6495ED] text-white shadow-md">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-[#4A90E2]" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L12 10.75M12 10.75L14.25 17M12 10.75V3M21 12c0-4.97-4.03-9-9-9S3 7.03 3 12s4.03 9 9 9 9-4.03 9-9z"/></svg>
            <span className="font-bold">H2Atlas</span>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={()=>navigate('/')} className="bg-gray-700 hover:bg-gray-800 text-gray-200 text-sm px-4 py-2 rounded-md transition-colors">Back to Home</button>
            <button onClick={()=>navigate('/predict')} className="bg-[#4A90E2] hover:bg-[#3A7EDC] text-white text-sm px-4 py-2 rounded-md transition-colors">Solar/Wind Plant Predict</button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 pt-6 pb-10">
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

            {/* Transportation (full-width above the map) */}
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
              {/* Removed nearest transport summary above the map */}
            </div>

            {/* Map with simple stats beside it (70/30 split on md+) */}
            <div className="grid grid-cols-1 md:grid-cols-10 gap-6 items-start">
              <div className="md:col-span-7 border border-gray-200 rounded-md overflow-hidden relative z-0">
                <IndiaMap selectedState={stateVal} layers={visibleFilteredLayers} modes={modes} />
              </div>
              <div className="md:col-span-3">
                {/* Layer visibility controls */}
                <span className="block text-sm font-medium text-gray-700 mb-2">Layers</span>
                <div className="flex flex-col gap-2 mb-4">
                  {[
                    { id: 'demands', label: 'Demand Nodes' },
                    { id: 'plants', label: 'Renewable Plants' },
                    { id: 'hydrogen', label: 'Hydrogen Plants' },
                  ].map(l => (
                    <label key={l.id} className="flex items-center gap-2 px-3 py-2 border rounded-md hover:bg-gray-50 cursor-pointer">
                      <input
                        type="checkbox"
                        className="h-4 w-4"
                        checked={!!visibleLayers[l.id]}
                        onChange={(e)=> setVisibleLayers(v => ({ ...v, [l.id]: e.target.checked }))}
                      />
                      <span className="text-sm text-gray-800">{l.label}</span>
                    </label>
                  ))}
                </div>
                <span className="block text-sm font-medium text-gray-700 mb-2">Select Stats to Display</span>
                <div className="flex flex-col gap-2">
                  {sortedStats.map(s => (
                    <div key={s.id}>
                      <label className="flex items-center gap-2 px-3 py-2 border rounded-md hover:bg-gray-50 cursor-pointer">
                        <input
                          type="checkbox"
                          className="h-4 w-4"
                          checked={selectedStats.includes(s.id)}
                          onChange={(e) => toggleStat(s.id, e.target.checked)}
                        />
                        <span className="text-sm text-gray-800">{s.label}</span>
                      </label>
                      {selectedStats.includes(s.id) && (
                        <div className={`mt-1 pl-7 text-2xl font-semibold ${s.color}`}>
                          {s.value}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                {/* Hydrogen heatmap controls removed from Preferences */}
              </div>
            </div>

            {/* Stats block moved next to the map above */}

            <div className="flex items-center justify-between">
              <button type="button" onClick={onClear} className="px-4 py-2 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50">Clear</button>
              <button type="submit" className="px-5 py-2 rounded-md bg-[#4A90E2] hover:bg-[#3A7EDC] text-white font-medium shadow">Save & Continue</button>
            </div>

            {/* Info line moved directly below Save & Continue */}
            <p className="text-sm text-gray-600 mt-3">Changes apply immediately to the map. Saving keeps your choices for later.</p>

            {/* Report/Document actions moved here */}
            {/* Report/Document actions removed as per new design; now accessible from Site Selection (Generate Report). */}

            {/* Predict entry point removed (now in navbar) */}
          </form>
        </div>
      </main>
    </div>
  );
}
