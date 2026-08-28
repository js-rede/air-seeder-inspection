/**
 * Seed tab part selection from machine setup.
 * Prices from reference/seed-tabs-qbo-mapping.json (Joe verified 2026-08-28).
 */

import { getDrillSetup } from "./machineCatalog";

/** @type {Record<string, { price: number, title: string }>} */
export const SEED_TAB_CATALOG = {
   "AG-K05-STD": { price: 5.5, title: "Heavy Duty Extended Wear Seed Tabs - Seed Tab w/ Hardware" },
   AG1057: { price: 5.0, title: "Heavy Duty Extended Wear Seed Tabs - Seed Tab ONLY" },
   "AG-K05": { price: 7.0, title: "Heavy Duty Extended Wear Seed Tabs - Seed Tab w/ Nut" },
   "AG-K05-PRO": { price: 7.0, title: "Heavy Duty Extended Wear Seed Tabs - Narrow Seed Tab w/ Hardware" },
   AG1057N: { price: 5.0, title: "Heavy Duty Extended Wear Seed Tabs - Narrow Seed Tab ONLY" },
   "AG-K05-FIN-LH": { price: 11.79, title: "Pro-Stitch Bonilla Seed Tab - Left w/ Hardware" },
   "AG-K05-FIN-RH": { price: 11.79, title: "Pro-Stitch Bonilla Seed Tab - Right w/ Hardware" },
   AG1057PL: { price: 9.79, title: "Pro-Stitch Bonilla Seed Tab - Left (seed tab ONLY)" },
   AG1057PR: { price: 9.79, title: "Pro-Stitch Bonilla Seed Tab - Right (seed tab ONLY)" },
   RE3004: { price: 5.0, title: "SDX Seed Tab for Case SDX" },
};

export const SEED_TAB_LABOR = 3.5;
export const SEED_TAB_DEFAULT_SKU = "AG-K05-STD";

function catalogEntry(sku) {
   return SEED_TAB_CATALOG[sku] ?? { price: 0, title: sku };
}

function buildSelection(sku, reason) {
   const entry = catalogEntry(sku);
   return { sku, price: entry.price, title: entry.title, reason };
}

function isProSeriesDrill(drill) {
   if (drill.rowUnitSeries === "proseries") return true;
   return /\bproseries\b/i.test(drill.model || "");
}

function isCaseSdxDrill(drill) {
   const model = drill.model || "";
   return drill.manufacturer === "Case IH" && /precision disk/i.test(model);
}

function resolveSeedTabPart(drill) {
   if (!drill?.manufacturer) {
      return buildSelection(SEED_TAB_DEFAULT_SKU, "Red E HD seed tab w/ hardware — default until machine setup");
   }

   if (isCaseSdxDrill(drill)) {
      return buildSelection("RE3004", "Case IH SDX seed tab from machine setup");
   }

   if (isProSeriesDrill(drill)) {
      return buildSelection("AG-K05-PRO", "Narrow ProSeries seed tab w/ hardware from machine setup");
   }

   return buildSelection("AG-K05-STD", "Red E HD seed tab w/ hardware — default for John Deere class drills");
}

export function formatSeedTabPrice(price) {
   return `$${Number(price).toFixed(2)}`;
}

export function getSeedTabPartSelection(machineSetup) {
   const drill = getDrillSetup(machineSetup);
   return resolveSeedTabPart(drill);
}

export function getSeedTabPartsCostOverride(step, machineSetup) {
   if (step?.slug !== "seed-tabs") return null;

   const selection = getSeedTabPartSelection(machineSetup);
   if (!selection || selection.price <= 0) return null;

   return { low: selection.price, high: selection.price };
}
