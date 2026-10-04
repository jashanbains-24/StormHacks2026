# Floor C (Floor 2): Data Storage / Caching: UI Brainstorm

> Status: **Brainstorm / needs your answers**. Sections marked ❓ are open questions.

## 1. Where we are now

- Pixel-art, top-down office. Grey floor, beige/tan outer wall, wooden desks, green chairs, bookshelves, plants, crimson couches.
- HUD: floor banner at top (dark navy), `SOUND ON` / `MOTION ON` toggles, elevator on the right, caption bar at top-left ("incident queue empty").
- Placeholder text: "COMING SOON / The database team is allegedly in a meeting."
- Problem: it reads as a generic office, so nothing says _"data storage / caching"_, and it probably looks the same as the other floors.

## 2. Design goal

Make Floor 2 feel like **a different building zone entirely**: a data center / data vault, where the _layout itself_ teaches caching (fast + small near you, slow + huge far away).

## 3. Core concept options (pick one or mix)

| Concept                           | Vibe                                                                                                                                | Why it fits                                       |
| --------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------- |
| **A. Data Center Hall**           | Dark, cold, glowing LEDs, server racks in aisles                                                                                    | Most literal; instantly reads "storage"           |
| **B. The Archive / Vault**        | Filing cabinets, tape library, frosted cold-storage room                                                                            | Great metaphor for cache tiers (hot → cold)       |
| **C. Warehouse / Logistics**      | Conveyor belts, crates, forklifts, loading dock                                                                                     | Data "moving" is visual and animatable            |
| **D. Hybrid (my recommendation)** | Data center hall with a cache-tier gradient: a bright "hot" zone near the elevator fading to a frosty "cold archive" at the far end | Layout = teaching tool; lots of animatable things |

## 4. Color / floor direction (very different from now)

**Floor:** replace flat grey with **raised-floor data-center tiles**: dark slate/charcoal squares with perforated vent dots and visible grid lines.

**Proposed palette (draft):**

| Role                               | Color idea                                                             |
| ---------------------------------- | ---------------------------------------------------------------------- |
| Floor base                         | Deep navy-black `#0F1724` with slightly lighter tile seams `#1B2638`   |
| Walls                              | Brushed steel blue-grey `#2B3A4F` (replace the beige)                  |
| "Hot" aisle strip (cache hit zone) | Amber/orange glow `#FF9F1C`                                            |
| "Cold" aisle strip (archive)       | Icy cyan `#4CC9F0`                                                     |
| LED accents                        | Green `#39FF88` (healthy), red `#FF4D5E` (miss/error), amber (warning) |
| Frost overlay (cold storage)       | Pale blue-white `#CFEFFF`                                              |

Lighting: dim room, **glow halos** around racks and LEDs, maybe a slow vignette. Keep text/HUD contrast readable.

## 5. Zones (layout idea, left to right or near to far)

1. **L1 / L2 Cache Bay** (near elevator): small, bright, a few compact glowing units. "Fast and tiny."
2. **RAM / In-memory (Redis-style) Row**: tall vertical modules, rapid blinking.
3. **SSD / Main Database Hall**: long server rack aisles, cylinder DB icons on racks.
4. **HDD Storage Wall**: bulky, slower-looking, spinning platters visible.
5. **Cold Storage / Tape Archive** (far corner): frosted, dimmer, robotic tape arm, big shelves.

Optional gameplay-ish details: a **"CACHE HIT / MISS" board**, a **TTL countdown clock**, and an **eviction chute** (LRU bin).

## 6. Asset wishlist

**Structural / environment**

- Raised floor tiles (some with lifted panel + cables underneath)
- Server racks (several heights/colors, blinking LED variants)
- Overhead cable trays and hanging cable bundles
- Cooling units (CRAC) with little frost/steam particles
- Cold-aisle containment glass doors
- Fire suppression tanks, emergency stop button, hazard stripes on floor
- UPS/battery bank, power distribution unit
- Patch panels with colorful cables

**Storage-themed props**

- Cylinder database icons (the classic DB symbol) as wall art/standing signs
- Hard drive platters / spinning disks, SSD "chips" on a display table
- Tape library with a robotic arm that slides
- Key-value locker wall (numbered lockers = hash table)
- Pneumatic tube station (data capsules zipping between zones)
- Conveyor belt carrying labeled crates/data blocks
- Small forklift-bot / delivery bot
- "Hot / Warm / Cold" tier signage
- Whiteboard with a cache diagram (L1 → L2 → RAM → Disk)

**Characters**

- Sysadmin in hi-vis vest with headset
- Sleeping DBA at a desk (callback to "allegedly in a meeting")
- Maintenance bot roaming the aisles

**Furniture to keep (reskinned)**

- One small crash-cart desk with monitors instead of wooden desks
- NOC-style wall of monitors showing graphs
- Swap couches/plants for a break-corner with a vending machine and coffee

## 7. Animation & sound ideas

(Respecting the existing `MOTION` / `SOUND` toggles)

- LEDs blinking at different rates per tier (fast = cache, slow = archive)
- Data packets (little glowing squares) traveling along cables/belts
- Cooling fan spin, frost shimmer in cold zone
- Cache hit: green flash + "HIT" pop; cache miss: red flash + longer travel path
- Sound: low server hum, fan whoosh, soft beeps, tape-arm clunk

## 8. Text & copy

- Banner: "Floor 2: Data Storage / Caching" (keep "Coming Soon"?)
- Caption bar: replace "incident queue empty" with something themed ("cache warm," "0 evictions," etc.)
- Humor stays? e.g., "The database team is allegedly in a meeting" → "Cache miss: database team not found. Fetching from slower source…"

---

## ❓ Questions for you

### The project / game itself

1. What is this overall? (A game, a portfolio, a hackathon project for StormHacks, an educational tool?) Is it tied to one of the sponsor prizes (e.g. Tiger Data, Snowflake)?
2. What does "floorC" mean relative to "Floor 2"? Is it just your internal name, and are there floors A and B (and D…) already?
3. Who's the audience? (Judges, students, devs?) Should the floor _teach_ caching or mostly be funny/atmospheric?

### Tech & constraints

4. What is it built with? (Plain HTML/CSS/JS, Canvas, Phaser, React, something else?) Is the room drawn from sprite images or CSS/DOM elements?
5. Do you have an existing tileset/spritesheet style (resolution, pixel size, palette limits) I must match, or can I propose new assets? Are you drawing assets yourself, using free packs, or generating them?
6. Is the map layout (grid, collision, walkable area) already coded, or should this brainstorm also include layout coordinates?

### Consistency with other floors

7. Should Floor 2 share the same HUD (navy banner, SOUND/MOTION buttons, elevator on right, caption bar)? Or should the HUD also be restyled?
8. Does each floor have its own theme? What are the other floors like (so I make this one clearly distinct)?
9. Do the characters (the three people in the room) need to stay, or can they be changed/reskinned?

### Gameplay & interaction

10. Is the player a character that walks around? What can they interact with (click objects, talk to NPCs, trigger "incidents")?
11. The caption says "incident queue empty". Is there an incident system on each floor? What would a Floor 2 incident be (cache stampede, stale data, eviction storm, DB down)?
12. Do you want the "coming soon" state kept for now, or is this the real final version of the floor?

### Style preferences

13. Which concept do you prefer: A (data center), B (vault), C (warehouse), or D (hybrid)?
14. Mood: dark and moody (cyberpunk glow), clean/clinical and bright, or playful/cartoony? Any reference games or images you love?
15. Any colors you _must_ avoid or include (brand colors, accessibility/color-blind needs)?
16. How much humor vs. realism?

### Scope

17. Rough deadline? (Hackathon weekend = keep it to essentials: floor + ~8 assets + a few animations.)
18. Priorities: if time is limited, which matters most: **floor/wall recolor**, **new props**, **animations**, or **sound**?

---

## Next steps (once you answer)

1. Lock the concept + palette.
2. Make a prioritized asset list (must-have / nice-to-have).
3. Sketch a room layout (zones + coordinates).
4. Plan the animations and sound cues.
