import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { Camera, Layer } from "../components/Camera";
import { Bulb, NeonPath, NeonText } from "../components/Neon";
import { Skyline, Sky, Stars } from "../components/Scenery";
import { C, EASE, s } from "../theme";
import { lerp, neon } from "../lib";

// Illustrated reconstruction of the 1932 Boulder Club beer-stein sign, pouring in light.
const BODY = "M-120,-120 L-120,140 Q-120,180 -80,180 L80,180 Q120,180 120,140 L120,-120";
const HANDLE = "M120,-70 C230,-70 230,120 120,120 M120,-30 C180,-30 180,80 120,80";
const FOAM = "M-138,-118 C-160,-180 -90,-210 -58,-176 C-38,-230 40,-228 58,-184 C96,-214 160,-180 138,-118 Z";

export const Stein: React.FC = () => {
  const f = useCurrentFrame();
  const kBody = neon(f, "body", 4, 12);
  const pour = lerp(f, [s(0.7), s(3.3)], [0, 1], EASE.inOut);
  const streamOn = f > s(0.6) && f < s(3.6) ? neon(f, "stream", s(0.6), 4) : 0;
  const kFoam = neon(f, "foam", s(3.1), 10);
  const kWord = neon(f, "bc", s(1.4), 14);
  const level = 170 - pour * 290;
  const chase = Math.floor(f / 3);
  const border: { x: number; y: number }[] = [];
  for (let i = 0; i <= 18; i++) border.push({ x: -250 + i * (500 / 18), y: -300 }, { x: -250 + i * (500 / 18), y: 250 });
  for (let i = 1; i < 20; i++) border.push({ x: -250, y: -300 + i * (550 / 20) }, { x: 250, y: -300 + i * (550 / 20) });
  const carX = lerp(f, [s(1.2), s(6.2)], [2300, -700]);
  return (
    <AbsoluteFill>
      <Sky horizon={82} />
      <Camera keys={[{ f: 0, x: -30, y: 70, z: 1.0 }, { f: s(7.1), x: 40, y: -50, z: 1.2 }]}>
        <Layer depth={0.25}><Stars n={120} seed="st2" maxY={0.45} /></Layer>
        <Layer depth={0.4}><Skyline seed="far" base={900} minH={80} maxH={200} color="#1a1348" windowColor={C.haze} density={0.18} /></Layer>
        <Layer depth={0.75}>
          <Skyline seed="mid" base={1000} minH={180} maxH={330} color="#110c33" density={0.22} x0={-500} width={1000} />
          <Skyline seed="mid2" base={1000} minH={180} maxH={330} color="#110c33" density={0.22} x0={1420} width={1000} />
        </Layer>
        <Layer depth={1}>
          {/* the club building */}
          <div style={{ position: "absolute", left: 560, top: 640, width: 800, height: 600, background: "linear-gradient(180deg,#1b1442,#0b0822)", boxShadow: `0 -40px 120px ${C.amber}${Math.round(30 * kBody).toString(16).padStart(2, "0")}` }} />
          <div style={{ position: "absolute", left: 0, right: 0, top: 666, display: "flex", justifyContent: "center" }}>
            <NeonText text="BOULDER CLUB" color={C.pink} k={kWord} size={78} track={0.22} />
          </div>
          <svg width={1920} height={1080} style={{ position: "absolute", overflow: "visible" }}>
            <defs><clipPath id="mug"><path d={BODY + " Z"} /></clipPath></defs>
            <g transform="translate(960 372) scale(0.78)">
              <rect x={-262} y={-312} width={524} height={574} fill="#0d0a26" stroke="#2a2250" strokeWidth={4} />
              {border.map((b, i) => <Bulb key={i} x={b.x} y={b.y} r={5.5} on={f > 8 && (i + chase) % 4 !== 0 ? 0.9 : 0.1} />)}
              <g clipPath="url(#mug)">
                <rect x={-130} y={level} width={260} height={400} fill={C.amber} opacity={0.35 * kBody} />
                {Array.from({ length: 14 }, (_, i) => {
                  const by = 170 - ((f * (2 + (i % 3)) + i * 37) % 280);
                  return by > level ? <circle key={i} cx={-90 + ((i * 53) % 180)} cy={by} r={4 + (i % 3)} fill="none" stroke={C.goldHot} strokeWidth={2} opacity={0.8 * kBody} /> : null;
                })}
              </g>
              {streamOn > 0 ? (
                <g>
                  <path d={`M0,-520 L0,${level}`} stroke={C.goldHot} strokeWidth={18} opacity={0.3 * streamOn} style={{ filter: "blur(8px)" }} />
                  <path d={`M0,-520 L0,${level}`} stroke={C.goldHot} strokeWidth={6} strokeDasharray="26 14" strokeDashoffset={-f * 9} opacity={streamOn} />
                </g>
              ) : null}
              <NeonPath d={BODY} color={C.gold} k={kBody} w={8} />
              <NeonPath d={HANDLE} color={C.gold} k={kBody} w={7} />
              <NeonPath d={FOAM} color={C.cream} k={kFoam} w={7} fill={C.cream} />
            </g>
          </svg>
        </Layer>
        <Layer depth={1.35}>
          {/* 1930s sedan silhouette with headlights, passing */}
          <div style={{ position: "absolute", left: carX, top: 905 }}>
            <svg width={520} height={160} style={{ overflow: "visible" }}>
              <path d="M20,120 L40,70 L140,62 L190,20 L330,20 L370,62 L470,70 L500,120 Z" fill="#05040f" />
              <circle cx={120} cy={122} r={30} fill="#05040f" /><circle cx={400} cy={122} r={30} fill="#05040f" />
              <ellipse cx={-120} cy={95} rx={160} ry={26} fill={C.goldHot} opacity={0.25} style={{ filter: "blur(10px)" }} />
              <circle cx={28} cy={92} r={8} fill="#fffbe8" />
            </svg>
          </div>
        </Layer>
        <Layer depth={1.7}>
          <div style={{ position: "absolute", left: 1640, top: 180, width: 16, height: 1100, background: "#040310" }} />
          <div style={{ position: "absolute", left: 1600, top: 170, width: 96, height: 30, borderRadius: 8, background: "#040310" }} />
          <div style={{ position: "absolute", left: 1606, top: 196, width: 84, height: 40, borderRadius: "0 0 40px 40px", background: `radial-gradient(ellipse at 50% 0%, ${C.goldHot}, ${C.amber}00 70%)`, opacity: 0.8 }} />
        </Layer>
      </Camera>
    </AbsoluteFill>
  );
};
