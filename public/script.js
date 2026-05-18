const CATEGORY_KEY_MAP = {
	'Küchenservice':  'kitchen',
	'Möbelservice':   'furniture',
	'Handwerker':     'trades',
	'Gartenservice':  'garden',
};

function renderServicesGrid(categoryKey) {
	const grid = document.querySelector('.services-grid');
	if (!grid) return;

	const services = SERVICES_BY_CATEGORY[categoryKey] || [];
	grid.innerHTML = services
		.map(s => getServiceCardTemplate(s.label, s.href, s.img))
		.join('');
}

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

document.addEventListener('DOMContentLoaded', initServicesCategoryButtons);


