/**
 * SFP row-unit parts — per-checkbox catalog prices (multi-select step).
 */

/** @type {Record<string, { sku: string, price: number, title: string }>} */
export const SFP_CHOICE_CATALOG = {
   "bumper-stops": { sku: "AG2622", price: 35.0, title: "Bumper Stop" },
   "ss-liquid-tubes": { sku: "AG-K29", price: 34.89, title: "Stainless SFP Tube Rebuild Kit" },
   "ss-dry-tubes": { sku: "AG2620", price: 179.62, title: "SFP Dry Fertilizer Tube" },
   "sfp-cruiser-cw": { sku: "SFP CRUISER", price: 159.5, title: "SFP Cruiser Spiked Wheel" },
};

export const SFP_LABOR_PER_ITEM = 5;

export const SFP_ALTERNATE_SKUS = {
   AG1254: { price: 115.0, title: "Copperhead Ag Drill Cruiser Closing Wheel" },
   AG2620L: { price: 179.62, title: "SFP Dry Fertilizer Tube - Left" },
   AG2620R: { price: 179.62, title: "SFP Dry Fertilizer Tube - Right" },
};

const UNMAPPED_CHOICES = new Set(["ss-nh3-tubes", "sfp-springs"]);

export function formatSfpPrice(price) {
   return `$${Number(price).toFixed(2)}`;
}

export function getSfpChoicePartSelection(choiceValue) {
   const entry = SFP_CHOICE_CATALOG[choiceValue];
   if (!entry) return null;
   return {
      sku: entry.sku,
      price: entry.price,
      title: entry.title,
      reason: `${entry.title} from SFP checkbox`,
   };
}

export function getSfpChoicePartsCostOverride(step, choiceValue) {
   if (step?.slug !== "other-sfp-row-unit-parts") return null;
   if (UNMAPPED_CHOICES.has(choiceValue)) return null;

   const selection = getSfpChoicePartSelection(choiceValue);
   if (!selection || selection.price <= 0) return null;

   return { low: selection.price, high: selection.price };
}

export function getSfpChoiceLabel(choiceValue) {
   const labels = {
      "bumper-stops": "Bumper Stops",
      "ss-liquid-tubes": "Stainless Steel Liquid Tubes",
      "ss-dry-tubes": "Stainless Steel Dry Tubes",
      "ss-nh3-tubes": "Stainless Steel NH3 Tubes",
      "sfp-cruiser-cw": "SFP Cruiser Closing Wheels",
      "sfp-springs": "SFP Springs",
   };
   return labels[choiceValue] ?? choiceValue;
}
