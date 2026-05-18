const fs = require('fs');
const path = require('path');

function parseEnvLine(line) {
	const trimmed = line.trim();
	if (!trimmed || trimmed.startsWith('#')) return null;

	const separatorIndex = trimmed.indexOf('=');
	if (separatorIndex === -1) return null;

	const key = trimmed.slice(0, separatorIndex).trim();
	let value = trimmed.slice(separatorIndex + 1).trim();

	if (
		(value.startsWith('"') && value.endsWith('"')) ||
		(value.startsWith("'") && value.endsWith("'"))
	) {
		value = value.slice(1, -1);
	}

	return key ? { key, value } : null;
}

function loadEnvFile(filePath) {
	if (!fs.existsSync(filePath)) return;

	const content = fs.readFileSync(filePath, 'utf8');
	content.split(/\r?\n/).forEach((line) => {
		const parsed = parseEnvLine(line);
		if (!parsed || process.env[parsed.key] !== undefined) return;
		process.env[parsed.key] = parsed.value;
	});
}

function loadEnv() {
	loadEnvFile(path.join(__dirname, '..', '.env'));
	loadEnvFile(path.join(__dirname, '..', '..', '.env'));
}

module.exports = {
	loadEnv
};
