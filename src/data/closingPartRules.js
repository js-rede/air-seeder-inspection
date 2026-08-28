/**
 * Closing-system part selection from machine setup (+ step answers where needed).
 * Prices seeded from reference/closing-system-qbo-mapping.json (Joe verified 2026-08-28).
 */

import { getDrillSetup } from "./machineCatalog";

/** @type {Record<string, { price: number, title: string }>} */
export const CLOSING_PARTS_CATALOG = {
   "AG-K36": { price: 45.87, title: "Greaseless Closing Wheel Arm Bearing Pivot Fix Kit" },
   "AG-K01": { price: 65.0, title: "Heavy Duty Closing Wheel Pivot Kit" },
   "AG-K01-5060": { price: 75.0, title: "Heavy Duty Closing Wheel Pivot Kit (50 & 60 series)" },
   "AG-K39": { price: 45.37, title: "Closing Wheel Bearing Pivot Kit (ProSeries)" },
   "PD5-K03": { price: 48.3, title: "PD500 Greaseless Bearing Closing Wheel Arm Pivot Kit" },
   "NA-K07-FULL": { price: 42.1, title: "Needham Greaseless Closing and Press Wheel Arm Pivot Fix Kit" },
   "AG-K14L / AG-K14R": { price: 31.2, title: "HD Closing Wheel Arm Spring (60/90)" },
   "AG-K14L-PRO / AG-K14R-PRO": { price: 27.48, title: "HD Closing Wheel Arm Spring (ProSeries)" },
   "CWS-90L / CWS-90R": { price: 14.5, title: "Standard round wire closing wheel spring" },
   "AG-K19-90": { price: 272.5, title: "Closing Wheel Arm Assembly (60/90)" },
   "AG-K19-50": { price: 86.2, title: "Closing Wheel Arm Assembly (50 series)" },
   AG2150: { price: 110.0, title: "Red E Cast Notched Closing Wheel" },
   "AG-K20": { price: 76.62, title: "Extended Wear Bolt-on Spiked Closing Wheel Kit" },
   AG1032: { price: 46.5, title: "Smooth Cast Closing Wheel" },
   AG2028X: { price: 19.0, title: "SeedXtreme Closing Wheel Bearing" },
};

export const CLOSING_STEP_SLUGS = new Set([
   "closing-wheel-pivot",
   "closing-wheel-spring",
   "closing-wheel-arm",
   "closing-wheel",
   "closing-wheel-bearing",
]);

const FIFTY_SERIES_MODEL_PATTERNS = [
   /1830/i,
   /1835/i,
   /flex hoe 400/i,
   /precision disk 500/i,
   /precision disk 550/i,
   /\b50 series\b/i,
];

const WHEEL_SETUP_TO_SKU = {
   "smooth-cast": "AG1032",
   "copperhead-or-jd-notch": "AG2150",
   "bolt-on": "AG-K20",
};

const WHEEL_SETUP_LABELS = {
   "smooth-cast": "Smooth Cast",
   "copperhead-or-jd-notch": "Copperhead or JD Notch",
   "bolt-on": "Bolt-On",
   other: "Other",
};

function catalogEntry(sku) {
   return CLOSING_PARTS_CATALOG[sku] ?? { price: 0, title: sku };
}

function buildSelection(sku, reason) {
   const entry = catalogEntry(sku);

   return {
      sku,
      price: entry.price,
      title: entry.title,
      reason,
   };
}

export function formatClosingPartPrice(price) {
   return `$${Number(price).toFixed(2)}`;
}

function isProSeriesDrill(drill) {
   if (drill.rowUnitSeries === "proseries") return true;
   return /\bproseries\b/i.test(drill.model || "");
}

function isFiftySeriesDrill(drill) {
   const model = drill.model || "";
   return FIFTY_SERIES_MODEL_PATTERNS.some((pattern) => pattern.test(model));
}

function isPd500Drill(drill) {
   const model = drill.model || "";
   if (/N500/i.test(model)) return true;
   if (drill.manufacturer === "New Holland" && /P20/i.test(model)) return true;
   return false;
}

function resolvePivotPart(drill) {
   if (isProSeriesDrill(drill)) {
      return buildSelection("AG-K39", "ProSeries row-unit series from machine setup");
   }
   if (isPd500Drill(drill)) {
      return buildSelection("PD5-K03", "PD500-class drill model from machine setup");
   }
   if (isFiftySeriesDrill(drill)) {
      return buildSelection("AG-K01-5060", "50/60 series drill model from machine setup");
   }
   return buildSelection("AG-K36", "Default greaseless pivot for 60/90 series drills");
}

function resolveSpringPart(drill) {
   if (isProSeriesDrill(drill)) {
      return buildSelection("AG-K14L-PRO / AG-K14R-PRO", "ProSeries row-unit series from machine setup");
   }
   return buildSelection("AG-K14L / AG-K14R", "HD spring default for 60/90 series drills");
}

function resolveArmPart(drill) {
   if (isFiftySeriesDrill(drill)) {
      return buildSelection("AG-K19-50", "50 series drill model from machine setup");
   }
   return buildSelection("AG-K19-90", "60/90 series drill model (default)");
}

function resolveWheelPart(secondaryValue) {
   if (secondaryValue && WHEEL_SETUP_TO_SKU[secondaryValue]) {
      const sku = WHEEL_SETUP_TO_SKU[secondaryValue];
      const label = WHEEL_SETUP_LABELS[secondaryValue] || secondaryValue;
      return buildSelection(sku, `Current setup answer: ${label}`);
   }
   return buildSelection("AG2150", "Default cast notched wheel until Current setup is answered");
}

function resolveBearingPart() {
   return buildSelection("AG2028X", "Same bearing SKU for all drills");
}

/**
 * @param {string} stepSlug
 * @param {object} machineSetup
 * @param {{ secondaryValue?: string }} [options]
 */
export function getClosingPartSelection(stepSlug, machineSetup, options = {}) {
   if (!CLOSING_STEP_SLUGS.has(stepSlug)) return null;

   const drill = getDrillSetup(machineSetup);
   if (!drill?.manufacturer) return null;

   switch (stepSlug) {
      case "closing-wheel-pivot":
         return resolvePivotPart(drill);
      case "closing-wheel-spring":
         return resolveSpringPart(drill);
      case "closing-wheel-arm":
         return resolveArmPart(drill);
      case "closing-wheel":
         return resolveWheelPart(options.secondaryValue);
      case "closing-wheel-bearing":
         return resolveBearingPart();
      default:
         return null;
   }
}

/**
 * Override step JSON parts cost with catalog price from machine rules.
 * Labor still comes from the step choice in getChoiceCostRange.
 */
export function getClosingPartsCostOverride(step, machineSetup, secondaryChoice) {
   if (!step?.slug || step.section !== "closing_system") return null;

   const secondaryValue =
      secondaryChoice && typeof secondaryChoice === "object"
         ? secondaryChoice.value ?? secondaryChoice.label ?? ""
         : secondaryChoice ?? "";

   const selection = getClosingPartSelection(step.slug, machineSetup, { secondaryValue });
   if (!selection || selection.price <= 0) return null;

   return { low: selection.price, high: selection.price };
}
