/**
 * Form rendering and dynamic form control helpers for the calculator.
 * @module calculate/forms
 */

import { getCalcMainContainer } from './dom.js';
import {
	initInlineAddressAutocompletes,
	createStrictAddressAutocomplete,
	clearAddressAutocompleteStatus,
	markAddressAutocompleteInvalid,
	mapLocationToTransportPoint
} from './autocomplete.js';
import { SERVICE_AREA_EXCLUDED_LABELS } from './constants.js';
import { applySelectedServiceData, calcState, getSelectedServiceData, setSelectedServiceData } from './state.js';

const SERVICE_AREA_AUTOCOMPLETE_ID = 'serviceAreaAutocomplete';
const OPTIONAL_FIELD_NAMES = new Set([
	'additionalNotes',
	'notes',
	'offerPhone',
	'workDescription'
]);

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
	initShrubTrimmingForm(newForm);
	initInlineAddressAutocompletes(newForm);
	initFurnitureAddonToggles(newForm);
	initTransportAssemblyAddonVisibility(newForm);
	initTradeAddonToggles(newForm);
	initServiceSwitchButtons(newForm, hooks.renderServiceSpecificFormFromStorage);
	bindFormValidationReset(newForm);

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
 * Validates that the Einsatzort was selected from the address suggestions.
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
 * Returns whether a form control is currently visible and can be edited.
 * @param {HTMLElement} control - Form control.
 * @returns {boolean} True when the control is visible.
 */
function isVisibleFormControl(control) {
	return Boolean(control.offsetParent || control.getClientRects().length);
}

/**
 * Finds the field wrapper used for inline validation styling.
 * @param {HTMLElement} control - Form control.
 * @returns {HTMLElement|null} Field wrapper.
 */
function getValidationField(control) {
	return control.closest('.field') || control.parentElement;
}

/**
 * Removes inline validation styling from a regular form control.
 * @param {HTMLElement} control - Form control.
 * @returns {void}
 */
function clearFieldValidation(control) {
	const field = getValidationField(control);
	if (!field) return;

	field.classList.remove('field--invalid');
	field.querySelector('.field-validation-message')?.remove();
	control.removeAttribute('aria-invalid');
}

/**
 * Clears all generic inline validation messages in a form.
 * @param {HTMLElement} formElement - Form to clean up.
 * @returns {void}
 */
function clearFormValidation(formElement) {
	formElement.querySelectorAll('input, select, textarea').forEach(clearFieldValidation);
	formElement.querySelectorAll('[data-address-autocomplete]').forEach(clearAddressAutocompleteStatus);
}

/**
 * Clears inline validation messages when the form is reset.
 * @param {HTMLElement} formElement - Form to bind.
 * @returns {void}
 */
function bindFormValidationReset(formElement) {
	if (!formElement || formElement.dataset.validationResetBound === '1') return;
	formElement.dataset.validationResetBound = '1';

	formElement.addEventListener('reset', () => {
		window.setTimeout(() => clearFormValidation(formElement), 0);
	});
}

/**
 * Shows an inline validation message for a regular form control.
 * @param {HTMLElement} control - Form control.
 * @param {string} message - Message text.
 * @returns {void}
 */
function markFieldInvalid(control, message) {
	const field = getValidationField(control);
	if (!field) return;

	field.classList.add('field--invalid');
	control.setAttribute('aria-invalid', 'true');

	let messageElement = field.querySelector('.field-validation-message');
	if (!messageElement) {
		messageElement = document.createElement('p');
		messageElement.className = 'field-validation-message';
		field.appendChild(messageElement);
	}
	messageElement.textContent = message;
}

/**
 * Binds live cleanup for a form control after the user edits it.
 * @param {HTMLElement} control - Form control.
 * @returns {void}
 */
function bindFieldValidationCleanup(control) {
	if (control.dataset.requiredValidationBound === '1') return;
	control.dataset.requiredValidationBound = '1';

	['input', 'change'].forEach((eventName) => {
		control.addEventListener(eventName, () => {
			if (isControlFilledAndValid(control)) clearFieldValidation(control);
		});
	});
}

/**
 * Checks whether a control should be ignored by the generic required-field validator.
 * @param {HTMLElement} control - Form control.
 * @returns {boolean} True when the control is optional or handled elsewhere.
 */
function shouldSkipRequiredValidation(control) {
	const tagName = control.tagName.toLowerCase();
	const type = String(control.type || '').toLowerCase();
	const field = getValidationField(control);
	const label = field?.querySelector('label')?.textContent?.toLowerCase() || '';

	if (!control.name || control.disabled || !isVisibleFormControl(control)) return true;
	if (['button', 'checkbox', 'file', 'hidden', 'radio', 'reset', 'submit'].includes(type)) return true;
	if (tagName === 'textarea' && !control.required) return true;
	if (OPTIONAL_FIELD_NAMES.has(control.name) || OPTIONAL_FIELD_NAMES.has(control.id)) return true;
	if (label.includes('optional') || label.includes('zusätzliche hinweise')) return true;

	return false;
}

/**
 * Gets the correct German validation text for a control.
 * @param {HTMLElement} control - Form control.
 * @returns {string} Validation message.
 */
function getRequiredMessage(control) {
	if (control.tagName.toLowerCase() === 'select') return 'Bitte wählen Sie eine Option aus.';
	if (!String(control.value || '').trim()) return 'Bitte füllen Sie dieses Feld aus.';
	if (control.type === 'email') return 'Bitte geben Sie eine gültige E-Mail-Adresse ein.';
	if (control.validity && control.value && !control.validity.valid) return 'Bitte geben Sie einen gültigen Wert ein.';
	return 'Bitte füllen Sie dieses Feld aus.';
}

/**
 * Checks whether a control has a usable value and passes native constraints.
 * @param {HTMLElement} control - Form control.
 * @returns {boolean} True when filled and valid.
 */
function isControlFilledAndValid(control) {
	if (!String(control.value || '').trim()) return false;
	return !control.validity || control.validity.valid;
}

/**
 * Returns enabled regular controls in an option block.
 * @param {HTMLElement} block - Option block.
 * @returns {HTMLElement[]} Controls inside the block.
 */
function getOptionBlockControls(block) {
	return [...block.querySelectorAll('input, select, textarea')]
		.filter(control => !shouldSkipRequiredValidation(control));
}

/**
 * Validates an either/or option group, such as area total or length and width.
 * @param {HTMLElement} group - Option group wrapper.
 * @returns {{valid: boolean, firstInvalid: HTMLElement|null}} Validation result.
 */
function validateOptionGroup(group) {
	const blocks = [...group.querySelectorAll('.calc-option-block')];
	if (blocks.length < 2) return { valid: true, firstInvalid: null };

	const blockStates = blocks.map((block) => {
		const controls = getOptionBlockControls(block);
		const filledControls = controls.filter(isControlFilledAndValid);
		return {
			controls,
			filledControls,
			isComplete: controls.length > 0 && filledControls.length === controls.length,
			isStarted: filledControls.length > 0
		};
	});

	if (blockStates.some(state => state.isComplete)) {
		blockStates.forEach(state => state.controls.forEach(clearFieldValidation));
		return { valid: true, firstInvalid: null };
	}

	const activeState = blockStates.find(state => state.isStarted) || blockStates[0];
	const invalidControl = activeState.controls.find(control => !isControlFilledAndValid(control)) || activeState.controls[0] || null;
	if (invalidControl) {
		markFieldInvalid(invalidControl, 'Bitte füllen Sie eine Variante vollständig aus.');
	}

	return { valid: false, firstInvalid: invalidControl };
}

/**
 * Validates inline address autocompletes that write into hidden address fields.
 * @param {HTMLElement} formElement - Form being validated.
 * @returns {{valid: boolean, firstInvalid: HTMLElement|null}} Validation result.
 */
function validateInlineAddressFields(formElement) {
	let firstInvalid = null;

	formElement.querySelectorAll('[data-address-autocomplete]').forEach((container) => {
		const targetName = container.dataset.addressTarget || 'address';
		const targetInput = formElement.querySelector(`[name="${targetName}"]`);
		if (!targetInput || targetInput.disabled) return;

		if (String(targetInput.value || '').trim()) {
			clearAddressAutocompleteStatus(container);
			return;
		}

		markAddressAutocompleteInvalid(container, 'Bitte Adresse aus der Vorschlagsliste wählen.');
		firstInvalid ||= container;
	});

	return { valid: !firstInvalid, firstInvalid };
}

/**
 * Validates visible required controls in a calculator form with inline messages.
 * @param {HTMLFormElement|HTMLElement|null} formElement - Form to validate.
 * @returns {boolean} True when all required fields are filled.
 */
export function validateRequiredFormFields(formElement) {
	if (!formElement) return true;

	let firstInvalid = null;
	const optionGroupControls = new Set();

	formElement.querySelectorAll('.field-full').forEach((group) => {
		if (!group.querySelector('.calc-option-divider')) return;
		group.querySelectorAll('input, select, textarea').forEach(control => optionGroupControls.add(control));

		const result = validateOptionGroup(group);
		if (!result.valid) firstInvalid ||= result.firstInvalid;
	});

	formElement.querySelectorAll('input, select, textarea').forEach((control) => {
		bindFieldValidationCleanup(control);
		if (optionGroupControls.has(control)) return;
		clearFieldValidation(control);
		if (shouldSkipRequiredValidation(control)) return;
		if (isControlFilledAndValid(control)) return;

		markFieldInvalid(control, getRequiredMessage(control));
		firstInvalid ||= control;
	});

	const addressResult = validateInlineAddressFields(formElement);
	if (!addressResult.valid) firstInvalid ||= addressResult.firstInvalid;

	if (!firstInvalid) return true;

	firstInvalid.focus?.({ preventScroll: true });
	(firstInvalid.closest?.('.field') || firstInvalid).scrollIntoView({ behavior: 'smooth', block: 'center' });
	return false;
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
			markFieldInvalid(invalidInput, 'Bitte wählen Sie eine Option aus.');
			invalidInput.closest('.field')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
		}, true);
	}
}

/**
 * Shows only the shrub fields that match the selected current and target shape modes.
 * @param {HTMLFormElement|HTMLElement} formElement - Shrub trimming form.
 * @returns {void}
 */
export function initShrubTrimmingForm(formElement) {
	const currentModeSelect = formElement.querySelector('#currentShapeMode');
	const currentTypeWrap = formElement.querySelector('#currentShapeTypeWrap');
	const currentSizeWrap = formElement.querySelector('#currentSizeFieldsWrap');
	const targetModeSelect = formElement.querySelector('#targetShapeMode');
	const targetTypeWrap = formElement.querySelector('#targetShapeTypeWrap');
	const targetSizeWrap = formElement.querySelector('#targetSizeFieldsWrap');

	if (!currentModeSelect && !targetModeSelect) return;

	const setGroupEnabled = (wrap, enabled) => {
		if (!wrap) return;
		wrap.hidden = !enabled;
		wrap.querySelectorAll('input, select, textarea').forEach((control) => {
			control.disabled = !enabled;
			if (!enabled) {
				control.value = '';
				clearFieldValidation(control);
			}
		});
	};

	const syncCurrentFields = () => {
		const mode = currentModeSelect?.value || '';
		setGroupEnabled(currentTypeWrap, mode === 'in-shape');
		setGroupEnabled(currentSizeWrap, mode === 'not-in-shape');
	};

	const syncTargetFields = () => {
		const mode = targetModeSelect?.value || '';
		setGroupEnabled(targetTypeWrap, mode === 'in-shape');
		setGroupEnabled(targetSizeWrap, mode === 'not-in-shape');
	};

	currentModeSelect?.addEventListener('change', syncCurrentFields);
	targetModeSelect?.addEventListener('change', syncTargetFields);
	formElement.addEventListener('reset', () => {
		window.setTimeout(() => {
			syncCurrentFields();
			syncTargetFields();
		}, 0);
	});

	syncCurrentFields();
	syncTargetFields();
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
