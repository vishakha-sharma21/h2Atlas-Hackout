// src/pages/Predict.jsx
import React, { useCallback, useMemo, useState } from 'react';
import { MapContainer, TileLayer, Pane, Polygon, Popup, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { generatePredictions, generatePredictionsMulti } from '../utils/predict.js';
import { useNavigate } from 'react-router-dom';

const INDIA_DEFAULT = { center: [23.4, 79.5], zoom: 5 };

function ClickToPredict({ types, onResults, setBusy }) {
  useMapEvents({
    click: async (e) => {
      try {
        setBusy(true);
        const lat = e.latlng.lat;
        const lon = e.latlng.lng;
        const active = types.length ? types : ['solar'];
        const multi = await generatePredictionsMulti({ centerLat: lat, centerLon: lon, types: active });
        onResults(multi, { lat, lon });
      } catch (err) {
        console.error('Prediction error:', err);
        onResults({ solar: [], wind: [] }, null);
      } finally {
        setBusy(false);
      }
    },
  });
  return null;
}

export default function Predict() {
  const navigate = useNavigate();
  const [selections, setSelections] = useState(['solar']); // array of 'solar' | 'wind'
  const [busy, setBusy] = useState(false);
  const [center, setCenter] = useState(null);
  const [predsByType, setPredsByType] = useState({ solar: [], wind: [] });

  const colors = useMemo(() => ({ solar: '#f59e0b', wind: '#3b82f6' }), []);

  const onResults = useCallback((results, c) => {
    setPredsByType({ solar: results.solar || [], wind: results.wind || [] });
    setCenter(c);
  }, []);

  const toggleType = (t) => {
    setSelections((prev) => {
      const s = new Set(prev);
      if (s.has(t)) s.delete(t); else s.add(t);
      const arr = Array.from(s);
      return arr.length ? arr : ['solar'];
    });
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA]">
      <header className="sticky top-0 z-[1100] bg-[#1A202C] text-white shadow-md">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-[#4A90E2]" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L12 10.75M12 10.75L14.25 17M12 10.75V3M21 12c0-4.97-4.03-9-9-9S3 7.03 3 12s4.03 9 9 9 9-4.03 9-9z"/></svg>
            <span className="font-bold">Predict</span>
          </div>
          <div className="flex gap-2">
            <button onClick={()=>navigate('/preferences')} className="bg-gray-700 hover:bg-gray-800 text-gray-200 text-sm px-4 py-2 rounded-md transition-colors">Preferences</button>
            <button onClick={()=>navigate('/')} className="bg-gray-700 hover:bg-gray-800 text-gray-200 text-sm px-4 py-2 rounded-md transition-colors">Home</button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 pt-6 pb-8">
        <div className="mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-700">Mode(s)</span>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" name="ptype_solar" checked={selections.includes('solar')} onChange={()=>toggleType('solar')} />
              <span>Solar</span>
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" name="ptype_wind" checked={selections.includes('wind')} onChange={()=>toggleType('wind')} />
              <span>Wind</span>
            </label>
          </div>
          <div className="text-xs text-gray-600">
            Click anywhere on the map to sample a 3x3 grid (~60 km spacing). Higher scores are better. Areas are colored by score.
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-10 gap-6 items-start">
          <div className="md:col-span-7 border border-gray-200 rounded-md overflow-hidden relative">
            {busy && (
              <div className="absolute z-[1000] top-2 right-2 bg-white/90 px-3 py-1 rounded text-sm shadow">Predicting…</div>
            )}
            <MapContainer center={INDIA_DEFAULT.center} zoom={INDIA_DEFAULT.zoom} style={{ height: '80vh', width: '100%' }} scrollWheelZoom>
              <TileLayer attribution="&copy; OpenStreetMap" url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              <ClickToPredict types={selections} onResults={onResults} setBusy={setBusy} />
              <Pane name="predict-pane" style={{ zIndex: 460 }} />
              {/* Solar layer */}
              {selections.includes('solar') && predsByType.solar.map((p, idx) => {
                const fillOpacity = Math.max(0.2, Math.min(0.9, p.score/100));
                return (
                  <Polygon key={`solar-${idx}`} positions={p.polygon} pathOptions={{ color: '#78350f', weight: 1, fillColor: colors.solar, fillOpacity }}>
                    <Popup>
                      <div>
                        <b>
                          <abbr title="Composite solar site suitability score. 0 = poor, 100 = excellent (higher is better).">Solar Suitability</abbr>
                          {" "}(Score 0–100)
                        </b><br/>
                        Lat, Lon: {p.lat.toFixed(3)}°, {p.lon.toFixed(3)}°<br/>
                        <abbr title="Combined metric from multiple inputs; higher is better.">Score</abbr>: {p.score}/100<br/>
                        <abbr title="Global Horizontal Irradiance: average solar energy on a horizontal surface. Higher GHI indicates better solar resource (kWh per m² per day).">GHI</abbr>: {p.ghi != null ? `${p.ghi.toFixed(2)} kWh/m²/day` : 'n/a'}<br/>
                        <abbr title="Great‑circle distance to the nearest mapped power line/substation (OSM). Shorter is better for grid connection.">Grid distance</abbr>: {p.distGridKm != null ? `${p.distGridKm.toFixed(1)} km` : 'n/a'}<br/>
                        <abbr title="Great‑circle distance to the nearest mapped roadway (OSM). Shorter is better for logistics and access.">Road distance</abbr>: {p.distRoadKm != null ? `${p.distRoadKm.toFixed(1)} km` : 'n/a'}
                      </div>
                    </Popup>
                  </Polygon>
                );
              })}
              {/* Wind layer */}
              {selections.includes('wind') && predsByType.wind.map((p, idx) => {
                const fillOpacity = Math.max(0.2, Math.min(0.9, p.score/100));
                return (
                  <Polygon key={`wind-${idx}`} positions={p.polygon} pathOptions={{ color: '#1e3a8a', weight: 1, fillColor: colors.wind, fillOpacity }}>
                    <Popup>
                      <div>
                        <b>
                          <abbr title="Composite wind site suitability score. 0 = poor, 100 = excellent (higher is better).">Wind Suitability</abbr>
                          {" "}(Score 0–100)
                        </b><br/>
                        Lat, Lon: {p.lat.toFixed(3)}°, {p.lon.toFixed(3)}°<br/>
                        <abbr title="Combined metric from multiple inputs; higher is better.">Score</abbr>: {p.score}/100<br/>
                        <abbr title="Estimated mean wind speed at 100 meters above ground (hub height). Higher speeds are better (m/s).">Wind @100 m</abbr>: {p.wind100 != null ? `${p.wind100.toFixed(2)} m/s` : 'n/a'}<br/>
                        <abbr title="Great‑circle distance to the nearest mapped power line/substation (OSM). Shorter is better for grid connection.">Grid distance</abbr>: {p.distGridKm != null ? `${p.distGridKm.toFixed(1)} km` : 'n/a'}<br/>
                        <abbr title="Great‑circle distance to the nearest mapped roadway (OSM). Shorter is better for logistics and access.">Road distance</abbr>: {p.distRoadKm != null ? `${p.distRoadKm.toFixed(1)} km` : 'n/a'}
                      </div>
                    </Popup>
                  </Polygon>
                );
              })}
            </MapContainer>
          </div>
          <div className="md:col-span-3">
            <div className="p-4 border rounded-md bg-white">
              <div className="text-sm font-medium text-gray-800 mb-2">Top Sites</div>
              {/* Solar list */}
              {selections.includes('solar') && (
                <div className="mb-3">
                  <div className="text-xs text-gray-600 mb-1">Solar (GHI in kWh/m²/day)</div>
                  <div className="space-y-1 text-sm">
                    {predsByType.solar.slice(0,5).map((p, i) => (
                      <div key={`sol-${i}`} className="flex items-center justify-between">
                        <span>#{i+1} • {p.lat.toFixed(2)}°, {p.lon.toFixed(2)}°</span>
                        <span className="font-semibold" style={{color: colors.solar}}>{p.score}</span>
                      </div>
                    ))}
                    {predsByType.solar.length === 0 && <div className="text-gray-500">No solar cells yet.</div>}
                  </div>
                </div>
              )}
              {/* Wind list */}
              {selections.includes('wind') && (
                <div className="mb-1">
                  <div className="text-xs text-gray-600 mb-1">Wind (speed at 100 m in m/s)</div>
                  <div className="space-y-1 text-sm">
                    {predsByType.wind.slice(0,5).map((p, i) => (
                      <div key={`wnd-${i}`} className="flex items-center justify-between">
                        <span>#{i+1} • {p.lat.toFixed(2)}°, {p.lon.toFixed(2)}°</span>
                        <span className="font-semibold" style={{color: colors.wind}}>{p.score}</span>
                      </div>
                    ))}
                    {predsByType.wind.length === 0 && <div className="text-gray-500">No wind cells yet.</div>}
                  </div>
                </div>
              )}
            </div>
            <div className="mt-3 text-xs text-gray-600">
              Scoring uses NASA POWER (GHI; wind extrapolated to 100 m) and OSM proximities (no API keys). Distances are great-circle.
              {center && (
                <div className="mt-2">Last click center: {center.lat.toFixed(3)}°, {center.lon.toFixed(3)}°</div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
