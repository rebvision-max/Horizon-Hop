"""Scratch VO: synthesize each line with Piper, place at its cue, write vo.wav + cues.json."""
import json, subprocess, wave, os, sys
import numpy as np
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PIPER = "/opt/tts/piper/piper"; MODEL = "/opt/tts/en-us-ryan-high.onnx"
SR = 22050; TOTAL = 60.0
lines = json.load(open(os.path.join(ROOT, "tools/vo_lines.json")))
out = np.zeros(int(SR * TOTAL), dtype=np.float32)
tmp = os.path.join(ROOT, "audio/tmp"); os.makedirs(tmp, exist_ok=True)
cues = []
for i, L in enumerate(lines):
    wav = os.path.join(tmp, L["id"] + ".wav")
    subprocess.run([PIPER, "-m", MODEL, "-f", wav, "--length_scale", "1.06", "--noise_scale", "0.6", "--sentence_silence", "0.25"],
                   input=L["say"].encode(), check=True, capture_output=True)
    with wave.open(wav) as w:
        a = np.frombuffer(w.readframes(w.getnframes()), dtype=np.int16).astype(np.float32) / 32768
    # trim leading/trailing silence
    idx = np.where(np.abs(a) > 0.01)[0]
    a = a[max(idx[0] - 200, 0): idx[-1] + 800]
    dur = len(a) / SR
    s = int(L["start"] * SR)
    nxt = lines[i + 1]["start"] if i + 1 < len(lines) else TOTAL
    if L["start"] + dur > nxt - 0.1:
        print(f"WARN {L['id']} overruns next cue: ends {L['start']+dur:.2f} next {nxt:.2f}", file=sys.stderr)
    out[s:s + len(a)] += a[: len(out) - s]
    cues.append({**L, "end": round(L["start"] + dur, 3), "dur": round(dur, 3)})
    print(f"{L['id']} {L['start']:6.2f} -> {L['start']+dur:6.2f}  ({dur:.2f}s)")
pcm = (np.clip(out, -1, 1) * 32767).astype(np.int16)
with wave.open(os.path.join(ROOT, "audio/vo_scratch.wav"), "wb") as w:
    w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes(pcm.tobytes())
json.dump(cues, open(os.path.join(ROOT, "audio/vo_cues.json"), "w"), indent=1)
