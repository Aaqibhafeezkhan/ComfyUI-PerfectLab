# v1.1.18

The prompt carries exactly what you pick. Nothing rides in uninvited.

## The semantics change

Picking one tile used to switch the full machinery on: the engine walked every unpicked list (framings, focus, poses and expressions over the whole library), injected the placement cycle and the stock quality tail, and the preview showed all of it. Users read it as a bug: "you picked nothing but the persona and there is already a location, a light and a focus in the prompt."

- **Unpicked lists contribute nothing.** A pin holds one value, a picked set rotates across the session, and mode "all" (nothing picked) stays out of the prompt. The walk now applies only to what the user actually picked. The wide-to-close dramaturgy checkbox stays a deliberate ask: it walks the whole library in reverse, because the user checked it.
- **The placement auto-cycle is gone**, and so is the stock "editorial photography, natural light" tail. Both arrive only when the user sets them (quality_line in the state; placement has no picker yet).
- **The preview mirrors both sides**, byte parity verified live: a persona-only pick previews `a young woman, twin tails.` and the engine returns the same bytes. One pick, one line, exactly the pick.

## Also in this release

- The demo gif re-shot on the new semantics, node-scoped: every step shows the LIVE TEXT growing with exactly the pick, no walk noise.
- The settings popup, the lean header, the re-seated doc screenshots and the tile path audit from the earlier 1.1.x line ride along.
- Tests 44/44, three rewritten for the picks-only semantics (a format pin opens no words: a ratio is not a sentence).
