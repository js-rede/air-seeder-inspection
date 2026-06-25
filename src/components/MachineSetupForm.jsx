import { useEffect } from "react";
import {
   AIR_SEEDER_COMPONENTS,
   CART_TANK_SIZES,
   DRILL_WIDTHS,
   EQUIPMENT_TYPES,
   ROW_SPACINGS,
   WORKING_RANKS,
   getManufacturers,
   getModels,
   normalizeMachineSetup,
   persistMachineSetupDraft,
   switchMachineSetup,
} from "../data/machineCatalog";
import { calculateRowUnitCount, getRowUnitCountOptions } from "../utils/inspectionSummary";
import { selectClass, selectStyle } from "../utils/selectClass";

function MachineSetupForm({ value, onChange }) {
   const setup = normalizeMachineSetup(value);
   const manufacturers = getManufacturers(setup.equipmentType, setup.component);
   const models = getModels(setup.equipmentType, setup.component, setup.manufacturer);
   const showComponent = setup.equipmentType === "air_seeder";
   const showDrillFields = setup.equipmentType === "planter" || setup.component === "drill";
   const showCartFields = setup.component === "cart";
   const predictedRowUnitCount = calculateRowUnitCount(setup);
   const rowUnitCountOptions = getRowUnitCountOptions(predictedRowUnitCount, setup.rowUnitCount);

   useEffect(() => {
      if (setup.component !== "drill" || !setup.width || !setup.rowSpacing) return;
      if (setup.rowUnitCount) return;

      const predicted = calculateRowUnitCount(setup);
      if (predicted > 0) {
         onChange(persistMachineSetupDraft({ ...setup, rowUnitCount: String(predicted) }));
      }
   }, [setup, onChange]);

   function updateField(field, nextValue) {
      if (field === "equipmentType") {
         onChange(switchMachineSetup(setup, { equipmentType: nextValue }));
         return;
      }

      if (field === "component") {
         onChange(
            switchMachineSetup(setup, {
               equipmentType: "air_seeder",
               component: nextValue,
            }),
         );
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

      if ((field === "width" || field === "rowSpacing") && next.component === "drill") {
         const predicted = calculateRowUnitCount(next);
         if (predicted > 0) {
            next.rowUnitCount = String(predicted);
         }
      }

      onChange(persistMachineSetupDraft(next));
   }

   return (
      <div className="mt-6 space-y-5" id="machine-setup">
         <div>
            <div className="grid gap-3 sm:grid-cols-2">
               {EQUIPMENT_TYPES.map((option) => {
                  const isSelected = setup.equipmentType === option.value;

                  return (
                     <button
                        key={option.value}
                        type="button"
                        onClick={() => updateField("equipmentType", option.value)}
                        className={`cursor-pointer rounded-xl border p-4 text-left transition ${
                           isSelected
                              ? "border-[#1347e2] bg-blue-50 text-slate-900"
                              : "border-slate-300 bg-white hover:border-slate-400 hover:bg-slate-50"
                        }`}>
                        <span className="block text-lg font-semibold">{option.label}</span>
                        <span className="mt-1 block text-sm text-slate-500">
                           {option.value === "air_seeder" ? "Drill and air cart setup" : "Row-crop planter setup"}
                        </span>
                     </button>
                  );
               })}
            </div>
         </div>

         {showComponent && (
            <div>
               <div className="mb-2 text-sm font-medium text-slate-700">Air seeder component</div>
               <div className="grid gap-3 sm:grid-cols-2">
                  {AIR_SEEDER_COMPONENTS.map((option) => {
                     const isSelected = setup.component === option.value;

                     return (
                        <button
                           key={option.value}
                           id={option.value === "drill" ? "machine-component-drill" : "machine-component-cart"}
                           type="button"
                           onClick={() => updateField("component", option.value)}
                           className={`cursor-pointer rounded-xl border p-4 text-left transition ${
                              isSelected
                                 ? "border-[#1347e2] bg-blue-50 text-slate-900"
                                 : "border-slate-300 bg-white hover:border-slate-400 hover:bg-slate-50"
                           }`}>
                           <span className="block text-lg font-semibold">{option.label}</span>
                        </button>
                     );
                  })}
               </div>
            </div>
         )}

         {(setup.equipmentType === "planter" || setup.component) && (
            <>
               <div>
                  <label htmlFor="machine-manufacturer" className="mb-2 block text-sm font-medium text-slate-700">
                     Manufacturer
                  </label>
                  <select
                     id="machine-manufacturer"
                     value={setup.manufacturer}
                     onChange={(e) => updateField("manufacturer", e.target.value)}
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

               {setup.manufacturer && (
                  <div>
                     <label htmlFor="machine-model" className="mb-2 block text-sm font-medium text-slate-700">
                        Model
                     </label>
                     <select
                        id="machine-model"
                        value={setup.model}
                        onChange={(e) => updateField("model", e.target.value)}
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

               {showDrillFields && setup.model && (
                  <div className="grid gap-4 sm:grid-cols-2">
                     <div>
                        <label htmlFor="machine-width" className="mb-2 block text-sm font-medium text-slate-700">
                           Working width
                        </label>
                        <select
                           id="machine-width"
                           value={setup.width}
                           onChange={(e) => updateField("width", e.target.value)}
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
                        <label htmlFor="machine-spacing" className="mb-2 block text-sm font-medium text-slate-700">
                           Row spacing
                        </label>
                        <select
                           id="machine-spacing"
                           value={setup.rowSpacing}
                           onChange={(e) => updateField("rowSpacing", e.target.value)}
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
               )}

               {setup.component === "drill" && setup.width && setup.rowSpacing && (
                  <div className="grid gap-4 sm:grid-cols-2">
                     <div>
                        <label htmlFor="machine-row-units" className="mb-2 block text-sm font-medium text-slate-700">
                           Number of row-units
                        </label>
                        <select
                           id="machine-row-units"
                           value={setup.rowUnitCount}
                           onChange={(e) => updateField("rowUnitCount", e.target.value)}
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
                           <p className="mt-2 text-xs text-slate-500">
                              Estimated from width and row spacing. Adjust if needed.
                           </p>
                        )}
                     </div>

                     <div>
                        <label htmlFor="machine-working-ranks" className="mb-2 block text-sm font-medium text-slate-700">
                           Number of working ranks
                        </label>
                        <select
                           id="machine-working-ranks"
                           value={setup.workingRanks}
                           onChange={(e) => updateField("workingRanks", e.target.value)}
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

               {showCartFields && (
                  <div>
                     <label htmlFor="machine-tank-size" className="mb-2 block text-sm font-medium text-slate-700">
                        Tank size
                     </label>
                     <select
                        id="machine-tank-size"
                        value={setup.tankSize}
                        onChange={(e) => updateField("tankSize", e.target.value)}
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
               )}

               {setup.model === "Other" && (
                  <div>
                     <label htmlFor="machine-other-details" className="mb-2 block text-sm font-medium text-slate-700">
                        Model details
                     </label>
                     <input
                        id="machine-other-details"
                        type="text"
                        value={setup.otherDetails}
                        onChange={(e) => updateField("otherDetails", e.target.value)}
                        placeholder="Enter make, model, or year"
                        className={selectClass}
                     />
                  </div>
               )}
            </>
         )}
      </div>
   );
}

export default MachineSetupForm;
