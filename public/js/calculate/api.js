/**
 * API helpers for calculation requests and request-email submissions.
 * @module calculate/api
 */

import {
	FURNITURE_CALCULATION_SERVICE_LABELS,
	GARDEN_CALCULATION_SERVICE_LABELS,
	KITCHEN_CALCULATION_SERVICE_LABELS,
	API_BASE_URL,
	REQUEST_SEND_ENDPOINT,
	SERVICE_AREA_CHECK_ENDPOINT,
	TRADES_CALCULATION_SERVICE_LABELS
} from './constants.js';

/**
 * Resolves the backend calculation endpoint for the selected service.
 * @param {Object} [data={}] - Calculation payload containing serviceLabel.
 * @returns {string} Absolute API endpoint URL.
 */
export function getCalculationEndpoint(data = {}) {
	const serviceLabel = String(data.serviceLabel || '').trim();

	if (FURNITURE_CALCULATION_SERVICE_LABELS.has(serviceLabel)) {
		return `${API_BASE_URL}/api/furniture/calculate`;
	}

	if (TRADES_CALCULATION_SERVICE_LABELS.has(serviceLabel)) {
		return `${API_BASE_URL}/api/trades/calculate`;
	}

	if (GARDEN_CALCULATION_SERVICE_LABELS.has(serviceLabel)) {
		return `${API_BASE_URL}/api/garden/calculate`;
	}

	return `${API_BASE_URL}/api/kitchen/calculate`;
}

/**
 * Builds a frontend fallback result for services with simple local pricing.
 * @param {Object} [data={}] - Calculation payload from the form.
 * @returns {Object|null} Calculation result or null when no fallback exists.
 */
export function buildLocalCalculationFallback(data = {}) {
	const serviceLabel = String(data.serviceLabel || '').trim();
	if (!TRADES_CALCULATION_SERVICE_LABELS.has(serviceLabel) && !GARDEN_CALCULATION_SERVICE_LABELS.has(serviceLabel)) return null;

	const area = Number.parseFloat(String(data.areaTotal || '0').replace(',', '.')) || 0;
	let totalPrice = 0;
	let itemName = '';

	if (serviceLabel === 'Feinputz') {
		const qualityRates = { q1q2: 14, q3: 21, q4: 50 };
		const qualityLabels = { q1q2: 'Q1 / Q2', q3: 'Q3', q4: 'Q4' };
		const quality = String(data.qualityLevel || '').trim().toLowerCase();
		totalPrice = area * (qualityRates[quality] || 0);
		itemName = `${qualityLabels[quality] || 'Qualitätsstufe'} x ${area} m²`;
	}

	if (serviceLabel === 'Wände Verputzen') {
		const plasteringRates = {
			'grobeschicht-frei-hand': 12,
			'lotgerecht-wasserwaage': 23
		};
		const plasteringLabels = {
			'grobeschicht-frei-hand': 'Grobeschicht frei Hand, nicht lotgerecht',
			'lotgerecht-wasserwaage': 'Mit Wasserwaage, lotgerecht'
		};
		const plasteringType = String(data.plasteringType || '').trim().toLowerCase();
		totalPrice = area * (plasteringRates[plasteringType] || 0);
		itemName = `${plasteringLabels[plasteringType] || 'Ausführungsart'} x ${area} m²`;
	}

	if (serviceLabel === 'Trockenbau (Rigipsausbau)') {
		totalPrice = area * 9;
		itemName = `Trockenbau x ${area} m²`;
	}

	if (serviceLabel === 'Zäune aufbauen') {
		const elementsCount = Math.max(0, Math.floor(Number.parseFloat(String(data.fenceElementsCount || '0').replace(',', '.')) || 0));
		const kerbstoneLengthM = Math.max(0, Number.parseFloat(String(data.kerbstoneLengthM || '0').replace(',', '.')) || 0);
		const fencePrice = elementsCount > 0
			? 200 + Math.max(0, elementsCount - 2) * 80
			: 0;
		const kerbstonePrice = String(data.withKerbstone || '').trim().toLowerCase() === 'with'
			? kerbstoneLengthM * 8
			: 0;

		return {
			...data,
			prices: {
				totalPrice: fencePrice + kerbstonePrice,
				items: [
					{
						index: 0,
						name: `Zaunmontage x ${elementsCount} Elemente`,
						price: fencePrice
					},
					...(kerbstonePrice > 0 ? [{
						index: 1,
						name: `Kantenstein / Bordstein x ${kerbstoneLengthM} m`,
						price: kerbstonePrice
					}] : [])
				]
			}
		};
	}

	return {
		...data,
		prices: {
			totalPrice,
			items: [{
				index: 0,
				name: itemName,
				price: totalPrice
			}]
		}
	};
}

/**
 * Sends a calculation payload to the matching backend endpoint.
 * @param {Object} data - Calculation payload.
 * @returns {Promise<Object>} Backend calculation result.
 * @throws {Error} When the backend responds with a non-2xx status.
 */
export async function postCalculation(data) {
	const response = await fetch(getCalculationEndpoint(data), {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify(data)
	});

	if (!response.ok) {
		throw new Error(`Serverfehler: ${response.status}`);
	}

	return response.json();
}

/**
 * Checks whether the selected Einsatzort is inside the service radius.
 * @param {{address?: string, coordinates?: {lat: number, lon: number}}} einsatzort - Selected Geoapify address point.
 * @returns {Promise<{allowed: boolean, distanceKm?: number, radiusKm?: number, message?: string}>} Service area check result.
 * @throws {Error} When the backend responds with a non-2xx status.
 */
export async function postServiceAreaCheck(einsatzort) {
	const response = await fetch(SERVICE_AREA_CHECK_ENDPOINT, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({ einsatzort })
	});

	const result = await response.json().catch(() => ({}));

	if (!response.ok) {
		throw new Error(result.message || `Serverfehler: ${response.status}`);
	}

	return result;
}

/**
 * Checks multiple transport addresses with one backend request.
 * @param {Array<{address?: string, role?: string, coordinates?: {lat: number, lon: number}}>} einsatzorte - Selected route endpoints.
 * @returns {Promise<{allowed: boolean, results?: Array<Object>, message?: string}>} Service area check result.
 * @throws {Error} When the backend responds with a non-2xx status.
 */
export async function postServiceAreaBatchCheck(einsatzorte) {
	const response = await fetch(SERVICE_AREA_CHECK_ENDPOINT, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({ einsatzorte })
	});

	const result = await response.json().catch(() => ({}));

	if (!response.ok) {
		throw new Error(result.message || `Serverfehler: ${response.status}`);
	}

	return result;
}

/**
 * Wraps a request payload with metadata expected by the email backend.
 * @param {Object} payload - Service request payload.
 * @param {string} [requestType='offer'] - Request type, e.g. offer or custom-request.
 * @returns {Object} Request payload with metadata.
 */
export function buildRequestSubmissionPayload(payload, requestType = 'offer') {
	return {
		requestType,
		submittedAt: new Date().toISOString(),
		source: 'website-calculator',
		...payload
	};
}

/**
 * Sends an offer or custom request payload to the backend email route.
 * @param {Object} payload - Request payload to submit.
 * @param {string} [requestType='custom-request'] - Request type for Brevo template params.
 * @returns {Promise<{requestPayload: Object, result: Object}>} Submitted payload and backend response.
 * @throws {Error} When the backend responds with a non-2xx status.
 */
export async function postRequestPayload(payload, requestType = 'custom-request') {
	const requestPayload = buildRequestSubmissionPayload(payload, requestType);
	const response = await fetch(REQUEST_SEND_ENDPOINT, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify(requestPayload)
	});

	if (!response.ok) {
		throw new Error(`Serverfehler: ${response.status}`);
	}

	return {
		requestPayload,
		result: await response.json()
	};
}
