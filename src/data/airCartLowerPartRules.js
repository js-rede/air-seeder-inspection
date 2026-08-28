/**
 * Air cart lower kit selection from cart shoot quantity + run count.
 * Prices from reference/air-cart-lowers-qbo-mapping.json (Joe verified 2026-08-28).
 */

import { getCartRunCountLabel, getCartSetup, getCartShootQuantityLabel } from "./machineCatalog";

/** @type {Record<string, { price: number, title: string, note?: string }>} */
export const AIR_CART_LOWER_CATALOG = {
   JAS1032W: {
      price: 533.32,
      title: "Stainless Steel Intermediate Manifold Weldment",
      note: "Component — not full lower kit",
   },
   JAS1037A: {
      price: 1750.24,
      title: "Stainless Steel Lower Tank Hopper/Cradle",
      note: "Hopper/cradle — confirm vs full kit",
   },
   RE3680: {
      price: 1750.0,
      title: "Red E Stainless Steel Single Shoot Lower Kit",
      note: "Red E alternate to SSK-SS*",
   },
   "RE3680-TBH": {
      price: 1750.0,
      title: "Red E Single Shoot Lower Kit - Tow Behind (BH)",
      note: "Tow-behind variant",
   },
   "RE3680-TBT": {
      price: 1750.0,
      title: "Red E Single Shoot Lower Kit - Tow Behind (BT)",
      note: "Tow-behind variant",
   },
   "SSK-DS4": { price: 1567.34, title: "Stainless Steel Double Shoot Lower Kit - 4" },
   "SSK-DS5": { price: 1541.11, title: "Stainless Steel Double Shoot Lower Kit - 5" },
   "SSK-DS6": { price: 1604.03, title: "Stainless Steel Double Shoot Lower Kit - 6" },
   "SSK-DS8": { price: 1628.11, title: "Stainless Steel Double Shoot Lower Kit - 8" },
   "SSK-SS4": { price: 1111.83, title: "Stainless Steel Single Shoot Lower Kit - 4" },
   "SSK-SS6": { price: 1098.73, title: "Stainless Steel Single Shoot Lower Kit - 6" },
   "SSK-SS8": { price: 1057.83, title: "Stainless Steel Single Shoot Lower Kit - 8" },
};

export const AIR_CART_LOWER_SKUS = [
   "SSK-SS4",
   "SSK-SS6",
   "SSK-SS8",
   "SSK-DS4",
   "SSK-DS6",
   "SSK-DS8",
   "RE3680",
   "RE3680-TBH",
   "RE3680-TBT",
   "JAS1037A",
   "JAS1032W",
   "SSK-DS5",
];

const SHOOT_AND_RUN_TO_SKU = {
   single: { 4: "SSK-SS4", 6: "SSK-SS6", 8: "SSK-SS8" },
   double: { 4: "SSK-DS4", 6: "SSK-DS6", 8: "SSK-DS8" },
};

function catalogEntry(sku) {
   return AIR_CART_LOWER_CATALOG[sku] ?? { price: 0, title: sku };
}

function buildSelection(sku, reason) {
   const entry = catalogEntry(sku);
   return { sku, price: entry.price, title: entry.title, note: entry.note ?? "", reason };
}

/**
 * Resolve lower kit SKU from cart machine setup (shoot quantity + run count).
 * @param {object} [machineSetup]
 */
export function getAirCartLowerPartSelection(machineSetup) {
   const cart = machineSetup ? getCartSetup(machineSetup) : null;
   const shoot = cart?.shootQuantity ?? "";
   const runs = String(cart?.runCount ?? "");
   const shootLabel = getCartShootQuantityLabel(cart);
   const runLabel = getCartRunCountLabel(cart);

   if (!shoot || !runs) {
      return null;
   }

   if (shoot === "triple") {
      return null;
   }

   const shootMap = SHOOT_AND_RUN_TO_SKU[shoot];
   const sku = shootMap?.[Number(runs)] ?? shootMap?.[runs];

   if (sku) {
      return buildSelection(
         sku,
         `${shootLabel || shoot} + ${runLabel || `${runs} runs`} from cart setup`,
      );
   }

   return null;
}

export function formatAirCartLowerPrice(price) {
   return `$${Number(price).toFixed(2)}`;
}

export const AIR_CART_TANK_STEP_SLUGS = new Set([
   "air-cart",
   "air-cart-tank",
   "air-cart-front-tank",
   "air-cart-middle-tank",
   "air-cart-rear-tank",
]);

export function isAirCartTankStep(step) {
   return AIR_CART_TANK_STEP_SLUGS.has(step?.slug);
}
