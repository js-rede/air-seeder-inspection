import { useEffect } from "react";
import {
   MACHINE_CHOICES,
   getMachineChoice,
   getMachineChoiceTarget,
   getManufacturers,
   getModels,
   normalizeMachineSetup,
   persistMachineSetupDraft,
   switchMachineSetup,
} from "../data/machineCatalog";
import { calculateRowUnitCount, getRowUnitCountOptions } from "../utils/inspectionSummary";
import { CartDetailFields, DrillDetailFields, ManufacturerModelFields } from "./MachineComponentFields";

function ComponentIncludeToggle({ included, label, onChange, disableOff }) {
   return (
      <div className="flex shrink-0 items-center gap-2">
         <span className="text-xs font-medium uppercase italic tracking-wide text-slate-500 opacity-70">
            {included ? "Included" : "Skipped"}
         </span>
         <button
            type="button"
            role="switch"
            aria-checked={included}
            aria-label={`${included ? "Skip" : "Include"} ${label}`}
            disabled={disableOff && included}
            onClick={() => onChange(!included)}
            className={`relative h-6 w-11 rounded-full transition-colors ${
               disableOff && included ? "cursor-not-allowed opacity-60" : "cursor-pointer"
            } ${included ? "bg-[#e21313]" : "bg-slate-300"}`}>
            <span
               className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
                  included ? "translate-x-5" : "translate-x-0"
               }`}
            />
         </button>
      </div>
   );
}

function SetupCard({ title, included = true, onIncludedChange, canDisable = true, children }) {
   return (
      <div
         className={`rounded-2xl border p-5 shadow-sm transition ${
            included ? "border-slate-200 bg-slate-50/60" : "border-slate-200 bg-slate-100/50"
         }`}>
         <div className="mb-4 flex items-start justify-between gap-4">
            <h3 className={`text-lg font-semibold ${included ? "text-slate-900" : "text-slate-500"}`}>{title}</h3>
            {onIncludedChange ? (
               <ComponentIncludeToggle
                  label={title}
                  included={included}
                  onChange={onIncludedChange}
                  disableOff={!canDisable}
               />
            ) : null}
         </div>
         <div className={`space-y-4 ${included ? "" : "pointer-events-none opacity-50"}`}>{children}</div>
      </div>
   );
}

function MachineSetupForm({ value, onChange }) {
   const setup = normalizeMachineSetup(value);
   const machineChoice = getMachineChoice(setup);
   const isAirSeederBoth = setup.component === "both";
   const includeDrill = setup.includeDrill !== false;
   const includeCart = setup.includeCart !== false;
   const showSingleDrillFields = setup.equipmentType === "planter" || setup.component === "drill";
   const showSingleCartFields = setup.component === "cart";
   const drillValues = isAirSeederBoth ? setup.drill : setup;
   const cartValues = isAirSeederBoth ? setup.cart : setup;
   const drillManufacturers = getManufacturers("air_seeder", "drill");
   const cartManufacturers = getManufacturers("air_seeder", "cart");
   const singleManufacturers = getManufacturers(setup.equipmentType, setup.component);
   const drillModels = getModels("air_seeder", "drill", drillValues.manufacturer);
   const cartModels = getModels("air_seeder", "cart", cartValues.manufacturer);
   const singleModels = getModels(setup.equipmentType, setup.component, setup.manufacturer);
   const predictedRowUnitCount = calculateRowUnitCount(isAirSeederBoth ? { component: "both", drill: setup.drill } : setup);
   const rowUnitCountOptions = getRowUnitCountOptions(predictedRowUnitCount, drillValues.rowUnitCount);

   useEffect(() => {
      if (!showSingleDrillFields && !isAirSeederBoth) return;
      if (isAirSeederBoth && !includeDrill) return;
      if (!drillValues.width || !drillValues.rowSpacing) return;
      if (drillValues.rowUnitCount) return;

      const predicted = calculateRowUnitCount(isAirSeederBoth ? { component: "both", drill: setup.drill } : setup);
      if (predicted <= 0) return;

      if (isAirSeederBoth) {
         onChange(
            persistMachineSetupDraft({
               ...setup,
               drill: { ...setup.drill, rowUnitCount: String(predicted) },
            }),
         );
         return;
      }

      onChange(persistMachineSetupDraft({ ...setup, rowUnitCount: String(predicted) }));
   }, [
      setup,
      onChange,
      showSingleDrillFields,
      isAirSeederBoth,
      drillValues.width,
      drillValues.rowSpacing,
      drillValues.rowUnitCount,
      includeDrill,
   ]);

   function updateField(field, nextValue) {
      if (field === "machineChoice") {
         onChange(switchMachineSetup(setup, getMachineChoiceTarget(nextValue)));
         return;
      }

      const next = { ...setup, [field]: nextValue };

      if (field === "manufacturer") {
         next.model = "";
         next.width = "";
         next.rowSpacing = "";
         next.rowUnitCount = "";
         next.workingRanks = "";
         next.tankCount = "";
         next.tankSize = "";
      }

      if (field === "model") {
         next.width = "";
         next.rowSpacing = "";
         next.rowUnitCount = "";
         next.workingRanks = "";
         next.tankCount = "";
         next.tankSize = "";
         if (nextValue !== "Other") {
            next.otherDetails = "";
         }
      }

      if ((field === "width" || field === "rowSpacing") && showSingleDrillFields) {
         const predicted = calculateRowUnitCount(next);
         if (predicted > 0) {
            next.rowUnitCount = String(predicted);
         }
      }

      onChange(persistMachineSetupDraft(next));
   }

   function updateDrillField(field, nextValue) {
      const nextDrill = { ...setup.drill, [field]: nextValue };

      if (field === "manufacturer") {
         nextDrill.model = "";
         nextDrill.width = "";
         nextDrill.rowSpacing = "";
         nextDrill.rowUnitCount = "";
         nextDrill.workingRanks = "";
      }

      if (field === "model") {
         nextDrill.width = "";
         nextDrill.rowSpacing = "";
         nextDrill.rowUnitCount = "";
         nextDrill.workingRanks = "";
         if (nextValue !== "Other") {
            nextDrill.otherDetails = "";
         }
      }

      if (field === "width" || field === "rowSpacing") {
         const predicted = calculateRowUnitCount({ component: "both", drill: nextDrill });
         if (predicted > 0) {
            nextDrill.rowUnitCount = String(predicted);
         }
      }

      onChange(persistMachineSetupDraft({ ...setup, drill: nextDrill }));
   }

   function updateCartField(field, nextValue) {
      const nextCart = { ...setup.cart, [field]: nextValue };

      if (field === "manufacturer") {
         nextCart.model = "";
         nextCart.tankCount = "";
         nextCart.tankSize = "";
      }

      if (field === "model") {
         nextCart.tankCount = "";
         nextCart.tankSize = "";
         if (nextValue !== "Other") {
            nextCart.otherDetails = "";
         }
      }

      onChange(persistMachineSetupDraft({ ...setup, cart: nextCart }));
   }

   function setIncludeDrill(nextIncluded) {
      if (!nextIncluded && !includeCart) return;

      onChange(
         persistMachineSetupDraft({
            ...setup,
            includeDrill: nextIncluded,
            inspectionOrder: nextIncluded ? "drill_first" : "cart_first",
         }),
      );
   }

   function setIncludeCart(nextIncluded) {
      if (!nextIncluded && !includeDrill) return;

      onChange(
         persistMachineSetupDraft({
            ...setup,
            includeCart: nextIncluded,
            inspectionOrder: nextIncluded ? (includeDrill ? "drill_first" : "cart_first") : "drill_first",
         }),
      );
   }

   return (
      <div className="mt-6 space-y-5" id="machine-setup">
         <div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
               {MACHINE_CHOICES.map((option) => {
                  const isSelected = machineChoice === option.value;

                  return (
                     <button
                        key={option.value}
                        type="button"
                        onClick={() => updateField("machineChoice", option.value)}
                        className={`flex h-full cursor-pointer flex-col items-start justify-start rounded-xl border p-4 text-left transition ${
                           isSelected
                              ? "border-[#1347e2] bg-blue-50 text-slate-900"
                              : "border-slate-300 bg-white hover:border-slate-400 hover:bg-slate-50"
                        }`}>
                        <span className="block text-lg font-semibold">{option.label}</span>
                        {option.description && option.description.length > 0 ? (
                           <span className="mt-1 block text-sm text-slate-500">{option.description}</span>
                        ) : null}
                     </button>
                  );
               })}
            </div>
         </div>

         {isAirSeederBoth && (
            <div className="space-y-5">
               <SetupCard
                  title="Drill"
                  included={includeDrill}
                  onIncludedChange={setIncludeDrill}
                  canDisable={includeCart}>
                  <ManufacturerModelFields
                     idPrefix="machine-drill"
                     values={drillValues}
                     manufacturers={drillManufacturers}
                     models={drillModels}
                     onFieldChange={updateDrillField}
                  />
                  <DrillDetailFields
                     idPrefix="machine-drill"
                     values={drillValues}
                     onFieldChange={updateDrillField}
                     predictedRowUnitCount={predictedRowUnitCount}
                     rowUnitCountOptions={rowUnitCountOptions}
                  />
               </SetupCard>

               <SetupCard
                  title="Air Cart"
                  included={includeCart}
                  onIncludedChange={setIncludeCart}
                  canDisable={includeDrill}>
                  <ManufacturerModelFields
                     idPrefix="machine-cart"
                     values={cartValues}
                     manufacturers={cartManufacturers}
                     models={cartModels}
                     onFieldChange={updateCartField}
                  />
                  <CartDetailFields idPrefix="machine-cart" values={cartValues} onFieldChange={updateCartField} />
               </SetupCard>
            </div>
         )}

         {setup.equipmentType === "planter" && (
            <SetupCard title="Planter">
               <ManufacturerModelFields
                  idPrefix="machine"
                  values={setup}
                  manufacturers={singleManufacturers}
                  models={singleModels}
                  onFieldChange={updateField}
               />
               <DrillDetailFields
                  idPrefix="machine"
                  values={setup}
                  onFieldChange={updateField}
                  predictedRowUnitCount={predictedRowUnitCount}
                  rowUnitCountOptions={rowUnitCountOptions}
               />
            </SetupCard>
         )}

         {!isAirSeederBoth && setup.component && (
            <div className="space-y-4">
               <ManufacturerModelFields
                  idPrefix="machine"
                  values={setup}
                  manufacturers={singleManufacturers}
                  models={singleModels}
                  onFieldChange={updateField}
               />

               {showSingleDrillFields && (
                  <DrillDetailFields
                     idPrefix="machine"
                     values={setup}
                     onFieldChange={updateField}
                     predictedRowUnitCount={predictedRowUnitCount}
                     rowUnitCountOptions={rowUnitCountOptions}
                  />
               )}

               {showSingleCartFields && <CartDetailFields idPrefix="machine" values={setup} onFieldChange={updateField} />}
            </div>
         )}
      </div>
   );
}

export default MachineSetupForm;
