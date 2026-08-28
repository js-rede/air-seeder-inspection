import {
   CART_RUN_COUNTS,
   CART_SHOOT_QUANTITIES,
   CART_TANK_COUNTS,
   CART_TANK_SIZES,
   DRILL_WIDTHS,
   ROW_SPACINGS,
   ROW_UNIT_SERIES_OPTIONS,
   WORKING_RANKS,
   getDefaultModelForManufacturer,
   requiresRowUnitSeries,
} from "../data/machineCatalog";
import { getSelectClass, selectStyle } from "../utils/selectClass";

function hasFieldError(invalidFields, fieldId) {
   return Boolean(invalidFields?.has?.(fieldId));
}

export function ManufacturerModelFields({
   idPrefix,
   values,
   manufacturers,
   models,
   onFieldChange,
   revealAll = false,
   invalidFields = null,
}) {
   const autoSelectedModel = getDefaultModelForManufacturer(models);
   const hideModelSelect = Boolean(values.manufacturer && autoSelectedModel);

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
               className={getSelectClass(hasFieldError(invalidFields, `${idPrefix}-manufacturer`))}
               style={selectStyle}
               aria-invalid={hasFieldError(invalidFields, `${idPrefix}-manufacturer`)}>
               <option value="">Select manufacturer…</option>
               {manufacturers.map((manufacturer) => (
                  <option key={manufacturer} value={manufacturer}>
                     {manufacturer}
                  </option>
               ))}
            </select>
         </div>

         {(revealAll || values.manufacturer) && !hideModelSelect && (
            <div>
               <label htmlFor={`${idPrefix}-model`} className="mb-2 block text-sm font-medium text-slate-700">
                  Model
               </label>
               <select
                  id={`${idPrefix}-model`}
                  value={values.model}
                  onChange={(e) => onFieldChange("model", e.target.value)}
                  className={getSelectClass(hasFieldError(invalidFields, `${idPrefix}-model`))}
                  style={selectStyle}
                  aria-invalid={hasFieldError(invalidFields, `${idPrefix}-model`)}>
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
                  className={getSelectClass(hasFieldError(invalidFields, `${idPrefix}-other-details`))}
                  aria-invalid={hasFieldError(invalidFields, `${idPrefix}-other-details`)}
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
   invalidFields = null,
}) {
   if (!revealAll && !values.model) return null;

   const showRowUnitSeries = requiresRowUnitSeries(values.model);
   const seriesError = hasFieldError(invalidFields, `${idPrefix}-row-unit-series`);

   return (
      <>
         {(revealAll || showRowUnitSeries) && showRowUnitSeries && (
            <div id={`${idPrefix}-row-unit-series`}>
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
                                 : seriesError
                                   ? "border-red-400 bg-red-50 hover:border-red-500"
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
                  className={getSelectClass(hasFieldError(invalidFields, `${idPrefix}-width`))}
                  style={selectStyle}
                  aria-invalid={hasFieldError(invalidFields, `${idPrefix}-width`)}>
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
                  className={getSelectClass(hasFieldError(invalidFields, `${idPrefix}-spacing`))}
                  style={selectStyle}
                  aria-invalid={hasFieldError(invalidFields, `${idPrefix}-spacing`)}>
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
                     className={getSelectClass(hasFieldError(invalidFields, `${idPrefix}-working-ranks`))}
                     style={selectStyle}
                     aria-invalid={hasFieldError(invalidFields, `${idPrefix}-working-ranks`)}>
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
                     className={getSelectClass(hasFieldError(invalidFields, `${idPrefix}-row-units`))}
                     style={selectStyle}
                     aria-invalid={hasFieldError(invalidFields, `${idPrefix}-row-units`)}>
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

export function CartDetailFields({ idPrefix, values, onFieldChange, revealAll = false, invalidFields = null }) {
   if (!revealAll && !values.model) return null;

   return (
      <div className="space-y-4">
         <div className="grid gap-4 sm:grid-cols-2">
            <div>
               <label htmlFor={`${idPrefix}-tank-count`} className="mb-2 block text-sm font-medium text-slate-700">
                  Number of tanks
               </label>
               <select
                  id={`${idPrefix}-tank-count`}
                  value={values.tankCount}
                  onChange={(e) => onFieldChange("tankCount", e.target.value)}
                  className={getSelectClass(hasFieldError(invalidFields, `${idPrefix}-tank-count`))}
                  style={selectStyle}
                  aria-invalid={hasFieldError(invalidFields, `${idPrefix}-tank-count`)}>
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
                  className={getSelectClass(hasFieldError(invalidFields, `${idPrefix}-tank-size`))}
                  style={selectStyle}
                  aria-invalid={hasFieldError(invalidFields, `${idPrefix}-tank-size`)}>
                  <option value="">Select tank size…</option>
                  {CART_TANK_SIZES.map((size) => (
                     <option key={size} value={size}>
                        {size}
                     </option>
                  ))}
               </select>
            </div>
         </div>

         {values.tankSize === "Other" && (
            <div>
               <label htmlFor={`${idPrefix}-tank-size-other`} className="mb-2 block text-sm font-medium text-slate-700">
                  Tank size (bushels)
               </label>
               <input
                  id={`${idPrefix}-tank-size-other`}
                  type="number"
                  inputMode="numeric"
                  min="1"
                  step="1"
                  value={values.tankSizeOther || ""}
                  onChange={(e) => onFieldChange("tankSizeOther", e.target.value)}
                  placeholder="Enter bushels"
                  className={getSelectClass(hasFieldError(invalidFields, `${idPrefix}-tank-size-other`))}
                  aria-invalid={hasFieldError(invalidFields, `${idPrefix}-tank-size-other`)}
               />
            </div>
         )}

         <div className="grid gap-4 sm:grid-cols-2">
            <div>
               <label htmlFor={`${idPrefix}-shoot-quantity`} className="mb-2 block text-sm font-medium text-slate-700">
                  Number of shoots
               </label>
               <select
                  id={`${idPrefix}-shoot-quantity`}
                  value={values.shootQuantity || ""}
                  onChange={(e) => onFieldChange("shootQuantity", e.target.value)}
                  className={getSelectClass(hasFieldError(invalidFields, `${idPrefix}-shoot-quantity`))}
                  style={selectStyle}
                  aria-invalid={hasFieldError(invalidFields, `${idPrefix}-shoot-quantity`)}>
                  <option value="">Select shoots…</option>
                  {CART_SHOOT_QUANTITIES.map((option) => (
                     <option key={option.value} value={option.value}>
                        {option.label}
                     </option>
                  ))}
               </select>
            </div>

            <div>
               <label htmlFor={`${idPrefix}-run-count`} className="mb-2 block text-sm font-medium text-slate-700">
                  Number of runs
               </label>
               <select
                  id={`${idPrefix}-run-count`}
                  value={values.runCount || ""}
                  onChange={(e) => onFieldChange("runCount", e.target.value)}
                  className={getSelectClass(hasFieldError(invalidFields, `${idPrefix}-run-count`))}
                  style={selectStyle}
                  aria-invalid={hasFieldError(invalidFields, `${idPrefix}-run-count`)}>
                  <option value="">Select runs…</option>
                  {CART_RUN_COUNTS.map((option) => (
                     <option key={option.value} value={option.value}>
                        {option.label}
                     </option>
                  ))}
               </select>
            </div>
         </div>
      </div>
   );
}
