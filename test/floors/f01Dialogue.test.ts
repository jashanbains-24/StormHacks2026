import { describe, expect, it } from "vitest";

import {
  content,
  onboardingDialogue,
  outcomeDialogueFor,
  type F01BuildOutcomeId,
} from "../../src/floors/floor-01-scalability/definition/content";

describe("Floor 1 inline glossary dialogue", () => {
  it("keeps every term available through valid inline links across briefing, hints, and outcomes", () => {
    const outcomes: F01BuildOutcomeId[] = [
      "canonical",
      "over-provisioned",
      "under-redundant",
      "single-server-lb",
      "single-server-direct",
      "unbalanced-direct",
      "invalid",
    ];
    const lines = [
      ...onboardingDialogue,
      ...content.specialistHints,
      ...outcomes.flatMap(outcomeDialogueFor),
    ];
    const known = new Set(content.glossary.map(({ id }) => id));
    const reachable = new Set<string>();
    for (const line of lines) {
      expect(line.glossaryIds ?? [], line.id).toEqual([]);
      for (const match of line.text.matchAll(/\[\[([a-z0-9_.]+)\]\]/gi)) {
        expect(known.has(match[1]), `${line.id}: ${match[1]}`).toBe(true);
        reachable.add(match[1]);
      }
    }
    expect(reachable).toEqual(known);
  });
});
