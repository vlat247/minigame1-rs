# Product

## Register

product

## Users

Players of the RS School browser mini-game and reviewers checking the assignment. The game must work in Chrome at widths from 375px to 1920px, using mouse, touch buttons, and native keyboard navigation.

## Product Purpose

Mix limited-stock ingredients to match three recipe ranges before time or lives run out. Level 1 gameplay and Level 2 difficulty selection and saved-game continuation are implemented on `feat/difficulty-persistence`. Shelf ingredients receive independent random stocks of 2–15, additions spend one portion, and the cauldron preserves ordered portions, including duplicates. All eight official ingredients and twenty official recipes are catalogued.

Choose difficulty in Menu before a run. Medium is the default. Difficulty cannot change during an unfinished run, including while paused; finishing or confirming exit makes it available again.

| Difficulty | Shelf ingredients | Cauldron capacity | Starting time | Tolerance | Lives | Points per success | Time per success |
| ---------- | ----------------- | ----------------- | ------------- | --------- | ----- | ------------------ | ---------------- |
| Easy       | 4                 | 4                 | 180 seconds   | ±12       | 5     | 100                | +15 seconds      |
| Medium     | 6                 | 4                 | 150 seconds   | ±8        | 3     | 200                | +10 seconds      |
| Hard       | 8                 | 5                 | 150 seconds   | ±5        | 3     | 300                | +5 seconds       |

Bonuses are capped at the difficulty's starting time. Reaction counts are configured for future Level 3 work (0/2/3 for Easy/Medium/Hard), but reactions are not enabled yet.

The live gauges show raw totals on symmetric scales centered at zero, expanding to include values outside ±100. CSS transitions move the markers; green feedback and an **In range** label indicate a match with the displayed recipe range. Empty-stock cards retain their zero badge, remove the ingredient illustration, and become disabled and unavailable to keyboard focus.

Randomly select from the chosen difficulty's recipe pool at the start and after each successful brew. Medium uses the seven Medium recipes required by Level 1. Repeats are allowed, and selection does not filter by remaining stock. With at least one portion, Brew checks all three raw totals against inclusive ranges expanded by the selected tolerance. Success earns the selected score and capped time bonus, then chooses another recipe. Failure loses one life and keeps the recipe. Both outcomes clear the cauldron, totals, and counter without refunding ingredients.

The result panel preserves the recipe just checked, raw totals, accepted ranges, individual pass/fail results, and actual score/time/life changes until another portion is added.

Timed sessions use the selected starting time and lives. The timestamp-based countdown drives the MM:SS display and shrinking time bar. Below 15 seconds, the timer turns red and pulses unless reduced motion is requested. Reconcile elapsed time before ingredient additions and brews so an expired run cannot receive an extra action or time bonus.

Pause freezes the clock without losing fractional seconds, blocks gameplay, and blurs the workbench and brew results. Resume continues the same score, lives, mixture, stock, recipe, and remaining time. Switching tabs pauses automatically; returning requires Resume. Help, Menu, and Leaderboard keep the clock running unless the player pauses first.

Game Over occurs when time expires, lives reach zero, or both the shelf and cauldron are empty. The final stocked mixture remains brewable. Show the reason, final score, potions brewed, and active time played. Play again resets the complete run with the same difficulty, including time and stock; Menu → Start new game also resets it after confirmation. Timers are cleaned up when runs end, restart, exit, or unmount.

Autosave the unfinished run after gameplay changes and pause changes, approximately once per countdown second, and on page hide or departure. The versioned `src/storage/save.ts` schema records difficulty, score, exact remaining time, lives, canonical recipe, ordered cauldron ingredients, shelf stock, play/pause status, and elapsed active time under `alchemists-cauldron:game-save:v1`. Validate untrusted data and recalculate mixture totals when loading. Missing, invalid, incompatible, or inaccessible saves never crash the game; reject invalid saves and remove them when storage permits.

Show Continue Game on the start screen and in Menu only when a valid unfinished save exists. Restore the saved difficulty, score, lives, time, recipe, stock, mixture, and active time in a paused state, requiring Resume. Do not deduct offline time. A new game overwrites the save; confirmed Exit to start and game completion clear it. Canceled confirmations preserve it.

Each difficulty has a separate Top-10 leaderboard in localStorage, with controls to switch the displayed board. Prompt for a name only when a result qualifies for its own difficulty, including zero scores while vacancies exist. Accept 2–15 Unicode letters, decimal digits, spaces, `_`, or `-` after trimming and NFC normalization. Escape player names in generated markup. Save each finished run at most once, using its completion timestamp. Rank by descending score, then earlier completion time; a new score tying the tenth result does not qualify. Display rank, name, score, difficulty, and DD.MM.YYYY HH:MM in the browser's local time. Clearing results requires an in-app confirmation and affects only the selected board. Medium preserves existing scores under `alchemists-cauldron:leaderboard:v1`; Easy and Hard use separate keys. Corrupt data and blocked storage remain nonfatal; when persistence is unavailable, retain results for the current visit and explain that limitation.

Level 3 reactions, drag and drop, tooltips, Pour Out, keyboard shortcuts, and additional visual feedback remain for later branches. Public deployment and final story submission are still pending.

## Brand Personality

A dark fantasy alchemy workshop moving toward a pixel-art visual style on `feat/app-redesign`. The first pass replaces the eight ingredients with original 32 × 32 SVG sprites inspired by pixel-art inventory illustrations: stepped warm dark outlines, limited palettes, top-left highlights, and distinct silhouettes. Show the sprites on small parchment tiles and reuse them in mixture slots. Keep the brass frames, wooden cabinet, shaded iron cauldron, green magical light, and parchment recipe during this ingredient-focused pass. Controls and numerical values take priority over ornament.

## Anti-references

Avoid marketing landing-page layouts, dashboard metric-card grids, bright application-style surfaces, flat clip-art cauldrons, and decorative copy that obscures the rules. Restrict green glow to the cauldron, recipe targets, and primary game action. Use authored SVG/CSS instead of bitmap game assets while the assignment's image wording remains inconsistent.

## Design Principles

- Make the recipe, ingredient stock, and three parameters readable together.
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
