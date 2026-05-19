/**
 * Portfolio/projects gallery modal for the home page references section.
 */

const PORTFOLIO_API_PATH = '/api/portfolio';
const BACKEND_ORIGIN = 'http://localhost:3000';

let portfolioState = {
	data: null,
	activeCategoryId: '',
	activeProjectId: '',
	activeImageIndex: 0,
	isLoading: false,
	error: ''
};

let lastPortfolioTrigger = null;

function getPortfolioApiUrls() {
	const currentOriginUrl = `${window.location.origin}${PORTFOLIO_API_PATH}`;
	const backendUrl = `${BACKEND_ORIGIN}${PORTFOLIO_API_PATH}`;
	const isLocalDevHost = ['localhost', '127.0.0.1'].includes(window.location.hostname);

	if (window.location.port === '3000' || !isLocalDevHost) return [PORTFOLIO_API_PATH];
	if (window.location.protocol === 'file:') return [backendUrl];
	return [currentOriginUrl, backendUrl];
}

function escapeHtml(value) {
	return String(value ?? '')
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;')
		.replace(/'/g, '&#039;');
}

function flattenPortfolioProjects(data) {
	return (data?.categories || []).flatMap(category => category.projects || []);
}

function getPortfolioDialog() {
	return document.getElementById('portfolioDialog');
}

function setPortfolioScrollLock(isLocked) {
	document.documentElement.classList.toggle('has-portfolio-open', isLocked);
	document.body.classList.toggle('has-portfolio-open', isLocked);
}

function getProjectById(projectId) {
	return flattenPortfolioProjects(portfolioState.data).find(project => project.id === projectId) || null;
}

function getCategoryById(categoryId) {
	return (portfolioState.data?.categories || []).find(category => category.id === categoryId) || null;
}

function formatProjectMeta(project) {
	return [project.serviceType, project.location].filter(Boolean).join(' · ');
}

async function fetchPortfolio() {
	if (portfolioState.data) return portfolioState.data;
	portfolioState.isLoading = true;
	portfolioState.error = '';
	renderPortfolioDialog();

	try {
		let response = null;
		let lastError = null;

		for (const apiUrl of getPortfolioApiUrls()) {
			try {
				response = await fetch(apiUrl, {
					headers: { Accept: 'application/json' }
				});
				if (response.ok) break;
				lastError = new Error(`Portfolio konnte nicht geladen werden (${response.status})`);
			} catch (error) {
				lastError = error;
			}
		}

		if (!response || !response.ok) throw lastError || new Error('Portfolio konnte nicht geladen werden.');
		const data = await response.json();
		if (!data.ok) throw new Error(data.error || 'Portfolio konnte nicht geladen werden.');
		portfolioState.data = data;
		return data;
	} catch (error) {
		portfolioState.error = error.message;
		return null;
	} finally {
		portfolioState.isLoading = false;
		renderPortfolioDialog();
	}
}

function createPortfolioDialog() {
	if (getPortfolioDialog()) return;

	const dialog = document.createElement('div');
	dialog.className = 'portfolio-dialog';
	dialog.id = 'portfolioDialog';
	dialog.setAttribute('aria-hidden', 'true');
	dialog.setAttribute('inert', '');
	dialog.innerHTML = `
		<div class="portfolio-dialog__panel" role="dialog" aria-modal="true" aria-label="Abgeschlossene Projekte">
			<div class="portfolio-dialog__topbar">
				<button class="portfolio-dialog__back" type="button" aria-label="Zurück">←</button>
				<div>
					<div class="portfolio-dialog__eyebrow">Referenzen</div>
					<h2 class="portfolio-dialog__title">Unsere abgeschlossenen Projekte</h2>
				</div>
				<button class="portfolio-dialog__close" type="button" aria-label="Schließen">×</button>
			</div>
			<div class="portfolio-dialog__body"></div>
		</div>
	`;
	document.body.appendChild(dialog);

	dialog.querySelector('.portfolio-dialog__close').addEventListener('click', closePortfolioDialog);
	dialog.querySelector('.portfolio-dialog__back').addEventListener('click', handlePortfolioBack);
	dialog.addEventListener('click', event => {
		if (event.target === dialog) closePortfolioDialog();
	});
	document.addEventListener('keydown', event => {
		if (!dialog.classList.contains('is-open')) return;
		if (event.key === 'Escape') closePortfolioDialog();
		if (event.key === 'ArrowLeft') changePortfolioImage(-1);
		if (event.key === 'ArrowRight') changePortfolioImage(1);
	});
}

function openPortfolioDialog(view = 'categories', options = {}) {
	createPortfolioDialog();
	const dialog = getPortfolioDialog();
	lastPortfolioTrigger = document.activeElement instanceof HTMLElement ? document.activeElement : null;
	dialog.classList.add('is-open');
	dialog.setAttribute('aria-hidden', 'false');
	dialog.removeAttribute('inert');
	setPortfolioScrollLock(true);

	if (view === 'project') {
		portfolioState.activeProjectId = options.projectId || '';
		portfolioState.activeCategoryId = options.categoryId || '';
		portfolioState.activeImageIndex = 0;
	} else if (view === 'category') {
		portfolioState.activeCategoryId = options.categoryId || '';
		portfolioState.activeProjectId = '';
	} else {
		portfolioState.activeCategoryId = '';
		portfolioState.activeProjectId = '';
	}

	renderPortfolioDialog();
	fetchPortfolio().then(() => {
		if (view === 'project' && !portfolioState.activeProjectId && options.projectTitle) {
			const matchedProject = flattenPortfolioProjects(portfolioState.data).find(project => (
				project.title.toLowerCase() === options.projectTitle.toLowerCase()
			));
			if (matchedProject) {
				portfolioState.activeProjectId = matchedProject.id;
				portfolioState.activeCategoryId = matchedProject.categorySlug;
			}
		}
		renderPortfolioDialog();
	});
}

function closePortfolioDialog() {
	const dialog = getPortfolioDialog();
	if (!dialog) return;
	if (dialog.contains(document.activeElement)) {
		document.activeElement.blur();
	}
	dialog.classList.remove('is-open');
	dialog.setAttribute('aria-hidden', 'true');
	dialog.setAttribute('inert', '');
	setPortfolioScrollLock(false);
	if (lastPortfolioTrigger?.isConnected) {
		lastPortfolioTrigger.focus({ preventScroll: true });
	}
}

function handlePortfolioBack() {
	if (portfolioState.activeProjectId) {
		portfolioState.activeProjectId = '';
		portfolioState.activeImageIndex = 0;
	} else if (portfolioState.activeCategoryId) {
		portfolioState.activeCategoryId = '';
	}
	renderPortfolioDialog();
}

function renderPortfolioSkeleton() {
	return `
		<div class="portfolio-skeleton-grid">
			${Array.from({ length: 4 }, () => `
				<div class="portfolio-skeleton-card">
					<div></div>
					<span></span>
					<strong></strong>
				</div>
			`).join('')}
		</div>
	`;
}

function renderPortfolioError() {
	return `
		<div class="portfolio-empty">
			<h3>Projekte konnten nicht geladen werden</h3>
			<p>${escapeHtml(portfolioState.error || 'Bitte versuchen Sie es später erneut.')}</p>
			<button class="btn-main portfolio-retry" type="button">Erneut laden</button>
		</div>
	`;
}

function renderPortfolioEmpty() {
	return `
		<div class="portfolio-empty">
			<h3>Noch keine Projekte gefunden</h3>
			<p>Legen Sie Projektordner in <code>projects</code> an, damit sie hier automatisch erscheinen.</p>
		</div>
	`;
}

function renderCategoriesView() {
	const categories = portfolioState.data?.categories || [];
	if (!categories.length) return renderPortfolioEmpty();

	return `
		<div class="portfolio-category-grid">
			${categories.map(category => `
				<button class="portfolio-category-card" type="button" data-category-id="${category.id}">
					${category.preview ? `<img src="${category.preview}" alt="${escapeHtml(category.title)}" loading="lazy" decoding="async">` : ''}
					<span class="portfolio-category-card__shade"></span>
					<span class="portfolio-category-card__count">${category.projectCount} Projekte</span>
					<strong>${escapeHtml(category.title)}</strong>
					<small>${escapeHtml(category.description || 'Abgeschlossene Arbeiten')}</small>
				</button>
			`).join('')}
		</div>
	`;
}

function renderProjectsView(category) {
	const projects = category?.projects || [];
	if (!projects.length) return renderPortfolioEmpty();

	return `
		<div class="portfolio-filter-row">
			${(portfolioState.data?.categories || []).map(item => `
				<button class="portfolio-filter ${item.id === category.id ? 'is-active' : ''}" type="button" data-category-id="${item.id}">
					${escapeHtml(item.title)}
				</button>
			`).join('')}
		</div>
		<div class="portfolio-project-grid">
			${projects.map(project => `
				<button class="portfolio-project-card" type="button" data-project-id="${project.id}">
					<img src="${project.preview}" alt="${escapeHtml(project.title)}" loading="lazy" decoding="async">
					<span>${escapeHtml(project.serviceType)}</span>
					<strong>${escapeHtml(project.title)}</strong>
					<small>${escapeHtml(project.location)}</small>
					<p>${escapeHtml(project.shortDescription)}</p>
				</button>
			`).join('')}
		</div>
	`;
}

function renderProjectDetail(project) {
	const gallery = project.gallery?.length ? project.gallery : [{ src: project.preview, alt: project.title }];
	const activeImage = gallery[portfolioState.activeImageIndex] || gallery[0];

	return `
		<div class="portfolio-project-detail">
			<div class="portfolio-gallery">
				<div class="portfolio-gallery__stage">
					<img src="${activeImage.src}" alt="${escapeHtml(activeImage.alt || project.title)}" loading="eager" decoding="async">
					${gallery.length > 1 ? `
						<button class="portfolio-gallery__nav portfolio-gallery__nav--prev" type="button" data-gallery-step="-1" aria-label="Vorheriges Bild">‹</button>
						<button class="portfolio-gallery__nav portfolio-gallery__nav--next" type="button" data-gallery-step="1" aria-label="Nächstes Bild">›</button>
					` : ''}
				</div>
				<div class="portfolio-gallery__thumbs">
					${gallery.map((image, index) => `
						<button class="${index === portfolioState.activeImageIndex ? 'is-active' : ''}" type="button" data-gallery-index="${index}">
							<img src="${image.src}" alt="${escapeHtml(image.alt || project.title)}" loading="lazy" decoding="async">
						</button>
					`).join('')}
				</div>
			</div>
			<div class="portfolio-project-info">
				<span class="portfolio-project-info__meta">${escapeHtml(formatProjectMeta(project))}</span>
				<h3>${escapeHtml(project.title)}</h3>
				<p>${escapeHtml(project.description)}</p>
				${project.workDone?.length ? `
					<h4>Was wurde gemacht</h4>
					<ul>${project.workDone.map(item => `<li>${escapeHtml(item)}</li>`).join('')}</ul>
				` : ''}
				${project.details?.length ? `
					<h4>Details</h4>
					<div class="portfolio-detail-list">
						${project.details.map(item => `<span>${escapeHtml(item)}</span>`).join('')}
					</div>
				` : ''}
			</div>
		</div>
	`;
}

function updatePortfolioDialogHeading() {
	const dialog = getPortfolioDialog();
	if (!dialog) return;

	const title = dialog.querySelector('.portfolio-dialog__title');
	const eyebrow = dialog.querySelector('.portfolio-dialog__eyebrow');
	const back = dialog.querySelector('.portfolio-dialog__back');
	const project = portfolioState.activeProjectId ? getProjectById(portfolioState.activeProjectId) : null;
	const category = portfolioState.activeCategoryId ? getCategoryById(portfolioState.activeCategoryId) : null;

	if (project) {
		eyebrow.textContent = project.serviceType;
		title.textContent = project.title;
	} else if (category) {
		eyebrow.textContent = 'Kategorie';
		title.textContent = category.title;
	} else {
		eyebrow.textContent = 'Referenzen';
		title.textContent = 'Unsere abgeschlossenen Projekte';
	}

	back.classList.toggle('is-visible', Boolean(project || category));
}

function renderPortfolioDialog() {
	const dialog = getPortfolioDialog();
	if (!dialog) return;
	const body = dialog.querySelector('.portfolio-dialog__body');
	updatePortfolioDialogHeading();

	if (portfolioState.isLoading) {
		body.innerHTML = renderPortfolioSkeleton();
		return;
	}

	if (portfolioState.error) {
		body.innerHTML = renderPortfolioError();
		body.querySelector('.portfolio-retry')?.addEventListener('click', () => {
			portfolioState.data = null;
			fetchPortfolio();
		});
		return;
	}

	if (portfolioState.activeProjectId) {
		const project = getProjectById(portfolioState.activeProjectId);
		body.innerHTML = project ? renderProjectDetail(project) : renderPortfolioEmpty();
		bindProjectDetailEvents(body);
		return;
	}

	if (portfolioState.activeCategoryId) {
		body.innerHTML = renderProjectsView(getCategoryById(portfolioState.activeCategoryId));
		bindProjectsViewEvents(body);
		return;
	}

	body.innerHTML = renderCategoriesView();
	bindCategoryViewEvents(body);
}

function bindCategoryViewEvents(root) {
	root.querySelectorAll('[data-category-id]').forEach(button => {
		button.addEventListener('click', () => {
			portfolioState.activeCategoryId = button.dataset.categoryId;
			renderPortfolioDialog();
		});
	});
}

function bindProjectsViewEvents(root) {
	root.querySelectorAll('.portfolio-filter').forEach(button => {
		button.addEventListener('click', () => {
			portfolioState.activeCategoryId = button.dataset.categoryId;
			renderPortfolioDialog();
		});
	});
	root.querySelectorAll('[data-project-id]').forEach(button => {
		button.addEventListener('click', () => {
			portfolioState.activeProjectId = button.dataset.projectId;
			portfolioState.activeImageIndex = 0;
			renderPortfolioDialog();
		});
	});
}

function bindProjectDetailEvents(root) {
	root.querySelectorAll('[data-gallery-step]').forEach(button => {
		button.addEventListener('click', () => changePortfolioImage(Number(button.dataset.galleryStep)));
	});
	root.querySelectorAll('[data-gallery-index]').forEach(button => {
		button.addEventListener('click', () => {
			portfolioState.activeImageIndex = Number(button.dataset.galleryIndex);
			renderPortfolioDialog();
		});
	});
}

function changePortfolioImage(step) {
	const project = getProjectById(portfolioState.activeProjectId);
	const galleryLength = project?.gallery?.length || 0;
	if (!galleryLength) return;
	portfolioState.activeImageIndex = (portfolioState.activeImageIndex + step + galleryLength) % galleryLength;
	renderPortfolioDialog();
}

function renderHomeReferenceCards(data) {
	const grid = document.querySelector('.references-grid');
	if (!grid) return;

	const projects = flattenPortfolioProjects(data).slice(0, 3);
	if (!projects.length) return;
	const [featuredProject, ...sideProjects] = projects;

	grid.innerHTML = `
		<a href="#" class="reference-card reference-card-small" data-project-id="${featuredProject.id}">
			<img src="${featuredProject.preview}" alt="${escapeHtml(featuredProject.title)}" loading="lazy" decoding="async">
			<div class="reference-overlay">
				<span class="reference-tag">${escapeHtml(featuredProject.serviceType)}</span>
				<div class="reference-title">${escapeHtml(featuredProject.title)}</div>
			</div>
		</a>
		<div class="references-side">
			${sideProjects.map((project, index) => `
				<a href="#" class="reference-card ${index === 0 ? 'reference-card-large' : 'reference-card-small'}" data-project-id="${project.id}">
					<img src="${project.preview}" alt="${escapeHtml(project.title)}" loading="lazy" decoding="async">
					<div class="reference-overlay">
						<span class="reference-tag">${escapeHtml(project.serviceType)}</span>
						<div class="reference-title">${escapeHtml(project.title)}</div>
					</div>
				</a>
			`).join('')}
		</div>
	`;
}

function bindHomePortfolioTriggers() {
	const allLink = document.querySelector('.references-link');
	allLink?.addEventListener('click', event => {
		event.preventDefault();
		openPortfolioDialog('categories');
	});

	document.querySelector('.references-grid')?.addEventListener('click', event => {
		const card = event.target.closest('.reference-card');
		if (!card) return;
		event.preventDefault();
		openPortfolioDialog('project', {
			projectId: card.dataset.projectId || '',
			projectTitle: card.querySelector('.reference-title')?.textContent?.trim() || ''
		});
	});
}

function initPortfolioGallery() {
	if (!document.querySelector('.references')) return;
	createPortfolioDialog();
	bindHomePortfolioTriggers();
	fetchPortfolio().then(data => {
		if (data) renderHomeReferenceCards(data);
	});
}

if (document.readyState === 'loading') {
	document.addEventListener('DOMContentLoaded', initPortfolioGallery);
} else {
	initPortfolioGallery();
}
