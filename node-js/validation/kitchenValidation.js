const {
	createValidator,
	isEnabled,
	normalizeChoice
} = require('./commonValidation');

const KITCHEN_TYPES = ['zeile', 'i-form', 'l-form', 'u-form'];
const YES_NO = ['yes', 'no'];

function validateKitchenCalculation(payload = {}) {
	const validator = createValidator();
	const serviceLabel = normalizeChoice(payload.serviceLabel);
	const isTransport = serviceLabel === 'küchentransport';
	const isDismantling = serviceLabel === 'küchendemontage';
	const condition = normalizeChoice(payload.kitchenCondition || payload.condition);
	const needsAssemblyDetails = isTransport || isDismantling
		? payload.kitchenAssembleAtDestination === 'yes'
		: true;

	validator.requiredString('serviceLabel', payload.serviceLabel, 'Bitte wählen Sie eine Küchenleistung.');
	validator.requiredString('date', payload.date, 'Bitte wählen Sie einen Termin.');

	if (isTransport) {
		validator.requiredAddressPoint('transportFrom', payload.transportFrom, 'Bitte wählen Sie die Startadresse aus der Vorschlagsliste.');
		validator.requiredAddressPoint('transportTo', payload.transportTo, 'Bitte wählen Sie die Zieladresse aus der Vorschlagsliste.');
		validator.requiredNumber('upperCabinets', payload.upperCabinets, 'Bitte geben Sie die Anzahl der Oberschränke ein.');
		validator.requiredNumber('lowerCabinets', payload.lowerCabinets, 'Bitte geben Sie die Anzahl der Unterschränke ein.');
		validator.optionalNumber('kitchenTransportTallCabinets', payload.kitchenTransportTallCabinets, 'Bitte geben Sie eine gültige Anzahl großer Schränke ein.');
	}

	if (!isTransport && !isDismantling) {
		validator.requiredAddressPoint('einsatzort', payload.einsatzort, 'Bitte wählen Sie den Einsatzort aus der Vorschlagsliste.');
	}

	if (isDismantling && normalizeChoice(payload.transportation) === 'yes') {
		validator.requiredAddressPoint('transportFrom', payload.transportFrom, 'Bitte wählen Sie die Startadresse aus der Vorschlagsliste.');
		validator.requiredAddressPoint('transportTo', payload.transportTo, 'Bitte wählen Sie die Zieladresse aus der Vorschlagsliste.');
	}

	if (isTransport) {
		validator.allowedValue('kitchenNeedsDismantling', payload.kitchenNeedsDismantling, YES_NO, 'Bitte wählen Sie, ob die Küche abgebaut werden soll.');
		validator.allowedValue('kitchenAssembleAtDestination', payload.kitchenAssembleAtDestination, YES_NO, 'Bitte wählen Sie, ob die Küche am neuen Ort aufgebaut werden soll.');
	}

	if (isDismantling) {
		validator.allowedValue('kitchenAssembleAtDestination', payload.kitchenAssembleAtDestination, YES_NO, 'Bitte wählen Sie, ob die Küche am neuen Ort aufgebaut werden soll.');
	}

	if (needsAssemblyDetails || isDismantling) {
		validator.allowedValue('kitchenType', payload.kitchenType, KITCHEN_TYPES, 'Bitte wählen Sie den Küchentyp.');

		if (!isTransport && !isDismantling && condition === 'new') {
			validator.requiredNumber('cabinetAssemblyUpperCabinets', payload.cabinetAssemblyUpperCabinets, 'Bitte geben Sie die Anzahl der Oberschränke ein.');
			validator.requiredNumber('cabinetAssemblyBaseCabinets', payload.cabinetAssemblyBaseCabinets, 'Bitte geben Sie die Anzahl der Unterschränke ein.');
			validator.requiredNumber('cabinetAssemblyTallCabinets', payload.cabinetAssemblyTallCabinets, 'Bitte geben Sie die Anzahl der großen Schränke ein.');
		} else {
			validator.requiredNumber('upperCabinets', payload.upperCabinets, 'Bitte geben Sie die Anzahl der Oberschränke ein.');
			validator.requiredNumber('lowerCabinets', payload.lowerCabinets, 'Bitte geben Sie die Anzahl der Unterschränke ein.');
		}
	}

	if (needsAssemblyDetails) {
		validator.allowedValue('worktopPickup', payload.worktopPickup, YES_NO, 'Bitte wählen Sie, ob die Arbeitsplatte abgeholt werden soll.');

		if (condition !== 'new') {
			validator.allowedValue('worktopAdjust', payload.worktopAdjust, YES_NO, 'Bitte wählen Sie, ob die Arbeitsplatte angepasst werden soll.');
		}
	}

	if (isEnabled(payload.assembly)) {
		validator.requiredNumber('cabinetAssemblyBaseCabinets', payload.cabinetAssemblyBaseCabinets, 'Bitte geben Sie die Anzahl der Unterschränke ein.');
		validator.requiredNumber('cabinetAssemblyTallCabinets', payload.cabinetAssemblyTallCabinets, 'Bitte geben Sie die Anzahl der großen Schränke ein.');
		validator.requiredNumber('cabinetAssemblyUpperCabinets', payload.cabinetAssemblyUpperCabinets, 'Bitte geben Sie die Anzahl der Oberschränke ein.');
	}

	return validator.result();
}

module.exports = {
	validateKitchenCalculation
};
