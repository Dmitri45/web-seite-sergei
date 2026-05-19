const fs = require('fs/promises');
const path = require('path');

const PROJECTS_ROOT = path.join(__dirname, '..', '..', 'projects');
const IMAGE_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.webp', '.avif']);
const CACHE_TTL_MS = 60 * 1000;

const CATEGORY_FALLBACKS = {
	Gartenservice: {
		title: 'Gartenservice',
		description: 'Abgeschlossene Gartenprojekte, Pflegearbeiten und Montagen.'
	},
	Küchenservice: {
		title: 'Küchenservice',
		description: 'Küchenabbau, Aufbau, Anpassung und Transport.'
	},
	Handwerk: {
		title: 'Handwerk',
		description: 'Montage-, Ausbau- und Reparaturarbeiten.'
	},
	Möbelservice: {
		title: 'Möbelservice',
		description: 'Möbelmontage, Transporte und individuelle Lösungen.'
	}
};

let portfolioCache = null;
let portfolioCacheExpiresAt = 0;

function slugify(value) {
	return String(value || '')
		.normalize('NFKD')
		.replace(/[\u0300-\u036f]/g, '')
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-+|-+$/g, '');
}

function toPublicProjectPath(parts) {
	return `/projects/${parts.map(part => encodeURIComponent(part)).join('/')}`;
}

function isImageFile(fileName) {
	return IMAGE_EXTENSIONS.has(path.extname(fileName).toLowerCase());
}

async function pathExists(filePath) {
	try {
		await fs.access(filePath);
		return true;
	} catch (_) {
		return false;
	}
}

async function readJsonFile(filePath) {
	const raw = await fs.readFile(filePath, 'utf8');
	return JSON.parse(raw);
}

async function readDirectoryNames(directoryPath) {
	try {
		const entries = await fs.readdir(directoryPath, { withFileTypes: true });
		return entries
			.filter(entry => entry.isDirectory() && !entry.name.startsWith('.'))
			.map(entry => entry.name)
			.sort((a, b) => a.localeCompare(b, 'de'));
	} catch (error) {
		if (error.code === 'ENOENT') return [];
		throw error;
	}
}

async function readProjectImages(categoryName, projectFolderName, projectPath, metadata = {}) {
	const entries = await fs.readdir(projectPath, { withFileTypes: true });
	const imageNames = entries
		.filter(entry => entry.isFile() && isImageFile(entry.name))
		.map(entry => entry.name)
		.sort((a, b) => a.localeCompare(b, 'de'));

	const metadataGallery = Array.isArray(metadata.gallery) ? metadata.gallery : [];
	const galleryNames = metadataGallery.length ? metadataGallery : imageNames;
	const previewName = metadata.preview || imageNames.find(name => /^preview\./i.test(name)) || galleryNames[0] || '';

	const gallery = galleryNames
		.filter(Boolean)
		.map(fileName => ({
			src: toPublicProjectPath([categoryName, projectFolderName, fileName]),
			alt: metadata.title || projectFolderName
		}));

	return {
		preview: previewName ? toPublicProjectPath([categoryName, projectFolderName, previewName]) : '',
		gallery
	};
}

async function readProject(categoryName, projectFolderName) {
	const projectPath = path.join(PROJECTS_ROOT, categoryName, projectFolderName);
	const metadataPath = path.join(projectPath, 'project.json');
	const metadata = await readJsonFile(metadataPath);
	const images = await readProjectImages(categoryName, projectFolderName, projectPath, metadata);
	const title = metadata.title || projectFolderName;

	return {
		id: `${slugify(categoryName)}-${slugify(projectFolderName)}`,
		slug: slugify(projectFolderName),
		category: categoryName,
		categorySlug: slugify(categoryName),
		serviceType: metadata.serviceType || metadata.serviceCategory || categoryName,
		title,
		location: metadata.location || '',
		shortDescription: metadata.shortDescription || metadata.description || '',
		description: metadata.description || metadata.shortDescription || '',
		workDone: Array.isArray(metadata.workDone) ? metadata.workDone : [],
		details: Array.isArray(metadata.details) ? metadata.details : [],
		preview: images.preview,
		gallery: images.gallery,
		sortOrder: Number.isFinite(Number(metadata.sortOrder)) ? Number(metadata.sortOrder) : 1000,
		completedAt: metadata.completedAt || ''
	};
}

async function readCategory(categoryName) {
	const categoryPath = path.join(PROJECTS_ROOT, categoryName);
	const projectFolderNames = await readDirectoryNames(categoryPath);
	const projects = [];

	for (const projectFolderName of projectFolderNames) {
		const metadataPath = path.join(categoryPath, projectFolderName, 'project.json');
		if (!(await pathExists(metadataPath))) continue;
		projects.push(await readProject(categoryName, projectFolderName));
	}

	projects.sort((a, b) => a.sortOrder - b.sortOrder || a.title.localeCompare(b.title, 'de'));

	const fallback = CATEGORY_FALLBACKS[categoryName] || {};
	return {
		id: slugify(categoryName),
		title: fallback.title || categoryName,
		folderName: categoryName,
		description: fallback.description || '',
		projectCount: projects.length,
		preview: projects.find(project => project.preview)?.preview || '',
		projects
	};
}

async function buildPortfolio() {
	const categoryNames = await readDirectoryNames(PROJECTS_ROOT);
	const categories = [];

	for (const categoryName of categoryNames) {
		const category = await readCategory(categoryName);
		if (category.projectCount > 0) categories.push(category);
	}

	const categoryOrder = ['Gartenservice', 'Küchenservice', 'Handwerk', 'Möbelservice'];
	categories.sort((a, b) => {
		const indexA = categoryOrder.indexOf(a.folderName);
		const indexB = categoryOrder.indexOf(b.folderName);
		if (indexA !== -1 || indexB !== -1) {
			return (indexA === -1 ? 999 : indexA) - (indexB === -1 ? 999 : indexB);
		}
		return a.title.localeCompare(b.title, 'de');
	});

	return {
		categories,
		projectCount: categories.reduce((total, category) => total + category.projectCount, 0),
		generatedAt: new Date().toISOString()
	};
}

async function getPortfolio() {
	const now = Date.now();
	if (portfolioCache && now < portfolioCacheExpiresAt) return portfolioCache;

	portfolioCache = await buildPortfolio();
	portfolioCacheExpiresAt = now + CACHE_TTL_MS;
	return portfolioCache;
}

module.exports = {
	getPortfolio
};
