function SkipChoiceButton({ label, isSelected, onClick, inRankCard = false }) {
   const selectedClass = inRankCard
      ? "border-slate-400 bg-slate-200 text-slate-700"
      : "border-slate-400 bg-slate-100 text-slate-700";

   return (
      <button
         type="button"
         onClick={onClick}
         className={`w-full cursor-pointer rounded-xl border p-4 text-left transition ${
            isSelected ? selectedClass : "border-slate-300 bg-white hover:border-slate-400 hover:bg-slate-50"
         }`}>
         <span className="text-xs font-medium uppercase italic tracking-wide text-slate-600 opacity-70">
            {label} {">>"}
         </span>
      </button>
   );
}

export default SkipChoiceButton;
