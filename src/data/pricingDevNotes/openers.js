/**
 * Dev notes for openers section (cutting discs + disc hubs wired).
 */

import {
   CUTTING_DISC_CATALOG,
   CUTTING_DISC_LABOR,
   formatCuttingDiscPrice,
   getCuttingDiscPartSelection,
} from "../cuttingDiscPartRules";
import {
   DISC_HUB_CATALOG,
   DISC_HUB_LABOR,
   formatDiscHubPrice,
   formatDiscHubPriceRange,
   getDiscHubPartSelection,
   SDX_HUB_PARTS_RANGE,
} from "../discHubPartRules";
import { getDrillSetup } from "../machineCatalog";
import {
   buildQuantityExample,
   resolveRowUnitCount,
} from "./shared";

const CUTTING_DISC_SKUS = [
   "RE6000",
   "RE6001RZR",
   "RE6002RZR",
   "RE6003RZR",
   "RE6004",
   "RE4926",
   "RE4930",
   "RE4931RZR",
   "RE6080",
];

const CUTTING_DISC_PART_NOTES = {
   RE6000: "18\" Ingersoll Hi-Hard — default JD 60/90",
   RE6001RZR: "18-5/8\" JD Ingersoll Hi-Hard",
   RE6002RZR: "PD500-class",
   RE6003RZR: "Amity / Concord",
   RE6004: "Bourgault 20-1/2\"",
   RE4926: "19\" notched 30-pointer — not auto-selected",
   RE4930: "18\" Niaux 200 — alt for JD 50/60/90 & ProSeries",
   RE4931RZR: "18-5/8\" Niaux — ProSeries seed row",
   RE6080: "Horsch Avatar — not in machine catalog yet",
};

function formatCuttingDiscPartsList(selectedSku) {
   return CUTTING_DISC_SKUS.map((sku) => {
      const catalog = CUTTING_DISC_CATALOG[sku];
      return {
         sku,
         price: formatCuttingDiscPrice(catalog.price),
         note: CUTTING_DISC_PART_NOTES[sku] ?? catalog.title,
         selected: sku === selectedSku,
      };
   });
}

export function getCuttingDiscPricingDevNotes(machineSetup, context) {
   const drill = machineSetup ? getDrillSetup(machineSetup) : null;
   const selection = getCuttingDiscPartSelection(machineSetup);
   const labor = CUTTING_DISC_LABOR;
   const partsAmount = selection?.price ?? 0;
   const partsPrice = selection ? formatCuttingDiscPrice(partsAmount) : "catalog part";
   const perUnitTotal = selection ? formatCuttingDiscPrice(partsAmount + labor) : null;
   const rowUnits = resolveRowUnitCount(drill, context.rowUnitCount);
   const example = buildQuantityExample({
      quantity: rowUnits,
      quantityLabel: "discs",
      perUnitTotal: selection ? partsAmount + labor : null,
   });

   const subItems = [
      "Diameter rating controls how many discs get quoted, not which disc brand.",
      ...(example?.subItems ?? []),
   ];

   return {
      howAppCalculates: [
         {
            text: perUnitTotal
               ? `MAYBE/BAD on any rank → ${perUnitTotal} total per affected row-unit (${partsPrice} parts + $${labor} labor, from machine setup).`
               : `MAYBE/BAD → ${partsPrice} parts + $${labor} labor per row-unit (complete machine setup for disc SKU).`,
            subItems,
         },
         "GOOD (>17.25\") → $0.",
      ],
      possibleSkus: formatCuttingDiscPartsList(selection?.sku),
      assumptions: drill?.manufacturer
         ? [`Selected for ${drill.manufacturer}${drill.model ? ` ${drill.model}` : ""}: ${selection?.reason ?? "pending"}.`]
         : ["Complete machine setup to auto-select disc part."],
      openQuestions: [
         "Default for JD 60/90: RE6000 (Ingersoll Hi-Hard) or RE4930 (Niaux 200)? Both are $49.",
         "When should we quote notched RE4926 ($59) vs smooth hi-hard?",
         "Labor — Still $30/row-unit on top of parts?",
      ],
      selectedPart: selection
         ? {
              sku: selection.sku,
              price: formatCuttingDiscPrice(selection.price),
              reason: selection.reason,
           }
         : null,
   };
}

const DISC_HUB_SKUS = ["AG-K15", "AG-K15-FULL", "SDX-K08-SM", "SDX-K08-MD", "SDX-K08-LG"];

const DISC_HUB_PART_NOTES = {
   "AG-K15": "Seal + wear ring only — JD 1890/1895",
   "AG-K15-FULL": "Full rebuild — JD default when BAD",
   "SDX-K08-SM": "Small — spindle shoulder 1.25–1.31\" (no shoulder)",
   "SDX-K08-MD": "Medium — spindle shoulder 1.50\"",
   "SDX-K08-LG": "Large — spindle shoulder 1.75\"",
};

function formatDiscHubPartsList(selection) {
   const rangeSkus = selection?.isRange ? new Set(selection.skusInRange ?? []) : null;

   return DISC_HUB_SKUS.map((sku) => {
      const catalog = DISC_HUB_CATALOG[sku];
      const inRange = rangeSkus?.has(sku) ?? false;
      return {
         sku,
         price: formatDiscHubPrice(catalog.price),
         note: DISC_HUB_PART_NOTES[sku] ?? catalog.title,
         selected: inRange || sku === selection?.sku,
      };
   });
}

function buildDiscHubQuantityExample(rowUnits, partsLow, partsHigh, labor) {
   if (!rowUnits || rowUnits <= 0) return null;

   const perUnitLow = partsLow + labor;
   const perUnitHigh = partsHigh + labor;
   const unitLabel = rowUnits === 1 ? "disc" : "discs";

   if (partsLow === partsHigh) {
      return `Example for this machine: ${rowUnits} ${unitLabel} × ${formatDiscHubPrice(perUnitLow)} = ${formatDiscHubPrice(perUnitLow * rowUnits)}.`;
   }

   return `Example for this machine: ${rowUnits} ${unitLabel} × ${formatDiscHubPriceRange(perUnitLow, perUnitHigh)} = ${formatDiscHubPriceRange(perUnitLow * rowUnits, perUnitHigh * rowUnits)}.`;
}

export function getDiscHubPricingDevNotes(machineSetup, context) {
   const drill = machineSetup ? getDrillSetup(machineSetup) : null;
   const selection = getDiscHubPartSelection(machineSetup);
   const labor = DISC_HUB_LABOR;
   const partsLow = selection?.isRange ? selection.priceLow : (selection?.price ?? 0);
   const partsHigh = selection?.isRange ? selection.priceHigh : (selection?.price ?? 0);
   const partsPrice =
      selection && partsLow > 0
         ? formatDiscHubPriceRange(partsLow, partsHigh)
         : "catalog part";
   const perUnitTotal =
      selection && partsLow > 0
         ? formatDiscHubPriceRange(partsLow + labor, partsHigh + labor)
         : null;
   const rowUnits = resolveRowUnitCount(drill, context.rowUnitCount);
   const quantityExample = buildDiscHubQuantityExample(rowUnits, partsLow, partsHigh, labor);

   const subItems = [
      "BAD rating controls how many row-units get quoted — not which kit variant.",
      ...(quantityExample ? [quantityExample] : []),
   ];

   return {
      howAppCalculates: [
         {
            text: perUnitTotal
               ? `BAD on a rank → ${perUnitTotal} total per affected row-unit (${partsPrice} parts + $${labor} labor, from machine setup).`
               : `BAD → ${partsPrice} parts + $${labor} labor per row-unit (complete machine setup for hub kit).`,
            subItems,
         },
         "GOOD (spin freely) → $0.",
      ],
      possibleSkus: formatDiscHubPartsList(selection),
      assumptions: [
         ...(drill?.manufacturer
            ? [`Selected for ${drill.manufacturer}${drill.model ? ` ${drill.model}` : ""}: ${selection?.reason ?? "no catalog kit mapped yet"}.`]
            : ["Complete machine setup to auto-select hub kit."]),
         ...(selection?.isRange
            ? [
                 `Case SDX hub size is serial/spindle-dependent (SM 1.25–1.31\", MD 1.50\", LG 1.75\") — not tied to drill model; app uses ${formatDiscHubPriceRange(SDX_HUB_PARTS_RANGE.low, SDX_HUB_PARTS_RANGE.high)} parts range.`,
              ]
            : []),
         "AG2532 install tool ($150) excluded from online parts estimate.",
      ],
      openQuestions: [
         "BAD hubs: always AG-K15-FULL ($79.50), or sometimes seal-only AG-K15 ($20)?",
         `Case SDX: is a price range OK (variations are SM, MD, LG)? Range is from ${formatDiscHubPriceRange(SDX_HUB_PARTS_RANGE.low, SDX_HUB_PARTS_RANGE.high)}.`,
         "Do 1860/1990 use the same AG-K15 kits as 1890/1895?",
         "Labor — Still $120/row-unit on top of parts?",
         "Hub kits for Bourgault, New Holland, Horsch — which QBO SKUs?",
      ],
      selectedPart: selection
         ? {
              sku: selection.sku,
              price: selection.isRange
                 ? formatDiscHubPriceRange(selection.priceLow, selection.priceHigh)
                 : formatDiscHubPrice(selection.price),
              reason: selection.reason,
           }
         : null,
   };
}
