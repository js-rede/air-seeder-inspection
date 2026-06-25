function InspectionNav({ currentIndex, totalSteps, onBack, onNext, canGoNext }) {
   const isFirst = currentIndex === 0;
   const isLast = currentIndex === totalSteps - 1;

   return (
      <footer className="flex items-center justify-between mt-7">
         <button
            type="button"
            onClick={onBack}
            disabled={isFirst}
            className="px-5 py-3 italic font-semibold tracking-wider uppercase transition bg-white border shadow-sm cursor-pointer rounded-xl border-slate-300 text-slate-600 hover:bg-slate-50 disabled:cursor-default disabled:opacity-40 font-rede-geom">
            ← Back
         </button>

         <button
            type="button"
            onClick={onNext}
            disabled={!canGoNext}
            className="
               rounded-xl
               bg-[#e21313]
               px-6
               py-3
               font-semibold
               text-white
               shadow-sm
               transition
               hover:bg-[#ce1b1b]
               cursor-pointer
               disabled:cursor-default
               disabled:opacity-40
               font-rede-geom
               uppercase
               tracking-wider
               italic
            ">
            {isLast ? "Finish Inspection" : "Next →"}
         </button>
      </footer>
   );
}

export default InspectionNav;
