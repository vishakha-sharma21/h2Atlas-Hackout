// src/utils/scorecalculations.js

function haversine(lat1, lon1, lat2, lon2) {
    const R = 6371; // Radius of Earth in km
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;

    const a =
        Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
        Math.cos(φ1) * Math.cos(φ2) *
        Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in kilometers
}

function normalizeDistance(distance, maxDistance) {
    return 1 - Math.min(distance, maxDistance) / maxDistance;
}

function calculateScores(userLocation, demandPoints, renewableSources, powerSources, weightages, maxDistance = 1000) {
    const { lat, lon } = userLocation;

    const demandDistances = demandPoints.map((point) =>
        haversine(lat, lon, point.latitude, point.longitude)
    );
    const minDemandDistance = Math.min(...demandDistances);

    const renewableDistances = renewableSources.map((source) =>
        haversine(lat, lon, source.latitude, source.longitude)
    );
    const minRenewableDistance = Math.min(...renewableDistances);

    const powerDistances = powerSources.map((source) =>
        haversine(lat, lon, source.latitude, source.longitude)
    );
    const minPowerDistance = Math.min(...powerDistances);

    const normalizedDemand = normalizeDistance(minDemandDistance, maxDistance);
    const normalizedRenewable = normalizeDistance(minRenewableDistance, maxDistance);
    const normalizedPower = normalizeDistance(minPowerDistance, maxDistance);

    const demandScore = normalizedDemand * (weightages.demand / 100);
    const renewableScore = normalizedRenewable * (weightages.renewable / 100);
    const powerScore = normalizedPower * (weightages.power / 100);

    const totalScore = demandScore + renewableScore + powerScore;

    const geojson = {
        type: "Feature",
        geometry: {
            type: "Point",
            coordinates: [lon, lat],
        },
        properties: {
            name: "User Location",
            score: totalScore,
            minDemandDist: minDemandDistance,
            minRenewableDist: minRenewableDistance,
            minPowerDist: minPowerDistance,
        },
    };

    return [{ ...userLocation, score: totalScore * 100, geojson }];
}

export { calculateScores };