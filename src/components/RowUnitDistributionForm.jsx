import { getChoiceValue, getSecondaryAnswer, getSecondaryOtherAnswer, normalizeRowUnitDistribution } from "../utils/choices";
import CountStepper from "./CountStepper";
import SecondaryQuestionFields from "./SecondaryQuestionFields";

const ratingStyles = {
   good: {
      border: "border-emerald-200",
      badge: "bg-emerald-100 text-emerald-800",
   },
   maybe: {
      border: "border-amber-200",
      badge: "bg-amber-100 text-amber-800",
   },
   bad: {
      border: "border-red-200",
      badge: "bg-red-100 text-red-800",
   },
   unknown: {
      border: "border-slate-200",
      badge: "bg-slate-100 text-slate-700",
   },
};

const ratingLabels = {
   good: "Good",
   maybe: "Marginal",
   bad: "Bad",
   unknown: "Not Sure",
};

function getQuantityLabels(quantityLabel = "row-units") {
   if (quantityLabel === "discs") {
      return { plural: "discs", singular: "disc", title: "Discs" };
   }

   return { plural: "row-units", singular: "row-unit", title: "Row-units" };
}

function RowUnitDistributionForm({
   choices,
   rowUnitCount,
   value,
   onChange,
   secondaryQuestion,
   secondaryChoices = [],
   quantityLabel = "row-units",
}) {
   const { plural, title } = getQuantityLabels(quantityLabel);
   const counts = normalizeRowUnitDistribution(value, choices);
   const secondaryAnswer = getSecondaryAnswer(value);
   const secondaryOther = getSecondaryOtherAnswer(value);
   const assigned = Object.values(counts).reduce((sum, count) => sum + count, 0);
   const remaining = rowUnitCount - assigned;
   const hasSecondaryQuestion = Boolean(secondaryQuestion && secondaryChoices.length > 0);
   const otherChoiceValue = secondaryChoices.find((choice) => getChoiceValue(choice) === "other") ? "other" : null;

   function emitAnswer(nextCounts, nextSecondary = secondaryAnswer, nextSecondaryOther = secondaryOther) {
      if (hasSecondaryQuestion) {
         const payload = {
            distribution: nextCounts,
            secondary: nextSecondary,
         };

         if (otherChoiceValue && nextSecondary === otherChoiceValue) {
            payload.secondaryOther = nextSecondaryOther;
         }

         onChange(payload);
         return;
      }

      onChange(nextCounts);
   }

   function updateCount(choiceValue, nextValue) {
      const parsed = Math.max(0, Number(nextValue) || 0);
      emitAnswer({
         ...counts,
         [choiceValue]: parsed,
      });
   }

   function incrementCount(choiceValue) {
      if (assigned >= rowUnitCount) return;
      updateCount(choiceValue, (counts[choiceValue] || 0) + 1);
   }

   function decrementCount(choiceValue) {
      updateCount(choiceValue, (counts[choiceValue] || 0) - 1);
   }

   if (!rowUnitCount) {
      return (
         <p className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-4 text-amber-900">
            Complete machine width and row spacing on the previous step to calculate row-unit count.
         </p>
      );
   }

   return (
      <div className="mt-3 space-y-4">
         {/* <p className="text-sm text-slate-600">
            This drill has <span className="font-semibold text-slate-900">{rowUnitCount} row-units</span>. Enter
            how many fall into each category.
         </p> */}

         {choices.map((choice) => {
            const choiceValue = getChoiceValue(choice);
            const count = counts[choiceValue] || 0;
            const styles = ratingStyles[choice.rating] ?? ratingStyles.unknown;

            return (
               <div key={choiceValue} className={`rounded-xl border p-4 ${styles.border}`}>
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                     <div>
                        <span className={`rounded-full px-2.5 py-1 text-xs font-semibold uppercase ${styles.badge}`}>
                           {choice.badge_label || ratingLabels[choice.rating] || choice.rating}
                        </span>
                        <p className="mt-2 font-medium text-slate-900">{choice.label}</p>
                     </div>

                     <div className="flex items-center gap-3 text-sm text-slate-600">
                        <span>{title}</span>
                        <CountStepper
                           value={count}
                           onChange={(nextValue) => updateCount(choiceValue, nextValue)}
                           onIncrement={() => incrementCount(choiceValue)}
                           onDecrement={() => decrementCount(choiceValue)}
                           canIncrement={assigned < rowUnitCount}
                           canDecrement={count > 0}
                           ariaLabel={`${choice.label} ${plural}`}
                        />
                     </div>
                  </div>
               </div>
            );
         })}

         <div
            className={`text-sm font-medium text-right italic ${remaining === 0 ? "text-emerald-700" : remaining < 0 ? "text-red-700" : "text-slate-600"}`}>
            {remaining === 0
               ? `All ${plural} assigned.`
               : remaining > 0
                 ? `${assigned} of ${rowUnitCount} assigned (${remaining} remaining)`
                 : `${Math.abs(remaining)} too many assigned`}
         </div>

         {hasSecondaryQuestion && (
            <SecondaryQuestionFields
               secondaryQuestion={secondaryQuestion}
               secondaryChoices={secondaryChoices}
               value={{
                  distribution: counts,
                  secondary: secondaryAnswer,
                  secondaryOther,
               }}
               onChange={onChange}
            />
         )}
      </div>
   );
}

export default RowUnitDistributionForm;
