# Game and release QA

Current release branch: `feat/release-finalcheck`, based on `story-3`. The visual feedback checks below were completed on `chore/visual-feedback-and-qa` before its merge.

## Automated validation

`npm run release:check` passed on **23 October 2026**: ESLint, Prettier, all **169 tests**, strict TypeScript, the Vite production build, and the production asset check. The original 151 tests cover difficulty rules, ingredients, reactions, brewing, timing, saves, leaderboards, shortcuts, and tooltip positioning; 18 release tests cover valid artifacts and broken asset references. The current build contains 9 files and 9 checked local resource references. No runtime dependencies were added.

## Production build checks — 23 October 2026

Tested the built game in the available Codex in-app browser at `http://127.0.0.1:4173/minigame1-rs/`, using Vite's production preview with the repository subdirectory. Standalone Google Chrome was not available in the browser inventory; its public-build check remains pending.

- The compiled page, local Pixelify Sans styling, favicon reference, and all visible shelf sprites load under the repository path.
- A Medium Void Ember brew using `16` succeeds and awards 200 points. Pause → reload → Continue restores that score and remaining time paused, without a stale effect.
- Exhausting Easy stock leaves the last stocked mixture brewable. Pour Out then ends the run with **Out of ingredients.** and no remaining shelf portions.
- A qualifying local result saves once and appears in the Easy board with the expected name, score, difficulty, and date format.
- The production Hard board and three-portion mixture fit all eight viewports listed below (375–1920px wide), with every ingredient, gauge, Brew, and Pour Out inside the viewport and no document overflow. No browser console errors were recorded during these checks.

Production screenshots: [desktop](docs/screenshots/release-desktop.png), [mobile](docs/screenshots/release-mobile.png).

## Browser checks

Tested locally in the Codex in-app browser on **22 October 2026**. These are local checks; the deployed game still needs its final check in the latest standalone Google Chrome.

| Viewport    | Check                                                                | Result                                                                        |
| ----------- | -------------------------------------------------------------------- | ----------------------------------------------------------------------------- |
| 375 × 500   | Hard shelf, five mixture slots, previews, brew results, and controls | Fits without horizontal overflow; slots and results stay inside their station |
| 375 × 667   | Easy mixture, all three target glows, and successful brew            | Passed                                                                        |
| 375 × 812   | Hard shelf, five portions, and full-width gauges                     | Passed                                                                        |
| 600 × 375   | Hard shelf, full cauldron, recipe, gauges, and actions               | Passed; fluid landscape columns fit                                           |
| 667 × 375   | Hard board and five portions                                         | Passed                                                                        |
| 768 × 1024  | Hard portrait board                                                  | Passed                                                                        |
| 1280 × 800  | Hard desktop board                                                   | Passed                                                                        |
| 1920 × 1080 | Hard desktop board                                                   | Passed                                                                        |

Document dimensions matched each tested viewport. Ingredient controls, gauges, Brew, and Pour Out stayed within the viewport. The compact layout fixes also reserve space for the ordered mixture slots and the result panel.

Verified interactions:

- Two successive successful Easy brews and a successful Hard brew play fresh success effects and award the expected score. The floating time text uses the actual capped bonus, including fractional bonuses.
- Repeated failures replay the explosion and brief shake. The final-life failure still creates its effect and opens Game Over immediately.
- CSS animation completion removes temporary effects. Adding an ingredient during an effect clears it immediately; controls remain usable.
- Current portions float inside the cauldron, including five portions with duplicate ingredients. Brew, Pour Out, and Volatile Mix remove cleared portions.
- All three exact recipe matches produce green target-zone glow while retaining numerical and text feedback.
- Pause clears temporary brew effects and pauses floating icons. Resume preserves the mixture without replaying a previous burst.
- Reload → Continue restores score, time, stock, and mixture paused, with no stale effect.
- Dragging with Preview enabled adds exactly one portion, consumes exactly one stock, and updates the floating icon. Number shortcuts, Brew, Pour Out, Preview, Escape, and Pause remain usable.

Reduced-motion behavior was reviewed in code: CSS disables animation, the effect adapter skips temporary bursts and shake, and preference changes clear active effects. Icons and persistent result text remain available. A live operating-system reduced-motion toggle was not exercised in this browser session.

## Repeatable brew fixtures

Start a fresh run, read its recipe, then use the listed number keys followed by **B**. Every fixture uses at most two portions of one ingredient, so a fresh shelf always has enough stock. These fixtures use the configured reaction rules and brewing tolerance.

| Difficulty | Recipe → keys                                                                                                                                 |
| ---------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| Easy       | Moon Mist → `12`; Root Bloom → `24`; Frost Steam → `13`; Quiet Swirl → `34`; Bright Dew → `124`; Snow Dust → `234`                            |
| Medium     | Acid Spark → `5`; Void Ember → `16`; Heavy Acid → `45`; Frost Acid → `35`; Dusty Void → `16`; Dragon Void → `116`; Rooted Night → `246`       |
| Hard       | Phoenix Pulse → `27`; Slime Crown → `48`; Void Flame → `116`; Acid Bog → `58`; Frozen Ash → `347`; Triple Eclipse → `246`; Ember Soup → `278` |

For exact target glow, Easy Snow Dust with `234` matches all three displayed ranges. Some other fixtures succeed through difficulty tolerance without matching every displayed target zone.

## Remaining delivery checks

- Publish the production build and check the public URL in the latest Google Chrome, including a device with reduced motion enabled.
- Add the deployment URL, current screenshots, dates, and scored self-check to the final story PR.
- Merge the release task PR into `story-3`; keep the final `story-3` → `story-2` submission PR unmerged, following the assignment workflow.

See [RELEASE.md](RELEASE.md) for Pages activation, workflow behavior, the implementation inventory, and final submission evidence.
