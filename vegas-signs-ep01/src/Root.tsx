import React from "react";
import { Composition } from "remotion";
import { Main } from "./Main";
import { FPS, TOTAL_FRAMES } from "./theme";
import "./fonts";

export const Root: React.FC = () => (
  <Composition
    id="Highlight"
    component={Main}
    durationInFrames={TOTAL_FRAMES}
    fps={FPS}
    width={1920}
    height={1080}
  />
);
