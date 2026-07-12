/**
 * Renders the two service overview pages from the shared service catalog.
 */
(function() {
	const OFFER_ONLY_SERVICES = new Set([
		'Möbelentsorgung',
		'Kleintransporte',
		'Fugenreinigung',
		'Heckenschnitt',
		'Rasenmähen',
		'Rollrasenverlegung',
		'Wurzelentfernung',
		'Pflasterarbeiten',
		'Minibaggerarbeiten',
		'Gartenhausmontage',
		'Gartenhaus-Renovierung',
		'Heckenentfernung',
		'Baumfällung (kleine Bäume)',
		'Strauchschnitt',
		'Grünschnittentsorgung',
		'Überdachungsmontage',
		'Holzhäckselarbeiten'
	]);
	const APPOINTMENT_SERVICES = new Set(['Küchenanfertigung', 'Möbelanfertigung']);
	const CATEGORY_ORDER = ['kitchen', 'furniture', 'trades', 'garden'];

	/**
	 * Checks whether a service should be shown on the offer-only page.
	 * @param {Object} service - Service catalog entry.
	 * @returns {boolean} True when the service has no direct calculator.
	 */
	function isOfferService(service) {
		return OFFER_ONLY_SERVICES.has(service.label) || APPOINTMENT_SERVICES.has(service.label);
	}

	/**
	 * Builds one category group for the selected overview type.
	 * @param {string} categoryKey - Shared service category key.
	 * @param {string} overviewType - "calculable" or "offer".
	 * @returns {string} HTML markup.
	 */
	function getServiceGroupTemplate(categoryKey, overviewType) {
		const category = SERVICE_CATEGORY_META[categoryKey];
		const services = (SERVICES_BY_CATEGORY[categoryKey] || []).filter((service) => {
			const offerService = isOfferService(service);
			return overviewType === 'offer' ? offerService : !offerService;
		});

		if (!services.length) return '';

		return `
			<section class="service-overview-group" aria-labelledby="service-overview-${categoryKey}">
				<div class="service-overview-group__head">
					<div>
						<div class="section-kicker">${category.title}</div>
						<h3 id="service-overview-${categoryKey}">${category.title}</h3>
					</div>
					<span>${services.length} Leistungen</span>
				</div>
				<div class="services-list">
					${services.map(getServiceCardTemplate).join('')}
				</div>
			</section>
		`;
	}

	/**
	 * Initializes the active service overview page.
	 * @returns {void}
	 */
	function initServiceOverviewPage() {
		const overview = document.querySelector('[data-service-overview]');
		const target = overview?.querySelector('[data-service-overview-groups]');
		if (!overview || !target) return;

		const overviewType = overview.dataset.serviceOverview;
		target.innerHTML = CATEGORY_ORDER
			.map((categoryKey) => getServiceGroupTemplate(categoryKey, overviewType))
			.join('');
	}

	if (document.readyState === 'loading') {
		document.addEventListener('DOMContentLoaded', initServiceOverviewPage);
	} else {
		initServiceOverviewPage();
	}
})();
