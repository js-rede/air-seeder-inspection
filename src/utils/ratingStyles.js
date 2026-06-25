export const ratingLabels = {
   good: "Good",
   maybe: "Marginal",
   bad: "Bad",
   unknown: "Not Sure",
};

export const ratingDotClassNames = {
   good: "bg-emerald-100 border-2 border-emerald-300",
   maybe: "bg-amber-100 border-2 border-amber-300",
   bad: "bg-red-100 border-2 border-red-300",
   unknown: "bg-slate-100 border-2 border-slate-300",
};

export const ratingBadgeClassNames = {
   good: "bg-emerald-100 text-emerald-800",
   maybe: "bg-amber-100 text-amber-800",
   bad: "bg-red-100 text-red-800",
   unknown: "bg-slate-100 text-slate-700",
};

export const choiceButtonRatingStyles = {
   good: {
      selected: "border-emerald-600 bg-emerald-50 text-emerald-900",
      unselected: "border-slate-300 bg-white hover:border-emerald-300 hover:bg-emerald-50/50",
   },
   maybe: {
      selected: "border-amber-600 bg-amber-50 text-amber-900",
      unselected: "border-slate-300 bg-white hover:border-amber-300 hover:bg-amber-50/50",
   },
   bad: {
      selected: "border-red-600 bg-red-50 text-red-900",
      unselected: "border-slate-300 bg-white hover:border-red-300 hover:bg-red-50/50",
   },
   unknown: {
      selected: "border-blue-600 bg-blue-50 text-blue-900",
      unselected: "border-slate-300 bg-white hover:border-slate-400 hover:bg-slate-50",
   },
};

export const rowUnitDistributionBorderClassNames = {
   good: "border-emerald-200",
   maybe: "border-amber-200",
   bad: "border-red-200",
   unknown: "border-slate-200",
};

export function getRatingDotClassName(rating) {
   return ratingDotClassNames[rating] ?? ratingDotClassNames.unknown;
}

export function getRatingBadgeClassName(rating) {
   return ratingBadgeClassNames[rating] ?? ratingBadgeClassNames.unknown;
}

export function getRatingLabel(rating, badgeLabel) {
   if (badgeLabel) return badgeLabel;
   return ratingLabels[rating] ?? rating ?? "Unknown";
}

/** Fixed first column width so answer labels align across all choices. */
export const answerChoiceGridClass = "grid w-full grid-cols-[1rem_minmax(0,1fr)] items-center gap-3";
