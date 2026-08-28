/**
 * Air cart upper kit selection — SSK-UPR vs SSK-UPR-NEW by cart/tank config.
 * Prices from reference/air-cart-upper-kits-qbo-mapping.json (Joe verified 2026-08-28).
 */

import { getCartSetup } from "./machineCatalog";

/** @type {Record<string, { price: number, title: string, when?: string, note?: string }>} */
export const AIR_CART_UPPER_CATALOG = {
   "SSK-UPR": {
      price: 1824.73,
      title: "Stainless Steel Upper Kit",
      when: "All other JD models",
   },
   "SSK-UPR-NEW": {
      price: 1824.73,
      title: "Stainless Steel Upper Kit",
      when: "550-Middle & related configs",
   },
};

export const AIR_CART_UPPER_SKUS = ["SSK-UPR", "SSK-UPR-NEW"];

function buildSelection(sku, reason) {
   const entry = AIR_CART_UPPER_CATALOG[sku];
   return { sku, price: entry.price, title: entry.title, reason };
}

function is550MiddleTank(step, cart) {
   const isMiddleTank =
      step?.slug === "air-cart-middle-tank" || Number(step?.tank_index) === 2;
   const is550 =
      cart?.tankSize === "550 bu" ||
      String(cart?.model ?? "").includes("550");

   return isMiddleTank && is550;
}

/**
 * @param {object} [machineSetup]
 * @param {object} [step]
 * @param {string} [upperSetupSecondary] — current-upper-kit secondary answer
 */
export function getAirCartUpperPartSelection(machineSetup, step, upperSetupSecondary = "") {
   if (upperSetupSecondary !== "stainless-steel") {
      return null;
   }

   const cart = machineSetup ? getCartSetup(machineSetup) : null;
   if (!cart) {
      return null;
   }

   if (is550MiddleTank(step, cart)) {
      return buildSelection(
         "SSK-UPR-NEW",
         "550 bu middle tank — SSK-UPR-NEW (tentative; confirm full Woo fit list)",
      );
   }

   if (cart.manufacturer === "John Deere") {
      return buildSelection("SSK-UPR", "John Deere cart — SSK-UPR (all other JD models)");
   }

   return null;
}

export function formatAirCartUpperPrice(price) {
   return `$${Number(price).toFixed(2)}`;
}
