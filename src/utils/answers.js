import { isMachineSetupComplete } from "../data/machineCatalog";
import { getAnswerType } from "../data/discDiameterOptions";
import {
   getSelectionAnswerValue,
   getStepChoices,
   getStepInspectionSections,
   getSecondaryAnswer,
   getFollowUpQuestions,
   getReplacementTallyRawCount,
   getWorkingRankReplacementCount,
   isFollowUpQuestionsComplete,
   isSecondaryAnswerComplete,
   isSectionSelectionComplete,
   isTertiaryAnswerComplete,
   isWorkingRankSelectionComplete,
   isWorkingRankUsingReplacementCount,
   shouldShowFollowUpQuestionsForWorkingRankAnswer,
   shouldShowSecondaryForWorkingRankAnswer,
   shouldShowSecondaryQuestion,
   shouldShowTertiaryQuestion,
   isSkipChoiceValue,
} from "./choices";
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

      const requiresSecondary = Boolean(step.secondary_question && step.secondary_choices?.length);

      if (step.tally_sides) {
         if (answer === "" || answer == null) return !requiresSecondary;
         if (typeof answer !== "object" || Array.isArray(answer)) {
            const count = Number(answer);
            const countOk = Number.isFinite(count) && count >= 0 && count <= quantityCount * 2;
            return requiresSecondary ? false : countOk;
         }
         if (!("left" in answer) && !("right" in answer)) return !requiresSecondary;

         const left = Number(answer.left);
         const right = Number(answer.right);
         const countOk =
            Number.isFinite(left) &&
            left >= 0 &&
            left <= quantityCount &&
            Number.isFinite(right) &&
            right >= 0 &&
            right <= quantityCount;
         if (!countOk) return false;
         return requiresSecondary ? isSecondaryAnswerComplete(answer, step.secondary_choices) : true;
      }

      if (requiresSecondary) {
         if (answer == null || answer === "" || typeof answer !== "object" || Array.isArray(answer)) {
            return false;
         }
         const rawCount = getReplacementTallyRawCount(answer);
         const countOk = rawCount != null && rawCount >= 0 && rawCount <= quantityCount;
         return countOk && isSecondaryAnswerComplete(answer, step.secondary_choices);
      }

      // Unanswered or legacy non-numeric answers count as 0.
      if (answer === "" || answer == null || (typeof answer === "object" && !("count" in answer))) return true;

      if (typeof answer === "object" && "count" in answer) {
         const rawCount = getReplacementTallyRawCount(answer);
         return rawCount != null && rawCount >= 0 && rawCount <= quantityCount;
      }

      const count = Number(answer);
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
      const followUpQuestions = getFollowUpQuestions(step);

      if (step.optional_replacement_count && isWorkingRankUsingReplacementCount(answer)) {
         const rowUnitCount = getEffectiveRowUnitCount(answers["machine-setup"], rowUnitCountOverride);
         if (!rowUnitCount) return false;
         const count = getWorkingRankReplacementCount(answer);
         return count != null && count >= 0 && count <= rowUnitCount;
      }

      if (followUpQuestions.length) {
         const needsFollowUps = shouldShowFollowUpQuestionsForWorkingRankAnswer(step, answer, workingRanks);

         if (needsFollowUps) {
            return ranksComplete && isFollowUpQuestionsComplete(answer, followUpQuestions);
         }

         return ranksComplete;
      }

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
