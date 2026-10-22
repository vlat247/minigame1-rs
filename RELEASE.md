# Release and final submission

Release branch: `feat/release-finalcheck`. Task PR target: `story-3`.

## Verified locally

`npm run release:check` passes lint, formatting, **169 tests**, strict TypeScript, the production build, and static asset verification. The additional 18 tests exercise release failures such as missing sprites/fonts/chunks, nonportable URLs, source-file references, escaping paths, and symbolic links.

The production build was tested at `http://127.0.0.1:4173/minigame1-rs/` on **23 October 2026**. This exercises the repository subdirectory used by GitHub Pages. Production browser evidence and screenshots are recorded in [QA.md](QA.md).

## Publish with GitHub Pages

The repository had no enabled Pages site when these changes were prepared. The expected URL after successful activation and deployment is [vlat247.github.io/minigame1-rs](https://vlat247.github.io/minigame1-rs/). This is a deployment target, not a verified live link yet.

1. In [repository Settings → Pages](https://github.com/vlat247/minigame1-rs/settings/pages), set **Build and deployment → Source** to **GitHub Actions**. If the `github-pages` environment restricts deployment branches, allow `story-3` (and `main` for a later release).
2. Push this task branch and open its PR into `story-3`. The Checks workflow runs `npm run release:check` for pushes and pull requests. Review the changes and merge the task PR into `story-3`.
3. The **Deploy to GitHub Pages** workflow runs on pushes to `story-3` and `main`. It installs the lockfile dependencies with Node 24, runs the same release checks, uploads only `dist/`, and deploys after a successful build. Its deployment environment records the public URL.
4. Inspect the workflow result and open its deployment URL. Verify that the page, font, ingredient sprites, save/continue, and leaderboard work at the public address. Local browser storage is specific to its origin; development saves and scores are not transferred to the public site.

Task branches and tags cannot publish through this workflow, including manual dispatch. The manual Actions button becomes available once the workflow exists on the default branch; the first `story-3` push does not need manual dispatch. Workflow permissions are scoped: the build reads repository and Pages metadata; only the deployment job can write Pages deployments and request its identity token. The workflow does not enable Pages or change repository settings automatically.

For local production inspection:

```sh
npm ci
npm run release:check
npm run preview -- --host 127.0.0.1 --port 4173 --strictPort --base=/minigame1-rs/
```

The asset checker validates static references in generated HTML, CSS, and JavaScript, including fonts, favicon, sprite URLs, and module chunks. It rejects resources that would escape the artifact or bypass the repository path. Runtime-constructed URLs and interaction behavior still need browser QA. `vite preview` is a local inspection server; GitHub Pages serves the published static files.

## Final story PR evidence

After the task PR is merged, prepare an **unmerged** `story-3` → `story-2` PR using the repository PR template. Keep `story-2` → `story-1` and `story-1` → `main` submission PRs unmerged as required by the assignment.

- Link the assignment and relevant user stories.
- Attach the current [desktop](docs/screenshots/release-desktop.png) and [mobile](docs/screenshots/release-mobile.png) screenshots, updating them if the release changes.
- Add the working public URL after the Pages deployment succeeds.
- Use the actual completion date and copy the deadline from RS App. No deadline is assumed in this repository.
- Record the exact release commit and successful Checks/Pages workflow links.
- Complete the latest standalone Google Chrome and reduced-motion checks below.
- Add the scored self-check, then submit the unmerged story PR URL in **RS App → Cross-Check: Submit**. A commit or deployment alone is not an RS App submission.

The following is an implementation inventory for the self-check, not a claimed final awarded score. The assignment's cumulative maximum is **393**; do not add the separately described common requirements a second time.

| Scope              | Published maximum | Implementation evidence                                                                      |
| ------------------ | ----------------: | -------------------------------------------------------------------------------------------- |
| Precondition       |                58 | Strict TypeScript, Vite, folder separation, lint/format hooks, CI, conventional commits      |
| Level 1            |               170 | Shelf/stock, parameters, recipes/brewing, timer, pause, endings, Top-10 leaderboard          |
| Level 2            |                50 | Three difficulty settings, guarded auto-save, paused Continue, separate boards               |
| Level 3            |               115 | Drag/drop, tooltips, configured reactions, Pour Out, CSS visual feedback, keyboard shortcuts |
| Cumulative maximum |               393 | Review together with the common requirements and final delivery evidence                     |

## Remaining final checks

- [ ] Activate Pages, merge the task PR into `story-3`, and verify the resulting public URL.
- [ ] Check the public build in the latest standalone Google Chrome at mobile and desktop widths, including drag/drop and native keyboard navigation.
- [ ] With reduced motion enabled, verify that icons and result text remain visible while bursts, floating motion, timer pulse, and shake stop.
- [ ] Confirm workflow links, screenshot accuracy, completion date, actual deadline, and scored self-check in the final story PR.
- [ ] Submit the unmerged final story PR URL in RS App before the deadline.

No public deployment, final PR merge, or RS App submission is claimed by these local checks.
