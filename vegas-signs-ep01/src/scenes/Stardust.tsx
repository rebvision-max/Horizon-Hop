import React, { useMemo } from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { Camera, Layer } from "../components/Camera";
import { Bulb, NeonText } from "../components/Neon";
import { Ridge, Sky, Stars } from "../components/Scenery";
import { Counter, Kicker } from "../components/Hud";
import { C, EASE, FONT, s } from "../theme";
import { lerp, neon, rng } from "../lib";

// Space-age facade rebuild: bulbs ignite in a sweep, chase, planets orbit. Truck move along the Strip.
const X0 = -340, X1 = 2260, TOP = 330, BOT = 800;

export const Stardust: React.FC = () => {
  const f = useCurrentFrame();
  const sweep = lerp(f, [s(1.5), s(2.6)], [X0 - 200, X1 + 200], EASE.inOut);
  const bulbs = useMemo(() => {
    const out: { x: number; y: number; row: number }[] = [];
    for (let x = X0 + 20; x < X1; x += 26) {
      out.push({ x, y: TOP + 18, row: 0 }, { x, y: TOP + 44, row: 1 }, { x, y: BOT - 44, row: 2 }, { x, y: BOT - 18, row: 3 });
    }
    return out;
  }, []);
  const bursts = useMemo(() => Array.from({ length: 12 }, (_, i) => ({ x: X0 + 120 + i * 215 + rng(`bx${i}`) * 60, y: TOP + 110 + rng(`by${i}`) * 260, r: 28 + rng(`br${i}`) * 36 })), []);
  const planets = [
    { cx: 150, cy: 560, rx: 260, ry: 90, r: 34, c: C.cyan, sp: 0.03, ring: true },
    { cx: 960, cy: 560, rx: 520, ry: 150, r: 26, c: C.pink, sp: -0.022, ring: false },
    { cx: 1800, cy: 540, rx: 300, ry: 100, r: 40, c: C.gold, sp: 0.026, ring: true },
  ];
  const kWord = neon(f, "sd", s(1.9), 12);
  return (
    <AbsoluteFill>
      <Sky horizon={86} />
      <Camera keys={[{ f: 0, x: -330, y: 20, z: 1.22 }, { f: s(7.8), x: 330, y: -10, z: 1.1 }]}>
        <Layer depth={0.2}><Stars n={180} seed="st3" maxY={0.4} /></Layer>
        <Layer depth={0.35}><Ridge seed="sp" base={860} amp={130} color="#1b1350" rim={C.haze} /></Layer>
        <Layer depth={1}>
          <svg width={1920} height={1080} style={{ position: "absolute", overflow: "visible" }}>
            <defs>
              <linearGradient id="lunar" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor="#22185c" /><stop offset="1" stopColor="#3b2a86" />
              </linearGradient>
            </defs>
            <rect x={X0} y={TOP} width={X1 - X0} height={BOT - TOP} fill="url(#lunar)" stroke="#120c33" strokeWidth={6} />
            {/* painted lunar craters */}
            {Array.from({ length: 22 }, (_, i) => <ellipse key={i} cx={X0 + rng(`cx${i}`) * (X1 - X0)} cy={TOP + 80 + rng(`cy${i}`) * 340} rx={14 + rng(`cr${i}`) * 40} ry={6 + rng(`cq${i}`) * 14} fill="#150f40" opacity={0.6} />)}
            {planets.map((p, i) => {
              const a = f * p.sp + i * 2;
              const px = p.cx + Math.cos(a) * p.rx, py = p.cy + Math.sin(a) * p.ry;
              const on = f > s(1.5) + i * 6 ? 1 : 0.15;
              return (
                <g key={i} opacity={on}>
                  <ellipse cx={p.cx} cy={p.cy} rx={p.rx} ry={p.ry} fill="none" stroke={p.c} strokeWidth={1.5} strokeDasharray="4 10" opacity={0.45} />
                  <circle cx={px} cy={py} r={p.r * 1.8} fill={p.c} opacity={0.2} style={{ filter: "blur(10px)" }} />
                  <circle cx={px} cy={py} r={p.r} fill={p.c} />
                  {p.ring ? <ellipse cx={px} cy={py} rx={p.r * 1.9} ry={p.r * 0.5} fill="none" stroke={C.cream} strokeWidth={3} transform={`rotate(-18 ${px} ${py})`} /> : null}
                </g>
              );
            })}
            {bursts.map((b, i) => {
              const k = sweep > b.x ? neon(f, `burst${i}`, 0, 0) * (0.6 + 0.4 * Math.sin(f * 0.35 + i)) : 0.08;
              return (
                <g key={i} transform={`translate(${b.x} ${b.y}) rotate(${f * 0.6 + i * 20})`} opacity={0.3 + 0.7 * k}>
                  {Array.from({ length: 8 }, (_, j) => <line key={j} x1={0} y1={0} x2={Math.cos((j / 8) * Math.PI * 2) * b.r * (j % 2 ? 0.55 : 1)} y2={Math.sin((j / 8) * Math.PI * 2) * b.r * (j % 2 ? 0.55 : 1)} stroke={C.goldHot} strokeWidth={3} strokeLinecap="round" />)}
                  <circle r={5} fill="#fffbe8" />
                </g>
              );
            })}
            {bulbs.map((b, i) => {
              const lit = sweep > b.x;
              const chase = (Math.floor(b.x / 26) + (b.row % 2 ? -1 : 1) * Math.floor(f / 2)) % 5;
              return <Bulb key={i} x={b.x} y={b.y} r={6} on={lit ? (Math.abs(chase) === 0 ? 0.25 : 0.95) : 0.08} />;
            })}
          </svg>
          <div style={{ position: "absolute", left: 0, right: 0, top: 440, display: "flex", justifyContent: "center" }}>
            <NeonText text="STARDUST" color={C.gold} k={kWord} size={210} track={0.2} weight={600} />
          </div>
          {/* 217 FT dimension line */}
          <svg width={1920} height={1080} style={{ position: "absolute", overflow: "visible", opacity: lerp(f, [s(2.4), s(2.8)], [0, 1]) }}>
            {(() => {
              const w = lerp(f, [s(2.4), s(3.6)], [0, 1], EASE.out);
              const mid = (X0 + X1) / 2, half = ((X1 - X0) / 2) * w;
              return (
                <g stroke={C.cream} strokeWidth={1.5}>
                  <line x1={mid - half} y1={TOP - 34} x2={mid + half} y2={TOP - 34} />
                  <line x1={mid - half} y1={TOP - 46} x2={mid - half} y2={TOP - 22} />
                  <line x1={mid + half} y1={TOP - 46} x2={mid + half} y2={TOP - 22} />
                  <rect x={mid - 70} y={TOP - 50} width={140} height={32} fill={C.night0} stroke="none" />
                  <text x={mid} y={TOP - 27} fill={C.gold} stroke="none" textAnchor="middle" fontFamily={FONT.mono} fontSize={20} letterSpacing="0.25em">217 FT</text>
                </g>
              );
            })()}
          </svg>
        </Layer>
        <Layer depth={1.6}>
          {/* Strip traffic: headlight / taillight streaks */}
          {Array.from({ length: 7 }, (_, i) => {
            const dir = i % 2 ? 1 : -1;
            const x = ((rng(`car${i}`) * 3000 + dir * f * (26 + i * 3)) % 3000 + 3000) % 3000 - 540;
            return <div key={i} style={{ position: "absolute", left: x, top: 960 + (i % 2) * 34, width: 260, height: 5, borderRadius: 4, background: `linear-gradient(90deg, transparent, ${dir > 0 ? C.goldHot : "#ff4040"})`, transform: dir < 0 ? "scaleX(-1)" : undefined, boxShadow: `0 0 16px ${dir > 0 ? C.goldHot : "#ff4040"}`, opacity: 0.85 }} />;
          })}
          <div style={{ position: "absolute", left: -600, right: -600, top: 1010, height: 200, background: "#040310" }} />
        </Layer>
      </Camera>
      <Kicker text="SIGN WARS" start={s(0.25)} end={s(2.0)} x={960} y={150} size={92} align="center" />
      <Counter to={11000} start={s(2.3)} dur={s(2.7)} label="BULBS" x={96} y={170} size={84} align="right" fade={[s(7.2), s(7.7)]} />
    </AbsoluteFill>
  );
};
