// QA: bundle once, render a still every N seconds (or given frames), then a contact sheet.
import { bundle } from "@remotion/bundler";
import { renderStill, selectComposition } from "@remotion/renderer";
import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const out = path.join(root, "qa");
fs.mkdirSync(out, { recursive: true });
const arg = process.argv[2] ?? "every:2";
const frames = arg.startsWith("every:")
  ? [...Array.from({ length: Math.floor(60 / Number(arg.slice(6))) }, (_, i) => i * Number(arg.slice(6)) * 24), 1439]
  : arg.split(",").map(Number);
const browserExecutable = "/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell";
const serveUrl = await bundle({ entryPoint: path.join(root, "src/index.ts") });
const composition = await selectComposition({ serveUrl, id: "Highlight", browserExecutable });
for (const frame of frames) {
  const name = `f${String(frame).padStart(4, "0")}.jpg`;
  await renderStill({ serveUrl, composition, frame, output: path.join(out, name), imageFormat: "jpeg", jpegQuality: 88, browserExecutable, chromiumOptions: { gl: "swangle" } });
  process.stdout.write(`${name} `);
}
if (arg.startsWith("every:")) {
  execSync(`ffmpeg -y -loglevel error -pattern_type glob -i '${out}/f*.jpg' -vf "scale=480:-1,tile=4x8:padding=6:color=white" ${out}/contact.jpg`);
}
console.log("\ndone");
