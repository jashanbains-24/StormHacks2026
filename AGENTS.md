# Agent Guidance

## Sequential, maintainable changes

- Work in small, sequential steps. Finish and verify one behavior before starting
  the next.
- Refactor the affected code as each step is completed; do not accumulate
  temporary duplication, oversized methods, dead code, or deferred cleanup.
- Keep future changes easy by extracting reusable data, entities, systems, and
  UI wrappers instead of adding one-off scene logic.
- Preserve the project boundaries: content belongs in `src/data`, pure game
  rules in `src/sim`, state in `src/state`, and Phaser presentation in scenes,
  entities, systems, or UI modules.
- Prefer extending existing abstractions over creating parallel implementations.
- After every substantive change, run the relevant tests, type-check, production
  build, formatting check, and linter diagnostics before committing.
- Keep commits focused and push verified milestones as work progresses.
- create tests but not to the point where there are too many, just create a generic test suite for that feature

# CONTEXT
Directory structure:
└── jashanbains-24-stormhacks2026/
    ├── README.md
    ├── AGENTS.md
    ├── CREDITS.md
    ├── index.html
    ├── LICENSE
    ├── package.json
    ├── PARALLEL_FLOOR_ARCHITECTURE.md
    ├── PROJECT_SPEC.md
    ├── tsconfig.json
    ├── .prettierignore
    ├── public/
    │   ├── style.css
    │   └── assets/
    │       └── office/
    │           └── LICENSE.pixel-agents
    ├── scripts/
    │   └── validate-floors.mjs
    ├── src/
    │   ├── main.ts
    │   ├── vite-env.d.ts
    │   ├── config/
    │   │   ├── dimensions.ts
    │   │   ├── gameConfig.ts
    │   │   ├── simConfig.ts
    │   │   └── theme.ts
    │   ├── core/
    │   │   ├── README.md
    │   │   ├── contracts/
    │   │   │   ├── floor.ts
    │   │   │   └── index.ts
    │   │   ├── runtime/
    │   │   │   ├── floorRegistry.ts
    │   │   │   └── FloorScene.ts
    │   │   └── ui-kit/
    │   │       ├── index.ts
    │   │       └── office.ts
    │   ├── data/
    │   │   ├── build.ts
    │   │   ├── office.ts
    │   │   └── solutions.ts
    │   ├── dev/
    │   │   └── floorHarness.ts
    │   ├── entities/
    │   │   ├── Interactable.ts
    │   │   ├── Npc.ts
    │   │   └── Player.ts
    │   ├── floors/
    │   │   ├── _template/
    │   │   │   ├── README.md
    │   │   │   ├── index.ts
    │   │   │   ├── theme.ts
    │   │   │   ├── assets/
    │   │   │   │   └── manifest.ts
    │   │   │   ├── definition/
    │   │   │   │   ├── content.ts
    │   │   │   │   └── incident.ts
    │   │   │   └── view/
    │   │   │       ├── buildUI.ts
    │   │   │       ├── effects.ts
    │   │   │       └── layout.ts
    │   │   ├── floor-00-tutorial/
    │   │   │   ├── README.md
    │   │   │   ├── index.ts
    │   │   │   ├── theme.ts
    │   │   │   ├── assets/
    │   │   │   │   └── manifest.ts
    │   │   │   ├── definition/
    │   │   │   │   ├── content.ts
    │   │   │   │   └── incident.ts
    │   │   │   └── view/
    │   │   │       ├── buildUI.ts
    │   │   │       ├── effects.ts
    │   │   │       └── layout.ts
    │   │   ├── floor-01-scalability/
    │   │   │   ├── README.md
    │   │   │   ├── index.ts
    │   │   │   ├── theme.ts
    │   │   │   ├── assets/
    │   │   │   │   └── manifest.ts
    │   │   │   ├── definition/
    │   │   │   │   ├── content.ts
    │   │   │   │   └── incident.ts
    │   │   │   └── view/
    │   │   │       ├── buildUI.ts
    │   │   │       ├── effects.ts
    │   │   │       └── layout.ts
    │   │   └── floor-02-storage/
    │   │       ├── README.md
    │   │       ├── index.ts
    │   │       ├── theme.ts
    │   │       ├── assets/
    │   │       │   └── manifest.ts
    │   │       ├── definition/
    │   │       │   ├── content.ts
    │   │       │   └── incident.ts
    │   │       └── view/
    │   │           ├── buildUI.ts
    │   │           ├── effects.ts
    │   │           └── layout.ts
    │   ├── scenes/
    │   │   ├── BootScene.ts
    │   │   ├── BuildScene.ts
    │   │   ├── PreloadScene.ts
    │   │   └── UIScene.ts
    │   ├── sim/
    │   │   ├── evaluator.ts
    │   │   ├── simulation.ts
    │   │   └── types.ts
    │   ├── state/
    │   │   ├── buildDesign.ts
    │   │   ├── preferences.ts
    │   │   └── progression.ts
    │   ├── systems/
    │   │   ├── AudioSystem.ts
    │   │   ├── DialogueSystem.ts
    │   │   ├── EventBus.ts
    │   │   └── InteractionSystem.ts
    │   └── ui/
    │       ├── BuildNode.ts
    │       ├── GlossaryPopup.ts
    │       ├── Notification.ts
    │       ├── Palette.ts
    │       └── SpeechBubble.ts
    ├── test/
    │   ├── config/
    │   │   └── theme.test.ts
    │   ├── core/
    │   │   └── floorRegistry.test.ts
    │   ├── sim/
    │   │   ├── evaluator.test.ts
    │   │   ├── fixtures.ts
    │   │   └── simulation.test.ts
    │   ├── state/
    │   │   ├── buildDesign.test.ts
    │   │   └── progression.test.ts
    │   └── systems/
    │       └── DialogueSystem.test.ts
    ├── vite/
    │   ├── config.dev.mjs
    │   └── config.prod.mjs
    ├── .githooks/
    │   └── pre-push
    └── .github/
        └── workflows/
            ├── deploy.yml
            └── floor-validation.yml


Files Content:

================================================
FILE: README.md
================================================
# Uptime

Uptime is a 2D office game that teaches system design by putting an intern in
charge of a production outage. Walk the office, learn jargon from the SRE, then
drag, wire, and stress-test a real architecture.

Built for StormHacks 2026 with Phaser 3, TypeScript, and Vite.

## Play

The latest `main` build deploys automatically with GitHub Pages:

<https://jashanbains-24.github.io/StormHacks2026/>

### Controls

- `WASD` or arrow keys: move
- `E`: interact with the elevator, specialist, and build console
- Mouse: drag components and wire `OUT` ports to `IN` ports
- Right-click: remove a placed build component

## Local development

Requires Node.js 22 or a current LTS release.

```bash
npm install
npm run dev
```

Open <http://localhost:8080>.

Useful checks:

```bash
npm test          # pure simulation, evaluator, dialogue, and state tests
npm run typecheck
npm run build     # verified production build in dist/
npm run format
```

## Architecture

The project deliberately separates the educational model from Phaser:

- `src/sim/`: pure TypeScript traffic simulation and design evaluator; no
  Phaser imports.
- `src/data/`: floor content, dialogue, glossary, component copy, and teaching
  outcomes.
- `src/state/`: progression, tech debt, and accessibility preferences.
- `src/scenes/`: world, build console, loading, and HUD orchestration.
- `src/entities/`, `src/systems/`, `src/ui/`: focused presentation modules.
- `src/config/theme.ts`: shared visual tokens.
- `src/config/simConfig.ts`: capacities, failure thresholds, and stress phases.

The stress test models incoming RPS, round-robin load distribution, server
capacity, sustained overload, an injected server failure, dropped requests,
and stability. `Client → Load Balancer → 3 Servers` is the canonical solution.

## Adding a floor

1. Add the floor and component limits in `src/data/floors.ts`.
2. Add stable dialogue IDs in `src/data/dialogue.ts` and terms in
   `src/data/glossary.ts`.
3. Add known designs and teaching messages in `src/data/solutions.ts`.
4. Add any new pure component behavior to `src/sim/` with tests.
5. Compose the floor from reusable world systems and document new assets in
   `CREDITS.md`.

New educational content should be data. Scene code should only orchestrate and
render it.

## Deployment

`.github/workflows/deploy.yml` tests and builds every push to `main`, then
publishes `dist/` through GitHub Pages.

For the repository URL, production Vite uses `/StormHacks2026/` as its base.
For a custom `.tech` domain:

1. Add the domain to `public/CNAME`.
2. Set `CUSTOM_DOMAIN=true` in the build step so Vite uses `/`.
3. Point the domain's DNS records to GitHub Pages.
4. Configure the same custom domain under repository **Settings → Pages**.

## Credits

See [CREDITS.md](CREDITS.md) for reused code and visual assets.



================================================
FILE: AGENTS.md
================================================
# Agent Guidance

## Sequential, maintainable changes

- Work in small, sequential steps. Finish and verify one behavior before starting
  the next.
- Refactor the affected code as each step is completed; do not accumulate
  temporary duplication, oversized methods, dead code, or deferred cleanup.
- Keep future changes easy by extracting reusable data, entities, systems, and
  UI wrappers instead of adding one-off scene logic.
- Preserve the project boundaries: content belongs in `src/data`, pure game
  rules in `src/sim`, state in `src/state`, and Phaser presentation in scenes,
  entities, systems, or UI modules.
- Prefer extending existing abstractions over creating parallel implementations.
- After every substantive change, run the relevant tests, type-check, production
  build, formatting check, and linter diagnostics before committing.
- Keep commits focused and push verified milestones as work progresses.
- create tests but not to the point where there are too many, just create a generic test suite for that feature



================================================
FILE: CREDITS.md
================================================
# Credits

Uptime reuses and adapts open-source work so the project can focus on the game
and teaching experience.

## Code and tools

- [Phaser Vite TypeScript Template](https://github.com/phaserjs/template-vite-ts)
  by Phaser Studio (MIT). Used as the initial browser/bundler scaffold, then
  reorganized around Uptime's scenes, simulation, data, and state modules.
- [Phaser](https://phaser.io/) 3.90 and [Vite](https://vite.dev/), used under
  their respective open-source licenses.

## Visual assets

- Selected floor, wall, diverse character, desk, computer, seating, lounge,
  storage, plant, and office-detail sprites from
  [Pixel Agents](https://github.com/pablodelucca/pixel-agents) by Pablo De Lucca
  (MIT). Files were renamed, reduced to the subset used by the game, scaled in
  Phaser, and placed into a new office layout. The upstream MIT license is
  included at `public/assets/office/LICENSE.pixel-agents`.
- Pixel Agents notes that its character sheets are based on
  [Metro City](https://jik-a-4.itch.io/metrocity-free-topdown-character-pack)
  by JIK-A-4.

## Original work

All game design, copy, system-design simulation, progression, scene composition,
and Uptime-specific UI are original to this project.



================================================
FILE: index.html
================================================
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="theme-color" content="#1f2933" />
    <meta
      name="description"
      content="Uptime: a system-design office game built for StormHacks 2026."
    />
    <link rel="icon" type="image/png" href="./favicon.png" />
    <link rel="stylesheet" href="./style.css" />
    <title>Uptime — System Design Office</title>
  </head>
  <body>
    <main id="app" aria-label="Uptime game">
      <div id="game-container"></div>
      <noscript>Uptime needs JavaScript to run.</noscript>
    </main>
    <script type="module" src="/src/main.ts"></script>
  </body>
</html>



================================================
FILE: LICENSE
================================================
MIT License

Copyright (c) 2025 Phaser Studio Inc

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.



================================================
FILE: package.json
================================================
{
  "name": "uptime",
  "description": "A system-design office game built for StormHacks 2026.",
  "version": "0.1.0",
  "private": true,
  "license": "MIT",
  "scripts": {
    "dev": "vite --config vite/config.dev.mjs",
    "build": "npm run typecheck && vite build --config vite/config.prod.mjs",
    "dev-nolog": "vite --config vite/config.dev.mjs",
    "build-nolog": "vite build --config vite/config.prod.mjs",
    "typecheck": "tsc --noEmit",
    "test": "vitest run",
    "test:watch": "vitest",
    "validate:floors": "node scripts/validate-floors.mjs && vitest run test/core/floorRegistry.test.ts",
    "guard:floor-branch": "node scripts/validate-floors.mjs",
    "setup:hooks": "git config core.hooksPath .githooks",
    "format": "prettier --write .",
    "format:check": "prettier --check ."
  },
  "devDependencies": {
    "prettier": "^3.9.9",
    "typescript": "~5.7.2",
    "vite": "^6.3.1",
    "vitest": "^5.0.3"
  },
  "dependencies": {
    "phaser": "3.90.0",
    "terser": "^5.39.0"
  }
}



================================================
FILE: PARALLEL_FLOOR_ARCHITECTURE.md
================================================
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



================================================
FILE: PROJECT_SPEC.md
================================================
# Project Spec: "Uptime" (working title): A System Design Office Game

> Hand this file to any coding agent (Claude Code, Cursor, Copilot, etc.). It is self-contained.
> The owner reviews and tweaks. **The agent builds everything.**

---

## 1. One-Paragraph Pitch

A 2D, top-down, satirical office game. You are a **new intern accidentally left in charge during an outage**. The company HQ is a tall building where **each floor represents a category of system design**. An alert fires, you rush to the right floor, talk to a specialist who speaks in jargon you don't know, learn the terms, and then **drag-and-drop system components to fix the architecture**. A simulation shows whether your design survives. When the system is truly stable, the floor turns green and the elevator opens to the next floor, which unlocks new technology. The building growing taller = the architecture growing larger.

## 2. Hard Constraints and Priorities

| Constraint | Detail |
|---|---|
| Team / time | **Solo, under 24 hours.** Scope ruthlessly. |
| Dimensions | **2D only.** Non-Euclidean geometry is a far-future stretch goal. Do NOT implement it. |
| Reuse first | Reuse open-source assets, templates, and code wherever possible. Do not reinvent wheels. (See section 4.) |
| Code quality | **Clean, modular, refactored.** The owner will heavily restyle the UI later, so game logic and UI must be separable. |
| No custom art | Do not draw custom art. Find and reuse existing packs. |
| No neon | Do not use a neon aesthetic. |
| Agent-agnostic | Do not rely on tool-specific features. |
| Deploy | Must run in a browser via a public URL (GitHub Pages). |

## 3. Tech Stack

- **Engine:** Phaser 3 (browser, JavaScript/TypeScript).
- **Language:** TypeScript (preferred for clean, refactorable code).
- **Bundler:** Vite. Start from the official Phaser + Vite + TypeScript template (`phaserjs/template-vite-ts`) and refactor it.
- **Maps:** Tiled map editor (`.tmj` JSON) loaded with Phaser's tilemap support, if it speeds up building the floor layouts. Otherwise a simple hand-coded tile grid is fine.
- **Drag-and-drop:** Phaser's built-in input drag system.
- **Hosting:** GitHub Pages via GitHub Actions auto-deploy.
- **Backend:** none for MVP. Everything is client-side.

### Sponsor-track alignment (replace things in the stack where it genuinely fits)

| Sponsor | Use | When |
|---|---|---|
| **.Tech domain** | Serve the game from a `.tech` domain instead of `github.io` (add `CNAME`, configure DNS). | **MVP** |
| **GitHub** | Repo, Pages hosting, Actions deploy. | **MVP** |
| **ElevenLabs** | Voice the manager and specialist lines. | Post-MVP |
| **Gemini API** | Free-form NPC hint chat grounded in the sim state. | Post-MVP |
| **Tiger Data** | Persist progression/currency and sim metrics (needs a backend). | Post-MVP |

Do not integrate Solana or Snowflake.

## 4. REUSE-FIRST DIRECTIVE (important)

The owner wants maximum reuse. Ethics/licensing gating is **not** a concern for this project. Borrowing large parts of existing open-source projects is explicitly allowed, **as long as it is refactored or modified so it is clearly our own project, not a straight copy.**

**Agent workflow:**
1. **Before writing any system from scratch, search for an existing open-source implementation** (GitHub, itch.io, OpenGameArt, npm). Examples to check first:
   - Phaser official templates and examples (`phaserjs/template-vite-ts`, Phaser examples gallery for top-down movement, drag-and-drop, dialogue boxes, tilemaps, particles).
   - Open-source Phaser top-down / RPG / dialogue-box / UI plugin projects (e.g., search "phaser 3 top down rpg typescript", "phaser dialogue box", "rexUI phaser plugin").
   - Open-source tower-defense / node-graph / traffic-flow simulations for inspiration on the sim visuals.
2. **Assets:** use existing free packs for everything visual and audio. Starting points (verify availability yourself): Kenney.nl (office/tiles/UI/particles packs), itch.io free office/interior tilesets, OpenGameArt.org. Prefer a **bright, clean, cartoonish office** look. Characters, furniture, servers, elevators, stairs, UI frames, icons, SFX should all come from packs.
3. **Refactor what you borrow:** rename, restructure into our module layout (section 7), adapt to our data-driven design, and recolor or retheme where needed.
4. **Document what was reused** in `CREDITS.md` (what, where from, what was changed). This file is for the owner's reference.
5. Prefer well-maintained plugins (e.g., rexUI for Phaser) over hand-rolling UI widgets if they save time, but keep them behind thin wrapper modules so they can be swapped.

## 5. Game Design

### 5.1 Tone and Art Direction
- **Tone:** funny, chaotic office satire layered over a genuinely tense emergency. Think clueless management, absurd memos, panicked coworkers, while the servers burn.
- **Art:** bright, clean, cartoonish pixel-art office. **No neon.** Red alert flashing/lighting during the emergency; everything shifts to bright and calm (green accents) when stabilized.
- **Camera:** top-down (Hotline Miami-style *camera*, not its palette or violence).
- **Visual stimulation matters:** alarms, flashing red lights, screen shake on crashes, overloaded servers smoking/sparking, a visible countdown or urgency indicator, particles flowing along wires. The emergency must feel alive. Make the success state a big, satisfying all-green celebration.

### 5.2 Controls
- **WASD / arrow keys:** move
- **E:** interact (talk to NPC, use elevator/stairs, open the build console)
- **Mouse:** drag-and-drop components in build mode; click jargon words and popups

### 5.3 Core Loop (MVP)
1. **Game starts immediately with a manager alert.** No separate intro. A text-bubble/notification from the Manager appears: high-level, panicky, jargon-light. (Example tone: "THE WEBSITE IS DOWN. EVERYONE IS TWEETING. WHY ARE YOU STILL STANDING THERE, YOU'RE IN CHARGE.")
2. **Tutorial happens while rushing to the floor:** lightweight prompts for movement and interact ("WASD to run!", "Press E at the elevator"). Keep them dismissible and short.
3. Player travels via **stairs or elevator** (both exist visually; elevator is the primary route and is how floors unlock) to the relevant floor.
4. On the floor, find the **specialist NPC** (see 6.2). Press **E** to talk. Each interaction gives the **next hint tier (max 3)**, increasingly specific. Text bubbles only.
5. **Jargon words in dialogue are highlighted and clickable.** Clicking opens a small popup with a plain-English explanation. Terms are data (see 7.3).
6. Player opens the **build console** (an interactive object on the floor, press E) and **free-builds** a system by dragging components from the palette onto a canvas and wiring them.
7. Player presses **Run**. The **simulation** runs with emergency visuals.
8. Outcome:
   - **Canonical solution:** system goes green and stays stable, then the celebration plays. The elevator opens to the next floor.
   - **Non-canonical but survives the immediate crisis:** teaching popup (see 6.6). Player still advances, and the floor is **flagged as tech debt**.
   - **Fails:** system crashes visibly. Player returns to edit and retry.
9. **Next floor:** rendered and enterable, but contains **no incident yet** (placeholder). It exists so progression feels real. Display its category title (e.g., "Floor 2: Data Storage, coming soon").

### 5.4 Progression Model
- Each floor = a **category of system design**. The building's height represents the size of the architecture you manage.
- Each floor **unlocks new components** in the build palette and introduces the jargon for them. Floor 1 only exposes what it needs.
- **Tech debt (MVP scope: data only):** every floor stores a result `{ quality: "canonical" | "partial" | "failed", debtNotes: string[] }`. Show a warning marker on partial floors. The later mechanic (a future incident traces back to the weak floor and the player must return and fix it) is **post-MVP**, but the data model must support it.
- Currency / unlockable floors by spending: **post-MVP.**

## 6. MVP Content: Floor 1

**Category:** Scalability / Load Distribution
**Incident:** A traffic spike is crashing the company's only server.
**Canonical fix:** a Load Balancer in front of multiple identical servers.

### 6.1 Manager (notification only, no NPC walking required)
High-level, panicky, non-technical. Sets the stakes. Directs the player to the right floor.

### 6.2 Specialist NPC
A field/ops specialist on the Floor 1 office (a "Site Reliability / Infrastructure" type, written as a funny character, not a generic engineer). Uses jargon on purpose. The player learns the language via clickable terms, then goes back to the problem.

**Hint tiers (reference wording, the agent may rewrite for humor):**
1. **Vague:** "Everybody and their cat hit the site at once, and we only have ONE server doing all the work. One machine can only handle so many requests per second."
2. **Directional:** "You need to spread the traffic across more than one server. Something has to stand in front and decide who gets which request, a... load balancer."
3. **Specific:** "Put a load balancer between the clients and your servers, then add enough servers that the system still survives if one of them dies. Think capacity PLUS a spare."

After tier 3, further interactions repeat tier 3.

### 6.3 Jargon Glossary (clickable terms, plain-English popup text, data-driven)
- **Traffic spike:** a sudden surge in the number of users hitting your system.
- **Requests per second (RPS):** how many user requests arrive every second.
- **Throughput / capacity:** how many requests one machine can handle before struggling.
- **Server:** a computer that answers user requests.
- **Load balancer:** a traffic cop that splits incoming requests across multiple servers.
- **Round robin:** handing out requests to servers one by one, in turn.
- **Horizontal scaling:** handling more load by adding more machines instead of a bigger one.
- **Single point of failure (SPOF):** one component whose failure takes the whole system down.
- **Redundancy:** having spare capacity so one failure doesn't break things.

### 6.4 Build Palette (Floor 1)
- **Client(s):** fixed traffic source, already placed, not removable.
- **Load Balancer:** max 1.
- **Server:** up to 5.

Wiring: player draws connections (click-drag from output to input, or drop components into slots; the agent picks whichever is fastest to implement cleanly). Connection rules should be simple and validated (Client -> LB or Server; LB -> Servers).

### 6.5 Simulation Spec (simple and clean)
Keep the simulation a **pure TypeScript module with zero Phaser dependencies** (see section 7), driven by a tick function and a config. Phaser only renders it.

**Model:**
- **Client** emits requests at a rate (RPS) following a **stress schedule** (config).
- **Load Balancer** distributes incoming requests across *healthy* connected servers, round robin. If it has no healthy servers, requests are dropped.
- **Direct client -> server wiring (no LB):** all traffic goes to the first connected server only.
- **Server** has a `capacity` (RPS). Load > capacity makes it `strained`; sustained overload for N seconds makes it `crashed` (dropped requests, visual explosion/smoke). Crashed servers are removed from LB rotation.
- Track **error rate** (dropped / total) and per-server load; drive the visuals from this.

**Default config (tunable constants in one config file):**
- Server capacity: **40 RPS**
- Overload tolerance before crash: **3 s**
- Stress schedule (looped after first pass):
  1. Baseline: **20 RPS**
  2. Traffic spike ramps to **70 RPS**
  3. **Injected failure:** one random connected server crashes during the spike (simulating hardware failure)
  4. Growth wave: sustained **75 RPS**
  5. After the schedule, traffic continues with small random fluctuation inside a safe band, indefinitely.

**Stability / win rule:** the system is "stable" when no server is crashed beyond the injected failure and error rate stays under ~1%. The **solved** state triggers after the full stress schedule completes with the system stable, followed by a short additional green period. After that the sim keeps running green (it must *genuinely* hold up, not just briefly look okay). Any crash resets progress toward "stable".

### 6.6 Solutions Table (one canonical; others get teaching popups)

| Design | Result | Popup message (rewrite with humor) |
|---|---|---|
| **Client -> LB -> 3 servers** | **Canonical: Stable.** Celebration, advance clean. | n/a |
| Client -> LB -> 4-5 servers | Passes, flagged as over-provisioned. | "It works, but you're paying for servers that are napping." |
| Client -> LB -> 2 servers | Survives the spike, **fails when the injected failure hits / growth wave arrives.** Advance with tech debt. | "2 servers handled the spike, but lose one and the survivor can't carry the load. No spare capacity means no safety net. Try thinking about N+1." |
| Client -> LB -> 1 server | Crashes. | "A load balancer with one server is just a middleman. It adds nothing; the server still melts." |
| Client -> 1 server (no LB) | Crashes. | "One machine, all the traffic, and a lot of sadness." |
| Client -> multiple servers (no LB) | Crashes (only the first server gets traffic). | "You bought more servers but nobody is directing traffic to them. Something needs to split the requests." |

Popups for partial/failed designs must explain **why the canonical solution is better and name concrete cases where the player's design would fail** (more users, a server failure, etc.).

### 6.7 Floor 2 (Placeholder)
Rendered, enterable, no incident. Title card shows the next category (suggest "Data Storage / Caching"). No gameplay.

## 7. Architecture and Code Organization (important)

The owner will heavily restyle later. **Strictly separate game logic, data/content, and presentation.**

```
src/
  main.ts
  config/
    gameConfig.ts          # Phaser config
    simConfig.ts           # capacities, thresholds, stress schedules
    theme.ts               # colors, fonts, spacing: ALL UI styling tokens live here
  data/                    # CONTENT AS DATA, no logic
    floors.ts              # floor definitions: category, palette, incident, solutions
    dialogue.ts            # {id, speaker, text}[] (stable IDs for future voice/AI)
    glossary.ts            # term -> definition
    solutions.ts           # canonical + known-partial designs and popup text
  sim/                     # PURE TS, NO PHASER IMPORTS, unit-testable
    types.ts
    simulation.ts          # tick(), state, stability evaluation
    evaluator.ts           # classify a design: canonical / partial / failed
  state/
    progression.ts         # unlocked floors, per-floor results incl. debt flags
  scenes/
    BootScene.ts
    PreloadScene.ts
    FloorScene.ts          # top-down floor: player, NPCs, interactables
    BuildScene.ts          # drag-and-drop canvas + sim rendering
    UIScene.ts             # HUD, notifications, speech bubbles, popups
  entities/
    Player.ts
    Npc.ts
    Interactable.ts
  ui/                      # thin wrappers over any UI plugin; no game rules here
    SpeechBubble.ts
    GlossaryPopup.ts
    Notification.ts
    Palette.ts
  systems/
    DialogueSystem.ts      # reads data/dialogue.ts, tiered hints
    InteractionSystem.ts
```

**Rules:**
- `sim/` must never import Phaser. Rendering reads sim state; sim never reads rendering.
- All strings, hints, popup text, and jargon live in `data/`, never hardcoded in scenes.
- All colors/fonts/sizes come from `config/theme.ts`.
- **Dialogue is data with stable IDs** (e.g., `{ id: "f1_specialist_hint_2", speaker: "specialist", text: "..." }`) so ElevenLabs audio or a Gemini chat can be bolted on later with no rewrite.
- Adding a new floor should mean adding data (plus assets), not rewriting systems.
- Typed, small files, descriptive names, comments explaining *why*, not *what*.
- Persist progression in memory during play (optionally `localStorage` in the deployed game).

## 8. Milestone Plan (solo, <24h, adjust as needed)

| # | Milestone | Target |
|---|---|---|
| 1 | Scaffold from Phaser+Vite+TS template, folder structure, deploy "hello world" to GitHub Pages | 1 h |
| 2 | Source and import asset packs, build `CREDITS.md`, pick palette in `theme.ts` | 1.5 h |
| 3 | Floor scene: tilemap, player movement, collisions, elevator/stairs, floor transition | 3 h |
| 4 | Manager notification + tutorial prompts + speech bubble system + tiered hints + clickable glossary | 3 h |
| 5 | `sim/` module with tests (stress schedule, LB, capacity, crash, stability, evaluator) | 3 h |
| 6 | BuildScene: palette, drag-and-drop, wiring, Run button, sim rendering (particles, server states) | 4 h |
| 7 | Emergency polish: red alerts, screen shake, alarms; green celebration; teaching popups; tech-debt flag | 3 h |
| 8 | Floor 2 placeholder + progression state + elevator unlock | 1 h |
| 9 | `.tech` domain, README, final deploy, smoke test | 1 h |
| 10 | Buffer / bug fixing / humor pass | 3 h |

**If time runs short, cut in this order:** stairs (keep elevator) -> tutorial prompts -> over-provisioned popup -> particle effects. Never cut: the sim, the canonical solution, the teaching popup, the celebration.

## 9. MVP Definition of Done
- [ ] Game loads from a public URL (ideally a `.tech` domain).
- [ ] Manager alert fires immediately on start.
- [ ] Player can walk, reach the elevator, and travel to Floor 1.
- [ ] Specialist gives 3 escalating hints; jargon is clickable with popups.
- [ ] Player can drag and drop Load Balancer + Servers and wire them.
- [ ] Simulation runs with visible emergency effects.
- [ ] Canonical solution (LB + 3 servers) stabilizes, triggers the celebration, and unlocks Floor 2.
- [ ] Each non-canonical design shows the correct teaching popup; partial designs flag tech debt.
- [ ] Floor 2 is enterable and empty.
- [ ] `sim/` has no Phaser imports; content lives in `data/`; styling lives in `theme.ts`.
- [ ] `CREDITS.md` documents reused assets/code and what was changed.
- [ ] `README.md` explains how to run, build, deploy, and add a new floor.

## 10. Items the Agent Decides (owner will review)
- Names for the player, manager, and specialist; the satirical jokes, memos, and flavor text.
- Exact hint/popup wording (keep the intent in sections 6.2 and 6.6).
- Fine-tuning of simulation numbers so the six designs in 6.6 behave as described.
- Which specific asset packs and plugins to use.
- Wiring interaction details (click-drag vs slots), as long as it's simple and clean.

## 11. Post-MVP Roadmap (do NOT build now, but do not block)
1. **Voice:** ElevenLabs voices for Manager and Specialist (separate voices), triggered by dialogue IDs.
2. **Gemini NPC chat:** free-form questions to the specialist, grounded in the current sim state and glossary.
3. **Currency and progression:** earn currency, spend to unlock floors; building grows with the architecture. Tiger Data as the backend for persistence/leaderboards.
4. **Tech-debt mechanic:** a later incident traces back to a flagged floor; player must return and fix it.
5. **More floors / categories:** caching, databases, CDNs, queues, security (inspiration: 1Password and Safety Cybersecurity themes), each unlocking new components and jargon.
6. **NPC variety:** floors with non-engineer NPCs (product managers, support reps, field specialists) whose language the player must learn.
7. **Non-Euclidean geometry:** far-future stretch.



================================================
FILE: tsconfig.json
================================================
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "module": "ESNext",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "skipLibCheck": true,
    /* Bundler mode */
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "isolatedModules": true,
    "moduleDetection": "force",
    "noEmit": true,
    /* Linting */
    "strictPropertyInitialization": false,
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "noUncheckedSideEffectImports": true
  },
  "include": ["src", "test"]
}



================================================
FILE: .prettierignore
================================================
.gitignore
dist/
node_modules/
public/assets/
package-lock.json
PROJECT_SPEC.md
LICENSE



================================================
FILE: public/style.css
================================================
html,
body {
  margin: 0;
  min-height: 100%;
  background: #1f2933;
}

#app {
  width: 100%;
  height: 100dvh;
  overflow: hidden;
  display: grid;
  place-items: center;
}

#game-container {
  width: 100%;
  height: 100%;
}

canvas {
  display: block;
}



================================================
FILE: public/assets/office/LICENSE.pixel-agents
================================================
MIT License

Copyright (c) 2026 Pablo De Lucca

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.



================================================
FILE: scripts/validate-floors.mjs
================================================
import { execFileSync } from "node:child_process";
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { dirname, join, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const floorsRoot = join(root, "src", "floors");
const floorPattern = /^floor-(\d{2})-[a-z0-9-]+$/;

const filesBelow = (directory) =>
  readdirSync(directory).flatMap((name) => {
    const path = join(directory, name);
    return statSync(path).isDirectory() ? filesBelow(path) : [path];
  });

const failures = [];
const floorFolders = readdirSync(floorsRoot)
  .filter((name) => floorPattern.test(name))
  .sort();

for (const folder of floorFolders) {
  const floorRoot = join(floorsRoot, folder);
  const order = floorPattern.exec(folder)[1];
  const expectedId = `f${order}`;
  const indexPath = join(floorRoot, "index.ts");
  if (!existsSync(indexPath)) {
    failures.push(`${folder}: missing index.ts`);
    continue;
  }
  const indexSource = readFileSync(indexPath, "utf8");
  if (!indexSource.includes(`id: "${expectedId}"`)) {
    failures.push(`${folder}: id must be "${expectedId}"`);
  }

  for (const path of filesBelow(floorRoot).filter((file) =>
    file.endsWith(".ts"),
  )) {
    const source = readFileSync(path, "utf8");
    const imports = source.matchAll(/from\s+["']([^"']+)["']/g);
    for (const [, specifier] of imports) {
      if (!specifier.startsWith(".")) {
        failures.push(
          `${relative(root, path)}: external import "${specifier}" is not allowed`,
        );
        continue;
      }
      const target = resolve(dirname(path), specifier);
      const insideOwnFloor =
        target === floorRoot || target.startsWith(`${floorRoot}${sep}`);
      const publicCoreImport =
        target === join(root, "src", "core", "contracts") ||
        target.startsWith(`${join(root, "src", "core", "contracts")}${sep}`) ||
        target === join(root, "src", "core", "ui-kit") ||
        target.startsWith(`${join(root, "src", "core", "ui-kit")}${sep}`);
      if (!insideOwnFloor && !publicCoreImport) {
        failures.push(
          `${relative(root, path)}: import "${specifier}" crosses a floor boundary`,
        );
      }
    }
  }

  const contentPath = join(floorRoot, "definition", "content.ts");
  if (existsSync(contentPath)) {
    const source = readFileSync(contentPath, "utf8");
    for (const [, id] of source.matchAll(/\bid:\s*["']([^"']+)["']/g)) {
      if (
        !id.startsWith(`${expectedId}_`) &&
        !id.startsWith(`${expectedId}.`)
      ) {
        failures.push(`${folder}: content id "${id}" is not namespaced`);
      }
    }
  }
}

const currentBranch = (() => {
  const ciBranch = process.env.GITHUB_HEAD_REF || process.env.GITHUB_REF_NAME;
  if (ciBranch) return ciBranch;
  try {
    return execFileSync("git", ["branch", "--show-current"], {
      cwd: root,
      encoding: "utf8",
    }).trim();
  } catch {
    return "";
  }
})();
const floorBranch = currentBranch.match(/^floor\/(\d{2})-/);
if (floorBranch) {
  const allowedPrefix = `src/floors/floor-${floorBranch[1]}-`;
  const changed = new Set();
  for (const args of [
    ["diff", "--name-only", "main...HEAD"],
    ["diff", "--name-only", "origin/main...HEAD"],
    ["diff", "--name-only"],
    ["diff", "--name-only", "--cached"],
  ]) {
    try {
      execFileSync("git", args, { cwd: root, encoding: "utf8" })
        .split("\n")
        .filter(Boolean)
        .forEach((file) => changed.add(file));
    } catch {
      // A missing main ref should not hide other validation failures.
    }
  }
  for (const file of changed) {
    if (!file.startsWith(allowedPrefix)) {
      failures.push(
        `${currentBranch}: changed "${file}" outside ${allowedPrefix}*`,
      );
    }
  }
}

if (floorFolders.length === 0) {
  failures.push("No floor modules were discovered");
}

if (failures.length > 0) {
  console.error(`Floor validation failed:\n- ${failures.join("\n- ")}`);
  process.exit(1);
}

console.log(`Validated ${floorFolders.length} isolated floor modules.`);



================================================
FILE: src/main.ts
================================================
import Phaser from "phaser";

import { createGameConfig } from "./config/gameConfig";

document.addEventListener("DOMContentLoaded", () => {
  new Phaser.Game(createGameConfig("game-container"));
});



================================================
FILE: src/vite-env.d.ts
================================================
/// <reference types="vite/client" />



================================================
FILE: src/config/dimensions.ts
================================================
export const GAME_WIDTH = 1280;
export const GAME_HEIGHT = 720;



================================================
FILE: src/config/gameConfig.ts
================================================
import Phaser from "phaser";

import { BuildScene } from "../scenes/BuildScene";
import { BootScene } from "../scenes/BootScene";
import { FloorScene } from "../core/runtime/FloorScene";
import { PreloadScene } from "../scenes/PreloadScene";
import { UIScene } from "../scenes/UIScene";
import { GAME_HEIGHT, GAME_WIDTH } from "./dimensions";
import { THEME } from "./theme";

export const createGameConfig = (
  parent: string,
): Phaser.Types.Core.GameConfig => ({
  type: Phaser.AUTO,
  parent,
  width: GAME_WIDTH,
  height: GAME_HEIGHT,
  backgroundColor: THEME.colors.ink,
  pixelArt: true,
  roundPixels: true,
  physics: {
    default: "arcade",
    arcade: { debug: false },
  },
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  scene: [BootScene, PreloadScene, FloorScene, BuildScene, UIScene],
});



================================================
FILE: src/config/simConfig.ts
================================================
export interface StressPhase {
  id: "baseline" | "ramp" | "spike" | "growth" | "steady";
  durationSeconds: number;
  startRps: number;
  endRps: number;
  injectFailureAtSeconds?: number;
}

export interface SimulationConfig {
  serverCapacityRps: number;
  overloadToleranceSeconds: number;
  stableErrorRate: number;
  requiredGreenSeconds: number;
  phases: StressPhase[];
}

export const SIM_CONFIG: SimulationConfig = {
  serverCapacityRps: 40,
  overloadToleranceSeconds: 3,
  stableErrorRate: 0.01,
  requiredGreenSeconds: 2,
  phases: [
    { id: "baseline", durationSeconds: 3, startRps: 20, endRps: 20 },
    { id: "ramp", durationSeconds: 4, startRps: 20, endRps: 70 },
    {
      id: "spike",
      durationSeconds: 3,
      startRps: 70,
      endRps: 70,
      injectFailureAtSeconds: 1,
    },
    { id: "growth", durationSeconds: 5, startRps: 75, endRps: 75 },
    { id: "steady", durationSeconds: 3, startRps: 70, endRps: 75 },
  ],
};



================================================
FILE: src/config/theme.ts
================================================
export const THEME = {
  colors: {
    ink: 0x1f2933,
    paper: 0xf7f3e8,
    officeFloor: 0xd8c9aa,
    officeWall: 0x6d7f8f,
    alert: 0xc73e3a,
    alertDark: 0x742a27,
    success: 0x2f855a,
    successLight: 0x9ae6b4,
    warning: 0xd69e2e,
    panel: 0xfffbeb,
    panelDark: 0x34495e,
    muted: 0x718096,
    white: 0xffffff,
  },
  fonts: {
    family: '"Trebuchet MS", "Avenir Next", sans-serif',
    mono: '"SFMono-Regular", Consolas, monospace',
  },
  spacing: {
    xs: 6,
    sm: 10,
    md: 16,
    lg: 24,
    xl: 36,
  },
  radius: {
    sm: 6,
    md: 12,
  },
} as const;

export const colorHex = (color: number): string =>
  `#${color.toString(16).padStart(6, "0")}`;



================================================
FILE: src/core/README.md
================================================
# Floor Core

The integrator owns this directory. Floor branches treat it as read-only.

## Public floor API

Floors may import only:

- `src/core/contracts`
- `src/core/ui-kit`
- files inside their own floor folder

`FloorModule` is versioned by `FLOOR_CONTRACT_VERSION`. Runtime discovery uses
`import.meta.glob` over `src/floors/floor-*/index.ts`; there is no registration
list.

## Development harness

Run `npm run dev`, then open:

- `/?floor=f00` — tutorial
- `/?floor=f01` — scalability
- `/?floor=f02` — storage placeholder

When a floor query is present, controls in the lower-left switch floors and
preview `calm`, `strained`, `down`, and `fixed` simulation states. Floors read
the preview through `ctx.preview` and the matching mock data through
`ctx.sim.snapshot`.

## Guardrails

`npm run validate:floors` checks folder/id matching, import boundaries,
namespaced content, runtime contract conformance, duplicate IDs/orders, and
glossary references.

On branches named `floor/00-*`, `floor/01-*`, or `floor/02-*`, the same command
also rejects changed files outside that floor's folder.

Run `npm run setup:hooks` once after cloning to enable the repository's
pre-push validation hook. Pull requests and pushes to `floor/**` branches run
the same validation in CI.



================================================
FILE: src/core/contracts/floor.ts
================================================
import type Phaser from "phaser";

import type {
  ComponentType,
  DesignQuality,
  SimulationState,
} from "../../sim/types";

export const FLOOR_CONTRACT_VERSION = 1;

export interface FloorDialogueLine {
  id: string;
  speaker: "manager" | "specialist" | "system";
  speakerName: string;
  text: string;
  glossaryIds?: string[];
}

export interface FloorGlossaryEntry {
  id: string;
  term: string;
  definition: string;
}

export interface FloorContent {
  managerAlert?: FloorDialogueLine;
  specialistHints: FloorDialogueLine[];
  glossary: FloorGlossaryEntry[];
  tutorial: {
    move?: string;
    interact?: string;
    elevator?: string;
    build?: string;
  };
}

export interface FloorIncidentDefinition {
  title: string | null;
  availableComponents: {
    type: ComponentType;
    max: number;
  }[];
  canonicalServerCount?: number;
}

export interface FloorDefinition {
  content: FloorContent;
  incident: FloorIncidentDefinition;
}

export interface FloorImageAsset {
  key: string;
  path: string;
}

export interface FloorSpritesheetAsset extends FloorImageAsset {
  frameWidth: number;
  frameHeight: number;
}

export interface AssetManifest {
  images: FloorImageAsset[];
  spritesheets: FloorSpritesheetAsset[];
  audio: FloorImageAsset[];
}

export interface ThemeTokens {
  colors: Record<string, number> & {
    ink: number;
    paper: number;
    officeFloor: number;
    officeWall: number;
    alert: number;
    success: number;
    successLight: number;
    warning: number;
    panel: number;
    panelDark: number;
    muted: number;
    white: number;
  };
  fonts: {
    family: string;
    mono: string;
  };
  spacing: Record<string, number>;
  radius: Record<string, number>;
}

export type FloorTheme = {
  colors?: Partial<ThemeTokens["colors"]>;
  spacing?: Partial<ThemeTokens["spacing"]>;
  radius?: Partial<ThemeTokens["radius"]>;
};

export type FloorPreviewState = "calm" | "strained" | "down" | "fixed";

export interface FloorInteractable {
  id: string;
  label: string;
  x: number;
  y: number;
  range?: number;
  onInteract: () => void;
}

export interface FloorNpcOptions {
  texture?: string;
  frame?: number;
  flipX?: boolean;
  animationKey?: string | null;
  staticBody?: boolean;
}

export interface FloorNpcHandle extends Phaser.Physics.Arcade.Sprite {
  updateMovementAnimation(): void;
}

export interface FloorContext {
  readonly scene: Phaser.Scene;
  readonly player: Phaser.Physics.Arcade.Sprite;
  readonly floorOrder: number;
  readonly theme: ThemeTokens;
  readonly preview: {
    readonly enabled: boolean;
    readonly state: FloorPreviewState;
  };
  readonly preferences: {
    readonly reducedMotion: boolean;
  };
  readonly sim: {
    snapshot?: SimulationState;
  };
  readonly hud: {
    showToast(message: string): void;
  };
  readonly dialogue: {
    showSpecialist(): void;
  };
  readonly glossary: {
    open(id: string): void;
  };
  readonly progression: {
    readonly unlockedFloor: number;
    resultFor(
      order: number,
    ): { quality: DesignQuality; debtNotes: string[] } | undefined;
    report(order: number, quality: DesignQuality, debtNotes: string[]): void;
  };
  readonly events: {
    emit(name: string, ...args: unknown[]): void;
  };
  readonly assets: {
    key(localName: string): string;
  };
  addInteractable(interactable: FloorInteractable): void;
  addNpc(
    x: number,
    y: number,
    id: string,
    options?: FloorNpcOptions,
  ): FloorNpcHandle;
  addUpdater(update: () => void): void;
  openBuild(): void;
  navigateTo(order: number): void;
}

export interface LayoutHandle {
  destroy?(): void;
}

export interface BuildUIHandle {
  destroy?(): void;
}

export interface EffectsHandle {
  destroy?(): void;
}

export interface FloorView {
  createLayout(ctx: FloorContext): LayoutHandle;
  createBuildUI(ctx: FloorContext): BuildUIHandle;
  createEffects?(ctx: FloorContext): EffectsHandle;
}

export interface FloorModule {
  contractVersion: number;
  id: string;
  title: string;
  category: string;
  definition: FloorDefinition;
  view: FloorView;
  assets: AssetManifest;
  theme?: FloorTheme;
}

export interface DiscoveredFloor {
  order: number;
  folder: string;
  module: FloorModule;
}



================================================
FILE: src/core/contracts/index.ts
================================================
export {
  FLOOR_CONTRACT_VERSION,
  type AssetManifest,
  type BuildUIHandle,
  type DiscoveredFloor,
  type EffectsHandle,
  type FloorContent,
  type FloorContext,
  type FloorDefinition,
  type FloorDialogueLine,
  type FloorGlossaryEntry,
  type FloorIncidentDefinition,
  type FloorInteractable,
  type FloorModule,
  type FloorPreviewState,
  type FloorTheme,
  type FloorView,
  type LayoutHandle,
  type ThemeTokens,
} from "./floor";



================================================
FILE: src/core/runtime/floorRegistry.ts
================================================
import {
  FLOOR_CONTRACT_VERSION,
  type DiscoveredFloor,
  type FloorModule,
} from "../contracts";

type FloorEntryModule = {
  default?: FloorModule;
  floor?: FloorModule;
};

const discoveredEntries = import.meta.glob<FloorEntryModule>(
  "../../floors/floor-*/index.ts",
  { eager: true },
);

const orderFromPath = (path: string): number => {
  const match = path.match(/\/floor-(\d+)-[^/]+\/index\.ts$/);
  if (!match) throw new Error(`Invalid floor folder name: ${path}`);
  return Number(match[1]);
};

const floorFromEntry = (path: string, entry: FloorEntryModule): FloorModule => {
  const floor = entry.default ?? entry.floor;
  if (!floor) {
    throw new Error(`${path} must export a default FloorModule`);
  }
  return floor;
};

const assertPrefix = (
  floor: FloorModule,
  value: string,
  separator: "." | "_" | ":",
  kind: string,
): void => {
  if (!value.startsWith(`${floor.id}${separator}`)) {
    throw new Error(
      `${floor.id} ${kind} "${value}" must start with "${floor.id}${separator}"`,
    );
  }
};

export const validateFloor = (floor: FloorModule, folder: string): void => {
  if (floor.contractVersion !== FLOOR_CONTRACT_VERSION) {
    throw new Error(
      `${folder} uses floor contract ${floor.contractVersion}; expected ${FLOOR_CONTRACT_VERSION}`,
    );
  }
  if (!/^f\d{2}$/.test(floor.id)) {
    throw new Error(`${folder} has invalid id "${floor.id}"`);
  }
  if (!floor.title || !floor.category || !floor.definition || !floor.view) {
    throw new Error(`${floor.id} is missing required contract fields`);
  }
  if (
    typeof floor.view.createLayout !== "function" ||
    typeof floor.view.createBuildUI !== "function"
  ) {
    throw new Error(`${floor.id} must provide layout and build UI factories`);
  }

  const lines = [
    ...(floor.definition.content.managerAlert
      ? [floor.definition.content.managerAlert]
      : []),
    ...floor.definition.content.specialistHints,
  ];
  lines.forEach((line) => assertPrefix(floor, line.id, "_", "dialogue id"));
  floor.definition.content.glossary.forEach((entry) =>
    assertPrefix(floor, entry.id, ".", "glossary id"),
  );
  for (const line of lines) {
    for (const glossaryId of line.glossaryIds ?? []) {
      assertPrefix(floor, glossaryId, ".", "glossary reference");
      if (
        !floor.definition.content.glossary.some(
          (entry) => entry.id === glossaryId,
        )
      ) {
        throw new Error(
          `${floor.id} dialogue ${line.id} references missing glossary term ${glossaryId}`,
        );
      }
    }
  }
  for (const asset of [
    ...floor.assets.images,
    ...floor.assets.spritesheets,
    ...floor.assets.audio,
  ]) {
    assertPrefix(floor, asset.key, ".", "asset key");
  }
};

const discoverFloors = (): DiscoveredFloor[] => {
  const floors = Object.entries(discoveredEntries).map(([path, entry]) => {
    const order = orderFromPath(path);
    const floor = floorFromEntry(path, entry);
    const folder = path.slice(0, path.lastIndexOf("/"));
    validateFloor(floor, folder);
    return { order, folder, module: floor };
  });

  const ids = new Set<string>();
  const orders = new Set<number>();
  floors.forEach(({ module, order }) => {
    if (ids.has(module.id)) throw new Error(`Duplicate floor id ${module.id}`);
    if (orders.has(order)) throw new Error(`Duplicate floor order ${order}`);
    ids.add(module.id);
    orders.add(order);
  });
  return floors.sort((left, right) => left.order - right.order);
};

const floors = discoverFloors();

export const getFloors = (): readonly DiscoveredFloor[] => floors;

export const getFloorByOrder = (order: number): DiscoveredFloor => {
  const floor = floors.find((candidate) => candidate.order === order);
  if (!floor) throw new Error(`Unknown floor order ${order}`);
  return floor;
};

export const getFloorById = (id: string): DiscoveredFloor => {
  const floor = floors.find((candidate) => candidate.module.id === id);
  if (!floor) throw new Error(`Unknown floor id ${id}`);
  return floor;
};

export const getNextFloor = (order: number): DiscoveredFloor | undefined => {
  const index = floors.findIndex((candidate) => candidate.order === order);
  return index === -1 ? undefined : floors[index + 1];
};



================================================
FILE: src/core/runtime/FloorScene.ts
================================================
import Phaser from "phaser";

import { GAME_HEIGHT, GAME_WIDTH } from "../../config/dimensions";
import { THEME, colorHex } from "../../config/theme";
import type {
  FloorContext,
  FloorInteractable,
  ThemeTokens,
} from "../contracts";
import type { Interactable } from "../../entities/Interactable";
import { Npc } from "../../entities/Npc";
import { Player } from "../../entities/Player";
import type { SimulationState } from "../../sim/types";
import { preferences } from "../../state/preferences";
import { progression } from "../../state/progression";
import { gameEvents } from "../../systems/EventBus";
import { InteractionSystem } from "../../systems/InteractionSystem";
import { getFloorByOrder, getFloors } from "./floorRegistry";

export class FloorScene extends Phaser.Scene {
  private currentFloor = 0;
  private preview: FloorContext["preview"] = {
    enabled: false,
    state: "calm",
  };
  private simulationSnapshot?: SimulationState;
  private player!: Player;
  private interactions!: InteractionSystem;
  private updaters: (() => void)[] = [];
  private interactables: Interactable[] = [];

  constructor() {
    super("FloorScene");
  }

  init(
    data: {
      floor?: number;
      preview?: FloorContext["preview"];
      simulationSnapshot?: SimulationState;
    } = {},
  ): void {
    this.currentFloor = data.floor ?? 0;
    this.preview = data.preview ?? { enabled: false, state: "calm" };
    this.simulationSnapshot = data.simulationSnapshot;
  }

  create(): void {
    const floor = getFloorByOrder(this.currentFloor);
    const theme = this.floorTheme(floor.module.theme);
    this.updaters = [];
    this.interactables = [];
    this.cameras.main.setBackgroundColor(theme.colors.officeFloor);
    this.physics.world.setBounds(40, 82, GAME_WIDTH - 80, GAME_HEIGHT - 122);
    this.add
      .tileSprite(40, 82, GAME_WIDTH - 80, GAME_HEIGHT - 122, "office-floor")
      .setOrigin(0)
      .setTileScale(4)
      .setDepth(-10);
    this.player = new Player(this, 130, GAME_HEIGHT / 2);
    this.createBoundaries(theme);
    this.createHeader(floor.module.title, theme);
    this.createEmergencyLights(theme);

    const context = this.createContext(theme);
    this.createElevator(context);
    floor.module.view.createLayout(context);
    floor.module.view.createBuildUI(context);
    floor.module.view.createEffects?.(context);

    this.interactions = new InteractionSystem(this, this.player);
    this.interactions.setInteractables(this.interactables);
    gameEvents.emit("floor:changed", this.currentFloor, floor.module.id);
  }

  update(): void {
    this.player.update();
    this.updaters.forEach((update) => update());
    this.interactions.update();
  }

  private createContext(theme: ThemeTokens): FloorContext {
    const floor = getFloorByOrder(this.currentFloor);
    return {
      scene: this,
      player: this.player,
      floorOrder: this.currentFloor,
      theme,
      preview: this.preview,
      preferences: {
        reducedMotion: preferences.snapshot.reducedMotion,
      },
      sim: {
        snapshot: this.simulationSnapshot,
      },
      hud: {
        showToast: (message) => gameEvents.emit("ui:toast", message),
      },
      dialogue: {
        showSpecialist: () =>
          gameEvents.emit("dialogue:specialist", floor.module.id),
      },
      glossary: {
        open: (id) => gameEvents.emit("glossary:open", id),
      },
      progression: {
        get unlockedFloor() {
          return progression.snapshot.unlockedFloor;
        },
        resultFor: (order) => progression.snapshot.floorResults[order],
        report: (order, quality, debtNotes) => {
          progression.completeFloor(order, quality, debtNotes);
          gameEvents.emit("progression:updated", progression.snapshot);
        },
      },
      events: {
        emit: (name, ...args) => gameEvents.emit(name, ...args),
      },
      assets: {
        key: (localName) =>
          localName.startsWith(`${floor.module.id}.`)
            ? localName
            : `${floor.module.id}.${localName}`,
      },
      addInteractable: (interactable: FloorInteractable) => {
        this.interactables.push(interactable);
      },
      addNpc: (x, y, id, options) => new Npc(this, x, y, id, options),
      addUpdater: (update) => this.updaters.push(update),
      openBuild: () => gameEvents.emit("build:open", floor.module.id),
      navigateTo: (order) => this.navigateTo(order),
    };
  }

  private createHeader(title: string, theme: ThemeTokens): void {
    const separator = title.indexOf(":");
    const floorLabel = separator === -1 ? title : title.slice(0, separator);
    const floorTitle =
      separator === -1 ? "" : title.slice(separator + 1).trim();
    const panelWidth = 470;
    const panelHeight = 68;
    const panelX = (GAME_WIDTH - panelWidth) / 2;
    const header = this.add.graphics().setDepth(700);
    header.fillStyle(theme.colors.ink, 0.25);
    header.fillRoundedRect(panelX + 5, 5, panelWidth, panelHeight, 14);
    header.fillStyle(theme.colors.panelDark);
    header.lineStyle(2, theme.colors.officeWall);
    header.fillRoundedRect(panelX, 0, panelWidth, panelHeight, 14);
    header.strokeRoundedRect(panelX, -2, panelWidth, panelHeight, 14);
    this.add
      .text(GAME_WIDTH / 2, 10, floorLabel.toUpperCase(), {
        color: colorHex(theme.colors.successLight),
        fontFamily: theme.fonts.mono,
        fontSize: "13px",
        fontStyle: "bold",
        letterSpacing: 1.5,
      })
      .setOrigin(0.5, 0)
      .setDepth(701);
    this.add
      .text(GAME_WIDTH / 2, 29, floorTitle, {
        color: colorHex(theme.colors.white),
        fontFamily: theme.fonts.family,
        fontSize: "24px",
        fontStyle: "bold",
      })
      .setOrigin(0.5, 0)
      .setDepth(701);

    if (
      progression.snapshot.floorResults[this.currentFloor]?.quality ===
      "partial"
    ) {
      this.add
        .text(GAME_WIDTH / 2 + panelWidth / 2 + 18, 20, "⚠ TECH DEBT", {
          color: colorHex(theme.colors.warning),
          backgroundColor: colorHex(theme.colors.ink),
          fontFamily: theme.fonts.mono,
          fontSize: "13px",
          fontStyle: "bold",
          padding: { x: 8, y: 6 },
        })
        .setDepth(701);
    }
  }

  private createBoundaries(theme: ThemeTokens): void {
    const walls = [
      [GAME_WIDTH / 2, 82, GAME_WIDTH - 80, 24],
      [GAME_WIDTH / 2, GAME_HEIGHT - 40, GAME_WIDTH - 80, 24],
      [40, GAME_HEIGHT / 2, 24, GAME_HEIGHT - 100],
      [GAME_WIDTH - 40, GAME_HEIGHT / 2, 24, GAME_HEIGHT - 100],
    ] as const;
    for (const [x, y, width, height] of walls) {
      const wall = this.add.rectangle(
        x,
        y,
        width,
        height,
        theme.colors.officeWall,
      );
      this.physics.add.existing(wall, true);
      this.physics.add.collider(this.player, wall);
    }
  }

  private createEmergencyLights(theme: ThemeTokens): void {
    const resolved = progression.snapshot.floorResults[1] !== undefined;
    const color = resolved ? theme.colors.success : theme.colors.alert;
    [180, 640, 1090].forEach((x) => {
      const light = this.add.circle(x, 97, 10, color, 0.9).setDepth(30);
      if (!resolved && !preferences.snapshot.reducedMotion) {
        this.tweens.add({
          targets: light,
          alpha: { from: 0.25, to: 1 },
          duration: 1000,
          yoyo: true,
          repeat: -1,
        });
      }
    });
  }

  private createElevator(ctx: FloorContext): void {
    const elevatorY = GAME_HEIGHT / 2;
    ctx.scene.add
      .rectangle(
        GAME_WIDTH - 102,
        elevatorY,
        104,
        174,
        ctx.theme.colors.panelDark,
      )
      .setStrokeStyle(6, ctx.theme.colors.ink)
      .setDepth(elevatorY);
    ctx.scene.add
      .text(GAME_WIDTH - 102, elevatorY - 10, "ELEVATOR", {
        color: colorHex(ctx.theme.colors.white),
        fontFamily: ctx.theme.fonts.family,
        fontSize: "16px",
        fontStyle: "bold",
      })
      .setOrigin(0.5)
      .setAngle(-90)
      .setDepth(elevatorY + 1);
    ctx.addInteractable({
      id: `${getFloorByOrder(this.currentFloor).module.id}:elevator`,
      label: this.elevatorLabel(),
      x: GAME_WIDTH - 135,
      y: elevatorY,
      range: 105,
      onInteract: () => this.useElevator(),
    });
  }

  private elevatorDestination(): number {
    const floors = getFloors();
    const index = floors.findIndex(
      (floor) => floor.order === this.currentFloor,
    );
    return floors[index + 1]?.order ?? floors[Math.max(0, index - 1)].order;
  }

  private elevatorLabel(): string {
    const destination = getFloorByOrder(this.elevatorDestination());
    return destination.order > this.currentFloor
      ? `Take elevator to ${destination.module.title}`
      : `Return to ${destination.module.title}`;
  }

  private useElevator(): void {
    const destination = this.elevatorDestination();
    if (
      destination > this.currentFloor &&
      progression.snapshot.unlockedFloor < destination
    ) {
      gameEvents.emit(
        "ui:toast",
        `${getFloorByOrder(destination).module.title} is locked. Stabilize this floor first.`,
      );
      return;
    }
    this.navigateTo(destination);
  }

  private navigateTo(order: number): void {
    getFloorByOrder(order);
    this.cameras.main.fadeOut(220, 31, 41, 51);
    this.time.delayedCall(230, () =>
      this.scene.restart({
        floor: order,
        preview: this.preview,
        simulationSnapshot: this.simulationSnapshot,
      }),
    );
  }

  private floorTheme(
    overrides: ReturnType<typeof getFloorByOrder>["module"]["theme"],
  ): ThemeTokens {
    return {
      colors: { ...THEME.colors, ...overrides?.colors },
      fonts: THEME.fonts,
      spacing: { ...THEME.spacing, ...overrides?.spacing },
      radius: { ...THEME.radius, ...overrides?.radius },
    };
  }
}



================================================
FILE: src/core/ui-kit/index.ts
================================================
export {
  createDefaultOfficeLayout,
  createOfficeLayout,
  type AmbientNpcPlacement,
  type OfficePropPlacement,
} from "./office";

export const colorHex = (color: number): string =>
  `#${color.toString(16).padStart(6, "0")}`;



================================================
FILE: src/core/ui-kit/office.ts
================================================
import type { FloorContext } from "../contracts";
import { AMBIENT_NPCS_BY_FLOOR, OFFICE_PROPS } from "../../data/office";

export interface OfficePropPlacement {
  x: number;
  y: number;
  texture: string;
  scale?: number;
  collider?: boolean;
  depthOffset?: number;
}

export type AmbientNpcBehavior =
  | { kind: "desk" }
  | {
      kind: "route";
      toX: number;
      toY: number;
      durationMs: number;
      pauseMs: number;
    };

export interface AmbientNpcPlacement {
  id: string;
  x: number;
  y: number;
  texture: string;
  behavior: AmbientNpcBehavior;
  flipX?: boolean;
}

export const createOfficeLayout = (
  ctx: FloorContext,
  props: OfficePropPlacement[],
  npcs: AmbientNpcPlacement[],
): void => {
  for (const prop of props) {
    const image = ctx.scene.physics.add
      .staticImage(prop.x, prop.y, prop.texture)
      .setScale(prop.scale ?? 3)
      .setDepth(prop.y + (prop.depthOffset ?? 0));
    image.refreshBody();
    if (prop.collider ?? true) {
      ctx.scene.physics.add.collider(ctx.player, image);
    }
  }

  for (const placement of npcs) {
    const moving =
      placement.behavior.kind === "route" && !ctx.preferences.reducedMotion;
    const npc = ctx.addNpc(placement.x, placement.y, placement.id, {
      texture: placement.texture,
      flipX: placement.flipX,
      animationKey:
        !ctx.preferences.reducedMotion && placement.behavior.kind === "desk"
          ? `office-${placement.texture}-type`
          : null,
      staticBody: !moving,
    });
    ctx.scene.physics.add.collider(ctx.player, npc);
    if (moving && placement.behavior.kind === "route") {
      ctx.addUpdater(() => npc.updateMovementAnimation());
      ctx.scene.tweens.add({
        targets: npc,
        x: placement.behavior.toX,
        y: placement.behavior.toY,
        duration: placement.behavior.durationMs,
        yoyo: true,
        repeat: -1,
        yoyoDelay: placement.behavior.pauseMs,
        repeatDelay: placement.behavior.pauseMs,
      });
    }
  }
};

export const createDefaultOfficeLayout = (ctx: FloorContext): void => {
  createOfficeLayout(
    ctx,
    OFFICE_PROPS,
    AMBIENT_NPCS_BY_FLOOR[ctx.floorOrder] ?? [],
  );
};



================================================
FILE: src/data/build.ts
================================================
import type { ComponentType } from "../sim/types";

export interface ComponentDefinition {
  type: ComponentType;
  label: string;
  shortLabel: string;
  description: string;
}

export const COMPONENTS: Record<ComponentType, ComponentDefinition> = {
  client: {
    type: "client",
    label: "Clients",
    shortLabel: "USERS",
    description: "The fixed source of incoming traffic.",
  },
  loadBalancer: {
    type: "loadBalancer",
    label: "Load Balancer",
    shortLabel: "LB",
    description: "Splits traffic across healthy servers.",
  },
  server: {
    type: "server",
    label: "Server",
    shortLabel: "SERVER",
    description: "Handles up to 40 requests per second.",
  },
};

export const BUILD_COPY = {
  title: "INCIDENT ARCHITECTURE CONSOLE",
  subtitle: "Drag components onto the canvas. Drag an OUT port to an IN port.",
  run: "RUN STRESS TEST",
  reset: "RESET DESIGN",
  saved: "SAVED LOCALLY",
  edit: "EDIT DESIGN",
  close: "RETURN TO OFFICE",
  remove: "Right-click a component to remove it",
  invalidConnection: "That connection would make the architecture cry.",
  duplicateConnection: "Those components are already connected.",
  paletteFull: "Component limit reached for this floor.",
} as const;



================================================
FILE: src/data/office.ts
================================================
export interface OfficePropPlacement {
  x: number;
  y: number;
  texture:
    | "desk"
    | "computer"
    | "bookshelf"
    | "plant"
    | "large-plant"
    | "sofa"
    | "chair-front"
    | "chair-back"
    | "coffee-table"
    | "whiteboard"
    | "bin"
    | "double-bookshelf"
    | "small-table"
    | "cushioned-chair-front"
    | "cushioned-chair-back"
    | "clock"
    | "coffee"
    | "cactus"
    | "large-painting"
    | "small-painting"
    | "meeting-table"
    | "cushioned-bench";
  scale?: number;
  collider?: boolean;
  depthOffset?: number;
}

export type OfficeCharacterTexture =
  | "player"
  | "specialist"
  | "ambient-1"
  | "ambient-3"
  | "ambient-4"
  | "ambient-5";

export const OFFICE_CHARACTER_TEXTURES: OfficeCharacterTexture[] = [
  "player",
  "specialist",
  "ambient-1",
  "ambient-3",
  "ambient-4",
  "ambient-5",
];

export type AmbientNpcBehavior =
  | { kind: "desk" }
  | {
      kind: "route";
      toX: number;
      toY: number;
      durationMs: number;
      pauseMs: number;
    };

export interface AmbientNpcPlacement {
  id: string;
  x: number;
  y: number;
  texture: OfficeCharacterTexture;
  behavior: AmbientNpcBehavior;
  flipX?: boolean;
}

export const OFFICE_PROPS: OfficePropPlacement[] = [
  { x: 245, y: 170, texture: "desk", scale: 3.2 },
  { x: 245, y: 149, texture: "computer", scale: 2.7, collider: false },
  {
    x: 245,
    y: 246,
    texture: "chair-back",
    scale: 2.6,
    depthOffset: -38,
  },
  { x: 405, y: 170, texture: "desk", scale: 3.2 },
  { x: 405, y: 149, texture: "computer", scale: 2.7, collider: false },
  {
    x: 405,
    y: 246,
    texture: "chair-back",
    scale: 2.6,
    depthOffset: -38,
  },
  { x: 565, y: 170, texture: "desk", scale: 3.2 },
  { x: 565, y: 149, texture: "computer", scale: 2.7, collider: false },
  {
    x: 565,
    y: 246,
    texture: "chair-back",
    scale: 2.6,
    depthOffset: -38,
  },
  { x: 725, y: 170, texture: "desk", scale: 3.2 },
  { x: 725, y: 149, texture: "computer", scale: 2.7, collider: false },
  {
    x: 725,
    y: 246,
    texture: "chair-back",
    scale: 2.6,
    depthOffset: -38,
  },
  { x: 862, y: 125, texture: "whiteboard", scale: 3, collider: false },
  { x: 955, y: 112, texture: "large-painting", scale: 3, collider: false },
  { x: 1015, y: 112, texture: "small-painting", scale: 3, collider: false },
  { x: 780, y: 112, texture: "clock", scale: 2.8, collider: false },
  { x: 828, y: 190, texture: "bin", scale: 2.6 },
  { x: 1000, y: 238, texture: "small-table", scale: 3 },
  { x: 980, y: 207, texture: "coffee", scale: 2.8, collider: false },
  { x: 1035, y: 210, texture: "cactus", scale: 2.6 },
  { x: 1000, y: 178, texture: "cushioned-chair-back", scale: 3 },
  { x: 1000, y: 302, texture: "cushioned-chair-front", scale: 3 },
  { x: 455, y: 430, texture: "meeting-table", scale: 3 },
  { x: 585, y: 430, texture: "meeting-table", scale: 3 },
  { x: 455, y: 330, texture: "cushioned-chair-back", scale: 3 },
  { x: 585, y: 330, texture: "cushioned-chair-back", scale: 3 },
  { x: 455, y: 530, texture: "cushioned-chair-front", scale: 3 },
  { x: 585, y: 530, texture: "cushioned-chair-front", scale: 3 },
  { x: 88, y: 475, texture: "double-bookshelf", scale: 3.2 },
  { x: 88, y: 522, texture: "double-bookshelf", scale: 3.2 },
  { x: 88, y: 570, texture: "bookshelf", scale: 3 },
  { x: 758, y: 570, texture: "sofa", scale: 3 },
  { x: 886, y: 570, texture: "sofa", scale: 3 },
  { x: 822, y: 495, texture: "coffee-table", scale: 2.8 },
  { x: 742, y: 484, texture: "chair-back", scale: 2.6 },
  { x: 902, y: 484, texture: "chair-back", scale: 2.6 },
  { x: 1018, y: 550, texture: "bookshelf", scale: 3.2 },
  { x: 104, y: 132, texture: "large-plant", scale: 2.8 },
  { x: 1090, y: 135, texture: "plant", scale: 3 },
  { x: 1085, y: 565, texture: "bin", scale: 2.6 },
];

export const AMBIENT_NPCS_BY_FLOOR: Record<number, AmbientNpcPlacement[]> = {
  0: [
    {
      id: "accounting-ava",
      x: 245,
      y: 226,
      texture: "ambient-1",
      behavior: { kind: "desk" },
    },
    {
      id: "support-milo",
      x: 405,
      y: 226,
      texture: "ambient-3",
      behavior: { kind: "desk" },
    },
    {
      id: "product-sam",
      x: 565,
      y: 226,
      texture: "ambient-4",
      behavior: { kind: "desk" },
    },
    {
      id: "legal-noor",
      x: 725,
      y: 226,
      texture: "ambient-5",
      behavior: {
        kind: "route",
        toX: 665,
        toY: 430,
        durationMs: 2800,
        pauseMs: 1800,
      },
    },
    {
      id: "facilities-finn",
      x: 1000,
      y: 300,
      texture: "specialist",
      behavior: {
        kind: "route",
        toX: 1080,
        toY: 520,
        durationMs: 2400,
        pauseMs: 2200,
      },
      flipX: true,
    },
  ],
  1: [
    {
      id: "accounting-ava",
      x: 245,
      y: 226,
      texture: "ambient-1",
      behavior: { kind: "desk" },
    },
    {
      id: "support-milo",
      x: 405,
      y: 226,
      texture: "ambient-3",
      behavior: { kind: "desk" },
    },
    {
      id: "product-sam",
      x: 565,
      y: 226,
      texture: "ambient-4",
      behavior: { kind: "desk" },
    },
    {
      id: "support-jules",
      x: 725,
      y: 226,
      texture: "ambient-5",
      behavior: {
        kind: "route",
        toX: 665,
        toY: 430,
        durationMs: 2300,
        pauseMs: 1600,
      },
    },
    {
      id: "facilities-finn",
      x: 1000,
      y: 300,
      texture: "player",
      behavior: {
        kind: "route",
        toX: 1080,
        toY: 520,
        durationMs: 2600,
        pauseMs: 2000,
      },
      flipX: true,
    },
    {
      id: "design-drew",
      x: 650,
      y: 530,
      texture: "ambient-3",
      behavior: {
        kind: "route",
        toX: 700,
        toY: 485,
        durationMs: 2100,
        pauseMs: 2400,
      },
    },
  ],
  2: [
    {
      id: "database-dev",
      x: 405,
      y: 226,
      texture: "ambient-4",
      behavior: { kind: "desk" },
    },
    {
      id: "cache-casey",
      x: 1000,
      y: 300,
      texture: "ambient-1",
      behavior: {
        kind: "route",
        toX: 1080,
        toY: 520,
        durationMs: 2800,
        pauseMs: 1900,
      },
    },
  ],
};



================================================
FILE: src/data/solutions.ts
================================================
import type { Evaluation, SolutionId } from "../sim/types";

export const SOLUTIONS: Record<SolutionId, Evaluation> = {
  canonical: {
    id: "canonical",
    quality: "canonical",
    title: "Actually Stable",
    message:
      "Three servers give you enough capacity for growth and one spare when hardware gives up.",
    debtNotes: [],
  },
  "over-provisioned": {
    id: "over-provisioned",
    quality: "partial",
    title: "Stable, but Expensive",
    message:
      "It works, but you are paying for servers that are napping. Three handles this load with N+1 redundancy.",
    debtNotes: ["Excess idle server capacity increases operating cost."],
  },
  "under-redundant": {
    id: "under-redundant",
    quality: "partial",
    title: "Works Until Tuesday",
    message:
      "Two servers handle the spike, but lose one and the survivor cannot carry 75 RPS. No spare capacity means no safety net.",
    debtNotes: ["No N+1 capacity; a server failure causes an outage."],
  },
  "single-server-lb": {
    id: "single-server-lb",
    quality: "failed",
    title: "Fancy Middleman",
    message:
      "A load balancer with one server adds no capacity or redundancy. The same lonely server still melts.",
    debtNotes: [],
  },
  "single-server-direct": {
    id: "single-server-direct",
    quality: "failed",
    title: "One Very Sad Computer",
    message:
      "One machine gets every request. More users or one hardware failure takes down the whole site.",
    debtNotes: [],
  },
  "unbalanced-direct": {
    id: "unbalanced-direct",
    quality: "failed",
    title: "Servers Without Directions",
    message:
      "You bought more servers, but traffic still enters the first one. Add a load balancer to split requests.",
    debtNotes: [],
  },
  invalid: {
    id: "invalid",
    quality: "failed",
    title: "Architecture Not Found",
    message:
      "Connect the client to a load balancer or server, then connect the load balancer to servers.",
    debtNotes: [],
  },
};



================================================
FILE: src/dev/floorHarness.ts
================================================
import { getFloors } from "../core/runtime/floorRegistry";
import type { FloorPreviewState } from "../core/contracts";
import type { SimulationState } from "../sim/types";

export interface FloorHarnessOptions {
  floorOrder: number;
  healthState: FloorPreviewState;
  enabled: boolean;
}

export const getFloorHarnessOptions = (
  search = window.location.search,
): FloorHarnessOptions => {
  const parameters = new URLSearchParams(search);
  const requestedFloor = parameters.get("floor");
  const requestedState = parameters.get("state");
  const floors = getFloors();
  const floorOrder =
    floors.find(
      (floor) =>
        floor.module.id === requestedFloor ||
        String(floor.order) === requestedFloor,
    )?.order ?? floors[0].order;
  const healthState: FloorPreviewState = [
    "calm",
    "strained",
    "down",
    "fixed",
  ].includes(requestedState ?? "")
    ? (requestedState as FloorPreviewState)
    : "calm";
  return {
    floorOrder,
    healthState,
    enabled: requestedFloor !== null,
  };
};

const mockState = (
  state: FloorPreviewState,
): Pick<
  SimulationState,
  | "incomingRps"
  | "droppedRequests"
  | "errorRate"
  | "greenSeconds"
  | "outcome"
  | "servers"
> => {
  switch (state) {
    case "strained":
      return {
        incomingRps: 180,
        droppedRequests: 70,
        errorRate: 0.39,
        greenSeconds: 0,
        outcome: "running",
        servers: [
          {
            id: "preview-server",
            health: "strained",
            loadRps: 180,
            overloadSeconds: 4,
            injectedFailure: false,
          },
        ],
      };
    case "down":
      return {
        incomingRps: 180,
        droppedRequests: 180,
        errorRate: 1,
        greenSeconds: 0,
        outcome: "failed",
        servers: [
          {
            id: "preview-server",
            health: "crashed",
            loadRps: 0,
            overloadSeconds: 8,
            injectedFailure: true,
          },
        ],
      };
    case "fixed":
      return {
        incomingRps: 100,
        droppedRequests: 0,
        errorRate: 0,
        greenSeconds: 30,
        outcome: "canonical",
        servers: [
          {
            id: "preview-server",
            health: "healthy",
            loadRps: 50,
            overloadSeconds: 0,
            injectedFailure: false,
          },
        ],
      };
    default:
      return {
        incomingRps: 100,
        droppedRequests: 0,
        errorRate: 0,
        greenSeconds: 8,
        outcome: "running",
        servers: [
          {
            id: "preview-server",
            health: "healthy",
            loadRps: 40,
            overloadSeconds: 0,
            injectedFailure: false,
          },
        ],
      };
  }
};

export const getFloorHarnessSimulation = (
  state: FloorPreviewState,
): SimulationState => {
  const values = mockState(state);
  return {
    elapsedSeconds: 10,
    phaseId: `preview-${state}`,
    phaseProgress: 0.5,
    totalRequests: values.incomingRps * 10,
    injectedFailureOccurred: state === "down",
    ...values,
  };
};

export const mountFloorHarnessControls = (
  options: FloorHarnessOptions,
): void => {
  if (!options.enabled || document.getElementById("floor-harness")) return;

  const controls = document.createElement("aside");
  controls.id = "floor-harness";
  controls.setAttribute("aria-label", "Floor preview controls");
  Object.assign(controls.style, {
    position: "fixed",
    zIndex: "1000",
    left: "12px",
    bottom: "12px",
    display: "flex",
    gap: "8px",
    padding: "8px",
    borderRadius: "8px",
    background: "rgba(31, 41, 51, 0.92)",
    color: "#ffffff",
    font: "600 13px system-ui, sans-serif",
  });

  const addSelect = (
    label: string,
    values: { value: string; label: string }[],
    selected: string,
    parameter: string,
  ): void => {
    const wrapper = document.createElement("label");
    wrapper.textContent = `${label} `;
    const select = document.createElement("select");
    select.setAttribute("aria-label", label);
    for (const value of values) {
      const option = document.createElement("option");
      option.value = value.value;
      option.textContent = value.label;
      option.selected = value.value === selected;
      select.append(option);
    }
    select.addEventListener("change", () => {
      const url = new URL(window.location.href);
      url.searchParams.set(parameter, select.value);
      window.location.assign(url);
    });
    wrapper.append(select);
    controls.append(wrapper);
  };

  const floors = getFloors();
  addSelect(
    "Floor",
    floors.map(({ order, module }) => ({
      value: module.id,
      label: `${order}: ${module.category}`,
    })),
    floors.find(({ order }) => order === options.floorOrder)?.module.id ??
      floors[0].module.id,
    "floor",
  );
  addSelect(
    "State",
    ["calm", "strained", "down", "fixed"].map((state) => ({
      value: state,
      label: state[0].toUpperCase() + state.slice(1),
    })),
    options.healthState,
    "state",
  );
  document.body.append(controls);
};



================================================
FILE: src/entities/Interactable.ts
================================================
export interface Interactable {
  id: string;
  label: string;
  x: number;
  y: number;
  range?: number;
  onInteract: () => void;
}



================================================
FILE: src/entities/Npc.ts
================================================
import Phaser from "phaser";

interface NpcOptions {
  texture?: string;
  frame?: number;
  flipX?: boolean;
  animationKey?: string | null;
  staticBody?: boolean;
}

export class Npc extends Phaser.Physics.Arcade.Sprite {
  private readonly characterTexture: string;
  private previousPosition: Phaser.Math.Vector2;
  private facing: "down" | "up" | "right" = "down";

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    public readonly npcId: string,
    options: NpcOptions = {},
  ) {
    super(scene, x, y, options.texture ?? "specialist", options.frame ?? 0);
    this.characterTexture = options.texture ?? "specialist";
    this.previousPosition = new Phaser.Math.Vector2(x, y);
    scene.add.existing(this);
    const staticBody = options.staticBody ?? true;
    scene.physics.add.existing(this, staticBody);
    this.setScale(2.8);
    this.setDepth(y);
    this.setFlipX(options.flipX ?? false);
    if (!staticBody) {
      const body = this.body as Phaser.Physics.Arcade.Body;
      body.setImmovable(true);
      body.setSize(11, 14).setOffset(2, 16);
      this.setCollideWorldBounds(true);
    }
    if (options.animationKey !== null) {
      this.play(options.animationKey ?? "specialist-idle");
    }
  }

  updateMovementAnimation(): void {
    const deltaX = this.x - this.previousPosition.x;
    const deltaY = this.y - this.previousPosition.y;
    this.previousPosition.set(this.x, this.y);
    this.setDepth(this.y);

    if (Math.abs(deltaX) < 0.05 && Math.abs(deltaY) < 0.05) {
      this.anims.stop();
      this.setFrame(
        this.facing === "up" ? 7 : this.facing === "right" ? 14 : 0,
      );
      return;
    }

    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      this.facing = "right";
      this.setFlipX(deltaX < 0);
    } else {
      this.facing = deltaY < 0 ? "up" : "down";
      this.setFlipX(false);
    }
    this.play(`office-${this.characterTexture}-walk-${this.facing}`, true);
  }
}



================================================
FILE: src/entities/Player.ts
================================================
import Phaser from "phaser";

const SPEED = 235;

export class Player extends Phaser.Physics.Arcade.Sprite {
  private readonly cursors: Phaser.Types.Input.Keyboard.CursorKeys;
  private readonly wasd: Record<
    "up" | "down" | "left" | "right",
    Phaser.Input.Keyboard.Key
  >;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, "player", 0);
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.setScale(2.8);
    this.setCollideWorldBounds(true);
    this.setDepth(y);
    this.body?.setSize(11, 13).setOffset(2, 17);

    this.cursors = scene.input.keyboard!.createCursorKeys();
    this.wasd = scene.input.keyboard!.addKeys({
      up: Phaser.Input.Keyboard.KeyCodes.W,
      down: Phaser.Input.Keyboard.KeyCodes.S,
      left: Phaser.Input.Keyboard.KeyCodes.A,
      right: Phaser.Input.Keyboard.KeyCodes.D,
    }) as typeof this.wasd;
  }

  update(): void {
    const horizontal =
      Number(this.cursors.right.isDown || this.wasd.right.isDown) -
      Number(this.cursors.left.isDown || this.wasd.left.isDown);
    const vertical =
      Number(this.cursors.down.isDown || this.wasd.down.isDown) -
      Number(this.cursors.up.isDown || this.wasd.up.isDown);
    const direction = new Phaser.Math.Vector2(horizontal, vertical).normalize();

    this.setVelocity(direction.x * SPEED, direction.y * SPEED);
    this.setDepth(this.y);
    this.updateAnimation(horizontal, vertical);
  }

  private updateAnimation(horizontal: number, vertical: number): void {
    if (horizontal === 0 && vertical === 0) {
      this.anims.stop();
      this.setFrame(vertical < 0 ? 7 : 0);
      return;
    }

    if (Math.abs(horizontal) > Math.abs(vertical)) {
      this.setFlipX(horizontal < 0);
      this.play("player-right", true);
    } else {
      this.setFlipX(false);
      this.play(vertical < 0 ? "player-up" : "player-down", true);
    }
  }
}



================================================
FILE: src/floors/_template/README.md
================================================
# Floor Template

1. Copy this folder to `floor-0N-name`.
2. Replace `f99` with the matching `f0N` namespace everywhere.
3. Work only inside the copied folder.
4. Open `/?floor=f0N` to launch the floor directly.
5. Run `npm run validate:floors` before pushing.

Floor branches use the form `floor/0N-name`. Do not install dependencies or
edit shared files from a floor branch.



================================================
FILE: src/floors/_template/index.ts
================================================
import { FLOOR_CONTRACT_VERSION, type FloorModule } from "../../core/contracts";
import { assets } from "./assets/manifest";
import { content } from "./definition/content";
import { incident } from "./definition/incident";
import { theme } from "./theme";
import { createBuildUI } from "./view/buildUI";
import { createEffects } from "./view/effects";
import { createLayout } from "./view/layout";

// Replace f99 and the metadata immediately after copying this folder.
const floor: FloorModule = {
  contractVersion: FLOOR_CONTRACT_VERSION,
  id: "f99",
  title: "Floor 99: Replace Me",
  category: "Replace Me",
  definition: { content, incident },
  view: { createLayout, createBuildUI, createEffects },
  assets,
  theme,
};

export default floor;



================================================
FILE: src/floors/_template/theme.ts
================================================
import type { FloorTheme } from "../../core/contracts";

export const theme: FloorTheme = {};



================================================
FILE: src/floors/_template/assets/manifest.ts
================================================
import type { AssetManifest } from "../../../core/contracts";

export const assets: AssetManifest = {
  images: [],
  spritesheets: [],
  audio: [],
};



================================================
FILE: src/floors/_template/definition/content.ts
================================================
import type { FloorContent } from "../../../core/contracts";

export const content: FloorContent = {
  specialistHints: [],
  glossary: [],
  tutorial: {},
};



================================================
FILE: src/floors/_template/definition/incident.ts
================================================
import type { FloorIncidentDefinition } from "../../../core/contracts";

export const incident: FloorIncidentDefinition = {
  title: null,
  availableComponents: [],
};



================================================
FILE: src/floors/_template/view/buildUI.ts
================================================
import type { BuildUIHandle, FloorContext } from "../../../core/contracts";

export const createBuildUI = (_ctx: FloorContext): BuildUIHandle => ({});



================================================
FILE: src/floors/_template/view/effects.ts
================================================
import type { EffectsHandle, FloorContext } from "../../../core/contracts";

export const createEffects = (_ctx: FloorContext): EffectsHandle => ({});



================================================
FILE: src/floors/_template/view/layout.ts
================================================
import type { FloorContext, LayoutHandle } from "../../../core/contracts";
import { createDefaultOfficeLayout } from "../../../core/ui-kit";

export const createLayout = (ctx: FloorContext): LayoutHandle => {
  createDefaultOfficeLayout(ctx);
  return {};
};



================================================
FILE: src/floors/floor-00-tutorial/README.md
================================================
# Floor 00: Tutorial

Owner scope: everything in this folder.

Uses the shared Pixel Agents office pack documented in the repository credits.
No floor-specific assets or borrowed code are currently included.



================================================
FILE: src/floors/floor-00-tutorial/index.ts
================================================
import { FLOOR_CONTRACT_VERSION, type FloorModule } from "../../core/contracts";
import { assets } from "./assets/manifest";
import { content } from "./definition/content";
import { incident } from "./definition/incident";
import { theme } from "./theme";
import { createBuildUI } from "./view/buildUI";
import { createEffects } from "./view/effects";
import { createLayout } from "./view/layout";

const floor: FloorModule = {
  contractVersion: FLOOR_CONTRACT_VERSION,
  id: "f00",
  title: "Ground Floor: Incident Response",
  category: "Tutorial / Incident Response",
  definition: { content, incident },
  view: { createLayout, createBuildUI, createEffects },
  assets,
  theme,
};

export default floor;



================================================
FILE: src/floors/floor-00-tutorial/theme.ts
================================================
import type { FloorTheme } from "../../core/contracts";

export const theme: FloorTheme = {};



================================================
FILE: src/floors/floor-00-tutorial/assets/manifest.ts
================================================
import type { AssetManifest } from "../../../core/contracts";

export const assets: AssetManifest = {
  images: [],
  spritesheets: [],
  audio: [],
};



================================================
FILE: src/floors/floor-00-tutorial/definition/content.ts
================================================
import type { FloorContent } from "../../../core/contracts";

export const content: FloorContent = {
  managerAlert: {
    id: "f00_manager_alert",
    speaker: "manager",
    speakerName: "Director Synergy",
    text: "THE WEBSITE IS DOWN. Everyone is tweeting. Why are you still standing there? You are in charge now. Floor 1. Move!",
  },
  specialistHints: [],
  glossary: [],
  tutorial: {
    move: "WASD or arrow keys to run",
    interact: "Press E near people and equipment",
    elevator: "Get to the elevator and reach Floor 1",
  },
};



================================================
FILE: src/floors/floor-00-tutorial/definition/incident.ts
================================================
import type { FloorIncidentDefinition } from "../../../core/contracts";

export const incident: FloorIncidentDefinition = {
  title: "Production outage intake",
  availableComponents: [],
};



================================================
FILE: src/floors/floor-00-tutorial/view/buildUI.ts
================================================
import type { BuildUIHandle, FloorContext } from "../../../core/contracts";

export const createBuildUI = (_ctx: FloorContext): BuildUIHandle => ({});



================================================
FILE: src/floors/floor-00-tutorial/view/effects.ts
================================================
import type { EffectsHandle, FloorContext } from "../../../core/contracts";

export const createEffects = (_ctx: FloorContext): EffectsHandle => ({});



================================================
FILE: src/floors/floor-00-tutorial/view/layout.ts
================================================
import type { FloorContext, LayoutHandle } from "../../../core/contracts";
import { createDefaultOfficeLayout } from "../../../core/ui-kit";

export const createLayout = (ctx: FloorContext): LayoutHandle => {
  createDefaultOfficeLayout(ctx);
  return {};
};



================================================
FILE: src/floors/floor-01-scalability/README.md
================================================
# Floor 01: Scalability

Owner scope: everything in this folder.

Canonical design: Client → Load Balancer → 3 Servers.

Uses the shared Pixel Agents office pack documented in the repository credits.
No floor-specific assets or borrowed code are currently included.



================================================
FILE: src/floors/floor-01-scalability/index.ts
================================================
import { FLOOR_CONTRACT_VERSION, type FloorModule } from "../../core/contracts";
import { assets } from "./assets/manifest";
import { content } from "./definition/content";
import { incident } from "./definition/incident";
import { theme } from "./theme";
import { createBuildUI } from "./view/buildUI";
import { createEffects } from "./view/effects";
import { createLayout } from "./view/layout";

const floor: FloorModule = {
  contractVersion: FLOOR_CONTRACT_VERSION,
  id: "f01",
  title: "Floor 1: Traffic Operations",
  category: "Scalability / Load Distribution",
  definition: { content, incident },
  view: { createLayout, createBuildUI, createEffects },
  assets,
  theme,
};

export default floor;



================================================
FILE: src/floors/floor-01-scalability/theme.ts
================================================
import type { FloorTheme } from "../../core/contracts";

export const theme: FloorTheme = {};



================================================
FILE: src/floors/floor-01-scalability/assets/manifest.ts
================================================
import type { AssetManifest } from "../../../core/contracts";

export const assets: AssetManifest = {
  images: [],
  spritesheets: [],
  audio: [],
};



================================================
FILE: src/floors/floor-01-scalability/definition/content.ts
================================================
import type { FloorContent } from "../../../core/contracts";

export const content: FloorContent = {
  specialistHints: [
    {
      id: "f01_specialist_hint_1",
      speaker: "specialist",
      speakerName: "Rhea Boot, SRE",
      text: "Everybody and their cat caused a traffic spike, and one server is doing all the work. It only has so much capacity.",
      glossaryIds: ["f01.traffic_spike", "f01.server", "f01.capacity"],
    },
    {
      id: "f01_specialist_hint_2",
      speaker: "specialist",
      speakerName: "Rhea Boot, SRE",
      text: "Spread the requests per second across several servers. Put a load balancer in front and let it use round robin.",
      glossaryIds: [
        "f01.rps",
        "f01.server",
        "f01.load_balancer",
        "f01.round_robin",
      ],
    },
    {
      id: "f01_specialist_hint_3",
      speaker: "specialist",
      speakerName: "Rhea Boot, SRE",
      text: "Use horizontal scaling: load balancer, then enough servers to keep redundancy when one fails. Capacity plus a spare. N+1, intern!",
      glossaryIds: [
        "f01.horizontal_scaling",
        "f01.load_balancer",
        "f01.server",
        "f01.redundancy",
        "f01.capacity",
      ],
    },
  ],
  glossary: [
    {
      id: "f01.traffic_spike",
      term: "traffic spike",
      definition: "A sudden surge in the number of users hitting your system.",
    },
    {
      id: "f01.rps",
      term: "requests per second",
      definition: "How many user requests arrive every second.",
    },
    {
      id: "f01.capacity",
      term: "capacity",
      definition: "How much traffic a machine can handle before it struggles.",
    },
    {
      id: "f01.server",
      term: "server",
      definition: "A computer that answers user requests.",
    },
    {
      id: "f01.load_balancer",
      term: "load balancer",
      definition:
        "A traffic cop that splits incoming requests across multiple servers.",
    },
    {
      id: "f01.round_robin",
      term: "round robin",
      definition: "Handing out requests to servers one by one, in turn.",
    },
    {
      id: "f01.horizontal_scaling",
      term: "horizontal scaling",
      definition:
        "Handling more load by adding machines instead of buying one bigger machine.",
    },
    {
      id: "f01.spof",
      term: "single point of failure",
      definition: "One component whose failure can take the whole system down.",
    },
    {
      id: "f01.redundancy",
      term: "redundancy",
      definition:
        "Keeping spare capacity so one failure does not break everything.",
    },
  ],
  tutorial: {
    build: "Talk to Rhea, then use the BUILD console",
  },
};



================================================
FILE: src/floors/floor-01-scalability/definition/incident.ts
================================================
import type { FloorIncidentDefinition } from "../../../core/contracts";

export const incident: FloorIncidentDefinition = {
  title: "A traffic spike is cooking the company's only server.",
  availableComponents: [
    { type: "loadBalancer", max: 1 },
    { type: "server", max: 5 },
  ],
  canonicalServerCount: 3,
};



================================================
FILE: src/floors/floor-01-scalability/view/buildUI.ts
================================================
import type { BuildUIHandle, FloorContext } from "../../../core/contracts";
import { colorHex } from "../../../core/ui-kit";

export const createBuildUI = (ctx: FloorContext): BuildUIHandle => {
  ctx.scene.add
    .rectangle(220, 440, 190, 112, ctx.theme.colors.panelDark)
    .setStrokeStyle(4, ctx.theme.colors.warning)
    .setDepth(440);
  ctx.scene.add
    .text(220, 440, "BUILD\nCONSOLE", {
      align: "center",
      color: colorHex(ctx.theme.colors.white),
      fontFamily: ctx.theme.fonts.mono,
      fontSize: "20px",
      fontStyle: "bold",
    })
    .setOrigin(0.5)
    .setDepth(441);
  ctx.addInteractable({
    id: "f01:build_console",
    label: "Open build console",
    x: 220,
    y: 440,
    range: 110,
    onInteract: () => ctx.openBuild(),
  });
  return {};
};



================================================
FILE: src/floors/floor-01-scalability/view/effects.ts
================================================
import type { EffectsHandle, FloorContext } from "../../../core/contracts";

export const createEffects = (_ctx: FloorContext): EffectsHandle => ({});



================================================
FILE: src/floors/floor-01-scalability/view/layout.ts
================================================
import type { FloorContext, LayoutHandle } from "../../../core/contracts";
import { colorHex, createDefaultOfficeLayout } from "../../../core/ui-kit";

export const createLayout = (ctx: FloorContext): LayoutHandle => {
  createDefaultOfficeLayout(ctx);
  const specialist = ctx.addNpc(820, 340, "f01-rhea", {
    texture: "specialist",
  });
  ctx.scene.physics.add.collider(ctx.player, specialist);
  ctx.scene.add
    .text(770, 382, "Rhea Boot // SRE", {
      color: colorHex(ctx.theme.colors.ink),
      fontFamily: ctx.theme.fonts.family,
      fontSize: "15px",
      backgroundColor: colorHex(ctx.theme.colors.panel),
      padding: { x: 7, y: 4 },
    })
    .setDepth(600);
  ctx.addInteractable({
    id: "f01:specialist",
    label: "Talk to Rhea",
    x: specialist.x,
    y: specialist.y,
    onInteract: () => ctx.dialogue.showSpecialist(),
  });
  return {};
};



================================================
FILE: src/floors/floor-02-storage/README.md
================================================
# Floor 02: Data Storage

Owner scope: everything in this folder.

This floor currently provides an enterable placeholder through the same contract
used by playable floors.

Uses the shared Pixel Agents office pack documented in the repository credits.
No floor-specific assets or borrowed code are currently included.



================================================
FILE: src/floors/floor-02-storage/index.ts
================================================
import { FLOOR_CONTRACT_VERSION, type FloorModule } from "../../core/contracts";
import { assets } from "./assets/manifest";
import { content } from "./definition/content";
import { incident } from "./definition/incident";
import { theme } from "./theme";
import { createBuildUI } from "./view/buildUI";
import { createEffects } from "./view/effects";
import { createLayout } from "./view/layout";

const floor: FloorModule = {
  contractVersion: FLOOR_CONTRACT_VERSION,
  id: "f02",
  title: "Floor 2: Data Storage — Coming Soon",
  category: "Data Storage / Caching",
  definition: { content, incident },
  view: { createLayout, createBuildUI, createEffects },
  assets,
  theme,
};

export default floor;



================================================
FILE: src/floors/floor-02-storage/theme.ts
================================================
import type { FloorTheme } from "../../core/contracts";

export const theme: FloorTheme = {};



================================================
FILE: src/floors/floor-02-storage/assets/manifest.ts
================================================
import type { AssetManifest } from "../../../core/contracts";

export const assets: AssetManifest = {
  images: [],
  spritesheets: [],
  audio: [],
};



================================================
FILE: src/floors/floor-02-storage/definition/content.ts
================================================
import type { FloorContent } from "../../../core/contracts";

export const content: FloorContent = {
  specialistHints: [],
  glossary: [],
  tutorial: {},
};



================================================
FILE: src/floors/floor-02-storage/definition/incident.ts
================================================
import type { FloorIncidentDefinition } from "../../../core/contracts";

export const incident: FloorIncidentDefinition = {
  title: null,
  availableComponents: [],
};



================================================
FILE: src/floors/floor-02-storage/view/buildUI.ts
================================================
import type { BuildUIHandle, FloorContext } from "../../../core/contracts";

export const createBuildUI = (_ctx: FloorContext): BuildUIHandle => ({});



================================================
FILE: src/floors/floor-02-storage/view/effects.ts
================================================
import type { EffectsHandle, FloorContext } from "../../../core/contracts";

export const createEffects = (_ctx: FloorContext): EffectsHandle => ({});



================================================
FILE: src/floors/floor-02-storage/view/layout.ts
================================================
import type { FloorContext, LayoutHandle } from "../../../core/contracts";
import { colorHex, createDefaultOfficeLayout } from "../../../core/ui-kit";

export const createLayout = (ctx: FloorContext): LayoutHandle => {
  createDefaultOfficeLayout(ctx);
  ctx.scene.add
    .text(
      670,
      360,
      "Data Storage / Caching\n\nCOMING SOON\nThe database team is allegedly in a meeting.",
      {
        align: "center",
        color: colorHex(ctx.theme.colors.ink),
        fontFamily: ctx.theme.fonts.family,
        fontSize: "28px",
        fontStyle: "bold",
      },
    )
    .setOrigin(0.5)
    .setDepth(620);
  return {};
};



================================================
FILE: src/scenes/BootScene.ts
================================================
import Phaser from "phaser";

export class BootScene extends Phaser.Scene {
  constructor() {
    super("BootScene");
  }

  create(): void {
    this.scene.start("PreloadScene");
  }
}



================================================
FILE: src/scenes/BuildScene.ts
================================================
import Phaser from "phaser";

import { GAME_HEIGHT, GAME_WIDTH } from "../config/dimensions";
import { THEME, colorHex } from "../config/theme";
import { getFloorByOrder } from "../core/runtime/floorRegistry";
import { BUILD_COPY } from "../data/build";
import { evaluateDesign } from "../sim/evaluator";
import { createSimulation, tickSimulation } from "../sim/simulation";
import type {
  ComponentType,
  DesignConnection,
  Evaluation,
  SimulationState,
  SystemDesign,
} from "../sim/types";
import { buildDesignStore } from "../state/buildDesign";
import { preferences } from "../state/preferences";
import { progression } from "../state/progression";
import { audio } from "../systems/AudioSystem";
import { gameEvents } from "../systems/EventBus";
import { BuildNode } from "../ui/BuildNode";
import { Palette } from "../ui/Palette";

type PlaceableType = Exclude<ComponentType, "client">;

const CANVAS_LEFT = 270;
const CANVAS_TOP = 116;
const CANVAS_RIGHT = GAME_WIDTH - 24;
const CANVAS_BOTTOM = GAME_HEIGHT - 74;
const SIMULATION_SPEED = 2.4;

export class BuildScene extends Phaser.Scene {
  private readonly nodes = new Map<string, BuildNode>();
  private connections: DesignConnection[] = [];
  private nextNodeId = 1;
  private wireGraphics!: Phaser.GameObjects.Graphics;
  private activeWireFrom?: string;
  private activePointer?: Phaser.Input.Pointer;
  private simulation?: SimulationState;
  private running = false;
  private statsText!: Phaser.GameObjects.Text;
  private phaseText!: Phaser.GameObjects.Text;
  private saveText!: Phaser.GameObjects.Text;
  private runButton!: Phaser.GameObjects.Container;
  private trafficDots: Phaser.GameObjects.Arc[] = [];
  private outcomePanel?: Phaser.GameObjects.Container;
  private crashCount = 0;
  private floorOrder = 1;

  constructor() {
    super("BuildScene");
  }

  init(data: { floorOrder?: number }): void {
    this.floorOrder = data.floorOrder ?? 1;
  }

  create(): void {
    this.input.mouse?.disableContextMenu();
    this.cameras.main.setBackgroundColor(THEME.colors.ink);
    this.createChrome();
    this.wireGraphics = this.add.graphics().setDepth(5);
    new Palette(this, 18, 108, (type, x, y) => this.addComponent(type, x, y));

    this.restoreDesign();
    this.drawConnections();

    this.input.on("pointermove", (pointer: Phaser.Input.Pointer) => {
      if (!this.activeWireFrom) return;
      this.activePointer = pointer;
      this.drawConnections();
    });
    this.input.on("pointerup", () => {
      this.time.delayedCall(0, () => {
        this.activeWireFrom = undefined;
        this.activePointer = undefined;
        this.drawConnections();
      });
    });

    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.input.removeAllListeners();
    });
  }

  update(_time: number, deltaMs: number): void {
    if (!this.running || !this.simulation) return;
    this.simulation = tickSimulation(
      this.simulation,
      this.toDesign(),
      (deltaMs / 1000) * SIMULATION_SPEED,
    );
    this.renderSimulation();
    if (this.simulation.outcome !== "running") {
      this.running = false;
      this.showOutcome(evaluateDesign(this.toDesign()));
    }
  }

  private createChrome(): void {
    this.add
      .rectangle(0, 0, GAME_WIDTH, GAME_HEIGHT, THEME.colors.ink)
      .setOrigin(0);
    this.add
      .rectangle(0, 0, GAME_WIDTH, 88, THEME.colors.panelDark)
      .setOrigin(0);
    this.add.text(24, 18, BUILD_COPY.title, {
      color: colorHex(THEME.colors.white),
      fontFamily: THEME.fonts.mono,
      fontSize: "25px",
      fontStyle: "bold",
    });
    this.add.text(24, 52, BUILD_COPY.subtitle, {
      color: colorHex(THEME.colors.successLight),
      fontFamily: THEME.fonts.family,
      fontSize: "15px",
    });
    this.add
      .text(GAME_WIDTH - 34, 22, "×", {
        color: colorHex(THEME.colors.white),
        fontFamily: THEME.fonts.family,
        fontSize: "34px",
      })
      .setOrigin(1, 0)
      .setInteractive({ useHandCursor: true })
      .on("pointerup", () => this.closeBuild());

    this.add
      .rectangle(
        CANVAS_LEFT,
        CANVAS_TOP,
        CANVAS_RIGHT - CANVAS_LEFT,
        CANVAS_BOTTOM - CANVAS_TOP,
        THEME.colors.paper,
      )
      .setOrigin(0)
      .setStrokeStyle(3, THEME.colors.officeWall);
    this.add
      .grid(
        CANVAS_LEFT,
        CANVAS_TOP,
        CANVAS_RIGHT - CANVAS_LEFT,
        CANVAS_BOTTOM - CANVAS_TOP,
        32,
        32,
        THEME.colors.paper,
        0,
        THEME.colors.officeWall,
        0.14,
      )
      .setOrigin(0);

    this.statsText = this.add.text(CANVAS_LEFT + 18, 94, "READY", {
      color: colorHex(THEME.colors.successLight),
      fontFamily: THEME.fonts.mono,
      fontSize: "14px",
    });
    this.phaseText = this.add
      .text(CANVAS_RIGHT - 18, 94, BUILD_COPY.remove, {
        color: colorHex(THEME.colors.white),
        fontFamily: THEME.fonts.family,
        fontSize: "13px",
      })
      .setOrigin(1, 0);
    this.saveText = this.add
      .text(CANVAS_LEFT + 78, 94, BUILD_COPY.saved, {
        color: colorHex(THEME.colors.muted),
        fontFamily: THEME.fonts.mono,
        fontSize: "12px",
      })
      .setAlpha(0.75);

    this.runButton = this.createButton(
      GAME_WIDTH - 222,
      GAME_HEIGHT - 45,
      396,
      48,
      BUILD_COPY.run,
      THEME.colors.success,
      () => this.runStressTest(),
    );
    this.createButton(
      390,
      GAME_HEIGHT - 45,
      210,
      48,
      BUILD_COPY.reset,
      THEME.colors.alertDark,
      () => this.resetDesign(),
    );
  }

  private addComponent(type: PlaceableType, x: number, y: number): void {
    if (this.running) return;
    const existing = [...this.nodes.values()].filter(
      (node) => node.componentType === type,
    ).length;
    const limit =
      getFloorByOrder(
        this.floorOrder,
      ).module.definition.incident.availableComponents.find(
        (component) => component.type === type,
      )?.max ?? 0;
    if (existing >= limit) {
      this.showConsoleMessage(BUILD_COPY.paletteFull);
      return;
    }
    let id: string;
    do {
      id = `${type}-${this.nextNodeId++}`;
    } while (this.nodes.has(id));
    const node = this.createNode(
      id,
      type,
      Phaser.Math.Clamp(x, CANVAS_LEFT + 90, CANVAS_RIGHT - 90),
      Phaser.Math.Clamp(y, CANVAS_TOP + 60, CANVAS_BOTTOM - 60),
    );
    this.bindNodeInteractions(node);
    this.bindInputPort(node);
    if (node.outputPort) this.bindOutputPort(node);
    this.persistDesign();
  }

  private createNode(
    id: string,
    type: ComponentType,
    x: number,
    y: number,
    fixed = false,
  ): BuildNode {
    const node = new BuildNode(this, id, type, x, y, fixed);
    this.nodes.set(id, node);
    return node;
  }

  private restoreDesign(): void {
    const saved = buildDesignStore.load();
    const design: SystemDesign = saved ?? {
      nodes: [{ id: "client", type: "client", x: 370, y: 350 }],
      connections: [],
    };

    for (const savedNode of design.nodes) {
      const fixed = savedNode.type === "client";
      const node = this.createNode(
        savedNode.id,
        savedNode.type,
        Phaser.Math.Clamp(savedNode.x, CANVAS_LEFT + 90, CANVAS_RIGHT - 90),
        Phaser.Math.Clamp(savedNode.y, CANVAS_TOP + 60, CANVAS_BOTTOM - 60),
        fixed,
      );
      if (!fixed) {
        this.bindNodeInteractions(node);
        this.bindInputPort(node);
      }
      if (node.outputPort) this.bindOutputPort(node);
    }

    this.connections = design.connections.filter(
      (connection) =>
        this.nodes.has(connection.from) && this.nodes.has(connection.to),
    );
  }

  private bindNodeInteractions(node: BuildNode): void {
    node.on(
      "drag",
      (_pointer: Phaser.Input.Pointer, dragX: number, dragY: number) => {
        if (this.running) return;
        node.setPosition(
          Phaser.Math.Clamp(dragX, CANVAS_LEFT + 90, CANVAS_RIGHT - 90),
          Phaser.Math.Clamp(dragY, CANVAS_TOP + 60, CANVAS_BOTTOM - 60),
        );
        this.drawConnections();
      },
    );
    node.on("pointerdown", (pointer: Phaser.Input.Pointer) => {
      if (pointer.rightButtonDown() && !this.running) {
        this.removeNode(node.nodeId);
      }
    });
    node.on("dragend", () => this.persistDesign());
  }

  private bindOutputPort(node: BuildNode): void {
    node.outputPort?.on(
      "pointerdown",
      (
        pointer: Phaser.Input.Pointer,
        _localX: number,
        _localY: number,
        event: Phaser.Types.Input.EventData,
      ) => {
        event.stopPropagation();
        if (this.running) return;
        this.activeWireFrom = node.nodeId;
        this.activePointer = pointer;
        this.drawConnections();
      },
    );
  }

  private bindInputPort(node: BuildNode): void {
    node.inputPort?.on(
      "pointerup",
      (
        _pointer: Phaser.Input.Pointer,
        _localX: number,
        _localY: number,
        event: Phaser.Types.Input.EventData,
      ) => {
        event.stopPropagation();
        if (!this.activeWireFrom || this.running) return;
        this.tryConnect(this.activeWireFrom, node.nodeId);
        this.activeWireFrom = undefined;
        this.activePointer = undefined;
        this.drawConnections();
      },
    );
  }

  private tryConnect(from: string, to: string): void {
    const fromNode = this.nodes.get(from);
    const toNode = this.nodes.get(to);
    if (!fromNode || !toNode || from === to) return;
    const valid =
      (fromNode.componentType === "client" &&
        (toNode.componentType === "loadBalancer" ||
          toNode.componentType === "server")) ||
      (fromNode.componentType === "loadBalancer" &&
        toNode.componentType === "server");
    if (!valid) {
      this.showConsoleMessage(BUILD_COPY.invalidConnection);
      return;
    }
    if (
      this.connections.some(
        (connection) => connection.from === from && connection.to === to,
      )
    ) {
      this.showConsoleMessage(BUILD_COPY.duplicateConnection);
      return;
    }
    this.connections.push({ from, to });
    this.persistDesign();
  }

  private removeNode(id: string): void {
    const node = this.nodes.get(id);
    if (!node || node.componentType === "client") return;
    this.connections = this.connections.filter(
      (connection) => connection.from !== id && connection.to !== id,
    );
    node.destroy();
    this.nodes.delete(id);
    this.drawConnections();
    this.persistDesign();
  }

  private drawConnections(): void {
    if (!this.wireGraphics) return;
    this.wireGraphics.clear();
    this.wireGraphics.lineStyle(5, THEME.colors.officeWall, 0.85);
    for (const connection of this.connections) {
      const from = this.nodes.get(connection.from);
      const to = this.nodes.get(connection.to);
      if (!from || !to) continue;
      this.drawWire(from.x + 76, from.y, to.x - 76, to.y);
    }
    if (this.activeWireFrom && this.activePointer) {
      const from = this.nodes.get(this.activeWireFrom);
      if (from) {
        this.wireGraphics.lineStyle(4, THEME.colors.warning, 0.9);
        this.drawWire(
          from.x + 76,
          from.y,
          this.activePointer.x,
          this.activePointer.y,
        );
      }
    }
  }

  private drawWire(
    startX: number,
    startY: number,
    endX: number,
    endY: number,
  ): void {
    const midpoint = (startX + endX) / 2;
    this.wireGraphics.beginPath();
    this.wireGraphics.moveTo(startX, startY);
    this.wireGraphics.lineTo(midpoint, startY);
    this.wireGraphics.lineTo(midpoint, endY);
    this.wireGraphics.lineTo(endX, endY);
    this.wireGraphics.strokePath();
  }

  private runStressTest(): void {
    if (this.running || this.outcomePanel) return;
    const design = this.toDesign();
    const evaluation = evaluateDesign(design);
    this.resetNodeStatuses();
    if (evaluation.id === "invalid") {
      this.showOutcome(evaluation);
      return;
    }

    this.simulation = createSimulation(design);
    this.running = true;
    this.crashCount = 0;
    this.runButton.setAlpha(0.45);
    this.phaseText.setText("STRESS SCHEDULE ACTIVE");
    this.createTrafficDots();
  }

  private renderSimulation(): void {
    if (!this.simulation) return;
    const state = this.simulation;
    this.statsText.setText(
      `${state.incomingRps.toFixed(0)} RPS  //  ERRORS ${(state.errorRate * 100).toFixed(1)}%`,
    );
    this.phaseText.setText(
      `${state.phaseId.toUpperCase()}  ${(state.phaseProgress * 100).toFixed(0)}%`,
    );
    state.servers.forEach((server) => {
      this.nodes.get(server.id)?.setServerStatus(server.health, server.loadRps);
    });
    const crashedServers = state.servers.filter(
      (server) => server.health === "crashed",
    );
    const currentCrashCount = crashedServers.length;
    if (currentCrashCount > this.crashCount) {
      const newestCrash = crashedServers[crashedServers.length - 1];
      if (newestCrash) this.playCrashEffect(newestCrash.id);
      this.crashCount = currentCrashCount;
    }
    this.nodes
      .get("client")
      ?.outputPort?.setFillStyle(
        state.errorRate > 0.01 ? THEME.colors.alert : THEME.colors.success,
      );

    this.trafficDots.forEach((dot, index) => {
      const connection = this.connections[index];
      if (!connection) return;
      const from = this.nodes.get(connection.from);
      const to = this.nodes.get(connection.to);
      if (!from || !to) return;
      const progress = (state.elapsedSeconds * 0.75 + index * 0.22) % 1;
      dot.setPosition(
        Phaser.Math.Linear(from.x + 76, to.x - 76, progress),
        Phaser.Math.Linear(from.y, to.y, progress),
      );
      dot.setFillStyle(
        state.errorRate > 0.01 ? THEME.colors.alert : THEME.colors.success,
      );
    });
  }

  private showOutcome(evaluation: Evaluation): void {
    this.destroyTrafficDots();
    this.runButton.setAlpha(1);
    if (evaluation.quality === "canonical") {
      audio.playSuccess();
      this.playCelebration();
    } else if (evaluation.quality === "failed") {
      audio.playCrash();
    }
    if (evaluation.quality !== "failed") {
      progression.completeFloor(
        this.floorOrder,
        evaluation.quality,
        evaluation.debtNotes,
      );
      gameEvents.emit("progression:updated", progression.snapshot);
    }

    const panel = this.add.container(GAME_WIDTH / 2, GAME_HEIGHT / 2);
    panel.setDepth(200);
    const scrim = this.add
      .rectangle(0, 0, GAME_WIDTH, GAME_HEIGHT, THEME.colors.ink, 0.65)
      .setInteractive();
    const accent =
      evaluation.quality === "canonical"
        ? THEME.colors.success
        : evaluation.quality === "partial"
          ? THEME.colors.warning
          : THEME.colors.alert;
    const card = this.add
      .rectangle(0, 0, 650, 320, THEME.colors.panel)
      .setStrokeStyle(6, accent);
    const quality = this.add
      .text(0, -112, evaluation.quality.toUpperCase(), {
        color: colorHex(accent),
        fontFamily: THEME.fonts.mono,
        fontSize: "17px",
        fontStyle: "bold",
      })
      .setOrigin(0.5);
    const title = this.add
      .text(0, -72, evaluation.title, {
        color: colorHex(THEME.colors.ink),
        fontFamily: THEME.fonts.family,
        fontSize: "31px",
        fontStyle: "bold",
      })
      .setOrigin(0.5);
    const message = this.add
      .text(0, 5, evaluation.message, {
        align: "center",
        color: colorHex(THEME.colors.ink),
        fontFamily: THEME.fonts.family,
        fontSize: "19px",
        lineSpacing: 5,
        wordWrap: { width: 560 },
      })
      .setOrigin(0.5);
    const button = this.createButton(
      0,
      112,
      310,
      52,
      evaluation.quality === "failed" ? BUILD_COPY.edit : BUILD_COPY.close,
      accent,
      () => {
        if (evaluation.quality === "failed") {
          panel.destroy();
          this.outcomePanel = undefined;
          this.phaseText.setText(BUILD_COPY.remove);
          this.statsText.setText("READY");
          this.resetNodeStatuses();
        } else {
          this.closeBuild();
        }
      },
    );
    panel.add([scrim, card, quality, title, message, button]);
    this.outcomePanel = panel;
  }

  private createButton(
    x: number,
    y: number,
    width: number,
    height: number,
    label: string,
    color: number,
    onClick: () => void,
  ): Phaser.GameObjects.Container {
    const button = this.add.container(x, y);
    const background = this.add
      .rectangle(0, 0, width, height, color)
      .setInteractive({ useHandCursor: true })
      .on("pointerup", onClick);
    const text = this.add
      .text(0, 0, label, {
        color: colorHex(THEME.colors.white),
        fontFamily: THEME.fonts.mono,
        fontSize: "16px",
        fontStyle: "bold",
      })
      .setOrigin(0.5);
    button.add([background, text]);
    return button;
  }

  private createTrafficDots(): void {
    this.destroyTrafficDots();
    this.trafficDots = this.connections.map(() =>
      this.add.circle(0, 0, 7, THEME.colors.success).setDepth(30),
    );
  }

  private destroyTrafficDots(): void {
    this.trafficDots.forEach((dot) => dot.destroy());
    this.trafficDots = [];
  }

  private resetNodeStatuses(): void {
    this.nodes.forEach((node) => node.resetStatus());
  }

  private resetDesign(): void {
    this.running = false;
    this.outcomePanel?.destroy();
    this.outcomePanel = undefined;
    this.destroyTrafficDots();
    this.runButton.setAlpha(1);
    this.activeWireFrom = undefined;
    this.activePointer = undefined;
    this.nodes.forEach((node) => node.destroy());
    this.nodes.clear();
    this.connections = [];
    this.nextNodeId = 1;
    this.simulation = undefined;
    this.crashCount = 0;
    buildDesignStore.reset();

    const client = this.createNode("client", "client", 370, 350, true);
    this.bindOutputPort(client);
    this.resetNodeStatuses();
    this.statsText
      .setColor(colorHex(THEME.colors.successLight))
      .setText("READY");
    this.phaseText.setText(BUILD_COPY.remove);
    this.drawConnections();
    this.persistDesign();
  }

  private persistDesign(): void {
    buildDesignStore.save(this.toDesign());
    if (this.saveText?.active) {
      this.saveText.setAlpha(1);
      this.tweens.killTweensOf(this.saveText);
      this.tweens.add({
        targets: this.saveText,
        alpha: 0.55,
        duration: 700,
      });
    }
  }

  private playCrashEffect(nodeId: string): void {
    const node = this.nodes.get(nodeId);
    if (!node) return;
    audio.playCrash();
    if (!preferences.snapshot.reducedMotion) {
      this.cameras.main.shake(240, 0.009);
    }
    for (let index = 0; index < 9; index += 1) {
      const spark = this.add
        .circle(node.x, node.y, Phaser.Math.Between(3, 7), THEME.colors.alert)
        .setDepth(50);
      this.tweens.add({
        targets: spark,
        x: node.x + Phaser.Math.Between(-70, 70),
        y: node.y + Phaser.Math.Between(-80, 20),
        alpha: 0,
        duration: preferences.snapshot.reducedMotion ? 120 : 520,
        onComplete: () => spark.destroy(),
      });
    }
  }

  private playCelebration(): void {
    if (!preferences.snapshot.reducedMotion) {
      this.cameras.main.flash(500, 47, 133, 90);
    }
    for (let index = 0; index < 36; index += 1) {
      const confetti = this.add
        .rectangle(
          Phaser.Math.Between(CANVAS_LEFT, CANVAS_RIGHT),
          Phaser.Math.Between(90, 180),
          8,
          18,
          index % 2 === 0 ? THEME.colors.success : THEME.colors.warning,
        )
        .setDepth(160)
        .setAngle(Phaser.Math.Between(0, 180));
      this.tweens.add({
        targets: confetti,
        y: GAME_HEIGHT + 40,
        angle: confetti.angle + Phaser.Math.Between(180, 540),
        duration: preferences.snapshot.reducedMotion
          ? 250
          : Phaser.Math.Between(1100, 2200),
        delay: preferences.snapshot.reducedMotion
          ? 0
          : Phaser.Math.Between(0, 450),
        onComplete: () => confetti.destroy(),
      });
    }
  }

  private showConsoleMessage(message: string): void {
    this.statsText.setColor(colorHex(THEME.colors.warning)).setText(message);
    this.time.delayedCall(2200, () => {
      if (!this.running && this.statsText.active) {
        this.statsText
          .setColor(colorHex(THEME.colors.successLight))
          .setText("READY");
      }
    });
  }

  private toDesign(): SystemDesign {
    return {
      nodes: [...this.nodes.values()].map((node) => ({
        id: node.nodeId,
        type: node.componentType,
        x: node.x,
        y: node.y,
      })),
      connections: this.connections.map((connection) => ({ ...connection })),
    };
  }

  private closeBuild(): void {
    this.running = false;
    this.destroyTrafficDots();
    this.scene.stop();
    this.scene.resume("FloorScene");
    gameEvents.emit("build:closed");
  }
}



================================================
FILE: src/scenes/PreloadScene.ts
================================================
import Phaser from "phaser";

import { GAME_HEIGHT, GAME_WIDTH } from "../config/dimensions";
import { THEME, colorHex } from "../config/theme";
import { getFloors } from "../core/runtime/floorRegistry";
import { OFFICE_CHARACTER_TEXTURES } from "../data/office";
import {
  getFloorHarnessOptions,
  getFloorHarnessSimulation,
  mountFloorHarnessControls,
} from "../dev/floorHarness";

export class PreloadScene extends Phaser.Scene {
  constructor() {
    super("PreloadScene");
  }

  preload(): void {
    this.cameras.main.setBackgroundColor(THEME.colors.paper);
    this.add
      .text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 16, "UPTIME", {
        color: colorHex(THEME.colors.ink),
        fontFamily: THEME.fonts.family,
        fontSize: "42px",
        fontStyle: "bold",
      })
      .setOrigin(0.5);
    this.add
      .text(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 32, "Waking the servers…", {
        color: colorHex(THEME.colors.muted),
        fontFamily: THEME.fonts.family,
        fontSize: "18px",
      })
      .setOrigin(0.5);

    this.load.setPath("assets/office");
    this.load.spritesheet("player", "characters/player.png", {
      frameWidth: 16,
      frameHeight: 32,
    });
    this.load.spritesheet("specialist", "characters/specialist.png", {
      frameWidth: 16,
      frameHeight: 32,
    });
    (["ambient-1", "ambient-3", "ambient-4", "ambient-5"] as const).forEach(
      (texture) => {
        this.load.spritesheet(texture, `characters/${texture}.png`, {
          frameWidth: 16,
          frameHeight: 32,
        });
      },
    );
    this.load.image("office-floor", "floors/floor.png");
    this.load.image("office-wall", "walls/wall.png");
    this.load.image("desk", "furniture/desk.png");
    this.load.image("computer", "furniture/computer.png");
    this.load.image("bookshelf", "furniture/bookshelf.png");
    this.load.image("plant", "furniture/plant.png");
    this.load.image("sofa", "furniture/sofa.png");
    this.load.image("large-plant", "furniture/large-plant.png");
    this.load.image("chair-front", "furniture/chair-front.png");
    this.load.image("chair-back", "furniture/chair-back.png");
    this.load.image("coffee-table", "furniture/coffee-table.png");
    this.load.image("whiteboard", "furniture/whiteboard.png");
    this.load.image("bin", "furniture/bin.png");
    this.load.image("double-bookshelf", "furniture/double-bookshelf.png");
    this.load.image("small-table", "furniture/small-table.png");
    this.load.image(
      "cushioned-chair-front",
      "furniture/cushioned-chair-front.png",
    );
    this.load.image(
      "cushioned-chair-back",
      "furniture/cushioned-chair-back.png",
    );
    this.load.image("clock", "furniture/clock.png");
    this.load.image("coffee", "furniture/coffee.png");
    this.load.image("cactus", "furniture/cactus.png");
    this.load.image("large-painting", "furniture/large-painting.png");
    this.load.image("small-painting", "furniture/small-painting.png");
    this.load.image("meeting-table", "furniture/meeting-table.png");
    this.load.image("cushioned-bench", "furniture/cushioned-bench.png");

    this.load.setPath("");
    getFloors().forEach(({ module }) => {
      module.assets.images.forEach((asset) =>
        this.load.image(asset.key, asset.path),
      );
      module.assets.spritesheets.forEach((asset) =>
        this.load.spritesheet(asset.key, asset.path, {
          frameWidth: asset.frameWidth,
          frameHeight: asset.frameHeight,
        }),
      );
      module.assets.audio.forEach((asset) =>
        this.load.audio(asset.key, asset.path),
      );
    });
  }

  create(): void {
    this.anims.create({
      key: "player-down",
      frames: this.anims.generateFrameNumbers("player", { frames: [0, 1, 2] }),
      frameRate: 8,
      repeat: -1,
    });
    this.anims.create({
      key: "player-up",
      frames: this.anims.generateFrameNumbers("player", { frames: [7, 8, 9] }),
      frameRate: 8,
      repeat: -1,
    });
    this.anims.create({
      key: "player-right",
      frames: this.anims.generateFrameNumbers("player", {
        frames: [14, 15, 16],
      }),
      frameRate: 8,
      repeat: -1,
    });
    this.anims.create({
      key: "specialist-idle",
      frames: this.anims.generateFrameNumbers("specialist", {
        frames: [5, 6],
      }),
      frameRate: 2,
      repeat: -1,
    });
    OFFICE_CHARACTER_TEXTURES.forEach((texture) => {
      this.anims.create({
        key: `office-${texture}-type`,
        frames: this.anims.generateFrameNumbers(texture, { frames: [3, 4] }),
        frameRate: 2,
        repeat: -1,
      });
      this.anims.create({
        key: `office-${texture}-walk-down`,
        frames: this.anims.generateFrameNumbers(texture, {
          frames: [0, 1, 2],
        }),
        frameRate: 7,
        repeat: -1,
      });
      this.anims.create({
        key: `office-${texture}-walk-up`,
        frames: this.anims.generateFrameNumbers(texture, {
          frames: [7, 8, 9],
        }),
        frameRate: 7,
        repeat: -1,
      });
      this.anims.create({
        key: `office-${texture}-walk-right`,
        frames: this.anims.generateFrameNumbers(texture, {
          frames: [14, 15, 16],
        }),
        frameRate: 7,
        repeat: -1,
      });
    });

    const harness = getFloorHarnessOptions();
    mountFloorHarnessControls(harness);
    this.scene.launch("UIScene");
    this.scene.start("FloorScene", {
      floor: harness.floorOrder,
      preview: {
        enabled: harness.enabled,
        state: harness.healthState,
      },
      simulationSnapshot: harness.enabled
        ? getFloorHarnessSimulation(harness.healthState)
        : undefined,
    });
  }
}



================================================
FILE: src/scenes/UIScene.ts
================================================
import Phaser from "phaser";

import { GAME_HEIGHT, GAME_WIDTH } from "../config/dimensions";
import { THEME, colorHex } from "../config/theme";
import type { FloorGlossaryEntry } from "../core/contracts";
import { getFloorById, getFloorByOrder } from "../core/runtime/floorRegistry";
import { preferences } from "../state/preferences";
import { progression } from "../state/progression";
import { audio } from "../systems/AudioSystem";
import { DialogueSystem } from "../systems/DialogueSystem";
import { gameEvents } from "../systems/EventBus";
import { GlossaryPopup } from "../ui/GlossaryPopup";
import { Notification } from "../ui/Notification";
import { SpeechBubble } from "../ui/SpeechBubble";

export class UIScene extends Phaser.Scene {
  private readonly dialogue = new DialogueSystem();
  private interactionPrompt!: Phaser.GameObjects.Text;
  private objective!: Phaser.GameObjects.Text;
  private speech?: SpeechBubble;
  private notification?: Notification;
  private alertFrame!: Phaser.GameObjects.Rectangle;
  private alertTween?: Phaser.Tweens.Tween;
  private soundToggle!: Phaser.GameObjects.Text;
  private motionToggle!: Phaser.GameObjects.Text;
  private currentFloor = 0;
  private glossaryById: Record<string, FloorGlossaryEntry> = {};

  constructor() {
    super("UIScene");
  }

  create(): void {
    const tutorial = getFloorByOrder(0).module.definition.content;
    this.interactionPrompt = this.add
      .text(GAME_WIDTH / 2, GAME_HEIGHT - 17, "", {
        color: colorHex(THEME.colors.white),
        backgroundColor: colorHex(THEME.colors.ink),
        fontFamily: THEME.fonts.family,
        fontSize: "18px",
        padding: { x: 14, y: 8 },
      })
      .setOrigin(0.5, 1)
      .setDepth(900)
      .setVisible(false);
    this.objective = this.add
      .text(24, 77, tutorial.tutorial.move ?? "", {
        color: colorHex(THEME.colors.ink),
        backgroundColor: colorHex(THEME.colors.panel),
        fontFamily: THEME.fonts.family,
        fontSize: "16px",
        fontStyle: "bold",
        padding: { x: 11, y: 7 },
      })
      .setDepth(900);
    this.createEmergencyFrame();
    this.createAccessibilityControls();
    if (progression.snapshot.floorResults[1]) {
      this.handleProgressionUpdated();
    }

    gameEvents.on("interaction:available", this.showInteraction, this);
    gameEvents.on("interaction:clear", this.hideInteraction, this);
    gameEvents.on("floor:changed", this.handleFloorChanged, this);
    gameEvents.on("dialogue:specialist", this.showSpecialistHint, this);
    gameEvents.on("ui:toast", this.showToast, this);
    gameEvents.on("build:open", this.openBuildScene, this);
    gameEvents.on("build:closed", this.handleBuildClosed, this);
    gameEvents.on("progression:updated", this.handleProgressionUpdated, this);

    if (tutorial.managerAlert) {
      this.notification = new Notification(
        this,
        GAME_WIDTH - 620,
        82,
        tutorial.managerAlert.speakerName,
        tutorial.managerAlert.text,
      );
    }
    this.time.delayedCall(4200, () => {
      if (this.scene.isActive()) {
        this.objective.setText(tutorial.tutorial.elevator ?? "");
      }
    });

    this.events.once(Phaser.Scenes.Events.SHUTDOWN, this.removeListeners, this);
  }

  private showInteraction(label: string): void {
    this.interactionPrompt.setText(`[E] ${label}`).setVisible(true);
  }

  private hideInteraction(): void {
    this.interactionPrompt.setVisible(false);
  }

  private handleFloorChanged(floor: number): void {
    this.speech?.destroy();
    this.currentFloor = floor;
    const module = getFloorByOrder(floor).module;
    const content = module.definition.content;
    this.dialogue.setSpecialistHints(content.specialistHints);
    this.glossaryById = Object.fromEntries(
      content.glossary.map((entry) => [entry.id, entry]),
    );
    this.objective.setText(
      content.tutorial.build ??
        content.tutorial.elevator ??
        `${module.title} — incident queue empty`,
    );
  }

  private showSpecialistHint(): void {
    audio.playClick();
    this.speech?.destroy();
    const line = this.dialogue.nextSpecialistHint();
    if (!line) return;
    this.speech = new SpeechBubble(this, line, this.glossaryById, (entry) =>
      this.showGlossary(entry),
    );
  }

  private showGlossary(entry: FloorGlossaryEntry): void {
    new GlossaryPopup(this, entry);
  }

  private showToast(message: string): void {
    this.notification?.dismiss();
    this.notification = new Notification(
      this,
      GAME_WIDTH - 620,
      82,
      "OFFICE MEMO",
      message,
      THEME.colors.warning,
      3800,
    );
  }

  private openBuildScene(floorId: string): void {
    if (this.scene.isActive("BuildScene")) return;
    this.speech?.destroy();
    this.objective.setVisible(false);
    this.interactionPrompt.setVisible(false);
    this.scene.pause("FloorScene");
    this.scene.launch("BuildScene", {
      floorOrder: getFloorById(floorId).order,
    });
  }

  private handleBuildClosed(): void {
    this.objective.setVisible(true);
    if (progression.snapshot.floorResults[1]) {
      this.scene.stop("FloorScene");
      this.scene.launch("FloorScene", { floor: this.currentFloor });
      this.scene.bringToTop();
    }
  }

  private createEmergencyFrame(): void {
    this.alertFrame = this.add
      .rectangle(
        GAME_WIDTH / 2,
        GAME_HEIGHT / 2,
        GAME_WIDTH - 18,
        GAME_HEIGHT - 18,
      )
      .setStrokeStyle(3, THEME.colors.alert, 0.5)
      .setDepth(850);
    this.updateEmergencyMotion();
  }

  private updateEmergencyMotion(): void {
    this.alertTween?.stop();
    this.alertFrame.setAlpha(0.7);
    if (preferences.snapshot.reducedMotion) return;
    this.alertTween = this.tweens.add({
      targets: this.alertFrame,
      alpha: { from: 0.25, to: 0.9 },
      duration: 620,
      yoyo: true,
      repeat: -1,
    });
  }

  private createAccessibilityControls(): void {
    const style: Phaser.Types.GameObjects.Text.TextStyle = {
      color: colorHex(THEME.colors.white),
      backgroundColor: colorHex(THEME.colors.ink),
      fontFamily: THEME.fonts.mono,
      fontSize: "11px",
      padding: { x: 7, y: 5 },
    };
    this.soundToggle = this.add
      .text(1060, 18, "", style)
      .setDepth(950)
      .setInteractive({ useHandCursor: true })
      .on("pointerup", () => {
        preferences.toggleMuted();
        audio.playClick();
        this.refreshAccessibilityLabels();
      });
    this.motionToggle = this.add
      .text(1163, 18, "", style)
      .setDepth(950)
      .setInteractive({ useHandCursor: true })
      .on("pointerup", () => {
        preferences.toggleReducedMotion();
        audio.playClick();
        this.refreshAccessibilityLabels();
        this.updateEmergencyMotion();
      });
    this.refreshAccessibilityLabels();
  }

  private refreshAccessibilityLabels(): void {
    const current = preferences.snapshot;
    this.soundToggle.setText(current.muted ? "SOUND OFF" : "SOUND ON");
    this.motionToggle.setText(
      current.reducedMotion ? "MOTION LOW" : "MOTION ON",
    );
  }

  private handleProgressionUpdated(): void {
    this.alertTween?.stop();
    this.alertFrame.setAlpha(1).setStrokeStyle(3, THEME.colors.success, 0.8);
    this.objective.setText("Floor 2 unlocked — take the elevator");
  }

  private removeListeners(): void {
    gameEvents.off("interaction:available", this.showInteraction, this);
    gameEvents.off("interaction:clear", this.hideInteraction, this);
    gameEvents.off("floor:changed", this.handleFloorChanged, this);
    gameEvents.off("dialogue:specialist", this.showSpecialistHint, this);
    gameEvents.off("ui:toast", this.showToast, this);
    gameEvents.off("build:open", this.openBuildScene, this);
    gameEvents.off("build:closed", this.handleBuildClosed, this);
    gameEvents.off("progression:updated", this.handleProgressionUpdated, this);
  }
}



================================================
FILE: src/sim/evaluator.ts
================================================
import { SOLUTIONS } from "../data/solutions";
import type {
  DesignConnection,
  DesignNode,
  Evaluation,
  SystemDesign,
} from "./types";

const outgoingIds = (
  nodeId: string,
  connections: DesignConnection[],
): string[] =>
  connections
    .filter((connection) => connection.from === nodeId)
    .map((connection) => connection.to);

const nodesById = (nodes: DesignNode[]): Map<string, DesignNode> =>
  new Map(nodes.map((node) => [node.id, node]));

export interface DesignTopology {
  client: DesignNode | undefined;
  loadBalancer: DesignNode | undefined;
  directServers: DesignNode[];
  balancedServers: DesignNode[];
}

export const getDesignTopology = (design: SystemDesign): DesignTopology => {
  const byId = nodesById(design.nodes);
  const client = design.nodes.find((node) => node.type === "client");
  const clientTargets = client
    ? outgoingIds(client.id, design.connections)
        .map((id) => byId.get(id))
        .filter((node): node is DesignNode => node !== undefined)
    : [];
  const loadBalancer = clientTargets.find(
    (node) => node.type === "loadBalancer",
  );
  const directServers = clientTargets.filter((node) => node.type === "server");
  const balancedServers = loadBalancer
    ? outgoingIds(loadBalancer.id, design.connections)
        .map((id) => byId.get(id))
        .filter(
          (node): node is DesignNode =>
            node !== undefined && node.type === "server",
        )
    : [];

  return { client, loadBalancer, directServers, balancedServers };
};

export const evaluateDesign = (design: SystemDesign): Evaluation => {
  const topology = getDesignTopology(design);

  if (!topology.client) {
    return SOLUTIONS.invalid;
  }

  if (topology.loadBalancer) {
    const count = topology.balancedServers.length;
    if (count === 3) return SOLUTIONS.canonical;
    if (count >= 4) return SOLUTIONS["over-provisioned"];
    if (count === 2) return SOLUTIONS["under-redundant"];
    if (count === 1) return SOLUTIONS["single-server-lb"];
    return SOLUTIONS.invalid;
  }

  if (topology.directServers.length > 1) {
    return SOLUTIONS["unbalanced-direct"];
  }
  if (topology.directServers.length === 1) {
    return SOLUTIONS["single-server-direct"];
  }
  return SOLUTIONS.invalid;
};



================================================
FILE: src/sim/simulation.ts
================================================
import {
  SIM_CONFIG,
  type SimulationConfig,
  type StressPhase,
} from "../config/simConfig";
import { evaluateDesign, getDesignTopology } from "./evaluator";
import type {
  ServerState,
  SimulationOutcome,
  SimulationState,
  SystemDesign,
} from "./types";

interface PhasePosition {
  phase: StressPhase;
  elapsedInPhase: number;
  scheduleComplete: boolean;
}

const scheduleDuration = (config: SimulationConfig): number =>
  config.phases.reduce((total, phase) => total + phase.durationSeconds, 0);

const getPhasePosition = (
  elapsedSeconds: number,
  config: SimulationConfig,
): PhasePosition => {
  let cursor = 0;
  for (const phase of config.phases) {
    if (elapsedSeconds < cursor + phase.durationSeconds) {
      return {
        phase,
        elapsedInPhase: elapsedSeconds - cursor,
        scheduleComplete: false,
      };
    }
    cursor += phase.durationSeconds;
  }

  return {
    phase: config.phases[config.phases.length - 1],
    elapsedInPhase: elapsedSeconds - cursor,
    scheduleComplete: true,
  };
};

const rpsForPhase = (
  phase: StressPhase,
  elapsedInPhase: number,
  scheduleComplete: boolean,
): number => {
  if (scheduleComplete) {
    return phase.endRps + Math.sin(elapsedInPhase * 1.7) * 2;
  }
  const progress = Math.min(1, elapsedInPhase / phase.durationSeconds);
  return phase.startRps + (phase.endRps - phase.startRps) * progress;
};

export const createSimulation = (
  design: SystemDesign,
  config: SimulationConfig = SIM_CONFIG,
): SimulationState => {
  const topology = getDesignTopology(design);
  const connectedServers = topology.loadBalancer
    ? topology.balancedServers
    : topology.directServers.slice(0, 1);

  return {
    elapsedSeconds: 0,
    phaseId: config.phases[0].id,
    phaseProgress: 0,
    incomingRps: config.phases[0].startRps,
    totalRequests: 0,
    droppedRequests: 0,
    errorRate: 0,
    injectedFailureOccurred: false,
    greenSeconds: 0,
    servers: connectedServers.map((server) => ({
      id: server.id,
      health: "healthy",
      loadRps: 0,
      overloadSeconds: 0,
      injectedFailure: false,
    })),
    outcome: "running",
  };
};

const shouldInjectFailure = (
  position: PhasePosition,
  alreadyInjected: boolean,
): boolean =>
  !alreadyInjected &&
  position.phase.injectFailureAtSeconds !== undefined &&
  position.elapsedInPhase >= position.phase.injectFailureAtSeconds;

const routeTraffic = (
  servers: ServerState[],
  incomingRps: number,
  hasLoadBalancer: boolean,
): Map<string, number> => {
  const healthy = servers.filter((server) => server.health !== "crashed");
  const routed = new Map<string, number>();
  if (healthy.length === 0) return routed;

  if (!hasLoadBalancer) {
    routed.set(healthy[0].id, incomingRps);
    return routed;
  }

  const perServer = incomingRps / healthy.length;
  healthy.forEach((server) => routed.set(server.id, perServer));
  return routed;
};

export const tickSimulation = (
  previous: SimulationState,
  design: SystemDesign,
  deltaSeconds: number,
  config: SimulationConfig = SIM_CONFIG,
): SimulationState => {
  if (previous.outcome !== "running" || deltaSeconds <= 0) return previous;

  const elapsedSeconds = previous.elapsedSeconds + deltaSeconds;
  const position = getPhasePosition(elapsedSeconds, config);
  const incomingRps = rpsForPhase(
    position.phase,
    position.elapsedInPhase,
    position.scheduleComplete,
  );
  let injectedFailureOccurred = previous.injectedFailureOccurred;
  let servers = previous.servers.map((server) => ({ ...server, loadRps: 0 }));

  if (shouldInjectFailure(position, injectedFailureOccurred)) {
    const target = servers.find((server) => server.health !== "crashed");
    if (target) {
      target.health = "crashed";
      target.injectedFailure = true;
      target.overloadSeconds = 0;
    }
    injectedFailureOccurred = true;
  }

  const topology = getDesignTopology(design);
  const routed = routeTraffic(
    servers,
    incomingRps,
    topology.loadBalancer !== undefined,
  );
  let droppedRps =
    routed.size === 0
      ? incomingRps
      : Math.max(
          0,
          incomingRps -
            [...routed.values()].reduce((total, load) => total + load, 0),
        );

  servers = servers.map((server) => {
    if (server.health === "crashed") return server;
    const loadRps = routed.get(server.id) ?? 0;
    const overloaded = loadRps > config.serverCapacityRps;
    const overloadSeconds = overloaded
      ? server.overloadSeconds + deltaSeconds
      : 0;
    droppedRps += Math.max(0, loadRps - config.serverCapacityRps);

    if (overloadSeconds >= config.overloadToleranceSeconds) {
      droppedRps += Math.min(loadRps, config.serverCapacityRps);
      return {
        ...server,
        health: "crashed",
        loadRps,
        overloadSeconds,
      };
    }

    return {
      ...server,
      health: overloaded ? "strained" : "healthy",
      loadRps,
      overloadSeconds,
    };
  });

  const totalRequests = previous.totalRequests + incomingRps * deltaSeconds;
  const droppedRequests = previous.droppedRequests + droppedRps * deltaSeconds;
  const errorRate = totalRequests === 0 ? 0 : droppedRequests / totalRequests;
  const evaluation = evaluateDesign(design);
  const unexpectedCrashes = servers.filter(
    (server) => server.health === "crashed" && !server.injectedFailure,
  ).length;
  const currentlyStable =
    unexpectedCrashes === 0 &&
    errorRate < config.stableErrorRate &&
    servers.some((server) => server.health !== "crashed");
  const greenSeconds =
    position.scheduleComplete && currentlyStable
      ? previous.greenSeconds + deltaSeconds
      : 0;

  let outcome: SimulationOutcome = previous.outcome;
  if (position.scheduleComplete) {
    if (evaluation.quality === "failed") {
      outcome = "failed";
    } else if (evaluation.quality === "partial") {
      outcome = "partial";
    } else if (greenSeconds >= config.requiredGreenSeconds) {
      outcome = "canonical";
    }
  }

  return {
    elapsedSeconds,
    phaseId: position.phase.id,
    phaseProgress: position.scheduleComplete
      ? 1
      : Math.min(1, position.elapsedInPhase / position.phase.durationSeconds),
    incomingRps,
    totalRequests,
    droppedRequests,
    errorRate,
    injectedFailureOccurred,
    greenSeconds,
    servers,
    outcome,
  };
};

export const runSimulation = (
  design: SystemDesign,
  seconds: number,
  stepSeconds = 0.1,
  config: SimulationConfig = SIM_CONFIG,
): SimulationState => {
  let state = createSimulation(design, config);
  for (
    let elapsed = 0;
    elapsed < seconds && state.outcome === "running";
    elapsed += stepSeconds
  ) {
    state = tickSimulation(state, design, stepSeconds, config);
  }
  return state;
};

export const getScheduleDuration = (
  config: SimulationConfig = SIM_CONFIG,
): number => scheduleDuration(config);



================================================
FILE: src/sim/types.ts
================================================
export type ComponentType = "client" | "loadBalancer" | "server";

export interface DesignNode {
  id: string;
  type: ComponentType;
  x: number;
  y: number;
}

export interface DesignConnection {
  from: string;
  to: string;
}

export interface SystemDesign {
  nodes: DesignNode[];
  connections: DesignConnection[];
}

export type DesignQuality = "canonical" | "partial" | "failed";

export type SolutionId =
  | "canonical"
  | "over-provisioned"
  | "under-redundant"
  | "single-server-lb"
  | "single-server-direct"
  | "unbalanced-direct"
  | "invalid";

export interface Evaluation {
  id: SolutionId;
  quality: DesignQuality;
  title: string;
  message: string;
  debtNotes: string[];
}

export type ServerHealth = "healthy" | "strained" | "crashed";

export interface ServerState {
  id: string;
  health: ServerHealth;
  loadRps: number;
  overloadSeconds: number;
  injectedFailure: boolean;
}

export type SimulationOutcome = "running" | "canonical" | "partial" | "failed";

export interface SimulationState {
  elapsedSeconds: number;
  phaseId: string;
  phaseProgress: number;
  incomingRps: number;
  totalRequests: number;
  droppedRequests: number;
  errorRate: number;
  injectedFailureOccurred: boolean;
  greenSeconds: number;
  servers: ServerState[];
  outcome: SimulationOutcome;
}



================================================
FILE: src/state/buildDesign.ts
================================================
import type { SystemDesign } from "../sim/types";

interface StorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

const STORAGE_KEY = "uptime.floor1.design.v1";

const browserStorage = (): StorageLike | undefined =>
  typeof window === "undefined" ? undefined : window.localStorage;

const isSystemDesign = (value: unknown): value is SystemDesign => {
  if (!value || typeof value !== "object") return false;
  const design = value as Partial<SystemDesign>;
  if (!Array.isArray(design.nodes) || !Array.isArray(design.connections)) {
    return false;
  }

  const validNodes = design.nodes.every(
    (node) =>
      typeof node?.id === "string" &&
      ["client", "loadBalancer", "server"].includes(node.type) &&
      typeof node.x === "number" &&
      typeof node.y === "number",
  );
  const validConnections = design.connections.every(
    (connection) =>
      typeof connection?.from === "string" && typeof connection.to === "string",
  );
  const clients = design.nodes.filter((node) => node.type === "client");
  return validNodes && validConnections && clients.length === 1;
};

export class BuildDesignStore {
  constructor(private readonly storage = browserStorage()) {}

  load(): SystemDesign | undefined {
    const serialized = this.storage?.getItem(STORAGE_KEY);
    if (!serialized) return undefined;
    try {
      const design: unknown = JSON.parse(serialized);
      return isSystemDesign(design) ? structuredClone(design) : undefined;
    } catch {
      return undefined;
    }
  }

  save(design: SystemDesign): void {
    this.storage?.setItem(STORAGE_KEY, JSON.stringify(design));
  }

  reset(): void {
    this.storage?.removeItem(STORAGE_KEY);
  }
}

export const buildDesignStore = new BuildDesignStore();



================================================
FILE: src/state/preferences.ts
================================================
export interface Preferences {
  muted: boolean;
  reducedMotion: boolean;
}

const STORAGE_KEY = "uptime.preferences.v1";

const defaults = (): Preferences => ({
  muted: false,
  reducedMotion:
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches,
});

class PreferenceStore {
  private value = this.load();

  get snapshot(): Preferences {
    return { ...this.value };
  }

  toggleMuted(): Preferences {
    this.value.muted = !this.value.muted;
    this.persist();
    return this.snapshot;
  }

  toggleReducedMotion(): Preferences {
    this.value.reducedMotion = !this.value.reducedMotion;
    this.persist();
    return this.snapshot;
  }

  private load(): Preferences {
    if (typeof window === "undefined") return defaults();
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (!saved) return defaults();
    try {
      return { ...defaults(), ...(JSON.parse(saved) as Partial<Preferences>) };
    } catch {
      return defaults();
    }
  }

  private persist(): void {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(this.value));
    }
  }
}

export const preferences = new PreferenceStore();



================================================
FILE: src/state/progression.ts
================================================
import type { DesignQuality } from "../sim/types";

export interface FloorResult {
  quality: DesignQuality;
  debtNotes: string[];
  completedAt: string;
}

export interface ProgressionState {
  unlockedFloor: number;
  floorResults: Partial<Record<number, FloorResult>>;
}

interface StorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

const STORAGE_KEY = "uptime.progression.v1";

export const DEFAULT_PROGRESSION: ProgressionState = {
  unlockedFloor: 1,
  floorResults: {},
};

const browserStorage = (): StorageLike | undefined => {
  if (typeof window === "undefined") return undefined;
  return window.localStorage;
};

export class ProgressionStore {
  private state: ProgressionState;

  constructor(private readonly storage = browserStorage()) {
    this.state = this.load();
  }

  get snapshot(): ProgressionState {
    return structuredClone(this.state);
  }

  completeFloor(
    floorId: number,
    quality: DesignQuality,
    debtNotes: string[],
  ): ProgressionState {
    if (quality === "failed") return this.snapshot;

    this.state = {
      unlockedFloor: Math.max(this.state.unlockedFloor, floorId + 1),
      floorResults: {
        ...this.state.floorResults,
        [floorId]: {
          quality,
          debtNotes: [...debtNotes],
          completedAt: new Date().toISOString(),
        },
      },
    };
    this.persist();
    return this.snapshot;
  }

  reset(): void {
    this.state = structuredClone(DEFAULT_PROGRESSION);
    this.storage?.removeItem(STORAGE_KEY);
  }

  private load(): ProgressionState {
    const serialized = this.storage?.getItem(STORAGE_KEY);
    if (!serialized) return structuredClone(DEFAULT_PROGRESSION);
    try {
      const parsed = JSON.parse(serialized) as ProgressionState;
      if (
        typeof parsed.unlockedFloor !== "number" ||
        typeof parsed.floorResults !== "object"
      ) {
        return structuredClone(DEFAULT_PROGRESSION);
      }
      return parsed;
    } catch {
      return structuredClone(DEFAULT_PROGRESSION);
    }
  }

  private persist(): void {
    this.storage?.setItem(STORAGE_KEY, JSON.stringify(this.state));
  }
}

export const progression = new ProgressionStore();



================================================
FILE: src/systems/AudioSystem.ts
================================================
import { preferences } from "../state/preferences";

class AudioSystem {
  private context?: AudioContext;

  playClick(): void {
    this.tone(420, 0.04, 0.025);
  }

  playCrash(): void {
    this.tone(110, 0.2, 0.055, "sawtooth");
  }

  playSuccess(): void {
    [523, 659, 784].forEach((frequency, index) =>
      this.tone(frequency, 0.16, 0.04, "sine", index * 0.1),
    );
  }

  private tone(
    frequency: number,
    duration: number,
    volume: number,
    type: OscillatorType = "square",
    delay = 0,
  ): void {
    if (preferences.snapshot.muted || typeof window === "undefined") return;
    this.context ??= new AudioContext();
    void this.context.resume();
    const start = this.context.currentTime + delay;
    const oscillator = this.context.createOscillator();
    const gain = this.context.createGain();
    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, start);
    gain.gain.setValueAtTime(volume, start);
    gain.gain.exponentialRampToValueAtTime(0.001, start + duration);
    oscillator.connect(gain).connect(this.context.destination);
    oscillator.start(start);
    oscillator.stop(start + duration);
  }
}

export const audio = new AudioSystem();



================================================
FILE: src/systems/DialogueSystem.ts
================================================
import type { FloorDialogueLine } from "../core/contracts";

export class DialogueSystem {
  private specialistHintIndex = 0;
  private specialistHints: FloorDialogueLine[] = [];

  setSpecialistHints(hints: FloorDialogueLine[]): void {
    this.specialistHints = hints;
    this.specialistHintIndex = 0;
  }

  nextSpecialistHint(): FloorDialogueLine | undefined {
    if (this.specialistHints.length === 0) return undefined;
    const line =
      this.specialistHints[
        Math.min(this.specialistHintIndex, this.specialistHints.length - 1)
      ];
    this.specialistHintIndex += 1;
    return line;
  }

  get hintTier(): number {
    return Math.min(this.specialistHintIndex, this.specialistHints.length);
  }
}



================================================
FILE: src/systems/EventBus.ts
================================================
import Phaser from "phaser";

export const gameEvents = new Phaser.Events.EventEmitter();



================================================
FILE: src/systems/InteractionSystem.ts
================================================
import Phaser from "phaser";

import type { Player } from "../entities/Player";
import type { Interactable } from "../entities/Interactable";
import { gameEvents } from "./EventBus";

export class InteractionSystem {
  private interactables: Interactable[] = [];
  private activeId: string | undefined;
  private readonly key: Phaser.Input.Keyboard.Key;

  constructor(
    scene: Phaser.Scene,
    private readonly player: Player,
  ) {
    this.key = scene.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.E);
  }

  setInteractables(interactables: Interactable[]): void {
    this.interactables = interactables;
    this.activeId = undefined;
    gameEvents.emit("interaction:clear");
  }

  update(): void {
    const nearest = this.interactables
      .map((interactable) => ({
        interactable,
        distance: Phaser.Math.Distance.Between(
          this.player.x,
          this.player.y,
          interactable.x,
          interactable.y,
        ),
      }))
      .filter(
        ({ interactable, distance }) => distance <= (interactable.range ?? 86),
      )
      .sort((a, b) => a.distance - b.distance)[0]?.interactable;

    if (nearest?.id !== this.activeId) {
      this.activeId = nearest?.id;
      if (nearest) gameEvents.emit("interaction:available", nearest.label);
      else gameEvents.emit("interaction:clear");
    }

    if (nearest && Phaser.Input.Keyboard.JustDown(this.key)) {
      nearest.onInteract();
    }
  }
}



================================================
FILE: src/ui/BuildNode.ts
================================================
import Phaser from "phaser";

import { THEME, colorHex } from "../config/theme";
import { COMPONENTS } from "../data/build";
import type { ComponentType, ServerHealth } from "../sim/types";

export class BuildNode extends Phaser.GameObjects.Container {
  readonly inputPort?: Phaser.GameObjects.Arc;
  readonly outputPort?: Phaser.GameObjects.Arc;
  private readonly panel: Phaser.GameObjects.Rectangle;
  private readonly statusText: Phaser.GameObjects.Text;

  constructor(
    scene: Phaser.Scene,
    public readonly nodeId: string,
    public readonly componentType: ComponentType,
    x: number,
    y: number,
    fixed = false,
  ) {
    super(scene, x, y);
    scene.add.existing(this);
    this.setDepth(20);

    this.panel = scene.add
      .rectangle(0, 0, 138, 78, THEME.colors.panel)
      .setStrokeStyle(4, this.baseColor());
    const label = scene.add
      .text(0, -10, COMPONENTS[componentType].shortLabel, {
        color: colorHex(THEME.colors.ink),
        fontFamily: THEME.fonts.mono,
        fontSize: "17px",
        fontStyle: "bold",
      })
      .setOrigin(0.5);
    this.statusText = scene.add
      .text(0, 17, componentType === "client" ? "70 RPS" : "IDLE", {
        color: colorHex(THEME.colors.muted),
        fontFamily: THEME.fonts.mono,
        fontSize: "11px",
      })
      .setOrigin(0.5);
    this.add([this.panel, label, this.statusText]);

    if (componentType !== "client") {
      this.inputPort = this.createPort(-76, "IN");
      this.add(this.inputPort);
    }
    if (componentType !== "server") {
      this.outputPort = this.createPort(76, "OUT");
      this.add(this.outputPort);
    }

    if (!fixed) {
      this.setSize(138, 78).setInteractive({ useHandCursor: true });
      scene.input.setDraggable(this);
    }
  }

  setServerStatus(health: ServerHealth, loadRps: number): void {
    const color =
      health === "crashed"
        ? THEME.colors.alert
        : health === "strained"
          ? THEME.colors.warning
          : THEME.colors.success;
    this.panel.setStrokeStyle(5, color);
    this.statusText
      .setColor(colorHex(color))
      .setText(health === "crashed" ? "CRASHED" : `${loadRps.toFixed(0)} RPS`);
  }

  resetStatus(): void {
    this.panel.setStrokeStyle(4, this.baseColor());
    this.statusText
      .setColor(colorHex(THEME.colors.muted))
      .setText(this.componentType === "client" ? "TRAFFIC" : "IDLE");
  }

  private createPort(x: number, label: string): Phaser.GameObjects.Arc {
    const port = this.scene.add
      .circle(x, 0, 12, THEME.colors.white)
      .setStrokeStyle(4, THEME.colors.panelDark)
      .setInteractive({ useHandCursor: true });
    const text = this.scene.add
      .text(x, 24, label, {
        color: colorHex(THEME.colors.muted),
        fontFamily: THEME.fonts.mono,
        fontSize: "9px",
      })
      .setOrigin(0.5);
    this.add(text);
    return port;
  }

  private baseColor(): number {
    if (this.componentType === "client") return THEME.colors.officeWall;
    if (this.componentType === "loadBalancer") return THEME.colors.warning;
    return THEME.colors.success;
  }
}



================================================
FILE: src/ui/GlossaryPopup.ts
================================================
import Phaser from "phaser";

import { GAME_HEIGHT, GAME_WIDTH } from "../config/dimensions";
import { THEME, colorHex } from "../config/theme";
import type { FloorGlossaryEntry } from "../core/contracts";

export class GlossaryPopup extends Phaser.GameObjects.Container {
  constructor(scene: Phaser.Scene, entry: FloorGlossaryEntry) {
    super(scene, 0, 0);
    scene.add.existing(this);
    this.setDepth(1300);

    const scrim = scene.add
      .rectangle(0, 0, GAME_WIDTH, GAME_HEIGHT, THEME.colors.ink, 0.56)
      .setOrigin(0)
      .setInteractive()
      .on("pointerup", () => this.destroy());
    const panel = scene.add
      .rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, 610, 230, THEME.colors.panel)
      .setStrokeStyle(5, THEME.colors.warning);
    const eyebrow = scene.add
      .text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 77, "JARGON TRANSLATOR", {
        color: colorHex(THEME.colors.warning),
        fontFamily: THEME.fonts.mono,
        fontSize: "15px",
        fontStyle: "bold",
      })
      .setOrigin(0.5);
    const term = scene.add
      .text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 38, entry.term.toUpperCase(), {
        color: colorHex(THEME.colors.ink),
        fontFamily: THEME.fonts.family,
        fontSize: "28px",
        fontStyle: "bold",
      })
      .setOrigin(0.5);
    const definition = scene.add
      .text(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 18, entry.definition, {
        align: "center",
        color: colorHex(THEME.colors.ink),
        fontFamily: THEME.fonts.family,
        fontSize: "20px",
        wordWrap: { width: 520 },
      })
      .setOrigin(0.5);
    const close = scene.add
      .text(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 84, "Click anywhere to close", {
        color: colorHex(THEME.colors.muted),
        fontFamily: THEME.fonts.family,
        fontSize: "14px",
      })
      .setOrigin(0.5);

    this.add([scrim, panel, eyebrow, term, definition, close]);
  }
}



================================================
FILE: src/ui/Notification.ts
================================================
import Phaser from "phaser";

import { THEME, colorHex } from "../config/theme";

export class Notification extends Phaser.GameObjects.Container {
  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    title: string,
    message: string,
    accent: number = THEME.colors.alert,
    durationMs = 6500,
  ) {
    super(scene, x, y);
    scene.add.existing(this);
    this.setDepth(1000);

    const panel = scene.add
      .rectangle(0, 0, 590, 126, THEME.colors.panel, 0.98)
      .setOrigin(0, 0)
      .setStrokeStyle(4, accent);
    const stripe = scene.add.rectangle(0, 0, 12, 126, accent).setOrigin(0, 0);
    const titleText = scene.add.text(28, 14, title, {
      color: colorHex(accent),
      fontFamily: THEME.fonts.family,
      fontSize: "18px",
      fontStyle: "bold",
    });
    const messageText = scene.add.text(28, 42, message, {
      color: colorHex(THEME.colors.ink),
      fontFamily: THEME.fonts.family,
      fontSize: "17px",
      lineSpacing: 5,
      wordWrap: { width: 530 },
    });
    const close = scene.add
      .text(563, 10, "×", {
        color: colorHex(THEME.colors.muted),
        fontFamily: THEME.fonts.family,
        fontSize: "24px",
      })
      .setInteractive({ useHandCursor: true })
      .on("pointerup", () => this.dismiss());

    this.add([panel, stripe, titleText, messageText, close]);
    this.setAlpha(0).setY(y - 20);
    scene.tweens.add({
      targets: this,
      alpha: 1,
      y,
      duration: 220,
      ease: "Back.Out",
    });
    if (durationMs > 0) {
      scene.time.delayedCall(durationMs, () => this.dismiss());
    }
  }

  dismiss(): void {
    if (!this.active) return;
    this.scene.tweens.add({
      targets: this,
      alpha: 0,
      y: this.y - 16,
      duration: 160,
      onComplete: () => this.destroy(),
    });
  }
}



================================================
FILE: src/ui/Palette.ts
================================================
import Phaser from "phaser";

import { THEME, colorHex } from "../config/theme";
import { COMPONENTS } from "../data/build";
import type { ComponentType } from "../sim/types";

type PaletteType = Exclude<ComponentType, "client">;

export class Palette extends Phaser.GameObjects.Container {
  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    onDrop: (type: PaletteType, x: number, y: number) => void,
  ) {
    super(scene, x, y);
    scene.add.existing(this);

    const panel = scene.add
      .rectangle(0, 0, 236, 590, THEME.colors.panelDark)
      .setOrigin(0);
    const title = scene.add.text(20, 18, "COMPONENTS", {
      color: colorHex(THEME.colors.white),
      fontFamily: THEME.fonts.mono,
      fontSize: "18px",
      fontStyle: "bold",
    });
    this.add([panel, title]);

    (["loadBalancer", "server"] as PaletteType[]).forEach((type, index) => {
      const originX = 118;
      const originY = 100 + index * 154;
      const item = scene.add.container(originX, originY);
      const box = scene.add
        .rectangle(0, 0, 184, 102, THEME.colors.panel)
        .setStrokeStyle(3, THEME.colors.warning);
      const label = scene.add
        .text(0, -18, COMPONENTS[type].label, {
          align: "center",
          color: colorHex(THEME.colors.ink),
          fontFamily: THEME.fonts.family,
          fontSize: "18px",
          fontStyle: "bold",
        })
        .setOrigin(0.5);
      const hint = scene.add
        .text(0, 21, "DRAG TO CANVAS", {
          color: colorHex(THEME.colors.muted),
          fontFamily: THEME.fonts.mono,
          fontSize: "11px",
        })
        .setOrigin(0.5);
      item.add([box, label, hint]);
      item.setSize(184, 102).setInteractive({ useHandCursor: true });
      scene.input.setDraggable(item);
      item.on(
        "drag",
        (_pointer: Phaser.Input.Pointer, dragX: number, dragY: number) => {
          item.setPosition(dragX, dragY);
        },
      );
      item.on("dragend", () => {
        const worldX = this.x + item.x;
        const worldY = this.y + item.y;
        if (worldX > 285) onDrop(type, worldX, worldY);
        item.setPosition(originX, originY);
      });
      this.add(item);
    });

    const help = scene.add.text(
      20,
      435,
      "PORTS\n\nOUT → IN\n\nWire users to a load balancer or server, then wire the balancer to servers.",
      {
        color: colorHex(THEME.colors.white),
        fontFamily: THEME.fonts.family,
        fontSize: "14px",
        lineSpacing: 4,
        wordWrap: { width: 195 },
      },
    );
    this.add(help);
  }
}



================================================
FILE: src/ui/SpeechBubble.ts
================================================
import Phaser from "phaser";

import { GAME_HEIGHT, GAME_WIDTH } from "../config/dimensions";
import { THEME, colorHex } from "../config/theme";
import type { FloorDialogueLine, FloorGlossaryEntry } from "../core/contracts";

export class SpeechBubble extends Phaser.GameObjects.Container {
  constructor(
    scene: Phaser.Scene,
    line: FloorDialogueLine,
    glossaryById: Readonly<Record<string, FloorGlossaryEntry>>,
    onGlossary: (entry: FloorGlossaryEntry) => void,
  ) {
    super(scene, 0, 0);
    scene.add.existing(this);
    this.setDepth(1100);

    const y = GAME_HEIGHT - 236;
    const panel = scene.add
      .rectangle(52, y, GAME_WIDTH - 104, 184, THEME.colors.panel, 0.98)
      .setOrigin(0)
      .setStrokeStyle(4, THEME.colors.ink);
    const speaker = scene.add.text(80, y + 18, line.speakerName, {
      color: colorHex(THEME.colors.alertDark),
      fontFamily: THEME.fonts.family,
      fontSize: "19px",
      fontStyle: "bold",
    });
    const body = scene.add.text(80, y + 50, line.text, {
      color: colorHex(THEME.colors.ink),
      fontFamily: THEME.fonts.family,
      fontSize: "19px",
      lineSpacing: 5,
      wordWrap: { width: GAME_WIDTH - 170 },
    });
    const close = scene.add
      .text(GAME_WIDTH - 83, y + 14, "×", {
        color: colorHex(THEME.colors.muted),
        fontFamily: THEME.fonts.family,
        fontSize: "28px",
      })
      .setInteractive({ useHandCursor: true })
      .on("pointerup", () => this.destroy());
    this.add([panel, speaker, body, close]);

    let chipX = 80;
    let chipY = y + 134;
    for (const glossaryId of line.glossaryIds ?? []) {
      const entry = glossaryById[glossaryId];
      if (!entry) continue;
      const chip = scene.add
        .text(chipX, chipY, entry.term, {
          color: colorHex(THEME.colors.white),
          backgroundColor: colorHex(THEME.colors.panelDark),
          fontFamily: THEME.fonts.family,
          fontSize: "14px",
          fontStyle: "bold",
          padding: { x: 9, y: 5 },
        })
        .setInteractive({ useHandCursor: true })
        .on("pointerup", () => onGlossary(entry));
      if (chipX + chip.width > GAME_WIDTH - 100) {
        chipX = 80;
        chipY += 32;
        chip.setPosition(chipX, chipY);
      }
      chipX += chip.width + 9;
      this.add(chip);
    }
  }
}



================================================
FILE: test/config/theme.test.ts
================================================
import { describe, expect, it } from "vitest";

import { colorHex, THEME } from "../../src/config/theme";

describe("theme", () => {
  it("formats Phaser colors for text styles", () => {
    expect(colorHex(THEME.colors.alert)).toBe("#c73e3a");
  });
});



================================================
FILE: test/core/floorRegistry.test.ts
================================================
import { describe, expect, it } from "vitest";

import {
  getFloorByOrder,
  getFloors,
} from "../../src/core/runtime/floorRegistry";

describe("floor registry", () => {
  it("discovers floors from folders in numeric order", () => {
    expect(getFloors().map(({ order, module }) => [order, module.id])).toEqual([
      [0, "f00"],
      [1, "f01"],
      [2, "f02"],
    ]);
  });

  it("loads complete, namespaced floor modules", () => {
    for (const { order, module } of getFloors()) {
      expect(getFloorByOrder(order).module).toBe(module);
      expect(module.contractVersion).toBe(1);
      expect(module.title).not.toBe("");
      expect(module.category).not.toBe("");
      expect(module.view.createLayout).toBeTypeOf("function");
      expect(module.view.createBuildUI).toBeTypeOf("function");

      const dialogue = [
        ...(module.definition.content.managerAlert
          ? [module.definition.content.managerAlert]
          : []),
        ...module.definition.content.specialistHints,
      ];
      dialogue.forEach((line) =>
        expect(line.id.startsWith(`${module.id}_`)).toBe(true),
      );
      module.definition.content.glossary.forEach((entry) =>
        expect(entry.id.startsWith(`${module.id}.`)).toBe(true),
      );
    }
  });
});



================================================
FILE: test/sim/evaluator.test.ts
================================================
import { describe, expect, it } from "vitest";

import { evaluateDesign } from "../../src/sim/evaluator";
import { makeDesign } from "./fixtures";

describe("evaluateDesign", () => {
  it.each([
    [3, true, "canonical", "canonical"],
    [4, true, "over-provisioned", "partial"],
    [5, true, "over-provisioned", "partial"],
    [2, true, "under-redundant", "partial"],
    [1, true, "single-server-lb", "failed"],
    [1, false, "single-server-direct", "failed"],
    [3, false, "unbalanced-direct", "failed"],
    [0, true, "invalid", "failed"],
  ] as const)(
    "classifies %i servers with load balancer=%s",
    (servers, withLoadBalancer, id, quality) => {
      expect(
        evaluateDesign(makeDesign(servers, withLoadBalancer)),
      ).toMatchObject({ id, quality });
    },
  );

  it("ignores unconnected components", () => {
    const design = makeDesign(3, true);
    design.nodes.push({ id: "spare", type: "server", x: 0, y: 0 });
    expect(evaluateDesign(design).id).toBe("canonical");
  });
});



================================================
FILE: test/sim/fixtures.ts
================================================
import type { DesignNode, SystemDesign } from "../../src/sim/types";

export const makeDesign = (
  serverCount: number,
  withLoadBalancer: boolean,
): SystemDesign => {
  const client: DesignNode = { id: "client", type: "client", x: 80, y: 260 };
  const loadBalancer: DesignNode = {
    id: "lb",
    type: "loadBalancer",
    x: 310,
    y: 260,
  };
  const servers: DesignNode[] = Array.from(
    { length: serverCount },
    (_, index) => ({
      id: `server-${index + 1}`,
      type: "server" as const,
      x: 600,
      y: 130 + index * 100,
    }),
  );

  return {
    nodes: withLoadBalancer
      ? [client, loadBalancer, ...servers]
      : [client, ...servers],
    connections: withLoadBalancer
      ? [
          { from: client.id, to: loadBalancer.id },
          ...servers.map((server) => ({
            from: loadBalancer.id,
            to: server.id,
          })),
        ]
      : servers.map((server) => ({ from: client.id, to: server.id })),
  };
};



================================================
FILE: test/sim/simulation.test.ts
================================================
import { describe, expect, it } from "vitest";

import { SIM_CONFIG } from "../../src/config/simConfig";
import {
  createSimulation,
  getScheduleDuration,
  runSimulation,
  tickSimulation,
} from "../../src/sim/simulation";
import { makeDesign } from "./fixtures";

describe("simulation", () => {
  const fullRunSeconds =
    getScheduleDuration() + SIM_CONFIG.requiredGreenSeconds + 1;

  it("ramps traffic according to the stress schedule", () => {
    const design = makeDesign(3, true);
    const baseline = tickSimulation(createSimulation(design), design, 2);
    const ramp = tickSimulation(baseline, design, 3);

    expect(baseline.phaseId).toBe("baseline");
    expect(baseline.incomingRps).toBe(20);
    expect(ramp.phaseId).toBe("ramp");
    expect(ramp.incomingRps).toBeGreaterThan(20);
    expect(ramp.incomingRps).toBeLessThan(70);
  });

  it("keeps the canonical three-server design stable after one failure", () => {
    const state = runSimulation(makeDesign(3, true), fullRunSeconds);

    expect(state.outcome).toBe("canonical");
    expect(state.injectedFailureOccurred).toBe(true);
    expect(
      state.servers.filter((server) => server.injectedFailure),
    ).toHaveLength(1);
    expect(
      state.servers.filter((server) => server.health !== "crashed"),
    ).toHaveLength(2);
    expect(state.errorRate).toBeLessThan(SIM_CONFIG.stableErrorRate);
  });

  it("flags four servers as a stable but over-provisioned partial result", () => {
    const state = runSimulation(makeDesign(4, true), fullRunSeconds);
    expect(state.outcome).toBe("partial");
    expect(state.errorRate).toBeLessThan(SIM_CONFIG.stableErrorRate);
  });

  it("shows why two servers have no failure headroom", () => {
    const state = runSimulation(makeDesign(2, true), fullRunSeconds);
    expect(state.outcome).toBe("partial");
    expect(
      state.servers.filter((server) => server.health === "crashed").length,
    ).toBeGreaterThanOrEqual(2);
    expect(state.errorRate).toBeGreaterThan(SIM_CONFIG.stableErrorRate);
  });

  it("overloads direct traffic onto only the first connected server", () => {
    const design = makeDesign(3, false);
    const state = runSimulation(design, fullRunSeconds);

    expect(state.servers).toHaveLength(1);
    expect(state.outcome).toBe("failed");
    expect(state.errorRate).toBeGreaterThan(0.01);
  });

  it("does not mutate the prior snapshot while ticking", () => {
    const design = makeDesign(3, true);
    const initial = createSimulation(design);
    const next = tickSimulation(initial, design, 1);

    expect(initial.elapsedSeconds).toBe(0);
    expect(initial.servers.every((server) => server.loadRps === 0)).toBe(true);
    expect(next.elapsedSeconds).toBe(1);
  });
});



================================================
FILE: test/state/buildDesign.test.ts
================================================
import { describe, expect, it } from "vitest";

import { BuildDesignStore } from "../../src/state/buildDesign";
import { makeDesign } from "../sim/fixtures";

class MemoryStorage {
  private values = new Map<string, string>();

  getItem(key: string): string | null {
    return this.values.get(key) ?? null;
  }

  setItem(key: string, value: string): void {
    this.values.set(key, value);
  }

  removeItem(key: string): void {
    this.values.delete(key);
  }
}

describe("BuildDesignStore", () => {
  it("restores the last architecture without sharing mutable references", () => {
    const storage = new MemoryStorage();
    const store = new BuildDesignStore(storage);
    const design = makeDesign(3, true);

    store.save(design);
    const restored = store.load();
    restored!.nodes[0].x = 999;

    expect(store.load()).toEqual(design);
  });

  it("clears a saved architecture on reset", () => {
    const store = new BuildDesignStore(new MemoryStorage());
    store.save(makeDesign(3, true));
    store.reset();
    expect(store.load()).toBeUndefined();
  });

  it("ignores malformed saved data", () => {
    const storage = new MemoryStorage();
    storage.setItem("uptime.floor1.design.v1", '{"nodes":[],"connections":[]}');
    expect(new BuildDesignStore(storage).load()).toBeUndefined();
  });
});



================================================
FILE: test/state/progression.test.ts
================================================
import { describe, expect, it } from "vitest";

import { ProgressionStore } from "../../src/state/progression";

class MemoryStorage {
  private values = new Map<string, string>();

  getItem(key: string): string | null {
    return this.values.get(key) ?? null;
  }

  setItem(key: string, value: string): void {
    this.values.set(key, value);
  }

  removeItem(key: string): void {
    this.values.delete(key);
  }
}

describe("ProgressionStore", () => {
  it("unlocks the next floor and persists tech debt", () => {
    const storage = new MemoryStorage();
    const store = new ProgressionStore(storage);
    store.completeFloor(1, "partial", ["No spare capacity."]);

    const restored = new ProgressionStore(storage).snapshot;
    expect(restored.unlockedFloor).toBe(2);
    expect(restored.floorResults[1]).toMatchObject({
      quality: "partial",
      debtNotes: ["No spare capacity."],
    });
  });

  it("does not advance failed attempts", () => {
    const store = new ProgressionStore(new MemoryStorage());
    store.completeFloor(1, "failed", []);
    expect(store.snapshot).toMatchObject({
      unlockedFloor: 1,
      floorResults: {},
    });
  });
});



================================================
FILE: test/systems/DialogueSystem.test.ts
================================================
import { describe, expect, it } from "vitest";

import { content } from "../../src/floors/floor-01-scalability/definition/content";
import { DialogueSystem } from "../../src/systems/DialogueSystem";

describe("DialogueSystem", () => {
  it("advances through three hints and repeats the specific hint", () => {
    const dialogue = new DialogueSystem();
    dialogue.setSpecialistHints(content.specialistHints);

    expect(dialogue.nextSpecialistHint()?.id).toBe("f01_specialist_hint_1");
    expect(dialogue.nextSpecialistHint()?.id).toBe("f01_specialist_hint_2");
    expect(dialogue.nextSpecialistHint()?.id).toBe("f01_specialist_hint_3");
    expect(dialogue.nextSpecialistHint()?.id).toBe("f01_specialist_hint_3");
    expect(dialogue.hintTier).toBe(3);
  });
});



================================================
FILE: vite/config.dev.mjs
================================================
import { defineConfig } from "vite";

export default defineConfig({
  base: "./",
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          phaser: ["phaser"],
        },
      },
    },
  },
  server: {
    port: 8080,
  },
});



================================================
FILE: vite/config.prod.mjs
================================================
import { defineConfig } from "vite";

const phasermsg = () => {
  return {
    name: "phasermsg",
    buildStart() {
      process.stdout.write(`Building for production...\n`);
    },
    buildEnd() {
      const line = "---------------------------------------------------------";
      const msg = `❤️❤️❤️ Tell us about your game! - games@phaser.io ❤️❤️❤️`;
      process.stdout.write(`${line}\n${msg}\n${line}\n`);

      process.stdout.write(`✨ Done ✨\n`);
    },
  };
};

export default defineConfig({
  base: process.env.CUSTOM_DOMAIN === "true" ? "/" : "/StormHacks2026/",
  logLevel: "warning",
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          phaser: ["phaser"],
        },
      },
    },
    minify: "terser",
    terserOptions: {
      compress: {
        passes: 2,
      },
      mangle: true,
      format: {
        comments: false,
      },
    },
  },
  server: {
    port: 8080,
  },
  plugins: [phasermsg()],
});



================================================
FILE: .githooks/pre-push
================================================
#!/bin/sh
set -e

npm run validate:floors



================================================
FILE: .github/workflows/deploy.yml
================================================
name: Deploy Uptime to GitHub Pages

on:
  push:
    branches: [main]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: pages
  cancel-in-progress: true

jobs:
  verify-and-deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    steps:
      - name: Check out repository
        uses: actions/checkout@v6
      - name: Set up Node
        uses: actions/setup-node@v6
        with:
          node-version: 22
          cache: npm
      - name: Install dependencies
        run: npm ci
      - name: Test
        run: npm test
      - name: Build
        run: npm run build
      - name: Configure Pages
        uses: actions/configure-pages@v6
      - name: Upload site
        uses: actions/upload-pages-artifact@v5
        with:
          path: dist
      - name: Deploy
        id: deployment
        uses: actions/deploy-pages@v5



================================================
FILE: .github/workflows/floor-validation.yml
================================================
name: Validate isolated floors

on:
  pull_request:
  push:
    branches:
      - "floor/**"

permissions:
  contents: read

jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - name: Check out repository
        uses: actions/checkout@v6
        with:
          fetch-depth: 0
      - name: Set up Node
        uses: actions/setup-node@v6
        with:
          node-version: 22
          cache: npm
      - name: Install dependencies
        run: npm ci
      - name: Validate floor ownership and contracts
        run: npm run validate:floors
      - name: Type-check
        run: npm run typecheck


