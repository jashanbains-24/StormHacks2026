import type { DesignNode, SystemDesign } from "../../src/sim/types";

export const makeDesign = (
  serverCount: number,
  withLoadBalancer: boolean,
): SystemDesign => {
  const client: DesignNode = { id: "client", type: "client", x: 80, y: 260 };
  const loadBalancer: DesignNode = {
    id: "lb",
    type: "loadBalancer",
    x: 310,
    y: 260,
  };
  const servers: DesignNode[] = Array.from(
    { length: serverCount },
    (_, index) => ({
      id: `server-${index + 1}`,
      type: "server" as const,
      x: 600,
      y: 130 + index * 100,
    }),
  );

  return {
    nodes: withLoadBalancer
      ? [client, loadBalancer, ...servers]
      : [client, ...servers],
    connections: withLoadBalancer
      ? [
          { from: client.id, to: loadBalancer.id },
          ...servers.map((server) => ({
            from: loadBalancer.id,
            to: server.id,
          })),
        ]
      : servers.map((server) => ({ from: client.id, to: server.id })),
  };
};
