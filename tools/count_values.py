# -*- coding: utf-8 -*-
"""Count every pickable library value for the README totals."""
import io, re, json

src = io.open("web/perfectlab_libraries.js", encoding="utf-8").read()

def arr_body(name):
    m = re.search(r'export const %s = ' % name, src)
    i = src.index('[', m.end())
    depth = 0
    j = i
    while True:
        if src[j] == '[':
            depth += 1
        elif src[j] == ']':
            depth -= 1
            if depth == 0:
                break
        j += 1
    return src[i:j + 1]

total = 0
for name in ["TOPS_LIB", "BOTTOMS_LIB", "FOOTWEAR_LIB", "HEADWEAR_LIB", "LINGERIE_LIB",
             "ACCESSORIES_LIB", "LOCATIONS", "WEATHER", "LIGHT_SETUPS", "PROPS_LIB",
             "STYLES", "FILMS", "FRAMING_LIB", "FOCUS_LIB", "LENS_LIB", "COMPOSITION_LIB",
             "FORMAT_LIB", "POSE_LIB", "EXPRESSION_LIB", "NEG_PRESETS"]:
    body = arr_body(name)
    n = len(json.loads(body))
    total += n
    print(name, n)

i = src.index('[', src.index('export const PERSONA_FIELDS'))
depth = 0
j = i
while True:
    if src[j] == '[':
        depth += 1
    elif src[j] == ']':
        depth -= 1
        if depth == 0:
            break
    j += 1
fields = json.loads(src[i:j + 1])
pn = sum(len(f["options"]) for f in fields)
print("PERSONA_FIELDS", pn)
print("TOTAL:", total + pn)
