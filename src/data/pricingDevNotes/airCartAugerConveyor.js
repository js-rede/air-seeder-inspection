/**
 * Dev notes for air cart auger / conveyor step (placeholder estimate on secondary Yes).
 */

export function getAirCartAugerConveyorPricingDevNotes(step) {
   const secondaryYes = step?.secondary_choices?.find((choice) => choice.value === "yes");

   return {
      howAppCalculates: [
         {
            text: "Secondary Yes (auger or conveyor needs replacing) → $9,000–$15,000 placeholder estimate for now.",
            subItems: [
               "No catalog SKU wired — flat band from inspection-steps.json when user answers Yes on the follow-up.",
               "Primary choice (Auger / Conveyor / Neither) routes the question only; cost applies on secondary Yes.",
               "Neither, or secondary No → $0.",
            ],
         },
         secondaryYes
            ? `Step JSON band: $${Number(secondaryYes.estimated_low_cost).toLocaleString()}–$${Number(secondaryYes.estimated_high_cost).toLocaleString()} (parts; $${secondaryYes.labor_cost ?? 0} labor).`
            : "GOOD / No → $0.",
      ],
      possibleSkus: [
         {
            sku: "n/a",
            price: null,
            note: "Auger or conveyor replacement — placeholder $9,000–15,000",
            group: "Placeholder",
         },
      ],
      assumptions: [
         "Placeholder estimate only — no QBO SKU or part rules yet.",
         "Same band for auger and conveyor until leadership splits pricing.",
      ],
      openQuestions: [
         "Auger vs conveyor — any particular SKUs and prices?",
         "Is $9,000–$15,000 the right placeholder band?",
         "Should primary choice (auger/conveyor) drive part lookup when catalog is wired?",
      ],
      selectedPart: null,
   };
}
