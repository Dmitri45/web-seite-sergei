const { BrevoClient } = require('@getbrevo/brevo');

const DEFAULT_SENDER_NAME = 'S.K SERVICE';
const DEFAULT_SUBJECT = 'Neue Anfrage von der Website';

function getRequiredEnv(name) {
	const value = process.env[name];
	if (!value) {
		throw new Error(`${name} is not configured`);
	}
	return value;
}

function buildBrevoClient() {
	return new BrevoClient({
		apiKey: getRequiredEnv('BREVO_API_KEY')
	});
}

function buildFallbackText(payload) {
	return [
		'Neue Anfrage von der Website',
		'',
		JSON.stringify(payload, null, 2)
	].join('\n');
}

function escapeHtml(value) {
	return String(value ?? '')
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;')
		.replace(/'/g, '&#039;');
}

function formatEuro(value) {
	const amount = Number(value || 0);
	return `${amount.toLocaleString('de-DE', {
		minimumFractionDigits: 0,
		maximumFractionDigits: 2
	})} €`;
}

function formatValue(value) {
	if (value === null || value === undefined || value === '') return '';
	if (typeof value === 'object') return escapeHtml(JSON.stringify(value));
	return escapeHtml(value);
}

function row(label, value) {
	const formattedValue = formatValue(value);
	if (!formattedValue) return '';
	return `<tr><td style="padding:6px 0;color:#666;">${escapeHtml(label)}</td><td style="padding:6px 0;text-align:right;"><b>${formattedValue}</b></td></tr>`;
}

function sectionText(value) {
	if (!value) return '';
	return `<div style="background:#fff;padding:12px;border-radius:8px;white-space:pre-wrap;">${escapeHtml(value)}</div>`;
}

function buildCustomerHtml(customer = {}) {
	return [
		row('Name', `${customer.firstName || ''} ${customer.lastName || ''}`.trim()),
		row('Telefon', customer.phone),
		row('E-Mail', customer.email),
		row('Adresse', customer.address)
	].join('');
}

function buildTransportHtml(payload = {}) {
	const rows = [
		row('Transport', payload.transportation),
		row('Von', payload.transportFrom?.address)
	];

	if (Array.isArray(payload.transportVia) && payload.transportVia.length) {
		const viaRows = payload.transportVia
			.filter((point) => point?.address)
			.map((point, index) => row(`Zwischenadresse ${index + 1}`, point.address))
			.join('');
		rows.push(viaRows);
	}

	rows.push(row('Nach', payload.transportTo?.address));
	return rows.join('');
}

function buildDetailsHtml(payload = {}) {
	const rows = [
		row('Service', payload.serviceLabel),
		row('Anfrage-Typ', payload.requestType),
		row('Termin', payload.date),
		row('Zeitfenster', payload.timeWindow),
		row('Besichtigungsort', payload.address),
		row('Küche vor Transport abbauen', payload.kitchenNeedsDismantling),
		row('Aufbau am neuen Ort', payload.kitchenAssembleAtDestination),
		row('Fläche', payload.areaTotal ? `${payload.areaTotal} m²` : ''),
		row('Länge', payload.length ? `${payload.length} m` : ''),
		row('Breite', payload.width ? `${payload.width} m` : ''),
		row('Berechnete Fläche', !payload.areaTotal && payload.length && payload.width ? `${Number(payload.length) * Number(payload.width)} m²` : ''),
		row('Qualitätsstufe', payload.qualityLevel),
		row('Ausführungsart', payload.plasteringType),
		row('Helfer', payload.helpersCount),
		row('Stunden', payload.workHours),
		row('Transport von', payload.transportFromAddress),
		row('Transport nach', payload.transportToAddress),
		row('Zaunelemente', payload.fenceElementsCount),
		row('Kantenstein / Bordstein', payload.withKerbstone),
		row('Kantenstein Länge', payload.kerbstoneLengthM ? `${payload.kerbstoneLengthM} m` : '')
	];

	const transportHtml = buildTransportHtml(payload);
	if (transportHtml) rows.push(transportHtml);

	return rows.join('');
}

function buildFurnitureHtml(payload = {}) {
	if (!Array.isArray(payload.moebelstuecke) || !payload.moebelstuecke.length) return '';

	return payload.moebelstuecke.map((item, index) => {
		const rows = [
			row('Name', item.name || `Möbelstück ${index + 1}`),
			row('Länge', item.length ? `${item.length} m` : ''),
			row('Breite', item.width ? `${item.width} m` : ''),
			row('Höhe', item.height ? `${item.height} m` : ''),
			row('Schubladen', item.drawers),
			row('Ausziehboden', item.pullouts),
			row('Beleuchtung', item.lighting || item.lights)
		].join('');

		return `<div style="border-bottom:1px solid #ddd;padding:10px 0;"><table style="width:100%;border-collapse:collapse;">${rows}</table></div>`;
	}).join('');
}

function buildPricesHtml(prices = {}) {
	const itemRows = Array.isArray(prices.items)
		? prices.items.map((item) => row(item.name || 'Position', formatEuro(item.price))).join('')
		: '';

	return [
		itemRows,
		row('Montage / Aufbau', prices.assemblyPrice ? formatEuro(prices.assemblyPrice) : ''),
		row('Abbau', prices.disassemblyPrice ? formatEuro(prices.disassemblyPrice) : ''),
		row('Gartenpreis', prices.gardenPrice ? formatEuro(prices.gardenPrice) : ''),
		row('Transport', prices.transportPrice ? formatEuro(prices.transportPrice) : ''),
		row('Anfahrt', prices.arrivalPrice ? formatEuro(prices.arrivalPrice) : ''),
		row('Abfahrt', prices.departurePrice ? formatEuro(prices.departurePrice) : ''),
		`<tr><td style="padding-top:14px;font-size:20px;font-weight:bold;">Gesamtpreis</td><td style="padding-top:14px;text-align:right;font-size:20px;font-weight:bold;color:#1d7a1d;">${formatEuro(prices.totalPrice)}</td></tr>`
	].join('');
}

function buildTemplateParams(payload = {}) {
	return {
		...payload,
		email: {
			title: 'Neue Anfrage',
			subtitle: [payload.serviceLabel, payload.requestType].filter(Boolean).join(' · '),
			customerHtml: buildCustomerHtml(payload.customer),
			detailsHtml: buildDetailsHtml(payload),
			furnitureHtml: buildFurnitureHtml(payload),
			notesHtml: sectionText(payload.notes),
			pricesHtml: payload.prices ? buildPricesHtml(payload.prices) : '',
			submittedAt: payload.submittedAt || new Date().toISOString()
		}
	};
}

function buildEmailRequest(payload) {
	const recipientEmail = getRequiredEnv('BREVO_RECIPIENT_EMAIL');
	const senderEmail = process.env.BREVO_SENDER_EMAIL || recipientEmail;
	const senderName = process.env.BREVO_SENDER_NAME || DEFAULT_SENDER_NAME;
	const templateId = Number.parseInt(process.env.BREVO_TEMPLATE_ID || '', 10);
	const params = buildTemplateParams(payload);

	const emailRequest = {
		sender: {
			name: senderName,
			email: senderEmail
		},
		to: [{ email: recipientEmail }],
		params
	};

	if (Number.isInteger(templateId) && templateId > 0) {
		emailRequest.templateId = templateId;
		return emailRequest;
	}

	emailRequest.subject = process.env.BREVO_SUBJECT || DEFAULT_SUBJECT;
	emailRequest.textContent = buildFallbackText(payload);
	return emailRequest;
}

async function sendRequestEmail(payload) {
	const brevo = buildBrevoClient();
	const emailRequest = buildEmailRequest(payload);
	const result = await brevo.transactionalEmails.sendTransacEmail(emailRequest);

	return {
		result,
		emailRequest
	};
}

module.exports = {
	sendRequestEmail,
	buildEmailRequest
};
