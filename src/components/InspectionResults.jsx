import { useMemo, useState } from "react";
import {
   getCartSetup,
   getDrillSetup,
   getRowUnitSeriesLabel,
   isCartIncluded,
   isDrillIncluded,
   normalizeMachineSetup,
} from "../data/machineCatalog";
import { formatCostRange, groupItemsBySection } from "../utils/inspectionSummary";
import { getRatingLabel } from "../utils/ratingStyles";
import RatingBadge from "./RatingBadge";

/** Hide "1 row-units" / "1 item" for whole-machine costs; keep real counts (towers, row-units, etc.). */
function shouldShowQuantity(item) {
   if (item.quantity > 1) return true;
   const label = item.quantityLabel || "";
   return Boolean(label) && label !== "item" && label !== "row-units";
}

function getLineItemId(item) {
   return [item.slug, item.choiceValue || "", item.label || "", item.stepTitle || "", item.rating || ""].join("::");
}

function buildEquipmentDetails(machineSetup, summary) {
   const setup = normalizeMachineSetup(machineSetup);
   const groups = [];

   if (isDrillIncluded(setup)) {
      const drill = getDrillSetup(setup);
      const nameParts = [drill.manufacturer, drill.model].filter(Boolean);
      const details = [];

      if (setup.component === "both") {
         details.push({
            label: "Drill",
            value: nameParts.join(" ") || "Configured",
         });
      } else if (nameParts.length) {
         details.push({ label: "Model", value: nameParts.join(" ") });
      }

      if (drill.width) details.push({ label: "Width", value: drill.width });
      if (drill.rowSpacing) details.push({ label: "Spacing", value: drill.rowSpacing });
      if (summary.rowUnitCount > 0) {
         const seriesLabel = drill.rowUnitSeries ? getRowUnitSeriesLabel(drill.rowUnitSeries) : "";
         details.push({
            label: "Row-units",
            value: seriesLabel ? `${summary.rowUnitCount} (${seriesLabel} style)` : String(summary.rowUnitCount),
         });
      } else if (drill.rowUnitSeries) {
         details.push({
            label: "Row-units",
            value: `${getRowUnitSeriesLabel(drill.rowUnitSeries)} style`,
         });
      }
      if (summary.workingRanks > 0) {
         details.push({
            label: "Working ranks",
            value: String(summary.workingRanks),
         });
      }
      if (drill.otherDetails?.trim()) {
         details.push({ label: "Notes", value: drill.otherDetails.trim() });
      }

      if (details.length) groups.push({ key: "drill", details });
   }

   if (isCartIncluded(setup)) {
      const cart = getCartSetup(setup);
      const nameParts = [cart?.manufacturer, cart?.model].filter(Boolean);
      const details = [];

      if (setup.component === "both") {
         details.push({
            label: "Air cart",
            value: nameParts.join(" ") || "Configured",
         });
      } else if (nameParts.length) {
         details.push({ label: "Model", value: nameParts.join(" ") });
      }

      if (summary.tankCount > 0) {
         const tankLabel = summary.tankCount === 1 ? "1 tank" : `${summary.tankCount} tanks`;
         const tankSize = cart?.tankSize ? String(cart.tankSize).replace(/\s*bu\b/i, " bushels") : "";
         details.push({
            value: tankSize ? `${tankLabel}, ${tankSize}` : tankLabel,
         });
      } else if (cart?.tankSize) {
         details.push({ value: String(cart.tankSize).replace(/\s*bu\b/i, " bushels") });
      }
      if (cart?.otherDetails?.trim()) {
         details.push({ label: "Cart notes", value: cart.otherDetails.trim() });
      }

      if (details.length) groups.push({ key: "cart", details });
   }

   return groups;
}

function LineItemRow({ item, included, onToggleIncluded }) {
   const isMaybe = item.rating === "maybe";
   const isBad = item.rating === "bad";
   const accentBorder = isBad ? "border-l-4 border-l-red-500" : isMaybe ? "border-l-4 border-l-amber-500" : "";
   const showQuantity = shouldShowQuantity(item);
   const ratingClass = isBad ? "font-medium text-red-700" : isMaybe ? "font-medium text-amber-700" : "";
   const detailParts = [item.label, showQuantity ? `${item.quantity} ${item.quantityLabel}` : ""].filter(Boolean);
   const costLabel = formatCostRange(item.estimatedLowCost, item.estimatedHighCost);

   return (
      <li>
         <button
            type="button"
            aria-pressed={included}
            aria-label={`${included ? "Exclude" : "Include"} ${item.stepTitle} in estimate`}
            onClick={onToggleIncluded}
            className={`w-full cursor-pointer rounded-xl border border-slate-200 p-4 text-left transition ${accentBorder} hover:bg-slate-50 transition-colors duration-300 ${
               included ? "bg-white" : "bg-slate-50"
            }`}>
            <div
               className={`flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between ${
                  included ? "" : "opacity-60"
               }`}>
               <div className="flex min-w-0 items-start gap-3">
                  <span
                     className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border ${
                        included ? "border-[#adadad] bg-[#ffffff]" : "border-slate-300 bg-white"
                     }`}
                     aria-hidden="true">
                     {included && (
                        <svg viewBox="0 0 12 10" className="h-4 w-4 fill-black">
                           <path d="M10.2 2.8 4.8 8.2 1.8 5.2l1.2-1.2 1.8 1.8 4.2-4.2z" />
                        </svg>
                     )}
                  </span>
                  <div className="min-w-0">
                     <p className="font-semibold text-slate-900 text-base">
                        {item.stepTitle}
                        {(isMaybe || isBad) && (
                           <span className={`relative ml-2 text-xs uppercase tracking-wide opacity-80 ${ratingClass}`}>
                              {getRatingLabel(item.rating)}
                           </span>
                        )}
                     </p>
                     {detailParts.length > 0 && <p className="mt-1 text-sm text-slate-600">{detailParts.join(" · ")}</p>}
                  </div>
               </div>
               <p className={`shrink-0 font-semibold ${included ? "text-slate-900" : "text-slate-400 line-through"}`}>
                  {costLabel}
               </p>
            </div>
         </button>
      </li>
   );
}

function sumLineItemCosts(items) {
   return items.reduce(
      (totals, item) => ({
         low: totals.low + (Number(item.estimatedLowCost) || 0),
         high: totals.high + (Number(item.estimatedHighCost) || 0),
      }),
      { low: 0, high: 0 },
   );
}

function InspectionResults({ summary, machineSetup, onRestart }) {
   const [excludedIds, setExcludedIds] = useState(() => new Set());

   const hasMarginalItems =
      (summary.ratingCounts.maybe || 0) > 0 || summary.lineItems.some((item) => item.rating === "maybe");

   const marginalItemIds = useMemo(
      () => summary.lineItems.filter((item) => item.rating === "maybe").map(getLineItemId),
      [summary.lineItems],
   );

   const excludeMarginal = marginalItemIds.length > 0 && marginalItemIds.every((id) => excludedIds.has(id));

   function toggleItemExcluded(itemId) {
      setExcludedIds((previous) => {
         const next = new Set(previous);
         if (next.has(itemId)) next.delete(itemId);
         else next.add(itemId);
         return next;
      });
   }

   function handleExcludeMarginalToggle() {
      const nextExcludeMarginal = !excludeMarginal;
      setExcludedIds((previous) => {
         const next = new Set(previous);
         marginalItemIds.forEach((id) => {
            if (nextExcludeMarginal) next.add(id);
            else next.delete(id);
         });
         return next;
      });
   }

   const includedLineItems = useMemo(
      () => summary.lineItems.filter((item) => !excludedIds.has(getLineItemId(item))),
      [excludedIds, summary.lineItems],
   );

   const withoutMarginalItems = useMemo(
      () => summary.lineItems.filter((item) => item.rating !== "maybe"),
      [summary.lineItems],
   );

   const withMarginalCosts = useMemo(() => sumLineItemCosts(summary.lineItems), [summary.lineItems]);
   const withoutMarginalCosts = useMemo(() => sumLineItemCosts(withoutMarginalItems), [withoutMarginalItems]);
   const { low: estimatedLow, high: estimatedHigh } = useMemo(() => sumLineItemCosts(includedLineItems), [includedLineItems]);

   const costRange = formatCostRange(estimatedLow, estimatedHigh);
   const rangeWithoutMarginal = formatCostRange(withoutMarginalCosts.low, withoutMarginalCosts.high);
   const rangeWithMarginal = formatCostRange(withMarginalCosts.low, withMarginalCosts.high);
   const lineItemGroups = groupItemsBySection(summary.lineItems);
   const hasBothMachines =
      lineItemGroups.some((group) => group.section === "air_cart") &&
      lineItemGroups.some((group) => group.section !== "air_cart");
   const equipment = useMemo(() => buildEquipmentDetails(machineSetup, summary), [machineSetup, summary]);
   const hasCustomExclusions = excludedIds.size > 0;
   const onlyMarginalExcluded =
      excludeMarginal && excludedIds.size === marginalItemIds.length && marginalItemIds.every((id) => excludedIds.has(id));

   return (
      <>
         <section className="-mx-4 mt-5 rounded-none border border-slate-200 border-x-0 bg-white p-4 shadow-sm sm:mx-0 sm:rounded-2xl sm:border-x sm:p-8">
            <h2 className="text-3xl font-bold text-slate-900">Inspection Summary</h2>
            <p className="mt-3 text-sm text-slate-600 italic">
               Based on your answers, here is a rough estimate of recommended service and rebuild costs.
            </p>

            <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50 p-5">
               <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">Estimated service range</p>
               <p className="mt-2 text-4xl font-bold text-slate-900">{costRange || "$0"}</p>
               <ul className="mt-3 space-y-1 text-sm">
                  <li className="flex items-center gap-2 text-slate-600 text-sm">
                     <RatingBadge rating="maybe" />
                     <span>{summary.ratingCounts.maybe || 0} items are marginal</span>
                  </li>
                  <li className="flex items-center gap-2 text-slate-600 text-sm">
                     <RatingBadge rating="bad" />
                     <span>{summary.ratingCounts.bad || 0} items need replacement</span>
                  </li>
               </ul>

               <div className="pt-4">
                  <ul className="space-y-1 text-sm text-slate-600">
                     <li className="text-sm">
                        Your estimate of <span className="font-semibold text-slate-900">{rangeWithMarginal || "$0"}</span>{" "}
                        includes all items rated as <span className="font-semibold text-amber-500 italic">marginal</span> or{" "}
                        <span className="font-semibold text-red-700 italic">need replacement</span>.
                     </li>
                     {hasMarginalItems && (
                        <li className="text-sm">
                           Note: If only items rated as{" "}
                           <span className="font-semibold text-red-700 italic">need replacement</span> are included in the
                           estimate, the total drops to{" "}
                           <span className="font-semibold text-slate-900">{rangeWithoutMarginal || "$0"}</span>.
                        </li>
                     )}
                  </ul>
               </div>
            </div>

            {summary.lineItems.length > 0 && (
               <div className="mt-8">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                     <h3 className="text-xl font-semibold text-slate-900">Items Affecting Estimate</h3>
                     <div className="flex flex-wrap items-center gap-3 sm:justify-end">
                        <div
                           className={`overflow-hidden transition-all duration-200 ease-out max-w-[150px] ${
                              hasCustomExclusions ? " opacity-100" : "pointer-events-none max-w-0 opacity-0"
                           }`}>
                           <button
                              type="button"
                              onClick={() => setExcludedIds(new Set())}
                              disabled={!hasCustomExclusions}
                              tabIndex={hasCustomExclusions ? 0 : -1}
                              className="italic cursor-pointer whitespace-nowrap rounded-md border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-slate-500 transition hover:bg-slate-100 duration-300">
                              Reset selections
                           </button>
                        </div>
                        {hasMarginalItems && (
                           <div className="flex items-center gap-2">
                              <p className="text-xs font-medium uppercase italic tracking-wide text-slate-500 opacity-70">
                                 Turn off marginal items
                              </p>
                              <button
                                 type="button"
                                 role="switch"
                                 aria-checked={excludeMarginal}
                                 aria-label="Turn off marginal items"
                                 onClick={handleExcludeMarginalToggle}
                                 className={`border-0 border-none relative h-6 w-11 shrink-0 cursor-pointer rounded-full transition-colors ${
                                    excludeMarginal ? "bg-[#e21313]" : "bg-slate-300"
                                 }`}>
                                 <span
                                    className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
                                       excludeMarginal ? "translate-x-5" : "translate-x-0"
                                    }`}
                                 />
                              </button>
                           </div>
                        )}
                     </div>
                  </div>

                  <hr className="mt-7 border-slate-200" />

                  {lineItemGroups.length > 0 && (
                     <div className="mt-4">
                        {lineItemGroups.map((group, index) => {
                           const machine = group.section === "air_cart" ? "cart" : "drill";
                           const prevMachine =
                              index > 0 ? (lineItemGroups[index - 1].section === "air_cart" ? "cart" : "drill") : machine;
                           const showMachineDivider = index > 0 && machine !== prevMachine;
                           const showMachineLabel = hasBothMachines && (index === 0 || machine !== prevMachine);
                           const hideSectionLabel =
                              hasBothMachines && (group.section === "air_cart" || group.section === "drill");
                           return (
                              <div key={group.section}>
                                 {showMachineDivider && <hr className="mt-9 border-slate-200" />}
                                 {showMachineLabel && (
                                    <h3
                                       className={`text-lg font-bold text-slate-900 ${index === 0 ? "mt-6" : "mt-8"} ${machine === "cart" ? "-mb-3" : ""}`}>
                                       {machine === "cart" ? "Air Cart" : "Drill"}
                                    </h3>
                                 )}
                                 <div className="mt-6">
                                    {!hideSectionLabel && (
                                       <h4 className="text-sm font-semibold uppercase tracking-wide text-slate-500 -mb-1">
                                          {group.label}
                                       </h4>
                                    )}
                                    <ul className={`${hideSectionLabel ? "" : "mt-3"} space-y-3`}>
                                       {group.items.map((item) => {
                                          const itemId = getLineItemId(item);
                                          return (
                                             <LineItemRow
                                                key={itemId}
                                                item={item}
                                                included={!excludedIds.has(itemId)}
                                                onToggleIncluded={() => toggleItemExcluded(itemId)}
                                             />
                                          );
                                       })}
                                    </ul>
                                 </div>
                              </div>
                           );
                        })}
                     </div>
                  )}
               </div>
            )}

            <div className="mt-8 flex justify-end pt-5">
               <div className="text-right">
                  <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">Total estimate</p>
                  <p className="mt-1 text-3xl font-bold text-slate-900">{costRange || "$0"}</p>
                  {hasCustomExclusions && (
                     <p className="mt-1 mb-4 text-sm italic text-slate-500">
                        {onlyMarginalExcluded
                           ? "only includes items marked as needing replacement."
                           : "includes the items you selected above."}
                     </p>
                  )}
               </div>
            </div>

            <p className="mt-2 text-right text-sm italic text-slate-500">
               All price estimates are for informational purposes only and are subject to change.
            </p>

            {summary.interestItems.length > 0 && (
               <div className="mt-8">
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-5">
                     <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">Interested In</p>

                     <ul className="mt-2 list-disc space-y-2 pl-5">
                        {summary.interestItems.map((item) => (
                           <li key={item.slug} className="text-sm text-slate-900">
                              {item.stepTitle}
                           </li>
                        ))}
                     </ul>

                     <p className="mt-4 text-sm text-slate-600 italic">
                        A Red E representative can follow up with more information.
                     </p>
                  </div>
               </div>
            )}

            {equipment.length > 0 && (
               <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50 p-5">
                  <div className="space-y-4 text-sm text-slate-600">
                     {equipment.map((group) => {
                        const [heading, ...attributes] = group.details;
                        return (
                           <div key={group.key}>
                              {heading && (
                                 <p className="font-semibold text-slate-900 capitalize text-base">
                                    {heading.label}: {heading.value}
                                 </p>
                              )}
                              {attributes.length > 0 && (
                                 <div className="flex flex-wrap gap-x-3">
                                    {attributes.map((detail) => (
                                       <span key={`${group.key}-${detail.label || "value"}-${detail.value}`}>
                                          {detail.label ? `${detail.label}: ${detail.value}` : detail.value}
                                       </span>
                                    ))}
                                 </div>
                              )}
                           </div>
                        );
                     })}
                  </div>
               </div>
            )}
         </section>
         <footer className="mt-7 flex justify-end">
            <button
               type="button"
               onClick={onRestart}
               className="cursor-pointer rounded-xl border border-slate-300 bg-white px-6 py-3 font-rede-geom text-sm font-semibold uppercase italic tracking-wider text-slate-600 shadow-sm transition hover:bg-slate-50">
               Start Over
            </button>
         </footer>
      </>
   );
}

export default InspectionResults;
