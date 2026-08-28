/**
 * Dev notes for drill hose + cart hose steps (catalog documented; flat band estimate until roll math wired).
 */

import { getCartRunCountLabel, getCartSetup, getCartTankSizeLabel, getDrillSetup } from "../machineCatalog";
import { formatCostBand } from "./shared";
import { getChoiceCostParts, getPerUnitTotalHigh, getPerUnitTotalLow, getReferenceChoice } from "./stepCosts";

/** @type {Record<string, { price: number, title: string, note?: string }>} */
export const HOSE_ROLL_CATALOG = {
   AG2091EXT: { price: 280.0, title: "1″ ext-wear urethane blend", note: "100' roll (assumed — confirm)" },
   AG2092EXT: { price: 360.0, title: '1-1/4" ext-wear urethane blend', note: "100' roll (assumed)" },
   AG2554: { price: 305.0, title: '1-1/2" standard wear', note: "100' roll (assumed)" },
   AG2554EXT: { price: 395.0, title: '1-1/2" ext-wear urethane blend', note: "100' roll (assumed)" },
   AG2555EXT: { price: 508.0, title: '1-3/4" ext-wear urethane blend', note: "100' roll (assumed)" },
   AG2556EXT: { price: 440.0, title: '2" ext-wear urethane blend', note: "100' roll (assumed)" },
   AG2093: { price: 595.0, title: '2-1/2" standard wear', note: "100' roll (assumed)" },
   AG2093EXT: { price: 965.0, title: '2-1/2" ext-wear urethane lined', note: "100' roll (assumed)" },
   AG2093TFLEX: { price: 1142.0, title: '2-1/2" Tigerflex HD urethane lined', note: "100' roll (assumed)" },
};

export const HOSE_CLAMP_CATALOG = {
   "356060-000025": { price: 2.08, title: 'SS clamp 1″–2″' },
   SSH033: { price: 2.25, title: 'SS clamp 13/16"–1-1/2"' },
   SSTY22472: { price: 2.0, title: 'SS clamp 2-1/4″–3-1/4″' },
   SSAG8010: { price: 3.4, title: "Sabre clamp 3/4″" },
   SSAG8015: { price: 4.95, title: "Sabre clamp 1-1/2″" },
   SSH058: { price: 7.5, title: "SS T-bolt clamp" },
};

const HOSE_ROLL_SKUS = Object.keys(HOSE_ROLL_CATALOG);
const HOSE_CLAMP_SKUS = Object.keys(HOSE_CLAMP_CATALOG);

function formatCatalogList(catalog, skus) {
   return skus.map((sku) => ({
      sku,
      price: `$${Number(catalog[sku].price).toFixed(2)}`,
      note: catalog[sku].note ?? catalog[sku].title,
      selected: false,
   }));
}

function buildFlatHoseDevNotes(step, machineSetup, options = {}) {
   const {
      stepLabel = "drill",
      openQuestions: openQuestionsOverride,
      extraSubItems = [],
      extraAssumptions = [],
   } = options;
   const drill = machineSetup ? getDrillSetup(machineSetup) : null;
   const ref = getReferenceChoice(step);
   const parts = getChoiceCostParts(ref);
   const totalLow = getPerUnitTotalLow(parts);
   const totalHigh = getPerUnitTotalHigh(parts);
   const partsBand = formatCostBand(parts.low, parts.high);
   const totalBand =
      totalLow === totalHigh ? `$${totalLow.toFixed(2)}` : `$${totalLow.toFixed(2)}–$${totalHigh.toFixed(2)}`;
   const ratingLabel = step?.choices?.some((c) => c.rating === "maybe") ? "MAYBE/BAD" : "MAYBE/BAD";

   const exampleRolls = [
      { rolls: 2, sku: "AG2554EXT", note: "illustrative only" },
      { rolls: 4, sku: "AG2093EXT", note: "illustrative only" },
   ].map(({ rolls, sku, note }) => {
      const rollPrice = HOSE_ROLL_CATALOG[sku]?.price ?? 0;
      return `${rolls} × ${sku} @ $${rollPrice.toFixed(2)}/roll = $${(rolls * rollPrice).toFixed(2)} (${note})`;
   });

   return {
      howAppCalculates: [
         {
            text: `${ratingLabel} → ${totalBand} flat ${stepLabel} estimate (${partsBand} parts + $${parts.labor} labor from inspection-steps.json).`,
            subItems: [
               "Not multiplied by row-unit count — one estimate per drill/cart when hoses need work.",
               "Catalog hose SKUs are ~100' rolls; roll count for full rehose is not wired yet.",
               ...extraSubItems,
               ...exampleRolls.map((line) => `Example math (not used by app): ${line}.`),
            ],
         },
         "GOOD → $0.",
      ],
      possibleSkus: [...formatCatalogList(HOSE_ROLL_CATALOG, HOSE_ROLL_SKUS), ...formatCatalogList(HOSE_CLAMP_CATALOG, HOSE_CLAMP_SKUS)],
      assumptions: [
         ...(drill?.manufacturer
            ? [`Machine: ${drill.manufacturer}${drill.model ? ` ${drill.model}` : ""}${drill.width ? `, ${drill.width}` : ""} — hose diameter mix not auto-selected yet.`]
            : stepLabel === "cart"
              ? ["Complete cart setup (tank size, runs) may eventually pick hose roll count."]
              : ["Complete machine setup may eventually pick hose diameter SKUs."]),
         ...extraAssumptions,
         "Clamps listed for reference — not added to estimate yet.",
         ...(stepLabel === "drill"
            ? ["Spreadsheet BA262 Rehose Drill is a manual checkbox today."]
            : []),
      ],
      openQuestions:
         openQuestionsOverride ?? [
            "Confirm 100' roll length for AG209x / AG255x?",
            "Full drill rehose — typical roll count by drill width / ranks?",
            "Partial rank wear (MAYBE) vs full rehose (BAD) — different parts logic?",
            "Which hose diameter per machine model?",
            "Include clamps? Count per connection or per roll?",
            "Labor — is flat step labor right vs actual rehose hours?",
         ],
      selectedPart: null,
   };
}

export function getDrillHosesPricingDevNotes(step, machineSetup) {
   return buildFlatHoseDevNotes(step, machineSetup, { stepLabel: "drill" });
}

export function getAirCartHosesPricingDevNotes(step, machineSetup) {
   const cart = machineSetup ? getCartSetup(machineSetup) : null;
   const tankSizeLabel = getCartTankSizeLabel(cart);
   const runLabel = getCartRunCountLabel(cart);
   const cartSetupParts = [tankSizeLabel, runLabel].filter(Boolean);

   return buildFlatHoseDevNotes(step, machineSetup, {
      stepLabel: "cart",
      extraSubItems: [
         ...(cartSetupParts.length
            ? [`Cart setup: ${cartSetupParts.join(", ")} — may drive roll count when wired.`]
            : ["Complete cart setup (tank size, runs) to model full cart rehose roll count."]),
      ],
      extraAssumptions: ["Flat whole-cart estimate today — not × tank count."],
      openQuestions: [
         "Full cart rehose — typical roll count by cart size or other factors?",
         "Which hose diameter(s) on this cart — 2\", 2-1/2\", or a mix?",
         "Partial wear (MAYBE) vs full cart rehose (BAD) — different roll count?",
         "Include clamps? Count per connection or per roll?",
         "Labor — is flat step labor right vs actual cart rehose hours?",
      ],
   });
}
