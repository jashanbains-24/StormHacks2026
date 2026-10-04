# Floor 00 Handoff

## Purpose

This document records the final floor00 tutorial/lobby behavior and appearance
after the lobby pass. It is intended to help a future agent combine floors 0,
1, and 2 without reintroducing the old floor00 flow or creating conflicts with
the shared Phaser/runtime systems.

The “before this pass” section is a historical summary, not a guaranteed
byte-for-byte description of every future checkout. Some details may be
inconsistent with the floor00 architecture a future agent sees in its own
working tree. When that happens, treat the future agent's checked-out
floor00 implementation as the authoritative original setup, and use this
document only to preserve the intended outcomes and integration constraints.
The updated floor00 structure described here is context for synthesizing the
three floors, not a checklist to recreate or act out. Do not rebuild these
floor00 changes.

## Floor00 before this pass

Floor00 was a compact office/tutorial room using the shared office layout. Its
main tutorial flow was centered on a large, labeled **BUILD CONSOLE** panel:

- The player was directed toward the build console.
- The build-console interaction opened the onboarding form.
- Maya's dialogue described the build console as the onboarding destination.
- The lobby had a desk, Maya, sofas/chairs, plants, bookshelves, a coffee
  table, and a small coffee prop.
- The fish tank and printer were represented by simple labeled placeholder
  panels rather than visual fixtures.
- There was no dedicated airport-style waiting-seat system or visible queue.
- There were no seated waiting NPCs.
- The tutorial form displayed the circle-counting question without a visual
  group of circles.
- The form displayed an instruction to press Enter, but submission depended on
  the mouse button.
- Completion dialogue referred to Problem 1 waiting upstairs.

## Floor00 now

### Player flow

1. The opening objective tells the player: **“Go to the front desk.”**
2. The player talks to Maya at the reception desk.
3. Maya tells the player to use the waiting area and take a seat.
4. After Maya has been spoken to, any available interactive waiting row can
   open the existing onboarding form.
5. The form accepts keyboard typing, Backspace editing, mouse buttons, and
   Enter-key submission.
6. The form includes the player's name, confirmation, and three preliminary
   questions. The circle question has a visible set of seven circles: four
   red and three mixed colors.
7. After completion, Maya's completion speech says:
   **“Well done, [name]! Head upstairs to continue with onboarding.”**

The form remains the existing tutorial/build activity. The lobby change only
changes how the player reaches it; the tutorial evaluator and progression
behavior remain intact.

### Lobby appearance

The floor uses the same pixel-art style and shared office assets as the other
floors, with additional hand-drawn Phaser graphics for the lobby-specific
fixtures:

- Maya remains behind the reception desk on the left side of the room.
- The printer is a smaller visual printer positioned behind/right of Maya's
  desk. It has a screen, controls, paper feeder, output tray, paper, status
  lights, and a shadow.
- The fish tank is a smaller visual aquarium with water, plants, gravel, fish,
  bubbles, a cabinet, and status lights.
- The old reception sign, fish-tank label, printer label, ticket machine, and
  ticket label are removed.
- The old large BUILD CONSOLE panel and its interaction are removed.
- The center coffee table and the small lower-right coffee prop are removed.
- Existing office-style decorative props were added around the room: clock,
  framed artwork, cactus, recycling bin, plants, and bookshelves.

### Waiting seats and NPCs

- Two linked airport-style waiting rows sit close to Maya's desk. Each row
  contains four seats and is visually built with dark cushions, highlights,
  chrome armrests, a shared base, and shadows.
- The bottom wall has a linked row of ten seats.
- The player can interact with the waiting rows, including the bottom row,
  after talking to Maya. Interacting opens the same onboarding form.
- Three NPCs occupy seats in the upper waiting rows.
- Four NPCs occupy seats in the bottom row.
- All seated NPCs:
  - Use existing ambient character sprites.
  - Use up-facing idle animations so they face the seats.
  - Render in front of the seat graphics.
  - Have static physics bodies and collide with the player.
  - Have no labels and no interaction handlers.
- Occupied seats are visually distinguished from free seats.

## Important files

### Floor00-owned files

- `src/floors/floor-00-tutorial/view/layout.ts`
  - Lobby props, hand-drawn fish tank and printer, waiting-seat rows,
    seated NPCs, collisions, and waiting-seat interactions.
- `src/floors/floor-00-tutorial/view/buildUI.ts`
  - Intentionally contains no floor00 build-console visual or interactable;
    the onboarding form is reached through the waiting seats.
- `src/floors/floor-00-tutorial/definition/content.ts`
  - Maya dialogue, objectives, and completion wording.
- `src/floors/floor-00-tutorial/definition/incident.ts`
  - Tutorial build mode and connector/destination availability.
- `src/floors/floor-00-tutorial/index.ts`
  - Floor module registration.
- `src/floors/floor-00-tutorial/README.md`
  - Floor-specific overview.
- `test/floors/tutorial.test.ts`
  - Regression coverage for tutorial content and evaluator behavior.

### Shared files touched for floor00 support

- `src/scenes/UIScene.ts`
  - Uses the initial `interact` objective on floor 0, switches to the waiting
    area objective after Maya dialogue, and renders the updated completion line.
- `src/scenes/BuildScene.ts`
  - Owns the existing onboarding form, visual circle prompt, and Phaser
    `keydown-ENTER` submission handling.
- `src/scenes/PreloadScene.ts`
  - Registers up-facing idle animations for ambient character sprites.
- `src/core/contracts/floor.ts`
  - Shared floor contract definitions used by all floor modules.
- `src/core/runtime/floorRegistry.ts`
  - Shared floor discovery/validation behavior.
- `src/data/build.ts`, `src/sim/types.ts`, `src/state/buildDesign.ts`,
  `src/ui/BuildNode.ts`, and `src/ui/Palette.ts`
  - Shared tutorial/build-mode support used by the floor00 onboarding activity.
- `src/sim/tutorialEvaluator.ts`
  - Evaluates whether every tutorial destination is reachable from the source.

Do not copy floor00's lobby graphics into floor01 or floor02. Reuse the shared
office assets and floor contracts instead. The floor00-specific hand-drawn
graphics currently live in its layout module so later floor work can remain
isolated.

## Integration guidance for floors 0, 1, and 2

- Preserve the floor module boundary: floor-specific content and layout belong
  under `src/floors/floor-00-tutorial`, while shared behavior belongs in the
  existing runtime/scenes/contracts.
- Do not restore a generic floor00 `createDefaultOfficeLayout` call without
  first checking for duplicate props, NPCs, or collisions. Floor00 intentionally
  supplies its own lobby prop list.
- Do not add another floor00 build-console interactable. The onboarding form is
  opened by the waiting-seat interactables after Maya has been met.
- Floor01 and floor02 should keep their own layouts and specialist flows.
  `src/floors/floor-01-scalability/view/layout.ts` was used only as a visual
  reference for existing office props and was not changed by the lobby work.
- Shared scene changes must remain floor-aware. In particular, floor 0 uses
  `content.tutorial.interact` before Maya and `content.tutorial.build` after
  Maya; other floors continue using their own tutorial content.
- Keep seated NPCs static, unlabeled, up-facing, rendered above the seat
  graphics, and collidable if the waiting-room presentation is extended.
- Preserve the existing floor progression and elevator behavior. Completing
  the form marks floor 0 complete; the elevator remains the route onward.

## Validation baseline

The final floor00 changes were checked with:

- `npm test -- --run test/floors/tutorial.test.ts`
- `npm run typecheck`
- `npx prettier --check` on changed files
- `npm run build`
