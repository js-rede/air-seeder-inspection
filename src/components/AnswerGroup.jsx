import MachineSetupForm from "./MachineSetupForm";
import RowUnitDistributionForm from "./RowUnitDistributionForm";
import WorkingRankSelectionForm from "./WorkingRankSelectionForm";
import SecondaryQuestionFields from "./SecondaryQuestionFields";
import { DISC_DIAMETER_OPTIONS } from "../data/discDiameterOptions";
import { selectClass, selectStyle } from "../utils/selectClass";
import {
   getChoiceValue,
   getSecondaryAnswer,
   getSecondaryOtherAnswer,
   getSelectionAnswerValue,
   shouldShowSecondaryQuestion,
} from "../utils/choices";

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

function AnswerGroup({
   answerType,
   stepSlug,
   choices = [],
   rowUnitCount = 0,
   workingRanks = 0,
   selectedAnswer,
   onAnswer,
   secondaryQuestion,
   secondaryChoices = [],
   secondaryHideForValues = [],
   secondaryShowForValues = [],
   quantityLabel = "row-units",
}) {
   const buttonBase = "w-full rounded-xl border p-4 text-left transition cursor-pointer";
   const defaultSelected = "border-blue-600 bg-blue-50 text-blue-900";
   const defaultUnselected = "border-slate-300 bg-white hover:border-slate-400 hover:bg-slate-50";
   const input =
      "w-full rounded-xl border border-slate-300 p-2.5 bg-gray-100 text-lg focus:border-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-200";

   if (answerType === "row_unit_distribution") {
      return (
         <RowUnitDistributionForm
            choices={choices}
            rowUnitCount={rowUnitCount}
            value={selectedAnswer}
            onChange={onAnswer}
            secondaryQuestion={secondaryQuestion}
            secondaryChoices={secondaryChoices}
            quantityLabel={quantityLabel}
         />
      );
   }

   if (answerType === "working_rank_selection") {
      return (
         <WorkingRankSelectionForm
            choices={choices}
            workingRanks={workingRanks}
            value={selectedAnswer}
            onChange={onAnswer}
            secondaryQuestion={secondaryQuestion}
            secondaryChoices={secondaryChoices}
            secondaryHideForValues={secondaryHideForValues}
            secondaryShowForValues={secondaryShowForValues}
         />
      );
   }

   if (answerType === "selection") {
      const selectionValue = getSelectionAnswerValue(selectedAnswer);
      const secondaryStep = {
         secondary_question: secondaryQuestion,
         secondary_choices: secondaryChoices,
         secondary_hide_for_values: secondaryHideForValues,
         secondary_show_for_values: secondaryShowForValues,
      };
      const showSecondaryQuestion = shouldShowSecondaryQuestion(secondaryStep, selectionValue);

      function selectPrimary(value) {
         const keepSecondary = shouldShowSecondaryQuestion(secondaryStep, value);

         if (!secondaryQuestion || !secondaryChoices.length) {
            onAnswer(value);
            return;
         }

         onAnswer({
            value,
            secondary: keepSecondary ? getSecondaryAnswer(selectedAnswer) : "",
            secondaryOther: keepSecondary ? getSecondaryOtherAnswer(selectedAnswer) : "",
         });
      }

      return (
         <div className="mt-6 space-y-3">
            {choices.map((choice) => {
               const value = getChoiceValue(choice);
               const isSelected = selectionValue === value;
               const styles = ratingStyles[choice.rating] ?? ratingStyles.unknown;

               return (
                  <button
                     key={value}
                     type="button"
                     className={`${buttonBase} ${isSelected ? styles.selected : styles.unselected}`}
                     onClick={() => selectPrimary(value)}>
                     {choice.label}
                  </button>
               );
            })}

            {showSecondaryQuestion && (
               <SecondaryQuestionFields
                  secondaryQuestion={secondaryQuestion}
                  secondaryChoices={secondaryChoices}
                  value={selectedAnswer && typeof selectedAnswer === "object" ? selectedAnswer : { value: selectionValue }}
                  onChange={onAnswer}
               />
            )}
         </div>
      );
   }

   if (answerType === "yes_no") {
      return (
         <div className="mt-6 space-y-3">
            {["Yes", "No", "Not Sure"].map((option) => (
               <button
                  key={option}
                  type="button"
                  className={`${buttonBase} ${selectedAnswer === option ? defaultSelected : defaultUnselected}`}
                  onClick={() => onAnswer(option)}>
                  {option}
               </button>
            ))}
         </div>
      );
   }

   if (answerType === "disc_diameter") {
      return (
         <div className="mt-6">
            <label htmlFor="disc-diameter" className="mb-2 block text-sm font-medium text-slate-700">
               Disc diameter
            </label>

            <select
               id="disc-diameter"
               value={selectedAnswer || ""}
               onChange={(e) => onAnswer(e.target.value)}
               className={selectClass}
               style={selectStyle}>
               <option value="">Select diameter…</option>
               {DISC_DIAMETER_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                     {option}
                  </option>
               ))}
            </select>
         </div>
      );
   }

   if (answerType === "measurement") {
      return (
         <div className="mt-6">
            <label className="block mb-2 text-sm font-medium text-slate-700">Measurement</label>

            <input
               type="number"
               step="0.01"
               value={selectedAnswer || ""}
               onChange={(e) => onAnswer(e.target.value)}
               placeholder="Example: 17.25"
               className={input}
            />
         </div>
      );
   }

   if (answerType === "machine_setup") {
      return <MachineSetupForm value={selectedAnswer} onChange={onAnswer} />;
   }

   if (answerType === "notes") {
      return (
         <div className="mt-6">
            <textarea
               id={stepSlug ? `inspection-notes-${stepSlug}` : "inspection-notes"}
               value={selectedAnswer || ""}
               onChange={(e) => onAnswer(e.target.value)}
               rows={5}
               placeholder="Optional notes…"
               className="w-full resize-y rounded-xl border border-slate-300 bg-white p-4 text-base text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
            />
         </div>
      );
   }

   return null;
}

export default AnswerGroup;
