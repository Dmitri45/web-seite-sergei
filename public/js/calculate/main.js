/**
 * Main entrypoint for the modular calculator frontend.
 * @module calculate/main
 */

import {
	CUSTOM_REQUEST_SERVICE_LABELS,
	FURNITURE_CALCULATION_SERVICE_LABELS,
	GARDEN_CALCULATION_SERVICE_LABELS,
	KITCHEN_CALCULATION_SERVICE_LABELS,
	TRADES_CALCULATION_SERVICE_LABELS
} from './constants.js';
import { appendTemplateToCalcLayout, getCalcMainContainer, removeFeedbackBlocks, removeFlowBlocks } from './dom.js';
import { createAddressAutocomplete, markAddressAutocompleteInvalid } from './autocomplete.js';
import { createServiceFormTemplates } from './serviceTemplates.js';
import {
	initServiceAreaField,
	markServiceAreaDenied,
	renderStandaloneForm,
	validateServiceAreaSelection
} from './forms.js';
import {
	bindAddIntermediateAddressHandler,
	bindRemoveIntermediateAddressHandler,
	bindTransportationChoiceHandlers,
	initTransportAutocompletesIfNeeded,
	renderDirectTransportAddressForm,
	renderTransportationSurvey,
	resetTransportSelection,
	validateConfirmedTransportAddresses
} from './transport.js';
import {
	adaptCustomRequestPayload,
	buildCalculationData,
	validateCustomRequestPayload
} from './payload.js';
import {
	buildLocalCalculationFallback,
	postCalculation,
	postRequestPayload,
	postServiceAreaBatchCheck,
	postServiceAreaCheck
} from './api.js';
import {
	applySelectedServiceData,
	calcState,
	getSelectedServiceData
} from './state.js';

/**
 * Cached service form template factories keyed by service label.
 * @type {Record<string, Function>|null}
 */
let serviceFormTemplatesByLabel = null;

/**
 * Merges supplemental form values into a base payload object.
 * @param {Object} payload - Payload to mutate.
 * @param {HTMLFormElement|null} formElement - Supplemental form.
 * @returns {Object} Mutated payload.
 */
function mergeFormValuesIntoPayload(payload, formElement) {
	if (!payload || !formElement) return payload;

	formElement.querySelectorAll('input, select, textarea').forEach((input) => {
		if (!input.name) return;
		payload[input.name] = input.type === 'checkbox'
			? (input.checked ? (input.value || 'yes') : 'no')
			: (input.value || '');
	});

	return payload;
}

/**
 * Checks the selected Einsatzort before the customer can continue the flow.
 * @param {HTMLFormElement|HTMLElement|null} formElement - Active service form.
 * @returns {Promise<boolean>} True when the service area check passes.
 */
async function validateServiceAreaBeforeContinue(formElement) {
	if (!validateServiceAreaSelection(formElement)) return false;
	if (!calcState.selectedServiceArea?.coordinates) return true;

	try {
		const result = await postServiceAreaCheck(calcState.selectedServiceArea);
		if (result.allowed) return true;

		markServiceAreaDenied(
			formElement,
			result.message || 'Dieser Einsatzort liegt außerhalb unseres Einsatzgebiets.'
		);
		return false;
	} catch (error) {
		markServiceAreaDenied(
			formElement,
			error.message || 'Das Einsatzgebiet konnte nicht geprüft werden. Bitte versuchen Sie es erneut.'
		);
		return false;
	}
}

/**
 * Checks whether the selected transport start and destination are inside the service radius.
 * @param {Object} options - Route validation options.
 * @param {HTMLElement|null} options.rootElement - Root element containing address fields.
 * @param {Object|null} options.fromPoint - Selected start point.
 * @param {Object|null} options.toPoint - Selected destination point.
 * @param {string} options.fromSelector - Start autocomplete selector.
 * @param {string} options.toSelector - Destination autocomplete selector.
 * @returns {Promise<boolean>} True when both endpoints are inside the service area.
 */
async function validateTransportEndpointServiceArea({
	rootElement,
	fromPoint,
	toPoint,
	fromSelector,
	toSelector
}) {
	const fromContainer = rootElement?.querySelector(fromSelector);
	const toContainer = rootElement?.querySelector(toSelector);
	if (!fromContainer || !toContainer) return true;

	const markInvalid = (container, message) => {
		markAddressAutocompleteInvalid(container, message);
		container?.scrollIntoView({ behavior: 'smooth', block: 'center' });
	};

	if (!fromPoint?.coordinates) {
		markInvalid(fromContainer, 'Bitte Startadresse aus der Vorschlagsliste wählen.');
		return false;
	}

	if (!toPoint?.coordinates) {
		markInvalid(toContainer, 'Bitte Zieladresse aus der Vorschlagsliste wählen.');
		return false;
	}

	try {
		const result = await postServiceAreaBatchCheck([
			{ ...fromPoint, role: 'from' },
			{ ...toPoint, role: 'to' }
		]);
		if (result.allowed) return true;

		const failedFrom = result.results?.some(point => point.role === 'from' && point.allowed === false);
		const failedTo = result.results?.some(point => point.role === 'to' && point.allowed === false);
		const message = 'Diese Adresse liegt außerhalb unseres Einsatzgebiets.';

		if (failedFrom || (!failedFrom && !failedTo)) {
			markAddressAutocompleteInvalid(fromContainer, message);
		}
		if (failedTo || (!failedFrom && !failedTo)) {
			markAddressAutocompleteInvalid(toContainer, message);
		}
		(failedFrom ? fromContainer : toContainer).scrollIntoView({ behavior: 'smooth', block: 'center' });
		return false;
	} catch (error) {
		markInvalid(
			fromContainer,
			error.message || 'Das Einsatzgebiet konnte nicht geprüft werden. Bitte versuchen Sie es erneut.'
		);
		return false;
	}
}

/**
 * Checks standalone transport-address fields used by Küchentransport and Umzugshelfer.
 * @param {HTMLFormElement|HTMLElement|null} formElement - Active service form.
 * @returns {Promise<boolean>} True when no standalone route exists or both endpoints are allowed.
 */
async function validateStandaloneTransportEndpointServiceArea(formElement) {
	return validateTransportEndpointServiceArea({
		rootElement: formElement,
		fromPoint: calcState.selectedFormTransportFrom,
		toPoint: calcState.selectedFormTransportTo,
		fromSelector: '#transportFromAddressAutocomplete',
		toSelector: '#transportToAddressAutocomplete'
	});
}

/**
 * Opens supplemental assembly fields for Küchentransport before the contact form.
 * @param {HTMLFormElement} previousForm - Original Küchentransport form.
 * @param {Object} basePayload - Payload collected from the original form.
 * @returns {void}
 */
function showKitchenTransportAssemblyDetailsForm(previousForm, basePayload) {
	const calcSection = getCalcMainContainer();
	if (!calcSection) return;

	previousForm.style.display = 'none';
	removeFeedbackBlocks();
	document.getElementById('offer-request-block')?.remove();

	const tempDiv = document.createElement('div');
	tempDiv.innerHTML = getKitchenTransportAssemblyDetailsForm();
	const detailsForm = tempDiv.querySelector('#kitchenTransportAssemblyDetailsForm');
	if (!detailsForm) return;

	calcSection.appendChild(detailsForm);

	const continueButton = detailsForm.querySelector('#btn-continue');
	continueButton?.addEventListener('click', () => {
		const payload = mergeFormValuesIntoPayload(basePayload, detailsForm);
		payload.assembly = 'yes';
		payload.condition = 'new';
		payload.kitchenCondition = 'new';
		calcState.latestFrontendFormPayload = payload;
		detailsForm.remove();
		showLoadingIndicator();
		requestCalculation(payload);
	});

	detailsForm.querySelector('[data-back-to-kitchen-transport]')?.addEventListener('click', () => {
		detailsForm.remove();
		previousForm.style.display = 'block';
	});
}

/**
 * Checks route endpoints from the transport survey flows.
 * @param {HTMLElement|null} survey - Transport survey.
 * @param {Object} selectors - Autocomplete selectors.
 * @returns {Promise<boolean>} True when both endpoints are inside the service area.
 */
async function validateSurveyTransportEndpointServiceArea(survey, selectors) {
	if (calcState.selectedTransportation !== 'yes') return true;

	return validateTransportEndpointServiceArea({
		rootElement: survey,
		fromPoint: calcState.selectedTransportFrom,
		toPoint: calcState.selectedTransportTo,
		fromSelector: selectors.from,
		toSelector: selectors.to
	});
}

/**
 * Lazily creates and returns service form template factories.
 * @returns {Record<string, Function>} Service template factories.
 */
function getServiceFormTemplates() {
	if (serviceFormTemplatesByLabel) return serviceFormTemplatesByLabel;

	serviceFormTemplatesByLabel = createServiceFormTemplates({
		kitchenSurvey: document.getElementById('kitchenSurvey'),
		continueBtn: document.getElementById('continueBtn')
	});

	return serviceFormTemplatesByLabel;
}

/**
 * Renders the service-specific form selected in sessionStorage.
 * @returns {boolean} True when a form was rendered.
 */
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

/**
 * Binds the primary action button of a service form.
 * @param {HTMLFormElement} formElement - Active service form.
 * @returns {void}
 */
function initOfferRequestButtons(formElement) {
	const continueButton = formElement.querySelector('#btn-continue, #btn-calculate');
	if (!continueButton || continueButton.dataset.offerRequestBound === '1') return;
	continueButton.dataset.offerRequestBound = '1';

	continueButton.addEventListener('click', async () => {
		const selectedService = getSelectedServiceData();
		const serviceLabel = selectedService?.label?.trim() || '';

		if (!await validateServiceAreaBeforeContinue(formElement)) return;
		if (!await validateStandaloneTransportEndpointServiceArea(formElement)) return;

		if (serviceLabel === 'Küchentransport') {
			const payload = buildCalculationData(calcState.currentForm, calcState);
			calcState.latestFrontendFormPayload = payload;

			if (payload.kitchenAssembleAtDestination === 'yes') {
				showKitchenTransportAssemblyDetailsForm(formElement, payload);
				return;
			}

			formElement.style.display = 'none';
			showLoadingIndicator();
			await requestCalculation(payload);
			return;
		}

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

/**
 * Binds a simple continue button that opens the transportation survey.
 * @param {HTMLFormElement} formElement - Active kitchen form.
 * @returns {void}
 */
function attachFormContinueListener(formElement) {
	const button = formElement.querySelector('#btn-continue');
	if (!button || button.dataset.transportContinueBound === '1') return;
	button.dataset.transportContinueBound = '1';

	button.addEventListener('click', async () => {
		if (!await validateServiceAreaBeforeContinue(formElement)) return;
		if (!await validateStandaloneTransportEndpointServiceArea(formElement)) return;

		formElement.style.display = 'none';
		showTransportationSurvey();
	});
}

/**
 * Renders the kitchen assembly survey.
 * @returns {HTMLElement|null} Rendered assembly survey.
 */
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

/**
 * Shows or hides assembly quantity fields.
 * @param {HTMLElement} survey - Assembly survey element.
 * @param {boolean} isAssemblyNeeded - Whether assembly is selected.
 * @returns {void}
 */
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

/**
 * Binds yes/no buttons in the assembly survey.
 * @param {HTMLElement} survey - Assembly survey element.
 * @returns {void}
 */
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

/**
 * Binds the assembly survey continue button.
 * @param {HTMLElement} survey - Assembly survey element.
 * @returns {void}
 */
function bindAssemblyContinueHandler(survey) {
	const assemblyContinueBtn = survey.querySelector('#btn-main');
	if (!assemblyContinueBtn) return;

	assemblyContinueBtn.addEventListener('click', () => {
		survey.style.display = 'none';

		const calcForm = renderForm('new');
		calcForm.style.display = 'block';
		calcState.currentForm = calcForm;
		calcState.selectedServiceArea = null;
		initServiceAreaField(calcForm);
		attachFormContinueListener(calcForm);
	});
}

/**
 * Starts the assembly survey flow.
 * @returns {void}
 */
function showAssemblySurvey() {
	const survey = renderAssemblySurvey();
	if (!survey) return;

	bindAssemblyChoiceHandlers(survey);
	bindAssemblyContinueHandler(survey);
}

/**
 * Binds the final calculation button in the transportation survey.
 * @param {HTMLElement} survey - Transportation survey element.
 * @returns {void}
 */
function bindTransportationCalculateHandler(survey) {
	const calculateBtn = survey.querySelector('#btn-main');
	if (!calculateBtn) return;

	calculateBtn.addEventListener('click', async () => {
		if (!validateConfirmedTransportAddresses(survey, calcState)) return;
		if (!await validateSurveyTransportEndpointServiceArea(survey, {
			from: '#transportFromAutocomplete',
			to: '#transportToAutocomplete'
		})) return;

		const data = buildCalculationData(calcState.currentForm, calcState);

		survey.style.display = 'none';
		showLoadingIndicator();
		await requestCalculation(data);
	});
}

/**
 * Binds the continue button for direct small-transport address entry.
 * @param {HTMLElement} survey - Direct transport survey element.
 * @returns {void}
 */
function bindDirectTransportContinueHandler(survey) {
	const continueBtn = survey.querySelector('#btn-main');
	if (!continueBtn) return;

	continueBtn.addEventListener('click', async () => {
		if (!validateConfirmedTransportAddresses(survey, calcState)) return;
		if (!await validateSurveyTransportEndpointServiceArea(survey, {
			from: '#directTransportFromAutocomplete',
			to: '#directTransportToAutocomplete'
		})) return;

		const payload = buildCalculationData(calcState.currentForm, calcState);
		calcState.latestFrontendFormPayload = payload;
		survey.style.display = 'none';
		openOfferRequestForm(payload);
	});
}

/**
 * Starts the optional transportation survey flow.
 * @returns {void}
 */
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

/**
 * Starts the direct address flow for small item transport.
 * @returns {void}
 */
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

/**
 * Requests a price calculation and renders the result or fallback.
 * @param {Object} data - Calculation payload.
 * @returns {Promise<void>}
 */
async function requestCalculation(data) {
	try {
		const result = await postCalculation(data);
		calcState.latestCalculationResult = result;

		hideLoadingIndicator();
		showResult(result);
	} catch (error) {
		console.error('Fehler beim Senden der Anfrage:', error);
		hideLoadingIndicator();

		const fallbackResult = buildLocalCalculationFallback(data);
		if (fallbackResult) {
			calcState.latestCalculationResult = fallbackResult;
			showResult(fallbackResult);
			return;
		}

		showError('Die Berechnung konnte nicht abgerufen werden. Bitte pruefen Sie die Serververbindung.');
	}
}

/**
 * Submits an offer/custom request and renders the confirmation state.
 * @param {Object} payload - Request payload.
 * @param {string} [requestType='custom-request'] - Request type.
 * @returns {Promise<Object|null>} Backend response or null on failure.
 */
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
		console.error('Fehler beim Senden der Anfrage:', error);
		hideLoadingIndicator();
		showError('Die Anfrage konnte nicht gesendet werden. Bitte pruefen Sie die Brevo-Einstellungen oder die Serververbindung.');
		return null;
	}
}

/**
 * Replaces the current flow with the offer contact form.
 * @returns {HTMLElement|null} Rendered offer request block.
 */
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

/**
 * Collects customer contact data from the offer request form.
 * @param {HTMLFormElement} formElement - Offer request form.
 * @returns {{firstName: string, lastName: string, phone: string, email: string, address: string}} Contact data.
 */
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

/**
 * Opens the offer request form for an existing calculation or payload.
 * @param {Object|number|string} baseData - Calculation result or payload to attach customer data to.
 * @returns {void}
 */
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

/**
 * Displays the loading indicator.
 * @returns {void}
 */
function showLoadingIndicator() {
	hideLoadingIndicator();
	appendTemplateToCalcLayout(getLoadingTemplate());
}

/**
 * Removes the loading indicator.
 * @returns {void}
 */
function hideLoadingIndicator() {
	document.getElementById('loading-indicator')?.remove();
}

/**
 * Renders the matching result template for a calculation response.
 * @param {Object} price - Calculation result.
 * @returns {void}
 */
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

/**
 * Renders an error message in the calculator layout.
 * @param {string} message - Error message to display.
 * @returns {void}
 */
function showError(message) {
	removeFeedbackBlocks();
	appendTemplateToCalcLayout(getErrorTemplate(message));
}

/**
 * Renders the request-sent confirmation and logs the submitted payload.
 * @param {Object} data - Submitted request payload.
 * @returns {void}
 */
function showRequestSent(data) {
	removeFeedbackBlocks();
	document.getElementById('offer-request-block')?.remove();
	document.getElementById('calcForm')?.remove();
	appendTemplateToCalcLayout(getRequestSentTemplate(data));
	console.log('Custom request payload:', data);
	console.log(JSON.stringify(data, null, 2));
}

/**
 * Initializes the calculator page and starts the selected service flow.
 * @returns {void}
 */
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
				calcState.selectedServiceArea = null;
				initServiceAreaField(calcForm);
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
