import { getDrillSetup } from "../machineCatalog";
import { getReplacementTallyCount } from "../../utils/choices";
import { PRICING_DEV_NOTE_CONFIGS } from "./sectionConfigs";
import {
   buildQuantityExample,
   formatCostBand,
   formatMoney,
   formatPossiblePartsList,
   resolveRowUnitCount,
} from "./shared";
import {
   getChoiceCostParts,
   getPerUnitTotalHigh,
   getPerUnitTotalLow,
   getReferenceChoice,
} from "./stepCosts";

function buildCostLine(config, step, context, drill) {
   const ref = getReferenceChoice(step);
   const parts = getChoiceCostParts(ref);
   const partsBand = formatCostBand(parts.low, parts.high);
   const totalLow = getPerUnitTotalLow(parts);
   const totalHigh = getPerUnitTotalHigh(parts);
   const totalBand =
      totalLow === totalHigh ? formatMoney(totalLow) : `${formatMoney(totalLow)}–${formatMoney(totalHigh)}`;
   const ratingLabel = config.ratingLabel ?? "MAYBE/BAD";
   const quantityLabel = config.quantityLabel ?? step.quantity_label ?? "row-units";

   let example = null;
   const subItems = [];

   if (config.costMode === "per_row_unit" && step.cost_multiplies_by_row_units) {
      const rowUnits = resolveRowUnitCount(drill, context.rowUnitCount);
      example = buildQuantityExample({
         quantity: rowUnits,
         quantityLabel,
         perUnitTotal: totalLow,
      });
      if (totalLow !== totalHigh) {
         subItems.push(`Example uses low end of parts band (${partsBand} + $${parts.labor} labor).`);
      }
   }

   if (config.costMode === "per_tally") {
      const tally =
         Number(context.tallyCount) ||
         (step.answer_type === "replacement_tally" ? getReplacementTallyCount(context.selectedAnswer) : 0);
      example = buildQuantityExample({
         quantity: tally > 0 ? tally : null,
         quantityLabel,
         perUnitTotal: totalLow,
      });
      if (tally <= 0) {
         subItems.push(`Enter ${quantityLabel} count above to see total for this machine.`);
      }
   }

   if (config.costMode === "flat") {
      example = buildQuantityExample({
         quantity: 1,
         quantityLabel: "drill/cart",
         perUnitTotal: totalLow,
      });
      if (example?.subItems?.length) {
         example.subItems[0] = `Example for this machine: ${totalBand} (flat step estimate from inspection-steps.json).`;
      }
   }

   if (config.costMode === "multi_select") {
      const rowUnits = resolveRowUnitCount(drill, context.rowUnitCount);
      const firstBad = step.choices?.find((choice) => choice.rating === "bad");
      const itemParts = getChoiceCostParts(firstBad);
      const perItem = getPerUnitTotalLow(itemParts);
      if (rowUnits && firstBad) {
         subItems.push(
            `Example (one selected item, ${firstBad.label}): ${rowUnits} row-units × ${formatMoney(perItem)} = ${formatMoney(perItem * rowUnits)}.`,
         );
      }
   }

   if (config.costMode === "section") {
      subItems.push("Estimate is per tank × inspection section — part rules not wired yet.");
   }

   if (example?.subItems?.length) {
      subItems.push(...example.subItems);
   }

   const sourceNote =
      config.partRulesStatus === "wired"
         ? "from machine setup"
         : "from inspection-steps.json today (part rules not wired yet)";

   let text;
   if (config.costMode === "flat" || config.costMode === "section") {
      text = `${ratingLabel} → ${totalBand} total (${partsBand} parts + $${parts.labor} labor, ${sourceNote}).`;
   } else if (config.costMode === "per_tally") {
      text = `${ratingLabel} → ${totalBand} total per item (${partsBand} parts + $${parts.labor} labor, ${sourceNote}).`;
   } else if (config.costMode === "multi_select") {
      text = `${ratingLabel} → ${totalBand} per item × row-units when checked (${sourceNote}).`;
   } else {
      text = `${ratingLabel} → ${totalBand} total per affected row-unit (${partsBand} parts + $${parts.labor} labor, ${sourceNote}).`;
   }

   return {
      text,
      subItems: subItems.length ? subItems : undefined,
   };
}

/**
 * Build scaffold dev notes for steps without full part-rule wiring.
 * @param {object} step
 * @param {object} [machineSetup]
 * @param {object} [context]
 */
export function buildScaffoldPricingDevNotes(step, machineSetup = null, context = {}) {
   const config = PRICING_DEV_NOTE_CONFIGS[step?.slug];
   if (!config) return null;

   const drill = machineSetup ? getDrillSetup(machineSetup) : null;
   const costLine = buildCostLine(config, step, context, drill);
   const howAppCalculates = [costLine, "GOOD → $0."];

   if (config.costMode === "multi_select") {
      howAppCalculates[0] = costLine;
      howAppCalculates.push("Only checked items are added; each multiplies by row-unit count.");
   }

   return {
      howAppCalculates,
      possibleSkus: formatPossiblePartsList(config.possibleParts),
      assumptions: [...(config.assumptions ?? [])],
      openQuestions: [...(config.openQuestions ?? [])],
      selectedPart: null,
   };
}
