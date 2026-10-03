import { SOLUTIONS } from "../data/solutions";
import type {
  DesignConnection,
  DesignNode,
  Evaluation,
  SystemDesign,
} from "./types";

const outgoingIds = (
  nodeId: string,
  connections: DesignConnection[],
): string[] =>
  connections
    .filter((connection) => connection.from === nodeId)
    .map((connection) => connection.to);

const nodesById = (nodes: DesignNode[]): Map<string, DesignNode> =>
  new Map(nodes.map((node) => [node.id, node]));

export interface DesignTopology {
  client: DesignNode | undefined;
  loadBalancer: DesignNode | undefined;
  directServers: DesignNode[];
  balancedServers: DesignNode[];
}

export const getDesignTopology = (design: SystemDesign): DesignTopology => {
  const byId = nodesById(design.nodes);
  const client = design.nodes.find((node) => node.type === "client");
  const clientTargets = client
    ? outgoingIds(client.id, design.connections)
        .map((id) => byId.get(id))
        .filter((node): node is DesignNode => node !== undefined)
    : [];
  const loadBalancer = clientTargets.find(
    (node) => node.type === "loadBalancer",
  );
  const directServers = clientTargets.filter((node) => node.type === "server");
  const balancedServers = loadBalancer
    ? outgoingIds(loadBalancer.id, design.connections)
        .map((id) => byId.get(id))
        .filter(
          (node): node is DesignNode =>
            node !== undefined && node.type === "server",
        )
    : [];

  return { client, loadBalancer, directServers, balancedServers };
};

export const evaluateDesign = (design: SystemDesign): Evaluation => {
  const topology = getDesignTopology(design);

  if (!topology.client) {
    return SOLUTIONS.invalid;
  }

  if (topology.loadBalancer) {
    const count = topology.balancedServers.length;
    if (count === 3) return SOLUTIONS.canonical;
    if (count >= 4) return SOLUTIONS["over-provisioned"];
    if (count === 2) return SOLUTIONS["under-redundant"];
    if (count === 1) return SOLUTIONS["single-server-lb"];
    return SOLUTIONS.invalid;
  }

  if (topology.directServers.length > 1) {
    return SOLUTIONS["unbalanced-direct"];
  }
  if (topology.directServers.length === 1) {
    return SOLUTIONS["single-server-direct"];
  }
  return SOLUTIONS.invalid;
};
