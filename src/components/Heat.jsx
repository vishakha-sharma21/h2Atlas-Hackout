import React, { useState, useEffect, useRef } from "react";
import { MapContainer, TileLayer, GeoJSON, useMapEvents } from "react-leaflet";
import { useNavigate } from 'react-router-dom';
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { calculateScores } from "../utils/scorecalculations";
import WeightageInput from "./WeightageInputComponent";
import Dashboard from "./Dashboard";
import domtoimage from 'dom-to-image';
import { Button } from "@mui/material";
import { fetchNearbyTransportFeatures, fetchNearbyTransport } from "../utils/overpass.js";

// Helper function to generate a grid for a specific geographic region
const generateGridForRegion = (bounds, stepKm) => {
    const points = [];
    const earthRadius = 6371; // km
    const [minLat, minLon] = [bounds.minLat, bounds.minLon];
    const [maxLat, maxLon] = [bounds.maxLat, bounds.maxLon];
    
    const latStep = (stepKm / earthRadius) * (180 / Math.PI);
    const lonStep = (stepKm / earthRadius) * (180 / Math.PI) / Math.cos(((minLat + maxLat) / 2) * Math.PI / 180);

    for (let lat = minLat; lat <= maxLat; lat += latStep) {
        for (let lon = minLon; lon <= maxLon; lon += lonStep) {
            points.push({ lat, lon });
        }
    }
    return points;
};

// Helper function to find the closest grid point to a clicked location
const findClosestGridPoint = (clickLocation, gridPoints) => {
    let closestPoint = null;
    let minDistance = Infinity;

    gridPoints.forEach(point => {
        const distance = L.latLng(clickLocation.lat, clickLocation.lng).distanceTo(L.latLng(point.lat, point.lon));
        if (distance < minDistance) {
            minDistance = distance;
            closestPoint = point;
        }
    });
    return closestPoint;
};

// Helper function to find the top N nearest points
const findTopNearest = (origin, points, count) => {
    return points
        .map(point => ({
            name: point.name,
            distance: L.latLng(origin.lat, origin.lon).distanceTo(L.latLng(point.latitude, point.longitude)) / 1000,
            type: point.type,
        }))
        .sort((a, b) => a.distance - b.distance)
        .slice(0, count);
};

// Component to handle map clicks
const MapClickDetector = ({ onMapClick, gridPoints }) => {
    useMapEvents({
        click: (e) => {
            const closestPoint = findClosestGridPoint(e.latlng, gridPoints);
            if (closestPoint) {
                onMapClick(closestPoint);
            }
        },
    });
    return null;
};

const Heat = () => {
    const navigate = useNavigate();
    const [scoreData, setScoreData] = useState([]);
    const [weightages, setWeightages] = useState({
        demand: 33,
        renewable: 33,
        power: 34,
    });
    const [location, setLocation] = useState({
        lat: "",
        lon: "",
    });
    
    const [dashboardData, setDashboardData] = useState(null);
    const [reportContent, setReportContent] = useState(null);
    const [demandPoints, setDemandPoints] = useState([]);
    const [renewableSources, setRenewableSources] = useState([]);
    const [powerSources, setPowerSources] = useState([]);
    const [subcontinentGrid, setSubcontinentGrid] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [demandRes, renewableRes, powerRes] = await Promise.all([
                    fetch("major_industrial_plants.geojson"),
                    fetch("india_solar_wind.geojson"),
                    fetch("final_hydrogen_plants.geojson")
                ]);
                const [demandData, renewableData, powerData] = await Promise.all([
                    demandRes.json(),
                    renewableRes.json(),
                    powerRes.json()
                ]);

                const processData = (geojsonData, type) => {
                    return geojsonData.features.map(feature => {
                        let latitude, longitude;
                        if (feature.properties.latitude && feature.properties.longitude) {
                            latitude = feature.properties.latitude;
                            longitude = feature.properties.longitude;
                        } else if (feature.geometry && feature.geometry.coordinates) {
                            longitude = feature.geometry.coordinates[0];
                            latitude = feature.geometry.coordinates[1];
                        } else {
                            console.warn(`Feature is missing coordinates in ${type} data:`, feature);
                            return null;
                        }
                        return { 
                            latitude, 
                            longitude, 
                            name: feature.properties.name, 
                            year: feature.properties.commissioning_date ? new Date(feature.properties.commissioning_date).getFullYear() : null, 
                            capacity: feature.properties.capacity_mw || 0, 
                            fuel_type: feature.properties.fuel_type || 'Unknown', 
                            type: type 
                        };
                    }).filter(Boolean);
                };

                setDemandPoints(processData(demandData, 'Demand'));
                setRenewableSources(processData(renewableData, 'Renewable'));
                setPowerSources(processData(powerData, 'Power'));

                const subcontinentBounds = { minLat: 6, maxLat: 37, minLon: 68, maxLon: 97 };
                const gridPoints = generateGridForRegion(subcontinentBounds, 50);
                setSubcontinentGrid(gridPoints);

            } catch (error) {
                console.error("Error fetching or processing data:", error);
            }
        };

        fetchData();
    }, []);

    const handleWeightageChange = (newWeights) => {
        setWeightages(newWeights);
    };

    const handleLocationChange = (newLocation) => {
        setLocation(newLocation);
    };

    const handleCalculate = async () => {
        const lat = parseFloat(location.lat);
        const lon = parseFloat(location.lon);

        if (!isNaN(lat) && !isNaN(lon) && demandPoints.length > 0 && renewableSources.length > 0 && powerSources.length > 0) {
            const gridPoints = generateGridForRegion({
                minLat: lat - 0.5, maxLat: lat + 0.5,
                minLon: lon - 0.5, maxLon: lon + 0.5
            }, 10);

            const allScores = gridPoints.map(point => {
                return calculateScores(
                    point,
                    demandPoints,
                    renewableSources,
                    powerSources,
                    weightages
                )[0];
            });
            setScoreData(allScores);
            // Persist the exact map features for the Report page
            try {
                const featureCollection = {
                    type: "FeatureCollection",
                    features: allScores.map(d => d.geojson),
                };
                localStorage.setItem('h2_weightage_geojson', JSON.stringify(featureCollection));
            } catch {}
            
            const nearestParameters = [
                ...findTopNearest({ lat: lat, lon: lon }, demandPoints, 5),
                ...findTopNearest({ lat: lat, lon: lon }, renewableSources, 5),
                ...findTopNearest({ lat: lat, lon: lon }, powerSources, 5),
            ];
            
            const filteredSources = [...renewableSources, ...powerSources].filter(source =>
                source.latitude >= (lat - 0.5) && source.latitude <= (lat + 0.5) &&
                source.longitude >= (lon - 0.5) && source.longitude <= (lon + 0.5)
            );

            const fuelCapacity = filteredSources.reduce((acc, source) => {
                const fuelType = source.fuel_type || 'Other';
                acc[fuelType] = (acc[fuelType] || 0) + source.capacity;
                return acc;
            }, {});

            const cumulativeCapacity = filteredSources.reduce((acc, source) => {
                if (source.year) {
                    const existingYear = acc.find(item => item.year === source.year);
                    if (existingYear) {
                        existingYear.cumulative += source.capacity;
                    } else {
                        acc.push({ year: source.year, cumulative: source.capacity });
                    }
                }
                return acc;
            }, []).sort((a, b) => a.year - b.year);

            const newDashboardData = {
                fuelCapacity: fuelCapacity,
                cumulativeCapacity: cumulativeCapacity,
                sliderContributions: [
                    { name: "Demand", value: weightages.demand },
                    { name: "Renewable", value: weightages.renewable },
                    { name: "Power", value: weightages.power },
                ],
                nearestParameters: nearestParameters,
            };

            setDashboardData(newDashboardData);

            // Persist a summary for the Report page and fetch nearby transport station names
            try {
                // Read modes from saved Preferences (defaults to All)
                let modes = [];
                try { modes = JSON.parse(localStorage.getItem('h2_filters') || '{}').modes || []; } catch {}

                // Fetch nearby transport POIs (names grouped by mode)
                let stationsByMode = {};
                try {
                    const feats = await fetchNearbyTransportFeatures({ lat, lon, radiusKm: 25, modes });
                    const grouped = new Map();
                    for (const f of feats) {
                        const arr = grouped.get(f.mode) || new Set();
                        if (f.name) arr.add(f.name);
                        grouped.set(f.mode, arr);
                    }
                    stationsByMode = Object.fromEntries(Array.from(grouped.entries()).map(([m, set]) => [m, Array.from(set).slice(0, 20)]));
                } catch {}

                // Fetch summary distances by mode for recommendation logic
                let transportSummary = {};
                try {
                    transportSummary = await fetchNearbyTransport({ lat, lon, radiusKm: 50, modes });
                } catch {}

                const siteSelection = {
                    computedAt: new Date().toISOString(),
                    location: { lat, lon },
                    weightages: { ...weightages },
                    dashboard: newDashboardData,
                    transportStationsByMode: stationsByMode,
                    transportSummary,
                };
                localStorage.setItem('h2_site_selection', JSON.stringify(siteSelection));
            } catch {}

        } else {
            console.error("Invalid input or data not yet loaded.");
            setScoreData([]);
            setDashboardData(null);
        }
    };

    const onMapClick = (point) => {
        setLocation({ lat: point.lat, lon: point.lon });
        setScoreData([]);
        setDashboardData(null);
    };
    
    const GROQ_API_KEY = "GROQ_API_KEY";

    const handleReport = async () => {
        if (!dashboardData || scoreData.length === 0) {
            alert("Please calculate the data first by clicking 'Calculate Score'.");
            return;
        }

        const reportData = {
            latitude: location.lat,
            longitude: location.lon,
            priorityValues: weightages,
            nearestParameters: dashboardData.nearestParameters,
            fuelCapacityData: dashboardData.fuelCapacity,
            suitabilityScore: scoreData[0].geojson.properties.score,
        };

        const prompt = `
You are a GIS and energy analyst. Generate a comprehensive report based on the provided data.
The report should be professional and insightful, with the following sections:

1.  **Location Summary**: A brief paragraph describing the suitability of the location based on the suitability score.
2.  **Key Resource Analysis**: A detailed analysis of the nearest resources (demand, renewable, and power) and their distances.
3.  **H2 Transportation Recommendations**: Suggest a suitable hydrogen transportation method (e.g., pipeline, truck, rail) based on the proximity of the nearest resources AND major transportation infrastructure.
4.  **Resource Distribution Trends**: A brief analysis of the provided cumulative and fuel capacity data.

Here is the raw data in JSON format:

\`\`\`json
{
  "latitude": ${location.lat},
  "longitude": ${location.lon},
  "priorityValues": {
    "demand": ${weightages.demand},
    "renewable": ${weightages.renewable},
    "power": ${weightages.power}
  },
  "nearestParameters": ${JSON.stringify(dashboardData.nearestParameters, null, 2)},
  "fuelCapacityData": ${JSON.stringify(dashboardData.fuelCapacity, null, 2)},
  "suitabilityScore": ${scoreData[0].geojson.properties.score}

  
  "nearestTransportation": {
    "highways": [ /* Array of nearest highway points with name and distance */ ],
    "ports": [ /* Array of nearest ports with name and distance */ ],
    "railways": [ /* Array of nearest railway points with name and distance */ ],
    "pipelines": [ /* Array of nearest pipeline points with name and distance */ ]
  }
}
\`\`\`
`;

        try {
            const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${GROQ_API_KEY}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    messages: [
                        { role: "system", content: "You are an expert GIS and energy analyst." },
                        { role: "user", content: prompt }
                    ],
                    model: "llama3-8b-8192",
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.error("API returned a 400 error:", errorData);
                throw new Error(`Groq API returned status: ${response.status}`);
            }

            const data = await response.json();
            const reportContent = data.choices[0].message.content;

            setReportContent(reportContent);
            navigate('/reportpredict', { state: { reportContent } });
            console.log("Generated Report:", reportContent);
            alert("Report generated! Check the console for the analysis.");

        } catch (error) {
            console.error("Error generating report:", error);
            alert("Failed to generate report. Check the console for API errors.");
        }
    };

    const onViewReport = () => {
        navigate('/report');
        setMenuOpen(false);
    };

    const onDownloadPDF = () => {
        navigate('/report?print=1');
        setMenuOpen(false);
    };

    // Menu state for Generate Report actions
    const [menuOpen, setMenuOpen] = useState(false);
    const menuRef = useRef(null);
    useEffect(() => {
        const onDocClick = (e) => {
            if (menuRef.current && !menuRef.current.contains(e.target)) {
                setMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', onDocClick);
        return () => document.removeEventListener('mousedown', onDocClick);
    }, []);

    const getColor = (score) => {
        const scaledScore = score * 100;
        if (scaledScore > 80) return "green";
        if (scaledScore > 50) return "yellow";
        return "red";
    };

    const pointToLayer = (feature, latlng) => {
        const color = getColor(feature.properties.score);
        return L.circleMarker(latlng, {
            radius: 8,
            fillColor: color,
            color: "#000",
            weight: 1,
            opacity: 1,
            fillOpacity: 0.8,
        });
    };

    const onEachFeature = (feature, layer) => {
        const displayScore = feature.properties.score * 100;
        layer.bindPopup(
            `<h4>Grid Point</h4>
            <p>Score: ${displayScore.toFixed(2)}</p>
            <p>Lat: ${feature.geometry.coordinates[1].toFixed(2)}, Lon: ${feature.geometry.coordinates[0].toFixed(2)}</p>
            <p>Min Demand Dist: ${feature.properties.minDemandDist.toFixed(2)} km</p>
            <p>Min Renewable Dist: ${feature.properties.minRenewableDist.toFixed(2)} km</p>
            <p>Min Power Dist: ${feature.properties.minPowerDist.toFixed(2)} km</p>`
        );
    };

    return (
        <div className="bg-gray-100 min-h-screen p-8">
            <div className="max-w-7xl mx-auto bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
                {/* Header with Title and Button */}
                <div className="p-6 flex justify-between items-center border-b border-gray-200">
                    <div className="flex flex-col">
                        <h1 className="text-2xl font-bold text-gray-800">Site Selection Dashboard</h1>
                        <p className="text-sm text-gray-500">Explore locations, adjust weightages, and review nearby parameters.</p>
                    </div>
                    <div className="relative flex items-center gap-1" ref={menuRef}>
                        <button
                            className="py-2 px-6 bg-blue-600 text-white rounded-md font-medium shadow-sm hover:bg-blue-700 transition-colors"
                            onClick={handleReport}
                            title="Generate AI report"
                        >
                            Generate Report
                        </button>
                        <button
                            className="py-2 px-2 bg-blue-600 text-white rounded-md font-medium shadow-sm hover:bg-blue-700 transition-colors"
                            aria-label="More report actions"
                            onClick={() => setMenuOpen(v=>!v)}
                            title="More actions"
                        >
                            ▾
                        </button>
                        {menuOpen && (
                            <div className="absolute right-0 top-full mt-2 w-56 bg-white border border-gray-200 rounded-md shadow-lg z-[1200]">
                                <button
                                  className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50"
                                  onClick={handleReport}
                                >Generate AI Report</button>
                                <button
                                  className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50"
                                  onClick={onViewReport}
                                >View Document</button>
                                <button
                                  className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50"
                                  onClick={onDownloadPDF}
                                >Download PDF</button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Main Content Area: Flex container for the top section */}
                <div className="flex flex-col lg:flex-row p-6 gap-6">
                    {/* Left Panel (Inputs) */}
                    <div className="lg:w-1/3">
                        <WeightageInput
                            onWeightageChange={handleWeightageChange}
                            onLocationChange={handleLocationChange}
                            onCalculate={handleCalculate}
                            location={location}
                            weights={weightages}
                        />
                    </div>

                    {/* Right Panel (Map) */}
                    <div className="lg:w-2/3">
                        {/* Map Panel */}
                        <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200 h-full">
                            <h3 className="text-xl font-bold text-gray-800 mb-4">Map</h3>
                            <div className="relative h-[400px] rounded-lg overflow-hidden">
                                <MapContainer 
                                    center={[23.0, 78.0]}
                                    zoom={5}
                                    style={{ height: "100%", width: "100%" }}
                                >
                                    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                                    <MapClickDetector onMapClick={onMapClick} gridPoints={subcontinentGrid} />
                                    {scoreData.length > 0 && (
                                        <GeoJSON
                                            data={{
                                                type: "FeatureCollection",
                                                features: scoreData.map((d) => d.geojson),
                                            }}
                                            onEachFeature={onEachFeature}
                                            pointToLayer={pointToLayer}
                                        />
                                    )}
                                </MapContainer>
                                <div className="absolute bottom-4 left-4 bg-white bg-opacity-80 p-2 rounded-md text-sm">
                                    Lat {location.lat !== "" ? parseFloat(location.lat).toFixed(4) : "N/A"}, Lon {location.lon !== "" ? parseFloat(location.lon).toFixed(4) : "N/A"}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Dashboard Section (below the map and inputs) */}
                <div className="p-6 pt-0">
                    <Dashboard data={dashboardData} />
                </div>

            </div>
        </div>
    );
};

export default Heat;