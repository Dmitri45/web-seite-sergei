/**
 * Transport calculator: calculates route price using OpenRouteService
 *
 * - getClientPoints(object): builds an array of route coordinates from the order object
 * - calculateTransportPrice(distances): calculates the price based on the distance matrix
 * - fetchORSMatrix(clientPoints): requests the distance matrix from OpenRouteService
 * - getRouteMatrixAndCalculatePrice(object): main function, returns the route price
 *
 * All errors and logs are output in German.
 */

const axios = require('axios');

/**
 * OpenRouteService API Key
 * @type {string}
 */
const ORS_API_KEY = process.env.ORS_API_KEY || 'eyJvcmciOiI1YjNjZTM1OTc4NTExMTAwMDFjZjYyNDgiLCJpZCI6ImUzOTQwODUyYTQxYzQ3OWFiZjkyMDY1NDcyM2JlZGI0IiwiaCI6Im11cm11cjY0In0=';

/**
 * Base coordinates (office/warehouse)
 * @type {[number, number]}
 */
const BASE_COORDS = [
    Number(process.env.COMPANY_LON) || 6.779844555473214,
    Number(process.env.COMPANY_LAT) || 51.56523808298011
];

/**
 * Normalizes an address point into OpenRouteService coordinates.
 * @param {Object} point - Address point with coordinates.
 * @returns {[number, number]|null} Longitude/latitude tuple.
 */
function normalizeRoutePoint(point) {
    const lat = Number(point?.coordinates?.lat);
    const lon = Number(point?.coordinates?.lon);

    if (!Number.isFinite(lat) || !Number.isFinite(lon)) return null;
    return [lon, lat];
}

/**
 * Builds an array of route points from the order object
 * @param {Object} object - order object with transportFrom, transportVia, transportTo
 * @returns {Array<[number, number]>} array of coordinates
 */
function getClientPoints(object) {
    const clientPoints = [];
    if (object.transportFrom && object.transportFrom.coordinates) {
        const point = normalizeRoutePoint(object.transportFrom);
        if (point) clientPoints.push(point);
    }
    if (Array.isArray(object.transportVia)) {
        object.transportVia.forEach(via => {
            if (via && via.coordinates) {
                const point = normalizeRoutePoint(via);
                if (point) clientPoints.push(point);
            }
        });
    }
    if (object.transportTo && object.transportTo.coordinates) {
        const point = normalizeRoutePoint(object.transportTo);
        if (point) clientPoints.push(point);
    }
    return clientPoints;
}

/**
 * Calculates the route price based on the distance matrix
 * @param {Array<Array<number>>} distances - distance matrix
 * @returns {number} route price
 */
function calculateTransportPrice(distances) {
    let total = 0;
    for (let i = 0; i < distances.length - 1; i++) {
        const segment = distances[i][i + 1];
        total += segment * 2.1;
    }
    return total;
}

/**
 * Requests the distance matrix from OpenRouteService
 * @param {Array<[number, number]>} clientPoints - array of route coordinates
 * @returns {Promise<Array<Array<number>>>} distance matrix
 * @throws {Error} Navigationsfehler
 */
async function fetchORSMatrixForLocations(locations) {
    try {
        const orsResponse = await axios.post('https://api.openrouteservice.org/v2/matrix/driving-car', {
            locations,
            metrics: ['distance'],
            units: 'km'
        }, {
            headers: { 'Authorization': ORS_API_KEY },
            timeout: 5000
        });
        
        return orsResponse.data.distances;
    } catch (err) {
        console.error('Fehler beim Abrufen der ORS-Matrix:', err.response?.data || err.message);
        throw new Error('Navigationsfehler');
    }
}

/**
 * Requests the distance matrix from OpenRouteService for a round trip from the base.
 * @param {Array<[number, number]>} clientPoints - array of route coordinates
 * @returns {Promise<Array<Array<number>>>} distance matrix
 * @throws {Error} Navigationsfehler
 */
async function fetchORSMatrix(clientPoints) {
    const allPoints = [BASE_COORDS, ...clientPoints, BASE_COORDS];
    return fetchORSMatrixForLocations(allPoints);
}

/**
 * Calculates the driving distance from the company base to one address point.
 * @param {Object} point - Address point with coordinates.
 * @returns {Promise<number>} Distance in kilometers.
 */
async function getRouteDistanceFromBaseKm(point) {
	const routePoint = normalizeRoutePoint(point);
	if (!routePoint) {
		throw new Error('Ungueltiger Einsatzort');
	}

	const [distanceKm] = await getRouteDistancesFromBaseKm([point]);

	if (!Number.isFinite(distanceKm)) {
		throw new Error('Navigationsfehler');
	}

	return Number(distanceKm.toFixed(2));
}

/**
 * Calculates driving distances from the company base to multiple address points.
 * @param {Array<Object>} points - Address points with coordinates.
 * @returns {Promise<Array<number>>} Distances in kilometers.
 */
async function getRouteDistancesFromBaseKm(points = []) {
	const routePoints = points.map(normalizeRoutePoint);
	if (!routePoints.length || routePoints.some(point => !point)) {
		throw new Error('Ungueltiger Einsatzort');
	}

	const distances = await fetchORSMatrixForLocations([BASE_COORDS, ...routePoints]);
	const baseDistances = distances?.[0]?.slice(1) || [];

	if (baseDistances.length !== routePoints.length || baseDistances.some(distance => !Number.isFinite(Number(distance)))) {
		throw new Error('Navigationsfehler');
	}

	return baseDistances.map(distance => Number(Number(distance).toFixed(2)));
}

/**
 * Main function: calculates the route price for the order
 * @param {Object} object - order object
 * @returns {Promise<number>} route price
 */
async function getRouteMatrixAndCalculatePrice(object) {
    const clientPoints = getClientPoints(object);
    const distances = await fetchORSMatrix(clientPoints);
    const total = calculateTransportPrice(distances);  
    return Number(total.toFixed(2)); 
}

module.exports = {
	getRouteMatrixAndCalculatePrice,
	getRouteDistanceFromBaseKm,
	getRouteDistancesFromBaseKm
};
