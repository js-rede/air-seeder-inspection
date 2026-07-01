const REQUIRED_FIELDS = ["slug", "step_number", "section", "step_title", "answer_type"];

const VALID_RATINGS = new Set(["good", "maybe", "bad", "unknown"]);

export function validateSteps(steps) {
   if (!Array.isArray(steps)) {
      throw new Error("Inspection steps JSON must be an array.");
   }

   steps.forEach((step, index) => {
      const stepLabel = step.slug || `index ${index}`;

      REQUIRED_FIELDS.forEach((field) => {
         if (step[field] === undefined || step[field] === null || step[field] === "") {
            throw new Error(`Step "${stepLabel}" is missing required field: ${field}`);
         }
      });

      if (step.answer_type === "selection" || step.answer_type === "row_unit_distribution" || step.answer_type === "working_rank_selection" || step.answer_type === "multi_selection") {
         if (!Array.isArray(step.choices) || step.choices.length === 0) {
            throw new Error(`Step "${stepLabel}" with answer_type "${step.answer_type}" must include a non-empty choices array.`);
         }

         step.choices.forEach((choice, choiceIndex) => {
            if (!choice?.label) {
               throw new Error(`Step "${stepLabel}" choice ${choiceIndex + 1} is missing a label.`);
            }

            if (step.answer_type === "multi_selection") {
               return;
            }

            if (choice.rating && !VALID_RATINGS.has(choice.rating)) {
               throw new Error(
                  `Step "${stepLabel}" choice ${choiceIndex + 1} has invalid rating "${choice.rating}". Use: good, maybe, bad, unknown.`,
               );
            }

            if (!choice.recommended_action) {
               throw new Error(`Step "${stepLabel}" choice ${choiceIndex + 1} is missing recommended_action.`);
            }
         });
      }

      if (step.secondary_choices) {
         if (!Array.isArray(step.secondary_choices) || step.secondary_choices.length === 0) {
            throw new Error(`Step "${stepLabel}" secondary_choices must be a non-empty array when provided.`);
         }

         step.secondary_choices.forEach((choice, choiceIndex) => {
            if (!choice?.label) {
               throw new Error(`Step "${stepLabel}" secondary choice ${choiceIndex + 1} is missing a label.`);
            }
         });
      }
   });

   return steps;
}
