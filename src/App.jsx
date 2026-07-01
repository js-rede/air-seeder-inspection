import { useEffect, useMemo, useState } from "react";
import InspectionHeader from "./components/InspectionHeader";
import InspectionCard from "./components/InspectionCard";
import InspectionNav from "./components/InspectionNav";
import InspectionWelcome from "./components/InspectionWelcome";
import InspectionScorecard from "./components/InspectionScorecard";
import InspectionResults from "./components/InspectionResults";
import { getSavedDraft, saveDraft } from "./utils/storage";
import { isAnswerComplete } from "./utils/answers";
import Loading from "./components/Loading";
import { validateSteps } from "./utils/validateSteps";
import { calculateInspectionSummary, calculateRowUnitCount } from "./utils/inspectionSummary";
import {
   getApplicableSteps,
   getCurrentMachineIdentity,
   isDrillIncluded,
   isCartIncluded,
   isSameCurrentMachine,
   getDrillSetup,
   getCartSetup,
   normalizeMachineSetup,
   persistMachineSetupDraft,
} from "./data/machineCatalog";
import { STEPS_URL } from "./config";

function App() {
   const savedDraft = getSavedDraft();
   const hasSavedProgress =
      savedDraft.hasStarted || savedDraft.currentIndex > 0 || Object.keys(savedDraft.answers || {}).length > 0;
   const hasSavedInspection = Boolean(savedDraft.hasInspectionStarted) || (savedDraft.currentIndex || 0) > 1;

   const [steps, setSteps] = useState([]);
   const [hasStarted, setHasStarted] = useState(hasSavedProgress);
   const [hasInspectionStarted, setHasInspectionStarted] = useState(hasSavedInspection);
   const [isFinished, setIsFinished] = useState(Boolean(savedDraft.isFinished));
   const [currentIndex, setCurrentIndex] = useState(savedDraft.currentIndex || 0);
   const [answers, setAnswers] = useState(savedDraft.answers || {});
   const [rowUnitCountOverride, setRowUnitCountOverride] = useState(savedDraft.rowUnitCountOverride ?? null);
   const [workingRanksOverride, setWorkingRanksOverride] = useState(savedDraft.workingRanksOverride ?? null);
   const [tankCountOverride, setTankCountOverride] = useState(savedDraft.tankCountOverride ?? null);
   const [currentMachine, setCurrentMachine] = useState(savedDraft.currentMachine ?? null);

   useEffect(() => {
      fetch(STEPS_URL)
         .then((res) => res.json())
         .then((data) => {
            const validSteps = validateSteps(data);

            const sortedSteps = validSteps.sort((a, b) => a.step_number - b.step_number);

            setSteps(sortedSteps);
         })
         .catch((error) => {
            console.error("Failed to load inspection steps:", error);
         });
   }, []);

   useEffect(() => {
      saveDraft({
         hasStarted,
         hasInspectionStarted,
         isFinished,
         currentIndex,
         answers,
         rowUnitCountOverride,
         workingRanksOverride,
         tankCountOverride,
         currentMachine,
      });
   }, [hasStarted, hasInspectionStarted, isFinished, currentIndex, answers, rowUnitCountOverride, workingRanksOverride, tankCountOverride, currentMachine]);

   const machineSetup = useMemo(() => normalizeMachineSetup(answers["machine-setup"]), [answers]);
   const applicableSteps = useMemo(() => getApplicableSteps(steps, machineSetup), [steps, machineSetup]);
   const calculatedRowUnitCount = useMemo(() => calculateRowUnitCount(answers["machine-setup"]), [answers]);
   const setupWorkingRanks = Number(getDrillSetup(machineSetup).workingRanks) || 0;
   const showWorkingRanks = isDrillIncluded(machineSetup);
   const showCartTanks = isCartIncluded(machineSetup);
   const setupTankCount = Number(getCartSetup(machineSetup)?.tankCount) || 0;
   const summary = useMemo(
      () => calculateInspectionSummary(applicableSteps, answers, rowUnitCountOverride, workingRanksOverride, tankCountOverride),
      [applicableSteps, answers, rowUnitCountOverride, workingRanksOverride, tankCountOverride],
   );
   const currentStep = applicableSteps[currentIndex];
   const canGoNext = currentStep
      ? isAnswerComplete(currentStep, answers[currentStep.slug], answers, rowUnitCountOverride, workingRanksOverride)
      : false;
   useEffect(() => {
      if (!applicableSteps.length) return;

      setCurrentIndex((prev) => {
         const previousStep = steps[prev] || applicableSteps[prev];
         if (previousStep?.slug) {
            const nextIndex = applicableSteps.findIndex((step) => step.slug === previousStep.slug);
            if (nextIndex >= 0) return nextIndex;
         }

         return Math.min(prev, applicableSteps.length - 1);
      });
   }, [applicableSteps, steps]);

   const isMachineSetupStep = currentStep?.answer_type === "machine_setup";
   const hasRunningEstimate = summary.estimatedLow > 0 || summary.estimatedHigh > 0;
   const isMainArmPivotStep = currentStep?.slug === "main-arm-pivot";
   const showScorecard = hasStarted && !isFinished && hasInspectionStarted && !(isMachineSetupStep && !hasRunningEstimate);
   const showCompactMachineCounts = hasStarted && !isFinished && isMainArmPivotStep && !showScorecard;

   function syncMachineCountOverrides() {
      setRowUnitCountOverride(null);
      setWorkingRanksOverride(null);
      setTankCountOverride(null);
   }

   function resetInspectionKeepingMachineSetup(setupAnswer) {
      setHasInspectionStarted(false);
      setAnswers(setupAnswer ? { "machine-setup": setupAnswer } : {});
      syncMachineCountOverrides();
   }

   function handleMachineCountsChange({ rowUnitCount, workingRanks, tankCount }) {
      if (rowUnitCount !== undefined) {
         setRowUnitCountOverride(rowUnitCount);
      }

      if (workingRanks !== undefined) {
         setWorkingRanksOverride(workingRanks);
      }

      if (tankCount !== undefined) {
         setTankCountOverride(tankCount);
      }

      if (rowUnitCount === undefined && workingRanks === undefined && tankCount === undefined) {
         return;
      }

      setAnswers((prev) => {
         const setup = normalizeMachineSetup(prev["machine-setup"]);
         const next = { ...setup };

         if (setup.component === "both") {
            if (rowUnitCount != null || workingRanks != null || rowUnitCount === null) {
               next.drill = { ...setup.drill };

               if (rowUnitCount != null) {
                  next.drill.rowUnitCount = String(rowUnitCount);
               } else if (rowUnitCount === null) {
                  next.drill.rowUnitCount = "";
               }

               if (workingRanks != null) {
                  next.drill.workingRanks = String(workingRanks);
               }
            }

            if (tankCount != null) {
               next.cart = { ...setup.cart, tankCount: String(tankCount) };
            }
         } else {
            if (rowUnitCount != null) {
               next.rowUnitCount = String(rowUnitCount);
            } else if (rowUnitCount === null) {
               next.rowUnitCount = "";
            }

            if (workingRanks != null) {
               next.workingRanks = String(workingRanks);
            }

            if (tankCount != null) {
               next.tankCount = String(tankCount);
            }
         }

         return {
            ...prev,
            "machine-setup": persistMachineSetupDraft(next),
         };
      });
   }

   function handleAnswer(value) {
      if (currentStep?.answer_type === "machine_setup") {
         const prev = normalizeMachineSetup(answers["machine-setup"]);
         const next = normalizeMachineSetup(value);

         if (currentMachine && !isSameCurrentMachine(currentMachine, next)) {
            resetInspectionKeepingMachineSetup(value);
            return;
         }

         const prevDrill = getDrillSetup(prev);
         const nextDrill = getDrillSetup(next);

         if (prevDrill.rowUnitCount !== nextDrill.rowUnitCount) {
            const count = Number(nextDrill.rowUnitCount);
            setRowUnitCountOverride(count > 0 ? count : null);
         }

         if (prevDrill.workingRanks !== nextDrill.workingRanks) {
            const ranks = Number(nextDrill.workingRanks);
            setWorkingRanksOverride(ranks > 0 ? ranks : null);
         }

         const prevCart = getCartSetup(prev);
         const nextCart = getCartSetup(next);

         if (prevCart?.tankCount !== nextCart?.tankCount) {
            const tanks = Number(nextCart?.tankCount);
            setTankCountOverride(tanks > 0 ? tanks : null);
         }
      }

      setAnswers((prev) => ({
         ...prev,
         [currentStep.slug]: value,
      }));
   }

   function goNext() {
      if (isMachineSetupStep) {
         const nextMachine = getCurrentMachineIdentity(answers["machine-setup"]);

         if (currentMachine && !isSameCurrentMachine(currentMachine, nextMachine)) {
            resetInspectionKeepingMachineSetup(answers["machine-setup"]);
         }

         setCurrentMachine(nextMachine);
      }
      if (currentStep?.slug === "main-arm-pivot") {
         setHasInspectionStarted(true);
      }

      if (currentIndex >= applicableSteps.length - 1) {
         setIsFinished(true);
         return;
      }

      setCurrentIndex((prev) => Math.min(prev + 1, applicableSteps.length - 1));
   }

   function goBack() {
      if (isFinished) {
         setIsFinished(false);
         return;
      }

      if (currentIndex === 0) {
         setHasStarted(false);
         return;
      }

      setCurrentIndex((prev) => Math.max(prev - 1, 0));
   }

   function startInspection() {
      setHasStarted(true);
      setIsFinished(false);
   }

   function restartInspection() {
      setHasStarted(false);
      setHasInspectionStarted(false);
      setIsFinished(false);
      setCurrentIndex(0);
      setAnswers({});
      setRowUnitCountOverride(null);
      setWorkingRanksOverride(null);
      setTankCountOverride(null);
      setCurrentMachine(null);
   }

   return (
      <div id="air-seeder-inspection-app" className="relative min-h-[600px] bg-slate-50 p-10 flex items-start">
         <Loading isLoaded={steps.length > 0} />

         {!!steps.length && (
            <div className="max-w-[1000px] m-auto mt-0 w-full">
               <InspectionHeader
                  currentIndex={currentIndex}
                  totalSteps={applicableSteps.length}
                  showProgress={hasStarted && !isFinished}
               />

               {showScorecard && (
                  <InspectionScorecard
                     summary={summary}
                     calculatedRowUnitCount={calculatedRowUnitCount}
                     setupWorkingRanks={setupWorkingRanks}
                     setupTankCount={setupTankCount}
                     showWorkingRanks={showWorkingRanks}
                     showCartTanks={showCartTanks}
                     onMachineCountsChange={handleMachineCountsChange}
                  />
               )}

               {showCompactMachineCounts && (
                  <InspectionScorecard
                     compact
                     summary={summary}
                     calculatedRowUnitCount={calculatedRowUnitCount}
                     setupWorkingRanks={setupWorkingRanks}
                     setupTankCount={setupTankCount}
                     showWorkingRanks={showWorkingRanks}
                     showCartTanks={showCartTanks}
                     onMachineCountsChange={handleMachineCountsChange}
                  />
               )}

               {hasStarted ? (
                  isFinished ? (
                     <InspectionResults summary={summary} onRestart={restartInspection} />
                  ) : (
                     <>
                        <InspectionCard
                           step={currentStep}
                           selectedAnswer={answers[currentStep.slug]}
                           onAnswer={handleAnswer}
                           rowUnitCount={summary.rowUnitCount}
                           workingRanks={summary.workingRanks}
                           onBack={goBack}
                           onNext={goNext}
                           canGoBack={currentIndex > 0}
                           canGoNext={canGoNext}
                           isLastStep={currentIndex >= applicableSteps.length - 1}
                        />
                        <InspectionNav
                           currentIndex={currentIndex}
                           totalSteps={applicableSteps.length}
                           onBack={goBack}
                           onNext={goNext}
                           canGoNext={canGoNext}
                        />
                     </>
                  )
               ) : (
                  <InspectionWelcome onStart={startInspection} />
               )}
            </div>
         )}
      </div>
   );
}

export default App;
