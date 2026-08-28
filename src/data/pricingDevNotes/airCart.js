/**
 * Dev notes for air cart tank inspection steps (all tank component catalogs).
 */

import {
   AIR_CART_LOWER_CATALOG,
   AIR_CART_LOWER_SKUS,
   formatAirCartLowerPrice,
   getAirCartLowerPartSelection,
} from "../airCartLowerPartRules";
import {
   AIR_CART_LID_LADDER_CATALOG,
   AIR_CART_LID_LADDER_SKUS,
   estimatePerTankBushels,
   formatAirCartLidLadderPrice,
   getAirCartLadderAddonSkus,
   getAirCartLadderPartSelection,
   getAirCartLidPartSelection,
   getAirCartTankPosition,
} from "../airCartLidLadderPartRules";
import {
   AIR_CART_METER_HOUSING_CATALOG,
   AIR_CART_METER_HOUSING_SKUS,
   formatAirCartMeterHousingPrice,
   getAirCartMeterHousingPartSelection,
   getMeterHousingCandidateSkus,
} from "../airCartMeterHousingPartRules";
import {
   AIR_CART_UPPER_CATALOG,
   AIR_CART_UPPER_SKUS,
   formatAirCartUpperPrice,
   getAirCartUpperPartSelection,
} from "../airCartUpperPartRules";
import {
   getCartRunCountLabel,
   getCartSetup,
   getCartShootQuantityLabel,
   getCartTankSizeLabel,
} from "../machineCatalog";
import {
   getSectionConditionValue,
   getSectionSecondaryAnswer,
   getSectionSelections,
} from "../../utils/choices";
import { formatCostBand } from "./shared";
import { getChoiceCostParts, getPerUnitTotalHigh, getPerUnitTotalLow, getReferenceChoice } from "./stepCosts";

const LOWER_SECTION_VALUE = "current-lower";
const METER_SECTION_VALUE = "current-meter-housing";
const UPPER_SECTION_VALUE = "current-upper-kit";
const LID_SECTION_VALUE = "tank-lid-and-hardware";
const LADDER_SECTION_VALUE = "ladder";

const LID_LADDER_TYPE_NOTES = {
   lid: "Lid — frame assembly",
   lid_component: "Lid — screen/component",
   ladder: "Ladder",
   ladder_lid: "Ladder/lid — top mount kit",
   ladder_addon: "Ladder — add-on (not auto-included)",
};

const LOWER_PART_NOTES = {
   "SSK-SS4": "Lower — single-shoot, 4 runs",
   "SSK-SS6": "Lower — single-shoot, 6 runs",
   "SSK-SS8": "Lower — single-shoot, 8 runs",
   "SSK-DS4": "Lower — double-shoot, 4 runs",
   "SSK-DS5": "Lower — double-shoot, 5 runs",
   "SSK-DS6": "Lower — double-shoot, 6 runs",
   "SSK-DS8": "Lower — double-shoot, 8 runs",
   RE3680: "Lower — Red E single-shoot alternate",
   "RE3680-TBH": "Lower — Red E tow-behind (BH)",
   "RE3680-TBT": "Lower — Red E tow-behind (BT)",
   JAS1037A: "Lower — hopper/cradle component",
   JAS1032W: "Lower — intermediate manifold component",
};

const METER_BRAND_NOTES = {
   "morris/oem": "Morris/OEM",
   "generic/oem": "OEM/generic SS",
   "bourgault/oem": "Bourgault/OEM",
   "airseeder-parts": "Airseeder Parts",
   romafa: "Romafa",
   "romafa-ir": "Romafa IR / Section Command",
   kanpar: "Kanpar",
   component: "Seal/component only",
};

function getSectionCurrentSetup(selectedAnswer, sectionValue) {
   const sections = getSectionSelections(selectedAnswer);
   return getSectionSecondaryAnswer(sections[sectionValue]) || null;
}

function getTrailingSectionCondition(selectedAnswer, sectionValue) {
   const sections = getSectionSelections(selectedAnswer);
   return getSectionConditionValue(sections[sectionValue]);
}

function formatLowerPartsList(selectedSku) {
   return AIR_CART_LOWER_SKUS.map((sku) => {
      const entry = AIR_CART_LOWER_CATALOG[sku];
      return {
         sku,
         price: formatAirCartLowerPrice(entry.price),
         note: LOWER_PART_NOTES[sku] ?? entry.title,
         group: "Lower",
         selected: sku === selectedSku,
      };
   });
}

function formatMeterPartsList(meterSetup, candidateSkus) {
   const candidateSet = new Set(candidateSkus);

   return AIR_CART_METER_HOUSING_SKUS.map((sku) => {
      const entry = AIR_CART_METER_HOUSING_CATALOG[sku];
      const brandNote = METER_BRAND_NOTES[entry.brand] ?? entry.brand;
      const suffix = entry.note ? ` — ${entry.note}` : "";
      return {
         sku,
         price: formatAirCartMeterHousingPrice(entry.price, entry.priceHigh),
         note: `Meter — ${brandNote}${suffix}`,
         group: "Meter housing",
         selected: candidateSet.has(sku),
      };
   });
}

function formatUpperPartsList(selectedSku) {
   return AIR_CART_UPPER_SKUS.map((sku) => {
      const entry = AIR_CART_UPPER_CATALOG[sku];
      return {
         sku,
         price: formatAirCartUpperPrice(entry.price),
         note: `Upper — ${entry.when ?? entry.title}`,
         group: "Upper kit",
         selected: sku === selectedSku,
      };
   });
}

function formatLidLadderPartsList(lidSku, ladderSku, ladderAddonSkus = []) {
   const addonSet = new Set(ladderAddonSkus);
   const selectedSkus = new Set([lidSku, ladderSku, ...ladderAddonSkus].filter(Boolean));

   return AIR_CART_LID_LADDER_SKUS.map((sku) => {
      const entry = AIR_CART_LID_LADDER_CATALOG[sku];
      const typeNote = LID_LADDER_TYPE_NOTES[entry.type] ?? entry.type;
      const suffix = entry.note ? ` — ${entry.note}` : "";
      return {
         sku,
         price: formatAirCartLidLadderPrice(entry.price),
         note: `${typeNote}${suffix}`,
         group: "Lid & ladder",
         selected: selectedSkus.has(sku) || addonSet.has(sku),
      };
   });
}

function buildSelectedPartDisplay(selection) {
   if (!selection?.sku) return null;
   return {
      sku: selection.sku,
      price: formatAirCartLidLadderPrice(selection.price),
      reason: selection.reason,
   };
}

export function getAirCartTankPricingDevNotes(machineSetup, context, step) {
   const cart = machineSetup ? getCartSetup(machineSetup) : null;
   const lowerSelection = getAirCartLowerPartSelection(machineSetup);
   const lowerSetup = getSectionCurrentSetup(context.selectedAnswer, LOWER_SECTION_VALUE);
   const meterSetup = getSectionCurrentSetup(context.selectedAnswer, METER_SECTION_VALUE);
   const upperSetup = getSectionCurrentSetup(context.selectedAnswer, UPPER_SECTION_VALUE);
   const meterCandidates = getMeterHousingCandidateSkus(meterSetup);
   const meterSelection = getAirCartMeterHousingPartSelection(machineSetup, meterSetup);
   const upperSelection = getAirCartUpperPartSelection(machineSetup, step, upperSetup);
   const lidSelection = getAirCartLidPartSelection(machineSetup);
   const ladderSelection = getAirCartLadderPartSelection(machineSetup, step);
   const ladderAddons = getAirCartLadderAddonSkus(cart);
   const lidCondition = getTrailingSectionCondition(context.selectedAnswer, LID_SECTION_VALUE);
   const ladderCondition = getTrailingSectionCondition(context.selectedAnswer, LADDER_SECTION_VALUE);
   const perTankBu = estimatePerTankBushels(cart);
   const tankPosition = getAirCartTankPosition(step);

   const ref = getReferenceChoice(step);
   const parts = getChoiceCostParts(ref);
   const totalLow = getPerUnitTotalLow(parts);
   const totalHigh = getPerUnitTotalHigh(parts);
   const partsBand = formatCostBand(parts.low, parts.high);
   const totalBand =
      totalLow === totalHigh
         ? formatAirCartLowerPrice(totalLow)
         : `${formatAirCartLowerPrice(totalLow)}–${formatAirCartLowerPrice(totalHigh)}`;

   const shootLabel = getCartShootQuantityLabel(cart);
   const runLabel = getCartRunCountLabel(cart);
   const tankSizeLabel = getCartTankSizeLabel(cart);

   const subItems = [
      "Each tank section (Lower / Meter / Upper) rated separately; costs add across sections on this tank step.",
      ...(shootLabel && runLabel
         ? [`Cart setup: ${shootLabel}, ${runLabel}${tankSizeLabel ? `, ${tankSizeLabel}` : ""}.`]
         : ["Complete cart setup (shoots + runs) to auto-pick lower kit SKU."]),
      ...(lowerSelection
         ? [`Lower: ${lowerSelection.sku} @ ${formatAirCartLowerPrice(lowerSelection.price)} (from shoot + runs).`]
         : cart?.shootQuantity === "triple"
           ? ["Lower: triple-shoot — no SKU mapped yet."]
           : cart?.runCount && !["4", "6", "8"].includes(String(cart.runCount))
             ? [`Lower: ${runLabel || cart.runCount + " runs"} — no exact SSK SKU (catalog has 4/6/8).`]
             : []),
      ...(lowerSetup && !lowerSelection ? [`Lower Current setup: ${lowerSetup} (not wired to SKU).`] : []),
      ...(meterSetup
         ? [
              meterCandidates.length
                 ? `Meter: ${meterSetup} → ${meterCandidates.length} candidate SKUs highlighted below — no default wired yet.`
                 : `Meter Current setup: ${meterSetup} — pick usual SKU (Other has no mapping).`,
           ]
         : ["Meter: answer Current meter housing on this tank to see candidate SKUs."]),
      ...(upperSelection
         ? [`Upper: ${upperSelection.sku} @ ${formatAirCartUpperPrice(upperSelection.price)} (${upperSelection.reason}).`]
         : upperSetup === "stainless-steel"
           ? ["Upper: Stainless Steel selected — need JD cart or 550-middle config to pick SSK-UPR vs SSK-UPR-NEW."]
           : upperSetup
             ? [`Upper Current setup: ${upperSetup} — no SS kit SKU mapped (OEM/Other).`]
             : []),
      ...(lidSelection
         ? [
              `Lid: ${lidSelection.sku} @ ${formatAirCartLidLadderPrice(lidSelection.price)} (${lidSelection.reason})${lidCondition === "needs-replacing" ? " — rated needs replacing on this tank." : ""}.`,
           ]
         : ["Lid: JD cart model needed for JAS4765A / JAS4799A frame."]),
      ...(ladderSelection
         ? [
              `Ladder: ${ladderSelection.sku} @ ${formatAirCartLidLadderPrice(ladderSelection.price)} (${ladderSelection.reason})${ladderCondition === "needs-replacing" ? " — rated needs replacing on this tank." : ""}.`,
           ]
         : perTankBu
           ? [`Ladder: set cart tank size to estimate ~${perTankBu} bu/tank (${tankPosition} tank).`]
           : []),
      ...(ladderAddons.length
         ? [`Ladder add-on for 1900: ${ladderAddons.join(", ")} ($${AIR_CART_LID_LADDER_CATALOG[ladderAddons[0]].price.toFixed(2)} — not auto-added).`]
         : []),
      `Estimate today still uses step JSON bands per component — catalog not wired.`,
   ];

   return {
      howAppCalculates: [
         {
            text: `Per tank component → ${totalBand} from inspection-steps.json (${partsBand} parts + $${parts.labor} labor) — catalog parts not wired to estimate yet.`,
            subItems,
         },
         "GOOD on all sections → $0 for that component.",
      ],
      possibleSkus: [
         ...formatLowerPartsList(lowerSelection?.sku),
         ...formatMeterPartsList(meterSetup, meterCandidates),
         ...formatUpperPartsList(upperSelection?.sku),
         ...formatLidLadderPartsList(lidSelection?.sku, ladderSelection?.sku, ladderAddons),
      ],
      assumptions: [
         "Lower: SSK-SS* / SSK-DS* from cart shoot quantity + run count when mappable.",
         "Meter: too many SKUs — need leadership usual pick per Current setup choice.",
         "Upper: SSK-UPR-NEW tentative for 550 bu middle tank; SSK-UPR for other JD when Stainless Steel selected.",
         "Lid: JAS4765A (1900) / JAS4799A (1910+) from cart model; JAS4813A screen listed separately.",
         "Ladder: bu/tank estimated as total tank size ÷ tank count; position picks front vs rear 150 bu ladder.",
      ],
      openQuestions: [
         "Tank size in setup — total cart bu or per-tank bu?",
         "Lid replace — frame only or include JAS4813A screen?",
         "JAS0164K — ladder, lid, or top tank only on 3-tank carts?",
         "SSK-LDR-EXT — always add for 1900 ladder quotes?",
         "Upper: SSK-UPR-NEW full fit list? Meter housing usual SKU per brand?",
         "Non-JD carts — lid/ladder catalog SKUs?",
         "Per-tank: multiply catalog parts × components rated MAYBE/BAD?",
      ],
      selectedPart: lowerSelection
         ? {
              sku: lowerSelection.sku,
              price: formatAirCartLowerPrice(lowerSelection.price),
              reason: lowerSelection.reason,
           }
         : upperSelection
           ? {
                sku: upperSelection.sku,
                price: formatAirCartUpperPrice(upperSelection.price),
                reason: upperSelection.reason,
             }
           : lidCondition === "needs-replacing" && lidSelection
             ? buildSelectedPartDisplay(lidSelection)
             : ladderCondition === "needs-replacing" && ladderSelection
               ? buildSelectedPartDisplay(ladderSelection)
               : meterSelection?.reason
                 ? {
                      sku: "n/a",
                      price: null,
                      reason: meterSelection.reason,
                   }
                 : null,
   };
}
