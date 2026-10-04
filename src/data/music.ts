export const BACKGROUND_MUSIC_KEY = "breakpoint-background-music";
export const FLOOR_2_MUSIC_KEY = "breakpoint-floor-2-music";

export const musicForFloor = (order: number): string =>
  order === 2 ? FLOOR_2_MUSIC_KEY : BACKGROUND_MUSIC_KEY;
