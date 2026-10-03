import type { Evaluation, SolutionId } from "../sim/types";

export const SOLUTIONS: Record<SolutionId, Evaluation> = {
  canonical: {
    id: "canonical",
    quality: "canonical",
    title: "Actually Stable",
    message:
      "Three servers give you enough capacity for growth and one spare when hardware gives up.",
    debtNotes: [],
  },
  "over-provisioned": {
    id: "over-provisioned",
    quality: "partial",
    title: "Stable, but Expensive",
    message:
      "It works, but you are paying for servers that are napping. Three handles this load with N+1 redundancy.",
    debtNotes: ["Excess idle server capacity increases operating cost."],
  },
  "under-redundant": {
    id: "under-redundant",
    quality: "partial",
    title: "Works Until Tuesday",
    message:
      "Two servers handle the spike, but lose one and the survivor cannot carry 75 RPS. No spare capacity means no safety net.",
    debtNotes: ["No N+1 capacity; a server failure causes an outage."],
  },
  "single-server-lb": {
    id: "single-server-lb",
    quality: "failed",
    title: "Fancy Middleman",
    message:
      "A load balancer with one server adds no capacity or redundancy. The same lonely server still melts.",
    debtNotes: [],
  },
  "single-server-direct": {
    id: "single-server-direct",
    quality: "failed",
    title: "One Very Sad Computer",
    message:
      "One machine gets every request. More users or one hardware failure takes down the whole site.",
    debtNotes: [],
  },
  "unbalanced-direct": {
    id: "unbalanced-direct",
    quality: "failed",
    title: "Servers Without Directions",
    message:
      "You bought more servers, but traffic still enters the first one. Add a load balancer to split requests.",
    debtNotes: [],
  },
  invalid: {
    id: "invalid",
    quality: "failed",
    title: "Architecture Not Found",
    message:
      "Connect the client to a load balancer or server, then connect the load balancer to servers.",
    debtNotes: [],
  },
};
