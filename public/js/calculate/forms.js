import { getCalcMainContainer } from './dom.js';
import { initInlineAddressAutocompletes, createAddressAutocomplete } from './autocomplete.js';
import { applySelectedServiceData, setSelectedServiceData } from './state.js';

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
	initDynamicFurnitureItems(newForm);
	initFenceAssemblyForm(newForm);
	initKitchenTransportForm(newForm);
	initInlineAddressAutocompletes(newForm);
	initFurnitureAddonToggles(newForm);
	initTransportAssemblyAddonVisibility(newForm);
	initServiceSwitchButtons(newForm, hooks.renderServiceSpecificFormFromStorage);

	if (typeof hooks.initOfferRequestButtons === 'function') {
		hooks.initOfferRequestButtons(newForm);
	}

	return newForm;
}

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

export function initKitchenTransportForm(formElement) {
	const fromContainer = formElement.querySelector('#transportFromAddressAutocomplete');
	const toContainer = formElement.querySelector('#transportToAddressAutocomplete');
	const fromInput = formElement.querySelector('#transportFromAddress');
	const toInput = formElement.querySelector('#transportToAddress');

	if (!fromContainer || !toContainer || !fromInput || !toInput) return;

	const fromAutocomplete = createAddressAutocomplete('transportFromAddressAutocomplete');
	fromAutocomplete.on('select', (location) => {
		fromInput.value = location?.properties?.formatted || '';
	});

	const toAutocomplete = createAddressAutocomplete('transportToAddressAutocomplete');
	toAutocomplete.on('select', (location) => {
		toInput.value = location?.properties?.formatted || '';
	});
}

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
