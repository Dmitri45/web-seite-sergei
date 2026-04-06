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

function getSmallItemsTransportForm() {
	return `
		<form class="calc-card moving-helpers-form" id="calcForm">
			<h2>Transport von kleinen Sachen</h2>
			<p>Bitte geben Sie die wichtigsten Details für eine erste Kostenschätzung an.</p>

			<div class="calc-grid">
				<div class="field field-full">
					<label for="itemType">Was soll transportiert werden?</label>
					<select id="itemType" name="itemType">
						<option value="">Bitte wählen…</option>
						<option value="furniture">Möbel / Möbelstück</option>
						<option value="appliance">Elektrogerät / Gegenstand</option>
					</select>
				</div>

				<div class="field">
					<label for="itemLength">Länge (m)</label>
					<input id="itemLength" name="itemLength" type="number" min="0" step="0.01" placeholder="z.B. 1.20">
				</div>

				<div class="field">
					<label for="itemWidth">Breite (m)</label>
					<input id="itemWidth" name="itemWidth" type="number" min="0" step="0.01" placeholder="z.B. 0.60">
				</div>

				<div class="field">
					<label for="itemHeight">Höhe (m)</label>
					<input id="itemHeight" name="itemHeight" type="number" min="0" step="0.01" placeholder="z.B. 0.80">
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
				<button class="btn-secondary" type="button">Angebot anfragen</button>
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
					<div id="furnitureItemsList" class="furniture-items-list">
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
									<label for="furnitureItemWidth_0">Breite (m)</label>
									<input id="furnitureItemWidth_0" name="furnitureItemWidth_0" type="number" min="0" step="0.01" placeholder="z.B. 0.60">
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
					<div id="furnitureItemsList" class="furniture-items-list">
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
									<label for="furnitureItemWidth_0">Breite (m)</label>
									<input id="furnitureItemWidth_0" name="furnitureItemWidth_0" type="number" min="0" step="0.01" placeholder="z.B. 0.60">
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
			<p>Bitte geben Sie die Flächen- oder Maßangaben sowie gewünschte Leistungen an.</p>

			<div class="calc-grid">
				<div class="field">
					<label for="areaTotal">Quadratmeter gesamt (ca.)</label>
					<input id="areaTotal" name="areaTotal" type="number" min="0" step="0.1" placeholder="z.B. 24">
				</div>

				<div class="field">
					<label for="length">Länge (m)</label>
					<input id="length" name="length" type="number" min="0" step="0.01" placeholder="z.B. 4.00">
				</div>

				<div class="field">
					<label for="width">Breite (m)</label>
					<input id="width" name="width" type="number" min="0" step="0.01" placeholder="z.B. 3.00">
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
					<label for="currentLength">Aktuelle Länge (m)</label>
					<input id="currentLength" name="currentLength" type="number" min="0" step="0.01" placeholder="z.B. 12.00">
				</div>

				<div class="field">
					<label for="currentWidth">Aktuelle Breite (m)</label>
					<input id="currentWidth" name="currentWidth" type="number" min="0" step="0.01" placeholder="z.B. 1.20">
				</div>

				<div class="field">
					<label for="targetHeight">Gewünschte Höhe (m)</label>
					<input id="targetHeight" name="targetHeight" type="number" min="0" step="0.01" placeholder="z.B. 1.80">
				</div>

				<div class="field">
					<label for="targetWidth">Gewünschte Breite (m)</label>
					<input id="targetWidth" name="targetWidth" type="number" min="0" step="0.01" placeholder="z.B. 0.90">
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
					<label for="distanceToGarden">Falls mit Entsorgung: Wie nah kann man an Garten/Ort anfahren? (m)</label>
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
					<label for="distanceToGarden">Falls mit Entsorgung: Wie nah kann man an Garten/Ort anfahren? (m)</label>
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
					<label for="distanceToGarden">Falls mit Entsorgung: Wie nah kann man an Garten/Ort anfahren? (m)</label>
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
					<label for="distanceToGarden">Falls mit Entsorgung: Wie nah kann man an Garten/Ort anfahren? (m)</label>
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
			<h2>Rollrasen inkl. Bodenvorbereitung</h2>
			<p>Bitte geben Sie Flächen- oder Maßangaben sowie Zugangsdetails an.</p>

			<div class="calc-grid">
				<div class="field">
					<label for="areaTotal">Quadratmeter gesamt (ca.)</label>
					<input id="areaTotal" name="areaTotal" type="number" min="0" step="0.1" placeholder="z.B. 48">
				</div>

				<div class="field">
					<label for="length">Länge (m)</label>
					<input id="length" name="length" type="number" min="0" step="0.01" placeholder="z.B. 8.00">
				</div>

				<div class="field">
					<label for="width">Breite (m)</label>
					<input id="width" name="width" type="number" min="0" step="0.01" placeholder="z.B. 6.00">
				</div>

				<div class="field">
					<label for="heightCm">Höhe (cm)</label>
					<input id="heightCm" name="heightCm" type="number" min="0" step="1" placeholder="z.B. 10">
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
			<p>Bitte geben Sie Flächen- oder Maßangaben sowie Zugangsdetails an.</p>

			<div class="calc-grid">
				<div class="field">
					<label for="areaTotal">Quadratmeter gesamt (ca.)</label>
					<input id="areaTotal" name="areaTotal" type="number" min="0" step="0.1" placeholder="z.B. 80">
				</div>

				<div class="field">
					<label for="length">Länge (m)</label>
					<input id="length" name="length" type="number" min="0" step="0.01" placeholder="z.B. 10.00">
				</div>

				<div class="field">
					<label for="width">Breite (m)</label>
					<input id="width" name="width" type="number" min="0" step="0.01" placeholder="z.B. 8.00">
				</div>

				<div class="field">
					<label for="heightCm">Höhe (cm)</label>
					<input id="heightCm" name="heightCm" type="number" min="0" step="1" placeholder="z.B. 12">
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
			<p>Bitte geben Sie aktuelle Form/Maße, Zielzustand und Entsorgungsdetails an.</p>

			<div class="calc-grid">
				<div class="field">
					<label for="currentHeight">Aktuelle Höhe (m)</label>
					<input id="currentHeight" name="currentHeight" type="number" min="0" step="0.01" placeholder="z.B. 1.80">
				</div>

				<div class="field">
					<label for="currentLength">Aktuelle Länge (m)</label>
					<input id="currentLength" name="currentLength" type="number" min="0" step="0.01" placeholder="z.B. 3.00">
				</div>

				<div class="field">
					<label for="currentWidth">Aktuelle Breite (m)</label>
					<input id="currentWidth" name="currentWidth" type="number" min="0" step="0.01" placeholder="z.B. 1.20">
				</div>

				<div class="field field-full">
					<label for="currentShapeState">Aktueller Zustand (Maße oder in Form)</label>
					<select id="currentShapeState" name="currentShapeState">
						<option value="">Bitte wählen…</option>
						<option value="size-based">Nach Maßen</option>
						<option value="already-in-shape">Ist in Form</option>
					</select>
				</div>

				<div class="field">
					<label for="targetHeight">Gewünschte Höhe (m)</label>
					<input id="targetHeight" name="targetHeight" type="number" min="0" step="0.01" placeholder="z.B. 1.50">
				</div>

				<div class="field">
					<label for="targetWidth">Gewünschte Breite (m)</label>
					<input id="targetWidth" name="targetWidth" type="number" min="0" step="0.01" placeholder="z.B. 0.90">
				</div>

				<div class="field">
					<label for="targetShapeState">Gewünschter Zustand</label>
					<select id="targetShapeState" name="targetShapeState">
						<option value="">Bitte wählen…</option>
						<option value="size-based">Nach Maßen</option>
						<option value="in-shape">In Form schneiden</option>
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
					<label for="distanceToGarden">Falls mit Entsorgung: Distanz zum Garten/Ort (m)</label>
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
			<p>Bitte geben Sie Menge/Abmessungen und Zugangsdaten für die Entsorgung an.</p>

			<div class="calc-grid">
				<div class="field">
					<label for="estimatedVolume">Kubikmeter (geschätzt)</label>
					<input id="estimatedVolume" name="estimatedVolume" type="number" min="0" step="0.1" placeholder="z.B. 3.5">
				</div>

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
			<p>Bitte geben Sie Menge oder Astdaten sowie Zugangsinformationen an.</p>

			<div class="calc-grid">
				<div class="field">
					<label for="estimatedVolume">Kubikmeter (geschätzt)</label>
					<input id="estimatedVolume" name="estimatedVolume" type="number" min="0" step="0.1" placeholder="z.B. 2.5">
				</div>

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

				<div class="field field-full">
					<label for="address">Ort der Besichtigung</label>
					<input id="address" name="address" type="text" placeholder="Straße, Hausnummer, PLZ, Ort">
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

				<div class="field field-full">
					<label for="address">Ort der Besichtigung</label>
					<input id="address" name="address" type="text" placeholder="Straße, Hausnummer, PLZ, Ort">
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

function getIntermediateAddressTemplate(index) {
	return `
		<div class="field">
			<label>Zwischeziel ${index + 1}</label>
			<div id="transportViaAutocomplete-${index}" class="autocomplete-container"></div>
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
					<label for="furnitureItemWidth_${index}">Breite (m)</label>
					<input id="furnitureItemWidth_${index}" name="furnitureItemWidth_${index}" type="number" min="0" step="0.01" placeholder="z.B. 0.60">
				</div>
				<div class="field">
					<label for="furnitureItemHeight_${index}">Höhe (m)</label>
					<input id="furnitureItemHeight_${index}" name="furnitureItemHeight_${index}" type="number" min="0" step="0.01" placeholder="z.B. 2.10">
				</div>
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
				<button class="btn-main" onclick="location.reload()">Neue Berechnung</button>
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
        { label: 'Zäune aufbauen', href: 'calculate.html', img: 'img/services/tradeservice/zaeuneaufbauen.png', desc: 'Montage für Garten und Grundstück' },
        { label: 'Fugenreinigung', href: 'calculate.html', img: 'img/services/tradeservice/fugenreinigung.png', desc: 'Saubere Flächen und klare Kanten' }
    ],
    garden: [
        { label: 'Hecken schneiden', href: 'calculate.html', img: 'img/services/gartenservice/heckenschneiden.png', desc: 'Heckenpflege & Formschnitt' },
        { label: 'Rasen mähen', href: 'calculate.html', img: 'img/services/gartenservice/rasenmaehen.png', desc: 'Regelmäßiger Schnitt & Pflege' },
        { label: 'Rollrasen verlegen', href: 'calculate.html', img: 'img/services/gartenservice/rollrasenverlegen.png', desc: 'Fertigrasen inkl. Bodenvorbereitung' },
        { label: 'Wurzeln entfernen', href: 'calculate.html', img: 'img/services/gartenservice/wurzelnentfernen.png', desc: 'Entfernung alter Wurzelstöcke' },
        { label: 'Pflastern', href: 'calculate.html', img: 'img/services/gartenservice/pflastern.png', desc: 'Wege, Terrassen und Einfahrten' },
        { label: 'Minibagger-Arbeiten', href: 'calculate.html', img: 'img/services/gartenservice/minibaggerarbeiten.png', desc: 'Kleine Erdarbeiten & Aushub' },
        { label: 'Gartenhütten aufbauen', href: 'calculate.html', img: 'img/services/gartenservice/gartenhuettenaufbauen.png', desc: 'Montage im Gartenbereich' },
        { label: 'Hecken entfernen', href: 'calculate.html', img: 'img/services/gartenservice/heckenentfernen.png', desc: 'Rückbau inkl. Schnittgut' },
        { label: 'Kleine Bäume fällen', href: 'calculate.html', img: 'img/services/gartenservice/kleinebaeumefaellen.png', desc: 'Sicher und sauber durchgeführt' },
        { label: 'Sträucher schneiden', href: 'calculate.html', img: 'img/services/gartenservice/straeucherschneiden.png', desc: 'Pflegeschnitt nach Saison' },
        { label: 'Entsorgung von Grünschnitt', href: 'calculate.html', img: 'img/services/gartenservice/entsorgungvongruenschnitt.png', desc: 'Abtransport und Entsorgung' },
        { label: 'Überdachung', href: 'calculate.html', img: 'img/services/gartenservice/ueberdachung.png', desc: 'Montage für Terrasse und Garten' },
        { label: 'Holzhäcksler', href: 'calculate.html', img: 'img/services/gartenservice/holzhaecksler.png', desc: 'Zerkleinern von Astwerk' },
        { label: 'Jegliche Gartenarbeiten', href: 'calculate.html', img: 'img/services/gartenservice/jeglichegartenarbeiten.png', desc: 'Individuelle Einsätze nach Bedarf' }
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
