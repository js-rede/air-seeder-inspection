/**
 * Air cart coupler catalog — whole-cart step; selection TBD.
 * Prices from reference/air-cart-couplers-qbo-mapping.json (Joe verified 2026-08-28).
 */

/** @type {Record<string, { price: number, priceHigh?: number, title: string, group: string, note?: string }>} */
export const AIR_CART_COUPLER_CATALOG = {
   "L-01-O": {
      price: 294.6,
      priceHigh: 322.2,
      title: "QCSS32.5",
      group: "3 in coupler",
      note: "Woo variant range",
   },
   "QCSS32.5": {
      price: 294.6,
      title: "QCSS32.5 - Coupler Only",
      group: "3 in coupler",
   },
   "SSK-CPLR-3P": {
      price: 322.2,
      title: "QCSS32.5 - Coupler with Hardware",
      group: "3 in coupler",
   },
   "QCSS-2-3": {
      price: 307.48,
      title: "2-Port Coupling Kit - 3\" Coupler",
      group: "2-port 3 in",
   },
   "QCSS22.5": {
      price: 248.43,
      title: "2-Port Coupling Kit - 2.5\" Coupler",
      group: "2-port 2.5 in",
   },
   "SSK-CPLR-2P": {
      price: 309.03,
      title: "2-Port Coupling Kit - 2.5\" w/ hardware",
      group: "2-port 2.5 in",
   },
   "SSK-CPLR-2P--QCSS22.5": {
      price: 248.43,
      priceHigh: 309.03,
      title: "Stainless Steel 2-Port Coupling Kit",
      group: "2-port 2.5 in",
      note: "Woo variant group",
   },
};

export const AIR_CART_COUPLER_SKUS = [
   "QCSS32.5",
   "SSK-CPLR-3P",
   "L-01-O",
   "QCSS-2-3",
   "QCSS22.5",
   "SSK-CPLR-2P",
   "SSK-CPLR-2P--QCSS22.5",
];

const GROUP_ORDER = ["3 in coupler", "2-port 3 in", "2-port 2.5 in"];

export function formatAirCartCouplerPrice(price, priceHigh) {
   const lo = Number(price);
   if (priceHigh != null && Number(priceHigh) !== lo) {
      return `$${lo.toFixed(2)}–$${Number(priceHigh).toFixed(2)}`;
   }
   return `$${lo.toFixed(2)}`;
}

/** Tentative default for dev notes — confirm with leadership. */
export function getAirCartCouplerPartSelection() {
   return {
      sku: "SSK-CPLR-3P",
      price: AIR_CART_COUPLER_CATALOG["SSK-CPLR-3P"].price,
      title: AIR_CART_COUPLER_CATALOG["SSK-CPLR-3P"].title,
      reason: "Tentative default — 3\" coupler with hardware (confirm vs coupler-only or 2-port kits)",
   };
}

export function formatAirCartCouplerPartsList(selectedSku) {
   const byGroup = Object.fromEntries(GROUP_ORDER.map((group) => [group, []]));

   for (const sku of AIR_CART_COUPLER_SKUS) {
      const entry = AIR_CART_COUPLER_CATALOG[sku];
      byGroup[entry.group]?.push({
         sku,
         price: formatAirCartCouplerPrice(entry.price, entry.priceHigh),
         note: entry.note ?? entry.title,
         group: entry.group,
         selected: sku === selectedSku,
      });
   }

   return GROUP_ORDER.flatMap((group) => byGroup[group] ?? []);
}
