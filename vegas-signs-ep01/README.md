# Built Out of Light: 60s highlight (Remotion)

1920x1080 · 24 fps · 1440 frames · -14 LUFS / -1 dBTP.

```
script/script.md          full documentary script (source of truth)
tools/vo_lines.json       60s VO cut: spoken text, caption text, cue times
tools/make_vo.py          scratch VO via Piper (skipped once audio/vo.wav exists)
tools/align_captions.py   caption chunks snapped to real pauses in the VO waveform
tools/make_audio.py       original score + SFX + ducking + master -> public/audio/mix.wav
tools/qa_stills.mjs       QA stills every 2s + contact sheet (qa/contact.jpg)
src/scenes/*              one file per beat; timings in src/theme.ts (BEATS)
rights_log.csv            every asset on the timeline; nothing ships without a line
```

## Rebuild
```
python3 tools/make_vo.py && python3 tools/align_captions.py && cp audio/vo_cues.json src/data/
python3 tools/make_audio.py
node tools/qa_stills.mjs every:2
npx remotion render Highlight out/built-out-of-light_highlight_60s.mp4 --codec=h264 --crf=17 --audio-bitrate=320k
```
Needs ffmpeg, Piper at /opt/tts (binary + en-us-ryan-high.onnx), and `pip install numpy scipy pyloudnorm`.

## Swapping in the real VO
Drop Jeff's read at `audio/vo.wav`, update the `start` times in `tools/vo_lines.json` to match, and
rerun align + audio. make_audio.py prefers `audio/vo.wav` over the scratch file.

## Full-episode VO (all 8 chapters)
```
python3 tools/episode_vo_text.py                     # script.md -> tools/episode_vo.json (numbers spelled out, names respelled)
python3 tools/make_episode_vo.py --model /opt/tts/<voice>.onnx [--speaker N] --out audio/episode
```
Writes chNN.wav per chapter, episode_vo_full.wav, episode_vo.srt and timing.txt. The chapter 02
"your voice" line is a 4-second silent slot. `audio/episode_scratch_ryan/` is a timing pass with
the non-commercial Ryan voice, for pacing review only.
