const kitchenSurvey = document.getElementById('kitchenSurvey');
const continueBtn = document.getElementById('continueBtn');
const SERVICE_SELECTION_STORAGE_KEY = 'selectedServiceData';

let selectedKitchenCondition = '';
let selectedTransportation = '';
let selectedAssembly = '';
let currentForm = null;

let selectedTransportFrom = null;
let selectedTransportVia = [];
let selectedTransportTo = null;
let selectedOfferAddress = '';
let latestCalculationResult = null;
let latestFrontendFormPayload = null;
const KITCHEN_CALCULATION_SERVICE_LABELS = new Set([
	'Küche aufbauen',
	'Küche abbauen',
	'Küche anpassen'
]);

const FURNITURE_CALCULATION_SERVICE_LABELS = new Set([
	'Möbel aufbauen',
	'Umzugshelfer'
]);

const CUSTOM_REQUEST_SERVICE_LABELS = new Set([
	'Küchenanfertigung',
	'Möbelanfertigung'
]);

const SERVICE_FORM_TEMPLATES_BY_LABEL = {
	'Küchentransport': () => getKitchenTransportForm(),
	'Küche abbauen': () => getKitchenDismantlingForm(),
	'Küche aufbauen': () => {
		// Показываем опросник, форму не возвращаем сразу
		if (kitchenSurvey) {
			kitchenSurvey.style.display = 'block';
			continueBtn.style.display = 'none';
		}
		return '';
	},
	'Küche anpassen': () => getKitchenAdjustmentEstimateForm(),
	'Küchenanfertigung': () => getCustomKitchenRequestForm(),
	'Möbel aufbauen': () => getFurnitureAssemblyForm(),
	'Möbel entsorgen': () => getFurnitureDisposalForm(),
	'Möbelanfertigung': () => getCustomFurnitureRequestForm(),
	'Umzugshelfer': () => getMovingHelpersEstimateForm(),
	'Kleintransporte': () => getSmallItemsTransportForm(),
	'Fugenreinigung': () => getJointCleaningForm(),
	'Hecken schneiden': () => getHedgeTrimmingForm(),
	'Rasen mähen': () => getLawnMowingForm(),
	'Rollrasen verlegen': () => getLawnInstallationForm(),
	'Wurzeln entfernen': () => getRootRemovalForm(),
	'Pflastern': () => getPavingForm(),
	'Minibagger-Arbeiten': () => getMiniExcavatorWorkForm(),
	'Gartenhütten aufbauen': () => getGardenHutSandingPaintingForm(),
	'Hecken entfernen': () => getHedgeRemovalForm(),
	'Kleine Bäume fällen': () => getSmallTreeFellingForm(),
	'Sträucher schneiden': () => getShrubTrimmingForm(),
	'Entsorgung von Grünschnitt': () => getGreenWasteDisposalForm(),
	'Überdachung': () => getCanopyForm(),
	'Holzhäcksler': () => getWoodChipperForm(),
	'Zäune aufbauen': () => getFenceAssemblyForm()
};

function getCalcMainContainer() {
	return document.querySelector('.calc-layout .calc-main') || document.querySelector('.calc-layout');
}

function getSelectedServiceData() {
	try {
		const raw = sessionStorage.getItem(SERVICE_SELECTION_STORAGE_KEY);
		return raw ? JSON.parse(raw) : null;
	} catch (_) {
		return null;
	}
}

function setSelectedServiceData(serviceData) {
	try {
		sessionStorage.setItem(SERVICE_SELECTION_STORAGE_KEY, JSON.stringify(serviceData));
	} catch (_) {
		// Ignore sessionStorage errors (private mode / disabled storage).
	}
}

function applySelectedServiceData(serviceData) {
	if (!serviceData) return;

	const heroEyebrow = document.querySelector('.hero-eyebrow');
	const heroTitle = document.querySelector('.hero-title');
	const asideTitle = document.querySelector('#selectedServiceAsideTitle');
	const previewImage = document.querySelector('#selectedServicePreviewImage');

	if (heroEyebrow && serviceData.category) heroEyebrow.textContent = serviceData.category;
	if (heroTitle && serviceData.label) heroTitle.textContent = serviceData.label;
	if (asideTitle && serviceData.label) asideTitle.textContent = serviceData.label;
	if (previewImage && serviceData.image) previewImage.src = serviceData.image;
	if (serviceData.label) document.title = `${serviceData.label} – S.K. SERVICE`;
}

function renderStandaloneForm(templateHTML) {
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
	initServiceSwitchButtons(newForm);
	initOfferRequestButtons(newForm);
	return newForm;
}

function initInlineAddressAutocompletes(formElement) {
	if (!formElement) return;

	const autocompleteElements = formElement.querySelectorAll('[data-address-autocomplete]');
	autocompleteElements.forEach((element) => {
		if (!element.id || element.dataset.addressAutocompleteBound === '1') return;
		element.dataset.addressAutocompleteBound = '1';

		const targetName = element.dataset.addressTarget || 'address';
		const targetInput = formElement.querySelector(`[name="${targetName}"]`);
		const addressAutocomplete = createAddressAutocomplete(element.id);

		addressAutocomplete.on('select', (location) => {
			if (targetInput) {
				targetInput.value = location?.properties?.formatted || '';
			}
		});
	});
}

function initFurnitureAddonToggles(containerElement) {
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

function initTransportAssemblyAddonVisibility(containerElement) {
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

function initKitchenTransportForm(formElement) {
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

function initOfferRequestButtons(formElement) {
	const continueButton = formElement.querySelector('#btn-continue, #btn-calculate');
	if (!continueButton) return;

	continueButton.addEventListener('click', async () => {
		const selectedService = getSelectedServiceData();
		const serviceLabel = selectedService?.label?.trim() || '';
		const isKitchenCalculationService = KITCHEN_CALCULATION_SERVICE_LABELS.has(serviceLabel);
		const isFurnitureCalculationService = FURNITURE_CALCULATION_SERVICE_LABELS.has(serviceLabel);

		if (isKitchenCalculationService) {
			formElement.style.display = 'none';
			showTransportationSurvey();
			return;
		}

		if (serviceLabel === 'Kleintransporte') {
			formElement.style.display = 'none';
			showDirectTransportAddressForm();
			return;
		}

		if (CUSTOM_REQUEST_SERVICE_LABELS.has(serviceLabel)) {
			const payload = buildCalculationData();
			if (!validateCustomRequestPayload(payload)) return;

			adaptCustomRequestPayload(payload);
			latestFrontendFormPayload = payload;
			formElement.style.display = 'none';
			showRequestSent(payload);
			return;
		}

		if (isFurnitureCalculationService) {
			const payload = buildCalculationData();
			latestFrontendFormPayload = payload;
			formElement.style.display = 'none';
			showLoadingIndicator();
			await requestCalculation(payload);
			return;
		}

		const payload = buildCalculationData();
		latestFrontendFormPayload = payload;
		openOfferRequestForm(payload);
	});
}

function initFenceAssemblyForm(formElement) {
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

function createFurnitureItemCard(index, templateType = 'furniture') {
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

function refreshFurnitureItemHeaders(list) {
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

function syncFurnitureItemLimit(itemsList, addBtn) {
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

function initServiceSwitchButtons(containerElement) {
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
			renderServiceSpecificFormFromStorage();
		});
	});
}

function initDynamicFurnitureItems(formElement) {
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

function renderServiceSpecificFormFromStorage() {
	const selectedService = getSelectedServiceData();
	const label = selectedService?.label?.trim();
	if (!label) return false;

	const templateFactory = SERVICE_FORM_TEMPLATES_BY_LABEL[label];
	if (!templateFactory) return false;

	const templateHTML = templateFactory();
	if (!templateHTML) return false;

	if (kitchenSurvey) {
		kitchenSurvey.style.display = 'none';
	}

	const form = renderStandaloneForm(templateHTML);
	if (!form) return false;

	currentForm = form;
	return true;
}

function mapLocationToTransportPoint(location) {
		if (!location) return null;

		const address = location.properties?.formatted || '';
		const lat = location.properties?.lat;
		const lon = location.properties?.lon;

		if (!address || lat == null || lon == null) return null;

		return {
			address,
			coordinates: { lat, lon }
		};
}

function createAddressAutocomplete(elementId) {
	return new autocomplete.GeocoderAutocomplete(
		document.getElementById(elementId),
		'c9acb6a7c41d4573814c3954fd7a232c',
		{
			lang: 'de',
			filter: { countrycode: ['de'] },
			limit: 5,
			debounceDelay: 500,
			addDetails: false
		}
	);
}

function init() {
	if (renderServiceSpecificFormFromStorage()) {
		return;
	}

	if (kitchenSurvey) {
		const surveyBtns = kitchenSurvey.querySelectorAll('.survey-btn');

		surveyBtns.forEach(btn => {
			btn.addEventListener('click', () => {
				surveyBtns.forEach(b => b.classList.remove('active'));
				btn.classList.add('active');
				selectedKitchenCondition = btn.dataset.value;
				continueBtn.style.display = 'block';
			});
		});
	}

	if (continueBtn) {
		continueBtn.addEventListener('click', () => {
			kitchenSurvey.style.display = 'none';

			if (selectedKitchenCondition === 'new') {
				showAssemblySurvey();
			} else {
				const calcForm = renderForm('used');
				calcForm.style.display = 'block';
				currentForm = calcForm;
				attachFormContinueListener(calcForm);
			}
		});
	}
}

function attachFormContinueListener(formElement) {
	const button = formElement.querySelector('#btn-continue');

	if (button) {
		button.addEventListener('click', () => {
			formElement.style.display = 'none';
			showTransportationSurvey();
		});
	}
}

function renderAssemblySurvey() {
	const calcContainer = getCalcMainContainer();
	if (!calcContainer) return null;

	const surveyHTML = getAssemblySurvey();

	const tempDiv = document.createElement('div');
	tempDiv.innerHTML = surveyHTML;
	const survey = tempDiv.querySelector('.assembly-survey');
	if (!survey) return null;

	calcContainer.appendChild(survey);
	return survey;
}

function setAssemblyVisibility(survey, isAssemblyNeeded) {
	const assemblyFields = survey.querySelector('#assemblyFields');
	const assemblyContinueBtn = survey.querySelector('#btn-main');

	if (assemblyFields) {
		assemblyFields.style.display = isAssemblyNeeded ? 'block' : 'none';
	}

	if (assemblyContinueBtn) {
		assemblyContinueBtn.style.display = 'block';
	}
}

function bindAssemblyChoiceHandlers(survey) {
	const surveyBtns = survey.querySelectorAll('.survey-btn');

	surveyBtns.forEach(btn => {
		btn.addEventListener('click', () => {
			surveyBtns.forEach(b => b.classList.remove('active'));
			btn.classList.add('active');
			selectedAssembly = btn.dataset.value;

			setAssemblyVisibility(survey, selectedAssembly === 'yes');
		});
	});
}

function bindAssemblyContinueHandler(survey) {
	const assemblyContinueBtn = survey.querySelector('#btn-main');
	if (!assemblyContinueBtn) return;

	assemblyContinueBtn.addEventListener('click', () => {
		survey.style.display = 'none';

		const calcForm = renderForm('new');
		calcForm.style.display = 'block';
		currentForm = calcForm;
		attachFormContinueListener(calcForm);
	});
}

function showAssemblySurvey() {
	const survey = renderAssemblySurvey();
	if (!survey) return;

	bindAssemblyChoiceHandlers(survey);
	bindAssemblyContinueHandler(survey);
}

function renderTransportationSurvey() {
	const calcContainer = getCalcMainContainer();
	if (!calcContainer) return null;

	const surveyHTML = getTransportationSurvey();
	const tempDiv = document.createElement('div');
	tempDiv.innerHTML = surveyHTML;

	const survey = tempDiv.querySelector('.transport-survey');
	if (!survey) return null;

	calcContainer.appendChild(survey);
	return survey;
}

function renderDirectTransportAddressForm() {
	const calcContainer = getCalcMainContainer();
	if (!calcContainer) return null;

	const tempDiv = document.createElement('div');
	tempDiv.innerHTML = getDirectTransportAddressForm();

	const survey = tempDiv.querySelector('#directTransportSurvey');
	if (!survey) return null;

	calcContainer.appendChild(survey);
	return survey;
}

function resetTransportSelection() {
	selectedTransportFrom = null;
	selectedTransportVia = [];
	selectedTransportTo = null;

	const intermediateContainer = document.getElementById('transportIntermediateAddresses');
	if (intermediateContainer) {
		intermediateContainer.innerHTML = '';
	}

	const directIntermediateContainer = document.getElementById('directTransportIntermediateAddresses');
	if (directIntermediateContainer) {
		directIntermediateContainer.innerHTML = '';
	}
}

function appendIntermediateAddressField(survey, index, containerSelector = '#transportIntermediateAddresses', idPrefix = 'transportViaAutocomplete') {
	const container = survey.querySelector(containerSelector);
	if (!container) return null;

	const tempDiv = document.createElement('div');
	tempDiv.innerHTML = getIntermediateAddressTemplate(index, idPrefix);
	const field = tempDiv.firstElementChild;

	if (field) {
		container.appendChild(field);
	}

	return field;
}

function setTransportationVisibility(survey, isTransportNeeded) {
	const transportFields = survey.querySelector('#transportFields');
	const transportActions = survey.querySelector('#transportActions');

	if (transportFields) {
		transportFields.style.display = isTransportNeeded ? 'block' : 'none';
	}

	if (transportActions) {
		transportActions.style.display = 'flex';
	}
}

function handleFromLocationSelect(location) {
	const transportPoint = mapLocationToTransportPoint(location);
	if (!transportPoint) return;

	selectedTransportFrom = transportPoint;
}

function handleToLocationSelect(location) {
	const transportPoint = mapLocationToTransportPoint(location);
	if (!transportPoint) return;
	selectedTransportTo = transportPoint;
}

function createIntermediateLocationHandler(index) {
	return (location) => {
		const transportPoint = mapLocationToTransportPoint(location);
		if (!transportPoint) return;
		selectedTransportVia[index] = transportPoint;
	};
}

function addIntermediateAddressAutocomplete(survey, state, options = {}) {
	const index = state.intermediateAutocompletes.length;
	const idPrefix = options.idPrefix || 'transportViaAutocomplete';
	const field = appendIntermediateAddressField(
		survey,
		index,
		options.containerSelector || '#transportIntermediateAddresses',
		idPrefix
	);
	if (!field) return;

	const elementId = `${idPrefix}-${index}`;
	const intermediateAutocomplete = createAddressAutocomplete(elementId);
	intermediateAutocomplete.on('select', createIntermediateLocationHandler(index));

	state.intermediateAutocompletes.push(intermediateAutocomplete);
}

function initTransportAutocompletesIfNeeded(state, options = {}) {
	const fromElementId = options.fromElementId || 'transportFromAutocomplete';
	const toElementId = options.toElementId || 'transportToAutocomplete';

	if (!state.fromAutocomplete) {
		state.fromAutocomplete = createAddressAutocomplete(fromElementId);
		state.fromAutocomplete.on('select', handleFromLocationSelect);
	}

	if (!state.toAutocomplete) {
		state.toAutocomplete = createAddressAutocomplete(toElementId);
		state.toAutocomplete.on('select', handleToLocationSelect);
	}
}

function bindAddIntermediateAddressHandler(survey, state, options = {}) {
	const addIntermediateAddressBtn = survey.querySelector('#addIntermediateAddressBtn');
	if (!addIntermediateAddressBtn) return;

	addIntermediateAddressBtn.addEventListener('click', () => {
		addIntermediateAddressAutocomplete(survey, state, options);
	});
}

function refreshIntermediateAddressLabels(survey) {
	const fields = survey.querySelectorAll('[data-intermediate-address-index]');
	fields.forEach((field, index) => {
		field.dataset.intermediateAddressIndex = String(index);

		const label = field.querySelector('.intermediate-address-field__head label');
		if (label) label.textContent = `Zwischeziel ${index + 1}`;

		const removeBtn = field.querySelector('[data-remove-intermediate-address]');
		if (removeBtn) {
			removeBtn.dataset.removeIntermediateAddress = String(index);
		}
	});
}

function bindRemoveIntermediateAddressHandler(survey, state) {
	if (!survey || survey.dataset.removeIntermediateBound === '1') return;
	survey.dataset.removeIntermediateBound = '1';

	survey.addEventListener('click', (event) => {
		const removeBtn = event.target.closest('[data-remove-intermediate-address]');
		if (!removeBtn) return;

		const index = Number.parseInt(removeBtn.dataset.removeIntermediateAddress || '', 10);
		if (Number.isInteger(index)) {
			delete selectedTransportVia[index];
		}

		removeBtn.closest('[data-intermediate-address-index]')?.remove();
		selectedTransportVia = selectedTransportVia.filter(point => point?.address);

		if (state?.intermediateAutocompletes) {
			state.intermediateAutocompletes.splice(index, 1);
		}

		refreshIntermediateAddressLabels(survey);
	});
}

function bindTransportationChoiceHandlers(survey, state) {
	const surveyBtns = survey.querySelectorAll('.survey-btn');

	surveyBtns.forEach(btn => {
		btn.addEventListener('click', () => {
			surveyBtns.forEach(b => b.classList.remove('active'));
			btn.classList.add('active');
			selectedTransportation = btn.dataset.value;

			const isTransportNeeded = selectedTransportation === 'yes';
			setTransportationVisibility(survey, isTransportNeeded);

			if (isTransportNeeded) {
				initTransportAutocompletesIfNeeded(state);
			} else {
				resetTransportSelection();
			}
		});
	});
}

function addAssemblyDataIfNeeded(data) {
	if (selectedKitchenCondition !== 'new') return;

	data.assembly = selectedAssembly;

	if (selectedAssembly === 'yes') {
		const assemblySurvey = document.getElementById('assemblySurvey');
		if (assemblySurvey) {
			data.smallCabinets = assemblySurvey.querySelector('#smallCabinets')?.value || '0';
			data.largeCabinets = assemblySurvey.querySelector('#largeCabinets')?.value || '0';
			data.drawers = assemblySurvey.querySelector('#drawers')?.value || '0';
		}
	}
}

function addTransportationDataIfNeeded(data) {
	if (selectedTransportation !== 'yes') return;

	data.transportFrom = selectedTransportFrom;
	data.transportVia = selectedTransportVia.filter(point => point?.address);
	data.transportTo = selectedTransportTo;
}

function buildCalculationData() {
	const data = buildKitchenFormPayload(currentForm);
	data.transportation = selectedTransportation;

	addAssemblyDataIfNeeded(data);
	addTransportationDataIfNeeded(data);
	adaptKitchenPayloadForBackend(data);

	return data;
}

function validateCustomRequestPayload(payload) {
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

function adaptCustomRequestPayload(payload) {
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

function adaptKitchenPayloadForBackend(data) {
	if (!data || typeof data !== 'object') return data;
	const serviceLabel = String(data.serviceLabel || '').trim();

	if (!KITCHEN_CALCULATION_SERVICE_LABELS.has(serviceLabel)) return data;

	data.condition = data.kitchenCondition || selectedKitchenCondition || data.condition || 'new';
	data.abbau = data.dismantling === 'yes' || data.abbau === true || data.abbau === 'true';
	data.worktopAdjust = data.worktopAdjust || data.worktopMaterial || '';

	return data;
}

function bindTransportationCalculateHandler(survey) {
	const calculateBtn = survey.querySelector('#btn-main');
	if (!calculateBtn) return;

	calculateBtn.addEventListener('click', async () => {
		const data = buildCalculationData();

		survey.style.display = 'none';
		showLoadingIndicator();
		await requestCalculation(data);
	});
}

function bindDirectTransportContinueHandler(survey) {
	const continueBtn = survey.querySelector('#btn-main');
	if (!continueBtn) return;

	continueBtn.addEventListener('click', () => {
		if (!selectedTransportFrom?.address || !selectedTransportTo?.address) {
			alert('Bitte wählen Sie Start- und Zieladresse aus der Vorschlagsliste aus.');
			return;
		}

		const payload = buildCalculationData();
		latestFrontendFormPayload = payload;
		survey.style.display = 'none';
		openOfferRequestForm(payload);
	});
}

function showTransportationSurvey() {
	const survey = renderTransportationSurvey();
	if (!survey) return;

	const transportState = {
		fromAutocomplete: null,
		intermediateAutocompletes: [],
		toAutocomplete: null
	};

	bindTransportationChoiceHandlers(survey, transportState);
	bindAddIntermediateAddressHandler(survey, transportState);
	bindRemoveIntermediateAddressHandler(survey, transportState);
	bindTransportationCalculateHandler(survey);
}

function showDirectTransportAddressForm() {
	resetTransportSelection();
	selectedTransportation = 'yes';

	const survey = renderDirectTransportAddressForm();
	if (!survey) return;

	const transportState = {
		fromAutocomplete: null,
		intermediateAutocompletes: [],
		toAutocomplete: null
	};

	initTransportAutocompletesIfNeeded(transportState, {
		fromElementId: 'directTransportFromAutocomplete',
		toElementId: 'directTransportToAutocomplete'
	});
	bindAddIntermediateAddressHandler(survey, transportState, {
		containerSelector: '#directTransportIntermediateAddresses',
		idPrefix: 'directTransportViaAutocomplete'
	});
	bindRemoveIntermediateAddressHandler(survey, transportState);
	bindDirectTransportContinueHandler(survey);
}

async function requestCalculation(data) {
	try {
		const response = await fetch(getCalculationEndpoint(data), {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(data)
		});

		if (!response.ok) {
			throw new Error(`Ошибка сервера: ${response.status}`);
		}

		const result = await response.json();
		latestCalculationResult = result;

		hideLoadingIndicator();
		showResult(result);
	} catch (error) {
		console.error('Ошибка при отправке запроса:', error);
		hideLoadingIndicator();
		showError('Не удалось получить расчет. Проверьте подключение к серверу.');
	}
}

function getCalculationEndpoint(data = {}) {
	const serviceLabel = String(data.serviceLabel || '').trim();

	if (FURNITURE_CALCULATION_SERVICE_LABELS.has(serviceLabel)) {
		return 'http://localhost:3000/api/furniture/calculate';
	}

	return 'http://localhost:3000/api/kitchen/calculate';
}

function buildKitchenFormPayload(formElement) {
	const selectedService = getSelectedServiceData();
	const serviceLabel = selectedService?.label || '';
	const data = {
		kitchenCondition: selectedKitchenCondition,
		serviceLabel
	};

	if (!formElement) return data;

	const inputs = formElement.querySelectorAll('input, select, textarea');
	inputs.forEach(input => {
		if (input.name) {
			data[input.name] = input.value || '';
		}
	});

	groupFurnitureItemsInPayload(data);
	adaptPayloadForService(data, serviceLabel);

	return data;
}

function adaptPayloadForService(payload, serviceLabel = '') {
	if (!payload || typeof payload !== 'object') return;

	const normalizedLabel = String(serviceLabel || '').trim().toLowerCase();

	if (normalizedLabel === 'möbel aufbauen') {
		payload.mode = 'new-assembly';
	}

	if (normalizedLabel === 'möbel entsorgen') {
		payload.mode = 'old-disassembly';
	}

	if (normalizedLabel === 'umzugshelfer') {
		payload.mode = 'moving-helpers';
	}
}

function toCamelCaseFieldName(rawFieldName = '') {
	const normalized = String(rawFieldName || '').trim();
	if (!normalized) return '';
	return normalized.charAt(0).toLowerCase() + normalized.slice(1);
}

function groupFurnitureItemsInPayload(payload) {
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

function appendTemplateToCalcLayout(templateHTML) {
	const calcSection = getCalcMainContainer();
	if (!calcSection) return;

	const tempDiv = document.createElement('div');
	tempDiv.innerHTML = templateHTML;
	const element = tempDiv.firstElementChild;

	if (element) {
		calcSection.appendChild(element);
	}
}

function upsertOfferRequestBlock() {
	const calcSection = getCalcMainContainer();
	if (!calcSection) return null;

	document.getElementById('calcForm')?.remove();
	document.getElementById('result-display')?.remove();
	document.getElementById('error-display')?.remove();
	document.getElementById('loading-indicator')?.remove();
	document.getElementById('kitchenSurvey')?.remove();
	document.getElementById('assemblySurvey')?.remove();
	document.getElementById('transportSurvey')?.remove();
	document.getElementById('directTransportSurvey')?.remove();
	document.getElementById('offer-request-block')?.remove();

	const tempDiv = document.createElement('div');
	tempDiv.innerHTML = getOfferRequestTemplate();
	const block = tempDiv.firstElementChild;
	if (!block) return null;

	calcSection.appendChild(block);
	return block;
}

function collectOfferContactData(formElement) {
	const fallbackAddressInput = formElement.querySelector('#offerAddressAutocomplete input');
	const address = selectedOfferAddress || fallbackAddressInput?.value?.trim() || '';

	return {
		firstName: formElement.querySelector('#offerFirstName')?.value?.trim() || '',
		lastName: formElement.querySelector('#offerLastName')?.value?.trim() || '',
		phone: formElement.querySelector('#offerPhone')?.value?.trim() || '',
		email: formElement.querySelector('#offerEmail')?.value?.trim() || '',
		address
	};
}

function openOfferRequestForm(baseData) {
	const block = upsertOfferRequestBlock();
	if (!block) return;

	const form = block.querySelector('#offerRequestForm');
	if (!form) return;
	selectedOfferAddress = '';

	const offerAddressAutocomplete = createAddressAutocomplete('offerAddressAutocomplete');
	offerAddressAutocomplete.on('select', (location) => {
		selectedOfferAddress = location?.properties?.formatted || '';
	});

	form.addEventListener('submit', (event) => {
		event.preventDefault();

		const contact = collectOfferContactData(form);
		if (!contact.address) {
			alert('Bitte wählen Sie eine Adresse aus der Vorschlagsliste aus.');
			return;
		}
		const resultObject = (baseData && typeof baseData === 'object')
			? baseData
			: { value: baseData };

		resultObject.customer = contact;

		if (resultObject === latestCalculationResult) {
			latestCalculationResult = resultObject;
		}
		if (resultObject === latestFrontendFormPayload || !latestFrontendFormPayload) {
			latestFrontendFormPayload = resultObject;
		}

		console.log('Offer request payload:', resultObject);
		console.log(JSON.stringify(resultObject, null, 2));
	});
}

function showLoadingIndicator() {
	hideLoadingIndicator();
	appendTemplateToCalcLayout(getLoadingTemplate());
}

function hideLoadingIndicator() {
	const loadingDiv = document.getElementById('loading-indicator');
	if (loadingDiv) {
		loadingDiv.remove();
	}
}

function showResult(price) {
	removeFeedbackBlocks();

	const serviceLabel = String(price?.serviceLabel || '').trim();
	if (FURNITURE_CALCULATION_SERVICE_LABELS.has(serviceLabel) && price?.prices) {
		appendTemplateToCalcLayout(getFurnitureResultTemplate(price));
	} else if (price && price.prices) {
		appendTemplateToCalcLayout(getKitchenResultTemplate(price));
	} else {
		appendTemplateToCalcLayout(getResultTemplate(price));
	}

	const resultDisplay = document.getElementById('result-display');
	const offerBtn = resultDisplay?.querySelector('[data-offer-request-result]');
	if (offerBtn) {
		offerBtn.addEventListener('click', () => {
			const base = latestCalculationResult ?? price;
			openOfferRequestForm(base);
		});
	}
}

function showError(message) {
	removeFeedbackBlocks();
	appendTemplateToCalcLayout(getErrorTemplate(message));
}

function showRequestSent(data) {
	removeFeedbackBlocks();
	appendTemplateToCalcLayout(getRequestSentTemplate(data));
	console.log('Custom request payload:', data);
	console.log(JSON.stringify(data, null, 2));
}

function removeFeedbackBlocks() {
	document.getElementById('result-display')?.remove();
	document.getElementById('error-display')?.remove();
	document.getElementById('loading-indicator')?.remove();
}

init();

// TODO:
// Ошибки в консоле
// Разобрать файл calculate.js на части, выделить функции по отдельным файлам и импортировать их
// Добавить валидацию форм (напр. обязательные поля, числовые поля и т.д.)
// На Backend сделать routes, Controller, Validation для получения данных из Frontend и расчета стоимости
// На Backend добавить расчет стоимости на основе полученных данных и вернуть результат в ответе
// На Frontend отобразить полученный результат (напр. показать итоговую стоимость, список выбранных услуг и т.д.)
// Мобильная версия (адаптивность)
