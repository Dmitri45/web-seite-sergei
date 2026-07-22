const { sendCustomRequestEmail } = require('../services/brevoEmailService');

function isBlank(value) {
	return !String(value || '').trim();
}

function normalizeCustomRequestPayload(payload = {}) {
	return {
		requestType: 'custom-request',
		serviceLabel: 'Sonstige Anfrage',
		pageTitle: String(payload.pageTitle || '').trim(),
		pageUrl: String(payload.pageUrl || '').trim(),
		customer: {
			firstName: String(payload.firstName || '').trim(),
			lastName: String(payload.lastName || '').trim(),
			email: String(payload.email || '').trim(),
			phone: String(payload.phone || '').trim()
		},
		message: String(payload.message || '').trim(),
		privacyPolicyAccepted: payload.privacyPolicyAccepted === true
	};
}

async function sendCustomRequest(req, res) {
	try {
		const payload = normalizeCustomRequestPayload(req.body || {});

		if (
			isBlank(payload.customer.firstName) ||
			isBlank(payload.customer.lastName) ||
			isBlank(payload.customer.email) ||
			isBlank(payload.customer.phone) ||
			isBlank(payload.message)
		) {
			return res.status(400).json({
				ok: false,
				error: 'Bitte füllen Sie alle Pflichtfelder aus.'
			});
		}

		if (!payload.privacyPolicyAccepted) {
			return res.status(400).json({
				ok: false,
				error: 'Bitte bestätigen Sie die Datenschutzerklärung.'
			});
		}

		const { result } = await sendCustomRequestEmail(payload);

		return res.json({
			ok: true,
			message: 'Custom request email sent',
			brevo: result
		});
	} catch (error) {
		return res.status(500).json({
			ok: false,
			error: 'Error sending custom request email',
			details: error.message
		});
	}
}

module.exports = {
	sendCustomRequest
};
