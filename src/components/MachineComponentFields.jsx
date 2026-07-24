import {
   CART_TANK_COUNTS,
   CART_TANK_SIZES,
   DRILL_WIDTHS,
   ROW_SPACINGS,
   ROW_UNIT_SERIES_OPTIONS,
   WORKING_RANKS,
   requiresRowUnitSeries,
} from "../data/machineCatalog";
import { selectClass, selectStyle } from "../utils/selectClass";

export function ManufacturerModelFields({ idPrefix, values, manufacturers, models, onFieldChange, revealAll = false }) {
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

         {(revealAll || values.manufacturer) && (
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

export function DrillDetailFields({
   idPrefix,
   values,
   onFieldChange,
   predictedRowUnitCount,
   rowUnitCountOptions,
   revealAll = false,
}) {
   if (!revealAll && !values.model) return null;

   const showRowUnitSeries = requiresRowUnitSeries(values.model);

   return (
      <>
         {showRowUnitSeries && (
            <div>
               <p className="mb-2 text-sm font-medium text-slate-700">Do you have 60-90 or ProSeries row units?</p>
               <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {ROW_UNIT_SERIES_OPTIONS.map((option) => {
                     const isSelected = values.rowUnitSeries === option.value;

                     return (
                        <button
                           key={option.value}
                           type="button"
                           onClick={() => onFieldChange("rowUnitSeries", option.value)}
                           className={`cursor-pointer rounded-xl border p-4 text-left text-base font-semibold transition ${
                              isSelected
                                 ? "border-[#1347e2] bg-blue-50 text-slate-900"
                                 : "border-slate-300 bg-white hover:border-slate-400 hover:bg-slate-50"
                           }`}>
                           {option.label}
                        </button>
                     );
                  })}
               </div>
            </div>
         )}

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

         {(revealAll || (values.width && values.rowSpacing)) && (
            <div className="grid gap-4 sm:grid-cols-2">
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
                     <p className="mt-2 text-xs text-slate-500">Estimated from width & row spacing. Adjust if needed.</p>
                  )}
               </div>
            </div>
         )}
      </>
   );
}

export function CartDetailFields({ idPrefix, values, onFieldChange, revealAll = false }) {
   if (!revealAll && !values.model) return null;

   return (
      <div className="grid gap-4 sm:grid-cols-2">
         <div>
            <label htmlFor={`${idPrefix}-tank-count`} className="mb-2 block text-sm font-medium text-slate-700">
               Number of tanks
            </label>
            <select
               id={`${idPrefix}-tank-count`}
               value={values.tankCount}
               onChange={(e) => onFieldChange("tankCount", e.target.value)}
               className={selectClass}
               style={selectStyle}>
               <option value="">Select tanks…</option>
               {CART_TANK_COUNTS.map((option) => (
                  <option key={option.value} value={option.value}>
                     {option.label}
                  </option>
               ))}
            </select>
         </div>

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
      </div>
   );
}
