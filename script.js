const kitchenSurvey = document.getElementById('kitchenSurvey');
const continueBtn = document.getElementById('continueBtn');

let selectedKitchenCondition = ''; // Сохраняем выбранное значение
let selectedTransportation = ''; // Сохраняем выбор транспортировки
let selectedAssembly = ''; // Сохраняем выбор о сборке шкафов
let currentForm = null; // Сохраняем текущую форму
let addressInputTimer = null; // Timer для debounce address input

function init() {
	// Инициализация опроса
	if (kitchenSurvey) {
		const surveyBtns = kitchenSurvey.querySelectorAll('.survey-btn');
		surveyBtns.forEach(btn => {
			btn.addEventListener('click', () => {
				// Убрать активный класс со всех кнопок
				surveyBtns.forEach(b => b.classList.remove('active'));
				// Добавить активный класс текущей кнопке
				btn.classList.add('active');
				// Сохранить выбранное значение
				selectedKitchenCondition = btn.dataset.value;
				// Показать кнопку "Weiter"
				continueBtn.style.display = 'block';
			});
		});
	}

	// Обработка кнопки "Weiter"
	if (continueBtn) {
		continueBtn.addEventListener('click', () => {
			// Скрыть опрос
			kitchenSurvey.style.display = 'none';
			
			// Если это новая кухня, показать опрос о сборке
			if (selectedKitchenCondition === 'new') {
				showAssemblySurvey();
			} else {
				// Иначе сразу показать форму
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
			// Скрыть форму
			formElement.style.display = 'none';
				showTransportationSurvey();
			}
);}
}

function showAssemblySurvey() {
	const calcLayout = document.querySelector('.calc-layout');
	const surveyHTML = getAssemblySurvey();
	
	const tempDiv = document.createElement('div');
	tempDiv.innerHTML = surveyHTML;
	const survey = tempDiv.querySelector('.assembly-survey');
	
	calcLayout.appendChild(survey);
	
	// Обработка выбора
	const surveyBtns = survey.querySelectorAll('.survey-btn');
	surveyBtns.forEach(btn => {
		btn.addEventListener('click', () => {
			surveyBtns.forEach(b => b.classList.remove('active'));
			btn.classList.add('active');
			selectedAssembly = btn.dataset.value;
			
			// Показать поля для количества шкафов если выбран "Да"
			const assemblyFields = survey.querySelector('#assemblyFields');
			const continueBtn = survey.querySelector('#btn-main');
			
			if (selectedAssembly === 'yes') {
				assemblyFields.style.display = 'block';
				continueBtn.style.display = 'block';
			} else {
				assemblyFields.style.display = 'none';
				continueBtn.style.display = 'block';
			}
		});
	});
	
	// Обработка кнопки "Weiter" на опросе о сборке
	const continueBtn = survey.querySelector('#btn-main');
	if (continueBtn) {
		continueBtn.addEventListener('click', () => {
			// Скрыть опрос о сборке
			survey.style.display = 'none';
			
			// Показать форму новой кухни
			const calcForm = renderForm('new');
			calcForm.style.display = 'block';
			currentForm = calcForm;
			attachFormContinueListener(calcForm);
		});
	}
}
	
function showTransportationSurvey() {
	const calcLayout = document.querySelector('.calc-layout');
	const surveyHTML = getTransportationSurvey();
	
	const tempDiv = document.createElement('div');
	tempDiv.innerHTML = surveyHTML;
	const survey = tempDiv.querySelector('.transport-survey');
	
	calcLayout.appendChild(survey);
	
	// Обработка выбора
	const surveyBtns = survey.querySelectorAll('.survey-btn');
	surveyBtns.forEach(btn => {
		btn.addEventListener('click', () => {
			surveyBtns.forEach(b => b.classList.remove('active'));
			btn.classList.add('active');
			selectedTransportation = btn.dataset.value;
			
			// Показать поля адреса если выбран "Да"
			const transportFields = survey.querySelector('#transportFields');
			const calculateBtn = survey.querySelector('#btn-main');
			
			if (selectedTransportation === 'yes') {
				transportFields.style.display = 'block';
				calculateBtn.style.display = 'block';
				
				// Добавить event listener на поля адреса
				const transportFromInput = survey.querySelector('#transportFrom');
				const transportToInput = survey.querySelector('#transportTo');
				
				if (transportFromInput) {
					transportFromInput.addEventListener('input', (e) => {
						if (e.target.value.length >= 4) {
							clearTimeout(addressInputTimer);
							addressInputTimer = setTimeout(() => {
								onAddressInput(e.target.value);
							}, 500);
						}
					});
				}
				
				if (transportToInput) {
					transportToInput.addEventListener('input', (e) => {
						if (e.target.value.length >= 4) {
							clearTimeout(addressInputTimer);
							addressInputTimer = setTimeout(() => {
								onAddressInput(e.target.value);
							}, 500);
						}
					});
				}
			} else {
				transportFields.style.display = 'none';
				calculateBtn.style.display = 'block';
			}
		});
	});
	
	// Обработка кнопки "Preis berechnen"
	const calculateBtn = survey.querySelector('#btn-main');
	if (calculateBtn) {
		calculateBtn.addEventListener('click', async () => {
			// Собрать данные из формы и опроса
			const data = buildKitchenFormPayload(currentForm);
			data.transportation = selectedTransportation;
			
			// Добавить данные о сборке если это новая кухня
			if (selectedKitchenCondition === 'new') {
				data.assembly = selectedAssembly;
				if (selectedAssembly === 'yes') {
					data.smallCabinets = survey.querySelector('#smallCabinets')?.value || '0';
					data.largeCabinets = survey.querySelector('#largeCabinets')?.value || '0';
					data.drawers = survey.querySelector('#drawers')?.value || '0';
				}
			}
			
			if (selectedTransportation === 'yes') {
				data.transportFrom = survey.querySelector('#transportFrom')?.value || '';
				data.transportTo = survey.querySelector('#transportTo')?.value || '';
			}
			
			// Скрыть опрос
			survey.style.display = 'none';
			
			// Показываем индикатор загрузки
			showLoadingIndicator();
			
			try {
				// Отправляем POST запрос на сервер
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
				
				// Скрываем индикатор загрузки
				hideLoadingIndicator();
				
				// Показываем результат
				showResult(result.price || result);
				
			} catch (error) {
				console.error('Ошибка при отправке запроса:', error);
				hideLoadingIndicator();
				showError('Не удалось получить расчет. Проверьте подключение к серверу.');
			}
		});
	}
}

function attachFormSubmitListener(formElement) {
	const button = formElement.querySelector('#btn-main');
	
	if (button) {
		button.addEventListener('click', async () => {
			const data = buildKitchenFormPayload(formElement);
			
			// Скрываем форму
			formElement.style.display = 'none';
			
			// Показываем индикатор загрузки
			showLoadingIndicator();
			
			try {
				// Отправляем POST запрос на сервер
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
				
				// Скрываем индикатор загрузки
				hideLoadingIndicator();
				
				// Показываем результат
				showResult(result.price || result);
				
			} catch (error) {
				console.error('Ошибка при отправке запроса:', error);
				hideLoadingIndicator();
				showError('Не удалось получить расчет. Проверьте подключение к серверу.');
			}
		});
	}
}

function buildKitchenFormPayload(formElement) {
	const data = {
		kitchenCondition: selectedKitchenCondition
	};

	// Собирать данные из всех input, select и textarea элементов
	const inputs = formElement.querySelectorAll('input, select, textarea');
	inputs.forEach(input => {
		if (input.name) {
			data[input.name] = input.value || '';
		}
	});

	return data;
}

function showLoadingIndicator() {
	const loadingDiv = document.createElement('div');
	loadingDiv.id = 'loading-indicator';
	loadingDiv.className = 'loading-indicator';
	loadingDiv.innerHTML = `
		<div class="spinner"></div>
		<p>Berechnung läuft...</p>
	`;
	
	const calcSection = document.querySelector('.calc .container .calc-layout');
	if (calcSection) {
		calcSection.appendChild(loadingDiv);
	}
}

function hideLoadingIndicator() {
	const loadingDiv = document.getElementById('loading-indicator');
	if (loadingDiv) {
		loadingDiv.remove();
	}
}

function showResult(price) {
	const resultDiv = document.createElement('div');
	resultDiv.id = 'result-display';
	resultDiv.className = 'result-display';
	resultDiv.innerHTML = `
		<div class="result-card">
			<h2>Berechneter Preis</h2>
			<div class="price-display">${price} €</div>
			<button class="btn-main" onclick="location.reload()">Neue Berechnung</button>
		</div>
	`;
	
	const calcSection = document.querySelector('.calc .container .calc-layout');
	if (calcSection) {
		calcSection.appendChild(resultDiv);
	}
}

function showError(message) {
	const errorDiv = document.createElement('div');
	errorDiv.id = 'error-display';
	errorDiv.className = 'error-display';
	errorDiv.innerHTML = `
		<div class="error-card">
			<h2>Fehler</h2>
			<p>${message}</p>
			<button class="btn-main" onclick="location.reload()">Erneut versuchen</button>
		</div>
	`;
	
	const calcSection = document.querySelector('.calc .container .calc-layout');
	if (calcSection) {
		calcSection.appendChild(errorDiv);
	}
}

function onAddressInput(value) {
	// Функция вызывается при вводе 4+ символов в поля адреса
	// TODO: реализовать
}

init();


// Инициализируем библиотеку
const autocomplete = new geoapify.GeocoderAutocomplete(
    document.getElementById("transportFrom"), 
    "c9acb6a7c41d4573814c3954fd7a232c", // Твой ключ
    {
        /* Настройки для Германии */
        lang: "de", 
        filter: {
            countrycode: ["de"] // Ищем только в DE
        },
        placeholder: "Введите адрес объекта...",
        limit: 5 // Сколько подсказок показывать
    }
);

// ГЛАВНОЕ: Получаем данные, когда клиент выбрал адрес
autocomplete.on('select', (location) => {
    if (location) {
        // 1. Получаем координаты для Matrix API [Долгота, Широта]
        const coords = location.geometry.coordinates; 
        
        // 2. Получаем красивый текст адреса
        const address = location.properties.formatted;

        console.log("Координаты для бэкенда:", coords);
        console.log("Адрес для счета:", address);

        // Здесь ты можешь активировать кнопку "Рассчитать"
        // или сразу отправить данные на сервер
    }
});
