export function getCalcMainContainer() {
	return document.querySelector('.calc-layout .calc-main') || document.querySelector('.calc-layout');
}

export function appendTemplateToCalcLayout(templateHTML) {
	const calcSection = getCalcMainContainer();
	if (!calcSection) return;

	const tempDiv = document.createElement('div');
	tempDiv.innerHTML = templateHTML;
	const element = tempDiv.firstElementChild;

	if (element) {
		calcSection.appendChild(element);
	}
}

export function removeFeedbackBlocks() {
	document.getElementById('result-display')?.remove();
	document.getElementById('error-display')?.remove();
	document.getElementById('loading-indicator')?.remove();
}

export function removeFlowBlocks() {
	document.getElementById('calcForm')?.remove();
	document.getElementById('result-display')?.remove();
	document.getElementById('error-display')?.remove();
	document.getElementById('loading-indicator')?.remove();
	document.getElementById('kitchenSurvey')?.remove();
	document.getElementById('assemblySurvey')?.remove();
	document.getElementById('transportSurvey')?.remove();
	document.getElementById('directTransportSurvey')?.remove();
	document.getElementById('offer-request-block')?.remove();
}
