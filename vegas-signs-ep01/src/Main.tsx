import React from "react";
import { AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame } from "remotion";
import { BEATS, C, s } from "./theme";
import { Captions } from "./components/Captions";
import { HudLabel, SeriesBug } from "./components/Hud";
import { CutFlash, Grain, Halftone, LightLeak, Vignette } from "./components/Overlays";
import { ColdOpen } from "./scenes/ColdOpen";
import { Rail } from "./scenes/Rail";
import { Stein } from "./scenes/Stein";
import { Stardust } from "./scenes/Stardust";
import { Pylon } from "./scenes/Pylon";
import { Implode } from "./scenes/Implode";
import { Boneyard } from "./scenes/Boneyard";
import { Sphere } from "./scenes/Sphere";
import { Title } from "./scenes/Title";

const SCENES: Record<(typeof BEATS)[number]["id"], React.FC> = {
  cold: ColdOpen, rail: Rail, stein: Stein, stardust: Stardust, pylon: Pylon,
  implode: Implode, boneyard: Boneyard, sphere: Sphere, title: Title,
};
const SUBS: Partial<Record<(typeof BEATS)[number]["id"], string>> = {
  stein: "ILLUSTRATED RECONSTRUCTION",
  stardust: "FACADE REBUILD · K. WAYNE DESIGN",
  pylon: "FEDERAL SIGN · LEE KLAY DESIGN",
  sphere: "THE EXOSPHERE",
};

export const Main: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ background: C.ink }}>
      {BEATS.map((b) => {
        const Scene = SCENES[b.id];
        return (
          <Sequence key={b.id} from={s(b.from)} durationInFrames={s(b.to) - s(b.from)} name={b.id}>
            <Scene />
          </Sequence>
        );
      })}
      <Halftone />
      <Vignette />
      <LightLeak at={s(0.8)} dur={20} seed="a" strength={0.5} />
      <LightLeak at={s(12.6)} dur={20} seed="b" />
      <LightLeak at={s(19.7)} dur={18} seed="c" />
      <LightLeak at={s(27.5)} dur={20} seed="d" strength={0.6} />
      <LightLeak at={s(47.2)} dur={22} seed="e" />
      <LightLeak at={s(55.5)} dur={26} seed="f" strength={0.7} />
      <CutFlash at={s(13.0)} />
      <CutFlash at={s(20.1)} />
      <CutFlash at={s(35.4)} len={7} color="#ffffff" />
      <CutFlash at={s(47.6)} />
      <Grain />
      {BEATS.filter((b) => b.hud).map((b) => (
        <Sequence key={`hud-${b.id}`} from={s(b.from)} durationInFrames={s(b.to) - s(b.from)} layout="none">
          <HudLabel text={b.hud} dur={s(b.to) - s(b.from)} delay={b.id === "cold" ? s(1.0) : 4} sub={SUBS[b.id]} />
        </Sequence>
      ))}
      {f >= s(6.6) && f < s(55.8) ? <SeriesBug frame={f} /> : null}
      <Captions />
      <Audio src={staticFile("audio/mix.wav")} />
    </AbsoluteFill>
  );
};
