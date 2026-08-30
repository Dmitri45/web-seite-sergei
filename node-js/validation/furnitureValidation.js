const {
	createValidator,
	normalizeChoice
} = require('./commonValidation');

function resolveFurnitureMode(payload = {}) {
	const rawMode = normalizeChoice(payload.mode || payload.furnitureMode);
	if (['new-assembly', 'old-disassembly', 'old-assembly', 'moving-helpers'].includes(rawMode)) return rawMode;

	const serviceLabel = normalizeChoice(payload.serviceLabel);
	if (serviceLabel === 'möbelmontage') return 'new-assembly';
	if (serviceLabel === 'möbelentsorgung') return 'old-disassembly';
	if (serviceLabel === 'umzugshilfe') return 'moving-helpers';

	return '';
}

function validateFurnitureItems(validator, payload = {}) {
	if (!Array.isArray(payload.moebelstuecke) || payload.moebelstuecke.length === 0) {
		validator.fields.moebelstuecke = 'Bitte geben Sie mindestens ein Möbelstück an.';
		return;
	}

	payload.moebelstuecke.forEach((item = {}, index) => {
		const prefix = `moebelstuecke.${index}`;
		validator.requiredString(`${prefix}.name`, item.name, 'Bitte geben Sie das Möbelstück an.');
		validator.requiredPositiveNumber(`${prefix}.length`, item.length, 'Bitte geben Sie eine gültige Länge ein.');
		validator.requiredPositiveNumber(`${prefix}.height`, item.height, 'Bitte geben Sie eine gültige Höhe ein.');
		validator.optionalNumber(`${prefix}.drawers`, item.drawers);
		validator.optionalNumber(`${prefix}.pullouts`, item.pullouts);
		validator.optionalNumber(`${prefix}.lighting`, item.lighting || item.lights);
	});
}

function validateFurnitureCalculation(payload = {}) {
	const validator = createValidator();
	const mode = resolveFurnitureMode(payload);

	validator.requiredString('serviceLabel', payload.serviceLabel, 'Bitte wählen Sie eine Möbelservice-Leistung.');

	if (!mode) {
		validator.fields.mode = 'Bitte wählen Sie eine gültige Möbelservice-Leistung.';
		return validator.result();
	}

	if (mode === 'moving-helpers') {
		validator.requiredString('date', payload.date, 'Bitte wählen Sie einen Termin.');
		validator.allowedValue('helpersCount', payload.helpersCount, ['1', '2', '3'], 'Bitte wählen Sie die Anzahl der Helfer.');
		validator.requiredPositiveNumber('workHours', payload.workHours, 'Bitte geben Sie die Anzahl der Stunden ein.');
		validator.requiredAddressPoint('transportFrom', payload.transportFrom, 'Bitte wählen Sie die Startadresse aus der Vorschlagsliste.');
		validator.requiredAddressPoint('transportTo', payload.transportTo, 'Bitte wählen Sie die Zieladresse aus der Vorschlagsliste.');
		return validator.result();
	}

	if (mode === 'new-assembly') {
		validator.requiredAddressPoint('einsatzort', payload.einsatzort, 'Bitte wählen Sie den Einsatzort aus der Vorschlagsliste.');
	}

	validateFurnitureItems(validator, payload);
	return validator.result();
}

module.exports = {
	validateFurnitureCalculation
};
