/**
 * Shared frontend HTML templates for calculators, service cards, surveys, and results.
 */

/**
 * Formats a numeric value as a German euro amount.
 * @param {number|string} value - Amount to format.
 * @returns {string} Formatted euro amount.
 */
function formatEuro(value) {
	const amount = Number(value || 0);
	return `${amount.toLocaleString('de-DE', {
		minimumFractionDigits: 0,
		maximumFractionDigits: 2
	})} €`;
}

/**
 * Resolves a readable kitchen condition label.
 * @param {string} condition - Kitchen condition key.
 * @returns {string} Display label.
 */
function getKitchenConditionLabel(condition) {
	const labels = {
		new: 'Neue Küche',
		used: 'Bestehende Küche'
	};

	return labels[condition] || 'Küchenservice';
}

/**
 * Resolves the title shown for kitchen calculation results.
 * @param {Object} data - Calculation result data.
 * @returns {string} Result title.
 */
function getKitchenResultTitle(data) {
	if (data?.serviceLabel) return data.serviceLabel;
	return getKitchenConditionLabel(data?.condition);
}

/**
 * Resolves a readable kitchen layout label.
 * @param {string} kitchenType - Kitchen layout key.
 * @returns {string} Display label.
 */
function getKitchenTypeLabel(kitchenType) {
	const labels = {
		'zeile': 'I-Form',
		'l-form': 'L-Form',
		'u-form': 'U-Form'
	};

	return labels[kitchenType] || 'Nicht angegeben';
}

/**
 * Converts yes/no values into German labels.
 * @param {string|boolean} value - Yes/no style value.
 * @returns {string} Display label.
 */
function getYesNoLabel(value) {
	if (value === true || value === 'true' || value === 'yes') return 'Ja';
	if (value === false || value === 'false' || value === 'no') return 'Nein';
	return 'Nicht angegeben';
}

/**
 * Builds arrival and departure rows for calculation results.
 * @param {Object} prices - Calculation price breakdown.
 * @returns {Array<[string, number]>} Non-empty company travel rows.
 */
function getCompanyTravelRows(prices = {}) {
	return [
		['Anfahrt', prices.arrivalPrice],
		['Abfahrt', prices.departurePrice]
	].filter(([, value]) => Number(value || 0) > 0);
}

/**
 * Builds the result template for kitchen calculations.
 * @param {Object} data - Kitchen calculation result.
 * @returns {string} HTML template.
 */
function getKitchenResultTemplate(data) {
	const prices = data?.prices || {};
	const totalPrice = prices.totalPrice || 0;
	const priceRows = [
		['Montage / Aufbau', prices.assemblyPrice],
		['Abbau', prices.disassemblyPrice],
		['Transport', prices.transportPrice],
		...getCompanyTravelRows(prices)
	].filter(([, value]) => Number(value || 0) > 0);

	return `
		<div id="result-display" class="result-display">
			<div class="result-card result-card--kitchen">
				<p class="result-eyebrow">Unverbindliche Preiseinschätzung</p>
				<h2>${getKitchenResultTitle(data)}</h2>

				<div class="result-total">
					<span class="result-total__label">Geschätzter Gesamtpreis</span>
					<strong>${formatEuro(totalPrice)}</strong>
				</div>

				<div class="result-breakdown">
					${priceRows.map(([label, value]) => `
						<div class="result-breakdown__row">
							<span>${label}</span>
							<strong>${formatEuro(value)}</strong>
						</div>
					`).join('')}
				</div>

				<p class="result-note">Der Preis ist eine erste Einschätzung. Das finale Angebot kann je nach Aufwand vor Ort abweichen.</p>
				<button class="btn-main" type="button" data-offer-request-result="true">Angebot anfordern</button>
				<button class="btn-secondary" onclick="location.reload()">Neue Berechnung</button>
			</div>
		</div>
	`;
}

/**
 * Builds the result template for furniture calculations.
 * @param {Object} data - Furniture calculation result.
 * @returns {string} HTML template.
 */
function getFurnitureResultTemplate(data) {
	const prices = data?.prices || {};
	const totalPrice = prices.totalPrice || 0;
	const items = Array.isArray(prices.items) ? prices.items : [];
	const travelRows = getCompanyTravelRows(prices);

	return `
		<div id="result-display" class="result-display">
			<div class="result-card result-card--kitchen">
				<p class="result-eyebrow">Unverbindliche Preiseinschätzung</p>
				<h2>${data?.serviceLabel || 'Möbelservice'}</h2>

				<div class="result-total">
					<span class="result-total__label">Geschätzter Gesamtpreis</span>
					<strong>${formatEuro(totalPrice)}</strong>
				</div>

				<div class="result-breakdown">
					${items.map((item, index) => `
						<div class="result-breakdown__row">
							<span>${item.name || `Möbelstück ${index + 1}`}</span>
							<strong>${formatEuro(item.price)}</strong>
						</div>
					`).join('')}
					${travelRows.map(([label, value]) => `
						<div class="result-breakdown__row">
							<span>${label}</span>
							<strong>${formatEuro(value)}</strong>
						</div>
					`).join('')}
				</div>

				<p class="result-note">Der Preis ist eine erste Einschätzung. Das finale Angebot kann je nach Aufwand vor Ort abweichen.</p>
				<button class="btn-main" type="button" data-offer-request-result="true">Angebot anfordern</button>
				<button class="btn-secondary" onclick="location.reload()">Neue Berechnung</button>
			</div>
		</div>
	`;
}

/**
 * Builds the generic result template for service calculations.
 * @param {Object} data - Service calculation result.
 * @returns {string} HTML template.
 */
function getServiceResultTemplate(data) {
	const prices = data?.prices || {};
	const totalPrice = prices.totalPrice || 0;
	const items = Array.isArray(prices.items) ? prices.items : [];
	const travelRows = getCompanyTravelRows(prices);

	return `
		<div id="result-display" class="result-display">
			<div class="result-card result-card--kitchen">
				<p class="result-eyebrow">Unverbindliche Preiseinschätzung</p>
				<h2>${data?.serviceLabel || 'Service'}</h2>

				<div class="result-total">
					<span class="result-total__label">Geschätzter Gesamtpreis</span>
					<strong>${formatEuro(totalPrice)}</strong>
				</div>

				<div class="result-breakdown">
					${items.map((item) => `
						<div class="result-breakdown__row">
							<span>${item.name || 'Position'}</span>
							<strong>${formatEuro(item.price)}</strong>
						</div>
					`).join('')}
					${travelRows.map(([label, value]) => `
						<div class="result-breakdown__row">
							<span>${label}</span>
							<strong>${formatEuro(value)}</strong>
						</div>
					`).join('')}
				</div>

				<p class="result-note">Der Preis ist eine erste Einschätzung. Das finale Angebot kann je nach Aufwand vor Ort abweichen.</p>
				<button class="btn-main" type="button" data-offer-request-result="true">Angebot anfordern</button>
				<button class="btn-secondary" onclick="location.reload()">Neue Berechnung</button>
			</div>
		</div>
	`;
}
// Formularvorlagen fuer neue und bestehende Kuechen

/**
 * Builds the form template for a new kitchen installation.
 * @returns {string} HTML template.
 */
function getNewKitchenForm() {
    return `
		<form class="calc-card" id="calcForm">
			<h2>Angaben zur neuen Küche</h2>

			<div class="calc-grid">
				<div class="field">
					<label for="date">Wunschtermin</label>
					<input id="date" name="date" type="date">
				</div>

				<div class="field">
					<label for="kitchenType">Küchentyp</label>
					<select id="kitchenType" name="kitchenType">
						<option value="">Bitte wählen…</option>
						<option value="zeile">I-Form</option>
						<option value="l-form">L-Form</option>
						<option value="u-form">U-Form</option>
					</select>
				</div>

				<div class="field">
					<label for="upperCabinets">Anzahl der Oberschränke</label>
					<input id="upperCabinets" name="upperCabinets" type="number" min="0" placeholder="z.B. 4">
				</div>

				<div class="field">
					<label for="lowerCabinets">Anzahl der Unterschränke</label>
					<input id="lowerCabinets" name="lowerCabinets" type="number" min="0" placeholder="z.B. 6">
				</div>

				<div class="field">
					<label for="worktopPickup">Arbeitsplatte vom Baumarkt abholen?</label>
					<select id="worktopPickup" name="worktopPickup">
						<option value="">Bitte wählen…</option>
						<option value="yes">Ja</option>
						<option value="no">Nein</option>
					</select>
				</div>

				<div class="field field-full">
					<label for="notes">Zusätzliche Hinweise</label>
					<textarea id="notes" name="notes" rows="4" placeholder="z.B. Altbau, keine Aufzug, Wasseranschluss rechts…"></textarea>
				</div>
			</div>

			<div class="calc-actions">
				<button id="btn-continue" class="btn-main" type="button">Weiter</button>
				<button class="btn-secondary" type="reset">Zurücksetzen</button>
			</div>
		</form>
	`;
}

/**
 * Builds the form template for an existing kitchen transport/assembly request.
 * @returns {string} HTML template.
 */
function getUsedKitchenForm() {
    return `
		<form class="calc-card" id="calcForm">
			<h2>Angaben zur bestehenden Küche</h2>

			<div class="calc-grid">
				<div class="field">
					<label for="date">Wunschtermin</label>
					<input id="date" name="date" type="date">
				</div>

				<div class="field">
					<label for="kitchenType">Küchentyp</label>
					<select id="kitchenType" name="kitchenType">
						<option value="">Bitte wählen…</option>
						<option value="zeile">I-Form</option>
						<option value="l-form">L-Form</option>
						<option value="u-form">U-Form</option>
					</select>
				</div>

				<div class="field">
					<label for="upperCabinets">Anzahl der Oberschränke</label>
					<input id="upperCabinets" name="upperCabinets" type="number" min="0" placeholder="z.B. 4">
				</div>

				<div class="field">
					<label for="lowerCabinets">Anzahl der Unterschränke</label>
					<input id="lowerCabinets" name="lowerCabinets" type="number" min="0" placeholder="z.B. 6">
				</div>

				<div class="field">
					<label for="worktopAdjust">Neue Arbeitsplatte zuschneiden/anpassen?</label>
					<select id="worktopAdjust" name="worktopAdjust">
						<option value="">Bitte wählen…</option>
						<option value="yes">Ja</option>
						<option value="no">Nein</option>
					</select>
				</div>

                <div class="field">
					<label for="worktopPickup">Arbeitsplatte vom Baumarkt abholen?</label>
					<select id="worktopPickup" name="worktopPickup">
						<option value="">Bitte wählen…</option>
						<option value="yes">Ja</option>
						<option value="no">Nein</option>
					</select>
				</div>

				<div class="field field-full">
					<label for="notes">Zusätzliche Hinweise</label>
					<textarea id="notes" name="notes" rows="4" placeholder="z.B. Altbau, keine Aufzug, Wasseranschluss rechts…"></textarea>
				</div>
			</div>

			<div class="calc-actions">
				<button id="btn-continue" class="btn-main" type="button">Weiter</button>
				<button class="btn-secondary" type="reset">Zurücksetzen</button>
			</div>
		</form>
	`;
}

/**
 * Builds the form template for kitchen dismantling.
 * @returns {string} HTML template.
 */
function getKitchenDismantlingForm() {
	return `
		<form class="calc-card" id="calcForm">
			<h2>Küchendemontage</h2>
			<p>Bitte geben Sie die wichtigsten Angaben für den Küchenabbau an.</p>

			<div class="calc-grid">
				<div class="field">
					<label for="date">Wunschtermin</label>
					<input id="date" name="date" type="date">
				</div>

				<div class="field">
					<label for="kitchenType">Küchentyp</label>
					<select id="kitchenType" name="kitchenType">
						<option value="">Bitte wählen…</option>
						<option value="zeile">I-Form</option>
						<option value="l-form">L-Form</option>
						<option value="u-form">U-Form</option>
					</select>
				</div>

				<div class="field">
					<label for="upperCabinets">Anzahl der Oberschränke</label>
					<input id="upperCabinets" name="upperCabinets" type="number" min="0" placeholder="z.B. 4">
				</div>

				<div class="field">
					<label for="lowerCabinets">Anzahl der Unterschränke</label>
					<input id="lowerCabinets" name="lowerCabinets" type="number" min="0" placeholder="z.B. 6">
				</div>

				<div class="field field-full furniture-addon-group">
					<label>Zusatzleistungen</label>
					<div class="furniture-addon-list">
						<div class="furniture-addon-row">
							<label class="furniture-addon-toggle">
								<span class="furniture-addon-title">Küchenaufbau erforderlich?</span>
								<input id="kitchenAssembleAtDestination" name="kitchenAssembleAtDestination" type="checkbox" value="yes">
								<span class="furniture-addon-switch"></span>
							</label>
						</div>
					</div>
				</div>

				<div class="field field-full">
					<label for="notes">Zusätzliche Hinweise</label>
					<textarea id="notes" name="notes" rows="4" placeholder="z.B. Etage, Aufzug, Zustand der Küche, Besonderheiten"></textarea>
				</div>
			</div>

			<div class="calc-actions">
				<button id="btn-continue" class="btn-main" type="button">Weiter</button>
				<button class="btn-secondary" type="reset">Zurücksetzen</button>
			</div>
		</form>
	`;
}

/**
 * Builds the form template for kitchen transport.
 * @returns {string} HTML template.
 */
function getKitchenTransportForm() {
	return `
		<form class="calc-card" id="calcForm">
			<h2>Küchentransport</h2>
			<p>Bitte geben Sie die wichtigsten Angaben für den Küchentransport an.</p>

			<div class="calc-grid">
				<div class="field">
					<label for="date">Wunschtermin</label>
					<input id="date" name="date" type="date">
				</div>

				<div class="field">
					<label for="kitchenType">Küchentyp</label>
					<select id="kitchenType" name="kitchenType">
						<option value="">Bitte wählen…</option>
						<option value="zeile">I-Form</option>
						<option value="l-form">L-Form</option>
						<option value="u-form">U-Form</option>
					</select>
				</div>

				<div class="field">
					<label for="upperCabinets">Anzahl der Oberschränke</label>
					<input id="upperCabinets" name="upperCabinets" type="number" min="0" placeholder="z.B. 4">
				</div>

				<div class="field">
					<label for="lowerCabinets">Anzahl der Unterschränke</label>
					<input id="lowerCabinets" name="lowerCabinets" type="number" min="0" placeholder="z.B. 6">
				</div>

				<div class="field field-full furniture-addon-group">
					<label>Zusatzleistungen</label>
					<div class="furniture-addon-list">
						<div class="furniture-addon-row">
							<label class="furniture-addon-toggle">
								<span class="furniture-addon-title">Küchenabbau erforderlich?</span>
								<input id="kitchenNeedsDismantling" name="kitchenNeedsDismantling" type="checkbox" value="yes">
								<span class="furniture-addon-switch"></span>
							</label>
						</div>

						<div class="furniture-addon-row">
							<label class="furniture-addon-toggle">
								<span class="furniture-addon-title">Küchenaufbau erforderlich?</span>
								<input id="kitchenAssembleAtDestination" name="kitchenAssembleAtDestination" type="checkbox" value="yes">
								<span class="furniture-addon-switch"></span>
							</label>
						</div>
					</div>
				</div>

				<div class="field field-full">
					<label for="transportFromAddressAutocomplete">Transport von (Adresse)</label>
					<div id="transportFromAddressAutocomplete" class="autocomplete-container"></div>
					<input id="transportFromAddress" name="transportFromAddress" type="hidden" required>
				</div>

				<div class="field field-full">
					<label for="transportToAddressAutocomplete">Transport nach (Adresse)</label>
					<div id="transportToAddressAutocomplete" class="autocomplete-container"></div>
					<input id="transportToAddress" name="transportToAddress" type="hidden" required>
				</div>

				<div class="field field-full">
					<label for="notes">Zusätzliche Hinweise</label>
					<textarea id="notes" name="notes" rows="4" placeholder="z.B. Etage, Aufzug, Tragewege, Besonderheiten"></textarea>
				</div>
			</div>

			<div class="calc-actions">
				<button id="btn-continue" class="btn-main" type="button">Weiter</button>
				<button class="btn-secondary" type="reset">Zurücksetzen</button>
			</div>
		</form>
	`;
}

/**
 * Builds the supplemental kitchen assembly fields for kitchen transport.
 * @returns {string} HTML template.
 */
function getKitchenTransportAssemblyDetailsForm() {
	return `
		<form class="calc-card" id="kitchenTransportAssemblyDetailsForm">
			<h2>Aufbau am neuen Ort</h2>
			<p>Bitte ergänzen Sie, wie die Küche am neuen Ort aufgebaut werden soll.</p>

			<div class="calc-grid">
				<div class="field">
					<label for="kitchenType">Küchentyp am neuen Ort</label>
					<select id="kitchenType" name="kitchenType">
						<option value="">Bitte wählen…</option>
						<option value="zeile">I-Form</option>
						<option value="l-form">L-Form</option>
						<option value="u-form">U-Form</option>
					</select>
				</div>

				<div class="field">
					<label for="worktopAdjust">Neue Arbeitsplatte zuschneiden/anpassen?</label>
					<select id="worktopAdjust" name="worktopAdjust">
						<option value="">Bitte wählen…</option>
						<option value="yes">Ja</option>
						<option value="no">Nein</option>
					</select>
				</div>

				<div class="field">
					<label for="worktopPickup">Arbeitsplatte vom Baumarkt abholen?</label>
					<select id="worktopPickup" name="worktopPickup">
						<option value="">Bitte wählen…</option>
						<option value="yes">Ja</option>
						<option value="no">Nein</option>
					</select>
				</div>
			</div>

			<div class="calc-actions">
				<button id="btn-continue" class="btn-main" type="button">Weiter</button>
				<button class="btn-secondary" type="button" data-back-to-kitchen-transport>Zurück</button>
			</div>
		</form>
	`;
}

/**
 * Builds the form template for small item transport.
 * @returns {string} HTML template.
 */
function getSmallItemsTransportForm() {
	return `
		<form class="calc-card" id="calcForm">
			<h2>Kleintransporte</h2>
			<p>Fügen Sie die Positionen einzeln hinzu und geben Sie Maße sowie Ab-/Aufbauwunsch an.</p>

			<div class="calc-grid">
				<div class="field field-full">
					<label>Positionen</label>
					<div id="furnitureItemsList" class="furniture-items-list" data-item-template="transport" data-item-label="Position" data-max-items="3">
						<div class="furniture-item-card" data-item-index="0">
							<div class="furniture-item-card__head">
								<strong>Position 1</strong>
								<button type="button" class="btn-secondary furniture-item-remove" data-remove-item style="display:none;">Entfernen</button>
							</div>
							<div class="calc-grid">
								<div class="field field-full">
									<label for="transportItemName_0">Was soll transportiert werden?</label>
									<input id="transportItemName_0" name="transportItemName_0" type="text" placeholder="z.B. Schrank, Waschmaschine, Kartons">
								</div>
								<div class="field">
									<label for="transportItemLength_0">Länge (m)</label>
									<input id="transportItemLength_0" name="transportItemLength_0" type="number" min="0" step="0.01" placeholder="z.B. 1.20">
								</div>
								<div class="field">
									<label for="transportItemWidth_0">Breite (m)</label>
									<input id="transportItemWidth_0" name="transportItemWidth_0" type="number" min="0" step="0.01" placeholder="z.B. 0.60">
								</div>
								<div class="field">
									<label for="transportItemHeight_0">Höhe (m)</label>
									<input id="transportItemHeight_0" name="transportItemHeight_0" type="number" min="0" step="0.01" placeholder="z.B. 0.80">
								</div>
								<div class="field field-full">
									<label for="transportAssemblyNeed_0">Abbauen / Aufbauen benötigt?</label>
									<select id="transportAssemblyNeed_0" name="transportAssemblyNeed_0">
										<option value="">Bitte wählen…</option>
										<option value="none">Nicht nötig</option>
										<option value="dismantle">Nur abbauen</option>
										<option value="assemble">Nur aufbauen</option>
										<option value="both">Abbauen und aufbauen</option>
									</select>
								</div>
								${getTransportAssemblyAddonControls(0)}
							</div>
						</div>
					</div>
					<button id="addFurnitureItemBtn" class="btn-secondary" type="button">Position hinzufügen</button>
					<div id="smallTransportLimitNotice" class="calc-hint" hidden>
						<p>Bei mehr als 3 Positionen wählen Sie bitte die Leistung Umzugshilfe.</p>
						<button class="btn-secondary" type="button" data-switch-service="Umzugshilfe">Zur Umzugshilfe wechseln</button>
					</div>
				</div>

				<div class="field">
					<label for="distanceToEntrance">Wie nah kann man an Wohnung/Haus/Ort anfahren? (m)</label>
					<input id="distanceToEntrance" name="distanceToEntrance" type="number" min="0" step="1" placeholder="z.B. 15">
				</div>

				<div class="field field-full">
					<label for="notes">Zusätzliche Hinweise</label>
					<textarea id="notes" name="notes" rows="4" placeholder="Eigener Text: Besonderheiten, Zugang, Uhrzeit, etc."></textarea>
				</div>
			</div>

			<div class="calc-actions">
				<button id="btn-continue" class="btn-main" type="button">Weiter</button>
				<button class="btn-secondary" type="reset">Zurücksetzen</button>
			</div>
		</form>
	`;
}

/**
 * Builds the form template for moving helper hour calculation.
 * @returns {string} HTML template.
 */
function getMovingHelpersEstimateForm() {
	return `
		<form class="calc-card" id="calcForm">
			<h2>Umzugshilfe</h2>
			<p>Preiseinschätzung: Bitte geben Sie Helferanzahl, Zeitbedarf und Hinweise an.</p>

			<div class="calc-grid">
				<div class="field">
					<label for="helpersCount">Anzahl der Helfer</label>
					<select id="helpersCount" name="helpersCount">
						<option value="">Bitte wählen…</option>
						<option value="1">1 Helfer</option>
						<option value="2">2 Helfer</option>
						<option value="3">3 Helfer</option>
					</select>
				</div>

				<div class="field">
					<label for="workHours" class="label-with-tooltip">
						Stunden
						<span class="help-tooltip">
							<span class="help-tooltip__icon" aria-label="Hinweis">i</span>
							<span class="help-tooltip__content">Jede angefangene 15 Minuten nach einer vollen Stunde werden als volle Stunde berechnet.</span>
						</span>
					</label>
					<input id="workHours" name="workHours" type="number" min="1" step="0.25" placeholder="z.B. 2.5">
				</div>

				<div class="field field-full">
					<label for="transportFromAddressAutocomplete">Transport von (Adresse)</label>
					<div id="transportFromAddressAutocomplete" class="autocomplete-container"></div>
					<input id="transportFromAddress" name="transportFromAddress" type="hidden" required>
				</div>

				<div class="field field-full">
					<label for="transportToAddressAutocomplete">Transport nach (Adresse)</label>
					<div id="transportToAddressAutocomplete" class="autocomplete-container"></div>
					<input id="transportToAddress" name="transportToAddress" type="hidden" required>
				</div>

				<div class="field field-full">
					<label for="additionalNotes">Zusätzliche Hinweise</label>
					<textarea id="additionalNotes" name="additionalNotes" rows="4" placeholder="z.B. Etage, Aufzug, Laufwege, Besonderheiten"></textarea>
				</div>
			</div>

			<div class="calc-actions">
				<button id="btn-calculate" class="btn-main" type="button">Preis einschätzen</button>
				<button class="btn-secondary" type="reset">Zurücksetzen</button>
			</div>
		</form>
	`;
}

/**
 * Builds the form template for kitchen adjustment estimates.
 * @returns {string} HTML template.
 */
function getKitchenAdjustmentEstimateForm() {
	// Gleiche Eingaben/Logik wie beim Küchenaufbau (Preiseinschätzung).
	return getNewKitchenForm();
}

/**
 * Builds the form template for furniture disposal.
 * @returns {string} HTML template.
 */
function getFurnitureDisposalForm() {
	return `
		<form class="calc-card" id="calcForm">
			<h2>Möbelentsorgung</h2>
			<p>Fügen Sie Ihre Möbelstücke einzeln hinzu und geben Sie die Maße an.</p>

			<div class="calc-grid">
				<div class="field field-full">
					<label>Möbelstücke</label>
					<div id="furnitureItemsList" class="furniture-items-list" data-item-template="disposal">
						<div class="furniture-item-card" data-item-index="0">
							<div class="furniture-item-card__head">
								<strong>Möbelstück 1</strong>
								<button type="button" class="btn-secondary furniture-item-remove" data-remove-item style="display:none;">Entfernen</button>
							</div>
							<div class="calc-grid">
								<div class="field field-full">
									<label for="furnitureItemName_0">Was ist das für ein Möbelstück?</label>
									<input id="furnitureItemName_0" name="furnitureItemName_0" type="text" placeholder="z.B. Kleiderschrank, Kommode, Regal">
								</div>
								<div class="field">
									<label for="furnitureItemLength_0">Länge (m)</label>
									<input id="furnitureItemLength_0" name="furnitureItemLength_0" type="number" min="0" step="0.01" placeholder="z.B. 1.80">
								</div>
								<div class="field">
									<label for="furnitureItemHeight_0">Höhe (m)</label>
									<input id="furnitureItemHeight_0" name="furnitureItemHeight_0" type="number" min="0" step="0.01" placeholder="z.B. 2.10">
								</div>
							</div>
						</div>
					</div>
					<button id="addFurnitureItemBtn" class="btn-secondary" type="button">Möbelstück hinzufügen</button>
				</div>

				<div class="field field-full">
					<label for="distanceToEntrance">Wie nah kann man an Wohnung/Haus/Ort anfahren? (m)</label>
					<input id="distanceToEntrance" name="distanceToEntrance" type="number" min="0" step="1" placeholder="z.B. 15">
				</div>

				<div class="field field-full">
					<label for="notes">Zusätzliche Hinweise</label>
					<textarea id="notes" name="notes" rows="4" placeholder="Eigener Text: Etage, Aufzug, Zugang, besondere Hinweise"></textarea>
				</div>
			</div>

			<div class="calc-actions">
				<button id="btn-continue" class="btn-main" type="button">Weiter</button>
				<button class="btn-secondary" type="reset">Zurücksetzen</button>
			</div>
		</form>
	`;
}

/**
 * Builds the form template for furniture assembly.
 * @returns {string} HTML template.
 */
function getFurnitureAssemblyForm() {
	return `
		<form class="calc-card" id="calcForm">
			<h2>Möbelmontage</h2>
			<p>Fügen Sie Ihre Möbelstücke einzeln hinzu und geben Sie die Maße an.</p>

			<div class="calc-grid">
				<div class="field field-full">
					<label>Möbelstücke</label>
					<div id="furnitureItemsList" class="furniture-items-list" data-item-template="assembly">
						<div class="furniture-item-card" data-item-index="0">
							<div class="furniture-item-card__head">
								<strong>Möbelstück 1</strong>
								<button type="button" class="btn-secondary furniture-item-remove" data-remove-item style="display:none;">Entfernen</button>
							</div>
							<div class="calc-grid">
								<div class="field field-full">
									<label for="furnitureItemName_0">Was ist das für ein Möbelstück?</label>
									<input id="furnitureItemName_0" name="furnitureItemName_0" type="text" placeholder="z.B. Kleiderschrank, Kommode, Regal">
								</div>
								<div class="field">
									<label for="furnitureItemLength_0">Länge (m)</label>
									<input id="furnitureItemLength_0" name="furnitureItemLength_0" type="number" min="0" step="0.01" placeholder="z.B. 1.80">
								</div>
								<div class="field">
									<label for="furnitureItemHeight_0">Höhe (m)</label>
									<input id="furnitureItemHeight_0" name="furnitureItemHeight_0" type="number" min="0" step="0.01" placeholder="z.B. 2.10">
								</div>
								${getFurnitureAddonControls(0)}
							</div>
						</div>
					</div>
					<button id="addFurnitureItemBtn" class="btn-secondary" type="button">Möbelstück hinzufügen</button>
				</div>

				<div class="field field-full">
					<label for="notes">Zusätzliche Hinweise</label>
					<textarea id="notes" name="notes" rows="4" placeholder="Eigener Text: Etage, Aufzug, Zugang, Besonderheiten"></textarea>
				</div>
			</div>

			<div class="calc-actions">
				<button id="btn-continue" class="btn-main" type="button">Weiter</button>
				<button class="btn-secondary" type="reset">Zurücksetzen</button>
			</div>
		</form>
	`;
}

/**
 * Builds the form template for sanding or painting garden huts.
 * @returns {string} HTML template.
 */
function getGardenHutSandingPaintingForm() {
	return `
		<form class="calc-card" id="calcForm">
			<h2>Gartenhaus-Renovierung</h2>
			<p>Bitte geben Sie die Flächenangaben sowie gewünschte Leistungen an.</p>

			<div class="calc-grid">
				<div class="field">
					<label for="areaTotal">Quadratmeter gesamt (ca.)</label>
					<input id="areaTotal" name="areaTotal" type="number" min="0" step="0.1" placeholder="z.B. 24">
				</div>

				<div class="field">
					<label for="withSanding">Mit Anschliff?</label>
					<select id="withSanding" name="withSanding">
						<option value="">Bitte wählen…</option>
						<option value="yes">Ja</option>
						<option value="no">Nein</option>
					</select>
				</div>

				<div class="field">
					<label for="withPressureWashing">Mit Hochdruckreinigung?</label>
					<select id="withPressureWashing" name="withPressureWashing">
						<option value="">Bitte wählen…</option>
						<option value="yes">Ja</option>
						<option value="no">Nein</option>
					</select>
				</div>

				<div class="field field-full">
					<label for="notes">Zusätzliche Hinweise</label>
					<textarea id="notes" name="notes" rows="4" placeholder="z.B. Zustand der Oberfläche, gewünschte Farbe, Zugang"></textarea>
				</div>
			</div>

			<div class="calc-actions">
				<button id="btn-continue" class="btn-main" type="button">Weiter</button>
				<button class="btn-secondary" type="reset">Zurücksetzen</button>
			</div>
		</form>
	`;
}

/**
 * Builds the form template for garden hut assembly.
 * @returns {string} HTML template.
 */
function getGardenHutAssemblyForm() {
	return `
		<form class="calc-card" id="calcForm">
			<h2>Gartenhausmontage</h2>
			<p>Bitte geben Sie die wichtigsten Angaben für Aufbau, Boden und Zugang an.</p>

			<div class="calc-grid">
				<div class="field">
					<label for="areaTotal">Quadratmeter (ca.)</label>
					<input id="areaTotal" name="areaTotal" type="number" min="0" step="0.1" placeholder="z.B. 12">
				</div>

				<div class="field">
					<label for="roofCoating">Dachbeschichtung</label>
					<input id="roofCoating" name="roofCoating" type="text" placeholder="z.B. Bitumen, EPDM, Blech">
				</div>

				<div class="field">
					<label for="withGroundPreparation">Mit oder ohne Bodenvorbereitung?</label>
					<select id="withGroundPreparation" name="withGroundPreparation">
						<option value="">Bitte wählen…</option>
						<option value="without">Ohne Bodenvorbereitung</option>
						<option value="with">Mit Bodenvorbereitung</option>
					</select>
				</div>

				<div class="field">
					<label for="groundType">Falls mit: Welche Bodenart?</label>
					<select id="groundType" name="groundType">
						<option value="">Bitte wählen…</option>
						<option value="fundament">Fundament</option>
						<option value="paving-stones">Pflastersteine</option>
						<option value="plates">Platten</option>
						<option value="supports">Fundamentstützen</option>
					</select>
				</div>

				<div class="field field-full">
					<label for="distanceToGarden">Wie nah kann man zum Garten/Ort anfahren (m)</label>
					<input id="distanceToGarden" name="distanceToGarden" type="number" min="0" step="1" placeholder="z.B. 8">
				</div>

				<div class="field field-full">
					<label for="notes">Zusätzliche Hinweise</label>
					<textarea id="notes" name="notes" rows="4" placeholder="Eigener Text: Größe, Zugänglichkeit, gewünschter Termin, Besonderheiten"></textarea>
				</div>
			</div>

			<div class="calc-actions">
				<button id="btn-continue" class="btn-main" type="button">Weiter</button>
				<button class="btn-secondary" type="reset">Zurücksetzen</button>
			</div>
		</form>
	`;
}

/**
 * Builds the form template for hedge trimming.
 * @returns {string} HTML template.
 */
function getHedgeTrimmingForm() {
	return `
		<form class="calc-card" id="calcForm">
			<h2>Heckenschnitt</h2>
			<p>Bitte geben Sie aktuelle Maße, Zielmaße und Entsorgungswunsch an.</p>

			<div class="calc-grid">
				<div class="field">
					<label for="currentHeight">Aktuelle Höhe (m)</label>
					<input id="currentHeight" name="currentHeight" type="number" min="0" step="0.01" placeholder="z.B. 2.20">
				</div>

				<div class="field">
				<label for="targetHeight">Gewünschte Höhe (m)</label>
				<input id="targetHeight" name="targetHeight" type="number" min="0" step="0.01" placeholder="z.B. 1.80">
				</div>
				
				<div class="field">
				<label for="currentWidth">Aktuelle Breite (m)</label>
				<input id="currentWidth" name="currentWidth" type="number" min="0" step="0.01" placeholder="z.B. 1.20">
				</div>
				

				<div class="field">
				<label for="targetWidth">Gewünschte Breite (m)</label>
				<input id="targetWidth" name="targetWidth" type="number" min="0" step="0.01" placeholder="z.B. 0.90">
				</div>
				
				<div class="field">
					<label for="currentLength">Aktuelle Länge (m)</label>
					<input id="currentLength" name="currentLength" type="number" min="0" step="0.01" placeholder="z.B. 12.00">
				</div>

				<div class="field">
					<label for="withDisposal">Mit oder ohne Entsorgung?</label>
					<select id="withDisposal" name="withDisposal">
						<option value="">Bitte wählen…</option>
						<option value="without">Ohne Entsorgung</option>
						<option value="with">Mit Entsorgung</option>
					</select>
				</div>

				<div class="field field-full">
					<label for="distanceToGarden">Falls mit Entsorgung: Wie nah kann man zum Garten/Ort anfahren (m)</label>
					<input id="distanceToGarden" name="distanceToGarden" type="number" min="0" step="1" placeholder="z.B. 10">
				</div>

				<div class="field field-full">
					<label for="notes">Zusätzliche Hinweise</label>
					<textarea id="notes" name="notes" rows="4" placeholder="Eigener Text: Zugang, Schnittgutmenge, Besonderheiten"></textarea>
				</div>
			</div>

			<div class="calc-actions">
				<button id="btn-continue" class="btn-main" type="button">Weiter</button>
				<button class="btn-secondary" type="reset">Zurücksetzen</button>
			</div>
		</form>
	`;
}

/**
 * Builds the form template for hedge removal.
 * @returns {string} HTML template.
 */
function getHedgeRemovalForm() {
	return `
		<form class="calc-card" id="calcForm">
			<h2>Heckenentfernung</h2>
			<p>Bitte geben Sie die Maße der Hecke und Entsorgungsdetails an.</p>

			<div class="calc-grid">
				<div class="field">
					<label for="hedgeHeight">Höhe (m)</label>
					<input id="hedgeHeight" name="hedgeHeight" type="number" min="0" step="0.01" placeholder="z.B. 2.20">
				</div>

				<div class="field">
					<label for="hedgeLength">Länge (m)</label>
					<input id="hedgeLength" name="hedgeLength" type="number" min="0" step="0.01" placeholder="z.B. 10.00">
				</div>

				<div class="field">
					<label for="hedgeWidth">Breite (m)</label>
					<input id="hedgeWidth" name="hedgeWidth" type="number" min="0" step="0.01" placeholder="z.B. 1.10">
				</div>

				<div class="field">
					<label for="withDisposal">Mit oder ohne Entsorgung?</label>
					<select id="withDisposal" name="withDisposal">
						<option value="">Bitte wählen…</option>
						<option value="without">Ohne Entsorgung</option>
						<option value="with">Mit Entsorgung</option>
					</select>
				</div>

				<div class="field field-full">
					<label for="distanceToGarden">Falls mit Entsorgung: Wie nah kann man zum Garten/Ort anfahren (m)</label>
					<input id="distanceToGarden" name="distanceToGarden" type="number" min="0" step="1" placeholder="z.B. 12">
				</div>

				<div class="field field-full">
					<label for="notes">Zusätzliche Hinweise</label>
					<textarea id="notes" name="notes" rows="4" placeholder="Eigener Text: Zugang, Wurzeln, Besonderheiten"></textarea>
				</div>
			</div>

			<div class="calc-actions">
				<button id="btn-continue" class="btn-main" type="button">Weiter</button>
				<button class="btn-secondary" type="reset">Zurücksetzen</button>
			</div>
		</form>
	`;
}

/**
 * Builds the form template for root removal.
 * @returns {string} HTML template.
 */
function getRootRemovalForm() {
	return `
		<form class="calc-card" id="calcForm">
			<h2>Wurzelentfernung</h2>
			<p>Bitte geben Sie den Durchmesser sowie Entsorgungs- und Zugangsinformationen an.</p>

			<div class="calc-grid">
				<div class="field">
					<label for="rootDiameter">Durchmesser (cm)</label>
					<input id="rootDiameter" name="rootDiameter" type="number" min="0" step="1" placeholder="z.B. 35">
				</div>

				<div class="field">
					<label for="withDisposal">Mit oder ohne Entsorgung?</label>
					<select id="withDisposal" name="withDisposal">
						<option value="">Bitte wählen…</option>
						<option value="without">Ohne Entsorgung</option>
						<option value="with">Mit Entsorgung</option>
					</select>
				</div>

				<div class="field field-full">
					<label for="distanceToGarden">Falls mit Entsorgung: Wie nah kann man zum Garten/Ort anfahren (m)</label>
					<input id="distanceToGarden" name="distanceToGarden" type="number" min="0" step="1" placeholder="z.B. 10">
				</div>

				<div class="field field-full">
					<label for="notes">Zusätzliche Hinweise</label>
					<textarea id="notes" name="notes" rows="4" placeholder="Eigener Text: Anzahl Wurzeln, Zugänglichkeit, Besonderheiten"></textarea>
				</div>
			</div>

			<div class="calc-actions">
				<button id="btn-continue" class="btn-main" type="button">Weiter</button>
				<button class="btn-secondary" type="reset">Zurücksetzen</button>
			</div>
		</form>
	`;
}

/**
 * Builds the form template for small tree felling.
 * @returns {string} HTML template.
 */
function getSmallTreeFellingForm() {
	return `
		<form class="calc-card" id="calcForm">
			<h2>Baumfällung (kleine Bäume)</h2>
			<p>Bitte geben Sie Durchmesser, Zusatzleistungen und Zugangsinformationen an.</p>

			<div class="calc-grid">
				<div class="field">
					<label for="treeDiameter">Durchmesser (cm)</label>
					<input id="treeDiameter" name="treeDiameter" type="number" min="0" step="1" placeholder="z.B. 25">
				</div>

				<div class="field">
					<label for="withRootRemoval">Mit oder ohne Wurzelentfernung?</label>
					<select id="withRootRemoval" name="withRootRemoval">
						<option value="">Bitte wählen…</option>
						<option value="without">Ohne Wurzelentfernung</option>
						<option value="with">Mit Wurzelentfernung</option>
					</select>
				</div>

				<div class="field">
					<label for="withDisposal">Mit oder ohne Entsorgung?</label>
					<select id="withDisposal" name="withDisposal">
						<option value="">Bitte wählen…</option>
						<option value="without">Ohne Entsorgung</option>
						<option value="with">Mit Entsorgung</option>
					</select>
				</div>

				<div class="field">
					<label for="distanceToGarden">Falls mit Entsorgung: Wie nah kann man zum Garten/Ort anfahren (m)</label>
					<input id="distanceToGarden" name="distanceToGarden" type="number" min="0" step="1" placeholder="z.B. 8">
				</div>

				<div class="field field-full">
					<label for="notes">Zusätzliche Hinweise</label>
					<textarea id="notes" name="notes" rows="4" placeholder="Eigener Text: Anzahl Bäume, Zugang, Besonderheiten"></textarea>
				</div>
			</div>

			<div class="calc-actions">
				<button id="btn-continue" class="btn-main" type="button">Weiter</button>
				<button class="btn-secondary" type="reset">Zurücksetzen</button>
			</div>
		</form>
	`;
}

/**
 * Builds the form template for laying turf.
 * @returns {string} HTML template.
 */
function getLawnInstallationForm() {
	return `
		<form class="calc-card" id="calcForm">
			<h2 class="label-with-tooltip">
				Rollrasenverlegung
				<span class="help-tooltip">
					<span class="help-tooltip__icon" aria-label="Hinweis">i</span>
					<span class="help-tooltip__content">Ohne Bodenvorbereitung.</span>
				</span>
			</h2>
			<p>Bitte geben Sie die Fläche als Quadratmeter oder über Länge und Breite an.</p>

			<div class="calc-grid">
				<div class="field field-full">
					<div class="calc-option-block">
						<div class="field">
							<label for="areaTotal">Quadratmeter gesamt (ca.)</label>
							<input id="areaTotal" name="areaTotal" type="number" min="0" step="0.1" placeholder="z.B. 48">
						</div>
					</div>
					<div class="calc-option-divider">ODER</div>
					<div class="calc-option-block">
						<div class="calc-option-grid">
							<div class="field">
								<label for="length">Länge (m)</label>
								<input id="length" name="length" type="number" min="0" step="0.01" placeholder="z.B. 8.00">
							</div>
							<div class="field">
								<label for="width">Breite (m)</label>
								<input id="width" name="width" type="number" min="0" step="0.01" placeholder="z.B. 6.00">
							</div>
						</div>
					</div>
				</div>

				<div class="field field-full">
					<label for="distanceToGarden">Wie nah kann man an Garten/Ort anfahren? (m)</label>
					<input id="distanceToGarden" name="distanceToGarden" type="number" min="0" step="1" placeholder="z.B. 12">
				</div>

				<div class="field field-full">
					<label for="notes">Zusätzliche Hinweise</label>
					<textarea id="notes" name="notes" rows="4" placeholder="Eigener Text: Bodenbeschaffenheit, Zugang, gewünschter Termin"></textarea>
				</div>
			</div>

			<div class="calc-actions">
				<button id="btn-continue" class="btn-main" type="button">Weiter</button>
				<button class="btn-secondary" type="reset">Zurücksetzen</button>
			</div>
		</form>
	`;
}

/**
 * Builds the form template for lawn mowing.
 * @returns {string} HTML template.
 */
function getLawnMowingForm() {
	return `
		<form class="calc-card" id="calcForm">
			<h2>Rasenmähen</h2>
			<p>Bitte geben Sie die Fläche als Quadratmeter oder über Länge und Breite an.</p>

			<div class="calc-grid">
				<div class="field field-full">
					<div class="calc-option-block">
						<div class="field">
							<label for="areaTotal">Quadratmeter gesamt (ca.)</label>
							<input id="areaTotal" name="areaTotal" type="number" min="0" step="0.1" placeholder="z.B. 80">
						</div>
					</div>
					<div class="calc-option-divider">ODER</div>
					<div class="calc-option-block">
						<div class="calc-option-grid">
							<div class="field">
								<label for="length">Länge (m)</label>
								<input id="length" name="length" type="number" min="0" step="0.01" placeholder="z.B. 10.00">
							</div>
							<div class="field">
								<label for="width">Breite (m)</label>
								<input id="width" name="width" type="number" min="0" step="0.01" placeholder="z.B. 8.00">
							</div>
						</div>
					</div>
				</div>

				<div class="field field-full">
					<label for="distanceToGarden">Wie nah kann man an Garten/Ort anfahren? (m)</label>
					<input id="distanceToGarden" name="distanceToGarden" type="number" min="0" step="1" placeholder="z.B. 10">
				</div>

				<div class="field field-full">
					<label for="notes">Zusätzliche Hinweise</label>
					<textarea id="notes" name="notes" rows="4" placeholder="Eigener Text: Hanglage, Hindernisse, gewünschter Termin"></textarea>
				</div>
			</div>

			<div class="calc-actions">
				<button id="btn-continue" class="btn-main" type="button">Weiter</button>
				<button class="btn-secondary" type="reset">Zurücksetzen</button>
			</div>
		</form>
	`;
}

/**
 * Builds the form template for shrub trimming.
 * @returns {string} HTML template.
 */
function getShrubTrimmingForm() {
	return `
		<form class="calc-card" id="calcForm">
			<h2>Strauchschnitt</h2>
			<p>Bitte wählen Sie jeweils den aktuellen und den gewünschten Zustand: in Form oder nach Maßen.</p>

			<div class="calc-grid">
				<div class="field field-full">
					<div class="calc-option-block">
						<div class="calc-option-title">Zustand jetzt</div>
						<div class="calc-option-grid">
							<div class="field">
								<label for="currentShapeMode">Ist der Strauch in Form?</label>
								<select id="currentShapeMode" name="currentShapeMode">
									<option value="">Bitte wählen…</option>
									<option value="in-shape">Ja, in Form</option>
									<option value="not-in-shape">Nein, nicht in Form</option>
								</select>
							</div>
							<div class="field" id="currentShapeTypeWrap">
								<label for="currentShapeType">Falls in Form: Welche Form?</label>
								<select id="currentShapeType" name="currentShapeType">
									<option value="">Bitte wählen…</option>
									<option value="round">Rund</option>
									<option value="box">Kasten / Rechteckig</option>
									<option value="cone">Kegelform</option>
									<option value="other">Sonstige Form</option>
								</select>
							</div>
						</div>
						<div class="calc-option-grid" id="currentSizeFieldsWrap">
							<div class="field">
								<label for="currentHeight">Falls nicht in Form: Höhe (m)</label>
								<input id="currentHeight" name="currentHeight" type="number" min="0" step="0.01" placeholder="z.B. 1.80">
							</div>
							<div class="field">
								<label for="currentLength">Falls nicht in Form: Länge (m)</label>
								<input id="currentLength" name="currentLength" type="number" min="0" step="0.01" placeholder="z.B. 3.00">
							</div>
							<div class="field">
								<label for="currentWidth">Falls nicht in Form: Breite (m)</label>
								<input id="currentWidth" name="currentWidth" type="number" min="0" step="0.01" placeholder="z.B. 1.20">
							</div>
						</div>
					</div>
				</div>

				<div class="field field-full">
					<div class="calc-option-block">
						<div class="calc-option-title">Gewünschter Zustand</div>
						<div class="calc-option-grid">
							<div class="field">
								<label for="targetShapeMode">Soll der Strauch in Form sein?</label>
								<select id="targetShapeMode" name="targetShapeMode">
									<option value="">Bitte wählen…</option>
									<option value="in-shape">Ja, in Form</option>
									<option value="not-in-shape">Nein, nach Maßen</option>
								</select>
							</div>
							<div class="field" id="targetShapeTypeWrap">
								<label for="targetShapeType">Falls in Form: Welche Form gewünscht?</label>
								<select id="targetShapeType" name="targetShapeType">
									<option value="">Bitte wählen…</option>
									<option value="round">Rund</option>
									<option value="box">Kasten / Rechteckig</option>
									<option value="cone">Kegelform</option>
									<option value="other">Sonstige Form</option>
								</select>
							</div>
						</div>
						<div class="calc-option-grid" id="targetSizeFieldsWrap">
							<div class="field">
								<label for="targetHeight">Falls nach Maßen: Höhe (m)</label>
								<input id="targetHeight" name="targetHeight" type="number" min="0" step="0.01" placeholder="z.B. 1.50">
							</div>
							<div class="field">
								<label for="targetWidth">Falls nach Maßen: Breite (m)</label>
								<input id="targetWidth" name="targetWidth" type="number" min="0" step="0.01" placeholder="z.B. 0.90">
							</div>
						</div>
					</div>
				</div>

				<div class="field">
					<label for="withDisposal">Mit oder ohne Entsorgung?</label>
					<select id="withDisposal" name="withDisposal">
						<option value="">Bitte wählen…</option>
						<option value="without">Ohne Entsorgung</option>
						<option value="with">Mit Entsorgung</option>
					</select>
				</div>

				<div class="field">
					<label for="distanceToGarden">Falls mit Entsorgung: Wie nah kann man zum Garten/Ort anfahren (m)</label>
					<input id="distanceToGarden" name="distanceToGarden" type="number" min="0" step="1" placeholder="z.B. 10">
				</div>

				<div class="field field-full">
					<label for="notes">Zusätzliche Hinweise</label>
					<textarea id="notes" name="notes" rows="4" placeholder="Eigener Text: Sträucher-Art, Anzahl, Zugang, Besonderheiten"></textarea>
				</div>
			</div>

			<div class="calc-actions">
				<button id="btn-continue" class="btn-main" type="button">Weiter</button>
				<button class="btn-secondary" type="reset">Zurücksetzen</button>
			</div>
		</form>
	`;
}

/**
 * Builds the form template for green waste disposal.
 * @returns {string} HTML template.
 */
function getGreenWasteDisposalForm() {
	return `
		<form class="calc-card" id="calcForm">
			<h2>Grünschnittentsorgung</h2>
			<p>Bitte geben Sie die Menge entweder als Kubikmeter (geschätzt) oder über Maße an.</p>

			<div class="calc-grid">
				<div class="field field-full">
					<div class="calc-option-block">
						<div class="field">
							<label for="estimatedVolume">Kubikmeter (geschätzt)</label>
							<input id="estimatedVolume" name="estimatedVolume" type="number" min="0" step="0.1" placeholder="z.B. 3.5">
						</div>
					</div>
					<div class="calc-option-divider">ODER</div>
					<div class="calc-option-block">
						<div class="calc-option-grid">
							<div class="field">
								<label for="length">Länge (m)</label>
								<input id="length" name="length" type="number" min="0" step="0.01" placeholder="z.B. 2.00">
							</div>
							<div class="field">
								<label for="width">Breite (m)</label>
								<input id="width" name="width" type="number" min="0" step="0.01" placeholder="z.B. 1.50">
							</div>
							<div class="field">
								<label for="height">Höhe (m)</label>
								<input id="height" name="height" type="number" min="0" step="0.01" placeholder="z.B. 1.20">
							</div>
						</div>
					</div>
				</div>

				<div class="field field-full">
					<label for="distanceToGarden">Wie nah kann man an Garten/Ort anfahren? (m)</label>
					<input id="distanceToGarden" name="distanceToGarden" type="number" min="0" step="1" placeholder="z.B. 8">
				</div>

				<div class="field field-full">
					<label for="notes">Zusätzliche Hinweise</label>
					<textarea id="notes" name="notes" rows="4" placeholder="Eigener Text: Art der Abfälle, Zugang, Verpackung, Besonderheiten"></textarea>
				</div>
			</div>

			<div class="calc-actions">
				<button id="btn-continue" class="btn-main" type="button">Weiter</button>
				<button class="btn-secondary" type="reset">Zurücksetzen</button>
			</div>
		</form>
	`;
}

/**
 * Builds the form template for paving work.
 * @returns {string} HTML template.
 */
function getPavingForm() {
	return `
		<form class="calc-card" id="calcForm">
			<h2>Pflasterarbeiten</h2>
			<p>Bitte geben Sie Fläche, aktuellen Boden und Zugangsinformationen an.</p>

			<div class="calc-grid">
				<div class="field">
					<label for="areaTotal">Quadratmeter (ca.)</label>
					<input id="areaTotal" name="areaTotal" type="number" min="0" step="0.1" placeholder="z.B. 30">
				</div>

				<div class="field">
					<label for="currentGroundType">Was für ein Boden ist aktuell vorhanden?</label>
					<select id="currentGroundType" name="currentGroundType">
						<option value="">Bitte wählen…</option>
						<option value="oldPaving">Alte Pflaster</option>
						<option value="gravelPath">Schotterweg</option>
						<option value="topsoil">Mutterboden</option>
						<option value="other">Sonstiges</option>
					</select>
				</div>

				<div class="field field-full">
					<label for="distanceToGarden">Wie nah kann man an Garten/Ort anfahren? (m)</label>
					<input id="distanceToGarden" name="distanceToGarden" type="number" min="0" step="1" placeholder="z.B. 10">
				</div>

				<div class="field field-full">
					<label for="notes">Zusätzliche Hinweise</label>
					<textarea id="notes" name="notes" rows="4" placeholder="Eigener Text: gewünschtes Muster, Material, Zugang, Besonderheiten"></textarea>
				</div>
			</div>

			<div class="calc-actions">
				<button id="btn-continue" class="btn-main" type="button">Weiter</button>
				<button class="btn-secondary" type="reset">Zurücksetzen</button>
			</div>
		</form>
	`;
}

/**
 * Builds the form template for fence assembly.
 * @returns {string} HTML template.
 */
function getFenceAssemblyForm() {
	return `
		<form class="calc-card" id="calcForm">
			<h2>Zaunmontage</h2>
			<p>Bitte geben Sie die Anzahl der Zaunelemente und optionale Bordstein-Angaben an.</p>

			<div class="calc-grid">
				<div class="field">
					<label for="fenceElementsCount" class="label-with-tooltip">
						Wie viele Zaunelemente insgesamt?
						<span class="help-tooltip">
							<span class="help-tooltip__icon" aria-label="Hinweis">i</span>
							<span class="help-tooltip__content">Ein Zaunelement ist ein Feld zwischen zwei Pfosten.</span>
						</span>
					</label>
					<input id="fenceElementsCount" name="fenceElementsCount" type="number" min="1" step="1" placeholder="z.B. 5">
				</div>

				<div class="field">
					<label for="withKerbstone">Mit Kantenstein / Bordstein?</label>
					<select id="withKerbstone" name="withKerbstone">
						<option value="">Bitte wählen…</option>
						<option value="without">Ohne</option>
						<option value="with">Mit</option>
					</select>
				</div>

				<div class="field field-full">
					<label for="kerbstoneLengthM">Falls mit: Länge Kantenstein / Bordstein (m)</label>
					<input id="kerbstoneLengthM" name="kerbstoneLengthM" type="number" min="0" step="0.1" placeholder="z.B. 18">
				</div>

				<div class="field field-full">
					<label for="notes">Zusätzliche Hinweise</label>
					<textarea id="notes" name="notes" rows="4" placeholder="Eigener Text: Zauntyp, Gelände, Zugang, gewünschter Termin"></textarea>
				</div>
			</div>

			<div class="calc-actions">
				<button id="btn-continue" class="btn-main" type="button">Weiter</button>
				<button class="btn-secondary" type="reset">Zurücksetzen</button>
			</div>
		</form>
	`;
}

/**
 * Builds the form template for canopy work.
 * @returns {string} HTML template.
 */
function getCanopyForm() {
	return `
		<form class="calc-card" id="calcForm">
			<h2>Überdachungsmontage</h2>
			<p>Bitte geben Sie Fläche, Dachbeschichtung und Seitenangaben an.</p>

			<div class="calc-grid">
				<div class="field">
					<label for="areaTotal">Quadratmeter (ca.)</label>
					<input id="areaTotal" name="areaTotal" type="number" min="0" step="0.1" placeholder="z.B. 18">
				</div>

				<div class="field">
					<label for="roofCoating">Dachbeschichtung</label>
					<select id="roofCoating" name="roofCoating">
						<option value="">Bitte wählen…</option>
						<option value="bitumen">Bitumen</option>
						<option value="polycarbonate">Polycarbonat</option>
						<option value="glass">Glas</option>
						<option value="metal">Metall</option>
						<option value="other">Sonstiges</option>
					</select>
				</div>

				<div class="field field-full">
					<label for="closedSides">Welche Seiten sind geschlossen?</label>
					<input id="closedSides" name="closedSides" type="text" placeholder="z.B. Links und hinten / Offen auf 2 Seiten">
				</div>

				<div class="field field-full">
					<label for="notes">Zusätzliche Hinweise</label>
					<textarea id="notes" name="notes" rows="4" placeholder="Eigener Text: Maße, Materialwunsch, Untergrund, Besonderheiten"></textarea>
				</div>
			</div>

			<div class="calc-actions">
				<button id="btn-continue" class="btn-main" type="button">Weiter</button>
				<button class="btn-secondary" type="reset">Zurücksetzen</button>
			</div>
		</form>
	`;
}

/**
 * Builds the form template for joint cleaning.
 * @returns {string} HTML template.
 */
function getJointCleaningForm() {
	return `
		<form class="calc-card" id="calcForm">
			<h2>Fugenreinigung</h2>
			<p>Bitte geben Sie die ungefähre Fläche und zusätzliche Hinweise an.</p>

			<div class="calc-grid">
				<div class="field">
					<label for="areaTotal">Quadratmeter (ca.)</label>
					<input id="areaTotal" name="areaTotal" type="number" min="0" step="0.1" placeholder="z.B. 25">
				</div>

				<div class="field field-full">
					<label for="notes">Zusätzliche Hinweise</label>
					<textarea id="notes" name="notes" rows="4" placeholder="Eigener Text: Fugenart, Zustand, Ort, Besonderheiten"></textarea>
				</div>
			</div>

			<div class="calc-actions">
				<button id="btn-continue" class="btn-main" type="button">Weiter</button>
				<button class="btn-secondary" type="reset">Zurücksetzen</button>
			</div>
		</form>
	`;
}

/**
 * Builds the form template for fine plaster quality selection.
 * @returns {string} HTML template.
 */
function getFinePlasterForm() {
	return `
		<form class="calc-card" id="calcForm">
			<h2>Feinputz / Fertigbeschichtung</h2>
			<p>Bitte geben Sie Fläche und gewünschte Qualitätsstufe an.</p>

			<div class="calc-grid">
				<div class="field">
					<label for="areaTotal">Quadratmeter (ca.)</label>
					<input id="areaTotal" name="areaTotal" type="number" min="0" step="0.1" placeholder="z.B. 45">
				</div>

				<div class="field">
					<label for="qualityLevel">Qualitätsstufe</label>
					<select id="qualityLevel" name="qualityLevel">
						<option value="">Bitte wählen…</option>
						<option value="q1q2">Q1 / Q2</option>
						<option value="q3">Q3</option>
						<option value="q4">Q4</option>
					</select>
				</div>

				<div class="field field-full">
					<label for="notes">Zusätzliche Hinweise</label>
					<textarea id="notes" name="notes" rows="4" placeholder="Eigener Text: Untergrund, Raumzustand, gewünschter Termin"></textarea>
				</div>
			</div>

			<div class="calc-actions">
				<button id="btn-continue" class="btn-main" type="button">Weiter</button>
				<button class="btn-secondary" type="reset">Zurücksetzen</button>
			</div>
		</form>
	`;
}

/**
 * Builds the form template for wall plastering.
 * @returns {string} HTML template.
 */
function getWallPlasteringForm() {
	return `
		<form class="calc-card" id="calcForm">
			<h2>Wandverputz</h2>
			<p>Bitte geben Sie Fläche und Ausführungsart an.</p>

			<div class="calc-grid">
				<div class="field">
					<label for="areaTotal">Quadratmeter (ca.)</label>
					<input id="areaTotal" name="areaTotal" type="number" min="0" step="0.1" placeholder="z.B. 60">
				</div>

				<div class="field">
					<label for="plasteringType">Ausführungsart</label>
					<select id="plasteringType" name="plasteringType">
						<option value="">Bitte wählen…</option>
						<option value="grobeschicht-frei-hand">Wandverputz / Grobschicht (frei Hand, nicht lotgerecht)</option>
						<option value="lotgerecht-wasserwaage">Wandverputz (mit Wasserwaage, lotgerecht)</option>
					</select>
				</div>

				<div class="field field-full furniture-addon-group">
					<label>Zusatzleistungen</label>
					<div class="furniture-addon-list">
						<div class="furniture-addon-row">
							<label class="furniture-addon-toggle">
								<span class="furniture-addon-title">Feinputz / Fertigbeschichtung hinzufügen?</span>
								<input id="includeFinePlaster" name="includeFinePlaster" type="checkbox" value="yes" data-trade-addon-toggle data-target="wallFinePlasterOptions">
								<span class="furniture-addon-switch"></span>
							</label>
						</div>
					</div>
				</div>

				<div id="wallFinePlasterOptions" class="field field-full" data-trade-addon-options hidden>
					<label for="finePlasterQualityLevel">Qualitätsstufe für Feinputz</label>
					<select id="finePlasterQualityLevel" name="finePlasterQualityLevel" disabled>
						<option value="">Bitte wählen…</option>
						<option value="q1q2">Q1 / Q2</option>
						<option value="q3">Q3</option>
						<option value="q4">Q4</option>
					</select>
				</div>

				<div class="field field-full">
					<label for="notes">Zusätzliche Hinweise</label>
					<textarea id="notes" name="notes" rows="4" placeholder="Eigener Text: Untergrund, Raumanzahl, Zustand, gewünschter Termin"></textarea>
				</div>
			</div>

			<div class="calc-actions">
				<button id="btn-continue" class="btn-main" type="button">Weiter</button>
				<button class="btn-secondary" type="reset">Zurücksetzen</button>
			</div>
		</form>
	`;
}

/**
 * Builds the form template for drywall work.
 * @returns {string} HTML template.
 */
function getDrywallForm() {
	return `
		<form class="calc-card" id="calcForm">
			<h2>Trockenbau</h2>
			<p>Bitte geben Sie Fläche und kurze Projektangaben an.</p>

			<div class="calc-grid">
				<div class="field">
					<label for="areaTotal">Quadratmeter (ca.)</label>
					<input id="areaTotal" name="areaTotal" type="number" min="0" step="0.1" placeholder="z.B. 30">
				</div>

				<div class="field field-full furniture-addon-group">
					<label>Zusatzleistungen</label>
					<div class="furniture-addon-list">
						<div class="furniture-addon-row">
							<label class="furniture-addon-toggle">
								<span class="furniture-addon-title">Wandverputz hinzufügen?</span>
								<input id="includeWallPlastering" name="includeWallPlastering" type="checkbox" value="yes" data-trade-addon-toggle data-target="drywallWallPlasteringOptions">
								<span class="furniture-addon-switch"></span>
							</label>
						</div>

						<div class="furniture-addon-row">
							<label class="furniture-addon-toggle">
								<span class="furniture-addon-title">Feinputz / Fertigbeschichtung hinzufügen?</span>
								<input id="includeFinePlaster" name="includeFinePlaster" type="checkbox" value="yes" data-trade-addon-toggle data-target="drywallFinePlasterOptions">
								<span class="furniture-addon-switch"></span>
							</label>
						</div>
					</div>
				</div>

				<div id="drywallWallPlasteringOptions" class="field field-full" data-trade-addon-options hidden>
					<label for="addonPlasteringType">Ausführungsart für Wandverputz</label>
					<select id="addonPlasteringType" name="addonPlasteringType" disabled>
						<option value="">Bitte wählen…</option>
						<option value="grobeschicht-frei-hand">Wandverputz / Grobschicht (frei Hand, nicht lotgerecht)</option>
						<option value="lotgerecht-wasserwaage">Wandverputz (mit Wasserwaage, lotgerecht)</option>
					</select>
				</div>

				<div id="drywallFinePlasterOptions" class="field field-full" data-trade-addon-options hidden>
					<label for="finePlasterQualityLevel">Qualitätsstufe für Feinputz</label>
					<select id="finePlasterQualityLevel" name="finePlasterQualityLevel" disabled>
						<option value="">Bitte wählen…</option>
						<option value="q1q2">Q1 / Q2</option>
						<option value="q3">Q3</option>
						<option value="q4">Q4</option>
					</select>
				</div>

				<div class="field field-full">
					<label for="notes">Zusätzliche Hinweise</label>
					<textarea id="notes" name="notes" rows="4" placeholder="Eigener Text: Wand/Decke, Raum, Untergrund, gewünschter Termin"></textarea>
				</div>
			</div>

			<div class="calc-actions">
				<button id="btn-continue" class="btn-main" type="button">Weiter</button>
				<button class="btn-secondary" type="reset">Zurücksetzen</button>
			</div>
		</form>
	`;
}

/**
 * Builds the form template for mini excavator work.
 * @returns {string} HTML template.
 */
function getMiniExcavatorWorkForm() {
	return `
		<form class="calc-card" id="calcForm">
			<h2>Minibaggerarbeiten</h2>
			<p>Bitte beschreiben Sie kurz die Arbeiten und geben Sie Zugangsinformationen an.</p>

			<div class="calc-grid">
				<div class="field field-full">
					<label for="workDescription">Was soll gemacht werden? (kurz beschreiben)</label>
					<textarea id="workDescription" name="workDescription" rows="3" placeholder="z.B. Aushub für Fundament, Boden angleichen, Graben ziehen"></textarea>
				</div>

				<div class="field field-full">
					<label for="distanceToGarden">Wie nah kann man an Garten/Ort anfahren? (m)</label>
					<input id="distanceToGarden" name="distanceToGarden" type="number" min="0" step="1" placeholder="z.B. 6">
				</div>

				<div class="field field-full">
					<label for="notes">Zusätzliche Hinweise</label>
					<textarea id="notes" name="notes" rows="4" placeholder="Eigener Text: Bodenart, Fläche, Hindernisse, Besonderheiten"></textarea>
				</div>
			</div>

			<div class="calc-actions">
				<button id="btn-continue" class="btn-main" type="button">Weiter</button>
				<button class="btn-secondary" type="reset">Zurücksetzen</button>
			</div>
		</form>
	`;
}

/**
 * Builds the form template for wood chipper work.
 * @returns {string} HTML template.
 */
function getWoodChipperForm() {
	return `
		<form class="calc-card" id="calcForm">
			<h2>Holzhäckselarbeiten</h2>
			<p>Bitte geben Sie die Menge entweder als Kubikmeter (geschätzt) oder über Astdaten an.</p>

			<div class="calc-grid">
				<div class="field field-full">
					<div class="calc-option-block">
						<div class="field">
							<label for="estimatedVolume">Kubikmeter (geschätzt)</label>
							<input id="estimatedVolume" name="estimatedVolume" type="number" min="0" step="0.1" placeholder="z.B. 2.5">
						</div>
					</div>
					<div class="calc-option-divider">ODER</div>
					<div class="calc-option-block">
						<div class="calc-option-grid">
							<div class="field">
								<label for="branchThickness">Aststärke (ca. cm)</label>
								<input id="branchThickness" name="branchThickness" type="number" min="0" step="1" placeholder="z.B. 4">
							</div>
							<div class="field">
								<label for="branchLength">Astlänge (ca. m)</label>
								<input id="branchLength" name="branchLength" type="number" min="0" step="0.1" placeholder="z.B. 1.2">
							</div>
							<div class="field">
								<label for="branchCount">Anzahl Äste (ca. Stück)</label>
								<input id="branchCount" name="branchCount" type="number" min="0" step="1" placeholder="z.B. 40">
							</div>
						</div>
					</div>
				</div>

				<div class="field field-full">
					<label for="distanceToGarden">Wie nah kann man an Garten/Ort anfahren? (m)</label>
					<input id="distanceToGarden" name="distanceToGarden" type="number" min="0" step="1" placeholder="z.B. 10">
				</div>

				<div class="field field-full">
					<label for="notes">Zusätzliche Hinweise</label>
					<textarea id="notes" name="notes" rows="4" placeholder="Eigener Text: Holzart, Zugang, Ablageort, Besonderheiten"></textarea>
				</div>
			</div>

			<div class="calc-actions">
				<button id="btn-continue" class="btn-main" type="button">Weiter</button>
				<button class="btn-secondary" type="reset">Zurücksetzen</button>
			</div>
		</form>
	`;
}

/**
 * Builds the custom furniture request form template.
 * @returns {string} HTML template.
 */
function getCustomFurnitureRequestForm() {
	return `
		<form class="calc-card" id="calcForm">
			<h2>Möbelanfertigung (beliebige Maße und Größe)</h2>
			<p>Anfrage für einen Besichtigungstermin.</p>

			<div class="calc-grid">
				<div class="field">
					<label for="date">Wunschtermin für Besichtigung</label>
					<input id="date" name="date" type="date">
				</div>

				<div class="field">
					<label for="timeWindow">Bevorzugtes Zeitfenster</label>
					<select id="timeWindow" name="timeWindow">
						<option value="">Bitte wählen…</option>
						<option value="morning">Vormittag</option>
						<option value="afternoon">Nachmittag</option>
						<option value="evening">Abend</option>
					</select>
				</div>

				<div class="field">
					<label for="firstName">Vorname</label>
					<input id="firstName" name="firstName" type="text" placeholder="Ihr Vorname">
				</div>

				<div class="field">
					<label for="lastName">Nachname</label>
					<input id="lastName" name="lastName" type="text" placeholder="Ihr Nachname">
				</div>

				<div class="field field-full">
					<label for="phone">Telefonnummer</label>
					<input id="phone" name="phone" type="tel" placeholder="Ihre Telefonnummer">
				</div>

				<div class="field field-full">
					<label for="customFurnitureAddressValue">Ort der Besichtigung</label>
					<div id="customFurnitureAddressAutocomplete" class="autocomplete-container" data-address-autocomplete data-address-target="address"></div>
					<input id="customFurnitureAddressValue" name="address" type="hidden">
				</div>

				<div class="field field-full">
					<label for="notes">Kurzbeschreibung Ihrer Anfrage</label>
					<textarea id="notes" name="notes" rows="4" placeholder="z.B. gewünschtes Möbelstück, ungefähre Maße, Materialwunsch"></textarea>
				</div>
			</div>

			<div class="calc-actions">
				<button id="btn-continue" class="btn-main" type="button">Anfrage senden</button>
				<button class="btn-secondary" type="reset">Zurücksetzen</button>
			</div>
		</form>
	`;
}

/**
 * Builds the custom kitchen request form template.
 * @returns {string} HTML template.
 */
function getCustomKitchenRequestForm() {
	return `
		<form class="calc-card" id="calcForm">
			<h2>Küchenanfertigung (beliebige Maße und Größe)</h2>
			<p>Anfrage für einen Besichtigungstermin.</p>

			<div class="calc-grid">
				<div class="field">
					<label for="date">Wunschtermin für Besichtigung</label>
					<input id="date" name="date" type="date">
				</div>

				<div class="field">
					<label for="timeWindow">Bevorzugtes Zeitfenster</label>
					<select id="timeWindow" name="timeWindow">
						<option value="">Bitte wählen…</option>
						<option value="morning">Vormittag</option>
						<option value="afternoon">Nachmittag</option>
						<option value="evening">Abend</option>
					</select>
				</div>

				<div class="field">
					<label for="firstName">Vorname</label>
					<input id="firstName" name="firstName" type="text" placeholder="Ihr Vorname">
				</div>

				<div class="field">
					<label for="lastName">Nachname</label>
					<input id="lastName" name="lastName" type="text" placeholder="Ihr Nachname">
				</div>

				<div class="field field-full">
					<label for="phone">Telefonnummer</label>
					<input id="phone" name="phone" type="tel" placeholder="Ihre Telefonnummer">
				</div>

				<div class="field field-full">
					<label for="customKitchenAddressValue">Ort der Besichtigung</label>
					<div id="customKitchenAddressAutocomplete" class="autocomplete-container" data-address-autocomplete data-address-target="address"></div>
					<input id="customKitchenAddressValue" name="address" type="hidden">
				</div>

				<div class="field field-full">
					<label for="notes">Kurzbeschreibung Ihrer Anfrage</label>
					<textarea id="notes" name="notes" rows="4" placeholder="z.B. Küchenstil, Maße, Gerätewünsche, Material"></textarea>
				</div>
			</div>

			<div class="calc-actions">
				<button id="btn-continue" class="btn-main" type="button">Anfrage senden</button>
				<button class="btn-secondary" type="reset">Zurücksetzen</button>
			</div>
		</form>
	`;
}

/**
 * Builds the kitchen assembly survey template.
 * @returns {string} HTML template.
 */
function getAssemblySurvey() {
	return `
		<div class="assembly-survey" id="assemblySurvey">
			<div class="survey-card">
				<h2>Schränke-Montage</h2>
				<p>Sollen die Schränke zusammengebaut werden?</p>
				
				<div class="survey-options">
					<button type="button" class="survey-btn" data-value="no">
						<span class="survey-label">Nein</span>
						<span class="survey-desc">Ich montiere die Schränke selbst</span>
					</button>
					<button type="button" class="survey-btn" data-value="yes">
						<span class="survey-label">Ja</span>
						<span class="survey-desc">Wir montieren die Schränke für Sie.</span>
					</button>
				</div>

				<div id="assemblyFields" style="display: none; margin-top: 20px;">
					<p style="color: var(--muted); font-size: 13px; margin-top: 0;">
						<strong>Kleine Schränke :</strong> 30-40cm breite Schränke<br>
						<strong>Große Schränke :</strong> 60-90cm breite Schränke
					</p>
					
					<div class="field">
						<label for="smallCabinets">Anzahl kleine Schränke</label>
						<input id="smallCabinets" name="smallCabinets" type="number" min="0" placeholder="z.B. 2">
					</div>
					<div class="field">
						<label for="largeCabinets">Anzahl große Schränke</label>
						<input id="largeCabinets" name="largeCabinets" type="number" min="0" placeholder="z.B. 3">
					</div>
                    <div class="field">
					<label for="drawers">Anzahl der Schubladen</label>
					<input id="drawers" name="drawers" type="number" min="0" placeholder="z.B. 6">
				</div>
				</div>

				<button id="btn-main" class="btn-main" style="display: none; margin-top: 20px;">Weiter</button>
			</div>
		</div>
	`;
}

/**
 * Builds the optional transportation survey template.
 * @returns {string} HTML template.
 */
function getTransportationSurvey() {
	return `
		<div class="transport-survey" id="transportSurvey">
			<div class="survey-card">
				<h2>Transport erforderlich?</h2>
				<p>Müssen wir die Küche an einen anderen Ort transportieren?</p>
				
				<div class="survey-options">
					<button type="button" class="survey-btn" data-value="no">
						<span class="survey-label">Nein</span>
						<span class="survey-desc">Küche wird vor Ort installiert</span>
					</button>
					<button type="button" class="survey-btn" data-value="yes">
						<span class="survey-label">Ja</span>
						<span class="survey-desc">Transport zu anderem Ort nötig</span>
					</button>
				</div>

				<div id="transportFields" style="display: none; margin-top: 20px;">
					<div class="field">
						<label>Von (Adresse)</label>
						<div id="transportFromAutocomplete" class="autocomplete-container"></div>
					</div>

					<div id="transportIntermediateAddresses"></div>

					<div class="field">
						<label>Nach (Adresse)</label>
						<div id="transportToAutocomplete" class="autocomplete-container"></div>
					</div>
				</div>

				<div class="transport-actions" id="transportActions" style="display: none; margin-top: 20px;">
					<button id="btn-main" class="btn-main" type="button">Preis berechnen</button>
					<button id="addIntermediateAddressBtn" class="btn-secondary" type="button">Zwischeziel hinzufügen</button>
				</div>
			</div>
		</div>
	`;
}

/**
 * Builds the direct transport address form template.
 * @returns {string} HTML template.
 */
function getDirectTransportAddressForm() {
	return `
		<div class="transport-survey" id="directTransportSurvey">
			<div class="survey-card">
				<h2>Transportadressen</h2>
				<p>Bitte geben Sie Start- und Zieladresse für den Transport an.</p>

				<div id="transportFields" style="margin-top: 20px;">
					<div class="field">
						<label>Von (Adresse)</label>
						<div id="directTransportFromAutocomplete" class="autocomplete-container"></div>
					</div>

					<div id="directTransportIntermediateAddresses"></div>

					<div class="field">
						<label>Nach (Adresse)</label>
						<div id="directTransportToAutocomplete" class="autocomplete-container"></div>
					</div>
				</div>

				<div class="transport-actions" id="transportActions" style="display: flex; margin-top: 20px;">
					<button id="btn-main" class="btn-main" type="button">Weiter</button>
					<button id="addIntermediateAddressBtn" class="btn-secondary" type="button">Zwischeziel hinzufügen</button>
				</div>
			</div>
		</div>
	`;
}

/**
 * Builds one intermediate address field template.
 * @param {number} index - Zero-based intermediate address index.
 * @param {string} [idPrefix='transportViaAutocomplete'] - Autocomplete id prefix.
 * @returns {string} HTML template.
 */
function getIntermediateAddressTemplate(index, idPrefix = 'transportViaAutocomplete') {
	return `
		<div class="field intermediate-address-field" data-intermediate-address-index="${index}">
			<div class="intermediate-address-field__head">
				<label>Zwischeziel ${index + 1}</label>
				<button class="intermediate-address-remove" type="button" data-remove-intermediate-address="${index}" aria-label="Zwischeziel löschen">×</button>
			</div>
			<div id="${idPrefix}-${index}" class="autocomplete-container"></div>
		</div>
	`;
}

/**
 * Builds optional addon controls for a furniture item.
 * @param {number} index - Zero-based item index.
 * @returns {string} HTML template.
 */
function getFurnitureAddonControls(index) {
	return `
		<div class="field field-full furniture-addon-group">
			<label>Optionale Ausstattung</label>
			<div class="furniture-addon-list">
				<div class="furniture-addon-row">
					<label class="furniture-addon-toggle">
						<span class="furniture-addon-title">Schubladen</span>
						<input type="checkbox" data-addon-toggle data-target="furnitureItemDrawers_${index}">
						<span class="furniture-addon-switch"></span>
					</label>
					<div class="furniture-addon-qty" data-addon-qty="furnitureItemDrawers_${index}" hidden>
						<input id="furnitureItemDrawers_${index}" name="furnitureItemDrawers_${index}" type="number" min="0" step="1" placeholder="Anzahl Schubladen">
					</div>
				</div>

				<div class="furniture-addon-row">
					<label class="furniture-addon-toggle">
						<span class="furniture-addon-title">Ausziehboden</span>
						<input type="checkbox" data-addon-toggle data-target="furnitureItemPullouts_${index}">
						<span class="furniture-addon-switch"></span>
					</label>
					<div class="furniture-addon-qty" data-addon-qty="furnitureItemPullouts_${index}" hidden>
						<input id="furnitureItemPullouts_${index}" name="furnitureItemPullouts_${index}" type="number" min="0" step="1" placeholder="Anzahl Ausziehboden">
					</div>
				</div>

				<div class="furniture-addon-row">
					<label class="furniture-addon-toggle">
						<span class="furniture-addon-title">Beleuchtung</span>
						<input type="checkbox" data-addon-toggle data-target="furnitureItemLighting_${index}">
						<span class="furniture-addon-switch"></span>
					</label>
					<div class="furniture-addon-qty" data-addon-qty="furnitureItemLighting_${index}" hidden>
						<input id="furnitureItemLighting_${index}" name="furnitureItemLighting_${index}" type="number" min="0" step="1" placeholder="Anzahl Beleuchtung">
					</div>
				</div>
			</div>
		</div>
	`;
}

/**
 * Builds addon controls used when a transport item needs assembly or dismantling.
 * @param {number} index - Zero-based item index.
 * @returns {string} HTML template.
 */
function getTransportAssemblyAddonControls(index) {
	return `
		<div class="transport-assembly-addons" data-transport-assembly-addons hidden>
			${getFurnitureAddonControls(index)}
		</div>
	`;
}

/**
 * Builds a furniture item card template.
 * @param {number} index - Zero-based item index.
 * @returns {string} HTML template.
 */
function getFurnitureItemCardTemplate(index) {
	return `
		<div class="furniture-item-card" data-item-index="${index}">
			<div class="furniture-item-card__head">
				<strong>Möbelstück ${index + 1}</strong>
				<button type="button" class="btn-secondary furniture-item-remove" data-remove-item>Entfernen</button>
			</div>
			<div class="calc-grid">
				<div class="field field-full">
					<label for="furnitureItemName_${index}">Was ist das für ein Möbelstück?</label>
					<input id="furnitureItemName_${index}" name="furnitureItemName_${index}" type="text" placeholder="z.B. Kleiderschrank, Kommode, Regal">
				</div>
				<div class="field">
					<label for="furnitureItemLength_${index}">Länge (m)</label>
					<input id="furnitureItemLength_${index}" name="furnitureItemLength_${index}" type="number" min="0" step="0.01" placeholder="z.B. 1.80">
				</div>
				<div class="field">
					<label for="furnitureItemHeight_${index}">Höhe (m)</label>
					<input id="furnitureItemHeight_${index}" name="furnitureItemHeight_${index}" type="number" min="0" step="0.01" placeholder="z.B. 2.10">
				</div>
			</div>
		</div>
	`;
}

/**
 * Builds a furniture assembly item card template.
 * @param {number} index - Zero-based item index.
 * @returns {string} HTML template.
 */
function getFurnitureAssemblyItemCardTemplate(index) {
	return `
		<div class="furniture-item-card" data-item-index="${index}">
			<div class="furniture-item-card__head">
				<strong>Möbelstück ${index + 1}</strong>
				<button type="button" class="btn-secondary furniture-item-remove" data-remove-item>Entfernen</button>
			</div>
			<div class="calc-grid">
				<div class="field field-full">
					<label for="furnitureItemName_${index}">Was ist das für ein Möbelstück?</label>
					<input id="furnitureItemName_${index}" name="furnitureItemName_${index}" type="text" placeholder="z.B. Kleiderschrank, Kommode, Regal">
				</div>
				<div class="field">
					<label for="furnitureItemLength_${index}">Länge (m)</label>
					<input id="furnitureItemLength_${index}" name="furnitureItemLength_${index}" type="number" min="0" step="0.01" placeholder="z.B. 1.80">
				</div>
				<div class="field">
					<label for="furnitureItemHeight_${index}">Höhe (m)</label>
					<input id="furnitureItemHeight_${index}" name="furnitureItemHeight_${index}" type="number" min="0" step="0.01" placeholder="z.B. 2.10">
				</div>
				${getFurnitureAddonControls(index)}
			</div>
		</div>
	`;
}

/**
 * Builds a small transport item card template.
 * @param {number} index - Zero-based item index.
 * @returns {string} HTML template.
 */
function getTransportItemCardTemplate(index) {
	return `
		<div class="furniture-item-card" data-item-index="${index}">
			<div class="furniture-item-card__head">
				<strong>Position ${index + 1}</strong>
				<button type="button" class="btn-secondary furniture-item-remove" data-remove-item>Entfernen</button>
			</div>
			<div class="calc-grid">
				<div class="field field-full">
					<label for="transportItemName_${index}">Was soll transportiert werden?</label>
					<input id="transportItemName_${index}" name="transportItemName_${index}" type="text" placeholder="z.B. Schrank, Waschmaschine, Kartons">
				</div>
				<div class="field">
					<label for="transportItemLength_${index}">Länge (m)</label>
					<input id="transportItemLength_${index}" name="transportItemLength_${index}" type="number" min="0" step="0.01" placeholder="z.B. 1.20">
				</div>
				<div class="field">
					<label for="transportItemWidth_${index}">Breite (m)</label>
					<input id="transportItemWidth_${index}" name="transportItemWidth_${index}" type="number" min="0" step="0.01" placeholder="z.B. 0.60">
				</div>
				<div class="field">
					<label for="transportItemHeight_${index}">Höhe (m)</label>
					<input id="transportItemHeight_${index}" name="transportItemHeight_${index}" type="number" min="0" step="0.01" placeholder="z.B. 0.80">
				</div>
				<div class="field field-full">
					<label for="transportAssemblyNeed_${index}">Abbauen / Aufbauen benötigt?</label>
					<select id="transportAssemblyNeed_${index}" name="transportAssemblyNeed_${index}">
						<option value="">Bitte wählen…</option>
						<option value="none">Nicht nötig</option>
						<option value="dismantle">Nur abbauen</option>
						<option value="assemble">Nur aufbauen</option>
						<option value="both">Abbauen und aufbauen</option>
					</select>
				</div>
				${getTransportAssemblyAddonControls(index)}
			</div>
		</div>
	`;
}

/**
 * Builds the loading indicator template.
 * @returns {string} HTML template.
 */
function getLoadingTemplate() {
	return `
		<div id="loading-indicator" class="loading-indicator">
			<div class="spinner"></div>
			<p>Berechnung läuft...</p>
		</div>
	`;
}

/**
 * Builds a basic numeric result template.
 * @param {number|string} price - Price value to display.
 * @returns {string} HTML template.
 */
function getResultTemplate(price) {
	return `
		<div id="result-display" class="result-display">
			<div class="result-card">
				<h2>Berechneter Preis</h2>
				<div class="price-display">${price} €</div>
				<button class="btn-main" type="button" data-offer-request-result="true">Angebot anfordern</button>
				<button class="btn-secondary" onclick="location.reload()">Neue Berechnung</button>
			</div>
		</div>
	`;
}

/**
 * Builds an error display template.
 * @param {string} message - Error message.
 * @returns {string} HTML template.
 */
function getErrorTemplate(message) {
	return `
		<div id="error-display" class="error-display">
			<div class="error-card">
				<h2>Fehler</h2>
				<p>${message}</p>
				<button class="btn-main" onclick="location.reload()">Erneut versuchen</button>
			</div>
		</div>
	`;
}

/**
 * Builds the request-sent confirmation template.
 * @param {Object} [data={}] - Submitted request data.
 * @returns {string} HTML template.
 */
function getRequestSentTemplate(data = {}) {
	return `
		<div id="result-display" class="result-display">
			<div class="result-card">
				<p class="result-eyebrow">Anfrage</p>
				<h2>${data.serviceLabel || 'Anfrage'} wurde gesendet</h2>
				<p class="result-note">Vielen Dank. Ihre Angaben wurden erfolgreich übermittelt.</p>
				<button class="btn-secondary" onclick="location.reload()">Neue Anfrage</button>
			</div>
		</div>
	`;
}

/**
 * Builds the contact form used after a calculation result.
 * @returns {string} HTML template.
 */
function getOfferRequestTemplate() {
	return `
		<div id="offer-request-block" class="result-display">
			<form id="offerRequestForm" class="calc-card">
				<h2>Angebot anfordern</h2>
				<p>Bitte hinterlassen Sie Ihre Kontaktdaten für ein persönliches Angebot.</p>

				<div class="calc-grid">
					<div class="field">
						<label for="offerFirstName">Vorname</label>
						<input id="offerFirstName" name="offerFirstName" type="text" required>
					</div>

					<div class="field">
						<label for="offerLastName">Nachname</label>
						<input id="offerLastName" name="offerLastName" type="text" required>
					</div>

					<div class="field">
						<label for="offerPhone">Telefon (optional)</label>
						<input id="offerPhone" name="offerPhone" type="tel">
					</div>

					<div class="field">
						<label for="offerEmail">E-Mail-Adresse</label>
						<input id="offerEmail" name="offerEmail" type="email" required>
					</div>

					<div class="field field-full">
						<label for="offerAddressAutocomplete">Adresse</label>
						<div id="offerAddressAutocomplete" class="autocomplete-container"></div>
					</div>
				</div>

				<div class="calc-actions">
					<button class="btn-main" type="submit">Angebot anfordern</button>
				</div>
			</form>
		</div>
	`;
}


/**
 * Builds one service card template for category pages.
 * @param {Object} service - Service card data.
 * @returns {string} HTML template.
 */
function getServiceCardTemplate(service) {
    const appointmentClass = ['Möbelanfertigung', 'Küchenanfertigung'].includes(service.label)
        ? ' service-card--appointment'
        : '';
    const offerOnlyClass = [
        'Möbelentsorgung',
        'Kleintransporte',
        'Fugenreinigung',
        'Heckenschnitt',
        'Rasenmähen',
        'Rollrasenverlegung',
        'Wurzelentfernung',
        'Pflasterarbeiten',
        'Minibaggerarbeiten',
        'Gartenhausmontage',
        'Gartenhaus-Renovierung',
        'Heckenentfernung',
        'Baumfällung (kleine Bäume)',
        'Strauchschnitt',
        'Grünschnittentsorgung',
        'Überdachungsmontage',
        'Holzhäckselarbeiten'
    ].includes(service.label) && !appointmentClass
        ? ' service-card--offer-only'
        : '';

    return `
        <a class="service-card${appointmentClass}${offerOnlyClass}" href="${service.href}" aria-label="${service.label}">
            <div class="service-card-bg" style="background-image: url('${service.img}');"></div>

            <div class="service-card-copy">
                <div class="service-card-title">${service.label}</div>
                <p class="service-card-desc">${service.desc || ''}</p>
            </div>

            <div class="service-card-arrow">
                <svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M6 14L14 6" stroke="white" stroke-width="2" stroke-linecap="round"/>
                    <path d="M7.5 6H14V12.5" stroke="white" stroke-width="2" stroke-linecap="round"/>
                </svg>
            </div>
        </a>
    `;
}

const SERVICE_CATEGORY_META = {
    kitchen: {
        title: 'Küchenservice',
        description: 'Abbau, Aufbau, Anpassung und Transport Ihrer Küche — sauber, termingerecht und aus einer Hand.',
        image: 'img/Gemini_Generated_Image_h4nkhh4nkhh4nkhh.png',
        allHref: 'calculate.html'
    },
    furniture: {
        title: 'Möbelservice',
        description: 'Montage, Demontage, Transport und Entsorgung von Möbeln für Wohnung, Haus und Büro.',
        image: 'img/Gemini_Generated_Image_h4nkhh4nkhh4nkhh.png',
        allHref: 'calculate.html'
    },
    trades: {
        title: 'Handwerker',
        description: 'Zuverlässige Hilfe bei Montage-, Reparatur- und Ausbauarbeiten für innen und außen.',
        image: 'img/Gemini_Generated_Image_h4nkhh4nkhh4nkhh.png',
        allHref: 'calculate.html'
    },
    garden: {
        title: 'Gartenservice',
        description: 'Pflege, Rückschnitt, Pflasterarbeiten und saisonale Gartenprojekte aus einer Hand.',
        image: 'img/Gemini_Generated_Image_h4nkhh4nkhh4nkhh.png',
        allHref: 'calculate.html'
    }
};

const SERVICES_BY_CATEGORY = {
    kitchen: [
        { label: 'Küchentransport', href: 'calculate.html', img: 'img/services/kuechenservice/kuechetransport.png', desc: 'Transport optional mit Abbau & Aufbau' },
        { label: 'Küchenmontage', href: 'calculate.html', img: 'img/services/kuechenservice/kuechenaufbau.png', desc: 'Montage inkl. Ausrichtung' },
        { label: 'Küchenanpassung', href: 'calculate.html', img: 'img/services/kuechenservice/kuechenanpassung.png', desc: 'Ausschnitte, Anschlüsse & Feinschliff' },
        { label: 'Küchendemontage', href: 'calculate.html', img: 'img/services/kuechenservice/kuechenabbau.png', desc: 'Fachgerechter Rückbau vor Ort' },
        { label: 'Küchenanfertigung', href: 'calculate.html', img: 'img/services/kuechenservice/kuechenanfertigung.png', desc: 'Beliebige Maße und Größen nach Wunsch' }
    ],
    furniture: [
        { label: 'Möbelmontage', href: 'calculate.html', img: 'img/services/moebelservice/moebelaufbauen.png', desc: 'Schränke, Betten und Regale' },
        { label: 'Möbelentsorgung', href: 'calculate.html', img: 'img/services/moebelservice/moebelentsorgen.png', desc: 'Abholung inkl. fachgerechter Entsorgung' },
        { label: 'Umzugshilfe', href: 'calculate.html', img: 'img/services/moebelservice/umzugshelfer.png', desc: 'Tragen, Laden und Positionieren' },
        { label: 'Kleintransporte', href: 'calculate.html', img: 'img/services/moebelservice/kleintransporte.png', desc: 'Flexible Transporte nach Bedarf' },
        { label: 'Möbelanfertigung', href: 'calculate.html', img: 'img/services/moebelservice/moebelanfertigung.png', desc: 'Beliebige Maße und Größen nach Wunsch' }
    ],
    trades: [
        { label: 'Feinputz / Fertigbeschichtung', href: 'calculate.html', img: 'img/services/handwerker/feinputz.png', desc: 'Saubere Endschicht in passender Qualitätsstufe' },
        { label: 'Wandverputz', href: 'calculate.html', img: 'img/services/handwerker/waendeverputzen.png', desc: 'Grobeschicht oder lotgerechte Ausführung' },
        { label: 'Trockenbau', href: 'calculate.html', img: 'img/services/handwerker/trockenbau.png', desc: 'Ausbau mit Trockenbau-Systemen' },
        { label: 'Fugenreinigung', href: 'calculate.html', img: 'img/services/handwerker/fugenreinigung.png', desc: 'Saubere Flächen und klare Kanten' }
    ],
    garden: [
        { label: 'Heckenschnitt', href: 'calculate.html', img: 'img/services/gartenservice/heckenschneiden.png', desc: 'Heckenpflege & Formschnitt' },
        { label: 'Rasenmähen', href: 'calculate.html', img: 'img/services/gartenservice/rasenmaehen.png', desc: 'Regelmäßiger Schnitt & Pflege' },
        { label: 'Rollrasenverlegung', href: 'calculate.html', img: 'img/services/gartenservice/rollrasenverlegen.png', desc: 'Fertigrasen ohne Bodenvorbereitung' },
        { label: 'Wurzelentfernung', href: 'calculate.html', img: 'img/services/gartenservice/wurzelnentfernen.png', desc: 'Entfernung alter Wurzelstöcke' },
        { label: 'Pflasterarbeiten', href: 'calculate.html', img: 'img/services/gartenservice/pflastern.png', desc: 'Wege, Terrassen und Einfahrten' },
        { label: 'Zaunmontage', href: 'calculate.html', img: 'img/services/gartenservice/zaeuneaufbauen.png', desc: 'Montage für Garten und Grundstück' },
        { label: 'Minibaggerarbeiten', href: 'calculate.html', img: 'img/services/gartenservice/minibaggerarbeiten.png', desc: 'Kleine Erdarbeiten & Aushub' },
        { label: 'Gartenhausmontage', href: 'calculate.html', img: 'img/services/gartenservice/gartenhuettenaufbauen.png', desc: 'Aufbau inkl. Bodenvorbereitung optional' },
        { label: 'Gartenhaus-Renovierung', href: 'calculate.html', img: 'img/services/gartenservice/gartenhuettenaufbauen.png', desc: 'Vorbereitung und Schutzanstrich im Gartenbereich' },
        { label: 'Heckenentfernung', href: 'calculate.html', img: 'img/services/gartenservice/heckenentfernen.png', desc: 'Rückbau inkl. Schnittgut' },
        { label: 'Baumfällung (kleine Bäume)', href: 'calculate.html', img: 'img/services/gartenservice/kleinebaeumefaellen.png', desc: 'Sicher und sauber durchgeführt' },
        { label: 'Strauchschnitt', href: 'calculate.html', img: 'img/services/gartenservice/straeucherschneiden.png', desc: 'Pflegeschnitt nach Saison' },
        { label: 'Grünschnittentsorgung', href: 'calculate.html', img: 'img/services/gartenservice/entsorgungvongruenschnitt.png', desc: 'Abtransport und Entsorgung' },
        { label: 'Überdachungsmontage', href: 'calculate.html', img: 'img/services/gartenservice/ueberdachung.png', desc: 'Montage für Terrasse und Garten' },
        { label: 'Holzhäckselarbeiten', href: 'calculate.html', img: 'img/services/gartenservice/holzhaecksler.png', desc: 'Zerkleinern von Astwerk' }
    ]
};

/**
 * Tracks whether the services bottom CTA click handler has already been bound.
 * @type {boolean}
 */
let servicesBottomCtaHandler = false;

/**
 * Renders service cards for the selected category.
 * @param {string} [categoryKey='garden'] - Service category key.
 * @returns {void}
 */
function renderServices(categoryKey = 'garden') {
	const servicesBottomCta = document.getElementById('services-bottom-cta');
    const showcase = document.getElementById('services-list');
    if (!showcase) return;
	if (servicesBottomCta) servicesBottomCta.innerHTML = '';

    const services = SERVICES_BY_CATEGORY[categoryKey] || [];
    const cards = services.slice(0, 6).map(getServiceCardTemplate).join('');

    showcase.innerHTML = cards;

	if (servicesBottomCta && services.length > 6) {
		servicesBottomCta.innerHTML = getServicesBottomCtaTemplate();
		const servicesBottomCtaButton = servicesBottomCta;
		if(servicesBottomCtaHandler == false){
			servicesBottomCtaButton.addEventListener('click', () => loadMoreServices(categoryKey)); 
			servicesBottomCtaHandler = true;}
	}
}


/**
 * Reveals additional hidden service cards for a category.
 * @param {string} categoryKey - Service category key.
 * @returns {void}
 */
function loadMoreServices(categoryKey) {
	const showcase = document.getElementById('services-list');
	if (!showcase) return;
    const services = SERVICES_BY_CATEGORY[categoryKey] || [];
    const cards = services.slice(6).map(getServiceCardTemplate).join('');
    showcase.innerHTML += cards;
	const servicesBottomCta = document.getElementById('services-bottom-cta');
	if (servicesBottomCta) servicesBottomCta.innerHTML = '';
	const servicesBottomCtaButton = document.getElementById('services-bottom-cta');
	if (servicesBottomCtaButton) servicesBottomCtaButton.removeEventListener('click', loadMoreServices);
}

/**
 * Builds the bottom call-to-action template for services pages.
 * @returns {string} HTML template.
 */
function getServicesBottomCtaTemplate() {
	return `<div class="services-bottom-cta">
    <div class="services-bottom-cta__text">
        Alle Leistungen dieser Kategorie entdecken
    </div>

    <button class="services-bottom-cta__button" id="servicesBottomCtaButton">
        <span>Alle Leistungen ansehen</span>
        <span class="services-bottom-cta__arrow">›</span>
    </button>
</div>`;
}

document.addEventListener('DOMContentLoaded', () => {
    const buttons = document.querySelectorAll('.services-nav-item');
    const activeButton = document.querySelector('.services-nav-item.is-active');
    const initialCategory = activeButton?.dataset.category || 'garden';

    renderServices(initialCategory);

    buttons.forEach((button) => {
        button.addEventListener('click', () => {
            buttons.forEach((btn) => btn.classList.remove('is-active'));
            button.classList.add('is-active');
            renderServices(button.dataset.category);
        });
    });
});

/**
 * Renders a kitchen form directly into the calculator layout.
 * @param {string} kitchenType - Kitchen type key.
 * @returns {HTMLFormElement} Rendered form element.
 */
function renderForm(kitchenType) {
    const formContainer = document.querySelector('.calc-layout .calc-main') || document.querySelector('.calc-layout');
    const oldForm = document.getElementById('calcForm');

    // Altes Formular entfernen, falls vorhanden
    if (oldForm) {
        oldForm.remove();
    }

    // Neues Formular erstellen
    const formHTML = kitchenType === 'new' ? getNewKitchenForm() : getUsedKitchenForm();
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = formHTML;
    const newForm = tempDiv.querySelector('form');

    formContainer.appendChild(newForm);

    // Referenz auf das neue Formular zurueckgeben
    return newForm;
}
