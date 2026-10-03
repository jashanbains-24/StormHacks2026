export interface GlossaryEntry {
  id: string;
  term: string;
  definition: string;
}

export const GLOSSARY: GlossaryEntry[] = [
  {
    id: "traffic-spike",
    term: "traffic spike",
    definition: "A sudden surge in the number of users hitting your system.",
  },
  {
    id: "rps",
    term: "requests per second",
    definition: "How many user requests arrive every second.",
  },
  {
    id: "capacity",
    term: "capacity",
    definition: "How much traffic a machine can handle before it struggles.",
  },
  {
    id: "server",
    term: "server",
    definition: "A computer that answers user requests.",
  },
  {
    id: "load-balancer",
    term: "load balancer",
    definition:
      "A traffic cop that splits incoming requests across multiple servers.",
  },
  {
    id: "round-robin",
    term: "round robin",
    definition: "Handing out requests to servers one by one, in turn.",
  },
  {
    id: "horizontal-scaling",
    term: "horizontal scaling",
    definition:
      "Handling more load by adding machines instead of buying one bigger machine.",
  },
  {
    id: "spof",
    term: "single point of failure",
    definition: "One component whose failure can take the whole system down.",
  },
  {
    id: "redundancy",
    term: "redundancy",
    definition:
      "Keeping spare capacity so one failure does not break everything.",
  },
];

export const glossaryById = Object.fromEntries(
  GLOSSARY.map((entry) => [entry.id, entry]),
) as Record<string, GlossaryEntry>;
