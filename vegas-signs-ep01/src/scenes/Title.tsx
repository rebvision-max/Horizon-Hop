import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { Camera, Layer } from "../components/Camera";
import { NeonText } from "../components/Neon";
import { Skyline, Sky, Stars } from "../components/Scenery";
import { C, EASE, FONT, s } from "../theme";
import { lerp, neon } from "../lib";

const WORDS = ["BUILT", "OUT", "OF", "LIGHT."];

export const Title: React.FC = () => {
  const f = useCurrentFrame();
  const track = lerp(f, [0, s(3.6)], [0.26, 0.14], EASE.out);
  const wipe = lerp(f, [s(1.3), s(2.3)], [0, 1], EASE.out);
  const out = lerp(f, [s(3.8), s(4.2)], [1, 0]);
  return (
    <AbsoluteFill style={{ opacity: out }}>
      <Sky horizon={96} />
      <Camera keys={[{ f: 0, x: 0, y: 0, z: 1.0 }, { f: s(4.2), x: 0, y: -10, z: 1.06 }]}>
        <Layer depth={0.3}><Stars n={120} seed="st8" maxY={0.8} /></Layer>
        <Layer depth={0.8}><Skyline seed="ttl" base={1100} minH={60} maxH={180} color="#0a0724" density={0.25} /></Layer>
        <Layer depth={1}>
          <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", flexDirection: "column" }}>
            <div style={{ display: "flex", gap: "0.32em", fontSize: 140, marginTop: -60 }}>
              {WORDS.map((w, i) => <NeonText key={i} text={w} color={i === 3 ? C.gold : C.cream} k={neon(f, `t${i}`, 2 + i * 5, 12)} size={140} track={track} weight={600} />)}
            </div>
            <div style={{ width: 1200 * wipe, height: 3, marginTop: 28, background: `linear-gradient(90deg, ${C.amber}00, ${C.gold}, ${C.amber}00)`, boxShadow: `0 0 18px ${C.gold}` }} />
            <div style={{ marginTop: 26, fontFamily: FONT.mono, fontSize: 24, letterSpacing: "0.5em", color: "#cbbcf5", opacity: lerp(f, [s(1.8), s(2.4)], [0, 1]) }}>
              HOW SIGNS MADE LAS VEGAS
            </div>
          </AbsoluteFill>
        </Layer>
      </Camera>
    </AbsoluteFill>
  );
};
