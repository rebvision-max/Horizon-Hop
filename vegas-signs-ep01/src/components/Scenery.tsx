import React, { useMemo } from "react";
import { AbsoluteFill, random, useCurrentFrame } from "remotion";
import { noise2D } from "@remotion/noise";
import { C } from "../theme";

export const Sky: React.FC<{ top?: string; mid?: string; bottom?: string; horizon?: number }> = ({ top = C.night0, mid = C.night1, bottom = C.violet, horizon = 78 }) => (
  <AbsoluteFill style={{ background: `linear-gradient(180deg, ${top} 0%, ${mid} ${horizon * 0.55}%, ${bottom} ${horizon}%, ${C.night1} 100%)` }} />
);

export const Stars: React.FC<{ n?: number; seed?: string; maxY?: number; w?: number; h?: number }> = ({ n = 160, seed = "st", maxY = 0.7, w = 2300, h = 1400 }) => {
  const f = useCurrentFrame();
  const stars = useMemo(
    () => Array.from({ length: n }, (_, i) => ({ x: random(`${seed}x${i}`) * w - (w - 1920) / 2, y: random(`${seed}y${i}`) * h * maxY - (h - 1080) / 2, r: 0.6 + random(`${seed}r${i}`) ** 3 * 2.2 })),
    [n, seed, maxY, w, h],
  );
  return (
    <svg width={1920} height={1080} style={{ position: "absolute", overflow: "visible" }}>
      {stars.map((s, i) => (
        <circle key={i} cx={s.x} cy={s.y} r={s.r} fill={C.cream} opacity={0.35 + 0.35 * (0.5 + 0.5 * noise2D(seed, i, f * 0.05))} />
      ))}
    </svg>
  );
};

// Layered mountain ridge silhouette with a faint rim light on top.
export const Ridge: React.FC<{ seed: string; base: number; amp: number; color: string; rim?: string; width?: number; rough?: number }> = ({ seed, base, amp, color, rim, width = 2600, rough = 1 }) => {
  const d = useMemo(() => {
    const pts: string[] = [];
    const x0 = -(width - 1920) / 2;
    for (let x = 0; x <= width; x += 20) {
      const y = base - amp * (0.55 * (0.5 + 0.5 * noise2D(seed, x * 0.0012, 0)) + 0.3 * rough * (0.5 + 0.5 * noise2D(seed + "b", x * 0.005, 1)) + 0.15 * rough * noise2D(seed + "c", x * 0.02, 2));
      pts.push(`${x0 + x},${y.toFixed(1)}`);
    }
    return `M${x0},1400 L${pts.join(" L")} L${x0 + width},1400 Z`;
  }, [seed, base, amp, width, rough]);
  return (
    <svg width={1920} height={1080} style={{ position: "absolute", overflow: "visible" }}>
      <path d={d} fill={color} />
      {rim ? <path d={d} fill="none" stroke={rim} strokeWidth={1.5} opacity={0.55} /> : null}
    </svg>
  );
};

// Pixel-window skyline, the series' signature graphic.
export const Skyline: React.FC<{ seed: string; base: number; minH: number; maxH: number; color: string; windowColor?: string; density?: number; width?: number; x0?: number; bw?: [number, number] }> = ({
  seed, base, minH, maxH, color, windowColor = C.gold, density = 0.35, width = 2600, x0, bw = [70, 180],
}) => {
  const f = useCurrentFrame();
  const bldgs = useMemo(() => {
    const out: { x: number; w: number; h: number; wins: { x: number; y: number; flick: boolean }[] }[] = [];
    let x = x0 ?? -(width - 1920) / 2;
    let i = 0;
    while (x < (x0 ?? -(width - 1920) / 2) + width) {
      const w = bw[0] + random(`${seed}w${i}`) * (bw[1] - bw[0]);
      const h = minH + random(`${seed}h${i}`) ** 1.6 * (maxH - minH);
      const wins: { x: number; y: number; flick: boolean }[] = [];
      for (let wy = 14; wy < h - 10; wy += 16) {
        for (let wx = 10; wx < w - 12; wx += 14) {
          if (random(`${seed}${i}-${wx}-${wy}`) < density) wins.push({ x: wx, y: wy, flick: random(`${seed}f${i}-${wx}-${wy}`) < 0.04 });
        }
      }
      out.push({ x, w, h, wins });
      x += w + random(`${seed}g${i}`) * 8;
      i++;
    }
    return out;
  }, [seed, minH, maxH, density, width, x0, bw]);
  return (
    <svg width={1920} height={1080} style={{ position: "absolute", overflow: "visible" }}>
      {bldgs.map((b, i) => (
        <g key={i} transform={`translate(${b.x},${base - b.h})`}>
          <rect width={b.w} height={b.h + 400} fill={color} />
          {b.wins.map((w, j) => (
            <rect key={j} x={w.x} y={w.y} width={6} height={8} fill={windowColor} opacity={w.flick ? (random(`${seed}${i}${j}${Math.floor(f / 6)}`) < 0.5 ? 0.15 : 0.85) : 0.72} />
          ))}
        </g>
      ))}
    </svg>
  );
};

export const Haze: React.FC<{ y: number; color?: string; opacity?: number; h?: number }> = ({ y, color = C.haze, opacity = 0.35, h = 260 }) => (
  <div style={{ position: "absolute", left: -300, right: -300, top: y - h / 2, height: h, background: `radial-gradient(ellipse 60% 50% at 50% 50%, ${color}, transparent 70%)`, opacity }} />
);
