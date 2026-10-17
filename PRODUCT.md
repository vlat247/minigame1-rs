# Product

## Register

product

## Users

Players of the RS School browser mini-game and reviewers checking the assignment. The game must work in Chrome at widths from 375px to 1920px, using mouse, touch buttons, and native keyboard navigation.

## Product Purpose

Mix limited-stock ingredients to match three recipe ranges before time or lives run out. Ingredient mixing and brewing are functional: the six Level 1 ingredients receive independent random stocks of 2–15, additions spend one portion, and the cauldron preserves up to four ordered portions, including duplicates. All eight official ingredients and twenty official recipes are catalogued.

The live gauges show raw totals on symmetric scales centered at zero, expanding to include values outside ±100. CSS transitions move the markers; green feedback and an **In range** label indicate a match with the displayed recipe range. Empty-stock cards retain their zero badge, remove the ingredient illustration, and become disabled and unavailable to keyboard focus.

Level 1 randomly selects from the seven Medium recipes at the start and after each successful brew. Repeats are allowed, and selection does not filter by remaining stock. With at least one portion, Brew checks all three raw totals against inclusive ±8 ranges. Success earns 200 points, adds up to 10 seconds capped at 150, and selects another recipe. Failure loses one life and keeps the recipe. Both outcomes clear the cauldron, totals, and counter without refunding ingredients.

The result panel preserves the recipe just checked, raw totals, accepted ranges, individual pass/fail results, and actual score/time/life changes until another portion is added. A minimal Game Over dialog ends a run at zero lives or when the final mixture is brewed and no stock remains. Play again starts a fresh run; Menu → Start new game also resets the run after confirmation.

Countdown timing, the time bar, timestamp-based updates, saves, leaderboard persistence, difficulty selection, and Level 3 features remain pending. The clock currently stays at `02:30` because no countdown runs and each game starts at the bonus cap. The pure brewing logic supports and tests bonuses below that cap.

## Brand Personality

A dark fantasy alchemy workshop, following the assignment's illustrated reference: brass frames, a wooden ingredient cabinet, shaded iron cauldron, green magical light, and a parchment recipe. Use display serif headings with clear numerical labels. Controls and numerical values take priority over ornament.

## Anti-references

Avoid marketing landing-page layouts, dashboard metric-card grids, bright application-style surfaces, flat clip-art cauldrons, and decorative copy that obscures the rules. Restrict green glow to the cauldron, recipe targets, and primary game action. Use authored SVG/CSS instead of bitmap game assets while the assignment's image wording remains inconsistent.

## Design Principles

- Make the recipe, ingredient stock, and three parameters readable together.
- Keep the welcome state empty and the primary action clear.
- Use CSS and authored inline SVG for game elements.
- Distinguish functional mixing, recipes, brewing, score, and lives from the inactive countdown.
- Preserve each brew's result after clearing the cauldron, with explicit pass/fail text for every parameter.
- Show spent stock and full-cauldron feedback without changing the underlying rules.
- Keep navigation predictable and preserve the mixture and inventory through pause, dialogs, and canceled confirmations. Confirmed new games reset them; confirmed exits discard them.

## Accessibility & Inclusion

Use semantic headings and native buttons and dialogs, visible keyboard focus, sufficient text contrast, descriptive numerical labels, and reduced-motion support. Do not communicate parameter or game states through color alone.
