"""Full-episode VO: one WAV per chapter + stitched episode + SRT + timing report.
usage: python3 tools/make_episode_vo.py [--model /opt/tts/<voice>.onnx] [--speaker N] [--scratch]"""
import argparse, json, os, re, subprocess, wave
import numpy as np
from scipy import signal
import pyloudnorm as pyln

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ap = argparse.ArgumentParser()
ap.add_argument("--model", default="/opt/tts/en-us-ryan-high.onnx")
ap.add_argument("--speaker", type=int, default=None)
ap.add_argument("--length-scale", type=float, default=1.08)
ap.add_argument("--out", default="audio/episode")
args = ap.parse_args()

SR = 48000
out_dir = os.path.join(ROOT, args.out); tmp = os.path.join(out_dir, "tmp"); os.makedirs(tmp, exist_ok=True)
chapters = json.load(open(os.path.join(ROOT, "tools/episode_vo.json")))
vsr = json.load(open(args.model + ".json"))["audio"]["sample_rate"]

def tts(text, path):
    cmd = ["/opt/tts/piper/piper", "-m", args.model, "-f", path, "--length_scale", str(args.length_scale), "--noise_scale", "0.6", "--sentence_silence", "0.38"]
    if args.speaker is not None: cmd += ["--speaker", str(args.speaker)]
    subprocess.run(cmd, input=text.encode(), check=True, capture_output=True)
    with wave.open(path) as w:
        a = np.frombuffer(w.readframes(w.getnframes()), dtype=np.int16).astype(np.float64) / 32768
    idx = np.where(np.abs(a) > 0.01)[0]; a = a[max(idx[0] - 300, 0): idx[-1] + 1200]
    return signal.resample_poly(a, 320, 147) if vsr == 22050 else signal.resample_poly(a, SR // np.gcd(SR, vsr), vsr // np.gcd(SR, vsr))

def ts(x):
    ms = int(round(x * 1000)); return f"{ms // 3600000:02d}:{ms // 60000 % 60:02d}:{ms // 1000 % 60:02d},{ms % 1000:03d}"

PARA_GAP, CH_GAP = 0.75, 1.8   # breath between paragraphs; room for a music beat between chapters
episode, srt, report, t = [], [], [], 0.0
for c in chapters:
    ch, ct = [], 0.0
    for i, p in enumerate(c["paras"]):
        if p["kind"] == "slot":
            ch.append(np.zeros(int(p["gap"] * SR))); report.append(f"  {c['id']} {t + ct:7.2f}s  [SLOT {p['gap']:.0f}s: your line goes here]"); ct += p["gap"]; continue
        a = tts(p["say"], os.path.join(tmp, f"{c['id']}_{i:02d}.wav"))
        # captions: one cue per sentence, timed by character share of the paragraph
        sents = [x for x in re.split(r"(?<=[.!?])\s+", p["cap"]) if x]
        total = sum(len(x) for x in sents); dur = len(a) / SR; acc = 0
        for sx in sents:
            s0 = t + ct + dur * acc / total; acc += len(sx); s1 = t + ct + dur * acc / total
            srt.append((s0, s1, re.sub(r"[*_]", "", sx)))
        ch += [a, np.zeros(int(PARA_GAP * SR))]; ct += dur + PARA_GAP
    ch = np.concatenate(ch)
    report.append(f"{c['id']} {c['title']:<32} {ct / 60:5.2f} min   (script target {c['target'][0]}–{c['target'][1]})")
    episode += [ch, np.zeros(int(CH_GAP * SR))]; t += ct + CH_GAP
    c["_audio"] = ch

full = np.concatenate(episode)
meter = pyln.Meter(SR)
gain = 10 ** ((-16 - meter.integrated_loudness(full)) / 20)   # one gain for everything: chapters stay matched
full *= gain
pk = np.abs(signal.resample_poly(full, 4, 1)).max()
if pk > 10 ** (-1.5 / 20): full *= 10 ** (-1.5 / 20) / pk
def write(path, x):
    with wave.open(path, "wb") as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes((np.clip(x, -1, 1) * 32767).astype(np.int16).tobytes())
for c in chapters:
    write(os.path.join(out_dir, f"{c['id']}.wav"), c["_audio"] * gain)
write(os.path.join(out_dir, "episode_vo_full.wav"), full)
with open(os.path.join(out_dir, "episode_vo.srt"), "w") as f:
    for i, (a, b, x) in enumerate(srt, 1): f.write(f"{i}\n{ts(a)} --> {ts(b)}\n{x}\n\n")
voice = os.path.basename(args.model) + (f" speaker {args.speaker}" if args.speaker is not None else "")
rep = "\n".join([f"Voice: {voice}", f"Total: {len(full) / SR / 60:.2f} min ({len(full) / SR:.1f}s)  |  {meter.integrated_loudness(full):.1f} LUFS", ""] + report)
open(os.path.join(out_dir, "timing.txt"), "w").write(rep + "\n")
print(rep)
