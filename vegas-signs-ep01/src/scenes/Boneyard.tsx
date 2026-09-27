import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { Camera, Layer } from "../components/Camera";
import { Bulb, NeonPath } from "../components/Neon";
import { Stars } from "../components/Scenery";
import { Counter } from "../components/Hud";
import { C, FONT, s } from "../theme";
import { neon } from "../lib";

// Dusk in the boneyard: retired letters and arrows in three depth planes, one tube still sputtering.
const Letter: React.FC<{ ch: string; x: number; y: number; size: number; rot: number; fill: string; rim?: string }> = ({ ch, x, y, size, rot, fill, rim = C.amber }) => (
  <div style={{ position: "absolute", left: x, top: y, transform: `rotate(${rot}deg)`, fontFamily: FONT.title, fontWeight: 600, fontSize: size, lineHeight: 1, color: fill, WebkitTextStroke: `2px ${rim}55`, textShadow: `-3px -2px 0 ${rim}40` }}>
    {ch}
  </div>
);

export const Boneyard: React.FC = () => {
  const f = useCurrentFrame();
  const sputter = neon(f, "bone", 6, 16, 0.12);
  const arrowBulbs = Array.from({ length: 16 }, (_, i) => ({ x: 40 + i * 34, dead: [2, 5, 6, 11, 14].includes(i) }));
  return (
    <AbsoluteFill style={{ background: `linear-gradient(180deg, ${C.night0} 0%, ${C.night2} 45%, #7a4a8c 72%, ${C.amber} 92%, #3a1e3a 100%)` }}>
      <Camera keys={[{ f: 0, x: -220, y: 10, z: 1.08 }, { f: s(5.3), x: 200, y: -10, z: 1.16 }]}>
        <Layer depth={0.15}><Stars n={80} seed="st6" maxY={0.35} /></Layer>
        <Layer depth={0.45}>
          <div style={{ position: "absolute", left: -400, right: -400, top: 860, height: 400, background: "#1a0f2e" }} />
          {"NUGGETSAHARAMINT".split("").map((ch, i) => <Letter key={i} ch={ch} x={-300 + i * 170} y={700 + ((i * 37) % 60)} size={150 + ((i * 53) % 90)} rot={((i * 29) % 30) - 15} fill="#20143a" rim={C.haze} />)}
        </Layer>
        <Layer depth={1}>
          <div style={{ position: "absolute", left: -600, right: -600, top: 900, height: 400, background: "#0e0820" }} />
          <Letter ch="S" x={180} y={420} size={520} rot={-8} fill="#150c2a" />
          <Letter ch="A" x={1320} y={470} size={440} rot={12} fill="#150c2a" />
          {/* a starburst, half its points gone */}
          <svg width={400} height={400} style={{ position: "absolute", left: 760, top: 360, overflow: "visible" }}>
            {Array.from({ length: 10 }, (_, j) => j % 3 === 1 ? null : <line key={j} x1={200} y1={200} x2={200 + Math.cos(j * 0.628) * 170} y2={200 + Math.sin(j * 0.628) * 170} stroke="#1c1236" strokeWidth={18} strokeLinecap="round" />)}
            <circle cx={200} cy={200} r={36} fill="#1c1236" />
          </svg>
          {/* the one tube still hanging on */}
          <svg width={1920} height={1080} style={{ position: "absolute", overflow: "visible" }}>
            <g transform="translate(700 760) rotate(-6)">
              <NeonPath d="M0,0 C60,-70 140,-70 200,0 S340,70 400,0" color={C.pink} k={sputter} w={8} />
            </g>
          </svg>
          {/* bulb arrow with dead lamps */}
          <svg width={700} height={160} style={{ position: "absolute", left: 1040, top: 800, overflow: "visible", transform: "rotate(4deg)" }}>
            <path d="M0,40 L560,40 L560,0 L660,70 L560,140 L560,100 L0,100 Z" fill="#1c1236" stroke="#2a1d48" strokeWidth={4} />
            {arrowBulbs.map((b, i) => <Bulb key={i} x={b.x} y={70} r={7} on={b.dead ? 0 : 0.55 + 0.35 * Math.sin(f * 0.2 + i)} />)}
          </svg>
        </Layer>
        <Layer depth={1.9}>
          <Letter ch="O" x={-260} y={380} size={900} rot={-4} fill="#07040f" />
          <Letter ch="N" x={1620} y={520} size={760} rot={9} fill="#07040f" />
        </Layer>
      </Camera>
      <Counter to={250} start={s(0.7)} dur={s(2.4)} label="RETIRED SIGNS" suffix="+" x={96} y={200} size={96} align="right" />
    </AbsoluteFill>
  );
};
