import MachineSetupForm from "./MachineSetupForm";
import RowUnitDistributionForm from "./RowUnitDistributionForm";
import WorkingRankSelectionForm from "./WorkingRankSelectionForm";
import MultiSelectionForm from "./MultiSelectionForm";
import SecondaryQuestionFields from "./SecondaryQuestionFields";
import { DISC_DIAMETER_OPTIONS } from "../data/discDiameterOptions";
import { selectClass, selectStyle } from "../utils/selectClass";
import {
   getChoiceValue,
   getSecondaryAnswer,
   getSecondaryOtherAnswer,
   getSelectionAnswerValue,
   getSkipChoiceLabel,
   shouldShowSecondaryQuestion,
   SKIP_CHOICE_VALUE,
} from "../utils/choices";
import { choiceButtonRatingStyles } from "../utils/ratingStyles";
import AnswerChoiceContent from "./AnswerChoiceContent";
import SkipChoiceButton from "./SkipChoiceButton";

const ratingStyles = choiceButtonRatingStyles;

const yesNoRatings = {
   Yes: "bad",
   No: "good",
   "Not Sure": "unknown",
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

   if (answerType === "multi_selection") {
      return <MultiSelectionForm choices={choices} value={selectedAnswer} onChange={onAnswer} />;
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
                     <AnswerChoiceContent rating={choice.rating} badgeLabel={choice.badge_label}>
                        {choice.label}
                     </AnswerChoiceContent>
                  </button>
               );
            })}

            <SkipChoiceButton
               label={getSkipChoiceLabel()}
               isSelected={selectionValue === SKIP_CHOICE_VALUE}
               onClick={() => selectPrimary(SKIP_CHOICE_VALUE)}
            />

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
            {["Yes", "No", "Not Sure"].map((option) => {
               const rating = yesNoRatings[option];
               const styles = ratingStyles[rating] ?? ratingStyles.unknown;

               return (
                  <button
                     key={option}
                     type="button"
                     className={`${buttonBase} ${selectedAnswer === option ? styles.selected : styles.unselected}`}
                     onClick={() => onAnswer(option)}>
                     <AnswerChoiceContent rating={rating}>{option}</AnswerChoiceContent>
                  </button>
               );
            })}
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
