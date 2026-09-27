import React, { useMemo } from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { noise2D } from "@remotion/noise";
import { Camera, Layer } from "../components/Camera";
import { C, EASE, FONT, s } from "../theme";
import { lerp, rng } from "../lib";

// Vintage survey map: rail line draws across the Mojave, a pin drops, townsite lots fill in.
const RAIL = "M160,900 C420,820 560,760 760,640 S1060,470 1140,430 S1500,250 1780,150";
const PIN = { x: 1140, y: 430 };

const Contours: React.FC = () => {
  const paths = useMemo(() => {
    const out: string[] = [];
    for (let r = 0; r < 9; r++) {
      for (const [cx, cy, sc] of [[520, 320, 1], [1500, 780, 1.3], [300, 620, 0.7]] as const) {
        const pts: string[] = [];
        for (let a = 0; a <= 64; a++) {
          const th = (a / 64) * Math.PI * 2;
          const rad = (40 + r * 34) * sc * (1 + 0.28 * noise2D(`c${cx}`, Math.cos(th) * 1.2 + r * 0.1, Math.sin(th) * 1.2));
          pts.push(`${(cx + Math.cos(th) * rad * 1.5).toFixed(1)},${(cy + Math.sin(th) * rad).toFixed(1)}`);
        }
        out.push(`M${pts.join(" L")} Z`);
      }
    }
    return out;
  }, []);
  return (
    <svg width={1920} height={1080} style={{ position: "absolute", overflow: "visible" }}>
      {paths.map((d, i) => <path key={i} d={d} fill="none" stroke={C.haze} strokeWidth={1} opacity={0.22} />)}
    </svg>
  );
};

export const Rail: React.FC = () => {
  const f = useCurrentFrame();
  const draw = lerp(f, [4, s(2.6)], [0, 1], EASE.inOut);
  const pinDrop = lerp(f, [s(2.0), s(2.5)], [-140, 0], EASE.out);
  const pinA = lerp(f, [s(2.0), s(2.15)], [0, 1]);
  const ring = (f - s(2.5)) / 24;
  const lotsT = lerp(f, [s(3.1), s(5.6)], [0, 1]);
  const trainT = lerp(f, [0, s(6.4)], [0.02, 0.95], EASE.cam);
  const lots = useMemo(() => {
    const out: { x: number; y: number; d: number }[] = [];
    for (let gx = -5; gx <= 5; gx++) for (let gy = -3; gy <= 3; gy++) {
      if (gx === 0) continue; // Fremont Street runs up the middle
      const d = Math.hypot(gx, gy * 1.3) / 7 + rng(`lot${gx}${gy}`) * 0.25;
      out.push({ x: PIN.x + gx * 26 - 10, y: PIN.y + gy * 22 + 26, d });
    }
    return out;
  }, []);
  return (
    <AbsoluteFill style={{ background: `radial-gradient(ellipse 90% 80% at 55% 45%, ${C.night2}, ${C.night0} 80%)` }}>
      <Camera keys={[{ f: 0, x: -60, y: 40, z: 1.02 }, { f: s(2.6), x: 40, y: -10, z: 1.12 }, { f: s(6.4), x: 300, y: -140, z: 2.05 }]}>
        <Layer depth={0.45}>
          <Contours />
          <AbsoluteFill style={{ backgroundImage: `linear-gradient(${C.haze}22 1px, transparent 1px), linear-gradient(90deg, ${C.haze}22 1px, transparent 1px)`, backgroundSize: "120px 120px", transform: "scale(1.6)" }} />
        </Layer>
        <Layer depth={1}>
          <svg width={1920} height={1080} style={{ position: "absolute", overflow: "visible" }}>
            <path d={RAIL} fill="none" stroke={C.gold} strokeWidth={14} opacity={0.18} pathLength={1} strokeDasharray={`${draw} 1`} style={{ filter: "blur(6px)" }} />
            <path d={RAIL} fill="none" stroke={C.gold} strokeWidth={3.5} pathLength={1} strokeDasharray={`${draw} 1`} />
            <path d={RAIL} fill="none" stroke={C.night0} strokeWidth={1.5} pathLength={1} strokeDasharray="0.004 0.006" opacity={draw > 0.99 ? 0.8 : 0} />
            <text x={150} y={950} fill={C.cream} fontFamily={FONT.mono} fontSize={16} letterSpacing="0.25em" opacity={lerp(f, [4, 14], [0, 0.8])}>LOS ANGELES ↙</text>
            <text x={1640} y={120} fill={C.cream} fontFamily={FONT.mono} fontSize={16} letterSpacing="0.25em" opacity={lerp(f, [s(2.2), s(2.6)], [0, 0.8])}>SALT LAKE CITY ↗</text>
            <text x={600} y={560} fill={C.haze} fontFamily={FONT.title} fontSize={40} letterSpacing="0.6em" opacity={0.55}>MOJAVE DESERT</text>
            {lots.map((l, i) => {
              const on = lerp(lotsT, [l.d * 0.8, l.d * 0.8 + 0.08], [0, 1]);
              return <rect key={i} x={l.x} y={l.y} width={20} height={16} fill={C.gold} opacity={0.08 + 0.55 * on} stroke={C.goldHot} strokeWidth={0.8} strokeOpacity={on} />;
            })}
            <rect x={PIN.x - 10} y={PIN.y - 50} width={6} height={140} fill={C.cream} opacity={0.6 * lotsT} />
            {ring > 0 && ring < 1.4 ? <circle cx={PIN.x} cy={PIN.y} r={10 + ring * 90} fill="none" stroke={C.goldHot} strokeWidth={2} opacity={1 - ring / 1.4} /> : null}
            <g transform={`translate(${PIN.x} ${PIN.y + pinDrop})`} opacity={pinA}>
              <circle r={26} fill={C.amber} opacity={0.35} style={{ filter: "blur(8px)" }} />
              <path d="M0,0 C-16,-22 -16,-44 0,-48 C16,-44 16,-22 0,0 Z" fill={C.goldHot} />
              <circle cy={-34} r={6} fill={C.night0} />
            </g>
            <g opacity={lerp(f, [s(2.6), s(3.0)], [0, 1])}>
              <line x1={PIN.x + 20} y1={PIN.y - 30} x2={PIN.x + 110} y2={PIN.y - 110} stroke={C.cream} strokeWidth={1} />
              <text x={PIN.x + 118} y={PIN.y - 112} fill={C.cream} fontFamily={FONT.mono} fontSize={15} letterSpacing="0.2em">LAS VEGAS</text>
              <text x={PIN.x + 118} y={PIN.y - 90} fill={C.gold} fontFamily={FONT.mono} fontSize={12} letterSpacing="0.2em">TOWNSITE AUCTION</text>
            </g>
          </svg>
          <Train t={trainT} />
        </Layer>
        <Layer depth={1.9}>
          {[0, 1, 2].map((i) => (
            <div key={i} style={{ position: "absolute", left: 200 + i * 700 - f * (1.4 + i * 0.3), top: 120 + i * 300, width: 700, height: 260, borderRadius: "50%", background: `radial-gradient(ellipse, ${C.haze}30, transparent 65%)`, filter: "blur(20px)" }} />
          ))}
        </Layer>
      </Camera>
    </AbsoluteFill>
  );
};

// Headlight dot riding the line, sampled with an offscreen SVG path.
const Train: React.FC<{ t: number }> = ({ t }) => {
  const p = useMemo(() => {
    if (typeof document === "undefined") return null;
    const el = document.createElementNS("http://www.w3.org/2000/svg", "path");
    el.setAttribute("d", RAIL);
    return el;
  }, []);
  if (!p) return null;
  const L = p.getTotalLength();
  const a = p.getPointAtLength(L * t);
  const trail = [0.012, 0.024, 0.036, 0.05].map((d) => p.getPointAtLength(L * Math.max(0, t - d)));
  return (
    <svg width={1920} height={1080} style={{ position: "absolute", overflow: "visible" }}>
      {trail.map((q, i) => <circle key={i} cx={q.x} cy={q.y} r={5 - i} fill={C.amber} opacity={0.5 - i * 0.1} />)}
      <circle cx={a.x} cy={a.y} r={22} fill={C.goldHot} opacity={0.35} style={{ filter: "blur(6px)" }} />
      <circle cx={a.x} cy={a.y} r={6} fill="#fffbe8" />
    </svg>
  );
};
