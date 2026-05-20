/**
 * Address autocomplete helpers for Geoapify-backed calculator fields.
 * @module calculate/autocomplete
 */

/**
 * Maps a Geoapify location object to the transport point shape used by the backend.
 * @param {Object|null} location - Geoapify location object.
 * @returns {{address: string, coordinates: {lat: number, lon: number}}|null} Transport point.
 */
export function mapLocationToTransportPoint(location) {
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

/**
 * Creates a Geoapify autocomplete instance for an element id.
 * @param {string} elementId - Container element id.
 * @returns {Object} Geoapify autocomplete instance.
 */
export function createAddressAutocomplete(elementId) {
	const targetElement = document.getElementById(elementId);
	if (!targetElement || typeof autocomplete === 'undefined') return null;

	try {
		return new autocomplete.GeocoderAutocomplete(
			targetElement,
			'c9acb6a7c41d4573814c3954fd7a232c',
			{
				lang: 'de',
				filter: { countrycode: ['de'] },
				limit: 5,
				debounceDelay: 500,
				addDetails: false
			}
		);
	} catch (error) {
		console.warn('Geoapify autocomplete could not be initialized.', error);
		return null;
	}
}

function getAutocompleteInput(container) {
	return container.querySelector('input');
}

function getAddressStatusElement(container) {
	const field = container.closest('.field') || container.parentElement;
	if (!field) return null;

	let status = field.querySelector('.address-confirmation-status');
	if (!status) {
		status = document.createElement('p');
		status.className = 'address-confirmation-status';
		field.appendChild(status);
	}

	return status;
}

function setAddressConfirmationState(container, state, message) {
	const status = getAddressStatusElement(container);
	container.dataset.addressConfirmed = state === 'confirmed' ? '1' : '0';
	container.classList.toggle('is-address-confirmed', state === 'confirmed');
	container.classList.toggle('is-address-invalid', state === 'invalid');

	if (status) {
		status.textContent = message;
		status.dataset.state = state;
	}
}

/**
 * Marks an autocomplete field as invalid with a visible inline message.
 * @param {HTMLElement|null} container - Autocomplete container.
 * @param {string} [message] - Message displayed below the field.
 * @returns {void}
 */
export function markAddressAutocompleteInvalid(container, message = 'Bitte wählen Sie die Adresse aus der Vorschlagsliste aus.') {
	if (!container) return;
	setAddressConfirmationState(container, 'invalid', message);
}

/**
 * Creates an autocomplete instance that requires choosing a dropdown result.
 * @param {string} elementId - Container element id.
 * @param {Object} handlers - Selection and invalidation callbacks.
 * @param {Function} handlers.onSelect - Called with the selected Geoapify location.
 * @param {Function} handlers.onInvalidate - Called when a confirmed address is edited manually.
 * @returns {Object|null} Geoapify autocomplete instance.
 */
export function createStrictAddressAutocomplete(elementId, handlers = {}) {
	const container = document.getElementById(elementId);
	const addressAutocomplete = createAddressAutocomplete(elementId);
	if (!container || !addressAutocomplete) return null;

	let confirmedAddress = '';
	setAddressConfirmationState(container, 'idle', '');

	const bindInputInvalidation = (attempt = 0) => {
		const input = getAutocompleteInput(container);
		if (!input) {
			if (attempt < 20) window.setTimeout(() => bindInputInvalidation(attempt + 1), 50);
			return;
		}

		if (input.dataset.strictAddressBound === '1') return;
		input.dataset.strictAddressBound = '1';

		input.addEventListener('input', () => {
			const currentValue = input.value.trim();
			if (!currentValue) {
				confirmedAddress = '';
				handlers.onInvalidate?.();
				setAddressConfirmationState(container, 'idle', '');
				return;
			}

			if (confirmedAddress && currentValue === confirmedAddress) return;

			confirmedAddress = '';
			handlers.onInvalidate?.();
			setAddressConfirmationState(container, 'invalid', 'Bitte wählen Sie die Adresse aus der Vorschlagsliste aus.');
		});
	};

	addressAutocomplete.on('select', (location) => {
		confirmedAddress = location?.properties?.formatted || '';
		handlers.onSelect?.(location);

		window.setTimeout(() => {
			const input = getAutocompleteInput(container);
			if (input && confirmedAddress) input.value = confirmedAddress;
			setAddressConfirmationState(container, 'confirmed', 'Adresse bestätigt.');
		}, 0);
	});

	bindInputInvalidation();

	return addressAutocomplete;
}

/**
 * Initializes inline address autocomplete fields inside a form.
 * @param {HTMLFormElement|HTMLElement|null} formElement - Form or container to scan.
 * @returns {void}
 */
export function initInlineAddressAutocompletes(formElement) {
	if (!formElement) return;

	const autocompleteElements = formElement.querySelectorAll('[data-address-autocomplete]');
	autocompleteElements.forEach((element) => {
		if (!element.id || element.dataset.addressAutocompleteBound === '1') return;
		element.dataset.addressAutocompleteBound = '1';

		const targetName = element.dataset.addressTarget || 'address';
		const targetInput = formElement.querySelector(`[name="${targetName}"]`);
		const addressAutocomplete = createAddressAutocomplete(element.id);
		if (!addressAutocomplete) return;

		addressAutocomplete.on('select', (location) => {
			if (targetInput) {
				targetInput.value = location?.properties?.formatted || '';
			}
		});
	});
}
