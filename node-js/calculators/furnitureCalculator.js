/**
 * Parses numeric input safely.
 *
 * @param {string|number|undefined|null} value
 * @returns {number}
 */
function toNumber(value) {
  if (value === null || value === undefined) return 0;
  const normalized = String(value).replace(',', '.').trim();
  const parsed = Number.parseFloat(normalized);
  return Number.isFinite(parsed) ? parsed : 0;
}

/**
 * Converts meters to centimeters.
 *
 * @param {string|number|undefined|null} meters
 * @returns {number}
 */
function metersToCentimeters(meters) {
  return toNumber(meters) * 100;
}

/**
 * Picks rate by range table (inclusive bounds).
 *
 * @param {number} value
 * @param {Array<{min:number,max:number,rate:number}>} ranges
 * @returns {number}
 */
function getRateByRange(value, ranges) {
  for (const range of ranges) {
    if (value >= range.min && value <= range.max) return range.rate;
  }
  return 0;
}

/**
 * Calculates per-item price using the specified furniture condition.
 *
 * @param {Object} item
 * @param {number} item.lengthCm
 * @param {number} item.heightCm
 * @param {number} item.drawers
 * @param {number} item.pullouts
 * @param {number} item.lights
 * @param {"new"|"used"} condition
 * @returns {number}
 */
function calculateItemPrice(item, condition) {
  const lengthRatesNew = [
    { min: 50, max: 150, rate: 15 },
    { min: 150, max: 210, rate: 25 },
    { min: 210, max: 300, rate: 30 },
    { min: 300, max: 400, rate: 40 }
  ];

  const lengthRatesUsed = [
    { min: 150, max: 210, rate: 15 },
    { min: 210, max: 300, rate: 15 },
    { min: 300, max: 400, rate: 15 }
  ];

  const heightRatesNew = [
    { min: 30, max: 100, rate: 2 },
    { min: 100, max: 150, rate: 5 },
    { min: 150, max: 200, rate: 5 },
    { min: 200, max: 240, rate: 5 }
  ];

  const heightRatesUsed = [
    { min: 100, max: 150, rate: 5 },
    { min: 150, max: 200, rate: 5 },
    { min: 200, max: 240, rate: 5 }
  ];

  const lengthRate = condition === 'new'
    ? getRateByRange(item.lengthCm, lengthRatesNew)
    : getRateByRange(item.lengthCm, lengthRatesUsed);

  const heightRate = condition === 'new'
    ? getRateByRange(item.heightCm, heightRatesNew)
    : getRateByRange(item.heightCm, heightRatesUsed);

  const drawerRate = condition === 'new' ? 5 : 1;
  const pulloutRate = condition === 'new' ? 2 : 0.5;
  const lightingRate = 2;

  return (
    lengthRate +
    heightRate +
    item.drawers * drawerRate +
    item.pullouts * pulloutRate +
    item.lights * lightingRate
  );
}

/**
 * Normalizes furniture item payload to internal numeric model.
 *
 * @param {Object} rawItem
 * @returns {{lengthCm:number,heightCm:number,drawers:number,pullouts:number,lights:number}}
 */
function normalizeFurnitureItem(rawItem = {}) {
  return {
    lengthCm: metersToCentimeters(rawItem?.length),
    heightCm: metersToCentimeters(rawItem?.height),
    drawers: toNumber(rawItem?.drawers),
    pullouts: toNumber(rawItem?.pullout) + toNumber(rawItem?.pullouts),
    lights: toNumber(rawItem?.lighting) + toNumber(rawItem?.lights)
  };
}

/**
 * Calculates total by condition for all furniture items.
 *
 * @param {Object[]} moebelstuecke
 * @param {"new"|"used"} condition
 * @returns {number}
 */
function calculateFurnitureAssemblyTotalByCondition(moebelstuecke = [], condition) {
  let total = 0;

  moebelstuecke.forEach((rawItem) => {
    const item = normalizeFurnitureItem(rawItem);
    total += calculateItemPrice(item, condition);
  });

  return total;
}

/**
 * Calculates total assembly price for new furniture.
 *
 * @param {Object} formData
 * @returns {number}
 */
function calculateNewFurnitureAssemblyPrice(formData = {}) {
  const moebelstuecke = Array.isArray(formData.moebelstuecke) ? formData.moebelstuecke : [];
  return calculateFurnitureAssemblyTotalByCondition(moebelstuecke, 'new');
}

/**
 * Calculates total assembly price for used furniture.
 *
 * @param {Object} formData
 * @returns {number}
 */
function calculateUsedFurnitureAssemblyPrice(formData = {}) {
  const moebelstuecke = Array.isArray(formData.moebelstuecke) ? formData.moebelstuecke : [];
  return calculateFurnitureAssemblyTotalByCondition(moebelstuecke, 'used');
}

module.exports = {
  calculateNewFurnitureAssemblyPrice,
  calculateUsedFurnitureAssemblyPrice
};
