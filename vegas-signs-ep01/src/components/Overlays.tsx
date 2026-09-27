import React, { useEffect, useRef } from "react";
import { AbsoluteFill, random, useCurrentFrame } from "remotion";
import { C } from "../theme";
import { lerp } from "../lib";

// Animated film grain: new noise field every frame, drawn small and upscaled.
export const Grain: React.FC<{ opacity?: number }> = ({ opacity = 0.14 }) => {
  const f = useCurrentFrame();
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const cv = ref.current!;
    const ctx = cv.getContext("2d")!;
    const img = ctx.createImageData(cv.width, cv.height);
    let seed = (f * 9301 + 49297) % 233280;
    for (let i = 0; i < img.data.length; i += 4) {
      seed = (seed * 9301 + 49297) % 233280;
      const v = (seed / 233280) * 255;
      img.data[i] = img.data[i + 1] = img.data[i + 2] = v;
      img.data[i + 3] = 255;
    }
    ctx.putImageData(img, 0, 0);
  }, [f]);
  return (
    <AbsoluteFill style={{ mixBlendMode: "overlay", opacity, pointerEvents: "none" }}>
      <canvas ref={ref} width={640} height={360} style={{ width: "100%", height: "100%" }} />
    </AbsoluteFill>
  );
};

// Static halftone screen, the series' print-texture signature.
export const Halftone: React.FC = () => (
  <AbsoluteFill
    style={{
      backgroundImage: "radial-gradient(rgba(0,0,0,0.55) 1.1px, transparent 1.6px)",
      backgroundSize: "6px 6px",
      mixBlendMode: "multiply",
      opacity: 0.22,
    }}
  />
);

export const Vignette: React.FC<{ k?: number }> = ({ k = 1 }) => (
  <AbsoluteFill
    style={{
      background: `radial-gradient(ellipse 75% 70% at 50% 48%, transparent 55%, rgba(3,2,12,${0.75 * k}) 100%)`,
    }}
  />
);

// Warm light leak that blooms in, drifts across frame, and burns out.
export const LightLeak: React.FC<{ at: number; dur?: number; seed?: string; strength?: number }> = ({ at, dur = 22, seed = "l", strength = 0.8 }) => {
  const f = useCurrentFrame();
  if (f < at || f > at + dur) return null;
  const t = (f - at) / dur;
  const a = Math.sin(Math.PI * t) ** 1.5 * strength;
  const x0 = random(seed) * 60 + 10;
  const x = x0 + t * 25;
  const y = 20 + random(seed + "y") * 50;
  return (
    <AbsoluteFill style={{ mixBlendMode: "screen", opacity: a, pointerEvents: "none" }}>
      <AbsoluteFill style={{ background: `radial-gradient(ellipse 45% 70% at ${x}% ${y}%, ${C.amber}cc, transparent 70%)` }} />
      <AbsoluteFill style={{ background: `radial-gradient(ellipse 30% 45% at ${x + 12}% ${y + 10}%, ${C.goldHot}aa, transparent 70%)` }} />
      <AbsoluteFill style={{ background: `linear-gradient(${100 + t * 30}deg, transparent 30%, ${C.pink}33 50%, transparent 70%)` }} />
    </AbsoluteFill>
  );
};

// Brief exposure flash used on hard cuts.
export const CutFlash: React.FC<{ at: number; len?: number; color?: string }> = ({ at, len = 5, color = C.goldHot }) => {
  const f = useCurrentFrame();
  const a = lerp(f, [at - 1, at, at + len], [0, 0.55, 0]);
  if (a <= 0) return null;
  return <AbsoluteFill style={{ background: color, opacity: a, mixBlendMode: "screen" }} />;
};
