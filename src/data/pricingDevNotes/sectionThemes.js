/** Accent colors for pricing dev notes panels, keyed by inspection step section. */

const DEFAULT_THEME = {
   panel: "border-amber-400 bg-amber-50/80",
   badge: "bg-amber-200 text-amber-950",
   selectedRow: "bg-amber-100/80",
   selectedLabel: "text-amber-900",
};

/** @type {Record<string, typeof DEFAULT_THEME>} */
export const PRICING_DEV_NOTE_SECTION_THEMES = {
   main_arm: {
      panel: "border-slate-400 bg-slate-50/80",
      badge: "bg-slate-200 text-slate-950",
      selectedRow: "bg-slate-100/80",
      selectedLabel: "text-slate-900",
   },
   openers: {
      panel: "border-orange-400 bg-orange-50/80",
      badge: "bg-orange-200 text-orange-950",
      selectedRow: "bg-orange-100/80",
      selectedLabel: "text-orange-900",
   },
   closing_system: {
      panel: "border-amber-400 bg-amber-50/80",
      badge: "bg-amber-200 text-amber-950",
      selectedRow: "bg-amber-100/80",
      selectedLabel: "text-amber-900",
   },
   press_wheels: {
      panel: "border-violet-400 bg-violet-50/80",
      badge: "bg-violet-200 text-violet-950",
      selectedRow: "bg-violet-100/80",
      selectedLabel: "text-violet-900",
   },
   depth_control: {
      panel: "border-sky-400 bg-sky-50/80",
      badge: "bg-sky-200 text-sky-950",
      selectedRow: "bg-sky-100/80",
      selectedLabel: "text-sky-900",
   },
   gauge_wheels: {
      panel: "border-teal-400 bg-teal-50/80",
      badge: "bg-teal-200 text-teal-950",
      selectedRow: "bg-teal-100/80",
      selectedLabel: "text-teal-900",
   },
   seed_boots: {
      panel: "border-emerald-400 bg-emerald-50/80",
      badge: "bg-emerald-200 text-emerald-950",
      selectedRow: "bg-emerald-100/80",
      selectedLabel: "text-emerald-900",
   },
   drill: {
      panel: "border-indigo-400 bg-indigo-50/80",
      badge: "bg-indigo-200 text-indigo-950",
      selectedRow: "bg-indigo-100/80",
      selectedLabel: "text-indigo-900",
   },
   "seed fertilizer placement rank": {
      panel: "border-red-200 bg-red-50/60",
      badge: "bg-red-100 text-red-900",
      selectedRow: "bg-red-50/80",
      selectedLabel: "text-red-800",
   },
   air_cart: {
      panel: "border-fuchsia-400 bg-fuchsia-50/80",
      badge: "bg-fuchsia-200 text-fuchsia-950",
      selectedRow: "bg-fuchsia-100/80",
      selectedLabel: "text-fuchsia-900",
   },
};

export function getPricingDevNoteSectionTheme(section) {
   return PRICING_DEV_NOTE_SECTION_THEMES[section] ?? DEFAULT_THEME;
}
