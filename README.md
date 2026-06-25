# Air Seeder Inspection

Guided self-inspection wizard for air seeders and planters. Built with React + Vite, embedded on the Red E WordPress site via a custom plugin.

## Quick start

```bash
npm install
npm run dev
```

Open the local dev server and use the app at the root route.

```bash
npm run build    # outputs to dist/
npm run preview  # preview production build
npm run lint
```

## Editing inspection content

Step content is in **`public/data/inspection-steps.json`**.

Each step needs at minimum:

- `slug`, `step_number`, `section`, `step_title`, `instructions`, `question`, `answer_type`

After editing, rebuild and deploy `dist/`, or copy `dist/data/inspection-steps.json` to the server if only content changed.

Invalid JSON or missing required fields will throw at load time via `src/utils/validateSteps.js`.

### Answer types

- `machine_setup` — equipment / manufacturer / model dropdowns
- `condition` — Good, Needs Attention, Worn Out, Not Sure
- `measurement` — number input (Disc Opener auto-uses a diameter dropdown)
- `yes_no` — Yes, No, Not Sure

Machine catalog and disc diameter options are in `src/data/` and require a code change to update.

## WordPress deployment

1. Run `npm run build`
2. Deploy the `dist/` folder with the WordPress plugin
3. Ensure `dist/data/inspection-steps.json` is served alongside `dist/assets/app.js`
4. Use shortcode `[air_seeder_inspection]` on the target page

The plugin mounts the app on `#air-seeder-inspection-root`.

## Project structure

```text
public/
  data/inspection-steps.json   ← step content (sales-editable)
  rede_logo.webp
src/
  App.jsx                      ← load steps, wizard state
  components/                  ← UI (welcome, card, nav, forms)
  data/                        ← machine catalog, disc diameters
  utils/                       ← validation, storage, answer checks
```

See [ARCHITECHTURE.md](./ARCHITECHTURE.md) for full architecture details.

## Style

- Tailwind CSS
- Brand red: `#e21313`
- `rede-inspection-geom` display font via `.font-rede-geom` (see `src/index.css`)
