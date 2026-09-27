import React, { useEffect, useMemo, useRef } from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { Camera, Layer } from "../components/Camera";
import { Ridge, Sky, Skyline, Stars } from "../components/Scenery";
import { C, FONT, s } from "../theme";
import { lerp, rng } from "../lib";

// Recreated implosions (no licensed news footage): three towers drop one by one into dust.
const GROUND = 880;
export const BLASTS = [
  { x: 250, w: 270, h: 540, t: s(0.25), label: "DUNES · 27.10.1993" },
  { x: 820, w: 320, h: 470, t: s(2.55), label: "SANDS · 1996" },
  { x: 1380, w: 290, h: 590, t: s(4.6), label: "STARDUST · 13.03.2007" },
];

const Dust: React.FC<{ f: number }> = ({ f }) => {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current!.getContext("2d")!;
    ctx.clearRect(0, 0, 1920, 1080);
    BLASTS.forEach((b, bi) => {
      const age = f - b.t - 6;
      if (age < 0) return;
      for (let i = 0; i < 70; i++) {
        const born = rng(`db${bi}${i}`) * 26;
        const a = age - born;
        if (a < 0) continue;
        const spread = 1 + a * 0.012;
        const x = b.x + b.w / 2 + (rng(`dx${bi}${i}`) - 0.5) * b.w * 1.3 * spread + a * 0.4;
        const y = GROUND - rng(`dy${bi}${i}`) * Math.min(b.h * 0.45, a * 7) + 10;
        const r = 24 + rng(`dr${bi}${i}`) * 40 + Math.min(a, 60) * 0.9;
        const alpha = Math.min(1, a / 6) * Math.max(0, 1 - a / 90) * 0.42;
        const warm = Math.max(0, 1 - a / 22);
        const g = ctx.createRadialGradient(x, y, 0, x, y, r);
        g.addColorStop(0, `rgba(${150 + 100 * warm},${130 + 60 * warm},${175 - 60 * warm},${alpha})`);
        g.addColorStop(1, "rgba(60,48,110,0)");
        ctx.fillStyle = g;
        ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
      }
    });
  }, [f]);
  return <canvas ref={ref} width={1920} height={1080} style={{ position: "absolute", inset: 0 }} />;
};

export const Implode: React.FC = () => {
  const f = useCurrentFrame();
  const shake = BLASTS.reduce((acc, b) => acc + Math.max(0, 1 - Math.abs(f - b.t - 4) / 18) * 9, 0);
  const wins = useMemo(() => BLASTS.map((b, bi) => {
    const out: { x: number; y: number; on: boolean }[] = [];
    for (let y = 18; y < b.h - 10; y += 18) for (let x = 12; x < b.w - 10; x += 16) out.push({ x, y, on: rng(`iw${bi}${x}${y}`) < 0.45 });
    return out;
  }), []);
  return (
    <AbsoluteFill>
      <Sky horizon={84} bottom="#3a2a7a" />
      <Camera keys={[{ f: 0, x: 0, y: 0, z: 1.0 }, { f: s(6.9), x: 20, y: -20, z: 1.12 }]} shake={shake}>
        <Layer depth={0.2}><Stars n={140} seed="st5" maxY={0.5} /></Layer>
        <Layer depth={0.4}><Ridge seed="im" base={820} amp={110} color="#1c1452" rim={C.haze} /></Layer>
        <Layer depth={0.7}><Skyline seed="imf" base={GROUND + 20} minH={60} maxH={170} color="#140e3c" density={0.25} windowColor={C.gold} /></Layer>
        <Layer depth={1}>
          <div style={{ position: "absolute", left: -400, top: 0, width: 2720, height: GROUND, overflow: "hidden" }}>
            {BLASTS.map((b, bi) => {
              const t = f - b.t - 8;
              const drop = t > 0 ? Math.min(b.h + 40, 0.9 * t * t) : 0;
              const tilt = t > 0 ? Math.min(4, t * 0.12) * (bi % 2 ? -1 : 1) : 0;
              return (
                <div key={bi} style={{ position: "absolute", left: b.x + 400, top: GROUND - b.h + drop, width: b.w, height: b.h, background: "linear-gradient(180deg,#171040,#0a0722)", transform: `rotate(${tilt}deg)`, transformOrigin: "50% 100%" }}>
                  <svg width={b.w} height={b.h} style={{ position: "absolute" }}>
                    {wins[bi].map((w, j) => {
                      const flash = f >= b.t && f < b.t + 8 && rng(`fl${bi}${j}${f}`) < 0.2;
                      return <rect key={j} x={w.x} y={w.y} width={7} height={9} fill={flash ? "#fffbe8" : C.gold} opacity={flash ? 1 : w.on && f < b.t ? 0.7 : 0.08} />;
                    })}
                  </svg>
                </div>
              );
            })}
          </div>
          {BLASTS.map((b, bi) => {
            const a = lerp(f, [b.t, b.t + 3, b.t + 10], [0, 1, 0]);
            return <div key={bi} style={{ position: "absolute", left: b.x - 200, top: GROUND - 300, width: b.w + 400, height: 400, background: `radial-gradient(ellipse 50% 50% at 50% 80%, ${C.goldHot}, transparent 70%)`, opacity: a, mixBlendMode: "screen" }} />;
          })}
          <Dust f={f} />
          <div style={{ position: "absolute", left: -600, right: -600, top: GROUND, height: 600, background: "#06041a" }} />
        </Layer>
      </Camera>
      {BLASTS.map((b, bi) => {
        const a = lerp(f, [b.t, b.t + 5], [0, 1]);
        const dim = bi < 2 && f > BLASTS[bi + 1].t ? 0.45 : 1;
        return (
          <div key={bi} style={{ position: "absolute", left: b.x + b.w / 2, top: GROUND - b.h - 70, transform: "translateX(-50%)", opacity: a * dim, textAlign: "center" }}>
            <div style={{ fontFamily: FONT.mono, fontSize: 20, letterSpacing: "0.22em", color: C.cream, background: "rgba(6,4,22,0.7)", padding: "6px 12px", whiteSpace: "nowrap" }}>
              <span style={{ color: C.gold }}>▍</span>{b.label}
            </div>
            <div style={{ width: 1.5, height: 40, background: C.gold, margin: "0 auto" }} />
          </div>
        );
      })}
    </AbsoluteFill>
  );
};
