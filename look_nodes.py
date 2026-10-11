"""PerfectLab scene/light/style composers -- the LOOK layer as pluggable
parts. Each owns one layer and feeds its section of the Studio config;
the composed text carries the where, the light and the grade."""

import json

from .prompt_assistant import PerfectLabAssistant

LOCATIONS = [
    # street & urban -- day into night
    "a plain city crosswalk",
    "a quiet old-town street with cobblestones",
    "a red brick wall alley",
    "a street market in the evening",
    "a gas station at night",
    "a convenience store glowing at night",
    "a laundromat with fluorescent light",
    "a Chinatown alley with red lanterns",
    "a neon-lit arcade",
    "a night city street with glowing storefronts",
    "a subway platform",
    "an underground skatepark with graffiti walls",
    "a rooftop terrace at dusk",
    "a rooftop pool",
    "a night rooftop with string lights",
    # interiors -- work, food, home
    "a modern office lobby with glass walls",
    "a gym with mirrored walls",
    "a candlelit restaurant",
    "a retro diner booth",
    "a cozy coffee shop with big windows",
    "a record store with vinyl bins",
    "a flower shop full of bouquets",
    "a jazz club with a dim stage",
    "a cocktail bar with neon backlight",
    "an old library with tall shelves",
    "an art gallery with white walls",
    "a winter ski chalet interior",
    # home -- room by room
    "a cozy living room with a fireplace",
    "a walk-in closet full of clothes",
    "a home office with a wooden desk",
    "a vanity table with a lit mirror",
    "a sunlit kitchen with marble counters",
    "a dining room with a long wooden table",
    "a reading nook by a tall window",
    "an unmade bedroom with white sheets",
    "a bathroom with a big mirror",
    "a bathtub full of foam",
    "a home bar with warm lit shelves",
    "a sunroom with wicker furniture",
    "a breakfast nook with bench cushions",
    "a wine cellar with oak barrels",
    "an indoor pool with turquoise water",
    "a mezzanine overlooking the living room",
    "a laundry room with folded towels",
    "a garage lit by neon strips",
    "a home gym with rubber flooring",
    "an entrance hall with a coat rack",
    "a loft apartment with brick walls",
    "a stairwell with hard shadows",
    "a small balcony with potted plants",
    "a garden patio with string lights",
    "a minimalist white marble studio",
    # nature -- fields into water
    "an autumn park with golden leaves",
    "a beach at sunset",
    "a sakura park in full bloom",
    "a lavender field at midday",
    "a deep green forest with ferns",
    "a lake dock with a wooden pier",
    "a mountain overlook above the clouds",
    "a waterfall with soft mist",
    "a glass greenhouse full of plants",
    "a lighthouse on a rocky cliff",
    "a yacht deck at sea",
    "desert dunes at golden hour",
    "a frozen lake at dawn",
]
WEATHER = ["a clear sky", "light rain", "thick fog", "soft snowfall",
           "an overcast sky", "a golden haze",
           "a thunderstorm with dark clouds", "a misty morning",
           "strong wind", "a rainbow after rain",
           # in-air effects -- work indoors too
           "falling cherry petals", "bubbles floating"]
LIGHTS = [
    # the day clock -- dawn into night
    "cold low dawn light with long soft shadows",
    "bright clean morning light with soft shadows",
    "hard midday sun with crisp deep shadows",
    "warm late-afternoon light with gentle contrast",
    "golden hour glow with amber side light",
    "blue hour dusk with cool ambient light",
    "night lit by street lamps and warm practical lights",
    "neon-lit night with colored reflections",
    # classic portrait patterns
    "classic butterfly light with a small soft shadow under the nose",
    "a bright rim light tracing her outline against a dark background",
    "dramatic split light, one side of the face lit and the other in shadow",
    "strong backlight rendering her as a dark silhouette against a bright background",
    # sources with the lamp visible -- street first, then indoors
    "night lit by a single warm street lamp",
    "a neon sign glow on a dark street",
    "car headlights cutting through the dark",
    "candlelight only in a dark room",
    "cold fluorescent office light at night",
    "a single workshop lamp over a workbench",
    # studio & controlled
    "soft even studio light on polished marble",
    "soft daylight from a tall window",
    "an even ring light with circular catchlights",
    # special
    "cool moonlight over the rooftops",
    "warm string lights as the only glow",
    "a single stage spotlight in the dark",
    "harsh on-camera flash, party-photo look",
    "warm flickering firelight on the face",
]
STYLES = ["y2k aesthetic", "cinematic teal and orange grade", "editorial magazine look",
          "dreamy soft-focus atmosphere", "grungy raw-flash look", "cozy warm film look",
          "luxurious golden sheen", "sporty high-energy look", "moody noir contrast",
          "clean bright commercial look",
          "vintage sepia grade", "cyberpunk neon grade",
          "desaturated moody grade", "warm 70s film grade",
          "authentic iPhone candid aesthetic",
          "cinematic shallow depth of field with blurred background",
          # current trend aesthetics
          "clean girl aesthetic", "coquette soft ribbons look",
          "balletcore wrap style", "mob wife fur-and-glam look",
          "cottagecore pastoral look", "dark academia study look"]
FILMS = ["Kodak Portra 400 film look", "Cinestill 800T under tungsten light",
         "Fuji Superia grain", "Ilford black and white", "faded film grain",
         "light leaks",
         "Kodak Gold 200 film look", "Polaroid instant film look",
         "Lomography purple film look", "Tri-X push-processed black and white",
         "Ilford HP5 push-processed grain", "Kodak Portra 800 night grain",
         "Lomography redscale", "high-contrast film-noir black and white"]


class PerfectLabScene:
    @classmethod
    def INPUT_TYPES(cls):
        return {"required": {"scene_data": ("STRING", {"default": "{}", "multiline": False})}}

    RETURN_TYPES = ("STRING",)
    RETURN_NAMES = ("scene",)
    FUNCTION = "build"
    CATEGORY = "PerfectLab"
    DESCRIPTION = "Builds the location layer of the prompt: a place, the weather and a free add-on. Wire it into the Shot Series scene slot -- one writer per slot."

    def build(self, scene_data=None):
        try:
            state = json.loads(scene_data or "{}")
        except (ValueError, TypeError):
            state = {}
        parts = []
        if (state.get("location") or "").strip():
            parts.append("the setting is " + state["location"].strip())
        if (state.get("weather") or "").strip():
            parts.append(state["weather"].strip())
        if (state.get("details") or "").strip():
            parts.append(state["details"].strip())
        return (", ".join(parts),)


class PerfectLabLight:
    @classmethod
    def INPUT_TYPES(cls):
        return {"required": {"light_data": ("STRING", {"default": "{}", "multiline": False})}}

    RETURN_TYPES = ("STRING",)
    RETURN_NAMES = ("light",)
    FUNCTION = "build"
    CATEGORY = "PerfectLab"
    DESCRIPTION = "One lighting writer for the whole shoot: pick a setup, or set the hour and reuse the Prompt Assistant's clock phrases. Wire it into the Shot Series light slot -- one writer per slot."

    def build(self, light_data=None):
        try:
            state = json.loads(light_data or "{}")
        except (ValueError, TypeError):
            state = {}
        parts = []
        if (state.get("setup") or "").strip():
            parts.append(state["setup"].strip())
        else:
            hour = state.get("hour")
            if isinstance(hour, (int, float)) and 0 <= int(hour) <= 24:
                phrase = PerfectLabAssistant().get_lighting_description(int(hour))
                if phrase:
                    parts.append(phrase)
        if (state.get("details") or "").strip():
            parts.append(state["details"].strip())
        return (", ".join(parts),)


class PerfectLabStyle:
    @classmethod
    def INPUT_TYPES(cls):
        return {"required": {"style_data": ("STRING", {"default": "{}", "multiline": False})}}

    RETURN_TYPES = ("STRING",)
    RETURN_NAMES = ("style",)
    FUNCTION = "build"
    CATEGORY = "PerfectLab"
    DESCRIPTION = "Sets the grade, the film and an optional color palette of the shoot. Wire it into the Shot Series style slot."

    def build(self, style_data=None):
        try:
            state = json.loads(style_data or "{}")
        except (ValueError, TypeError):
            state = {}
        parts = []
        if (state.get("grade") or "").strip():
            parts.append(state["grade"].strip())
        if (state.get("film") or "").strip():
            parts.append(state["film"].strip())
        palette = state.get("palette") or []
        if isinstance(palette, str):
            palette = [palette] if palette.strip() else []
        palette = [x.strip() for x in palette if x.strip()]
        if palette:
            parts.append("color palette: " + ", ".join(palette))
        if (state.get("details") or "").strip():
            parts.append(state["details"].strip())
        return (", ".join(parts),)


NODE_CLASS_MAPPINGS = {
    "PerfectLabScene": PerfectLabScene,
    "PerfectLabLight": PerfectLabLight,
    "PerfectLabStyle": PerfectLabStyle,
}
NODE_DISPLAY_NAME_MAPPINGS = {
    "PerfectLabScene": "🧪 PerfectLab – Scene",
    "PerfectLabLight": "🧪 PerfectLab – Light",
    "PerfectLabStyle": "🧪 PerfectLab – Style",
}
