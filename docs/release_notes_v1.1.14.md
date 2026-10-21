# v1.1.14

Eleven engine bugs fixed, the panel rebuilt on ComfyUI's own resize contract, and the LIVE TEXT preview brought to byte-for-byte parity with the engine.

## New in the panel

- **The node stretches.** Drag the bottom-right corner and the whole panel follows: more width fits more tiles per row, more height fits more of the library on screen, and the panel never collapses below its comfortable minimum. The old fight between the panel and ComfyUI's own layout is gone; the node now rides the frontend's documented sizing path.
- **Seed settings, one click away.** The ⚙ button in the header opens the seed value, a dice roll, and how the seed advances between shoots: fixed, +1 after every shot, or random. LIVE TEXT re-rolls its wildcards with the seed.
- **Interface scale.** The % button cycles 100 / 115 / 130%: the text and every button, card and caption grow with it. Canvas zoom no longer reflows the panel; only the node's own size moves it.
- **A clean RESET ALL.** A session with nothing picked now composes an empty prompt on both sides: a blank slate reads blank, no stock wording rides in uninvited. The first real pick switches the full machinery back on.

## Fixed

- **Persona blocks were losing picks.** A hairstyle vanished the moment a hair color was picked, an eye color dropped to the last makeup pick, the signature chips lost to the nails: shared blocks overwrote instead of accumulating. Every picked value rides now.
- **SDXL tag order.** The tag list listed the framing and the focus before the poses and the expressions; the engine puts poses and expressions first. Same words, wrong order; now the preview and the engine agree.
- **Tags and the negative did not resolve their text.** A typed `__wildcard__` or an inline choice `{a|b}` went to the model with its literal braces in SDXL tag mode, and the negative never resolved choices at all. Both run the same resolution chain as the positive prompt now.
- **The engine read the wrong wildcard folder.** A file created through the panel's own wildcard manager resolved in the preview but not in the render: an empty legacy folder shadowed the live one. The resolver now follows the file, not the folder.
- **The blank gate counted walks as picks.** A fully reset panel state still composed walked poses and framings into what should have been an empty prompt. The gate reads the user's actual picks now.

## Improved

- **The preview is the render.** LIVE TEXT mirrors the engine exactly: the persona reweighting per framing tier, the walk order of every unpicked list, the arc couplings (pose, placement, crop, focus, tone), the token auto-trim, the clock-light phrases, the wardrobe composer, the seed-driven picks of wildcards and choices, UTF-8 hashing for non-ASCII text. Verified byte-for-byte against the engine on reset states, single picks, rich sessions, arc sessions and over-budget states.
- **Widget restore.** Saved workflows restore the seed, the seed policy, the mode and the variations exactly, through the named values map.
- **Character cards, presets, wildcards and the search were smoke-tested end to end** through the real UI with the server running: save, load, delete, import and export all carry no console errors.
- The test suite grew from 24 to 44 tests, including cross-language parity runs against node for every hash, walk, arc and coupling the preview performs.
