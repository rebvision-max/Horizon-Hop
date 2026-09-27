"""Original score + synthesized SFX + VO mix, sidechain-ducked, mastered to -14 LUFS / -1 dBTP.
Everything here is generated from code, so it is rights-clean (logged as ORIGINAL in rights_log.csv)."""
import json, os, sys, wave
import numpy as np
from scipy import signal
import pyloudnorm as pyln

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SR = 48000; T = 60.0; N = int(SR * T)
rng = np.random.default_rng(7)
t = np.arange(N) / SR

def env(n, a, r):  # attack/release envelope in seconds
    e = np.ones(n); na, nr = int(a * SR), int(r * SR)
    if na: e[:na] = np.linspace(0, 1, na)
    if nr: e[-nr:] *= np.linspace(1, 0, nr)
    return e

def lp(x, fc, order=2): return signal.sosfilt(signal.butter(order, fc, "low", fs=SR, output="sos"), x)
def hp(x, fc, order=2): return signal.sosfilt(signal.butter(order, fc, "high", fs=SR, output="sos"), x)
def bp(x, lo, hi): return signal.sosfilt(signal.butter(2, [lo, hi], "band", fs=SR, output="sos"), x)
def saw(f, n, ph=0): return 2 * ((np.arange(n) / SR * f + ph) % 1) - 1
def place(buf, x, at):
    i = int(at * SR); j = min(N, i + len(x))
    if j > i: buf[i:j] += x[: j - i]
def reverb(x, secs=2.8, wet=0.35):
    n = int(secs * SR); ir = rng.standard_normal(n) * np.exp(-np.linspace(0, 7, n)); ir = lp(ir, 5000); ir /= np.sqrt(np.sum(ir ** 2))
    return (1 - wet) * x + wet * signal.fftconvolve(x, ir)[: len(x)]
note = lambda m: 440 * 2 ** ((m - 69) / 12)

# ---------------- MUSIC ----------------
music = np.zeros(N)
# (start, end, [midi notes], level)
chords = [
    (0.6, 6.8, [38, 50, 57, 62], 0.5),     # Dm (sparse, cold open)
    (6.6, 13.2, [34, 46, 53, 58, 62], 0.6),  # Bb
    (13.0, 20.3, [41, 53, 57, 60, 65], 0.65),  # F
    (20.1, 28.1, [36, 48, 55, 60, 64], 0.75),  # C
    (27.9, 35.5, [38, 50, 57, 62, 65, 69], 0.85),  # Dm9-ish climb
    (35.6, 42.5, [26, 38, 45], 0.55),        # low drone after the blast
    (42.3, 47.8, [34, 46, 53, 57, 62], 0.45),  # Bbmaj7 dusk
    (47.6, 56.0, [41, 53, 57, 60, 64, 69], 0.8),  # Fmaj7 swell
    (55.8, 60.0, [38, 50, 57, 62, 64, 69], 0.9),  # Dm(add9) resolve
]
for a, b, notes, lvl in chords:
    n = int((b - a + 1.2) * SR)
    x = np.zeros(n)
    for m in notes:
        for det in (-0.08, 0.0, 0.07):
            x += saw(note(m) * 2 ** (det / 12), n, rng.random())
    x = lp(x / len(notes), 1400 if lvl < 0.7 else 2200)
    place(music, x * env(n, 0.9, 1.4) * lvl * 0.12, a)
# sub bass pulse on roots through the build (sign wars → pylon)
bpm = 100; beat = 60 / bpm
for a, b, root in [(20.1, 27.9, 36), (27.9, 35.3, 38)]:
    k = 0
    while a + k * beat / 2 < b:
        n = int(beat / 2 * SR); x = np.sin(2 * np.pi * note(root - 12 + 12) * np.arange(n) / SR) * np.exp(-np.arange(n) / SR * 7)
        place(music, x * (0.22 if k % 2 == 0 else 0.12), a + k * beat / 2); k += 1
# arpeggio sparkle (pluck) in stein → pylon
arp = [62, 65, 69, 72, 69, 65]
for a, b, shift in [(13.0, 20.0, -1), (20.1, 27.8, -2), (27.9, 35.2, 0)]:
    k = 0
    while a + k * beat / 4 < b:
        m = arp[k % len(arp)] + (0 if shift >= 0 else shift)
        n = int(0.5 * SR); x = (saw(note(m), n) * 0.5 + np.sin(2 * np.pi * note(m + 12) * np.arange(n) / SR)) * np.exp(-np.arange(n) / SR * 9)
        place(music, lp(x, 3500) * 0.05, a + k * beat / 4); k += 1
# soft kick on downbeats in sign wars/pylon
for a, b in [(20.1, 35.3)]:
    k = 0
    while a + k * beat < b:
        n = int(0.4 * SR); tt = np.arange(n) / SR
        x = np.sin(2 * np.pi * (50 + 90 * np.exp(-tt * 30)) * tt) * np.exp(-tt * 9)
        place(music, x * 0.35, a + k * beat); k += 1
# riser into the implosion
n = int(2.2 * SR); r = hp(rng.standard_normal(n), 800) * np.linspace(0, 1, n) ** 2
place(music, bp(r, 1000, 6000) * 0.12, 33.2)
music = reverb(music, 3.2, 0.4)
i0, i1 = int(35.35 * SR), int(35.55 * SR)
music[i0:i1] *= np.linspace(1, 0.2, i1 - i0)  # breath before the hit

# ---------------- SFX ----------------
sfx = np.zeros(N)
def hum(dur, f0=120, lvl=0.08):
    n = int(dur * SR); tt = np.arange(n) / SR
    x = sum(np.sin(2 * np.pi * f0 * h * tt) / h for h in (1, 2, 3, 5)) + 0.3 * bp(rng.standard_normal(n), 2000, 7000)
    return x * lvl
def crackle(dur, density=60, lvl=0.35):
    n = int(dur * SR); x = np.zeros(n)
    for _ in range(int(density * dur)):
        i = rng.integers(0, n - 400); L = rng.integers(40, 400)
        x[i:i + L] += rng.standard_normal(L) * np.exp(-np.arange(L) / (L / 4))
    return hp(x, 1500) * lvl
def whoosh(dur=0.7, lvl=0.18):
    n = int(dur * SR); x = rng.standard_normal(n); fc = np.linspace(300, 4000, n)
    y = np.zeros(n); blk = 1024
    for i in range(0, n, blk):
        y[i:i + blk] = bp(x[i:i + blk], fc[i] * 0.7, min(fc[i] * 1.4, 20000))
    return y * np.sin(np.pi * np.linspace(0, 1, n)) ** 2 * lvl
def boom(lvl=0.9):
    n = int(4 * SR); tt = np.arange(n) / SR
    x = np.sin(2 * np.pi * (28 + 60 * np.exp(-tt * 6)) * tt) * np.exp(-tt * 1.4)
    x += lp(rng.standard_normal(n), 300) * np.exp(-tt * 0.9) * 0.9
    return x * lvl
def charges(lvl=0.5):
    n = int(0.45 * SR); x = np.zeros(n)
    for k in range(9):
        i = int(k * 0.045 * SR) + rng.integers(0, 600); L = 900
        x[i:i + L] += rng.standard_normal(L) * np.exp(-np.arange(L) / 150)
    return bp(x, 400, 5000) * lvl
def chime(f0, dur=2.5, lvl=0.18):
    n = int(dur * SR); tt = np.arange(n) / SR
    return np.sin(2 * np.pi * f0 * tt + 2.2 * np.sin(2 * np.pi * f0 * 3.5 * tt) * np.exp(-tt * 3)) * np.exp(-tt * 2.2) * lvl

# cold open: tube strike crackle + buzz, flip stutter
place(sfx, crackle(0.9, 90, 0.45), 0.42)
place(sfx, hum(5.8, 120, 0.07) * env(int(5.8 * SR), 0.05, 1.0), 0.8)
place(sfx, crackle(0.4, 120, 0.4), 4.78)
place(sfx, crackle(0.5, 80, 0.3), 2.1)   # "THIS WAY" strikes
# cuts
for c in (6.6, 13.0, 20.1, 27.9, 42.3, 47.6):
    place(sfx, whoosh(0.7, 0.16), c - 0.55)
# rail: distant horn + wheel clack
n = int(1.6 * SR); horn = sum(saw(f, n) for f in (311, 370, 466)) * env(n, 0.15, 0.6)
place(sfx, reverb(lp(horn, 1200), 2.5, 0.6) * 0.035, 7.4)
for k in range(24):
    n = 600; place(sfx, bp(rng.standard_normal(n), 500, 3000) * np.exp(-np.arange(n) / 90) * 0.1, 6.8 + k * 0.23 + (0.06 if k % 2 else 0))
# stein: neon strike + pouring shimmer
place(sfx, crackle(0.5, 90, 0.35), 13.15)
n = int(2.8 * SR); pour = bp(rng.standard_normal(n), 2500, 9000) * env(n, 0.3, 0.8) * (0.6 + 0.4 * np.sin(2 * np.pi * 6 * np.arange(n) / SR))
place(sfx, pour * 0.06, 13.7)
place(sfx, crackle(0.4, 80, 0.3), 16.2)
# stardust: bulbs ignite sweep (relay chatter)
for k in range(30):
    n = 500; place(sfx, bp(rng.standard_normal(n), 1500, 6000) * np.exp(-np.arange(n) / 70) * 0.12, 21.6 + k * 0.037)
place(sfx, crackle(0.4, 80, 0.3), 21.95)
# pylon: elevator motor
n = int(2.8 * SR); tt = np.arange(n) / SR
motor = lp(saw(55 + 8 * tt, n) + 0.5 * saw(110 + 16 * tt, n), 700) * env(n, 0.25, 0.4)
place(sfx, motor * 0.06, 32.4)
place(sfx, chime(1400, 0.8, 0.05), 35.1)  # car arrives
# implosions (sync with scenes/Implode BLASTS: beat start 35.4 + t)
for tb in (35.4 + 0.25, 35.4 + 2.55, 35.4 + 4.6):
    place(sfx, charges(0.45), tb - 0.02)
    place(sfx, boom(0.85), tb + 0.3)
# boneyard: wind + sputtering tube
n = int(5.6 * SR); wind = lp(rng.standard_normal(n), 500) * (0.6 + 0.4 * np.sin(2 * np.pi * 0.3 * np.arange(n) / SR)) * env(n, 0.8, 1.0)
place(sfx, wind * 0.12, 42.3)
place(sfx, hum(5.0, 120, 0.03) * env(int(5 * SR), 0.2, 0.5), 42.6)
place(sfx, crackle(4.5, 14, 0.25), 42.6)
# sphere: power-on swell + "Hello, World" chime
n = int(1.8 * SR); tt = np.arange(n) / SR
swell = np.sin(2 * np.pi * (200 + 500 * tt ** 2) * tt) * (tt / 1.8) ** 2 * np.exp(-np.maximum(0, tt - 1.6) * 20)
place(sfx, swell * 0.06, 48.3)
place(sfx, reverb(chime(880, 2.5, 0.12) + chime(1318.5, 2.5, 0.08), 2.5, 0.5), 54.0)
# title: impact + neon buzz
place(sfx, boom(0.5), 55.85)
place(sfx, reverb(chime(587.3, 3.5, 0.1), 3.0, 0.6), 55.85)
place(sfx, crackle(0.8, 70, 0.3), 55.9)
place(sfx, hum(3.8, 120, 0.035) * env(int(3.8 * SR), 0.1, 1.2), 56.1)

# ---------------- VO ----------------
vo_path = os.path.join(ROOT, "audio", "vo.wav")
if not os.path.exists(vo_path):
    vo_path = os.path.join(ROOT, "audio", "vo_scratch.wav")
with wave.open(vo_path) as w:
    vsr = w.getframerate(); v = np.frombuffer(w.readframes(w.getnframes()), dtype=np.int16).astype(np.float64) / 32768
    if w.getnchannels() == 2: v = v.reshape(-1, 2).mean(axis=1)
from math import gcd
g = gcd(SR, vsr); v = signal.resample_poly(v, SR // g, vsr // g)
v = hp(v, 85); v = np.pad(v, (0, max(0, N - len(v))))[:N]
# gentle presence + normalize VO to ~-17 LUFS
v = v + 0.25 * bp(v, 2500, 5000)
meter = pyln.Meter(SR)
v *= 10 ** ((-17 - meter.integrated_loudness(v)) / 20)

# sidechain duck: music -10 dB under VO with 60 ms attack / 400 ms release
e = np.abs(v); e = lp(e, 8)
on = (e > 0.01).astype(float)
duck = np.zeros(N); a_c, r_c = np.exp(-1 / (0.06 * SR)), np.exp(-1 / (0.4 * SR)); y = 0
for i in range(0, N, 48):  # 1ms control rate
    tgt = on[i]; c = a_c if tgt > y else r_c
    y = tgt + (y - tgt) * c ** 48
    duck[i:i + 48] = y
gain = 10 ** (-10 * duck / 20)
mix_mono_music = music * gain

# stereo: music wide (Haas-ish decorrelation), SFX slightly wide, VO center
def widen(x, ms=9):
    d = int(ms / 1000 * SR); r = np.concatenate([np.zeros(d), x[:-d]])
    return np.stack([x * 0.9 + r * 0.1, r * 0.9 + x * 0.1], 1)
mix = widen(mix_mono_music, 11) * 0.9 + widen(sfx, 4) * 0.8 + np.stack([v, v], 1)

# master: loudness to -14 LUFS, then lookahead limiter at -1 dBTP (4x oversampled peak detect)
def limit(x, ceil_db=-1.2):
    ceil = 10 ** (ceil_db / 20)
    over = np.abs(signal.resample_poly(x, 4, 1, axis=0)).max(1)
    pk = over.reshape(-1, 4).max(1)[: len(x)]
    need = np.minimum(1, ceil / np.maximum(pk, 1e-9))
    look = int(0.005 * SR)
    g = np.ones(len(x)); y = 1.0; rel = np.exp(-1 / (0.08 * SR))
    from scipy.ndimage import minimum_filter1d, uniform_filter1d
    # min over lookahead window, then a boxcar that can only stay at/below that min -> smooth attack, no overs
    mn = uniform_filter1d(minimum_filter1d(need, size=2 * look + 1), size=look + 1)
    for i in range(len(x)):
        y = mn[i] if mn[i] < y else mn[i] + (y - mn[i]) * rel
        g[i] = y
    return x * g[:, None]
for it in range(4):
    L = meter.integrated_loudness(mix)
    mix *= 10 ** ((-14 - L) / 20)
    mix = limit(mix)
L = meter.integrated_loudness(mix)
tp = 20 * np.log10(np.abs(signal.resample_poly(mix, 4, 1, axis=0)).max())
# 2s fade-out tail guard and 10ms fade-in
mix[: int(0.01 * SR)] *= np.linspace(0, 1, int(0.01 * SR))[:, None]
mix[-int(0.4 * SR):] *= np.linspace(1, 0, int(0.4 * SR))[:, None]
pcm = (np.clip(mix, -1, 1) * 32767).astype(np.int16)
os.makedirs(os.path.join(ROOT, "public/audio"), exist_ok=True)
with wave.open(os.path.join(ROOT, "public/audio/mix.wav"), "wb") as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes(pcm.tobytes())
# stems for QA / re-mixing
for name, x in (("music", mix_mono_music), ("sfx", sfx), ("vo", v)):
    with wave.open(os.path.join(ROOT, f"audio/stem_{name}.wav"), "wb") as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes((np.clip(x, -1, 1) * 32767).astype(np.int16).tobytes())
print(f"integrated {L:.2f} LUFS, true peak {tp:.2f} dBTP, vo source {os.path.basename(vo_path)}")
