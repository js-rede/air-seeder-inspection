/**
 * Internal “how does this work” notes for closing-system steps (demo / leadership review).
 */

/** @type {Record<string, { howAppCalculates: Array<string | { text: string, subItems?: string[] }>, possibleSkus: Array<{ sku: string, price: string, note?: string }>, assumptions: string[], openQuestions: string[] }>} */
export const closingPricingDevNotesBySlug = {
   "closing-wheel-pivot": {
      howAppCalculates: [
         {
            text: "MAYBE/BAD on any rank → $65–75 parts + $65 labor per affected row-unit.",
            subItems: ["This controls how many row-units get quoted, not which kit."],
         },
         "GOOD → $0.",
      ],
      possibleSkus: [
         { sku: "AG-K36", price: "$45.87", note: "60/90 greaseless (default Red E)" },
         { sku: "AG-K01", price: "$65.00", note: "60/90 HD grease" },
         { sku: "AG-K01-5060", price: "$75.00", note: "50 & 60 series HD grease" },
         { sku: "AG-K39", price: "$45.37", note: "ProSeries — from machine setup" },
         { sku: "PD5-K03", price: "$48.30", note: "PD500 — from machine setup" },
         { sku: "NA-K07-FULL", price: "$42.10", note: "Needham greaseless" },
      ],
      assumptions: [],
      openQuestions: [
         "How do we know which one to quote? I don't want to ask the user to pick one — that seems confusing and unnecessary. The best experience is for us to calculate it automatically (machine setup can help, but there can still be more than one choice for a given machine).",
         "Default pivot SKU for 60/90 when not ProSeries or PD500: AG-K36 or AG-K01?",
         "Same kit for MAYBE and BAD?",
         "How are we calculating labor? Labor $ per row-unit on top of parts?",
      ],
   },
   "closing-wheel-spring": {
      howAppCalculates: [
         "MAYBE/BAD → $15–35 parts + $8 labor per row-unit.",
         "GOOD → $0.",
      ],
      possibleSkus: [
         { sku: "AG-K14L / AG-K14R", price: "$31.20", note: "HD spring — 60/90 (from machine setup)" },
         { sku: "AG-K14L-PRO / AG-K14R-PRO", price: "$27.48", note: "ProSeries (from machine setup)" },
         { sku: "CWS-90L / CWS-90R", price: "$14.50", note: "Standard round wire" },
      ],
      assumptions: [
         "Machine setup should pick HD vs standard and ProSeries vs 60/90 variant.",
         "HD vs round wire may still need a business rule (always HD on bad, or always from machine?).",
      ],
      openQuestions: [
         "HD spring (AG-K14) vs round wire (CWS-90) — driven by machine, by answer, or both?",
         "Same cost for MAYBE and BAD?",
      ],
   },
   "closing-wheel-arm": {
      howAppCalculates: [
         "Each tallied arm → $100–350 parts + $20 labor (per arm, not per row-unit).",
         "GOOD → $0.",
      ],
      possibleSkus: [
         { sku: "AG-K19-90", price: "$272.50", note: "60/90 series — from machine setup" },
         { sku: "AG-K19-50", price: "$86.20", note: "50 series — from machine setup" },
      ],
      assumptions: [
         "Arm SKU should come from machine series; 50 vs 90 is a large price difference.",
         "App uses a flat $100–350 band today instead of catalog price × count.",
      ],
      openQuestions: [
         "Use catalog price × arm count instead of $100–350?",
         "Is $20 labor per arm still right?",
      ],
   },
   "closing-wheel": {
      howAppCalculates: [
         "MAYBE/BAD → $110–180 parts + $12 labor per row-unit.",
         "GOOD → $0.",
         "Secondary setup (Smooth / Notch / Bolt-On) is asked but does not change the estimate yet.",
      ],
      possibleSkus: [
         { sku: "AG2150", price: "$110.00", note: "Cast notched" },
         { sku: "AG-K20", price: "$76.62", note: "Bolt-on" },
         { sku: "AG1032", price: "$46.50", note: "Smooth cast (new only)" },
      ],
      assumptions: [
         "Wheel SKU likely comes from customer's current setup answer or machine defaults.",
         "Not using used wheels (AG1032-USED) online.",
      ],
      openQuestions: [
         "Should setup answer pick the SKU (Smooth → AG1032, Bolt-On → AG-K20, Notch → AG2150)?",
         "Quote wheels on MAYBE, or only on BAD?",
      ],
   },
   "closing-wheel-bearing": {
      howAppCalculates: [
         "BAD → $110–180 flat for the whole step (not per bearing × row-units).",
         "GOOD or MAYBE → $0.",
      ],
      possibleSkus: [{ sku: "AG2028X", price: "$19.00", note: "Per bearing — likely × row-units flagged bad" }],
      assumptions: [
         "Catalog is per bearing; app uses one flat step range today.",
         "$19 × row count can be much higher than $110–180 on a full drill.",
      ],
      openQuestions: [
         "Per-bearing × row-units, or keep a simpler flat range for customers?",
         "Labor per bearing or per row-unit?",
      ],
   },
};

export function getClosingPricingDevNotes(slug) {
   return closingPricingDevNotesBySlug[slug] ?? null;
}
