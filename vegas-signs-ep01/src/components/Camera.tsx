import React, { createContext, useContext } from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { EASE } from "../theme";
import { lerp } from "../lib";

export type Cam = { x: number; y: number; z: number; r?: number };
type Key = { f: number } & Cam;

const CamCtx = createContext<Cam>({ x: 0, y: 0, z: 1, r: 0 });

// Keyframed virtual camera; every <Layer> reads it and moves by its own depth.
export const Camera: React.FC<{ keys: Key[]; shake?: number; children: React.ReactNode }> = ({ keys, shake = 0, children }) => {
  const f = useCurrentFrame();
  const fs = keys.map((k) => k.f);
  const pick = (p: keyof Cam) => lerp(f, fs, keys.map((k) => k[p] ?? 0), EASE.cam);
  const sx = shake ? Math.sin(f * 2.3) * shake + Math.sin(f * 5.1) * shake * 0.5 : 0;
  const sy = shake ? Math.cos(f * 2.9) * shake * 0.8 : 0;
  return (
    <CamCtx.Provider value={{ x: pick("x") + sx, y: pick("y") + sy, z: pick("z"), r: pick("r") }}>
      <AbsoluteFill style={{ overflow: "hidden" }}>{children}</AbsoluteFill>
    </CamCtx.Provider>
  );
};

// depth 0 = infinitely far (static), 1 = focal plane, >1 = foreground.
export const Layer: React.FC<{ depth: number; children: React.ReactNode; style?: React.CSSProperties }> = ({ depth, children, style }) => {
  const c = useContext(CamCtx);
  const z = 1 + (c.z - 1) * depth;
  return (
    <AbsoluteFill
      style={{
        transform: `translate(${-c.x * depth}px, ${-c.y * depth}px) scale(${z}) rotate(${(c.r ?? 0) * depth}deg)`,
        transformOrigin: "50% 50%",
        ...style,
      }}
    >
      {children}
    </AbsoluteFill>
  );
};
