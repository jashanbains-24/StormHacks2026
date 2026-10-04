# Floor 2 UI Changes: "The Stale Price Incident"

Do these **in order** (info indicators are Step 7, but you can add the ⓘ component earlier and fill in terms as you build each NPC). Each step builds on the previous one, so you can test as you go.

**What the screenshot shows now:** the room is already in the *resolved* state (`DB LOAD NORMAL, incident resolved`), the three NPCs are huddled together by the main DB array, and there are two extra sprites that look like leftovers (one on the conveyor belt, one near the elevator).

**Room landmarks used below:**
- **DB array**: blue-outlined storage array, top-left
- **Monitor wall**: four bar-chart screens across the top
- **Top server row** (4 servers under the cable tray) and **bottom server row** (4 servers)
- **Orange cache pair**: hanging off the cable tray (= *local caches*)
- **Green cache pair**: bottom-right inside the green outline (= *shared cache*)
- **Conveyor belt** (green arrows, middle) and the two cabinets bottom-left

---

## Step 1: Add a real "incident" start state

The floor must **start broken** and visibly get fixed. Define three visual states and switch between them with one state variable (`incident` → `partial` → `resolved`).

| Element | Start (incident) | After Sam (partial) | Resolved (current look) |
|---|---|---|---|
| Caption bar | `DB LOAD CRITICAL: product page timing out` | `CACHE ONLINE: checking prices…` | `DB LOAD NORMAL: incident resolved` |
| DB array lights | Fast blinking, red/amber | Medium blink | Slow, calm green |
| Monitor wall bars | Tall, red/orange | Mixed | Short, green |
| Server rack LEDs | Many red | Mostly green, a couple amber | Mostly green |
| Conveyor arrows | Red/amber, dense, flowing **toward the DB** | Slowing | Green (current) |
| Cache units (orange + green) | Both pairs **dim / powered off** | Chosen pair glows, other stays dim | Green pair glowing |
| Cable tray packets | Heavy traffic into DB | Reduced | Light |

---

## Step 2: Split the team across different servers

Each NPC stands at their own spot so the player has to walk around the room.

| NPC | Start position | Why there |
|---|---|---|
| **Dana** (DBA) | In front of the **DB array** (top-left) | It's her system |
| **Sam** (backend dev) | Next to the **3rd server in the top row**, near the orange caches | Works on the app servers and caches |
| **Priya** (ops/product) | Next to the **2nd server in the bottom row**, near the monitor-facing side | Watches customer-facing behavior |

Cleanup in this step:
- Remove (or repurpose) the **duplicate Sam-looking sprite standing on the conveyor** and the **woman near the elevator**. If they're ambient NPCs, move them off the belt and make them non-interactive.
- Keep the player spawn at the bottom-left, as now.
- Leave collision space so the player can walk up to each NPC.

---

## Step 3: Guide the player (order and "busy" states)

The order is **Dana → Sam → Priya**.

1. **Beacon:** a small pulsing marker (e.g. `!` or a bouncing arrow) over whichever NPC is next. Hide it on the others.
2. **Name tags:** show the tag only when the player is near, to avoid clutter (they currently overlap in the huddle).
3. **Interaction prompt:** keep the `[E] Talk to ...` bar at the bottom.
4. **Busy NPCs:** if the player talks to an NPC out of order, show a one-liner instead of the puzzle:
   - Sam (before Dana): "Ask Dana what's actually going on first."
   - Priya (before Sam): "I'll weigh in once we know where the cache goes."
5. **Done NPCs:** swap the beacon for a small ✔ and give a short repeat line.

---

## Step 4: Dana, dialogue only (no puzzle)

Same dialogue-box style as Floor 1, **text and choices only**.

- The box shows Dana's portrait/name, her line, and 3 choice buttons.
- To help the player *see* the problem, the DB array flashes red when Dana says "same query thousands of times."
- **Choices:** buy a bigger database (wrong, explains why), add a cache (correct), block users (wrong, explains why).
- Correct answer → the **orange and green cache units get a "?" marker** (they're now relevant) and the beacon moves to Sam.

---

## Step 5: Sam, visual puzzle: "Where does the cache go?"

Opens a puzzle panel over the room (same panel style as Floor 1's puzzles).

**Layout (simple diagram with one empty slot):**

```
[Users] → [Load Balancer] → [Server A] ─┐
                          → [Server B] ─┤→ [ ? CACHE SLOT ] → [Database]
```

**Pieces the player drags into the slot (3 chips):**
1. 🟧 **Local cache** (one inside each server)
2. 🟩 **Shared cache** (one everyone uses)
3. 🌐 **Browser-only cache**

**Interaction:**
1. Player drops a chip into the slot.
2. Player presses **▶ Send 2 refreshes**.
3. A short animation plays and the result is shown with two little browser mock-ups:

| Choice | What the player sees | Verdict |
|---|---|---|
| Local cache | Browser 1 shows **$39**, Browser 2 shows **$49** with a red `MISMATCH` flash; the load balancer in the diagram glows red and a "see Floor 1" tag appears | ❌ Sam explains why, then the puzzle resets |
| Browser-only | Both browsers are fine, but a **DB load meter stays red** | ❌ Sam explains, resets |
| Shared cache | Both browsers show **$39**, DB meter drops to green | ✅ Solved |

**Room reaction:**
- Wrong (local): the two **orange** units flash out of sync and go dim again.
- Correct: the **green pair glows**, the orange pair stays off, state becomes `partial`, and the beacon moves to Priya.

---

## Step 6: Priya, visual puzzle: "How long should prices stay cached?"

**Layout: a timeline with a draggable timer.**

```
Time →  |------------------------------------------------|
        ^ price changed $49 → $39 (marker on the timeline)

TTL selector (snap handle):   1 sec   |   1 min   |   1 day
```

**Interaction:**
1. Player drags the **TTL handle** to one of three snap positions.
2. Player presses **▶ Run the sale**.
3. Two live meters animate for about 3 seconds:
   - **DB load** meter (should end green)
   - **"Customers seeing old price"** counter (should stay at 0)

| TTL | DB load | Old-price customers | Verdict |
|---|---|---|---|
| 1 second | 🔴 stays high | 0 | ❌ "The cache barely helps." |
| 1 minute | 🟢 low | 0–few | ✅ Solved |
| 1 day | 🟢 low | 🔴 climbing | ❌ "We changed the price an hour ago!" |

**Room reaction (correct):** monitor bars shrink, state becomes `resolved`, and the beacon moves back to Dana.

---

## Step 7: Info indicators for unfamiliar terms (learn as you go)

Any term a beginner might not know gets a small **ⓘ** indicator, so the player can learn without leaving the puzzle. This applies to **dialogue text, puzzle labels, chips, and meters**.

**Behavior:**
- The term gets a dotted underline plus a small **ⓘ** icon right after it.
- **Hover or click/focus** the term → a small tooltip card appears next to it (clicking pins it, `Esc` or clicking elsewhere closes it).
- The puzzle/dialogue **does not pause or advance** while a card is open, and opening one never counts as a wrong answer.
- Each card has: a **plain-English definition** (1 sentence), an **everyday analogy** (1 sentence), and an optional **"Real world:"** line naming actual tools.
- The first time a new term appears, its ⓘ gives a single subtle pulse (skipped when `MOTION OFF`). After the player opens it once, the pulse stops for that term.
- Keep cards short (max about 3 lines). No walls of text.
- Keep all card text in one data file (`term id → title, definition, analogy, realWorld`) so it's easy to edit and reuse on later floors.
- Optional: a **📖 Glossary** button in the corner listing every term the player has opened so far.

**Terms to cover:**

| Where it appears | Term | Definition (short) | Analogy |
|---|---|---|---|
| Dana | **Database** | The place that stores all the app's permanent data (products, prices, users). | A giant filing cabinet. |
| Dana | **Query** | A request asking the database for specific data. | Asking the librarian for one book. |
| Dana | **DB load** | How much work the database is doing at once. | How busy the librarian is. |
| Dana | **Cache** | A fast temporary copy of data kept close by so you don't ask the database every time. | Keeping your most-used notes on your desk instead of walking to the archive. |
| Sam | **App server** | The computer running your app's code that talks to users and the database. | A waiter between customers and the kitchen. |
| Sam | **Load balancer** | Spreads incoming users across several servers. (Link back to Floor 1.) | The host who seats guests at different tables. |
| Sam | **Local cache** | A separate cache stored inside each individual server. | Every waiter keeping their own personal notepad. |
| Sam | **Shared cache** | One cache that all servers read from and write to. | One whiteboard the whole staff looks at. |
| Sam | **Browser cache** | Data saved on the user's own device. | A sticky note the customer keeps at home. |
| Sam | **Mismatch / inconsistent data** | Different users seeing different answers for the same thing. | Two waiters quoting two different prices. |
| Sam | **Cache hit / miss** | Hit = answer found in the cache; miss = not found, so ask the database. | Finding the note on your desk vs. walking to the archive. |
| Priya | **TTL (time to live)** | How long a cached item is kept before it expires and must be refreshed. | The expiry date on milk. |
| Priya | **Stale data** | Out-of-date data still being shown. | Yesterday's menu still posted on the door. |
| Priya | **Freshness vs. speed** | Longer caching is faster but riskier for outdated info. | Checking a fridge less often saves time but risks spoiled food. |

Real-world lines to include: **Redis** and **Memcached** (shared caches), **NGINX / AWS ELB** (load balancers), and **PostgreSQL / MySQL** (databases).

**Placement notes:**
- **Dana:** ⓘ sits inside the dialogue text and on the choice buttons if they use jargon.
- **Sam's puzzle:** ⓘ on each chip (local / shared / browser-only), on the diagram labels (Load Balancer, Server, Database), and on the "MISMATCH" verdict.
- **Priya's puzzle:** ⓘ on "TTL," on both meters ("DB load," "Customers seeing old price"), and on "stale."
- **After a wrong answer:** if the explanation uses a term, highlight its ⓘ so the player can dig deeper.

---

## Step 8: Wrap-up and elevator

1. Dana gets a **final beacon** → short wrap-up dialogue (no puzzle): the incident is over.
2. Caption becomes `DB LOAD NORMAL: incident resolved`.
3. Elevator unlocks the same way as Floor 1 (glow, "door open" indicator, whatever Floor 1 does).
4. Optional: a quick celebratory flash across the monitor wall.

---

## Step 9: Consistency with Floor 1

- Reuse Floor 1's dialogue box, choice buttons, puzzle panel frame, and success/fail feedback style.
- Wrong answers **never lock the player out**: always a friendly 1–2 line explanation and a retry.
- Save `floor2.cacheChoice` (`"local"` or `"shared"`) so Floor 1's load balancer can optionally react to it.

---

## Step 10: Polish (last)

- **Sound:** soft alarm hum at the start that fades as the room recovers; a click on drag/drop; success chime. Everything respects `SOUND`.
- **Motion:** when `MOTION OFF`, skip blinking, flowing arrows, and flash animations. Show static states instead (e.g. red vs. green icons).
- **Accessibility:** ⓘ tooltips must be keyboard-focusable (`Tab` to the term, `Enter` to open). Also don't rely on color alone. Pair red/green with an icon (✔ / ✖) or label on meters and verdicts.

---

## Open questions

1. What kind of puzzle did Floor 1 use (drag-and-drop, click-to-connect, something else)? Should these match exactly?
2. Are the two extra sprites (on the conveyor and near the elevator) intentional ambient NPCs?
3. Should the puzzle open as a **modal over the room**, or inside the dialogue box like Floor 1?
4. Do you want a hint button on the puzzles?
