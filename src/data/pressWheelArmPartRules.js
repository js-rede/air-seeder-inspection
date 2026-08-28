/**
 * Press / firming wheel arm part selection from machine setup.
 * Prices from reference/press-wheels-arm-qbo-mapping.json (Joe verified 2026-08-28).
 */

import { getDrillSetup } from "./machineCatalog";

/** @type {Record<string, { price: number, title: string }>} */
export const PRESS_WHEEL_ARM_CATALOG = {
   AG1030: { price: 30.0, title: "Firming Wheel Arm" },
   AG1142: { price: 30.0, title: "Firming Wheel Arm – 50 Series" },
};

export const PRESS_WHEEL_ARM_LABOR = 10;

const JD_FIFTY_SERIES_MODEL_PATTERNS = [/1830/i, /1835/i, /1850/i, /\b750\b/i, /\b50 series\b/i];

function catalogEntry(sku) {
   return PRESS_WHEEL_ARM_CATALOG[sku] ?? { price: 0, title: sku };
}

function buildSelection(sku, reason) {
   const entry = catalogEntry(sku);
   return { sku, price: entry.price, title: entry.title, reason };
}

function isJdFiftySeriesDrill(drill) {
   if (drill.manufacturer !== "John Deere") return false;
   const model = drill.model || "";
   return JD_FIFTY_SERIES_MODEL_PATTERNS.some((pattern) => pattern.test(model));
}

function resolvePressWheelArmPart(drill) {
   const manufacturer = drill.manufacturer || "";

   if (manufacturer !== "John Deere") return null;

   if (isJdFiftySeriesDrill(drill)) {
      return buildSelection("AG1142", "John Deere 50 series firming/press wheel arm");
   }

   return buildSelection("AG1030", "John Deere 60/90 series firming/press wheel arm");
}

export function formatPressWheelArmPrice(price) {
   return `$${Number(price).toFixed(2)}`;
}

export function getPressWheelArmPartSelection(machineSetup) {
   const drill = getDrillSetup(machineSetup);
   if (!drill?.manufacturer) return null;
   return resolvePressWheelArmPart(drill);
}

export function getPressWheelArmPartsCostOverride(step, machineSetup) {
   if (step?.slug !== "press-wheel-arm") return null;

   const selection = getPressWheelArmPartSelection(machineSetup);
   if (!selection || selection.price <= 0) return null;

   return { low: selection.price, high: selection.price };
}
