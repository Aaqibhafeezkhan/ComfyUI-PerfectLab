# -*- coding: utf-8 -*-
"""The curated combo looks reference real library values.

Reads the SHIPPED artifact (web/perfectlab_libraries.js): if a combo names
a garment that is not in the library, the panel would apply a value the
engine cannot tile or prompt for.
"""
import io
import json
import os
import re

WEB = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "web")


def _arr(src, name):
    m = re.search(r"export const %s = " % name, src)
    assert m, name
    i = src.index("[", m.end())
    depth = 0
    j = i
    while True:
        if src[j] == "[":
            depth += 1
        elif src[j] == "]":
            depth -= 1
            if depth == 0:
                break
        j += 1
    return json.loads(src[i:j + 1])


def test_combo_looks_reference_real_values():
    src = io.open(os.path.join(WEB, "perfectlab_libraries.js"), encoding="utf-8").read()
    combos = _arr(src, "COMBO_LOOKS")
    assert len(combos) >= 6, "the curated set should stay useful, not shrink to nothing"
    libs = {"top": _arr(src, "TOPS_LIB"), "bottom": _arr(src, "BOTTOMS_LIB"),
            "footwear": _arr(src, "FOOTWEAR_LIB")}
    i = src.index("[", src.index("export const PERSONA_FIELDS"))
    depth = 0
    j = i
    while True:
        if src[j] == "[":
            depth += 1
        elif src[j] == "]":
            depth -= 1
            if depth == 0:
                break
        j += 1
    fields = {f["key"]: f["options"] for f in json.loads(src[i:j + 1])}
    for cb in combos:
        assert cb["name"], "every combo needs a name"
        for key, pool in list(libs.items()) + [("hair", fields["hair"]),
                                               ("makeup", fields["makeup"])]:
            assert cb.get(key) in pool, "combo %r: %r is not in %s" % (cb["name"], cb.get(key), key)
