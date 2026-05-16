const {
	calculateFenceAssemblyPrice
} = require('../calculators/gardenCalculator');
const { getRouteMatrixAndCalculatePrice } = require('../calculators/transportCalculator');

function toNumber(value) {
	if (value === null || value === undefined) return 0;
	const parsed = Number.parseFloat(String(value).replace(',', '.').trim());
	return Number.isFinite(parsed) ? parsed : 0;
}

function resolveGardenMode(formData = {}) {
	const rawMode = String(formData.mode || formData.gardenMode || '').trim().toLowerCase();
	if (rawMode === 'fence-assembly') return rawMode;

	const serviceLabel = String(formData.serviceLabel || '').trim().toLowerCase();
	if (serviceLabel === 'zäune aufbauen') return 'fence-assembly';

	return '';
}

function buildFenceAssemblyItems(formData = {}) {
	const elementsCount = Math.max(0, Math.floor(toNumber(formData.fenceElementsCount)));
	const kerbstoneLengthM = Math.max(0, toNumber(formData.kerbstoneLengthM));
	const withKerbstone = String(formData.withKerbstone || '').trim().toLowerCase() === 'with';

	let fencePrice = 0;
	if (elementsCount > 0) {
		fencePrice = 200;
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
			price: kerbstoneLengthM * 8
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
		let transportPrice = 0;

		if (formData.transportFrom && formData.transportTo) {
			try {
				transportPrice = await getRouteMatrixAndCalculatePrice(formData);
			} catch (_) {
				transportPrice = 0;
			}
		}

		const items = buildFenceAssemblyItems(formData);
		if (transportPrice > 0) {
			items.push({
				index: items.length,
				name: 'Transport',
				price: transportPrice
			});
		}

		return res.json({
			...formData,
			prices: {
				gardenPrice,
				transportPrice,
				totalPrice: gardenPrice + transportPrice,
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
		error: 'Создание заявки пока не реализовано'
	});
}

module.exports = {
	calculateGarden,
	createGardenRequest
};
