function formatEuro(value) {
	const amount = Number(value || 0);
	return `${amount.toLocaleString('de-DE', {
		minimumFractionDigits: 0,
		maximumFractionDigits: 2
	})} €`;
}

function getKitchenConditionLabel(condition) {
	const labels = {
		new: 'Neue Küche',
		used: 'Bestehende Küche'
	};

	return labels[condition] || 'Küchenservice';
}

function getKitchenResultTitle(data) {
	if (data?.serviceLabel) return data.serviceLabel;
	return getKitchenConditionLabel(data?.condition);
}

function getKitchenTypeLabel(kitchenType) {
	const labels = {
		'zeile': 'I-Form',
		'l-form': 'L-Form',
		'u-form': 'U-Form'
	};

	return labels[kitchenType] || 'Nicht angegeben';
}

function getYesNoLabel(value) {
	if (value === true || value === 'true' || value === 'yes') return 'Ja';
	if (value === false || value === 'false' || value === 'no') return 'Nein';
	return 'Nicht angegeben';
}

function getKitchenResultTemplate(data) {
	const prices = data?.prices || {};
	const totalPrice = prices.totalPrice || 0;
	const priceRows = [
		['Montage / Aufbau', prices.assemblyPrice],
		['Abbau', prices.disassemblyPrice],
		['Transport', prices.transportPrice]
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

function getFurnitureResultTemplate(data) {
	const prices = data?.prices || {};
	const totalPrice = prices.totalPrice || 0;
	const items = Array.isArray(prices.items) ? prices.items : [];

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
				</div>

				<p class="result-note">Der Preis ist eine erste Einschätzung. Das finale Angebot kann je nach Aufwand vor Ort abweichen.</p>
				<button class="btn-main" type="button" data-offer-request-result="true">Angebot anfordern</button>
				<button class="btn-secondary" onclick="location.reload()">Neue Berechnung</button>
			</div>
		</div>
	`;
}

function getServiceResultTemplate(data) {
	const prices = data?.prices || {};
	const totalPrice = prices.totalPrice || 0;
	const items = Array.isArray(prices.items) ? prices.items : [];

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
				</div>

				<p class="result-note">Der Preis ist eine erste Einschätzung. Das finale Angebot kann je nach Aufwand vor Ort abweichen.</p>
				<button class="btn-main" type="button" data-offer-request-result="true">Angebot anfordern</button>
				<button class="btn-secondary" onclick="location.reload()">Neue Berechnung</button>
			</div>
		</div>
	`;
}
// Шаблоны форм для новой и старой кухни

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
					<label for="appliances">Elektrogeräte</label>
					<select id="appliances" name="appliances">
						<option value="">Bitte wählen…</option>
						<option value="none">Ohne Geräte</option>
						<option value="some">Teilweise</option>
						<option value="full">Komplett (Herd, Ofen, Spülmaschine, etc.)</option>
					</select>
				</div>

				<div class="field">
					<label for="lowerCabinets">Anzahl der Unterschränke</label>
					<input id="lowerCabinets" name="lowerCabinets" type="number" min="0" placeholder="z.B. 6">
				</div>

                
				<div class="field">
                <label for="worktopMaterial">Arbeitsplatte anpassen?</label>
                <select id="worktopMaterial" name="worktopMaterial">
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
					<label for="dismantling">Alte Küche abbauen?</label>
					<select id="dismantling" name="dismantling">
						<option value="">Bitte wählen…</option>
						<option value="yes">Ja - Kompletter Abbau</option>
						<option value="no">Nein - In-Ort bereits abgebaut</option>
					</select>
				</div>

				<div class="field">
					<label for="worktopAdjust">Arbeitsplatte anpassen?</label>
					<select id="worktopAdjust" name="worktopAdjust">
						<option value="">Bitte wählen…</option>
						<option value="yes">Ja</option>
						<option value="no">Nein</option>
					</select>
				</div>

				<div class="field">
					<label for="appliances">Neue Elektrogeräte installieren?</label>
					<select id="appliances" name="appliances">
						<option value="">Bitte wählen…</option>
						<option value="none">Nein</option>
						<option value="some">Teilweise</option>
						<option value="full">Ja - Komplett (Herd, Ofen, Spülmaschine, etc.)</option>
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

function getKitchenDismantlingForm() {
	return `
		<form class="calc-card" id="calcForm">
			<h2>Küche abbauen</h2>
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

function getSmallItemsTransportForm() {
	return `
		<form class="calc-card" id="calcForm">
			<h2>Transport von kleinen Sachen</h2>
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
						<p>Bei mehr als 3 Positionen wählen Sie bitte die Leistung Umzugshelfer.</p>
						<button class="btn-secondary" type="button" data-switch-service="Umzugshelfer">Zu Umzugshelfer wechseln</button>
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

function getMovingHelpersEstimateForm() {
	return `
		<form class="calc-card" id="calcForm">
			<h2>Umzugshelfer</h2>
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

function getKitchenAdjustmentEstimateForm() {
	// Gleiche Eingaben/Logik wie beim Küchenaufbau (Preiseinschätzung).
	return getNewKitchenForm();
}

function getFurnitureDisposalForm() {
	return `
		<form class="calc-card" id="calcForm">
			<h2>Möbel entsorgen</h2>
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

function getFurnitureAssemblyForm() {
	return `
		<form class="calc-card" id="calcForm">
			<h2>Möbel aufbauen</h2>
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

function getGardenHutSandingPaintingForm() {
	return `
		<form class="calc-card" id="calcForm">
			<h2>Gartenhütten schleifen / streichen</h2>
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

function getGardenHutAssemblyForm() {
	return `
		<form class="calc-card" id="calcForm">
			<h2>Gartenhütten aufbauen</h2>
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

function getHedgeTrimmingForm() {
	return `
		<form class="calc-card" id="calcForm">
			<h2>Hecken schneiden</h2>
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

function getHedgeRemovalForm() {
	return `
		<form class="calc-card" id="calcForm">
			<h2>Hecken entfernen</h2>
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

function getRootRemovalForm() {
	return `
		<form class="calc-card" id="calcForm">
			<h2>Wurzeln entfernen</h2>
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

function getSmallTreeFellingForm() {
	return `
		<form class="calc-card" id="calcForm">
			<h2>Kleine Bäume fällen</h2>
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

function getLawnInstallationForm() {
	return `
		<form class="calc-card" id="calcForm">
			<h2 class="label-with-tooltip">
				Rollrasen verlegen
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

function getLawnMowingForm() {
	return `
		<form class="calc-card" id="calcForm">
			<h2>Rasen mähen</h2>
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

function getShrubTrimmingForm() {
	return `
		<form class="calc-card" id="calcForm">
			<h2>Sträucher schneiden (jede Art und Größe)</h2>
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

function getGreenWasteDisposalForm() {
	return `
		<form class="calc-card" id="calcForm">
			<h2>Entsorgung von Grünschnitt und Gartenabfällen</h2>
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

function getPavingForm() {
	return `
		<form class="calc-card" id="calcForm">
			<h2>Pflastern</h2>
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

function getFenceAssemblyForm() {
	return `
		<form class="calc-card" id="calcForm">
			<h2>Zäune aufbauen</h2>
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

function getCanopyForm() {
	return `
		<form class="calc-card" id="calcForm">
			<h2>Überdachungen</h2>
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

function getFinePlasterForm() {
	return `
		<form class="calc-card" id="calcForm">
			<h2>Feinputz / Fertigeschicht</h2>
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

function getWallPlasteringForm() {
	return `
		<form class="calc-card" id="calcForm">
			<h2>Wände Verputzen</h2>
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
						<option value="grobeschicht-frei-hand">Wände Verputzen / Grobeschicht (frei Hand, nicht lotgerecht)</option>
						<option value="lotgerecht-wasserwaage">Wände Verputzen (mit Wasserwaage, lotgerecht)</option>
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

function getDrywallForm() {
	return `
		<form class="calc-card" id="calcForm">
			<h2>Trockenbau (Rigipsausbau)</h2>
			<p>Bitte geben Sie Fläche und kurze Projektangaben an.</p>

			<div class="calc-grid">
				<div class="field">
					<label for="areaTotal">Quadratmeter (ca.)</label>
					<input id="areaTotal" name="areaTotal" type="number" min="0" step="0.1" placeholder="z.B. 30">
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

function getMiniExcavatorWorkForm() {
	return `
		<form class="calc-card" id="calcForm">
			<h2>Arbeiten mit Minibagger</h2>
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

function getWoodChipperForm() {
	return `
		<form class="calc-card" id="calcForm">
			<h2>Holzhäcksler</h2>
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

function getDirectTransportAddressForm() {
	return `
		<div class="transport-survey" id="directTransportSurvey">
			<div class="survey-card">
				<h2>Transportadresse</h2>
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

function getTransportAssemblyAddonControls(index) {
	return `
		<div class="transport-assembly-addons" data-transport-assembly-addons hidden>
			${getFurnitureAddonControls(index)}
		</div>
	`;
}

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

function getLoadingTemplate() {
	return `
		<div id="loading-indicator" class="loading-indicator">
			<div class="spinner"></div>
			<p>Berechnung läuft...</p>
		</div>
	`;
}

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

function getRequestSentTemplate(data = {}) {
	return `
		<div id="result-display" class="result-display">
			<div class="result-card">
				<p class="result-eyebrow">Anfrage</p>
				<h2>${data.serviceLabel || 'Anfrage'} wurde vorbereitet</h2>
				<p class="result-note">Vielen Dank. Ihre Angaben wurden aufgenommen.</p>
				<button class="btn-secondary" onclick="location.reload()">Neue Anfrage</button>
			</div>
		</div>
	`;
}

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


function getServiceCardTemplate(service) {
    const appointmentClass = ['Möbelanfertigung', 'Küchenanfertigung'].includes(service.label)
        ? ' service-card--appointment'
        : '';

    return `
        <a class="service-card${appointmentClass}" href="${service.href}" aria-label="${service.label}">
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
        { label: 'Küchentransport', href: 'calculate.html', img: 'img/services/kuechenservice/kuechetransport.png', desc: 'Sicherer Transport & Trageservice' },
        { label: 'Küche abbauen', href: 'calculate.html', img: 'img/services/kuechenservice/kuechenabbau.png', desc: 'Fachgerechter Rückbau vor Ort' },
        { label: 'Küche aufbauen', href: 'calculate.html', img: 'img/services/kuechenservice/kuechenaufbau.png', desc: 'Montage inkl. Ausrichtung' },
        { label: 'Küche anpassen', href: 'calculate.html', img: 'img/services/kuechenservice/kuechenanpassung.png', desc: 'Ausschnitte, Anschlüsse & Feinschliff' },
        { label: 'Küchenanfertigung', href: 'calculate.html', img: 'img/services/kuechenservice/kuechenanfertigung.png', desc: 'Beliebige Maße und Größen nach Wunsch' }
    ],
    furniture: [
        { label: 'Möbel aufbauen', href: 'calculate.html', img: 'img/services/moebelservice/moebelaufbauen.png', desc: 'Schränke, Betten und Regale' },
        { label: 'Möbel entsorgen', href: 'calculate.html', img: 'img/services/moebelservice/moebelentsorgen.png', desc: 'Abholung inkl. fachgerechter Entsorgung' },
        { label: 'Umzugshelfer', href: 'calculate.html', img: 'img/services/moebelservice/umzugshelfer.png', desc: 'Tragen, Laden und Positionieren' },
        { label: 'Kleintransporte', href: 'calculate.html', img: 'img/services/moebelservice/kleintransporte.png', desc: 'Flexible Transporte nach Bedarf' },
        { label: 'Möbelanfertigung', href: 'calculate.html', img: 'img/services/moebelservice/moebelanfertigung.png', desc: 'Beliebige Maße und Größen nach Wunsch' }
    ],
    trades: [
        { label: 'Feinputz', href: 'calculate.html', img: 'img/services/handwerker/feinputz.png', desc: 'Saubere Endschicht in passender Qualitätsstufe' },
        { label: 'Wände Verputzen', href: 'calculate.html', img: 'img/services/handwerker/waendeverputzen.png', desc: 'Grobeschicht oder lotgerechte Ausführung' },
        { label: 'Trockenbau (Rigipsausbau)', href: 'calculate.html', img: 'img/services/handwerker/trockenbau.png', desc: 'Ausbau mit Trockenbau-Systemen' },
        { label: 'Fugenreinigung', href: 'calculate.html', img: 'img/services/handwerker/fugenreinigung.png', desc: 'Saubere Flächen und klare Kanten' }
    ],
    garden: [
        { label: 'Hecken schneiden', href: 'calculate.html', img: 'img/services/gartenservice/heckenschneiden.png', desc: 'Heckenpflege & Formschnitt' },
        { label: 'Rasen mähen', href: 'calculate.html', img: 'img/services/gartenservice/rasenmaehen.png', desc: 'Regelmäßiger Schnitt & Pflege' },
        { label: 'Rollrasen verlegen', href: 'calculate.html', img: 'img/services/gartenservice/rollrasenverlegen.png', desc: 'Fertigrasen ohne Bodenvorbereitung' },
        { label: 'Wurzeln entfernen', href: 'calculate.html', img: 'img/services/gartenservice/wurzelnentfernen.png', desc: 'Entfernung alter Wurzelstöcke' },
        { label: 'Pflastern', href: 'calculate.html', img: 'img/services/gartenservice/pflastern.png', desc: 'Wege, Terrassen und Einfahrten' },
        { label: 'Zäune aufbauen', href: 'calculate.html', img: 'img/services/gartenservice/zaeuneaufbauen.png', desc: 'Montage für Garten und Grundstück' },
        { label: 'Minibagger-Arbeiten', href: 'calculate.html', img: 'img/services/gartenservice/minibaggerarbeiten.png', desc: 'Kleine Erdarbeiten & Aushub' },
        { label: 'Gartenhütten aufbauen', href: 'calculate.html', img: 'img/services/gartenservice/gartenhuettenaufbauen.png', desc: 'Aufbau inkl. Bodenvorbereitung optional' },
        { label: 'Gartenhütten schleifen/streichen', href: 'calculate.html', img: 'img/services/gartenservice/gartenhuettenaufbauen.png', desc: 'Vorbereitung und Schutzanstrich im Gartenbereich' },
        { label: 'Hecken entfernen', href: 'calculate.html', img: 'img/services/gartenservice/heckenentfernen.png', desc: 'Rückbau inkl. Schnittgut' },
        { label: 'Kleine Bäume fällen', href: 'calculate.html', img: 'img/services/gartenservice/kleinebaeumefaellen.png', desc: 'Sicher und sauber durchgeführt' },
        { label: 'Sträucher schneiden', href: 'calculate.html', img: 'img/services/gartenservice/straeucherschneiden.png', desc: 'Pflegeschnitt nach Saison' },
        { label: 'Entsorgung von Grünschnitt', href: 'calculate.html', img: 'img/services/gartenservice/entsorgungvongruenschnitt.png', desc: 'Abtransport und Entsorgung' },
        { label: 'Überdachung', href: 'calculate.html', img: 'img/services/gartenservice/ueberdachung.png', desc: 'Montage für Terrasse und Garten' },
        { label: 'Holzhäcksler', href: 'calculate.html', img: 'img/services/gartenservice/holzhaecksler.png', desc: 'Zerkleinern von Astwerk' }
    ]
};

let servicesBottomCtaHandler = false;

function renderServices(categoryKey = 'garden') {
	const servicesBottomCta = document.getElementById('services-bottom-cta');
	servicesBottomCta.innerHTML = '';
    const showcase = document.getElementById('services-list');
    if (!showcase) return;

    const services = SERVICES_BY_CATEGORY[categoryKey] || [];
    const cards = services.slice(0, 6).map(getServiceCardTemplate).join('');

    showcase.innerHTML = cards;

	if (services.length > 6) {
		document.getElementById('services-bottom-cta').innerHTML = getServicesBottomCtaTemplate();
		const servicesBottomCtaButton = document.getElementById('services-bottom-cta');
		if(servicesBottomCtaHandler == false){
			servicesBottomCtaButton.addEventListener('click', () => loadMoreServices(categoryKey)); 
			servicesBottomCtaHandler = true;}
	}
}


function loadMoreServices(categoryKey) {
	const showcase = document.getElementById('services-list');
	if (!showcase) return;
    const services = SERVICES_BY_CATEGORY[categoryKey] || [];
    const cards = services.slice(6).map(getServiceCardTemplate).join('');
    showcase.innerHTML += cards;
	document.getElementById('services-bottom-cta').innerHTML = '';
	const servicesBottomCtaButton = document.getElementById('services-bottom-cta');
	servicesBottomCtaButton.removeEventListener('click', loadMoreServices);
}

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

function renderForm(kitchenType) {
    const formContainer = document.querySelector('.calc-layout .calc-main') || document.querySelector('.calc-layout');
    const oldForm = document.getElementById('calcForm');

    // Удалить старую форму если она есть
    if (oldForm) {
        oldForm.remove();
    }

    // Создать новую форму
    const formHTML = kitchenType === 'new' ? getNewKitchenForm() : getUsedKitchenForm();
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = formHTML;
    const newForm = tempDiv.querySelector('form');

    formContainer.appendChild(newForm);

    // Вернуть ссылку на новую форму
    return newForm;
}
