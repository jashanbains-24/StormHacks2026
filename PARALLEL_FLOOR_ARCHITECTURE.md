# Parallel Floor Architecture

> Companion to `PROJECT_SPEC.md`. **Where the two disagree about folder layout, this document wins.** Every gameplay, art, tone, and simulation requirement in the main spec still applies.

## 1. Goal

Three people each own one floor and build its UI **at the same time**, then merge with **zero conflicts**. The structure below exists to make conflicts structurally impossible, not just unlikely.

The one rule everything else serves:

> **A floor developer only ever creates or edits files inside their own floor folder. Nothing outside that folder needs to change for their floor to appear in the game.**

If that holds, three branches touch three disjoint sets of files, and git has nothing to conflict on.

## 2. Roles

| Role | Owns | Edits |
|---|---|---|
| **Integrator** (one person, may also own a floor) | Core, contracts, tooling, dependencies | Everything outside the floors folder |
| **Floor A** | Floor 1 (Scalability) | Only Floor 1's folder |
| **Floor B** | Floor 2 | Only Floor 2's folder |
| **Floor C** | Floor 3 | Only Floor 3's folder |

Floor 1 is the playable MVP floor. Floors 2 and 3 start as placeholders built to the exact same contract, so they can grow into real floors without any restructuring. If the team only needs two floors, drop one folder; nothing else changes.

The integrator's work happens **first** (Phase 0, section 11). After that, the core is frozen except through the change process in section 9.

## 3. Folder Structure

```
src/
  core/                          INTEGRATOR ONLY
    contracts/                   the types every floor builds against
    runtime/                     floor discovery, loading, scene lifecycle
    sim/                         traffic simulation engine (no Phaser)
    state/                       progression, per-floor results, tech-debt flags
    systems/                     dialogue, interaction, hints
    ui-kit/                      shared HUD, speech bubble, glossary popup, notifications
    theme/                       base style tokens
  floors/
    _template/                   copy this to start a floor (never loaded by the game)
    floor-01-scalability/        FLOOR A ONLY
    floor-02-<name>/             FLOOR B ONLY
    floor-03-<name>/             FLOOR C ONLY
  dev/                           standalone floor harness (INTEGRATOR ONLY)
```

### Inside every floor folder (identical shape)

```
floor-0N-<name>/
  index.ts                       the single entry point; exports the floor module
  definition/                    WHAT the floor is (pure data, no rendering)
    content.ts                   NPCs, dialogue, hint tiers, glossary terms
    incident.ts                  stress schedule, canonical solution, known partial designs
  view/                          HOW the floor looks (all presentation)
    layout.ts                    map, props, NPC placement, interactables
    buildUI.ts                   the build console for this floor
    effects.ts                   floor-specific emergency/success effects
  assets/
    manifest.ts                  every asset this floor uses
    ...images, tilemaps, audio
  theme.ts                       optional style overrides on top of the base theme
  README.md                      owner's notes for this floor
```

**Why this split:** `definition/` and `view/` are independent. Someone can rewrite a floor's whole look without touching its dialogue or solution logic, and vice versa. Neither imports from the other directly; they communicate through `index.ts`.

## 4. The Contract (what every floor must provide)

The contract lives in the core's contracts folder and is the **only thing floors depend on**. It is a small, stable set of types.

```ts
// Sketch only. The integrator finalizes this in Phase 0.
interface FloorModule {
  contractVersion: number
  id: string                       // "f01"; also the namespace prefix for every key
  title: string
  category: string                 // e.g. "Scalability"
  definition: FloorDefinition      // data: content + incident
  view: FloorView                  // presentation
  assets: AssetManifest
  theme?: Partial<ThemeTokens>
}

interface FloorView {
  createLayout(ctx: FloorContext): LayoutHandle
  createBuildUI(ctx: FloorContext): BuildUIHandle
  createEffects?(ctx: FloorContext): EffectsHandle
}
```

`FloorContext` is everything a floor is allowed to touch, handed in by the core:

- `dialogue`: show bubbles, run the tiered hint system
- `glossary`: register and open jargon popups
- `sim`: read-only simulation state and subscribe to updates
- `hud`: read-only health state, plus named slots a floor may fill with its own widgets
- `progression`: report the floor's result (canonical, partial, failed)
- `events`: a typed event bus for anything cross-cutting
- `theme`: merged base + floor tokens
- `assets`: load and look up this floor's assets by namespaced key

**Floors never import from the core's internals, from another floor, or from the game's scenes.** They import only the contract types and the public UI kit. The context is how everything else reaches them.

## 5. Automatic Floor Discovery (removes the biggest conflict hotspot)

The classic conflict is a central file that lists every floor. **There is no such file.**

The core's runtime discovers floors with a build-time glob over every floor's entry point (Vite's `import.meta.glob`). Adding a floor means adding a folder. Nothing registers it anywhere.

- Floor **order** is derived from the folder name's number prefix (`floor-01`, `floor-02`), not from a field in a shared file, so two people can never pick the same slot by editing the same line.
- At startup the core validates every discovered floor: duplicate ids, duplicate order numbers, missing contract fields, wrong contract version, and unprefixed keys. It fails fast with a clear message naming the floor.
- The elevator, the floor map, and the progression system all read from the discovered list. None of them know floors by name.

## 6. Conflict Hotspots and How Each Is Eliminated

| Typical conflict source | How it's removed |
|---|---|
| Central list of floors | Auto-discovery by folder; no list exists |
| Floor ordering | Derived from the folder number prefix |
| Shared theme/style file | Floors supply their own token overrides, merged over the base at runtime. No one edits the base. |
| Shared dialogue and glossary files | Each floor owns its own content files. IDs are prefixed by floor id. |
| Shared asset folder and asset manifest | Every floor has its own assets folder and manifest. Keys are prefixed by floor id. |
| Two people adding the same asset key | Impossible: prefixes differ per floor |
| `package.json` and lockfile | **Frozen** after Phase 0. Floors may not add dependencies (see below). |
| Config files (build, TypeScript, lint) | Integrator only |
| Barrel/index re-export files | Banned outside a floor's own folder |
| Global CSS | Banned. Any CSS a floor needs is scoped with the floor's class prefix and lives in its own folder. |
| Shared UI components | Read-only for floors. Variations are passed in as theme tokens or slot content. |
| Progression state | Floors report results via the context. They never write state directly. |
| Cross-floor references | Banned. Floors cannot import each other. Talk through the event bus. |
| Documentation | Each floor has its own README. Shared docs are integrator-only. |

### Dependencies

All dependencies for the whole project (Phaser, any UI plugin, audio, particle libraries, test tools) are decided and installed **once, by the integrator, in Phase 0**, before anyone branches. Floor developers do not run any install command that changes the manifest or lockfile.

If a floor needs something new, the developer files a request (section 9). The integrator adds it on main, and everyone rebases. This is the only way a lockfile changes, so it can't conflict.

## 7. Naming and Namespacing Rules

Every floor has a short id (`f01`, `f02`, `f03`). Everything a floor defines is prefixed with it.

| Thing | Pattern | Example |
|---|---|---|
| Asset keys | `f01.<type>.<name>` | `f01.sprite.server` |
| Dialogue ids | `f01_<speaker>_<purpose>` | `f01_specialist_hint_2` |
| Glossary ids | `f01.<term>` | `f01.load_balancer` |
| Event names | `f01:<event>` | `f01:server_crashed` |
| CSS classes | `.f01-<name>` | `.f01-build-panel` |
| Scene keys | `f01-<scene>` | `f01-layout` |

A validation script (section 8) rejects any floor whose keys are missing its prefix.

If two floors need the same glossary term (for example "server" shows up on both), **each floor defines its own copy.** Duplication is the price of zero conflicts. The integrator can promote a term to shared content later.

## 8. Guardrails (automatic enforcement)

Conventions fail under time pressure, so the repo enforces them.

1. **Path guard (CI and pre-push):** a script compares the files changed on a branch against the branch owner's allowed folder. A branch named `floor/02-*` that touches anything outside Floor 2's folder fails the check.
2. **Import boundaries (lint):** floors may import only from the contracts, the public UI kit, and their own folder. Imports from another floor or from core internals fail the lint step. A dependency-graph checker backs this up.
3. **Namespace validator:** scans every floor's assets, dialogue, glossary, events, and scene keys for the correct prefix.
4. **Conformance test:** one test, owned by the core, runs automatically against **every discovered floor**. It checks that the module satisfies the contract, the manifest points at real files, every glossary term referenced in dialogue exists, and the canonical solution passes the simulation. Floors never write this test; they just have to pass it.
5. **Code owners file:** maps each floor folder to its developer and the core and tooling paths to the integrator, so reviews route automatically.

All five run locally with one command, so a developer finds problems before they push.

## 9. Changing the Core (the only legitimate source of friction)

Sometimes a floor genuinely needs something the core doesn't offer: a new HUD slot, another context method, a new dependency.

1. The developer opens a short request: what they need and why, with the smallest possible API change.
2. The integrator implements it on main, bumps the contract version if the change is breaking, and announces it.
3. Everyone rebases onto main. Because floors only touch their own folders, the rebase is clean.

Floors must not work around a missing capability by reaching into the core. If a deadline forces a workaround, build it **inside the floor's own folder** and mark it with a clear `TODO(core-request)` note.

Contract changes should be **additive** wherever possible so existing floors keep working without edits.

## 10. Working on a Floor Alone

Nobody should have to wait for the other floors or for the full game flow.

The dev harness (owned by the integrator) loads any single floor directly by URL parameter. It provides:

- A **mock context** that fakes the dialogue system, progression, sim, and HUD
- A **floor selector**, so a developer can jump straight to their floor
- **State toggles** for the HUD (calm, strained, down, fixed) so emergency visuals can be tested without running a full simulation
- A **hot reload** loop that only reloads the active floor

Day-to-day, a floor developer runs the harness, picks their floor, and iterates on `view/` without ever launching the full game.

### Teammate guide: changing one floor's UI

Choose one floor and edit **only** its folder:

| Floor | Owned folder | Preview URL | Suggested branch |
|---|---|---|---|
| Tutorial | `src/floors/floor-00-tutorial/` | `/?floor=f00` | `floor/00-tutorial` |
| Scalability | `src/floors/floor-01-scalability/` | `/?floor=f01` | `floor/01-scalability` |
| Storage | `src/floors/floor-02-storage/` | `/?floor=f02` | `floor/02-storage` |

For UI work, use these files inside your owned folder:

- `view/layout.ts` — furniture, map layout, NPC placement, and interactables.
- `view/buildUI.ts` — the floor's build-console presentation.
- `view/effects.ts` — floor-specific emergency and success effects.
- `theme.ts` — floor-specific color, spacing, and radius overrides.
- `assets/manifest.ts` and `assets/` — floor-specific images, spritesheets, and audio.
- `index.ts` — connects the floor's private files to the shared floor contract. Change it only when exposing another part of your floor module.

Workflow:

1. Create your branch from the shared integration commit using the suggested branch name.
2. Run `npm run dev`.
3. Open your preview URL. The lower-left controls can switch between the `calm`, `strained`, `down`, and `fixed` preview states.
4. Make all changes inside your owned floor folder.
5. Run `npm run validate:floors` before pushing. The pre-push hook and CI reject edits outside your owned folder on a `floor/NN-*` branch.

Floor code may import only:

- files inside the same floor folder;
- `src/core/contracts`; and
- `src/core/ui-kit`.

Do **not** edit shared scenes, core runtime, another floor, `package.json`, the lockfile, global CSS, or shared assets from a floor branch. If the public contract or UI kit is missing something, ask the integrator to add the smallest shared API needed, then rebase your floor branch.

Assets, dialogue IDs, glossary IDs, events, CSS classes, and scene keys must use the floor's namespace (`f00`, `f01`, or `f02`). A teammate should be able to merge any of the three floor branches in any order without resolving a shared-file conflict.

### Starting a new floor

1. Copy the template folder, rename it with the next number prefix, and set the floor id.
2. Fill in `definition/` (content and incident) and `view/` (layout, build UI, effects).
3. List every asset in `assets/manifest.ts`.
4. Run the harness, then run the guardrails command.
5. Open a PR from a branch named `floor/<number>-<name>`.

## 11. Phases

### Phase 0: Foundation (integrator only, about 1.5 to 2.5 hours)
Everyone else can read the spec, find assets, and sketch their floor on paper meanwhile.

1. Scaffold the project and **install every dependency**. Commit and lock them.
2. Write the contracts and publish them. **Tell the floor developers when this is done; it's their starting gun.**
3. Build floor discovery and validation.
4. Build the shared UI kit's public API (HUD with named slots, speech bubble, glossary popup, notification).
5. Build the dev harness and the mock context.
6. Add the floor template.
7. Set up the five guardrails in section 8.
8. Create the three floor branches from this commit.

### Phase 1: Parallel work (all three, as long as possible)
- Each floor developer works only in their own folder, on their own branch.
- Commit often. Rebase on main whenever the integrator announces a core update.
- Floor 1 includes the full playable incident. Floors 2 and 3 include a rendered, enterable layout with a titled "coming soon" state, built to the same contract.
- The integrator builds the real simulation, progression, and elevator in parallel and keeps the harness current.

### Phase 2: Merge (about 30 minutes)
1. Run the guardrails on each branch.
2. Merge the three floor branches in **any order**. They touch disjoint files, so the result is the same either way.
3. Run the full game end to end: alert, tutorial, Floor 1 incident, elevator, Floor 2 and 3 placeholders.
4. Fix integration issues on main. Floors are only touched by their owners.

### Phase 3: Polish
Humor pass, emergency effects, success sequence, deployment. Ownership rules still apply.

## 12. Keeping Each Piece Independently Changeable

The decoupling rules, stated as requirements for the agent:

- A floor's **definition** (data) never imports its **view** (presentation), and the reverse. They connect only through the module entry point.
- The **simulation** has no dependency on the engine or any view. The same sim can drive different floor UIs.
- The **shared UI kit** has no knowledge of any floor. Floors customize it only through theme tokens and slot content.
- **Floors cannot see each other.** Removing a floor folder must leave the game running with the remaining floors.
- **Replacing a floor's entire look** (assets, layout, effects) requires changing only its `view/`, `assets/`, and optionally `theme.ts`.
- **Replacing a floor's puzzle** requires changing only its `definition/` folder.
- Every module exposes a **small public surface**. Anything not exported through the entry point is private.
- Prefer composition and injection over inheritance and globals. No global mutable state outside the core's state module.

## 13. Reuse and Refactor Reminder

The reuse-first directive from the main spec applies to every floor. Developers are encouraged to reuse open-source assets and code, but **borrowed code must be pulled into the owning floor's folder and refactored to the contract**, never dropped into shared areas. Record sources in the floor's own README, so there's no shared credits file to fight over. The integrator assembles the combined credits at the end.

## 14. Definition of Done

**Structure**
- [ ] Adding a floor requires adding only a folder.
- [ ] No central floor list exists anywhere.
- [ ] Removing any floor folder leaves the game running.
- [ ] Three floor branches merge in any order with zero conflicts.

**Floor module (each)**
- [ ] Passes the conformance test, the namespace validator, and the import-boundary lint.
- [ ] Runs standalone in the dev harness.
- [ ] Touches no files outside its own folder.
- [ ] README lists sources of any reused assets or code.

**Core**
- [ ] Dependencies locked before the floor branches were created.
- [ ] Contracts versioned and documented.
- [ ] Harness, template, and guardrails documented in the core README.

**Game**
- [ ] Elevator lists floors from discovery and respects unlock state.
- [ ] Completing Floor 1 reports its result through the context and unlocks Floor 2.
- [ ] Tech-debt flags set by Floor 1's result are visible on that floor.
