/**
 * Parses numeric input safely from strings/numbers.
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
 * Resolves lawn area from formData.
 * Priority:
 * 1) areaTotal
 * 2) length * width
 *
 * @param {Object} formData
 * @param {string|number} [formData.areaTotal]
 * @param {string|number} [formData.length]
 * @param {string|number} [formData.width]
 * @returns {number}
 */
function resolveLawnArea(formData = {}) {
  const areaTotal = toNumber(formData.areaTotal);
  if (areaTotal > 0) return areaTotal;

  const length = toNumber(formData.length);
  const width = toNumber(formData.width);
  const calculatedArea = length * width;

  return calculatedArea > 0 ? calculatedArea : 0;
}

/**
 * Calculates the price for roll turf installation.
 * Rate: 16 €/m².
 *
 * @param {Object} formData
 * @returns {number}
 */
function calculateRollrasenVerlegenPrice(formData = {}) {
  const area = resolveLawnArea(formData);
  const rate = 16;
  return area * rate;
}

/**
 * Checks whether form value means "with kerbstone/bordstein".
 *
 * @param {string|undefined|null} value
 * @returns {boolean}
 */
function isWithKerbstone(value) {
  return String(value || '').trim().toLowerCase() === 'with';
}

/**
 * Calculates the price for fence assembly without materials.
 * Rules:
 * - First 2 fence elements: 230 € total
 * - From the 3rd element: +80 € per element
 * - Optional Kantenstein/Bordstein: +14 € per meter
 *
 * @param {Object} formData
 * @param {string|number} [formData.fenceElementsCount]
 * @param {string} [formData.withKerbstone] - with | without
 * @param {string|number} [formData.kerbstoneLengthM]
 * @returns {number}
 */
function calculateFenceAssemblyPrice(formData = {}) {
  const elementsCount = Math.max(0, Math.floor(toNumber(formData.fenceElementsCount)));
  const kerbstoneLengthM = Math.max(0, toNumber(formData.kerbstoneLengthM));

  let fencePrice = 0;

  if (elementsCount > 0) {
    fencePrice = 230;
    if (elementsCount > 2) {
      fencePrice += (elementsCount - 2) * 80;
    }
  }

  const kerbstonePrice = isWithKerbstone(formData.withKerbstone)
    ? kerbstoneLengthM * 14
    : 0;

  return fencePrice + kerbstonePrice;
}

module.exports = {
  calculateRollrasenVerlegenPrice,
  calculateFenceAssemblyPrice
};
