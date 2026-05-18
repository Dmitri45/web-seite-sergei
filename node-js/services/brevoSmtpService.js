const net = require('net');
const tls = require('tls');

function getRequiredEnv(name) {
	const value = process.env[name];
	if (!value) throw new Error(`${name} is not configured`);
	return value;
}

function encodeBase64(value) {
	return Buffer.from(String(value), 'utf8').toString('base64');
}

function escapeSmtpBody(value) {
	return String(value || '').replace(/\r?\n/g, '\r\n').replace(/^\./gm, '..');
}

function createMessage({ from, to, subject, text }) {
	return [
		`From: ${from}`,
		`To: ${to}`,
		`Subject: ${subject}`,
		'Content-Type: text/plain; charset=UTF-8',
		'',
		escapeSmtpBody(text)
	].join('\r\n');
}

function createSmtpSession({ host, port }) {
	let socket = net.createConnection({ host, port });
	let buffer = '';

	function readResponse() {
		return new Promise((resolve, reject) => {
			const onData = (chunk) => {
				buffer += chunk.toString('utf8');
				const lines = buffer.split(/\r?\n/).filter(Boolean);
				const lastLine = lines[lines.length - 1] || '';

				if (/^\d{3} /.test(lastLine)) {
					socket.off('data', onData);
					socket.off('error', onError);
					const response = buffer;
					buffer = '';
					resolve(response);
				}
			};

			const onError = (error) => {
				socket.off('data', onData);
				reject(error);
			};

			socket.on('data', onData);
			socket.once('error', onError);
		});
	}

	async function command(line, expectedCodes = []) {
		socket.write(`${line}\r\n`);
		const response = await readResponse();
		const code = response.slice(0, 3);
		if (expectedCodes.length && !expectedCodes.includes(code)) {
			throw new Error(`SMTP command failed (${line}): ${response.trim()}`);
		}
		return response;
	}

	async function startTls(servername) {
		socket = tls.connect({ socket, servername });
		await new Promise((resolve, reject) => {
			socket.once('secureConnect', resolve);
			socket.once('error', reject);
		});
	}

	function close() {
		socket.end();
	}

	return { readResponse, command, startTls, close };
}

async function sendBrevoSmtpTestEmail() {
	const host = process.env.BREVO_SMTP_HOST || 'smtp-relay.brevo.com';
	const port = Number.parseInt(process.env.BREVO_SMTP_PORT || '587', 10);
	const login = getRequiredEnv('BREVO_SMTP_LOGIN');
	const password = getRequiredEnv('BREVO_SMTP_PASSWORD');
	const from = process.env.BREVO_SENDER_EMAIL || getRequiredEnv('BREVO_RECIPIENT_EMAIL');
	const to = getRequiredEnv('BREVO_RECIPIENT_EMAIL');
	const subject = 'Brevo SMTP Aktivierungstest';
	const text = 'Test-E-Mail zur Aktivierung/Überprüfung von Brevo SMTP.';

	const session = createSmtpSession({ host, port });

	try {
		await session.readResponse();
		await session.command('EHLO localhost', ['250']);
		await session.command('STARTTLS', ['220']);
		await session.startTls(host);
		await session.command('EHLO localhost', ['250']);
		await session.command('AUTH LOGIN', ['334']);
		await session.command(encodeBase64(login), ['334']);
		await session.command(encodeBase64(password), ['235']);
		await session.command(`MAIL FROM:<${from}>`, ['250']);
		await session.command(`RCPT TO:<${to}>`, ['250', '251']);
		await session.command('DATA', ['354']);
		await session.command(`${createMessage({ from, to, subject, text })}\r\n.`, ['250']);
		await session.command('QUIT', ['221']);

		return { ok: true, to, from, host, port };
	} finally {
		session.close();
	}
}

module.exports = {
	sendBrevoSmtpTestEmail
};
