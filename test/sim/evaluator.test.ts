import { describe, expect, it } from "vitest";

import { evaluateDesign } from "../../src/sim/evaluator";
import { makeDesign } from "./fixtures";

describe("evaluateDesign", () => {
  it.each([
    [3, true, "canonical", "canonical"],
    [4, true, "over-provisioned", "partial"],
    [5, true, "over-provisioned", "partial"],
    [2, true, "under-redundant", "partial"],
    [1, true, "single-server-lb", "failed"],
    [1, false, "single-server-direct", "failed"],
    [3, false, "unbalanced-direct", "failed"],
    [0, true, "invalid", "failed"],
  ] as const)(
    "classifies %i servers with load balancer=%s",
    (servers, withLoadBalancer, id, quality) => {
      expect(
        evaluateDesign(makeDesign(servers, withLoadBalancer)),
      ).toMatchObject({ id, quality });
    },
  );

  it("ignores unconnected components", () => {
    const design = makeDesign(3, true);
    design.nodes.push({ id: "spare", type: "server", x: 0, y: 0 });
    expect(evaluateDesign(design).id).toBe("canonical");
  });
});
