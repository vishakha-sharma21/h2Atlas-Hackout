import React, { useEffect, useRef, useState, useMemo } from "react";
import { MapContainer, TileLayer, GeoJSON, useMap, Pane } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { fetchNearbyTransport, formatSummaryHTML } from "../utils/overpass.js";

// Bounding box data for map centering
const INDIA_LOCATIONS = {
  "All India": { lat: 23.4, lng: 79.5, zoom: 4 },
  "Andhra Pradesh": { lat: 15.9129, lng: 79.7400, zoom: 6 },
  "Arunachal Pradesh": { lat: 28.2178, lng: 94.7278, zoom: 7 },
  "Assam": { lat: 26.2006, lng: 92.9376, zoom: 7 },
  "Bihar": { lat: 25.0961, lng: 85.3131, zoom: 7 },
  "Chhattisgarh": { lat: 21.2787, lng: 81.8661, zoom: 6 },
  "Goa": { lat: 15.2993, lng: 74.1240, zoom: 9 },
  "Gujarat": { lat: 22.2587, lng: 71.1924, zoom: 6 },
  "Haryana": { lat: 29.0588, lng: 76.0856, zoom: 7 },
  "Himachal Pradesh": { lat: 31.1048, lng: 77.1734, zoom: 7 },
  "Jharkhand": { lat: 23.6102, lng: 85.2799, zoom: 7 },
  "Karnataka": { lat: 15.3173, lng: 75.7139, zoom: 6 },
  "Kerala": { lat: 10.8505, lng: 76.2711, zoom: 7 },
  "Madhya Pradesh": { lat: 22.9734, lng: 78.6569, zoom: 6 },
  "Maharashtra": { lat: 19.7515, lng: 75.7139, zoom: 6 },
  "Manipur": { lat: 24.6637, lng: 93.9063, zoom: 8 },
  "Meghalaya": { lat: 25.4670, lng: 91.8767, zoom: 8 },
  "Mizoram": { lat: 23.1645, lng: 92.9376, zoom: 8 },
  "Nagaland": { lat: 26.1584, lng: 94.5624, zoom: 8 },
  "Odisha": { lat: 20.9517, lng: 85.0985, zoom: 6 },
  "Punjab": { lat: 31.1471, lng: 75.3412, zoom: 7 },
  "Rajasthan": { lat: 27.0238, lng: 74.2179, zoom: 6 },
  "Sikkim": { lat: 27.5330, lng: 88.5122, zoom: 9 },
  "Tamil Nadu": { lat: 11.1271, lng: 78.6569, zoom: 6 },
  "Telangana": { lat: 18.1124, lng: 79.0193, zoom: 6 },
  "Tripura": { lat: 23.9408, lng: 91.9882, zoom: 8 },
  "Uttar Pradesh": { lat: 26.8467, lng: 80.9462, zoom: 6 },
  "Uttarakhand": { lat: 30.0668, lng: 79.0193, zoom: 7 },
  "West Bengal": { lat: 22.9868, lng: 87.8549, zoom: 6 },
  "Andaman and Nicobar Islands": { lat: 11.7401, lng: 92.6586, zoom: 6 },
  "Chandigarh": { lat: 30.7333, lng: 76.7794, zoom: 12 },
  "Dadra and Nagar Haveli and Daman and Diu": { lat: 20.1809, lng: 73.0169, zoom: 9 },
  "Delhi": { lat: 28.7041, lng: 77.1025, zoom: 10 },
  "Jammu and Kashmir": { lat: 33.7782, lng: 76.5762, zoom: 6 },
  "Ladakh": { lat: 34.1526, lng: 77.5771, zoom: 6 },
  "Lakshadweep": { lat: 10.5667, lng: 72.6417, zoom: 8 },
  "Puducherry": { lat: 11.9416, lng: 79.8083, zoom: 10 }
};

// Helper component to update the map view based on props
const ChangeMapView = ({ center, zoom }) => {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom, map]);
  return null;
};

// Convert any feature geometry to Point features
// - Point: keep as is
// - MultiPoint: explode into multiple points
// - Polygon/MultiPolygon/LineString/MultiLineString: use bounds center
const toPointFeatureCollection = (geojson) => {
  if (!geojson || !Array.isArray(geojson.features)) return { type: "FeatureCollection", features: [] };
  const out = [];
  for (const f of geojson.features) {
    const g = f.geometry || {};
    const t = g.type;
    const props = f.properties || {};
    try {
      if (t === "Point" && Array.isArray(g.coordinates) && g.coordinates.length >= 2) {
        out.push({ type: "Feature", properties: props, geometry: { type: "Point", coordinates: [g.coordinates[0], g.coordinates[1]] } });
        continue;
      }
      if (t === "MultiPoint" && Array.isArray(g.coordinates)) {
        for (const c of g.coordinates) {
          if (Array.isArray(c) && c.length >= 2) {
            out.push({ type: "Feature", properties: props, geometry: { type: "Point", coordinates: [c[0], c[1]] } });
          }
        }
        continue;
      }
      // Fallback: use bounds center
      const layer = L.geoJSON(f);
      const center = layer.getBounds().getCenter();
      const lng = center?.lng ?? 0;
      const lat = center?.lat ?? 0;
      out.push({ type: "Feature", properties: props, geometry: { type: "Point", coordinates: [lng, lat] } });
    } catch (e) {
      out.push({ type: "Feature", properties: props, geometry: { type: "Point", coordinates: [0, 0] } });
    }
  }
  return { type: "FeatureCollection", features: out };
};

// Main map component
export default function IndiaMap({ selectedState, layers = [], modes = [], onNearest }) {
  const location = INDIA_LOCATIONS[selectedState] || INDIA_LOCATIONS["All India"];
  const stateCenter = useMemo(() => [location.lat, location.lng], [selectedState]);
  
  const [zoom, setZoom] = useState(location.zoom);
  const MIN_ICON_ZOOM = 10;
  const [map, setMap] = useState(null);

  // Watch zoom changes
  const ZoomWatcher = ({ onChange }) => {
    const map = useMap();
    useEffect(() => { onChange(map.getZoom()); }, [map, onChange]);
    useEffect(() => {
      const handler = () => onChange(map.getZoom());
      map.on('zoomend', handler);
      return () => map.off('zoomend', handler);
    }, [map, onChange]);
    return null;
  };

  // Only recenter when selected state actually changes
  useEffect(() => {
    if (!map) return;
    map.flyTo(stateCenter, location.zoom, { duration: 0.6 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedState, map]);

  // Removed POI icon overlay and icon factory per user request

  // Function to get style for plants
  const getPlantStyle = (feature) => {
    const fuel = feature.properties.fuel1;
    let color = "gray";
    if (fuel === "Solar") color = "orange";
    if (fuel === "Wind") color = "blue";

    return {
      radius: 8,
      fillColor: color,
      color: "#000",
      weight: 1,
      opacity: 1,
      fillOpacity: 0.8,
    };
  };

  // Function to get style for demands
  const getDemandStyle = () => {
    return {
      radius: 9,
      fillColor: "red",
      color: "#000",
      weight: 1,
      opacity: 1,
      fillOpacity: 0.8,
    };
  };

  // Function to get style for hydrogen plants
  const getHydrogenStyle = () => {
    return {
      radius: 9,
      fillColor: "#2ecc71", // green
      color: "#000",
      weight: 1,
      opacity: 1,
      fillOpacity: 0.85,
    };
  };

  const onEachFeatureByType = (layerName, feature, layer) => {
    const p = feature.properties || {};
    let title = "Feature";
    let details = "";

    // Helper to format lines only when values exist
    const addLine = (label, value) => (value !== undefined && value !== null && `${label}: ${value}`);

    if (layerName === "plants") {
      title = p.name || "Plant";
      const fuel = p.fuel1 || p.fuel || "Unknown";
      const cap = p.capacity_mw ?? p.capacity;
      const owner = p.owner;
      const lines = [
        addLine("Fuel", fuel),
        addLine("Capacity", cap !== undefined ? `${cap} MW` : undefined),
        addLine("Owner", owner),
      ].filter(Boolean);
      details = lines.join("<br/>");
    } else if (layerName === "hydrogen") {
      title = p.name || p.project || "Hydrogen Plant";
      const cap = p.capacity_mw ?? p.capacity;
      const status = p.status;
      const owner = p.owner;
      const lines = [
        addLine("Capacity", cap !== undefined ? `${cap} MW` : undefined),
        addLine("Status", status),
        addLine("Owner", owner),
      ].filter(Boolean);
      details = lines.join("<br/>");
    } else if (layerName === "demands") {
      // Show only key fields instead of full JSON
      title = p.name || "Demand Node";
      const fuel = [p.fuel1, p.fuel2, p.fuel3, p.fuel4].filter(Boolean).join(", ");
      const cap = p.capacity_mw ?? p.capacity;
      const owner = p.owner;
      const year = p.commissioning_year ?? p.year;
      const lines = [
        addLine("Owner", owner),
        addLine("Fuel", fuel || undefined),
        addLine("Capacity", cap !== undefined ? `${cap} MW` : undefined),
        addLine("Commissioned", year),
        addLine("ID", p.gppd_idnr),
      ].filter(Boolean);
      details = lines.join("<br/>");
    }
    const basePopup = `<b>${title}</b>${details ? `<br/>${details}` : ""}`;
    // initial popup with loading placeholder for nearest transport only
    const initial = `${basePopup}<br/><div style="margin-top:6px"><b>Nearest transport</b></div><div class="nearby-transport">Loading…</div>`;
    layer.bindPopup(initial);

    layer.on('click', async () => {
      try {
        // Prefer actual marker position for reliability
        const ll = typeof layer.getLatLng === 'function' ? layer.getLatLng() : null;
        const lat = ll?.lat;
        const lng = ll?.lng;
        if (lat == null || lng == null) throw new Error('No coordinates');
        // Zoom/fly to the clicked feature so icons become visible
        if (map) {
          const current = map.getZoom ? map.getZoom() : (zoom || MIN_ICON_ZOOM);
          const targetZoom = Math.min(15, Math.max(current + 3, MIN_ICON_ZOOM + 2));
          map.flyTo([lat, lng], targetZoom, { duration: 0.8 });
        }
        const summary = await fetchNearbyTransport({ lat, lon: lng, radiusKm: 25, modes });
        const html = `${basePopup}<br/><div style="margin-top:6px"><b>Nearest transport</b></div>${formatSummaryHTML(summary, modes)}`;
        layer.setPopupContent(html);
        // Notify parent (Preferences) so it can render nearest names above the map
        if (typeof onNearest === 'function') {
          try { onNearest(summary); } catch {}
        }
      } catch (e) {
        const fallback = `${basePopup}<br/><div style=\"margin-top:6px\"><b>Nearest transport</b></div><div class=\"nearby-transport\">Temporarily unavailable</div>`;
        try { layer.setPopupContent(fallback); } catch {}
      }
    });
  };

  return (
    <MapContainer
      center={stateCenter}
      zoom={location.zoom}
      style={{ height: "90vh", width: "100%" }}
      whenCreated={setMap}
      scrollWheelZoom={true}
      zoomSnap={0.25}
      zoomDelta={0.5}
      wheelDebounceTime={20}
      wheelPxPerZoomLevel={60}
    >
      <TileLayer
        attribution="&copy; OpenStreetMap contributors"
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {/* Removed ChangeMapView to prevent unintended resets on re-render */}
      <ZoomWatcher onChange={setZoom} />

      {/* Dedicated panes for z-index ordering so markers don't obscure each other */}
      <Pane name="demands-pane" style={{ zIndex: 402 }} />
      <Pane name="plants-pane" style={{ zIndex: 403 }} />
      <Pane name="hydrogen-pane" style={{ zIndex: 404 }} />
      <Pane name="transport-pane" style={{ zIndex: 450 }} />

      {layers.map((layer) => {
        if (!layer.data) return null;

        // Choose style based on layer
        let styleFunction = getDemandStyle;
        if (layer.name === "plants") styleFunction = getPlantStyle;
        if (layer.name === "hydrogen") styleFunction = getHydrogenStyle;

        // Ensure everything is rendered as points
        const dataAsPoints = toPointFeatureCollection(layer.data);

        // Assign each GeoJSON to a pane for proper stacking order
        const paneName = layer.name === "plants" ? "plants-pane" : layer.name === "hydrogen" ? "hydrogen-pane" : "demands-pane";
        return (
          <GeoJSON
            key={`${layer.name}-${selectedState}`}
            data={dataAsPoints}
            pane={paneName}
            pointToLayer={(feature, latlng) => L.circleMarker(latlng, styleFunction(feature))}
            onEachFeature={(feature, lyr) => onEachFeatureByType(layer.name, feature, lyr)}
          />
        );
      })}

      {/* Removed transport POI icons overlay per user request */}
    </MapContainer>
  );
}