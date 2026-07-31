import { useEffect } from "react";
import {
   getChoiceValue,
   getFollowUpAnswers,
   getSecondaryAnswer,
   getSecondaryOtherAnswer,
   getWorkingRankReplacementCount,
   getWorkingRankSelections,
   getSkipChoiceLabel,
   shouldShowFollowUpQuestionsForWorkingRankAnswer,
   shouldShowSecondaryForWorkingRankAnswer,
   SKIP_CHOICE_VALUE,
} from "../utils/choices";
import SecondaryQuestionFields from "./SecondaryQuestionFields";
import FollowUpQuestionsFields from "./FollowUpQuestionsFields";
import AnswerChoiceContent from "./AnswerChoiceContent";
import SkipChoiceButton from "./SkipChoiceButton";
import CountStepper from "./CountStepper";
import { choiceButtonRatingStyles } from "../utils/ratingStyles";

const ratingStyles = choiceButtonRatingStyles;

const buttonBase = "w-full rounded-xl border p-4 text-left transition cursor-pointer";
const rankCardClass = "rounded-xl border border-slate-300 bg-slate-100 p-4";
const rankCardTitleClass = "text-sm font-semibold uppercase tracking-wide text-slate-700";

function emptyRankSelections(rankCount) {
   const next = {};
   for (let rank = 1; rank <= rankCount; rank += 1) {
      next[String(rank)] = "";
   }
   return next;
}

function WorkingRankSelectionForm({
   choices,
   workingRanks = 1,
   value,
   onChange,
   secondaryQuestion,
   secondaryChoices = [],
   secondaryHideForValues = [],
   secondaryShowForValues = [],
   followUpQuestions = [],
   optionalReplacementCount = false,
   optionalCountQuestion = "",
   rowUnitCount = 0,
   quantityLabel = "row-units",
}) {
   const rankCount = Math.max(1, Number(workingRanks) || 1);
   const selections = getWorkingRankSelections(value);
   const secondaryAnswer = getSecondaryAnswer(value);
   const secondaryOther = getSecondaryOtherAnswer(value);
   const followUps = getFollowUpAnswers(value);
   const hasFollowUpQuestions = followUpQuestions.length > 0;
   const hasSecondaryQuestion = !hasFollowUpQuestions && Boolean(secondaryQuestion && secondaryChoices.length > 0);
   const secondaryStep = {
      secondary_question: secondaryQuestion,
      secondary_choices: secondaryChoices,
      secondary_hide_for_values: secondaryHideForValues,
      secondary_show_for_values: secondaryShowForValues,
   };
   const followUpStep = { follow_up_questions: followUpQuestions };
   const showFollowUpQuestions =
      hasFollowUpQuestions && shouldShowFollowUpQuestionsForWorkingRankAnswer(followUpStep, value, rankCount);
   const showSecondaryQuestion =
      hasSecondaryQuestion && shouldShowSecondaryForWorkingRankAnswer(secondaryStep, value, rankCount);
   const showRankLabels = rankCount > 1;
   const maxCount = Math.max(0, Number(rowUnitCount) || 0);
   const storedCount = getWorkingRankReplacementCount(value);
   const numericCount =
      storedCount != null ? Math.max(0, Math.min(maxCount, storedCount)) : 0;

   function emitAnswer(nextSelections, extras = {}) {
      const nextValue = { ranks: nextSelections };
      const probe = { ranks: nextSelections, ...extras };

      if (optionalReplacementCount && extras.replacementCount != null) {
         nextValue.replacementCount = String(extras.replacementCount);
      }

      if (hasFollowUpQuestions) {
         const showFollowUps = shouldShowFollowUpQuestionsForWorkingRankAnswer(followUpStep, probe, rankCount);
         if (showFollowUps) {
            nextValue.followUps = extras.followUps || {};
         }
      } else if (hasSecondaryQuestion) {
         const showSecondary = shouldShowSecondaryForWorkingRankAnswer(
            secondaryStep,
            { ranks: nextSelections, secondary: extras.secondary },
            rankCount,
         );

         if (showSecondary) {
            nextValue.secondary = extras.secondary || "";

            const otherChoiceValue = secondaryChoices.find((choice) => getChoiceValue(choice) === "other")
               ? "other"
               : null;

            if (otherChoiceValue && nextValue.secondary === otherChoiceValue) {
               nextValue.secondaryOther = extras.secondaryOther || "";
            }
         }
      }

      onChange(nextValue);
   }

   function selectRankChoice(rankNumber, choiceValue) {
      const choice = choices.find((item) => getChoiceValue(item) === choiceValue);
      const nextSelections = {
         ...selections,
         [String(rankNumber)]: choiceValue,
      };

      const extras = {
         secondary: secondaryAnswer,
         secondaryOther,
         followUps,
      };

      if (optionalReplacementCount) {
         if (choice?.rating === "good") {
            extras.replacementCount = 0;
         } else if (choice?.rating === "bad") {
            extras.replacementCount = maxCount;
         } else if (choiceValue !== SKIP_CHOICE_VALUE && storedCount != null) {
            extras.replacementCount = storedCount;
         }
      }

      emitAnswer(nextSelections, extras);
   }

   function updateReplacementCount(nextValue) {
      if (!optionalReplacementCount) return;

      const parsed =
         nextValue === "" ? 0 : Math.max(0, Math.min(maxCount, Number(nextValue) || 0));

      emitAnswer(emptyRankSelections(rankCount), {
         replacementCount: parsed,
         secondary: secondaryAnswer,
         secondaryOther,
         followUps,
      });
   }

   function handleSecondaryChange(nextValue) {
      emitAnswer(selections, {
         secondary: getSecondaryAnswer(nextValue),
         secondaryOther: getSecondaryOtherAnswer(nextValue),
         replacementCount: storedCount,
      });
   }

   function handleFollowUpChange(nextValue) {
      emitAnswer(selections, {
         followUps: getFollowUpAnswers(nextValue),
         replacementCount: storedCount,
      });
   }

   useEffect(() => {
      if (hasFollowUpQuestions) {
         if (showFollowUpQuestions || Object.keys(followUps).length === 0) return;
         emitAnswer(selections, { replacementCount: storedCount });
         return;
      }

      if (showSecondaryQuestion || (!secondaryAnswer && !secondaryOther)) return;

      emitAnswer(selections, { replacementCount: storedCount });
   }, [showSecondaryQuestion, showFollowUpQuestions]);

   return (
      <div className={`mt-6 ${showRankLabels ? "space-y-5" : "space-y-6"}`}>
         {Array.from({ length: rankCount }, (_, index) => {
            const rankNumber = index + 1;
            const selectedValue = selections[String(rankNumber)] || "";

            return (
               <div key={rankNumber} className={showRankLabels ? `${rankCardClass} space-y-3` : "space-y-3"}>
                  {showRankLabels && <h3 className={rankCardTitleClass}>Working rank {rankNumber}</h3>}

                  {choices.map((choice) => {
                     const choiceValue = getChoiceValue(choice);
                     const isSelected = selectedValue === choiceValue;
                     const styles = ratingStyles[choice.rating] ?? ratingStyles.unknown;

                     return (
                        <button
                           key={`${rankNumber}-${choiceValue}`}
                           type="button"
                           className={`${buttonBase} ${isSelected ? styles.selected : styles.unselected}`}
                           onClick={() => selectRankChoice(rankNumber, choiceValue)}>
                           <AnswerChoiceContent rating={choice.rating} badgeLabel={choice.badge_label}>
                              {choice.label}
                           </AnswerChoiceContent>
                        </button>
                     );
                  })}

                  <SkipChoiceButton
                     label={getSkipChoiceLabel({ perRank: showRankLabels })}
                     isSelected={selectedValue === SKIP_CHOICE_VALUE}
                     inRankCard={showRankLabels}
                     onClick={() => selectRankChoice(rankNumber, SKIP_CHOICE_VALUE)}
                  />
               </div>
            );
         })}

         {optionalReplacementCount && (
            <div className="space-y-2">
               <div className="text-sm font-medium text-slate-700">
                  {optionalCountQuestion || `Or enter how many ${quantityLabel} need replacement`}
               </div>
               {maxCount > 0 ? (
                  <div className="w-fit">
                     <CountStepper
                        value={numericCount}
                        onChange={updateReplacementCount}
                        onIncrement={() => {
                           if (numericCount >= maxCount) return;
                           updateReplacementCount(numericCount + 1);
                        }}
                        onDecrement={() => updateReplacementCount(Math.max(0, numericCount - 1))}
                        canIncrement={numericCount < maxCount}
                        canDecrement={numericCount > 0}
                        min={0}
                        max={maxCount}
                        ariaLabel={`${quantityLabel} needing replacement`}
                     />
                  </div>
               ) : (
                  <p className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-amber-900">
                     Complete machine width and row spacing on the previous step to calculate {quantityLabel}.
                  </p>
               )}
            </div>
         )}

         {hasFollowUpQuestions && showFollowUpQuestions && (
            <FollowUpQuestionsFields
               questions={followUpQuestions}
               value={{
                  ranks: selections,
                  followUps,
               }}
               onChange={handleFollowUpChange}
            />
         )}

         {hasSecondaryQuestion && showSecondaryQuestion && (
            <SecondaryQuestionFields
               secondaryQuestion={secondaryQuestion}
               secondaryChoices={secondaryChoices}
               value={{
                  ranks: selections,
                  secondary: secondaryAnswer,
                  secondaryOther,
               }}
               onChange={handleSecondaryChange}
            />
         )}
      </div>
   );
}

export default WorkingRankSelectionForm;
