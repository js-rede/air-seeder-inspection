const stepperButtonClass =
   "flex h-11 w-11 shrink-0 cursor-pointer items-center justify-center rounded-xl border border-slate-300 bg-white text-xl font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-default disabled:opacity-40";

const stepperInputClass =
   "w-14 [appearance:textfield] border-0 bg-transparent p-0 text-center text-lg font-semibold text-slate-900 focus:outline-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none";

function CountStepper({
   value,
   onChange,
   onIncrement,
   onDecrement,
   canIncrement,
   canDecrement,
   min = 0,
   max,
   ariaLabel,
   className = "",
}) {
   return (
      <div
         className={`flex items-center gap-1 rounded-xl border border-slate-300 bg-gray-100 p-1 ${className || ""}`}
         role="group"
         aria-label={ariaLabel}>
         <button
            type="button"
            onClick={onDecrement}
            disabled={!canDecrement}
            className={stepperButtonClass}
            aria-label={`Decrease ${ariaLabel}`}>
            −
         </button>

         <input
            type="number"
            min={min}
            max={max}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className={stepperInputClass}
            aria-label={ariaLabel}
         />

         <button
            type="button"
            onClick={onIncrement}
            disabled={!canIncrement}
            className={stepperButtonClass}
            aria-label={`Increase ${ariaLabel}`}>
            +
         </button>
      </div>
   );
}

export default CountStepper;
