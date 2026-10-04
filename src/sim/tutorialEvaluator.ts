import type {
  DesignConnection,
  DesignNode,
  Evaluation,
  SystemDesign,
} from "./types";

const tutorialSuccess: Evaluation = {
  id: "canonical",
  quality: "canonical",
  title: "Tutorial Complete",
  message:
    "Every destination is connected. You are ready for the real problems.",
  debtNotes: [],
};

const tutorialFailure: Evaluation = {
  id: "invalid",
  quality: "failed",
  title: "Connection Incomplete",
  message: "Connect the Source Block to every placed Destination Block.",
  debtNotes: [],
};

const outgoing = (nodeId: string, connections: DesignConnection[]): string[] =>
  connections
    .filter((connection) => connection.from === nodeId)
    .map((connection) => connection.to);

export const evaluateTutorialDesign = (design: SystemDesign): Evaluation => {
  const source = design.nodes.find((node) => node.type === "source");
  const destinations = design.nodes.filter(
    (node) => node.type === "destination",
  );
  if (!source || destinations.length === 0) return tutorialFailure;

  const nodesById = new Map<string, DesignNode>(
    design.nodes.map((node) => [node.id, node]),
  );
  const reached = new Set<string>([source.id]);
  const pending = [source.id];
  while (pending.length > 0) {
    const current = pending.shift();
    if (!current) continue;
    for (const nextId of outgoing(current, design.connections)) {
      if (!nodesById.has(nextId) || reached.has(nextId)) continue;
      reached.add(nextId);
      pending.push(nextId);
    }
  }

  return destinations.every((destination) => reached.has(destination.id))
    ? tutorialSuccess
    : tutorialFailure;
};
