/**
 * Stores selected service cards and applies the selection on the calculator page.
 */

(function() {
    /**
     * sessionStorage key for selected service payload.
     * Shape: { label: string, image: string, category: string }.
     */
    const STORAGE_KEY = 'selectedServiceData';
    const CATEGORY_BY_BODY_CLASS = {
        'page-kitchen': 'KÜCHENSERVICE',
        'page-furniture': 'MÖBELSERVICE',
        'page-trades': 'HANDWERK',
        'page-garden': 'GARTENSERVICE'
    };

	const CATEGORY_BY_IMAGE_MARKER = [
        { marker: 'kuechenservice', label: 'KÜCHENSERVICE' },
        { marker: 'moebelservice', label: 'MÖBELSERVICE' },
        { marker: 'gartenservice', label: 'GARTENSERVICE' },
        { marker: 'tradeservice', label: 'HANDWERK' },
        { marker: 'handwerk', label: 'HANDWERK' },
		{ marker: 'handwerker', label: 'HANDWERK' }
	];
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

    /**
     * Removes wrapping quotes and extra whitespace from URL-like strings.
     * @param {string} value
     * @returns {string}
     */
    function normalizeUrl(value) {
        if (!value) return '';
        return value.replace(/^["']|["']$/g, '').trim();
    }

    /**
     * Extracts background image URL from a service card.
     * Prefers inline style, falls back to computed style.
     * @param {HTMLElement} card
     * @returns {string}
     */
    function extractImageFromCard(card) {
        const bg = card.querySelector('.service-card-bg');
        if (!bg) return '';

        const inline = bg.style.backgroundImage || '';
        const source = inline || window.getComputedStyle(bg).backgroundImage || '';
        const match = source.match(/url\((.+)\)/i);
        return match ? normalizeUrl(match[1]) : '';
    }

    /**
     * Extracts service label from card title or aria-label.
     * @param {HTMLElement} card
     * @returns {string}
     */
    function extractLabelFromCard(card) {
        const title = card.querySelector('.service-card-title')?.textContent?.trim();
        const aria = card.getAttribute('aria-label')?.trim();
        return title || aria || '';
    }

    /**
     * Resolves category label for the selected card.
     * Priority: current page body class -> image path marker.
     * @param {string} image
     * @returns {string}
     */
    function resolveCategoryLabel(image) {
        for (const [className, label] of Object.entries(CATEGORY_BY_BODY_CLASS)) {
            if (document.body.classList.contains(className)) return label;
        }

        const normalizedImage = image.toLowerCase();
        const byImage = CATEGORY_BY_IMAGE_MARKER.find(({ marker }) =>
            normalizedImage.includes(marker)
        );

        return byImage?.label || 'SERVICE';
    }

    /**
     * Saves selected service data to sessionStorage.
     * @param {HTMLElement} card
     * @returns {void}
     */
    function saveServiceSelection(card) {
        const label = extractLabelFromCard(card);
        const image = extractImageFromCard(card);
        const category = resolveCategoryLabel(image);
        if (!label && !image) return;

        const payload = { label, image, category };
        try {
            sessionStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
        } catch (_) {
            // Ignore sessionStorage errors (private mode / disabled storage).
        }
    }

    /**
     * Registers click listener and stores selected card data
     * before navigation to /calculate.
     * @returns {void}
     */
	function bindServiceCardSelection() {
		document.addEventListener('click', (event) => {
			const card = event.target.closest('a.service-card[href*="/calculate"]');
			if (!card) return;
			saveServiceSelection(card);
		});
	}

	/**
	 * Adds hover intent classes for services that open an offer flow without a calculation.
	 * @returns {void}
	 */
	function applyServiceCardHoverClasses() {
		document.querySelectorAll('a.service-card[href*="/calculate"]').forEach((card) => {
			if (card.classList.contains('service-card--appointment')) return;

			const label = extractLabelFromCard(card);
			if (OFFER_ONLY_SERVICES.has(label)) {
				card.classList.add('service-card--offer-only');
			}
		});
	}

    /**
     * Applies selected service data on calculate page:
     * - hero category badge
     * - hero title
     * - document title
     * - hero background image
     * @returns {void}
     */
    function applySelectionOnCalculatePage() {
        if (!document.body.classList.contains('page-calculate')) return;

        let payload = null;
        try {
            const raw = sessionStorage.getItem(STORAGE_KEY);
            payload = raw ? JSON.parse(raw) : null;
        } catch (_) {
            payload = null;
        }

        if (!payload) return;

        const heroEyebrow = document.querySelector('.hero-eyebrow');
        if (heroEyebrow && payload.category) {
            heroEyebrow.textContent = payload.category;
        }

        const heroTitle = document.querySelector('.hero-title');
        if (heroTitle && payload.label) {
            heroTitle.textContent = payload.label;
            document.title = `${payload.label} – S.K SERVICE`;
        }

        const heroBg = document.querySelector('.hero-bg');
        if (heroBg && payload.image) {
            heroBg.style.backgroundImage = `url("${payload.image}")`;
        }

        const asideTitle = document.getElementById('selectedServiceAsideTitle');
        if (asideTitle && payload.label) {
            asideTitle.textContent = payload.label;
        }

        const asideImage = document.getElementById('selectedServicePreviewImage');
        if (asideImage && payload.image) {
            asideImage.src = payload.image;
            asideImage.alt = payload.label || 'Leistungsvorschau';
        }
    }

	document.addEventListener('DOMContentLoaded', () => {
		applyServiceCardHoverClasses();
		bindServiceCardSelection();
		applySelectionOnCalculatePage();
	});
})();
