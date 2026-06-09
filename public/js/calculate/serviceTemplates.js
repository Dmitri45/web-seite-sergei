/**
 * Service label to calculator form template mappings.
 * @module calculate/serviceTemplates
 */

import { SERVICE_LABELS } from './serviceLabels.js';

/**
 * Creates template factories keyed by the visible service label.
 * @param {Object} options - Template creation dependencies.
 * @param {HTMLElement|null} options.kitchenSurvey - Initial kitchen survey element.
 * @param {HTMLElement|null} options.continueBtn - Initial survey continue button.
 * @returns {Record<string, Function>} Service label to template factory map.
 */
export function createServiceFormTemplates({ kitchenSurvey, continueBtn }) {
	return {
		[SERVICE_LABELS.KITCHEN_TRANSPORT]: () => getKitchenTransportForm(),
		[SERVICE_LABELS.KITCHEN_DISMANTLING]: () => getKitchenDismantlingForm(),
		[SERVICE_LABELS.KITCHEN_ASSEMBLY]: () => {
			if (kitchenSurvey) {
				kitchenSurvey.style.display = 'block';
				continueBtn.style.display = 'none';
			}
			return '';
		},
		[SERVICE_LABELS.KITCHEN_ADJUSTMENT]: () => getKitchenAdjustmentEstimateForm(),
		[SERVICE_LABELS.CUSTOM_KITCHEN]: () => getCustomKitchenRequestForm(),
		[SERVICE_LABELS.FURNITURE_ASSEMBLY]: () => getFurnitureAssemblyForm(),
		[SERVICE_LABELS.FURNITURE_DISPOSAL]: () => getFurnitureDisposalForm(),
		[SERVICE_LABELS.CUSTOM_FURNITURE]: () => getCustomFurnitureRequestForm(),
		[SERVICE_LABELS.MOVING_HELPERS]: () => getMovingHelpersEstimateForm(),
		[SERVICE_LABELS.SMALL_TRANSPORTS]: () => getSmallItemsTransportForm(),
		[SERVICE_LABELS.JOINT_CLEANING]: () => getJointCleaningForm(),
		[SERVICE_LABELS.FINE_PLASTER]: () => getFinePlasterForm(),
		[SERVICE_LABELS.WALL_PLASTERING]: () => getWallPlasteringForm(),
		[SERVICE_LABELS.DRYWALL]: () => getDrywallForm(),
		[SERVICE_LABELS.HEDGE_TRIMMING]: () => getHedgeTrimmingForm(),
		[SERVICE_LABELS.LAWN_MOWING]: () => getLawnMowingForm(),
		[SERVICE_LABELS.LAWN_INSTALLATION]: () => getLawnInstallationForm(),
		[SERVICE_LABELS.ROOT_REMOVAL]: () => getRootRemovalForm(),
		[SERVICE_LABELS.PAVING]: () => getPavingForm(),
		[SERVICE_LABELS.MINI_EXCAVATOR]: () => getMiniExcavatorWorkForm(),
		[SERVICE_LABELS.GARDEN_HOUSE_ASSEMBLY]: () => getGardenHutAssemblyForm(),
		[SERVICE_LABELS.GARDEN_HOUSE_RENOVATION]: () => getGardenHutSandingPaintingForm(),
		[SERVICE_LABELS.HEDGE_REMOVAL]: () => getHedgeRemovalForm(),
		[SERVICE_LABELS.SMALL_TREE_FELLING]: () => getSmallTreeFellingForm(),
		[SERVICE_LABELS.SHRUB_TRIMMING]: () => getShrubTrimmingForm(),
		[SERVICE_LABELS.GREEN_WASTE_DISPOSAL]: () => getGreenWasteDisposalForm(),
		[SERVICE_LABELS.CANOPY_ASSEMBLY]: () => getCanopyForm(),
		[SERVICE_LABELS.WOOD_CHIPPING]: () => getWoodChipperForm(),
		[SERVICE_LABELS.FENCE_ASSEMBLY]: () => getFenceAssemblyForm()
	};
}
