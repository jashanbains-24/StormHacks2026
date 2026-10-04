# Floor 1 Handoff — Traffic Operations (`f01`)

This file is for the integrator / main-branch agent after floor branches merge.
It describes what Floor 1 actually shipped, which shared APIs it needed, and
what must stay true so Floor 0, Floor 2, and the elevator keep working.

- Floor folder: `src/floors/floor-01-scalability/`
- Floor id: `f01`
- Discovery order: `1` (after tutorial `f00`, before storage `f02`)
- Title: `Floor 1: Traffic Operations`
- Category: Scalability / Load Distribution
- Branch: `feature/f01-traffic-operations-polish`
- Preview: `/?floor=f01` (`&state=down` emergency, `&state=fixed` resolved)

Do not treat this as a license to rewrite Floor 1 from main. Prefer additive
core fixes. Floor-local gameplay, layout, dialogue, and effects stay owned by
this folder.

## What the player experiences

The player is a first-day intern. The room starts in emergency. Access to the
build console is gated until they talk to Rhea Boot.

1. Arrow points at Rhea. World label is `Rhea Boot` only; she introduces herself
   as SRE lead in dialogue.
2. Five-line onboarding: intern role, traffic spike, **two servers can carry
   the spike but the stress test kills one so N+1 is required**, workstation
   can provision up to five, talk again for stronger hints.
3. Closing the briefing (Next/Done, X, Escape, or walking away) unlocks the
   intern workstation at the **right end of the top desk row**.
4. Arrow points at that empty intern computer until the player opens it once.
5. After the briefing, `[E] ASK FOR NEXT HINT` stays near Rhea. Hints escalate
   and then repeat the most specific one.
6. Running a stress test **evaluates** the design. Closing the console after an
   evaluated attempt **wipes the saved diagram**. Unevaluated drafts persist.
7. Arrow returns to Rhea for a topology-specific teaching debrief.
8. Failed / partial / over-provisioned results keep the room in emergency,
   lock the workstation until debrief, then unlock a retry.
9. Only a **canonical** solution this session turns lights green, calms NPCs,
   and after Rhea's debrief points an arrow at the elevator.

Canonical topology: **Client → Load Balancer → 3 Servers**.
Teaching intent: load distribution, capacity, single point of failure,
horizontal scaling, N+1 redundancy, cost vs reliability.

## Floor-owned files (safe to merge independently)

Everything under `src/floors/floor-01-scalability/` plus
`test/floors/f01Flow.test.ts`.

| Path                     | Role                                                           |
| ------------------------ | -------------------------------------------------------------- |
| `index.ts`               | Module export. Sets `replacesDefaultEmergencyEffects: true`.   |
| `definition/content.ts`  | Onboarding, hints, glossary, outcome debriefs.                 |
| `definition/incident.ts` | LB max 1, servers max 5, canonical count 3.                    |
| `view/plan.ts`           | Furniture, seated NPCs, intern desk, collision boxes.          |
| `view/runtime.ts`        | Session quest state (`F01QuestProgress`) keyed by Phaser game. |
| `view/layout.ts`         | Office, Rhea, walk-away dismiss, result subscription.          |
| `view/buildUI.ts`        | Intern workstation (desk/chair/computer). No status banner.    |
| `view/guidance.ts`       | Arrows: Rhea / workstation / elevator.                         |
| `view/effects.ts`        | Beacons, gloom/red vs calm/green lighting, panic NPCs.         |
| `view/floorSurface.ts`   | Generated 48px tiled floor, Floor 1 only.                      |
| `theme.ts`               | Empty overrides; uses shared theme.                            |
| `assets/manifest.ts`     | Empty; uses shared Pixel Agents office pack.                   |
| `README.md`              | Floor-local notes.                                             |

Quest state lives in a `WeakMap` on `ctx.scene.game`, so talking to Rhea
survives FloorScene restarts in the same Phaser game, but not a full page
reload. That is intentional: a fresh visit is a new incident.

## Shared / core changes this branch made

These files sit **outside** the floor folder. Other floor branches may collide
here. Treat them as additive public API unless a merge conflict says otherwise.

### Contract (`src/core/contracts/floor.ts`)

Additive:

- `hud.setObjective(message)`
- `dialogue.showSequence(lines, onDismiss?)`
- `dialogue.dismiss()`
- `progression.completedThisSession(order)`
- `progression.canonicalThisSession(order)`
- `events.on(name, listener) => unsubscribe`
- `FloorView.replacesDefaultEmergencyEffects?: boolean`
- `OfficePropPlacement.angle` and `collisionBox` live in the UI kit, not the
  contract, but floors consume them through `createOfficeLayout`.

### Runtime (`src/core/runtime/FloorScene.ts`)

- Skips the old three blinking header lights when
  `replacesDefaultEmergencyEffects` is true.
- Wires the new dialogue / HUD / progression / event helpers above.

### UI kit (`src/core/ui-kit/office.ts`)

- Optional `angle` on props.
- Optional `collisionBox` (invisible static body instead of full sprite body).
- Optional NPC `frame` and `animationKey` (null = seated facing monitor).
- `createDefaultOfficeLayout` still exists for other floors. Floor 1 does
  **not** use it; it passes floor-local prop/NPC lists.

### UI scene (`src/scenes/UIScene.ts`)

- Multi-line dialogue sequences with Next / Done, X, and Escape.
- `dialogue:dismiss` and walk-away support.
- `ui:objective` updates the objective chip.
- Emergency chrome turns green only after
  `wasCanonicallyCompletedThisSession(currentFloor)`.
- FloorScene is relaunched after build close only on **canonical** session
  completion, so emergency lighting can swap to resolved.

Caveat: `create()` still special-cases floor order `1` when deciding whether
to apply the already-resolved chrome at UI boot. After merge, prefer driving
that from the active floor, not a hardcoded `1`.

### Build scene (`src/scenes/BuildScene.ts`)

- Close X sits at depth `1000` so outcome overlays cannot cover it.
- Escape closes the console.
- Emits `build:result` with `{ id, quality, title, message, debtNotes }`.
- After an evaluated attempt (any quality),
  `buildDesignStore.clearAfterEvaluatedAttempt(true)` so the next open is a
  blank client node. Drafts that were never stress-tested are kept.

Caveat: `BuildDesignStore` still uses storage key `uptime.floor1.design.v1`.
If Floor 2 later uses the same BuildScene, namespace the key by floor.

### Progression (`src/state/progression.ts`)

- `sessionResults: Map<number, DesignQuality>`
- Persisted localStorage still unlocks the next floor on partial **or**
  canonical (tech-debt path).
- Room calm / green / elevator handoff require **canonical this session**.
- A later page load with an old saved completion does **not** start green.
  The incident is live until solved again this session.

## Events Floor 1 listens to / emits

| Event                 | Direction          | Meaning                                        |
| --------------------- | ------------------ | ---------------------------------------------- |
| `dialogue:sequence`   | floor → UI         | Multi-line Rhea conversation + onDismiss.      |
| `dialogue:dismiss`    | floor → UI         | Walk-away or programmatic close.               |
| `ui:toast`            | floor → UI         | Short memo.                                    |
| `ui:objective`        | floor → UI         | Objective chip copy.                           |
| `build:open`          | floor → UI         | Open shared BuildScene.                        |
| `build:result`        | BuildScene → floor | Evaluated topology id + quality.               |
| `build:closed`        | BuildScene → UI    | Resume floor; maybe restart for resolved look. |
| `progression:updated` | BuildScene → UI    | Unlock / tech-debt; UI ignores non-canonical.  |

Outcome ids Floor 1 understands: `canonical`, `over-provisioned`,
`under-redundant`, `single-server-lb`, `single-server-direct`,
`unbalanced-direct`, `invalid`.

## Layout facts that matter after merge

- Rhea is left of the intern path (`RHEA_POSITION` ≈ 178, 350).
- Intern workstation is the empty fourth desk in the top row
  (`INTERN_WORKSTATION` ≈ 725, 194).
- Three seated NPCs face their computers (`frame: 7`, `animationKey: null`).
- Desk-row chairs stay unrotated. Conference / cactus chairs were swapped
  top↔bottom. Lounge chairs face each other beside the coffee table.
- Furniture uses explicit `collisionBox` footprints so players do not hit
  oversized sprite bodies.
- Floor 1 draws its own tiled surface over the shared gray office floor.
- Mug sits on the intern desk. No `INTERN-01 // BUILD READY` banner.

## Emergency / resolved presentation

Owned entirely by `view/effects.ts` because
`replacesDefaultEmergencyEffects` is set.

- Unresolved (and preview `calm` / `strained` / `down`): darker room, red
  mood wash, pulsing wall beacons with local halos (no projecting beams),
  timed camera shake, roaming NPCs sprint with raised-arm overlay.
- Resolved only if `canonicalThisSession(1)` or preview `state=fixed`:
  lighter room, green wash, calm beacon pulse, normal NPC routes.
- Reduced motion: static mood, no shake, no panic sprint.

Do not bring back the old shared three-dot header lights on this floor.

## Tests and verification this branch already ran

- `test/floors/f01Flow.test.ts` — gating, arrows, dialogue, collisions,
  lighting, tiles, chair groups, emergency vs resolved.
- `test/state/progression.test.ts` — persisted vs session vs canonical.
- `test/state/buildDesign.test.ts` — evaluated-attempt reset.
- `test/systems/DialogueSystem.test.ts` — still covers hint cycling.
- Commands used before push: `npm test`, `npm run validate:floors`,
  `npm run typecheck`, `npx prettier --check` on changed files, `npm run build`.

Repo-wide `npm run format:check` may still fail on
`PARALLEL_FLOOR_ARCHITECTURE.md`. This branch did not reformat that file.

## Merge risks for the main agent

1. **Shared-file conflicts** with other floor branches in:
   `src/core/contracts/floor.ts`, `src/core/runtime/FloorScene.ts`,
   `src/core/ui-kit/office.ts`, `src/scenes/UIScene.ts`,
   `src/scenes/BuildScene.ts`, `src/state/progression.ts`,
   `src/state/buildDesign.ts`, `src/ui/SpeechBubble.ts`.
   Keep Floor 1 additions. Do not drop `showSequence`, `dismiss`,
   `canonicalThisSession`, `replacesDefaultEmergencyEffects`, `collisionBox`,
   `angle`, or `build:result`.
2. **Do not revert Floor 1 onto `createDefaultOfficeLayout`.** Other floors
   can keep the default; f01 has a custom plan.
3. **Partial quality still unlocks Floor 2** via persisted progression, but
   Floor 1 visuals stay in emergency until a canonical session solve. That is
   deliberate teaching, not a bug.
4. **Elevator** is still the shared FloorScene elevator. Floor 1 only adds a
   guidance arrow once Rhea finishes the canonical debrief.
5. Other floors should set `replacesDefaultEmergencyEffects` only if they
   implement their own effects. Otherwise they keep the default header lights.

## What is done vs what main may still want

Done on Floor 1:

- Intern onboarding and console gate.
- Guided arrows and hint loop.
- Outcome-specific teaching debriefs.
- Canonical-only calm/green state.
- Accurate-ish furniture hitboxes.
- Tiled floor, gloomy red emergency lighting, flashing beacons.
- Close button always above build overlays.

Optional follow-ups for main (not Floor 1 blockers):

- Stop hardcoding floor order `1` in UIScene emergency chrome.
- Namespace build-design localStorage by floor id.
- Drive elevator unlock copy from discovery instead of “Floor 2 unlocked”.
- If Floor 0 / Floor 2 want sequences, reuse `dialogue.showSequence`; do not
  copy Floor 1 quest code.

## How to smoke-test after merge

1. `npm run dev` → `/?floor=f01`.
2. Console is locked. Talk to Rhea, dismiss, workstation unlocks, arrow moves.
3. Fail a design, close console: diagram is empty, room still red, Rhea debriefs,
   then retry is allowed.
4. Canonical Client → LB → 3 servers, close, debrief: room goes green, elevator
   arrow appears, Floor 2 unlocks.
5. Hard refresh: emergency is back even if last session was canonical; Rhea
   must onboard again; saved **evaluated** diagrams stay cleared.
6. Confirm `/?floor=f00` and `/?floor=f02` still boot and were not restyled
   as Traffic Operations.
