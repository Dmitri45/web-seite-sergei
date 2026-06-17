/**
 * Transport survey rendering and route-selection helpers.
 * @module calculate/transport
 */

import { GARDEN_CALCULATION_SERVICE_LABELS } from './constants.js';
import { getCalcMainContainer } from './dom.js';
import { createStrictAddressAutocomplete, mapLocationToTransportPoint, markAddressAutocompleteInvalid } from './autocomplete.js';
import { getSelectedServiceData } from './state.js';

/**
 * Renders the optional transportation survey into the calculator layout.
 * @returns {HTMLElement|null} Rendered transportation survey.
 */
export function renderTransportationSurvey() {
	const calcContainer = getCalcMainContainer();
	if (!calcContainer) return null;

	const surveyHTML = getTransportationSurvey();
	const tempDiv = document.createElement('div');
	tempDiv.innerHTML = surveyHTML;

	const survey = tempDiv.querySelector('.transport-survey');
	if (!survey) return null;

	const serviceLabel = getSelectedServiceData()?.label?.trim() || '';
	if (GARDEN_CALCULATION_SERVICE_LABELS.has(serviceLabel)) {
		const title = survey.querySelector('h2');
		const description = survey.querySelector('.survey-card > p');
		const noDesc = survey.querySelector('.survey-btn[data-value="no"] .survey-desc');
		const yesDesc = survey.querySelector('.survey-btn[data-value="yes"] .survey-desc');

		if (title) title.textContent = 'Transport erforderlich?';
		if (description) description.textContent = 'Müssen Material, Werkzeug oder Teile zum Einsatzort transportiert werden?';
		if (noDesc) noDesc.textContent = 'Kein zusätzlicher Transport nötig';
		if (yesDesc) yesDesc.textContent = 'Transport zum Einsatzort nötig';
	}

	calcContainer.appendChild(survey);
	return survey;
}

/**
 * Renders the direct transport address form for small item transport.
 * @returns {HTMLElement|null} Rendered direct transport survey.
 */
export function renderDirectTransportAddressForm() {
	const calcContainer = getCalcMainContainer();
	if (!calcContainer) return null;

	const tempDiv = document.createElement('div');
	tempDiv.innerHTML = getDirectTransportAddressForm();

	const survey = tempDiv.querySelector('#directTransportSurvey');
	if (!survey) return null;

	calcContainer.appendChild(survey);
	return survey;
}

/**
 * Clears transport route selections from state and DOM containers.
 * @param {Object} state - Shared calculator state.
 * @returns {void}
 */
export function resetTransportSelection(state) {
	state.selectedTransportFrom = null;
	state.selectedTransportVia = [];
	state.selectedTransportTo = null;

	const intermediateContainer = document.getElementById('transportIntermediateAddresses');
	if (intermediateContainer) {
		intermediateContainer.innerHTML = '';
	}

	const directIntermediateContainer = document.getElementById('directTransportIntermediateAddresses');
	if (directIntermediateContainer) {
		directIntermediateContainer.innerHTML = '';
	}
}

/**
 * Appends an intermediate address field to a transport survey.
 * @param {HTMLElement} survey - Transport survey container.
 * @param {number} index - Intermediate address index.
 * @param {string} [containerSelector='#transportIntermediateAddresses'] - Target list selector.
 * @param {string} [idPrefix='transportViaAutocomplete'] - Autocomplete id prefix.
 * @returns {HTMLElement|null} Added field element.
 */
export function appendIntermediateAddressField(survey, index, containerSelector = '#transportIntermediateAddresses', idPrefix = 'transportViaAutocomplete') {
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

/**
 * Shows or hides transport address fields based on the selected answer.
 * @param {HTMLElement} survey - Transport survey container.
 * @param {boolean} isTransportNeeded - Whether transport was selected.
 * @returns {void}
 */
export function setTransportationVisibility(survey, isTransportNeeded) {
	const transportFields = survey.querySelector('#transportFields');
	const transportActions = survey.querySelector('#transportActions');

	if (transportFields) {
		transportFields.style.display = isTransportNeeded ? 'block' : 'none';
	}

	if (transportActions) {
		transportActions.style.display = 'flex';
	}
}

/**
 * Stores the selected start location in shared state.
 * @param {Object} location - Selected address suggestion.
 * @param {Object} state - Shared calculator state.
 * @returns {void}
 */
export function handleFromLocationSelect(location, state) {
	const transportPoint = mapLocationToTransportPoint(location);
	if (!transportPoint) return;

	state.selectedTransportFrom = transportPoint;
}

/**
 * Stores the selected destination location in shared state.
 * @param {Object} location - Selected address suggestion.
 * @param {Object} state - Shared calculator state.
 * @returns {void}
 */
export function handleToLocationSelect(location, state) {
	const transportPoint = mapLocationToTransportPoint(location);
	if (!transportPoint) return;
	state.selectedTransportTo = transportPoint;
}

/**
 * Creates a handler that stores an intermediate location at a fixed index.
 * @param {number} index - Intermediate address index.
 * @param {Object} state - Shared calculator state.
 * @returns {Function} Address suggestion select handler.
 */
export function createIntermediateLocationHandler(index, state) {
	return (location) => {
		const transportPoint = mapLocationToTransportPoint(location);
		if (!transportPoint) return;
		state.selectedTransportVia[index] = transportPoint;
	};
}

/**
 * Adds an intermediate address field and binds its autocomplete.
 * @param {HTMLElement} survey - Transport survey container.
 * @param {Object} transportUiState - Transport UI state with autocomplete instances.
 * @param {Object} appState - Shared calculator state.
 * @param {Object} [options={}] - Field rendering options.
 * @returns {void}
 */
export function addIntermediateAddressAutocomplete(survey, transportUiState, appState, options = {}) {
	const index = transportUiState.intermediateAutocompletes.length;
	const idPrefix = options.idPrefix || 'transportViaAutocomplete';
	const field = appendIntermediateAddressField(
		survey,
		index,
		options.containerSelector || '#transportIntermediateAddresses',
		idPrefix
	);
	if (!field) return;

	const elementId = `${idPrefix}-${index}`;
	const intermediateAutocomplete = createStrictAddressAutocomplete(elementId, {
		onSelect: createIntermediateLocationHandler(index, appState),
		onInvalidate: () => {
			delete appState.selectedTransportVia[index];
		}
	});
	if (!intermediateAutocomplete) return;

	transportUiState.intermediateAutocompletes.push(intermediateAutocomplete);
}

/**
 * Initializes start and destination autocompletes once per transport flow.
 * @param {Object} transportUiState - Transport UI state with autocomplete instances.
 * @param {Object} appState - Shared calculator state.
 * @param {Object} [options={}] - Autocomplete element id overrides.
 * @returns {void}
 */
export function initTransportAutocompletesIfNeeded(transportUiState, appState, options = {}) {
	const fromElementId = options.fromElementId || 'transportFromAutocomplete';
	const toElementId = options.toElementId || 'transportToAutocomplete';

	if (!transportUiState.fromAutocomplete) {
		transportUiState.fromAutocomplete = createStrictAddressAutocomplete(fromElementId, {
			onSelect: (location) => handleFromLocationSelect(location, appState),
			onInvalidate: () => {
				appState.selectedTransportFrom = null;
			}
		});
	}

	if (!transportUiState.toAutocomplete) {
		transportUiState.toAutocomplete = createStrictAddressAutocomplete(toElementId, {
			onSelect: (location) => handleToLocationSelect(location, appState),
			onInvalidate: () => {
				appState.selectedTransportTo = null;
			}
		});
	}
}

/**
 * Validates that visible transport addresses were selected from autocomplete.
 * @param {HTMLElement} survey - Transport survey container.
 * @param {Object} appState - Shared calculator state.
 * @returns {boolean} Whether all required transport addresses are confirmed.
 */
export function validateConfirmedTransportAddresses(survey, appState) {
	if (appState.selectedTransportation !== 'yes') return true;
	let firstInvalidContainer = null;
	const markInvalid = (container, message) => {
		markAddressAutocompleteInvalid(container, message);
		if (!firstInvalidContainer) firstInvalidContainer = container;
	};

	if (!appState.selectedTransportFrom?.address) {
		markInvalid(
			survey.querySelector('#transportFromAutocomplete, #directTransportFromAutocomplete'),
			'Bitte Startadresse aus der Vorschlagsliste wählen.'
		);
	}

	if (!appState.selectedTransportTo?.address) {
		markInvalid(
			survey.querySelector('#transportToAutocomplete, #directTransportToAutocomplete'),
			'Bitte Zieladresse aus der Vorschlagsliste wählen.'
		);
	}

	const intermediateFields = survey.querySelectorAll('[data-intermediate-address-index]');
	for (const field of intermediateFields) {
		const index = Number.parseInt(field.dataset.intermediateAddressIndex || '', 10);
		if (!Number.isInteger(index)) continue;

		if (!appState.selectedTransportVia[index]?.address) {
			markInvalid(
				field.querySelector('.autocomplete-container'),
				'Bitte Zwischenziel aus der Vorschlagsliste wählen oder Feld löschen.'
			);
		}
	}

	if (firstInvalidContainer) {
		firstInvalidContainer.scrollIntoView({ behavior: 'smooth', block: 'center' });
		return false;
	}

	return true;
}

/**
 * Binds the add-intermediate-address button.
 * @param {HTMLElement} survey - Transport survey container.
 * @param {Object} transportUiState - Transport UI state with autocomplete instances.
 * @param {Object} appState - Shared calculator state.
 * @param {Object} [options={}] - Field rendering options.
 * @returns {void}
 */
export function bindAddIntermediateAddressHandler(survey, transportUiState, appState, options = {}) {
	const addIntermediateAddressBtn = survey.querySelector('#addIntermediateAddressBtn');
	if (!addIntermediateAddressBtn) return;

	addIntermediateAddressBtn.addEventListener('click', () => {
		addIntermediateAddressAutocomplete(survey, transportUiState, appState, options);
	});
}

/**
 * Renumbers intermediate address labels and remove button indexes.
 * @param {HTMLElement} survey - Transport survey container.
 * @returns {void}
 */
export function refreshIntermediateAddressLabels(survey) {
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

/**
 * Binds remove buttons for intermediate addresses.
 * @param {HTMLElement} survey - Transport survey container.
 * @param {Object} transportUiState - Transport UI state with autocomplete instances.
 * @param {Object} appState - Shared calculator state.
 * @returns {void}
 */
export function bindRemoveIntermediateAddressHandler(survey, transportUiState, appState) {
	if (!survey || survey.dataset.removeIntermediateBound === '1') return;
	survey.dataset.removeIntermediateBound = '1';

	survey.addEventListener('click', (event) => {
		const removeBtn = event.target.closest('[data-remove-intermediate-address]');
		if (!removeBtn) return;

		const index = Number.parseInt(removeBtn.dataset.removeIntermediateAddress || '', 10);
		if (Number.isInteger(index)) {
			delete appState.selectedTransportVia[index];
		}

		removeBtn.closest('[data-intermediate-address-index]')?.remove();
		appState.selectedTransportVia = appState.selectedTransportVia.filter(point => point?.address);

		if (transportUiState?.intermediateAutocompletes) {
			transportUiState.intermediateAutocompletes.splice(index, 1);
		}

		refreshIntermediateAddressLabels(survey);
	});
}

/**
 * Binds yes/no transport survey buttons.
 * @param {HTMLElement} survey - Transport survey container.
 * @param {Object} transportUiState - Transport UI state with autocomplete instances.
 * @param {Object} appState - Shared calculator state.
 * @returns {void}
 */
export function bindTransportationChoiceHandlers(survey, transportUiState, appState) {
	const surveyBtns = survey.querySelectorAll('.survey-btn');

	surveyBtns.forEach(btn => {
		btn.addEventListener('click', () => {
			surveyBtns.forEach(b => b.classList.remove('active'));
			btn.classList.add('active');
			appState.selectedTransportation = btn.dataset.value;

			const isTransportNeeded = appState.selectedTransportation === 'yes';
			setTransportationVisibility(survey, isTransportNeeded);

			if (isTransportNeeded) {
				initTransportAutocompletesIfNeeded(transportUiState, appState);
			} else {
				resetTransportSelection(appState);
			}
		});
	});
}
