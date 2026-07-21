const {
	calculateTotalForNewKitchen,
	calculateTotalForUsedKitchen,
	calculateKitchenDisassembly
} = require('../calculators/kitchenCalculator');
const { getRouteCostBreakdown } = require('../calculators/transportCalculator');

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
		const isKitchenDismantlingService = serviceLabel === 'küchendemontage';
		const isKitchenTransportService = serviceLabel === 'küchentransport';
		const includesCompanyTravel = [
			'küchenmontage',
			'küchenanpassung',
			'küchentransport'
		].includes(serviceLabel);
		const hasDestinationAssembly = formData.kitchenAssembleAtDestination === 'yes';
		const condition = formData.kitchenCondition || formData.condition;
		const shouldCalculateAssembly = !(
			(isKitchenDismantlingService && !hasDestinationAssembly) ||
			(isKitchenTransportService && !hasDestinationAssembly)
		);
		const kitchenPrice = shouldCalculateAssembly
			? condition === 'new'
				? calculateTotalForNewKitchen(formData).price
				: calculateTotalForUsedKitchen(formData).price
			: 0;

		let disassemblyPrice = 0;
		if (
			isKitchenDismantlingService ||
			formData.abbau === true ||
			formData.abbau === 'true' ||
			(isKitchenTransportService && formData.kitchenNeedsDismantling === 'yes')
		) {
			disassemblyPrice = calculateKitchenDisassembly(formData).price;
		}

		let routeCosts = {
			arrivalPrice: 0,
			departurePrice: 0,
			travelPrice: 0,
			transportPrice: 0
		};
		if (formData.einsatzort || (formData.transportFrom && formData.transportTo)) {
			routeCosts = await getRouteCostBreakdown(formData, {
				includeCompanyTravel: includesCompanyTravel,
				includeTransport: Boolean(formData.transportFrom && formData.transportTo)
			});
		}

		const totalPrice = kitchenPrice + disassemblyPrice + routeCosts.transportPrice + routeCosts.travelPrice;
		const result = {
			...formData,
			prices: {
				assemblyPrice: kitchenPrice,
				disassemblyPrice,
				arrivalPrice: routeCosts.arrivalPrice,
				departurePrice: routeCosts.departurePrice,
				travelPrice: routeCosts.travelPrice,
				transportPrice: routeCosts.transportPrice,
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
