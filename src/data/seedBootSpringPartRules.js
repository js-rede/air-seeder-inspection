/**
 * Seed boot spring part selection.
 */

/** @type {Record<string, { price: number, title: string }>} */
export const SEED_BOOT_SPRING_CATALOG = {
   AG2631: { price: 6.0, title: "Heavy Duty Extended Wear Seed Boot Spring" },
};

export const SEED_BOOT_SPRING_LABOR = 35;
export const SEED_BOOT_SPRING_DEFAULT_SKU = "AG2631";

function catalogEntry(sku) {
   return SEED_BOOT_SPRING_CATALOG[sku] ?? { price: 0, title: sku };
}

function buildSelection(sku, reason) {
   const entry = catalogEntry(sku);
   return { sku, price: entry.price, title: entry.title, reason };
}

export function formatSeedBootSpringPrice(price) {
   return `$${Number(price).toFixed(2)}`;
}

export function getSeedBootSpringPartSelection() {
   return buildSelection(SEED_BOOT_SPRING_DEFAULT_SKU, "Heavy duty ext-wear boot spring — catalog default");
}

export function getSeedBootSpringPartsCostOverride(step) {
   if (step?.slug !== "seed-boot-springs") return null;

   const selection = getSeedBootSpringPartSelection();
   if (!selection || selection.price <= 0) return null;

   return { low: selection.price, high: selection.price };
}
