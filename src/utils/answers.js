import { isMachineSetupComplete } from "../data/machineCatalog";
import { getAnswerType } from "../data/discDiameterOptions";
import { getSelectionAnswerValue, getStepChoices, getStepInspectionSections, getSecondaryAnswer, isSecondaryAnswerComplete, isSectionSelectionComplete, isTertiaryAnswerComplete, isWorkingRankSelectionComplete, shouldShowSecondaryForWorkingRankAnswer, shouldShowSecondaryQuestion, shouldShowTertiaryQuestion, isSkipChoiceValue } from "./choices";
import { getEffectiveRowUnitCount, getEffectiveWorkingRanks, isRowUnitDistributionComplete } from "./inspectionSummary";

export function isAnswerComplete(step, answer, answers = {}, rowUnitCountOverride, workingRanksOverride) {
   const answerType = step?.answer_type || getAnswerType(step);

   if (answerType === "machine_setup") {
      return isMachineSetupComplete(answer);
   }

   if (answerType === "notes") {
      return true;
   }

   if (answerType === "multi_selection") {
      return true;
   }

   if (answerType === "replacement_tally") {
      const quantityCount =
         step?.max_count != null
            ? step.max_count
            : getEffectiveRowUnitCount(answers["machine-setup"], rowUnitCountOverride);
      if (!quantityCount) return false;

      const count = answer === "" || answer == null ? 0 : Number(answer);
      return Number.isFinite(count) && count >= 0 && count <= quantityCount;
   }

   if (answerType === "row_unit_distribution") {
      const rowUnitCount = getEffectiveRowUnitCount(answers["machine-setup"], rowUnitCountOverride);
      const distributionComplete = isRowUnitDistributionComplete(answer, getStepChoices(step), rowUnitCount);

      if (step.secondary_question) {
         return distributionComplete && isSecondaryAnswerComplete(answer, step.secondary_choices);
      }

      return distributionComplete;
   }

   if (answerType === "section_selection") {
      return isSectionSelectionComplete(answer, getStepInspectionSections(step), {
         hideSectionSecondary: step.hide_section_secondary === true,
      });
   }

   if (answerType === "working_rank_selection") {
      const workingRanks = getEffectiveWorkingRanks(answers["machine-setup"], workingRanksOverride);
      const ranksComplete = isWorkingRankSelectionComplete(answer, workingRanks);

      if (step.secondary_question) {
         const needsSecondary = shouldShowSecondaryForWorkingRankAnswer(step, answer, workingRanks);

         if (needsSecondary) {
            return ranksComplete && isSecondaryAnswerComplete(answer, step.secondary_choices);
         }
      }

      return ranksComplete;
   }

   if (answerType === "selection") {
      const selectionValue = getSelectionAnswerValue(answer);
      if (step.allow_skip === false && isSkipChoiceValue(selectionValue)) return false;

      const needsSecondary = shouldShowSecondaryQuestion(step, selectionValue);

      if (step.secondary_question && needsSecondary) {
         if (!isSecondaryAnswerComplete(answer, step.secondary_choices)) return false;

         if (shouldShowTertiaryQuestion(step, getSecondaryAnswer(answer))) {
            return isTertiaryAnswerComplete(answer, step.tertiary_choices);
         }

         return true;
      }

      return Boolean(selectionValue);
   }

   return Boolean(answer);
}
