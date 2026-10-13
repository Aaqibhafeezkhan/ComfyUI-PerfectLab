# -*- coding: utf-8 -*-
"""Build web/perfectlab_libraries.js from the Python sources.

The ONE source of truth for every library is Python. This script imports
the engine modules and emits the JS module the panels import, so the engine
and the panel can never drift apart.

Run after touching any library list:
    python tools/build_libraries.py
The test suite fails when the committed file is stale.

Lists that exist only in the panel (presentation-only: headwear pieces,
material tints, swatch hexes, lens set, negative presets) are declared
here as literals and travel through the same generated file.
"""
import json
import os
import sys

sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", ".."))

from PerfectLab import look_nodes, person_node, series_nodes, shoot_nodes, wardrobe_node  # noqa: E402

# presentation-only metadata the engine does not carry
PERSONA_IMGCAT = {
    "gender": "gender", "age": "age", "figure": "body", "hair": "hairstyle",
    "hair_color": "hair_color", "eyes": "eyes", "makeup": "makeup",
    "skin": "skin", "signature": "signature", "nails": "nails",
}
HEADWEAR_LIB = ["oversized beanie", "baseball cap", "bucket hat", "wide-brim hat",
                "beret", "headband", "bandana", "a sun hat", "a newsboy cap",
                "a trapper hat", "a cowboy hat", "a pom-pom beanie", "a visor cap"]
MATERIALS = ["cotton", "silk", "satin", "denim", "leather", "knit",
             "velvet", "linen", "wool", "chiffon", "corduroy", "vinyl",
             "mesh", "lace", "suede", "organza"]
MAT_EXTRA = ["canvas", "patent leather", "rubber", "straw", "felt", "tweed"]
MATERIAL_TINT = {"cotton": "#e8e2d4", "silk": "#f0e6ee", "satin": "#e3ddef", "denim": "#3e5a86",
                 "leather": "#4a3226", "knit": "#d9cfae", "velvet": "#5b2a5e", "linen": "#e6dcc2",
                 "wool": "#c9bfa8", "chiffon": "#f4dce8", "corduroy": "#8a6a4a", "vinyl": "#2c2c34",
                 "mesh": "#8a8a96", "lace": "#f0e6ee", "suede": "#b09a6a", "organza": "#eef0f4",
                 "canvas": "#d9cfae", "patent leather": "#1a1a22", "rubber": "#3a3a40",
                 "straw": "#d9b96a", "felt": "#4a4a52", "tweed": "#7a6242"}
LOOK_COLORS = [["jet black", "#17171c"], ["off-white", "#eceadf"], ["charcoal gray", "#4c4c55"],
               ["glossy red", "#c22b2b"], ["chrome silver", "#c9ccd4"], ["champagne gold", "#e2b96a"],
               ["pastel pink", "#f2c4d0"], ["warm beige", "#d9c6a8"], ["navy blue", "#26364f"],
               ["olive green", "#5a6b3f"], ["steel blue", "#4a6a8a"], ["burgundy", "#5e1a2b"],
               ["mustard yellow", "#c9a227"], ["emerald green", "#1f6b4a"]]
FOOTWEAR_COLORS = [["jet black", "#17171c"], ["white", "#eceadf"], ["brown leather", "#6b4a2f"],
                   ["tan", "#c8a06a"], ["cherry red", "#8e1f1f"], ["navy", "#26364f"],
                   ["silver", "#c9ccd4"], ["gold", "#e2b96a"], ["olive", "#5a6b3f"],
                   ["burgundy", "#5e1a2b"], ["mustard", "#c9a227"], ["grey", "#6a6a72"]]
HEADWEAR_COLORS = [["black", "#17171c"], ["white", "#eceadf"], ["beige", "#d9c6a8"],
                   ["red", "#8e1f1f"], ["navy", "#26364f"], ["pink", "#f2c4d0"],
                   ["denim blue", "#3e5a86"], ["olive", "#5a6b3f"], ["burgundy", "#5e1a2b"],
                   ["mustard", "#c9a227"], ["grey", "#6a6a72"], ["steel blue", "#4a6a8a"],
                   ["forest green", "#2a5a3a"], ["tan", "#c8a06a"]]
ACC_COLORS = [["gold", "#e2b96a"], ["silver", "#c9ccd4"], ["black", "#17171c"],
              ["rose gold", "#e8b4a8"], ["pearl white", "#f0ead8"], ["gunmetal", "#4a4a52"],
              ["bronze", "#9a6a3a"], ["enamel red", "#c22b2b"],
              # the look palette's family colors, so jewelry and belts can match
              ["pastel pink", "#f2c4d0"], ["mustard yellow", "#c9a227"],
              ["burgundy", "#5e1a2b"], ["olive green", "#5a6b3f"]]
FOOTWEAR_MATERIALS = ["leather", "suede", "canvas", "patent leather", "rubber", "mesh", "velvet", "knit"]
HEADWEAR_MATERIALS = ["knit", "wool", "cotton", "leather", "silk", "straw", "denim", "felt", "corduroy", "velvet", "tweed"]
from PerfectLab.tools.ru_display import RU_DISPLAY  # noqa: E402


PROPS_LIB = ["a vintage bicycle", "a motorcycle", "a bunch of balloons", "a bouquet of flowers",
             "a film camera", "a polaroid camera", "a vinyl record", "a skateboard",
             "a vintage suitcase", "shopping bags", "a cocktail glass", "a hand mirror",
             # the interior block -- furniture that carries a home shoot
             "a velvet armchair", "a large leaning floor mirror", "a potted monstera plant",
             "a pile of scattered cushions", "a stack of coffee-table books",
             "a cluster of lit candles", "a record player on a wooden sideboard",
             "a brass floor lamp", "sheer white curtains", "a woven jute rug",
             "a wooden ladder shelf", "a vintage rotary phone",
             # the everyday carry block
             "a takeaway coffee cup", "an ice cream cone", "a slice of pizza",
             "a disposable film camera", "a bouquet of dried flowers",
             "a rolled-up magazine", "a pair of roller skates",
             # the pets block -- living props
             "a fluffy cat in her arms", "a small dog on a leash",
             # the statement furniture block
             "a grand piano", "a fireplace with a lit fire",
             "a crystal chandelier", "a four-poster bed",
             "a freestanding coat rack", "a wall of framed photos"]
COMPOSITION_LIB = ["centered symmetry", "negative space", "frame within a frame",
                   "reflection composition", "leading lines"]
LENS_LIB = ["an 85mm portrait lens with shallow depth of field", "a 50mm lens with natural perspective",
            "a 35mm street lens", "a 24mm wide lens", "a macro detail shot",
            "a tilt-shift miniature-effect lens"]
NEG_PRESETS = ["deformed hands, extra fingers", "bad anatomy, twisted limbs",
               "text, watermark, logo", "blurry, out of focus, low quality",
               "oversaturated colors", "duplicate, cloned figure",
               "cropped head, cut off limbs", "harsh jpeg artifacts",
               "asymmetrical eyes", "plastic waxy skin",
               "warped background, melted lines"]

FRAMING_LIB = list(series_nodes.TIERS.keys())   # dict order == the walk order

# curated full looks: one tile styles hair + makeup + the first look's
# outfit. Values reference the libraries verbatim; the parity test keeps
# them honest
COMBO_LOOKS = [
    {"name": "clean girl", "hair": "low chignon", "makeup": "a no-makeup natural look",
     "top": "a tiny baby tee", "bottom": "high-waisted wide-leg trousers", "footwear": "classic pumps"},
    {"name": "y2k crop", "hair": "long platinum waves", "makeup": "glossy pink lips",
     "top": "a crop top", "bottom": "a short pleated skirt", "footwear": "chunky sneakers"},
    {"name": "street layer", "hair": "half-up half-down hair", "makeup": "dewy blush on the cheeks",
     "top": "an oversized white crop hoodie", "bottom": "low-rise baggy sweatpants", "footwear": "retro skate sneakers"},
    {"name": "office sharp", "hair": "sleek high ponytail", "makeup": "sculpted contour with highlight",
     "top": "an oversized blazer", "bottom": "a satin midi skirt", "footwear": "slim stiletto heels"},
    {"name": "cozy evening", "hair": "voluminous blowout", "makeup": "berry stained lips",
     "top": "a cozy oversized sweater", "bottom": "high-waisted wide-leg trousers", "footwear": "platform loafers"},
    {"name": "night out", "hair": "side-swept curls", "makeup": "dark smokey eyes",
     "top": "a slip top", "bottom": "a satin midi skirt", "footwear": "strappy sandals"},
    {"name": "sporty set", "hair": "messy bun with loose strands", "makeup": "glass skin glow",
     "top": "a track jacket with piping details", "bottom": "loose track pants", "footwear": "chunky sneakers"},
    {"name": "goth edge", "hair": "wet-look slicked back hair", "makeup": "black gothic lipstick",
     "top": "a biker jacket over a band tee", "bottom": "distressed skinny jeans", "footwear": "lug-sole combat boots"},
]


def jlist(name, items):
    return f"export const {name} = {json.dumps(items, ensure_ascii=False)};\n"


def build():
    out = ["// GENERATED by tools/build_libraries.py -- the single source of truth\n"
           "// shared by the Python engine and the panels. Edit the Python lists\n"
           "// (person_node, wardrobe_node, look_nodes, shoot_nodes, series_nodes)\n"
           "// or the literals inside the build script, then re-run it.\n\n"]

    persona = [{"key": f["key"], "label": f["label"], "imgcat": PERSONA_IMGCAT[f["key"]],
                "multi": f["multi"], "options": f["options"]} for f in person_node.FIELDS]
    out.append("export const PERSONA_FIELDS = " + json.dumps(persona, ensure_ascii=False) + ";\n\n")

    for name, items in [
        ("TOPS_LIB", wardrobe_node.TOPS), ("BOTTOMS_LIB", wardrobe_node.BOTTOMS),
        ("FOOTWEAR_LIB", wardrobe_node.FOOTWEAR), ("HEADWEAR_LIB", HEADWEAR_LIB),
        ("ACCESSORIES_LIB", wardrobe_node.ACCESSORIES),
        ("LIGHT_SETUPS", look_nodes.LIGHTS), ("STYLES", look_nodes.STYLES),
        ("FILMS", look_nodes.FILMS), ("LOCATIONS", look_nodes.LOCATIONS),
        ("WEATHER", look_nodes.WEATHER), ("FRAMING_LIB", FRAMING_LIB),
        ("POSE_LIB", shoot_nodes.POSES), ("EXPRESSION_LIB", shoot_nodes.EXPRESSIONS),
        ("FOCUS_LIB", shoot_nodes.FOCUS), ("FORMAT_LIB", shoot_nodes.FORMATS),
        ("MATERIALS", MATERIALS), ("MAT_EXTRA", MAT_EXTRA),
        ("FOOTWEAR_MATERIALS", FOOTWEAR_MATERIALS),
        ("HEADWEAR_MATERIALS", HEADWEAR_MATERIALS),
        ("LENS_LIB", LENS_LIB), ("PROPS_LIB", PROPS_LIB), ("LINGERIE_LIB", wardrobe_node.LINGERIE),
        ("COMPOSITION_LIB", COMPOSITION_LIB), ("NEG_PRESETS", NEG_PRESETS),
        ("COMBO_LOOKS", COMBO_LOOKS),
    ]:
        out.append(jlist(name, items))
    # the display dictionary: RU captions over English prompt values
    out.append("export const RU_DISPLAY = " + json.dumps(RU_DISPLAY, ensure_ascii=False,
                                                          sort_keys=True) + ";")

    for name, pairs in [("LOOK_COLORS", LOOK_COLORS), ("FOOTWEAR_COLORS", FOOTWEAR_COLORS),
                        ("HEADWEAR_COLORS", HEADWEAR_COLORS), ("ACC_COLORS", ACC_COLORS)]:
        out.append(f"export const {name} = {json.dumps(pairs, ensure_ascii=False)};\n")
    out.append("export const MATERIAL_TINT = " + json.dumps(MATERIAL_TINT, ensure_ascii=False) + ";\n")

    dst = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "web", "perfectlab_libraries.js")
    with open(dst, "w", encoding="utf-8", newline="\n") as f:
        f.write("".join(out))
    print("wrote", os.path.normpath(dst))


if __name__ == "__main__":
    build()
