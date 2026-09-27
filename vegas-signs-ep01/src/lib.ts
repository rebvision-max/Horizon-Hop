import { interpolate, random } from "remotion";
import { noise2D } from "@remotion/noise";

export const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

export const lerp = (f: number, inp: number[], out: number[], easing?: (t: number) => number) =>
  interpolate(f, inp, out, { ...clamp, easing });

/**
 * Realistic neon ignition + running flicker.
 * - Before `on`: dark.
 * - Strike phase: irregular stutters (tube failing to strike, then catching).
 * - Running: near full with 50/60Hz-ish shimmer and rare single-frame dropouts.
 */
export const neon = (frame: number, seed: string, on = 0, strike = 10, unstable = 0.0) => {
  if (frame < on) return 0;
  const t = frame - on;
  if (t < strike) {
    const r = random(`${seed}-s-${t}`);
    const catchUp = t / strike;
    return r < 0.35 + catchUp * 0.5 ? 0.35 + 0.65 * random(`${seed}-a-${t}`) : 0.03;
  }
  const shimmer = 0.94 + 0.06 * noise2D(seed, t * 0.9, 0);
  const drop = random(`${seed}-d-${t}`) < 0.012 + unstable ? 0.25 + 0.5 * random(`${seed}-dd-${t}`) : 1;
  const sag = unstable > 0 ? 0.75 + 0.25 * (0.5 + 0.5 * noise2D(seed + "sag", t * 0.07, 3)) : 1;
  return shimmer * drop * sag;
};

export const glow = (color: string, k: number, r = 1) =>
  k <= 0.02
    ? "none"
    : `drop-shadow(0 0 ${2 * r}px ${color}) drop-shadow(0 0 ${8 * r * k}px ${color}) drop-shadow(0 0 ${22 * r * k}px ${color})`;

export const rng = (seed: string | number) => random(seed);
