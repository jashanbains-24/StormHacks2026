export interface StressPhase {
  id: "baseline" | "ramp" | "spike" | "growth" | "steady";
  durationSeconds: number;
  startRps: number;
  endRps: number;
  injectFailureAtSeconds?: number;
}

export interface SimulationConfig {
  serverCapacityRps: number;
  overloadToleranceSeconds: number;
  stableErrorRate: number;
  requiredGreenSeconds: number;
  phases: StressPhase[];
}

export const SIM_CONFIG: SimulationConfig = {
  serverCapacityRps: 40,
  overloadToleranceSeconds: 3,
  stableErrorRate: 0.01,
  requiredGreenSeconds: 2,
  phases: [
    { id: "baseline", durationSeconds: 3, startRps: 20, endRps: 20 },
    { id: "ramp", durationSeconds: 4, startRps: 20, endRps: 70 },
    {
      id: "spike",
      durationSeconds: 3,
      startRps: 70,
      endRps: 70,
      injectFailureAtSeconds: 1,
    },
    { id: "growth", durationSeconds: 5, startRps: 75, endRps: 75 },
    { id: "steady", durationSeconds: 3, startRps: 70, endRps: 75 },
  ],
};
