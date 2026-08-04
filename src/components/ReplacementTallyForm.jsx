import { useEffect } from "react";
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

   if (quantityLabel === "arms") {
      return { plural: "arms", singular: "arm" };
   }

   return { plural: "row-units", singular: "row-unit" };
}

function isValidSingleTallyValue(value) {
   if (typeof value !== "string" && typeof value !== "number") return false;
   if (value === "") return false;
   return Number.isFinite(Number(value));
}

function isValidSidesTallyValue(value) {
   if (!value || typeof value !== "object" || Array.isArray(value)) return false;
   if (!("left" in value) || !("right" in value)) return false;
   return Number.isFinite(Number(value.left)) && Number.isFinite(Number(value.right));
}

function clampCount(value, quantityCount) {
   return Math.max(0, Math.min(quantityCount, Number(value) || 0));
}

function SideTallyField({ label, value, quantityCount, onChange, ariaLabel }) {
   const numericCount = clampCount(value, quantityCount);

   function updateCount(nextValue) {
      if (nextValue === "") {
         onChange(0);
         return;
      }
      onChange(clampCount(nextValue, quantityCount));
   }

   return (
      <div className="flex items-center gap-3">
         <div className="min-w-[44px] text-sm font-medium text-slate-700">{label}</div>
         <CountStepper
            value={numericCount}
            onChange={updateCount}
            onIncrement={() => {
               if (numericCount >= quantityCount) return;
               onChange(numericCount + 1);
            }}
            onDecrement={() => onChange(Math.max(0, numericCount - 1))}
            canIncrement={numericCount < quantityCount}
            canDecrement={numericCount > 0}
            min={0}
            max={quantityCount}
            ariaLabel={ariaLabel}
         />
      </div>
   );
}

function ReplacementTallyForm({
   quantityCount,
   quantityLabel = "row-units",
   value,
   onChange,
   requireQuantity = true,
   tallySides = false,
}) {
   const { plural, singular } = getQuantityLabels(quantityLabel);

   useEffect(() => {
      if (!quantityCount && requireQuantity) return;

      if (tallySides) {
         if (isValidSidesTallyValue(value)) return;

         if (isValidSingleTallyValue(value)) {
            onChange({ left: String(clampCount(value, quantityCount)), right: "0" });
            return;
         }

         onChange({ left: "0", right: "0" });
         return;
      }

      if (isValidSingleTallyValue(value)) return;
      onChange("0");
   }, [quantityCount, requireQuantity, value, onChange, tallySides]);

   if (!quantityCount && requireQuantity) {
      return (
         <p className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-4 text-amber-900">
            Complete machine width and row spacing on the previous step to calculate {plural}.
         </p>
      );
   }

   if (tallySides) {
      const left = value && typeof value === "object" ? value.left : 0;
      const right = value && typeof value === "object" ? value.right : 0;

      function updateSide(side, nextCount) {
         const current =
            value && typeof value === "object" && ("left" in value || "right" in value) ? value : { left: "0", right: "0" };
         onChange({
            left: String(side === "left" ? nextCount : clampCount(current.left, quantityCount)),
            right: String(side === "right" ? nextCount : clampCount(current.right, quantityCount)),
         });
      }

      return (
         <div className="mt-3 flex w-fit flex-col gap-4">
            <SideTallyField
               label="Left"
               value={left}
               quantityCount={quantityCount}
               onChange={(next) => updateSide("left", next)}
               ariaLabel={`Left ${singular}s needing replacement`}
            />
            <SideTallyField
               label="Right"
               value={right}
               quantityCount={quantityCount}
               onChange={(next) => updateSide("right", next)}
               ariaLabel={`Right ${singular}s needing replacement`}
            />
         </div>
      );
   }

   const numericCount = clampCount(value === "" || value == null ? 0 : value, quantityCount);

   function updateCount(nextValue) {
      if (nextValue === "") {
         onChange("0");
         return;
      }
      onChange(String(clampCount(nextValue, quantityCount)));
   }

   return (
      <div className="mt-3 w-fit max-w-xs">
         <CountStepper
            value={numericCount}
            onChange={updateCount}
            onIncrement={() => {
               if (numericCount >= quantityCount) return;
               onChange(String(numericCount + 1));
            }}
            onDecrement={() => onChange(String(Math.max(0, numericCount - 1)))}
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
