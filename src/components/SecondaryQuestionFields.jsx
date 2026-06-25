import { getChoiceValue, getSecondaryAnswer, getSecondaryOtherAnswer } from "../utils/choices";

function SecondaryQuestionFields({ secondaryQuestion, secondaryChoices, value, onChange }) {
   const secondaryAnswer = getSecondaryAnswer(value);
   const secondaryOther = getSecondaryOtherAnswer(value);
   const otherChoiceValue = secondaryChoices.find((choice) => getChoiceValue(choice) === "other")
      ? "other"
      : null;

   function updateSecondary(nextSecondary, nextSecondaryOther = secondaryOther) {
      onChange({
         ...value,
         secondary: nextSecondary,
         secondaryOther: otherChoiceValue && nextSecondary === otherChoiceValue ? nextSecondaryOther : "",
      });
   }

   function updateSecondaryOther(nextSecondaryOther) {
      onChange({
         ...value,
         secondaryOther: nextSecondaryOther,
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
      </div>
   );
}

export default SecondaryQuestionFields;
