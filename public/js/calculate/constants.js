/**
 * Shared constants used by the modular calculator frontend.
 * @module calculate/constants
 */

export const SERVICE_SELECTION_STORAGE_KEY = 'selectedServiceData';
export const API_BASE_URL = '';
export const REQUEST_SEND_ENDPOINT = `${API_BASE_URL}/api/request/send`;

export const KITCHEN_CALCULATION_SERVICE_LABELS = new Set([
	'Küche aufbauen',
	'Küche abbauen',
	'Küche anpassen'
]);

export const FURNITURE_CALCULATION_SERVICE_LABELS = new Set([
	'Möbel aufbauen',
	'Umzugshelfer'
]);

export const TRADES_CALCULATION_SERVICE_LABELS = new Set([
	'Feinputz',
	'Wände Verputzen',
	'Trockenbau (Rigipsausbau)'
]);

export const GARDEN_CALCULATION_SERVICE_LABELS = new Set([
	'Zäune aufbauen'
]);

export const CUSTOM_REQUEST_SERVICE_LABELS = new Set([
	'Küchenanfertigung',
	'Möbelanfertigung'
]);
