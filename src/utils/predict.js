// src/utils/predict.js
// Minimal client-side suitability predictor for Solar and Wind in India
// - Uses NASA POWER API (no key) for resource
// - Uses Overpass API (no key) for proximity to roads and grid
// - Produces simple scores and suggested points around a center

const OVERPASS_ENDPOINTS = [
  'https://overpass.kumi.systems/api/interpreter',
  'https://overpass-api.nextzen.org/api/interpreter',
  'https://overpass-api.de/api/interpreter',
];

function toRad(d) { return (d * Math.PI) / 180; }
function haversineKm(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a = Math.sin(dLat/2)**2 + Math.cos(toRad(lat1))*Math.cos(toRad(lat2))*Math.sin(dLon/2)**2;
  return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)));
}

function offsetLatLng(lat, lon, dNorthKm, dEastKm) {
  const dLat = dNorthKm / 111.32; // km per degree
  const dLon = dEastKm / (111.32 * Math.cos(toRad(lat)));
  return { lat: lat + dLat, lon: lon + dLon };
}

async function fetchNASAResource(lat, lon, type) {
  // Climatology monthly means; we aggregate to annual average
  const params = type === 'solar' ? 'ALLSKY_SFC_SW_DWN,T2M' : 'WS50M,WS10M';
  const url = `https://power.larc.nasa.gov/api/temporal/climatology/point?parameters=${params}&community=RE&longitude=${lon}&latitude=${lat}&format=JSON`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('NASA POWER request failed');
  const json = await res.json();
  const md = json?.properties?.parameter || {};
  if (type === 'solar') {
    const ghiMonthly = md.ALLSKY_SFC_SW_DWN || {};
    const months = Object.values(ghiMonthly);
    const ghi = months.length ? months.reduce((a,b)=>a+b,0)/months.length : 0; // kWh/m2/day
    const tMonthly = md.T2M || {};
    const tMonths = Object.values(tMonthly);
    const tavg = tMonths.length ? tMonths.reduce((a,b)=>a+b,0)/tMonths.length : null; // C
    return { ghi, tavg };
  } else {
    const v50 = md.WS50M ? Object.values(md.WS50M) : [];
    const v10 = md.WS10M ? Object.values(md.WS10M) : [];
    const ws50 = v50.length ? (v50.reduce((a,b)=>a+b,0)/v50.length) : null;
    const ws10 = v10.length ? (v10.reduce((a,b)=>a+b,0)/v10.length) : null;
    // Extrapolate to 100 m using 1/7th power law if needed
    let wind100 = null;
    if (ws50 != null) wind100 = ws50 * Math.pow(100/50, 1/7);
    else if (ws10 != null) wind100 = ws10 * Math.pow(100/10, 1/7);
    else wind100 = 0;
    return { wind100, ws50: ws50 ?? null, ws10: ws10 ?? null }; // m/s
  }
}

async function fetchProximities(lat, lon) {
  const R = 50000; // 50 km search
  const query = `
    [out:json][timeout:25];
    (
      nwr(around:${R},${lat},${lon})[power~"^(line|substation)$"];
      nwr(around:${R},${lat},${lon})[highway];
    );
    out center 200;
  `;
  let lastErr;
  for (const ep of OVERPASS_ENDPOINTS) {
    try {
      const res = await fetch(ep, { method: 'POST', headers: { 'Content-Type': 'text/plain' }, body: query });
      if (!res.ok) throw new Error(`Overpass HTTP ${res.status}`);
      const data = await res.json();
      const elems = Array.isArray(data.elements) ? data.elements : [];
      let dGrid = Infinity, dRoad = Infinity;
      for (const el of elems) {
        const tags = el.tags || {};
        let lat2 = el.lat, lon2 = el.lon;
        if ((lat2 == null || lon2 == null) && el.center) { lat2 = el.center.lat; lon2 = el.center.lon; }
        if (lat2 == null || lon2 == null) continue;
        const d = haversineKm(lat, lon, lat2, lon2);
        if (tags.power === 'line' || tags.power === 'substation') dGrid = Math.min(dGrid, d);
        if ('highway' in tags) dRoad = Math.min(dRoad, d);
      }
      return { distGridKm: Number.isFinite(dGrid) ? dGrid : null, distRoadKm: Number.isFinite(dRoad) ? dRoad : null };
    } catch (e) { lastErr = e; }
  }
  throw lastErr || new Error('Overpass request failed');
}

function scoreSolar({ ghi, tavg, distGridKm, distRoadKm }) {
  // Resource 65% (4.5→6.5)
  const res = Math.max(0, Math.min(1, (ghi - 4.5) / 2.0));
  // Grid 25%: 100% at <=5 km, 0% at >=30 km
  const sg = distGridKm == null ? 0 : Math.max(0, Math.min(1, (30 - distGridKm) / 25));
  // Road 10%: 100% at <=3 km, 0% at >=15 km
  const sr = distRoadKm == null ? 0 : Math.max(0, Math.min(1, (15 - distRoadKm) / 12));
  // Temperature penalty if extremely hot
  const pen = tavg != null && tavg > 35 ? 0.08 : 0;
  const score = (res * 0.65 + sg * 0.25 + sr * 0.10) * (1 - pen);
  return Math.round(score * 100);
}

function scoreWind({ wind100, distGridKm, distRoadKm }) {
  // Wind 75% (6.0→8.5 m/s) at 100 m
  const res = Math.max(0, Math.min(1, (wind100 - 6.0) / 2.5));
  // Grid 20% (<=10 km -> 100%, >=50 km -> 0%)
  const sg = distGridKm == null ? 0 : Math.max(0, Math.min(1, (50 - distGridKm) / 40));
  // Road 5% (<=10 km -> 100%, >=30 km -> 0%)
  const sr = distRoadKm == null ? 0 : Math.max(0, Math.min(1, (30 - distRoadKm) / 20));
  const score = (res * 0.75 + sg * 0.20 + sr * 0.05);
  return Math.round(score * 100);
}

export async function predictSuitabilityAt({ lat, lon, type }) {
  const res = await fetchNASAResource(lat, lon, type);
  const prox = await fetchProximities(lat, lon);
  if (type === 'solar') {
    const score = scoreSolar({ ghi: res.ghi, tavg: res.tavg, ...prox });
    return { lat, lon, type, score, ghi: res.ghi, tavg: res.tavg, ...prox };
  } else {
    const score = scoreWind({ wind100: res.wind100, ...prox });
    return { lat, lon, type, score, wind100: res.wind100, ...prox };
  }
}

export function sampleGridAround(centerLat, centerLon, spacingKm = 60, count = 9) {
  // 3x3 grid by default, returns center + cell polygon (rectangle) for each sample
  const points = [];
  const offsets = [-spacingKm, 0, spacingKm];
  const half = spacingKm / 2;
  for (const dn of offsets) {
    for (const de of offsets) {
      const { lat, lon } = offsetLatLng(centerLat, centerLon, dn, de);
      // Rectangle corners (NW, NE, SE, SW, back to NW)
      const nw = offsetLatLng(lat, lon, +half, -half);
      const ne = offsetLatLng(lat, lon, +half, +half);
      const se = offsetLatLng(lat, lon, -half, +half);
      const sw = offsetLatLng(lat, lon, -half, -half);
      const polygon = [ [nw.lat, nw.lon], [ne.lat, ne.lon], [se.lat, se.lon], [sw.lat, sw.lon], [nw.lat, nw.lon] ];
      points.push({ lat, lon, polygon });
    }
  }
  return points.slice(0, count);
}

export async function generatePredictions({ centerLat, centerLon, type = 'solar' }) {
  const pts = sampleGridAround(centerLat, centerLon, 60, 9);
  const results = await Promise.all(pts.map(p => predictSuitabilityAt({ lat: p.lat, lon: p.lon, type }).then(r => ({ ...r, polygon: p.polygon }))));
  results.sort((a, b) => b.score - a.score);
  return results;
}

export async function generatePredictionsMulti({ centerLat, centerLon, types = ['solar','wind'] }) {
  const out = {};
  for (const t of types) {
    // eslint-disable-next-line no-await-in-loop
    out[t] = await generatePredictions({ centerLat, centerLon, type: t });
  }
  return out;
}
