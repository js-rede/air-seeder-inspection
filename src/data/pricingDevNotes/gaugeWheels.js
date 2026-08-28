/**
 * Dev notes for gauge wheels section.
 */

import {
   formatGaugeWheelPrice,
   GAUGE_WHEEL_CATALOG,
   GAUGE_WHEEL_DEFAULT_SKU,
   GAUGE_WHEEL_LABOR,
   getGaugeWheelPartSelection,
} from "../gaugeWheelPartRules";
import { getDrillSetup } from "../machineCatalog";
import { getFollowUpAnswers } from "../../utils/choices";
import { buildQuantityExample, resolveRowUnitCount } from "./shared";

const GAUGE_WHEEL_SKUS = [
   "RE6019R",
   "RE6019U",
   "RE6023R",
   "RE6005R",
   "RE6007R",
   "RE6032R",
   "RE6032U",
   "RE6033R",
   "RE6034R",
];

const GAUGE_WHEEL_PART_NOTES = {
   RE6019R: "Steel/steel 3\" rubber",
   RE6019U: "Steel/steel 3\" urethane",
   RE6023R: "Steel/steel 4.5\" rubber",
   RE6005R: "Spoked 3/8\" lip 3\"",
   RE6007R: "Spoked 3/8\" lip 4.5\"",
   RE6032R: "HD spoked 3\" x 16\" rubber — default",
   RE6032U: "HD spoked 3\" x 16\" urethane",
   RE6033R: "HD spoked 4.5\" x 16\" rubber",
   RE6034R: "18\" spoked — double-shoot Case/NH",
};

function formatGaugeWheelPartsList(selectedSku) {
   return GAUGE_WHEEL_SKUS.map((sku) => {
      const catalog = GAUGE_WHEEL_CATALOG[sku];
      return {
         sku,
         price: formatGaugeWheelPrice(catalog.price),
         note: GAUGE_WHEEL_PART_NOTES[sku] ?? catalog.title,
         selected: sku === selectedSku,
      };
   });
}

function describeFollowUps(followUps) {
   const parts = [];
   if (followUps["inner-wheel-style"]) parts.push(`style: ${followUps["inner-wheel-style"]}`);
   if (followUps["tire-width"]) parts.push(`width: ${followUps["tire-width"]}`);
   if (followUps["tire-material"]) parts.push(`material: ${followUps["tire-material"]}`);
   if (followUps["inner-lip-width"]) parts.push(`lip: ${followUps["inner-lip-width"]}`);
   return parts.length ? parts.join(", ") : null;
}

export function getGaugeWheelPricingDevNotes(machineSetup, context) {
   const drill = machineSetup ? getDrillSetup(machineSetup) : null;
   const followUps =
      context.followUps ??
      (context.selectedAnswer != null ? getFollowUpAnswers(context.selectedAnswer) : {});
   const selection = getGaugeWheelPartSelection(machineSetup, { followUps });
   const labor = GAUGE_WHEEL_LABOR;
   const partsAmount = selection?.price ?? 0;
   const partsPrice = selection ? formatGaugeWheelPrice(partsAmount) : "catalog part";
   const perUnitTotal = selection ? formatGaugeWheelPrice(partsAmount + labor) : null;
   const rowUnits = resolveRowUnitCount(drill, context.rowUnitCount);
   const example = buildQuantityExample({
      quantity: rowUnits,
      quantityLabel: "row-units",
      perUnitTotal: selection ? partsAmount + labor : null,
   });

   const followUpSummary = describeFollowUps(followUps);

   const subItems = [
      "Follow-up answers (style, width, material, lip) pick the gauge wheel SKU.",
      ...(followUpSummary ? [`Current follow-ups: ${followUpSummary}.`] : [`Defaults to ${GAUGE_WHEEL_DEFAULT_SKU} until follow-ups are answered.`]),
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
         "GOOD (tires in good shape) → $0.",
      ],
      possibleSkus: formatGaugeWheelPartsList(selection?.sku),
      assumptions: [
         ...(drill?.manufacturer
            ? [`Selected for ${drill.manufacturer}${drill.model ? ` ${drill.model}` : ""}: ${selection?.reason ?? "pending"}.`]
            : ["Complete machine setup to auto-select gauge wheel."]),
         "Bearings/arms mentioned in step copy are not separate line items yet.",
      ],
      openQuestions: [
         "Steel/steel 4.5\" urethane — no SKU found; use RE6032U or price range?",
         "Labor — Still $30/row-unit on top of parts?",
      ],
      selectedPart: selection
         ? {
              sku: selection.sku,
              price: formatGaugeWheelPrice(selection.price),
              reason: selection.reason,
           }
         : null,
   };
}
