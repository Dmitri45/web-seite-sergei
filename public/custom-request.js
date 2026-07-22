/**
 * Adds a reusable custom service request form to service pages.
 */
(function() {
	const TARGET_BODY_CLASSES = [
		'page-kitchen',
		'page-furniture',
		'page-trades',
		'page-garden',
		'page-service-overview'
	];

	/**
	 * Checks whether the current page should show the custom request form.
	 * @returns {boolean} True when the form should be rendered.
	 */
	function shouldRenderForm() {
		return TARGET_BODY_CLASSES.some((className) => document.body.classList.contains(className));
	}

	/**
	 * Returns the custom request form markup.
	 * @returns {string} Form section HTML.
	 */
	function getFormTemplate() {
		return `
			<section class="custom-request" aria-labelledby="customRequestTitle">
				<div class="container">
					<div class="custom-request-card">
						<div class="custom-request-copy">
							<div class="section-eyebrow">Individuelle Anfrage</div>
							<h2 id="customRequestTitle">Nicht die passende Leistung gefunden?</h2>
							<p>Wir bieten auch weitere Arbeiten auf Anfrage an. Beschreiben Sie kurz Ihr Projekt, wir melden uns persönlich bei Ihnen.</p>
						</div>
						<form class="custom-request-form" data-custom-request-form>
							<div class="custom-request-grid">
								<div class="custom-request-field">
									<label for="customFirstName">Vorname</label>
									<input id="customFirstName" name="firstName" type="text" autocomplete="given-name" required>
								</div>
								<div class="custom-request-field">
									<label for="customLastName">Nachname</label>
									<input id="customLastName" name="lastName" type="text" autocomplete="family-name" required>
								</div>
								<div class="custom-request-field">
									<label for="customEmail">E-Mail</label>
									<input id="customEmail" name="email" type="email" autocomplete="email" required>
								</div>
								<div class="custom-request-field">
									<label for="customPhone">Handynummer</label>
									<input id="customPhone" name="phone" type="tel" autocomplete="tel" required>
								</div>
								<div class="custom-request-field custom-request-field--full">
									<label for="customMessage">Was möchten Sie anfragen?</label>
									<textarea id="customMessage" name="message" rows="5" placeholder="Beschreiben Sie kurz die gewünschte Leistung, den Ort und wichtige Details." required></textarea>
								</div>
							</div>
							<label class="custom-request-privacy" for="customPrivacyAccepted">
								<input id="customPrivacyAccepted" name="privacyPolicyAccepted" type="checkbox" required>
								<span>Ich habe die <a href="/datenschutzerklaerung" target="_blank" rel="noopener noreferrer">Datenschutzerklärung</a> gelesen und stimme der Verarbeitung meiner Angaben zur Bearbeitung der Anfrage zu.</span>
							</label>
							<div class="custom-request-actions">
								<button class="btn-main" type="submit" disabled>Anfrage senden</button>
								<p class="custom-request-status" aria-live="polite"></p>
							</div>
						</form>
					</div>
				</div>
			</section>
		`;
	}

	/**
	 * Builds the backend payload from form inputs and page context.
	 * @param {HTMLFormElement} form - Active custom request form.
	 * @returns {Object} Request payload.
	 */
	function buildPayload(form) {
		const data = Object.fromEntries(new FormData(form).entries());
		return {
			...data,
			privacyPolicyAccepted: form.elements.privacyPolicyAccepted.checked,
			pageTitle: document.title,
			pageUrl: window.location.href
		};
	}

	/**
	 * Sends the custom request payload to the backend.
	 * @param {Object} payload - Request data.
	 * @returns {Promise<Object>} Backend JSON response.
	 */
	async function sendCustomRequest(payload) {
		const response = await fetch('/api/custom-request/send', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(payload)
		});
		const result = await response.json().catch(() => ({}));

		if (!response.ok) {
			throw new Error(result.error || 'Die Anfrage konnte nicht gesendet werden.');
		}

		return result;
	}

	/**
	 * Binds validation and submit behavior to a rendered form.
	 * @param {HTMLElement} root - Rendered custom request section.
	 * @returns {void}
	 */
	function bindForm(root) {
		const form = root.querySelector('[data-custom-request-form]');
		const submitButton = form?.querySelector('button[type="submit"]');
		const privacy = form?.elements.privacyPolicyAccepted;
		const status = root.querySelector('.custom-request-status');
		if (!form || !submitButton || !privacy || !status) return;

		const syncSubmitState = () => {
			submitButton.disabled = !privacy.checked;
		};

		privacy.addEventListener('change', syncSubmitState);
		syncSubmitState();

		form.addEventListener('submit', async (event) => {
			event.preventDefault();
			if (!form.reportValidity()) return;

			submitButton.disabled = true;
			status.className = 'custom-request-status';
			status.textContent = 'Anfrage wird gesendet...';

			try {
				await sendCustomRequest(buildPayload(form));
				form.reset();
				status.className = 'custom-request-status custom-request-status--success';
				status.textContent = 'Vielen Dank. Ihre Anfrage wurde gesendet.';
			} catch (error) {
				status.className = 'custom-request-status custom-request-status--error';
				status.textContent = error.message || 'Die Anfrage konnte nicht gesendet werden.';
			} finally {
				syncSubmitState();
			}
		});
	}

	/**
	 * Renders the form near the bottom of the current service page.
	 * @returns {void}
	 */
	function initCustomRequestForm() {
		if (!shouldRenderForm() || document.querySelector('.custom-request')) return;

		const wrapper = document.createElement('div');
		wrapper.innerHTML = getFormTemplate().trim();
		const section = wrapper.firstElementChild;
		const helpSection = document.querySelector('.service-help');
		const main = document.querySelector('main');

		if (helpSection) {
			helpSection.replaceWith(section);
		} else {
			main?.appendChild(section);
		}

		bindForm(section);
	}

	if (document.readyState === 'loading') {
		document.addEventListener('DOMContentLoaded', initCustomRequestForm);
	} else {
		initCustomRequestForm();
	}
})();
