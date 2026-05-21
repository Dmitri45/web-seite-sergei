const { getRouteDistanceFromBaseKm, getRouteDistancesFromBaseKm } = require('../calculators/transportCalculator');

const DEFAULT_SERVICE_RADIUS_KM = 120;

/**
 * Checks whether an Einsatzort is inside the configured service radius.
 * @param {import('express').Request} req - Express request.
 * @param {import('express').Response} res - Express response.
 * @returns {Promise<void>}
 */
async function checkServiceArea(req, res) {
	const radiusKm = Number(process.env.SERVICE_RADIUS_KM) || DEFAULT_SERVICE_RADIUS_KM;
	const einsatzorte = Array.isArray(req.body?.einsatzorte) ? req.body.einsatzorte : null;
	const einsatzort = req.body?.einsatzort || req.body?.location || req.body;

	if (einsatzorte) {
		await checkMultipleServiceAreas(req, res, einsatzorte, radiusKm);
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
 * @param {import('express').Request} req - Express request.
 * @param {import('express').Response} res - Express response.
 * @param {Array<Object>} einsatzorte - Address points to check.
 * @param {number} radiusKm - Allowed radius in kilometers.
 * @returns {Promise<void>}
 */
async function checkMultipleServiceAreas(req, res, einsatzorte, radiusKm) {
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

module.exports = { checkServiceArea };
