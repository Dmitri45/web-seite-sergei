import {
	CUSTOM_REQUEST_SERVICE_LABELS,
	FURNITURE_CALCULATION_SERVICE_LABELS,
	GARDEN_CALCULATION_SERVICE_LABELS,
	KITCHEN_CALCULATION_SERVICE_LABELS,
	TRADES_CALCULATION_SERVICE_LABELS
} from './constants.js';
import { appendTemplateToCalcLayout, getCalcMainContainer, removeFeedbackBlocks, removeFlowBlocks } from './dom.js';
import { createAddressAutocomplete } from './autocomplete.js';
import { createServiceFormTemplates } from './serviceTemplates.js';
import { renderStandaloneForm } from './forms.js';
import {
	bindAddIntermediateAddressHandler,
	bindRemoveIntermediateAddressHandler,
	bindTransportationChoiceHandlers,
	initTransportAutocompletesIfNeeded,
	renderDirectTransportAddressForm,
	renderTransportationSurvey,
	resetTransportSelection
} from './transport.js';
import {
	adaptCustomRequestPayload,
	buildCalculationData,
	validateCustomRequestPayload
} from './payload.js';
import {
	buildLocalCalculationFallback,
	postCalculation,
	postRequestPayload
} from './api.js';
import {
	applySelectedServiceData,
	calcState,
	getSelectedServiceData
} from './state.js';

let serviceFormTemplatesByLabel = null;

function getServiceFormTemplates() {
	if (serviceFormTemplatesByLabel) return serviceFormTemplatesByLabel;

	serviceFormTemplatesByLabel = createServiceFormTemplates({
		kitchenSurvey: document.getElementById('kitchenSurvey'),
		continueBtn: document.getElementById('continueBtn')
	});

	return serviceFormTemplatesByLabel;
}

function renderServiceSpecificFormFromStorage() {
	const selectedService = getSelectedServiceData();
	const label = selectedService?.label?.trim();
	if (!label) return false;

	const templateFactory = getServiceFormTemplates()[label];
	if (!templateFactory) return false;

	const templateHTML = templateFactory();
	if (!templateHTML) return false;

	const kitchenSurvey = document.getElementById('kitchenSurvey');
	if (kitchenSurvey) {
		kitchenSurvey.style.display = 'none';
	}

	const form = renderStandaloneForm(templateHTML, {
		initOfferRequestButtons,
		renderServiceSpecificFormFromStorage
	});
	if (!form) return false;

	calcState.currentForm = form;
	return true;
}

function initOfferRequestButtons(formElement) {
	const continueButton = formElement.querySelector('#btn-continue, #btn-calculate');
	if (!continueButton || continueButton.dataset.offerRequestBound === '1') return;
	continueButton.dataset.offerRequestBound = '1';

	continueButton.addEventListener('click', async () => {
		const selectedService = getSelectedServiceData();
		const serviceLabel = selectedService?.label?.trim() || '';

		if (KITCHEN_CALCULATION_SERVICE_LABELS.has(serviceLabel)) {
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
			const payload = buildCalculationData(calcState.currentForm, calcState);
			if (!validateCustomRequestPayload(payload)) return;

			adaptCustomRequestPayload(payload);
			calcState.latestFrontendFormPayload = payload;
			formElement.style.display = 'none';
			await submitRequestPayload(payload);
			return;
		}

		if (
			FURNITURE_CALCULATION_SERVICE_LABELS.has(serviceLabel) ||
			TRADES_CALCULATION_SERVICE_LABELS.has(serviceLabel)
		) {
			const payload = buildCalculationData(calcState.currentForm, calcState);
			calcState.latestFrontendFormPayload = payload;
			formElement.style.display = 'none';
			showLoadingIndicator();
			await requestCalculation(payload);
			return;
		}

		if (GARDEN_CALCULATION_SERVICE_LABELS.has(serviceLabel)) {
			formElement.style.display = 'none';
			showTransportationSurvey();
			return;
		}

		const payload = buildCalculationData(calcState.currentForm, calcState);
		calcState.latestFrontendFormPayload = payload;
		openOfferRequestForm(payload);
	});
}

function attachFormContinueListener(formElement) {
	const button = formElement.querySelector('#btn-continue');
	if (!button || button.dataset.transportContinueBound === '1') return;
	button.dataset.transportContinueBound = '1';

	button.addEventListener('click', () => {
		formElement.style.display = 'none';
		showTransportationSurvey();
	});
}

function renderAssemblySurvey() {
	const calcContainer = getCalcMainContainer();
	if (!calcContainer) return null;

	const tempDiv = document.createElement('div');
	tempDiv.innerHTML = getAssemblySurvey();
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
			surveyBtns.forEach(button => button.classList.remove('active'));
			btn.classList.add('active');
			calcState.selectedAssembly = btn.dataset.value;

			setAssemblyVisibility(survey, calcState.selectedAssembly === 'yes');
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
		calcState.currentForm = calcForm;
		attachFormContinueListener(calcForm);
	});
}

function showAssemblySurvey() {
	const survey = renderAssemblySurvey();
	if (!survey) return;

	bindAssemblyChoiceHandlers(survey);
	bindAssemblyContinueHandler(survey);
}

function bindTransportationCalculateHandler(survey) {
	const calculateBtn = survey.querySelector('#btn-main');
	if (!calculateBtn) return;

	calculateBtn.addEventListener('click', async () => {
		const data = buildCalculationData(calcState.currentForm, calcState);

		survey.style.display = 'none';
		showLoadingIndicator();
		await requestCalculation(data);
	});
}

function bindDirectTransportContinueHandler(survey) {
	const continueBtn = survey.querySelector('#btn-main');
	if (!continueBtn) return;

	continueBtn.addEventListener('click', () => {
		if (!calcState.selectedTransportFrom?.address || !calcState.selectedTransportTo?.address) {
			alert('Bitte wählen Sie Start- und Zieladresse aus der Vorschlagsliste aus.');
			return;
		}

		const payload = buildCalculationData(calcState.currentForm, calcState);
		calcState.latestFrontendFormPayload = payload;
		survey.style.display = 'none';
		openOfferRequestForm(payload);
	});
}

function showTransportationSurvey() {
	const survey = renderTransportationSurvey();
	if (!survey) return;

	const transportUiState = {
		fromAutocomplete: null,
		intermediateAutocompletes: [],
		toAutocomplete: null
	};

	bindTransportationChoiceHandlers(survey, transportUiState, calcState);
	bindAddIntermediateAddressHandler(survey, transportUiState, calcState);
	bindRemoveIntermediateAddressHandler(survey, transportUiState, calcState);
	bindTransportationCalculateHandler(survey);
}

function showDirectTransportAddressForm() {
	resetTransportSelection(calcState);
	calcState.selectedTransportation = 'yes';

	const survey = renderDirectTransportAddressForm();
	if (!survey) return;

	const transportUiState = {
		fromAutocomplete: null,
		intermediateAutocompletes: [],
		toAutocomplete: null
	};

	initTransportAutocompletesIfNeeded(transportUiState, calcState, {
		fromElementId: 'directTransportFromAutocomplete',
		toElementId: 'directTransportToAutocomplete'
	});
	bindAddIntermediateAddressHandler(survey, transportUiState, calcState, {
		containerSelector: '#directTransportIntermediateAddresses',
		idPrefix: 'directTransportViaAutocomplete'
	});
	bindRemoveIntermediateAddressHandler(survey, transportUiState, calcState);
	bindDirectTransportContinueHandler(survey);
}

async function requestCalculation(data) {
	try {
		const result = await postCalculation(data);
		calcState.latestCalculationResult = result;

		hideLoadingIndicator();
		showResult(result);
	} catch (error) {
		console.error('Ошибка при отправке запроса:', error);
		hideLoadingIndicator();

		const fallbackResult = buildLocalCalculationFallback(data);
		if (fallbackResult) {
			calcState.latestCalculationResult = fallbackResult;
			showResult(fallbackResult);
			return;
		}

		showError('Не удалось получить расчет. Проверьте подключение к серверу.');
	}
}

async function submitRequestPayload(payload, requestType = 'custom-request') {
	try {
		showLoadingIndicator();
		const { requestPayload, result } = await postRequestPayload(payload, requestType);
		calcState.latestFrontendFormPayload = requestPayload;

		hideLoadingIndicator();
		showRequestSent(requestPayload);
		console.log('Request send response:', result);
		return result;
	} catch (error) {
		console.error('Ошибка при отправке заявки:', error);
		hideLoadingIndicator();
		showError('Не удалось отправить заявку. Проверьте настройки Brevo или подключение к серверу.');
		return null;
	}
}

function upsertOfferRequestBlock() {
	const calcSection = getCalcMainContainer();
	if (!calcSection) return null;

	removeFlowBlocks();

	const tempDiv = document.createElement('div');
	tempDiv.innerHTML = getOfferRequestTemplate();
	const block = tempDiv.firstElementChild;
	if (!block) return null;

	calcSection.appendChild(block);
	return block;
}

function collectOfferContactData(formElement) {
	const fallbackAddressInput = formElement.querySelector('#offerAddressAutocomplete input');
	const address = calcState.selectedOfferAddress || fallbackAddressInput?.value?.trim() || '';

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
	calcState.selectedOfferAddress = '';

	const offerAddressAutocomplete = createAddressAutocomplete('offerAddressAutocomplete');
	offerAddressAutocomplete.on('select', (location) => {
		calcState.selectedOfferAddress = location?.properties?.formatted || '';
	});

	form.addEventListener('submit', async (event) => {
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

		if (resultObject === calcState.latestCalculationResult) {
			calcState.latestCalculationResult = resultObject;
		}
		if (resultObject === calcState.latestFrontendFormPayload || !calcState.latestFrontendFormPayload) {
			calcState.latestFrontendFormPayload = resultObject;
		}

		console.log('Offer request payload:', resultObject);
		console.log(JSON.stringify(resultObject, null, 2));
		await submitRequestPayload(resultObject, 'offer');
	});
}

function showLoadingIndicator() {
	hideLoadingIndicator();
	appendTemplateToCalcLayout(getLoadingTemplate());
}

function hideLoadingIndicator() {
	document.getElementById('loading-indicator')?.remove();
}

function showResult(price) {
	removeFeedbackBlocks();

	const serviceLabel = String(price?.serviceLabel || '').trim();
	if (FURNITURE_CALCULATION_SERVICE_LABELS.has(serviceLabel) && price?.prices) {
		appendTemplateToCalcLayout(getFurnitureResultTemplate(price));
	} else if (
		(TRADES_CALCULATION_SERVICE_LABELS.has(serviceLabel) || GARDEN_CALCULATION_SERVICE_LABELS.has(serviceLabel)) &&
		price?.prices
	) {
		appendTemplateToCalcLayout(getServiceResultTemplate(price));
	} else if (price && price.prices) {
		appendTemplateToCalcLayout(getKitchenResultTemplate(price));
	} else {
		appendTemplateToCalcLayout(getResultTemplate(price));
	}

	const resultDisplay = document.getElementById('result-display');
	const offerBtn = resultDisplay?.querySelector('[data-offer-request-result]');
	if (offerBtn) {
		offerBtn.addEventListener('click', () => {
			const base = calcState.latestCalculationResult ?? price;
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
	document.getElementById('offer-request-block')?.remove();
	document.getElementById('calcForm')?.remove();
	appendTemplateToCalcLayout(getRequestSentTemplate(data));
	console.log('Custom request payload:', data);
	console.log(JSON.stringify(data, null, 2));
}

export function initCalculator() {
	const selectedService = getSelectedServiceData();
	applySelectedServiceData(selectedService);

	if (renderServiceSpecificFormFromStorage()) {
		return;
	}

	const kitchenSurvey = document.getElementById('kitchenSurvey');
	const continueBtn = document.getElementById('continueBtn');

	if (kitchenSurvey) {
		const surveyBtns = kitchenSurvey.querySelectorAll('.survey-btn');

		surveyBtns.forEach(btn => {
			btn.addEventListener('click', () => {
				surveyBtns.forEach(button => button.classList.remove('active'));
				btn.classList.add('active');
				calcState.selectedKitchenCondition = btn.dataset.value;
				if (continueBtn) continueBtn.style.display = 'block';
			});
		});
	}

	if (continueBtn) {
		continueBtn.addEventListener('click', () => {
			if (kitchenSurvey) kitchenSurvey.style.display = 'none';

			if (calcState.selectedKitchenCondition === 'new') {
				showAssemblySurvey();
			} else {
				const calcForm = renderForm('used');
				calcForm.style.display = 'block';
				calcState.currentForm = calcForm;
				attachFormContinueListener(calcForm);
			}
		});
	}
}

if (document.readyState === 'loading') {
	document.addEventListener('DOMContentLoaded', initCalculator);
} else {
	initCalculator();
}
