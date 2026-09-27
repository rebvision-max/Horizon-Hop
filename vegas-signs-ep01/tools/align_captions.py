"""Caption timing from the VO audio itself: split each cue at punctuation, then snap the
split points to the real pauses in the waveform (energy-gap detection)."""
import json, re, wave, os
import numpy as np
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
cues = json.load(open(os.path.join(ROOT, "audio/vo_cues.json")))
MAXC = 44

def chunks(text):
    parts = [p.strip() for p in re.split(r"(?<=[.,:;])\s+", text) if p.strip()]
    out, cur = [], ""
    for p in parts:
        if cur and len(cur) + 1 + len(p) > MAXC:
            out.append(cur); cur = p
        else:
            cur = (cur + " " + p).strip()
    if cur: out.append(cur)
    return out

def gaps(path):
    with wave.open(path) as w:
        sr = w.getframerate(); a = np.frombuffer(w.readframes(w.getnframes()), dtype=np.int16) / 32768
    hop = int(sr * 0.01); e = np.array([np.sqrt(np.mean(a[i:i+hop]**2)) for i in range(0, len(a)-hop, hop)])
    idx = np.where(np.abs(a) > 0.01)[0]; t0 = max(idx[0]-200, 0) / sr  # same trim as make_vo
    quiet = e < 0.012; res = []; i = 0
    while i < len(quiet):
        if quiet[i]:
            j = i
            while j < len(quiet) and quiet[j]: j += 1
            if (j - i) >= 9: res.append(((i + j) / 2 * 0.01 - t0, (j - i) * 0.01))
            i = j
        else: i += 1
    return res

caps = []
for c in cues:
    ch = chunks(c["cap"])
    g = [x for x in gaps(os.path.join(ROOT, "audio/tmp", c["id"] + ".wav")) if 0.2 < x[0] < c["dur"] - 0.2]
    total = sum(len(x) for x in ch); bounds = [0.0]; acc = 0
    for k in ch[:-1]:
        acc += len(k); est = c["dur"] * acc / total
        best = min(g, key=lambda x: abs(x[0] - est) - x[1], default=None)
        bounds.append(best[0] if best and abs(best[0] - est) < 0.8 else est)
    bounds.append(c["dur"])
    for k, txt in enumerate(ch):
        caps.append({"text": txt, "start": round(c["start"] + bounds[k], 3), "end": round(c["start"] + bounds[k+1] + 0.15, 3), "cue": c["id"]})
for a, b in zip(caps, caps[1:]):
    a["end"] = min(a["end"], b["start"] - 0.04)
json.dump(caps, open(os.path.join(ROOT, "src/data/captions.json"), "w"), indent=1, ensure_ascii=False)
for c in caps: print(f'{c["start"]:6.2f}-{c["end"]:6.2f} {c["text"]}')
