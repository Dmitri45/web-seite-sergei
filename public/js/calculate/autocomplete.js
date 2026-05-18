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

		addressAutocomplete.on('select', (location) => {
			if (targetInput) {
				targetInput.value = location?.properties?.formatted || '';
			}
		});
	});
}
