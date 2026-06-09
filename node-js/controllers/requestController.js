const { sendRequestEmail } = require('../services/brevoEmailService');
const { sendBrevoSmtpTestEmail } = require('../services/brevoSmtpService');

async function sendRequest(req, res) {
	try {
		const payload = req.body || {};

		if (!payload || typeof payload !== 'object') {
			return res.status(400).json({
				error: 'Invalid request payload'
			});
		}

		if (payload.requestType === 'offer' && payload.privacyPolicyAccepted !== true) {
			return res.status(400).json({
				ok: false,
				error: 'Privacy policy confirmation is required'
			});
		}

		const { result } = await sendRequestEmail(payload);

		return res.json({
			ok: true,
			message: 'Request email sent',
			brevo: result
		});
	} catch (error) {
		return res.status(500).json({
			ok: false,
			error: 'Error sending request email',
			details: error.message
		});
	}
}

module.exports = {
	sendRequest,
	async sendSmtpTest(req, res) {
		try {
			const result = await sendBrevoSmtpTestEmail();
			return res.json(result);
		} catch (error) {
			return res.status(500).json({
				ok: false,
				error: 'Error sending SMTP test email',
				details: error.message
			});
		}
	}
};
