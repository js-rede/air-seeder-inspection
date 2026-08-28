/**
 * Seed boot pivot — no catalog parts wired.
 * NA90HDW pivot kit is hidden/OOS; AG-K07-ST stabilizers are a separate product (not this step).
 */

export const SEED_BOOT_PIVOT_LABOR = 40;

export function formatSeedBootPivotPrice(price) {
   return `$${Number(price).toFixed(2)}`;
}

export function getSeedBootPivotPartSelection() {
   return null;
}

export function getSeedBootPivotPartsCostOverride(step) {
   if (step?.slug !== "seed-boot-pivot") return null;
   return null;
}
