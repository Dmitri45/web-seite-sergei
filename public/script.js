/**
 * Home page service category rendering and navigation bindings.
 */

/**
 * Category labels from the services navigation mapped to service data keys.
 * @type {Record<string, string>}
 */
const CATEGORY_KEY_MAP = {
	'Küchenservice':  'kitchen',
	'Möbelservice':   'furniture',
	'Handwerker':     'trades',
	'Gartenservice':  'garden',
};

const MOBILE_NAV_LINKS = [
	{ href: 'kuechenservice.html', label: 'Küchenservice' },
	{ href: 'moebelservice.html', label: 'Möbelservice' },
	{ href: 'handwerk.html', label: 'Handwerk' },
	{ href: 'gartenservice.html', label: 'Gartenservice' }
];

/**
 * Renders service cards for the selected home-page category.
 * @param {string} categoryKey - Key used in SERVICES_BY_CATEGORY.
 * @returns {void}
 */
function renderServicesGrid(categoryKey) {
	const grid = document.querySelector('.services-grid');
	if (!grid) return;

	const services = SERVICES_BY_CATEGORY[categoryKey] || [];
	grid.innerHTML = services
		.map(s => getServiceCardTemplate(s.label, s.href, s.img))
		.join('');
}

/**
 * Binds the category navigation and renders the initial services grid.
 * @returns {void}
 */
function initServicesCategoryButtons() {
	const buttons = document.querySelectorAll('.services-nav-item');
	if (!buttons.length) return;

	buttons.forEach(btn => {
		btn.addEventListener('click', () => {
			buttons.forEach(b => b.classList.remove('is-active'));
			btn.classList.add('is-active');

			const categoryKey = CATEGORY_KEY_MAP[btn.textContent.trim()];
			if (categoryKey) renderServicesGrid(categoryKey);
		});
	});

	const firstBtn = buttons[0];
	const initialKey = CATEGORY_KEY_MAP[firstBtn.textContent.trim()];
	if (initialKey) renderServicesGrid(initialKey);
}

/**
 * Ensures every page has the mobile nav logo, hamburger button, and fullscreen menu.
 * @returns {void}
 */
function initMobileNavDialog() {
	const navbar = document.querySelector('.navbar');
	const navWrap = navbar?.querySelector('.nav-wrap');
	if (!navbar || !navWrap) return;

	if (!navWrap.querySelector('.nav-logo')) {
		const navLogo = document.createElement('a');
		navLogo.className = 'nav-logo';
		navLogo.href = 'index.html';
		navLogo.setAttribute('aria-label', 'S.K SERVICE Startseite');
		navLogo.innerHTML = `
			<img class="logo_img" src="img/logo_no_background.png" alt="S.K SERVICE Logo">
			<span>S.K SERVICE</span>
		`;
		navWrap.appendChild(navLogo);
	}

	if (!navWrap.querySelector('.mobile-menu-toggle')) {
		const toggleButton = document.createElement('button');
		toggleButton.className = 'mobile-menu-toggle';
		toggleButton.type = 'button';
		toggleButton.setAttribute('aria-label', 'Menü öffnen');
		toggleButton.setAttribute('aria-expanded', 'false');
		toggleButton.setAttribute('aria-controls', 'mobileNavDialog');
		toggleButton.innerHTML = '<span></span><span></span><span></span>';
		navWrap.appendChild(toggleButton);
	}

	if (!document.getElementById('mobileNavDialog')) {
		const dialog = document.createElement('div');
		dialog.className = 'mobile-nav-dialog';
		dialog.id = 'mobileNavDialog';
		dialog.setAttribute('aria-hidden', 'true');
		dialog.innerHTML = `
			<div class="mobile-nav-dialog__bar">
				<a class="mobile-nav-dialog__logo" href="index.html">
					<img class="logo_img" src="img/logo_no_background.png" alt="S.K SERVICE Logo">
					<span>S.K SERVICE</span>
				</a>
				<button class="mobile-nav-dialog__close" type="button" aria-label="Menü schließen">×</button>
			</div>
			<nav class="mobile-nav-dialog__links" aria-label="Mobile Navigation">
				${MOBILE_NAV_LINKS.map(link => `<a href="${link.href}">${link.label}</a>`).join('')}
			</nav>
		`;
		document.body.appendChild(dialog);
	}

	const toggleButton = navWrap.querySelector('.mobile-menu-toggle');
	const dialog = document.getElementById('mobileNavDialog');
	const closeButton = dialog.querySelector('.mobile-nav-dialog__close');

	const closeDialog = () => {
		dialog.classList.remove('is-open');
		dialog.setAttribute('aria-hidden', 'true');
		toggleButton.setAttribute('aria-expanded', 'false');
		document.documentElement.classList.remove('has-mobile-nav-open');
		document.body.classList.remove('has-mobile-nav-open');
	};

	const openDialog = () => {
		dialog.classList.add('is-open');
		dialog.setAttribute('aria-hidden', 'false');
		toggleButton.setAttribute('aria-expanded', 'true');
		document.documentElement.classList.add('has-mobile-nav-open');
		document.body.classList.add('has-mobile-nav-open');
	};

	toggleButton.addEventListener('click', () => {
		if (dialog.classList.contains('is-open')) {
			closeDialog();
		} else {
			openDialog();
		}
	});

	closeButton.addEventListener('click', closeDialog);
	dialog.querySelectorAll('a').forEach(link => {
		link.addEventListener('click', closeDialog);
	});
	document.addEventListener('keydown', (event) => {
		if (event.key === 'Escape') closeDialog();
	});
}

/**
 * Moves the logo into the mobile navbar after scrolling past the header.
 * @returns {void}
 */
function initStickyNavbar() {
	const navbar = document.querySelector('.navbar');
	const header = document.querySelector('header');
	if (!navbar || !header) return;
	const mobileQuery = window.matchMedia('(max-width: 770px)');
	let stickyStart = navbar.getBoundingClientRect().top + window.scrollY;

	const updateStickyState = () => {
		const shouldStick = mobileQuery.matches && window.scrollY >= stickyStart;
		navbar.classList.toggle('is-sticky', shouldStick);
		document.body.classList.toggle('has-sticky-navbar', shouldStick);
		document.body.style.setProperty('--navbar-sticky-offset', `${navbar.offsetHeight}px`);
	};

	updateStickyState();
	window.addEventListener('scroll', updateStickyState, { passive: true });
	window.addEventListener('resize', () => {
		stickyStart = navbar.getBoundingClientRect().top + window.scrollY;
		updateStickyState();
	});
	mobileQuery.addEventListener('change', updateStickyState);
}

/**
 * Scrolls the home hero CTA to the services section.
 * @returns {void}
 */
function initHeroServicesScroll() {
	const ctaButton = document.querySelector('[data-scroll-to-services]');
	const servicesSection = document.getElementById('services');
	if (!ctaButton || !servicesSection) return;

	ctaButton.addEventListener('click', () => {
		servicesSection.scrollIntoView({
			behavior: 'smooth',
			block: 'start'
		});
	});
}

function initPageScripts() {
	initServicesCategoryButtons();
	initMobileNavDialog();
	initStickyNavbar();
	initHeroServicesScroll();
}

if (document.readyState === 'loading') {
	document.addEventListener('DOMContentLoaded', initPageScripts);
} else {
	initPageScripts();
}
