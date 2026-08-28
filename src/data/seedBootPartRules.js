/**
 * Seed boot part selection from Current setup answer.
 */

import { getDrillSetup } from "./machineCatalog";

/** @type {Record<string, { price: number, title: string }>} */
export const SEED_BOOT_CATALOG = {
   AG2657L: { price: 110.0, title: "Red E Extended Wear Seed Boot - Left" },
   AG2657R: { price: 110.0, title: "Red E Extended Wear Seed Boot - Right" },
   AG1059L: { price: 135.95, title: "John Deere OEM Extended Wear Seed Boot - Left" },
   AG1059R: { price: 135.95, title: "John Deere OEM Extended Wear Seed Boot - Right" },
};

export const SEED_BOOT_LABOR = 35;
export const SEED_BOOT_DEFAULT_SKU = "AG2657L";

const SETUP_TO_SKU = {
   "oem-ext": "AG1059L",
   "red-e-ext": "AG2657L",
   other: SEED_BOOT_DEFAULT_SKU,
};

const SETUP_LABELS = {
   "oem-ext": "OEM Ext",
   "red-e-ext": "Red E Ext",
   other: "Other",
};

function catalogEntry(sku) {
   return SEED_BOOT_CATALOG[sku] ?? { price: 0, title: sku };
}

function buildSelection(sku, reason) {
   const entry = catalogEntry(sku);
   return { sku, price: entry.price, title: entry.title, reason };
}

function resolveSeedBootPart(_drill, secondaryValue) {
   const sku = SETUP_TO_SKU[secondaryValue] ?? SEED_BOOT_DEFAULT_SKU;
   const label = SETUP_LABELS[secondaryValue] || "Red E Ext (default)";
   return buildSelection(sku, `${label} setup from Current setup answer`);
}

export function formatSeedBootPrice(price) {
   return `$${Number(price).toFixed(2)}`;
}

export function getSeedBootPartSelection(machineSetup, options = {}) {
   const drill = getDrillSetup(machineSetup);
   const secondaryValue = options.secondaryValue ?? "";
   return resolveSeedBootPart(drill, secondaryValue || "red-e-ext");
}

export function getSeedBootPartsCostOverride(step, machineSetup, secondaryChoice) {
   if (step?.slug !== "seed-boot") return null;

   const secondaryValue =
      secondaryChoice && typeof secondaryChoice === "object"
         ? secondaryChoice.value ?? secondaryChoice.label ?? ""
         : secondaryChoice ?? "";

   const selection = getSeedBootPartSelection(machineSetup, { secondaryValue });
   if (!selection || selection.price <= 0) return null;

   return { low: selection.price, high: selection.price };
}

export { SETUP_LABELS as SEED_BOOT_SETUP_LABELS };
