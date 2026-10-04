# Three-Floor Integration Handoff

## Audience and goal

This handoff is for the integration agent working after the three floor branches
are ready. Integrate and verify:

- `f00` — Ground Floor tutorial / incident response
- `f01` — Floor 1 scalability / load distribution
- `f02` — Floor 2 data storage / caching

The finished game must preserve each floor's behavior, discover all floors
automatically, and play in order from the tutorial through the Floor 2 stale
price incident.

## Safety before integration

1. Read `AGENTS.md`, especially `# CONTEXT`, and
   `PARALLEL_FLOOR_ARCHITECTURE.md`.
2. Ask for the actual three branch names if they are not provided. Do not guess
   branch names from this document.
3. Run `git status --short` and preserve all user work. Never discard changes
   with `git reset --hard`, `git checkout --`, or similar commands.
4. Fetch the branches and create a dedicated integration branch from the agreed
   base branch.
5. If the floor branches have already been merged, do not merge them again.
   Start at the conflict-resolution and verification sections below.
6. Record the base and floor commit SHAs in the final integration report.

## Architecture that must survive the merge

- Floors are discovered by `import.meta.glob` in
  `src/core/runtime/floorRegistry.ts`; do not create a central floor list.
- Folder order determines elevator order:
  `floor-00-*`, `floor-01-*`, then `floor-02-*`.
- Keep IDs and namespaces exactly `f00`, `f01`, and `f02`.
- Keep floor contract changes additive. The current contract remains version 1.
- Do not solve conflicts by replacing an entire shared file with “ours” or
  “theirs.” Merge the behaviors into an additive superset.
- Preserve floor isolation. Floor code should ultimately import only its own
  files, `src/core/contracts`, and `src/core/ui-kit`.

## Floor 2 behavior to preserve

Floor 2 is no longer a placeholder. It is a data-center room containing the
three-step “Stale Price Incident”:

1. Dana: identify that the repeated database query needs a cache.
2. Sam: choose one shared cache instead of local or browser-only caches.
3. Priya: choose a one-minute TTL, then return to Dana to finish.

Required progression behavior:

- Before Floor 1 is solved, Floor 2 is calm:
  - objective reads `Storage is stable`;
  - room incident visuals are resolved/calm;
  - Floor 2 alert lights and HUD frame are green;
  - NPCs explain that the incident starts after Floor 1.
- Once Floor 1 is solved, Floor 2 starts at Dana with critical database visuals,
  a red alert frame, and red alert lights.
- Solving Floor 2 reports a canonical result for the current browser session.
- Refreshing the page resets Floor 2's result, puzzle stage, and `floor2.*`
  flags, while preserving the completed Floor 1 result. Because Floor 1 remains
  solved, Floor 2 restarts at Dana in the critical state after refresh.

The pure incident flow and its generic tests live in:

- `src/floors/floor-02-storage/definition/incidentFlow.ts`
- `test/floors/stalePriceIncident.test.ts`

## Shared changes required by Floor 2

Do not drop these when resolving conflicts:

### Floor contract

`src/core/contracts/floor.ts` and `index.ts` add:

- `FloorDialogueChoice`
- optional dialogue `choices`
- optional glossary `analogy` and `realWorld`
- `ctx.hud.setObjective`
- `ctx.dialogue.showLine` and `showChoice`
- progression `flag` and `setFlag`
- `ctx.audio.playSuccess`

### Runtime and HUD

- `src/core/runtime/FloorScene.ts` implements the new context methods and
  refreshes floor-specific emergency lights.
- `src/scenes/UIScene.ts` handles dialogue lines, choices, objective updates,
  and floor-specific alert-frame state.
- `src/ui/SpeechBubble.ts` supports choices, dismissal callbacks, and inline
  `[[f02.term_id]]` teaching terms while preserving Floor 1's classic dialogue.

### Progression

`src/state/progression.ts`:

- supports namespaced string flags;
- provides the shared `floorShowsAlert` rule;
- persists Floor 1;
- intentionally removes Floor 2 results and `floor2.*` flags from browser
  storage so Floor 2 resets on refresh.

The reset and alert gating are covered in
`test/state/progression.test.ts`.

### Teaching-term UI

Floor 2 currently uses:

- `src/ui/TermCard.ts`
- `src/ui/termLabel.ts`
- `src/ui/termMemory.ts`

These power inline definitions and the learned-term glossary.

## Known integration blocker

At the time of this handoff:

- `npm test` passes: 8 files, 33 tests.
- `npm run typecheck` passes.
- `npm run validate:floors` fails because several Floor 2 view files import
  Phaser and shared internals outside the two public core APIs.

Do not disable or weaken the validator merely to make the command green. Resolve
the boundary violations during integration:

1. Move/export reusable teaching-term presentation through
   `src/core/ui-kit`, then have Floor 2 import it from that public API.
2. Use `ctx.audio` instead of importing `AudioSystem` directly.
3. Use `ctx.preferences` instead of importing the preferences store directly.
4. Use scene/context dimensions instead of importing
   `src/config/dimensions`, or add the smallest additive public context API.
5. Remove direct `phaser` imports from Floor 2 by using contract-exposed types
   or floor-local inferred types.

Affected files reported by the validator include:

- `view/priyaTtlPuzzle.ts`
- `view/puzzleShell.ts`
- `view/samCachePuzzle.ts`
- `view/stalePriceEffects.ts`
- `view/stalePriceIncident.ts`

After refactoring, every Floor 2 import must pass `npm run validate:floors`.

## Conflict-resolution order

Resolve shared files in this order so dependent floor code can type-check:

1. `src/core/contracts/floor.ts` and `src/core/contracts/index.ts`
2. shared teaching-term UI / `src/core/ui-kit`
3. `src/state/progression.ts`
4. `src/core/runtime/FloorScene.ts`
5. `src/scenes/UIScene.ts`
6. `src/ui/SpeechBubble.ts`
7. each floor folder, without cross-floor imports
8. tests and documentation

When two floor branches add different contract capabilities, retain both unless
they are truly incompatible. Adapt the runtime context once, then let every
floor consume that shared API.

## Required verification

Run all checks after conflicts and boundary issues are resolved:

```bash
npm run validate:floors
npm test
npm run typecheck
npm run build
npm run format:check
```

Then run the development server and smoke-test:

- `/?floor=f00`
- `/?floor=f01`
- `/?floor=f02`

End-to-end checklist:

- [ ] All three floors are discovered in numeric order.
- [ ] Tutorial movement, interaction, and elevator flow still work.
- [ ] Floor 1 dialogue, glossary, build console, simulation, and completion work.
- [ ] Floor 2 is calm before Floor 1 completion.
- [ ] Completing Floor 1 unlocks and activates Floor 2.
- [ ] Dana → Sam → Priya → Dana completes Floor 2.
- [ ] Wrong Floor 2 choices give feedback and allow retrying.
- [ ] Sound and reduced-motion preferences still work.
- [ ] Refreshing after Floor 2 progress resets only Floor 2.
- [ ] Refreshing retains Floor 1 completion and restarts Floor 2 as critical.
- [ ] No floor imports another floor.
- [ ] The browser console has no uncaught errors.

## Final report

Report:

- integration branch and merged commit SHAs;
- conflicts encountered and how each was resolved;
- any public contract changes;
- results of all five required commands;
- end-to-end scenarios tested;
- remaining blockers, if any.

Do not claim the integration is complete while floor validation, tests,
type-checking, build, or the end-to-end progression flow is failing.
