# -*- coding: utf-8 -*-
"""Shoot the guide tiles through the user's own graph.

Reads the PerfectLab API workflow (JW Face + Detail + Light LoRAs,
z_image_turbo), swaps the PerfectLabStudio node_data for a per-tile state,
queues through the running server's /prompt, waits for the frame, center-crops
to 240x240 and saves into web/guide/items/<category>/<NN>.jpg.

Run while ComfyUI is up:  python tools/shoot_tiles.py [category ...]
Without arguments it shoots every missing tile of every category.
"""
import json
import os
import sys
import time
import urllib.request
import urllib.error

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
sys.path.insert(0, os.path.dirname(ROOT))

SERVER = "http://127.0.0.1:8188"
WORKFLOW = r"I:\ai\ComfyUI_windows_portable\ComfyUI\user\default\workflows\PerfectLab_JW_studio_1024.json"
ITEMS = os.path.join(ROOT, "web", "guide", "items")

from PerfectLab.look_nodes import LOCATIONS, LIGHTS, WEATHER, STYLES, FILMS  # noqa: E402
from PerfectLab.shoot_nodes import POSES, EXPRESSIONS, FRAMINGS, FOCUS  # noqa: E402
from PerfectLab.tools.build_libraries import LENS_LIB, PROPS_LIB  # noqa: E402
from PerfectLab.wardrobe_node import TOPS, BOTTOMS, FOOTWEAR, ACCESSORIES, LINGERIE  # noqa: E402
from PerfectLab.person_node import FIELDS  # noqa: E402

PERSONA = {f["key"]: f["options"] for f in FIELDS}


def state_for(cat, value):
    """the per-category tile recipe: what the frame shows and how"""
    empty_person = {"trigger": "", "fields": {}}
    jw = {"trigger": "JW", "fields": {"gender": "a young woman", "age": "22 years old"}}

    def base(main, person, extra=None, framing="wide shot", focus="the background mood",
             fmt="1:1"):
        st = {
            "_v": 2, "off": ["pose", "expression"],
            "negative": {"enabled": True, "presets": ["text, watermark, logo"],
                         "text": "deformed hands, extra fingers"},
            "persona": person,
            "look": {"looks": [{"name": "tile"}]},
            "scene": {"location": "", "weather": "", "details": "", "props": []},
            "light": {"setup": "", "hour": -1},
            "style": {"grade": "", "film": "", "palette": ""},
            "pose": {"poses": {"mode": "all", "set": [], "pin": None}},
            "expression": {"arc": "", "expressions": {"mode": "all", "set": [], "pin": None}},
            "camera": {"framings": {"mode": "pin", "set": [], "pin": FRAMINGS.index(framing)},
                       "focus": {"mode": "pin", "set": [], "pin": FOCUS.index(focus)},
                       "formats": {"mode": "pin", "set": [], "pin": ["follows framing", "1:1", "4:5", "3:4", "2:3", "9:16", "3:2", "16:9", "21:9", "65:24"].index(fmt)},
                       "framing_order": "", "lens": "", "composition": ""},
            "shot": {"main_prompt": main, "custom": "", "style_mode": "natural"},
            "session": {"count": 1, "takes": 1, "mood_subject": False, "takes_arc": False,
                        "pose_arc": False, "place_arc": False, "crop_arc": False,
                        "focus_arc": False, "look_rotation": "blocks", "reshoot_shot": 0,
                        "template": "", "quality_line": ""},
        }
        if extra:
            extra(st)
        return st

    if cat == "location":
        return base(f"An empty establishing photograph of {value}, no people, "
                    "photorealistic, editorial travel photography, rich atmosphere",
                    empty_person)
    if cat == "lighting":
        return base(f"An atmospheric empty scene demonstrating {value}, no people, "
                    "photorealistic, cinematic still", empty_person)
    if cat == "weather":
        return base(f"An empty landscape photograph under {value}, no people, "
                    "photorealistic, cinematic still", empty_person)
    if cat == "tops":
        return base(f"A clean catalog photograph demonstrating {value} worn open and "
                    "centered, photorealistic, plain warm light-grey backdrop, bright even light",
                    jw, framing="medium shot", focus="the outfit",
                    extra=lambda s: s["look"].__setitem__("looks", [{"name": "tile", "top": value}]))
    if cat == "bottoms":
        return base(f"A clean catalog photograph demonstrating {value}, full-length view, "
                    "photorealistic, plain warm light-grey backdrop, bright even light",
                    jw, framing="full body shot", focus="the outfit",
                    extra=lambda s: s["look"].__setitem__("looks", [{"name": "tile", "bottom": value}]))
    if cat == "footwear":
        return base(f"A clean catalog photograph demonstrating {value} on a standing model, "
                    "photorealistic, plain warm light-grey backdrop",
                    jw, framing="cowboy shot", focus="the shoes",
                    extra=lambda s: s["look"].__setitem__("looks", [{"name": "tile", "footwear": value}]))
    if cat == "accessories":
        return base(f"A close portrait photograph demonstrating {value} on the model, "
                    "photorealistic, plain warm backdrop",
                    jw, framing="portrait shot", focus="the jewelry",
                    extra=lambda s: s["look"].__setitem__("looks", [{"name": "tile", "accessories": [value]}]))
    if cat == "acc_color":
        # the accessory metal and enamel colors: a macro swatch of the finish
        return base(f"A macro photograph of a {value} metal surface, an abstract color and "
                    "texture swatch filling the frame, photorealistic, soft studio light",
                    empty_person, framing="extreme close-up", focus="the fabric texture", fmt="1:1")
    if cat == "hairstyle":
        return base(f"A clean beauty portrait showing {value} on a young woman, "
                    "photorealistic, plain warm backdrop, hair the star of the frame",
                    {"trigger": "JW", "fields": {"gender": "a young woman", "hair": value}},
                    framing="portrait shot", focus="the face")
    if cat == "hair_color":
        return base(f"A clean beauty portrait showing long flowing hair in {value}, "
                    "photorealistic, plain warm backdrop",
                    {"trigger": "JW", "fields": {"gender": "a young woman",
                                                "hair": "long straight hair with a middle part",
                                                "hair_color": value}},
                    framing="portrait shot", focus="the face")
    if cat == "makeup":
        return base(f"An extreme close-up beauty photograph demonstrating {value} on a calm "
                    "face, ONE mouth, closed lips, no teeth, no tongue, macro skin detail, "
                    "photorealistic",
                    {"trigger": "JW", "fields": {"gender": "a young woman", "makeup": [value]}},
                    framing="extreme close-up", focus="the face", fmt="1:1")
    if cat == "skin":
        return base(f"An extreme close-up photograph showing {value} in soft natural light, "
                    "photorealistic, macro skin texture",
                    {"trigger": "JW", "fields": {"gender": "a young woman", "skin": value}},
                    framing="extreme close-up", focus="the face", fmt="1:1")
    if cat == "signature":
        return base(f"A beauty portrait where {value} is clearly visible, "
                    "photorealistic, shallow depth of field",
                    {"trigger": "JW", "fields": {"gender": "a young woman", "signature": [value]}},
                    framing="portrait shot", focus="the face")
    if cat == "nails":
        return base(f"A close-up photograph of elegant hands with {value} resting gracefully "
                    "on a neutral surface, photorealistic, macro detail",
                    {"trigger": "JW", "fields": {"gender": "a young woman", "nails": value}},
                    framing="close-up", focus="the hands", fmt="1:1")
    if cat == "pose":
        return base(f"A full-body photograph of a young woman {value}, photorealistic, "
                    "plain warm light-grey backdrop, the pose the star of the frame",
                    jw, framing="full body shot", focus="the full figure",
                    extra=lambda s: s.__setitem__("pose", {"poses": {"mode": "pin", "set": [], "pin": POSES.index(value)}}))
    if cat == "expression":
        return base(f"A close-up portrait photograph showing {value} on a young woman, "
                    "photorealistic, plain warm backdrop",
                    jw, framing="close-up", focus="the face", fmt="1:1",
                    extra=lambda s: (s.__setitem__("off", []),
                                     s.__setitem__("expression",
                                                   {"expressions": {"mode": "pin", "set": [], "pin": EXPRESSIONS.index(value)}})))
    if cat == "lingerie":
        return base(f"A tasteful clean catalog photograph demonstrating {value} on a model, "
                    "modest studio product shot, photorealistic, plain warm light-grey backdrop",
                    jw, framing="cowboy shot", focus="the outfit",
                    extra=lambda st: st["look"].__setitem__("looks", [{"name": "tile", "lingerie": value}]))
    if cat == "props":
        return base(f"A studio still-life photograph of {value} on a warm seamless backdrop, "
                    "photorealistic, soft even light, the object the star of the frame",
                    empty_person, framing="medium shot", focus="the outfit", fmt="1:1")
    if cat == "style":
        return base(f"A portrait photograph graded in a {value}, photorealistic, "
                    "the grade the star of the frame",
                    jw, framing="portrait shot", focus="the face",
                    extra=lambda s: s["style"].__setitem__("grade", value))
    if cat == "film":
        return base(f"A portrait photograph on {value}, photorealistic",
                    jw, framing="portrait shot", focus="the face",
                    extra=lambda s: s["style"].__setitem__("film", value))
    if cat == "framing":
        return base(f"A {value} of a young woman in a plain outfit, photorealistic, "
                    "plain warm backdrop",
                    jw, framing=value, focus="the full figure",
                    extra=lambda s: s["camera"]["framings"].__setitem__("pin", FRAMINGS.index(value)))
    if cat == "focus":
        return base(f"A photograph of a young woman where the attention sits on {value}, "
                    "photorealistic",
                    jw, framing="portrait shot", focus=value,
                    extra=lambda s: s["camera"]["focus"].__setitem__("pin", FOCUS.index(value)))
    if cat == "lens":
        return base(f"A portrait photograph taken with {value}, photorealistic",
                    jw, framing="portrait shot", focus="the face",
                    extra=lambda s: s["camera"].__setitem__("lens", value))
    raise ValueError("no recipe for " + cat)


CATS = {
    "location": LOCATIONS, "lighting": LIGHTS, "weather": WEATHER,
    "tops": TOPS, "bottoms": BOTTOMS, "footwear": FOOTWEAR, "accessories": ACCESSORIES,
    "hairstyle": PERSONA["hair"], "hair_color": PERSONA["hair_color"],
    "makeup": PERSONA["makeup"], "skin": PERSONA["skin"], "signature": PERSONA["signature"],
    "nails": PERSONA["nails"],
    "pose": POSES, "expression": EXPRESSIONS,
    "style": STYLES, "film": FILMS,
    "framing": FRAMINGS, "focus": FOCUS, "lens": LENS_LIB,
    "props": PROPS_LIB,
    "lingerie": LINGERIE,
    # the accessory metal and enamel swatches: 12 colors, only 8 frames shipped
    "acc_color": ["gold", "silver", "black", "rose gold", "pearl white", "gunmetal",
                  "bronze", "enamel red", "pastel pink", "mustard yellow",
                  "burgundy", "olive green"],
}

# chips shown as plain text or CSS boxes -- no tiles to shoot
NO_TILES = {"props": None, "composition": None}
# wardrobe accessories already fully tiled; frame/showing categories reshoot below


def api(path, data=None, method=None):
    req = urllib.request.Request(SERVER + path, method=method)
    if data is not None:
        req.data = json.dumps(data).encode()
        req.add_header("Content-Type", "application/json")
    with urllib.request.urlopen(req, timeout=30) as r:
        return json.loads(r.read() or b"{}")


def shoot(wf, st, prefix):
    wf = json.loads(json.dumps(wf))
    wf["500"]["inputs"]["node_data"] = json.dumps(st, ensure_ascii=False)
    wf["500"]["inputs"]["mode"] = "single shot"
    wf["500"]["inputs"]["variations"] = 1
    wf["344"]["inputs"]["filename_prefix"] = prefix
    body = {"prompt": wf, "client_id": "tilegen"}
    r = api("/prompt", body)
    pid = r.get("prompt_id")
    if not pid:
        raise RuntimeError("queue failed: " + json.dumps(r)[:300])
    for _ in range(180):
        time.sleep(3)
        h = api("/history/" + pid).get(pid)
        if h and h.get("status", {}).get("completed"):
            for out in h.get("outputs", {}).values():
                for im in out.get("images", []):
                    if im.get("type") == "output":
                        return im
    raise RuntimeError("render timed out")


def fetch_crop_save(url, dest):
    tmp = dest + ".tmp.png"
    urllib.request.urlretrieve(SERVER + "/view?filename=" +
                               urllib.parse.quote(os.path.basename(url["filename"])) +
                               "&subfolder=" + urllib.parse.quote(url.get("subfolder", "")) +
                               "&type=output", tmp)
    from PIL import Image
    im = Image.open(tmp)
    m = min(im.size)
    im = im.crop(((im.width - m) // 2, (im.height - m) // 2,
                  (im.width + m) // 2, (im.height + m) // 2)).resize((240, 240), Image.LANCZOS)
    im.convert("RGB").save(dest, "JPEG", quality=90)
    os.remove(tmp)


def main():
    args = sys.argv[1:]
    limit = 0
    reshoots = []
    while args and args[-1].startswith("--"):
        flag = args.pop()
        if flag.startswith("--limit="):
            limit = int(flag.split("=")[1])
        elif flag.startswith("--reshoot="):
            # --reshoot=cat:idx,cat:idx,...  re-renders with a bumped seed
            for one in flag.split("=", 1)[1].split(","):
                c, i = one.split(":")
                reshoots.append((c.strip(), int(i)))
    only = set(args)
    wf = json.load(open(WORKFLOW, encoding="utf-8"))
    jobs = []
    for cat, items in CATS.items():
        if only and cat not in only:
            continue
        d = os.path.join(ITEMS, cat)
        os.makedirs(d, exist_ok=True)
        for i, v in enumerate(items):
            dest = os.path.join(d, "%02d.jpg" % i)
            if os.path.exists(dest):
                continue
            jobs.append((cat, i, v, dest))
    # reshoots: the lighting source block was shot in a different style, and
    # the makeup 20-22 files predate their current labels
    reshoot = []
    if not only or "lighting" in only:
        reshoot += [("lighting", i, LIGHTS[i]) for i in range(12, 19)]
    if not only or "makeup" in only:
        reshoot += [("makeup", i, PERSONA["makeup"][i]) for i in range(20, 23)]
    for cat, i, v in reshoot:
        dest = os.path.join(ITEMS, cat, "%02d.jpg" % i)
        jobs.append((cat, i, v, dest + ".reshoot"))
    for cat, i in reshoots:
        v = CATS[cat][i]
        dest = os.path.join(ITEMS, cat, "%02d.jpg" % i)
        if os.path.exists(dest):
            os.remove(dest)
        jobs.append((cat, i, v, dest, True))
    jobs = [j + (False,) if len(j) == 4 else j for j in jobs]
    if limit:
        jobs = jobs[:limit]
    print("jobs:", len(jobs), flush=True)
    for n, job in enumerate(jobs):
        cat, i, v, dest, fresh = job
        final = dest[:-len(".reshoot")] if dest.endswith(".reshoot") else dest
        t0 = time.time()
        try:
            if fresh:
                # a fresh roll: the fixed seed would re-render the same frame
                wf_local = json.loads(json.dumps(wf))
                wf_local["500"]["inputs"]["seed"] = 20260204 + 7919 * (i + 1)
                im = shoot(wf_local, state_for(cat, v), "perfectlab_tiles/" + cat)
            else:
                im = shoot(wf, state_for(cat, v), "perfectlab_tiles/" + cat)
            fetch_crop_save(im, final if not dest.endswith(".reshoot") else dest)
            if dest.endswith(".reshoot"):
                os.replace(dest, final)
        except Exception as e:
            print(f"[{n + 1}/{len(jobs)}] {cat}/{i:02d} FAILED: {e}", flush=True)
            continue
        print(f"[{n + 1}/{len(jobs)}] {cat}/{i:02d} ok {v[:40]!r} "
              f"({time.time() - t0:.0f}s)", flush=True)
    print("done", flush=True)


if __name__ == "__main__":
    main()
