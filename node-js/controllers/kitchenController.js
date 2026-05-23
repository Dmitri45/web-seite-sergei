const {
	calculateTotalForNewKitchen,
	calculateTotalForUsedKitchen,
	calculateKitchenDisassembly
} = require('../calculators/kitchenCalculator');
const { getRouteMatrixAndCalculatePrice } = require('../calculators/transportCalculator');

/**
 * Handles kitchen price calculation (assembly and transport).
 *
 * @param {import('express').Request} req - HTTP request (expects formData in body)
 * @param {import('express').Response} res - HTTP response
 * @returns {Promise<void>}
 */
async function calculateKitchen(req, res) {
	try {
		const formData = req.body;
		const serviceLabel = String(formData.serviceLabel || '').trim().toLowerCase();
		const isKitchenDismantlingService = serviceLabel === 'küche abbauen';
		const isKitchenTransportService = serviceLabel === 'küchentransport';
		const condition = formData.kitchenCondition || formData.condition;
		const kitchenPrice = isKitchenDismantlingService || (isKitchenTransportService && formData.kitchenAssembleAtDestination !== 'yes')
			? 0
			: isKitchenTransportService || condition === 'used'
				? calculateTotalForUsedKitchen(formData).price
				: calculateTotalForNewKitchen(formData).price;

		let disassemblyPrice = 0;
		if (
			isKitchenDismantlingService ||
			formData.abbau === true ||
			formData.abbau === 'true' ||
			(isKitchenTransportService && formData.kitchenNeedsDismantling === 'yes')
		) {
			disassemblyPrice = calculateKitchenDisassembly(formData).price;
		}

		let transportPrice = 0;
		if (formData.transportFrom && formData.transportTo) {
			try {
				transportPrice = await getRouteMatrixAndCalculatePrice(formData);
			} catch (e) {
				transportPrice = 0;
			}
		}

		const totalPrice = kitchenPrice + disassemblyPrice + transportPrice;
		const result = {
			...formData,
			prices: {
				assemblyPrice: kitchenPrice,
				disassemblyPrice,
				transportPrice,
				totalPrice
			}
		};
		res.json(result);
	} catch (error) {
		res.status(500).json({ error: 'Error calculating kitchen', details: error.message });
	}
}

async function createKitchenRequest(req, res) {
	res.status(501).json({
		error: 'Anfrageerstellung ist noch nicht implementiert'
	});
}

module.exports = {
	calculateKitchen,
	createKitchenRequest
};
