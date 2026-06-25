export const SKIP_CHOICE_VALUE = "__skip__";

export function isSkipChoiceValue(value) {
   return value === SKIP_CHOICE_VALUE;
}

export function getSkipChoiceLabel({ perRank = false } = {}) {
   return perRank ? "Skip this rank" : "Skip this question";
}
