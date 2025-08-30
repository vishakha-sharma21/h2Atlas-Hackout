// src/utils/overpass.js
// Lightweight Overpass client without API keys. Caches results and has endpoint fallback.

const ENDPOINTS = [
  'https://overpass.kumi.systems/api/interpreter',
  'https://overpass-api.de/api/interpreter',
  'https://lz4.overpass-api.de/api/interpreter',
  'https://overpass.openstreetmap.fr/api/interpreter',
];

// In-memory cache: key -> { ts, data }
const CACHE = new Map();
const DEFAULT_TTL_MS = 15 * 60 * 1000; // 15 minutes

function haversineKm(lat1, lon1, lat2, lon2) {
  const toRad = (d) => (d * Math.PI) / 180;
  const R = 6371; // km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Normalize modes array to a canonical list used in categorization
export const ALL_MODES = ['Railways','Roadways','Airways','Waterways','Metro','Pipelines','SeaPorts'];

function normalizeModes(modes) {
  if (!Array.isArray(modes) || modes.length === 0 || modes.includes('All')) return ALL_MODES;
  return ALL_MODES.filter((m) => modes.includes(m));
}

function buildQuery(lat, lon, radiusKm, modes) {
  const R = Math.max(1, Math.min(200, Math.round(Number(radiusKm) || 25))) * 1000; // meters
  // Broad tag families per mode. We intentionally query broad families and categorize client-side.
  const blocks = [];
  if (modes.includes('Railways')) {
    blocks.push(`nwr(around:${R},${lat},${lon})[railway];`);
  }
  if (modes.includes('Roadways')) {
    // For summary, focus on roadways (highway=*). We omit bus stops/stations to prefer highway refs like NH10/NH12.
    blocks.push(`nwr(around:${R},${lat},${lon})[highway];`);
  }
  if (modes.includes('Airways')) {
    blocks.push(`nwr(around:${R},${lat},${lon})[aeroway];`);
  }
  if (modes.includes('Waterways')) {
    blocks.push(`nwr(around:${R},${lat},${lon})[amenity=ferry_terminal]; nwr(around:${R},${lat},${lon})[waterway];`);
  }
  if (modes.includes('Metro')) {
    blocks.push(`nwr(around:${R},${lat},${lon})[railway=subway_entrance]; nwr(around:${R},${lat},${lon})[station=subway];`);
  }
  if (modes.includes('Pipelines')) {
    blocks.push(`nwr(around:${R},${lat},${lon})[man_made=pipeline];`);
  }
  if (modes.includes('SeaPorts')) {
    blocks.push(`nwr(around:${R},${lat},${lon})[harbour];
      nwr(around:${R},${lat},${lon})[landuse=harbour];
      nwr(around:${R},${lat},${lon})["seamark:type"="harbour"];
      nwr(around:${R},${lat},${lon})["seamark:harbour"];
      nwr(around:${R},${lat},${lon})[man_made=pier];
      nwr(around:${R},${lat},${lon})[amenity=ferry_terminal];`);
  }
  if (blocks.length === 0) return null;

  return `
    [out:json][timeout:25];
    (
      ${blocks.join('\n')}
    );
    out center;
  `;
}

function categorizeElement(el) {
  const tags = el.tags || {};
  // Determine lat/lon
  let lat = el.lat, lon = el.lon;
  if ((lat == null || lon == null) && el.center) { lat = el.center.lat; lon = el.center.lon; }

  // Mode flags
  
  // Category membership by tags
  const isRail = 'railway' in tags;
  const isRoad = 'highway' in tags || tags.amenity === 'bus_station' || tags.amenity === 'bus_stop';
  const isAir = 'aeroway' in tags;
  const isWater = tags.amenity === 'ferry_terminal' || 'waterway' in tags;
  const isMetro = tags.railway === 'subway_entrance' || tags.station === 'subway';
  const isPipe = tags.man_made === 'pipeline';
  const isSea = (
    ('harbour' in tags) ||
    tags.landuse === 'harbour' ||
    tags['seamark:type'] === 'harbour' ||
    ('seamark:harbour' in tags) ||
    Object.keys(tags).some(k => k.startsWith('seamark:harbour')) ||
    tags.man_made === 'pier' ||
    tags.amenity === 'ferry_terminal'
  );

  // Prefer ref for highways (e.g., NH10), otherwise use name; per mode fallbacks
  const getDisplayName = () => {
    if (isRoad && 'highway' in tags) {
      const label = (
        tags.ref || tags.nat_ref || tags.int_ref || tags['ref:IN'] ||
        tags.name || tags['official_name'] || tags['name:en'] || tags.short_name || ''
      );
      return label || (tags.highway ? `Highway (${tags.highway})` : 'Highway');
    }
    if (isRail) return tags.name || tags.ref || '';
    if (isAir) return tags.name || tags.ref || tags.iata || tags.icao || '';
    if (isWater) return tags.name || '';
    if (isMetro) return tags.name || '';
    if (isPipe) return tags.name || tags.ref || '';
    if (isSea) return tags.name || tags['seamark:name'] || tags['official_name'] || tags.ref || '';
    return tags.name || tags.ref || '';
  };
  const name = getDisplayName();

  const modes = [];
  if (isRail) modes.push('Railways');
  if (isRoad) modes.push('Roadways');
  if (isAir) modes.push('Airways');
  if (isWater) modes.push('Waterways');
  if (isMetro) modes.push('Metro');
  if (isPipe) modes.push('Pipelines');
  if (isSea) modes.push('SeaPorts');

  return { modes, lat, lon, name };
}

function summarizeByMode(originLat, originLon, modes, elements) {
  const init = Object.fromEntries(ALL_MODES.map(m => [m, { count: 0, nearestKm: null, nearestName: '' }]));
  const acc = { ...init };
  for (const el of elements) {
    const cat = categorizeElement(el);
    if (!cat.lat || !cat.lon || cat.modes.length === 0) continue;
    for (const m of cat.modes) {
      if (!modes.includes(m)) continue;
      const d = haversineKm(originLat, originLon, cat.lat, cat.lon);
      const s = acc[m];
      s.count += 1;
      if (s.nearestKm == null || d < s.nearestKm) {
        s.nearestKm = d;
        // If closer item lacks a name, keep the previously found name so UI shows a meaningful label
        s.nearestName = cat.name || s.nearestName || '';
      }
    }
  }
  return acc;
}

export async function fetchNearbyTransport({ lat, lon, radiusKm = 25, modes = [] }) {
  const m = normalizeModes(modes);
  const key = `${lat.toFixed(4)},${lon.toFixed(4)}:${radiusKm}:${m.join(',')}`;
  const now = Date.now();
  const cached = CACHE.get(key);
  if (cached && (now - cached.ts) < DEFAULT_TTL_MS) return cached.data;

  const query = buildQuery(lat, lon, radiusKm, m);
  if (!query) return Object.fromEntries(ALL_MODES.map(x => [x, { count: 0, nearestKm: null, nearestName: '' }]))

  let lastErr;
  for (const ep of ENDPOINTS) {
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 10000);
      const res = await fetch(ep, { method: 'POST', body: query, headers: { 'Content-Type': 'text/plain' }, signal: controller.signal });
      clearTimeout(timer);
      if (!res.ok) throw new Error(`Overpass HTTP ${res.status}`);
      const data = await res.json();
      const elems = Array.isArray(data.elements) ? data.elements : [];
      const summary = summarizeByMode(lat, lon, m, elems);
      CACHE.set(key, { ts: now, data: summary });
      return summary;
    } catch (e) {
      lastErr = e;
      // try next endpoint
    }
  }
  throw lastErr || new Error('Overpass request failed');
}

export function formatSummaryHTML(summary, modes) {
  const m = normalizeModes(modes);
  const parts = [];
  for (const mode of m) {
    const s = summary[mode] || { nearestKm: null, nearestName: '' };
    if (s.nearestKm != null) {
      const dist = `${s.nearestKm.toFixed(1)} km`;
      const label = s.nearestName ? `${s.nearestName}` : 'Nearest station';
      parts.push(`<div><b>${mode}:</b> ${label} — ${dist}</div>`);
    } else {
      parts.push(`<div><b>${mode}:</b> —</div>`);
    }
  }
  return parts.join('');
}

// Build a narrower query for POIs only (to avoid returning dense ways like highways/railway tracks)
function buildPOIQuery(lat, lon, radiusKm, modes) {
  const R = Math.max(1, Math.min(100, Math.round(Number(radiusKm) || 15))) * 1000; // meters
  const blocks = [];
  if (modes.includes('Railways')) {
    blocks.push(`nwr(around:${R},${lat},${lon})[railway~"^(station|halt|stop|tram_stop)$"];`);
  }
  if (modes.includes('Roadways')) {
    blocks.push(`nwr(around:${R},${lat},${lon})[highway][ref];`);
  }
  if (modes.includes('Airways')) {
    blocks.push(`nwr(around:${R},${lat},${lon})[aeroway~"^(aerodrome|terminal|helipad)$"];`);
  }
  if (modes.includes('Waterways')) {
    blocks.push(`nwr(around:${R},${lat},${lon})[amenity=ferry_terminal];`);
  }
  if (modes.includes('Metro')) {
    blocks.push(`nwr(around:${R},${lat},${lon})[railway=subway_entrance]; nwr(around:${R},${lat},${lon})[station=subway];`);
  }
  if (modes.includes('Pipelines')) {
    blocks.push(`nwr(around:${R},${lat},${lon})[pipeline=station];`);
  }
  if (modes.includes('SeaPorts')) {
    blocks.push(`nwr(around:${R},${lat},${lon})[harbour];
      nwr(around:${R},${lat},${lon})[landuse=harbour];
      nwr(around:${R},${lat},${lon})["seamark:type"="harbour"];
      nwr(around:${R},${lat},${lon})["seamark:harbour"];
      nwr(around:${R},${lat},${lon})[man_made=pier];
      nwr(around:${R},${lat},${lon})[amenity=ferry_terminal];`);
  }
  if (blocks.length === 0) return null;
  return `
    [out:json][timeout:25];
    (
      ${blocks.join('\n')}
    );
    out center;
  `;
}

// Fetch nearby transport POI features appropriate for icon rendering
export async function fetchNearbyTransportFeatures({ lat, lon, radiusKm = 15, modes = [] }) {
  const m = normalizeModes(modes);
  const key = `pois:${lat.toFixed(4)},${lon.toFixed(4)}:${radiusKm}:${m.join(',')}`;
  const now = Date.now();
  const cached = CACHE.get(key);
  if (cached && (now - cached.ts) < DEFAULT_TTL_MS) return cached.data;

  const query = buildPOIQuery(lat, lon, radiusKm, m);
  if (!query) return [];

  let lastErr;
  for (const ep of ENDPOINTS) {
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 10000);
      const res = await fetch(ep, { method: 'POST', body: query, headers: { 'Content-Type': 'text/plain' }, signal: controller.signal });
      clearTimeout(timer);
      if (!res.ok) throw new Error(`Overpass HTTP ${res.status}`);
      const data = await res.json();
      const elems = Array.isArray(data.elements) ? data.elements : [];
      // Map to POIs with mode
      const out = [];
      for (const el of elems) {
        const cat = categorizeElement(el);
        if (!cat.lat || !cat.lon || cat.modes.length === 0) continue;
        for (const mode of cat.modes) {
          if (!m.includes(mode)) continue;
          out.push({ mode, lat: cat.lat, lon: cat.lon, name: cat.name || '' });
        }
      }
      // Sort by distance and limit per mode
      const grouped = new Map();
      for (const item of out) {
        const arr = grouped.get(item.mode) || [];
        arr.push(item); grouped.set(item.mode, arr);
      }
      const limited = [];
      for (const [mode, arr] of grouped.entries()) {
        arr.sort((a, b) => haversineKm(lat, lon, a.lat, a.lon) - haversineKm(lat, lon, b.lat, b.lon));
        limited.push(...arr.slice(0, 50));
      }
      CACHE.set(key, { ts: now, data: limited });
      return limited;
    } catch (e) {
      lastErr = e;
    }
  }
  throw lastErr || new Error('Overpass POI request failed');
}