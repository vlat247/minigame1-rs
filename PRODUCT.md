# Product

## Register

product

## Users

Players of the RS School browser mini-game and reviewers checking the assignment. The game must work in Chrome at widths from 375px to 1920px, using mouse, touch buttons, and native keyboard navigation.

## Product Purpose

Mix limited-stock ingredients to match three recipe ranges before time or lives run out. This branch makes ingredient mixing functional: the six Level 1 ingredients receive independent random stocks of 2–15, additions spend one portion, and the cauldron preserves up to four ordered portions, including duplicates. All eight official ingredients are catalogued for later difficulty levels.

The live gauges show raw totals on symmetric scales centered at zero, expanding to include values outside ±100. CSS transitions move the markers; green feedback and an **In range** label indicate a match with the displayed recipe range. Empty-stock cards retain their zero badge, remove the ingredient illustration, and become disabled and unavailable to keyboard focus.

Acid Spark, the `02:30` clock, lives, and score remain previews. Brewing, recipe selection, timing, storage, difficulty selection, reactions, drag and drop, game shortcuts, and Pour Out belong to later features. Menu → Start new game clears the mixture and rerolls stock after confirmation so players can retry.

## Brand Personality

A dark fantasy alchemy workshop, following the assignment's illustrated reference: brass frames, a wooden ingredient cabinet, shaded iron cauldron, green magical light, and a parchment recipe. Use display serif headings with clear numerical labels. Controls and numerical values take priority over ornament.

## Anti-references

Avoid marketing landing-page layouts, dashboard metric-card grids, bright application-style surfaces, flat clip-art cauldrons, and decorative copy that obscures the rules. Restrict green glow to the cauldron, recipe targets, and primary game action. Use authored SVG/CSS instead of bitmap game assets while the assignment's image wording remains inconsistent.

## Design Principles

- Make the recipe, ingredient stock, and three parameters readable together.
- Keep the welcome state empty and the primary action clear.
- Use CSS and authored inline SVG for game elements.
- Distinguish working ingredient mixing from the recipe, clock, lives, and score previews.
- Show spent stock and full-cauldron feedback without changing the underlying rules.
- Keep navigation predictable and preserve the mixture and inventory through pause, dialogs, and canceled confirmations. Confirmed new games reset them; confirmed exits discard them.

## Accessibility & Inclusion

Use semantic headings and native buttons and dialogs, visible keyboard focus, sufficient text contrast, descriptive numerical labels, and reduced-motion support. Do not communicate parameter or game states through color alone.
