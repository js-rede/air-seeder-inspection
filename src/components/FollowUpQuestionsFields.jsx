import { getChoiceValue, getFollowUpAnswers, getFollowUpQuestionKey } from "../utils/choices";

const buttonBase = "w-full rounded-xl border p-4 text-left transition cursor-pointer";
const selectedClass = "border-blue-600 bg-blue-50 text-blue-900";
const unselectedClass = "border-slate-300 bg-white hover:border-slate-400 hover:bg-slate-50";

function FollowUpQuestionsFields({ questions = [], value, onChange }) {
   const followUps = getFollowUpAnswers(value);

   function updateFollowUp(key, nextValue, choices = []) {
      const otherChoiceValue = choices.find((choice) => getChoiceValue(choice) === "other") ? "other" : null;
      const nextFollowUps = {
         ...followUps,
         [key]: nextValue,
      };

      if (otherChoiceValue && nextValue === otherChoiceValue) {
         nextFollowUps[`${key}Other`] = followUps[`${key}Other`] || "";
      } else {
         delete nextFollowUps[`${key}Other`];
      }

      onChange({
         ...value,
         followUps: nextFollowUps,
      });
   }

   function updateFollowUpOther(key, nextOther) {
      onChange({
         ...value,
         followUps: {
            ...followUps,
            [`${key}Other`]: nextOther,
         },
      });
   }

   if (!questions.length) return null;

   return (
      <div className="mt-10 space-y-10 border-t border-slate-200 pt-8">
         {questions.map((question) => {
            const key = getFollowUpQuestionKey(question);
            const selectedValue = followUps[key] || "";
            const otherValue = followUps[`${key}Other`] || "";
            const choices = question.choices || [];
            const hasOther = choices.some((choice) => getChoiceValue(choice) === "other");

            return (
               <div key={key}>
                  <div className="text-xl font-semibold text-slate-900">{question.question}</div>

                  <div className="mt-4 space-y-3">
                     {choices.map((choice) => {
                        const choiceValue = getChoiceValue(choice);
                        const isSelected = selectedValue === choiceValue;

                        return (
                           <button
                              key={choiceValue}
                              type="button"
                              className={`${buttonBase} ${isSelected ? selectedClass : unselectedClass}`}
                              onClick={() => updateFollowUp(key, choiceValue, choices)}>
                              <span className="block font-semibold text-slate-900">{choice.label}</span>
                           </button>
                        );
                     })}
                  </div>

                  {hasOther && selectedValue === "other" && (
                     <div className="mt-4">
                        <label htmlFor={`follow-up-other-${key}`} className="mb-2 block text-sm font-medium text-slate-700">
                           Please describe
                        </label>
                        <input
                           id={`follow-up-other-${key}`}
                           type="text"
                           value={otherValue}
                           onChange={(e) => updateFollowUpOther(key, e.target.value)}
                           placeholder="Describe setup"
                           className="w-full rounded-xl border border-slate-500 p-4 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                        />
                     </div>
                  )}
               </div>
            );
         })}
      </div>
   );
}

export default FollowUpQuestionsFields;
