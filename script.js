const form = document.querySelector('.calc-card');
const button = document.getElementById('btn-main');

function init() {
	if (!form || !button) {
		return;
	}

	button.addEventListener('click', () => {
		const data = buildKitchenFormPayload(form);
		console.log('Berechnung JSON:', data);
	});
}

function buildKitchenFormPayload(formElement) {
	return {
		kitchenCondition: formElement.querySelector('#kitchenCondition')?.value || '',
		date: formElement.querySelector('#date')?.value || '',
		kitchenType: formElement.querySelector('#kitchenType')?.value || '',
		upperCabinets: formElement.querySelector('#upperCabinets')?.value || '',
		appliances: formElement.querySelector('#appliances')?.value || '',
		lowerCabinets: formElement.querySelector('#lowerCabinets')?.value || '',
		worktopAdjust: formElement.querySelector('#worktopAdjust')?.value || '',
		worktopPickup: formElement.querySelector('#worktopPickup')?.value || '',
		notes: formElement.querySelector('#notes')?.value || ''
	};
}

init();
