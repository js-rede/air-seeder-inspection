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

function StepSideImage({ url, caption, alt }) {
   if (!url) return null;

   return (
      <aside className="shrink-0 self-center sm:self-start">
         {caption && <p className="m-auto mb-2 w-fit text-center text-xs text-slate-500 italic sm:text-left">{caption}</p>}
         <img src={url} alt={alt} className="mx-auto w-28 rounded-lg border border-slate-200 sm:mx-0 sm:w-40" />
      </aside>
   );
}

function StepTitleNav({ onBack, onNext, canGoBack, canGoNext, isLastStep }) {
   const navButtonClass =
      "cursor-pointer rounded-lg border border-slate-300 bg-white px-2.5 py-1 text-sm leading-none text-slate-600 transition hover:bg-slate-50 disabled:cursor-default disabled:opacity-40";

   return (
      <div className="flex shrink-0 items-center gap-1.5">
         <button
            type="button"
            onClick={onBack}
            disabled={!canGoBack}
            aria-label="Previous step"
            className={navButtonClass}>
            ←
         </button>
         <button
            type="button"
            onClick={onNext}
            disabled={!canGoNext || isLastStep}
            aria-label="Next step"
            className={navButtonClass}>
            →
         </button>
      </div>
   );
}

function InspectionCard({
   step,
   displayStepNumber,
   selectedAnswer,
   onAnswer,
   rowUnitCount = 0,
   workingRanks = 0,
   onBack,
   onNext,
   canGoBack = false,
   canGoNext = false,
   isLastStep = false,
}) {
   const answerType = step.answer_type || getAnswerType(step);
   const choices = getStepChoices(step);
   const effectiveWorkingRanks = step.answer_type === "working_rank_selection" ? Math.max(1, workingRanks) : workingRanks;
   const recommendation = getRecommendationForAnswer(step, selectedAnswer, rowUnitCount, effectiveWorkingRanks);
   const costRange = recommendation
      ? formatCostRange(recommendation.estimatedLowCost, recommendation.estimatedHighCost)
      : null;
   const useMultiRankCopy = effectiveWorkingRanks > 1 && step.answer_type === "working_rank_selection";
   const instructions = useMultiRankCopy ? step.instructions_multi_rank || step.instructions : step.instructions;
   const question = useMultiRankCopy ? step.question_multi_rank || step.question : step.question;
   const hasRecommendationIssues = recommendation?.rating && recommendation.rating !== "good";

   return (
      <section className="-mx-4 mt-5 rounded-none border border-slate-200 border-x-0 bg-white p-4 shadow-sm sm:mx-0 sm:rounded-2xl sm:border-x sm:p-8">
         {/* Title */}
         <div className="mb-4 flex items-center justify-between gap-3">
            <div className="min-w-0 text-sm font-semibold uppercase tracking-wide text-slate-500">
               Step {displayStepNumber ?? step.step_number}: {step.step_title}
            </div>
            {onBack && onNext && (
               <StepTitleNav
                  onBack={onBack}
                  onNext={onNext}
                  canGoBack={canGoBack}
                  canGoNext={canGoNext}
                  isLastStep={isLastStep}
               />
            )}
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
               {step.image_caption && <p className="mb-3 text-sm text-slate-500 italic">{step.image_caption}</p>}
               <div
                  className={`w-full overflow-hidden rounded-xl border border-slate-200 ${step.image_padding ?? "p-2"}`}>
                  <img
                     src={step.image_url}
                     alt={step.step_title}
                     className="m-auto block h-auto max-h-[218px] w-auto max-w-full"
                  />
               </div>
            </div>
         )}
         {/* Instructions */}
         <div
            className={`mb-8 ${step.image_2_url ? "flex flex-col gap-5 sm:flex-row sm:items-start sm:gap-6" : ""}`}>
            <div className="min-w-0 flex-1 text-lg leading-relaxed text-slate-600">
               <InstructionText text={instructions} />
               {step.link_text && step.link_url && (
                  <p className="mt-3 text-base">
                     <a
                        href={step.link_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm font-semibold italic text-slate-600 underline hover:text-slate-800">
                        {step.link_text}
                     </a>
                  </p>
               )}
            </div>
            {step.image_2_url && (
               <StepSideImage url={step.image_2_url} caption={step.image_2_caption} alt={step.step_title} />
            )}
         </div>
         {/* Question */}
         {question && <div className="text-xl font-semibold text-slate-900">{question}</div>}

         {/* Answers */}
         <AnswerGroup
            answerType={answerType}
            stepSlug={step.slug}
            choices={choices}
            rowUnitCount={rowUnitCount}
            workingRanks={effectiveWorkingRanks}
            selectedAnswer={selectedAnswer}
            onAnswer={onAnswer}
            secondaryQuestion={step.secondary_question}
            secondaryChoices={step.secondary_choices}
            secondaryHideForValues={step.secondary_hide_for_values}
            secondaryShowForValues={step.secondary_show_for_values}
            tertiaryQuestion={step.tertiary_question}
            tertiaryChoices={step.tertiary_choices}
            tertiaryShowForSecondaryValues={step.tertiary_show_for_secondary_values}
            inspectionSections={step.inspection_sections}
            hideSectionSecondary={step.hide_section_secondary === true}
            quantityLabel={step.quantity_label}
            maxCount={step.max_count ?? null}
            allowSkip={step.allow_skip !== false}
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

               <div className={`mt-2 text-slate-900 ${hasRecommendationIssues ? "italic" : ""}`}>{recommendation.text}</div>

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
