/**
 * Press / firming wheel part selection.
 * Prices from reference/press-wheels-wheel-qbo-mapping.json (Joe verified 2026-08-28).
 */

import { getDrillSetup } from "./machineCatalog";

/** @type {Record<string, { price: number, title: string }>} */
export const PRESS_WHEEL_CATALOG = {
   "V8-WHEEL": { price: 43.05, title: "Heavy Duty Needham V8 Press/Firming Wheel - No Hardware" },
   "NA-K01": { price: 50.0, title: "Heavy Duty Needham V8 Press/Firming Wheel - With Hardware" },
   "NA-K01-V8-WHEEL": { price: 43.05, title: "Heavy Duty Needham V8 Press/Firming Wheel (variant listing)" },
};

export const PRESS_WHEEL_LABOR = 8;

function catalogEntry(sku) {
   return PRESS_WHEEL_CATALOG[sku] ?? { price: 0, title: sku };
}

function buildSelection(sku, reason) {
   const entry = catalogEntry(sku);
   return { sku, price: entry.price, title: entry.title, reason };
}

function resolvePressWheelPart(drill) {
   if (!drill?.manufacturer) return null;

   return buildSelection(
      "NA-K01",
      "Needham V8 press/firming wheel with hardware — JD 50/60/90, Case SDX, Bourgault 3820 class",
   );
}

export function formatPressWheelPrice(price) {
   return `$${Number(price).toFixed(2)}`;
}

export function getPressWheelPartSelection(machineSetup) {
   const drill = getDrillSetup(machineSetup);
   if (!drill?.manufacturer) return null;
   return resolvePressWheelPart(drill);
}

export function getPressWheelPartsCostOverride(step, machineSetup) {
   if (step?.slug !== "press-wheel") return null;

   const selection = getPressWheelPartSelection(machineSetup);
   if (!selection || selection.price <= 0) return null;

   return { low: selection.price, high: selection.price };
}
