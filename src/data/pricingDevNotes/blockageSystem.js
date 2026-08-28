/**
 * Dev notes for blockage system step — pricing is placeholder/guessed until leadership defines catalog logic.
 */

import { formatCostBand, formatMoney } from "./shared";
import { getChoiceCostParts, getPerUnitTotalHigh, getPerUnitTotalLow } from "./stepCosts";

function getChoiceByRating(step, rating) {
   return step?.choices?.find((choice) => choice.rating === rating) ?? null;
}

function formatBandFromChoice(choice) {
   if (!choice) return null;
   const parts = getChoiceCostParts(choice);
   const totalLow = getPerUnitTotalLow(parts);
   const totalHigh = getPerUnitTotalHigh(parts);
   const partsBand = formatCostBand(parts.low, parts.high);
   const totalBand = totalLow === totalHigh ? formatMoney(totalLow) : `${formatMoney(totalLow)}–${formatMoney(totalHigh)}`;
   return { label: choice.label, partsBand, labor: parts.labor, totalBand };
}

export function getBlockageSystemPricingDevNotes(_machineSetup, context, step) {
   const fixing = getChoiceByRating(step, "maybe");
   const replacing = getChoiceByRating(step, "bad");
   const fixingBand = formatBandFromChoice(fixing);
   const replacingBand = formatBandFromChoice(replacing);

   const tertiary = context.selectedAnswer?.tertiary ?? context.tertiaryValue ?? "";
   const secondary = context.selectedAnswer?.secondary ?? context.secondaryValue ?? "";

   const subItems = [
      "No QBO/catalog SKUs wired — dollar amounts are guessed placeholders in inspection-steps.json.",
      fixingBand
         ? `Needs Fixing (MAYBE) → ${fixingBand.totalBand} flat (${fixingBand.partsBand} parts + $${fixingBand.labor} labor).`
         : null,
      replacingBand
         ? `Needs Replacing (BAD) → ${replacingBand.totalBand} flat (${replacingBand.partsBand} parts + $${replacingBand.labor} labor).`
         : null,
      "Good / Not installed → $0 in the estimate today.",
      secondary === "yes"
         ? "Not installed + interested — sales follow-up only; estimate stays $0 (confirmed)."
         : null,
      tertiary
         ? `Tertiary selection recorded: ${tertiary} — no SKU or price lookup yet.`
         : "Tertiary brand (Intelligent Ag vs J.Assy) does not change cost until wired.",
   ].filter(Boolean);

   return {
      howAppCalculates: [
         {
            text: "Flat drill-level band from primary answer only — secondary interest and tertiary brand are informational today.",
            subItems,
         },
         "GOOD → $0.",
      ],
      possibleSkus: [
         {
            sku: "n/a",
            price: null,
            note: "Intelligent Ag / Precision Planting",
            selected: tertiary === "intelligent-ag",
         },
         {
            sku: "n/a",
            price: null,
            note: "J.Assy wireless clamp-on",
            selected: tertiary === "j-assy-fully-wireless-clamp-on",
         },
      ],
      assumptions: [
         "Fix ($800–3,000) and replace ($10,000–15,000) bands were estimated — not from Woo/QBO.",
         "Not installed + interest → $0 estimate + sales follow-up only (leadership confirmed — do not add install quote).",
      ],
      openQuestions: [
         "What are the real prices for fix, replace, and new install (Intelligent Ag vs J.Assy)?",
         "What impacts price — row count, drill width, brand, partial vs full system?",
         "How should the app calculate blockage pricing — flat band, per row-unit, SKU list, or sales follow-up only?",
         "Are the guessed fix ($800–3,000) and replace ($10,000–15,000) bands in the right ballpark?",
         "Labor — should install/service hours be added (currently $0 in step JSON)?",
      ],
      selectedPart: null,
      secondaryValue: secondary || null,
      tertiaryValue: tertiary || null,
   };
}
