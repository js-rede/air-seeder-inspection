/**
 * Drill tower / manifold part selection from port count (secondary answer).
 * Prices from reference/drill-towers-qbo-mapping.json (Joe verified 2026-08-28).
 */

/** @type {Record<string, { price: number, title: string }>} */
export const TOWER_CATALOG = {
   "JDMANKIT-7": { price: 249.0, title: "John Deere OEM Secondary Tower Manifold Kit - 7" },
   "JDMANKIT-8": { price: 249.0, title: "John Deere OEM Secondary Tower Manifold Kit - 8" },
   "JDMANKIT-9": { price: 256.0, title: "John Deere OEM Secondary Tower Manifold Kit - 9" },
   "JDMANKIT-10": { price: 266.0, title: "John Deere OEM Secondary Tower Manifold Kit - 10" },
   JAS0915: { price: 170.0, title: 'Secondary Distribution Tower "J" Tube - 21" Standard' },
   "JAS0915-32": { price: 200.0, title: 'Secondary Distribution Tower "J" Tube - 32" Extended' },
};

export const TOWER_LABOR = 75;
export const TOWER_DEFAULT_SKU = "JDMANKIT-8";

const PORT_TO_SKU = {
   "7": "JDMANKIT-7",
   "8": "JDMANKIT-8",
   "9": "JDMANKIT-9",
   "10": "JDMANKIT-10",
};

function catalogEntry(sku) {
   return TOWER_CATALOG[sku] ?? { price: 0, title: sku };
}

function buildSelection(sku, reason) {
   const entry = catalogEntry(sku);
   return { sku, price: entry.price, title: entry.title, reason };
}

function resolveTowerPart(secondaryValue) {
   const sku = PORT_TO_SKU[secondaryValue];
   if (sku) {
      return buildSelection(sku, `${secondaryValue}-port manifold from tower port count`);
   }

   if (secondaryValue) {
      return buildSelection(
         TOWER_DEFAULT_SKU,
         `No catalog manifold for ${secondaryValue} ports — default ${TOWER_DEFAULT_SKU}`,
      );
   }

   return buildSelection(
      TOWER_DEFAULT_SKU,
      `Default ${TOWER_DEFAULT_SKU} until port count is answered`,
   );
}

export function formatTowerPrice(price) {
   return `$${Number(price).toFixed(2)}`;
}

export function getTowerPartSelection(_machineSetup, options = {}) {
   return resolveTowerPart(options.secondaryValue ?? "");
}

export function getTowerPartsCostOverride(step, _machineSetup, secondaryChoice) {
   if (step?.slug !== "towers") return null;

   const secondaryValue =
      secondaryChoice && typeof secondaryChoice === "object"
         ? secondaryChoice.value ?? secondaryChoice.label ?? ""
         : secondaryChoice ?? "";

   const selection = getTowerPartSelection(null, { secondaryValue });
   if (!selection || selection.price <= 0) return null;

   return { low: selection.price, high: selection.price };
}
