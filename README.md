# 🧪 PerfectLab Studio: photoshoot prompt builder for ComfyUI

![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)
![Platform](https://img.shields.io/badge/platform-ComfyUI-9244D1)
[![Release](https://img.shields.io/github/v/release/perfectmodelslab/ComfyUI-PerfectLab?label=release&color=FF9544)](https://github.com/perfectmodelslab/ComfyUI-PerfectLab/releases)
[![Telegram](https://img.shields.io/badge/telegram-%40PerfectJohny-26A5E4)](https://t.me/PerfectJohny)

PerfectLab Studio builds AI photoshoots inside one ComfyUI node. Pick the person, the outfit, the place, the light and the camera from libraries with photo previews. One button composes every prompt, sizes and seeds, then sends the whole session into your graph. 625 library values, 553 photo tiles, multi-shot sessions, dramaturgy arcs, wildcards and a prompt linter, with model-aware token budgets for Z-Image, Flux, Qwen-Image and SDXL.

<p align="center"><img src="docs/studio_panel.png" alt="PerfectLab Studio panel" width="760"></p>

## 🎯 Why PerfectLab Studio

- **A whole shoot in one click.** Set the number of shots and takes, press START SHOOT. The session walks the crops, poses and expressions you picked, one per frame, each with its own seed and metadata line. The prompt carries exactly what you chose: nothing rides in uninvited.
- **You pick what you see.** Every library entry carries a photo tile: 553 previews rendered through a real graph, the same face and the same light across the whole set.
- **The person stays the same.** The persona block and per-shot seeds keep the description stable, and a fixed-seed option pins one noise to the whole session for clean A/B. For the same *face* across shoots, use a character LoRA: type its trigger word into the trigger line and every prompt starts with it. Prompts alone give you the same description; a LoRA gives you the same person.
- **Prompts that fit the model.** Natural language for Flux, Z-Image and Qwen-Image, comma tags for SDXL. The built-in linter watches the token budget, duplicates, unbalanced braces and missing wildcard files.
- **The preview is the render.** LIVE TEXT in the right column is byte-identical to the prompt the engine queues: the same walk order, the same arc bends and couplings, the same token trim, the same wildcard and choice picks per seed. What you read before shooting is what the GPU gets.
- **A session with a story.** Dramaturgy arcs bend the shoot along an emotional curve: quiet points render once, climaxes pull closer crops, stronger poses and full take stacks.
- **Your own everything.** Custom wardrobe, props and places typed right into the cards. Your own wildcard lists, presets and arcs as files. Tiles for your own pieces shot through your own graph.
- **No Python dependencies.** Unzip, restart, shoot. MIT licensed.

## 🚀 Quick start

1. Install the node (see [Install](#-install)).
2. Open the bundled workflow: [workflows/perfectlab_base_workflow.json](workflows/perfectlab_base_workflow.json), wired end to end with a demo shoot already picked.
3. Change the model names in the three loader nodes to yours.
4. Press **● START SHOOT** in the panel header.

<p align="center"><img src="docs/demo.gif" alt="Picking, searching, the overview wall" width="760"></p>

## 📸 What a shoot looks like

Six looks, six scenes, six grades: each frame picks its own outfit, location, light, pose and expression from the libraries.

<table><tr>
<td><img src="docs/shots/shot_01.jpg" alt="Winter Coffee" width="236"><br><b>Winter Coffee</b></td>
<td><img src="docs/shots/shot_02.jpg" alt="City Crosswalk" width="236"><br><b>City Crosswalk</b></td>
<td><img src="docs/shots/shot_03.jpg" alt="Marble Studio" width="236"><br><b>Marble Studio</b></td>
</tr><tr>
<td><img src="docs/shots/shot_04.jpg" alt="Preppy Street" width="236"><br><b>Preppy Street</b></td>
<td><img src="docs/shots/shot_05.jpg" alt="Night Selfie" width="236"><br><b>Night Selfie</b></td>
<td><img src="docs/shots/shot_06.jpg" alt="Moon Boots" width="236"><br><b>Moon Boots</b></td>
</tr></table>

The picks behind every frame (garments, colors, materials, location, light, grade, pose, expression) show on the overview wall:

<p align="center"><img src="docs/sections/overview_wall.png" alt="The overview wall with every pick" width="760"></p>

## ◈ Overview

One row per section: every tile that section has picked. Click a row label to jump into that section. The sticky bar at the top of any card keeps the current picks visible while you scroll.

## 👤 Persona

Ten fields, each combining into the persona text. Multi-pick fields stack, single-pick fields replace. The **character cards** row saves the whole persona plus the LoRA trigger under a name: build a character once, switch between your characters in one click.

### 💇 Hair

30 styles from platinum waves to a pixie cut, including the afro-textured family (afro, box braids, cornrows, locs) and a buzz cut. Each tile shows the hairstyle on the same face.

<p align="center"><img src="docs/sections/hair_pick.png" alt="Hair card, one style picked" width="720"></p>

### 🎨 Hair color

16 saturated carriers, the same pose and the same seed, only the tone changes.

<p align="center"><img src="docs/sections/hair_color_pick.png" alt="Hair color card" width="720"></p>

### 💄 Makeup

26 looks in zones: nine eye looks (extreme macro on the eyes), ten lip looks (one closed mouth each), three blush tiles, the trend wave (cold girl, siren eyes, glass skin, sculpted contour) and a bare face.

<p align="center"><img src="docs/sections/makeup_pick.png" alt="Makeup card scrolled to the lip tiles" width="720"></p>

### Other persona fields

- **Gender**: 5 options (young/mature woman, young/mature man, androgynous), tiles without the cast LoRA
- **Age**: 5 presets from 18 to ageless
- **Figure**: 26 keys, ten whole-figure builds (very slim to plus-size, petite to tall) plus sixteen body-part keys (large/small bust, wide/narrow hips, thin/muscular arms, broad shoulders, wasp waist, broad back, long/muscular legs, narrow shoulders), multi-pick
- **Eyes**: 10 colors with a heterochromia tile
- **Skin**: 10 tones (porcelain to deep ebony, beach tan lines, body oil glow), one seed and one pose across the whole set
- **Signature**: 15 marks (beauty marks, nose rings, scars, a gap tooth, a freckle constellation, a full tattoo sleeve), multi-pick
- **Nails**: 8 manicures (French tips, glossy red, almond nude, chrome, pearl accents), they ride the hands close-ups

## 👗 Look

41 tops (street, swim, sport, sleep, evening), 32 bottoms, 28 footwear, 13 headwear, 36 accessories and its own Lingerie slot with 10 sets. Each garment takes a color from photo swatches and a material from 22 fabric textures. Both go into the prompt: *wearing silk cropped tank top in champagne gold*. The top card also carries **ready-made looks**: one tile styles hair, makeup and the first look's outfit together (clean girl, y2k crop, street layer, office sharp, cozy evening, night out, sporty set, goth edge).

### 👕 Tops

Click a tile to pick the garment, click again to clear.

<p align="center"><img src="docs/sections/tops_pick.png" alt="Tops card with the garment grid" width="720"></p>

### 🧵 Materials

22 fabric textures from cotton to organza. Each material chip shows the fabric close-up. The LIBRARY row keeps pieces you typed before, with their preview tiles: 📷 attach a photo, 🎬 shoot one through your graph.

<p align="center"><img src="docs/sections/tops_materials.png" alt="Tops card with material chips" width="720"></p>

### Lingerie

Its own LOOK slot: 10 sets from a lace bralette set to a silk slip nightgown, each with color and fabric (silk, satin, lace, velvet, mesh). The set is the whole outfit when nothing covers it; a blazer over a lace bodysuit still reads as layering.

### 🧢 Headwear

13 pieces with their own color picker (14 colors).

<p align="center"><img src="docs/sections/headwear_pick.png" alt="Headwear card" width="720"></p>

### Other look fields

- **Bottoms**: 32 options, skirts, jeans, pants, shorts, dresses
- **Footwear**: 28 options with 12 shoe colors
- **Accessories**: 36 pieces with 8 jewelry metals, multi-pick, they combine into the look

## 🌍 Scene

65 locations in three blocks (street & urban, a full home floor with sixteen rooms: living room fireplace, walk-in closet, vanity, kitchen, dining, reading nook, bedroom, bathroom, foam bathtub, home bar, loft, patio, and nature). 12 weather conditions. 26 light setups. 39 props. Scene tiles show the place, no model in frame.

### Locations

From a neon-lit arcade to a minimalist marble studio, from a rooftop pool to a red brick alley. Tiles show the place, no model in frame.

<p align="center"><img src="docs/sections/location_pick.png" alt="Location card" width="720"></p>

### Light

26 setups in five blocks: eight clock phases (dawn to neon night); four classic patterns (butterfly, rim, split, backlit silhouette, shown on a mannequin head); sources with the lamp visible, street first (street lamp, neon sign, car headlights), then indoors (candlelight, fluorescent office, workshop lamp); studio & controlled (marble studio, tall window, ring light); and special (moonlight, string lights, stage spotlight, on-camera flash, firelight). Or set any hour from 0 to 24 on the clock.

<p align="center"><img src="docs/sections/light_pick.png" alt="Light card" width="720"></p>

### Weather

12 conditions, each an empty landscape, plus in-air effects that work indoors too: falling petals, floating bubbles.

<p align="center"><img src="docs/sections/weather_pick.png" alt="Weather card" width="720"></p>

### Props

39 scene props in four blocks: portable (a vintage bicycle, a motorcycle, balloons, a bouquet, a film camera, a polaroid, a vinyl record, a skateboard, a suitcase), everyday carry (a takeaway coffee cup, an ice cream cone, a slice of pizza, a disposable camera, dried flowers, a rolled magazine, roller skates, shopping bags, a cocktail glass, a hand mirror), living props (a fluffy cat in her arms, a small dog on a leash) and statement furniture (a grand piano, a lit fireplace, a chandelier, a four-poster bed, a coat rack, a wall of framed photos). Multi-select: they ride the scene line as *with a bouquet and a vinyl record*.

<p align="center"><img src="docs/sections/props_pick.png" alt="The props grid in the location card" width="760"></p>

## 🎞 Style

22 grades and looks (from y2k to clean girl, mob wife and dark academia), 14 films and analog effects, and a palette of up to 5 swatches with a modifier (neon, pastel, matte, metallic, earthy).

<p align="center"><img src="docs/sections/style_pick.png" alt="Grade card" width="720"></p>

## 📷 Camera

### Framing

15 crops: seven classic (extreme close-up to wide), five angles (profile, over-the-shoulder, low, high, dutch), a mirror shot, a top-down flat lay and an extreme wide establishing shot. Multi-pick: the session walks them in order, wide to close.

<p align="center"><img src="docs/sections/framing_pick.png" alt="Framing card with three crops picked" width="720"></p>

### Other camera fields

- **Focus**: 14 attention points (face, eyes, outfit, hands, full figure, silhouette, background, hair, shoes, jewelry, profile, lips, fabric texture, reflection in a puddle)
- **Lens**: 6 picks: 85mm portrait, 50mm natural, 35mm street, 24mm wide, macro detail, tilt-shift miniature
- **Composition**: 5 rules: centered symmetry, negative space, frame within a frame, reflection composition, leading lines
- **Format**: pinned aspect ratios (1:1, 4:5, 3:4, 2:3, 9:16, 3:2, 16:9, 21:9, 65:24 XPan pano) or follows the framing

## 🚶 Pose

42 poses as a walk. Each tile shows the pose in full body.

<p align="center"><img src="docs/sections/pose_pick.png" alt="Pose card" width="720"></p>

## 😊 Expression

33 expressions as a walk: the picked set rotates across the session, one per shot.

<p align="center"><img src="docs/sections/expression_pick.png" alt="Expressions card" width="720"></p>

## 🎬 Session

The SESSION section sets what one START SHOOT renders: **shots** (1 to 100), **takes** per shot (1 to 4), **look rotation** (blocks: one look per stretch of shots; mixed: every shot may change), *mood on the subject line* (the expression rides the persona's lead clause instead of standing after the crop, so moods read stronger) and *one seed for every shot* (the whole session on the same noise, a clean A/B where only the framings, poses and looks vary).

The SESSION section also carries the **model profile**: a named token budget (Z-Image 400, Flux 512, Krea 2 512, Qwen-Image 1024, SDXL 75, or your own number). The linter and the engine's guard read the same string, so what the panel warns about is exactly what the engine trims. Under it, the **prompt template** editor: the sentence the engine fills, slot by slot. A custom slot order for exotic encoders is one edit, the reset button brings the stock order back, and the linter flags unknown slots.

The **⚙ button** in the panel header opens the **settings**: the seed (its value, a 🎲 roll, and how it advances between shoots: fixed, +1 or random), the **view** (the preview tile size S / M / L / XL and the interface scale 100 / 115 / 130%) and the **interface language**. The seed is the same seed ComfyUI's own control would carry; the panel keeps it one click away, and LIVE TEXT re-rolls its wildcards with it.

<p align="center"><img src="docs/sections/settings.png" alt="The settings popup: seed, view, language" width="760"></p>

The rendered frames land in the preview dock under the panel. In session mode every dock tile is clickable: **re-shoot this frame** queues a single fresh take of that exact shot, same framing, pose and expression, a new roll of the dice on the seed. Each tile also carries a ★: star the keepers, press ↺ and the panel re-shoots every frame you did not star, each fresh take landing back in its own slot.

<p align="center"><img src="docs/sections/session_pick.png" alt="The SESSION section: profile, arc, couplings, template" width="760"></p>

**RESET ALL** empties every pick, and a session with nothing picked composes an empty prompt: a blank slate reads blank, no stock words ride in uninvited. The first real pick switches the full machinery back on.

## 🎭 Dramaturgy arcs

A photoshoot reads better as a story than as a list. An arc gives the session an emotional curve: every shot gets an energy level from 0 (quiet point) to 1 (climax), and the engine bends the shoot along it.

<p align="center"><img src="docs/sections/session_pick.png" alt="An arc picked with all five couplings on and its expression route" width="760"></p>

**What an arc is.** A named curve plus its expression route. `quiet to climax` walks serene → curious → soft smile → half-smile → excited → laughing out loud; `slow burn` smolders from pensive to a bitten lip; `cold front` hardens from serene to a fierce glare; `story wave` rises, falls and rises again. Pick one in the SESSION section: the chip row shows every arc with its route as a tooltip, and the plan prints the route shot by shot, so you see which face each frame wears before you press the button.

**What the curve drives.** With an arc picked, five couplings come alive in the SESSION section, each optional:

- **takes follow the arc**: quiet points render once, the climax gets the full take stack to pick from (it also saves VRAM: a 6-shot climax run renders 1-1-2-2-4-4 frames instead of 24)
- **pose follows the arc**: a climax pulls a dominating stance, a quiet point a relaxed one; contradictions swap for compatible poses from the same feed
- **placement follows the arc**: a climax closes the stance in, a quiet point steps back, inside what the crop allows
- **crop follows the arc**: a climax tightens the crop, a quiet point lets it breathe wider
- **focus follows the arc**: a climax draws the eye onto the person, a quiet point lets it drift off

The light line bends too, always: at quiet points the intensity words in your light setup read softer, at climaxes bolder, the nouns survive, only the tone swaps. Each frame's META carries the arc level and every swap, so the CSV export doubles as calibration material.

**Your own curves.** Drop a file named `perfectlab_arcs.json` into the ComfyUI user folder (`user/default/` on current builds, `user/default/userdata/` on older ones):

```json
{
  "my noir evening": {
    "kp": [17, 19, 24, 6, 27, 21],
    "lv": [0.1, 0.3, 0.5, 0.7, 0.9, 1.0],
    "note": "tired gaze to fierce glare, my way"
  }
}
```

`kp` are expression indexes into the 33-expression library (the arc's route), `lv` the matching energy levels 0..1, `note` an optional tooltip. A new name joins the picker; a built-in name replaces that curve. Two more files re-tune the engine the same way: `perfectlab_tone.json` (`{"hard lighting": ["candlelight hush", "neon glare"]}`, how one intensity word reads at the two ends) and `perfectlab_energy.json` (per-pose/placement/framing/focus energies). All three re-read on change, no restart. The panel's LIVE TEXT mirrors them, so what you preview is what renders.

## 🔍 Search

Type a word in the header search box. Matching picks from all libraries appear with their thumbnails. The search reads both languages: it finds «закат» as well as "sunset". Click a result to pick it.

## ✍️ Text tools

Any own-line and the custom field understand:

- **`{a|b|c}`**: an inline choice. Every shot picks one alternative from its own seed; nested braces resolve inside-out.
- **`__filename__`**: a wildcard file. Pulls a line from the file (one phrase per line, `#` comments skip, re-reads when the file changes). Two starters ship: `__mood__`, `__time_of_day__`.

Both resolve everywhere the text goes: the natural-language prompt, the SDXL tag list and the negative prompt all run the same resolution.

**⁂ WILDCARDS** in the rail bottom opens the wildcard manager built into the panel: create your own `__name__` lists, edit the whole file in one textarea, delete what you no longer need. Your files live in the profile folder and survive node updates; editing a bundled starter makes your own copy that overrides it.

## ⚠️ Linter

The ⚠ badge in the header counts problems in the composed prompt: token overflow against the model profile's budget, own lines over 300 characters, duplicates, unbalanced braces, choices without a `|`, missing wildcard files, an empty negative. Click for the list.

It also counts **conflicts**: the swaps the engine would make silently, said out loud before the GPU pays for them. A face focus (the face, the eyes, the lips) does not survive figure-tier crops, the engine swaps it to the full figure there. A back-to-camera pose reads the silhouette, so a face focus turns into one. A walked format feed drops every ratio the picked crops contradict, while a pinned format is a deliberate ask and passes as-is. Each warning names the values and the swap: change the pick, or pin it on purpose.

<p align="center"><img src="docs/sections/inspire_pick.png" alt="After one inspiration roll: every creative section re-rolled" width="760"></p>

The **🎲 inspiration roll** in the header re-rolls every creative section at once: garments, colors, materials, accessories, location, weather, light, props, grade, film, palette, framings, focus, lens, poses and expressions. The persona, the trigger, your own words, the negative, the session settings and the output formats stay untouched. The whole roll is one undo step: Ctrl+Z takes it back.

## 🤖 Models and token budgets

The panel composes for the encoder in front of it. The **model profile** in the SESSION section sets the budget and the wording family (SDXL flips to comma tags automatically); the token estimate under LIVE TEXT and the engine's guard both read the same profile.

| Model profile | Prompt style | Budget |
| --- | --- | --- |
| Z-Image / Turbo | natural language | 400 tokens per prompt |
| Flux.1 Dev / Schnell | natural language | 512 tokens |
| Krea 2 | natural language | 512 tokens |
| Qwen-Image | natural language | 1024 tokens |
| SDXL base and refines | comma tags | 75-token chunks |
| Custom | keeps the current style | your own number |

When the estimate runs over the budget the linter badge turns amber, LIVE TEXT says so, and the engine's guard drops the low-priority slots on the render itself:

<p align="center"><img src="docs/sections/budget_pick.png" alt="Over budget: the amber linter badge, the warning list, the estimate over the limit" width="760"></p>

Own lines (the main prompt, the scene line, custom additions) are capped at 300 characters each: past that the encoder stops reading the line as one intent. Token order follows the encoder behavior: the style clause goes first, the mood second, the camera line before the person.

### ⚡ Turbo models and the negative prompt

Z-Image Turbo and other distilled checkpoints run at **CFG 1.0**, and at CFG 1 the negative prompt is mathematically inert: the sampler never steers away from it, so conditioning on it changes nothing. On such graphs the NEGATIVE output can stay unwired (or wired to a `ConditioningZeroOut`); the prompt text alone carries the shoot. On standard models (SDXL base, Flux Dev, CFG 3.5 to 7) the negative is active and the common guards earn their place. At CFG 1 the levers that still work are token order and concrete physical wording, which is what the engine's template already does: the grade first, the mood second, the camera line before the person.

## 📤 Outputs

`PROMPT · NEGATIVE · WIDTH · HEIGHT · SEED · META`, all lists:

- `PROMPT` → CLIP Text Encode (positive)
- `NEGATIVE` → CLIP Text Encode (negative)
- `WIDTH` / `HEIGHT` → Empty Latent Image
- `SEED` → KSampler seed
- `META` → a JSON recipe per shot (framing tier, seed, takes)

## ❓ FAQ

**Can I use my own LoRA?**
Yes. Type its trigger word into the trigger/prefix line in the right column and every prompt starts with it. The bundled workflow shows the wiring with two example LoRAs.

**Can I add my own clothes, places and props?**
Type a custom entry in any card. The LIBRARY row remembers it across sessions. Attach a photo tile from disk with 📷, or shoot a preview tile through your own graph with the 🎬 button.

**Where do my files live?**
In the ComfyUI user folder (userdata): your custom library, presets, wildcards and arcs. They survive node updates; a bundled wildcard starter you edit becomes your own copy.

**Can I build a dataset with it?**
Yes. Every frame carries a META line with the full recipe (framing tier, seed, takes, arc level). The CSV export doubles as caption and calibration material.

**Does it work with my checkpoint?**
Any text-to-image model works: the node feeds your graph through the standard CLIP Text Encode inputs. The prompt style switch and the token budget cover the SDXL tags family and the natural-language families (Z-Image, Flux, Qwen-Image).

**Can I plug it into my existing workflow?**
Yes. The node outputs PROMPT, NEGATIVE, WIDTH, HEIGHT, SEED and META lists. Wire them into your CLIP Text Encode, Empty Latent Image and KSampler nodes as usual. The model graph stays yours: SDXL, Flux, Z-Image, Qwen-Image, video pipelines, anything that takes a text prompt.

**Can I import characters I already made?**
If a character is a LoRA, type its trigger word into the trigger/prefix line and it rides every prompt. The **character cards** row in PERSONA saves the fields plus the trigger under a name and loads them back in one click. Saved prompt texts can be pasted into any own-line field, and the presets row now exports and imports presets as files, so setups move between installs.

**Can I make the preview tiles bigger?**
Two levers live in the **⚙ settings popup**: the preview tile size (S / M / L / XL) and the interface scale (100 / 115 / 130%, growing the text and every em-sized control). Both are remembered per browser. The node itself stretches too: drag its bottom-right corner and the whole panel follows, fitting more of the library on screen; it never collapses below its comfortable minimum.

**Will prompts alone give me a fully consistent character?**
No, and it is worth saying plainly: text locks the description, not the face. The persona fields keep the same wording in every shot, the fixed-seed option keeps the same noise, and a character LoRA is what locks the face itself. The trigger line exists for exactly that.

**Do the preview tiles need the internet?**
No. All 700 preview tiles ship inside the package and load from your disk, so the panel works fully offline.

**Is the interface translated?**
The language switch lives in the **⚙ settings popup** (EN / RU); the choice is remembered per browser. Library captions are translated too, the prompts stay English on purpose: English is what the encoders read best.

## ⌨️ Hotkeys

| Key | Action |
| --- | --- |
| **Ctrl+Z** / **Ctrl+Shift+Z** / **Ctrl+Y** | undo / redo a pick |
| **X** | clear the active card |
| **Shift+X** | clear the whole section |
| **Alt+X** | reset everything |

## 📦 Install

1. **ComfyUI Manager** (recommended). Search for `PerfectLab`, install, restart ComfyUI.
2. **ComfyUI Registry.**
   [perfectlab on registry.comfy.org](https://registry.comfy.org/publishers/perfectmodelslab/nodes/comfyui-perfectlab).
3. **Manual.**
   ```
   git clone https://github.com/perfectmodelslab/ComfyUI-PerfectLab.git ComfyUI/custom_nodes/PerfectLab
   ```
   Then restart ComfyUI.

No Python dependencies. Works with any text-to-image model: SDXL, Flux, Z-Image, Qwen-Image and others.

## 🔧 Troubleshooting

| Problem | Fix |
|---|---|
| The panel did not appear after install or update | Hard refresh the browser (Ctrl+F5). |
| The node is missing from the menu | Restart ComfyUI. |
| Preview tiles do not load | Check that `web/guide/items/` exists in the node folder. |
| The prompt comes out empty | Pick at least one thing in PERSONA or LOOK. |
| Wrong text mode for your model | Switch NATURAL / TAGS in the right column. |
| Custom entries do not survive a reload | PerfectLab ships its own write endpoint as a fallback. |

## 📖 Full manual

Every section documented card by card, with the complete tile library walls: [docs/sections/sections.md](docs/sections/sections.md).

## 📄 License

MIT, see [LICENSE](LICENSE). Author and support: [@PerfectJohny](https://t.me/PerfectJohny).
