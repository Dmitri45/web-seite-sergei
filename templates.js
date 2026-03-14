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

					<div class="field">
						<label>Nach (Adresse)</label>
						<div id="transportToAutocomplete" class="autocomplete-container"></div>
					</div>
				</div>

				<button id="btn-main" class="btn-main" style="display: none; margin-top: 20px;">Preis berechnen</button>
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


function getServiceCardTemplate(label, href, imgSrc) {
	return `
		<a class="service-card" href="${href}" aria-label="${label}">
			<img src="${imgSrc}" alt="${label}">
			<div class="service-card-label">${label}</div>
		</a>
	`;
}

const SERVICES_BY_CATEGORY = {
	kitchen: [
		{ label: 'Küchentransport',  href: 'calculate.html', img: '/img/Gemini_Generated_Image_h4nkhh4nkhh4nkhh.png' },
		{ label: 'Küche abbauen',    href: 'calculate.html', img: '/img/Gemini_Generated_Image_h4nkhh4nkhh4nkhh.png' },
		{ label: 'Küche aufbauen',   href: 'calculate.html', img: '/img/Gemini_Generated_Image_h4nkhh4nkhh4nkhh.png' },
		{ label: 'Küche anpassen',   href: 'calculate.html', img: '/img/Gemini_Generated_Image_h4nkhh4nkhh4nkhh.png' },
	],
	furniture: [
		{ label: 'Möbel aufbauen',               href: 'calculate.html', img: '/img/Gemini_Generated_Image_h4nkhh4nkhh4nkhh.png' },
		{ label: 'Möbel entsorgen',              href: 'calculate.html', img: '/img/Gemini_Generated_Image_h4nkhh4nkhh4nkhh.png' },
		{ label: 'Umzugshelfer',                 href: 'calculate.html', img: '/img/Gemini_Generated_Image_h4nkhh4nkhh4nkhh.png' },
		{ label: 'Transport von kleinen Sachen', href: 'calculate.html', img: '/img/Gemini_Generated_Image_h4nkhh4nkhh4nkhh.png' },
	],
	trades: [
		{ label: 'Zäune aufbauen', href: 'calculate.html', img: '/img/Gemini_Generated_Image_h4nkhh4nkhh4nkhh.png' },
		{ label: 'Fugenreinigung', href: 'calculate.html', img: '/img/Gemini_Generated_Image_h4nkhh4nkhh4nkhh.png' },
	],
	garden: [
		{ label: 'Gartenhütten schleifen/streichen',        href: 'calculate.html', img: '/img/Gemini_Generated_Image_h4nkhh4nkhh4nkhh.png' },
		{ label: 'Gartenhütten aufbauen',                   href: 'calculate.html', img: '/img/Gemini_Generated_Image_h4nkhh4nkhh4nkhh.png' },
		{ label: 'Hecken schneiden',                        href: 'calculate.html', img: '/img/Gemini_Generated_Image_h4nkhh4nkhh4nkhh.png' },
		{ label: 'Hecken entfernen',                        href: 'calculate.html', img: '/img/Gemini_Generated_Image_h4nkhh4nkhh4nkhh.png' },
		{ label: 'Wurzeln entfernen',                       href: 'calculate.html', img: '/img/Gemini_Generated_Image_h4nkhh4nkhh4nkhh.png' },
		{ label: 'Kleine Bäume fällen',                     href: 'calculate.html', img: '/img/Gemini_Generated_Image_h4nkhh4nkhh4nkhh.png' },
		{ label: 'Rollrasen inkl. Bodenvorbereitung',        href: 'calculate.html', img: '/img/Gemini_Generated_Image_h4nkhh4nkhh4nkhh.png' },
		{ label: 'Rasen mähen',                             href: 'calculate.html', img: '/img/Gemini_Generated_Image_h4nkhh4nkhh4nkhh.png' },
		{ label: 'Sträucher schneiden',                     href: 'calculate.html', img: '/img/Gemini_Generated_Image_h4nkhh4nkhh4nkhh.png' },
		{ label: 'Entsorgung von Grünschnitt',              href: 'calculate.html', img: '/img/Gemini_Generated_Image_h4nkhh4nkhh4nkhh.png' },
		{ label: 'Pflastern',                               href: 'calculate.html', img: '/img/Gemini_Generated_Image_h4nkhh4nkhh4nkhh.png' },
		{ label: 'Überdachung',                             href: 'calculate.html', img: '/img/Gemini_Generated_Image_h4nkhh4nkhh4nkhh.png' },
		{ label: 'Arbeiten mit Minibagger',                 href: 'calculate.html', img: '/img/Gemini_Generated_Image_h4nkhh4nkhh4nkhh.png' },
		{ label: 'Holzhäcksler',                            href: 'calculate.html', img: '/img/Gemini_Generated_Image_h4nkhh4nkhh4nkhh.png' },
		{ label: 'Jegliche Gartenarbeiten',                 href: 'calculate.html', img: '/img/Gemini_Generated_Image_h4nkhh4nkhh4nkhh.png' },
	],
};

function renderForm(kitchenType) {
    const formContainer = document.querySelector('.calc-layout');
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
