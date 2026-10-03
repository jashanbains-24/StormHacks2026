export interface DialogueLine {
  id: string;
  speaker: "manager" | "specialist" | "system";
  speakerName: string;
  text: string;
  glossaryIds?: string[];
}

export const MANAGER_ALERT: DialogueLine = {
  id: "f1_manager_alert",
  speaker: "manager",
  speakerName: "Director Synergy",
  text: "THE WEBSITE IS DOWN. Everyone is tweeting. Why are you still standing there? You are in charge now. Floor 1. Move!",
};

export const SPECIALIST_HINTS: DialogueLine[] = [
  {
    id: "f1_specialist_hint_1",
    speaker: "specialist",
    speakerName: "Rhea Boot, SRE",
    text: "Everybody and their cat caused a traffic spike, and one server is doing all the work. It only has so much capacity.",
    glossaryIds: ["traffic-spike", "server", "capacity"],
  },
  {
    id: "f1_specialist_hint_2",
    speaker: "specialist",
    speakerName: "Rhea Boot, SRE",
    text: "Spread the requests per second across several servers. Put a load balancer in front and let it use round robin.",
    glossaryIds: ["rps", "server", "load-balancer", "round-robin"],
  },
  {
    id: "f1_specialist_hint_3",
    speaker: "specialist",
    speakerName: "Rhea Boot, SRE",
    text: "Use horizontal scaling: load balancer, then enough servers to keep redundancy when one fails. Capacity plus a spare. N+1, intern!",
    glossaryIds: [
      "horizontal-scaling",
      "load-balancer",
      "server",
      "redundancy",
      "capacity",
    ],
  },
];

export const TUTORIAL_COPY = {
  move: "WASD or arrow keys to run",
  interact: "Press E near people and equipment",
  elevator: "Get to the elevator and reach Floor 1",
  build: "Talk to Rhea, then use the BUILD console",
} as const;
