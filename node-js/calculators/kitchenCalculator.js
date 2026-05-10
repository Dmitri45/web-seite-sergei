/**
 * @typedef {Object} KitchenCalculationInput
 * @property {"new"|"used"} [kitchenCondition]
 * @property {"yes"|"no"} [assembly]
 * @property {"yes"|"no"} [worktopPickup]
 * @property {"yes"|"no"} [worktopAdjust]
 * @property {"l-form"|"zeile"|"u-form"|string} [kitchenType]
 * @property {string|number} [smallCabinets]
 * @property {string|number} [largeCabinets]
 * @property {string|number} [drawers]
 */

/**
 * @typedef {Object} PriceResult
 * @property {number} price
 */



/**
 * Calculates total for used kitchen scenario.
 *
 * @param {KitchenCalculationInput} data - Input payload.
 * @returns {PriceResult} Price result for used kitchen.
 */
function calculateTotalForUsedKitchen(data) {
  let total = 0;
  total += calculateKitchenBaseAndWorktop(data);

  return { price: total };
}

/**
 * Calculates total for new kitchen scenario.
 *
 * @param {KitchenCalculationInput} data - Input payload.
 * @returns {PriceResult} Price result for new kitchen.
 */
function calculateTotalForNewKitchen(data) {
  let total = 0;

  if (data.assembly === "yes") {
    total += calculateCabinetAssembly(data);
  }

  total += calculateKitchenBaseAndWorktop(data);
  return { price: total };
}

/**
 * Calculates base kitchen pricing and optional worktop-related add-ons.
 *
 * @param {KitchenCalculationInput} data - Input payload.
 * @returns {number} Base subtotal.
 */
function calculateKitchenBaseAndWorktop(data) {
  let total = 0;

  total += 390;

  if (data.worktopPickup === "yes") {
    total += 60;
  }

  if (data.worktopAdjust === "yes") {
    total += data.kitchenType === "l-form" ? 190 : 95;
  }

  return total;
}

/**
 * Calculates cabinet assembly add-on subtotal.
 *
 * @param {KitchenCalculationInput} data - Input payload.
 * @returns {number} Assembly subtotal.
 */
function calculateCabinetAssembly(data) {
  let total = 0;

  if (data.smallCabinets) {
    total += parseInt(data.smallCabinets, 10) * 10;
  }

  if (data.largeCabinets) {
    total += parseInt(data.largeCabinets, 10) * 15;
  }

  if (data.drawers) {
    total += parseInt(data.drawers, 10) * 6;
  }

  return total;
}

/**
 * Calculates the price for kitchen disassembly (Abbau).
 *
 * @param {Object} data - Input payload (not used, for compatibility)
 * @returns {PriceResult} Price result for disassembly (fixed 280 EUR)
 */
function calculateKitchenDisassembly(data) {
  return { price: 280 };
}

module.exports = {
  calculateTotalForNewKitchen,
  calculateTotalForUsedKitchen,
  calculateKitchenDisassembly
};
