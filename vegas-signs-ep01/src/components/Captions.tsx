import React from "react";
import { useCurrentFrame } from "remotion";
import caps from "../data/captions.json";
import { C, FONT, FPS } from "../theme";
import { lerp } from "../lib";

// Burned-in captions, lower-center safe area (above the 90% title-safe line).
export const Captions: React.FC = () => {
  const f = useCurrentFrame();
  const t = f / FPS;
  const cur = caps.find((c) => t >= c.start - 0.04 && t < c.end);
  if (!cur) return null;
  const a = Math.min(lerp(f, [cur.start * FPS - 1, cur.start * FPS + 3], [0, 1]), lerp(f, [cur.end * FPS - 3, cur.end * FPS], [1, 0]));
  return (
    <div style={{ position: "absolute", left: 0, right: 0, bottom: 92, display: "flex", justifyContent: "center", opacity: a }}>
      <div
        style={{
          maxWidth: 1180, textAlign: "center", fontFamily: FONT.body, fontWeight: 600, fontSize: 42, lineHeight: 1.25,
          color: C.cream, padding: "10px 26px", borderRadius: 4,
          background: "rgba(6,4,22,0.62)", backdropFilter: "blur(6px)",
          textShadow: "0 2px 6px rgba(0,0,0,0.8)",
        }}
      >
        {cur.text}
      </div>
    </div>
  );
};
