import {
  SIM_CONFIG,
  type SimulationConfig,
  type StressPhase,
} from "../config/simConfig";
import { evaluateDesign, getDesignTopology } from "./evaluator";
import type {
  ServerState,
  SimulationOutcome,
  SimulationState,
  SystemDesign,
} from "./types";

interface PhasePosition {
  phase: StressPhase;
  elapsedInPhase: number;
  scheduleComplete: boolean;
}

const scheduleDuration = (config: SimulationConfig): number =>
  config.phases.reduce((total, phase) => total + phase.durationSeconds, 0);

const getPhasePosition = (
  elapsedSeconds: number,
  config: SimulationConfig,
): PhasePosition => {
  let cursor = 0;
  for (const phase of config.phases) {
    if (elapsedSeconds < cursor + phase.durationSeconds) {
      return {
        phase,
        elapsedInPhase: elapsedSeconds - cursor,
        scheduleComplete: false,
      };
    }
    cursor += phase.durationSeconds;
  }

  return {
    phase: config.phases[config.phases.length - 1],
    elapsedInPhase: elapsedSeconds - cursor,
    scheduleComplete: true,
  };
};

const rpsForPhase = (
  phase: StressPhase,
  elapsedInPhase: number,
  scheduleComplete: boolean,
): number => {
  if (scheduleComplete) {
    return phase.endRps + Math.sin(elapsedInPhase * 1.7) * 2;
  }
  const progress = Math.min(1, elapsedInPhase / phase.durationSeconds);
  return phase.startRps + (phase.endRps - phase.startRps) * progress;
};

export const createSimulation = (
  design: SystemDesign,
  config: SimulationConfig = SIM_CONFIG,
): SimulationState => {
  const topology = getDesignTopology(design);
  const connectedServers = topology.loadBalancer
    ? topology.balancedServers
    : topology.directServers.slice(0, 1);

  return {
    elapsedSeconds: 0,
    phaseId: config.phases[0].id,
    phaseProgress: 0,
    incomingRps: config.phases[0].startRps,
    totalRequests: 0,
    droppedRequests: 0,
    errorRate: 0,
    injectedFailureOccurred: false,
    greenSeconds: 0,
    servers: connectedServers.map((server) => ({
      id: server.id,
      health: "healthy",
      loadRps: 0,
      overloadSeconds: 0,
      injectedFailure: false,
    })),
    outcome: "running",
  };
};

const shouldInjectFailure = (
  position: PhasePosition,
  alreadyInjected: boolean,
): boolean =>
  !alreadyInjected &&
  position.phase.injectFailureAtSeconds !== undefined &&
  position.elapsedInPhase >= position.phase.injectFailureAtSeconds;

const routeTraffic = (
  servers: ServerState[],
  incomingRps: number,
  hasLoadBalancer: boolean,
): Map<string, number> => {
  const healthy = servers.filter((server) => server.health !== "crashed");
  const routed = new Map<string, number>();
  if (healthy.length === 0) return routed;

  if (!hasLoadBalancer) {
    routed.set(healthy[0].id, incomingRps);
    return routed;
  }

  const perServer = incomingRps / healthy.length;
  healthy.forEach((server) => routed.set(server.id, perServer));
  return routed;
};

export const tickSimulation = (
  previous: SimulationState,
  design: SystemDesign,
  deltaSeconds: number,
  config: SimulationConfig = SIM_CONFIG,
): SimulationState => {
  if (previous.outcome !== "running" || deltaSeconds <= 0) return previous;

  const elapsedSeconds = previous.elapsedSeconds + deltaSeconds;
  const position = getPhasePosition(elapsedSeconds, config);
  const incomingRps = rpsForPhase(
    position.phase,
    position.elapsedInPhase,
    position.scheduleComplete,
  );
  let injectedFailureOccurred = previous.injectedFailureOccurred;
  let servers = previous.servers.map((server) => ({ ...server, loadRps: 0 }));

  if (shouldInjectFailure(position, injectedFailureOccurred)) {
    const target = servers.find((server) => server.health !== "crashed");
    if (target) {
      target.health = "crashed";
      target.injectedFailure = true;
      target.overloadSeconds = 0;
    }
    injectedFailureOccurred = true;
  }

  const topology = getDesignTopology(design);
  const routed = routeTraffic(
    servers,
    incomingRps,
    topology.loadBalancer !== undefined,
  );
  let droppedRps =
    routed.size === 0
      ? incomingRps
      : Math.max(
          0,
          incomingRps -
            [...routed.values()].reduce((total, load) => total + load, 0),
        );

  servers = servers.map((server) => {
    if (server.health === "crashed") return server;
    const loadRps = routed.get(server.id) ?? 0;
    const overloaded = loadRps > config.serverCapacityRps;
    const overloadSeconds = overloaded
      ? server.overloadSeconds + deltaSeconds
      : 0;
    droppedRps += Math.max(0, loadRps - config.serverCapacityRps);

    if (overloadSeconds >= config.overloadToleranceSeconds) {
      droppedRps += Math.min(loadRps, config.serverCapacityRps);
      return {
        ...server,
        health: "crashed",
        loadRps,
        overloadSeconds,
      };
    }

    return {
      ...server,
      health: overloaded ? "strained" : "healthy",
      loadRps,
      overloadSeconds,
    };
  });

  const totalRequests = previous.totalRequests + incomingRps * deltaSeconds;
  const droppedRequests = previous.droppedRequests + droppedRps * deltaSeconds;
  const errorRate = totalRequests === 0 ? 0 : droppedRequests / totalRequests;
  const evaluation = evaluateDesign(design);
  const unexpectedCrashes = servers.filter(
    (server) => server.health === "crashed" && !server.injectedFailure,
  ).length;
  const currentlyStable =
    unexpectedCrashes === 0 &&
    errorRate < config.stableErrorRate &&
    servers.some((server) => server.health !== "crashed");
  const greenSeconds =
    position.scheduleComplete && currentlyStable
      ? previous.greenSeconds + deltaSeconds
      : 0;

  let outcome: SimulationOutcome = previous.outcome;
  if (position.scheduleComplete) {
    if (evaluation.quality === "failed") {
      outcome = "failed";
    } else if (evaluation.quality === "partial") {
      outcome = "partial";
    } else if (greenSeconds >= config.requiredGreenSeconds) {
      outcome = "canonical";
    }
  }

  return {
    elapsedSeconds,
    phaseId: position.phase.id,
    phaseProgress: position.scheduleComplete
      ? 1
      : Math.min(1, position.elapsedInPhase / position.phase.durationSeconds),
    incomingRps,
    totalRequests,
    droppedRequests,
    errorRate,
    injectedFailureOccurred,
    greenSeconds,
    servers,
    outcome,
  };
};

export const runSimulation = (
  design: SystemDesign,
  seconds: number,
  stepSeconds = 0.1,
  config: SimulationConfig = SIM_CONFIG,
): SimulationState => {
  let state = createSimulation(design, config);
  for (
    let elapsed = 0;
    elapsed < seconds && state.outcome === "running";
    elapsed += stepSeconds
  ) {
    state = tickSimulation(state, design, stepSeconds, config);
  }
  return state;
};

export const getScheduleDuration = (
  config: SimulationConfig = SIM_CONFIG,
): number => scheduleDuration(config);
