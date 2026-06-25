import { useEffect } from "react";
import {
   getChoiceValue,
   getSecondaryAnswer,
   getSecondaryOtherAnswer,
   getWorkingRankSelections,
   shouldShowSecondaryForWorkingRankAnswer,
} from "../utils/choices";
import SecondaryQuestionFields from "./SecondaryQuestionFields";

const ratingStyles = {
   good: {
      selected: "border-emerald-600 bg-emerald-50 text-emerald-900",
      unselected: "border-slate-300 bg-white hover:border-emerald-300 hover:bg-emerald-50/50",
   },
   maybe: {
      selected: "border-amber-600 bg-amber-50 text-amber-900",
      unselected: "border-slate-300 bg-white hover:border-amber-300 hover:bg-amber-50/50",
   },
   bad: {
      selected: "border-red-600 bg-red-50 text-red-900",
      unselected: "border-slate-300 bg-white hover:border-red-300 hover:bg-red-50/50",
   },
   unknown: {
      selected: "border-blue-600 bg-blue-50 text-blue-900",
      unselected: "border-slate-300 bg-white hover:border-slate-400 hover:bg-slate-50",
   },
};

const buttonBase = "w-full rounded-xl border p-4 text-left transition cursor-pointer";
const rankCardClass = "rounded-xl border border-slate-300 bg-slate-100 p-4";
const rankCardTitleClass = "text-sm font-semibold uppercase tracking-wide text-slate-700";

function WorkingRankSelectionForm({
   choices,
   workingRanks = 1,
   value,
   onChange,
   secondaryQuestion,
   secondaryChoices = [],
   secondaryHideForValues = [],
   secondaryShowForValues = [],
}) {
   const rankCount = Math.max(1, Number(workingRanks) || 1);
   const selections = getWorkingRankSelections(value);
   const secondaryAnswer = getSecondaryAnswer(value);
   const secondaryOther = getSecondaryOtherAnswer(value);
   const hasSecondaryQuestion = Boolean(secondaryQuestion && secondaryChoices.length > 0);
   const secondaryStep = {
      secondary_question: secondaryQuestion,
      secondary_choices: secondaryChoices,
      secondary_hide_for_values: secondaryHideForValues,
      secondary_show_for_values: secondaryShowForValues,
   };
   const showSecondaryQuestion =
      hasSecondaryQuestion && shouldShowSecondaryForWorkingRankAnswer(secondaryStep, value, rankCount);
   const showRankLabels = rankCount > 1;

   function emitAnswer(nextSelections, nextSecondary = secondaryAnswer, nextSecondaryOther = secondaryOther) {
      const nextValue = { ranks: nextSelections };
      const showSecondary = shouldShowSecondaryForWorkingRankAnswer(
         secondaryStep,
         { ranks: nextSelections, secondary: nextSecondary },
         rankCount,
      );

      if (hasSecondaryQuestion && showSecondary) {
         nextValue.secondary = nextSecondary;

         const otherChoiceValue = secondaryChoices.find((choice) => getChoiceValue(choice) === "other") ? "other" : null;

         if (otherChoiceValue && nextSecondary === otherChoiceValue) {
            nextValue.secondaryOther = nextSecondaryOther;
         }
      }

      onChange(nextValue);
   }

   function selectRankChoice(rankNumber, choiceValue) {
      const nextSelections = {
         ...selections,
         [String(rankNumber)]: choiceValue,
      };
      const showSecondary = shouldShowSecondaryForWorkingRankAnswer(
         secondaryStep,
         { ranks: nextSelections, secondary: secondaryAnswer },
         rankCount,
      );

      emitAnswer(nextSelections, showSecondary ? secondaryAnswer : "", showSecondary ? secondaryOther : "");
   }

   function handleSecondaryChange(nextValue) {
      emitAnswer(selections, getSecondaryAnswer(nextValue), getSecondaryOtherAnswer(nextValue));
   }

   useEffect(() => {
      if (showSecondaryQuestion || (!secondaryAnswer && !secondaryOther)) return;

      emitAnswer(selections, "", "");
   }, [showSecondaryQuestion]);

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
                           {choice.label}
                        </button>
                     );
                  })}
               </div>
            );
         })}

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
