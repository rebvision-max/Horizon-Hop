import { Easing } from "remotion";

export const FPS = 24;
export const TOTAL_FRAMES = 60 * FPS;
export const W = 1920;
export const H = 1080;

export const C = {
  night0: "#07051a",
  night1: "#120c38",
  night2: "#241a5e",
  violet: "#5b3fb0",
  haze: "#8a6fd6",
  gold: "#f2c14e",
  goldHot: "#ffe29a",
  amber: "#ff9f3a",
  cream: "#fbf1dc",
  pink: "#ff5fa2",
  cyan: "#6fe3ff",
  ink: "#040310",
};

export const FONT = {
  title: "Cond, 'Arial Narrow', sans-serif",
  body: "Body, Arial, sans-serif",
  mono: "Mono, 'DejaVu Sans Mono', monospace",
};

// Premium-feeling eases: slow-in/slow-out camera, snappy UI.
export const EASE = {
  cam: Easing.bezier(0.45, 0, 0.2, 1),
  out: Easing.bezier(0.16, 1, 0.3, 1),
  inOut: Easing.bezier(0.65, 0, 0.35, 1),
};

export const s = (sec: number) => Math.round(sec * FPS);

// Beat map (seconds). Cuts land a hair before each VO line starts.
export const BEATS = [
  { id: "cold", from: 0, to: 6.6, hud: "LAS VEGAS, NV · 36.17°N 115.14°W" },
  { id: "rail", from: 6.6, to: 13.0, hud: "LAS VEGAS, NV · 15.05.1905" },
  { id: "stein", from: 13.0, to: 20.1, hud: "FREMONT ST · 1932" },
  { id: "stardust", from: 20.1, to: 27.9, hud: "LAS VEGAS BLVD · 1958" },
  { id: "pylon", from: 27.9, to: 35.4, hud: "THE DUNES · 1964" },
  { id: "implode", from: 35.4, to: 42.3, hud: "" },
  { id: "boneyard", from: 42.3, to: 47.6, hud: "NEON BONEYARD · LAS VEGAS" },
  { id: "sphere", from: 47.6, to: 55.8, hud: "LAS VEGAS BLVD · 04.07.2023" },
  { id: "title", from: 55.8, to: 60, hud: "" },
] as const;
