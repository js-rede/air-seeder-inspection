import { normalizeMachineSetup } from "../data/machineCatalog";
import {
   getChoiceUnitCost,
   getChoiceValue,
   getSecondaryChoice,
   getSelectedChoice,
   getSelectionCostMultiplier,
   getSelectionCosts,
   getStepChoices,
   getWorkingRankChoiceCost,
   getWorkingRankCostMultiplier,
   normalizeRowUnitDistribution,
   normalizeWorkingRankSelections,
   usesSecondaryCostForRating,
} from "./choices";

export function parseFeet(value) {
   if (!value) return 0;
   const match = String(value).match(/([\d.]+)/);
   return match ? Number(match[1]) : 0;
}

export function parseInches(value) {
   if (!value) return 0;
   const match = String(value).match(/([\d.]+)/);
   return match ? Number(match[1]) : 0;
}

export function calculateRowUnitCount(machineSetupAnswer) {
   const setup = normalizeMachineSetup(machineSetupAnswer);
   const widthFeet = parseFeet(setup.width);
   const rowSpacingInches = parseInches(setup.rowSpacing);

   if (!widthFeet || !rowSpacingInches) return 0;

   return Math.round((widthFeet * 12) / rowSpacingInches);
}

export function getRowUnitCountOptions(predicted = 0, current = 0) {
   const center = predicted > 0 ? predicted : current > 0 ? current : 24;
   const min = Math.max(1, center - 20);
   const max = center + 20;
   const options = [];

   for (let count = min; count <= max; count += 1) {
      options.push({
         value: String(count),
         label: `${count} row-unit${count === 1 ? "" : "s"}`,
      });
   }

   const currentValue = Number(current);
   if (currentValue > 0 && !options.some((option) => option.value === String(currentValue))) {
      options.push({
         value: String(currentValue),
         label: `${currentValue} row-unit${currentValue === 1 ? "" : "s"}`,
      });
      options.sort((a, b) => Number(a.value) - Number(b.value));
   }

   return options;
}

export function getEffectiveRowUnitCount(machineSetupAnswer, override) {
   const overrideCount = Number(override);
   if (overrideCount > 0) return Math.round(overrideCount);

   const setup = normalizeMachineSetup(machineSetupAnswer);
   const setupCount = Number(setup.rowUnitCount);
   if (setupCount > 0) return Math.round(setupCount);

   return calculateRowUnitCount(machineSetupAnswer);
}

export function getEffectiveWorkingRanks(machineSetupAnswer, override) {
   const overrideRanks = Number(override);
   if (overrideRanks > 0) return overrideRanks;

   const setup = normalizeMachineSetup(machineSetupAnswer);
   return Number(setup.workingRanks) || 0;
}

function normalizeRowUnitCounts(answer, choices) {
   return normalizeRowUnitDistribution(answer, choices);
}

function addCost(totalLow, totalHigh, low, high, quantity = 1) {
   return {
      low: totalLow + (Number(low) || 0) * quantity,
      high: totalHigh + (Number(high) || 0) * quantity,
   };
}

export function calculateInspectionSummary(steps, answers, rowUnitCountOverride, workingRanksOverride) {
   const machineSetup = normalizeMachineSetup(answers["machine-setup"]);
   const rowUnitCount = getEffectiveRowUnitCount(answers["machine-setup"], rowUnitCountOverride);
   const workingRanks = getEffectiveWorkingRanks(answers["machine-setup"], workingRanksOverride);
   const ratingCounts = { good: 0, maybe: 0, bad: 0, unknown: 0 };
   let estimatedLow = 0;
   let estimatedHigh = 0;
   const lineItems = [];

   steps.forEach((step) => {
      const answer = answers[step.slug];
      if (answer == null || answer === "") return;

      if (step.answer_type === "row_unit_distribution") {
         const choices = getStepChoices(step);
         const counts = normalizeRowUnitCounts(answer, choices);
         const secondaryChoice = getSecondaryChoice(step, answer);

         choices.forEach((choice) => {
            const key = getChoiceValue(choice);
            const count = counts[key] || 0;
            if (count <= 0) return;

            const rating = choice.rating || "unknown";
            ratingCounts[rating] = (ratingCounts[rating] || 0) + count;

            let itemLow = 0;
            let itemHigh = 0;
            let itemLabel = choice.label;

            if (usesSecondaryCostForRating(step, rating) && secondaryChoice) {
               const materialCost = getChoiceUnitCost(secondaryChoice);
               const laborLow = choice.estimated_low_cost || 0;
               const laborHigh = choice.estimated_high_cost || laborLow;

               itemLow = (materialCost + laborLow) * count;
               itemHigh = (materialCost + laborHigh) * count;
               itemLabel = `${secondaryChoice.label} (replacement)`;
            } else {
               itemLow = (choice.estimated_low_cost || 0) * count;
               itemHigh = (choice.estimated_high_cost || 0) * count;
            }

            estimatedLow += itemLow;
            estimatedHigh += itemHigh;

            if (itemLow > 0 || itemHigh > 0) {
               lineItems.push({
                  slug: step.slug,
                  stepTitle: step.step_title,
                  label: itemLabel,
                  rating,
                  quantity: count,
                  quantityLabel: step.quantity_label || "row-units",
                  estimatedLowCost: itemLow,
                  estimatedHighCost: itemHigh,
               });
            }
         });

         return;
      }

      if (step.answer_type === "working_rank_selection") {
         const choices = getStepChoices(step);
         const rankCount = Math.max(1, Number(workingRanks) || 1);
         const selections = normalizeWorkingRankSelections(answer, rankCount);
         const secondaryChoice = getSecondaryChoice(step, answer);

         Object.entries(selections).forEach(([rankKey, choiceValue]) => {
            if (!choiceValue) return;

            const choice = choices.find((item) => getChoiceValue(item) === choiceValue);
            if (!choice) return;

            const rankIndex = Number(rankKey) - 1;
            const quantity = getWorkingRankCostMultiplier(step, rowUnitCount, rankCount, rankIndex);
            if (quantity <= 0) return;

            const rating = choice.rating || "unknown";
            ratingCounts[rating] = (ratingCounts[rating] || 0) + quantity;

            const { estimatedLowCost: itemLow, estimatedHighCost: itemHigh, lineItemLabel } =
               getWorkingRankChoiceCost(step, choice, secondaryChoice, quantity);

            estimatedLow += itemLow;
            estimatedHigh += itemHigh;

            if (itemLow > 0 || itemHigh > 0) {
               lineItems.push({
                  slug: step.slug,
                  stepTitle: step.step_title,
                  label:
                     workingRanks > 1 ? `Working rank ${rankKey}: ${lineItemLabel}` : lineItemLabel,
                  rating,
                  quantity,
                  quantityLabel: step.quantity_label || "row-units",
                  estimatedLowCost: itemLow,
                  estimatedHighCost: itemHigh,
               });
            }
         });

         return;
      }

      if (step.answer_type === "selection") {
         const choice = getSelectedChoice(step, answer);
         if (!choice) return;

         const rating = choice.rating || "unknown";
         ratingCounts[rating] = (ratingCounts[rating] || 0) + 1;

         const { estimatedLowCost, estimatedHighCost, lineItemLabel } = getSelectionCosts(step, answer, rowUnitCount);
         const multiplier = getSelectionCostMultiplier(step, rowUnitCount);

         estimatedLow += estimatedLowCost;
         estimatedHigh += estimatedHighCost;

         if (estimatedLowCost > 0 || estimatedHighCost > 0) {
            lineItems.push({
               slug: step.slug,
               stepTitle: step.step_title,
               label: lineItemLabel || choice.label,
               rating,
               quantity: multiplier > 1 ? multiplier : 1,
               quantityLabel: multiplier > 1 ? step.quantity_label || "row-units" : "item",
               estimatedLowCost,
               estimatedHighCost,
            });
         }

         return;
      }

      if (step.answer_type === "yes_no") {
         const rating = answer === "Yes" ? "bad" : answer === "No" ? "good" : "unknown";
         ratingCounts[rating] = (ratingCounts[rating] || 0) + 1;

         if (answer === "Yes") {
            const costs = addCost(0, 0, step.estimated_low_cost, step.estimated_high_cost);
            estimatedLow += costs.low;
            estimatedHigh += costs.high;

            lineItems.push({
               slug: step.slug,
               stepTitle: step.step_title,
               label: answer,
               rating,
               quantity: 1,
               quantityLabel: "item",
               estimatedLowCost: costs.low,
               estimatedHighCost: costs.high,
            });
         }
      }
   });

   return {
      rowUnitCount,
      workingRanks,
      ratingCounts,
      estimatedLow,
      estimatedHigh,
      lineItems,
   };
}

export function formatCurrency(amount) {
   return `$${Math.round(amount).toLocaleString()}`;
}

export function formatCostRange(low, high) {
   if (low <= 0 && high <= 0) return null;
   if (low === high) return formatCurrency(low);
   return `${formatCurrency(low)} – ${formatCurrency(high)}`;
}

export function isRowUnitDistributionComplete(answer, choices, rowUnitCount) {
   if (!rowUnitCount) return false;

   const counts = normalizeRowUnitDistribution(answer, choices);
   const assigned = Object.values(counts).reduce((sum, count) => sum + count, 0);
   return assigned === rowUnitCount;
}
