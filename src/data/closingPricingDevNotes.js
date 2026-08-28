/**
 * Internal development notes for closing-system steps (demo / leadership review).
 * Part selection is driven by src/data/closingPartRules.js when machine setup is present.
 */

import {
   CLOSING_PARTS_CATALOG,
   formatClosingPartPrice,
   getClosingPartSelection,
} from "./closingPartRules";
import { getDrillSetup } from "./machineCatalog";
import { getReplacementTallyCount } from "../utils/choices";

const ALL_CLOSING_PARTS = [
   { sku: "AG-K36", note: "60/90 greaseless (default Red E)" },
   { sku: "AG-K01", note: "60/90 HD grease" },
   { sku: "AG-K01-5060", note: "50 & 60 series HD grease" },
   { sku: "AG-K39", note: "ProSeries row units" },
   { sku: "PD5-K03", note: "PD500-class drills" },
   { sku: "NA-K07-FULL", note: "Needham greaseless (not auto-selected)" },
   { sku: "AG-K14L / AG-K14R", note: "HD spring — 60/90" },
   { sku: "AG-K14L-PRO / AG-K14R-PRO", note: "HD spring — ProSeries" },
   { sku: "CWS-90L / CWS-90R", note: "Standard round wire (not auto-selected)" },
   { sku: "AG-K19-90", note: "60/90 series arm" },
   { sku: "AG-K19-50", note: "50 series arm" },
   { sku: "AG2150", note: "Cast notched wheel" },
   { sku: "AG-K20", note: "Bolt-on wheel" },
   { sku: "AG1032", note: "Smooth cast wheel" },
   { sku: "AG2028X", note: "Closing wheel bearing" },
];

const PARTS_BY_SLUG = {
   "closing-wheel-pivot": ["AG-K36", "AG-K01", "AG-K01-5060", "AG-K39", "PD5-K03", "NA-K07-FULL"],
   "closing-wheel-spring": ["AG-K14L / AG-K14R", "AG-K14L-PRO / AG-K14R-PRO", "CWS-90L / CWS-90R"],
   "closing-wheel-arm": ["AG-K19-90", "AG-K19-50"],
   "closing-wheel": ["AG2150", "AG-K20", "AG1032"],
   "closing-wheel-bearing": ["AG2028X"],
};

const LABOR_BY_SLUG = {
   "closing-wheel-pivot": 65,
   "closing-wheel-spring": 8,
   "closing-wheel-arm": 20,
   "closing-wheel": 12,
   "closing-wheel-bearing": 12,
};

function formatPartsList(skus, selectedSku) {
   return skus.map((sku) => {
      const catalog = CLOSING_PARTS_CATALOG[sku];
      const noteEntry = ALL_CLOSING_PARTS.find((item) => item.sku === sku);
      return {
         sku,
         price: catalog ? formatClosingPartPrice(catalog.price) : "—",
         note: noteEntry?.note ?? catalog?.title ?? "",
         selected: sku === selectedSku,
      };
   });
}

function formatPerUnitTotal(partsPrice, labor) {
   return formatClosingPartPrice(Number(partsPrice) + Number(labor));
}

function resolveRowUnitCount(drill, rowUnitCount) {
   const fromProp = Number(rowUnitCount);
   if (fromProp > 0) return fromProp;

   const fromDrill = Number(drill?.rowUnitCount);
   return fromDrill > 0 ? fromDrill : null;
}

/** @returns {{ text: string, subItems: string[] } | null} */
function buildQuantityExample({ quantity, quantityLabel, partsAmount, labor }) {
   if (!quantity || quantity <= 0 || !partsAmount) return null;

   const perUnit = Number(partsAmount) + Number(labor);
   const perUnitFormatted = formatClosingPartPrice(perUnit);
   const totalFormatted = formatClosingPartPrice(perUnit * quantity);
   const unitLabel = quantity === 1 ? quantityLabel.replace(/s$/, "") : quantityLabel;

   return {
      text: "",
      subItems: [
         `Example for this machine: ${quantity} ${unitLabel} × ${perUnitFormatted} = ${totalFormatted}.`,
      ],
   };
}

/** @returns {{ text: string, subItems?: string[] }} */
function buildPerUnitCostLine({
   ratingLabel,
   partsAmount,
   labor,
   partsPriceFormatted,
   perUnitTotalFormatted,
   extraSubItems = [],
   example,
}) {
   const subItems = [...extraSubItems];
   if (example?.subItems?.length) {
      subItems.push(...example.subItems);
   }

   return {
      text: perUnitTotalFormatted
         ? `${ratingLabel} → ${perUnitTotalFormatted} total per affected row-unit (${partsPriceFormatted} parts + $${labor} labor, from machine setup).`
         : `${ratingLabel} → ${partsPriceFormatted} parts + $${labor} labor per affected row-unit (from machine setup).`,
      subItems: subItems.length ? subItems : undefined,
   };
}

function buildPivotNotes(selection, drill, context) {
   const labor = LABOR_BY_SLUG["closing-wheel-pivot"];
   const partsAmount = selection?.price ?? 0;
   const partsPrice = selection ? formatClosingPartPrice(partsAmount) : "catalog part";
   const perUnitTotal = selection ? formatPerUnitTotal(partsAmount, labor) : null;
   const rowUnits = resolveRowUnitCount(drill, context.rowUnitCount);
   const example = buildQuantityExample({
      quantity: rowUnits,
      quantityLabel: "row-units",
      partsAmount: selection ? partsAmount : 0,
      labor,
   });

   return {
      howAppCalculates: [
         buildPerUnitCostLine({
            ratingLabel: "MAYBE/BAD on any rank",
            partsAmount,
            labor,
            partsPriceFormatted: partsPrice,
            perUnitTotalFormatted: perUnitTotal,
            extraSubItems: ["This controls how many row-units get quoted, not which kit."],
            example,
         }),
         "GOOD → $0.",
      ],
      openQuestions: selection
         ? ["How are we calculating labor? Labor $ per row-unit on top of parts?"]
         : [
              "Complete machine setup to auto-select pivot part.",
              "Default pivot SKU for 60/90 when not ProSeries or PD500: AG-K36 or AG-K01?",
              "How are we calculating labor? Labor $ per row-unit on top of parts?",
           ],
      assumptions: drill?.manufacturer
         ? [`Selected for ${drill.manufacturer}${drill.model ? ` ${drill.model}` : ""}: ${selection?.reason ?? "pending"}.`]
         : [],
   };
}

function buildSpringNotes(selection, drill, context) {
   const labor = LABOR_BY_SLUG["closing-wheel-spring"];
   const partsAmount = selection?.price ?? 0;
   const partsPrice = selection ? formatClosingPartPrice(partsAmount) : "catalog part";
   const perUnitTotal = selection ? formatPerUnitTotal(partsAmount, labor) : null;
   const rowUnits = resolveRowUnitCount(drill, context.rowUnitCount);
   const example = buildQuantityExample({
      quantity: rowUnits,
      quantityLabel: "row-units",
      partsAmount: selection ? partsAmount : 0,
      labor,
   });

   return {
      howAppCalculates: [
         buildPerUnitCostLine({
            ratingLabel: "MAYBE/BAD",
            partsAmount,
            labor,
            partsPriceFormatted: partsPrice,
            perUnitTotalFormatted: perUnitTotal,
            example,
         }),
         "GOOD → $0.",
      ],
      openQuestions: ["Same cost for MAYBE and BAD?", "Should round-wire CWS-90 ever auto-select for certain drills?"],
      assumptions: drill?.manufacturer
         ? [`HD spring auto-selected; round wire (CWS-90) is not used unless we add a rule.`]
         : ["Complete machine setup to auto-select spring part."],
   };
}

function buildArmNotes(selection, drill, context) {
   const labor = LABOR_BY_SLUG["closing-wheel-arm"];
   const partsAmount = selection?.price ?? 0;
   const partsPrice = selection ? formatClosingPartPrice(partsAmount) : "catalog part";
   const perArmTotal = selection ? formatPerUnitTotal(partsAmount, labor) : null;
   const tallyCount = Number(context.tallyCount) || 0;
   const example = buildQuantityExample({
      quantity: tallyCount > 0 ? tallyCount : null,
      quantityLabel: "arms",
      partsAmount: selection ? partsAmount : 0,
      labor,
   });

   const howLine = perArmTotal
      ? {
           text: `Each tallied arm → ${perArmTotal} total (${partsPrice} parts + $${labor} labor, from machine setup).`,
           subItems: example?.subItems?.length
              ? example.subItems
              : selection
                ? ["Enter arm count above to see total for this machine."]
                : undefined,
        }
      : `Each tallied arm → ${partsPrice} parts + $${labor} labor (per arm, from machine setup).`;

   return {
      howAppCalculates: [howLine, "GOOD → $0."],
      openQuestions: ["Is $20 labor per arm still right?"],
      assumptions: drill?.manufacturer
         ? [`50 vs 90 series arm chosen from drill model: ${selection?.reason ?? "pending"}.`]
         : ["Complete machine setup to auto-select arm part."],
   };
}

function buildWheelNotes(selection, drill, context) {
   const labor = LABOR_BY_SLUG["closing-wheel"];
   const partsAmount = selection?.price ?? 0;
   const partsPrice = selection ? formatClosingPartPrice(partsAmount) : "catalog part";
   const perUnitTotal = selection ? formatPerUnitTotal(partsAmount, labor) : null;
   const rowUnits = resolveRowUnitCount(drill, context.rowUnitCount);
   const example = buildQuantityExample({
      quantity: rowUnits,
      quantityLabel: "row-units",
      partsAmount: selection ? partsAmount : 0,
      labor,
   });

   const setupNote = context.secondaryValue
      ? `Wheel part from Current setup answer (${selection?.reason ?? "see Selected part"}).`
      : "Wheel defaults to cast notched (AG2150) until Current setup is answered.";

   return {
      howAppCalculates: [
         buildPerUnitCostLine({
            ratingLabel: "MAYBE/BAD",
            partsAmount,
            labor,
            partsPriceFormatted: partsPrice,
            perUnitTotalFormatted: perUnitTotal,
            example,
         }),
         setupNote,
         "GOOD → $0.",
      ],
      openQuestions: ["Quote wheels on MAYBE, or only on BAD?"],
      assumptions: [],
   };
}

function buildBearingNotes(selection, drill, context) {
   const labor = LABOR_BY_SLUG["closing-wheel-bearing"];
   const partsAmount = selection?.price ?? 0;
   const partsPrice = selection ? formatClosingPartPrice(partsAmount) : "catalog part";
   const perUnitTotal = selection ? formatPerUnitTotal(partsAmount, labor) : null;
   const rowUnits = resolveRowUnitCount(drill, context.rowUnitCount);
   const example = buildQuantityExample({
      quantity: rowUnits,
      quantityLabel: "row-units",
      partsAmount: selection ? partsAmount : 0,
      labor,
   });

   return {
      howAppCalculates: [
         buildPerUnitCostLine({
            ratingLabel: "BAD",
            partsAmount,
            labor,
            partsPriceFormatted: partsPrice,
            perUnitTotalFormatted: perUnitTotal,
            example,
         }),
         "GOOD or MAYBE → $0.",
      ],
      openQuestions: ["Labor per bearing or per row-unit?"],
      assumptions: ["Same bearing SKU (AG2028X) for all drills."],
   };
}

/**
 * @param {string} slug
 * @param {object} [machineSetup]
 * @param {{ secondaryValue?: string, rowUnitCount?: number, workingRanks?: number, selectedAnswer?: unknown }} [options]
 */
export function getClosingPricingDevNotes(slug, machineSetup = null, options = {}) {
   const drill = machineSetup ? getDrillSetup(machineSetup) : null;
   const selection = getClosingPartSelection(slug, machineSetup, options);
   const skus = PARTS_BY_SLUG[slug];
   const context = {
      rowUnitCount: options.rowUnitCount,
      workingRanks: options.workingRanks,
      secondaryValue: options.secondaryValue,
      tallyCount:
         slug === "closing-wheel-arm" && options.selectedAnswer != null
            ? getReplacementTallyCount(options.selectedAnswer)
            : null,
   };

   if (!skus) return null;

   let sectionNotes;
   switch (slug) {
      case "closing-wheel-pivot":
         sectionNotes = buildPivotNotes(selection, drill, context);
         break;
      case "closing-wheel-spring":
         sectionNotes = buildSpringNotes(selection, drill, context);
         break;
      case "closing-wheel-arm":
         sectionNotes = buildArmNotes(selection, drill, context);
         break;
      case "closing-wheel":
         sectionNotes = buildWheelNotes(selection, drill, context);
         break;
      case "closing-wheel-bearing":
         sectionNotes = buildBearingNotes(selection, drill, context);
         break;
      default:
         return null;
   }

   return {
      ...sectionNotes,
      selectedPart: selection
         ? {
              sku: selection.sku,
              price: formatClosingPartPrice(selection.price),
              reason: selection.reason,
           }
         : null,
      possibleSkus: formatPartsList(skus, selection?.sku),
   };
}
