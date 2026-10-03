import { describe, expect, it } from "vitest";

import { SIM_CONFIG } from "../config/simConfig";
import { makeDesign } from "./fixtures";
import {
  createSimulation,
  getScheduleDuration,
  runSimulation,
  tickSimulation,
} from "./simulation";

describe("simulation", () => {
  const fullRunSeconds =
    getScheduleDuration() + SIM_CONFIG.requiredGreenSeconds + 1;

  it("ramps traffic according to the stress schedule", () => {
    const design = makeDesign(3, true);
    const baseline = tickSimulation(createSimulation(design), design, 2);
    const ramp = tickSimulation(baseline, design, 3);

    expect(baseline.phaseId).toBe("baseline");
    expect(baseline.incomingRps).toBe(20);
    expect(ramp.phaseId).toBe("ramp");
    expect(ramp.incomingRps).toBeGreaterThan(20);
    expect(ramp.incomingRps).toBeLessThan(70);
  });

  it("keeps the canonical three-server design stable after one failure", () => {
    const state = runSimulation(makeDesign(3, true), fullRunSeconds);

    expect(state.outcome).toBe("canonical");
    expect(state.injectedFailureOccurred).toBe(true);
    expect(
      state.servers.filter((server) => server.injectedFailure),
    ).toHaveLength(1);
    expect(
      state.servers.filter((server) => server.health !== "crashed"),
    ).toHaveLength(2);
    expect(state.errorRate).toBeLessThan(SIM_CONFIG.stableErrorRate);
  });

  it("flags four servers as a stable but over-provisioned partial result", () => {
    const state = runSimulation(makeDesign(4, true), fullRunSeconds);
    expect(state.outcome).toBe("partial");
    expect(state.errorRate).toBeLessThan(SIM_CONFIG.stableErrorRate);
  });

  it("shows why two servers have no failure headroom", () => {
    const state = runSimulation(makeDesign(2, true), fullRunSeconds);
    expect(state.outcome).toBe("partial");
    expect(
      state.servers.filter((server) => server.health === "crashed").length,
    ).toBeGreaterThanOrEqual(2);
    expect(state.errorRate).toBeGreaterThan(SIM_CONFIG.stableErrorRate);
  });

  it("overloads direct traffic onto only the first connected server", () => {
    const design = makeDesign(3, false);
    const state = runSimulation(design, fullRunSeconds);

    expect(state.servers).toHaveLength(1);
    expect(state.outcome).toBe("failed");
    expect(state.errorRate).toBeGreaterThan(0.01);
  });

  it("does not mutate the prior snapshot while ticking", () => {
    const design = makeDesign(3, true);
    const initial = createSimulation(design);
    const next = tickSimulation(initial, design, 1);

    expect(initial.elapsedSeconds).toBe(0);
    expect(initial.servers.every((server) => server.loadRps === 0)).toBe(true);
    expect(next.elapsedSeconds).toBe(1);
  });
});
