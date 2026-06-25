const EARTH_RADIUS_MILES = 3958.8;

const toRadians = (degrees) => (degrees * Math.PI) / 180;

export const getDistanceInMiles = (coordsA, coordsB) => {
    if (!Array.isArray(coordsA) || !Array.isArray(coordsB)) {
        return null;
    }

    const [lngA, latA] = coordsA;
    const [lngB, latB] = coordsB;

    if ([lngA, latA, lngB, latB].some((value) => typeof value !== "number" || Number.isNaN(value))) {
        return null;
    }

    const dLat = toRadians(latB - latA);
    const dLng = toRadians(lngB - lngA);

    const a = Math.sin(dLat / 2) ** 2 +
        Math.cos(toRadians(latA)) * Math.cos(toRadians(latB)) * Math.sin(dLng / 2) ** 2;

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return EARTH_RADIUS_MILES * c;
};

export const isWithinMiles = (coordsA, coordsB, miles) => {
    const distance = getDistanceInMiles(coordsA, coordsB);
    if (distance === null) {
        return true;
    }
    return distance <= miles;
};
