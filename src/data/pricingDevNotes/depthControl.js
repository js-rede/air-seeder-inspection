/**
 * Dev notes for depth_control section (pivot + arm wired).
 */

import {
   DEPTH_ADJUSTMENT_PIVOT_CATALOG,
   DEPTH_ADJUSTMENT_PIVOT_LABOR,
   formatDepthAdjustmentPivotPrice,
   getDepthAdjustmentPivotPartSelection,
} from "../depthAdjustmentPivotPartRules";
import {
   DEPTH_ARM_CATALOG,
   DEPTH_ARM_LABOR,
   formatDepthArmPrice,
   getDepthArmPartSelection,
} from "../depthArmPartRules";
import {
   ARICKS_COVER_HANDLE_PARTS_TOTAL,
   DEPTH_COVER_HANDLE_CATALOG,
   DEPTH_COVER_HANDLE_LABOR,
   formatDepthCoverHandlePrice,
   getDepthCoverHandlePartSelection,
} from "../depthCoverHandlePartRules";
import { getDrillSetup } from "../machineCatalog";
import { getReplacementTallyCount } from "../../utils/choices";
import { buildQuantityExample, resolveRowUnitCount } from "./shared";

const DEPTH_PIVOT_SKUS = ["AG-K03", "AA050DA / AA051DA", "AA050DA", "AA051DA"];

const DEPTH_PIVOT_PART_NOTES = {
   "AG-K03": "Red E HD depth arm pivot — default JD 60/90/ProSeries (BA180)",
   "AA050DA / AA051DA": "Aricks handle kit — alternate BA181, not auto-selected",
   AA050DA: "Aricks handle kit — Right; may belong Step 16",
   AA051DA: "Aricks handle kit — Left; may belong Step 16",
};

const DEPTH_PIVOT_MISSING = [{ sku: "BA195", note: "Depth Adjuster Slop Fix (K32) — SKU not found yet" }];

function formatDepthPivotPartsList(selectedSku) {
   const catalogRows = DEPTH_PIVOT_SKUS.map((sku) => {
      const catalog = DEPTH_ADJUSTMENT_PIVOT_CATALOG[sku];
      return {
         sku,
         price: formatDepthAdjustmentPivotPrice(catalog.price),
         note: DEPTH_PIVOT_PART_NOTES[sku] ?? catalog.title,
         selected: sku === selectedSku,
      };
   });

   const missingRows = DEPTH_PIVOT_MISSING.map((item) => ({
      sku: item.sku,
      price: "TBD",
      note: item.note,
      selected: false,
   }));

   return [...catalogRows, ...missingRows];
}

export function getDepthAdjustmentPivotPricingDevNotes(machineSetup, context) {
   const drill = machineSetup ? getDrillSetup(machineSetup) : null;
   const selection = getDepthAdjustmentPivotPartSelection(machineSetup);
   const labor = DEPTH_ADJUSTMENT_PIVOT_LABOR;
   const partsAmount = selection?.price ?? 0;
   const partsPrice = selection ? formatDepthAdjustmentPivotPrice(partsAmount) : "catalog part";
   const perUnitTotal = selection ? formatDepthAdjustmentPivotPrice(partsAmount + labor) : null;
   const rowUnits = resolveRowUnitCount(drill, context.rowUnitCount);
   const example = buildQuantityExample({
      quantity: rowUnits,
      quantityLabel: "row-units",
      perUnitTotal: selection ? partsAmount + labor : null,
   });

   const subItems = [
      "Pivot condition controls how many row-units get quoted — not which kit variant.",
      "Step 15 (depth arm) is a different part — loose arm on shaft, not AG-K03 pivot kit.",
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
         "GOOD (move freely) → $0.",
      ],
      possibleSkus: formatDepthPivotPartsList(selection?.sku),
      assumptions: [
         ...(drill?.manufacturer
            ? [`Selected for ${drill.manufacturer}${drill.model ? ` ${drill.model}` : ""}: ${selection?.reason ?? "no pivot SKU mapped yet"}.`]
            : ["Complete machine setup to auto-select pivot kit."]),
         "AG-K03 maps to spreadsheet BA180 Red E HD DA Pivot.",
      ],
      openQuestions: [
         "Are AA05* Aricks kits Step 16 (cover/handle) or an alternate for Step 14 (BA181)?",
         "Depth Adjuster Slop Fix (BA195 / K32) — separate SKU for this step?",
         "Labor — Still $65/row-unit on top of parts?",
      ],
      selectedPart: selection
         ? {
              sku: selection.sku,
              price: formatDepthAdjustmentPivotPrice(selection.price),
              reason: selection.reason,
           }
         : null,
   };
}

const DEPTH_ARM_SKUS = ["AG-K08", "RE3040L / RE3040R"];

const DEPTH_ARM_PART_NOTES = {
   "AG-K08": "Universal depth adjuster arm — JD default (BA194 / K08)",
   "RE3040L / RE3040R": "Case IH SDX depth adjuster arm",
};

function formatDepthArmPartsList(selectedSku) {
   return DEPTH_ARM_SKUS.map((sku) => {
      const catalog = DEPTH_ARM_CATALOG[sku];
      return {
         sku,
         price: formatDepthArmPrice(catalog.price),
         note: DEPTH_ARM_PART_NOTES[sku] ?? catalog.title,
         selected: sku === selectedSku,
      };
   });
}

export function getDepthArmPricingDevNotes(machineSetup, context) {
   const drill = machineSetup ? getDrillSetup(machineSetup) : null;
   const selection = getDepthArmPartSelection(machineSetup);
   const labor = DEPTH_ARM_LABOR;
   const partsAmount = selection?.price ?? 0;
   const partsPrice = selection ? formatDepthArmPrice(partsAmount) : "catalog part";
   const perArmTotal = selection ? formatDepthArmPrice(partsAmount + labor) : null;
   const tallyCount =
      Number(context.tallyCount) ||
      (context.selectedAnswer != null ? getReplacementTallyCount(context.selectedAnswer) : 0);
   const rowUnits = resolveRowUnitCount(drill, context.rowUnitCount);
   const quantity = tallyCount > 0 ? tallyCount : rowUnits;
   const quantityLabel = tallyCount > 0 ? "arms" : "row-units";
   const example = buildQuantityExample({
      quantity: quantity > 0 ? quantity : null,
      quantityLabel,
      perUnitTotal: selection ? partsAmount + labor : null,
   });

   const subItems = [
      "BAD on a rank quotes all row-units in that rank; optional arm count quotes that number instead.",
      "Different from Step 14 AG-K03 pivot kit.",
      ...(example?.subItems ?? []),
   ];

   if (quantity <= 0 && selection) {
      subItems.push("Enter arm count or rate a rank BAD to see total for this machine.");
   }

   return {
      howAppCalculates: [
         {
            text: perArmTotal
               ? `Each affected arm/row-unit → ${perArmTotal} total (${partsPrice} parts + $${labor} labor, from machine setup).`
               : `BAD or arm count → ${partsPrice} parts + $${labor} labor (complete machine setup for arm SKU).`,
            subItems,
         },
         "GOOD (arms tight) → $0.",
      ],
      possibleSkus: formatDepthArmPartsList(selection?.sku),
      assumptions: [
         ...(drill?.manufacturer
            ? [`Selected for ${drill.manufacturer}${drill.model ? ` ${drill.model}` : ""}: ${selection?.reason ?? "no depth arm SKU mapped yet"}.`]
            : ["Complete machine setup to auto-select depth arm kit."]),
         "AG-K03 is the pivot kit (Step 14), not the arm for this step.",
      ],
      openQuestions: [
         "Confirm AG-K08 is the depth arm when shaft spins freely in arm?",
         "Case SDX: RE3040 vs AG-K08?",
         "Labor — Still $25/arm (or row-unit) on top of parts?",
      ],
      selectedPart: selection
         ? {
              sku: selection.sku,
              price: formatDepthArmPrice(selection.price),
              reason: selection.reason,
           }
         : null,
   };
}

const DEPTH_COVER_HANDLE_SKUS = ["AG-K10HD", "AA120F", "AA710HD"];

const DEPTH_COVER_HANDLE_PART_NOTES = {
   "AG-K10HD": "Red E combined handle + cover — default (BA193)",
   AA120F: "Aricks cover plate only — sold separately",
   AA710HD: "Aricks T handle only — sold separately",
};

function formatDepthCoverHandlePartsList(selectedSku) {
   return DEPTH_COVER_HANDLE_SKUS.map((sku) => {
      const catalog = DEPTH_COVER_HANDLE_CATALOG[sku];
      return {
         sku,
         price: formatDepthCoverHandlePrice(catalog.price),
         note: DEPTH_COVER_HANDLE_PART_NOTES[sku] ?? catalog.title,
         selected: sku === selectedSku,
      };
   });
}

export function getDepthCoverHandlePricingDevNotes(machineSetup, context) {
   const drill = machineSetup ? getDrillSetup(machineSetup) : null;
   const selection = getDepthCoverHandlePartSelection(machineSetup);
   const labor = DEPTH_COVER_HANDLE_LABOR;
   const partsAmount = selection?.price ?? 0;
   const partsPrice = selection ? formatDepthCoverHandlePrice(partsAmount) : "catalog part";
   const perUnitTotal = selection ? formatDepthCoverHandlePrice(partsAmount + labor) : null;
   const rowUnits = resolveRowUnitCount(drill, context.rowUnitCount);
   const example = buildQuantityExample({
      quantity: rowUnits,
      quantityLabel: "row-units",
      perUnitTotal: selection ? partsAmount + labor : null,
   });

   const aricksBoth = formatDepthCoverHandlePrice(ARICKS_COVER_HANDLE_PARTS_TOTAL);

   const subItems = [
      "Cover/handle condition controls how many row-units get quoted.",
      `Aricks alternate if both parts needed: AA120F + AA710HD = ${aricksBoth}.`,
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
         "GOOD (tight, good working order) → $0.",
      ],
      possibleSkus: formatDepthCoverHandlePartsList(selection?.sku),
      assumptions: [
         ...(drill?.manufacturer
            ? [`Selected for ${drill.manufacturer}${drill.model ? ` ${drill.model}` : ""}: ${selection?.reason ?? "no cover/handle SKU mapped yet"}.`]
            : ["Complete machine setup to auto-select cover/handle kit."]),
         "AA05* Aricks greaseless handle kits ($195) are a different product — Step 14 pivot, not this step.",
      ],
      openQuestions: [
         "Default AG-K10HD combined kit ($49), or Aricks AA120F + AA710HD ($85.98) when both needed?",
         "Labor — Still $15/row-unit on top of parts?",
      ],
      selectedPart: selection
         ? {
              sku: selection.sku,
              price: formatDepthCoverHandlePrice(selection.price),
              reason: selection.reason,
           }
         : null,
   };
}
