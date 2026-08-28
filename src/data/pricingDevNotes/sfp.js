/**
 * Dev notes for SFP row-unit parts (multi-select, catalog per checkbox).
 */

import {
   formatSfpPrice,
   getSfpChoiceLabel,
   getSfpChoicePartSelection,
   SFP_ALTERNATE_SKUS,
   SFP_CHOICE_CATALOG,
   SFP_LABOR_PER_ITEM,
} from "../sfpPartRules";
import { getDrillSetup } from "../machineCatalog";
import { getMultiSelectionAnswer } from "../../utils/choices";
import { buildQuantityExample, resolveRowUnitCount } from "./shared";

const ALL_CHOICE_VALUES = [
   "bumper-stops",
   "ss-liquid-tubes",
   "ss-dry-tubes",
   "ss-nh3-tubes",
   "sfp-cruiser-cw",
   "sfp-springs",
];

function formatSfpPartsList(selectedValues) {
   return ALL_CHOICE_VALUES.map((value) => {
      const catalog = SFP_CHOICE_CATALOG[value];
      if (catalog) {
         return {
            sku: catalog.sku,
            price: formatSfpPrice(catalog.price),
            note: getSfpChoiceLabel(value),
            selected: selectedValues.includes(value),
         };
      }
      return {
         sku: "n/a",
         price: null,
         note: getSfpChoiceLabel(value),
         selected: selectedValues.includes(value),
      };
   });
}

export function getSfpRowUnitPartsPricingDevNotes(machineSetup, context, step) {
   const drill = machineSetup ? getDrillSetup(machineSetup) : null;
   const rowUnits = resolveRowUnitCount(drill, context.rowUnitCount);
   const selectedValues = getMultiSelectionAnswer(context.selectedAnswer ?? []);

   const perItemLines = selectedValues.map((value) => {
      const selection = getSfpChoicePartSelection(value);
      const perUnit = selection ? selection.price + SFP_LABOR_PER_ITEM : null;
      if (selection && perUnit != null) {
         return `${getSfpChoiceLabel(value)} → ${formatSfpPrice(perUnit)}/row-unit (${formatSfpPrice(selection.price)} + $${SFP_LABOR_PER_ITEM} labor)`;
      }
      return `${getSfpChoiceLabel(value)} → step JSON band + $${SFP_LABOR_PER_ITEM} labor/row-unit (no catalog SKU)`;
   });

   const exampleItem = selectedValues.find((v) => SFP_CHOICE_CATALOG[v]);
   const exampleSelection = exampleItem ? getSfpChoicePartSelection(exampleItem) : null;
   const example = buildQuantityExample({
      quantity: rowUnits,
      quantityLabel: "row-units",
      perUnitTotal: exampleSelection ? exampleSelection.price + SFP_LABOR_PER_ITEM : null,
   });

   return {
      howAppCalculates: [
         {
            text: `Each checked item × row-unit count (+ $${SFP_LABOR_PER_ITEM} labor per item per row-unit).`,
            subItems: [
               "Only selected checkboxes are added to the estimate.",
               ...(perItemLines.length ? perItemLines : ["Select items above to see per-line pricing."]),
               ...(example?.subItems ?? []),
            ],
         },
         "Nothing selected → $0.",
      ],
      possibleSkus: [
         ...formatSfpPartsList(selectedValues),
         {
            sku: "AG1254",
            price: formatSfpPrice(SFP_ALTERNATE_SKUS.AG1254.price),
            note: "Copperhead cruiser — alternate to SFP CRUISER",
            selected: false,
         },
      ],
      assumptions: [
         ...(drill?.manufacturer
            ? [`Machine: ${drill.manufacturer}${drill.model ? ` ${drill.model}` : ""} — ${rowUnits ?? "?"} row-units when set.`]
            : []),
         "Today: each checked item × full row-unit count (+ $5 labor/item) — no way to enter how many actually need replacing.",
         "Springs + NH3 tubes unmapped — keep inspection-steps.json bands until SKUs confirmed.",
      ],
      openQuestions: [
         "Not sure how to calculate SFP row-unit parts — is checkbox × full row-unit count the right model, or something else?",
         "Is one multi-select step (all 6 items on this page) the best UX, or should these be split into separate steps?",
         "Should the user enter how many need replacing (per item), instead of assuming every row-unit needs each checked part?",
         "SFP springs — which SKU (if any)? SS NH3 tubes — catalog SKU?",
         "Dry tube AG2620 — one per row-unit or L+R? SFP CRUISER vs AG1254 Copperhead ($115)? AG-K29 for liquid tubes?",
      ],
      selectedPart: null,
   };
}
