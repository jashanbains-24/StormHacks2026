export interface Interactable {
  id: string;
  label: string;
  x: number;
  y: number;
  range?: number;
  onInteract: () => void;
}
