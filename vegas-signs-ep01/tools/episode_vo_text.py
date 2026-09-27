"""Pull the VO blocks out of script/script.md and write a TTS-ready version.
`cap` keeps the script's wording (for captions); `say` spells out numbers and
respells names the TTS gets wrong."""
import json, os, re
from num2words import num2words

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
md = open(os.path.join(ROOT, "script/script.md"), encoding="utf-8").read()

RESPELL = {
    "YESCO": "Yes-co", "Ad-Art": "Ad Art", "Mojave": "Mo-hah-vee", "Izenour": "Eye-zen-our",
    "megaresorts": "mega-resorts", "Exosphere": "Exo-sphere", "La Concha": "La Conn-cha",
}

def year(n):
    w = num2words(n, to="year").replace("oh-", "oh ")
    return w

def speak(t):
    t = re.sub(r"[*_]", "", t)
    t = re.sub(r"\b(1[89]\d\d|20\d\d)s\b", lambda m: (lambda w: w[:-1] + "ies" if w.endswith("y") else w + "s")(year(int(m.group(1)))), t)
    t = re.sub(r"\b(1[89]\d\d|20[0-3]\d)\b", lambda m: year(int(m.group(1))), t)
    t = re.sub(r"\b(\d+(?:\.\d+)?) million\b", lambda m: num2words(float(m.group(1)) if "." in m.group(1) else int(m.group(1))) + " million", t)
    t = re.sub(r"\b(\d{1,3}(?:,\d{3})+)\b", lambda m: num2words(int(m.group(1).replace(",", ""))), t)
    t = re.sub(r"\b(\d+)-(foot|ft)\b", lambda m: num2words(int(m.group(1))) + "-foot", t)
    t = re.sub(r"\b(\d+)\b", lambda m: num2words(int(m.group(1))), t)
    t = re.sub(r"\bLEDs\b", "L E Ds", t).replace("LED ", "L E D ")
    t = t.replace("A one hundred and", "A hundred and").replace("a one hundred and", "a hundred and")
    for a, b in RESPELL.items():
        t = t.replace(a, b)
    return t.replace(" — ", ", ").replace("—", ", ").replace(":", ",")

chapters = []
for m in re.finditer(r"^## (\d\d) · (.+?) \((\d+:\d\d)–(\d+:\d\d)\)\n(.*?)(?=^## |\Z)", md, re.S | re.M):
    num, title, t0, t1, body = m.groups()
    vo = re.search(r"\*\*VO:\*\*\n(.*?)(?=\*\*VISUALS:\*\*)", body, re.S).group(1)
    paras = []
    for line in vo.splitlines():
        line = line.strip()
        if not line:
            continue
        if line.startswith(">"):
            paras.append({"kind": "slot", "cap": re.sub(r"^>\s*", "", line), "say": "", "gap": 4.0})
            continue
        kind = "cta" if line.startswith("*[CTA") else "vo"
        cap = re.sub(r"^\*\[CTA, 10 sec\]\*\s*", "", line)
        paras.append({"kind": kind, "cap": cap, "say": speak(cap)})
    chapters.append({"id": f"ch{num}", "title": title.title(), "target": [t0, t1], "paras": paras})

json.dump(chapters, open(os.path.join(ROOT, "tools/episode_vo.json"), "w"), indent=1, ensure_ascii=False)
words = sum(len(p["cap"].split()) for c in chapters for p in c["paras"] if p["kind"] != "slot")
print(f"{len(chapters)} chapters, {words} words")
for c in chapters:
    for p in c["paras"]:
        if p["say"] and p["say"] != p["cap"]:
            print(f"  [{c['id']}] {p['say'][:150]}")
