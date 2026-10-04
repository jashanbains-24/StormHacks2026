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

## Elevator and progression

The registry supplies the available floors. `src/sim/floorAccess.ts` defines
access rules, `src/state/progression.ts` saves completion and handoff state,
`src/data/elevator.ts` owns copy, and `src/ui/ElevatorPanel.ts` renders selection.
The shared FloorScene validates access again before travelling.

Floor 2 requires a canonical Floor 1 result and Rhea's debrief. Partial results
stay locked. New canonical results save `floor1.handoff=pending`; Rhea confirms
the handoff when her existing debrief dismissal callback runs. Refreshing while
pending restores Rhea's debrief, including its guidance arrow. A finished
canonical handoff keeps Floor 2 unlocked after refresh, as requested. Later
partial retries preserve that earlier canonical completion. Legacy saved
canonical completions remain valid; legacy partial completions no longer unlock
Floor 2. Floor 2's incident still resets on refresh, per its original handoff.

Browser checks used temporary progression fixtures and restored the original
player save afterward. Verified keyboard/numpad and mouse selection, locks,
travel to Floors 0/1/2, modal closing, pending-debrief recovery, and saved unlock.
The generic regression suite now contains 89 passing tests. Type-check,
production build, and floor boundary validation pass. Changed files pass
Prettier; the full check still reports the five existing formatting warnings in
AGENTS.md, floorC_changesv2.md, LOBBY_SPEC.md, PARALLEL_FLOOR_ARCHITECTURE.md, and
Floor 2's definition/incidentFlow.ts. There is no dedicated lint script;
TypeScript and the floor validator provide the current diagnostics.

## Remaining sequence

1. Replace the top-left objective banner with a clickable, closable cumulative
   task checklist. Add tasks when discovered and check them off from actual
   completion signals.
2. Give Floor 2 the same emergency mood as Floor 1 through reusable presentation
   helpers: flashing sirens, shake, and panicked staff. Preserve its equipment
   effects, and return to calm on resolution.
3. Run the complete game flow, check for the teammate's newer main changes,
   integrate them as needed, and prepare the PR.
