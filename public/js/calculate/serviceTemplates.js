export function createServiceFormTemplates({ kitchenSurvey, continueBtn }) {
	return {
		'Küchentransport': () => getKitchenTransportForm(),
		'Küche abbauen': () => getKitchenDismantlingForm(),
		'Küche aufbauen': () => {
			if (kitchenSurvey) {
				kitchenSurvey.style.display = 'block';
				continueBtn.style.display = 'none';
			}
			return '';
		},
		'Küche anpassen': () => getKitchenAdjustmentEstimateForm(),
		'Küchenanfertigung': () => getCustomKitchenRequestForm(),
		'Möbel aufbauen': () => getFurnitureAssemblyForm(),
		'Möbel entsorgen': () => getFurnitureDisposalForm(),
		'Möbelanfertigung': () => getCustomFurnitureRequestForm(),
		'Umzugshelfer': () => getMovingHelpersEstimateForm(),
		'Kleintransporte': () => getSmallItemsTransportForm(),
		'Fugenreinigung': () => getJointCleaningForm(),
		'Feinputz': () => getFinePlasterForm(),
		'Wände Verputzen': () => getWallPlasteringForm(),
		'Trockenbau (Rigipsausbau)': () => getDrywallForm(),
		'Hecken schneiden': () => getHedgeTrimmingForm(),
		'Rasen mähen': () => getLawnMowingForm(),
		'Rollrasen verlegen': () => getLawnInstallationForm(),
		'Wurzeln entfernen': () => getRootRemovalForm(),
		'Pflastern': () => getPavingForm(),
		'Minibagger-Arbeiten': () => getMiniExcavatorWorkForm(),
		'Gartenhütten aufbauen': () => getGardenHutAssemblyForm(),
		'Gartenhütten schleifen/streichen': () => getGardenHutSandingPaintingForm(),
		'Hecken entfernen': () => getHedgeRemovalForm(),
		'Kleine Bäume fällen': () => getSmallTreeFellingForm(),
		'Sträucher schneiden': () => getShrubTrimmingForm(),
		'Entsorgung von Grünschnitt': () => getGreenWasteDisposalForm(),
		'Überdachung': () => getCanopyForm(),
		'Holzhäcksler': () => getWoodChipperForm(),
		'Zäune aufbauen': () => getFenceAssemblyForm()
	};
}
