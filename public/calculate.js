const kitchenSurvey = document.getElementById('kitchenSurvey');
const continueBtn = document.getElementById('continueBtn');

let selectedKitchenCondition = '';
let selectedTransportation = '';
let selectedAssembly = '';
let currentForm = null;

let selectedTransportFrom = null;
let selectedTransportVia = [];
let selectedTransportTo = null;

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
	const calcLayout = document.querySelector('.calc-layout');
	if (!calcLayout) return null;

	const surveyHTML = getAssemblySurvey();

	const tempDiv = document.createElement('div');
	tempDiv.innerHTML = surveyHTML;
	const survey = tempDiv.querySelector('.assembly-survey');
	if (!survey) return null;

	calcLayout.appendChild(survey);
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
	const calcLayout = document.querySelector('.calc-layout');
	if (!calcLayout) return null;

	const surveyHTML = getTransportationSurvey();
	const tempDiv = document.createElement('div');
	tempDiv.innerHTML = surveyHTML;

	const survey = tempDiv.querySelector('.transport-survey');
	if (!survey) return null;

	calcLayout.appendChild(survey);
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
}

function appendIntermediateAddressField(survey, index) {
	const container = survey.querySelector('#transportIntermediateAddresses');
	if (!container) return null;

	const tempDiv = document.createElement('div');
	tempDiv.innerHTML = getIntermediateAddressTemplate(index);
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

function addIntermediateAddressAutocomplete(survey, state) {
	const index = state.intermediateAutocompletes.length;
	const field = appendIntermediateAddressField(survey, index);
	if (!field) return;

	const elementId = `transportViaAutocomplete-${index}`;
	const intermediateAutocomplete = createAddressAutocomplete(elementId);
	intermediateAutocomplete.on('select', createIntermediateLocationHandler(index));

	state.intermediateAutocompletes.push(intermediateAutocomplete);
}

function initTransportAutocompletesIfNeeded(state) {
	if (!state.fromAutocomplete) {
		state.fromAutocomplete = createAddressAutocomplete('transportFromAutocomplete');
		state.fromAutocomplete.on('select', handleFromLocationSelect);
	}

	if (!state.toAutocomplete) {
		state.toAutocomplete = createAddressAutocomplete('transportToAutocomplete');
		state.toAutocomplete.on('select', handleToLocationSelect);
	}
}

function bindAddIntermediateAddressHandler(survey, state) {
	const addIntermediateAddressBtn = survey.querySelector('#addIntermediateAddressBtn');
	if (!addIntermediateAddressBtn) return;

	addIntermediateAddressBtn.addEventListener('click', () => {
		addIntermediateAddressAutocomplete(survey, state);
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
	bindTransportationCalculateHandler(survey);
}

async function requestCalculation(data) {
	try {
		const response = await fetch('http://localhost:4000/api/calculate', {
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

		hideLoadingIndicator();
		showResult(result.price || result);
	} catch (error) {
		console.error('Ошибка при отправке запроса:', error);
		hideLoadingIndicator();
		showError('Не удалось получить расчет. Проверьте подключение к серверу.');
	}
}

function buildKitchenFormPayload(formElement) {
	const data = {
		kitchenCondition: selectedKitchenCondition
	};

	if (!formElement) return data;

	const inputs = formElement.querySelectorAll('input, select, textarea');
	inputs.forEach(input => {
		if (input.name) {
			data[input.name] = input.value || '';
		}
	});

	return data;
}

function appendTemplateToCalcLayout(templateHTML) {
	const calcSection = document.querySelector('.calc .container .calc-layout');
	if (!calcSection) return;

	const tempDiv = document.createElement('div');
	tempDiv.innerHTML = templateHTML;
	const element = tempDiv.firstElementChild;

	if (element) {
		calcSection.appendChild(element);
	}
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
	appendTemplateToCalcLayout(getResultTemplate(price));
}

function showError(message) {
	removeFeedbackBlocks();
	appendTemplateToCalcLayout(getErrorTemplate(message));
}

function removeFeedbackBlocks() {
	document.getElementById('result-display')?.remove();
	document.getElementById('error-display')?.remove();
	document.getElementById('loading-indicator')?.remove();
}

init();

// TODO: Разобраться с отправляемыми координатами (Point, LineString, центр объекта)
// TODO: После этого реализовать соответствующую обработку координат на сервере
