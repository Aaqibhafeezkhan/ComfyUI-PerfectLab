# v1.1.17

An interface pass: the header went lean, the settings grew a home, and every library image now loads where it should.

## The header and the settings

- The header row kept growing a button per feature until nothing fit. It holds only the shoot-day controls now: the mode switch, search, START SHOOT, settings, the inspiration roll, undo/redo and RESET ALL. The tile size, the interface scale and the language moved into the reworked settings popup in three groups: SEED (the value, a dice roll, fixed/+1/random), VIEW (tile size S/M/L/XL, interface scale 100/115/130%), INTERFACE (EN/RU). Every button reads at any panel width.
- The right column lost its duplicates: the session plan was a copy of the session section's own run card, and the arc's expression route now renders in the SESSION section next to the arc picker and the couplings, where the decisions are made.
- The settings popup gained a max-height with a scroll so it never clips against the panel edge.

## Fixed

- **The lingerie color swatches 404'd on every render.** They asked for a `lingerie_color` category that never existed. The set colors are the fabric colors, so the swatches now reuse the `look_color` wall: the same 17 fabrics, the same photos, nothing missing.
- **Four accessory color swatches had no photo.** The row asks for 12 finishes while the package ships 8; the four fall back to their plain color. The shooting tool now carries an acc_color recipe for all 12, so one GPU pass closes the gap: `python tools/shoot_tiles.py acc_color`.
- **The props tiles ship black.** 39 still-life renders from an older batch came out empty; the recipes in the tool are correct, the frames on disk are stale. Re-shoot with `python tools/shoot_tiles.py props`, then rebuild the docs walls with `python tools/build_walls.py`.

## Verified

- Every one of the 700 packaged tile URLs probed from the browser: all answer, all served from the node's own web folder, none from the output directory. The custom-tile flow (user-shot previews through the graph into userdata) is untouched: stock tiles from the node folder, own tiles from userdata.
- Every section card counted chip by chip: no empty grids, no missing categories.

## Documentation

- The whole screenshot set re-shot on the live UI, English chrome, one format (1580x755): the panel, the overview wall, every section card, the LIVE TEXT column, and six new frames: the settings popup, the SESSION section with an arc and its couplings, the negative, the wildcard manager, the over-budget linter view, the inspiration roll.
- Doc frames re-seated: the props section carried the weather card (and the weather section carried nothing), headwear showed tops, tops and materials were the same shot. Each section now shows its own card.
- The demo gif rebuilt to teach: 1000px wide, 8 captioned steps from a clean slate to a picked wall.
