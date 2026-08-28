/**
 * Depth cover and handle part selection from machine setup.
 * Prices from reference/depth-control-cover-handle-qbo-mapping.json (Joe verified 2026-08-28).
 */

import { getDrillSetup } from "./machineCatalog";

/** @type {Record<string, { price: number, title: string }>} */
export const DEPTH_COVER_HANDLE_CATALOG = {
   "AG-K10HD": { price: 49.0, title: "Heavy Duty Depth Control Handle and Cover Kit" },
   AA120F: { price: 42.99, title: "Aricks Heavy Duty Cover Plate" },
   AA710HD: { price: 42.99, title: "Aricks Heavy Duty T Handle" },
};

export const DEPTH_COVER_HANDLE_LABOR = 15;

export const ARICKS_COVER_HANDLE_PARTS_TOTAL =
   DEPTH_COVER_HANDLE_CATALOG.AA120F.price + DEPTH_COVER_HANDLE_CATALOG.AA710HD.price;

function catalogEntry(sku) {
   return DEPTH_COVER_HANDLE_CATALOG[sku] ?? { price: 0, title: sku };
}

function buildSelection(sku, reason) {
   const entry = catalogEntry(sku);
   return { sku, price: entry.price, title: entry.title, reason };
}

function resolveDepthCoverHandlePart(drill) {
   const manufacturer = drill.manufacturer || "";

   if (manufacturer !== "John Deere") return null;

   return buildSelection(
      "AG-K10HD",
      "Red E handle and cover kit — JD 60/90 (spreadsheet BA193)",
   );
}

export function formatDepthCoverHandlePrice(price) {
   return `$${Number(price).toFixed(2)}`;
}

export function formatDepthCoverHandlePriceRange(low, high) {
   const lo = Number(low);
   const hi = Number(high);
   if (lo === hi) return formatDepthCoverHandlePrice(lo);
   return `${formatDepthCoverHandlePrice(lo)}–${formatDepthCoverHandlePrice(hi)}`;
}

export function getDepthCoverHandlePartSelection(machineSetup) {
   const drill = getDrillSetup(machineSetup);
   if (!drill?.manufacturer) return null;
   return resolveDepthCoverHandlePart(drill);
}

export function getDepthCoverHandlePartsCostOverride(step, machineSetup) {
   if (step?.slug !== "depth-cover-handle") return null;

   const selection = getDepthCoverHandlePartSelection(machineSetup);
   if (!selection || selection.price <= 0) return null;

   return { low: selection.price, high: selection.price };
}
