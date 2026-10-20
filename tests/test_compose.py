# -*- coding: utf-8 -*-
"""PerfectLab composer and mirror-parity tests.

Run from the custom_nodes directory:  pytest PerfectLab/tests -q

The parity test regenerates web/perfectlab_libraries.js from the Python
sources and fails when the committed copy is stale, so the panel can
never ship fewer chips than the engine has entries.
"""
import os
import subprocess
import sys

import pytest

CUSTOM_NODES = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "..")
sys.path.insert(0, CUSTOM_NODES)

from PerfectLab.person_node import compose_blocks  # noqa: E402
from PerfectLab.wardrobe_node import compose_look  # noqa: E402
from PerfectLab import perfectlab_studio  # noqa: E402


def test_footwear_color_and_material_ride():
    text = compose_look({
        "top": "a cropped tank top", "bottom": "a pleated mini skirt",
        "footwear": "chunky sneakers", "footwear_color": "white",
        "footwear_material": "leather"})
    assert "leather chunky sneakers in white" in text


def test_footwear_alone_with_color():
    text = compose_look({"footwear": "pool slides", "footwear_color": "gold"})
    assert "pool slides in gold" in text


def test_accessories_take_their_color():
    text = compose_look({"top": "a baby tee",
                         "accessories": ["layered necklaces"], "acc_color": "gold"})
    assert "layered necklaces in gold" in text


def test_headwear_color_prefixes():
    text = compose_look({"top": "a baby tee", "headwear": "a beret", "headwear_color": "red"})
    assert "red beret" in text


def test_none_placeholder_clears_slot():
    text = compose_look({"top": "— none —", "bottom": "cargo shorts"})
    assert "wearing cargo shorts" in text


def test_trigger_leads_and_drops_face_blocks():
    blocks = compose_blocks({
        "trigger": "JW",
        "fields": {"gender": "a young woman", "hair": "beachy curls",
                   "eyes": "emerald green eyes", "skin": "sun-kissed skin",
                   "signature": ["a tiny beauty mark"]}})
    joined = ", ".join(blocks.values())
    assert "JW" in blocks.get("identity", "")
    assert "beachy curls" not in joined          # hair is a face block
    assert "emerald green eyes" not in joined   # eyes ride the face block
    assert "sun-kissed skin" not in joined      # skin rides the skin block
    assert "tiny beauty mark" in joined         # signature stays


def test_trigger_rides_as_suffix_exactly():
    # the LoRA-tag form the engine emits -- the panel preview mirrors it
    blocks = compose_blocks({"trigger": "JW", "fields": {"gender": "a young woman"}})
    assert blocks["identity"] == "a young woman (JW)"


def test_no_trigger_keeps_face_blocks():
    blocks = compose_blocks({"fields": {"hair": "beachy curls", "eyes": "emerald green eyes"}})
    joined = ", ".join(blocks.values())
    assert "beachy curls" in joined
    assert "emerald green eyes" in joined


def test_negative_presets_join_the_custom_line():
    negs = perfectlab_studio._negatives({
        "negative": {"enabled": True,
                     "presets": ["deformed hands, extra fingers", "text, watermark"],
                     "text": "my own line"}}, 2)
    assert "deformed hands, extra fingers" in negs[0]
    assert "text, watermark" in negs[0]
    assert "my own line" in negs[0]


def test_negative_disabled_is_empty():
    negs = perfectlab_studio._negatives({
        "negative": {"enabled": False, "presets": ["text, watermark"], "text": "x"}}, 2)
    assert negs == ["", ""]


def test_lens_rides_the_style_slot():
    config = {"_v": 2,
              "style": {"grade": "cinematic teal and orange grade"},
              "camera": {"framings": {"mode": "all", "set": [], "pin": None},
                         "focus": {"mode": "all", "set": [], "pin": None},
                         "formats": {"mode": "pin", "set": [], "pin": 0},
                         "lens": "an 85mm portrait lens with shallow depth of field"}}
    slots = perfectlab_studio.compose_slots(config, 1, 42)
    assert "85mm" in slots["style"]
    assert "cinematic teal and orange grade" in slots["style"]


def test_blank_session_composes_nothing():
    """no picks and no own lines means no walk-in words: a full reset
    renders an empty prompt, placements and quality line included"""
    prompts, widths, heights, seeds, metas = perfectlab_studio._run_session(
        {"shot": {}, "session": {"count": 3}}, 3, 0, -1)
    assert prompts == ["", "", ""]
    assert widths and heights and len(widths) == len(heights) == 3


def test_full_panel_reset_state_composes_nothing():
    """the REAL panel state: every section present, the walked lists on
    their mode-'all' default, nothing picked. The walk pools are always
    non-empty (the engine walks the whole library), so the blank gate
    must read PICKS, not pools -- a state with all sections used to
    slip past the gate and compose walked poses on a full reset"""
    state = {
        "_v": 2, "off": [],
        "negative": {"enabled": False, "text": "", "presets": []},
        "persona": {"trigger": "", "fields": {}},
        "look": {"looks": [{"name": "Look 1"}]},
        "scene": {"location": "", "weather": "", "details": ""},
        "light": {"setup": "", "hour": -1},
        "style": {"grade": "", "film": "", "palette": ""},
        "pose": {"poses": {"mode": "all", "set": [], "pin": None}},
        "expression": {"arc": "", "expressions": {"mode": "all", "set": [], "pin": None}},
        "camera": {"framings": {"mode": "all", "set": [], "pin": None},
                   "focus": {"mode": "all", "set": [], "pin": None},
                   "formats": {"mode": "pin", "set": [], "pin": 0}},
        "shot": {"main_prompt": "", "custom": "", "style_mode": "natural"},
        "session": {"count": 6},
    }
    prompts, *_ = perfectlab_studio._run_session(state, 6, 0, -1)
    assert prompts == [""] * 6
    # one real pick switches the full machinery back on
    state["scene"]["location"] = "a rooftop cafe"
    prompts, *_ = perfectlab_studio._run_session(state, 6, 0, -1)
    assert "rooftop cafe" in prompts[0]
    # a pinned format is a pick too; the pin-0 default is not
    state["scene"]["location"] = ""
    state["camera"]["formats"] = {"mode": "pin", "set": [], "pin": 3}
    prompts, *_ = perfectlab_studio._run_session(state, 6, 0, -1)
    assert prompts[0].strip()


def test_one_pick_restores_the_full_machinery():
    config = {"_v": 2, "shot": {}, "session": {},
              "scene": {"location": "a rooftop cafe"}}
    prompts, *_ = perfectlab_studio._run_session(config, 1, 0, -1)
    assert "rooftop cafe" in prompts[0]
    assert "editorial photography" in prompts[0]


def test_hole_seams_dissolve():
    """the cleanup runs until the text stops changing: a single ordered
    pass left '. ,' seams where the wearing strip or the dot-dot collapse
    exposed punctuation no earlier rule would see again"""
    config = {"_v": 2, "shot": {}, "session": {},
              "scene": {"location": "a rooftop cafe"}}
    p = perfectlab_studio._run_session(config, 1, 0, -1)[0][0]
    assert "the setting is a rooftop cafe" in p
    for seam in (". ,", ", .", "  ", "..", ",,", "wearing"):
        assert seam not in p, f"seam {seam!r} survived: {p!r}"
    # only the scene picked: the slot writers' phrasing rides verbatim
    assert p == ("the setting is a rooftop cafe. centered in frame. "
                 "editorial photography, natural light.")


def test_clock_hour_reads_the_assistant_phrases():
    config = {"_v": 2, "shot": {}, "session": {}, "light": {"hour": 7}}
    p = perfectlab_studio._run_session(config, 1, 0, -1)[0][0]
    assert "morning light" in p
    assert "hour 7" not in p


def test_shared_persona_blocks_accumulate():
    """hair + hair_color share the hair block, eyes + makeup the face
    block, signature + nails the signature block: every picked value
    rides -- the old per-block overwrite silently dropped all but the
    last field of a block"""
    from PerfectLab.person_node import compose_blocks
    blocks = compose_blocks({"fields": {"hair": "long platinum waves",
                                        "hair_color": "honey blonde"}})
    assert blocks["hair"] == "long platinum waves, honey blonde"
    blocks = compose_blocks({"fields": {"eyes": "pale blue eyes",
                                       "makeup": ["bold red lipstick"]}})
    assert blocks["face"] == "pale blue eyes, bold red lipstick"
    blocks = compose_blocks({"fields": {"signature": "a tiny beauty mark under one eye",
                                        "nails": "French tip manicure"}})
    assert blocks["signature"] == "a tiny beauty mark under one eye, French tip manicure"
    # the free-text signature rides WITH the chips, it does not replace them
    blocks = compose_blocks({"fields": {"signature": "a tiny beauty mark under one eye"},
                             "signature_text": "a thin gold nose ring"})
    assert blocks["signature"] == "a tiny beauty mark under one eye, a thin gold nose ring"
    # the skin keeps its "with" lead while accumulating
    blocks = compose_blocks({"fields": {"skin": "porcelain skin"}})
    assert blocks["skin"] == "with porcelain skin"


def test_trigger_stands_alone_without_identity():
    from PerfectLab.person_node import compose_blocks
    blocks = compose_blocks({"fields": {"hair": "beachy curls"}, "trigger": "JW"})
    assert blocks["identity"] == "a person (JW)"
    assert "hair" not in blocks


def test_switched_off_section_drops_its_slots():
    """a rail dot switches the whole section off: the engine drops the
    slot, light included (it lives inside the scene section in the UI)"""
    config = {"_v": 2, "shot": {}, "session": {"off": ["scene"]},
              "off": ["scene"],
              "scene": {"location": "a rooftop cafe"},
              "light": {"hour": 7}}
    p = perfectlab_studio._run_session(config, 1, 0, -1)[0][0]
    assert "rooftop cafe" not in p
    assert "morning light" not in p
    # persona off: no person, no trigger, even with picks in the state
    config2 = {"_v": 2, "shot": {}, "session": {}, "off": ["persona"],
               "persona": {"trigger": "JW", "fields": {"gender": "a young woman"}}}
    p2 = perfectlab_studio._run_session(config2, 1, 0, -1)[0][0]
    assert "young woman" not in p2
    assert "JW" not in p2


def test_mirror_file_is_fresh():
    repo = os.path.join(CUSTOM_NODES, "PerfectLab")
    gen = os.path.join(repo, "web", "perfectlab_libraries.js")
    before = open(gen, encoding="utf-8").read()
    subprocess.run([sys.executable, os.path.join(repo, "tools", "build_libraries.py")],
                   check=True, capture_output=True)
    after = open(gen, encoding="utf-8").read()
    assert before == after, (
        "web/perfectlab_libraries.js is stale -- a Python library list changed. "
        "Run: python tools/build_libraries.py")


def test_js_compose_look_matches_engine():
    """the panel preview must compose the exact text the engine outputs"""
    import json
    repo = os.path.join(CUSTOM_NODES, "PerfectLab")
    cases = [
        {"top": "a cropped tank top", "top_color": "champagne gold", "top_material": "silk",
         "bottom": "a pleated mini skirt", "bottom_color": "jet black", "bottom_material": "satin",
         "footwear": "chunky sneakers", "footwear_color": "white", "footwear_material": "leather",
         "accessories": ["layered necklaces"], "acc_color": "gold",
         "headwear": "a beret", "headwear_color": "red", "details": "windswept"},
        {"footwear": "pool slides", "footwear_color": "gold"},
        {"headwear": "a beret", "headwear_color": "red"},
        {"top": "— none —", "bottom": "cargo shorts"},
        {"accessories": ["a choker"], "acc_color": "silver"},
    ]
    lib_url = "file:///" + os.path.join(repo, "web", "perfectlab_lib.js").replace("\\", "/")
    code = ("import { composeLook } from '" + lib_url + "';\n" +
            "const cases = " + json.dumps(cases) + ";\n" +
            "console.log(JSON.stringify(cases.map(c => composeLook(c))));")
    r = subprocess.run(["node", "--input-type=module", "-e", code],
                       capture_output=True, text=True)
    assert r.returncode == 0, r.stderr
    js_results = json.loads(r.stdout)
    for case, js_text in zip(cases, js_results):
        py_text = compose_look(case)
        assert js_text == py_text, f"drift: {case} | js: {js_text} | py: {py_text}"


def test_inline_choices_deterministic_and_nested():
    from PerfectLab.perfectlab_studio import resolve_choices
    t = "a {red|green|blue} dress on a {rainy|sunny} day, {a {one|two} nested}"
    a = resolve_choices(t, 20260204)
    b = resolve_choices(t, 20260204)
    assert a == b, "the same seed must pick the same alternatives"
    assert "{" not in a, "all braces must resolve: " + a
    assert resolve_choices(t, 7) != a or resolve_choices(t, 11) != a,         "some other seed must roll at least one different alternative"


def test_inline_choices_parity_js():
    """the panel preview must pick what the engine picks"""
    import json
    from PerfectLab.perfectlab_studio import resolve_choices
    repo = os.path.join(CUSTOM_NODES, "PerfectLab")
    lib_url = "file:///" + os.path.join(repo, "web", "perfectlab_lib.js").replace("\\", "/")
    cases = [
        ["{red|green|blue} dress", 20260204],
        ["a {rainy|sunny} day and {one|two|three} more", 999],
        ["{a {x|y} nest}", 42],
        ["no braces at all", 5],
        # beyond ASCII the engine hashes UTF-8 bytes -- a Cyrillic word,
        # an emoji: the JS mirror must hash the same bytes, not UTF-16
        ["{красное|зелёное|синее} платье", 20260204],
        ["{😀|😎} mood and {киевский|питерский} вечер", 7],
    ]
    code = ("import { resolveChoices } from '" + lib_url + "';\n" +
            "const cases = " + json.dumps(cases) + ";\n" +
            "console.log(JSON.stringify(cases.map(c => resolveChoices(c[0], c[1]))));")
    r = subprocess.run(["node", "--input-type=module", "-e", code],
                       capture_output=True, text=True)
    assert r.returncode == 0, r.stderr
    js = json.loads(r.stdout)
    for (text, seed), js_text in zip(cases, js):
        py_text = resolve_choices(text, seed)
        assert js_text == py_text, f"choice drift: {text} | js: {js_text} | py: {py_text}"


def test_walk_order_parity_js():
    """the panel preview must walk the exact order the session walks:
    pin holds, a picked set rotates, everything else walks the whole
    library in the shared xorshift order"""
    import json
    from PerfectLab.shoot_nodes import _walk_order, walk_list
    repo = os.path.join(CUSTOM_NODES, "PerfectLab")
    lib_url = "file:///" + os.path.join(repo, "web", "perfectlab_lib.js").replace("\\", "/")
    cases = [
        # [items, sel, count, seed, salt]
        [["a", "b", "c", "d"], {"mode": "all", "set": [], "pin": None}, 5, 0, 1],
        [["a", "b", "c", "d", "e", "f", "g", "h"], {"mode": "multi", "set": [2, 5], "pin": None}, 4, 0, 0],
        [["a", "b", "c"], {"mode": "pin", "set": [], "pin": 2}, 3, 0, 3],
        [[str(i) for i in range(41)], {"mode": "all", "set": [], "pin": None}, 7, 0, 2],
        # a multi with an EMPTY set falls through to the whole-library walk
        [["a", "b", "c", "d", "e"], {"mode": "multi", "set": [], "pin": None}, 5, 0, 4],
    ]
    code = ("import { walkList } from '" + lib_url + "';\n" +
            "const cases = " + json.dumps(cases) + ";\n" +
            "console.log(JSON.stringify(cases.map(c => walkList(...c))));")
    r = subprocess.run(["node", "--input-type=module", "-e", code],
                       capture_output=True, text=True)
    assert r.returncode == 0, r.stderr
    js = json.loads(r.stdout)
    for (items, sel, count, seed, salt), js_walk in zip(cases, js):
        py_walk = walk_list(items, sel, count, seed, salt)
        assert js_walk == py_walk, f"walk drift (salt {salt}): js {js_walk} vs py {py_walk}"
    # the order itself is a full permutation, every item exactly once per cycle
    order = _walk_order(41, 2)
    assert sorted(order) == list(range(41))


def test_arc_coupling_parity_js():
    """the arc's per-shot couplings (pose / placement / crop / focus)
    must swap to the SAME replacement on both sides: every library item
    that can ride a feed, crossed with quiet, middle and climax levels
    and several shot indexes -- the swap-heavy states, not just the
    no-op ones"""
    import json
    from PerfectLab.series_nodes import (_pose_for_level, _placement_for_level,
                                         _framing_for_level, _focus_for_level,
                                         PLACEMENTS)
    from PerfectLab.shoot_nodes import POSES, FRAMINGS, FOCUS
    repo = os.path.join(CUSTOM_NODES, "PerfectLab")
    lib_url = "file:///" + os.path.join(repo, "web", "perfectlab_libraries.js").replace("\\", "/")
    lib2 = "file:///" + os.path.join(repo, "web", "perfectlab_lib.js").replace("\\", "/")
    code = ("import { POSE_LIB, FRAMING_LIB, FOCUS_LIB } from '" + lib_url + "';\n"
            + "import { PLACEMENT_LIB } from '" + lib2 + "';\n"
            + "console.log(JSON.stringify({poses: POSE_LIB, places: PLACEMENT_LIB, frames: FRAMING_LIB, focus: FOCUS_LIB}));")
    r = subprocess.run(["node", "--input-type=module", "-e", code],
                       capture_output=True, text=True)
    assert r.returncode == 0, r.stderr
    js_libs = json.loads(r.stdout)
    assert js_libs["poses"] == POSES, "POSE_LIB drift vs POSES"
    assert js_libs["places"] == PLACEMENTS, "PLACEMENT_LIB drift vs PLACEMENTS"
    assert js_libs["frames"] == FRAMINGS, "FRAMING_LIB drift vs FRAMINGS"
    assert js_libs["focus"] == FOCUS, "FOCUS_LIB drift vs FOCUS"

    from PerfectLab.shoot_nodes import _arc_tables
    arcs = sorted(_arc_tables()[0])
    cases = []   # [fn, feed, item, lvl, i, tier, pose]
    for i in range(4):
        for lvl in (0.05, 0.34, 0.5, 0.66, 0.95):
            for pose in (POSES[0], POSES[-1]):
                cases.append(["pose", POSES, POSES[i % len(POSES)], lvl, i, None, None])
                cases.append(["place", PLACEMENTS, PLACEMENTS[i], lvl, i,
                              i % 2 == 0, None])
                cases.append(["crop", FRAMINGS, FRAMINGS[i % len(FRAMINGS)], lvl, i, None, None])
                cases.append(["focus", FOCUS, FOCUS[i % len(FOCUS)], lvl, i,
                              ["close", "medium", "figure"][i % 3], pose])
    # every library item that can contradict the level gets its own case
    for pose in POSES:
        cases.append(["pose", POSES, pose, 0.05, 0, None, None])
        cases.append(["pose", POSES, pose, 0.95, 3, None, None])
    for pl in PLACEMENTS:
        cases.append(["place", PLACEMENTS, pl, 0.05, 1, False, None])
        cases.append(["place", PLACEMENTS, pl, 0.95, 2, True, None])
    for fr in FRAMINGS:
        cases.append(["crop", FRAMINGS, fr, 0.05, 2, None, None])
        cases.append(["crop", FRAMINGS, fr, 0.95, 1, None, None])
    for fo in FOCUS:
        cases.append(["focus", FOCUS, fo, 0.05, 0, "close", POSES[0]])
        cases.append(["focus", FOCUS, fo, 0.95, 4, "medium", POSES[-1]])

    py = []
    for fn, feed, item, lvl, i, tier, pose in cases:
        if fn == "pose":
            py.append(_pose_for_level(feed, item, lvl, i)[0])
        elif fn == "place":
            py.append(_placement_for_level(item, lvl, i, bool(tier))[0])
        elif fn == "crop":
            py.append(_framing_for_level(feed, item, lvl, i)[0])
        else:
            py.append(_focus_for_level(feed, item, lvl, i, tier, pose)[0])

    lib2_url = "file:///" + os.path.join(repo, "web", "perfectlab_lib.js").replace("\\", "/")
    # Windows caps the command line: the case list rides in a temp file
    import tempfile
    with tempfile.NamedTemporaryFile("w", suffix=".json", delete=False,
                                     encoding="utf-8") as tf:
        json.dump(cases, tf)
        cases_path = tf.name
    code2 = ("import { poseForLevel, placementForLevel, framingForLevel, focusForLevel } from '"
             + lib2_url + "';\n"
             + "import fs from 'node:fs';\n"
             + "const cases = JSON.parse(fs.readFileSync(process.env.PLX_CASES, 'utf8'));\n"
             + "console.log(JSON.stringify(cases.map(([fn, feed, item, lvl, i, tier, pose]) =>\n"
             + "  fn === 'pose' ? poseForLevel(feed, item, lvl, i)\n"
             + "  : fn === 'place' ? placementForLevel(item, lvl, i, !!tier)\n"
             + "  : fn === 'crop' ? framingForLevel(feed, item, lvl, i)\n"
             + "  : focusForLevel(feed, item, lvl, i, tier, pose))));")
    try:
        r2 = subprocess.run(["node", "--input-type=module", "-e", code2],
                            capture_output=True, text=True,
                            env={**os.environ, "PLX_CASES": cases_path})
    finally:
        os.unlink(cases_path)
    assert r2.returncode == 0, r2.stderr
    js = json.loads(r2.stdout)
    drift = [(c, j, p) for c, j, p in zip(cases, js, py) if j != p]
    assert not drift, f"coupling drift: {drift[:5]}"


def test_arc_sequence_parity_js():
    """the arc's expression route and its per-shot energies must match
    between the engine and the preview, for every arc and every length"""
    import json
    from PerfectLab.shoot_nodes import arc_seq, arc_levels
    repo = os.path.join(CUSTOM_NODES, "PerfectLab")
    lib_url = "file:///" + os.path.join(repo, "web", "perfectlab_lib.js").replace("\\", "/")
    names = sorted(arc_seq.__globals__.get("ARCS", arc_seq.__globals__.get("ARC_LIB"))
                   or arc_seq.__globals__["_arc_tables"]()[0])
    cases = [[n, c] for n in names for c in (1, 2, 5, 6, 12)]
    code = ("import { arcSeq, arcLevels } from '" + lib_url + "';\n" +
            "const cases = " + json.dumps(cases) + ";\n" +
            "console.log(JSON.stringify(cases.map(([n, c]) => [arcSeq(n, c), arcLevels(n, c)])));")
    r = subprocess.run(["node", "--input-type=module", "-e", code],
                       capture_output=True, text=True)
    assert r.returncode == 0, r.stderr
    js = json.loads(r.stdout)
    for (name, count), (js_seq, js_levels) in zip(cases, js):
        py_seq, py_levels = arc_seq(name, count), arc_levels(name, count)
        assert list(js_seq) == list(py_seq), f"arcSeq drift {name}/{count}"
        assert [round(x, 6) for x in js_levels] == [round(x, 6) for x in py_levels], \
            f"arcLevels drift {name}/{count}"


if __name__ == "__main__":
    sys.exit(pytest.main([__file__, "-q"]))
