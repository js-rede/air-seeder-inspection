/**
 * Depth adjustment pivot part selection.
 * Prices from reference/depth-control-pivot-qbo-mapping.json (Joe verified 2026-08-28).
 */

import { getDrillSetup } from "./machineCatalog";

/** @type {Record<string, { price: number, title: string }>} */
export const DEPTH_ADJUSTMENT_PIVOT_CATALOG = {
   "AG-K03": { price: 135.24, title: "Heavy Duty Depth Arm Pivot Kit" },
   "AA050DA / AA051DA": {
      price: 195.0,
      title: "Aricks Greaseless Depth Adjustment Handle Kit (L/R)",
   },
   AA050DA: { price: 195.0, title: "Aricks Greaseless Depth Adjustment Handle Kit - Right" },
   AA051DA: { price: 195.0, title: "Aricks Greaseless Depth Adjustment Handle Kit - Left" },
};

export const DEPTH_ADJUSTMENT_PIVOT_LABOR = 65;

function catalogEntry(sku) {
   return DEPTH_ADJUSTMENT_PIVOT_CATALOG[sku] ?? { price: 0, title: sku };
}

function buildSelection(sku, reason) {
   const entry = catalogEntry(sku);
   return { sku, price: entry.price, title: entry.title, reason };
}

function resolveDepthAdjustmentPivotPart(drill) {
   const manufacturer = drill.manufacturer || "";

   if (manufacturer !== "John Deere") return null;

   return buildSelection(
      "AG-K03",
      "Red E HD depth arm pivot kit — JD 60/90/ProSeries (spreadsheet BA180)",
   );
}

export function formatDepthAdjustmentPivotPrice(price) {
   return `$${Number(price).toFixed(2)}`;
}

export function getDepthAdjustmentPivotPartSelection(machineSetup) {
   const drill = getDrillSetup(machineSetup);
   if (!drill?.manufacturer) return null;
   return resolveDepthAdjustmentPivotPart(drill);
}

export function getDepthAdjustmentPivotPartsCostOverride(step, machineSetup) {
   if (step?.slug !== "depth-adjustment-pivot") return null;

   const selection = getDepthAdjustmentPivotPartSelection(machineSetup);
   if (!selection || selection.price <= 0) return null;

   return { low: selection.price, high: selection.price };
}
