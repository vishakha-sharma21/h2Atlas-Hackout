import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { MapContainer, TileLayer, GeoJSON } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import IndiaMap from './IndiaMap.jsx';

// Simplified bounding boxes to filter features by state (copied from Preferences)
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

function parseGeoJsonLenient(text) {
  try { return JSON.parse(text); } catch (e1) {
    try {
      const sanitized = text.replace(/\bNaN\b/g,'null').replace(/\bInfinity\b/g,'null').replace(/\b-Infinity\b/g,'null');
      return JSON.parse(sanitized);
    } catch (e2) { return { type:'FeatureCollection', features: [] }; }
  }
}

function filterGeoByState(geojson, state) {
  if (!geojson) return null;
  if (state === 'All India') return geojson;
  const bounds = STATE_BOUNDS[state];
  if (!bounds) return { ...geojson, features: [] };
  const within = (lng, lat) => lat >= bounds.minLat && lat <= bounds.maxLat && lng >= bounds.minLng && lng <= bounds.maxLng;
  const checkPair = (pair) => Array.isArray(pair) && pair.length >= 2 && ((typeof pair[0]==='number' && typeof pair[1]==='number' && (within(pair[0], pair[1]) || within(pair[1], pair[0]))));
  const featureInBounds = (f) => {
    const g = f.geometry; if (!g || !g.coordinates) return false; const t=g.type;
    if (t==='Point') return checkPair(g.coordinates);
    if (t==='MultiPoint') return g.coordinates.some(checkPair);
    if (t==='LineString') return g.coordinates.some(checkPair);
    if (t==='MultiLineString') return g.coordinates.flat(1).some(checkPair);
    if (t==='Polygon') return g.coordinates.flat(1).some(checkPair);
    if (t==='MultiPolygon') return g.coordinates.flat(2).some(checkPair);
    return false;
  };
  const filtered = (geojson.features||[]).filter(featureInBounds);
  return { ...geojson, features: filtered };
}

export default function Report() {
  const navigate = useNavigate();
  const location = useLocation();
  const [layers, setLayers] = useState([]);

  const filters = useMemo(() => { try { return JSON.parse(localStorage.getItem('h2_filters') || '{}'); } catch { return {}; } }, []);
  const siteSel = useMemo(() => { try { return JSON.parse(localStorage.getItem('h2_site_selection') || '{}'); } catch { return {}; } }, []);
  const weightageFC = useMemo(() => { try { return JSON.parse(localStorage.getItem('h2_weightage_geojson') || 'null'); } catch { return null; } }, []);

  const region = filters?.state && filters.state.length > 0 ? filters.state : 'All India';
  const modes = Array.isArray(filters?.modes) ? filters.modes : [];
  const vis = (filters && filters.visibleLayers) ? filters.visibleLayers : { demands: true, plants: true, hydrogen: true };
  const modesLabel = modes.length === 0 ? 'No modes selected' : (modes.includes('All') ? 'All transportation modes' : modes.join(', '));

  // Fetch GeoJSON layers and filter by region
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const files = [
          { name: 'plants', url: '/india_solar_wind.geojson' },
          { name: 'demands', url: '/major_industrial_plants.geojson' },
          { name: 'hydrogen', url: '/final_hydrogen_plants.geojson' },
        ];
        const fetched = await Promise.all(files.map(async f => {
          const res = await fetch(f.url); const text = await res.text();
          const data = parseGeoJsonLenient(text);
          return { name: f.name, data };
        }));
        if (cancelled) return;
        const byRegion = fetched.map(l => ({ name: l.name, data: filterGeoByState(l.data, region) }));
        setLayers(byRegion);
      } catch (e) { setLayers([]); }
    })();
    return () => { cancelled = true; };
  }, [region]);

  // Helpers to render weightage points like Heat.jsx
  const getColor = (score) => {
    const scaled = (score || 0) * 100;
    if (scaled > 80) return 'green';
    if (scaled > 50) return 'yellow';
    return 'red';
  };
  const pointToLayer = (feature, latlng) => {
    const color = getColor(feature?.properties?.score);
    return L.circleMarker(latlng, {
      radius: 8,
      fillColor: color,
      color: '#000',
      weight: 1,
      opacity: 1,
      fillOpacity: 0.8,
    });
  };
  const onEachFeature = (feature, layer) => {
    try {
      const displayScore = (feature?.properties?.score || 0) * 100;
      layer.bindPopup(
        `<h4>Grid Point</h4>
         <p>Score: ${displayScore.toFixed(2)}</p>
         <p>Lat: ${feature.geometry.coordinates[1]?.toFixed?.(2)}, Lon: ${feature.geometry.coordinates[0]?.toFixed?.(2)}</p>`
      );
    } catch {}
  };

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('print') === '1') {
      // Wait a tick to ensure map renders before print
      setTimeout(() => window.print(), 600);
    }
  }, [location.search]);

  // Build a simple recommendation for H2 transport mode from nearest infrastructure
  const buildTransportRecommendation = (summary) => {
    if (!summary || typeof summary !== 'object') return null;
    const get = (k) => summary[k] || {};
    const rd = get('Roadways').nearestKm ?? null;
    const rl = get('Railways').nearestKm ?? null;
    const pl = get('Pipelines').nearestKm ?? null;
    const ap = get('Airways').nearestKm ?? null;
    const wp = get('Waterways').nearestKm ?? null;
    const sp = get('SeaPorts').nearestKm ?? null;

    // Heuristics (km thresholds are indicative)
    // 1) If pipeline nearby, prefer GH2 via pipeline for steady, high volumes
    if (pl != null && pl <= 30) {
      return {
        primary: 'GH2 via pipeline',
        notes: [
          `Nearest pipeline ~${pl.toFixed(1)} km enables low-OPEX continuous flows for medium/high volumes`,
          'Requires blending checks and new/looped pipeline routing where absent',
        ],
      };
    }
    // 2) If port reasonably close, consider LH2/PtX for long-haul/export
    if (sp != null && sp <= 120) {
      return {
        primary: 'LH2 or PtX via seaport logistics',
        notes: [
          `Nearest port ~${sp.toFixed(1)} km supports maritime export/long-haul`,
          'LH2 needs liquefaction (~30% energy penalty); PtX (e.g., NH3) uses synthesis + cracking at destination',
        ],
      };
    }
    // 3) If rail close, GH2 tube trailers on rail or ISO-containers for PtX
    if (rl != null && rl <= 25) {
      return {
        primary: 'GH2 tube trailers by rail (or PtX ISO-containers)',
        notes: [
          `Nearest rail link ~${rl.toFixed(1)} km allows cost-effective mid-range haulage`,
          'Coordination for loading/unloading hubs is required',
        ],
      };
    }
    // 4) Fallback to road
    if (rd != null) {
      return {
        primary: 'GH2 tube trailers by road',
        notes: [
          `Road access ~${rd.toFixed(1)} km; suitable for short hops and early-phase supply`,
          'Scale triggers re-evaluation for pipeline or rail as volumes grow',
        ],
      };
    }
    // 5) Last resort
    return {
      primary: 'Further survey required',
      notes: ['Nearby transport infrastructure not found in query radius'],
    };
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA]">
      <header className="sticky top-0 z-[1100] bg-[#6495ED] text-white shadow-md print:hidden">
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
            <p className="text-gray-600 mt-1">Consolidated summary of Preferences, Site Selection, and Map.</p>
          </div>

          <div className="p-6 grid grid-cols-1 md:grid-cols-10 gap-6 items-start">
            {/* Left: Summaries */}
            <div className="md:col-span-5 space-y-6">
              {/* Preferences Summary */}
              <section>
                <h2 className="text-lg font-semibold text-gray-800">Preferences</h2>
                <div className="mt-2 text-sm text-gray-700">
                  <div><span className="text-gray-500">Region:</span> <span className="font-medium">{region}</span></div>
                  <div><span className="text-gray-500">Transportation Modes:</span> <span className="font-medium">{modesLabel}</span></div>
                </div>
                <div className="mt-3">
                  <div className="text-sm text-gray-500 mb-1">Visible Layers</div>
                  <ul className="list-disc list-inside text-sm text-gray-800">
                    <li className={vis.demands ? '' : 'line-through text-gray-400'}>Demand Nodes</li>
                    <li className={vis.plants ? '' : 'line-through text-gray-400'}>Renewable Plants</li>
                    <li className={vis.hydrogen ? '' : 'line-through text-gray-400'}>Hydrogen Plants</li>
                  </ul>
                </div>
              </section>

              {/* Site Selection Summary */}
              <section>
                <h2 className="text-lg font-semibold text-gray-800">Site Selection</h2>
                <div className="mt-2 text-sm text-gray-700 space-y-1">
                  <div><span className="text-gray-500">Location:</span> <span className="font-medium">{siteSel?.location ? `${Number(siteSel.location.lat).toFixed(4)}, ${Number(siteSel.location.lon).toFixed(4)}` : '—'}</span></div>
                  <div><span className="text-gray-500">Computed at:</span> {siteSel?.computedAt ? new Date(siteSel.computedAt).toLocaleString() : '—'}</div>
                </div>
                <div className="mt-3">
                  <div className="text-sm text-gray-500 mb-1">Weightages</div>
                  <ul className="list-disc list-inside text-sm text-gray-800">
                    <li>Demand: {siteSel?.weightages?.demand ?? '—'}%</li>
                    <li>Renewable: {siteSel?.weightages?.renewable ?? '—'}%</li>
                    <li>Power: {siteSel?.weightages?.power ?? '—'}%</li>
                  </ul>
                </div>
                <div className="mt-3">
                  <div className="text-sm text-gray-500 mb-1">Nearest Parameters</div>
                  <ul className="list-disc list-inside text-sm text-gray-800">
                    {(siteSel?.dashboard?.nearestParameters || []).map((p, idx) => (
                      <li key={idx}>{p.name || '—'} {p.distance != null ? `· ${p.distance.toFixed(1)} km` : ''} {p.type ? `· ${p.type}` : ''}</li>
                    ))}
                  </ul>
                </div>
                <div className="mt-3">
                  <div className="text-sm text-gray-500 mb-1">Fuel Capacity (within vicinity)</div>
                  <ul className="list-disc list-inside text-sm text-gray-800">
                    {siteSel?.dashboard?.fuelCapacity ? Object.entries(siteSel.dashboard.fuelCapacity).map(([k,v]) => (
                      <li key={k}>{k}: {Math.round(v)} MW</li>
                    )) : <li>—</li>}
                  </ul>
                </div>
              </section>

              {/* Transport Station Names */}
              <section>
                <h2 className="text-lg font-semibold text-gray-800">Nearby Transportation Stations</h2>
                <div className="mt-2 text-sm text-gray-700">Bullet list of station names grouped by mode.</div>
                <div className="mt-2 space-y-2">
                  {siteSel?.transportStationsByMode ? (
                    Object.entries(siteSel.transportStationsByMode).map(([mode, names]) => (
                      <div key={mode}>
                        <div className="text-sm text-gray-500">{mode}</div>
                        <ul className="list-disc list-inside text-sm text-gray-800">
                          {(names && names.length > 0) ? names.map((n, i) => (<li key={i}>{n}</li>)) : <li>—</li>}
                        </ul>
                      </div>
                    ))
                  ) : (
                    <div className="text-sm text-gray-500">—</div>
                  )}
                </div>
              </section>

              {/* Hydrogen Transport Pathways */}
              <section className="mt-6">
                <h2 className="text-lg font-semibold text-gray-800">Hydrogen Transport Pathways</h2>
                {!siteSel?.transportSummary ? (
                  <div className="mt-2 text-sm text-gray-600">No transport summary available. Re-run Calculate Score from Site Selection to populate nearby infrastructure.</div>
                ) : (
                  <div className="mt-2 space-y-3">
                    {/* Nearest distances by mode */}
                    <div>
                      <div className="text-sm text-gray-500 mb-1">Nearest Infrastructure (km)</div>
                      <ul className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm text-gray-800">
                        {Object.entries(siteSel.transportSummary).map(([mode, s]) => (
                          <li key={mode}>{mode}: {s?.nearestKm != null ? s.nearestKm.toFixed(1) : '—'} {s?.nearestName ? `· ${s.nearestName}` : ''}</li>
                        ))}
                      </ul>
                    </div>
                    {/* Recommendation */}
                    {(() => {
                      const rec = buildTransportRecommendation(siteSel.transportSummary);
                      if (!rec) return null;
                      return (
                        <div className="p-3 rounded-md bg-blue-50 border border-blue-100">
                          <div className="font-medium text-blue-900">Recommended Primary Mode: {rec.primary}</div>
                          <ul className="list-disc list-inside text-sm text-blue-900/90 mt-1">
                            {rec.notes.map((t, i) => (<li key={i}>{t}</li>))}
                          </ul>
                          <div className="text-xs text-blue-900/70 mt-2">Notes: LH2 liquefaction can consume up to ~30% of H2 energy. PtX (e.g., NH3) involves synthesis and potential reconversion costs.</div>
                        </div>
                      );
                    })()}
                  </div>
                )}
              </section>
            </div>

            {/* Right: Both maps */}
            <div className="md:col-span-5 space-y-4">
              {/* Preferences Map (saved layers) */}
              <div className="border border-gray-200 rounded-md overflow-hidden">
                <div className="px-3 py-2 text-sm font-medium bg-gray-50 border-b">Preferences Map</div>
                {(() => {
                  const visibleFilteredLayers = layers.filter(l => !!vis[l.name]);
                  return (
                    <IndiaMap selectedState={region} layers={visibleFilteredLayers} modes={modes} />
                  );
                })()}
              </div>

              {/* Weightage Map (from Calculate Score) */}
              <div className="border border-gray-200 rounded-md overflow-hidden">
                <div className="px-3 py-2 text-sm font-medium bg-gray-50 border-b">Weightage Map</div>
                {weightageFC && Array.isArray(weightageFC.features) && weightageFC.features.length > 0 ? (
                  <MapContainer center={[Number(siteSel?.location?.lat) || 23.4, Number(siteSel?.location?.lon) || 79.5]} zoom={7} style={{ height: '60vh', width: '100%' }} scrollWheelZoom>
                    <TileLayer attribution="&copy; OpenStreetMap" url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                    <GeoJSON data={weightageFC} pointToLayer={pointToLayer} onEachFeature={onEachFeature} />
                  </MapContainer>
                ) : (
                  <div className="p-4 text-sm text-gray-600">No weightage map found. Go to Site Selection and click Calculate Score to generate it.</div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
