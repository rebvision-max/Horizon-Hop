import React, { useEffect, useMemo, useRef } from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { Camera, Layer } from "../components/Camera";
import { Skyline, Sky, Stars } from "../components/Scenery";
import { Counter } from "../components/Hud";
import { C, FONT, s } from "../theme";
import { lerp } from "../lib";

// The Exosphere as a dot-matrix of LED pucks: dark → power-on wave → warm field → "HELLO, WORLD".
const CX = 960, CY = 520, R = 390, PITCH = 9;
export const HELLO_AT = s(54.0 - 47.6);

export const Sphere: React.FC = () => {
  const f = useCurrentFrame();
  const ref = useRef<HTMLCanvasElement>(null);
  const textMask = useMemo(() => {
    if (typeof document === "undefined") return null;
    const cv = document.createElement("canvas");
    cv.width = 1024; cv.height = 512;
    const ctx = cv.getContext("2d")!;
    ctx.fillStyle = "#000"; ctx.fillRect(0, 0, 1024, 512);
    ctx.fillStyle = "#fff"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
    ctx.font = "600 150px Cond, 'Arial Narrow', sans-serif";
    ctx.fillText("HELLO,", 512, 186);
    ctx.fillText("WORLD", 512, 336);
    return ctx.getImageData(0, 0, 1024, 512).data;
  }, []);
  useEffect(() => {
    const ctx = ref.current!.getContext("2d")!;
    ctx.clearRect(0, 0, 1920, 1080);
    const wave = lerp(f, [s(0.7), s(2.2)], [-1.3, 1.3]);
    const helloK = lerp(f, [HELLO_AT - 3, HELLO_AT + 2], [0, 1]);
    for (let py = -R; py <= R; py += PITCH) {
      for (let px = -R; px <= R; px += PITCH) {
        const x = px + ((py / PITCH) % 2 ? PITCH / 2 : 0);
        const rr = (x * x + py * py) / (R * R);
        if (rr > 1) continue;
        const nz = Math.sqrt(1 - rr);
        const lat = Math.asin(-py / R), lon = Math.atan2(x / R, nz);
        const lit = -py / R < wave ? 1 : 0;
        // warm drifting field before the words
        const field = 0.55 + 0.4 * Math.sin(lon * 3 + f * 0.08) * Math.cos(lat * 2 - f * 0.05);
        let r = 242, g = 193, b = 78, k = field * lit;
        if (helloK > 0 && textMask) {
          const u = Math.floor(((lon / 1.35) * 0.5 + 0.5) * 1023), v = Math.floor(((-lat / 1.0) * 0.5 + 0.5) * 511);
          const m = u >= 0 && u < 1024 && v >= 0 && v < 512 ? textMask[(v * 1024 + u) * 4] / 255 : 0;
          k = k * (1 - helloK * 0.75) + m * helloK * 1.2;
          if (m > 0.5) { r = 255; g = 248; b = 230; }
        }
        const shade = 0.25 + 0.75 * nz;
        const size = 2.4 + 4.2 * nz;
        const a = Math.min(1, Math.max(0.06, k) * shade);
        ctx.fillStyle = `rgba(${r},${g},${b},${a})`;
        ctx.fillRect(CX + x - size / 2, CY + py - size / 2, size, size);
      }
    }
  }, [f, textMask]);
  const powered = lerp(f, [s(0.7), s(2.4)], [0, 1]);
  return (
    <AbsoluteFill>
      <Sky horizon={88} />
      <Camera keys={[{ f: 0, x: 0, y: 40, z: 1.0 }, { f: s(8.2), x: 0, y: -20, z: 1.14 }]}>
        <Layer depth={0.2}><Stars n={150} seed="st7" maxY={0.55} /></Layer>
        <Layer depth={1}>
          <div style={{ position: "absolute", left: CX - R * 1.6, top: CY - R * 1.6, width: R * 3.2, height: R * 3.2, borderRadius: "50%", background: `radial-gradient(circle, ${C.amber}55, transparent 62%)`, opacity: powered }} />
          <div style={{ position: "absolute", left: CX - R, top: CY - R, width: 2 * R, height: 2 * R, borderRadius: "50%", background: "radial-gradient(circle at 35% 30%, #221a52, #07051a 70%)", boxShadow: `inset -20px -30px 60px #000, 0 0 2px ${C.haze}` }} />
          <canvas ref={ref} width={1920} height={1080} style={{ position: "absolute", inset: 0 }} />
        </Layer>
        <Layer depth={1.45}>
          <Skyline seed="sph" base={1120} minH={140} maxH={330} color="#05040f" density={0.3} bw={[90, 220]} />
        </Layer>
      </Camera>
      <Counter to={580000} start={s(1.4)} dur={s(3.2)} label="SQ FT OF LED" x={96} y={200} size={84} fade={[s(5.8), s(6.3)]} />
      <div style={{ position: "absolute", left: 96, top: 330, fontFamily: FONT.mono, fontSize: 17, letterSpacing: "0.26em", color: C.haze, opacity: lerp(f, [s(3.0), s(3.4), s(5.8), s(6.3)], [0, 1, 1, 0]) }}>
        ≈1.2M PUCKS · 48 DIODES EACH
      </div>
    </AbsoluteFill>
  );
};
