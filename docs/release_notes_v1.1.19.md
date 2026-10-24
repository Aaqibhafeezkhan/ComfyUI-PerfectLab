# v1.1.19

The panel no longer calls the internet for its own face.

## Offline fonts

The panel @imported Orbitron and Roboto from fonts.googleapis.com. Behind the GFW, on air-gapped machines and on offline ComfyUI boxes those requests hang and the panel silently falls back to system fonts.

- **The fonts now ship inside the package.** 23 woff2 subsets (latin, latin-ext, cyrillic, cyrillic-ext) live in `web/fonts`, an OFL 1.1 copy included. `styles.css` opens with local `@font-face` rules instead of the remote import, weights and unicode-ranges preserved.
- **Raised by issue #1**, where a user asked for a locally downloadable asset pack: with tiles and fonts both inside the package, there is nothing left to download and no VPN in the chain.

## Docs

- The README states the offline guarantee outright: every tile preview and both panel fonts are local. No CDN calls, no VPN needed.
- Troubleshooting covers the letter-fallback tiles case (fixed in 1.0.3, any install folder name works) and the font difference on versions older than this one.

Tests 43 passed, 1 skipped, unchanged by the release.
