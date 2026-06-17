const GEOAPIFY_AUTOCOMPLETE_URL = 'https://api.geoapify.com/v1/geocode/autocomplete';
const CACHE_TTL_MS = 10 * 60 * 1000;
const suggestionCache = new Map();

function getGeoapifyApiKey() {
	const apiKey = process.env.GEOAPIFY_API_KEY;
	if (!apiKey) {
		throw new Error('GEOAPIFY_API_KEY is not configured');
	}
	return apiKey;
}

function mapFeature(feature = {}) {
	const properties = feature.properties || {};
	const formatted = properties.formatted || '';
	const lat = Number(properties.lat);
	const lon = Number(properties.lon);

	if (!formatted || !Number.isFinite(lat) || !Number.isFinite(lon)) return null;

	return {
		properties: {
			formatted,
			lat,
			lon,
			city: properties.city || properties.town || properties.village || '',
			postcode: properties.postcode || '',
			street: properties.street || '',
			housenumber: properties.housenumber || '',
			country: properties.country || '',
			country_code: properties.country_code || ''
		}
	};
}

async function autocomplete(req, res) {
	try {
		const text = String(req.query.text || '').trim();
		if (text.length < 2) {
			return res.json({ results: [] });
		}

		const limit = Math.min(
			8,
			Math.max(1, Number.parseInt(String(req.query.limit || '5'), 10) || 5)
		);
		const cacheKey = `${text.toLowerCase()}::${limit}`;
		const cached = suggestionCache.get(cacheKey);
		if (cached && cached.expiresAt > Date.now()) {
			return res.json({ results: cached.results });
		}

		const url = new URL(GEOAPIFY_AUTOCOMPLETE_URL);
		url.searchParams.set('text', text);
		url.searchParams.set('apiKey', getGeoapifyApiKey());
		url.searchParams.set('limit', String(limit));
		url.searchParams.set('lang', 'de');
		url.searchParams.set('filter', 'countrycode:de');

		const response = await fetch(url);
		const body = await response.json().catch(() => ({}));

		if (!response.ok) {
			return res.status(response.status).json({
				error: 'Error fetching address suggestions',
				details: body
			});
		}

		const results = Array.isArray(body.features)
			? body.features.map(mapFeature).filter(Boolean)
			: [];
		suggestionCache.set(cacheKey, {
			results,
			expiresAt: Date.now() + CACHE_TTL_MS
		});

		return res.json({ results });
	} catch (error) {
		return res.status(500).json({
			error: 'Error fetching address suggestions',
			details: error.message
		});
	}
}

module.exports = {
	autocomplete
};
