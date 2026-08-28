import { formatCostBand, formatMoney } from "./shared";

export function getReferenceChoice(step, ratings = ["bad", "maybe"]) {
   const choices = step?.choices ?? [];
   for (const rating of ratings) {
      const match = choices.find((choice) => choice.rating === rating);
      if (match) return match;
   }
   return choices.find((choice) => choice.rating !== "good") ?? null;
}

export function getChoiceCostParts(choice) {
   if (!choice) return { low: 0, high: 0, labor: 0 };

   return {
      low: Number(choice.estimated_low_cost) || 0,
      high: Number(choice.estimated_high_cost ?? choice.estimated_low_cost) || 0,
      labor: Number(choice.labor_cost) || 0,
   };
}

export function getPerUnitTotalLow(parts) {
   return parts.low + parts.labor;
}

export function getPerUnitTotalHigh(parts) {
   return parts.high + parts.labor;
}
