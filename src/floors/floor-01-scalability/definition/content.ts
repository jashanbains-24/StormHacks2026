import type { FloorContent } from "../../../core/contracts";

export const content: FloorContent = {
  specialistHints: [
    {
      id: "f01_specialist_hint_1",
      speaker: "specialist",
      speakerName: "Rhea Boot, SRE",
      text: "Everybody and their cat caused a traffic spike, and one server is doing all the work. It only has so much capacity.",
      glossaryIds: ["f01.traffic_spike", "f01.server", "f01.capacity"],
    },
    {
      id: "f01_specialist_hint_2",
      speaker: "specialist",
      speakerName: "Rhea Boot, SRE",
      text: "Spread the requests per second across several servers. Put a load balancer in front and let it use round robin.",
      glossaryIds: [
        "f01.rps",
        "f01.server",
        "f01.load_balancer",
        "f01.round_robin",
      ],
    },
    {
      id: "f01_specialist_hint_3",
      speaker: "specialist",
      speakerName: "Rhea Boot, SRE",
      text: "Use horizontal scaling: load balancer, then enough servers to keep redundancy when one fails. Capacity plus a spare. N+1, intern!",
      glossaryIds: [
        "f01.horizontal_scaling",
        "f01.load_balancer",
        "f01.server",
        "f01.redundancy",
        "f01.capacity",
      ],
    },
  ],
  glossary: [
    {
      id: "f01.traffic_spike",
      term: "traffic spike",
      definition: "A sudden surge in the number of users hitting your system.",
    },
    {
      id: "f01.rps",
      term: "requests per second",
      definition: "How many user requests arrive every second.",
    },
    {
      id: "f01.capacity",
      term: "capacity",
      definition: "How much traffic a machine can handle before it struggles.",
    },
    {
      id: "f01.server",
      term: "server",
      definition: "A computer that answers user requests.",
    },
    {
      id: "f01.load_balancer",
      term: "load balancer",
      definition:
        "A traffic cop that splits incoming requests across multiple servers.",
    },
    {
      id: "f01.round_robin",
      term: "round robin",
      definition: "Handing out requests to servers one by one, in turn.",
    },
    {
      id: "f01.horizontal_scaling",
      term: "horizontal scaling",
      definition:
        "Handling more load by adding machines instead of buying one bigger machine.",
    },
    {
      id: "f01.spof",
      term: "single point of failure",
      definition: "One component whose failure can take the whole system down.",
    },
    {
      id: "f01.redundancy",
      term: "redundancy",
      definition:
        "Keeping spare capacity so one failure does not break everything.",
    },
  ],
  tutorial: {
    build: "Talk to Rhea, then use the BUILD console",
  },
};
