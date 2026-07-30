function getRootEl() {
   return document.getElementById("air-seeder-inspection-root");
}

/** Resolve steps JSON URL at call time (not module load), so the mount div exists. */
export function getStepsUrl() {
   const fromWindow = typeof window !== "undefined" ? window.ASI_STEPS_URL : "";
   if (fromWindow) return fromWindow;

   const fromDataset = getRootEl()?.dataset?.stepsUrl;
   if (fromDataset) return fromDataset;

   // Derive from the loaded app.js path: .../dist/assets/app.js → .../dist/data/inspection-steps.json
   const script = document.querySelector('script[src*="assets/app.js"]');
   if (script?.src) {
      return script.src.replace(/assets\/app\.js.*$/i, "data/inspection-steps.json");
   }

   return "/data/inspection-steps.json";
}

export function getSendReportUrl() {
   const fromWindow = typeof window !== "undefined" ? window.ASI_SEND_REPORT_URL : "";
   if (fromWindow) return fromWindow;

   const fromDataset = getRootEl()?.dataset?.sendReportUrl;
   if (fromDataset) return fromDataset;

   return "/wp-json/air-seeder-inspection/v1/send-report";
}

export function getRequestFollowUpUrl() {
   const fromWindow = typeof window !== "undefined" ? window.ASI_REQUEST_FOLLOW_UP_URL : "";
   if (fromWindow) return fromWindow;

   const fromDataset = getRootEl()?.dataset?.requestFollowUpUrl;
   if (fromDataset) return fromDataset;

   return "/wp-json/air-seeder-inspection/v1/request-follow-up";
}

/** @deprecated Prefer getStepsUrl() — kept for any leftover imports. */
export const STEPS_URL = "/data/inspection-steps.json";
