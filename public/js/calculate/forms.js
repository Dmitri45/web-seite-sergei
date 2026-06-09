/**
 * Form rendering and dynamic form control helpers for the calculator.
 * @module calculate/forms
 */

import { getCalcMainContainer } from './dom.js';
import {
	initInlineAddressAutocompletes,
	createStrictAddressAutocomplete,
	markAddressAutocompleteInvalid,
	mapLocationToTransportPoint
} from './autocomplete.js';
import { SERVICE_AREA_EXCLUDED_LABELS } from './constants.js';
import { applySelectedServiceData, calcState, getSelectedServiceData, setSelectedServiceData } from './state.js';

const SERVICE_AREA_AUTOCOMPLETE_ID = 'serviceAreaAutocomplete';

/**
 * Renders a standalone calculator form and initializes its interactive controls.
 * @param {string} templateHTML - Form template HTML.
 * @param {Object} [hooks={}] - Optional callbacks used by the main calculator flow.
 * @returns {HTMLFormElement|null} Rendered form element.
 */
export function renderStandaloneForm(templateHTML, hooks = {}) {
	const container = getCalcMainContainer();
	if (!container) return null;

	const oldForm = container.querySelector('#calcForm');
	if (oldForm) oldForm.remove();

	const tempDiv = document.createElement('div');
	tempDiv.innerHTML = templateHTML;
	const newForm = tempDiv.querySelector('#calcForm');
	if (!newForm) return null;

	container.appendChild(newForm);
	calcState.selectedServiceArea = null;
	calcState.selectedFormTransportFrom = null;
	calcState.selectedFormTransportTo = null;
	initServiceAreaField(newForm);
	initDynamicFurnitureItems(newForm);
	initFenceAssemblyForm(newForm);
	initKitchenTransportForm(newForm);
	initInlineAddressAutocompletes(newForm);
	initFurnitureAddonToggles(newForm);
	initTransportAssemblyAddonVisibility(newForm);
	initTradeAddonToggles(newForm);
	initServiceSwitchButtons(newForm, hooks.renderServiceSpecificFormFromStorage);

	if (typeof hooks.initOfferRequestButtons === 'function') {
		hooks.initOfferRequestButtons(newForm);
	}

	return newForm;
}

/**
 * Checks whether the current service needs an Einsatzort radius check.
 * @returns {boolean} True when the current service requires an Einsatzort.
 */
export function isServiceAreaRequiredForCurrentService() {
	const serviceLabel = getSelectedServiceData()?.label?.trim() || '';
	return Boolean(serviceLabel && !SERVICE_AREA_EXCLUDED_LABELS.has(serviceLabel));
}

/**
 * Adds the strict Einsatzort autocomplete field to services that need radius checks.
 * @param {HTMLFormElement|HTMLElement} formElement - Active service form.
 * @returns {void}
 */
export function initServiceAreaField(formElement) {
	if (!formElement || !isServiceAreaRequiredForCurrentService()) return;
	if (formElement.querySelector(`#${SERVICE_AREA_AUTOCOMPLETE_ID}`)) return;

	const grid = formElement.querySelector('.calc-grid') || formElement;
	const field = document.createElement('div');
	field.className = 'field field-full service-area-field';
	field.innerHTML = `
		<label for="${SERVICE_AREA_AUTOCOMPLETE_ID}">Einsatzort</label>
		<div id="${SERVICE_AREA_AUTOCOMPLETE_ID}" class="autocomplete-container"></div>
	`;

	grid.insertBefore(field, grid.firstElementChild);

	createStrictAddressAutocomplete(SERVICE_AREA_AUTOCOMPLETE_ID, {
		onSelect: (location) => {
			calcState.selectedServiceArea = mapLocationToTransportPoint(location);
		},
		onInvalidate: () => {
			calcState.selectedServiceArea = null;
		}
	});
}

/**
 * Validates that the Einsatzort was selected from the Geoapify dropdown.
 * @param {HTMLFormElement|HTMLElement|null} formElement - Active service form.
 * @returns {boolean} True when service area is not required or a valid point is selected.
 */
export function validateServiceAreaSelection(formElement) {
	if (!isServiceAreaRequiredForCurrentService()) return true;

	const container = formElement?.querySelector(`#${SERVICE_AREA_AUTOCOMPLETE_ID}`);
	if (calcState.selectedServiceArea?.coordinates?.lat != null && calcState.selectedServiceArea?.coordinates?.lon != null) {
		return true;
	}

	markAddressAutocompleteInvalid(container, 'Bitte Einsatzort aus der Vorschlagsliste wählen.');
	container?.scrollIntoView({ behavior: 'smooth', block: 'center' });
	return false;
}

/**
 * Shows an inline service-area rejection message below the Einsatzort field.
 * @param {HTMLFormElement|HTMLElement|null} formElement - Active service form.
 * @param {string} message - Rejection message.
 * @returns {void}
 */
export function markServiceAreaDenied(formElement, message) {
	const container = formElement?.querySelector(`#${SERVICE_AREA_AUTOCOMPLETE_ID}`);
	markAddressAutocompleteInvalid(container, message);
	container?.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

/**
 * Binds optional furniture addon toggles to their quantity fields.
 * @param {HTMLElement|null} containerElement - Container with addon controls.
 * @returns {void}
 */
export function initFurnitureAddonToggles(containerElement) {
	if (!containerElement) return;

	const toggleInputs = containerElement.querySelectorAll('[data-addon-toggle]');
	toggleInputs.forEach((toggleInput) => {
		if (toggleInput.dataset.toggleBound === '1') return;
		toggleInput.dataset.toggleBound = '1';

		const targetInputId = toggleInput.dataset.target;
		const quantityWrap = containerElement.querySelector(`[data-addon-qty="${targetInputId}"]`);
		const quantityInput = quantityWrap?.querySelector('input');
		if (!quantityWrap || !quantityInput) return;

		const syncVisibility = () => {
			const isEnabled = toggleInput.checked;
			quantityWrap.hidden = !isEnabled;
			if (!isEnabled) quantityInput.value = '';
		};

		toggleInput.addEventListener('change', syncVisibility);
		syncVisibility();
	});
}

/**
 * Shows trade addon configuration fields when their toggle is enabled.
 * @param {HTMLElement|null} containerElement - Trade form containing addon toggles.
 * @returns {void}
 */
export function initTradeAddonToggles(containerElement) {
	if (!containerElement) return;

	containerElement.querySelectorAll('[data-trade-addon-toggle]').forEach((toggleInput) => {
		if (toggleInput.dataset.tradeAddonBound === '1') return;
		toggleInput.dataset.tradeAddonBound = '1';

		const optionsElement = containerElement.querySelector(`#${toggleInput.dataset.target}`);
		if (!optionsElement) return;

		const syncVisibility = () => {
			const isEnabled = toggleInput.checked;
			optionsElement.hidden = !isEnabled;
			optionsElement.querySelectorAll('input, select, textarea').forEach((input) => {
				input.disabled = !isEnabled;
				input.required = isEnabled;
				if (!isEnabled) input.value = '';
			});
		};

		toggleInput.addEventListener('change', syncVisibility);
		containerElement.addEventListener('reset', () => {
			window.setTimeout(syncVisibility, 0);
		});
		syncVisibility();
	});

	const actionButton = containerElement.querySelector('#btn-continue, #btn-calculate');
	if (actionButton && actionButton.dataset.tradeAddonValidationBound !== '1') {
		actionButton.dataset.tradeAddonValidationBound = '1';
		actionButton.addEventListener('click', (event) => {
			const invalidInput = [...containerElement.querySelectorAll('[data-trade-addon-options] select:enabled')]
				.find((input) => input.required && !input.value);
			if (!invalidInput) return;

			event.preventDefault();
			event.stopImmediatePropagation();
			invalidInput.reportValidity();
		}, true);
	}
}

/**
 * Shows assembly addon controls only when transport item assembly is selected.
 * @param {HTMLElement|null} containerElement - Container with transport item cards.
 * @returns {void}
 */
export function initTransportAssemblyAddonVisibility(containerElement) {
	if (!containerElement) return;

	const assemblySelects = containerElement.querySelectorAll('select[name^="transportAssemblyNeed_"]');
	assemblySelects.forEach((assemblySelect) => {
		if (assemblySelect.dataset.assemblyAddonBound === '1') return;
		assemblySelect.dataset.assemblyAddonBound = '1';

		const card = assemblySelect.closest('.furniture-item-card');
		const addonBlock = card?.querySelector('[data-transport-assembly-addons]');
		if (!addonBlock) return;

		const syncVisibility = () => {
			const shouldShow = ['dismantle', 'assemble', 'both'].includes(assemblySelect.value);
			addonBlock.hidden = !shouldShow;

			if (!shouldShow) {
				addonBlock.querySelectorAll('[data-addon-toggle]').forEach((toggleInput) => {
					toggleInput.checked = false;
					toggleInput.dispatchEvent(new Event('change'));
				});
			}
		};

		assemblySelect.addEventListener('change', syncVisibility);
		syncVisibility();
	});
}

/**
 * Initializes address autocompletes in the kitchen transport form.
 * @param {HTMLFormElement|HTMLElement} formElement - Kitchen transport form.
 * @returns {void}
 */
export function initKitchenTransportForm(formElement) {
	const fromContainer = formElement.querySelector('#transportFromAddressAutocomplete');
	const toContainer = formElement.querySelector('#transportToAddressAutocomplete');
	const fromInput = formElement.querySelector('#transportFromAddress');
	const toInput = formElement.querySelector('#transportToAddress');

	if (!fromContainer || !toContainer || !fromInput || !toInput) return;

	createStrictAddressAutocomplete('transportFromAddressAutocomplete', {
		onSelect: (location) => {
			fromInput.value = location?.properties?.formatted || '';
			calcState.selectedFormTransportFrom = mapLocationToTransportPoint(location);
		},
		onInvalidate: () => {
			fromInput.value = '';
			calcState.selectedFormTransportFrom = null;
		}
	});

	createStrictAddressAutocomplete('transportToAddressAutocomplete', {
		onSelect: (location) => {
			toInput.value = location?.properties?.formatted || '';
			calcState.selectedFormTransportTo = mapLocationToTransportPoint(location);
		},
		onInvalidate: () => {
			toInput.value = '';
			calcState.selectedFormTransportTo = null;
		}
	});

	const continueButton = formElement.querySelector('#btn-continue, #btn-calculate');
	if (continueButton && continueButton.dataset.strictTransportAddressBound !== '1') {
		continueButton.dataset.strictTransportAddressBound = '1';
		continueButton.addEventListener('click', (event) => {
			if (fromInput.value && toInput.value) return;

			event.preventDefault();
			event.stopImmediatePropagation();
			if (!fromInput.value) {
				markAddressAutocompleteInvalid(fromContainer, 'Bitte Startadresse aus der Vorschlagsliste wählen.');
			}
			if (!toInput.value) {
				markAddressAutocompleteInvalid(toContainer, 'Bitte Zieladresse aus der Vorschlagsliste wählen.');
			}
			(!fromInput.value ? fromContainer : toContainer).scrollIntoView({ behavior: 'smooth', block: 'center' });
		}, true);
	}
}

/**
 * Toggles the kerbstone length field in the fence assembly form.
 * @param {HTMLFormElement|HTMLElement} formElement - Fence assembly form.
 * @returns {void}
 */
export function initFenceAssemblyForm(formElement) {
	const withKerbstoneSelect = formElement.querySelector('#withKerbstone');
	const kerbstoneLengthInput = formElement.querySelector('#kerbstoneLengthM');
	const kerbstoneLengthField = kerbstoneLengthInput?.closest('.field');

	if (!withKerbstoneSelect || !kerbstoneLengthInput || !kerbstoneLengthField) return;

	const syncKerbstoneField = () => {
		const isWithKerbstone = withKerbstoneSelect.value === 'with';
		kerbstoneLengthField.style.display = isWithKerbstone ? '' : 'none';

		if (!isWithKerbstone) {
			kerbstoneLengthInput.value = '';
		}
	};

	withKerbstoneSelect.addEventListener('change', syncKerbstoneField);
	syncKerbstoneField();
}

/**
 * Creates a dynamic furniture, assembly, or transport item card.
 * @param {number} index - Zero-based item index.
 * @param {string} [templateType='furniture'] - Card template type.
 * @returns {Element|null} Created card element.
 */
export function createFurnitureItemCard(index, templateType = 'furniture') {
	const wrapper = document.createElement('div');
	let templateHTML = getFurnitureItemCardTemplate(index);

	if (templateType === 'assembly') {
		templateHTML = getFurnitureAssemblyItemCardTemplate(index);
	} else if (templateType === 'transport') {
		templateHTML = getTransportItemCardTemplate(index);
	}

	wrapper.innerHTML = templateHTML.trim();
	const card = wrapper.firstElementChild;
	if (!card) return null;

	return card;
}

/**
 * Renumbers dynamic item card headings and remove buttons.
 * @param {HTMLElement} list - Dynamic item list container.
 * @returns {void}
 */
export function refreshFurnitureItemHeaders(list) {
	const cards = list.querySelectorAll('.furniture-item-card');
	const itemLabel = list.dataset.itemLabel || 'Möbelstück';
	cards.forEach((card, idx) => {
		const head = card.querySelector('strong');
		if (head) head.textContent = `${itemLabel} ${idx + 1}`;

		const removeBtn = card.querySelector('[data-remove-item]');
		if (removeBtn) {
			removeBtn.style.display = cards.length > 1 ? 'inline-flex' : 'none';
		}
	});
}

/**
 * Applies the configured maximum item limit to a dynamic item list.
 * @param {HTMLElement} itemsList - Dynamic item list container.
 * @param {HTMLButtonElement} addBtn - Add item button.
 * @returns {void}
 */
export function syncFurnitureItemLimit(itemsList, addBtn) {
	const maxItems = Number.parseInt(itemsList.dataset.maxItems || '', 10);
	if (!Number.isInteger(maxItems) || maxItems <= 0) return;

	const itemCount = itemsList.querySelectorAll('.furniture-item-card').length;
	const isLimitReached = itemCount >= maxItems;
	const limitNotice = itemsList.parentElement?.querySelector('#smallTransportLimitNotice');

	addBtn.disabled = isLimitReached;
	addBtn.setAttribute('aria-disabled', String(isLimitReached));

	if (limitNotice) {
		limitNotice.hidden = !isLimitReached;
	}
}

/**
 * Binds buttons that switch the calculator to another service form.
 * @param {HTMLElement|null} containerElement - Container with switch buttons.
 * @param {Function} renderServiceSpecificFormFromStorage - Callback to render the newly selected service.
 * @returns {void}
 */
export function initServiceSwitchButtons(containerElement, renderServiceSpecificFormFromStorage) {
	if (!containerElement) return;

	const switchButtons = containerElement.querySelectorAll('[data-switch-service]');
	switchButtons.forEach((button) => {
		if (button.dataset.switchBound === '1') return;
		button.dataset.switchBound = '1';

		button.addEventListener('click', () => {
			const serviceLabel = button.dataset.switchService || '';
			if (!serviceLabel) return;

			const serviceData = {
				label: serviceLabel,
				image: 'img/services/moebelservice/umzugshelfer.png',
				category: 'MÖBELSERVICE'
			};

			setSelectedServiceData(serviceData);
			applySelectedServiceData(serviceData);

			if (typeof renderServiceSpecificFormFromStorage === 'function') {
				renderServiceSpecificFormFromStorage();
			}
		});
	});
}

/**
 * Initializes add/remove behavior for dynamic furniture-style item lists.
 * @param {HTMLFormElement|HTMLElement} formElement - Form containing the dynamic list.
 * @returns {void}
 */
export function initDynamicFurnitureItems(formElement) {
	const itemsList = formElement.querySelector('#furnitureItemsList');
	const addBtn = formElement.querySelector('#addFurnitureItemBtn');
	if (!itemsList || !addBtn) return;
	const templateType = itemsList.dataset.itemTemplate || 'furniture';

	addBtn.addEventListener('click', () => {
		const nextIndex = itemsList.querySelectorAll('.furniture-item-card').length;
		const maxItems = Number.parseInt(itemsList.dataset.maxItems || '', 10);
		if (Number.isInteger(maxItems) && maxItems > 0 && nextIndex >= maxItems) {
			syncFurnitureItemLimit(itemsList, addBtn);
			return;
		}

		itemsList.appendChild(createFurnitureItemCard(nextIndex, templateType));
		initFurnitureAddonToggles(itemsList);
		initTransportAssemblyAddonVisibility(itemsList);
		refreshFurnitureItemHeaders(itemsList);
		syncFurnitureItemLimit(itemsList, addBtn);
	});

	itemsList.addEventListener('click', (event) => {
		const removeBtn = event.target.closest('[data-remove-item]');
		if (!removeBtn) return;

		const card = removeBtn.closest('.furniture-item-card');
		if (!card) return;

		card.remove();
		refreshFurnitureItemHeaders(itemsList);
		syncFurnitureItemLimit(itemsList, addBtn);
	});

	refreshFurnitureItemHeaders(itemsList);
	initFurnitureAddonToggles(itemsList);
	initTransportAssemblyAddonVisibility(itemsList);
	syncFurnitureItemLimit(itemsList, addBtn);
}
