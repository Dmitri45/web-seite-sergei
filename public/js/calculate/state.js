import { SERVICE_SELECTION_STORAGE_KEY } from './constants.js';

/**
 * Mutable calculator state shared across modular calculator flows.
 * @type {Object}
 */
export const calcState = {
	selectedKitchenCondition: '',
	selectedTransportation: '',
	selectedAssembly: '',
	currentForm: null,
	selectedTransportFrom: null,
	selectedTransportVia: [],
	selectedTransportTo: null,
	selectedFormTransportFrom: null,
	selectedFormTransportTo: null,
	selectedServiceArea: null,
	selectedOfferAddress: '',
	latestCalculationResult: null,
	latestFrontendFormPayload: null
};

const SERVICE_ASIDE_DETAILS = {
	'Küchentransport': {
		items: [
			'Sicherer Küchentransport',
			'Küchenabbau optional',
			'Küchenaufbau optional'
		],
		subitems: [
			'Transportpreis online',
			'Abbau & Aufbau bei Bedarf',
			'Persönliches Angebot auf Anfrage'
		]
	}
};

/**
 * Reads the selected service data from sessionStorage.
 * @returns {{label?: string, image?: string, category?: string}|null} Selected service data.
 */
export function getSelectedServiceData() {
	try {
		const raw = sessionStorage.getItem(SERVICE_SELECTION_STORAGE_KEY);
		return raw ? JSON.parse(raw) : null;
	} catch (_) {
		return null;
	}
}

/**
 * Persists selected service data to sessionStorage.
 * @param {{label?: string, image?: string, category?: string}} serviceData - Selected service metadata.
 * @returns {void}
 */
export function setSelectedServiceData(serviceData) {
	try {
		sessionStorage.setItem(SERVICE_SELECTION_STORAGE_KEY, JSON.stringify(serviceData));
	} catch (_) {
		// Ignore sessionStorage errors (private mode / disabled storage).
	}
}

/**
 * Applies selected service metadata to the calculator page UI.
 * @param {{label?: string, image?: string, category?: string}|null} serviceData - Selected service metadata.
 * @returns {void}
 */
export function applySelectedServiceData(serviceData) {
	if (!serviceData) return;

	const heroEyebrow = document.querySelector('.hero-eyebrow');
	const heroTitle = document.querySelector('.hero-title');
	const asideTitle = document.querySelector('#selectedServiceAsideTitle');
	const previewImage = document.querySelector('#selectedServicePreviewImage');
	const asideItems = document.querySelectorAll('.calc-placeholder__list li');
	const asideSubitems = document.querySelectorAll('.calc-placeholder__sublist li');
	const asideDetails = serviceData.label ? SERVICE_ASIDE_DETAILS[serviceData.label] : null;

	if (heroEyebrow && serviceData.category) heroEyebrow.textContent = serviceData.category;
	if (heroTitle && serviceData.label) heroTitle.textContent = serviceData.label;
	if (asideTitle && serviceData.label) asideTitle.textContent = serviceData.label;
	if (previewImage && serviceData.image) previewImage.src = serviceData.image;
	if (asideDetails) {
		asideItems.forEach((item, index) => {
			if (asideDetails.items[index]) item.textContent = asideDetails.items[index];
		});
		asideSubitems.forEach((item, index) => {
			if (asideDetails.subitems[index]) item.textContent = asideDetails.subitems[index];
		});
	}
	if (serviceData.label) document.title = `${serviceData.label} – S.K. SERVICE`;
}
