import type { FloorContent, FloorDialogueLine } from "../../../core/contracts";

export type F01BuildOutcomeId =
  | "canonical"
  | "over-provisioned"
  | "under-redundant"
  | "single-server-lb"
  | "single-server-direct"
  | "unbalanced-direct"
  | "invalid";

export const onboardingDialogue: FloorDialogueLine[] = [
  {
    id: "f01_rhea_onboarding_1",
    speaker: "specialist",
    speakerName: "Rhea Boot, SRE Lead",
    text: "I'm Rhea Boot, the SRE lead. I know it is your first day and you are only our new intern, but production is in trouble and I need another pair of hands.",
  },
  {
    id: "f01_rhea_onboarding_2",
    speaker: "specialist",
    speakerName: "Rhea Boot, SRE Lead",
    text: "A [[f01.traffic_spike]] is sending more [[f01.rps]] than our single [[f01.server]] can handle. Once it exceeds [[f01.capacity]], requests slow down, fail, and eventually the server crashes.",
  },
  {
    id: "f01_rhea_onboarding_3",
    speaker: "specialist",
    speakerName: "Rhea Boot, SRE Lead",
    text: "Our [[f01.capacity]] plan says two servers running together can carry the spike. Your workstation can provision up to five—but the stress test will take one machine offline, so two alone leave no spare. We need N+1 [[f01.redundancy]].",
  },
  {
    id: "f01_rhea_onboarding_4",
    speaker: "specialist",
    speakerName: "Rhea Boot, SRE Lead",
    text: "Design a request path that can use those two required servers and still keep one extra available. Then run the stress test and watch how traffic behaves during failure.",
  },
  {
    id: "f01_rhea_onboarding_5",
    speaker: "specialist",
    speakerName: "Rhea Boot, SRE Lead",
    text: "If you get stuck, come back and talk to me. Each time you ask, I will give you a more specific hint.",
  },
];

const outcomeDialogue: Record<F01BuildOutcomeId, FloorDialogueLine[]> = {
  canonical: [
    {
      id: "f01_rhea_result_canonical_1",
      speaker: "specialist",
      speakerName: "Rhea Boot, SRE Lead",
      text: "Look at the monitors—green across the board. Your [[f01.load_balancer]] spread incoming requests using [[f01.round_robin]] instead of letting one server absorb the entire spike.",
    },
    {
      id: "f01_rhea_result_canonical_2",
      speaker: "specialist",
      speakerName: "Rhea Boot, SRE Lead",
      text: "Three servers gave us [[f01.horizontal_scaling]] plus a spare. Even when one failed, the other two kept enough [[f01.capacity]] online. That is practical [[f01.redundancy]]: N+1.",
    },
    {
      id: "f01_rhea_result_canonical_3",
      speaker: "specialist",
      speakerName: "Rhea Boot, SRE Lead",
      text: "The important idea is separation of responsibilities: the [[f01.load_balancer]] decides where each request goes, while the server pool provides the actual compute [[f01.capacity]]. Together they removed the bottleneck and kept throughput stable.",
    },
    {
      id: "f01_rhea_result_canonical_4",
      speaker: "specialist",
      speakerName: "Rhea Boot, SRE Lead",
      text: "That is the larger system-design lesson: estimate the load, distribute it, plan for components to fail, and add only enough [[f01.redundancy]] to remain available without wasting resources. Good architecture balances scale, reliability, and cost.",
    },
    {
      id: "f01_rhea_result_canonical_5",
      speaker: "specialist",
      speakerName: "Rhea Boot, SRE Lead",
      text: "Excellent first incident, intern. Take the elevator to the next floor—the team up there has another system waiting for you.",
    },
  ],
  "over-provisioned": [
    {
      id: "f01_rhea_result_over_provisioned_1",
      speaker: "specialist",
      speakerName: "Rhea Boot, SRE Lead",
      text: "The service stayed healthy, but you added more servers than this traffic pattern needs. Reliability matters, and so does the bill.",
    },
    {
      id: "f01_rhea_result_over_provisioned_2",
      speaker: "specialist",
      speakerName: "Rhea Boot, SRE Lead",
      text: "Keep enough total [[f01.capacity]] for the spike plus one spare server for failure. Try the workstation again and find the smallest design with N+1 [[f01.redundancy]].",
    },
  ],
  "under-redundant": [
    {
      id: "f01_rhea_result_under_redundant_1",
      speaker: "specialist",
      speakerName: "Rhea Boot, SRE Lead",
      text: "Two servers handled ordinary traffic, but after one failed the survivor had no spare capacity. The system was balanced, not resilient.",
    },
    {
      id: "f01_rhea_result_under_redundant_2",
      speaker: "specialist",
      speakerName: "Rhea Boot, SRE Lead",
      text: "Add one more server behind the [[f01.load_balancer]]. That extra machine is the +1 in N+1 [[f01.redundancy]]. Then rerun the test.",
    },
  ],
  "single-server-lb": [
    {
      id: "f01_rhea_result_single_server_lb_1",
      speaker: "specialist",
      speakerName: "Rhea Boot, SRE Lead",
      text: "The [[f01.load_balancer]] had only one destination, so every request still reached the same overloaded server: a [[f01.spof]]. A traffic cop cannot split traffic across one road.",
    },
    {
      id: "f01_rhea_result_single_server_lb_2",
      speaker: "specialist",
      speakerName: "Rhea Boot, SRE Lead",
      text: "Give the load balancer multiple servers, with enough combined [[f01.capacity]] and one spare for [[f01.redundancy]]. Try again.",
    },
  ],
  "single-server-direct": [
    {
      id: "f01_rhea_result_single_direct_1",
      speaker: "specialist",
      speakerName: "Rhea Boot, SRE Lead",
      text: "That rebuilt the same bottleneck we started with: every request goes directly to one server, making it a [[f01.spof]].",
    },
    {
      id: "f01_rhea_result_single_direct_2",
      speaker: "specialist",
      speakerName: "Rhea Boot, SRE Lead",
      text: "Put a [[f01.load_balancer]] after the client, then connect several servers behind it for [[f01.horizontal_scaling]] so traffic can be distributed safely.",
    },
  ],
  "unbalanced-direct": [
    {
      id: "f01_rhea_result_unbalanced_direct_1",
      speaker: "specialist",
      speakerName: "Rhea Boot, SRE Lead",
      text: "More servers add capacity, but direct client connections do not give us one reliable place to distribute requests or remove failed machines.",
    },
    {
      id: "f01_rhea_result_unbalanced_direct_2",
      speaker: "specialist",
      speakerName: "Rhea Boot, SRE Lead",
      text: "Route the client into one [[f01.load_balancer]] and fan out from there. Let [[f01.round_robin]] share requests across the server pool.",
    },
  ],
  invalid: [
    {
      id: "f01_rhea_result_invalid_1",
      speaker: "specialist",
      speakerName: "Rhea Boot, SRE Lead",
      text: "Requests cannot cross this design yet. Every component needs to be part of one complete path from the client to a server.",
    },
    {
      id: "f01_rhea_result_invalid_2",
      speaker: "specialist",
      speakerName: "Rhea Boot, SRE Lead",
      text: "Start with client to [[f01.load_balancer]], then wire the load balancer to a [[f01.server]] pool. Run the test once the full path is connected.",
    },
  ],
};

export const outcomeDialogueFor = (outcomeId: string): FloorDialogueLine[] =>
  outcomeDialogue[outcomeId as F01BuildOutcomeId] ?? outcomeDialogue.invalid;

export const content: FloorContent = {
  specialistHints: [
    {
      id: "f01_specialist_hint_1",
      speaker: "specialist",
      speakerName: "Rhea Boot, SRE",
      text: "Hint 1: Follow the traffic. Right now one machine receives more [[f01.rps]] than it can serve. What could add [[f01.capacity]] and stop that machine from being a [[f01.spof]]?",
    },
    {
      id: "f01_specialist_hint_2",
      speaker: "specialist",
      speakerName: "Rhea Boot, SRE",
      text: "Hint 2: Put a [[f01.load_balancer]] between the client and a [[f01.server]] pool. It can use [[f01.round_robin]] to spread requests instead of sending everything to one target.",
    },
    {
      id: "f01_specialist_hint_3",
      speaker: "specialist",
      speakerName: "Rhea Boot, SRE",
      text: "Hint 3: Build client → [[f01.load_balancer]] → a three-machine [[f01.server]] pool. That is [[f01.horizontal_scaling]]: two provide the required [[f01.capacity]] and the third is the +1 spare for [[f01.redundancy]] when failure is injected.",
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
    build: "Intern onboarding: find Rhea before using your workstation",
  },
};
