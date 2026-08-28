/**
 * Per-step dev-note content: possible parts (from spreadsheet extract), leadership questions, assumptions.
 * Costs come from inspection-steps.json until part rules are wired for each section.
 */

/** @type {Record<string, object>} */
export const PRICING_DEV_NOTE_CONFIGS = {
   "main-arm-pivot": {
      possibleParts: [
         { name: "MOA Kit", note: "Spreadsheet BA59 — likely AG-K04" },
         { name: "Rotate Pins", note: "Spreadsheet BA60" },
         { name: "OEM pivot kits", note: "Confirm QBO SKU" },
         { name: "Red E pivot", note: "Confirm QBO SKU" },
      ],
      openQuestions: [
         "Default online SKU — Is AG-K04 the MOA / main arm pivot kit you usually install on 1890-class drills?",
         "MOA vs bushings-only — Is the pivot quote always a full kit, or sometimes rotate pins only?",
         "Machine rules — ProSeries / 50-series / PD500 — different SKUs like closing (AG-K39, AG-K01-5060, etc.)?",
         "Labor — Still $55/row-unit on top of parts?",
      ],
      assumptions: ["Part rules not wired yet — estimate uses flat band from inspection-steps.json."],
      ratingLabel: "MAYBE/BAD",
      costMode: "per_row_unit",
   },
   "cutting-discs": {
      possibleParts: [
         { sku: "RE6000", price: "$49.00", note: "18\" JD Ingersoll Hi-Hard — default JD 60/90" },
         { sku: "RE4930", price: "$49.00", note: "18\" Niaux 200 — alt for JD 50/60/90 & ProSeries" },
         { sku: "RE4931RZR", price: "$55.00", note: "18-5/8\" Niaux — ProSeries seed row" },
         { sku: "RE6001RZR", price: "$53.00", note: "18-5/8\" JD Ingersoll Hi-Hard" },
         { sku: "RE6002RZR", price: "$53.00", note: "PD500-class" },
         { sku: "RE6003RZR", price: "$53.00", note: "Amity / Concord" },
         { sku: "RE6004", price: "$55.00", note: "Bourgault 20-1/2\"" },
         { sku: "RE4926", price: "$59.00", note: "19\" notched 30-pointer" },
         { sku: "RE6080", price: "$70.00", note: "Horsch Avatar" },
      ],
      openQuestions: [
         "Default for JD 60/90: RE6000 (Ingersoll Hi-Hard) or RE4930 (Niaux 200)? Both are $49.",
         "When should we quote notched RE4926 ($59) vs smooth hi-hard?",
         "Labor — Still $30/row-unit on top of parts?",
      ],
      assumptions: ["Wired: machine setup selects disc SKU; diameter rating controls qty only."],
      ratingLabel: "MAYBE/BAD",
      costMode: "per_row_unit",
      quantityLabel: "discs",
      partRulesStatus: "wired",
   },
   "disc-hubs": {
      possibleParts: [
         { sku: "AG-K15", price: "$20.00", note: "Seal + wear ring only — JD 1890/1895" },
         { sku: "AG-K15-FULL", price: "$79.50", note: "Full rebuild — JD default when BAD" },
         { sku: "SDX-K08-SM", price: "$95.35", note: "Case IH SDX — Small" },
         { sku: "SDX-K08-MD", price: "$139.85", note: "Case IH SDX — Medium" },
         { sku: "SDX-K08-LG", price: "$107.85", note: "Case IH SDX — Large" },
      ],
      openQuestions: [
         "BAD hubs: always AG-K15-FULL ($79.50), or sometimes seal-only AG-K15 ($20)?",
         "Case SDX: is a price range OK (variations are SM, MD, LG)? Range is from $95.35–$139.85.",
         "Do 1860/1990 use the same AG-K15 kits as 1890/1895?",
         "Labor — Still $120/row-unit on top of parts?",
      ],
      assumptions: [
         "Wired: JD → AG-K15-FULL; Case SDX → $95.35–$139.85 parts range (size is serial/spindle, not model).",
         "AG2532 install tool excluded from online estimate.",
      ],
      ratingLabel: "BAD",
      costMode: "per_row_unit",
      quantityLabel: "discs",
      partRulesStatus: "wired",
   },
   "press-wheel-pivot": {
      possibleParts: [
         { sku: "AG-K37", price: "$46.01", note: "60/90 greaseless — default Red E press pivot" },
         { sku: "AG-K40", price: "$44.87", note: "ProSeries press pivot" },
         { sku: "AG-K23-50", price: "$44.85", note: "50 series greaseless — default Red E" },
         { sku: "AG-K02-50", price: "$77.87", note: "50 series HD — spreadsheet BA131" },
         { sku: "NA-K08-FULL", price: "$41.60", note: "Needham 60/90 press — spreadsheet BA132" },
         { sku: "NA-K08-50", price: "$53.50", note: "Needham 50 series press" },
      ],
      openQuestions: [
         "Confirm BA130 / BA131 / BA132 → AG-K37 / AG-K02-50 / NA-K08-FULL mapping?",
         "50 series default: greaseless AG-K23-50 ($44.85) or HD AG-K02-50 ($77.87)?",
         "PD500 / Case IH / other brands — press pivot SKU?",
         "Labor — Still $70/row-unit on top of parts?",
      ],
      assumptions: [
         "Wired: JD greaseless defaults — AG-K37 (60/90), AG-K23-50 (50), AG-K40 (ProSeries).",
         "Press pivot SKUs are separate from closing pivot (AG-K37 vs AG-K36).",
      ],
      ratingLabel: "MAYBE/BAD",
      costMode: "per_row_unit",
      partRulesStatus: "wired",
   },
   "press-wheel-arm": {
      possibleParts: [
         { sku: "AG1030", price: "$30.00", note: "Firming wheel arm — JD 60/90 series" },
         { sku: "AG1142", price: "$30.00", note: "Firming wheel arm — JD 50 series" },
      ],
      openQuestions: [
         "ProSeries on 1890 — AG1030 or different SKU?",
         "Labor — Still $10/arm on top of parts?",
         "Firming arms for Case IH, Bourgault, etc. — which SKUs?",
      ],
      assumptions: [
         "Wired: AG1030 (60/90), AG1142 (50 series); parts × tallied arm count.",
         "Separate from closing wheel arms (AG-K19 @ $86–$272).",
      ],
      ratingLabel: "Each tallied arm",
      costMode: "per_tally",
      quantityLabel: "arms",
      partRulesStatus: "wired",
   },
   "press-wheel-spring": {
      possibleParts: [
         { sku: "AG1076L / AG1076R", price: "$24.00", note: "HD square wire (L/R) — spreadsheet BA141" },
         { sku: "AG2658L / AG2658R", price: "$14.50", note: "Standard OEM round wire replacement (L/R) — BA142" },
      ],
      openQuestions: [
         "50 series / ProSeries press spring SKUs?",
         "Labor — Still $7/row-unit on top of parts?",
      ],
      assumptions: [
         "Wired: Current setup picks HD (AG1076) vs round wire (AG2658); defaults to HD.",
         "Separate from closing springs (AG-K14 / CWS-90).",
      ],
      ratingLabel: "MAYBE/BAD",
      costMode: "per_row_unit",
      partRulesStatus: "wired",
   },
   "press-wheel": {
      possibleParts: [
         { sku: "NA-K01", price: "$50.00", note: "Needham V8 — with hardware (app default)" },
         { sku: "V8-WHEEL", price: "$43.05", note: "Needham V8 — no hardware" },
         { sku: "NA-K01-V8-WHEEL", price: "$43.05–$50.00", note: "Catalog variant listing" },
      ],
      openQuestions: ["Is NA-K01 the only thing needed here?"],
      assumptions: [
         "Wired: NA-K01 (with hardware) default for all drills with machine setup.",
         "Used OEM (BA154) and Seed Lock excluded from online estimate.",
      ],
      ratingLabel: "MAYBE/BAD",
      costMode: "per_row_unit",
      partRulesStatus: "wired",
   },
   "depth-adjustment-pivot": {
      possibleParts: [
         { sku: "AG-K03", price: "$135.24", note: "Red E HD depth arm pivot — JD 60/90/ProSeries (BA180)" },
         { sku: "AA050DA / AA051DA", price: "$195.00", note: "Aricks handle kit — alternate BA181; may be Step 16" },
         { sku: "BA195", price: "TBD", note: "Depth Adjuster Slop Fix (K32)" },
      ],
      openQuestions: [
         "Are AA05* Aricks kits Step 16 (cover/handle) or an alternate for Step 14 (BA181)?",
         "Depth Adjuster Slop Fix (BA195 / K32) — separate SKU for this step?",
         "Labor — Still $65/row-unit on top of parts?",
      ],
      assumptions: [
         "Wired: AG-K03 (BA180) default for John Deere; Step 15 depth arm is a different kit.",
         "AA05* Aricks kits not auto-selected — Woo title says handle kit.",
      ],
      ratingLabel: "MAYBE/BAD",
      costMode: "per_row_unit",
      partRulesStatus: "wired",
   },
   "depth-arm": {
      possibleParts: [
         { sku: "AG-K08", price: "$88.80", note: "Universal Depth Adjuster Arm Kit — BA194 / K08" },
         { sku: "RE3040L / RE3040R", price: "$225.00", note: "Case IH SDX depth adjuster arm" },
      ],
      openQuestions: [
         "Confirm AG-K08 is the depth arm when shaft spins freely in arm?",
         "Case SDX: RE3040 vs AG-K08?",
         "Labor — Still $25/arm (or row-unit) on top of parts?",
      ],
      assumptions: [
         "Wired: AG-K08 (JD), RE3040 (Case SDX); BAD rank or optional arm count × parts.",
         "AG-K03 is Step 14 pivot kit — not this step.",
      ],
      ratingLabel: "BAD (or replacement count)",
      costMode: "per_row_unit",
      quantityLabel: "arms",
      partRulesStatus: "wired",
   },
   "depth-cover-handle": {
      possibleParts: [
         { sku: "AG-K10HD", price: "$49.00", note: "Red E handle + cover kit — default (BA193)" },
         { sku: "AA120F", price: "$42.99", note: "Aricks cover plate — sold separately" },
         { sku: "AA710HD", price: "$42.99", note: "Aricks T handle — sold separately" },
      ],
      openQuestions: [
         "Default AG-K10HD combined kit ($49), or Aricks AA120F + AA710HD ($85.98) when both needed?",
         "Labor — Still $15/row-unit on top of parts?",
      ],
      assumptions: [
         "Wired: AG-K10HD default for John Deere 60/90.",
         "AA05* Aricks kits ($195) are Step 14 pivot — different product.",
      ],
      ratingLabel: "MAYBE/BAD",
      costMode: "per_row_unit",
      partRulesStatus: "wired",
   },
   "gauge-wheel": {
      possibleParts: [
         { sku: "RE6019R", price: "$90.00", note: "Steel/steel 3\" rubber" },
         { sku: "RE6019U", price: "$135.00", note: "Steel/steel 3\" urethane" },
         { sku: "RE6023R", price: "$95.00", note: "Steel/steel 4.5\" rubber" },
         { sku: "RE6005R", price: "$110.00", note: "Spoked 3/8\" lip 3\"" },
         { sku: "RE6007R", price: "$135.00", note: "Spoked 3/8\" lip 4.5\"" },
         { sku: "RE6032R", price: "$135.00", note: "HD spoked 3\" rubber — default" },
         { sku: "RE6032U", price: "$165.00", note: "HD spoked 3\" urethane" },
         { sku: "RE6033R", price: "$135.00", note: "HD spoked 4.5\" rubber" },
         { sku: "RE6034R", price: "$295.00", note: "18\" spoked — double-shoot Case/NH" },
      ],
      openQuestions: [
         "Steel/steel 4.5\" urethane — no SKU found; use RE6032U or price range?",
         "Labor — Still $30/row-unit on top of parts?",
      ],
      assumptions: [
         "Wired: follow-up answers pick SKU; default RE6032R until answered.",
         "Bearings/arms in step copy not separate line items yet.",
      ],
      ratingLabel: "MAYBE/BAD",
      costMode: "per_row_unit",
      partRulesStatus: "wired",
   },
   "seed-boot-pivot": {
      possibleParts: [
         { sku: "NA90HDW", price: "$17.00", note: "Pivot kit — hidden/OOS, excluded" },
      ],
      openQuestions: ["OEM / drill bushings pivot — any SKU besides dead NA90HDW?"],
      assumptions: [
         "No catalog override — step JSON band ($15–50 parts + $40 labor).",
         "AG-K07-ST stabilizers removed from this step.",
      ],
      ratingLabel: "MAYBE/BAD",
      costMode: "per_row_unit",
      partRulesStatus: "none",
   },
   "seed-boot": {
      possibleParts: [
         { sku: "AG2657L", price: "$110.00", note: "Red E ext wear — default" },
         { sku: "AG1059L", price: "$135.95", note: "OEM ext wear" },
      ],
      openQuestions: ["Left vs right boot per row-unit?"],
      assumptions: [
         "Current setup picks SKU; default AG2657L until answered.",
         "One boot per row-unit.",
      ],
      ratingLabel: "MAYBE/BAD",
      costMode: "per_row_unit",
      partRulesStatus: "wired",
   },
   "seed-boot-springs": {
      possibleParts: [{ sku: "AG2631", price: "$6.00", note: "HD ext-wear boot spring" }],
      openQuestions: [],
      assumptions: ["AG2631 default per row-unit (+ $35 labor)."],
      ratingLabel: "MAYBE/BAD",
      costMode: "per_row_unit",
      partRulesStatus: "wired",
   },
   "seed-tabs": {
      possibleParts: [
         { sku: "AG-K05-STD", price: "$5.50", note: "Red E w/ hardware — JD default" },
         { sku: "AG-K05-PRO", price: "$7.00", note: "Narrow ProSeries w/ hardware" },
         { sku: "RE3004", price: "$5.00", note: "Case SDX" },
         { sku: "AG-K05-FIN-LH", price: "$11.79", note: "Bonilla w/ hardware — not auto-selected" },
         { sku: "AG1057", price: "$5.00", note: "Red E tab only" },
      ],
      openQuestions: [
         "Bonilla vs Red E — need Current setup question?",
         "Tab only vs with hardware?",
         "Left vs right per row-unit?",
      ],
      assumptions: [
         "Wired: machine setup picks SKU; default AG-K05-STD.",
         "One tab per row-unit.",
      ],
      ratingLabel: "MAYBE/BAD",
      costMode: "per_row_unit",
      partRulesStatus: "wired",
   },
   hoses: {
      possibleParts: [
         { sku: "AG2091EXT", price: "$280.00", note: "1″ ext-wear — 100' roll (confirm)" },
         { sku: "AG2554EXT", price: "$395.00", note: "1-1/2\" ext-wear" },
         { sku: "AG2556EXT", price: "$440.00", note: "2\" ext-wear" },
         { sku: "AG2093EXT", price: "$965.00", note: "2-1/2\" ext-wear" },
         { sku: "SSH033", price: "$2.25", note: "SS clamp — not in estimate yet" },
      ],
      openQuestions: [
         "Confirm 100' roll length?",
         "Full drill rehose — roll count by width/ranks?",
         "Partial vs full rehose pricing?",
         "Include hose clamps?",
      ],
      assumptions: [
         "Flat drill-level band from inspection-steps.json — not × row-units.",
         "Roll × SKU math not wired; BA262 is manual in spreadsheet.",
      ],
      ratingLabel: "MAYBE/BAD",
      costMode: "flat",
      partRulesStatus: "catalog_only",
   },
   towers: {
      possibleParts: [
         { sku: "JDMANKIT-7", price: "$249.00", note: "7-port manifold" },
         { sku: "JDMANKIT-8", price: "$249.00", note: "8-port — default" },
         { sku: "JDMANKIT-9", price: "$256.00", note: "9-port manifold" },
         { sku: "JDMANKIT-10", price: "$266.00", note: "10-port manifold" },
         { sku: "JAS0915", price: "$170.00", note: "J-tube — confirm vs manifold" },
      ],
      openQuestions: [
         "Is this step asking to replace the whole manifold (JDMANKIT) or just J-tubes (JAS0915)? That changes whether $249–266 or $170–200 is the right parts price.",
         "Ports 4–6 and 11–12 — catalog SKU?",
      ],
      assumptions: [
         "Wired: port count → JDMANKIT; tally × (parts + $75 labor).",
         "Ports without SKU default to JDMANKIT-8.",
      ],
      ratingLabel: "Each tallied tower",
      costMode: "per_tally",
      quantityLabel: "towers",
      partRulesStatus: "wired",
   },
   "blockage-system": {
      possibleParts: [
         { sku: "n/a", price: null, note: "Intelligent Ag / Precision Planting" },
         { sku: "n/a", price: null, note: "J.Assy wireless clamp-on" },
      ],
      openQuestions: [
         "What are the real prices for fix, replace, and new install (Intelligent Ag vs J.Assy)?",
         "What impacts price — row count, drill width, brand, partial vs full system?",
         "How should the app calculate blockage pricing — flat band, per row-unit, SKU list, or sales follow-up only?",
         "Are guessed fix ($800–3,000) and replace ($10,000–15,000) bands right?",
      ],
      assumptions: [
         "Placeholder bands only — guessed in inspection-steps.json, not from catalog.",
         "Not installed + interest → $0 + sales follow-up only (confirmed — no install quote).",
         "Tertiary brand captured but does not change estimate.",
      ],
      ratingLabel: "MAYBE/BAD/Not installed",
      costMode: "flat",
      partRulesStatus: "none",
   },
   "other-sfp-row-unit-parts": {
      possibleParts: [
         { sku: "AG2622", price: "$35.00", note: "Bumper stops" },
         { sku: "AG-K29", price: "$34.89", note: "SS liquid — tube rebuild kit" },
         { sku: "AG2620", price: "$179.62", note: "SS dry fertilizer tube" },
         { sku: "SFP CRUISER", price: "$159.50", note: "SFP cruiser spiked wheel" },
         { sku: "n/a", price: null, note: "NH3 tubes + springs" },
      ],
      openQuestions: [
         "Not sure how to calculate SFP row-unit parts — is checkbox × full row-unit count the right model?",
         "Is one multi-select step (all items on one page) the best UX, or split into separate steps?",
         "Should the user enter how many need replacing per item, instead of assuming every row-unit?",
         "SFP springs / SS NH3 tubes — catalog SKUs? SFP CRUISER vs AG1254? Dry tube one per row-unit or L+R?",
      ],
      assumptions: [
         "Wired: mapped checkboxes use catalog; springs/NH3 keep step JSON band.",
         "Each selected item × full row-unit count + $5 labor/item — no per-item quantity input today.",
      ],
      ratingLabel: "Each selected item",
      costMode: "multi_select",
      quantityLabel: "row-units",
      partRulesStatus: "partial",
   },
   "air-cart": {
      possibleParts: [
         { sku: "SSK-SS4", price: "$1,111.83", note: "Single-shoot lower — 4 runs" },
         { sku: "SSK-SS6", price: "$1,098.73", note: "Single-shoot lower — 6 runs" },
         { sku: "SSK-SS8", price: "$1,057.83", note: "Single-shoot lower — 8 runs" },
         { sku: "SSK-DS4", price: "$1,567.34", note: "Double-shoot lower — 4 runs" },
         { sku: "SSK-DS6", price: "$1,604.03", note: "Double-shoot lower — 6 runs" },
         { sku: "SSK-DS8", price: "$1,628.11", note: "Double-shoot lower — 8 runs" },
         { sku: "RE3680", price: "$1,750.00", note: "Red E single-shoot alternate" },
         { sku: "JAS1037A", price: "$1,750.24", note: "Hopper/cradle — confirm vs kit" },
         { sku: "JAS1032W", price: "$533.32", note: "Intermediate manifold component" },
         { sku: "9-0032-0A", price: "$1,712.24", note: "Meter — OEM SS 8 run" },
         { sku: "SSK-MH-GD-RO", price: "$4,212.08", note: "Meter — Romafa ground drive" },
         { sku: "SSK-MH-GD-KP", price: "$4,195.00", note: "Meter — Kanpar ground drive" },
         { sku: "JAS0006A", price: "$4,697.37", note: "Meter — Romafa Section Command" },
         { sku: "SSK-UPR", price: "$1,824.73", note: "Upper — all other JD models" },
         { sku: "SSK-UPR-NEW", price: "$1,824.73", note: "Upper — 550-middle & related" },
         { sku: "JAS4799A", price: "$1,007.00", note: "Lid — 1900/1910 frame" },
         { sku: "JAS0163W", price: "$737.36", note: "Ladder — 200 bu" },
         { sku: "JAS0164K", price: "$397.25", note: "Top ladder & lid mount kit" },
      ],
      openQuestions: [
         "Meter housing — which SKU per Current setup? Too many options to auto-pick.",
         "Lower: shoot + runs pick SSK-SS/DS — RE3680 vs SSK default?",
         "Run count for 6 vs 8 run meter housings?",
         "Per-tank × component vs one cart-level estimate?",
      ],
      assumptions: [
         "Lower from shoot + runs; meter needs leadership usual-SKU mapping.",
         "Section selection per tank; estimate still from inspection-steps.json bands.",
      ],
      ratingLabel: "Per tank component",
      costMode: "section",
      partRulesStatus: "catalog_only",
   },
   "air-cart-couplers": {
      possibleParts: [
         { sku: "QCSS32.5", price: "$294.60", note: '3" coupler only' },
         { sku: "SSK-CPLR-3P", price: "$322.20", note: '3" coupler w/ hardware' },
         { sku: "QCSS-2-3", price: "$307.48", note: "2-port kit — 3\"" },
         { sku: "QCSS22.5", price: "$248.43", note: "2-port kit — 2.5\" coupler only" },
         { sku: "SSK-CPLR-2P", price: "$309.03", note: "2-port kit — 2.5\" w/ hardware" },
      ],
      openQuestions: [
         "Default coupler SKU — 3\" w/ hardware, coupler only, or 2-port kit?",
         "2.5\" vs 3\" — how does the app decide?",
         "Flat cart band vs coupler count × SKU?",
      ],
      assumptions: [
         "Flat step cost from inspection-steps.json; catalog for reference only.",
         "Grouped in dev notes: 3\", 2-port 3\", 2-port 2.5\".",
      ],
      ratingLabel: "MAYBE/BAD",
      costMode: "flat",
      partRulesStatus: "catalog_only",
   },
   "air-cart-hoses": {
      possibleParts: [
         { sku: "AG2093EXT", price: "$965.00", note: "2-1/2\" ext-wear — common cart size?" },
         { sku: "AG2556EXT", price: "$440.00", note: "2\" ext-wear" },
         { sku: "SSH033", price: "$2.25", note: "SS clamp — not in estimate yet" },
      ],
      openQuestions: [
         "Full cart rehose — typical roll count by cart size or other factors?",
         "Which hose diameter(s) on this cart — 2\", 2-1/2\", mix?",
         "Partial wear (MAYBE) vs full cart rehose (BAD) — different roll count?",
         "Include hose clamps?",
      ],
      assumptions: [
         "Flat cart-level band from inspection-steps.json.",
         "Roll × SKU math not wired.",
      ],
      ratingLabel: "MAYBE/BAD",
      costMode: "flat",
      partRulesStatus: "catalog_only",
   },
   "air-cart-auger-conveyor": {
      possibleParts: [{ sku: "n/a", price: null, note: "Placeholder $9,000–15,000 when secondary Yes" }],
      openQuestions: [
         "Auger vs conveyor — any particular SKUs and prices?",
         "Is $9,000–$15,000 the right placeholder band?",
      ],
      assumptions: ["Placeholder estimate on secondary Yes — no catalog wired yet."],
      ratingLabel: "Secondary Yes",
      costMode: "flat",
   },
};
