import { getClosingPricingDevNotes } from "../closingPricingDevNotes";
import { getDepthAdjustmentPivotPricingDevNotes, getDepthArmPricingDevNotes, getDepthCoverHandlePricingDevNotes } from "./depthControl";
import { getCuttingDiscPricingDevNotes, getDiscHubPricingDevNotes } from "./openers";
import {
   getPressWheelArmPricingDevNotes,
   getPressWheelPivotPricingDevNotes,
   getPressWheelPricingDevNotes,
   getPressWheelSpringPricingDevNotes,
} from "./pressWheels";
import { getGaugeWheelPricingDevNotes } from "./gaugeWheels";
import { getBlockageSystemPricingDevNotes } from "./blockageSystem";
import { getSfpRowUnitPartsPricingDevNotes } from "./sfp";
import { getAirCartHosesPricingDevNotes, getDrillHosesPricingDevNotes } from "./hoses";
import { getAirCartAugerConveyorPricingDevNotes } from "./airCartAugerConveyor";
import { getAirCartCouplersPricingDevNotes } from "./airCartCouplers";
import { getAirCartTankPricingDevNotes } from "./airCart";
import { getTowersPricingDevNotes } from "./towers";
import {
   getSeedBootPivotPricingDevNotes,
   getSeedBootPricingDevNotes,
   getSeedBootSpringPricingDevNotes,
   getSeedTabPricingDevNotes,
} from "./seedBoots";
import { buildScaffoldPricingDevNotes } from "./scaffold";
import { isAirCartTankStep } from "../airCartLowerPartRules";
import { DEV_NOTES_EXCLUDED_SLUGS, finalizeOpenQuestions, normalizePossibleSkuRows } from "./shared";

export { DEV_NOTES_EXCLUDED_SLUGS } from "./shared";

function withFinalizedQuestions(notes, step) {
   if (!notes) return null;
   return {
      ...notes,
      possibleSkus: normalizePossibleSkuRows(notes.possibleSkus),
      openQuestions: finalizeOpenQuestions(notes.openQuestions ?? [], step),
   };
}

/**
 * @param {object} step — full step from inspection-steps.json
 * @param {object} [machineSetup]
 * @param {{ secondaryValue?: string, rowUnitCount?: number, workingRanks?: number, selectedAnswer?: unknown }} [options]
 */
export function getPricingDevNotes(step, machineSetup = null, options = {}) {
   if (!step?.slug || DEV_NOTES_EXCLUDED_SLUGS.has(step.slug)) {
      return null;
   }

   if (step.section === "wrap_up" || step.informational_only) {
      return null;
   }

   const context = {
      rowUnitCount: options.rowUnitCount,
      workingRanks: options.workingRanks,
      selectedAnswer: options.selectedAnswer,
      secondaryValue: options.secondaryValue,
      tertiaryValue: options.tertiaryValue,
      followUps: options.followUps,
      tallyCount: options.tallyCount,
   };

   let notes = null;

   if (step.section === "closing_system") {
      notes = getClosingPricingDevNotes(step.slug, machineSetup, {
         secondaryValue: options.secondaryValue,
         rowUnitCount: options.rowUnitCount,
         workingRanks: options.workingRanks,
         selectedAnswer: options.selectedAnswer,
      });
   } else if (step.slug === "cutting-discs") {
      notes = getCuttingDiscPricingDevNotes(machineSetup, context);
   } else if (step.slug === "disc-hubs") {
      notes = getDiscHubPricingDevNotes(machineSetup, context);
   } else if (step.slug === "depth-adjustment-pivot") {
      notes = getDepthAdjustmentPivotPricingDevNotes(machineSetup, context);
   } else if (step.slug === "depth-arm") {
      notes = getDepthArmPricingDevNotes(machineSetup, context);
   } else if (step.slug === "depth-cover-handle") {
      notes = getDepthCoverHandlePricingDevNotes(machineSetup, context);
   } else if (step.slug === "press-wheel-pivot") {
      notes = getPressWheelPivotPricingDevNotes(machineSetup, context);
   } else if (step.slug === "press-wheel-arm") {
      notes = getPressWheelArmPricingDevNotes(machineSetup, context);
   } else if (step.slug === "press-wheel-spring") {
      notes = getPressWheelSpringPricingDevNotes(machineSetup, context);
   } else if (step.slug === "press-wheel") {
      notes = getPressWheelPricingDevNotes(machineSetup, context);
   } else if (step.slug === "gauge-wheel") {
      notes = getGaugeWheelPricingDevNotes(machineSetup, context);
   } else if (step.slug === "seed-boot-pivot") {
      notes = getSeedBootPivotPricingDevNotes(machineSetup, context);
   } else if (step.slug === "seed-boot") {
      notes = getSeedBootPricingDevNotes(machineSetup, context);
   } else if (step.slug === "seed-boot-springs") {
      notes = getSeedBootSpringPricingDevNotes(machineSetup, context);
   } else if (step.slug === "seed-tabs") {
      notes = getSeedTabPricingDevNotes(machineSetup, context);
   } else if (step.slug === "hoses") {
      notes = getDrillHosesPricingDevNotes(step, machineSetup);
   } else if (step.slug === "air-cart-hoses") {
      notes = getAirCartHosesPricingDevNotes(step, machineSetup);
   } else if (step.slug === "air-cart-couplers") {
      notes = getAirCartCouplersPricingDevNotes(step, machineSetup);
   } else if (step.slug === "air-cart-auger-conveyor") {
      notes = getAirCartAugerConveyorPricingDevNotes(step);
   } else if (step.slug === "towers") {
      notes = getTowersPricingDevNotes(machineSetup, context, step);
   } else if (step.slug === "blockage-system") {
      notes = getBlockageSystemPricingDevNotes(machineSetup, context, step);
   } else if (step.slug === "other-sfp-row-unit-parts") {
      notes = getSfpRowUnitPartsPricingDevNotes(machineSetup, context, step);
   } else if (isAirCartTankStep(step)) {
      notes = getAirCartTankPricingDevNotes(machineSetup, context, step);
   } else {
      notes = buildScaffoldPricingDevNotes(step, machineSetup, context);
   }

   return withFinalizedQuestions(notes, step);
}
