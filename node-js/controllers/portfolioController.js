const { getPortfolio } = require('../services/portfolioService');

async function listPortfolio(req, res) {
	try {
		const portfolio = await getPortfolio();
		res.set('Cache-Control', 'public, max-age=60');
		return res.json({
			ok: true,
			...portfolio
		});
	} catch (error) {
		return res.status(500).json({
			ok: false,
			error: 'Error loading portfolio',
			details: error.message
		});
	}
}

module.exports = {
	listPortfolio
};
