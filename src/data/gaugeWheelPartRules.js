/**
 * Gauge wheel part selection from machine setup + follow-up answers.
 * Prices from reference/gauge-wheels-qbo-mapping.json (Joe verified 2026-08-28).
 */

import { getDrillSetup } from "./machineCatalog";

/** @type {Record<string, { price: number, title: string }>} */
export const GAUGE_WHEEL_CATALOG = {
   RE6019R: { price: 90.0, title: "Red E HD Steel/Steel Gauge Wheels - 3\" x 16\" Rubber" },
   RE6019U: { price: 135.0, title: "Red E HD Steel/Steel Gauge Wheels - 3\" x 16\" Urethane" },
   RE6023R: { price: 95.0, title: "Red E HD Steel/Steel Gauge Wheels - 4-1/2\" x 16\" Rubber" },
   RE6005R: { price: 110.0, title: "Spoked 3/8\" Inner Lip Rubber Gauge Wheel - 3\"" },
   RE6007R: { price: 135.0, title: "Spoked 3/8\" Inner Lip Rubber Gauge Wheel - 4 1/2\"" },
   RE6032R: { price: 135.0, title: "Red E HD Spoked Gauge Wheels - 3\" X 16\" Rubber" },
   RE6032U: { price: 165.0, title: "Red E HD Spoked Gauge Wheels - 3\" X 16\" Urethane" },
   RE6033R: { price: 135.0, title: "Red E HD Spoked Gauge Wheels - 4-1/2\" X 16\" Rubber" },
   RE6034R: { price: 295.0, title: "Red E HD Spoked 18\" Gauge Wheel" },
};

export const GAUGE_WHEEL_LABOR = 30;

export const GAUGE_WHEEL_DEFAULT_SKU = "RE6032R";

function catalogEntry(sku) {
   return GAUGE_WHEEL_CATALOG[sku] ?? { price: 0, title: sku };
}

function buildSelection(sku, reason) {
   const entry = catalogEntry(sku);
   return { sku, price: entry.price, title: entry.title, reason };
}

function isDoubleShootGaugeDrill(drill) {
   const model = drill.model || "";
   if (drill.manufacturer === "New Holland" && /P2082/i.test(model)) return true;
   if (drill.manufacturer === "Case IH" && /precision disk|PD500|500DS|550/i.test(model)) return true;
   if (/N500/i.test(model)) return true;
   return false;
}

function isWideTire(followUps) {
   return followUps["tire-width"] === "4-5-inches";
}

function resolveGaugeWheelPart(drill, followUps = {}) {
   if (!drill?.manufacturer) return null;

   if (isDoubleShootGaugeDrill(drill)) {
      return buildSelection("RE6034R", "18\" spoked gauge wheel — double-shoot Case/NH class drills");
   }

   const style = followUps["inner-wheel-style"] || "";
   const material = followUps["tire-material"] || "";
   const lip = followUps["inner-lip-width"] || "";
   const wide = isWideTire(followUps);

   if (style === "steel-steel") {
      if (!wide && material === "rubber") {
         return buildSelection("RE6019R", "Steel/steel 3\" rubber from follow-up answers");
      }
      if (!wide && material === "urethane") {
         return buildSelection("RE6019U", "Steel/steel 3\" urethane from follow-up answers");
      }
      if (wide && material === "rubber") {
         return buildSelection("RE6023R", "Steel/steel 4.5\" rubber from follow-up answers");
      }
   }

   if (style === "spoked" && lip === "3-8-inches") {
      return buildSelection(
         wide ? "RE6007R" : "RE6005R",
         "Spoked 3/8\" inner lip from follow-up answers",
      );
   }

   if (style === "spoked") {
      if (wide) {
         return buildSelection("RE6033R", "HD spoked 4.5\" x 16\" rubber from follow-up answers");
      }
      if (material === "urethane") {
         return buildSelection("RE6032U", "HD spoked 3\" x 16\" urethane from follow-up answers");
      }
      if (material === "rubber" || !material) {
         return buildSelection("RE6032R", "HD spoked 3\" x 16\" rubber from follow-up answers");
      }
   }

   const hasFollowUps = style || material || lip || followUps["tire-width"];
   if (hasFollowUps) {
      return buildSelection(
         GAUGE_WHEEL_DEFAULT_SKU,
         "Default HD spoked 3\" rubber — incomplete follow-up combo",
      );
   }

   return buildSelection(
      GAUGE_WHEEL_DEFAULT_SKU,
      "Default HD spoked 3\" rubber until gauge wheel follow-ups are answered",
   );
}

export function formatGaugeWheelPrice(price) {
   return `$${Number(price).toFixed(2)}`;
}

export function getGaugeWheelPartSelection(machineSetup, options = {}) {
   const drill = getDrillSetup(machineSetup);
   if (!drill?.manufacturer) return null;
   return resolveGaugeWheelPart(drill, options.followUps ?? {});
}

export function getGaugeWheelPartsCostOverride(step, machineSetup, _secondaryChoice, followUps = null) {
   if (step?.slug !== "gauge-wheel") return null;

   const selection = getGaugeWheelPartSelection(machineSetup, {
      followUps: followUps ?? {},
   });
   if (!selection || selection.price <= 0) return null;

   return { low: selection.price, high: selection.price };
}
