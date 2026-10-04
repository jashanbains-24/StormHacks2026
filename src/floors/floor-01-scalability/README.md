# Floor 01: Scalability

Owner scope: everything in this folder.

Canonical design: Client → Load Balancer → 3 Servers.

## Floor flow

- Rhea onboards the player as an intern and unlocks the assigned workstation.
- Her dialogue dismisses when the player leaves conversational range.
- Guidance arrows lead from Rhea to the workstation, back to the result
  debrief, and finally to the elevator.
- Repeated conversations reveal progressively more specific design hints.
- Every build topology has a dedicated teaching debrief; unsuccessful or
  fragile designs unlock the workstation for another attempt.
- Unresolved incidents activate perimeter alarms, red pulses, subtle camera
  shake, and panic routes for roaming NPCs.
- Solved incidents return roaming NPCs and wall lights to normal.
- Reduced-motion mode keeps emergency indicators static.

Preview this floor at `/?floor=f01`. Add `&state=down` or `&state=fixed` to
compare emergency and resolved presentation.

Uses the shared Pixel Agents office pack documented in the repository credits.
No floor-specific assets or borrowed code are currently included.
