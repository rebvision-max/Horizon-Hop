import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { Camera, Layer } from "../components/Camera";
import { NeonPath, NeonText } from "../components/Neon";
import { C, s } from "../theme";
import { lerp, neon, rng } from "../lib";

// Black → one tube strikes → pull back to an arrow sign → the arrow flips ("did it backwards").
const ARROW = "M-330,0 L250,0 M150,-110 L290,0 L150,110";

export const ColdOpen: React.FC = () => {
  const f = useCurrentFrame();
  const kTube = neon(f, "tube", 10, 20);
  const kWord = neon(f, "word", s(2.1), 14);
  const flip = s(4.85);
  const flipT = lerp(f, [flip, flip + 7], [1, -1]);
  const kFlip = f >= flip - 2 && f < flip + 9 ? neon(f, "flip", flip - 2, 11) : 1;
  const k = kTube * kFlip;
  const wallLight = k * 0.9;
  const glass = lerp(f, [10, 16], [0, 1]);
  return (
    <AbsoluteFill style={{ background: C.ink }}>
      <Camera keys={[{ f: 0, x: -180, y: 10, z: 3.4 }, { f: s(1.4), x: -150, y: 10, z: 3.1 }, { f: s(3.8), x: 0, y: 0, z: 1.05 }, { f: s(6.6), x: 30, y: -10, z: 0.96 }]}>
        <Layer depth={0.55}>
          {/* brick wall catching the sign's spill light */}
          <AbsoluteFill
            style={{
              opacity: 0.12 + 0.55 * wallLight,
              backgroundImage: `linear-gradient(0deg, rgba(0,0,0,0.55) 2px, transparent 2px), linear-gradient(90deg, rgba(0,0,0,0.5) 2px, transparent 2px)`,
              backgroundSize: "92px 36px, 184px 72px",
              backgroundColor: C.night1,
              maskImage: "radial-gradient(ellipse 55% 50% at 50% 50%, black 10%, transparent 75%)",
              transform: "scale(1.8)",
            }}
          />
          <AbsoluteFill style={{ background: `radial-gradient(ellipse 40% 32% at 50% 50%, ${C.amber}55, transparent 70%)`, opacity: wallLight }} />
        </Layer>
        <Layer depth={1} style={{ opacity: glass }}>
          <svg width={1920} height={1080} style={{ position: "absolute", overflow: "visible" }}>
            <g transform={`translate(960 470) scale(${flipT} 1)`}>
              <NeonPath d={ARROW} color={C.gold} k={k} w={9} />
            </g>
            {/* mounting brackets */}
            <rect x={640} y={410} width={6} height={120} fill="#1a1530" />
            <rect x={1290} y={410} width={6} height={120} fill="#1a1530" />
          </svg>
          <div style={{ position: "absolute", left: 0, right: 0, top: 610, display: "flex", justifyContent: "center" }}>
            <div style={{ opacity: lerp(f, [s(1.9), s(2.1)], [0, 1]) }}><NeonText text="THIS WAY" color={C.pink} k={kWord * kFlip} size={96} track={0.34} /></div>
          </div>
        </Layer>
        <Layer depth={1.8}>
          {Array.from({ length: 26 }, (_, i) => {
            const x = rng(`m${i}`) * 2200 - 140;
            const y = ((rng(`my${i}`) * 1200 + f * (0.6 + rng(`ms${i}`))) % 1200) - 60;
            return <div key={i} style={{ position: "absolute", left: x, top: y, width: 3, height: 3, borderRadius: 3, background: C.goldHot, opacity: 0.25 * k, filter: "blur(1px)" }} />;
          })}
        </Layer>
      </Camera>
    </AbsoluteFill>
  );
};
