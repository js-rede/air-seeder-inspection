/**
 * Air cart meter housing catalog — selection TBD by leadership per Current setup choice.
 * Prices from reference/air-cart-meter-housings-qbo-mapping.json (Joe verified 2026-08-28).
 */

import { getCartRunCountLabel, getCartSetup } from "./machineCatalog";

/** @type {Record<string, { price: number, priceHigh?: number, title: string, brand?: string, note?: string }>} */
export const AIR_CART_METER_HOUSING_CATALOG = {
   "9-0001-1W": { price: 1563.88, title: "Morris 7000 SS Meter Housing, 8 Run", brand: "morris/oem" },
   "9-0031-0A": { price: 1622.45, title: "Stainless Steel Meter Housing, 6 Run", brand: "generic/oem" },
   "9-0032-0A": { price: 1712.24, title: "Stainless Steel Meter Housing, 8 Run", brand: "generic/oem" },
   "9-0055-0A": { price: 3328.26, title: "Morris 8000 SS Meter Housing", brand: "morris/oem" },
   "9-0063-0A": { price: 3391.65, title: "Morris 8000XL & 9000 SS Meter Housing", brand: "morris/oem" },
   BRG1124A: { price: 2242.0, title: "Bourgault Meter Housing Assembly", brand: "bourgault/oem" },
   FAS0931A: { price: 2898.62, title: "Stainless Steel Meter Housing", brand: "airseeder-parts" },
   JAS0006A: { price: 4697.37, title: "Romafa Section Command SS Meter Housing", brand: "romafa-ir" },
   JAS0168A: { price: 4580.0, title: "Romafa SS Ground Drive Meter Housing", brand: "romafa" },
   JAS0980A: { price: 2898.62, title: "Stainless Steel Meter Housing (8 run)", brand: "airseeder-parts" },
   JAS1087: { price: 153.73, title: "50 Series Top Seal for Meter Housing", brand: "component", note: "Seal only" },
   JAS1100A: { price: 2566.37, title: "Stainless Steel Meter Housing (6 run)", brand: "airseeder-parts" },
   JAS2771A: { price: 2975.0, title: "SS 40 Series Meter Housing (1st serial)", brand: "airseeder-parts" },
   JAS2774A: { price: 2975.0, title: "SS 40 Series Meter Housing (2nd serial)", brand: "airseeder-parts" },
   JAS4832A: { price: 4860.2, title: "Romafa Premium 316 SS Meter Housing", brand: "romafa" },
   "KANPAR-MH": { price: 4180.0, priceHigh: 4195.0, title: "Kanpar SS Meter Housing - Ground Drive", brand: "kanpar" },
   SSAA67290: { price: 4180.0, title: "Kanpar SS Meter Housing - Ground Drive", brand: "kanpar" },
   "SSK-MH-GD-KP": { price: 4195.0, title: "Kanpar SS Meter Housing - Ground Drive", brand: "kanpar" },
   SSA62224: { price: 38.0, title: "John Deere OEM Meter Housing Seal", brand: "component", note: "Seal only" },
   SSA70600: { price: 70.0, title: "Top Seal for Meter Housing", brand: "component", note: "Seal only" },
   "SSK-MH-GD-RO": { price: 4212.08, title: "Romafa SS Meter Housing - Ground Drive", brand: "romafa" },
   "SSK-MH-HD-KP": { price: 4715.0, title: "Kanpar SS Meter Housing - Hydraulic Drive", brand: "kanpar" },
};

/** Full housings first, then seals — for dev notes display order. */
export const AIR_CART_METER_HOUSING_SKUS = [
   "9-0031-0A",
   "9-0032-0A",
   "9-0001-1W",
   "9-0055-0A",
   "9-0063-0A",
   "BRG1124A",
   "FAS0931A",
   "JAS0980A",
   "JAS1100A",
   "JAS2771A",
   "JAS2774A",
   "JAS0168A",
   "JAS4832A",
   "SSK-MH-GD-RO",
   "JAS0006A",
   "SSK-MH-GD-KP",
   "SSAA67290",
   "KANPAR-MH",
   "SSK-MH-HD-KP",
   "JAS1087",
   "SSA62224",
   "SSA70600",
];

/** Candidate SKUs per step secondary — not wired until leadership confirms usual picks. */
export const METER_HOUSING_CANDIDATES_BY_SETUP = {
   oem: ["9-0031-0A", "9-0032-0A", "9-0001-1W", "9-0055-0A", "9-0063-0A", "BRG1124A"],
   "airseeder-parts": ["FAS0931A", "JAS0980A", "JAS1100A", "JAS2771A", "JAS2774A"],
   romafa: ["SSK-MH-GD-RO", "JAS0168A", "JAS4832A"],
   "romafa-ir": ["JAS0006A"],
   kanpar: ["SSK-MH-GD-KP", "SSAA67290", "KANPAR-MH", "SSK-MH-HD-KP"],
};

const SETUP_LABELS = {
   oem: "OEM",
   "airseeder-parts": "Airseeder Parts",
   romafa: "Romafa",
   "romafa-ir": "Romafa IR",
   kanpar: "Kanpar",
   other: "Other",
};

export function formatAirCartMeterHousingPrice(price, priceHigh) {
   const lo = Number(price);
   if (priceHigh != null && Number(priceHigh) !== lo) {
      return `$${lo.toFixed(2)}–$${Number(priceHigh).toFixed(2)}`;
   }
   return `$${lo.toFixed(2)}`;
}

/**
 * No auto-selection yet — returns null until leadership defines usual SKU per setup.
 * @param {object} [machineSetup]
 * @param {string} [meterSetupSecondary] — current-meter-housing secondary answer
 */
export function getAirCartMeterHousingPartSelection(machineSetup, meterSetupSecondary = "") {
   const cart = machineSetup ? getCartSetup(machineSetup) : null;
   const setup = meterSetupSecondary?.trim() ?? "";
   const candidates = METER_HOUSING_CANDIDATES_BY_SETUP[setup];

   if (!setup || setup === "other" || !candidates?.length) {
      return null;
   }

   const runLabel = getCartRunCountLabel(cart);
   const setupLabel = SETUP_LABELS[setup] ?? setup;

   return {
      sku: null,
      price: null,
      title: "",
      reason: `${setupLabel} selected — ${candidates.length} candidate SKUs; need leadership to pick usual SKU${runLabel ? ` (${runLabel} may narrow 6 vs 8 run)` : ""}.`,
      candidates,
   };
}

export function getMeterHousingCandidateSkus(meterSetupSecondary) {
   return METER_HOUSING_CANDIDATES_BY_SETUP[meterSetupSecondary] ?? [];
}
