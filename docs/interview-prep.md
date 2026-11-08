# Alchemist's Cauldron: interview preparation

Interview window: **23–30 November 2026**. Prepare to be ready on **22 November**. Study budget: **60–90 minutes per day**, starting 5 November.

## Our focus

The new creative extension is **Recipe Collection**: discover the game's 20 recipes by brewing them successfully, unlock three achievements, and keep progress after a browser reload. Preview was included in the previous submission; explain it as existing functionality if asked. Brew history is outside this extension's scope.

The achievements are **First Potion** for one discovered recipe, **Recipe Explorer** for five different recipes, and **Hard Alchemist** for a successful Hard recipe. The game saves recipe IDs and calculates achievements from those IDs. Repeating a recipe does not increase the collection or unlock the same achievement again.

Use the [creative-extension task](https://github.com/rolling-scopes-school/qualifying-stage/blob/main/tasks/creative-extension/mini-games.md) and [mentor assessment checklist](https://github.com/rolling-scopes-school/qualifying-stage/blob/main/tasks/creative-extension/mentors-check.md) to check the final presentation requirements. Practise a **5–10 minute feature presentation**, followed by technical questions. A working feature gives you something concrete to demonstrate; being able to explain your decisions and code also matters.

Prepare the separate [English self-introduction](https://github.com/rolling-scopes-school/qualifying-stage/blob/main/tasks/self-intro/README.md) and follow the instructions from your curator.

## Daily routine

- **10 minutes:** explain yesterday's topic aloud without reading.
- **20 minutes:** learn one small concept and read its example in this game.
- **20 minutes:** predict a result, run it, and explain any difference.
- **10 minutes:** answer one interview question in your own words.
- **Optional 30 minutes:** repeat the exercise, trace another example, or rehearse the demo.

Treat a topic as learned when you can explain it, predict a small example, and change a small example yourself.

## Schedule

| Dates     | Learn and practice                                                                    | Checkpoint                                                                        |
| --------- | ------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------- |
| Nov 5–7   | HTML, CSS, JavaScript; numbers, strings, booleans; `const`, `let`; objects and arrays | Explain a recipe object and an array of discovered recipe IDs.                    |
| Nov 8–10  | Functions, parameters, `return`, conditions, loops, imports and exports               | Trace `discoverRecipe()` for new, repeated, and unknown IDs.                      |
| Nov 11–12 | TypeScript types, interfaces, unions, `null`; state and immutable updates             | Explain a small part of `GameState` and why an update returns a new object.       |
| Nov 13–14 | DOM elements, events, controller, rendering                                           | Trace Brew through discovery to the Collection screen.                            |
| Nov 15–16 | Collection rules, derived achievements, and JSON persistence                          | Explain the fifth discovery, a first Hard discovery, and a reload.                |
| Nov 17–18 | Tests, invalid inputs, saves, pause and timing                                        | Explain one assertion, one storage validation, and why the timer uses timestamps. |
| Nov 19–20 | Feature presentation and personal self-introduction                                   | Deliver both from brief notes; identify claims you cannot explain yet.            |
| Nov 21–22 | Mock interviews, demo practice, final checks                                          | Give the demo twice and answer follow-up questions with the code open.            |
| Nov 23–30 | Interview window                                                                      | Until your slot, do a short daily rehearsal and keep the demo stable.             |

## Start here: lesson one

HTML describes page structure, CSS controls appearance, and JavaScript supplies behavior. TypeScript adds checks to JavaScript during development. In this game, the production build produces JavaScript for the browser. Background reading: [MDN introduction](https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Scripting/What_is_JavaScript) and [TypeScript for new programmers](https://www.typescriptlang.org/docs/handbook/typescript-from-scratch.html).

An object groups related values. An array stores an ordered list. A function takes input and can return a result.

This is a learning example, separate from the game's source. Paste it into the browser's developer console and inspect the variable names afterward:

```js
const ingredient = { name: 'Fairy Dust', stock: 5 };

function remainingAfterAdding(currentStock) {
  return currentStock - 1;
}

const remaining = remainingAfterAdding(ingredient.stock);
```

Before running it, answer:

1. What number will `remaining` contain?
2. What number will `ingredient.stock` still contain?
3. Which value is the function's input, and which is its output?
4. What would happen if the input were zero? What check should we add?

Then write your own version that returns zero when stock is already empty. Explain each line. We will connect this to the real ingredient-addition code after functions and objects feel familiar.

## Read the collection code in this order

| File                                                                        | What to understand                                                                                |
| --------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| [`src/data/recipes.ts`](../src/data/recipes.ts)                             | The catalogue of 20 recipe IDs, names, difficulties, and target ranges.                           |
| [`src/logic/collections.ts`](../src/logic/collections.ts)                   | `CollectionProgress`, `createCollection()`, `discoverRecipe()`, and `getAchievements()`.          |
| [`tests/collection.test.mjs`](../tests/collection.test.mjs)                 | New discoveries, duplicates, unknown IDs, immutable updates, and achievement thresholds.          |
| [`src/storage/collection.ts`](../src/storage/collection.ts)                 | JSON serialization, runtime validation, unavailable storage, and unsupported versions.            |
| [`tests/collection-storage.test.mjs`](../tests/collection-storage.test.mjs) | Saved data round trips, invalid data, and storage failures.                                       |
| [`src/ui/collection-session.ts`](../src/ui/collection-session.ts)           | Load once, record successful brews, save new discoveries, and report newly unlocked achievements. |
| [`src/logic/brewing.ts`](../src/logic/brewing.ts)                           | The next game state and feedback about the recipe just brewed are different results.              |
| [`src/ui/game-controller.ts`](../src/ui/game-controller.ts)                 | `brewPotion()` connects brewing to discovery; `renderDialog()` supplies collection data.          |
| [`src/ui/dialogs.ts`](../src/ui/dialogs.ts)                                 | Collection access from Menu, Pause, and Game Over; the dialog stack.                              |
| [`src/ui/collection-view.ts`](../src/ui/collection-view.ts)                 | Render recipe cards, discovered counts, and achievement states.                                   |
| [`src/styles/collection.css`](../src/styles/collection.css)                 | Locked and discovered states, layout, and narrow-screen behavior.                                 |

Start with a few functions at a time. The controller is large; use the named entry points to follow one action.

## Trace one successful discovery

The path is: **Brew button or B key → `brewPotion()` → `brewGame()` → `recordBrew(feedback)` → save progress → show the result and Collection screen.**

1. `brewGame()` checks the mixture against the current recipe. Rejected or failed brews cannot discover a recipe.
2. On success, `feedback.recipe` identifies the recipe just brewed. `result.state.recipe` already identifies the next random target. Using the next recipe would collect the wrong potion.
3. `recordBrew()` calls `discoverRecipe()`. Unknown IDs and repeated discoveries return the existing progress. A new discovery returns a new object and array.
4. The session compares achievements before and after the update. Its message includes only achievements unlocked by this discovery.
5. Updated progress stays in memory and is saved to browser storage. Collection is separate from an individual run: New Game, Exit, and Game Over preserve it.
6. Discovery is recorded before Game Over handling. A successful brew using the final stock still belongs in the collection.

`getSnapshot()` gives the UI the current progress and its storage notice. The UI reads the snapshot to display counts, recipes, and achievements.

## Understand the saved data

The collection uses its own storage key, `alchemists-cauldron:collection:v1`, separate from the unfinished-game save and the leaderboards.

```json
{
  "version": 1,
  "discoveredRecipeIds": ["moon-mist", "root-bloom"]
}
```

`localStorage` stores text. `JSON.stringify()` converts data into JSON text; `JSON.parse()` reads the text back into a JavaScript value. Parsing can fail, and valid JSON can still have the wrong shape. The loader therefore validates its result at runtime. It removes duplicate IDs and ignores IDs missing from the catalogue.

Saving IDs avoids copying names and target ranges into a second source of truth. Achievements are derived from known discovered recipes, so separate saved badge booleans cannot disagree with the collection.

If storage cannot be read or written, the game stays playable and keeps new discoveries for the current visit. The notice explains that they may not survive a reload. Unreadable collection data is reported; a later new discovery can start a valid save. Data with an unsupported numeric version is preserved rather than overwritten by this version of the game.

Progress belongs to this browser and device. There is no account or cloud synchronization. Older scores do not identify the successfully brewed recipes, so existing statistics cannot backfill the collection. Discoveries start when this feature records successful brews.

## Practise the live demo

Run `npm run dev` and open the URL it prints. Rehearse in an isolated browser profile with storage available. If you use an existing collection, explain its starting progress honestly. Clearing an unfinished run or leaderboard does not reset the collection.

1. Open **Menu → Recipe Collection**. Show the discovered count, 20 recipe slots, and exactly three achievements. A fresh profile starts at **0 / 20**, with all achievements locked.
2. Close Collection and select **Easy** in Menu. Start a fresh game, read the randomly selected recipe, and use its fixture below followed by **B**.
3. Point out the discovery message. Pause and open **Recipe Collection** to show the discovered recipe and **First Potion**. An already-known recipe correctly produces no new discovery message.
4. Close Collection to return to Pause; the clock stays frozen. Reload, open Collection from Menu, and show restored progress. Continue Game restores the unfinished run paused. Collection progress is independent of that run save.
5. Exit the run, select **Hard** in Menu, and start a fresh game. Use the matching Hard fixture, then **B**. Open Collection from Pause and show **Hard Alchemist**. If Hard is the first discovery in a fresh profile, both First Potion and Hard Alchemist unlock together.
6. Explain **Recipe Explorer** using the test for four discoveries becoming five. For a live threshold demonstration, prepare a separate test profile with four discoveries, then brew a fifth distinct recipe. Any seeded development data must be labelled **prepared test data**; do not present it as naturally earned progress.
7. Optionally show a failure: start a fresh Easy run, add one **Frost Lotus**, key **3**, then **B**. That single portion fails every Easy recipe. The collection count does not change.

Menu opened during active play keeps the clock running, including its Collection screen. Collection opened from Pause keeps the run paused. Game Over also provides Collection access. If saving is unavailable, explain the notice instead of promising reload persistence.

These are the existing repeatable brew fixtures from [`QA.md`](../QA.md). Read the recipe first because selection is random. Each sequence uses at most two portions of one ingredient, so a fresh shelf has enough stock. Keys represent ingredient positions on the shelf; press **B** after the sequence. Rehearse against the current build before the interview.

| Easy recipe | Keys  | Hard recipe    | Keys  |
| ----------- | ----- | -------------- | ----- |
| Moon Mist   | `12`  | Phoenix Pulse  | `27`  |
| Root Bloom  | `24`  | Slime Crown    | `48`  |
| Frost Steam | `13`  | Void Flame     | `116` |
| Quiet Swirl | `34`  | Acid Bog       | `58`  |
| Bright Dew  | `124` | Frozen Ash     | `347` |
| Snow Dust   | `234` | Triple Eclipse | `246` |
| —           | —     | Ember Soup     | `278` |

Many fixtures use brewing tolerance, so success does not require every displayed gauge to glow green. Stock stays spent within a run; start fresh if you are unsure enough stock remains.

## Presentation outline: approximately seven minutes

| Time      | Talking points                                                                                                                            |
| --------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| 0:00–0:45 | Explain the game and addition: each run resets, while the collection gives players a goal across runs. State the three achievement rules. |
| 0:45–2:45 | Show Collection, an Easy discovery, First Potion, and progress after reload. Explain any prepared starting data.                          |
| 2:45–3:45 | Show a Hard discovery; explain the five-distinct threshold with a prepared test profile or a test.                                        |
| 3:45–5:00 | Open `discoverRecipe()` and `getAchievements()`. Explain inputs, results, duplicate prevention, and derived badges.                       |
| 5:00–6:00 | Show the saved JSON and loader. Explain validation, save failures, and protecting unsupported versions.                                   |
| 6:00–7:00 | Explain `feedback.recipe`, the final-stock edge case, one meaningful test, and the browser/device limitation.                             |

Use this as prompts and build your own explanation. Be accurate about assistance used while building the feature and focus on code you understand. Prepare self-introduction notes separately: who you are, your background, motivation, learning goals, and project experience.

## Questions to work toward answering

| Question                                             | Core of a correct answer                                                                                                                                                            |
| ---------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| What is an interface?                                | A TypeScript description of an object's shape. `CollectionProgress` describes an array of recipe IDs. It creates no object and disappears from compiled JavaScript.                 |
| Why export an interface or function?                 | Other modules need the definition. Types can use `import type`; functions remain executable JavaScript.                                                                             |
| What does `createCollection()` do?                   | Returns a new progress object with an empty discovered-ID array.                                                                                                                    |
| Why use `.some()` and `.includes()`?                 | `.some()` finds a matching catalogue recipe; `.includes()` checks whether its ID is already discovered.                                                                             |
| What is a pure function?                             | Its result depends on its inputs and it does not change them or external state. Discovery and achievement calculations are separate from storage writes and DOM updates.            |
| Why return a new array?                              | New progress can be compared with old progress without changing it. Returning the same object for a duplicate tells the session nothing changed.                                    |
| Does `readonly` prevent every mutation?              | It restricts writes through the TypeScript type. It does not freeze objects at runtime; the implementation still needs to avoid mutation.                                           |
| Why use `feedback.recipe`?                           | It identifies the recipe just checked. After success the returned game state already contains the next random target.                                                               |
| Does a successful final-stock brew count?            | Yes. It is recorded before the controller handles Game Over.                                                                                                                        |
| Why save IDs rather than recipes and badge booleans? | The catalogue supplies recipe details, and rules calculate badges from IDs. Saving less data avoids conflicting copies.                                                             |
| When does Recipe Explorer unlock?                    | At five distinct known recipes. Four stays locked; repeating one of those four changes nothing.                                                                                     |
| Why validate JSON if we use TypeScript?              | Stored data is outside the type checker's guarantees and may be malformed, have the wrong shape, or use an unsupported version.                                                     |
| What happens if saving fails?                        | Progress remains in memory for this visit; the UI warns it may be lost after reload.                                                                                                |
| Why preserve unsupported versions?                   | This code cannot safely interpret them. Overwriting them could destroy progress written by another version.                                                                         |
| Does New Game clear the collection?                  | No. Run saves and collection progress use separate keys and state. New Game resets the run.                                                                                         |
| Can older scores unlock discoveries?                 | No. Scores do not identify recipes. The feature records successful brews after it is added.                                                                                         |
| How do you verify it?                                | Test new/repeated/failed discoveries, achievement thresholds, simultaneous unlocks, storage round trips and failures, then check real dialogs, keyboard, mobile, pause, and reload. |

For each answer, locate the relevant code and explain one example. If a term is unfamiliar, make it the next lesson.

## Readiness checks

- Explain the game rules and distinguish existing Preview from the new Recipe Collection extension.
- Trace a successful brew through `recordBrew()` to saved IDs and Collection.
- Explain every line of `discoverRecipe()`, one achievement rule, and a representative test.
- Predict empty, duplicate, fifth-unique, and first-Hard discovery results.
- Explain JSON conversion, runtime validation, and version checking.
- Rehearse reload, paused Collection, an active Menu, a failed brew, and Game Over access. Check narrow screens and keyboard focus.
- Make and explain a small practice change in an isolated exercise, such as the zero-stock guard in lesson one.
- Prepare the English self-introduction and timed feature presentation. Label prepared demo data.
- Verify deployment and submission status in [`RELEASE.md`](../RELEASE.md) and the actual repository; older delivery notes do not prove current publication status.
- Before final delivery, run `npm run release:check` and review current browser evidence in [`QA.md`](../QA.md). Report the actual output. Automated checks do not replace browser rehearsal.
