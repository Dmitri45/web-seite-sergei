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
 * Calculates price for "Feinputz / Fertigeschicht" (also used for "Feinputz").
 * Rates:
 * - Q1/Q2: 14 €/m²
 * - Q3: 21 €/m²
 * - Q4: 50 €/m²
 *
 * @param {Object} formData
 * @param {string|number} [formData.areaTotal]
 * @param {string} [formData.qualityLevel] - q1q2 | q3 | q4
 * @returns {number}
 */
function calculateFeinputzPrice(formData = {}) {
  const area = toNumber(formData.areaTotal);
  const quality = String(formData.qualityLevel || '').toLowerCase();

  const rateByQuality = {
    q1q2: 14,
    q3: 21,
    q4: 50
  };

  const rate = rateByQuality[quality] || 0;
  return area * rate;
}

/**
 * Calculates the drywall installation price.
 * Rate: 9 €/m (as provided by current requirements).
 *
 * @param {Object} formData
 * @param {string|number} [formData.areaTotal]
 * @returns {number}
 */
function calculateTrockenbauPrice(formData = {}) {
  const quantity = toNumber(formData.areaTotal);
  const rate = 9;
  return quantity * rate;
}

/**
 * Calculates the wall plastering price.
 * Rates:
 * - Grobeschicht (frei Hand, nicht lotgerecht): 12 €/m²
 * - Mit Wasserwaage, lotgerecht: 23 €/m²
 *
 * @param {Object} formData
 * @param {string|number} [formData.areaTotal]
 * @param {string} [formData.plasteringType]
 * @returns {number}
 */
function calculateWallPlasteringPrice(formData = {}) {
  const area = toNumber(formData.areaTotal);
  const plasteringType = String(formData.plasteringType || '').toLowerCase();

  const rateByType = {
    'grobeschicht-frei-hand': 12,
    'lotgerecht-wasserwaage': 23
  };

  const rate = rateByType[plasteringType] || 0;
  return area * rate;
}

module.exports = {
  calculateFeinputzPrice,
  calculateTrockenbauPrice,
  calculateWallPlasteringPrice
};
