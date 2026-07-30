import { useMemo, useState } from "react";
import {
   getCartSetup,
   getCartTankSizeLabel,
   getDrillSetup,
   getRowUnitSeriesLabel,
   isCartIncluded,
   isDrillIncluded,
   normalizeMachineSetup,
} from "../data/machineCatalog";
import { getSendReportUrl, getRequestFollowUpUrl } from "../config";
import { formatCostRange, groupItemsBySection } from "../utils/inspectionSummary";
import { getRatingLabel } from "../utils/ratingStyles";
import RatingBadge from "./RatingBadge";
import EmailReportModal from "./EmailReportModal";
import ContactFollowUpModal from "./ContactFollowUpModal";

/** Hide "1 row-units" / "1 item" for whole-machine costs; keep real counts (towers, row-units, etc.). */
function shouldShowQuantity(item) {
   if (item.quantity > 1) return true;
   const label = item.quantityLabel || "";
   return Boolean(label) && label !== "item" && label !== "row-units";
}

function getLineItemId(item) {
   return [item.slug, item.choiceValue || "", item.label || "", item.stepTitle || "", item.rating || ""].join("::");
}

function formatEquipmentLine(detail) {
   if (detail.label) return `${detail.label}: ${detail.value}`;
   return String(detail.value || "");
}

function buildEmailReport({
   equipment,
   includedLineItems,
   interestItems,
   costRange,
   estimatedLow,
   estimatedHigh,
   ratingCounts,
}) {
   return {
      estimate: {
         low: estimatedLow,
         high: estimatedHigh,
         label: costRange || "$0",
      },
      ratingCounts: {
         maybe: ratingCounts?.maybe || 0,
         bad: ratingCounts?.bad || 0,
      },
      equipment: equipment.map((group) => ({
         key: group.key,
         lines: group.details.map(formatEquipmentLine).filter(Boolean),
      })),
      lineItems: includedLineItems.map((item) => {
         const detailParts = [item.label, shouldShowQuantity(item) ? `${item.quantity} ${item.quantityLabel}` : ""].filter(
            Boolean,
         );
         return {
            title: item.stepTitle || "",
            detail: detailParts.join(" · "),
            rating: item.rating || "",
            ratingLabel: getRatingLabel(item.rating) || "",
            costLabel: formatCostRange(item.estimatedLowCost, item.estimatedHighCost) || "",
            costLow: item.estimatedLowCost,
            costHigh: item.estimatedHighCost,
         };
      }),
      interestItems: (interestItems || []).map((item) => item.stepTitle || item.label || item.title || "").filter(Boolean),
   };
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
         const tankSize = getCartTankSizeLabel(cart);
         const tankSizeDisplay = tankSize ? String(tankSize).replace(/\s*bu\b/i, " bushels") : "";
         details.push({
            value: tankSizeDisplay ? `${tankLabel}, ${tankSizeDisplay}` : tankLabel,
         });
      } else {
         const tankSize = getCartTankSizeLabel(cart);
         if (tankSize) {
            details.push({ value: String(tankSize).replace(/\s*bu\b/i, " bushels") });
         }
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

function InspectionResults({ summary, machineSetup, contactInfo, onRestart }) {
   const [excludedIds, setExcludedIds] = useState(() => new Set());
   const [emailModalOpen, setEmailModalOpen] = useState(false);
   const [emailStatus, setEmailStatus] = useState("idle"); // idle | sending | error | follow_up_failed
   const [followUpModalOpen, setFollowUpModalOpen] = useState(false);
   const [followUpRequested, setFollowUpRequested] = useState(false);

   const hasMarginalItems =
      (summary.ratingCounts.maybe || 0) > 0 || summary.lineItems.some((item) => item.rating === "maybe");

   const marginalItemIds = useMemo(
      () => summary.lineItems.filter((item) => item.rating === "maybe").map(getLineItemId),
      [summary.lineItems],
   );

   const excludeMarginal = marginalItemIds.length > 0 && marginalItemIds.every((id) => excludedIds.has(id));

   const emailButtonClass =
      "cursor-pointer rounded-xl bg-[#e21313] px-6 py-3 font-rede-geom text-sm font-semibold uppercase italic tracking-wider text-white shadow-sm transition hover:bg-[#ce1b1b] disabled:cursor-default disabled:opacity-60 min-w-[185px] text-center h-[44px]";

   function openEmailModal() {
      setEmailStatus("idle");
      setEmailModalOpen(true);
   }

   function closeEmailModal() {
      if (emailStatus === "sending") return;
      setEmailModalOpen(false);
      setEmailStatus("idle");
   }

   function openFollowUpModal() {
      setFollowUpModalOpen(true);
   }

   function closeFollowUpModal() {
      setFollowUpModalOpen(false);
   }

   async function postFollowUpRequest(contact, report) {
      const name =
         [contact?.firstName, contact?.lastName].filter(Boolean).join(" ").trim() ||
         [contactInfo?.firstName, contactInfo?.lastName].filter(Boolean).join(" ").trim() ||
         "there";

      const response = await fetch(getRequestFollowUpUrl(), {
         method: "POST",
         headers: { "Content-Type": "application/json" },
         body: JSON.stringify({
            firstName: contact?.firstName || contactInfo?.firstName || "",
            lastName: contact?.lastName || contactInfo?.lastName || "",
            email: contact?.email || contactInfo?.email || "",
            phone: contact?.phone || contactInfo?.phone || "",
            name,
            report,
         }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok || data?.ok === false) {
         throw new Error(data?.message || `Follow-up request failed (${response.status})`);
      }
   }

   async function handleFollowUpConfirm(nextContact) {
      const report = buildEmailReport({
         equipment,
         includedLineItems,
         interestItems: summary.interestItems,
         costRange,
         estimatedLow,
         estimatedHigh,
         ratingCounts: summary.ratingCounts,
      });

      await postFollowUpRequest(nextContact, report);
      setFollowUpRequested(true);
      setFollowUpModalOpen(false);
   }

   function renderActionButtons({ align = "start" } = {}) {
      return (
         <div className={`mt-3 mb-2 flex flex-wrap gap-3 ${align === "end" ? "justify-end" : ""}`}>
            <button type="button" onClick={openFollowUpModal} disabled={followUpRequested} className={emailButtonClass}>
               {followUpRequested ? "Follow-up requested" : "Request a follow-up"}
            </button>
            <button type="button" onClick={openEmailModal} className={emailButtonClass}>
               Email my report
            </button>
         </div>
      );
   }

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

   async function handleSendReport(emails, followUpChoice = null) {
      const name = [contactInfo?.firstName, contactInfo?.lastName].filter(Boolean).join(" ").trim() || "there";
      const url = getSendReportUrl();
      const report = buildEmailReport({
         equipment,
         includedLineItems,
         interestItems: summary.interestItems,
         costRange,
         estimatedLow,
         estimatedHigh,
         ratingCounts: summary.ratingCounts,
      });

      setEmailStatus("sending");
      try {
         const response = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
               name,
               firstName: contactInfo?.firstName || "",
               lastName: contactInfo?.lastName || "",
               emails,
               email: contactInfo?.email || "",
               phone: contactInfo?.phone || "",
               report,
            }),
         });
         const data = await response.json().catch(() => ({}));
         if (!response.ok || data?.ok === false) {
            throw new Error(data?.message || `Request failed (${response.status})`);
         }

         if (followUpChoice === "yes") {
            try {
               await postFollowUpRequest(contactInfo, report);
               setFollowUpRequested(true);
            } catch (followUpError) {
               console.error("Email sent, but follow-up request failed:", followUpError);
               setEmailStatus("follow_up_failed");
               return;
            }
         }

         setEmailModalOpen(false);
         setEmailStatus("idle");
      } catch (error) {
         console.error("Failed to email report:", error);
         setEmailStatus("error");
      }
   }

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
                           If items rated as <span className="font-semibold text-amber-500 italic">marginal</span> are{" "}
                           <span className="font-bold">not</span> included in the estimate, the total drops to{" "}
                           <span className="font-semibold text-slate-900">{rangeWithoutMarginal || "$0"}</span>.
                        </li>
                     )}
                     <li className="text-sm">
                        You can toggle items on and off with the checkboxes (on the left) to customize your estimate.
                     </li>
                  </ul>
               </div>

               {renderActionButtons()}
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
                  {renderActionButtons({ align: "end" })}
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
                        {followUpRequested ? (
                           "A Red E representative will follow up with more information."
                        ) : (
                           <>
                              A Red E representative can{" "}
                              <button
                                 type="button"
                                 onClick={openFollowUpModal}
                                 className="cursor-pointer border-0 bg-transparent p-0 font-semibold italic text-[#e21313] underline decoration-[#e21313]/30 underline-offset-2 transition hover:text-[#ce1b1b] hover:decoration-[#ce1b1b]">
                                 follow up
                              </button>{" "}
                              with more information.
                           </>
                        )}
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

         <EmailReportModal
            isOpen={emailModalOpen}
            initialEmail={contactInfo?.email || ""}
            onClose={closeEmailModal}
            onSend={handleSendReport}
            status={emailStatus}
            followUpAlreadyRequested={followUpRequested}
         />

         <ContactFollowUpModal
            isOpen={followUpModalOpen}
            initialContact={contactInfo}
            onClose={closeFollowUpModal}
            onConfirm={handleFollowUpConfirm}
         />
      </>
   );
}

export default InspectionResults;
