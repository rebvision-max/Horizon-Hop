import { continueRender, delayRender, staticFile } from "remotion";

const faces: [string, string, string][] = [
  ["Cond", "300", "barlow-condensed-latin-300-normal.woff2"],
  ["Cond", "500", "barlow-condensed-latin-500-normal.woff2"],
  ["Cond", "600", "barlow-condensed-latin-600-normal.woff2"],
  ["Body", "500", "barlow-latin-500-normal.woff2"],
  ["Body", "600", "barlow-latin-600-normal.woff2"],
  ["Mono", "400", "jetbrains-mono-latin-400-normal.woff2"],
  ["Mono", "500", "jetbrains-mono-latin-500-normal.woff2"],
];

const handle = delayRender("fonts");
Promise.all(
  faces.map(([family, weight, file]) => {
    const f = new FontFace(family, `url(${staticFile(`fonts/${file}`)})`, { weight });
    return f.load().then((loaded) => document.fonts.add(loaded));
  }),
).then(() => continueRender(handle));
