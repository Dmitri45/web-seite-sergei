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
const e = require('express');

/**
 * OpenRouteService API Key
 * @type {string}
 */
const ORS_API_KEY = 'eyJvcmciOiI1YjNjZTM1OTc4NTExMTAwMDFjZjYyNDgiLCJpZCI6ImUzOTQwODUyYTQxYzQ3OWFiZjkyMDY1NDcyM2JlZGI0IiwiaCI6Im11cm11cjY0In0=';

/**
 * Base coordinates (office/warehouse)
 * @type {[number, number]}
 */
const BASE_COORDS = [6.779844555473214, 51.56523808298011];

/**
 * Builds an array of route points from the order object
 * @param {Object} object - order object with transportFrom, transportVia, transportTo
 * @returns {Array<[number, number]>} array of coordinates
 */
function getClientPoints(object) {
    const clientPoints = [];
    if (object.transportFrom && object.transportFrom.coordinates) {
        clientPoints.push([
            object.transportFrom.coordinates.lon,
            object.transportFrom.coordinates.lat
        ]);
    }
    if (Array.isArray(object.transportVia)) {
        object.transportVia.forEach(via => {
            if (via && via.coordinates) {
                clientPoints.push([
                    via.coordinates.lon,
                    via.coordinates.lat
                ]);
            }
        });
    }
    if (object.transportTo && object.transportTo.coordinates) {
        clientPoints.push([
            object.transportTo.coordinates.lon,
            object.transportTo.coordinates.lat
        ]);
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
        if (segment > 40) {
            total += segment * 0.5; 
        } else {
            total += segment * 0.25;
        }
    }
    return total;
}

/**
 * Requests the distance matrix from OpenRouteService
 * @param {Array<[number, number]>} clientPoints - array of route coordinates
 * @returns {Promise<Array<Array<number>>>} distance matrix
 * @throws {Error} Navigationsfehler
 */
async function fetchORSMatrix(clientPoints) {
    let allPoints = [BASE_COORDS, ...clientPoints, BASE_COORDS];
    try {
        const orsResponse = await axios.post('https://api.openrouteservice.org/v2/matrix/driving-car', {
            locations: allPoints,
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

module.exports = { getRouteMatrixAndCalculatePrice };