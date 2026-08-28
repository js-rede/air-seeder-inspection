import { getClosingPartsCostOverride } from "./closingPartRules";
import { getCuttingDiscPartsCostOverride } from "./cuttingDiscPartRules";
import { getDiscHubPartsCostOverride } from "./discHubPartRules";
import { getDepthAdjustmentPivotPartsCostOverride } from "./depthAdjustmentPivotPartRules";
import { getDepthArmPartsCostOverride } from "./depthArmPartRules";
import { getDepthCoverHandlePartsCostOverride } from "./depthCoverHandlePartRules";
import { getPressWheelArmPartsCostOverride } from "./pressWheelArmPartRules";
import { getPressWheelPivotPartsCostOverride } from "./pressWheelPivotPartRules";
import { getPressWheelPartsCostOverride } from "./pressWheelPartRules";
import { getPressWheelSpringPartsCostOverride } from "./pressWheelSpringPartRules";
import { getGaugeWheelPartsCostOverride } from "./gaugeWheelPartRules";
import { getSeedBootPivotPartsCostOverride } from "./seedBootPivotPartRules";
import { getSeedBootPartsCostOverride } from "./seedBootPartRules";
import { getSeedBootSpringPartsCostOverride } from "./seedBootSpringPartRules";
import { getSeedTabPartsCostOverride } from "./seedTabPartRules";
import { getTowerPartsCostOverride } from "./towerPartRules";
import { getSfpChoicePartsCostOverride } from "./sfpPartRules";

/** Per-checkbox parts override for multi-select steps (SFP). */
export function getMultiSelectChoicePartsCostOverride(step, choiceValue) {
   return getSfpChoicePartsCostOverride(step, choiceValue);
}

/** Step-level parts cost override from machine setup catalog rules. */
export function getPartsCostOverride(step, machineSetup, secondaryChoice, followUps = null) {
   return (
      getClosingPartsCostOverride(step, machineSetup, secondaryChoice) ??
      getCuttingDiscPartsCostOverride(step, machineSetup) ??
      getDiscHubPartsCostOverride(step, machineSetup) ??
      getDepthAdjustmentPivotPartsCostOverride(step, machineSetup) ??
      getDepthArmPartsCostOverride(step, machineSetup) ??
      getDepthCoverHandlePartsCostOverride(step, machineSetup) ??
      getPressWheelPivotPartsCostOverride(step, machineSetup) ??
      getPressWheelArmPartsCostOverride(step, machineSetup) ??
      getPressWheelSpringPartsCostOverride(step, machineSetup, secondaryChoice) ??
      getPressWheelPartsCostOverride(step, machineSetup) ??
      getGaugeWheelPartsCostOverride(step, machineSetup, secondaryChoice, followUps) ??
      getSeedBootPivotPartsCostOverride(step, machineSetup, secondaryChoice) ??
      getSeedBootPartsCostOverride(step, machineSetup, secondaryChoice) ??
      getSeedBootSpringPartsCostOverride(step) ??
      getSeedTabPartsCostOverride(step, machineSetup) ??
      getTowerPartsCostOverride(step, machineSetup, secondaryChoice)
   );
}
