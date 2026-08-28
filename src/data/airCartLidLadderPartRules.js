/**
 * Air cart tank lid + ladder catalog — tentative selection by model, tank size, position.
 * Prices from reference/air-cart-lid-ladder-qbo-mapping.json (Joe verified 2026-08-28).
 */

import { getCartSetup } from "./machineCatalog";

/** @type {Record<string, { price: number, title: string, type?: string, note?: string }>} */
export const AIR_CART_LID_LADDER_CATALOG = {
   JAS4765A: { price: 752.4, title: "Lid Frame Assembly for John Deere 1900 Cart", type: "lid" },
   JAS4799A: { price: 1007.0, title: "Lid Frame Assembly for 1900 & 1910 Carts", type: "lid" },
   JAS4813A: { price: 703.0, title: "John Deere Tank Lid Screen", type: "lid_component", note: "Screen — not full frame" },
   JAS0164K: {
      price: 397.25,
      title: "Stainless Steel Top Ladder & Lid Mount Kit",
      type: "ladder_lid",
      note: "Top tank mount kit",
   },
   JAS0161W: { price: 1331.3, title: "Stainless Steel 80 Bushel Tank Ladder", type: "ladder" },
   JAS0162W: { price: 737.36, title: "Stainless Steel 150 Bushel Front Tank Ladder", type: "ladder" },
   JAS0163W: { price: 737.36, title: "Stainless Steel 200 Bushel Tank Ladder", type: "ladder" },
   JAS4015W: { price: 581.44, title: "Stainless Steel 75 Bushel Tank Ladder", type: "ladder" },
   JAS4025W: { price: 737.36, title: "Stainless Steel 150 Bushel Rear Tank Ladder", type: "ladder" },
   JAS4026W: { price: 737.36, title: "Stainless Steel 120 Bushel Tank Ladder", type: "ladder" },
   "SSK-LDR-EXT": {
      price: 150.0,
      title: "1900 Tank Ladder Extension Kit",
      type: "ladder_addon",
      note: "Add-on for 1900 — not auto-included",
   },
};

export const AIR_CART_LID_LADDER_SKUS = [
   "JAS4765A",
   "JAS4799A",
   "JAS4813A",
   "JAS0164K",
   "JAS4015W",
   "JAS0161W",
   "JAS4026W",
   "JAS0162W",
   "JAS4025W",
   "JAS0163W",
   "SSK-LDR-EXT",
];

const LID_BY_MODEL = {
   "1900": "JAS4765A",
   "1910": "JAS4799A",
   "C-Series": "JAS4799A",
};

function catalogEntry(sku) {
   return AIR_CART_LID_LADDER_CATALOG[sku] ?? { price: 0, title: sku };
}

function buildSelection(sku, reason) {
   const entry = catalogEntry(sku);
   return { sku, price: entry.price, title: entry.title, reason };
}

export function parseCartTankBushels(cart) {
   const label = cart?.tankSize ?? "";
   const match = String(label).match(/(\d+)/);
   return match ? Number(match[1]) : null;
}

/** @returns {"front"|"middle"|"rear"|"single"} */
export function getAirCartTankPosition(step) {
   const slug = step?.slug ?? "";
   if (slug.includes("middle") || step?.position === "middle") return "middle";
   if (slug.includes("rear") || step?.position === "rear") return "rear";
   if (slug.includes("front") || step?.position === "front") return "front";
   return "single";
}

export function estimatePerTankBushels(cart) {
   const total = parseCartTankBushels(cart);
   const tankCount = Number(cart?.tankCount) || 1;
   if (!total || tankCount <= 0) return null;
   return Math.round(total / tankCount);
}

/**
 * @param {object} [machineSetup]
 */
export function getAirCartLidPartSelection(machineSetup) {
   const cart = machineSetup ? getCartSetup(machineSetup) : null;
   if (!cart) return null;

   const model = cart.model ?? "";
   const sku = LID_BY_MODEL[model];

   if (sku) {
      return buildSelection(sku, `JD ${model} — lid frame from cart model`);
   }

   if (cart.manufacturer === "John Deere") {
      return buildSelection("JAS4799A", "John Deere cart — default 1900/1910 lid frame (confirm model)");
   }

   return null;
}

/**
 * @param {object} [machineSetup]
 * @param {object} [step]
 */
export function getAirCartLadderPartSelection(machineSetup, step) {
   const cart = machineSetup ? getCartSetup(machineSetup) : null;
   if (!cart) return null;

   const position = getAirCartTankPosition(step);
   const tankCount = Number(cart.tankCount) || 1;
   const perTankBu = estimatePerTankBushels(cart);

   if (tankCount >= 3 && position === "rear") {
      return buildSelection("JAS0164K", "3-tank cart top (rear) — top ladder & lid mount kit");
   }

   if (perTankBu == null) {
      return null;
   }

   if (perTankBu <= 77) {
      return buildSelection("JAS4015W", `~${perTankBu} bu/tank est. — 75 bu ladder`);
   }
   if (perTankBu <= 85) {
      return buildSelection("JAS0161W", `~${perTankBu} bu/tank est. — 80 bu ladder`);
   }
   if (perTankBu <= 125) {
      return buildSelection("JAS4026W", `~${perTankBu} bu/tank est. — 120 bu ladder`);
   }
   if (perTankBu <= 165) {
      const sku = position === "rear" ? "JAS4025W" : "JAS0162W";
      const side = position === "rear" ? "rear" : "front";
      return buildSelection(sku, `~${perTankBu} bu/tank est. — 150 bu ${side} ladder`);
   }
   if (perTankBu <= 220) {
      return buildSelection("JAS0163W", `~${perTankBu} bu/tank est. — 200 bu ladder`);
   }

   return buildSelection("JAS0163W", `~${perTankBu} bu/tank est. — default 200 bu ladder`);
}

export function formatAirCartLidLadderPrice(price) {
   return `$${Number(price).toFixed(2)}`;
}

/** Ladder add-on SKUs to mention when relevant (not auto-selected). */
export function getAirCartLadderAddonSkus(cart) {
   if (cart?.model === "1900") {
      return ["SSK-LDR-EXT"];
   }
   return [];
}
