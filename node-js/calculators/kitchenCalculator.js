/**
 * @typedef {Object} KitchenCalculationInput
 * @property {"new"|"used"} [kitchenCondition]
 * @property {"yes"|"no"} [assembly]
 * @property {"yes"|"no"} [worktopPickup]
 * @property {"yes"|"no"} [worktopAdjust]
 * @property {"l-form"|"zeile"|"u-form"|string} [kitchenType]
 * @property {string|number} [upperCabinets]
 * @property {string|number} [lowerCabinets]
 * @property {string|number} [cabinetAssemblyBaseCabinets]
 * @property {string|number} [cabinetAssemblyTallCabinets]
 * @property {string|number} [cabinetAssemblyUpperCabinets]
 */

/**
 * @typedef {Object} PriceResult
 * @property {number} price
 */

const KITCHEN_LAYOUT_PRICES = {
  zeile: {
    baseboard: 40,
    endStrip: 25,
    worktop: 130
  },
  'i-form': {
    baseboard: 40,
    endStrip: 25,
    worktop: 130
  },
  'l-form': {
    baseboard: 80,
    endStrip: 50,
    worktop: 210
  },
  'u-form': {
    baseboard: 120,
    endStrip: 75,
    worktop: 290
  }
};

function toNumber(value) {
  const number = Number.parseFloat(value);
  return Number.isFinite(number) ? number : 0;
}

function getKitchenLayoutPrices(kitchenType) {
  const normalizedType = String(kitchenType || '').trim().toLowerCase();
  return KITCHEN_LAYOUT_PRICES[normalizedType] || KITCHEN_LAYOUT_PRICES.zeile;
}

function getUpperCabinetCount(data) {
  return toNumber(data.upperCabinets || data.cabinetAssemblyUpperCabinets);
}

function getLowerCabinetCount(data) {
  const explicitLowerCabinets = toNumber(data.lowerCabinets);
  if (explicitLowerCabinets > 0) return explicitLowerCabinets;

  return toNumber(data.cabinetAssemblyBaseCabinets) + toNumber(data.cabinetAssemblyTallCabinets);
}


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

  total += calculateKitchenBaseAndWorktop({ ...data, worktopAdjust: "yes" });
  return { price: total };
}

/**
 * Calculates base kitchen pricing and optional worktop-related add-ons.
 *
 * @param {KitchenCalculationInput} data - Input payload.
 * @returns {number} Base subtotal.
 */
function calculateKitchenBaseAndWorktop(data) {
  const layoutPrices = getKitchenLayoutPrices(data.kitchenType);
  const upperCabinets = getUpperCabinetCount(data);
  const lowerCabinets = getLowerCabinetCount(data);

  let total = upperCabinets * 35;
  total += lowerCabinets * 25;
  total += layoutPrices.baseboard;
  total += layoutPrices.endStrip;

  if (data.worktopAdjust === "yes") {
    total += layoutPrices.worktop;
  }

  if (data.worktopPickup === "yes") {
    total += 60;
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
  return toNumber(data.cabinetAssemblyBaseCabinets) * 60
    + toNumber(data.cabinetAssemblyTallCabinets) * 95
    + toNumber(data.cabinetAssemblyUpperCabinets) * 40;
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
