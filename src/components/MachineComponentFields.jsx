import {
   CART_TANK_COUNTS,
   CART_TANK_SIZES,
   DRILL_WIDTHS,
   ROW_SPACINGS,
   WORKING_RANKS,
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

         {(revealAll || (values.width && values.rowSpacing)) && (
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
                     <p className="mt-2 text-xs text-slate-500">Estimated from width & row spacing. Adjust if needed.</p>
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
