## What's new in 1.1.0

### Sessions
- **Model profiles**: a named token budget (Z-Image 400, Flux 512, Krea 2 512, Qwen-Image 1024, SDXL 75, or your own number). The linter and the engine's guard read the same string, so the warning and the trim always match. SDXL flips the prompt to comma tags on its own.
- **Prompt template editor**: the sentence the engine fills, slot by slot ({style} {expression} {framing} {focus} {scene} {lighting} {person} {pose} {outfit} {placement} {quality}). A custom slot order for exotic encoders is one edit; the reset button restores the stock order; the linter flags unknown slots. LIVE TEXT now fills the template the way the engine does, instead of a rough draft.
- **Keepers in the results dock**: star the good frames, press the re-shoot button, and everything you did not star gets a fresh take that lands back in its own slot. The wall survives re-shoots now.
- **Pre-flight conflict warnings**: the swaps the engine would make silently, said out loud before the GPU pays for them. A face focus does not survive figure-tier crops, a back-to-camera pose reads the silhouette, a walked format feed drops the ratios the picked crops contradict. Each warning names the values and the swap.
- **The inspiration roll**: one click re-rolls every creative section. The persona, the trigger, your own words, the negative and the session stay untouched, and the whole roll is one undo step.

### Character and sharing
- **Character cards**: the whole persona plus the LoRA trigger under a name, saved in the ComfyUI user folder, one click to switch characters.
- **Preset export and import**: presets download as .json files and load back, so setups move between installs.
- **Ready-made looks**: eight curated full looks (clean girl, y2k crop, street layer, office sharp, cozy evening, night out, sporty set, goth edge), each styling hair, makeup and the first look's outfit in one click.

### Reading the session
- **The arc's expression route**: with a dramaturgy arc picked, the plan prints which face each shot wears, shot by shot.
- **Update indicator**: the panel quietly checks the registry once a day and shows a link when a newer release is active.

### Fixes
- The panel no longer runs into the node's widget rows: a bottom margin keeps the last line clear of mode and seed.

**Install**: ComfyUI Manager, search "PerfectLab". No Python dependencies. MIT.
