const opened = new Set<string>();
const listeners = new Set<() => void>();

export const hasOpenedTerm = (id: string): boolean => opened.has(id);

export const markTermOpened = (id: string): void => {
  if (opened.has(id)) return;
  opened.add(id);
  listeners.forEach((listener) => listener());
};

export const openedTermIds = (): string[] => [...opened];

export const onTermsChanged = (listener: () => void): (() => void) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};
