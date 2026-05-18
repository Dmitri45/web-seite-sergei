/**
 * DOM helpers for the calculator page.
 * @module calculate/dom
 */

/**
 * Finds the main calculator container.
 * @returns {HTMLElement|null} Calculator content container.
 */
export function getCalcMainContainer() {
	return document.querySelector('.calc-layout .calc-main') || document.querySelector('.calc-layout');
}

/**
 * Appends the first element from a template string to the calculator layout.
 * @param {string} templateHTML - HTML template string.
 * @returns {void}
 */
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

/**
 * Removes temporary calculation feedback blocks from the page.
 * @returns {void}
 */
export function removeFeedbackBlocks() {
	document.getElementById('result-display')?.remove();
	document.getElementById('error-display')?.remove();
	document.getElementById('loading-indicator')?.remove();
}

/**
 * Removes all active calculator flow blocks before rendering a new flow.
 * @returns {void}
 */
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
