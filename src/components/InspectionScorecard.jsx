import { useState } from "react";
import { formatCostRange } from "../utils/inspectionSummary";
import RowUnitCountModal from "./RowUnitCountModal";

const ratingLabels = [
   { key: "good", label: "Good", className: "bg-emerald-100 text-emerald-800" },
   { key: "maybe", label: "Marginal", className: "bg-amber-100 text-amber-800" },
   { key: "bad", label: "Needs Replacement", className: "bg-red-100 text-red-800" },
];

function InspectionScorecard({
   summary,
   calculatedRowUnitCount = 0,
   setupWorkingRanks = 0,
   setupTankCount = 0,
   showWorkingRanks = false,
   showCartTanks = false,
   compact = false,
   onMachineCountsChange,
}) {
   const [isModalOpen, setIsModalOpen] = useState(false);
   const costRange = formatCostRange(summary.estimatedLow, summary.estimatedHigh);
   const rowUnitCount = summary.rowUnitCount;
   const workingRanks = summary.workingRanks;
   const tankCount = summary.tankCount;
   const showRowUnits = showWorkingRanks;
   const isManualCount = calculatedRowUnitCount > 0 && rowUnitCount !== calculatedRowUnitCount;
   const isManualTankCount = setupTankCount > 0 && tankCount !== setupTankCount;
   const rowUnitLabel = rowUnitCount === 1 ? "row-unit" : "row-units";
   const workingRankLabel = workingRanks === 1 ? "working rank" : "working ranks";
   const tankLabel = tankCount === 1 ? "tank" : "tanks";

   const countParts = [];

   if (showRowUnits) {
      countParts.push(rowUnitCount > 0 ? `${rowUnitCount} ${rowUnitLabel}` : "Row-unit count not set");
      if (isManualCount) countParts[countParts.length - 1] += " (edited)";
   }

   if (showWorkingRanks && workingRanks > 0) {
      countParts.push(`${workingRanks} ${workingRankLabel}`);
   }

   if (showCartTanks) {
      const tankText = tankCount > 0 ? `${tankCount} ${tankLabel}` : "Tank count not set";
      countParts.push(isManualTankCount ? `${tankText} (edited)` : tankText);
   }

   const machineCounts = (
      <div className="flex items-center justify-start gap-2 text-sm text-slate-500 lg:justify-end">
         <span>{countParts.join(" • ")}</span>
         <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="cursor-pointer rounded-md border border-slate-300 bg-white px-2 py-0.5 text-xs font-semibold uppercase tracking-wide text-slate-600 transition hover:bg-slate-50">
            Edit
         </button>
      </div>
   );

   return (
      <>
         {compact ? (
            <div className="mt-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
               <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500"></p>
                  {machineCounts}
               </div>
            </div>
         ) : (
            <div className="mt-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
               <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                     <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Inspection tally</p>
                     <div className="mt-2 flex flex-wrap gap-2">
                        {ratingLabels.map(({ key, label, className }) => (
                           <span key={key} className={`rounded-full px-3 py-1 text-sm font-semibold ${className}`}>
                              {label}: {summary.ratingCounts[key] || 0}
                           </span>
                        ))}
                     </div>
                  </div>

                  <div className="lg:text-right">
                     <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Running estimate</p>
                     <p className="mt-1 text-2xl font-bold text-slate-900">{costRange || "$0"}</p>
                     <div className="mt-1">{machineCounts}</div>
                  </div>
               </div>
            </div>
         )}

         <RowUnitCountModal
            isOpen={isModalOpen}
            currentCount={rowUnitCount}
            calculatedCount={calculatedRowUnitCount}
            currentWorkingRanks={workingRanks}
            setupWorkingRanks={setupWorkingRanks}
            currentTankCount={tankCount}
            setupTankCount={setupTankCount}
            showRowUnits={showRowUnits}
            showWorkingRanks={showWorkingRanks}
            showCartTanks={showCartTanks}
            onSave={onMachineCountsChange}
            onClose={() => setIsModalOpen(false)}
         />
      </>
   );
}

export default InspectionScorecard;
