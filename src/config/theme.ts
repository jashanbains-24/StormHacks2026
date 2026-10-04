export const THEME = {
  colors: {
    ink: 0x1f2933,
    paper: 0xf7f3e8,
    officeFloor: 0x293442,
    officeWall: 0x6d7f8f,
    alert: 0xc73e3a,
    alertDark: 0x742a27,
    success: 0x2f855a,
    successLight: 0x9ae6b4,
    warning: 0xd69e2e,
    panel: 0xfffbeb,
    panelDark: 0x34495e,
    muted: 0x718096,
    white: 0xffffff,
  },
  fonts: {
    family: '"Trebuchet MS", "Avenir Next", sans-serif',
    mono: '"SFMono-Regular", Consolas, monospace',
  },
  spacing: {
    xs: 6,
    sm: 10,
    md: 16,
    lg: 24,
    xl: 36,
  },
  radius: {
    sm: 6,
    md: 12,
  },
} as const;

export const colorHex = (color: number): string =>
  `#${color.toString(16).padStart(6, "0")}`;
