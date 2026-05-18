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
