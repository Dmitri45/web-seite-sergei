const {
	createValidator,
	isEnabled,
	normalizeChoice
} = require('./commonValidation');

const QUALITY_LEVELS = ['q1q2', 'q3', 'q4'];
const PLASTERING_TYPES = ['grobeschicht-frei-hand', 'lotgerecht-wasserwaage'];

function resolveTradesMode(payload = {}) {
	const rawMode = normalizeChoice(payload.mode || payload.tradesMode);
	if (['feinputz', 'wall-plastering', 'drywall'].includes(rawMode)) return rawMode;

	const serviceLabel = normalizeChoice(payload.serviceLabel);
	if (serviceLabel === 'feinputz / fertigbeschichtung') return 'feinputz';
	if (serviceLabel === 'wandverputz') return 'wall-plastering';
	if (serviceLabel === 'trockenbau') return 'drywall';

	return '';
}

function validateArea(validator, payload = {}) {
	validator.requiredPositiveNumber('areaTotal', payload.areaTotal, 'Bitte geben Sie die Fläche ein.');
}

function validateTradesCalculation(payload = {}) {
	const validator = createValidator();
	const mode = resolveTradesMode(payload);

	validator.requiredString('serviceLabel', payload.serviceLabel, 'Bitte wählen Sie eine Handwerksleistung.');
	validator.requiredAddressPoint('einsatzort', payload.einsatzort, 'Bitte wählen Sie den Einsatzort aus der Vorschlagsliste.');

	if (!mode) {
		validator.fields.mode = 'Bitte wählen Sie eine gültige Handwerksleistung.';
		return validator.result();
	}

	validateArea(validator, payload);

	if (mode === 'feinputz') {
		validator.allowedValue('qualityLevel', payload.qualityLevel, QUALITY_LEVELS, 'Bitte wählen Sie die Qualitätsstufe.');
	}

	if (mode === 'wall-plastering') {
		validator.allowedValue('plasteringType', payload.plasteringType, PLASTERING_TYPES, 'Bitte wählen Sie die Ausführungsart.');
	}

	if (mode === 'drywall') {
		if (isEnabled(payload.includeWallPlastering)) {
			validator.allowedValue('addonPlasteringType', payload.addonPlasteringType, PLASTERING_TYPES, 'Bitte wählen Sie die Ausführungsart für Wandverputz.');
		}

		if (isEnabled(payload.includeFinePlaster)) {
			validator.allowedValue('finePlasterQualityLevel', payload.finePlasterQualityLevel, QUALITY_LEVELS, 'Bitte wählen Sie die Qualitätsstufe für Feinputz.');
		}
	}

	if (mode === 'wall-plastering' && isEnabled(payload.includeFinePlaster)) {
		validator.allowedValue('finePlasterQualityLevel', payload.finePlasterQualityLevel, QUALITY_LEVELS, 'Bitte wählen Sie die Qualitätsstufe für Feinputz.');
	}

	return validator.result();
}

module.exports = {
	validateTradesCalculation
};
