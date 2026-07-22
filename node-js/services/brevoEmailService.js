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
	})} € inkl. MwSt.`;
}

function formatValue(value) {
	if (value === null || value === undefined || value === '') return '';
	if (typeof value === 'boolean') return value ? 'Ja' : 'Nein';
	if (typeof value === 'object') return escapeHtml(JSON.stringify(value, null, 2));
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

function formatChoice(value) {
	const choices = {
		yes: 'Ja',
		no: 'Nein',
		with: 'Ja',
		without: 'Nein',
		true: 'Ja',
		false: 'Nein',
		morning: 'Vormittag',
		afternoon: 'Nachmittag',
		evening: 'Abend',
		new: 'Neu',
		used: 'Bestehend / gebraucht',
		dismantle: 'Abbau',
		assemble: 'Aufbau',
		both: 'Abbau und Aufbau',
		none: 'Nicht erforderlich',
		q1q2: 'Q1 / Q2',
		q3: 'Q3',
		q4: 'Q4',
		'zeile': 'I-Form',
		'l-form': 'L-Form',
		'u-form': 'U-Form',
		'grobeschicht-frei-hand': 'Grobeschicht frei Hand, nicht lotgerecht',
		'lotgerecht-wasserwaage': 'Mit Wasserwaage, lotgerecht'
	};
	const normalized = String(value ?? '').trim();
	return choices[normalized] || value;
}

const FIELD_LABELS = {
	serviceLabel: 'Service',
	date: 'Termin',
	timeWindow: 'Zeitfenster',
	address: 'Besichtigungsort',
	kitchenCondition: 'Küchenzustand',
	condition: 'Küchenzustand',
	kitchenType: 'Küchentyp',
	upperCabinets: 'Anzahl Oberschränke',
	lowerCabinets: 'Anzahl Unterschränke',
	cabinetAssemblyBaseCabinets: 'Anzahl der Unterschränke',
	cabinetAssemblyTallCabinets: 'Große Schränke',
	cabinetAssemblyUpperCabinets: 'Oberschränke',
	cabinetassemblybasecabinets: 'Anzahl der Unterschränke',
	cabinetassemblytallcabinets: 'Große Schränke',
	cabinetassemblyuppercabinets: 'Oberschränke',
	assembly: 'Schränke zusammenbauen',
	dismantling: 'Abbau erforderlich',
	abbau: 'Abbau erforderlich',
	kitchenNeedsDismantling: 'Küche vor Transport abbauen',
	kitchenAssembleAtDestination: 'Aufbau am neuen Ort',
	worktopAdjust: 'Arbeitsplatte zuschneiden/anpassen',
	worktopMaterial: 'Arbeitsplatten-Material',
	worktopPickup: 'Arbeitsplatte vorhanden/Abholung',
	transportation: 'Transport',
	transportFromAddress: 'Transport von',
	transportToAddress: 'Transport nach',
	distanceToEntrance: 'Entfernung zum Eingang',
	helpersCount: 'Helfer',
	workHours: 'Stunden',
	additionalNotes: 'Zusätzliche Hinweise',
	areaTotal: 'Fläche',
	length: 'Länge',
	width: 'Breite',
	height: 'Höhe',
	currentHeight: 'Aktuelle Höhe',
	targetHeight: 'Zielhöhe',
	currentWidth: 'Aktuelle Breite',
	targetWidth: 'Zielbreite',
	currentLength: 'Aktuelle Länge',
	currentShapeMode: 'Aktuelle Form-Erfassung',
	currentShapeType: 'Aktuelle Form',
	targetShapeMode: 'Zielform-Erfassung',
	targetShapeType: 'Zielform',
	qualityLevel: 'Qualitätsstufe',
	finePlasterQualityLevel: 'Qualitätsstufe Feinputz',
	plasteringType: 'Ausführungsart',
	addonPlasteringType: 'Ausführungsart Wandverputz',
	includeFinePlaster: 'Feinputz zusätzlich',
	includeWallPlastering: 'Wandverputz zusätzlich',
	withSanding: 'Schleifen',
	withPressureWashing: 'Hochdruckreinigung',
	roofCoating: 'Dachbeschichtung',
	withGroundPreparation: 'Bodenvorbereitung',
	groundType: 'Untergrund',
	distanceToGarden: 'Entfernung zum Garten',
	withDisposal: 'Entsorgung',
	hedgeHeight: 'Heckenhöhe',
	hedgeLength: 'Heckenlänge',
	hedgeWidth: 'Heckenbreite',
	rootDiameter: 'Wurzeldurchmesser',
	treeDiameter: 'Baumdurchmesser',
	withRootRemoval: 'Wurzelentfernung',
	estimatedVolume: 'Geschätztes Volumen',
	currentGroundType: 'Aktueller Untergrund',
	fenceElementsCount: 'Zaunelemente',
	withKerbstone: 'Kantenstein / Bordstein',
	kerbstoneLengthM: 'Kantenstein Länge',
	closedSides: 'Geschlossene Seiten',
	workDescription: 'Arbeitsbeschreibung',
	branchThickness: 'Astdicke',
	branchLength: 'Astlänge',
	branchCount: 'Anzahl Äste',
	notes: 'Notizen'
};

const SKIPPED_DETAIL_KEYS = new Set([
	'requestType',
	'submittedAt',
	'source',
	'mode',
	'privacyPolicyAccepted',
	'customer',
	'prices',
	'moebelstuecke',
	'transportFrom',
	'transportVia',
	'transportTo',
	'einsatzort'
]);

const ALIAS_DETAIL_KEYS = new Set([
	'condition',
	'worktopMaterial'
]);

function normalizeDetailKey(key) {
	return String(key || '').replace(/[^a-z0-9]/gi, '').toLowerCase();
}

function fieldLabel(key) {
	if (FIELD_LABELS[key]) return FIELD_LABELS[key];
	const normalizedKey = normalizeDetailKey(key);
	if (FIELD_LABELS[normalizedKey]) return FIELD_LABELS[normalizedKey];
	const indexedMatch = String(key || '').match(/^(transportItem|furnitureItem)([A-Za-z]+)_(\d+)$/);
	if (indexedMatch) {
		const [, group, field, rawIndex] = indexedMatch;
		const groupLabel = group === 'transportItem' ? 'Transportposition' : 'Möbelstück';
		const index = Number.parseInt(rawIndex, 10) + 1;
		const fieldLabels = {
			Name: 'Name',
			Length: 'Länge',
			Width: 'Breite',
			Height: 'Höhe',
			Drawers: 'Schubladen',
			Pullouts: 'Ausziehboden',
			Lighting: 'Beleuchtung',
			AssemblyNeed: 'Ab-/Aufbau'
		};
		return `${groupLabel} ${index}: ${fieldLabels[field] || field}`;
	}
	return String(key || '')
		.replace(/_/g, ' ')
		.replace(/([a-z])([A-Z])/g, '$1 $2')
		.replace(/\b\w/g, char => char.toUpperCase());
}

function formatFieldValue(key, value) {
	if (value === null || value === undefined || value === '') return '';
	if (key === 'areaTotal') return `${value} m²`;
	if (key === 'length' || key === 'width' || key === 'height') return `${value} m`;
	if (key.endsWith('Height') || key.endsWith('Width') || key.endsWith('Length')) return `${value} m`;
	if (key === 'distanceToGarden' || key === 'distanceToEntrance') return `${value} m`;
	if (key === 'kerbstoneLengthM') return `${value} m`;
	if (typeof value === 'object') {
		if (value.address) return value.address;
		return JSON.stringify(value, null, 2);
	}
	return formatChoice(value);
}

function detailRow(key, value, renderedKeys) {
	const formattedValue = formatFieldValue(key, value);
	if (!formattedValue) return '';

	renderedKeys.add(key);
	renderedKeys.add(normalizeDetailKey(key));
	const label = fieldLabel(key);
	renderedKeys.add(label);
	return row(label, formattedValue);
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
	const renderedKeys = new Set();
	const priorityKeys = [
		'serviceLabel',
		'date',
		'timeWindow',
		'address',
		'kitchenCondition',
		'kitchenType',
		'assembly',
		'upperCabinets',
		'lowerCabinets',
		'cabinetAssemblyBaseCabinets',
		'cabinetAssemblyTallCabinets',
		'cabinetAssemblyUpperCabinets',
		'kitchenNeedsDismantling',
		'kitchenAssembleAtDestination',
		'worktopAdjust',
		'worktopPickup',
		'transportation',
		'areaTotal',
		'length',
		'width',
		'height',
		'qualityLevel',
		'plasteringType',
		'helpersCount',
		'workHours',
		'fenceElementsCount',
		'withKerbstone',
		'kerbstoneLengthM'
	];

	const rows = priorityKeys.map(key => detailRow(key, payload[key], renderedKeys));

	if (!payload.areaTotal && payload.length && payload.width) {
		rows.push(row('Berechnete Fläche', `${Number(payload.length) * Number(payload.width)} m²`));
	}

	const transportHtml = buildTransportHtml(payload);
	if (transportHtml) rows.push(transportHtml);

	Object.entries(payload).forEach(([key, value]) => {
		const isDuplicateAlias =
			(key === 'condition' && payload.kitchenCondition) ||
			(key === 'worktopMaterial' && payload.worktopAdjust);

		if (
			renderedKeys.has(key) ||
			renderedKeys.has(normalizeDetailKey(key)) ||
			renderedKeys.has(fieldLabel(key)) ||
			(ALIAS_DETAIL_KEYS.has(key) && isDuplicateAlias) ||
			SKIPPED_DETAIL_KEYS.has(key)
		) return;
		rows.push(detailRow(key, value, renderedKeys));
	});

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
		row('Anfahrt / Abfahrt', prices.travelPrice ? formatEuro(prices.travelPrice) : ''),
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
			pricesHtml: payload.prices ? buildPricesHtml(payload.prices) : ''
		}
	};
}

function buildCustomRequestTemplateParams(payload = {}) {
	const customer = payload.customer || {};
	const detailsHtml = [
		row('Anfragetyp', 'Sonstige Leistung auf Anfrage'),
		row('Seite', payload.pageTitle)
	].join('');

	return {
		...payload,
		serviceLabel: payload.serviceLabel || 'Sonstige Anfrage',
		email: {
			title: 'Neue Anfrage für eine sonstige Leistung',
			subtitle: 'Nicht gefundene Leistung · Anfrage',
			customerHtml: [
				row('Name', `${customer.firstName || ''} ${customer.lastName || ''}`.trim()),
				row('Telefon', customer.phone),
				row('E-Mail', customer.email)
			].join(''),
			detailsHtml,
			furnitureHtml: '',
			notesHtml: sectionText(payload.message),
			pricesHtml: ''
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

function buildCustomRequestEmailRequest(payload) {
	const recipientEmail = getRequiredEnv('BREVO_RECIPIENT_EMAIL');
	const senderEmail = process.env.BREVO_SENDER_EMAIL || recipientEmail;
	const senderName = process.env.BREVO_SENDER_NAME || DEFAULT_SENDER_NAME;
	const templateId = Number.parseInt(process.env.BREVO_TEMPLATE_ID || '', 10);
	const params = buildCustomRequestTemplateParams(payload);

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

	emailRequest.subject = 'Neue Anfrage für eine sonstige Leistung';
	emailRequest.textContent = buildFallbackText(params);
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

async function sendCustomRequestEmail(payload) {
	const brevo = buildBrevoClient();
	const emailRequest = buildCustomRequestEmailRequest(payload);
	const result = await brevo.transactionalEmails.sendTransacEmail(emailRequest);

	return {
		result,
		emailRequest
	};
}

module.exports = {
	sendRequestEmail,
	sendCustomRequestEmail,
	buildCustomRequestEmailRequest,
	buildEmailRequest
};
