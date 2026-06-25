import { isMachineSetupComplete } from "../data/machineCatalog";
import { getAnswerType } from "../data/discDiameterOptions";
import { getSelectionAnswerValue, getStepChoices, isSecondaryAnswerComplete, isWorkingRankSelectionComplete, shouldShowSecondaryForWorkingRankAnswer, shouldShowSecondaryQuestion } from "./choices";
import { getEffectiveRowUnitCount, getEffectiveWorkingRanks, isRowUnitDistributionComplete } from "./inspectionSummary";

export function isAnswerComplete(step, answer, answers = {}, rowUnitCountOverride, workingRanksOverride) {
   const answerType = step?.answer_type || getAnswerType(step);

   if (answerType === "machine_setup") {
      return isMachineSetupComplete(answer);
   }

   if (answerType === "row_unit_distribution") {
      const rowUnitCount = getEffectiveRowUnitCount(answers["machine-setup"], rowUnitCountOverride);
      const distributionComplete = isRowUnitDistributionComplete(answer, getStepChoices(step), rowUnitCount);

      if (step.secondary_question) {
         return distributionComplete && isSecondaryAnswerComplete(answer, step.secondary_choices);
      }

      return distributionComplete;
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
      const needsSecondary = shouldShowSecondaryQuestion(step, selectionValue);

      if (step.secondary_question && needsSecondary) {
         return Boolean(selectionValue) && isSecondaryAnswerComplete(answer, step.secondary_choices);
      }

      return Boolean(selectionValue);
   }

   return Boolean(answer);
}
