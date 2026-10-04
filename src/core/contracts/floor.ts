import type Phaser from "phaser";

import type {
  ComponentType,
  DesignQuality,
  SimulationState,
} from "../../sim/types";

export const FLOOR_CONTRACT_VERSION = 1;

export type DialogueDismissReason =
  "acknowledged" | "movement" | "replaced" | "shutdown";

export interface FloorDialogueLine {
  id: string;
  speaker: "manager" | "specialist" | "system";
  speakerName: string;
  text: string;
  glossaryIds?: string[];
  choices?: readonly FloorDialogueChoice[];
}

export interface FloorDialogueChoice {
  id: string;
  label: string;
}

export interface FloorGlossaryEntry {
  id: string;
  term: string;
  definition: string;
  analogy?: string;
  realWorld?: string;
}

export interface FloorTask {
  id: string;
  label: string;
  targetFloor?: number;
  repeatable?: boolean;
}

export interface FloorContent {
  managerAlert?: FloorDialogueLine;
  specialistHints: FloorDialogueLine[];
  completionDialogue?: FloorDialogueLine;
  glossary: FloorGlossaryEntry[];
  tutorial: {
    move?: string;
    interact?: string;
    elevator?: string;
    build?: string;
  };
}

export interface FloorIncidentDefinition {
  title: string | null;
  buildMode?: "standard" | "tutorial";
  availableComponents: {
    type: ComponentType;
    max: number;
  }[];
  canonicalServerCount?: number;
}

export interface FloorDefinition {
  content: FloorContent;
  incident: FloorIncidentDefinition;
}

export interface FloorImageAsset {
  key: string;
  path: string;
}

export interface FloorSpritesheetAsset extends FloorImageAsset {
  frameWidth: number;
  frameHeight: number;
}

export interface AssetManifest {
  images: FloorImageAsset[];
  spritesheets: FloorSpritesheetAsset[];
  audio: FloorImageAsset[];
}

export interface ThemeTokens {
  colors: Record<string, number> & {
    ink: number;
    paper: number;
    officeFloor: number;
    officeWall: number;
    alert: number;
    success: number;
    successLight: number;
    warning: number;
    panel: number;
    panelDark: number;
    muted: number;
    white: number;
  };
  fonts: {
    family: string;
    mono: string;
  };
  spacing: Record<string, number>;
  radius: Record<string, number>;
}

export type FloorTheme = {
  colors?: Partial<ThemeTokens["colors"]>;
  spacing?: Partial<ThemeTokens["spacing"]>;
  radius?: Partial<ThemeTokens["radius"]>;
};

export type FloorPreviewState = "calm" | "strained" | "down" | "fixed";

export interface FloorInteractable {
  id: string;
  label: string;
  x: number;
  y: number;
  range?: number;
  onInteract: () => void;
}

export interface FloorNpcOptions {
  texture?: string;
  frame?: number;
  flipX?: boolean;
  animationKey?: string | null;
  staticBody?: boolean;
}

export interface FloorNpcHandle extends Phaser.Physics.Arcade.Sprite {
  updateMovementAnimation(): void;
}

export interface FloorContext {
  readonly scene: Phaser.Scene;
  readonly player: Phaser.Physics.Arcade.Sprite;
  readonly floorOrder: number;
  readonly theme: ThemeTokens;
  readonly preview: {
    readonly enabled: boolean;
    readonly state: FloorPreviewState;
  };
  readonly preferences: {
    readonly muted: boolean;
    readonly reducedMotion: boolean;
  };
  readonly sim: {
    snapshot?: SimulationState;
  };
  readonly hud: {
    showToast(message: string): void;
    setObjective(message: string): void;
    trackTask(task: FloorTask, completed?: boolean): void;
  };
  readonly dialogue: {
    showSpecialist(): void;
    showSequence(
      lines: FloorDialogueLine[],
      onDismiss?: (reason: DialogueDismissReason) => void,
    ): void;
    dismiss(): void;
    showLine(line: FloorDialogueLine, onDismiss?: () => void): void;
    showChoice(
      line: FloorDialogueLine,
      onChoose: (choiceId: string) => void,
    ): void;
  };
  readonly glossary: {
    open(id: string): void;
  };
  readonly progression: {
    readonly unlockedFloor: number;
    resultFor(
      order: number,
    ): { quality: DesignQuality; debtNotes: string[] } | undefined;
    completedThisSession(order: number): boolean;
    canonicalThisSession(order: number): boolean;
    handoffPending(order: number): boolean;
    confirmHandoff(order: number): void;
    report(order: number, quality: DesignQuality, debtNotes: string[]): void;
    flag(name: string): string | undefined;
    setFlag(name: string, value: string): void;
  };
  readonly audio: {
    playClick(): void;
    playSuccess(): void;
  };
  readonly events: {
    emit(name: string, ...args: unknown[]): void;
    on(name: string, listener: (...args: unknown[]) => void): () => void;
  };
  readonly assets: {
    key(localName: string): string;
  };
  addInteractable(interactable: FloorInteractable): void;
  addNpc(
    x: number,
    y: number,
    id: string,
    options?: FloorNpcOptions,
  ): FloorNpcHandle;
  addUpdater(update: () => void): void;
  openBuild(): void;
  navigateTo(order: number): void;
}

export interface LayoutHandle {
  destroy?(): void;
}

export interface BuildUIHandle {
  destroy?(): void;
}

export interface EffectsHandle {
  destroy?(): void;
}

export interface FloorView {
  createLayout(ctx: FloorContext): LayoutHandle;
  createBuildUI(ctx: FloorContext): BuildUIHandle;
  createEffects?(ctx: FloorContext): EffectsHandle;
  replacesDefaultEmergencyEffects?: boolean;
}

export interface FloorModule {
  contractVersion: number;
  id: string;
  title: string;
  category: string;
  definition: FloorDefinition;
  view: FloorView;
  assets: AssetManifest;
  theme?: FloorTheme;
}

export interface DiscoveredFloor {
  order: number;
  folder: string;
  module: FloorModule;
}
