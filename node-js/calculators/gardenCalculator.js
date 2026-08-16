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

const FENCE_MATERIAL_RATE_PER_ELEMENT = 120;
const FENCE_POST_FASTENING_RATES = {
  concrete: 45,
  'post-shoe': 25,
  'wall-holder': 35
};

function isWithFenceMaterial(value) {
  return String(value || '').trim().toLowerCase() === 'with';
}

function getFencePostCount(elementsCount) {
  return elementsCount > 0 ? elementsCount + 1 : 0;
}

function getFencePostFasteningRate(value) {
  return FENCE_POST_FASTENING_RATES[String(value || '').trim().toLowerCase()] || 0;
}

/**
 * Calculates the price for fence assembly.
 * Rules:
 * - First 2 fence elements: 230 € total
 * - From the 3rd element: +80 € per element
 * - Optional material: +120 € per element
 * - Post fastening by selected method, per post
 * - Optional Kantenstein/Bordstein: +14 € per meter
 *
 * @param {Object} formData
 * @param {string|number} [formData.fenceElementsCount]
 * @param {string} [formData.fenceMaterialMode] - with | without
 * @param {string} [formData.fencePostFastening]
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
  const materialPrice = isWithFenceMaterial(formData.fenceMaterialMode)
    ? elementsCount * FENCE_MATERIAL_RATE_PER_ELEMENT
    : 0;
  const fasteningPrice = getFencePostCount(elementsCount) * getFencePostFasteningRate(formData.fencePostFastening);

  return fencePrice + materialPrice + fasteningPrice + kerbstonePrice;
}

module.exports = {
  calculateRollrasenVerlegenPrice,
  calculateFenceAssemblyPrice,
  FENCE_MATERIAL_RATE_PER_ELEMENT,
  FENCE_POST_FASTENING_RATES,
  getFencePostCount,
  getFencePostFasteningRate,
  isWithFenceMaterial
};
