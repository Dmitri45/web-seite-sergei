const {
	calculateFenceAssemblyPrice
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

	if (withKerbstone && kerbstoneLengthM > 0) {
		items.push({
			index: 1,
			name: `Kantenstein / Bordstein x ${kerbstoneLengthM} m`,
			price: kerbstoneLengthM * 14
		});
	}

	return items;
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
		if (routeCosts.transportPrice > 0) {
			items.push({
				index: items.length,
				name: 'Transport',
				price: routeCosts.transportPrice
			});
		}

		return res.json({
			...formData,
			prices: {
				gardenPrice,
				arrivalPrice: routeCosts.arrivalPrice,
				departurePrice: routeCosts.departurePrice,
				travelPrice: routeCosts.travelPrice,
				transportPrice: routeCosts.transportPrice,
				totalPrice: gardenPrice + routeCosts.transportPrice + routeCosts.travelPrice,
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
