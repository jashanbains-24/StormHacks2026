import type { FloorContent } from "../../../core/contracts";

export const content: FloorContent = {
  managerAlert: {
    id: "f00_manager_alert",
    speaker: "manager",
    speakerName: "Director Synergy",
    text: "Welcome to Stack Never Flow Inc., new hire! Before we send you to save production, here is your orientation: use WASD or the arrow keys to move, click with the mouse to use menus and connect ideas, and press E whenever you want to interact.",
  },
  specialistHints: [
    {
      id: "f00_specialist_welcome",
      speaker: "specialist",
      speakerName: "Maya",
      text: "Welcome aboard! Take this form and have a seat in the waiting area. I will just need some info from you and we can get you onboarded.",
    },
    {
      id: "f00_specialist_problem",
      speaker: "specialist",
      speakerName: "Maya",
      text: "At your seat, enter your name first, confirm it, then answer three preliminary questions. No trick questions — I promise.",
    },
    {
      id: "f00_specialist_finish",
      speaker: "specialist",
      speakerName: "Maya",
      text: "Once those answers are in, send the form back to me. I will check it, stamp it, and get you ready for Problem 1.",
    },
  ],
  completionDialogue: {
    id: "f00_specialist_completion",
    speaker: "specialist",
    speakerName: "Maya",
    text: "Well done, recruit! Head upstairs to continue with onboarding.",
  },
  glossary: [],
  tutorial: {
    move: "WASD / arrows to move • Mouse to click • E to interact",
    interact: "Go to the front desk.",
    build: "Have a seat in the waiting area to fill in your information",
    elevator: "Orientation complete — you are ready to tackle Problem 1",
  },
};
