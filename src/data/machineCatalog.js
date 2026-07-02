export const MACHINE_CHOICES = [
   {
      value: "air_seeder",
      label: "Air Seeder",
      description: "Drill & Air Cart Setup",
      equipmentType: "air_seeder",
      component: "both",
   },
   { value: "planter", label: "Planter", description: "Row-Crop Planter Setup", equipmentType: "planter", component: "" },
];

export const EQUIPMENT_TYPES = [
   { value: "air_seeder", label: "Air Seeder" },
   { value: "planter", label: "Planter" },
];

export const AIR_SEEDER_COMPONENTS = [
   { value: "drill", label: "Drill" },
   { value: "cart", label: "Air Cart" },
];

export const DRILL_WIDTHS = [
   "27 ft",
   "30 ft",
   "36 ft",
   "40 ft",
   "42 ft",
   "42.5 ft",
   "44 ft",
   "50 ft",
   "56 ft",
   "60 ft",
   "70 ft",
   "80 ft",
   "90 ft",
];

export const ROW_SPACINGS = ["7.5 in", "10 in", "12 in", "12.5 in", "15 in", "20 in"];

export const WORKING_RANKS = [
   { value: "1", label: "1 rank" },
   { value: "2", label: "2 ranks" },
   { value: "3", label: "3 ranks" },
   { value: "4", label: "4 ranks" },
];

export const CART_TANK_COUNTS = [
   { value: "1", label: "1 tank" },
   { value: "2", label: "2 tanks" },
   { value: "3", label: "3 tanks" },
];

export const MAX_CART_TANK_COUNT = 3;

export const CART_TANK_TEMPLATE_SLUG = "air-cart";

const CART_LID_LADDER_CHOICES = [
   {
      label: "Good condition",
      value: "good",
      rating: "good",
      recommended_action: "Component is in good condition.",
      estimated_low_cost: 0,
      estimated_high_cost: 0,
   },
   {
      label: "Needs replacing",
      value: "needs-replacing",
      rating: "bad",
      recommended_action: "Plan to replace this component before operating.",
      estimated_low_cost: 250,
      estimated_high_cost: 2500,
   },
];

export const CART_TANK_STEP_LAYOUTS = {
   1: [
      {
         position: null,
         slug: "air-cart-tank",
         step_title: "Front Tank Inspection",
         question: "Rate each component on the front tank.",
         instructions:
            "Starting at the front of your machine, inspect the first tank on your air cart for wear, damage, or operational issues.",
         tank_label: "Front Tank",
         tank_index: 1,
         run_sections: {
            hoses: "Inspect hoses running from the front of the cart to the front tank.",
            tubes: "Inspect stainless steel tubes running from the front of the cart to the front tank.",
         },
      },
   ],
   2: [
      {
         position: "front",
         slug: "air-cart-front-tank",
         step_title: "Front Tank Inspection",
         question: "Rate each component on the front tank.",
         instructions:
            "Starting at the front of your machine, inspect the first tank on your air cart for wear, damage, or operational issues.",
         tank_label: "Front Tank",
         tank_index: 1,
         run_sections: {
            hoses: "Inspect hoses running from the front of the cart to the front tank.",
            tubes: "Inspect stainless steel tubes running from the front of the cart to the front tank.",
         },
      },
      {
         position: "rear",
         slug: "air-cart-rear-tank",
         step_title: "Rear Tank Inspection",
         question: "Rate each component on the rear tank.",
         tank_label: "Rear Tank",
         tank_index: 2,
         run_sections: {
            hoses: "Inspect hoses running from the front tank to the rear tank.",
            tubes: "Inspect stainless steel tubes running from the front tank to the rear tank.",
         },
      },
   ],
   3: [
      {
         position: "front",
         slug: "air-cart-front-tank",
         step_title: "Front Tank Inspection",
         question: "Rate each component on the front tank.",
         instructions:
            "Starting at the front of your machine, inspect the first tank on your air cart for wear, damage, or operational issues.",
         tank_label: "Front Tank",
         tank_index: 1,
         run_sections: {
            hoses: "Inspect hoses running from the front of the cart to the front tank.",
            tubes: "Inspect stainless steel tubes running from the front of the cart to the front tank.",
         },
      },
      {
         position: "middle",
         slug: "air-cart-middle-tank",
         step_title: "Middle Tank Inspection",
         question: "Rate each component on the middle tank.",
         tank_label: "Middle Tank",
         tank_index: 2,
         run_sections: {
            hoses: "Inspect hoses running from the front tank to the middle tank.",
            tubes: "Inspect stainless steel tubes running from the front tank to the middle tank.",
         },
      },
      {
         position: "rear",
         slug: "air-cart-rear-tank",
         step_title: "Rear Tank Inspection",
         question: "Rate each component on the rear tank.",
         tank_label: "Rear Tank",
         tank_index: 3,
         run_sections: {
            hoses: "Inspect hoses running from the middle tank to the rear tank.",
            tubes: "Inspect stainless steel tubes running from the middle tank to the rear tank.",
         },
      },
   ],
};

export const CART_TANK_SIZES = [
   "265 bu",
   "300 bu",
   "350 bu",
   "430 bu",
   "500 bu",
   "550 bu",
   "650 bu",
   "750 bu",
   "850 bu",
   "1050 bu",
];

const DRILL_MODELS = {
   "John Deere": [
      "1890 No-Till Air Drill",
      "N500 / N500C Series",
      "N500F Series",
      "P500 Series",
      "P600 Series",
      "H500 / H500F Series",
      "1830 / 1835 SFP",
      "730 Air Disk Drill",
      "Other",
   ],
   "Case IH": [
      "Precision Disk 500DS",
      "Precision Disk 550",
      "Precision Disk 550T",
      "Flex Hoe 400",
      "Flex Hoe 700",
      "Flex Hoe 900",
      "Other",
   ],
   Bourgault: ["3310", "3330", "3335", "3420", "5710", "5810", "6550ST", "Other"],
   Morris: ["Quantum", "Contour II", "Maxim II", "Other"],
   Väderstad: ["Seed Hawk 40 Series", "Seed Hawk 45 Series", "Seed Hawk 50 Series", "Seed Hawk XL", "NZ Drill", "Other"],
   SeedMaster: ["Ultra Pro", "Ultra Sr", "XP Series", "Other"],
   "Flexi-Coil": ["5000 Series", "6000 Series", "Other"],
   "Great Plains": ["3S-4010", "3S-5000", "Other"],
   "New Holland": ["P2070", "P2080", "Other"],
   Amity: ["Other"],
   Concord: ["Other"],
   "K-Hart": ["Spyder", "Other"],
   Pillar: ["Stealth Flex Disc Drill", "DH Series Disc Drill", "Other"],
   Other: ["Other"],
};

const CART_MODELS = {
   "John Deere": ["1910 Commodity Cart", "C650 Air Cart", "C850 Air Cart", "C-Series", "Other"],
   "Case IH": [
      "Precision Air 525",
      "Precision Air 535",
      "Precision Air 550",
      "Precision Air 625",
      "Precision Air 740",
      "Precision Air 855",
      "Other",
   ],
   Bourgault: ["7950", "7950 QT", "6550 Air Cart", "Other"],
   Morris: ["8635TL", "8636TL", "Other"],
   Väderstad: ["Seed Hawk Cart", "Other"],
   SeedMaster: ["SeedMaster Cart", "Other"],
   "Flexi-Coil": ["5000 Cart", "6000 Cart", "Other"],
   "Great Plains": ["Air Cart", "Other"],
   Pillar: ["MS Air Cart", "Other"],
   Other: ["Other"],
};

const PLANTER_MODELS = {
   "John Deere": ["1770NT", "1790", "DB40", "DB44", "DB60", "DB88", "DB90", "DB120", "MaxEmerge 5", "Other"],
   "Case IH": ["1200 Early Riser", "1255 Early Riser", "2150 Early Riser", "Other"],
   "New Holland": ["P1000", "P2080", "P2085", "Other"],
   Kinze: ["3600", "3700", "3800", "4900", "Other"],
   "Great Plains": ["YP825A", "YP1625A", "Other"],
   Horsch: ["Maestro", "Pronto", "Other"],
   Fendt: ["Momentum", "Other"],
   Monosem: ["NG Plus", "Other"],
   Other: ["Other"],
};

export function getCatalogComponent(equipmentType, component) {
   if (equipmentType === "planter") return "";
   if (component === "cart") return "cart";
   return "drill";
}

export function getMachineChoice(setup) {
   const normalized = normalizeMachineSetup(setup);

   if (normalized.equipmentType === "planter") return "planter";
   if (normalized.equipmentType === "air_seeder" && normalized.component === "both") return "air_seeder";
   if (normalized.equipmentType === "air_seeder" && normalized.component === "drill") return "drill_only";
   if (normalized.equipmentType === "air_seeder" && normalized.component === "cart") return "cart_only";

   return "";
}

export function getMachineChoiceTarget(choice) {
   const match = MACHINE_CHOICES.find((item) => item.value === choice);
   if (!match) return { equipmentType: "", component: "" };

   return {
      equipmentType: match.equipmentType,
      component: match.component,
   };
}

export function getManufacturers(equipmentType, component) {
   if (equipmentType === "planter") {
      return Object.keys(PLANTER_MODELS);
   }

   const catalog = getCatalogComponent(equipmentType, component) === "cart" ? CART_MODELS : DRILL_MODELS;
   return Object.keys(catalog);
}

export function getModels(equipmentType, component, manufacturer) {
   if (!manufacturer) return [];

   if (equipmentType === "planter") {
      return PLANTER_MODELS[manufacturer] || ["Other"];
   }

   const catalog = getCatalogComponent(equipmentType, component) === "cart" ? CART_MODELS : DRILL_MODELS;
   return catalog[manufacturer] || ["Other"];
}

export function createEmptyDrillSetup() {
   return {
      manufacturer: "",
      model: "",
      width: "",
      rowSpacing: "",
      rowUnitCount: "",
      workingRanks: "",
      otherDetails: "",
   };
}

export function createEmptyCartSetup() {
   return {
      manufacturer: "",
      model: "",
      tankCount: "",
      tankSize: "",
      otherDetails: "",
   };
}

export const DRILL_INSPECTION_SECTIONS = new Set([
   "openers",
   "closing_system",
   "press_wheels",
   "depth_control",
   "gauge_wheels",
   "seed_boots",
   "drill",
]);

export function isDrillIncluded(setup) {
   const normalized = normalizeMachineSetup(setup);

   if (normalized.equipmentType === "planter") return true;
   if (normalized.component === "drill") return true;
   if (normalized.component === "cart") return false;
   if (normalized.component === "both") return normalized.includeDrill !== false;

   return false;
}

export function isCartIncluded(setup) {
   const normalized = normalizeMachineSetup(setup);

   if (normalized.equipmentType === "planter") return false;
   if (normalized.component === "cart") return true;
   if (normalized.component === "drill") return false;
   if (normalized.component === "both") return normalized.includeCart !== false;

   return false;
}

export function isInspectionStepApplicable(step, setup) {
   if (!step || step.section === "machine_setup") return true;

   if (step.section === "air_cart") return isCartIncluded(setup);
   if (DRILL_INSPECTION_SECTIONS.has(step.section)) return isDrillIncluded(setup);
   if (step.section === "wrap_up") return true;

   return true;
}

function getInspectionOrder(setup) {
   const normalized = normalizeMachineSetup(setup);

   if (normalized.component !== "both") return "drill_first";
   if (normalized.inspectionOrder === "cart_first") return "cart_first";
   if (normalized.inspectionOrder === "drill_first") return "drill_first";
   if (normalized.includeDrill === false && normalized.includeCart !== false) return "cart_first";

   return "drill_first";
}

function getStepSectionOrder(step, inspectionOrder) {
   if (step.section === "machine_setup") return 0;
   if (step.section === "wrap_up") return 4;

   if (inspectionOrder === "cart_first") {
      if (step.section === "air_cart") return 1;
      if (DRILL_INSPECTION_SECTIONS.has(step.section)) return 2;
   } else {
      if (DRILL_INSPECTION_SECTIONS.has(step.section)) return 1;
      if (step.section === "air_cart") return 2;
   }

   return 3;
}

export function getEffectiveTankCount(setup, override) {
   const overrideCount = Number(override);
   if (overrideCount > 0) return Math.min(MAX_CART_TANK_COUNT, Math.round(overrideCount));

   const cart = getCartSetup(setup);
   if (!cart) return 0;

   const count = Number(cart.tankCount) || 0;
   return count > 0 ? Math.min(MAX_CART_TANK_COUNT, count) : 0;
}

function prefixTankSectionLabel(tankLabel, label) {
   return `${tankLabel} ${label}`;
}

function buildCartTankTrailingSections(tankLabel) {
   return [
      {
         label: prefixTankSectionLabel(tankLabel, "Tank Lid with Hardware"),
         value: "tank-lid-and-hardware",
         choices: CART_LID_LADDER_CHOICES,
      },
      {
         label: prefixTankSectionLabel(tankLabel, "Ladder"),
         value: "ladder",
         choices: CART_LID_LADDER_CHOICES,
      },
   ];
}

function buildCartTankInspectionSections(template, tankStep) {
   const tankLabel = tankStep.tank_label ?? "Front Tank";
   const baseSections = (template.inspection_sections ?? []).map((section) => ({
      ...section,
      label: prefixTankSectionLabel(tankLabel, section.label),
   }));
   const runCopy = tankStep.run_sections;
   const trailingSections = buildCartTankTrailingSections(tankLabel);

   if (!runCopy) return [...baseSections, ...trailingSections];

   return [
      ...baseSections,
      {
         label: prefixTankSectionLabel(tankLabel, "Hoses"),
         value: "hoses",
         question: runCopy.hoses,
      },
      {
         label: prefixTankSectionLabel(tankLabel, "Stainless Steel Tubes"),
         value: "stainless-steel-tubes",
         question: runCopy.tubes,
      },
      ...trailingSections,
   ];
}

function buildCartTankStep(template, tankStep) {
   return {
      ...template,
      slug: tankStep.slug,
      step_title: tankStep.step_title,
      question: tankStep.question,
      instructions: tankStep.instructions ?? template.instructions,
      tank_position: tankStep.position,
      tank_index: tankStep.tank_index,
      inspection_sections: buildCartTankInspectionSections(template, tankStep),
      is_cart_tank_template: false,
   };
}

function expandCartTankSteps(steps, tankCount) {
   const template = steps.find((step) => step.slug === CART_TANK_TEMPLATE_SLUG && step.is_cart_tank_template);
   if (!template) return steps;

   const layout = CART_TANK_STEP_LAYOUTS[tankCount];
   const expanded = [];

   for (const step of steps) {
      if (step.slug === CART_TANK_TEMPLATE_SLUG && step.is_cart_tank_template) {
         if (layout) {
            layout.forEach((tankStep) => {
               expanded.push(buildCartTankStep(template, tankStep));
            });
         }
         continue;
      }

      expanded.push(step);
   }

   return expanded;
}

export function getApplicableSteps(steps, setup, tankCountOverride = null) {
   if (!Array.isArray(steps)) return [];

   const normalized = normalizeMachineSetup(setup);
   const inspectionOrder = getInspectionOrder(normalized);
   const tankCount = isCartIncluded(normalized) ? getEffectiveTankCount(normalized, tankCountOverride) : 0;

   const filtered = steps
      .filter((step) => isInspectionStepApplicable(step, normalized))
      .sort((a, b) => {
         const orderA = getStepSectionOrder(a, inspectionOrder);
         const orderB = getStepSectionOrder(b, inspectionOrder);

         if (orderA !== orderB) return orderA - orderB;

         return a.step_number - b.step_number;
      });

   return expandCartTankSteps(filtered, tankCount);
}

export function hasWrapUpFinalStep(applicableSteps) {
   const lastStep = applicableSteps[applicableSteps.length - 1];
   return lastStep?.section === "wrap_up";
}

export function isLastInspectableStepIndex(applicableSteps, currentIndex) {
   if (hasWrapUpFinalStep(applicableSteps)) {
      return currentIndex === applicableSteps.length - 2;
   }

   return currentIndex >= applicableSteps.length - 1;
}

export function getFirstDrillStepSlug(applicableSteps) {
   const step = applicableSteps.find((item) => DRILL_INSPECTION_SECTIONS.has(item.section));

   return step?.slug ?? null;
}

export function getFirstCartStepSlug(applicableSteps) {
   const step = applicableSteps.find((item) => item.section === "air_cart" && item.answer_type !== "notes");

   return step?.slug ?? null;
}

export function canOfferOptionalCartInspection(setup) {
   const normalized = normalizeMachineSetup(setup);

   return normalized.equipmentType === "air_seeder" && normalized.component === "both" && normalized.includeCart === false;
}

export function canOfferOptionalDrillInspection(setup) {
   const normalized = normalizeMachineSetup(setup);

   return normalized.equipmentType === "air_seeder" && normalized.component === "both" && normalized.includeDrill === false;
}

export function enableCartInspection(setup) {
   return persistMachineSetupDraft({
      ...normalizeMachineSetup(setup),
      includeCart: true,
      inspectionOrder: "drill_first",
   });
}

export function enableDrillInspection(setup) {
   return persistMachineSetupDraft({
      ...normalizeMachineSetup(setup),
      includeDrill: true,
      inspectionOrder: "cart_first",
   });
}

export function createEmptyMachineSetup() {
   return {
      equipmentType: "",
      component: "",
      includeDrill: true,
      includeCart: true,
      inspectionOrder: "drill_first",
      manufacturer: "",
      model: "",
      width: "",
      rowSpacing: "",
      rowUnitCount: "",
      workingRanks: "",
      tankCount: "",
      tankSize: "",
      otherDetails: "",
      drill: createEmptyDrillSetup(),
      cart: createEmptyCartSetup(),
   };
}

export function getDrillSetup(setup) {
   const normalized = normalizeMachineSetup(setup);

   if (!isDrillIncluded(normalized)) {
      return normalized;
   }

   if (normalized.component === "both") {
      return {
         ...normalized,
         ...normalized.drill,
      };
   }

   return normalized;
}

export function getCartSetup(setup) {
   const normalized = normalizeMachineSetup(setup);

   if (normalized.component === "both") {
      return {
         ...normalized,
         ...normalized.cart,
      };
   }

   if (normalized.component === "cart") {
      return normalized;
   }

   return null;
}

function isDrillPartComplete(drill) {
   if (!drill?.manufacturer || !drill?.model) return false;
   if (!drill.width || !drill.rowSpacing) return false;
   if (!drill.rowUnitCount || !drill.workingRanks) return false;
   if (drill.model === "Other" && !drill.otherDetails?.trim()) return false;
   return true;
}

function isCartPartComplete(cart) {
   if (!cart?.manufacturer || !cart?.model) return false;
   if (!cart.tankCount || !cart.tankSize) return false;
   if (cart.model === "Other" && !cart.otherDetails?.trim()) return false;
   return true;
}

export function isDrillConfigurationComplete(setup) {
   const normalized = normalizeMachineSetup(setup);

   if (!isDrillIncluded(normalized)) return true;
   if (normalized.component === "both") return isDrillPartComplete(normalized.drill);

   return isDrillPartComplete(normalized);
}

export function isCartConfigurationComplete(setup) {
   const normalized = normalizeMachineSetup(setup);

   if (!isCartIncluded(normalized)) return true;
   if (normalized.component === "both") return isCartPartComplete(normalized.cart);

   return isCartPartComplete(normalized);
}

export function isDrillPartConfigurationComplete(setup) {
   return isDrillPartComplete(normalizeMachineSetup(setup).drill);
}

export function isCartPartConfigurationComplete(setup) {
   return isCartPartComplete(normalizeMachineSetup(setup).cart);
}

export function getMachineSetupPath(setup) {
   if (setup.equipmentType === "planter") return "planter";
   if (setup.equipmentType === "air_seeder" && setup.component === "both") return "air_seeder";
   if (setup.equipmentType === "air_seeder" && setup.component === "drill") return "drill";
   if (setup.equipmentType === "air_seeder" && setup.component === "cart") return "cart";
   return null;
}

const CURRENT_MACHINE_IDENTITY_FIELDS = ["equipmentType", "component", "manufacturer", "model", "otherDetails"];
const DRILL_IDENTITY_FIELDS = ["manufacturer", "model", "otherDetails"];
const CART_IDENTITY_FIELDS = ["manufacturer", "model", "otherDetails"];

export function getCurrentMachineIdentity(setup) {
   const normalized = normalizeMachineSetup(setup);

   if (normalized.component === "both") {
      const drill = normalized.drill || createEmptyDrillSetup();
      const cart = normalized.cart || createEmptyCartSetup();

      return {
         equipmentType: normalized.equipmentType,
         component: normalized.component,
         includeDrill: normalized.includeDrill !== false,
         includeCart: normalized.includeCart !== false,
         drill: DRILL_IDENTITY_FIELDS.reduce((identity, field) => {
            identity[field] = drill[field] ?? "";
            return identity;
         }, {}),
         cart: CART_IDENTITY_FIELDS.reduce((identity, field) => {
            identity[field] = cart[field] ?? "";
            return identity;
         }, {}),
      };
   }

   const picked = pickMachineSetupFields(normalized);
   const identity = {};

   CURRENT_MACHINE_IDENTITY_FIELDS.forEach((field) => {
      identity[field] = picked[field] ?? "";
   });

   return identity;
}

export function isSameCurrentMachine(previous, next) {
   const previousIdentity =
      previous && typeof previous === "object" && "equipmentType" in previous
         ? previous
         : getCurrentMachineIdentity(previous);
   const nextIdentity = getCurrentMachineIdentity(next);

   if (previousIdentity.component === "both" || nextIdentity.component === "both") {
      if (previousIdentity.component !== nextIdentity.component) return false;
      if (previousIdentity.equipmentType !== nextIdentity.equipmentType) return false;

      // Include toggles change which steps run, not the machine identity — keep existing answers.
      return (
         DRILL_IDENTITY_FIELDS.every((field) => previousIdentity.drill?.[field] === nextIdentity.drill?.[field]) &&
         CART_IDENTITY_FIELDS.every((field) => previousIdentity.cart?.[field] === nextIdentity.cart?.[field])
      );
   }

   return CURRENT_MACHINE_IDENTITY_FIELDS.every((field) => previousIdentity[field] === nextIdentity[field]);
}

export function pickMachineSetupFields(setup) {
   const empty = createEmptyMachineSetup();
   const picked = {};

   Object.keys(empty).forEach((key) => {
      picked[key] = setup?.[key] ?? empty[key];
   });

   return picked;
}

export function switchMachineSetup(setup, target = {}) {
   const normalized = normalizeMachineSetup(setup);
   const savedSetups = { ...(normalized.savedSetups || {}) };
   let lastAirSeederComponent = normalized.lastAirSeederComponent || "";
   const currentPath = getMachineSetupPath(normalized);

   if (currentPath) {
      savedSetups[currentPath] = pickMachineSetupFields(normalized);
   }

   if (normalized.equipmentType === "air_seeder" && normalized.component) {
      lastAirSeederComponent = normalized.component;
   }

   const nextEquipmentType = target.equipmentType ?? normalized.equipmentType;
   let nextComponent = target.component !== undefined ? target.component : normalized.component;

   if (nextEquipmentType === "air_seeder" && target.component === undefined && normalized.equipmentType !== "air_seeder") {
      nextComponent = lastAirSeederComponent;
   }

   if (nextEquipmentType === "air_seeder" && nextComponent) {
      lastAirSeederComponent = nextComponent;
   }

   const nextPath = getMachineSetupPath({
      equipmentType: nextEquipmentType,
      component: nextComponent,
   });

   if (!nextPath) {
      return {
         ...createEmptyMachineSetup(),
         equipmentType: nextEquipmentType,
         component: nextComponent || "",
         savedSetups,
         lastAirSeederComponent,
      };
   }

   const restored = savedSetups[nextPath] ? pickMachineSetupFields(savedSetups[nextPath]) : createEmptyMachineSetup();

   return {
      ...restored,
      equipmentType: nextEquipmentType,
      component: nextEquipmentType === "air_seeder" ? nextComponent : "",
      savedSetups,
      lastAirSeederComponent,
   };
}

export function persistMachineSetupDraft(setup) {
   const normalized = normalizeMachineSetup(setup);
   const path = getMachineSetupPath(normalized);
   const lastAirSeederComponent =
      normalized.equipmentType === "air_seeder" && normalized.component
         ? normalized.component
         : normalized.lastAirSeederComponent || "";

   if (!path) {
      return {
         ...normalized,
         lastAirSeederComponent,
      };
   }

   return {
      ...normalized,
      lastAirSeederComponent,
      savedSetups: {
         ...(normalized.savedSetups || {}),
         [path]: pickMachineSetupFields(normalized),
      },
   };
}

export function normalizeMachineSetup(value) {
   if (!value) {
      return { ...createEmptyMachineSetup(), savedSetups: {}, lastAirSeederComponent: "" };
   }
   if (typeof value === "string") {
      try {
         const parsed = JSON.parse(value);
         return {
            ...createEmptyMachineSetup(),
            ...parsed,
            drill: { ...createEmptyDrillSetup(), ...(parsed.drill || {}) },
            cart: { ...createEmptyCartSetup(), ...(parsed.cart || {}) },
            savedSetups: parsed.savedSetups && typeof parsed.savedSetups === "object" ? parsed.savedSetups : {},
            lastAirSeederComponent: parsed.lastAirSeederComponent || "",
         };
      } catch {
         return { ...createEmptyMachineSetup(), otherDetails: value, savedSetups: {}, lastAirSeederComponent: "" };
      }
   }

   return {
      ...createEmptyMachineSetup(),
      ...value,
      drill: { ...createEmptyDrillSetup(), ...(value.drill || {}) },
      cart: { ...createEmptyCartSetup(), ...(value.cart || {}) },
      savedSetups: value.savedSetups && typeof value.savedSetups === "object" ? value.savedSetups : {},
      lastAirSeederComponent: value.lastAirSeederComponent || "",
   };
}

export function isMachineSetupComplete(value) {
   const setup = normalizeMachineSetup(value);

   if (!setup.equipmentType) {
      return false;
   }

   if (setup.equipmentType === "air_seeder" && !setup.component) {
      return false;
   }

   if (setup.component === "both") {
      const includeDrill = setup.includeDrill !== false;
      const includeCart = setup.includeCart !== false;

      if (!includeDrill && !includeCart) return false;
      if (includeDrill && !isDrillPartComplete(setup.drill)) return false;
      if (includeCart && !isCartPartComplete(setup.cart)) return false;

      return true;
   }

   if (!setup.manufacturer || !setup.model) {
      return false;
   }

   if (setup.equipmentType === "planter" || setup.component === "drill") {
      if (!setup.width || !setup.rowSpacing) return false;
   }

   if (setup.component === "drill") {
      if (!setup.rowUnitCount || !setup.workingRanks) return false;
   }

   if (setup.component === "cart" && (!setup.tankCount || !setup.tankSize)) {
      return false;
   }

   if (setup.model === "Other" && !setup.otherDetails?.trim()) {
      return false;
   }

   return true;
}

export function formatMachineSetupSummary(value) {
   const setup = normalizeMachineSetup(value);
   const parts = [];

   if (setup.component === "both") {
      parts.push("Air Seeder");

      const includeDrill = setup.includeDrill !== false;
      const includeCart = setup.includeCart !== false;
      const drill = setup.drill || createEmptyDrillSetup();
      const cart = setup.cart || createEmptyCartSetup();

      if (includeDrill) {
         const drillParts = [drill.manufacturer, drill.model, drill.width, drill.rowSpacing];
         if (drill.rowUnitCount) drillParts.push(`${drill.rowUnitCount} row-units`);
         if (drill.workingRanks) {
            const rankCount = Number(drill.workingRanks);
            drillParts.push(`${rankCount} working rank${rankCount === 1 ? "" : "s"}`);
         }
         if (drill.otherDetails) drillParts.push(drill.otherDetails);

         const drillSummary = drillParts.filter(Boolean).join(" · ");
         if (drillSummary) parts.push(`Drill: ${drillSummary}`);
      } else {
         parts.push("Drill: skipped");
      }

      if (includeCart) {
         const cartParts = [cart.manufacturer, cart.model];
         if (cart.tankCount) {
            const tankCount = Number(cart.tankCount);
            cartParts.push(`${tankCount} tank${tankCount === 1 ? "" : "s"}`);
         }
         if (cart.tankSize) cartParts.push(cart.tankSize);
         if (cart.otherDetails) cartParts.push(cart.otherDetails);

         const cartSummary = cartParts.filter(Boolean).join(" · ");
         if (cartSummary) parts.push(`Cart: ${cartSummary}`);
      } else {
         parts.push("Cart: skipped");
      }

      return parts.filter(Boolean).join(" · ");
   }

   if (setup.equipmentType === "air_seeder") {
      const componentLabel = AIR_SEEDER_COMPONENTS.find((item) => item.value === setup.component)?.label;
      parts.push(`Air Seeder – ${componentLabel || setup.component}`);
   } else {
      parts.push("Planter");
   }

   parts.push(setup.manufacturer, setup.model);

   if (setup.width) parts.push(setup.width);
   if (setup.rowSpacing) parts.push(setup.rowSpacing);
   if (setup.rowUnitCount) parts.push(`${setup.rowUnitCount} row-units`);
   if (setup.workingRanks) {
      const rankCount = Number(setup.workingRanks);
      parts.push(`${rankCount} working rank${rankCount === 1 ? "" : "s"}`);
   }
   if (setup.tankCount) {
      const tankCount = Number(setup.tankCount);
      parts.push(`${tankCount} tank${tankCount === 1 ? "" : "s"}`);
   }
   if (setup.tankSize) parts.push(setup.tankSize);
   if (setup.otherDetails) parts.push(setup.otherDetails);

   return parts.filter(Boolean).join(" · ");
}
