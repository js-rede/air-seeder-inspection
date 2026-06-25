import { formatCostRange, formatCurrency } from "../utils/inspectionSummary";

const ratingLabels = {
   good: "Good",
   maybe: "Marginal",
   bad: "Bad",
   unknown: "Not Sure",
};

function InspectionResults({ summary, onRestart }) {
   const costRange = formatCostRange(summary.estimatedLow, summary.estimatedHigh);

   return (
      <section className="mt-5 rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
         <h2 className="text-3xl font-bold text-slate-900">Inspection Summary</h2>
         <p className="mt-3 text-lg text-slate-600">
            Based on your answers, here is a rough estimate of recommended service and rebuild costs.
         </p>

         <div className="mt-8 grid gap-4 sm:grid-cols-3">
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
               <p className="text-sm font-semibold uppercase text-emerald-800">Good</p>
               <p className="mt-2 text-3xl font-bold text-emerald-900">{summary.ratingCounts.good || 0}</p>
            </div>
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
               <p className="text-sm font-semibold uppercase text-amber-800">Marginal</p>
               <p className="mt-2 text-3xl font-bold text-amber-900">{summary.ratingCounts.maybe || 0}</p>
            </div>
            <div className="rounded-xl border border-red-200 bg-red-50 p-4">
               <p className="text-sm font-semibold uppercase text-red-800">Bad</p>
               <p className="mt-2 text-3xl font-bold text-red-900">{summary.ratingCounts.bad || 0}</p>
            </div>
         </div>

         <div className="mt-8 rounded-xl border border-slate-200 bg-slate-50 p-5">
            <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">Estimated service range</p>
            <p className="mt-2 text-4xl font-bold text-slate-900">{costRange || "$0"}</p>
            {summary.rowUnitCount > 0 && (
               <p className="mt-2 text-sm text-slate-600">Machine row-units: {summary.rowUnitCount}</p>
            )}
         </div>

         {summary.lineItems.length > 0 && (
            <div className="mt-8">
               <h3 className="text-xl font-semibold text-slate-900">Items affecting estimate</h3>
               <ul className="mt-4 space-y-3">
                  {summary.lineItems.map((item) => (
                     <li key={`${item.slug}-${item.label}`} className="rounded-xl border border-slate-200 p-4">
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                           <div>
                              <p className="font-semibold text-slate-900">{item.stepTitle}</p>
                              <p className="text-sm text-slate-600">
                                 {item.label} · {item.quantity} {item.quantityLabel} ·{" "}
                                 {ratingLabels[item.rating] || item.rating}
                              </p>
                           </div>
                           <p className="font-semibold text-slate-900">
                              {formatCostRange(item.estimatedLowCost, item.estimatedHighCost)}
                           </p>
                        </div>
                     </li>
                  ))}
               </ul>
            </div>
         )}

         <p className="mt-8 text-sm italic text-slate-500">
            All price estimates are for informational purposes only and are subject to change.
         </p>

         <footer className="mt-8 flex justify-end">
            <button
               type="button"
               onClick={onRestart}
               className="cursor-pointer rounded-xl border border-slate-300 bg-white px-6 py-3 font-rede-geom text-sm font-semibold uppercase italic tracking-wider text-slate-600 shadow-sm transition hover:bg-slate-50">
               Start Over
            </button>
         </footer>
      </section>
   );
}

export default InspectionResults;
