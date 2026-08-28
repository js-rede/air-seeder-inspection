import { getClosingPricingDevNotes } from "../data/closingPricingDevNotes";

function ClosingPricingDevNotes({ stepSlug, section }) {
   if (section !== "closing_system") return null;

   const notes = getClosingPricingDevNotes(stepSlug);
   if (!notes) return null;

   return (
      <aside
         className="mt-6 rounded-xl border-2 border-dashed border-amber-400 bg-amber-50/80 p-4 text-sm text-slate-800"
         aria-label="Development notes (to be removed later)">
         <span className="rounded-md bg-amber-200 px-2 py-0.5 text-xs font-extrabold uppercase tracking-wide text-amber-950">
            Development notes{" "}
            <span className="font-normal italic normal-case">(to be removed later)</span>
         </span>

         <div className="mt-4 space-y-4">
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
                  <ul className="mt-2 space-y-1.5">
                     {notes.possibleSkus.map((item) => (
                        <li key={item.sku} className="leading-snug">
                           <span className="font-mono font-semibold text-slate-900">{item.sku}</span>
                           <span className="text-slate-700"> — {item.price}</span>
                           {item.note ? <span className="text-slate-600"> ({item.note})</span> : null}
                        </li>
                     ))}
                  </ul>
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

export default ClosingPricingDevNotes;
