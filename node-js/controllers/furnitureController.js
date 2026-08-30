const {
	calculateNewFurnitureAssemblyPrice,
	calculateNewFurnitureAssemblyItems,
	calculateOldFurnitureDisassemblyPrice,
	calculateOldFurnitureDisassemblyItems,
	calculateOldFurnitureAssemblyPrice,
	calculateOldFurnitureAssemblyItems,
	calculateMovingHelpersPrice,
	calculateMovingHelpersItems
} = require('../calculators/furnitureCalculator');
const { getRouteCostBreakdown } = require('../calculators/transportCalculator');
const { sendValidationError } = require('../validation/commonValidation');
const { validateFurnitureCalculation } = require('../validation/furnitureValidation');

/**
 * Resolves furniture calculation mode from request payload.
 *
 * Supported:
 * - new-assembly
 * - old-disassembly
 * - old-assembly
 * - moving-helpers
 *
 * Fallback mapping by serviceLabel:
 * - "Möbelmontage" => new-assembly
 * - "Umzugshilfe" => moving-helpers
 *
 * @param {Object} formData
 * @returns {"new-assembly"|"old-disassembly"|"old-assembly"|"moving-helpers"|""}
 */
function resolveFurnitureMode(formData = {}) {
	const rawMode = String(formData.mode || formData.furnitureMode || '').trim().toLowerCase();
	if (
		rawMode === 'new-assembly' ||
		rawMode === 'old-disassembly' ||
		rawMode === 'old-assembly' ||
		rawMode === 'moving-helpers'
	) {
		return rawMode;
	}

	const serviceLabel = String(formData.serviceLabel || '').trim().toLowerCase();
	if (serviceLabel === 'möbelmontage') return 'new-assembly';
	if (serviceLabel === 'möbelentsorgung') return 'old-disassembly';
	if (serviceLabel === 'umzugshilfe') return 'moving-helpers';

	return '';
}

/**
 * Calculates furniture price by selected mode.
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @returns {Promise<void>}
 */
async function calculateFurniture(req, res) {
	try {
		const formData = req.body || {};
		const mode = resolveFurnitureMode(formData);
		const validation = validateFurnitureCalculation(formData);

		if (!validation.ok) {
			return sendValidationError(res, validation);
		}

		let price = 0;
		let items = [];

		if (mode === 'new-assembly') {
			price = calculateNewFurnitureAssemblyPrice(formData);
			items = calculateNewFurnitureAssemblyItems(formData);
		} else if (mode === 'old-disassembly') {
			price = calculateOldFurnitureDisassemblyPrice(formData);
			items = calculateOldFurnitureDisassemblyItems(formData);
		} else if (mode === 'old-assembly') {
			price = calculateOldFurnitureAssemblyPrice(formData);
			items = calculateOldFurnitureAssemblyItems(formData);
		} else if (mode === 'moving-helpers') {
			price = calculateMovingHelpersPrice(formData);
			items = calculateMovingHelpersItems(formData);
		} else {
			return res.status(400).json({
				error: 'Unknown furniture mode',
				message: 'Use mode: new-assembly | old-disassembly | old-assembly | moving-helpers'
			});
		}

		let routeCosts = {
			arrivalPrice: 0,
			departurePrice: 0,
			travelPrice: 0
		};
		if (
			(mode === 'new-assembly' && formData.einsatzort) ||
			(mode === 'moving-helpers' && formData.transportFrom && formData.transportTo)
		) {
			routeCosts = await getRouteCostBreakdown(formData, {
				includeCompanyTravel: true,
				includeTransport: false
			});
		}

		if (routeCosts.travelPrice > 0) {
			if (items.length) {
				items[0] = {
					...items[0],
					price: Number((items[0].price + routeCosts.travelPrice).toFixed(2))
				};
			} else {
				items.push({
					index: 0,
					name: formData.serviceLabel || 'Service',
					price: routeCosts.travelPrice
				});
			}
			price += routeCosts.travelPrice;
		}

		return res.json({
			...formData,
			prices: {
				arrivalPrice: routeCosts.arrivalPrice,
				departurePrice: routeCosts.departurePrice,
				travelPrice: 0,
				totalPrice: price,
				items
			}
		});
	} catch (error) {
		return res.status(500).json({
			error: 'Error calculating furniture',
			details: error.message
		});
	}
}

async function createFurnitureRequest(req, res) {
	res.status(501).json({
		error: 'Anfrageerstellung ist noch nicht implementiert'
	});
}

module.exports = {
	calculateFurniture,
	createFurnitureRequest
};
