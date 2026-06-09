const { getRouteDistanceFromBaseKm, getRouteDistancesFromBaseKm } = require('../calculators/transportCalculator');

const DEFAULT_SERVICE_RADIUS_KM = 40;
const SERVICE_RADIUS_50_KM_LABELS = new Set([
	'Küche aufbauen',
	'Küche abbauen',
	'Möbel aufbauen',
	'Möbel entsorgen'
]);
const SERVICE_RADIUS_120_KM_LABELS = new Set([
	'Hecken schneiden',
	'Rasen mähen',
	'Rollrasen verlegen',
	'Sträucher schneiden',
	'Kleine Bäume fällen',
	'Hecken entfernen',
	'Entsorgung von Grünschnitt'
]);
const SERVICE_AREA_UNLIMITED_LABELS = new Set([
	'Küchenanfertigung',
	'Möbelanfertigung'
]);

/**
 * Resolves the allowed service radius for a selected service.
 * @param {string} serviceLabel - Selected service label.
 * @returns {number|null} Radius in kilometers or null when no area check is required.
 */
function resolveServiceRadiusKm(serviceLabel = '') {
	const normalizedLabel = String(serviceLabel).trim();

	if (SERVICE_AREA_UNLIMITED_LABELS.has(normalizedLabel)) return null;
	if (SERVICE_RADIUS_50_KM_LABELS.has(normalizedLabel)) return 50;
	if (SERVICE_RADIUS_120_KM_LABELS.has(normalizedLabel)) return 120;
	return DEFAULT_SERVICE_RADIUS_KM;
}

/**
 * Checks whether an Einsatzort is inside the configured service radius.
 * @param {import('express').Request} req - Express request.
 * @param {import('express').Response} res - Express response.
 * @returns {Promise<void>}
 */
async function checkServiceArea(req, res) {
	const serviceLabel = String(req.body?.serviceLabel || '').trim();
	const radiusKm = resolveServiceRadiusKm(serviceLabel);
	const einsatzorte = Array.isArray(req.body?.einsatzorte) ? req.body.einsatzorte : null;
	const einsatzort = req.body?.einsatzort || req.body?.location || req.body;

	if (radiusKm === null) {
		res.json({
			ok: true,
			allowed: true,
			radiusKm: null,
			message: 'Für diese Dienstleistung ist keine Einsatzgebietsprüfung erforderlich.'
		});
		return;
	}

	if (einsatzorte) {
		await checkMultipleServiceAreas(res, einsatzorte, radiusKm);
		return;
	}

	const lat = Number(einsatzort?.coordinates?.lat);
	const lon = Number(einsatzort?.coordinates?.lon);

	if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
		res.status(400).json({
			ok: false,
			allowed: false,
			error: 'Invalid Einsatzort',
			message: 'Bitte wählen Sie den Einsatzort aus der Vorschlagsliste.'
		});
		return;
	}

	try {
		const distanceKm = await getRouteDistanceFromBaseKm(einsatzort);
		const allowed = distanceKm <= radiusKm;

		res.json({
			ok: true,
			allowed,
			distanceKm,
			radiusKm,
			message: allowed
				? 'Der Einsatzort liegt in unserem Einsatzgebiet.'
				: 'Der Einsatzort liegt außerhalb unseres Einsatzgebiets.'
		});
	} catch (error) {
		console.error('Fehler bei der Einsatzgebiet-Prüfung:', error.message);
		res.status(500).json({
			ok: false,
			allowed: false,
			error: 'Error checking service area',
			message: 'Das Einsatzgebiet konnte nicht geprüft werden. Bitte versuchen Sie es erneut.'
		});
	}
}

/**
 * Checks multiple Einsatzorte with one OpenRouteService matrix request.
 * @param {import('express').Response} res - Express response.
 * @param {Array<Object>} einsatzorte - Address points to check.
 * @param {number} radiusKm - Allowed radius in kilometers.
 * @returns {Promise<void>}
 */
async function checkMultipleServiceAreas(res, einsatzorte, radiusKm) {
	if (!einsatzorte.length || einsatzorte.some(point => {
		const lat = Number(point?.coordinates?.lat);
		const lon = Number(point?.coordinates?.lon);
		return !Number.isFinite(lat) || !Number.isFinite(lon);
	})) {
		res.status(400).json({
			ok: false,
			allowed: false,
			error: 'Invalid Einsatzorte',
			message: 'Bitte wählen Sie alle Adressen aus der Vorschlagsliste.'
		});
		return;
	}

	try {
		const distances = await getRouteDistancesFromBaseKm(einsatzorte);
		const results = einsatzorte.map((point, index) => {
			const distanceKm = distances[index];
			return {
				index,
				role: point.role || '',
				address: point.address || '',
				allowed: distanceKm <= radiusKm,
				distanceKm
			};
		});
		const allowed = results.every(result => result.allowed);

		res.json({
			ok: true,
			allowed,
			radiusKm,
			results,
			message: allowed
				? 'Alle Adressen liegen in unserem Einsatzgebiet.'
				: 'Eine oder mehrere Adressen liegen außerhalb unseres Einsatzgebiets.'
		});
	} catch (error) {
		console.error('Fehler bei der Einsatzgebiet-Prüfung:', error.message);
		res.status(500).json({
			ok: false,
			allowed: false,
			error: 'Error checking service area',
			message: 'Das Einsatzgebiet konnte nicht geprüft werden. Bitte versuchen Sie es erneut.'
		});
	}
}

module.exports = { checkServiceArea, resolveServiceRadiusKm };
