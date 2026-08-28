/**
 * Disc hub part selection from machine setup.
 * Prices from reference/openers-disc-hubs-qbo-mapping.json (Joe verified 2026-08-28).
 */

import { getDrillSetup } from "./machineCatalog";

/** @type {Record<string, { price: number, title: string }>} */
export const DISC_HUB_CATALOG = {
   "AG-K15": { price: 20.0, title: "Opening Disc Hub Seal and Wear Ring Kit" },
   "AG-K15-FULL": { price: 79.5, title: "Opening Disc Hub Seal, Wear Ring and Bearing Kit" },
   "SDX-K08-SM": { price: 95.35, title: "SDX Disc Hub Rebuild Kit - Small" },
   "SDX-K08-MD": { price: 139.85, title: "SDX Disc Hub Rebuild Kit - Medium" },
   "SDX-K08-LG": { price: 107.85, title: "SDX Disc Hub Rebuild Kit - Large" },
};

export const DISC_HUB_LABOR = 120;

/** Case IH SDX hub kit prices — size is spindle/serial-dependent, not model. */
export const SDX_HUB_PARTS_RANGE = { low: 95.35, high: 139.85 };

const SDX_HUB_SKUS = ["SDX-K08-SM", "SDX-K08-MD", "SDX-K08-LG"];

function catalogEntry(sku) {
   return DISC_HUB_CATALOG[sku] ?? { price: 0, title: sku };
}

function buildSelection(sku, reason) {
   const entry = catalogEntry(sku);
   return { sku, price: entry.price, title: entry.title, reason };
}

function buildSdxRangeSelection(reason) {
   return {
      sku: "SDX-K08 (SM / MD / LG)",
      isRange: true,
      priceLow: SDX_HUB_PARTS_RANGE.low,
      priceHigh: SDX_HUB_PARTS_RANGE.high,
      title: "SDX Disc Hub Rebuild Kit",
      reason,
      skusInRange: SDX_HUB_SKUS,
   };
}

function isCaseSdxDrill(drill) {
   const model = drill.model || "";
   return drill.manufacturer === "Case IH" && /precision disk/i.test(model);
}

function resolveDiscHubPart(drill) {
   const manufacturer = drill.manufacturer || "";

   if (manufacturer === "John Deere") {
      return buildSelection(
         "AG-K15-FULL",
         "Full hub rebuild kit for John Deere air drills (1890-class; confirm 1860/1990)",
      );
   }

   if (isCaseSdxDrill(drill)) {
      return buildSdxRangeSelection(
         "Hub size (SM/MD/LG) depends on spindle shoulder diameter and serial number — app quotes full SDX catalog parts range",
      );
   }

   return null;
}

export function formatDiscHubPrice(price) {
   return `$${Number(price).toFixed(2)}`;
}

export function formatDiscHubPriceRange(low, high) {
   const lo = Number(low);
   const hi = Number(high);
   if (lo === hi) return formatDiscHubPrice(lo);
   return `${formatDiscHubPrice(lo)}–${formatDiscHubPrice(hi)}`;
}

export function getDiscHubPartSelection(machineSetup) {
   const drill = getDrillSetup(machineSetup);
   if (!drill?.manufacturer) return null;
   return resolveDiscHubPart(drill);
}

export function getDiscHubPartsCostOverride(step, machineSetup) {
   if (step?.slug !== "disc-hubs") return null;

   const selection = getDiscHubPartSelection(machineSetup);
   if (!selection) return null;

   if (selection.isRange) {
      return { low: selection.priceLow, high: selection.priceHigh };
   }

   if (selection.price <= 0) return null;

   return { low: selection.price, high: selection.price };
}
