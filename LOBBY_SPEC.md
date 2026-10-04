# Tutorial Floor: The Office Lobby — Agent Build Spec

> **Audience:** an AI agent (or developer) building this scene.
> **Goal:** produce a cozy, readable, pixel-art office lobby where the player feels like a nervous first-day intern: they fill out their info, sit in the waiting area, and get called in. The scene quietly introduces core system-design ideas (queues, shared resources, monitoring, request/response) without ever feeling like a lecture.

Treat every **MUST** as a hard requirement. Treat **SHOULD** as strongly preferred. Treat **MAY** as optional polish.

---

## 0. How to Work

1. Read this whole file before writing code or generating assets.
2. Look at the reference images supplied with this spec (see §2). If they are not available, follow the written descriptions here.
3. Match the project's existing engine, folder structure, and naming conventions. If there is no existing project, ask which engine to use. Do not assume one.
4. Build in the order given in §11. Get a walkable, ugly-but-working scene first, then add art, then interactions, then polish.
5. Keep all tunable values (positions, timers, queue sizes, colors) in one data/config file, not scattered in code.
6. When a requirement is ambiguous, pick the simplest option that satisfies it, and record the choice in `LOBBY_NOTES.md`.
7. Verify against the acceptance checklist in §12 before reporting done.

---

## 1. Design Intent

**Feeling:** warm, slightly awkward, hopeful. A real office lobby, but cute. Soft lighting, gentle idle motion, small funny details.

**Player fantasy:** "It's my first day. I don't know anyone. I'm filling out forms and waiting for my name to be called."

**Pacing:** the whole lobby sequence should take roughly **3–5 minutes**:

| Phase | Approx. time | What happens |
|---|---|---|
| Arrive | 15 s | Player enters, sees the lobby, gets oriented |
| Check in | 60–90 s | Player fills out the intake form at the front desk |
| Wait | 60–120 s | Player takes a numbered ticket, sits, and can poke around the lobby |
| Called | 15 s | Name/number is called; a door opens to the first real activity |

**Tone rules:**
- No stress, no fail states, no timers that punish the player.
- Humor is gentle and observational (a fish who seems to judge you, a printer with opinions).
- Text is short. Max ~12 words per speech bubble line.

---

## 2. Art Direction

### 2.1 Style
- **Pixel art**, chunky and clean, matching the two pixel-art references (the printer and the fish tank).
- **Dark navy/near-black outlines** (about 1 px at native resolution) around every object.
- **Limited palette per object** (6–10 colors), with clear light/shadow shading, hard-edged, no gradients or anti-aliasing.
- **Slight 3/4 top-down view**: objects show their top surface and front (and one side for large objects like the printer). The scene MUST read as a single consistent perspective.
- **Soft pastel-leaning palette** with warm wood/tan, muted teal-green, dusty blue, and rust/brown accents (as seen in the printer reference).
- Add a **soft blue-gray drop shadow** under each object (see the shadow under the printer and fish tank references).

### 2.2 Technical art settings
- Native art resolution: choose one base tile size (**16×16 or 32×32 px recommended**) and use it everywhere.
- Scale up with **nearest-neighbor** filtering only. Never use bilinear smoothing.
- All sprites on transparent backgrounds. Export PNG.
- Sprite sheets for animation, with consistent frame sizes.
- Pixel-snap all object positions so nothing shimmers or sub-pixel jitters.

### 2.3 Reference images and how to use them

| Ref | What it shows | Use it for |
|---|---|---|
| **Ref 1** — pixel-art office printer | Boxy 3/4-view printer: tan/gold top rails, rust-brown body, green control panel with orange and white buttons, blue paper sheet sticking out the top, a pale blue output tray at the front, small green status light on the side | **Style target** for the printer sprite and for the overall pixel look |
| **Ref 2** — photo of a real large office multifunction printer | Dark gray/black copier with an automatic document feeder lid on top, control panel with a small touchscreen at the front-left, pull-out paper tray at the front | **Shape/proportion reference** for "large office-style printer". It should feel bigger and more serious than a home printer |
| **Ref 3** — pixel-art fish tank | Front-on tank with a dark rim/lid, light-blue water, sandy/gravel base with rocks, green and pink-coral plants, small orange fish | **Style target** for the fish tank sprite and its animation |
| **Ref 4** — photo of airport waiting-room chairs | Row of linked black seats with polished chrome (metal) armrests and a chrome base with star-shaped feet, on a reflective dark floor | **Shape reference** for the waiting-room chairs: linked row, shared armrests, chrome frame |

**Important:** Ref 2 and Ref 4 are photos. Do **not** copy them literally. Translate them into the same pixel-art style as Ref 1 and Ref 3.

---

## 3. Scene Layout

Use a **single screen/room** (no scrolling needed). Suggested footprint: **about 24 × 16 tiles** (adjust to the project's resolution).

```
+------------------------------------------------------------------+
|  [WINDOW]   [WINDOW]    [  COMPANY LOGO / SIGN  ]    [WINDOW]    |
|                                                                  |
|  [PLANT]   [FISH TANK on low cabinet]        [RECEPTION DESK]    |
|                                                  (NPC + forms)   |
|                                                                  |
|                                                      [DOOR TO    |
|  [WAITING CHAIRS row A]      [COFFEE TABLE]          OFFICES]    |
|  [WAITING CHAIRS row B]      [magazines]             (locked      |
|                                                       until      |
|                                                       called)    |
|  [LARGE PRINTER + small table/paper shelf]    [TICKET MACHINE]   |
|  [RUG]                                                           |
|                         [ENTRANCE / GLASS DOORS]                 |
+------------------------------------------------------------------+
```

Layout rules:
- **MUST** leave a clear walking path from the entrance to the reception desk, then to the seats.
- **MUST** keep every interactive object reachable and visually distinct from decoration.
- **SHOULD** place the fish tank where it is visible from the waiting chairs (the player stares at it while waiting).
- **SHOULD** place the printer near the reception desk side of the room or along a wall, so it feels like part of the office, but it must also be reachable by the player.
- Keep the floor readable: a floor tile pattern (soft checker or carpet tone) that doesn't compete with objects.

---

## 4. Required Objects (MUST be present)

### 4.1 Waiting-room chairs (airport style)

**Look**
- At least **two rows** of linked seats, **4–6 seats per row**, with each row built as a single connected unit (shared metal frame, as in Ref 4).
- Black/charcoal seat and back cushions with subtle highlight on the top edge.
- **Chrome/silver armrests** between seats (light gray with white highlight pixels and a darker underside), and a chrome base with splayed feet.
- Optional tiny details: a scuff mark, one seat with a slightly crooked cushion, a forgotten paper cup on one armrest.

**Behavior**
- Each seat is an individual interaction slot.
- Player walks up and presses the interact key to **sit**. Sitting snaps the player sprite into the seat, facing the same direction as the chairs.
- While seated, show a calm "waiting" state: small idle animation (leg swing, glance at phone, checking watch).
- Seats can be **occupied by background NPCs** (see §6) so that the player has to pick a free one. This is the visual "queue."
- **MUST** have a way to stand back up.

**Data**
```yaml
seat:
  id: string            # e.g. "rowA_seat3"
  occupied_by: null | npc_id | player
  facing: down | up | left | right
```

### 4.2 Fish tank

**Look**
- Front-facing tank on a low cabinet or stand, following Ref 3: dark rim and lid, light-blue water, gravel/sand base, at least **two plants** (one green, one pink/coral), and **2–4 small fish** (orange, red, and optionally one tiny yellow).
- Subtle **light shaft** effect through the water (lighter vertical streak).
- A small label or sticky note on the cabinet, for example "Please do not tap the glass."

**Animation (MUST loop continuously)**
- Fish swim left/right at slightly different speeds and heights, flipping their sprite when they turn.
- **Bubbles** rise from a gravel-level bubbler every few seconds (2–3 frame animation).
- Plants **sway** gently (2–4 frame loop, slow).
- Water surface has a faint shimmer.

**Interaction**
- Player can **look closely**: the camera nudges in slightly, or a small close-up overlay appears, and a short line plays (see §7 for lines).
- Tapping the glass makes the fish dart away briefly, then return. Make this cute and harmless.
- A **feeding** interaction MAY be added (a small food jar next to the tank). Feeding makes the fish gather at the surface.

**System-design hook** (subtle, never lectured): the tank is a **monitoring dashboard in disguise**. A tiny panel on the cabinet shows temperature, filter status, and a green/yellow/red light. In later floors this idea comes back as health checks and alerts. See §8.

### 4.3 Large office-style printer

**Look**
- A **big, floor-standing multifunction office printer/copier**, noticeably larger than the fish tank (roughly 1.5–2× a chair's width). Combine Ref 1 (pixel style, colors) with Ref 2 (proportions):
  - Boxy body, a lid/document feeder on top, a control panel with a **small screen and a few colored buttons**, a **pull-out paper tray** at the front, and an **output tray**.
  - Include the **paper sheet sticking out** of the top or output tray, like in Ref 1.
  - A small **status LED** (green = ready, amber = busy, red = jam).
- Place it on a small stand or directly on the floor with a soft shadow. Next to it, put a **stack of paper** and a small recycling bin.

**Animation**
- **Idle:** slow LED blink, tiny screen flicker.
- **Printing:** paper slides out of the output tray frame by frame, body gives a tiny 1-px vibration, a "brrr-chunk-chunk" sound plays (see §9).
- **Jam:** LED turns red, a crumpled paper pokes out, a small "!" bubble appears above it.

**Interaction**
- Player can **press buttons** on the printer's panel, which opens a very simple UI (see §5.3).
- Player collects a **printed document** (their intake form copy, welcome packet, or ID badge) from the output tray.
- The printer **MUST** be part of the intake flow (see §5), not purely decorative.

**System-design hook:** the printer is a **shared resource with a job queue**. See §8.

---

## 5. Gameplay Flow

### 5.1 Overview
```
Enter -> Reception desk (fill out form) -> Printer (print badge/packet)
      -> Ticket machine (take number) -> Sit and wait
      -> Number called -> Door opens -> Next floor
```

The order of **ticket then printer** MAY be swapped, but the whole flow must stay linear and clearly signposted (a small floating arrow or a glowing outline on the next thing to do).

### 5.2 Intake form (reception desk)
The "preliminary info" the player fills out. Keep it light and charming.

Fields (all stored in the save/profile data):
| Field | Type | Notes |
|---|---|---|
| Name | text | Default suggestion allowed. Max 16 characters. Used in the "called" announcement |
| Role / title | dropdown | "Intern" pre-selected, with a few joke options |
| Favorite programming language | dropdown or free text | Purely for flavor; may be referenced by later NPCs |
| Emergency contact | text | Can be "Mom" |
| Comfort with databases | slider 1–5 | Used to tune later hints, never shown as a grade |

UI rules:
- Present the form as a **paper clipboard or tablet** that comes up over the scene, styled like the pixel UI.
- One field at a time or a single compact page, whichever suits the engine. Support keyboard, mouse, and gamepad.
- A friendly NPC receptionist reacts to answers with one short line.
- **MUST** allow editing before submit. **MUST** persist the result.

### 5.3 Printer step
After submitting, the receptionist says: "Could you print your badge? Printer's over there."
1. Player walks to the printer and interacts.
2. A simple panel shows **a single "PRINT" button** (and optionally a paper-size selector as a joke).
3. A short printing animation plays. Another NPC's job might already be in progress, so the player's job visibly **waits its turn** (see §8).
4. Player picks up the printed **ID badge/packet**, which shows their name and role in pixel art.

### 5.4 Ticket and wait
1. Player takes a **numbered ticket** from a small dispenser. Number shown, e.g. "A-017".
2. A **now-serving display** (small LED sign above the door) shows the current number.
3. Background NPCs hold earlier numbers and get called first, one at a time, leaving through the door. The number counts up.
4. When the player's number comes up, a soft chime plays, the sign flashes, and the receptionist or an intercom says the player's name.
5. The door to the offices opens. Player walks through to start the next floor.

The wait **MUST** be skippable-feeling: allow the player to sit and let time pass, or walk around. A configurable `wait_duration_seconds` (default **45–90 s**) controls how long. Provide a **"fast-forward"** option for repeat playthroughs.

---

## 6. NPCs and Ambient Life

The lobby should feel inhabited. Keep NPCs simple (idle loops plus a few scripted movements).

| NPC | Role | Behavior |
|---|---|---|
| Receptionist | Gives instructions, reacts to form | Behind the desk, types, answers the phone, looks up when the player approaches |
| Waiting person A | Another candidate in a suit | Sits in a chair, bounces a knee, checks a watch, eventually gets called |
| Waiting person B | Someone absorbed in a laptop | Types, sighs, eventually called |
| Waiting person C | Someone asleep | Head nods, a tiny "z" particle, wakes when called |
| Janitor or courier (optional) | Walks through occasionally | Crosses the lobby with a cart, pauses at the printer |

Rules:
- **MUST** have at least **3 background NPCs** so the queue is visible.
- NPCs use the same seat/ticket system as the player (so the queue is real, not faked).
- NPC speech is optional and short.

---

## 7. Writing and Small Details

**Sample lines** (rewrite freely, keep the tone):

- Receptionist (arrival): "Welcome! First day? Don't worry, everyone looks lost."
- Receptionist (after form): "Great. Badge printing is just over there."
- Fish tank (look): "The fish stares back. It has seen many interns."
- Fish tank (tap): "You tapped the glass. The fish is disappointed."
- Printer (idle): "It hums quietly, as if it knows something."
- Printer (queued behind another job): "Someone else is printing. You're next."
- Printer (jam): "PC LOAD LETTER? What does that even mean?"
- Chairs: "Surprisingly cold chrome armrests."
- Called: "Now serving... [PlayerName]!"

**Decor to add for charm (SHOULD):**
- Company logo sign on the back wall (invent a simple fictional company).
- Two or three potted plants, one slightly droopy.
- Framed motivational poster ("Hang in there" or a pixel cat on a branch).
- A coffee table with outdated magazines.
- Wall clock that shows the real in-game time.
- Large windows with soft light and a parallax city or tree line.
- Water cooler (MAY).
- Welcome mat at the entrance.

---

## 8. Hidden System-Design Concepts (teach by feel, not by text)

The lobby is the tutorial floor. Nothing is named explicitly on screen unless an optional "Nerd Notes" collectible is opened. Each object quietly demonstrates one idea so later floors can say "remember the lobby?"

| Lobby object | Concept shown | How it appears in play |
|---|---|---|
| Waiting chairs + ticket machine | **Queue (FIFO)**, fairness, wait time, capacity | People are served in ticket order. Only so many seats exist. If seats are full, newcomers stand (backpressure) |
| Now-serving display | **State/pointer** into a queue, **request/response** | Counter advances; each number gets one response when served |
| Printer | **Shared resource, job queue, contention, failure handling** | One printer, multiple jobs. Jobs wait their turn. Occasional jam shows error handling and retry |
| Fish tank panel | **Monitoring, health checks, alerts** | Green/yellow/red indicators for temp, filter, and water level. Neglect shows a warning |
| Reception desk | **Single point of entry (gateway), input validation** | Form rejects missing fields politely |
| Door to offices | **Access control, gating** | Locked until the player's number is called |

**Nerd Notes (MAY):** optional, tiny pixel-art cards the player can pick up (for example from the coffee table) with one-sentence real-world explanations ("A queue serves things in the order they arrived."). Never required for progress.

---

## 9. Audio

All audio is **optional-to-ship but required in the spec**; use placeholder or royalty-free assets and note the source in `LOBBY_NOTES.md`.

- **Music:** soft, looping lo-fi / light elevator-style track. Low volume, easily ducked.
- **Ambience:** faint HVAC hum, distant keyboard clicks, muffled phone ring.
- **Fish tank:** gentle bubbling loop, louder when the player is near.
- **Printer:** idle hum, printing "brrr-chunk" loop, jam "clunk-beep".
- **Chairs:** soft sit/stand sound.
- **UI:** paper-flip sound for forms, pen scratch while typing, chime when called.
- Provide master/music/sfx volume controls and a mute toggle.
- Distance-based volume falloff for the tank and printer is a **SHOULD**.

---

## 10. Technical Requirements

- **Player controls:** 4- or 8-direction movement, one interact button, one cancel/back button. Support keyboard and gamepad. Touch is a MAY.
- **Interaction system:** objects expose an `interact()` and a prompt (a small floating icon or highlight when in range).
- **Camera:** fixed, or follows the player within the room with clamped bounds.
- **Depth sorting:** sort sprites by their bottom edge (Y) so the player passes behind and in front of furniture correctly. Chairs, printer, and desk all need correct sorting.
- **Collision:** simple rectangles per furniture piece. Chairs have a "sit" trigger zone in front.
- **Data-driven setup:** define objects, positions, NPCs, and timings in a config (JSON, YAML, or the engine's resource format).
- **Save data:** store the intake form results and tutorial completion flag.
- **Performance:** target 60 FPS on modest hardware. Animations are frame-based, no heavy shaders required.
- **Accessibility:** colorblind-safe status lights (use shape or icon plus color: check, dash, cross); adjustable text size; do not rely on audio alone for the "called" event.

Suggested folder layout (adapt to the project):
```
/assets/lobby/
  sprites/
    printer_idle.png  printer_printing.png  printer_jam.png
    fishtank_sheet.png  fish_*.png  bubbles.png
    chair_row_*.png
    npc_*.png
    decor_*.png
  audio/
  tiles/
/data/lobby.json
/scenes/Lobby.*
/scripts/lobby/ (queue, printer, intake, seats, npc)
LOBBY_NOTES.md
```

---

## 11. Suggested Build Order

1. **Blockout:** colored rectangles for the room, walls, door, desk, chairs, tank, printer. Player can walk and collide.
2. **Seats and queue logic:** sit/stand, ticket machine, now-serving counter, background NPCs taking numbers and leaving.
3. **Intake form:** reception interaction, form UI, saving data.
4. **Printer logic:** job queue, printing state machine (`idle -> queued -> printing -> done`, plus `jam`), badge output.
5. **Final pixel art pass:** replace blockout with real sprites following §2.
6. **Animations:** fish, bubbles, plants, printer, NPC idles.
7. **Dialogue and small details:** lines from §7, decor, signs.
8. **Audio.**
9. **Polish:** shadows, lighting tint, screen transitions, fast-forward option, accessibility.
10. **Test** against §12.

---

## 12. Acceptance Checklist

The lobby is done when **all** of these are true:

- [ ] Scene renders in consistent pixel-art style with nearest-neighbor scaling, no blur or sub-pixel jitter
- [ ] **Airport-style waiting chairs** present: linked rows, chrome armrests, player can sit and stand
- [ ] **Fish tank** present with swimming fish, bubbles, and swaying plants animating continuously
- [ ] **Large office printer** present, visibly bigger than other props, with idle, printing, and jam states
- [ ] Player can fill out the intake form and the data is saved
- [ ] Player can print a badge/packet at the printer as part of the flow
- [ ] Player takes a ticket, waits in a seat, and is called when the number comes up
- [ ] At least 3 background NPCs share the same queue and seats
- [ ] Door to the next area is locked until the player is called
- [ ] Every interactive object shows a clear prompt when in range
- [ ] Depth sorting is correct (no sprites popping in front or behind wrongly)
- [ ] Audio loops and volume controls work
- [ ] No fail states, no punishing timers
- [ ] All tunable values live in a config file
- [ ] `LOBBY_NOTES.md` lists assumptions, placeholder assets, and anything left unfinished

---

## 13. Out of Scope for This Task

- Later floors and their activities
- Combat, scoring, or grading systems
- Multiplayer
- Voice acting
- Localization (but keep strings in one file so it is easy later)

---

## 14. When in Doubt

Choose **cute over realistic**, **readable over detailed**, **calm over busy**, and **working over perfect**. Ship a charming, walkable lobby first and polish it second.
