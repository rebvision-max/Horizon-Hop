import React from "react";
import { useCurrentFrame } from "remotion";
import { C, EASE, FONT } from "../theme";
import { lerp } from "../lib";

const typeOn = (text: string, f: number, start: number, cps = 1.6) => text.slice(0, Math.max(0, Math.floor((f - start) * cps)));

// Small monospace place · date label, top-left. Types on, holds, fades before the cut.
export const HudLabel: React.FC<{ text: string; dur: number; delay?: number; sub?: string }> = ({ text, dur, delay = 4, sub }) => {
  const f = useCurrentFrame();
  const out = lerp(f, [dur - 8, dur - 2], [1, 0]);
  const line = lerp(f, [delay - 4, delay + 8], [0, 1], EASE.out);
  const shown = typeOn(text, f, delay);
  if (f < delay - 4) return null;
  return (
    <div style={{ position: "absolute", left: 96, top: 78, opacity: out, fontFamily: FONT.mono, color: C.cream }}>
      <div style={{ width: 220 * line, height: 1, background: C.gold, opacity: 0.9, marginBottom: 12 }} />
      <div style={{ fontSize: 21, letterSpacing: "0.22em", fontWeight: 500, textShadow: `0 0 10px ${C.night0}` }}>
        <span style={{ color: C.gold }}>▍</span>
        {shown}
      </div>
      {sub ? (
        <div style={{ fontSize: 16, letterSpacing: "0.3em", marginTop: 8, color: "#b6a3ee", opacity: lerp(f, [delay + 14, delay + 20], [0, 1]) }}>
          {sub}
        </div>
      ) : null}
    </div>
  );
};

// Persistent series bug, top-right.
export const SeriesBug: React.FC<{ frame: number }> = ({ frame }) => {
  const tc = (fr: number) => {
    const sec = Math.floor(fr / 24);
    return `00:${String(Math.floor(sec / 60)).padStart(2, "0")}:${String(sec % 60).padStart(2, "0")}:${String(fr % 24).padStart(2, "0")}`;
  };
  return (
    <div style={{ position: "absolute", right: 96, top: 78, textAlign: "right", fontFamily: FONT.mono, color: C.cream, opacity: 0.78 }}>
      <div style={{ fontSize: 17, letterSpacing: "0.3em" }}>BUILT OUT OF LIGHT · EP.01</div>
      <div style={{ fontSize: 17, letterSpacing: "0.2em", marginTop: 8, color: C.gold }}>{tc(frame)}</div>
    </div>
  );
};

// Animated counter with a mono label; eases out so the last digits settle.
export const Counter: React.FC<{
  from?: number; to: number; start: number; dur: number; label: string; suffix?: string;
  x: number; y: number; size?: number; align?: "left" | "right"; fade?: [number, number];
}> = ({ from = 0, to, start, dur, label, suffix = "", x, y, size = 96, align = "left", fade }) => {
  const f = useCurrentFrame();
  const v = lerp(f, [start, start + dur], [from, to], EASE.out);
  const inA = lerp(f, [start - 6, start + 4], [0, 1]);
  const outA = fade ? lerp(f, fade, [1, 0]) : 1;
  const done = f >= start + dur;
  return (
    <div style={{ position: "absolute", left: align === "left" ? x : undefined, right: align === "right" ? x : undefined, top: y, textAlign: align, opacity: inA * outA }}>
      <div style={{ fontFamily: FONT.mono, fontSize: 17, letterSpacing: "0.3em", color: C.haze, marginBottom: 6 }}>{label}</div>
      <div
        style={{
          fontFamily: FONT.title, fontWeight: 600, fontSize: size, letterSpacing: "0.06em", lineHeight: 1,
          color: done ? C.goldHot : C.gold, textShadow: `0 0 18px ${C.amber}88, 0 0 2px ${C.goldHot}`,
          fontVariantNumeric: "tabular-nums",
        }}
      >
        {Math.round(v).toLocaleString("en-US")}
        <span style={{ fontSize: size * (suffix === "+" ? 0.8 : 0.42), marginLeft: 10, letterSpacing: "0.2em" }}>{suffix}</span>
      </div>
    </div>
  );
};

// Condensed, wide-tracked kicker title (e.g. "SIGN WARS").
export const Kicker: React.FC<{ text: string; start: number; end: number; x: number; y: number; size?: number; align?: "left" | "center" | "right" }> = ({ text, start, end, x, y, size = 64, align = "left" }) => {
  const f = useCurrentFrame();
  const a = lerp(f, [start, start + 8, end - 6, end], [0, 1, 1, 0]);
  const track = lerp(f, [start, start + 30], [0.2, 0.42], EASE.out);
  const wipe = lerp(f, [start + 4, start + 20], [0, 100], EASE.out);
  return (
    <div style={{ position: "absolute", left: x, top: y, opacity: a, textAlign: align, transform: align === "center" ? "translateX(-50%)" : undefined }}>
      <div style={{ fontFamily: FONT.title, fontWeight: 500, fontSize: size, letterSpacing: `${track}em`, color: C.cream, textShadow: `0 0 24px ${C.night0}` }}>{text}</div>
      <div style={{ height: 2, width: `${wipe}%`, background: `linear-gradient(90deg, ${C.gold}, ${C.amber}00)`, marginTop: 6 }} />
    </div>
  );
};
