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
