/**
 * Payload builders and normalizers for calculator forms.
 * @module calculate/payload
 */

import { KITCHEN_CALCULATION_SERVICE_LABELS } from './constants.js';
import { getSelectedServiceData } from './state.js';
import { SERVICE_LABELS } from './serviceLabels.js';

/**
 * Adds assembly survey values to the calculation payload when needed.
 * @param {Object} data - Payload being prepared for the backend.
 * @param {Object} state - Shared calculator state.
 * @returns {void}
 */
export function addAssemblyDataIfNeeded(data, state) {
	if (state.selectedKitchenCondition !== 'new') return;

	data.assembly = state.selectedAssembly;

	if (state.selectedAssembly === 'yes') {
		const assemblySurvey = document.getElementById('assemblySurvey');
		if (assemblySurvey) {
			data.smallCabinets = assemblySurvey.querySelector('#smallCabinets')?.value || '0';
			data.largeCabinets = assemblySurvey.querySelector('#largeCabinets')?.value || '0';
			data.drawers = assemblySurvey.querySelector('#drawers')?.value || '0';
		}
	}
}

/**
 * Adds selected transport route points to the calculation payload.
 * @param {Object} data - Payload being prepared for the backend.
 * @param {Object} state - Shared calculator state.
 * @returns {void}
 */
export function addTransportationDataIfNeeded(data, state) {
	if (state.selectedTransportation !== 'yes') return;

	data.transportFrom = state.selectedTransportFrom;
	data.transportVia = state.selectedTransportVia.filter(point => point?.address);
	data.transportTo = state.selectedTransportTo;
}

/**
 * Adds standalone transport endpoints used by forms such as Küchentransport.
 * @param {Object} data - Payload being prepared for the backend.
 * @param {Object} state - Shared calculator state.
 * @returns {void}
 */
export function addStandaloneTransportDataIfNeeded(data, state) {
	if (!state.selectedFormTransportFrom || !state.selectedFormTransportTo) return;

	data.transportation = 'yes';
	data.transportFrom = state.selectedFormTransportFrom;
	data.transportVia = [];
	data.transportTo = state.selectedFormTransportTo;
}

/**
 * Builds a complete calculation payload from the current form and shared state.
 * @param {HTMLFormElement|null} currentForm - Active calculator form.
 * @param {Object} state - Shared calculator state.
 * @returns {Object} Calculation payload.
 */
export function buildCalculationData(currentForm, state) {
	const data = buildKitchenFormPayload(currentForm, state);
	data.transportation = state.selectedTransportation;
	if (state.selectedServiceArea?.coordinates) {
		data.einsatzort = state.selectedServiceArea;
	}

	addAssemblyDataIfNeeded(data, state);
	addTransportationDataIfNeeded(data, state);
	addStandaloneTransportDataIfNeeded(data, state);
	adaptKitchenPayloadForBackend(data, state);

	return data;
}

/**
 * Validates required fields for custom furniture and kitchen requests.
 * @param {Object} payload - Custom request payload.
 * @returns {boolean} True when the payload is valid.
 */
export function validateCustomRequestPayload(payload) {
	if (!payload.firstName?.trim() || !payload.lastName?.trim()) {
		alert('Bitte geben Sie Vorname und Nachname ein.');
		return false;
	}

	if (!payload.phone?.trim()) {
		alert('Bitte geben Sie Ihre Telefonnummer ein.');
		return false;
	}

	if (!payload.address?.trim()) {
		alert('Bitte wählen Sie eine Adresse aus der Vorschlagsliste aus.');
		return false;
	}

	return true;
}

/**
 * Moves custom request contact fields into the customer object expected by email templates.
 * @param {Object} payload - Custom request payload.
 * @returns {void}
 */
export function adaptCustomRequestPayload(payload) {
	payload.customer = {
		firstName: payload.firstName || '',
		lastName: payload.lastName || '',
		phone: payload.phone || '',
		address: payload.address || ''
	};

	delete payload.firstName;
	delete payload.lastName;
	delete payload.phone;
}

/**
 * Normalizes kitchen payload fields for the backend controller.
 * @param {Object} data - Kitchen calculation payload.
 * @param {Object} state - Shared calculator state.
 * @returns {Object} Normalized payload.
 */
export function adaptKitchenPayloadForBackend(data, state) {
	if (!data || typeof data !== 'object') return data;
	const serviceLabel = String(data.serviceLabel || '').trim();

	if (!KITCHEN_CALCULATION_SERVICE_LABELS.has(serviceLabel)) return data;

	data.condition = data.kitchenCondition || state.selectedKitchenCondition || data.condition || 'new';
	data.abbau = data.dismantling === 'yes' || data.abbau === true || data.abbau === 'true';
	data.worktopAdjust = data.worktopAdjust || data.worktopMaterial || '';
	if (serviceLabel === SERVICE_LABELS.KITCHEN_ASSEMBLY && data.condition === 'new') {
		data.worktopAdjust = 'yes';
	}

	return data;
}

/**
 * Collects all named form controls into the base service payload.
 * @param {HTMLFormElement|null} formElement - Active form element.
 * @param {Object} state - Shared calculator state.
 * @returns {Object} Form payload.
 */
export function buildKitchenFormPayload(formElement, state) {
	const selectedService = getSelectedServiceData();
	const serviceLabel = selectedService?.label || '';
	const data = {
		kitchenCondition: state.selectedKitchenCondition,
		serviceLabel
	};

	if (!formElement) return data;

	const inputs = formElement.querySelectorAll('input, select, textarea');
	inputs.forEach(input => {
		if (input.name) {
			data[input.name] = input.type === 'checkbox'
				? (input.checked ? (input.value || 'yes') : 'no')
				: (input.value || '');
		}
	});

	groupFurnitureItemsInPayload(data);
	adaptPayloadForService(data, serviceLabel);

	return data;
}

/**
 * Adds backend mode hints based on the selected service label.
 * @param {Object} payload - Payload to mutate.
 * @param {string} [serviceLabel=''] - Selected service label.
 * @returns {void}
 */
export function adaptPayloadForService(payload, serviceLabel = '') {
	if (!payload || typeof payload !== 'object') return;

	const normalizedLabel = String(serviceLabel || '').trim().toLowerCase();

	if (normalizedLabel === SERVICE_LABELS.FURNITURE_ASSEMBLY.toLowerCase()) {
		payload.mode = 'new-assembly';
	}

	if (normalizedLabel === SERVICE_LABELS.FURNITURE_DISPOSAL.toLowerCase()) {
		payload.mode = 'old-disassembly';
	}

	if (normalizedLabel === SERVICE_LABELS.MOVING_HELPERS.toLowerCase()) {
		payload.mode = 'moving-helpers';
	}

	if (normalizedLabel === SERVICE_LABELS.FINE_PLASTER.toLowerCase()) {
		payload.mode = 'feinputz';
	}

	if (normalizedLabel === SERVICE_LABELS.WALL_PLASTERING.toLowerCase()) {
		payload.mode = 'wall-plastering';
	}

	if (normalizedLabel === SERVICE_LABELS.DRYWALL.toLowerCase()) {
		payload.mode = 'drywall';
	}

	if (normalizedLabel === SERVICE_LABELS.FENCE_ASSEMBLY.toLowerCase()) {
		payload.mode = 'fence-assembly';
	}
}

/**
 * Converts a field suffix into lower camelCase.
 * @param {string} [rawFieldName=''] - Raw field suffix.
 * @returns {string} Camel-cased field name.
 */
export function toCamelCaseFieldName(rawFieldName = '') {
	const normalized = String(rawFieldName || '').trim();
	if (!normalized) return '';
	return normalized.charAt(0).toLowerCase() + normalized.slice(1);
}

/**
 * Groups dynamic furniture item form fields into the moebelstuecke array.
 * @param {Object} payload - Payload to mutate.
 * @returns {void}
 */
export function groupFurnitureItemsInPayload(payload) {
	if (!payload || typeof payload !== 'object') return;

	const furnitureItemsByIndex = new Map();

	Object.keys(payload).forEach((key) => {
		const match = key.match(/^furnitureItem([A-Za-z0-9]+)_(\d+)$/);
		if (!match) return;

		const fieldName = toCamelCaseFieldName(match[1]);
		const index = Number.parseInt(match[2], 10);
		if (!Number.isInteger(index) || !fieldName) return;

		if (!furnitureItemsByIndex.has(index)) {
			furnitureItemsByIndex.set(index, {});
		}

		const item = furnitureItemsByIndex.get(index);
		item[fieldName] = payload[key];
		delete payload[key];
	});

	if (!furnitureItemsByIndex.size) return;

	payload.moebelstuecke = Array.from(furnitureItemsByIndex.entries())
		.sort((a, b) => a[0] - b[0])
		.map(([, item]) => item);
}
