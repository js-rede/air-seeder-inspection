import CountStepper from "./CountStepper";

function getQuantityLabels(quantityLabel = "row-units") {
   if (quantityLabel === "towers") {
      return { plural: "towers", singular: "tower" };
   }

   if (quantityLabel === "discs") {
      return { plural: "discs", singular: "disc" };
   }

   if (quantityLabel === "fans") {
      return { plural: "fans", singular: "fan" };
   }

   return { plural: "row-units", singular: "row-unit" };
}

function ReplacementTallyForm({ quantityCount, quantityLabel = "row-units", value, onChange, requireQuantity = true }) {
   const { plural, singular } = getQuantityLabels(quantityLabel);
   const numericCount =
      value === "" || value == null ? 0 : Math.max(0, Math.min(quantityCount, Number(value) || 0));

   function updateCount(nextValue) {
      if (nextValue === "") {
         onChange("0");
         return;
      }

      const parsed = Math.max(0, Math.min(quantityCount, Number(nextValue) || 0));
      onChange(String(parsed));
   }

   function incrementCount() {
      if (numericCount >= quantityCount) return;
      onChange(String(numericCount + 1));
   }

   function decrementCount() {
      onChange(String(Math.max(0, numericCount - 1)));
   }

   if (!quantityCount && requireQuantity) {
      return (
         <p className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-4 text-amber-900">
            Complete machine width and row spacing on the previous step to calculate {plural}.
         </p>
      );
   }

   return (
      <div className="mt-3 w-fit max-w-xs">
         <CountStepper
            value={numericCount}
            onChange={updateCount}
            onIncrement={incrementCount}
            onDecrement={decrementCount}
            canIncrement={numericCount < quantityCount}
            canDecrement={numericCount > 0}
            min={0}
            max={quantityCount}
            ariaLabel={`${singular}s needing replacement`}
         />
      </div>
   );
}

export default ReplacementTallyForm;
