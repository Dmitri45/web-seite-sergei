const {
	calculateFenceAssemblyPrice,
	getFenceMaterialRate,
	getFencePostCount,
	getFencePostFasteningRate,
	getPostFasteningMaterialRate,
	isWithFenceMaterial,
	isWithPostFasteningMaterial
} = require('../calculators/gardenCalculator');
const { getRouteCostBreakdown } = require('../calculators/transportCalculator');

function toNumber(value) {
	if (value === null || value === undefined) return 0;
	const parsed = Number.parseFloat(String(value).replace(',', '.').trim());
	return Number.isFinite(parsed) ? parsed : 0;
}

function resolveGardenMode(formData = {}) {
	const rawMode = String(formData.mode || formData.gardenMode || '').trim().toLowerCase();
	if (rawMode === 'fence-assembly') return rawMode;

	const serviceLabel = String(formData.serviceLabel || '').trim().toLowerCase();
	if (serviceLabel === 'zaunmontage') return 'fence-assembly';

	return '';
}

function buildFenceAssemblyItems(formData = {}) {
	const elementsCount = Math.max(0, Math.floor(toNumber(formData.fenceElementsCount)));
	const kerbstoneLengthM = Math.max(0, toNumber(formData.kerbstoneLengthM));
	const withKerbstone = String(formData.withKerbstone || '').trim().toLowerCase() === 'with';
	const postCount = getFencePostCount(elementsCount);
	const fasteningRate = getFencePostFasteningRate(formData.fencePostFastening);
	const fasteningLabels = {
		concrete: 'Einbetonieren',
		'post-shoe': 'Pfostenschuh',
		'wall-holder': 'Pfostenhalter für Betonmauer'
	};
	const materialLabels = {
		'wood-fence': 'Holzzaun',
		'wpc-fence': 'WPC- / Kunststoffzaun',
		'metal-fence': 'Doppelstabmattenzaun / Metallzaun',
		'aluminium-fence': 'Aluminiumzaun',
		'concrete-fence': 'Betonzaun'
	};
	const fasteningKey = String(formData.fencePostFastening || '').trim().toLowerCase();
	const materialKey = String(formData.fenceMaterialType || '').trim().toLowerCase();
	const materialRate = getFenceMaterialRate(materialKey);
	const fasteningMaterialRate = getPostFasteningMaterialRate(fasteningKey);

	let fencePrice = 0;
	if (elementsCount > 0) {
		fencePrice = 230;
		if (elementsCount > 2) {
			fencePrice += (elementsCount - 2) * 80;
		}
	}

	const items = [{
		index: 0,
		name: `Zaunmontage x ${elementsCount} Elemente`,
		price: fencePrice
	}];

	if (isWithFenceMaterial(formData.fenceMaterialMode) && materialRate > 0 && elementsCount > 0) {
		items.push({
			index: items.length,
			name: `Zaunmaterial: ${materialLabels[materialKey] || 'Material'} x ${elementsCount} Elemente`,
			price: elementsCount * materialRate
		});
	}

	if (fasteningRate > 0 && postCount > 0) {
		items.push({
			index: items.length,
			name: `Pfostenbefestigung: ${fasteningLabels[fasteningKey] || 'Befestigung'} x ${postCount} Pfosten`,
			price: postCount * fasteningRate
		});
	}

	if (isWithPostFasteningMaterial(formData.postFasteningMaterialMode) && fasteningMaterialRate > 0 && postCount > 0) {
		items.push({
			index: items.length,
			name: `Befestigungsmaterial: ${fasteningLabels[fasteningKey] || 'Befestigung'} x ${postCount} Pfosten`,
			price: postCount * fasteningMaterialRate
		});
	}

	if (withKerbstone && kerbstoneLengthM > 0) {
		items.push({
			index: items.length,
			name: `Kantenstein / Bordstein x ${kerbstoneLengthM} m`,
			price: kerbstoneLengthM * 14
		});
	}

	return items;
}

function calculateFenceTransportLoadingPrice(formData = {}) {
	const elementsCount = Math.max(0, Math.floor(toNumber(formData.fenceElementsCount)));
	return elementsCount * 10;
}

async function calculateGarden(req, res) {
	try {
		const formData = req.body || {};
		const mode = resolveGardenMode(formData);

		if (mode !== 'fence-assembly') {
			return res.status(400).json({
				error: 'Unknown garden mode',
				message: 'Use mode: fence-assembly'
			});
		}

		const gardenPrice = calculateFenceAssemblyPrice(formData);
		let routeCosts = {
			arrivalPrice: 0,
			departurePrice: 0,
			travelPrice: 0,
			transportPrice: 0
		};

		if (formData.einsatzort || (formData.transportFrom && formData.transportTo)) {
			routeCosts = await getRouteCostBreakdown(formData, {
				includeCompanyTravel: true,
				includeTransport: Boolean(formData.transportFrom && formData.transportTo)
			});
		}

		const items = buildFenceAssemblyItems(formData);
		let mergedGardenPrice = gardenPrice;
		if (routeCosts.travelPrice > 0) {
			if (items.length) {
				items[0] = {
					...items[0],
					price: Number((items[0].price + routeCosts.travelPrice).toFixed(2))
				};
			}
			mergedGardenPrice += routeCosts.travelPrice;
		}

		const transportLoadingPrice = routeCosts.transportPrice > 0
			? calculateFenceTransportLoadingPrice(formData)
			: 0;
		const mergedTransportPrice = routeCosts.transportPrice + transportLoadingPrice;

		if (mergedTransportPrice > 0) {
			items.push({
				index: items.length,
				name: 'Transport',
				price: mergedTransportPrice
			});
		}

		return res.json({
			...formData,
			prices: {
				gardenPrice: mergedGardenPrice,
				arrivalPrice: routeCosts.arrivalPrice,
				departurePrice: routeCosts.departurePrice,
				travelPrice: 0,
				transportPrice: mergedTransportPrice,
				totalPrice: mergedGardenPrice + mergedTransportPrice,
				items
			}
		});
	} catch (error) {
		return res.status(500).json({
			error: 'Error calculating garden',
			details: error.message
		});
	}
}

async function createGardenRequest(req, res) {
	res.status(501).json({
		error: 'Anfrageerstellung ist noch nicht implementiert'
	});
}

module.exports = {
	calculateGarden,
	createGardenRequest
};
