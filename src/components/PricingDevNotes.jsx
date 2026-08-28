import { getPricingDevNotes } from "../data/pricingDevNotes";
import { getPricingDevNoteSectionTheme } from "../data/pricingDevNotes/sectionThemes";
import { isUnavailableCatalogPrice, isUnavailableCatalogSku, groupPossibleSkuItems } from "../data/pricingDevNotes/shared";
import { getSecondaryAnswer, getFollowUpAnswers, getTertiaryAnswer } from "../utils/choices";

const DEV_NOTES_EXCLUDED = new Set(["machine_setup", "wrap_up"]);

function PossiblePartRow({ item, index, theme }) {
   return (
      <li
         key={`${item.sku ?? "part"}-${item.note ?? index}`}
         className={`leading-snug ${item.selected ? `rounded-md px-2 py-1 -mx-2 ${theme.selectedRow}` : ""}`}>
         {isUnavailableCatalogSku(item.sku) ? (
            <>
               <span className="font-mono font-semibold text-slate-900">n/a</span>
               {item.note ? <span className="text-slate-600"> ({item.note})</span> : null}
            </>
         ) : (
            <>
               <span className="font-mono font-semibold text-slate-900">{item.sku}</span>
               {!isUnavailableCatalogPrice(item.price) ? (
                  <span className="text-slate-700"> — {item.price}</span>
               ) : null}
               {item.note ? <span className="text-slate-600"> ({item.note})</span> : null}
            </>
         )}
         {item.selected ? (
            <span className={`ml-1 text-xs font-semibold uppercase ${theme.selectedLabel}`}>← selected</span>
         ) : null}
      </li>
   );
}

function PricingDevNotes({
   step,
   machineSetup,
   selectedAnswer,
   rowUnitCount = 0,
   workingRanks = 0,
}) {
   if (!step?.slug || DEV_NOTES_EXCLUDED.has(step.section)) return null;

   const secondaryValue = getSecondaryAnswer(selectedAnswer);
   const tertiaryValue = getTertiaryAnswer(selectedAnswer);
   const followUps = getFollowUpAnswers(selectedAnswer);
   const notes = getPricingDevNotes(step, machineSetup, {
      secondaryValue,
      tertiaryValue,
      followUps,
      rowUnitCount,
      workingRanks,
      selectedAnswer,
   });
   if (!notes) return null;

   const theme = getPricingDevNoteSectionTheme(step.section);

   return (
      <aside
         className={`mt-6 rounded-xl border-2 border-dashed p-4 text-sm text-slate-800 ${theme.panel}`}
         aria-label="Development notes (to be removed later)">
         <span
            className={`rounded-md px-2 py-0.5 text-xs font-extrabold uppercase tracking-wide ${theme.badge}`}>
            Development notes{" "}
            <span className="font-normal italic normal-case">(to be removed later)</span>
         </span>

         <div className="mt-4 space-y-4">
            {notes.selectedPart && (
               <div>
                  <p className="text-xs font-bold uppercase tracking-wide text-slate-700">Selected part (this machine)</p>
                  <p className="mt-1 leading-relaxed">
                     <span className="font-mono font-semibold text-slate-900">{notes.selectedPart.sku}</span>
                     <span className="text-slate-700"> — {notes.selectedPart.price}</span>
                     <span className="text-slate-600"> ({notes.selectedPart.reason})</span>
                  </p>
               </div>
            )}

            <div>
               <p className="text-xs font-bold uppercase tracking-wide text-slate-700">How the app calculates today</p>
               <ul className="mt-2 list-disc space-y-1 pl-5">
                  {notes.howAppCalculates.map((item) => {
                     const text = typeof item === "string" ? item : item.text;
                     const subItems = typeof item === "string" ? [] : (item.subItems ?? []);

                     return (
                        <li key={text} className="leading-relaxed">
                           {text}
                           {subItems.length > 0 && (
                              <ul className="mt-1 list-disc space-y-1 pl-5">
                                 {subItems.map((subItem) => (
                                    <li key={subItem} className="leading-relaxed">
                                       {subItem}
                                    </li>
                                 ))}
                              </ul>
                           )}
                        </li>
                     );
                  })}
               </ul>
            </div>

            {notes.possibleSkus.length > 0 && (
               <div>
                  <p className="text-xs font-bold uppercase tracking-wide text-slate-700">Possible Parts</p>
                  {(() => {
                     const groups = groupPossibleSkuItems(notes.possibleSkus);
                     const showGroupLabels = groups.length > 1;

                     return (
                        <div className="mt-2 space-y-4">
                           {groups.map((group, groupIndex) => (
                              <div
                                 key={`${group.label}-${groupIndex}`}
                                 className={groupIndex > 0 ? "border-t border-slate-200/90 pt-4" : ""}>
                                 {showGroupLabels ? (
                                    <p className="mb-2 text-[11px] font-bold uppercase tracking-wide text-slate-500">
                                       {group.label}
                                    </p>
                                 ) : null}
                                 <ul className="space-y-1.5">
                                    {group.items.map((item, index) => (
                                       <PossiblePartRow
                                          key={`${item.sku ?? "part"}-${item.note ?? index}`}
                                          item={item}
                                          index={index}
                                          theme={theme}
                                       />
                                    ))}
                                 </ul>
                              </div>
                           ))}
                        </div>
                     );
                  })()}
               </div>
            )}

            {notes.assumptions.length > 0 && (
               <div>
                  <p className="text-xs font-bold uppercase tracking-wide text-slate-700">Assumptions</p>
                  <ul className="mt-2 list-disc space-y-1 pl-5">
                     {notes.assumptions.map((line) => (
                        <li key={line} className="leading-relaxed">
                           {line}
                        </li>
                     ))}
                  </ul>
               </div>
            )}

            {notes.openQuestions.length > 0 && (
               <div>
                  <p className="text-xs font-bold uppercase tracking-wide text-[#e21313]">Questions for you</p>
                  <ul className="mt-2 list-decimal space-y-1.5 pl-5">
                     {notes.openQuestions.map((q) => (
                        <li key={q} className="leading-relaxed font-medium text-slate-900">
                           {q}
                        </li>
                     ))}
                  </ul>
               </div>
            )}
         </div>
      </aside>
   );
}

export default PricingDevNotes;
