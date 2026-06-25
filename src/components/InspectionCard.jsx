import AnswerGroup from "./AnswerGroup";
import { getAnswerType } from "../data/discDiameterOptions";
import { getRecommendationForAnswer, getStepChoices } from "../utils/choices";

function formatCostRange(low, high) {
   if (low == null && high == null) return null;
   if (low === 0 && high === 0) return null;
   if (low === high) return `Estimated cost: $${low.toLocaleString()}`;
   return `Estimated cost: $${low.toLocaleString()} – $${high.toLocaleString()}`;
}

function InstructionText({ text }) {
   if (!text) return null;

   const parts = String(text)
      .split(/<br\s*\/?>/gi)
      .map((part) => part.trim())
      .filter(Boolean);

   if (parts.length <= 1) {
      return parts[0] ?? text;
   }

   return (
      <div className="flex flex-col gap-2">
         {parts.map((part, index) => (
            <span key={index}>{part}</span>
         ))}
      </div>
   );
}

function InspectionCard({ step, selectedAnswer, onAnswer, rowUnitCount = 0, workingRanks = 0 }) {
   const answerType = step.answer_type || getAnswerType(step);
   const choices = getStepChoices(step);
   const effectiveWorkingRanks =
      step.answer_type === "working_rank_selection" ? Math.max(1, workingRanks) : workingRanks;
   const recommendation = getRecommendationForAnswer(step, selectedAnswer, rowUnitCount, effectiveWorkingRanks);
   const costRange = recommendation
      ? formatCostRange(recommendation.estimatedLowCost, recommendation.estimatedHighCost)
      : null;
   const useMultiRankCopy = effectiveWorkingRanks > 1 && step.answer_type === "working_rank_selection";
   const instructions = useMultiRankCopy ? step.instructions_multi_rank || step.instructions : step.instructions;
   const question = useMultiRankCopy ? step.question_multi_rank || step.question : step.question;
   const hasRecommendationIssues = recommendation?.rating && recommendation.rating !== "good";

   return (
      <section className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm mt-5">
         {/* Title */}
         <div className="text-sm font-semibold uppercase tracking-wide text-slate-500 mb-4">
            Step {step.step_number}: {step.step_title}
         </div>
         {/* Video */}
         {step.video_url && (
            <>
               {step.video_caption && <p className="mt-3 text-sm text-slate-500 italic">{step.video_caption}</p>}
               <div className="mb-6 overflow-hidden rounded-xl border border-slate-200">
                  <iframe src={step.video_url} title={step.step_title} allowFullScreen className="aspect-video w-full" />
               </div>
            </>
         )}
         {/* Image */}
         {step.image_url && (
            <div className="mb-6">
               {step.image_caption && <p className="mt-3 text-sm text-slate-500 italic">{step.image_caption}</p>}
               <img src={step.image_url} alt={step.step_title} className="w-full rounded-xl border border-slate-200" />
            </div>
         )}
         {/* Instructions */}
         <div className="mb-8 text-lg leading-relaxed text-slate-600">
            <InstructionText text={instructions} />
         </div>
         {/* Question */}
         {question && <div className="text-xl font-semibold text-slate-900">{question}</div>}

         {/* Answers */}
         <AnswerGroup
            answerType={answerType}
            choices={choices}
            rowUnitCount={rowUnitCount}
            workingRanks={effectiveWorkingRanks}
            selectedAnswer={selectedAnswer}
            onAnswer={onAnswer}
            secondaryQuestion={step.secondary_question}
            secondaryChoices={step.secondary_choices}
            secondaryHideForValues={step.secondary_hide_for_values}
            secondaryShowForValues={step.secondary_show_for_values}
            quantityLabel={step.quantity_label}
         />

         {/* Recommendation */}
         {recommendation?.text && (
            <div
               className={`mt-8 rounded-xl border p-4 text-slate-700 ${
                  hasRecommendationIssues ? "border-amber-600 bg-amber-50" : "border-slate-300 bg-white"
               }`}>
               <div
                  className={`text-sm font-semibold uppercase tracking-wide ${
                     hasRecommendationIssues ? "text-amber-800" : "text-slate-500"
                  }`}>
                  Recommendation
               </div>

               <div className={`mt-2 text-slate-900 ${hasRecommendationIssues ? "italic" : ""}`}>
                  {recommendation.text}
               </div>

               {recommendation.lines?.length > 0 && (
                  <ul className="mt-4 list-disc space-y-1 pl-5 text-slate-900">
                     {recommendation.lines.map((line) => (
                        <li key={line}>{line}</li>
                     ))}
                  </ul>
               )}

               {recommendation.detail && !recommendation.lines?.length && (
                  <div className="mt-2 text-sm text-slate-600">{recommendation.detail}</div>
               )}

               {costRange && <div className="mt-4 text-sm font-medium text-slate-600">{costRange}</div>}
            </div>
         )}
      </section>
   );
}

export default InspectionCard;
