function isBlank(value) {
	return String(value ?? '').trim() === '';
}

function normalizeChoice(value) {
	return String(value ?? '').trim().toLowerCase();
}

function parseNumber(value) {
	if (value === null || value === undefined || value === '') return NaN;
	const parsed = Number.parseFloat(String(value).replace(',', '.').trim());
	return Number.isFinite(parsed) ? parsed : NaN;
}

function hasAddressPoint(value) {
	return Boolean(
		value &&
		typeof value === 'object' &&
		!isBlank(value.address) &&
		value.coordinates &&
		Number.isFinite(Number(value.coordinates.lat)) &&
		Number.isFinite(Number(value.coordinates.lon))
	);
}

function createValidator() {
	const fields = {};

	function add(field, message) {
		if (!fields[field]) fields[field] = message;
	}

	return {
		fields,
		requiredString(field, value, message = 'Bitte füllen Sie dieses Feld aus.') {
			if (isBlank(value)) add(field, message);
		},
		requiredNumber(field, value, message = 'Bitte geben Sie eine gültige Zahl ein.', options = {}) {
			const number = parseNumber(value);
			const min = options.min ?? 0;
			if (!Number.isFinite(number) || number < min) add(field, message);
		},
		requiredPositiveNumber(field, value, message = 'Bitte geben Sie eine Zahl größer als 0 ein.') {
			this.requiredNumber(field, value, message, { min: Number.MIN_VALUE });
		},
		optionalNumber(field, value, message = 'Bitte geben Sie eine gültige Zahl ein.', options = {}) {
			if (isBlank(value)) return;
			this.requiredNumber(field, value, message, options);
		},
		allowedValue(field, value, allowedValues, message = 'Bitte wählen Sie eine gültige Option.') {
			if (!allowedValues.includes(normalizeChoice(value))) add(field, message);
		},
		requiredAddressPoint(field, value, message = 'Bitte wählen Sie eine Adresse aus der Vorschlagsliste.') {
			if (!hasAddressPoint(value)) add(field, message);
		},
		email(field, value, message = 'Bitte geben Sie eine gültige E-Mail-Adresse ein.') {
			const email = String(value ?? '').trim();
			if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) add(field, message);
		},
		result() {
			const ok = Object.keys(fields).length === 0;
			return ok
				? { ok: true, fields }
				: {
					ok: false,
					error: 'Validation failed',
					fields
				};
		}
	};
}

function validationError(fields) {
	return {
		ok: false,
		error: 'Validation failed',
		fields
	};
}

function sendValidationError(res, validation) {
	return res.status(400).json(validation);
}

function isEnabled(value) {
	return value === true || value === 'true' || value === 'yes' || value === 'on';
}

function hasAnyPositiveNumber(payload = {}, fields = []) {
	return fields.some((field) => parseNumber(payload[field]) > 0);
}

module.exports = {
	createValidator,
	hasAddressPoint,
	hasAnyPositiveNumber,
	isBlank,
	isEnabled,
	normalizeChoice,
	parseNumber,
	sendValidationError,
	validationError
};
