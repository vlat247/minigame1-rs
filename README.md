# Alchemist's Cauldron

A browser game for the [RS School qualifying-stage assignment](https://github.com/rolling-scopes-school/qualifying-stage/tree/main/tasks/game-alchemists-cauldron). Mix limited-stock ingredients, match a recipe's Temperature, Density and Magic Power ranges, and brew potions before time or lives run out.

## Current status

Project setup, the visual draft, and ingredient mixing are complete. The current branch, **`feat/recipe-brewing`**, adds random Medium recipes, brewing checks, score and life changes, detailed brew results, and a minimal Game Over flow. Countdown timing and persistence remain for later branches.

The application uses TypeScript and browser APIs, with Vite for development and production builds. Gameplay must use no frameworks, game engines or runtime libraries. ESLint, Prettier and Husky support development checks.

## Run locally

Use **Node.js 22.13+ on the 22.x line**, or **Node.js 24+**. **Node.js 24** is recommended, recorded in `.nvmrc`, and used by CI. npm is included with Node.js.

```sh
git clone https://github.com/vlat247/minigame1-rs.git
cd minigame1-rs
git switch feat/recipe-brewing
npm ci
npm run dev
```

Open the local URL printed by Vite. `npm ci` installs the versions recorded in `package-lock.json` and its `prepare` step installs the Git hooks. If using nvm, run `nvm use` first.

The commands above check out the recipe-brewing branch after it has been pushed. Check out the relevant story or task branch when reviewing other work.

## Mix and brew

- **Start Game** opens the Level 1 workbench with six ingredients, a random Medium recipe, zero score, three lives, and `02:30` on the clock. Each ingredient receives its own random integer stock from **2 to 15**, and the cauldron starts empty. All eight official ingredients are catalogued; Phoenix Feather and Toad Slime remain off the Level 1 shelf.
- **Select an ingredient** to spend one portion and add it to the cauldron. Duplicate ingredients are allowed, and the four mixture positions preserve addition order. A full cauldron rejects further additions without spending stock. When stock reaches zero, the card loses its illustration, keeps its `0` badge, and becomes disabled and unavailable to keyboard focus.
- **Watch the gauges** update from the raw Temperature, Density, and Magic Power sums. Zero stays centered; each gauge expands its symmetric scale when needed. Values are never clamped: four portions of Essence of the Void produce **−80 / −40 / 160**. Markers move with CSS transitions, and a value inside its displayed recipe range gains green feedback and an **In range** label.
- **Brew potion** becomes available with at least one portion. All three raw totals must fall inside their recipe ranges expanded by **±8**, including both endpoints. Success earns **200 points**, adds up to **10 seconds** without exceeding **150 seconds**, and selects another random Medium recipe. Failure costs **one life** and keeps the same recipe. Both outcomes empty the cauldron, reset totals and the counter to zero, and keep all used stock spent.
- **Read the brew result** to see the recipe just checked, its raw mixture totals, each parameter's accepted range and pass/fail status, and the score, time, and life changes. The result remains visible after the cauldron clears; adding the next portion clears that result.
- **Play again** starts a fresh game from the minimal Game Over dialog, with reset score and lives, fresh stock, and a new random recipe. A run ends when lives reach zero, or after its final stocked mixture is brewed and both the shelf and cauldron are empty.
- **Help** explains the intended game rules. **Menu** opens the new-game action and leaderboard. The leaderboard currently shows its empty state.
- **Pause / Resume** blurs and restores the workbench while preserving the run. The visibility-change handler pauses an active workbench when its browser tab becomes hidden; returning requires Resume. Ingredient additions and brewing are blocked while paused or while a dialog is open.
- **Menu → Start new game** resets the run after confirmation. Dialog navigation and canceled confirmations preserve the current run. A confirmed **Exit to start** discards it and returns to the welcome screen.
- **Tab / Shift+Tab** navigate buttons and stay inside an open dialog. **Escape** closes ordinary dialogs or returns to their previous dialog; Pause remains open until Resume or Exit is chosen.

The welcome screen has no ingredient stock, no recipe targets, no life icons, and zero score and time. Game elements are authored with inline SVG and CSS; no bitmap assets or runtime libraries are used.

The catalogue contains all **20 official recipes**. Level 1 selects only the **seven Medium recipes**, at the start and after successful brews. Immediate repeats are allowed. Selection does not filter for recipes that can be made with the remaining stock. Gauge feedback uses the original displayed ranges; the brew result checks the wider ranges with the ±8 tolerance.

The countdown, shrinking time bar, timestamp-based timing, saved games, leaderboard persistence, difficulty selection, and Level 3 features are pending. The clock currently stays at **02:30**: the countdown is inactive, every game begins at the time cap, and successful brews cannot raise it further. The pure brewing logic applies and tests the bonus when the remaining time is below that cap.

The **150-second cap** follows the [README difficulty table](https://github.com/rolling-scopes-school/qualifying-stage/tree/main/tasks/game-alchemists-cauldron#difficulty-table) and [US 1.4](https://github.com/rolling-scopes-school/qualifying-stage/blob/main/tasks/game-alchemists-cauldron/user_story_1.4.md), which caps bonuses at the starting time. [US 1.3](https://github.com/rolling-scopes-school/qualifying-stage/blob/main/tasks/game-alchemists-cauldron/user_story_1.3.md) still contains an inconsistent 120-second cap; this implementation uses the shared Medium rules.

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
| `npm test`             | Run ingredient and brewing regression tests   |
| `npm run check`        | Run lint, formatting, tests, and build checks |
| `npm run build`        | Create the production build in `dist/`        |
| `npm run preview`      | Serve the production build locally            |

Before opening a PR, run `npm run check`. To inspect the production result, run `npm run build`, then `npm run preview`. The GitHub Actions checks workflow installs dependencies and runs `npm run check` on pushes and pull requests.

`npm test` runs Node's built-in test runner with `--experimental-strip-types`, importing the pure TypeScript modules directly without a test framework. There are **22 regression tests**: nine ingredient-system tests and thirteen recipe-brewing tests. They cover:

- The eight official ingredient definitions, six-item Level 1 shelf, safe ID lookup, and all twenty recipe definitions and ranges.
- Six independent stock draws, all fourteen possible stock values, seven Medium recipe choices, allowed recipe repeats, and invalid random-source rejection.
- Ordered duplicate additions, exact stock consumption, immutable input, and unchanged-state rejection for full cauldrons, empty stock, unknown IDs, and off-shelf ingredients.
- Inclusive ±8 checks for all three parameters, negative ranges, raw values above 100, and recalculation from ingredients when cached totals are wrong.
- Success and failure score/life changes, the actual clamped time bonus, and feedback snapshots of the recipe and totals checked before clearing.
- Repeated brews with the same spent inventory and no stock refill, with recipe changes only on success.
- No-op empty and ended-game brews without life costs or random draws, last-life and stock-depletion endings, and fresh-game resets that preserve the previous state.

TypeScript strict mode is enabled, including unchecked index access and exact optional properties. ESLint rejects explicit `any`, non-null assertions, `console.log`, and debugger statements. Prettier owns code formatting.

The `commit-msg` hook checks lowercase Conventional Commit syntax, including optional scopes, breaking-change markers, and separated bodies. Keep descriptions in the imperative present tense when reviewing commits. The `pre-push` hook runs ESLint and Prettier checks and blocks a push if either fails. Run `npm run prepare` to reinstall the hooks after a fresh checkout if needed.

Vite builds with relative asset paths, so `dist/` can be served from a repository subdirectory such as GitHub Pages. A public deployment will be added when preparing the story submission.

## Source architecture

```text
src/
  main.ts                  Application entry point
  data/
    ingredients.ts         Eight-item catalogue and Level 1 shelf selection
    recipes.ts             Twenty-recipe catalogue and seven-item Medium pool
  logic/
    ingredients.ts         Stock creation, pure additions, validation and totals
    brewing.ts             Recipe selection, tolerance checks and brew transitions
  state/
    game.ts                Readonly run state and fresh Medium game creation
  storage/                 Future saved-game and leaderboard persistence
  ui/
    game-controller.ts     Input handling, screen state and dialog navigation
    game-view.ts           Shelf, gauges, recipe, score, lives and brew results
    parameters.ts          Shared parameter names, icons and display metadata
    dialogs.ts             Help, menu, pause, confirmations and Game Over
    icons.ts               Shared interface icons
    illustrations.ts       Cauldron, ingredient and workshop SVG artwork
  styles/                  Stylesheets and responsive layout
  assets/                  Authored assets, if needed
tests/
  ingredient-system.test.mjs
  recipe-brewing.test.mjs
```

Ingredient and recipe catalogues live in `data/`; pure mixing and brewing rules live in `logic/`. `state/game.ts` creates the Medium run state. The controller routes player actions through the pure transitions, and the view renders the resulting state and brew feedback. Pure modules have no DOM dependencies. Countdown timing and browser persistence will gain implementations in later stories.

## Milestones

| Stage   | Scope                                                                                          |
| ------- | ---------------------------------------------------------------------------------------------- |
| Story 1 | Repository, folder structure, bundler, strict TypeScript, ESLint, Prettier and Git hooks       |
| Level 1 | Shelf and cauldron, parameter bars, recipes and brewing, timer, lives, pause and Top-10 scores |
| Level 2 | Easy/Medium/Hard selection, automatic saves and Continue Game                                  |
| Level 3 | Drag and drop, tooltips, reactions, Pour Out, visual feedback and keyboard shortcuts           |

The ingredient shelf, ordered cauldron, live parameter bars, recipes, and brewing are implemented, including score/life changes and minimal life/stock Game Over handling. Continue Level 1 with timestamp-based countdown timing, the complete timer/Game Over flow, and the leaderboard. Level 1 uses the Medium rules: 6 shelf ingredients, capacity 4, 150 seconds, 3 lives, tolerance ±8, +200 score and +10 seconds per successful brew. Reactions are added in Level 3.

The finished game must work in the latest Google Chrome across widths from **375 px to 1920 px**. Keep game elements as separate components; this implementation uses CSS and SVG, including the CSS/SVG ingredient icons required by US 1.1. Use the assignment's ingredient and recipe tables as the authoritative data.

## Branches and pull requests

Follow the [assignment repository workflow](https://github.com/rolling-scopes-school/qualifying-stage/tree/main/tasks/game-alchemists-cauldron#repository-workflow):

1. Create `story-1` from `main` (or `master` in a repository using that default).
2. Create a separate task branch from the current story branch. The setup task uses `chore/project-setup`, based on `story-1`. Feature work continues through `feat/game-draft`, `feat/ingredient-system`, and the current `feat/recipe-brewing` branch.
3. Keep commits small and focused. Review task changes through a PR targeting the current story branch before integrating them.
4. When a story is finished, open its final PR to the preceding branch. For Story 1, this is `story-1` → `main`.
5. **Keep the final story PR unmerged** and submit its link in RS App through **Cross-Check: Submit**.

Commit messages follow the [RS School Git convention](https://rs.school/docs/git-convention): a lowercase type, optional scope, and a short imperative description, for example `chore: configure project tooling`, `feat: add ingredient shelf` or `docs: explain local setup`.

The [project PR template](.github/pull_request_template.md) follows the [official RS School requirements](https://rs.school/docs/mentoring/pull-request-review-process#pull-request-requirements-pr): task link, screenshot, deployment link, completion/deadline dates and a scored self-check. Fill these with actual evidence when preparing the final story PR.

## Assignment references

- [Game brief and all user stories](https://github.com/rolling-scopes-school/qualifying-stage/tree/main/tasks/game-alchemists-cauldron)
- [Story 1 setup requirements](https://github.com/rolling-scopes-school/qualifying-stage/blob/main/tasks/game-alchemists-cauldron/precondition-user-story.md)
- [Common requirements and penalties](https://github.com/rolling-scopes-school/qualifying-stage/blob/main/tasks/game-alchemists-cauldron/common-requirements.md)
