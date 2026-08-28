/**
 * Dev notes for drill towers step (manifold SKUs wired by port count).
 */

import {
   formatTowerPrice,
   getTowerPartSelection,
   TOWER_CATALOG,
   TOWER_DEFAULT_SKU,
   TOWER_LABOR,
} from "../towerPartRules";
import { getReplacementTallyCount, getSecondaryAnswer } from "../../utils/choices";
import { buildQuantityExample } from "./shared";

const TOWER_SKUS = ["JDMANKIT-7", "JDMANKIT-8", "JDMANKIT-9", "JDMANKIT-10", "JAS0915", "JAS0915-32"];

const TOWER_PART_NOTES = {
   "JDMANKIT-7": "7-port OEM manifold",
   "JDMANKIT-8": "8-port OEM manifold — default",
   "JDMANKIT-9": "9-port OEM manifold",
   "JDMANKIT-10": "10-port OEM manifold",
   JAS0915: "J-tube 21\" — component, not full manifold?",
   "JAS0915-32": "J-tube 32\" extended — component?",
};

function formatTowerPartsList(selectedSku) {
   return TOWER_SKUS.map((sku) => {
      const entry = TOWER_CATALOG[sku];
      return {
         sku,
         price: formatTowerPrice(entry.price),
         note: TOWER_PART_NOTES[sku] ?? entry.title,
         selected: sku === selectedSku,
      };
   });
}

export function getTowersPricingDevNotes(_machineSetup, context, step) {
   const secondaryValue = context.secondaryValue ?? getSecondaryAnswer(context.selectedAnswer) ?? "";
   const tallyCount =
      Number(context.tallyCount) ||
      (context.selectedAnswer != null ? getReplacementTallyCount(context.selectedAnswer) : 0);
   const selection = getTowerPartSelection(null, { secondaryValue });
   const partsAmount = selection?.price ?? 0;
   const perTowerTotal = partsAmount + TOWER_LABOR;
   const example = buildQuantityExample({
      quantity: tallyCount > 0 ? tallyCount : null,
      quantityLabel: "towers",
      perUnitTotal: selection ? perTowerTotal : null,
   });

   const subItems = [
      "Port count (secondary question) picks JDMANKIT manifold SKU.",
      ...(secondaryValue ? [`Current port count: ${secondaryValue}.`] : [`Defaults to ${TOWER_DEFAULT_SKU} until port count answered.`]),
      "JAS0915 J-tubes listed — confirm manifold vs J-tube for this step.",
      ...(example?.subItems ?? []),
   ];

   if (tallyCount <= 0 && selection) {
      subItems.push("Enter tower replace count above to see total for this machine.");
   }

   return {
      howAppCalculates: [
         {
            text: selection
               ? `Each tallied tower → ${formatTowerPrice(perTowerTotal)} total (${formatTowerPrice(partsAmount)} parts + $${TOWER_LABOR} labor).`
               : `Each tallied tower → parts + $${TOWER_LABOR} labor (select port count for SKU).`,
            subItems,
         },
         "Tally count 0 → $0.",
      ],
      possibleSkus: formatTowerPartsList(selection?.sku),
      assumptions: [
         "Wired: JDMANKIT-7/8/9/10 by port count; other ports default JDMANKIT-8.",
         "Spreadsheet BA266 J-tubes may be JAS0915 — not auto-selected.",
      ],
      openQuestions: [
         "Is this step asking to replace the whole manifold (JDMANKIT) or just J-tubes (JAS0915)? That changes whether $249–266 or $170–200 is the right parts price.",
         "Ports 4–6 and 11–12 — catalog SKU?",
         "Labor — double-check $75/tower?",
      ],
      selectedPart: selection
         ? { sku: selection.sku, price: formatTowerPrice(selection.price), reason: selection.reason }
         : null,
      secondaryValue: secondaryValue || null,
   };
}
