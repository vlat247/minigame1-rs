# Alchemist's Cauldron

A browser game for the [RS School qualifying-stage assignment](https://github.com/rolling-scopes-school/qualifying-stage/tree/main/tasks/game-alchemists-cauldron). Mix limited-stock ingredients, match a recipe's Temperature, Density and Magic Power ranges, and brew potions before time or lives run out.

## Current status

Project setup is complete. The current branch, **`feat/game-draft`**, adds a responsive visual draft and working screen navigation. It is a preview of the game interface; a playable game will be implemented through the remaining feature branches.

The application uses TypeScript and browser APIs, with Vite for development and production builds. Gameplay must use no frameworks, game engines or runtime libraries. ESLint, Prettier and Husky support development checks.

## Run locally

Use **Node.js 22.13+ on the 22.x line**, or **Node.js 24+**. **Node.js 24** is recommended, recorded in `.nvmrc`, and used by CI. npm is included with Node.js.

```sh
git clone https://github.com/vlat247/minigame1-rs.git
cd minigame1-rs
git switch feat/game-draft
npm ci
npm run dev
```

Open the local URL printed by Vite. `npm ci` installs the versions recorded in `package-lock.json` and its `prepare` step installs the Git hooks. If using nvm, run `nvm use` first.

The commands above check out the draft branch after it has been pushed. Check out the relevant story or task branch when reviewing other work.

## Preview the draft

- **Start Game** opens a static Medium-mode workbench with six ingredient cards, an empty cauldron, Acid Spark recipe targets, three parameter bars, a score of zero, three lives, and `02:30` on the clock.
- **Help** explains the intended game rules. **Menu** opens the new-game action and leaderboard. The leaderboard currently shows its empty state.
- **Pause / Resume** blurs and restores the workbench. The visibility-change handler pauses an active preview when its browser tab becomes hidden; returning requires Resume.
- **Exit to start** and **Start new game** use custom confirmation dialogs when a preview is open. Canceling preserves the current preview.
- **Tab / Shift+Tab** navigate buttons and stay inside an open dialog. **Escape** closes ordinary dialogs or returns to their previous dialog; Pause remains open until Resume or Exit is chosen.

The welcome screen has no ingredient stock, no recipe targets, no life icons, and zero score and time. Game elements are authored with inline SVG and CSS; no bitmap assets or runtime libraries are used.

Ingredient values match the assignment. Stocks are **fixed demonstration values**, not random game inventory, and the recipe is fixed to **Acid Spark**. Ingredient adding, brewing, scoring, countdown timing, actual leaderboard storage, difficulty selection, reactions, and save/continue are pending. Ingredient and Brew buttons are intentionally disabled, with visible preview explanations.

The responsive layout uses three columns on desktop, a station-first layout on tablets, and a two-column ingredient shelf on phones. Styles support reduced motion and visible keyboard focus.

| Command                | Purpose                                       |
| ---------------------- | --------------------------------------------- |
| `npm ci`               | Install dependencies from the lockfile        |
| `npm run dev`          | Start the development server                  |
| `npm run typecheck`    | Check TypeScript types without emitting files |
| `npm run lint`         | Check source code with ESLint                 |
| `npm run format`       | Format supported project files with Prettier  |
| `npm run format:check` | Check formatting without changing files       |
| `npm run check`        | Run the project's verification checks         |
| `npm run build`        | Create the production build in `dist/`        |
| `npm run preview`      | Serve the production build locally            |

Before opening a PR, run `npm run check`. To inspect the production result, run `npm run build`, then `npm run preview`. The GitHub Actions checks workflow installs dependencies and runs `npm run check` on pushes and pull requests.

TypeScript strict mode is enabled, including unchecked index access and exact optional properties. ESLint rejects explicit `any`, non-null assertions, `console.log`, and debugger statements. Prettier owns code formatting.

The `commit-msg` hook checks lowercase Conventional Commit syntax, including optional scopes, breaking-change markers, and separated bodies. Keep descriptions in the imperative present tense when reviewing commits. The `pre-push` hook runs ESLint and Prettier checks and blocks a push if either fails. Run `npm run prepare` to reinstall the hooks after a fresh checkout if needed.

Vite builds with relative asset paths, so `dist/` can be served from a repository subdirectory such as GitHub Pages. A public deployment will be added when preparing the story submission.

## Source architecture

```text
src/
  main.ts       Application entry point
  data/         Ingredient catalogue, recipes and difficulty settings
  logic/        Calculations, stock rules, brewing checks and timing
  state/        Game state and its transitions
  storage/      Local storage access, saved games and leaderboard
  ui/           DOM rendering, controls and dialogs
  styles/       Stylesheets and responsive layout
  assets/       Authored SVG assets, if needed
```

Game rules belong in `logic/`, separate from DOM rendering in `ui/`. Shared game data belongs in `data/`; state and browser persistence have their own modules. These folders are prepared during setup and will gain implementations as their stories are built.

## Milestones

| Stage   | Scope                                                                                          |
| ------- | ---------------------------------------------------------------------------------------------- |
| Story 1 | Repository, folder structure, bundler, strict TypeScript, ESLint, Prettier and Git hooks       |
| Level 1 | Shelf and cauldron, parameter bars, recipes and brewing, timer, lives, pause and Top-10 scores |
| Level 2 | Easy/Medium/Hard selection, automatic saves and Continue Game                                  |
| Level 3 | Drag and drop, tooltips, reactions, Pour Out, visual feedback and keyboard shortcuts           |

Build Level 1 in story order, starting with **US 1.1: Ingredient Shelf & Cauldron**. Level 1 uses the Medium rules: 6 shelf ingredients, capacity 4, 150 seconds, 3 lives, tolerance ±8, +200 score and +10 seconds per successful brew. Reactions are added in Level 3.

The finished game must work in the latest Google Chrome across widths from **375 px to 1920 px**. Draw game elements with CSS, SVG, or text symbols; do not use image assets or icon fonts. Use the assignment's ingredient and recipe tables as the authoritative data.

## Branches and pull requests

Follow the [assignment repository workflow](https://github.com/rolling-scopes-school/qualifying-stage/tree/main/tasks/game-alchemists-cauldron#repository-workflow):

1. Create `story-1` from `main` (or `master` in a repository using that default).
2. Create a separate task branch from the current story branch. The setup task uses `chore/project-setup`, based on `story-1`. The current `feat/game-draft` branch inherits the completed setup commit.
3. Keep commits small and focused. Review task changes through a PR targeting the current story branch before integrating them.
4. When a story is finished, open its final PR to the preceding branch. For Story 1, this is `story-1` → `main`.
5. **Keep the final story PR unmerged** and submit its link in RS App through **Cross-Check: Submit**.

Commit messages follow the [RS School Git convention](https://rs.school/docs/git-convention): a lowercase type, optional scope, and a short imperative description, for example `chore: configure project tooling`, `feat: add ingredient shelf` or `docs: explain local setup`.

The [project PR template](.github/pull_request_template.md) follows the [official RS School requirements](https://rs.school/docs/mentoring/pull-request-review-process#pull-request-requirements-pr): task link, screenshot, deployment link, completion/deadline dates and a scored self-check. Fill these with actual evidence when preparing the final story PR.

## Assignment references

- [Game brief and all user stories](https://github.com/rolling-scopes-school/qualifying-stage/tree/main/tasks/game-alchemists-cauldron)
- [Story 1 setup requirements](https://github.com/rolling-scopes-school/qualifying-stage/blob/main/tasks/game-alchemists-cauldron/precondition-user-story.md)
- [Common requirements and penalties](https://github.com/rolling-scopes-school/qualifying-stage/blob/main/tasks/game-alchemists-cauldron/common-requirements.md)
