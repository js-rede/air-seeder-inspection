/**
 * Depth adjuster arm part selection from machine setup.
 * Prices from reference/depth-control-arm-qbo-mapping.json (Joe verified 2026-08-28).
 */

import { getDrillSetup } from "./machineCatalog";

/** @type {Record<string, { price: number, title: string }>} */
export const DEPTH_ARM_CATALOG = {
   "AG-K08": { price: 88.8, title: "Universal Depth Adjuster Arm Kit" },
   "RE3040L / RE3040R": { price: 225.0, title: "SDX Depth Adjuster Pivot Arm (L/R)" },
   RE3040: { price: 225.0, title: "SDX Depth Adjuster Pivot Arm" },
};

export const DEPTH_ARM_LABOR = 25;

function catalogEntry(sku) {
   return DEPTH_ARM_CATALOG[sku] ?? { price: 0, title: sku };
}

function buildSelection(sku, reason) {
   const entry = catalogEntry(sku);
   return { sku, price: entry.price, title: entry.title, reason };
}

function isCaseSdxDrill(drill) {
   const model = drill.model || "";
   return drill.manufacturer === "Case IH" && /precision disk/i.test(model);
}

function resolveDepthArmPart(drill) {
   const manufacturer = drill.manufacturer || "";

   if (isCaseSdxDrill(drill)) {
      return buildSelection(
         "RE3040L / RE3040R",
         "Case IH SDX depth adjuster arm — confirm vs AG-K08 for online estimate",
      );
   }

   if (manufacturer === "John Deere") {
      return buildSelection("AG-K08", "Universal depth adjuster arm kit (spreadsheet BA194 / K08)");
   }

   return null;
}

export function formatDepthArmPrice(price) {
   return `$${Number(price).toFixed(2)}`;
}

export function getDepthArmPartSelection(machineSetup) {
   const drill = getDrillSetup(machineSetup);
   if (!drill?.manufacturer) return null;
   return resolveDepthArmPart(drill);
}

export function getDepthArmPartsCostOverride(step, machineSetup) {
   if (step?.slug !== "depth-arm") return null;

   const selection = getDepthArmPartSelection(machineSetup);
   if (!selection || selection.price <= 0) return null;

   return { low: selection.price, high: selection.price };
}
