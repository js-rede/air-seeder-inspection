/**
 * Dev notes for seed boots section (pivot, boot, spring wired).
 */

import {
   formatSeedBootPivotPrice,
   getSeedBootPivotPartSelection,
   SEED_BOOT_PIVOT_LABOR,
} from "../seedBootPivotPartRules";
import {
   formatSeedBootPrice,
   getSeedBootPartSelection,
   SEED_BOOT_CATALOG,
   SEED_BOOT_DEFAULT_SKU,
   SEED_BOOT_LABOR,
} from "../seedBootPartRules";
import {
   formatSeedBootSpringPrice,
   getSeedBootSpringPartSelection,
   SEED_BOOT_SPRING_CATALOG,
   SEED_BOOT_SPRING_DEFAULT_SKU,
   SEED_BOOT_SPRING_LABOR,
} from "../seedBootSpringPartRules";
import {
   formatSeedTabPrice,
   getSeedTabPartSelection,
   SEED_TAB_CATALOG,
   SEED_TAB_DEFAULT_SKU,
   SEED_TAB_LABOR,
} from "../seedTabPartRules";
import { getDrillSetup } from "../machineCatalog";
import { buildQuantityExample, resolveRowUnitCount } from "./shared";

function formatPartsList(catalog, skus, selectedSku, notes = {}) {
   return skus.map((sku) => {
      const entry = catalog[sku];
      return {
         sku,
         price: `$${Number(entry.price).toFixed(2)}`,
         note: notes[sku] ?? entry.title,
         selected: sku === selectedSku,
      };
   });
}

function buildDevNotes({ machineSetup, context, selection, labor, formatPrice, extras = {} }) {
   const drill = machineSetup ? getDrillSetup(machineSetup) : null;
   const secondaryValue = context.secondaryValue ?? "";
   const partsAmount = selection?.price ?? 0;
   const partsPrice = selection ? formatPrice(partsAmount) : "catalog part or step JSON band";
   const perUnitTotal = selection ? formatPrice(partsAmount + labor) : null;
   const rowUnits = resolveRowUnitCount(drill, context.rowUnitCount);
   const example = buildQuantityExample({
      quantity: rowUnits,
      quantityLabel: "row-units",
      perUnitTotal: selection ? partsAmount + labor : null,
   });

   return {
      howAppCalculates: [
         {
            text: perUnitTotal
               ? `MAYBE/BAD on a rank → ${perUnitTotal} total per affected row-unit (${partsPrice} parts + $${labor} labor).`
               : `MAYBE/BAD → ${partsPrice} + $${labor} labor per row-unit.`,
            subItems: [...(extras.subItems ?? []), ...(example?.subItems ?? [])],
         },
         "GOOD → $0.",
      ],
      possibleSkus: extras.possibleSkus ?? [],
      assumptions: [
         ...(drill?.manufacturer
            ? [`Selected for ${drill.manufacturer}${drill.model ? ` ${drill.model}` : ""}: ${selection?.reason ?? "pending"}.`]
            : ["Complete machine setup where machine-dependent."]),
         ...(extras.assumptions ?? []),
      ],
      openQuestions: extras.openQuestions ?? [],
      selectedPart: selection
         ? { sku: selection.sku, price: formatPrice(selection.price), reason: selection.reason }
         : null,
      secondaryValue: secondaryValue || null,
   };
}

export function getSeedBootPivotPricingDevNotes(machineSetup, context) {
   const selection = getSeedBootPivotPartSelection();

   return buildDevNotes({
      machineSetup,
      context,
      selection,
      labor: SEED_BOOT_PIVOT_LABOR,
      formatPrice: formatSeedBootPivotPrice,
      extras: {
         subItems: [
            "No catalog pivot SKU — uses step JSON parts band ($15–50) + $40 labor.",
            "NA90HDW pivot kit hidden/OOS; AG-K07-ST stabilizers are not on this step.",
         ],
         possibleSkus: [
            {
               sku: "NA90HDW",
               price: "$17.00",
               note: "Pivot kit — hidden/OOS, not used",
               selected: false,
            },
         ],
         assumptions: [
            "Current setup (OEM / drill bushings / Needham) is informational — does not change parts price yet.",
         ],
         openQuestions: ["OEM / drill bushings pivot — any SKU besides dead NA90HDW?"],
      },
   });
}

export function getSeedBootPricingDevNotes(machineSetup, context) {
   const selection = getSeedBootPartSelection(machineSetup, {
      secondaryValue: context.secondaryValue ?? "",
   });

   return buildDevNotes({
      machineSetup,
      context,
      selection,
      labor: SEED_BOOT_LABOR,
      formatPrice: formatSeedBootPrice,
      extras: {
         subItems: [
            "Current setup picks boot SKU; defaults to AG2657L (Red E ext) until answered.",
            "One boot per row-unit (L/R not doubled in estimate).",
         ],
         possibleSkus: formatPartsList(
            SEED_BOOT_CATALOG,
            ["AG2657L", "AG1059L"],
            selection?.sku,
            {
               AG2657L: "Red E ext wear — default",
               AG1059L: "OEM ext wear",
            },
         ),
         openQuestions: ["Left vs right — quote one side or both?"],
      },
   });
}

export function getSeedBootSpringPricingDevNotes(machineSetup, context) {
   const selection = getSeedBootSpringPartSelection();

   return buildDevNotes({
      machineSetup,
      context,
      selection,
      labor: SEED_BOOT_SPRING_LABOR,
      formatPrice: formatSeedBootSpringPrice,
      extras: {
         subItems: [`Default ${SEED_BOOT_SPRING_DEFAULT_SKU} spring per row-unit.`],
         possibleSkus: formatPartsList(SEED_BOOT_SPRING_CATALOG, ["AG2631"], selection?.sku),
         openQuestions: [],
      },
   });
}

const SEED_TAB_SKUS = [
   "AG-K05-STD",
   "AG1057",
   "AG-K05",
   "AG-K05-PRO",
   "AG1057N",
   "AG-K05-FIN-LH",
   "AG1057PL",
   "RE3004",
];

const SEED_TAB_PART_NOTES = {
   "AG-K05-STD": "Red E w/ hardware — JD default",
   AG1057: "Red E tab only",
   "AG-K05": "Red E w/ nut",
   "AG-K05-PRO": "Narrow ProSeries w/ hardware",
   AG1057N: "Narrow tab only",
   "AG-K05-FIN-LH": "Bonilla w/ hardware — left",
   AG1057PL: "Bonilla tab only — left",
   RE3004: "Case SDX",
};

export function getSeedTabPricingDevNotes(machineSetup, context) {
   const selection = getSeedTabPartSelection(machineSetup);

   return buildDevNotes({
      machineSetup,
      context,
      selection,
      labor: SEED_TAB_LABOR,
      formatPrice: formatSeedTabPrice,
      extras: {
         subItems: [
            `Defaults to ${SEED_TAB_DEFAULT_SKU} until machine setup; ProSeries → AG-K05-PRO; Case SDX → RE3004.`,
            "One tab per row-unit (L/R not doubled in estimate).",
         ],
         possibleSkus: formatPartsList(SEED_TAB_CATALOG, SEED_TAB_SKUS, selection?.sku, SEED_TAB_PART_NOTES),
         openQuestions: [
            "Bonilla (AG-K05-FIN*) vs Red E — need Current setup question?",
            "Tab only vs with hardware — AG1057 vs AG-K05-STD?",
            "Left vs right per row-unit?",
         ],
      },
   });
}
