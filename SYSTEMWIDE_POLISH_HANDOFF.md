# Systemwide polish handoff

Work continues on `fixes`, one verified milestone at a time. Pause after each
milestone so the user can test it. Keep Floor 1's challenge, office, alarm
animations, camera shake, and running staff intact.

## Completed milestones

- Integrated main's BreakPoint title screen and background music; corrected
  muted-start playback.
- Removed the duplicate upper-right Director welcome, outer status border,
  and motion button; changed the exterior to dark blue-gray.
- Stopped the Director welcome from replaying after closing onboarding.
- Restored animation by ignoring the obsolete saved motion-toggle preference.
- Shared dialogue advances with E and closes immediately on player movement.
- Enter closes the final onboarding information page.
- Shared modal lifecycle keeps build-console close controls above the HUD,
  including Floor 2's individual puzzle screens.
- Elevator opens a separate screen with floor buttons, numeric keypad,
  keyboard/numpad entry, Enter/GO travel, Backspace, and Esc/X closing.
- The objective banner opens a cumulative checklist. Stable tasks appear from
  gameplay milestones, check off automatically, and remain available across
  floors. Close with the banner, X, or Esc; longer lists have previous/next pages.
- Floor 2 shares Floor 1's emergency lighting, sirens, shaking, and panicked
  ambient staff, then returns to calm when the incident resolves.

## Elevator and progression

The registry supplies the available floors. `src/sim/floorAccess.ts` defines
access rules, `src/state/progression.ts` saves completion and handoff state,
`src/data/elevator.ts` owns copy, and `src/ui/ElevatorPanel.ts` renders selection.
The shared FloorScene validates access again before travelling.

Floor 2 requires a canonical Floor 1 result and Rhea's debrief. Partial results
stay locked. New canonical results save `floor1.handoff=pending`; Rhea confirms
the handoff only after the final debrief page is acknowledged with Done/E.
Walking away, opening the checklist, or closing X/Esc cancels the conversation
without completing the briefing or handoff. Refreshing while
pending restores Rhea's debrief, including its guidance arrow. A finished
canonical handoff keeps Floor 2 unlocked after refresh, as requested. Later
partial retries preserve that earlier canonical completion. Legacy saved
canonical completions remain valid; legacy partial completions no longer unlock
Floor 2. Floor 2's incident still resets on refresh, per its original handoff.

Browser checks used temporary progression fixtures and restored the original
player save afterward. Verified keyboard/numpad and mouse selection, locks,
travel to Floors 0/1/2, modal closing, pending-debrief recovery, and saved unlock.
The generic regression suite now contains 109 passing tests. Type-check,
production build, and floor boundary validation pass. Changed files pass
Prettier; the full check still reports the five existing formatting warnings in
AGENTS.md, floorC_changesv2.md, LOBBY_SPEC.md, PARALLEL_FLOOR_ARCHITECTURE.md, and
Floor 2's definition/incidentFlow.ts. There is no dedicated lint script;
TypeScript and the floor validator provide the current diagnostics.

## Fresh starts and saved games

The title screen used to mix a new lobby with saved results, which made fresh
starts look pre-completed. Enter, the play dot, and the New Game text now reset
progression and build drafts. A separate Continue Saved Game button appears when
results exist and preserves the requested canonical unlock across refresh.
Continued lobbies show their completed objective; restored Floor 1 handoffs use
matching quest state and elevator guidance. Floor 1's puzzle and effects remain
unchanged. Legacy Floor 1 saves imply prior orientation when migrated.

Upward travel to Floor 1 requires the completed preliminary form; Floor 2 also
requires the canonical stress test and Rhea's finished debrief. Returning to a
lower floor remains available. The selector and runtime both validate the same
rules. Regression tests cover fresh/continued starts, each progression gate,
restored quest guidance, and cancelled conversations.

## Checklist

Each floor owns task copy and namespaced IDs in `definition/tasks.ts`. The
additive `FloorContext.hud.trackTask(task, completed?)` method reports structured
updates through `ui:task`; it does not infer completion from objective text.
`TaskChecklistStore` retains discovered tasks for the current game, and the shared
`TaskChecklist` renders the banner, completion count, and paged panel. Travel
tasks check off on actual floor arrival. Ordinary achievements stay complete on
retries; Rhea's repeatable review reopens when a new attempt needs a debrief.

Onboarding uses Maya's interaction and the completed form event. Floor 1 uses
its existing briefing, workstation, evaluation, and debrief transitions.
Floor 2 derives discovered/completed assignments from its incident step, ending
with Dana's wrap-up. Saved completion is reflected when its floor is visited;
the checklist itself starts fresh with a new game, so Floor 2's refreshed
incident has fresh tasks. The UI hides/closes the panel for build/elevator
modals and consumes world E while the panel is open. Floor 1's puzzle and
emergency presentation are unchanged.

Verified the live banner, X/Esc closing, onboarding updates, cross-floor history,
partial-result checklist, page navigation, and Dana's successful choice adding
Sam's task. Browser tests used temporary fixtures and restored player progression.
The generic feature tests also cover all storage task stages and repeat reviews.

## Shared emergency atmosphere

The public UI kit now owns `createEmergencyEffects`, with focused lighting,
staff, and effect-lifetime helpers. Floor 1 uses the same room colors, eight
sirens, pulse timings, shake strength, and panic routes as before. Its challenge,
office layout, and incident rules are unchanged.

Floor 2 supplies three ambient staff routes through its clear aisles. Dana,
Sam, and Priya remain stationary. Its existing equipment effects and puzzles
remain intact. Critical, inconsistent, and warming states keep the emergency
atmosphere. A successful one-minute TTL switches to green lights and calm staff;
Dana's final acknowledgement completes the existing wrap-up. Standby before
Floor 1 completion stays quiet. Preview overrides and reduced-motion behavior
are supported. Camera shake pauses while puzzle/elevator modals are open.

Mode changes and scene shutdown clean up timers, tweens, overlays, and listeners
without destroying the staff. The generic feature tests cover state mapping,
mode transitions, cleanup, multiple modals, and reduced motion.

Live checks used the floor harness and temporary fixtures to open NPC interactions,
then mouse input to complete Dana's cache choice, Sam's shared-cache puzzle,
Priya's TTL puzzle, and Dana's wrap-up. Verified red-to-green transition, calm
movement, stopped shaking, refresh resetting Floor 2's incident, quiet standby,
and Floor 1's original panicked staff and sirens. Player saves were restored
afterward. Browser console had no errors.

The later UI pass simplifies panic staff on both floors: normal walking sprites
with overhead warning markers, without added arms, hands, or body wobble.
The existing running speed and route rules remain intact. A shared marker follows
each NPC and cleans up when the emergency resolves or the scene shuts down.
The generic effects suite checks marker tracking, speed, and cleanup; live floor
previews verify the simpler presentation on Floors 1 and 2.

### Shutdown regression fix

Returning from a canonical Floor 1 stress test restarts the office. Phaser's
camera plugin removes `cameras.main` before floor-owned shutdown listeners run.
The shared effects originally attempted to reset shake through that missing
camera, interrupting the scene queue and leaving the last console image on screen.
Shake cleanup now tolerates the camera being absent. The regression test models
plugin teardown before both emergency and resolved effect cleanup and confirms
later shutdown listeners still run. Live verification reproduced the exception
before the fix, then completed the real stress test, returned to the office,
acknowledged Rhea's debrief, and travelled onward without an exception.

## Nearby NPC names

Maya, Rhea, and the storage team now use the same public UI-kit helper for name
visibility: labels appear strictly within 140 world pixels of their NPC and hide
on departure. Initial visibility is applied immediately; floor-owned updaters
keep it current. Existing label copy, placement, styling, and quest guidance stay
intact. The generic feature test covers approach, departure, diagonal distance,
the exact boundary, and destroyed labels. Live previews verify Maya and Rhea
near/far and the storage team's existing behavior. All 110 tests, type-check,
production build, and floor validation pass. Changed files pass formatting;
the full formatting check retains its five previously documented warnings.

## Floor 1 inline glossary dialogue

Rhea's briefing, hints, and outcome feedback now link jargon in the sentences
with the same `[[f01.term]]` markup used by Floor 2. The shared `SpeechBubble`
rich renderer provides dotted underlines, info icons, hover cards, click-to-pin,
and automatically sized bubbles; the old separate glossary chips are removed
from Floor 1's content. Plain dialogue pages retain the shared plain rendering.
No new UI implementation or changes to the challenge, quest rules, or dialogue
navigation were needed. All nine Floor 1 terms remain reachable, with a generic
content test checking every link across all outcome paths.

Live checks covered all 25 dialogue page layouts, mouse Next/Done, the game's
E interaction path through temporary key fixtures, hover release, pinned cards,
and cleanup on page changes and movement. Player saves were restored afterward.
All 111 tests, type-check, production build, and floor validation pass. Changed
files pass formatting; the full check retains the five existing warnings.

## Shared persistent glossary

The bottom-left glossary is now a shared scene above the world HUD, build
consoles, elevator, and storage puzzles. All floors register their glossary data
in a small state store; the existing inline term-card API records opened terms
there. Terms retain their discovery order across floor travel, with floor labels,
definitions, analogies, and real-world examples. New Game clears learned history;
this history is held for the current game session, not persisted across refreshes.
The former Floor 2-only glossary implementation has been removed.

The panel measures wrapped term blocks and provides Previous/Next pages so long
lists cannot cover the footer. X, Escape, or an outside click closes it. Opening
it pauses active background scenes; closing resumes only those scenes, preserving
the already-paused office behind a build console. Build palette instructions
move slightly upward to reserve room for the persistent button.

Live checks covered lobby and Floor 1 console visibility, native inline term
discovery, cross-floor history, both Floor 2 puzzles, X/Escape, and navigation.
Sam's puzzle remained interactive after closing the glossary and completed
normally. All 23 registered terms fit at the normal font size across seven pages.
Player progression was restored after fixtures; the browser console had no errors.
The generic state/overlay tests cover discovery, reset, subscriptions, scene
pausing, layering, and shutdown. All 115 tests, type-check, production build,
and floor validation pass. Changed files pass formatting; the full check retains
the five existing warnings.

## Remaining sequence

The user added another UI pass, still one verified milestone at a time:

1. Simplify Maya's lobby label and all her dialogue headings to "Maya" (done).
2. Remove the panic staff's flailing arms on both incident floors; keep warning
   markers and the current running speed (done).
3. Share Floor 2's nearby-only NPC name labels with Maya and Rhea (done).
4. Give Floor 1 Floor 2's rich dialogue bubbles and inline hover/click term cards,
   replacing the glossary chips while preserving E and Next/Done (done).
5. Share a persistent bottom-left glossary across floors and puzzle screens,
   retaining opened terms while travelling and handling long lists (done).
6. Run the complete game flow, check for the teammate's newer main changes,
   integrate them as needed, and prepare the PR.
