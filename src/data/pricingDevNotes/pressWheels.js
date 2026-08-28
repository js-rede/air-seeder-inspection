/**
 * Dev notes for press wheels section (pivot, arm, spring wired).
 */

import {
   formatPressWheelArmPrice,
   getPressWheelArmPartSelection,
   PRESS_WHEEL_ARM_CATALOG,
   PRESS_WHEEL_ARM_LABOR,
} from "../pressWheelArmPartRules";
import {
   formatPressWheelPivotPrice,
   getPressWheelPivotPartSelection,
   PRESS_WHEEL_PIVOT_CATALOG,
   PRESS_WHEEL_PIVOT_LABOR,
} from "../pressWheelPivotPartRules";
import {
   formatPressWheelSpringPrice,
   getPressWheelSpringPartSelection,
   PRESS_WHEEL_SPRING_CATALOG,
   PRESS_WHEEL_SPRING_LABOR,
} from "../pressWheelSpringPartRules";
import {
   formatPressWheelPrice,
   getPressWheelPartSelection,
   PRESS_WHEEL_CATALOG,
   PRESS_WHEEL_LABOR,
} from "../pressWheelPartRules";
import { getDrillSetup } from "../machineCatalog";
import { getReplacementTallyCount } from "../../utils/choices";
import { buildQuantityExample, resolveRowUnitCount } from "./shared";

const PRESS_PIVOT_SKUS = [
   "AG-K37",
   "AG-K40",
   "AG-K23-50",
   "AG-K02-50",
   "NA-K08-FULL",
   "NA-K08-50",
   "NA-K07-FULL",
];

const PRESS_PIVOT_PART_NOTES = {
   "AG-K37": "60/90 greaseless — default Red E press pivot",
   "AG-K40": "ProSeries press pivot",
   "AG-K23-50": "50 series greaseless — default Red E",
   "AG-K02-50": "50 series HD — not auto-selected",
   "NA-K08-FULL": "Needham 60/90 press — not auto-selected",
   "NA-K08-50": "Needham 50 series press — not auto-selected",
   "NA-K07-FULL": "Needham closing-oriented — press uses NA-K08 family",
};

function formatPressPivotPartsList(selectedSku) {
   return PRESS_PIVOT_SKUS.map((sku) => {
      const catalog = PRESS_WHEEL_PIVOT_CATALOG[sku];
      return {
         sku,
         price: formatPressWheelPivotPrice(catalog.price),
         note: PRESS_PIVOT_PART_NOTES[sku] ?? catalog.title,
         selected: sku === selectedSku,
      };
   });
}

export function getPressWheelPivotPricingDevNotes(machineSetup, context) {
   const drill = machineSetup ? getDrillSetup(machineSetup) : null;
   const selection = getPressWheelPivotPartSelection(machineSetup);
   const labor = PRESS_WHEEL_PIVOT_LABOR;
   const partsAmount = selection?.price ?? 0;
   const partsPrice = selection ? formatPressWheelPivotPrice(partsAmount) : "catalog part";
   const perUnitTotal = selection ? formatPressWheelPivotPrice(partsAmount + labor) : null;
   const rowUnits = resolveRowUnitCount(drill, context.rowUnitCount);
   const example = buildQuantityExample({
      quantity: rowUnits,
      quantityLabel: "row-units",
      perUnitTotal: selection ? partsAmount + labor : null,
   });

   const subItems = [
      "Pivot condition controls how many row-units get quoted — not which kit variant.",
      "Press pivot SKUs are separate from closing pivot (AG-K37 vs AG-K36, etc.).",
      ...(example?.subItems ?? []),
   ];

   return {
      howAppCalculates: [
         {
            text: perUnitTotal
               ? `MAYBE/BAD on a rank → ${perUnitTotal} total per affected row-unit (${partsPrice} parts + $${labor} labor, from machine setup).`
               : `MAYBE/BAD → ${partsPrice} parts + $${labor} labor per row-unit (complete machine setup for press pivot SKU).`,
            subItems,
         },
         "GOOD (tight from side-to-side) → $0.",
      ],
      possibleSkus: formatPressPivotPartsList(selection?.sku),
      assumptions: [
         ...(drill?.manufacturer
            ? [`Selected for ${drill.manufacturer}${drill.model ? ` ${drill.model}` : ""}: ${selection?.reason ?? "no press pivot SKU mapped yet"}.`]
            : ["Complete machine setup to auto-select press pivot kit."]),
         "Spreadsheet BA130/131/132 are manual kit options — app picks one default greaseless SKU per JD series.",
      ],
      openQuestions: [
         "Confirm BA130 / BA131 / BA132 → AG-K37 / AG-K02-50 / NA-K08-FULL mapping?",
         "50 series default: greaseless AG-K23-50 ($44.85) or HD AG-K02-50 ($77.87)?",
         "PD500 / Case IH / other brands — press pivot SKU?",
         "Labor — Still $70/row-unit on top of parts?",
      ],
      selectedPart: selection
         ? {
              sku: selection.sku,
              price: formatPressWheelPivotPrice(selection.price),
              reason: selection.reason,
           }
         : null,
   };
}

const PRESS_ARM_SKUS = ["AG1030", "AG1142"];

const PRESS_ARM_PART_NOTES = {
   AG1030: "Firming wheel arm — JD 60/90 series",
   AG1142: "Firming wheel arm — JD 50 series (1850, 750, 1830/1835 class)",
};

function formatPressArmPartsList(selectedSku) {
   return PRESS_ARM_SKUS.map((sku) => {
      const catalog = PRESS_WHEEL_ARM_CATALOG[sku];
      return {
         sku,
         price: formatPressWheelArmPrice(catalog.price),
         note: PRESS_ARM_PART_NOTES[sku] ?? catalog.title,
         selected: sku === selectedSku,
      };
   });
}

export function getPressWheelArmPricingDevNotes(machineSetup, context) {
   const drill = machineSetup ? getDrillSetup(machineSetup) : null;
   const selection = getPressWheelArmPartSelection(machineSetup);
   const labor = PRESS_WHEEL_ARM_LABOR;
   const partsAmount = selection?.price ?? 0;
   const partsPrice = selection ? formatPressWheelArmPrice(partsAmount) : "catalog part";
   const perArmTotal = selection ? formatPressWheelArmPrice(partsAmount + labor) : null;
   const tallyCount =
      Number(context.tallyCount) ||
      (context.selectedAnswer != null ? getReplacementTallyCount(context.selectedAnswer) : 0);
   const example = buildQuantityExample({
      quantity: tallyCount > 0 ? tallyCount : null,
      quantityLabel: "arms",
      perUnitTotal: selection ? partsAmount + labor : null,
   });

   const subItems = example?.subItems?.length
      ? example.subItems
      : selection
        ? ["Enter arm count above to see total for this machine."]
        : [];

   return {
      howAppCalculates: [
         {
            text: perArmTotal
               ? `Each tallied arm → ${perArmTotal} total (${partsPrice} parts + $${labor} labor, from machine setup).`
               : `Each tallied arm → ${partsPrice} parts + $${labor} labor (complete machine setup for arm SKU).`,
            subItems,
         },
         "Zero arms tallied → $0.",
      ],
      possibleSkus: formatPressArmPartsList(selection?.sku),
      assumptions: [
         ...(drill?.manufacturer
            ? [`Selected for ${drill.manufacturer}${drill.model ? ` ${drill.model}` : ""}: ${selection?.reason ?? "no firming arm SKU mapped yet"}.`]
            : ["Complete machine setup to auto-select firming wheel arm."]),
         "Press/firming arms (AG1030/AG1142) are separate from closing wheel arms (AG-K19).",
      ],
      openQuestions: [
         "ProSeries on 1890 — AG1030 or different SKU?",
         "Labor — Still $10/arm on top of parts?",
         "Firming arms for Case IH, Bourgault, etc. — which SKUs?",
      ],
      selectedPart: selection
         ? {
              sku: selection.sku,
              price: formatPressWheelArmPrice(selection.price),
              reason: selection.reason,
           }
         : null,
   };
}

const PRESS_SPRING_SKUS = ["AG1076L / AG1076R", "AG2658L / AG2658R"];

const PRESS_SPRING_PART_NOTES = {
   "AG1076L / AG1076R": "HD square wire (L/R) — matches Current setup “Heavy Duty Red E Square Wire”",
   "AG2658L / AG2658R": "Standard OEM round wire replacement (L/R)",
};

function formatPressSpringPartsList(selectedSku) {
   return PRESS_SPRING_SKUS.map((sku) => {
      const catalog = PRESS_WHEEL_SPRING_CATALOG[sku];
      return {
         sku,
         price: formatPressWheelSpringPrice(catalog.price),
         note: PRESS_SPRING_PART_NOTES[sku] ?? catalog.title,
         selected: sku === selectedSku,
      };
   });
}

export function getPressWheelSpringPricingDevNotes(machineSetup, context) {
   const drill = machineSetup ? getDrillSetup(machineSetup) : null;
   const selection = getPressWheelSpringPartSelection(machineSetup, {
      secondaryValue: context.secondaryValue,
   });
   const labor = PRESS_WHEEL_SPRING_LABOR;
   const partsAmount = selection?.price ?? 0;
   const partsPrice = selection ? formatPressWheelSpringPrice(partsAmount) : "catalog part";
   const perUnitTotal = selection ? formatPressWheelSpringPrice(partsAmount + labor) : null;
   const rowUnits = resolveRowUnitCount(drill, context.rowUnitCount);
   const example = buildQuantityExample({
      quantity: rowUnits,
      quantityLabel: "row-units",
      perUnitTotal: selection ? partsAmount + labor : null,
   });

   const setupNote = context.secondaryValue
      ? "Spring part from Current setup answer (see Selected part)."
      : "Spring defaults to HD (AG1076) until Current setup is answered.";

   const subItems = [
      "Spring condition controls how many row-units get quoted — not HD vs round wire.",
      setupNote,
      ...(example?.subItems ?? []),
   ];

   return {
      howAppCalculates: [
         {
            text: perUnitTotal
               ? `MAYBE/BAD on a rank → ${perUnitTotal} total per affected row-unit (${partsPrice} parts + $${labor} labor).`
               : `MAYBE/BAD → ${partsPrice} parts + $${labor} labor per row-unit (complete machine setup + Current setup).`,
            subItems,
         },
         "GOOD (first spring position) → $0.",
      ],
      possibleSkus: formatPressSpringPartsList(selection?.sku),
      assumptions: [
         ...(drill?.manufacturer
            ? [`JD 60/90 catalog springs; selected: ${selection?.reason ?? "pending"}.`]
            : ["Complete machine setup — springs mapped for John Deere 60/90 only so far."]),
         "Separate from closing springs (AG-K14 / CWS-90).",
      ],
      openQuestions: [
         "50 series / ProSeries press spring SKUs?",
         "Labor — Still $7/row-unit on top of parts?",
      ],
      selectedPart: selection
         ? {
              sku: selection.sku,
              price: formatPressWheelSpringPrice(selection.price),
              reason: selection.reason,
           }
         : null,
   };
}

const PRESS_WHEEL_SKUS = ["NA-K01", "V8-WHEEL", "NA-K01-V8-WHEEL"];

const PRESS_WHEEL_PART_NOTES = {
   "NA-K01": "With hardware — app default ($50.00)",
   "V8-WHEEL": "No hardware — alternate ($43.05)",
   "NA-K01-V8-WHEEL": "Catalog variant listing ($43.05–$50.00)",
};

function formatPressWheelPartsList(selectedSku) {
   return PRESS_WHEEL_SKUS.map((sku) => {
      const catalog = PRESS_WHEEL_CATALOG[sku];
      return {
         sku,
         price: formatPressWheelPrice(catalog.price),
         note: PRESS_WHEEL_PART_NOTES[sku] ?? catalog.title,
         selected: sku === selectedSku,
      };
   });
}

export function getPressWheelPricingDevNotes(machineSetup, context) {
   const drill = machineSetup ? getDrillSetup(machineSetup) : null;
   const selection = getPressWheelPartSelection(machineSetup);
   const labor = PRESS_WHEEL_LABOR;
   const partsAmount = selection?.price ?? 0;
   const partsPrice = selection ? formatPressWheelPrice(partsAmount) : "catalog part";
   const perUnitTotal = selection ? formatPressWheelPrice(partsAmount + labor) : null;
   const rowUnits = resolveRowUnitCount(drill, context.rowUnitCount);
   const example = buildQuantityExample({
      quantity: rowUnits,
      quantityLabel: "row-units",
      perUnitTotal: selection ? partsAmount + labor : null,
   });

   const subItems = [
      "Wheel condition controls how many row-units get quoted.",
      ...(example?.subItems ?? []),
   ];

   return {
      howAppCalculates: [
         {
            text: perUnitTotal
               ? `MAYBE/BAD on a rank → ${perUnitTotal} total per affected row-unit (${partsPrice} parts + $${labor} labor).`
               : `MAYBE/BAD → ${partsPrice} parts + $${labor} labor per row-unit (complete machine setup).`,
            subItems,
         },
         "GOOD (wheel and bearing OK) → $0.",
      ],
      possibleSkus: formatPressWheelPartsList(selection?.sku),
      assumptions: [
         ...(drill?.manufacturer
            ? [`V8 wheel for ${drill.manufacturer}${drill.model ? ` ${drill.model}` : ""}: ${selection?.reason ?? "pending"}.`]
            : ["Complete machine setup to select V8 press wheel."]),
         "Used OEM (BA154) and Seed Lock excluded from online estimate.",
      ],
      openQuestions: ["Is NA-K01 the only thing needed here?"],
      selectedPart: selection
         ? {
              sku: selection.sku,
              price: formatPressWheelPrice(selection.price),
              reason: selection.reason,
           }
         : null,
   };
}
