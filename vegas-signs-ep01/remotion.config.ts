import { Config } from "@remotion/cli/config";

Config.setEntryPoint("src/index.ts");
Config.setBrowserExecutable(process.env.REMOTION_CHROME ?? "/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell");
Config.setChromiumOpenGlRenderer("swangle");
Config.setVideoImageFormat("jpeg");
Config.setJpegQuality(92);
