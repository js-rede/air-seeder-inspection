import { isSkipChoiceValue } from "./skipChoice";

export { isSkipChoiceValue, SKIP_CHOICE_VALUE, getSkipChoiceLabel } from "./skipChoice";

export function getChoiceValue(choice) {
   return choice.value ?? choice.label;
}

export function getStepChoices(step) {
   return step?.choices ?? [];
}

export function getSectionChoices(section, stepChoices = []) {
   return section?.choices?.length ? section.choices : stepChoices;
}

export function getStepInspectionSections(step) {
   return step?.inspection_sections ?? [];
}

export function getSectionSelections(answer) {
   if (answer && typeof answer === "object" && answer.sections) {
      return answer.sections;
   }

   return {};
}

export function getSectionConditionValue(sectionAnswer) {
   if (!sectionAnswer) return "";
   if (typeof sectionAnswer === "string") return sectionAnswer;
   return sectionAnswer.value ?? "";
}

export function getSectionSecondaryAnswer(sectionAnswer) {
   if (!sectionAnswer || typeof sectionAnswer !== "object") return "";
   return sectionAnswer.secondary ?? "";
}

export function getSectionSecondaryOtherAnswer(sectionAnswer) {
   if (!sectionAnswer || typeof sectionAnswer !== "object") return "";
   return sectionAnswer.secondaryOther ?? "";
}

export function isSectionEntryComplete(section, sectionAnswer, { hideSectionSecondary = false } = {}) {
   const condition = getSectionConditionValue(sectionAnswer);
   if (!condition || isSkipChoiceValue(condition)) return false;

   if (section.secondary_choices?.length && !hideSectionSecondary && !section.hide_secondary) {
      const secondary = getSectionSecondaryAnswer(sectionAnswer);
      if (!secondary) return false;

      const otherChoice = section.secondary_choices.find((choice) => getChoiceValue(choice) === "other");
      if (otherChoice && secondary === getChoiceValue(otherChoice)) {
         return Boolean(getSectionSecondaryOtherAnswer(sectionAnswer).trim());
      }
   }

   return true;
}

export function normalizeSectionSelections(answer, sections) {
   const selections = getSectionSelections(answer);
   const normalized = {};

   sections.forEach((section) => {
      const key = section.value ?? section.label;
      normalized[key] = selections[key] ?? "";
   });

   return normalized;
}

export function isSectionSelectionComplete(answer, sections, { hideSectionSecondary = false } = {}) {
   if (!sections.length) return false;

   const selections = getSectionSelections(answer);
   return sections.every((section) =>
      isSectionEntryComplete(section, selections[section.value ?? section.label], { hideSectionSecondary }),
   );
}

export function getRowUnitDistributionAnswer(answer) {
   if (answer && typeof answer === "object" && answer.distribution) {
      return answer.distribution;
   }

   if (answer && typeof answer === "object") {
      return answer;
   }

   return {};
}

export function getSelectionAnswerValue(answer) {
   if (answer && typeof answer === "object" && answer.value != null && !answer.distribution && !answer.ranks) {
      return answer.value;
   }

   if (typeof answer === "string") {
      return answer;
   }

   return "";
}

export function getMultiSelectionAnswer(answer) {
   return Array.isArray(answer) ? answer.filter(Boolean) : [];
}

export function getMultiSelectionCostMultiplier(step, rowUnitCount = 0) {
   if (step?.cost_multiplies_by_row_units && rowUnitCount > 0) {
      return rowUnitCount;
   }

   return 1;
}

export function getMultiSelectionCosts(step, answer, rowUnitCount = 0) {
   const choices = getStepChoices(step);
   const selectedValues = getMultiSelectionAnswer(answer);
   const multiplier = getMultiSelectionCostMultiplier(step, rowUnitCount);

   let estimatedLowCost = 0;
   let estimatedHighCost = 0;

   choices.forEach((choice) => {
      const key = getChoiceValue(choice);
      if (!selectedValues.includes(key)) return;

      estimatedLowCost += (choice.estimated_low_cost || 0) * multiplier;
      estimatedHighCost += (choice.estimated_high_cost || choice.estimated_low_cost || 0) * multiplier;
   });

   return { estimatedLowCost, estimatedHighCost };
}

export function formatMultiSelectionSummaryLine(choice, quantity, quantityLabel = "row-units") {
   if (choice.summary_line) {
      return choice.summary_line.replaceAll("{count}", String(quantity));
   }

   const units = quantity === 1 ? quantityLabel.replace(/s$/, "") : quantityLabel;
   return `Replace ${choice.label.toLowerCase()} on ${quantity} ${units}`;
}

export function getWorkingRankSelections(answer) {
   if (answer && typeof answer === "object" && answer.ranks) {
      return answer.ranks;
   }

   const legacyValue = getSelectionAnswerValue(answer);
   if (legacyValue) {
      return { 1: legacyValue };
   }

   return {};
}

export function normalizeWorkingRankSelections(answer, workingRanks) {
   const selections = getWorkingRankSelections(answer);
   const normalized = {};
   const rankCount = Math.max(1, Number(workingRanks) || 1);

   for (let rank = 1; rank <= rankCount; rank += 1) {
      normalized[String(rank)] = selections[String(rank)] || selections[rank] || "";
   }

   return normalized;
}

export function isWorkingRankSelectionComplete(answer, workingRanks) {
   const rankCount = Math.max(1, Number(workingRanks) || 1);
   if (!rankCount) return false;

   const selections = normalizeWorkingRankSelections(answer, rankCount);
   return Object.values(selections).every(Boolean);
}

export function distributeRowUnitsPerRank(rowUnitCount, workingRanks) {
   const rankCount = Math.max(1, Number(workingRanks) || 1);
   const totalUnits = Math.max(0, Number(rowUnitCount) || 0);
   const base = Math.floor(totalUnits / rankCount);
   const remainder = totalUnits % rankCount;

   return Array.from({ length: rankCount }, (_, index) => base + (index < remainder ? 1 : 0));
}

const RATING_PRIORITY = { bad: 3, maybe: 2, good: 1, unknown: 0 };

export function getWorkingRankCostMultiplier(step, rowUnitCount, workingRanks, rankIndex) {
   if (!step?.cost_multiplies_by_row_units) {
      return 1;
   }

   const totalRowUnits = Math.max(0, Number(rowUnitCount) || 0);
   if (totalRowUnits <= 0) {
      return 1;
   }

   const unitsPerRank = distributeRowUnitsPerRank(totalRowUnits, workingRanks);
   return unitsPerRank[rankIndex] || 0;
}

export function getWorkingRankChoiceCost(step, choice, secondaryChoice, multiplier) {
   if (!choice || multiplier <= 0) {
      return { estimatedLowCost: 0, estimatedHighCost: 0, lineItemLabel: null };
   }

   const laborLow = choice.estimated_low_cost || 0;
   const laborHigh = choice.estimated_high_cost || laborLow;
   const materialCost = getRankMaterialCost(step, choice, secondaryChoice);
   const unitLow = laborLow + materialCost;
   const unitHigh = laborHigh + materialCost;

   return {
      estimatedLowCost: unitLow * multiplier,
      estimatedHighCost: unitHigh * multiplier,
      lineItemLabel:
         materialCost > 0 && secondaryChoice
            ? `${secondaryChoice.label} (replacement)`
            : choice.label,
   };
}

export function getWorkingRankSelectionCosts(step, answer, rowUnitCount = 0, workingRanks = 1) {
   const choices = getStepChoices(step);
   const rankCount = Math.max(1, Number(workingRanks) || 1);
   const selections = normalizeWorkingRankSelections(answer, rankCount);
   const secondaryChoice = getSecondaryChoice(step, answer);

   let estimatedLowCost = 0;
   let estimatedHighCost = 0;

   Object.entries(selections).forEach(([rankKey, choiceValue]) => {
      if (!choiceValue || isSkipChoiceValue(choiceValue)) return;

      const choice = choices.find((item) => getChoiceValue(item) === choiceValue);
      if (!choice) return;

      const rankIndex = Number(rankKey) - 1;
      const multiplier = getWorkingRankCostMultiplier(step, rowUnitCount, rankCount, rankIndex);
      if (multiplier <= 0) return;

      const costs = getWorkingRankChoiceCost(step, choice, secondaryChoice, multiplier);
      estimatedLowCost += costs.estimatedLowCost;
      estimatedHighCost += costs.estimatedHighCost;
   });

   return { estimatedLowCost, estimatedHighCost };
}

function formatWorkingRankSummaryLine(rankNumber, choice, units, quantityLabel = "row-units") {
   const rankLabel = `Working rank ${rankNumber}`;
   const unitLabel =
      units === 1 && quantityLabel.endsWith("s") ? quantityLabel.slice(0, -1) : quantityLabel;

   if (choice.rating === "good") {
      return `${rankLabel}: ${choice.label} (${units} ${unitLabel})`;
   }

   return `${rankLabel}: ${choice.label}`;
}

export function getSecondaryAnswer(answer) {
   if (answer && typeof answer === "object" && "secondary" in answer) {
      return answer.secondary ?? "";
   }

   return "";
}

export function getSecondaryOtherAnswer(answer) {
   if (answer && typeof answer === "object" && "secondaryOther" in answer) {
      return answer.secondaryOther ?? "";
   }

   return "";
}

export function getTertiaryAnswer(answer) {
   if (answer && typeof answer === "object" && "tertiary" in answer) {
      return answer.tertiary ?? "";
   }

   return "";
}

export function shouldShowTertiaryQuestion(step, secondaryValue) {
   if (!step?.tertiary_question || !step?.tertiary_choices?.length) {
      return false;
   }

   if (!secondaryValue) {
      return false;
   }

   const showForValues = step.tertiary_show_for_secondary_values ?? [];

   if (showForValues.length > 0) {
      return showForValues.includes(secondaryValue);
   }

   return true;
}

export function isTertiaryAnswerComplete(answer, tertiaryChoices = []) {
   const tertiary = getTertiaryAnswer(answer);
   if (!tertiary) return false;

   const otherChoice = tertiaryChoices.find((choice) => getChoiceValue(choice) === "other");
   if (otherChoice && tertiary === getChoiceValue(otherChoice)) {
      return Boolean(getTertiaryOtherAnswer(answer).trim());
   }

   return true;
}

export function getTertiaryOtherAnswer(answer) {
   if (answer && typeof answer === "object" && "tertiaryOther" in answer) {
      return answer.tertiaryOther ?? "";
   }

   return "";
}

export function getSecondaryChoice(step, answer) {
   const secondary = getSecondaryAnswer(answer);
   if (!secondary || !step?.secondary_choices?.length) return null;

   return step.secondary_choices.find((choice) => getChoiceValue(choice) === secondary) ?? null;
}

export function getChoiceUnitCost(choice) {
   if (!choice) return 0;

   return Number(choice.unit_cost ?? choice.estimated_low_cost) || 0;
}

export function getDefaultSecondaryUnitCost(step) {
   if (!step?.secondary_choices?.length) return 0;

   const costs = step.secondary_choices
      .map((choice) => getChoiceUnitCost(choice))
      .filter((cost) => cost > 0);

   return costs.length ? Math.min(...costs) : 0;
}

export function getRankMaterialCost(step, choice, secondaryChoice) {
   if (!usesSecondaryCostForRating(step, choice.rating)) return 0;
   if (secondaryChoice) return getChoiceUnitCost(secondaryChoice);

   return getDefaultSecondaryUnitCost(step);
}

export function usesSecondaryCostForRating(step, rating) {
   return (step?.secondary_cost_ratings ?? []).includes(rating);
}

export function shouldShowSecondaryQuestion(step, selectionValue) {
   if (!step?.secondary_question || !step?.secondary_choices?.length) {
      return false;
   }

   if (!selectionValue || isSkipChoiceValue(selectionValue)) {
      return false;
   }

   const showForValues = step.secondary_show_for_values ?? [];
   const hideForValues = step.secondary_hide_for_values ?? [];

   if (showForValues.length > 0) {
      return showForValues.includes(selectionValue);
   }

   if (hideForValues.length > 0) {
      return !hideForValues.includes(selectionValue);
   }

   return true;
}

export function shouldShowSecondaryForWorkingRankAnswer(step, answer, workingRanks) {
   if (!step?.secondary_question || !step?.secondary_choices?.length) {
      return false;
   }

   const selections = normalizeWorkingRankSelections(answer, workingRanks);
   const selectedValues = Object.values(selections).filter(
      (value) => Boolean(value) && !isSkipChoiceValue(value),
   );

   if (!selectedValues.length) {
      return false;
   }

   return selectedValues.some((selectionValue) => shouldShowSecondaryQuestion(step, selectionValue));
}

export function getRowUnitDistributionCosts(step, answer) {
   const choices = getStepChoices(step);
   const counts = normalizeRowUnitDistribution(answer, choices);
   const secondaryChoice = getSecondaryChoice(step, answer);

   let estimatedLowCost = 0;
   let estimatedHighCost = 0;

   choices.forEach((choice) => {
      const count = counts[getChoiceValue(choice)] || 0;
      if (count <= 0) return;

      if (usesSecondaryCostForRating(step, choice.rating) && secondaryChoice) {
         const materialCost = getChoiceUnitCost(secondaryChoice);
         const laborLow = choice.estimated_low_cost || 0;
         const laborHigh = choice.estimated_high_cost || laborLow;

         estimatedLowCost += (materialCost + laborLow) * count;
         estimatedHighCost += (materialCost + laborHigh) * count;
         return;
      }

      estimatedLowCost += (choice.estimated_low_cost || 0) * count;
      estimatedHighCost += (choice.estimated_high_cost || 0) * count;
   });

   return { estimatedLowCost, estimatedHighCost };
}

export function getSectionSelectionCosts(step, answer) {
   const choices = getStepChoices(step);
   const sections = getStepInspectionSections(step);
   const selections = normalizeSectionSelections(answer, sections);

   let estimatedLowCost = 0;
   let estimatedHighCost = 0;

   sections.forEach((section) => {
      const key = section.value ?? section.label;
      const sectionAnswer = selections[key];
      const choiceValue = getSectionConditionValue(sectionAnswer);
      if (!choiceValue || isSkipChoiceValue(choiceValue)) return;

      const choice = getSectionChoices(section, choices).find((item) => getChoiceValue(item) === choiceValue);
      if (!choice) return;

      estimatedLowCost += choice.estimated_low_cost || 0;
      estimatedHighCost += choice.estimated_high_cost || 0;
   });

   return { estimatedLowCost, estimatedHighCost };
}

export function isSecondaryAnswerComplete(answer, secondaryChoices = []) {
   const secondary = getSecondaryAnswer(answer);
   if (!secondary) return false;

   const otherChoice = secondaryChoices.find((choice) => getChoiceValue(choice) === "other");
   if (otherChoice && secondary === getChoiceValue(otherChoice)) {
      return Boolean(getSecondaryOtherAnswer(answer).trim());
   }

   return true;
}

export function normalizeRowUnitDistribution(answer, choices) {
   const distribution = getRowUnitDistributionAnswer(answer);
   const counts = {};

   choices.forEach((choice) => {
      const key = getChoiceValue(choice);
      counts[key] = Number(distribution?.[key]) || 0;
   });

   return counts;
}

export function getAssignedRowUnitCount(answer, choices) {
   const counts = normalizeRowUnitDistribution(answer, choices);
   return Object.values(counts).reduce((sum, count) => sum + count, 0);
}

export function getSelectedChoice(step, selectedAnswer) {
   if (!selectedAnswer) return null;

   const choices = getStepChoices(step);
   const value = getSelectionAnswerValue(selectedAnswer);

   if (isSkipChoiceValue(value)) return null;

   return choices.find((choice) => getChoiceValue(choice) === value) ?? null;
}

export function getSelectionCostMultiplier(step, rowUnitCount = 0) {
   if (step?.cost_multiplies_by_row_units && rowUnitCount > 0) {
      return rowUnitCount;
   }

   return 1;
}

export function getSelectionCosts(step, answer, rowUnitCount = 0) {
   const selectedChoice = getSelectedChoice(step, answer);
   if (!selectedChoice) {
      return { estimatedLowCost: 0, estimatedHighCost: 0, lineItemLabel: null };
   }

   const multiplier = getSelectionCostMultiplier(step, rowUnitCount);
   const secondaryChoice = getSecondaryChoice(step, answer);

   if (usesSecondaryCostForRating(step, selectedChoice.rating) && secondaryChoice) {
      const materialCost = getChoiceUnitCost(secondaryChoice);
      const laborLow = selectedChoice.estimated_low_cost || 0;
      const laborHigh = selectedChoice.estimated_high_cost || laborLow;

      return {
         estimatedLowCost: (materialCost + laborLow) * multiplier,
         estimatedHighCost: (materialCost + laborHigh) * multiplier,
         lineItemLabel: `${secondaryChoice.label} (replacement)`,
      };
   }

   return {
      estimatedLowCost: (selectedChoice.estimated_low_cost || 0) * multiplier,
      estimatedHighCost: (selectedChoice.estimated_high_cost || 0) * multiplier,
      lineItemLabel: selectedChoice.label,
   };
}

function applyQuantitySingular(line, count) {
   if (count !== 1) return line;

   return line
      .replace(/\brow-units\b/g, "row-unit")
      .replace(/\bdiscs\b/g, "disc")
      .replace(/\bare\b/, "is")
      .replace(/\bhave\b/, "has");
}

function formatRowUnitSummaryLine(choice, count) {
   const units = count === 1 ? "row-unit" : "row-units";

   if (choice.summary_line) {
      const line = choice.summary_line.replaceAll("{count}", String(count));
      return applyQuantitySingular(line, count);
   }

   if (choice.rating === "good") {
      return count === 1 ? `${count} row-unit is in good condition` : `${count} row-units are in good condition`;
   }

   if (choice.rating === "bad") {
      return `${count} ${units} will likely need replacing`;
   }

   return count === 1
      ? `${count} row-unit is ${choice.label.toLowerCase()}`
      : `${count} row-units are ${choice.label.toLowerCase()}`;
}

export function getReplacementTallyChoice(step) {
   const choices = getStepChoices(step);
   return choices.find((choice) => choice.rating === "bad") || choices[0] || null;
}

export function getReplacementTallyCount(answer) {
   if (answer === "" || answer == null) return 0;
   const count = Number(answer);
   return Number.isFinite(count) && count > 0 ? count : 0;
}

export function getReplacementTallyCosts(step, answer) {
   const count = getReplacementTallyCount(answer);
   const choice = getReplacementTallyChoice(step);

   if (!choice || count <= 0) {
      return { estimatedLowCost: 0, estimatedHighCost: 0 };
   }

   const estimatedLowCost = (choice.estimated_low_cost || 0) * count;
   const estimatedHighCost = (choice.estimated_high_cost || 0) * count;

   return { estimatedLowCost, estimatedHighCost };
}

export function getRecommendationForAnswer(step, selectedAnswer, rowUnitCount = 0, workingRanks = 1) {
   if (step.informational_only) return null;

   if (step.answer_type === "replacement_tally") {
      const count = getReplacementTallyCount(selectedAnswer);
      const choice = getReplacementTallyChoice(step);

      if (count <= 0) {
         return {
            text: step.good_condition_action || "No replacements are needed.",
            lines: [],
            rating: "good",
            estimatedLowCost: 0,
            estimatedHighCost: 0,
         };
      }

      const { estimatedLowCost, estimatedHighCost } = getReplacementTallyCosts(step, selectedAnswer);
      const summaryLine = choice?.summary_line
         ? choice.summary_line.replaceAll("{count}", String(count))
         : `${count} ${count === 1 ? (step.quantity_label === "towers" ? "tower" : "item") : step.quantity_label || "items"} will likely need replacing`;

      return {
         text: choice?.recommended_action || "",
         lines: [summaryLine],
         rating: choice?.rating || "bad",
         estimatedLowCost,
         estimatedHighCost,
      };
   }

   if (step.answer_type === "row_unit_distribution") {
      const choices = getStepChoices(step);
      const counts = normalizeRowUnitDistribution(selectedAnswer, choices);
      const activeChoices = choices.filter((choice) => (counts[getChoiceValue(choice)] || 0) > 0);

      if (activeChoices.length === 0) return null;

      const dominant = activeChoices.reduce((best, choice) => {
         const count = counts[getChoiceValue(choice)] || 0;
         const bestCount = counts[getChoiceValue(best)] || 0;
         return count > bestCount ? choice : best;
      }, activeChoices[0]);

      const { estimatedLowCost, estimatedHighCost } = getRowUnitDistributionCosts(step, selectedAnswer);

      const lines = choices
         .map((choice) => {
            const count = counts[getChoiceValue(choice)] || 0;
            if (count <= 0) return null;

            return formatRowUnitSummaryLine(choice, count);
         })
         .filter(Boolean);

      return {
         text: dominant.recommended_action,
         lines,
         rating: dominant.rating,
         estimatedLowCost,
         estimatedHighCost,
      };
   }

   if (step.answer_type === "section_selection") {
      const choices = getStepChoices(step);
      const sections = getStepInspectionSections(step);
      const selections = normalizeSectionSelections(selectedAnswer, sections);
      const activeChoices = sections
         .map((section) => {
            const key = section.value ?? section.label;
            const sectionAnswer = selections[key];
            const choiceValue = getSectionConditionValue(sectionAnswer);
            if (!choiceValue || isSkipChoiceValue(choiceValue)) return null;

            const choice = getSectionChoices(section, choices).find((item) => getChoiceValue(item) === choiceValue);
            if (!choice) return null;

            return { section, choice };
         })
         .filter(Boolean);

      if (activeChoices.length === 0) return null;

      const dominant = activeChoices.reduce((best, entry) => {
         const bestPriority = RATING_PRIORITY[best.choice.rating] ?? 0;
         const nextPriority = RATING_PRIORITY[entry.choice.rating] ?? 0;
         return nextPriority > bestPriority ? entry : best;
      }, activeChoices[0]);

      const { estimatedLowCost, estimatedHighCost } = getSectionSelectionCosts(step, selectedAnswer);
      const lines = activeChoices
         .filter(({ choice }) => choice.rating !== "good")
         .map(({ section, choice }) => `${section.label}: ${choice.label}`);

      return {
         text: dominant.choice.recommended_action,
         lines,
         rating: dominant.choice.rating,
         estimatedLowCost,
         estimatedHighCost,
      };
   }

   if (step.answer_type === "working_rank_selection") {
      const choices = getStepChoices(step);
      const selections = normalizeWorkingRankSelections(selectedAnswer, workingRanks);
      const unitsPerRank = distributeRowUnitsPerRank(rowUnitCount, workingRanks);
      const activeChoices = Object.entries(selections)
         .map(([rankKey, choiceValue]) => {
            if (isSkipChoiceValue(choiceValue)) return null;

            const choice = choices.find((item) => getChoiceValue(item) === choiceValue);
            if (!choice) return null;

            return {
               rankNumber: Number(rankKey),
               choice,
            };
         })
         .filter(Boolean);

      if (activeChoices.length === 0) return null;

      const dominant = activeChoices.reduce((best, entry) => {
         const bestPriority = RATING_PRIORITY[best.choice.rating] ?? 0;
         const nextPriority = RATING_PRIORITY[entry.choice.rating] ?? 0;
         return nextPriority > bestPriority ? entry : best;
      }, activeChoices[0]);

      const { estimatedLowCost, estimatedHighCost } = getWorkingRankSelectionCosts(
         step,
         selectedAnswer,
         rowUnitCount,
         Math.max(1, Number(workingRanks) || 1),
      );

      const lines =
         workingRanks > 1
            ? activeChoices.map(({ rankNumber, choice }) =>
                 formatWorkingRankSummaryLine(
                    rankNumber,
                    choice,
                    unitsPerRank[rankNumber - 1] || 0,
                    step.quantity_label,
                 ),
              )
            : [];

      return {
         text: dominant.choice.recommended_action,
         lines,
         rating: dominant.choice.rating,
         estimatedLowCost,
         estimatedHighCost,
      };
   }

   if (step.answer_type === "multi_selection") {
      const choices = getStepChoices(step);
      const selectedValues = getMultiSelectionAnswer(selectedAnswer);

      if (!selectedValues.length) return null;

      const selectedChoices = choices.filter((choice) => selectedValues.includes(getChoiceValue(choice)));
      const quantity = getMultiSelectionCostMultiplier(step, rowUnitCount);
      const { estimatedLowCost, estimatedHighCost } = getMultiSelectionCosts(step, selectedAnswer, rowUnitCount);
      const quantityLabel = step.quantity_label || "row-units";

      const lines = selectedChoices.map((choice) => formatMultiSelectionSummaryLine(choice, quantity, quantityLabel));

      return {
         text: step.recommended_action || "Plan replacement for selected SFP row-unit parts.",
         lines,
         rating: "bad",
         estimatedLowCost,
         estimatedHighCost,
      };
   }

   if (step.answer_type === "selection" && isSkipChoiceValue(getSelectionAnswerValue(selectedAnswer))) {
      return null;
   }

   const selectedChoice = getSelectedChoice(step, selectedAnswer);

   if (selectedChoice?.recommended_action) {
      const { estimatedLowCost, estimatedHighCost } = getSelectionCosts(step, selectedAnswer, rowUnitCount);

      return {
         text: selectedChoice.recommended_action,
         rating: selectedChoice.rating,
         estimatedLowCost,
         estimatedHighCost,
      };
   }

   if (step.recommended_action) {
      return {
         text: step.recommended_action,
         rating: null,
         estimatedLowCost: step.estimated_low_cost,
         estimatedHighCost: step.estimated_high_cost,
      };
   }

   return null;
}
