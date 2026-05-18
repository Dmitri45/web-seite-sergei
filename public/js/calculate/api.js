import {
	FURNITURE_CALCULATION_SERVICE_LABELS,
	GARDEN_CALCULATION_SERVICE_LABELS,
	KITCHEN_CALCULATION_SERVICE_LABELS,
	REQUEST_SEND_ENDPOINT,
	TRADES_CALCULATION_SERVICE_LABELS
} from './constants.js';

export function getCalculationEndpoint(data = {}) {
	const serviceLabel = String(data.serviceLabel || '').trim();

	if (FURNITURE_CALCULATION_SERVICE_LABELS.has(serviceLabel)) {
		return 'http://localhost:3000/api/furniture/calculate';
	}

	if (TRADES_CALCULATION_SERVICE_LABELS.has(serviceLabel)) {
		return 'http://localhost:3000/api/trades/calculate';
	}

	if (GARDEN_CALCULATION_SERVICE_LABELS.has(serviceLabel)) {
		return 'http://localhost:3000/api/garden/calculate';
	}

	return 'http://localhost:3000/api/kitchen/calculate';
}

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

export async function postCalculation(data) {
	const response = await fetch(getCalculationEndpoint(data), {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify(data)
	});

	if (!response.ok) {
		throw new Error(`Ошибка сервера: ${response.status}`);
	}

	return response.json();
}

export function buildRequestSubmissionPayload(payload, requestType = 'offer') {
	return {
		requestType,
		submittedAt: new Date().toISOString(),
		source: 'website-calculator',
		...payload
	};
}

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
		throw new Error(`Ошибка сервера: ${response.status}`);
	}

	return {
		requestPayload,
		result: await response.json()
	};
}
