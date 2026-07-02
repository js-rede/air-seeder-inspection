function InspectionNav({
   currentIndex,
   totalSteps,
   onBack,
   onNext,
   canGoNext,
   showOptionalCartInspection = false,
   onStartCartInspection,
   showOptionalDrillInspection = false,
   onStartDrillInspection,
}) {
   const isFirst = currentIndex === 0;
   const isLast = currentIndex === totalSteps - 1;
   const actionButtonClass =
      "cursor-pointer rounded-xl px-6 py-3 font-rede-geom text-sm font-semibold uppercase italic tracking-wider transition disabled:cursor-default disabled:opacity-40";

   return (
      <footer className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
         <button
            type="button"
            onClick={onBack}
            disabled={isFirst}
            className="cursor-pointer rounded-xl border border-slate-300 bg-white px-5 py-3 font-rede-geom text-sm font-semibold uppercase italic tracking-wider text-slate-600 shadow-sm transition hover:bg-slate-50 disabled:cursor-default disabled:opacity-40">
            ← Back
         </button>

         <div className="flex flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-end">
            {showOptionalDrillInspection && (
               <button
                  type="button"
                  onClick={onStartDrillInspection}
                  className={`${actionButtonClass} border border-slate-300 bg-white text-slate-700 shadow-sm hover:bg-slate-50`}>
                  Inspect Drill →
               </button>
            )}

            {showOptionalCartInspection && (
               <button
                  type="button"
                  onClick={onStartCartInspection}
                  className={`${actionButtonClass} border border-slate-300 bg-white text-slate-700 shadow-sm hover:bg-slate-50`}>
                  Inspect Air Cart →
               </button>
            )}

            <button
               type="button"
               onClick={onNext}
               disabled={!canGoNext}
               className={`${actionButtonClass} bg-[#e21313] text-white shadow-sm hover:bg-[#ce1b1b]`}>
               {isLast ? "Finish Inspection" : "Next →"}
            </button>
         </div>
      </footer>
   );
}

export default InspectionNav;
