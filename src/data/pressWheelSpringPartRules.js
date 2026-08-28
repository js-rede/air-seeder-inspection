/**
 * Press / firming wheel spring part selection from machine setup + Current setup answer.
 * Prices from reference/press-wheels-spring-qbo-mapping.json (Joe verified 2026-08-28).
 */

import { getDrillSetup } from "./machineCatalog";

/** @type {Record<string, { price: number, title: string }>} */
export const PRESS_WHEEL_SPRING_CATALOG = {
   AG1076: { price: 24.0, title: "Heavy Duty Press/Firming Wheel Arm Spring" },
   "AG1076L / AG1076R": { price: 24.0, title: "HD Press/Firming Wheel Spring — square wire (L/R)" },
   AG2658: { price: 14.5, title: "Press/Firming Wheel Spring" },
   "AG2658L / AG2658R": { price: 14.5, title: "Standard OEM round wire press spring (L/R)" },
};

export const PRESS_WHEEL_SPRING_LABOR = 7;

const SETUP_TO_SKU = {
   "heavy-duty-red-e-square-wire": "AG1076L / AG1076R",
   "standard-round-wire": "AG2658L / AG2658R",
};

const SETUP_LABELS = {
   "heavy-duty-red-e-square-wire": "Heavy Duty Red E Square Wire",
   "standard-round-wire": "Standard Round Wire",
};

function catalogEntry(sku) {
   return PRESS_WHEEL_SPRING_CATALOG[sku] ?? { price: 0, title: sku };
}

function buildSelection(sku, reason) {
   const entry = catalogEntry(sku);
   return { sku, price: entry.price, title: entry.title, reason };
}

function resolvePressWheelSpringPart(drill, secondaryValue) {
   const manufacturer = drill.manufacturer || "";

   if (manufacturer !== "John Deere") return null;

   if (secondaryValue && SETUP_TO_SKU[secondaryValue]) {
      const sku = SETUP_TO_SKU[secondaryValue];
      const label = SETUP_LABELS[secondaryValue] || secondaryValue;
      return buildSelection(sku, `Current setup answer: ${label}`);
   }

   return buildSelection(
      "AG1076L / AG1076R",
      "Default HD press spring until Current setup is answered (JD 60/90)",
   );
}

export function formatPressWheelSpringPrice(price) {
   return `$${Number(price).toFixed(2)}`;
}

export function getPressWheelSpringPartSelection(machineSetup, options = {}) {
   const drill = getDrillSetup(machineSetup);
   if (!drill?.manufacturer) return null;
   return resolvePressWheelSpringPart(drill, options.secondaryValue ?? "");
}

export function getPressWheelSpringPartsCostOverride(step, machineSetup, secondaryChoice) {
   if (step?.slug !== "press-wheel-spring") return null;

   const secondaryValue =
      secondaryChoice && typeof secondaryChoice === "object"
         ? secondaryChoice.value ?? secondaryChoice.label ?? ""
         : secondaryChoice ?? "";

   const selection = getPressWheelSpringPartSelection(machineSetup, { secondaryValue });
   if (!selection || selection.price <= 0) return null;

   return { low: selection.price, high: selection.price };
}
