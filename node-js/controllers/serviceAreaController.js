const { getRouteDistanceFromBaseKm } = require('../calculators/transportCalculator');

const DEFAULT_SERVICE_RADIUS_KM = 120;

/**
 * Checks whether an Einsatzort is inside the configured service radius.
 * @param {import('express').Request} req - Express request.
 * @param {import('express').Response} res - Express response.
 * @returns {Promise<void>}
 */
async function checkServiceArea(req, res) {
	const radiusKm = Number(process.env.SERVICE_RADIUS_KM) || DEFAULT_SERVICE_RADIUS_KM;
	const einsatzort = req.body?.einsatzort || req.body?.location || req.body;
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
				: `Der Einsatzort liegt ${distanceKm} km entfernt und damit außerhalb unseres Einsatzgebiets von ${radiusKm} km.`
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
