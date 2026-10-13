## What's new in 1.0.2

### Libraries: 625 values, 553 photo tiles
- Persona: 30 hairstyles (afro-textured family added), 16 hair colors, 26 makeup looks, 15 signature marks, 8 manicures (new Nails field)
- Look: 41 tops, 32 bottoms, 28 footwear, 13 headwear, 36 accessories, and a new Lingerie slot (10 sets) with colors and fabrics
- Scene: 65 locations (a 16-room home floor added), 39 multi-pick props, 26 light setups with the 0-24 clock
- Camera: 15 framings (mirror, top-down and extreme wide added), 14 focus points
- Removed by feedback: 2 lenses that misfired and 6 weather effects that looked bad

### Sessions and arcs
- Dramaturgy arcs: 7 built-in emotional curves with 5 optional couplings (takes, pose, placement, crop, focus); your own curves load from perfectlab_arcs.json
- Fixed-seed option: the whole session on one noise, a clean A/B where only the framings, poses and looks vary
- Re-shoot any single frame from the results dock with one click
- Walk order per shot: related lists march in lockstep

### Prompts
- Token order per encoder: style first, mood second, camera before the person
- Model-aware budgets: Z-Image 400, Flux 512, Qwen-Image 1024, SDXL 75-token chunks
- 300-character guard on own lines, prompt style switch (natural language vs SDXL tags)
- Prompt linter with readable messages: token overflow, duplicates, unbalanced braces, missing wildcard files, empty negative

### Panel
- Full RU/EN interface: sections, cards, hints, linter messages and all 625 library captions translate on a button; prompts stay English
- Bilingual search: find «закат» as well as "sunset"
- Wildcard manager built into the panel: create, edit and delete __name__ lists without leaving ComfyUI
- Presets row (SAVE/LOAD), drag-and-drop PNG restore, undo/redo hotkeys

### Docs
- README rewritten for the registry, ready-to-paste About and description texts in docs/registry.md
- Full manual updated, all 35 tile walls rebuilt from the real previews

**Install**: ComfyUI Manager, search "PerfectLab". No Python dependencies. MIT.
