# Alchemist's Cauldron

A browser game for the [RS School qualifying-stage assignment](https://github.com/rolling-scopes-school/qualifying-stage/tree/main/tasks/game-alchemists-cauldron). Mix limited-stock ingredients, match a recipe's Temperature, Density and Magic Power ranges, and brew potions before time or lives run out.

## Current status

Project setup and the visual draft are complete. The current branch, **`feat/ingredient-system`**, adds working ingredient stock, ordered cauldron additions, and live parameter gauges. The full brewing loop will be implemented through the remaining feature branches.

The application uses TypeScript and browser APIs, with Vite for development and production builds. Gameplay must use no frameworks, game engines or runtime libraries. ESLint, Prettier and Husky support development checks.

## Run locally

Use **Node.js 22.13+ on the 22.x line**, or **Node.js 24+**. **Node.js 24** is recommended, recorded in `.nvmrc`, and used by CI. npm is included with Node.js.

```sh
git clone https://github.com/vlat247/minigame1-rs.git
cd minigame1-rs
git switch feat/ingredient-system
npm ci
npm run dev
```

Open the local URL printed by Vite. `npm ci` installs the versions recorded in `package-lock.json` and its `prepare` step installs the Git hooks. If using nvm, run `nvm use` first.

The commands above check out the ingredient-system branch after it has been pushed. Check out the relevant story or task branch when reviewing other work.

## Try ingredient mixing

- **Start Game** opens the Level 1 workbench with six ingredients. Each receives its own random integer stock from **2 to 15**, and the cauldron starts empty. All eight official ingredients are catalogued; Phoenix Feather and Toad Slime remain off the Level 1 shelf.
- **Select an ingredient** to spend one portion and add it to the cauldron. Duplicate ingredients are allowed, and the four mixture positions preserve addition order. A full cauldron rejects further additions without spending stock. When stock reaches zero, the card loses its illustration, keeps its `0` badge, and becomes disabled and unavailable to keyboard focus.
- **Watch the gauges** update from the raw Temperature, Density, and Magic Power sums. Zero stays centered; each gauge expands its symmetric scale when needed. Values are never clamped: four portions of Essence of the Void produce **−80 / −40 / 160**. Markers move with CSS transitions, and a value inside its displayed recipe range gains green feedback and an **In range** label.
- **Help** explains the intended game rules. **Menu** opens the new-game action and leaderboard. The leaderboard currently shows its empty state.
- **Pause / Resume** blurs and restores the workbench while preserving the mixture and stock. The visibility-change handler pauses an active workbench when its browser tab becomes hidden; returning requires Resume. Ingredients cannot be added while paused or while a dialog is open.
- **Menu → Start new game** lets you retry with an empty cauldron and newly randomized stock after confirmation. Dialog navigation and canceled confirmations preserve the current mixture and stock. A confirmed **Exit to start** discards them and returns to the welcome screen.
- **Tab / Shift+Tab** navigate buttons and stay inside an open dialog. **Escape** closes ordinary dialogs or returns to their previous dialog; Pause remains open until Resume or Exit is chosen.

The welcome screen has no ingredient stock, no recipe targets, no life icons, and zero score and time. Game elements are authored with inline SVG and CSS; no bitmap assets or runtime libraries are used.

The recipe remains fixed to **Acid Spark**. Its target ranges are real, but recipe selection, brewing, scoring, countdown timing, life changes, storage, difficulty selection, reactions, drag and drop, game shortcuts, and Pour Out are pending. The score of zero, three lives, and `02:30` clock are previews. **Brew** remains disabled with a visible explanation. Gauge matching uses the displayed recipe ranges; the Medium brew tolerance of ±8 will apply when brewing is implemented.

The interface follows the assignment's dark fantasy workshop: brass frames, a cabinet-style shelf, six colored glass ingredient illustrations, a shaded iron cauldron on a stone hearth, green rune light, and an upright parchment recipe. All artwork is authored SVG/CSS, with separate components for the scene, cauldron, icons, and controls. Adding the first portion reveals the cauldron's green liquid, bubbles, and steam.

The responsive layout uses three columns on desktop, a station-first layout on tablets, and a two-column ingredient shelf on phones. The main Start/Brew action sits below the parameter gauges, with Help and Menu at the outer edges. Styles support reduced motion and visible keyboard focus.

| Command                | Purpose                                       |
| ---------------------- | --------------------------------------------- |
| `npm ci`               | Install dependencies from the lockfile        |
| `npm run dev`          | Start the development server                  |
| `npm run typecheck`    | Check TypeScript types without emitting files |
| `npm run lint`         | Check source code with ESLint                 |
| `npm run format`       | Format supported project files with Prettier  |
| `npm run format:check` | Check formatting without changing files       |
| `npm test`             | Run the ingredient-system regression tests    |
| `npm run check`        | Run lint, formatting, tests, and build checks |
| `npm run build`        | Create the production build in `dist/`        |
| `npm run preview`      | Serve the production build locally            |

Before opening a PR, run `npm run check`. To inspect the production result, run `npm run build`, then `npm run preview`. The GitHub Actions checks workflow installs dependencies and runs `npm run check` on pushes and pull requests.

`npm test` runs Node's built-in test runner with `--experimental-strip-types`, importing the pure TypeScript modules directly without a test framework. The nine regression tests cover:

- The eight official ingredient values, their order, the six-item Level 1 shelf, and safe ID lookup.
- Six independent stock draws, including the minimum and maximum random boundaries.
- All fourteen possible stock values and rejection of invalid injected random samples.
- Ordered duplicate additions, exact stock consumption, raw totals, and input immutability.
- Full-cauldron rejection without consuming stock or replacing the state.
- Empty-stock rejection while space remains in the cauldron.
- Unknown and off-shelf ingredient rejection, even with forged off-shelf stock.
- Negative totals and Magic Power above 100 without clamping.
- Fresh-game resets that clear the mixture and totals, reroll stock, and preserve the previous state.

TypeScript strict mode is enabled, including unchecked index access and exact optional properties. ESLint rejects explicit `any`, non-null assertions, `console.log`, and debugger statements. Prettier owns code formatting.

The `commit-msg` hook checks lowercase Conventional Commit syntax, including optional scopes, breaking-change markers, and separated bodies. Keep descriptions in the imperative present tense when reviewing commits. The `pre-push` hook runs ESLint and Prettier checks and blocks a push if either fails. Run `npm run prepare` to reinstall the hooks after a fresh checkout if needed.

Vite builds with relative asset paths, so `dist/` can be served from a repository subdirectory such as GitHub Pages. A public deployment will be added when preparing the story submission.

## Source architecture

```text
src/
  main.ts                  Application entry point
  data/
    ingredients.ts         Eight-item catalogue and Level 1 shelf selection
  logic/
    ingredients.ts         Stock creation, pure additions, validation and totals
  state/                   Future run-level game state
  storage/                 Future saved-game and leaderboard persistence
  ui/
    game-controller.ts     Input handling, screen state and dialog navigation
    game-view.ts           Shelf, mixture, cauldron and live gauge rendering
    draft-fixtures.ts      Fixed recipe parameter previews only
    dialogs.ts             Help, menu, pause and confirmation content
    icons.ts               Shared interface icons
    illustrations.ts       Cauldron, ingredient and workshop SVG artwork
  styles/                  Stylesheets and responsive layout
  assets/                  Authored assets, if needed
tests/
  ingredient-system.test.mjs
```

The ingredient catalogue and pure mixing logic are implemented in `data/` and `logic/`. The controller routes ingredient actions through those transitions, and the view renders the resulting state. Pure modules have no DOM dependencies. Run-level state, recipes, brewing, timing, and browser persistence will gain implementations as their stories are built.

## Milestones

| Stage   | Scope                                                                                          |
| ------- | ---------------------------------------------------------------------------------------------- |
| Story 1 | Repository, folder structure, bundler, strict TypeScript, ESLint, Prettier and Git hooks       |
| Level 1 | Shelf and cauldron, parameter bars, recipes and brewing, timer, lives, pause and Top-10 scores |
| Level 2 | Easy/Medium/Hard selection, automatic saves and Continue Game                                  |
| Level 3 | Drag and drop, tooltips, reactions, Pour Out, visual feedback and keyboard shortcuts           |

The ingredient shelf, ordered cauldron, and live parameter bars are implemented. Continue Level 1 with recipes and brewing, then the timer, lives, and leaderboard. Level 1 uses the Medium rules: 6 shelf ingredients, capacity 4, 150 seconds, 3 lives, tolerance ±8, +200 score and +10 seconds per successful brew. Reactions are added in Level 3.

The finished game must work in the latest Google Chrome across widths from **375 px to 1920 px**. Keep game elements as separate components; this implementation uses CSS and SVG, including the CSS/SVG ingredient icons required by US 1.1. Use the assignment's ingredient and recipe tables as the authoritative data.

## Branches and pull requests

Follow the [assignment repository workflow](https://github.com/rolling-scopes-school/qualifying-stage/tree/main/tasks/game-alchemists-cauldron#repository-workflow):

1. Create `story-1` from `main` (or `master` in a repository using that default).
2. Create a separate task branch from the current story branch. The setup task uses `chore/project-setup`, based on `story-1`. Feature work continues through `feat/game-draft` and the current `feat/ingredient-system` branch.
3. Keep commits small and focused. Review task changes through a PR targeting the current story branch before integrating them.
4. When a story is finished, open its final PR to the preceding branch. For Story 1, this is `story-1` → `main`.
5. **Keep the final story PR unmerged** and submit its link in RS App through **Cross-Check: Submit**.

Commit messages follow the [RS School Git convention](https://rs.school/docs/git-convention): a lowercase type, optional scope, and a short imperative description, for example `chore: configure project tooling`, `feat: add ingredient shelf` or `docs: explain local setup`.

The [project PR template](.github/pull_request_template.md) follows the [official RS School requirements](https://rs.school/docs/mentoring/pull-request-review-process#pull-request-requirements-pr): task link, screenshot, deployment link, completion/deadline dates and a scored self-check. Fill these with actual evidence when preparing the final story PR.

## Assignment references

- [Game brief and all user stories](https://github.com/rolling-scopes-school/qualifying-stage/tree/main/tasks/game-alchemists-cauldron)
- [Story 1 setup requirements](https://github.com/rolling-scopes-school/qualifying-stage/blob/main/tasks/game-alchemists-cauldron/precondition-user-story.md)
- [Common requirements and penalties](https://github.com/rolling-scopes-school/qualifying-stage/blob/main/tasks/game-alchemists-cauldron/common-requirements.md)
