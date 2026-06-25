import { useEffect } from "react";
import {
   CART_TANK_SIZES,
   DRILL_WIDTHS,
   MACHINE_CHOICES,
   ROW_SPACINGS,
   WORKING_RANKS,
   getMachineChoice,
   getMachineChoiceTarget,
   getManufacturers,
   getModels,
   normalizeMachineSetup,
   persistMachineSetupDraft,
   switchMachineSetup,
} from "../data/machineCatalog";
import { calculateRowUnitCount, getRowUnitCountOptions } from "../utils/inspectionSummary";
import { selectClass, selectStyle } from "../utils/selectClass";

function SetupCard({ title, children }) {
   return (
      <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-5 shadow-sm">
         <h3 className="mb-4 text-lg font-semibold text-slate-900">{title}</h3>
         <div className="space-y-4">{children}</div>
      </div>
   );
}

function ManufacturerModelFields({ idPrefix, values, manufacturers, models, onFieldChange }) {
   return (
      <>
         <div>
            <label htmlFor={`${idPrefix}-manufacturer`} className="mb-2 block text-sm font-medium text-slate-700">
               Manufacturer
            </label>
            <select
               id={`${idPrefix}-manufacturer`}
               value={values.manufacturer}
               onChange={(e) => onFieldChange("manufacturer", e.target.value)}
               className={selectClass}
               style={selectStyle}>
               <option value="">Select manufacturer…</option>
               {manufacturers.map((manufacturer) => (
                  <option key={manufacturer} value={manufacturer}>
                     {manufacturer}
                  </option>
               ))}
            </select>
         </div>

         {values.manufacturer && (
            <div>
               <label htmlFor={`${idPrefix}-model`} className="mb-2 block text-sm font-medium text-slate-700">
                  Model
               </label>
               <select
                  id={`${idPrefix}-model`}
                  value={values.model}
                  onChange={(e) => onFieldChange("model", e.target.value)}
                  className={selectClass}
                  style={selectStyle}>
                  <option value="">Select model…</option>
                  {models.map((model) => (
                     <option key={model} value={model}>
                        {model}
                     </option>
                  ))}
               </select>
            </div>
         )}

         {values.model === "Other" && (
            <div>
               <label htmlFor={`${idPrefix}-other-details`} className="mb-2 block text-sm font-medium text-slate-700">
                  Model details
               </label>
               <input
                  id={`${idPrefix}-other-details`}
                  type="text"
                  value={values.otherDetails}
                  onChange={(e) => onFieldChange("otherDetails", e.target.value)}
                  placeholder="Enter make, model, or year"
                  className={selectClass}
               />
            </div>
         )}
      </>
   );
}

function DrillDetailFields({ idPrefix, values, onFieldChange, predictedRowUnitCount, rowUnitCountOptions }) {
   if (!values.model) return null;

   return (
      <>
         <div className="grid gap-4 sm:grid-cols-2">
            <div>
               <label htmlFor={`${idPrefix}-width`} className="mb-2 block text-sm font-medium text-slate-700">
                  Working width
               </label>
               <select
                  id={`${idPrefix}-width`}
                  value={values.width}
                  onChange={(e) => onFieldChange("width", e.target.value)}
                  className={selectClass}
                  style={selectStyle}>
                  <option value="">Select width…</option>
                  {DRILL_WIDTHS.map((width) => (
                     <option key={width} value={width}>
                        {width}
                     </option>
                  ))}
               </select>
            </div>

            <div>
               <label htmlFor={`${idPrefix}-spacing`} className="mb-2 block text-sm font-medium text-slate-700">
                  Row spacing
               </label>
               <select
                  id={`${idPrefix}-spacing`}
                  value={values.rowSpacing}
                  onChange={(e) => onFieldChange("rowSpacing", e.target.value)}
                  className={selectClass}
                  style={selectStyle}>
                  <option value="">Select spacing…</option>
                  {ROW_SPACINGS.map((spacing) => (
                     <option key={spacing} value={spacing}>
                        {spacing}
                     </option>
                  ))}
               </select>
            </div>
         </div>

         {values.width && values.rowSpacing && (
            <div className="grid gap-4 sm:grid-cols-2">
               <div>
                  <label htmlFor={`${idPrefix}-row-units`} className="mb-2 block text-sm font-medium text-slate-700">
                     Number of row-units
                  </label>
                  <select
                     id={`${idPrefix}-row-units`}
                     value={values.rowUnitCount}
                     onChange={(e) => onFieldChange("rowUnitCount", e.target.value)}
                     className={selectClass}
                     style={selectStyle}>
                     <option value="">Select row-units…</option>
                     {rowUnitCountOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                           {option.label}
                        </option>
                     ))}
                  </select>
                  {predictedRowUnitCount > 0 && (
                     <p className="mt-2 text-xs text-slate-500">Estimated from width and row spacing. Adjust if needed.</p>
                  )}
               </div>

               <div>
                  <label htmlFor={`${idPrefix}-working-ranks`} className="mb-2 block text-sm font-medium text-slate-700">
                     Number of working ranks
                  </label>
                  <select
                     id={`${idPrefix}-working-ranks`}
                     value={values.workingRanks}
                     onChange={(e) => onFieldChange("workingRanks", e.target.value)}
                     className={selectClass}
                     style={selectStyle}>
                     <option value="">Select ranks…</option>
                     {WORKING_RANKS.map((option) => (
                        <option key={option.value} value={option.value}>
                           {option.label}
                        </option>
                     ))}
                  </select>
               </div>
            </div>
         )}
      </>
   );
}

function CartDetailFields({ idPrefix, values, onFieldChange }) {
   if (!values.model) return null;

   return (
      <div>
         <label htmlFor={`${idPrefix}-tank-size`} className="mb-2 block text-sm font-medium text-slate-700">
            Tank size
         </label>
         <select
            id={`${idPrefix}-tank-size`}
            value={values.tankSize}
            onChange={(e) => onFieldChange("tankSize", e.target.value)}
            className={selectClass}
            style={selectStyle}>
            <option value="">Select tank size…</option>
            {CART_TANK_SIZES.map((size) => (
               <option key={size} value={size}>
                  {size}
               </option>
            ))}
         </select>
      </div>
   );
}

function MachineSetupForm({ value, onChange }) {
   const setup = normalizeMachineSetup(value);
   const machineChoice = getMachineChoice(setup);
   const isAirSeederBoth = setup.component === "both";
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
      }

      if (field === "model") {
         next.width = "";
         next.rowSpacing = "";
         next.rowUnitCount = "";
         next.workingRanks = "";
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
         nextCart.tankSize = "";
      }

      if (field === "model") {
         nextCart.tankSize = "";
         if (nextValue !== "Other") {
            nextCart.otherDetails = "";
         }
      }

      onChange(persistMachineSetupDraft({ ...setup, cart: nextCart }));
   }

   return (
      <div className="mt-6 space-y-5" id="machine-setup">
         <div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-4">
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
            <div className="grid gap-5 lg:grid-cols-2">
               <SetupCard title="Drill">
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

               <SetupCard title="Air Cart">
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

         {!isAirSeederBoth && (setup.equipmentType === "planter" || setup.component) && (
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
