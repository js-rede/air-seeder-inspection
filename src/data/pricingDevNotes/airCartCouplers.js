/**
 * Dev notes for air cart couplers step (catalog documented; flat band estimate today).
 */

import {
   formatAirCartCouplerPartsList,
   formatAirCartCouplerPrice,
   getAirCartCouplerPartSelection,
} from "../airCartCouplerPartRules";
import { getCartRunCountLabel, getCartSetup } from "../machineCatalog";
import { formatCostBand } from "./shared";
import { getChoiceCostParts, getPerUnitTotalHigh, getPerUnitTotalLow, getReferenceChoice } from "./stepCosts";

export function getAirCartCouplersPricingDevNotes(step, machineSetup) {
   const cart = machineSetup ? getCartSetup(machineSetup) : null;
   const selection = getAirCartCouplerPartSelection();
   const ref = getReferenceChoice(step);
   const parts = getChoiceCostParts(ref);
   const totalLow = getPerUnitTotalLow(parts);
   const totalHigh = getPerUnitTotalHigh(parts);
   const partsBand = formatCostBand(parts.low, parts.high);
   const totalBand =
      totalLow === totalHigh
         ? formatAirCartCouplerPrice(totalLow)
         : `${formatAirCartCouplerPrice(totalLow)}–${formatAirCartCouplerPrice(totalHigh)}`;
   const runLabel = getCartRunCountLabel(cart);

   return {
      howAppCalculates: [
         {
            text: `MAYBE/BAD → ${totalBand} flat cart estimate (${partsBand} parts + $${parts.labor} labor from inspection-steps.json).`,
            subItems: [
               "Whole-cart step — not multiplied by tank count or run count today.",
               ...(runLabel ? [`Cart setup: ${runLabel} — may relate to 2-port vs 3\" coupler (not wired).`] : []),
               ...(selection
                  ? [
                       `Catalog reference: ${selection.sku} @ ${formatAirCartCouplerPrice(selection.price)} (${selection.reason}).`,
                       `Example if one coupler replaced: ${formatAirCartCouplerPrice(selection.price)} parts — app still uses ${totalBand} band.`,
                    ]
                  : []),
            ],
         },
         "GOOD → $0.",
      ],
      possibleSkus: formatAirCartCouplerPartsList(selection?.sku),
      assumptions: [
         "Flat step band until leadership defines coupler count × SKU logic.",
         "SSK-CPLR-3P shown as tentative default in dev notes only.",
         "Grouped: 3\" QCSS32.5 family, 2-port 3\", 2-port 2.5\".",
      ],
      openQuestions: [
         "Default quote — SSK-CPLR-3P (3\" w/ hardware), QCSS32.5 (coupler only), or 2-port kit?",
         "2.5\" vs 3\" — from hose diameter, run count, or cart model?",
         "How many couplers per cart when MAYBE/BAD — flat band or × count?",
         "L-01-O vs QCSS32.5 — same part, which SKU is canonical?",
      ],
      selectedPart: selection
         ? {
              sku: selection.sku,
              price: formatAirCartCouplerPrice(selection.price),
              reason: selection.reason,
           }
         : null,
   };
}
