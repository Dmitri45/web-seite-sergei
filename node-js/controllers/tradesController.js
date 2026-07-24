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

function isEnabled(value) {
	return value === true || value === 'true' || value === 'yes' || value === 'on';
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

		if (
			isEnabled(formData.includeFinePlaster) &&
			!String(formData.finePlasterQualityLevel || '').trim()
		) {
			return res.status(400).json({
				error: 'Missing fine plaster quality',
				message: 'Bitte wählen Sie die Qualitätsstufe für Feinputz.'
			});
		}

		if (
			mode === 'drywall' &&
			isEnabled(formData.includeWallPlastering) &&
			!String(formData.addonPlasteringType || '').trim()
		) {
			return res.status(400).json({
				error: 'Missing wall plastering type',
				message: 'Bitte wählen Sie die Ausführungsart für Wandverputz.'
			});
		}

		const area = Number.parseFloat(String(formData.areaTotal || '0').replace(',', '.')) || 0;
		const items = [];

		if (mode === 'feinputz') {
			items.push({
				index: items.length,
				name: `Feinputz ${getFeinputzQualityLabel(formData.qualityLevel)} x ${area} m²`,
				price: calculateFeinputzPrice(formData)
			});
		}

		if (mode === 'wall-plastering') {
			items.push({
				index: items.length,
				name: `Wandverputz: ${getWallPlasteringTypeLabel(formData.plasteringType)} x ${area} m²`,
				price: calculateWallPlasteringPrice(formData)
			});

			if (isEnabled(formData.includeFinePlaster)) {
				const finePlasterData = {
					...formData,
					qualityLevel: formData.finePlasterQualityLevel
				};
				items.push({
					index: items.length,
					name: `Feinputz ${getFeinputzQualityLabel(formData.finePlasterQualityLevel)} x ${area} m²`,
					price: calculateFeinputzPrice(finePlasterData)
				});
			}
		}

		if (mode === 'drywall') {
			items.push({
				index: items.length,
				name: `Trockenbau x ${area} m²`,
				price: calculateTrockenbauPrice(formData)
			});

			if (isEnabled(formData.includeWallPlastering)) {
				const wallPlasteringData = {
					...formData,
					plasteringType: formData.addonPlasteringType
				};
				items.push({
					index: items.length,
					name: `Wandverputz: ${getWallPlasteringTypeLabel(formData.addonPlasteringType)} x ${area} m²`,
					price: calculateWallPlasteringPrice(wallPlasteringData)
				});
			}

			if (isEnabled(formData.includeFinePlaster)) {
				const finePlasterData = {
					...formData,
					qualityLevel: formData.finePlasterQualityLevel
				};
				items.push({
					index: items.length,
					name: `Feinputz ${getFeinputzQualityLabel(formData.finePlasterQualityLevel)} x ${area} m²`,
					price: calculateFeinputzPrice(finePlasterData)
				});
			}
		}

		const servicePrice = items.reduce((sum, item) => sum + item.price, 0);

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

		let mergedServicePrice = servicePrice;
		if (routeCosts.travelPrice > 0) {
			if (items.length) {
				items[0] = {
					...items[0],
					price: Number((items[0].price + routeCosts.travelPrice).toFixed(2))
				};
			}
			mergedServicePrice += routeCosts.travelPrice;
		}

		return res.json({
			...formData,
			prices: {
				arrivalPrice: routeCosts.arrivalPrice,
				departurePrice: routeCosts.departurePrice,
				travelPrice: 0,
				totalPrice: mergedServicePrice,
				items
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
