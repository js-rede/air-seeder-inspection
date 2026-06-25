function formatInches(inches) {
   return `${Number(inches.toFixed(2))} inches`;
}

export const DISC_DIAMETER_OPTIONS = (() => {
   const options = ["18+ inches"];

   for (let quarters = 71; quarters >= 60; quarters -= 1) {
      options.push(formatInches(quarters / 4));
   }

   options.push("less than 15 inches");
   return options;
})();

export function isDiscDiameterStep(step) {
   const title = step?.step_title || "";
   return step?.answer_type === "measurement" && title.toLowerCase().includes("disc");
}

export function getAnswerType(step) {
   if (isDiscDiameterStep(step)) {
      return "disc_diameter";
   }

   return step?.answer_type;
}
