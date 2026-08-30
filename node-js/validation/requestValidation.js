const {
	createValidator,
	isBlank
} = require('./commonValidation');

function validateOfferRequestPayload(payload = {}) {
	if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
		return {
			ok: false,
			error: 'Validation failed',
			fields: {
				payload: 'Die Anfrage konnte nicht gelesen werden.'
			}
		};
	}

	const validator = createValidator();
	const customer = payload.customer || {};

	if (payload.requestType === 'offer' && payload.privacyPolicyAccepted !== true) {
		validator.fields.privacyPolicyAccepted = 'Bitte bestätigen Sie die Datenschutzerklärung.';
	}

	if (!customer || typeof customer !== 'object' || Array.isArray(customer)) {
		validator.fields.customer = 'Bitte geben Sie Ihre Kontaktdaten ein.';
		return validator.result();
	}

	validator.requiredString('customer.firstName', customer.firstName, 'Bitte geben Sie Ihren Vornamen ein.');
	validator.requiredString('customer.lastName', customer.lastName, 'Bitte geben Sie Ihren Nachnamen ein.');
	validator.email('customer.email', customer.email, 'Bitte geben Sie eine gültige E-Mail-Adresse ein.');
	validator.requiredString('customer.address', customer.address, 'Bitte wählen Sie Ihre Adresse aus der Vorschlagsliste.');

	if (!isBlank(customer.phone) && String(customer.phone).trim().length < 5) {
		validator.fields['customer.phone'] = 'Bitte geben Sie eine gültige Telefonnummer ein.';
	}

	return validator.result();
}

module.exports = {
	validateOfferRequestPayload
};
