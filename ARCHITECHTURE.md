# Air Seeder Inspection App Architecture

## Purpose

This project is a guided self-inspection tool for air seeders and planters. It replaces a complex internal spreadsheet inspection process with a customer-facing, step-by-step wizard.

The app lives on the Red E WordPress site and will eventually push completed inspection data into HubSpot.

## Stack

- Vite + React
- Tailwind CSS
- JSON step content (`public/data/inspection-steps.json`)
- Custom WordPress plugin wrapper (host only)
- `localStorage` for in-progress draft saving

WordPress is **not** the source of truth for inspection step content.

## High-level flow

```text
inspection-steps.json
        ↓
   fetch + validateSteps()
        ↓
   InspectionWelcome (start screen)
        ↓
   InspectionCard + AnswerGroup (per step)
        ↓
   localStorage draft (answers keyed by slug)
        ↓
   [future] HubSpot submission on finish
```

## Content model

### Inspection steps (`public/data/inspection-steps.json`)

Sales-maintained content. Each step is a flat JSON object:

| Field | Purpose |
|-------|---------|
| `slug` | Unique ID; used as the answer key in drafts |
| `step_number` | Wizard order |
| `section` | Category (`machine_setup`, `openers`, `closing_system`, etc.) |
| `step_title` | Step heading |
| `instructions` | Body copy / how to inspect |
| `question` | Prompt above the answer UI |
| `answer_type` | Controls which answer component renders |
| `video_url`, `video_caption` | Optional embedded video |
| `image_url`, `image_caption` | Optional image |
| `recommended_action` | Shown after the user answers |
| `estimated_low_cost`, `estimated_high_cost` | Cost range hints (for future summary) |

Required fields are enforced by `src/utils/validateSteps.js` on load.

### Answer types

| `answer_type` | UI |
|---------------|-----|
| `machine_setup` | Equipment type, manufacturer, model, width/spacing (`MachineSetupForm`) |
| `condition` | Good / Needs Attention / Worn Out / Not Sure |
| `measurement` | Number input (generic) |
| `yes_no` | Yes / No / Not Sure |

**Special case:** A `measurement` step whose title contains "disc" renders as a `disc_diameter` dropdown (quarter-inch increments from 18+ inches down to less than 15 inches). Logic lives in `src/data/discDiameterOptions.js`.

### App-owned reference data (`src/data/`)

Not in the JSON file — maintained in code:

- `machineCatalog.js` — manufacturers, models, widths, row spacings, tank sizes
- `discDiameterOptions.js` — disc diameter dropdown values

### Welcome screen (`InspectionWelcome.jsx`)

Hardcoded intro copy, contact info, onsite inspection link, and overview video. Not driven by `inspection-steps.json`.

## State and persistence

Draft state in `localStorage` (`airSeederInspectionDraft`):

```json
{
  "hasStarted": true,
  "currentIndex": 2,
  "answers": {
    "machine-setup": { "equipmentType": "air_seeder", "..." : "..." },
    "main-arm-pivot": "Good"
  }
}
```

## WordPress role

WordPress provides:

- Page hosting
- Plugin that enqueues built assets from `dist/`
- Shortcode: `[air_seeder_inspection]`
- Mount div: `#air-seeder-inspection-root`

To update step content, edit `public/data/inspection-steps.json` and redeploy `dist/` (or update the JSON on the server without rebuilding if only content changed).

## Future direction

- CSV or Google Sheet as the sales editing format, compiled to JSON
- Per-answer recommendations and pricing (separate data file)
- Equipment branching (air seeder drill vs cart vs planter)
- HubSpot integration on inspection completion
