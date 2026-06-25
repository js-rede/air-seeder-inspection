import { useEffect, useState } from "react";
import CountStepper from "./CountStepper";

const MIN_ROW_UNITS = 10;
const MAX_ROW_UNITS = 150;
const MIN_WORKING_RANKS = 1;
const MAX_WORKING_RANKS = 4;

function clampRowUnits(value) {
   const parsed = Math.round(Number(value) || MIN_ROW_UNITS);
   return Math.min(MAX_ROW_UNITS, Math.max(MIN_ROW_UNITS, parsed));
}

function RowUnitCountModalContent({
   currentCount,
   calculatedCount,
   currentWorkingRanks,
   setupWorkingRanks,
   showWorkingRanks,
   onSave,
   onClose,
}) {
   const [count, setCount] = useState(() => {
      const initial = currentCount > 0 ? currentCount : calculatedCount > 0 ? calculatedCount : MIN_ROW_UNITS;
      return clampRowUnits(initial);
   });
   const [workingRanks, setWorkingRanks] = useState(() => {
      const initial = currentWorkingRanks > 0 ? currentWorkingRanks : MIN_WORKING_RANKS;
      return Math.min(MAX_WORKING_RANKS, Math.max(MIN_WORKING_RANKS, initial));
   });

   const hasValidRowUnits = count >= MIN_ROW_UNITS && count <= MAX_ROW_UNITS;
   const hasValidWorkingRanks = !showWorkingRanks || (workingRanks >= MIN_WORKING_RANKS && workingRanks <= MAX_WORKING_RANKS);
   const canSave = hasValidRowUnits && hasValidWorkingRanks;

   function updateCount(nextValue) {
      setCount(clampRowUnits(nextValue));
   }

   function updateWorkingRanks(nextValue) {
      const parsed = Math.round(Number(nextValue) || MIN_WORKING_RANKS);
      setWorkingRanks(Math.min(MAX_WORKING_RANKS, Math.max(MIN_WORKING_RANKS, parsed)));
   }

   function handleSubmit(event) {
      event.preventDefault();
      if (!canSave) return;

      const nextWorkingRanks = workingRanks;
      onSave({
         rowUnitCount: count > 0 ? count : null,
         workingRanks:
            showWorkingRanks && nextWorkingRanks > 0
               ? nextWorkingRanks === setupWorkingRanks
                  ? null
                  : nextWorkingRanks
               : undefined,
      });
      onClose();
   }

   const hasCalculatedCount = calculatedCount > 0;
   const isManual = hasCalculatedCount && currentCount !== calculatedCount;

   return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
         <button type="button" className="absolute inset-0 bg-slate-900/50" aria-label="Close dialog" onClick={onClose} />

         <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="row-unit-count-title"
            className="relative w-full max-w-[380px] rounded-2xl border border-slate-200 bg-white p-6 shadow-xl">
            <h2 id="row-unit-count-title" className="text-xl font-semibold text-slate-900">
               Edit Machine Setup
            </h2>

            <form onSubmit={handleSubmit} className="mt-6">
               <div className="mb-4 flex flex-col gap-1">
                  <label className="w-24 text-sm font-medium text-slate-700">Row-Units</label>

                  <div className="flex items-stretch gap-2">
                     <CountStepper
                        value={count}
                        onChange={updateCount}
                        onIncrement={() => updateCount(count + 1)}
                        onDecrement={() => updateCount(count - 1)}
                        canIncrement={count < MAX_ROW_UNITS}
                        canDecrement={count > MIN_ROW_UNITS}
                        min={MIN_ROW_UNITS}
                        max={MAX_ROW_UNITS}
                        ariaLabel="row-units"
                        className={hasCalculatedCount && isManual ? "shrink-0" : "grow justify-between"}
                     />
                     {hasCalculatedCount && isManual && (
                        <button
                           type="button"
                           onClick={() => {
                              onSave({ rowUnitCount: null });
                              onClose();
                           }}
                           className="flex grow cursor-pointer items-center justify-center rounded-xl border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-700 hover:bg-slate-50">
                           Reset to {calculatedCount} row-unit{calculatedCount === 1 ? "" : "s"}
                        </button>
                     )}
                  </div>
               </div>

               {showWorkingRanks && (
                  <div className="mt-8 mb-10 flex flex-col gap-1">
                     <label className="text-sm font-medium text-slate-700">Working Ranks</label>
                     <CountStepper
                        value={workingRanks}
                        onChange={updateWorkingRanks}
                        onIncrement={() => updateWorkingRanks(workingRanks + 1)}
                        onDecrement={() => updateWorkingRanks(workingRanks - 1)}
                        canIncrement={workingRanks < MAX_WORKING_RANKS}
                        canDecrement={workingRanks > MIN_WORKING_RANKS}
                        ariaLabel="working ranks"
                        className="grow justify-between"
                     />
                  </div>
               )}

               <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                  <button
                     type="button"
                     onClick={onClose}
                     className="grow cursor-pointer rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50">
                     Cancel
                  </button>

                  <button
                     type="submit"
                     disabled={!canSave}
                     className="grow cursor-pointer rounded-xl bg-[#e21313] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#c91010] disabled:cursor-not-allowed disabled:opacity-50">
                     Save
                  </button>
               </div>
            </form>
         </div>
      </div>
   );
}

function RowUnitCountModal({
   isOpen,
   currentCount,
   calculatedCount,
   currentWorkingRanks,
   setupWorkingRanks,
   showWorkingRanks,
   onSave,
   onClose,
}) {
   useEffect(() => {
      if (!isOpen) return undefined;

      function handleKeyDown(event) {
         if (event.key === "Escape") {
            onClose();
         }
      }

      document.addEventListener("keydown", handleKeyDown);
      return () => document.removeEventListener("keydown", handleKeyDown);
   }, [isOpen, onClose]);

   if (!isOpen) return null;

   return (
      <RowUnitCountModalContent
         currentCount={currentCount}
         calculatedCount={calculatedCount}
         currentWorkingRanks={currentWorkingRanks}
         setupWorkingRanks={setupWorkingRanks}
         showWorkingRanks={showWorkingRanks}
         onSave={onSave}
         onClose={onClose}
      />
   );
}

export default RowUnitCountModal;
