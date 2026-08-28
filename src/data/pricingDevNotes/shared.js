/** Shared helpers for pricing development notes (all sections). */

export function formatMoney(amount) {
   return `$${Number(amount).toFixed(2)}`;
}

export function formatCostBand(low, high) {
   const lo = Number(low) || 0;
   const hi = Number(high ?? low) || 0;
   if (lo <= 0 && hi <= 0) return "$0";
   if (lo === hi) return formatMoney(lo);
   return `${formatMoney(lo)}–${formatMoney(hi)}`;
}

export function resolveRowUnitCount(drill, rowUnitCount) {
   const fromProp = Number(rowUnitCount);
   if (fromProp > 0) return fromProp;

   const fromDrill = Number(drill?.rowUnitCount);
   return fromDrill > 0 ? fromDrill : null;
}

/** @returns {{ text: string, subItems: string[] } | null} */
export function buildQuantityExample({ quantity, quantityLabel, perUnitTotal }) {
   if (!quantity || quantity <= 0 || !perUnitTotal) return null;

   const perUnitFormatted = formatMoney(perUnitTotal);
   const totalFormatted = formatMoney(perUnitTotal * quantity);
   const unitLabel = quantity === 1 ? quantityLabel.replace(/s$/, "") : quantityLabel;

   return {
      text: "",
      subItems: [`Example for this machine: ${quantity} ${unitLabel} × ${perUnitFormatted} = ${totalFormatted}.`],
   };
}

const PLACEHOLDER_PRICE_PATTERN = /^(step\s*json\s*band|step\s*band|tbd)$/i;
const DASH_ONLY_SKU_CHARS = new Set(["-", "−", "–", "—", "―"]);

function isDashOnlySku(value) {
   const trimmed = String(value).trim();
   if (!trimmed) return false;
   return [...trimmed].every((char) => DASH_ONLY_SKU_CHARS.has(char));
}

export function formatPossiblePartsList(parts, selectedSku = null) {
   return normalizePossibleSkuRows(
      (parts ?? []).map((part) => ({
         sku: part.sku ?? part.name,
         price: part.price ?? "TBD",
         note: part.note ?? "",
         selected: selectedSku != null && (part.sku === selectedSku || part.name === selectedSku),
      })),
   );
}

/** True when a possible-parts row has no catalog SKU (—, n/a, empty, placeholder price label). */
export function isUnavailableCatalogSku(sku) {
   if (sku == null || sku === "") return true;
   const normalized = String(sku).trim().toLowerCase();
   if (normalized === "n/a" || normalized === "na") return true;
   if (isDashOnlySku(normalized)) return true;
   if (PLACEHOLDER_PRICE_PATTERN.test(normalized)) return true;
   return false;
}

/** True when price should not be shown (—, TBD-only placeholders, step JSON band labels). */
export function isUnavailableCatalogPrice(price) {
   if (price == null || price === "") return true;
   const normalized = String(price).trim();
   if (isUnavailableCatalogSku(normalized)) return true;
   return PLACEHOLDER_PRICE_PATTERN.test(normalized);
}

function cleanUnavailablePartNote(note) {
   return String(note ?? "")
      .replace(/\s*[—–-]\s*no (catalog )?sku(\s+wired)?\s*$/i, "")
      .trim();
}

/** Normalize dev-note rows so unmapped catalog items always display as n/a (label). */
export function normalizePossibleSkuRow(item) {
   if (!item) return item;

   const skuUnavailable = isUnavailableCatalogSku(item.sku);
   if (!skuUnavailable) return item;

   return {
      ...item,
      sku: "n/a",
      price: null,
      note: cleanUnavailablePartNote(item.note),
   };
}

export function normalizePossibleSkuRows(items) {
   return (items ?? []).map(normalizePossibleSkuRow);
}

function inferPossibleSkuGroup(item) {
   const note = item?.note ?? "";
   if (/^Lower\s*—/.test(note)) return "Lower";
   if (/^Meter\s*—/.test(note)) return "Meter housing";
   if (/^Upper\s*—/.test(note)) return "Upper kit";
   if (/^(Lid|Ladder)/.test(note)) return "Lid & ladder";
   return null;
}

/** Group consecutive possible-parts rows for section spacing in dev notes UI. */
export function groupPossibleSkuItems(items) {
   if (!items?.length) return [];

   const groups = [];

   for (const item of items) {
      const label = item.group ?? inferPossibleSkuGroup(item) ?? "Catalog";
      const last = groups[groups.length - 1];

      if (last && last.label === label) {
         last.items.push(item);
      } else {
         groups.push({ label, items: [item] });
      }
   }

   return groups;
}

export const DEV_NOTES_EXCLUDED_SLUGS = new Set([
   "machine-setup",
   "drill-notes",
   "cart-notes",
   "upgrade-interest",
]);

/** @param {string} question */
export function isMaybeBadQuoteQuestion(question) {
   if (!question || typeof question !== "string") return false;
   const q = question.toLowerCase();
   if (/quote on maybe or bad only/.test(q)) return true;
   if (/quote wheels on maybe/.test(q)) return true;
   if (/quote discs on maybe/.test(q)) return true;
   if (/same cost for maybe and bad/.test(q)) return true;
   if (/maybe and bad — same/.test(q)) return true;
   if (/maybe vs bad/.test(q)) return true;
   return false;
}

function laborHintFromStep(step) {
   const ref = step?.choices?.find((choice) => choice.rating === "maybe" || choice.rating === "bad");
   const labor = Number(ref?.labor_cost);
   return labor > 0 ? labor : null;
}

/**
 * Strip MAYBE/BAD rating-quote questions and ensure a labor verification question is present.
 * @param {string[]} [questions]
 * @param {object} [step]
 */
export function finalizeOpenQuestions(questions = [], step = null) {
   const filtered = questions.filter((q) => !isMaybeBadQuoteQuestion(q));
   const hasLaborQuestion = filtered.some(
      (q) => /^Labor/i.test(q) || /calculating labor/i.test(q) || /labor per /i.test(q),
   );

   if (!hasLaborQuestion) {
      const labor = laborHintFromStep(step);
      filtered.push(
         labor != null
            ? `Labor — double-check $${labor} and how it combines with parts (per row-unit, per tally, or flat).`
            : "Labor — double-check amount and how it combines with parts (per row-unit, per tally, or flat).",
      );
   }

   return filtered;
}
