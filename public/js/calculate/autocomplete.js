/**
 * Address autocomplete helpers backed by the site's geocoding proxy.
 * @module calculate/autocomplete
 */

import { GEOCODE_AUTOCOMPLETE_ENDPOINT } from './constants.js';

const MIN_QUERY_LENGTH = 2;
const DEBOUNCE_DELAY_MS = 320;

/**
 * Escapes text before inserting it into HTML.
 * @param {string} value - Raw text.
 * @returns {string} Escaped text.
 */
function escapeHtml(value) {
	return String(value || '')
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;')
		.replace(/'/g, '&#039;');
}

/**
 * Maps an address suggestion object to the transport point shape used by the backend.
 * @param {Object|null} location - Address suggestion object.
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
 * Creates a custom address autocomplete instance for an element id.
 * @param {string} elementId - Container element id.
 * @returns {Object|null} Address autocomplete instance.
 */
export function createAddressAutocomplete(elementId) {
	const targetElement = document.getElementById(elementId);
	if (!targetElement) return null;
	if (targetElement.dataset.customAddressAutocompleteBound === '1') {
		return targetElement._customAddressAutocomplete || null;
	}

	const instance = createCustomAddressAutocomplete(targetElement);
	targetElement.dataset.customAddressAutocompleteBound = '1';
	targetElement._customAddressAutocomplete = instance;
	return instance;
}

function createCustomAddressAutocomplete(container) {
	const handlers = new Map();
	const input = document.createElement('input');
	const dropdown = document.createElement('div');
	const liveStatus = document.createElement('div');
	let suggestions = [];
	let activeIndex = -1;
	let debounceTimer = null;
	let abortController = null;

	input.type = 'text';
	input.autocomplete = 'off';
	input.placeholder = 'Adresse eingeben';
	input.setAttribute('aria-autocomplete', 'list');
	input.setAttribute('aria-expanded', 'false');
	input.setAttribute('aria-controls', `${container.id}-suggestions`);

	dropdown.id = `${container.id}-suggestions`;
	dropdown.className = 'address-autocomplete__dropdown';
	dropdown.setAttribute('role', 'listbox');
	dropdown.hidden = true;

	liveStatus.className = 'address-autocomplete__status';
	liveStatus.setAttribute('aria-live', 'polite');

	container.classList.add('address-autocomplete');
	container.innerHTML = '';
	container.append(input, dropdown, liveStatus);

	const emit = (eventName, payload) => {
		(handlers.get(eventName) || []).forEach((handler) => handler(payload));
	};

	const closeDropdown = () => {
		dropdown.hidden = true;
		input.setAttribute('aria-expanded', 'false');
		activeIndex = -1;
	};

	const setActiveIndex = (index) => {
		activeIndex = index;
		dropdown.querySelectorAll('[role="option"]').forEach((option, optionIndex) => {
			const isActive = optionIndex === activeIndex;
			option.classList.toggle('is-active', isActive);
			option.setAttribute('aria-selected', isActive ? 'true' : 'false');
		});
	};

	const renderSuggestions = () => {
		if (!suggestions.length) {
			dropdown.innerHTML = '<div class="address-autocomplete__empty">Keine Adresse gefunden</div>';
			dropdown.hidden = false;
			input.setAttribute('aria-expanded', 'true');
			return;
		}

		dropdown.innerHTML = suggestions.map((location, index) => `
			<button
				class="address-autocomplete__option"
				type="button"
				role="option"
				data-index="${index}"
				aria-selected="false"
			>
				${escapeHtml(location.properties?.formatted || '')}
			</button>
		`).join('');
		dropdown.hidden = false;
		input.setAttribute('aria-expanded', 'true');
		setActiveIndex(-1);
	};

	const fetchSuggestions = async (query) => {
		abortController?.abort();
		abortController = new AbortController();
		liveStatus.textContent = 'Adressen werden gesucht...';

		try {
			const url = new URL(GEOCODE_AUTOCOMPLETE_ENDPOINT, window.location.origin);
			url.searchParams.set('text', query);
			url.searchParams.set('limit', '5');
			const response = await fetch(url, { signal: abortController.signal });
			const body = await response.json().catch(() => ({}));

			if (!response.ok) {
				throw new Error(body.error || `Serverfehler: ${response.status}`);
			}

			suggestions = Array.isArray(body.results) ? body.results : [];
			liveStatus.textContent = suggestions.length
				? `${suggestions.length} Adressvorschläge gefunden.`
				: 'Keine Adresse gefunden.';
			renderSuggestions();
		} catch (error) {
			if (error.name === 'AbortError') return;
			console.warn('Address autocomplete request failed.', error);
			suggestions = [];
			liveStatus.textContent = 'Adresssuche ist gerade nicht verfügbar.';
			dropdown.innerHTML = '<div class="address-autocomplete__empty">Adresssuche nicht verfügbar</div>';
			dropdown.hidden = false;
			input.setAttribute('aria-expanded', 'true');
		}
	};

	const selectSuggestion = (index) => {
		const location = suggestions[index];
		if (!location) return;
		input.value = location.properties?.formatted || '';
		closeDropdown();
		emit('select', location);
	};

	input.addEventListener('input', () => {
		const query = input.value.trim();
		window.clearTimeout(debounceTimer);

		if (query.length < MIN_QUERY_LENGTH) {
			abortController?.abort();
			suggestions = [];
			liveStatus.textContent = '';
			closeDropdown();
			return;
		}

		debounceTimer = window.setTimeout(() => fetchSuggestions(query), DEBOUNCE_DELAY_MS);
	});

	input.addEventListener('keydown', (event) => {
		if (dropdown.hidden) return;

		if (event.key === 'ArrowDown') {
			event.preventDefault();
			setActiveIndex(Math.min(activeIndex + 1, suggestions.length - 1));
		}

		if (event.key === 'ArrowUp') {
			event.preventDefault();
			setActiveIndex(Math.max(activeIndex - 1, 0));
		}

		if (event.key === 'Enter' && activeIndex >= 0) {
			event.preventDefault();
			selectSuggestion(activeIndex);
		}

		if (event.key === 'Escape') {
			closeDropdown();
		}
	});

	dropdown.addEventListener('mousedown', (event) => {
		const option = event.target.closest('[data-index]');
		if (!option) return;
		event.preventDefault();
		selectSuggestion(Number.parseInt(option.dataset.index || '-1', 10));
	});

	document.addEventListener('click', (event) => {
		if (!container.contains(event.target)) closeDropdown();
	});

	return {
		on(eventName, handler) {
			if (!handlers.has(eventName)) handlers.set(eventName, []);
			handlers.get(eventName).push(handler);
			return this;
		},
		input,
		close: closeDropdown
	};
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
 * @param {Function} handlers.onSelect - Called with the selected address suggestion.
 * @param {Function} handlers.onInvalidate - Called when a confirmed address is edited manually.
 * @returns {Object|null} Address autocomplete instance.
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
			setAddressConfirmationState(container, 'confirmed', '');
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
