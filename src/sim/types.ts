export type ComponentType = "client" | "loadBalancer" | "server";

export interface DesignNode {
  id: string;
  type: ComponentType;
  x: number;
  y: number;
}

export interface DesignConnection {
  from: string;
  to: string;
}

export interface SystemDesign {
  nodes: DesignNode[];
  connections: DesignConnection[];
}

export type DesignQuality = "canonical" | "partial" | "failed";

export type SolutionId =
  | "canonical"
  | "over-provisioned"
  | "under-redundant"
  | "single-server-lb"
  | "single-server-direct"
  | "unbalanced-direct"
  | "invalid";

export interface Evaluation {
  id: SolutionId;
  quality: DesignQuality;
  title: string;
  message: string;
  debtNotes: string[];
}

export type ServerHealth = "healthy" | "strained" | "crashed";

export interface ServerState {
  id: string;
  health: ServerHealth;
  loadRps: number;
  overloadSeconds: number;
  injectedFailure: boolean;
}

export type SimulationOutcome = "running" | "canonical" | "partial" | "failed";

export interface SimulationState {
  elapsedSeconds: number;
  phaseId: string;
  phaseProgress: number;
  incomingRps: number;
  totalRequests: number;
  droppedRequests: number;
  errorRate: number;
  injectedFailureOccurred: boolean;
  greenSeconds: number;
  servers: ServerState[];
  outcome: SimulationOutcome;
}
