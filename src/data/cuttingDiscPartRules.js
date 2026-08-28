/**
 * Cutting disc part selection from machine setup.
 * Prices from reference/openers-cutting-discs-qbo-mapping.json (Joe verified 2026-08-28).
 */

import { getDrillSetup } from "./machineCatalog";

/** @type {Record<string, { price: number, title: string }>} */
export const CUTTING_DISC_CATALOG = {
   RE6000: { price: 49.0, title: "18\" JD Ingersoll Hi-Hard Opener Disc" },
   RE6001RZR: { price: 53.0, title: "18-5/8\" JD Ingersoll Hi-Hard Opener Disc" },
   RE6002RZR: { price: 53.0, title: "18-5/8\" PD500 Ingersoll Hi-Hard Opener Disc" },
   RE6003RZR: { price: 53.0, title: "18-5/8\" Amity Ingersoll Hi-Hard Opener Disc" },
   RE6004: { price: 55.0, title: "20-1/2\" Bourgault Ingersoll Hi-Hard Opener Disc" },
   RE4926: { price: 59.0, title: "19\" JD Notched Opener Disc (30 Pointer)" },
   RE4930: { price: 49.0, title: "Forges de Niaux 200 18\" Opener Disc" },
   RE4931RZR: { price: 55.0, title: "Forges de Niaux 200 18-5/8\" Opener Disc" },
   RE6080: { price: 70.0, title: "19\" Horsch Avatar Disc (Niaux 200)" },
};

export const CUTTING_DISC_LABOR = 30;

function catalogEntry(sku) {
   return CUTTING_DISC_CATALOG[sku] ?? { price: 0, title: sku };
}

function buildSelection(sku, reason) {
   const entry = catalogEntry(sku);
   return { sku, price: entry.price, title: entry.title, reason };
}

function isProSeriesDrill(drill) {
   if (drill.rowUnitSeries === "proseries") return true;
   return /\bproseries\b/i.test(drill.model || "");
}

function isPd500Drill(drill) {
   const model = drill.model || "";
   if (/N500/i.test(model)) return true;
   if (drill.manufacturer === "New Holland" && /P20/i.test(model)) return true;
   return false;
}

function resolveCuttingDiscPart(drill) {
   const manufacturer = drill.manufacturer || "";

   if (manufacturer === "Bourgault") {
      return buildSelection("RE6004", "Bourgault drill from machine setup");
   }
   if (manufacturer === "Amity / Concord") {
      return buildSelection("RE6003RZR", "Amity / Concord drill from machine setup");
   }
   if (isPd500Drill(drill)) {
      return buildSelection("RE6002RZR", "PD500-class drill model from machine setup");
   }
   if (manufacturer === "John Deere" && isProSeriesDrill(drill)) {
      return buildSelection("RE4931RZR", "ProSeries row-unit series — 18-5/8\" Niaux disc");
   }
   if (manufacturer === "John Deere") {
      return buildSelection("RE6000", "Default 18\" Ingersoll Hi-Hard for John Deere 60/90");
   }

   return buildSelection("RE6000", "Default 18\" Ingersoll Hi-Hard (generic drill fallback)");
}

export function formatCuttingDiscPrice(price) {
   return `$${Number(price).toFixed(2)}`;
}

export function getCuttingDiscPartSelection(machineSetup) {
   const drill = getDrillSetup(machineSetup);
   if (!drill?.manufacturer) return null;
   return resolveCuttingDiscPart(drill);
}

export function getCuttingDiscPartsCostOverride(step, machineSetup) {
   if (step?.slug !== "cutting-discs") return null;

   const selection = getCuttingDiscPartSelection(machineSetup);
   if (!selection || selection.price <= 0) return null;

   return { low: selection.price, high: selection.price };
}
