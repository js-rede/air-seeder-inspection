import {
   getChoiceValue,
   getSecondaryAnswer,
   getSecondaryOtherAnswer,
   getTertiaryAnswer,
   getTertiaryOtherAnswer,
   shouldShowTertiaryQuestion,
} from "../utils/choices";

function SecondaryQuestionFields({
   secondaryQuestion,
   secondaryChoices,
   tertiaryQuestion,
   tertiaryChoices = [],
   tertiaryShowForSecondaryValues = [],
   value,
   onChange,
}) {
   const secondaryAnswer = getSecondaryAnswer(value);
   const secondaryOther = getSecondaryOtherAnswer(value);
   const tertiaryAnswer = getTertiaryAnswer(value);
   const tertiaryOther = getTertiaryOtherAnswer(value);
   const otherChoiceValue = secondaryChoices.find((choice) => getChoiceValue(choice) === "other")
      ? "other"
      : null;
   const tertiaryStep = {
      tertiary_question: tertiaryQuestion,
      tertiary_choices: tertiaryChoices,
      tertiary_show_for_secondary_values: tertiaryShowForSecondaryValues,
   };
   const showTertiaryQuestion = shouldShowTertiaryQuestion(tertiaryStep, secondaryAnswer);

   function updateSecondary(nextSecondary, nextSecondaryOther = secondaryOther) {
      const nextValue = {
         ...value,
         secondary: nextSecondary,
         secondaryOther: otherChoiceValue && nextSecondary === otherChoiceValue ? nextSecondaryOther : "",
      };

      if (!shouldShowTertiaryQuestion(tertiaryStep, nextSecondary)) {
         nextValue.tertiary = "";
         nextValue.tertiaryOther = "";
      }

      onChange(nextValue);
   }

   function updateSecondaryOther(nextSecondaryOther) {
      onChange({
         ...value,
         secondaryOther: nextSecondaryOther,
      });
   }

   function updateTertiary(nextTertiary, nextTertiaryOther = tertiaryOther) {
      const tertiaryOtherChoice = tertiaryChoices.find((choice) => getChoiceValue(choice) === "other")
         ? "other"
         : null;

      onChange({
         ...value,
         tertiary: nextTertiary,
         tertiaryOther: tertiaryOtherChoice && nextTertiary === tertiaryOtherChoice ? nextTertiaryOther : "",
      });
   }

   function updateTertiaryOther(nextTertiaryOther) {
      onChange({
         ...value,
         tertiaryOther: nextTertiaryOther,
      });
   }

   return (
      <div className="mt-10 border-t border-slate-200 pt-8">
         <div className="text-xl font-semibold text-slate-900">{secondaryQuestion}</div>

         <div className="mt-4 space-y-3">
            {secondaryChoices.map((choice) => {
               const choiceValue = getChoiceValue(choice);
               const isSelected = secondaryAnswer === choiceValue;
               const buttonBase = "w-full rounded-xl border p-4 text-left transition cursor-pointer";
               const selectedClass = "border-blue-600 bg-blue-50 text-blue-900";
               const unselectedClass = "border-slate-300 bg-white hover:border-slate-400 hover:bg-slate-50";

               return (
                  <button
                     key={choiceValue}
                     type="button"
                     className={`${buttonBase} ${isSelected ? selectedClass : unselectedClass}`}
                     onClick={() => updateSecondary(choiceValue)}>
                     <span className="block font-semibold text-slate-900">{choice.label}</span>
                     {choice.expense_symbol && (
                        <span className="mt-1 block text-sm font-medium tracking-wider text-slate-400">
                           {choice.expense_symbol}
                        </span>
                     )}
                  </button>
               );
            })}
         </div>

         {otherChoiceValue && secondaryAnswer === otherChoiceValue && (
            <div className="mt-4">
               <label htmlFor="secondary-other" className="mb-2 block text-sm font-medium text-slate-700">
                  Please describe
               </label>
               <input
                  id="secondary-other"
                  type="text"
                  value={secondaryOther}
                  onChange={(e) => updateSecondaryOther(e.target.value)}
                  placeholder="Describe pivot setup"
                  className="w-full rounded-xl border border-slate-500 p-4 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
               />
            </div>
         )}

         {showTertiaryQuestion && (
            <div className="mt-10 border-t border-slate-200 pt-8">
               <div className="text-xl font-semibold text-slate-900">{tertiaryQuestion}</div>

               <div className="mt-4 space-y-3">
                  {tertiaryChoices.map((choice) => {
                     const choiceValue = getChoiceValue(choice);
                     const isSelected = tertiaryAnswer === choiceValue;
                     const buttonBase = "w-full rounded-xl border p-4 text-left transition cursor-pointer";
                     const selectedClass = "border-blue-600 bg-blue-50 text-blue-900";
                     const unselectedClass = "border-slate-300 bg-white hover:border-slate-400 hover:bg-slate-50";

                     return (
                        <button
                           key={choiceValue}
                           type="button"
                           className={`${buttonBase} ${isSelected ? selectedClass : unselectedClass}`}
                           onClick={() => updateTertiary(choiceValue)}>
                           <span className="block font-semibold text-slate-900">{choice.label}</span>
                        </button>
                     );
                  })}
               </div>

               {tertiaryChoices.some((choice) => getChoiceValue(choice) === "other") &&
                  tertiaryAnswer === "other" && (
                     <div className="mt-4">
                        <label htmlFor="tertiary-other" className="mb-2 block text-sm font-medium text-slate-700">
                           Please describe
                        </label>
                        <input
                           id="tertiary-other"
                           type="text"
                           value={tertiaryOther}
                           onChange={(e) => updateTertiaryOther(e.target.value)}
                           placeholder="Describe system preference"
                           className="w-full rounded-xl border border-slate-500 p-4 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                        />
                     </div>
                  )}
            </div>
         )}
      </div>
   );
}

export default SecondaryQuestionFields;
