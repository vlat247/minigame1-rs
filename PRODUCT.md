# Product

## Register

product

## Users

Players of the RS School browser mini-game and reviewers checking the assignment. The game must work in Chrome at widths from 375px to 1920px, using mouse, touch buttons, and native keyboard navigation.

## Product Purpose

Mix limited-stock ingredients to match three recipe ranges before time or lives run out. `feat/app-redesign` builds on completed Level 1 gameplay and Level 2 difficulty selection and saved-game continuation. Shelf ingredients receive independent random stocks of 2–15, additions spend one portion, and the cauldron preserves ordered portions, including duplicates. All eight official ingredients and twenty official recipes are catalogued.

Choose difficulty in Menu before a run. Medium is the default. Difficulty cannot change during an unfinished run, including while paused; finishing or confirming exit makes it available again.

| Difficulty | Shelf ingredients | Cauldron capacity | Starting time | Tolerance | Lives | Points per success | Time per success |
| ---------- | ----------------- | ----------------- | ------------- | --------- | ----- | ------------------ | ---------------- |
| Easy       | 4                 | 4                 | 180 seconds   | ±12       | 5     | 100                | +15 seconds      |
| Medium     | 6                 | 4                 | 150 seconds   | ±8        | 3     | 200                | +10 seconds      |
| Hard       | 8                 | 5                 | 150 seconds   | ±5        | 3     | 300                | +5 seconds       |

Bonuses are capped at the difficulty's starting time. Reaction counts are configured for future Level 3 work (0/2/3 for Easy/Medium/Hard), but reactions are not enabled yet.

The live gauges show raw totals on symmetric scales centered at zero, expanding to include values outside ±100. CSS transitions move the markers; green feedback and an **In range** label indicate a match with the displayed recipe range. Empty-stock cards retain their zero badge, remove the ingredient illustration, and become disabled and unavailable to keyboard focus.

Randomly select from the chosen difficulty's recipe pool at the start and after each successful brew. Medium uses the seven Medium recipes required by Level 1. Repeats are allowed, and selection does not filter by remaining stock. With at least one portion, Brew checks all three raw totals against inclusive ranges expanded by the selected tolerance. Success earns the selected score and capped time bonus, then chooses another recipe. Failure loses one life and keeps the recipe. Both outcomes clear the cauldron, totals, and counter without refunding ingredients.

The result panel replaces the cauldron scene after brewing and preserves the recipe just checked, raw totals, accepted ranges, individual pass/fail results, and actual score/time/life changes until another portion is added. The next ingredient restores the cauldron scene. Results reuse the same space so the board never grows after a brew.

Timed sessions use the selected starting time and lives. The timestamp-based countdown drives the MM:SS display and shrinking time bar. Below 15 seconds, the timer turns red and pulses unless reduced motion is requested. Reconcile elapsed time before ingredient additions and brews so an expired run cannot receive an extra action or time bonus.

Pause freezes the clock without losing fractional seconds, blocks gameplay, and blurs the workbench and brew results. Resume continues the same score, lives, mixture, stock, recipe, and remaining time. Switching tabs pauses automatically; returning requires Resume. Help, Menu, and Leaderboard keep the clock running unless the player pauses first.

Game Over occurs when time expires, lives reach zero, or both the shelf and cauldron are empty. The final stocked mixture remains brewable. Show the reason, final score, potions brewed, and active time played. Play again resets the complete run with the same difficulty, including time and stock; Menu → Start new game also resets it after confirmation. Timers are cleaned up when runs end, restart, exit, or unmount.

Autosave the unfinished run after gameplay changes and pause changes, approximately once per countdown second, and on page hide or departure. The versioned `src/storage/save.ts` schema records difficulty, score, exact remaining time, lives, canonical recipe, ordered cauldron ingredients, shelf stock, play/pause status, and elapsed active time under `alchemists-cauldron:game-save:v1`. Validate untrusted data and recalculate mixture totals when loading. Missing, invalid, incompatible, or inaccessible saves never crash the game; reject invalid saves and remove them when storage permits.

Show Continue Game on the start screen and in Menu only when a valid unfinished save exists. Restore the saved difficulty, score, lives, time, recipe, stock, mixture, and active time in a paused state, requiring Resume. Do not deduct offline time. A new game overwrites the save; confirmed Exit to start and game completion clear it. Canceled confirmations preserve it.

Each difficulty has a separate Top-10 leaderboard in localStorage, with controls to switch the displayed board. Prompt for a name only when a result qualifies for its own difficulty, including zero scores while vacancies exist. Accept 2–15 Unicode letters, decimal digits, spaces, `_`, or `-` after trimming and NFC normalization. Escape player names in generated markup. Save each finished run at most once, using its completion timestamp. Rank by descending score, then earlier completion time; a new score tying the tenth result does not qualify. Display rank, name, score, difficulty, and DD.MM.YYYY HH:MM in the browser's local time. Clearing results requires an in-app confirmation and affects only the selected board. Medium preserves existing scores under `alchemists-cauldron:leaderboard:v1`; Easy and Hard use separate keys. Corrupt data and blocked storage remain nonfatal; when persistence is unavailable, retain results for the current visit and explain that limitation.

Level 3 reactions, drag and drop, tooltips, Pour Out, keyboard shortcuts, and additional visual feedback remain for later branches. Public deployment and final story submission are still pending.

## Brand Personality

A dark charcoal and violet pixel-art alchemy workshop on `feat/app-redesign`, with stepped borders, restrained brass details, an original pixel-art iron cauldron, and a compact dark recipe panel. The original SVG scenery from `workshopScenery()` depicts stone masonry, an arched niche, shelves, bottles, and a small candle using crisp pixel geometry. Eight original 32 × 32 SVG ingredient sprites use warm dark outlines, limited palettes, top-left highlights, and distinct silhouettes. Present ingredients in one compact column on wide screens, with rows spanning the shelf width; use two ingredient columns on resized and smaller screens. Each item shows its sprite, name, inline Temperature/Density/Magic values, and stock at the right. Reuse the sprites in mixture slots. Controls and numerical values take priority over ornament.

Draw the cauldron with stepped solid SVG shapes on a low-resolution grid using a limited charcoal, brass, and lime palette. The empty state has a dark interior; the filled state adds lime liquid, a brighter rune, and pixel bubbles and steam. Animate those effects with CSS steps, pause them with the game, and respect reduced motion. Preserve descriptive image labels for both states and the approved layout around the artwork.

Use locally bundled Pixelify Sans across all text, including labels, scores, buttons, forms, and dialogs. Keep a shared type scale and readable captions. Temperature, Density, and Magic Power use filled 16 × 16 pixel icons with crisp stepped geometry and their existing semantic colors.

Use the full browser width without a maximum-width cap. Fit the board to the visible viewport on desktop, portrait mobile, and short landscape screens, with no document or play-panel scrolling. Keep ingredient rows compact and adapt their height instead of stretching them into large cards. Keep the gauge area across the full playfield width below the ingredient shelf, cauldron, and recipe at every screen size. Tall portrait screens retain the cauldron scene; compact portrait and short landscape use a smaller scene and compact recipe, with targets visible on the gauges. Keep all shelf ingredients, recipe ranges, gauges, and brew controls visible together. Continue Game shares the primary action row when available. Remove the footer legend and static advice. Help and Menu modal bodies may scroll when their content exceeds the viewport.

## Anti-references

Avoid marketing landing-page layouts, dashboard metric-card grids, bright application-style surfaces, flat clip-art cauldrons, and decorative copy that obscures the rules. Use violet for primary controls and green for successful matches and the cauldron liquid. Keep the workshop background subdued behind the controls. Use authored SVG/CSS instead of bitmap game assets while the assignment's image wording remains inconsistent.

## Design Principles

- Make the recipe, ingredient stock, and three parameters readable together.
- Keep the play board within the visible viewport; reuse the cauldron area for brew results instead of adding another panel below it.
- Keep the welcome state empty and the primary action clear.
- Use CSS and individually authored SVG assets for game elements.
- Make remaining time and lives easy to read without relying on color alone.
- Preserve each brew's result after clearing the cauldron, with explicit pass/fail text for every parameter.
- Show spent stock and full-cauldron feedback without changing the underlying rules.
- Keep navigation predictable and preserve the mixture and inventory through pause, dialogs, and canceled confirmations. Confirmed new games reset them; confirmed exits discard them.
- Keep completed-result storage separate from unfinished-game saves, and make storage failures understandable without interrupting play.
- Preserve each difficulty's independent score board and restore saved runs paused with no offline time loss.

## Accessibility & Inclusion

Use semantic headings and native buttons and dialogs, visible keyboard focus, sufficient text contrast, descriptive numerical labels, and reduced-motion support. Do not communicate parameter or game states through color alone. Give name validation errors clear text, preserve form input through dialog navigation, and keep leaderboard names and dates readable on narrow screens.
