import { getChoiceValue } from "../utils/choices";

function MultiSelectionForm({ choices, value, onChange }) {
   const selected = Array.isArray(value) ? value : [];
   const buttonBase = "w-full cursor-pointer rounded-xl border p-4 text-left transition";

   function toggleChoice(choiceValue) {
      const isSelected = selected.includes(choiceValue);
      const nextSelected = isSelected
         ? selected.filter((item) => item !== choiceValue)
         : [...selected, choiceValue];

      onChange(nextSelected);
   }

   return (
      <div className="mt-6 space-y-3">
         <p className="text-sm text-slate-500">Select all that need replacement. Leave blank if none apply.</p>

         {choices.map((choice) => {
            const choiceValue = getChoiceValue(choice);
            const isSelected = selected.includes(choiceValue);

            return (
               <button
                  key={choiceValue}
                  type="button"
                  aria-pressed={isSelected}
                  className={`${buttonBase} ${
                     isSelected
                        ? "border-slate-500 bg-slate-100 text-slate-900"
                        : "border-slate-300 bg-white hover:border-slate-400 hover:bg-slate-50"
                  }`}
                  onClick={() => toggleChoice(choiceValue)}>
                  <span className="flex items-center gap-3">
                     <span
                        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded border ${
                           isSelected
                              ? "border-slate-300 bg-white text-[#e21313]"
                              : "border-slate-300 bg-white"
                        }`}
                        aria-hidden="true">
                        {isSelected && (
                           <svg viewBox="0 0 12 12" className="h-3 w-3 fill-current">
                              <path d="M10.2 2.8 4.8 8.2 1.8 5.2l1.2-1.2 1.8 1.8 4.2-4.2z" />
                           </svg>
                        )}
                     </span>
                     <span className="font-medium text-slate-900">{choice.label}</span>
                  </span>
               </button>
            );
         })}
      </div>
   );
}

export default MultiSelectionForm;
