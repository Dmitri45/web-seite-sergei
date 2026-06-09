/**
 * Parses number safely (supports comma decimals).
 * @param {string|number|undefined|null} value
 * @returns {number}
 */
function toNumber(value) {
  if (value === null || value === undefined) return 0;
  const parsed = Number.parseFloat(String(value).replace(',', '.').trim());
  return Number.isFinite(parsed) ? parsed : 0;
}

/**
 * Converts meters to centimeters.
 * @param {string|number|undefined|null} meters
 * @returns {number}
 */
function toCm(meters) {
  return toNumber(meters) * 100;
}

/**
 * Returns price by inclusive range table.
 * @param {number} value
 * @param {Array<{min:number,max:number,price:number}>} ranges
 * @returns {number}
 */
function byRange(value, ranges) {
  for (const row of ranges) {
    if (value >= row.min && value <= row.max) return row.price;
  }
  return 0;
}

/**
 * Normalizes one furniture item from payload.
 * Expected raw fields: length, height, drawers, pullout/pullouts, lighting/lights
 * @param {Object} raw
 * @returns {{lengthCm:number,heightCm:number,drawers:number,pullouts:number,lights:number}}
 */
function normalizeItem(raw = {}) {
  return {
    lengthCm: toCm(raw.length),
    heightCm: toCm(raw.height),
    drawers: toNumber(raw.drawers),
    pullouts: toNumber(raw.pullout) + toNumber(raw.pullouts),
    lights: toNumber(raw.lighting) + toNumber(raw.lights)
  };
}

/**
 * Calculates one new-furniture assembly item.
 * @param {{lengthCm:number,heightCm:number,drawers:number,pullouts:number,lights:number}} item
 * @returns {number}
 */
function calcNewAssemblyItem(item) {
  const lengthPrice = byRange(item.lengthCm, [
    { min: 50, max: 150, price: 15 },
    { min: 150, max: 210, price: 25 },
    { min: 210, max: 300, price: 30 },
    { min: 300, max: 400, price: 40 }
  ]);

  const heightPrice = byRange(item.heightCm, [
    { min: 30, max: 100, price: 2 },
    { min: 100, max: 150, price: 5 },
    { min: 150, max: 200, price: 5 },
    { min: 200, max: 240, price: 5 }
  ]);

  return lengthPrice + heightPrice + item.drawers * 5 + item.pullouts * 2 + item.lights * 2;
}

/**
 * Calculates one item for old furniture (abbau/aufbau).
 * Rule: items below 150 cm are not disassembled/assembled -> 0.
 * @param {{lengthCm:number,heightCm:number,drawers:number,pullouts:number,lights:number}} item
 * @param {'abbau'|'aufbau'} mode
 * @returns {number}
 */
function calcOldItem(item, mode) {
  if (item.lengthCm < 150) return 0;

  const lengthPrice = byRange(item.lengthCm, [
    { min: 150, max: 210, price: 15 },
    { min: 210, max: 300, price: 15 },
    { min: 300, max: 400, price: 15 }
  ]);

  const heightPrice = byRange(item.heightCm, [
    { min: 100, max: 150, price: 5 },
    { min: 150, max: 200, price: 5 },
    { min: 200, max: 240, price: 5 }
  ]);

  const drawerRate = mode === 'abbau' ? 0.5 : 1;
  const pulloutRate = mode === 'abbau' ? 0.1 : 0.5;

  return lengthPrice + heightPrice + item.drawers * drawerRate + item.pullouts * pulloutRate + item.lights * 2;
}

/**
 * Calculates new-furniture assembly.
 * @param {{moebelstuecke?:Object[]}} formData
 * @returns {number}
 */
function calculateNewFurnitureAssemblyPrice(formData = {}) {
  const items = Array.isArray(formData.moebelstuecke) ? formData.moebelstuecke : [];
  return items.reduce((sum, raw) => sum + calcNewAssemblyItem(normalizeItem(raw)), 0);
}

/**
 * Calculates new-furniture assembly with one result row per item.
 * @param {{moebelstuecke?:Object[]}} formData
 * @returns {Array<{index:number,name:string,price:number}>}
 */
function calculateNewFurnitureAssemblyItems(formData = {}) {
  const items = Array.isArray(formData.moebelstuecke) ? formData.moebelstuecke : [];
  return items.map((raw, index) => ({
    index,
    name: String(raw.name || '').trim() || `Möbelstück ${index + 1}`,
    price: calcNewAssemblyItem(normalizeItem(raw))
  }));
}

/**
 * Alte Möbel abbauen.
 * @param {{moebelstuecke?:Object[]}} formData
 * @returns {number}
 */
function calculateOldFurnitureDisassemblyPrice(formData = {}) {
  const items = Array.isArray(formData.moebelstuecke) ? formData.moebelstuecke : [];
  return items.reduce((sum, raw) => sum + calcOldItem(normalizeItem(raw), 'abbau'), 0);
}

/**
 * Alte Möbel abbauen, with one result row per item.
 * @param {{moebelstuecke?:Object[]}} formData
 * @returns {Array<{index:number,name:string,price:number}>}
 */
function calculateOldFurnitureDisassemblyItems(formData = {}) {
  const items = Array.isArray(formData.moebelstuecke) ? formData.moebelstuecke : [];
  return items.map((raw, index) => ({
    index,
    name: String(raw.name || '').trim() || `Möbelstück ${index + 1}`,
    price: calcOldItem(normalizeItem(raw), 'abbau')
  }));
}

/**
 * Calculates used-furniture assembly.
 * @param {{moebelstuecke?:Object[]}} formData
 * @returns {number}
 */
function calculateOldFurnitureAssemblyPrice(formData = {}) {
  const items = Array.isArray(formData.moebelstuecke) ? formData.moebelstuecke : [];
  return items.reduce((sum, raw) => sum + calcOldItem(normalizeItem(raw), 'aufbau'), 0);
}

/**
 * Calculates used-furniture assembly with one result row per item.
 * @param {{moebelstuecke?:Object[]}} formData
 * @returns {Array<{index:number,name:string,price:number}>}
 */
function calculateOldFurnitureAssemblyItems(formData = {}) {
  const items = Array.isArray(formData.moebelstuecke) ? formData.moebelstuecke : [];
  return items.map((raw, index) => ({
    index,
    name: String(raw.name || '').trim() || `Möbelstück ${index + 1}`,
    price: calcOldItem(normalizeItem(raw), 'aufbau')
  }));
}

/**
 * Moving-assistance hourly rate by helper count, including VAT.
 * @param {string|number|undefined|null} helpersCount
 * @returns {number}
 */
function getMovingHelpersHourlyRate(helpersCount) {
  const rates = {
    1: 45,
    2: 70,
    3: 100
  };

  return rates[toNumber(helpersCount)] || 0;
}

/**
 * Calculates moving assistance.
 * @param {{helpersCount?:string|number,workHours?:string|number}} formData
 * @returns {number}
 */
function calculateMovingHelpersPrice(formData = {}) {
  return getMovingHelpersHourlyRate(formData.helpersCount) * toNumber(formData.workHours);
}

/**
 * Calculates moving assistance with one result row for the selected hourly calculation.
 * @param {{helpersCount?:string|number,workHours?:string|number}} formData
 * @returns {Array<{index:number,name:string,price:number,rate:number,hours:number}>}
 */
function calculateMovingHelpersItems(formData = {}) {
  const helpersCount = toNumber(formData.helpersCount);
  const hours = toNumber(formData.workHours);
  const rate = getMovingHelpersHourlyRate(helpersCount);

  return [{
    index: 0,
    name: `${helpersCount || 0} Helfer x ${hours || 0} Std.`,
    price: rate * hours,
    hours
  }];
}

module.exports = {
  calculateNewFurnitureAssemblyPrice,
  calculateNewFurnitureAssemblyItems,
  calculateOldFurnitureDisassemblyPrice,
  calculateOldFurnitureDisassemblyItems,
  calculateOldFurnitureAssemblyPrice,
  calculateOldFurnitureAssemblyItems,
  calculateMovingHelpersPrice,
  calculateMovingHelpersItems
};
