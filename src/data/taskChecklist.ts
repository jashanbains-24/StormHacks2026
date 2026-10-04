export const CHECKLIST_COPY = {
  title: "YOUR TO-DO LIST",
  subtitle:
    "Tasks appear as you discover them. Progress updates automatically.",
  empty: "Your next assignment will appear here.",
  floor: (order: number): string =>
    order === 0 ? "GROUND FLOOR" : `FLOOR ${order}`,
};
