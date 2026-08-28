/**
 * Press wheel pivot part selection from machine setup.
 * Prices from reference/press-wheels-pivot-qbo-mapping.json (Joe verified 2026-08-28).
 * Press pivot SKUs are separate from closing pivot (AG-K37 vs AG-K36, etc.).
 */

import { getDrillSetup } from "./machineCatalog";

/** @type {Record<string, { price: number, title: string }>} */
export const PRESS_WHEEL_PIVOT_CATALOG = {
   "AG-K37": { price: 46.01, title: "Greaseless Press Wheel Arm Bearing Pivot Fix Kit" },
   "AG-K40": { price: 44.87, title: "Press Wheel Bearing Pivot Fix Kit (ProSeries)" },
   "AG-K23-50": { price: 44.85, title: "Press Wheel Bearing Pivot Fix Kit (50 series)" },
   "AG-K02-50": { price: 77.87, title: "Heavy Duty Firming/Press Wheel Pivot Kit (50 series)" },
   "NA-K08-FULL": { price: 41.6, title: "Needham Greaseless Press Wheel Arm Pivot Fix Kit (60/90)" },
   "NA-K08-50": { price: 53.5, title: "Needham Greaseless Press Wheel Arm Pivot Fix Kit (50 series)" },
   "NA-K07-FULL": { price: 42.1, title: "Needham Greaseless Closing and Press Wheel Arm Pivot Fix Kit" },
};

export const PRESS_WHEEL_PIVOT_LABOR = 70;

const JD_FIFTY_SERIES_MODEL_PATTERNS = [/1830/i, /1835/i, /\b50 series\b/i];

function catalogEntry(sku) {
   return PRESS_WHEEL_PIVOT_CATALOG[sku] ?? { price: 0, title: sku };
}

function buildSelection(sku, reason) {
   const entry = catalogEntry(sku);
   return { sku, price: entry.price, title: entry.title, reason };
}

function isProSeriesDrill(drill) {
   if (drill.rowUnitSeries === "proseries") return true;
   return /\bproseries\b/i.test(drill.model || "");
}

function isJdFiftySeriesDrill(drill) {
   if (drill.manufacturer !== "John Deere") return false;
   const model = drill.model || "";
   return JD_FIFTY_SERIES_MODEL_PATTERNS.some((pattern) => pattern.test(model));
}

function isPd500Drill(drill) {
   const model = drill.model || "";
   if (/N500/i.test(model)) return true;
   if (drill.manufacturer === "New Holland" && /P20/i.test(model)) return true;
   return false;
}

function resolvePressWheelPivotPart(drill) {
   const manufacturer = drill.manufacturer || "";

   if (manufacturer !== "John Deere") return null;

   if (isProSeriesDrill(drill)) {
      return buildSelection("AG-K40", "ProSeries row-unit series from machine setup");
   }

   if (isPd500Drill(drill)) {
      return null;
   }

   if (isJdFiftySeriesDrill(drill)) {
      return buildSelection("AG-K23-50", "John Deere 50 series drill model from machine setup");
   }

   return buildSelection("AG-K37", "Default greaseless press pivot for John Deere 60/90 series drills");
}

export function formatPressWheelPivotPrice(price) {
   return `$${Number(price).toFixed(2)}`;
}

export function getPressWheelPivotPartSelection(machineSetup) {
   const drill = getDrillSetup(machineSetup);
   if (!drill?.manufacturer) return null;
   return resolvePressWheelPivotPart(drill);
}

export function getPressWheelPivotPartsCostOverride(step, machineSetup) {
   if (step?.slug !== "press-wheel-pivot") return null;

   const selection = getPressWheelPivotPartSelection(machineSetup);
   if (!selection || selection.price <= 0) return null;

   return { low: selection.price, high: selection.price };
}
