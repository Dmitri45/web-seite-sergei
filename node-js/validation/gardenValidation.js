const {
	createValidator,
	normalizeChoice
} = require('./commonValidation');

const FENCE_TYPES = [
	'wood-fence',
	'wpc-fence',
	'metal-fence',
	'aluminium-fence',
	'concrete-fence'
];
const POST_FASTENING_TYPES = ['concrete', 'post-shoe', 'wall-holder'];
const WITH_WITHOUT = ['with', 'without'];

function validateGardenCalculation(payload = {}) {
	const validator = createValidator();
	const mode = normalizeChoice(payload.mode || payload.gardenMode);
	const serviceLabel = normalizeChoice(payload.serviceLabel);
	const isFence = mode === 'fence-assembly' || serviceLabel === 'zaunmontage';

	if (!isFence) {
		validator.fields.mode = 'Bitte wählen Sie eine gültige Gartenleistung.';
		return validator.result();
	}

	validator.requiredString('serviceLabel', payload.serviceLabel, 'Bitte wählen Sie eine Gartenleistung.');
	validator.requiredPositiveNumber('fenceElementsCount', payload.fenceElementsCount, 'Bitte geben Sie die Anzahl der Zaunelemente ein.');
	validator.allowedValue('fenceMaterialType', payload.fenceMaterialType, FENCE_TYPES, 'Bitte wählen Sie die Zaunart.');
	validator.allowedValue('fencePostFastening', payload.fencePostFastening, POST_FASTENING_TYPES, 'Bitte wählen Sie die Pfostenbefestigung.');
	validator.allowedValue('postFasteningMaterialMode', payload.postFasteningMaterialMode, WITH_WITHOUT, 'Bitte wählen Sie, ob Befestigungsmaterial benötigt wird.');
	validator.allowedValue('withKerbstone', payload.withKerbstone, WITH_WITHOUT, 'Bitte wählen Sie, ob Kantenstein/Bordstein benötigt wird.');

	if (normalizeChoice(payload.withKerbstone) === 'with') {
		validator.requiredPositiveNumber('kerbstoneLengthM', payload.kerbstoneLengthM, 'Bitte geben Sie die Länge für Kantenstein/Bordstein ein.');
	}

	if (normalizeChoice(payload.transportation) === 'yes') {
		validator.requiredAddressPoint('transportFrom', payload.transportFrom, 'Bitte wählen Sie die Abholadresse aus der Vorschlagsliste.');
		validator.requiredAddressPoint('transportTo', payload.transportTo, 'Bitte wählen Sie den Einsatzort aus der Vorschlagsliste.');
	} else {
		validator.requiredAddressPoint('einsatzort', payload.einsatzort, 'Bitte wählen Sie den Einsatzort aus der Vorschlagsliste.');
	}

	return validator.result();
}

module.exports = {
	validateGardenCalculation
};
