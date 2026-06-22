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
 * Ensures every page has the mobile nav logo, hamburger button, and compact menu.
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
			<nav class="mobile-nav-dialog__links" aria-label="Mobile Navigation">
				${MOBILE_NAV_LINKS.map(link => `<a href="${link.href}">${link.label}</a>`).join('')}
			</nav>
		`;
		document.body.appendChild(dialog);
	}

	const toggleButton = navWrap.querySelector('.mobile-menu-toggle');
	const dialog = document.getElementById('mobileNavDialog');

	const lockPageScroll = () => {
		document.documentElement.classList.add('has-mobile-nav-open');
		document.body.classList.add('has-mobile-nav-open');
	};

	const unlockPageScroll = () => {
		document.documentElement.classList.remove('has-mobile-nav-open');
		document.body.classList.remove('has-mobile-nav-open');
	};

	const preventPageScroll = (event) => {
		if (!dialog.classList.contains('is-open')) return;
		if (dialog.contains(event.target)) return;
		event.preventDefault();
	};

	const closeDialog = () => {
		if (!dialog.classList.contains('is-open')) return;
		dialog.classList.remove('is-open');
		dialog.setAttribute('aria-hidden', 'true');
		toggleButton.setAttribute('aria-expanded', 'false');
		toggleButton.setAttribute('aria-label', 'Menü öffnen');
		toggleButton.classList.remove('is-open');
		unlockPageScroll();
	};

	const openDialog = () => {
		const toggleRect = toggleButton.getBoundingClientRect();
		const top = Math.max(12, Math.round(toggleRect.bottom + 10));
		dialog.style.setProperty('--mobile-menu-top', `${top}px`);
		dialog.classList.add('is-open');
		dialog.setAttribute('aria-hidden', 'false');
		toggleButton.setAttribute('aria-expanded', 'true');
		toggleButton.setAttribute('aria-label', 'Menü schließen');
		toggleButton.classList.add('is-open');
		lockPageScroll();
	};

	toggleButton.addEventListener('click', () => {
		if (dialog.classList.contains('is-open')) {
			closeDialog();
		} else {
			openDialog();
		}
	});

	dialog.querySelectorAll('a').forEach(link => {
		link.addEventListener('click', closeDialog);
	});
	document.addEventListener('keydown', (event) => {
		if (event.key === 'Escape') closeDialog();
	});
	document.addEventListener('click', (event) => {
		if (!dialog.classList.contains('is-open')) return;
		if (dialog.contains(event.target) || toggleButton.contains(event.target)) return;
		closeDialog();
	});
	document.addEventListener('wheel', preventPageScroll, { passive: false });
	document.addEventListener('touchmove', preventPageScroll, { passive: false });
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
	const themeColorMeta = document.querySelector('meta[name="theme-color"]');
	const defaultThemeColor = '#ffffff';
	const stickyThemeColor = '#0f3d2e';
	let stickyStart = header.offsetHeight;

	const updateThemeColor = (shouldStick) => {
		if (!themeColorMeta) return;
		themeColorMeta.setAttribute('content', shouldStick ? stickyThemeColor : defaultThemeColor);
	};

	const updateStickyState = () => {
		const shouldStick = mobileQuery.matches && window.scrollY >= stickyStart;
		navbar.classList.toggle('is-sticky', shouldStick);
		document.body.classList.toggle('has-sticky-navbar', shouldStick);
		document.body.style.setProperty('--navbar-sticky-offset', `${navbar.offsetHeight}px`);
		updateThemeColor(shouldStick);
	};

	updateStickyState();
	window.addEventListener('scroll', updateStickyState, { passive: true });
	window.addEventListener('resize', () => {
		stickyStart = header.offsetHeight;
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
