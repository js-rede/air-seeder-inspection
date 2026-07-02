import { useEffect, useState } from "react";
import {
   getManufacturers,
   getModels,
   isCartPartConfigurationComplete,
   isDrillPartConfigurationComplete,
   normalizeMachineSetup,
   persistMachineSetupDraft,
} from "../data/machineCatalog";
import { calculateRowUnitCount, getRowUnitCountOptions } from "../utils/inspectionSummary";
import { CartDetailFields, DrillDetailFields, ManufacturerModelFields } from "./MachineComponentFields";

function ComponentSetupModalContent({ type, setup, onSave }) {
   const [draft, setDraft] = useState(() => normalizeMachineSetup(setup));
   const drillValues = draft.drill;
   const cartValues = draft.cart;
   const drillManufacturers = getManufacturers("air_seeder", "drill");
   const cartManufacturers = getManufacturers("air_seeder", "cart");
   const drillModels = getModels("air_seeder", "drill", drillValues.manufacturer);
   const cartModels = getModels("air_seeder", "cart", cartValues.manufacturer);
   const predictedRowUnitCount = calculateRowUnitCount({ component: "both", drill: drillValues });
   const rowUnitCountOptions = getRowUnitCountOptions(predictedRowUnitCount, drillValues.rowUnitCount);
   const isComplete = type === "drill" ? isDrillPartConfigurationComplete(draft) : isCartPartConfigurationComplete(draft);
   const title = type === "drill" ? "Set Up Your Drill" : "Set Up Your Air Cart";
   const description =
      type === "drill"
         ? "Before inspecting the drill, tell us about your machine so we can estimate parts and costs."
         : "Before inspecting the air cart, tell us about your machine so we can estimate parts and costs.";

   useEffect(() => {
      setDraft(normalizeMachineSetup(setup));
   }, [setup]);

   useEffect(() => {
      if (type !== "drill") return;
      if (!drillValues.width || !drillValues.rowSpacing || drillValues.rowUnitCount) return;

      const predicted = calculateRowUnitCount({ component: "both", drill: drillValues });
      if (predicted <= 0) return;

      setDraft((current) =>
         persistMachineSetupDraft({
            ...current,
            drill: { ...current.drill, rowUnitCount: String(predicted) },
         }),
      );
   }, [type, drillValues.width, drillValues.rowSpacing, drillValues.rowUnitCount]);

   function updateDrillField(field, nextValue) {
      setDraft((current) => {
         const nextDrill = { ...current.drill, [field]: nextValue };

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

         return persistMachineSetupDraft({ ...current, drill: nextDrill });
      });
   }

   function updateCartField(field, nextValue) {
      setDraft((current) => {
         const nextCart = { ...current.cart, [field]: nextValue };

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

         return persistMachineSetupDraft({ ...current, cart: nextCart });
      });
   }

   function handleSubmit(event) {
      event.preventDefault();
      if (!isComplete) return;

      onSave(draft);
   }

   return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
         <div className="absolute inset-0 bg-slate-900/50" aria-hidden="true" />

         <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="component-setup-title"
            className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-slate-200 bg-white p-6 shadow-xl">
            <h2 id="component-setup-title" className="text-xl font-semibold text-slate-900">
               {title}
            </h2>
            <p className="mt-2 text-sm text-slate-600">{description}</p>

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
               {type === "drill" ? (
                  <>
                     <ManufacturerModelFields
                        idPrefix="component-drill"
                        values={drillValues}
                        manufacturers={drillManufacturers}
                        models={drillModels}
                        onFieldChange={updateDrillField}
                        revealAll
                     />
                     <DrillDetailFields
                        idPrefix="component-drill"
                        values={drillValues}
                        onFieldChange={updateDrillField}
                        predictedRowUnitCount={predictedRowUnitCount}
                        rowUnitCountOptions={rowUnitCountOptions}
                        revealAll
                     />
                  </>
               ) : (
                  <>
                     <ManufacturerModelFields
                        idPrefix="component-cart"
                        values={cartValues}
                        manufacturers={cartManufacturers}
                        models={cartModels}
                        onFieldChange={updateCartField}
                        revealAll
                     />
                     <CartDetailFields idPrefix="component-cart" values={cartValues} onFieldChange={updateCartField} revealAll />
                  </>
               )}

               <div className="pt-2">
                  <button
                     type="submit"
                     disabled={!isComplete}
                     className="w-full cursor-pointer rounded-xl bg-[#e21313] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#c91010] disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto">
                     Save & Continue
                  </button>
               </div>
            </form>
         </div>
      </div>
   );
}

function ComponentSetupModal({ isOpen, type, setup, onSave }) {
   if (!isOpen || !type) return null;

   return <ComponentSetupModalContent key={`${type}-${isOpen}`} type={type} setup={setup} onSave={onSave} />;
}

export default ComponentSetupModal;
