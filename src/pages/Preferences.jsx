import React, { useMemo, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import IndiaMap from "../components/IndiaMap";

const INDIA_STATES = [
  "All India",
  "Andhra Pradesh","Arunachal Pradesh","Assam","Bihar","Chhattisgarh","Goa","Gujarat","Haryana","Himachal Pradesh","Jharkhand","Karnataka","Kerala","Madhya Pradesh","Maharashtra","Manipur","Meghalaya","Mizoram","Nagaland","Odisha","Punjab","Rajasthan","Sikkim","Tamil Nadu","Telangana","Tripura","Uttar Pradesh","Uttarakhand","West Bengal",
  "Andaman and Nicobar Islands","Chandigarh","Dadra and Nagar Haveli and Daman and Diu","Delhi","Jammu and Kashmir","Ladakh","Lakshadweep","Puducherry"
];

// Simplified bounding boxes for all states and UTs in India
const STATE_BOUNDS = {
  "All India": { minLat: 8.4, maxLat: 37.6, minLng: 68.7, maxLng: 97.2 },
  // ... (keep all your existing bounds here)
};

export default function Preferences() {
  const navigate = useNavigate();
  const initial = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("h2_filters") || "{}");
    } catch {
      return {};
    }
  }, []);

  const [stateVal, setStateVal] = useState(initial.state || "All India");
  const [layers, setLayers] = useState([]);

  // Fetch all GeoJSON data once when the component mounts
  useEffect(() => {
    const files = [
      { name: "plants", url: "/india_solar_wind.geojson" },
      { name: "demands", url: "/major_industrial_plants.geojson" }
    ];

    Promise.all(files.map(f => fetch(f.url).then(r => r.json())))
      .then(data => {
        setLayers(data.map((geo, i) => ({ name: files[i].name, data: geo })));
      })
      .catch(err => console.error("Error loading geojson files:", err));
  }, []);

  // Convert all geometries to points before filtering
  const toPointFeatureCollection = (geojson) => {
    if (!geojson || !Array.isArray(geojson.features)) return { type: "FeatureCollection", features: [] };
    const out = [];
    geojson.features.forEach(f => {
      const g = f.geometry;
      const props = f.properties || {};
      try {
        if (!g) return;
        if (g.type === "Point" && Array.isArray(g.coordinates) && g.coordinates.length >= 2) {
          out.push({ type: "Feature", properties: props, geometry: { type: "Point", coordinates: [...g.coordinates] } });
        } else if (g.type === "MultiPoint" && Array.isArray(g.coordinates)) {
          g.coordinates.forEach(c => { if (Array.isArray(c) && c.length >= 2) out.push({ type: "Feature", properties: props, geometry: { type: "Point", coordinates: c } }); });
        } else {
          const layer = L.geoJSON(f);
          const center = layer.getBounds().getCenter();
          out.push({ type: "Feature", properties: props, geometry: { type: "Point", coordinates: [center.lng, center.lat] } });
        }
      } catch (e) {
        out.push({ type: "Feature", properties: props, geometry: { type: "Point", coordinates: [0, 0] } });
      }
    });
    return { type: "FeatureCollection", features: out };
  };

  // Filter features by state bounds
  const filterGeoByState = (geojson, state) => {
    if (!geojson) return null;
    if (state === "All India") return geojson;

    const bounds = STATE_BOUNDS[state];
    if (!bounds) return { ...geojson, features: [] };

    const geoAsPoints = toPointFeatureCollection(geojson);
    const filtered = geoAsPoints.features.filter(f => {
      const [lng, lat] = f.geometry.coordinates;
      return lat >= bounds.minLat && lat <= bounds.maxLat && lng >= bounds.minLng && lng <= bounds.maxLng;
    });

    return { ...geojson, features: filtered };
  };

  const filteredLayers = useMemo(
    () =>
      layers.map(layerObj => ({
        name: layerObj.name,
        data: filterGeoByState(layerObj.data, stateVal)
      })),
    [layers, stateVal]
  );

  const onSubmit = e => {
    e.preventDefault();
    localStorage.setItem("h2_filters", JSON.stringify({ state: stateVal }));
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA]">
      <main className="max-w-5xl mx-auto px-6 py-10">
        <div className="bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden">
          <form onSubmit={onSubmit} className="p-6 space-y-8">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Region (State/UT)
              </label>
              <select
                className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#4A90E2]"
                value={stateVal}
                onChange={e => setStateVal(e.target.value)}
              >
                {INDIA_STATES.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            <div className="border border-gray-200 rounded-md overflow-hidden">
              {filteredLayers.length > 0 && (
                <IndiaMap selectedState={stateVal} layers={filteredLayers} />
              )}
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
