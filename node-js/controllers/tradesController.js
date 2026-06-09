const {
	calculateFeinputzPrice,
	calculateWallPlasteringPrice,
	calculateTrockenbauPrice
} = require('../calculators/tradesCalculator');
const { getRouteCostBreakdown } = require('../calculators/transportCalculator');

function resolveTradesMode(formData = {}) {
	const rawMode = String(formData.mode || formData.tradesMode || '').trim().toLowerCase();
	if (rawMode === 'feinputz') return rawMode;
	if (rawMode === 'wall-plastering') return rawMode;
	if (rawMode === 'drywall') return rawMode;

	const serviceLabel = String(formData.serviceLabel || '').trim().toLowerCase();
	if (serviceLabel === 'feinputz / fertigbeschichtung') return 'feinputz';
	if (serviceLabel === 'wandverputz') return 'wall-plastering';
	if (serviceLabel === 'trockenbau') return 'drywall';

	return '';
}

function getFeinputzQualityLabel(qualityLevel = '') {
	const labels = {
		q1q2: 'Q1 / Q2',
		q3: 'Q3',
		q4: 'Q4'
	};

	return labels[String(qualityLevel || '').trim().toLowerCase()] || 'Qualitätsstufe';
}

function getWallPlasteringTypeLabel(plasteringType = '') {
	const labels = {
		'grobeschicht-frei-hand': 'Grobeschicht frei Hand, nicht lotgerecht',
		'lotgerecht-wasserwaage': 'Mit Wasserwaage, lotgerecht'
	};

	return labels[String(plasteringType || '').trim().toLowerCase()] || 'Ausführungsart';
}

async function calculateTrades(req, res) {
	try {
		const formData = req.body || {};
		const mode = resolveTradesMode(formData);

		if (!mode) {
			return res.status(400).json({
				error: 'Unknown trades mode',
				message: 'Use mode: feinputz | wall-plastering | drywall'
			});
		}

		const area = Number.parseFloat(String(formData.areaTotal || '0').replace(',', '.')) || 0;
		let price = 0;
		let itemName = '';

		if (mode === 'feinputz') {
			price = calculateFeinputzPrice(formData);
			itemName = `${getFeinputzQualityLabel(formData.qualityLevel)} x ${area} m²`;
		}

		if (mode === 'wall-plastering') {
			price = calculateWallPlasteringPrice(formData);
			itemName = `${getWallPlasteringTypeLabel(formData.plasteringType)} x ${area} m²`;
		}

		if (mode === 'drywall') {
			price = calculateTrockenbauPrice(formData);
			itemName = `Trockenbau x ${area} m²`;
		}

		let routeCosts = {
			arrivalPrice: 0,
			departurePrice: 0,
			travelPrice: 0
		};
		if (formData.einsatzort) {
			routeCosts = await getRouteCostBreakdown(formData, {
				includeCompanyTravel: true,
				includeTransport: false
			});
		}

		return res.json({
			...formData,
			prices: {
				arrivalPrice: routeCosts.arrivalPrice,
				departurePrice: routeCosts.departurePrice,
				travelPrice: routeCosts.travelPrice,
				totalPrice: price + routeCosts.travelPrice,
				items: [{
					index: 0,
					name: itemName,
					price
				}]
			}
		});
	} catch (error) {
		return res.status(500).json({
			error: 'Error calculating trades',
			details: error.message
		});
	}
}

async function createTradesRequest(req, res) {
	res.status(501).json({
		error: 'Anfrageerstellung ist noch nicht implementiert'
	});
}

module.exports = {
	calculateTrades,
	createTradesRequest
};
