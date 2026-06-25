export const STORAGE_KEY = "airSeederInspectionDraft";

export function getSavedDraft() {
   try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
   } catch {
      return {};
   }
}

export function saveDraft(draft) {
   localStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
}
