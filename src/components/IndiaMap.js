// src/components/IndiaMap.js
import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Pre-defined coordinates and zoom levels for Indian States and UTs
const INDIA_LOCATIONS = {
  'All India': { lat: 23.4, lng: 79.5, zoom: 4 },
  'Andhra Pradesh': { lat: 15.9129, lng: 79.7400, zoom: 6 },
  'Arunachal Pradesh': { lat: 28.2178, lng: 94.7278, zoom: 7 },
  'Assam': { lat: 26.2006, lng: 92.9376, zoom: 7 },
  'Bihar': { lat: 25.0961, lng: 85.3131, zoom: 7 },
  'Chhattisgarh': { lat: 21.2787, lng: 81.8661, zoom: 6 },
  'Goa': { lat: 15.2993, lng: 74.1240, zoom: 9 },
  'Gujarat': { lat: 22.2587, lng: 71.1924, zoom: 6 },
  'Haryana': { lat: 29.0588, lng: 76.0856, zoom: 7 },
  'Himachal Pradesh': { lat: 31.1048, lng: 77.1734, zoom: 7 },
  'Jharkhand': { lat: 23.6102, lng: 85.2799, zoom: 7 },
  'Karnataka': { lat: 15.3173, lng: 75.7139, zoom: 6 },
  'Kerala': { lat: 10.8505, lng: 76.2711, zoom: 7 },
  'Madhya Pradesh': { lat: 22.9734, lng: 78.6569, zoom: 6 },
  'Maharashtra': { lat: 19.7515, lng: 75.7139, zoom: 6 },
  'Manipur': { lat: 24.6637, lng: 93.9063, zoom: 8 },
  'Meghalaya': { lat: 25.4670, lng: 91.8767, zoom: 8 },
  'Mizoram': { lat: 23.1645, lng: 92.9376, zoom: 8 },
  'Nagaland': { lat: 26.1584, lng: 94.5624, zoom: 8 },
  'Odisha': { lat: 20.9517, lng: 85.0985, zoom: 6 },
  'Punjab': { lat: 31.1471, lng: 75.3412, zoom: 7 },
  'Rajasthan': { lat: 27.0238, lng: 74.2179, zoom: 6 },
  'Sikkim': { lat: 27.5330, lng: 88.5122, zoom: 9 },
  'Tamil Nadu': { lat: 11.1271, lng: 78.6569, zoom: 6 },
  'Telangana': { lat: 18.1124, lng: 79.0193, zoom: 6 },
  'Tripura': { lat: 23.9408, lng: 91.9882, zoom: 8 },
  'Uttar Pradesh': { lat: 26.8467, lng: 80.9462, zoom: 6 },
  'Uttarakhand': { lat: 30.0668, lng: 79.0193, zoom: 7 },
  'West Bengal': { lat: 22.9868, lng: 87.8549, zoom: 6 },
  'Andaman and Nicobar Islands': { lat: 11.7401, lng: 92.6586, zoom: 6 },
  'Chandigarh': { lat: 30.7333, lng: 76.7794, zoom: 12 },
  'Dadra and Nagar Haveli and Daman and Diu': { lat: 20.1809, lng: 73.0169, zoom: 9 },
  'Delhi': { lat: 28.7041, lng: 77.1025, zoom: 10 },
  'Jammu and Kashmir': { lat: 33.7782, lng: 76.5762, zoom: 6 },
  'Ladakh': { lat: 34.1526, lng: 77.5771, zoom: 6 },
  'Lakshadweep': { lat: 10.5667, lng: 72.6417, zoom: 8 },
  'Puducherry': { lat: 11.9416, lng: 79.8083, zoom: 10 }
};

export default function IndiaMap({ selectedState }) {
  const mapElRef = useRef(null);
  const mapRef = useRef(null);

  // Initialize the map once
  useEffect(() => {
    if (!mapElRef.current || mapRef.current) return;
    const loc = INDIA_LOCATIONS['All India'];
    const map = L.map(mapElRef.current, {
      center: [loc.lat, loc.lng],
      zoom: loc.zoom,
      scrollWheelZoom: true,
    });
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
    }).addTo(map);
    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Update view when selectedState changes
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const location = INDIA_LOCATIONS[selectedState] || INDIA_LOCATIONS['All India'];
    map.setView([location.lat, location.lng], location.zoom);
  }, [selectedState]);

  return (
    <div ref={mapElRef} style={{ height: '500px', width: '100%' }} />
  );
}