import React from "react";
import { C, FONT } from "../theme";

// A neon tube: unlit glass is always faintly visible; lit tube = hot core + colored body + bloom.
export const NeonPath: React.FC<{ d: string; color: string; k: number; w?: number; fill?: string }> = ({ d, color, k, w = 7, fill = "none" }) => (
  <g>
    <path d={d} fill="none" stroke="#3a3350" strokeWidth={w + 2} strokeLinecap="round" strokeLinejoin="round" opacity={0.9} />
    {fill !== "none" ? <path d={d} fill={fill} opacity={0.18 * k} /> : null}
    <path d={d} fill="none" stroke={color} strokeWidth={w * 4} strokeLinecap="round" strokeLinejoin="round" opacity={0.28 * k} style={{ filter: "blur(14px)" }} />
    <path d={d} fill="none" stroke={color} strokeWidth={w} strokeLinecap="round" strokeLinejoin="round" opacity={0.25 + 0.75 * k} />
    <path d={d} fill="none" stroke="#fff8ea" strokeWidth={w * 0.35} strokeLinecap="round" strokeLinejoin="round" opacity={0.85 * k} />
  </g>
);

export const NeonText: React.FC<{ text: string; color: string; k: number; size: number; track?: number; weight?: number; style?: React.CSSProperties }> = ({ text, color, k, size, track = 0.1, weight = 500, style }) => (
  <div
    style={{
      fontFamily: FONT.title, fontWeight: weight, fontSize: size, letterSpacing: `${track}em`, lineHeight: 1,
      color: k > 0.05 ? mix(color, k) : "#3a3350",
      textShadow: k > 0.05 ? `0 0 ${3}px #fff8ea, 0 0 ${10 * k}px ${color}, 0 0 ${28 * k}px ${color}, 0 0 ${60 * k}px ${color}88` : "none",
      WebkitTextStroke: `1px ${k > 0.05 ? "#fff3d6" : "#4a4262"}`,
      ...style,
    }}
  >
    {text}
  </div>
);

const mix = (color: string, k: number) => (k > 0.8 ? color : `color-mix(in srgb, ${color} ${Math.round(k * 100)}%, #3a3350)`);

// Incandescent marquee bulb.
export const Bulb: React.FC<{ x: number; y: number; r: number; on: number; color?: string }> = ({ x, y, r, on, color = C.goldHot }) => (
  <g>
    {on > 0.05 ? <circle cx={x} cy={y} r={r * 2.6} fill={color} opacity={0.22 * on} /> : null}
    <circle cx={x} cy={y} r={r} fill={on > 0.05 ? color : "#3d3446"} opacity={0.4 + 0.6 * on} />
    {on > 0.3 ? <circle cx={x - r * 0.25} cy={y - r * 0.25} r={r * 0.4} fill="#fffdf5" opacity={on} /> : null}
  </g>
);
