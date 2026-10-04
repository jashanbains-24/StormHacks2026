export const GLOSSARY_COPY = {
  title: "Glossary",
  empty:
    "Open an ⓘ while you talk or solve a puzzle. Your learned terms will appear here.",
  previous: "← PREV",
  next: "NEXT →",
  floor: (order: number): string =>
    order === 0 ? "GROUND FLOOR" : `FLOOR ${order}`,
};
