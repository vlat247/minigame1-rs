# Product

## Register

product

## Users

Players of the RS School browser mini-game and reviewers checking the assignment. The game must work in Chrome at widths from 375px to 1920px, using mouse, touch buttons, and native keyboard navigation.

## Product Purpose

Mix limited-stock ingredients to match three recipe ranges before time or lives run out. Ingredient mixing and brewing are functional: the six Level 1 ingredients receive independent random stocks of 2–15, additions spend one portion, and the cauldron preserves up to four ordered portions, including duplicates. All eight official ingredients and twenty official recipes are catalogued.

The live gauges show raw totals on symmetric scales centered at zero, expanding to include values outside ±100. CSS transitions move the markers; green feedback and an **In range** label indicate a match with the displayed recipe range. Empty-stock cards retain their zero badge, remove the ingredient illustration, and become disabled and unavailable to keyboard focus.

Level 1 randomly selects from the seven Medium recipes at the start and after each successful brew. Repeats are allowed, and selection does not filter by remaining stock. With at least one portion, Brew checks all three raw totals against inclusive ±8 ranges. Success earns 200 points, adds up to 10 seconds capped at 150, and selects another recipe. Failure loses one life and keeps the recipe. Both outcomes clear the cauldron, totals, and counter without refunding ingredients.

The result panel preserves the recipe just checked, raw totals, accepted ranges, individual pass/fail results, and actual score/time/life changes until another portion is added.

Timed sessions start at 150 seconds with three lives. The timestamp-based countdown drives the MM:SS display and shrinking time bar. Below 15 seconds, the timer turns red and pulses unless reduced motion is requested. Reconcile elapsed time before ingredient additions and brews so an expired run cannot receive an extra action or time bonus.

Pause freezes the clock without losing fractional seconds, blocks gameplay, and blurs the workbench and brew results. Resume continues the same score, lives, mixture, stock, recipe, and remaining time. Switching tabs pauses automatically; returning requires Resume. Help, Menu, and Leaderboard keep the clock running unless the player pauses first.

Game Over occurs when time expires, lives reach zero, or both the shelf and cauldron are empty. The final stocked mixture remains brewable. Show the reason, final score, potions brewed, and active time played. Play again resets the complete run, including time and stock; Menu → Start new game also resets it after confirmation. Timers are cleaned up when runs end, restart, exit, or unmount.

The Top-10 leaderboard stores completed results in localStorage. Prompt for a name only when a result qualifies, including zero scores while vacancies exist. Accept 2–15 Unicode letters, decimal digits, spaces, `_`, or `-` after trimming and NFC normalization. Escape player names in generated markup. Save each finished run at most once, using its completion timestamp. Rank by descending score, then earlier completion time; a new score tying the tenth result does not qualify. Display rank, name, score, and DD.MM.YYYY HH:MM in the browser's local time. Clearing results requires an in-app confirmation. Corrupt data and blocked storage remain nonfatal; when persistence is unavailable, retain results for the current visit and explain that limitation.

Difficulty selection and unfinished-game save/continue remain Level 2 work. Level 3 features and further design polish follow in later branches.

## Brand Personality

A dark fantasy alchemy workshop, following the assignment's illustrated reference: brass frames, a wooden ingredient cabinet, shaded iron cauldron, green magical light, and a parchment recipe. Use display serif headings with clear numerical labels. Controls and numerical values take priority over ornament.

## Anti-references

Avoid marketing landing-page layouts, dashboard metric-card grids, bright application-style surfaces, flat clip-art cauldrons, and decorative copy that obscures the rules. Restrict green glow to the cauldron, recipe targets, and primary game action. Use authored SVG/CSS instead of bitmap game assets while the assignment's image wording remains inconsistent.

## Design Principles

- Make the recipe, ingredient stock, and three parameters readable together.
- Keep the welcome state empty and the primary action clear.
- Use CSS and authored inline SVG for game elements.
- Make remaining time and lives easy to read without relying on color alone.
- Preserve each brew's result after clearing the cauldron, with explicit pass/fail text for every parameter.
- Show spent stock and full-cauldron feedback without changing the underlying rules.
- Keep navigation predictable and preserve the mixture and inventory through pause, dialogs, and canceled confirmations. Confirmed new games reset them; confirmed exits discard them.
- Keep completed-result storage separate from future unfinished-game saves, and make storage failures understandable without interrupting play.

## Accessibility & Inclusion

Use semantic headings and native buttons and dialogs, visible keyboard focus, sufficient text contrast, descriptive numerical labels, and reduced-motion support. Do not communicate parameter or game states through color alone. Give name validation errors clear text, preserve form input through dialog navigation, and keep leaderboard names and dates readable on narrow screens.
