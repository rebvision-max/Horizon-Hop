import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { Camera, Layer } from "../components/Camera";
import { Bulb, NeonText } from "../components/Neon";
import { Ridge, Sky, Stars } from "../components/Scenery";
import { Counter } from "../components/Hud";
import { C, EASE, FONT, s } from "../theme";
import { lerp, neon } from "../lib";

// 180-ft pylon: tilt from the road to the crown, pull back, x-ray cutaway of the elevator in the leg.
const GROUND = 1900, TOPY = -960;
const LEG_L = [690, 770], LEG_R = [1150, 1230];
const PANEL = { x: 770, w: 380, y: -880, h: 1340 };
const KEYS = [
  { f: 0, x: 0, y: 900, z: 1 },
  { f: s(3.3), x: 0, y: -1120, z: 1 },
  { f: s(4.3), x: 0, y: -26, z: 0.33 },
  { f: s(7.5), x: 0, y: -30, z: 0.355 },
];
const toScreenY = (wy: number, z: number, cy: number) => 540 + (wy - 540) * z - cy;

export const Pylon: React.FC = () => {
  const f = useCurrentFrame();
  const cz = lerp(f, KEYS.map((k) => k.f), KEYS.map((k) => k.z), EASE.cam);
  const cy = lerp(f, KEYS.map((k) => k.f), KEYS.map((k) => k.y), EASE.cam);
  const xray = lerp(f, [s(4.1), s(4.6)], [0, 1]);
  const carT = lerp(f, [s(4.5), s(7.2)], [0, 1], EASE.inOut);
  const carY = GROUND - 60 - carT * (GROUND - 60 - (TOPY + 120));
  const letters = "DUNES".split("");
  const chase = Math.floor(f / 2);
  const panelBulbs: { x: number; y: number }[] = [];
  for (let y = PANEL.y + 14; y < PANEL.y + PANEL.h; y += 30) panelBulbs.push({ x: PANEL.x + 14, y }, { x: PANEL.x + PANEL.w - 14, y });
  const carScreenY = toScreenY(carY, cz, cy);
  return (
    <AbsoluteFill>
      <Sky horizon={90} />
      <Camera keys={KEYS}>
        <Layer depth={0.12}><Stars n={220} seed="st4" maxY={1} h={2600} /></Layer>
        <Layer depth={0.3}><Ridge seed="py" base={1150} amp={200} color="#1b1350" rim={C.haze} /></Layer>
        <Layer depth={1}>
          <svg width={1920} height={1080} style={{ position: "absolute", overflow: "visible" }}>
            <defs>
              <pattern id="hatch" width="18" height="18" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
                <line x1="0" y1="0" x2="0" y2="18" stroke={C.cyan} strokeWidth="1.2" opacity="0.5" />
              </pattern>
            </defs>
            {/* ground + road */}
            <rect x={-2400} y={GROUND} width={6720} height={1400} fill="#07051a" />
            <rect x={-2400} y={GROUND + 60} width={6720} height={8} fill={C.gold} opacity={0.35} />
            {/* legs */}
            {[LEG_L, LEG_R].map(([a, b], i) => (
              <g key={i}>
                <rect x={a} y={TOPY + 60} width={b - a} height={GROUND - TOPY - 60} fill={i === 1 ? `rgba(8,6,26,${1 - xray * 0.85})` : "#0a0824"} stroke="#2a2250" strokeWidth={3} />
                {Array.from({ length: 40 }, (_, j) => <rect key={j} x={a + 10} y={TOPY + 100 + j * 70} width={b - a - 20} height={2} fill="#2a2250" />)}
              </g>
            ))}
            {/* x-ray of the right leg */}
            <g opacity={xray}>
              <rect x={LEG_R[0]} y={TOPY + 60} width={LEG_R[1] - LEG_R[0]} height={GROUND - TOPY - 60} fill="url(#hatch)" stroke={C.cyan} strokeWidth={4} />
              <line x1={LEG_R[0] + 22} y1={TOPY + 80} x2={LEG_R[0] + 22} y2={GROUND} stroke={C.cyan} strokeWidth={3} strokeDasharray="20 12" />
              <line x1={LEG_R[1] - 22} y1={TOPY + 80} x2={LEG_R[1] - 22} y2={GROUND} stroke={C.cyan} strokeWidth={3} strokeDasharray="20 12" />
              <line x1={(LEG_R[0] + LEG_R[1]) / 2} y1={TOPY + 70} x2={(LEG_R[0] + LEG_R[1]) / 2} y2={carY} stroke={C.cream} strokeWidth={3} />
              <rect x={LEG_R[0] + 8} y={carY} width={LEG_R[1] - LEG_R[0] - 16} height={110} fill={C.goldHot} />
              <rect x={LEG_R[0] - 30} y={carY - 40} width={LEG_R[1] - LEG_R[0] + 60} height={190} fill={C.goldHot} opacity={0.25} style={{ filter: "blur(20px)" }} />
            </g>
            {/* sign panel */}
            <rect x={PANEL.x} y={PANEL.y} width={PANEL.w} height={PANEL.h} fill="#0d0a2a" stroke="#2a2250" strokeWidth={4} />
            <path d={`M${LEG_L[0]},${TOPY + 60} Q960,${TOPY - 180} ${LEG_R[1]},${TOPY + 60} Z`} fill="#0d0a2a" stroke={C.gold} strokeWidth={5} opacity={0.9} />
            {/* 180 FT dimension, reads in the pull-back */}
            <g opacity={xray} stroke={C.cream} strokeWidth={5}>
              <line x1={480} y1={TOPY - 120} x2={480} y2={GROUND} />
              <line x1={440} y1={TOPY - 120} x2={520} y2={TOPY - 120} />
              <line x1={440} y1={GROUND} x2={520} y2={GROUND} />
              {Array.from({ length: 10 }, (_, i) => <line key={i} x1={460} x2={500} y1={GROUND - (i * (GROUND - TOPY + 120)) / 9} y2={GROUND - (i * (GROUND - TOPY + 120)) / 9} />)}
              <text x={400} y={(GROUND + TOPY) / 2} fill={C.gold} stroke="none" textAnchor="end" fontFamily={FONT.title} fontWeight={600} fontSize={190} letterSpacing="0.08em">180 FT</text>
            </g>
            {panelBulbs.map((b, i) => <Bulb key={i} x={b.x} y={b.y} r={6} on={(i / 2 + chase) % 6 < 1 ? 0.2 : 0.95} />)}
          </svg>
          <div style={{ position: "absolute", left: PANEL.x, top: PANEL.y + 30, width: PANEL.w, display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
            {letters.map((l, i) => <NeonText key={i} text={l} color={C.gold} k={neon(f, `dunes${i}`, 2 + i * 3, 10)} size={250} track={0} weight={600} />)}
          </div>
        </Layer>
        <Layer depth={1.25}>
          {/* foreground palms at the roadside */}
          {[260, 1640].map((x, i) => (
            <svg key={i} width={600} height={900} style={{ position: "absolute", left: x - 300, top: GROUND - 740, overflow: "visible" }}>
              <path d={`M300,900 C${290 + i * 20},600 ${310 - i * 20},300 300,120`} stroke="#030210" strokeWidth={22} fill="none" />
              {Array.from({ length: 8 }, (_, j) => {
                const a = (j / 8) * Math.PI * 2;
                return <path key={j} d={`M300,120 Q${300 + Math.cos(a) * 160},${60 + Math.sin(a) * 60} ${300 + Math.cos(a) * 260},${150 + Math.abs(Math.sin(a)) * 110}`} stroke="#030210" strokeWidth={16} fill="none" strokeLinecap="round" />;
              })}
            </svg>
          ))}
        </Layer>
      </Camera>
      <Counter to={180} start={s(0.15)} dur={s(3.1)} label="HEIGHT" suffix="FT" x={96} y={200} size={96} fade={[s(3.9), s(4.3)]} />
      {/* screen-space elevator callout */}
      <div style={{ position: "absolute", left: 1110, top: Math.max(215, carScreenY - 14), // stay clear of the top HUD band
        opacity: xray * lerp(f, [s(7.1), s(7.5)], [1, 0]) }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ width: 90, height: 1.5, background: C.cyan }} />
          <div style={{ fontFamily: FONT.mono, fontSize: 18, letterSpacing: "0.26em", color: C.cyan }}>SERVICE ELEVATOR</div>
        </div>
        <div style={{ marginLeft: 104, marginTop: 6, fontFamily: FONT.mono, fontSize: 30, letterSpacing: "0.12em", color: C.goldHot, fontVariantNumeric: "tabular-nums" }}>
          {String(Math.round(carT * 180)).padStart(3, "0")} FT
        </div>
      </div>
      <div style={{ position: "absolute", left: 96, top: 200, opacity: xray * lerp(f, [s(7.1), s(7.5)], [1, 0]), fontFamily: FONT.mono, color: C.cyan, fontSize: 17, letterSpacing: "0.3em" }}>
        CUTAWAY · RIGHT LEG
      </div>
    </AbsoluteFill>
  );
};
