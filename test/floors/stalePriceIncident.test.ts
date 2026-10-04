import { describe, expect, it } from "vitest";

import {
  applyIncidentChoice,
  beaconFor,
  captionForState,
  clearedSpeakers,
  startingState,
} from "../../src/floors/floor-02-storage/definition/incidentFlow";
import {
  teachingTermById,
  teachingTerms,
} from "../../src/floors/floor-02-storage/definition/terms";
import { stalePriceStatus } from "../../src/floors/floor-02-storage/definition/stalePriceDialogue";

describe("The Stale Price Incident", () => {
  it("advances through the three correct beginner decisions", () => {
    const afterDana = applyIncidentChoice(
      { step: "dana" },
      "dana",
      "f02_dana_add_cache",
    );
    const afterSam = applyIncidentChoice(
      afterDana.state,
      "sam",
      "f02_sam_shared_cache",
    );
    const afterPriya = applyIncidentChoice(
      afterSam.state,
      "priya",
      "f02_priya_one_minute",
    );

    expect(afterDana.state.step).toBe("sam");
    expect(afterSam.state).toEqual({
      step: "priya",
      cacheChoice: "shared",
    });
    expect(afterSam.visual).toBe("warming");
    expect(afterPriya.state.step).toBe("danaWrap");
    expect(afterPriya.visual).toBe("resolved");
  });

  it("stays quiet until Floor 1 is solved, then starts with Dana", () => {
    expect(startingState(false)).toEqual({ step: "standby" });
    expect(startingState(true)).toEqual({ step: "dana" });
    expect(captionForState({ step: "standby" })).toBe(stalePriceStatus.standby);
    expect(beaconFor("standby")).toBeUndefined();
    expect(clearedSpeakers("standby")).toEqual([]);
    expect(
      applyIncidentChoice({ step: "standby" }, "dana", "f02_dana_add_cache")
        .state.step,
    ).toBe("standby");
  });

  it("names the caption and the next person for each stage", () => {
    expect(captionForState({ step: "dana" })).toBe(stalePriceStatus.incident);
    expect(captionForState({ step: "sam" })).toBe(stalePriceStatus.incident);
    expect(captionForState({ step: "priya", cacheChoice: "shared" })).toBe(
      stalePriceStatus.partial,
    );
    expect(captionForState({ step: "danaWrap", cacheChoice: "shared" })).toBe(
      stalePriceStatus.resolved,
    );
    expect(beaconFor("dana")).toBe("dana");
    expect(beaconFor("sam")).toBe("sam");
    expect(beaconFor("priya")).toBe("priya");
    expect(beaconFor("danaWrap")).toBe("dana");
    expect(beaconFor("resolved")).toBeUndefined();
  });

  it("keeps a browser-only cache on Sam without locking the player out", () => {
    const result = applyIncidentChoice(
      { step: "sam", cacheChoice: "local" },
      "sam",
      "f02_sam_browser_cache",
    );

    expect(result.state).toEqual({ step: "sam", cacheChoice: "local" });
    expect(result.visual).toBe("critical");
    expect(result.dialogue).toEqual(["samBrowserFeedback"]);
  });

  it("stores the local-cache ripple and returns to Sam", () => {
    const result = applyIncidentChoice(
      { step: "sam" },
      "sam",
      "f02_sam_local_cache",
    );

    expect(result.state).toEqual({
      step: "sam",
      cacheChoice: "local",
    });
    expect(result.dialogue).toEqual([
      "priyaLocalMismatch",
      "samLocalExplanation",
    ]);
    expect(result.visual).toBe("localMismatch");
  });

  it("keeps the current decision open after a friendly wrong answer", () => {
    const result = applyIncidentChoice(
      { step: "priya", cacheChoice: "shared" },
      "priya",
      "f02_priya_one_day",
    );

    expect(result.state.step).toBe("priya");
    expect(result.dialogue).toEqual(["priyaOneDayFeedback"]);
  });

  it("gives every beginner term a short definition and analogy", () => {
    expect(teachingTerms.map((term) => term.id)).toEqual(
      expect.arrayContaining([
        "f02.database",
        "f02.query",
        "f02.db_load",
        "f02.cache",
        "f02.app_server",
        "f02.load_balancer",
        "f02.local_cache",
        "f02.shared_cache",
        "f02.browser_cache",
        "f02.mismatch",
        "f02.cache_hit",
        "f02.ttl",
        "f02.stale_data",
        "f02.freshness",
      ]),
    );
    expect(
      teachingTerms.every(
        (term) => term.definition.length > 0 && term.analogy.length > 0,
      ),
    ).toBe(true);
    expect(teachingTermById["f02.shared_cache"].realWorld).toMatch(/Redis/);
    expect(teachingTermById["f02.load_balancer"].realWorld).toMatch(/NGINX/);
    expect(teachingTermById["f02.database"].realWorld).toMatch(/PostgreSQL/);
  });
});
