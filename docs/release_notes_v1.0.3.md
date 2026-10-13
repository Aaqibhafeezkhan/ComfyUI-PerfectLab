Fixes preview tiles and wildcard files not loading when the node is installed through ComfyUI Manager or the ComfyUI Registry.

**What was broken.** The panel built tile and wildcard URLs with a hardcoded `/extensions/PerfectLab/` prefix. A git clone named the folder `PerfectLab`, so everything worked there. Manager and registry installs name the folder `comfyui-perfectlab`, every preview URL returned 404, and every tile fell back to its letter chip. The tiles themselves were always in the package and fully offline; only the URL was wrong.

**The fix.** Tile and wildcard URLs now resolve from the module's own URL (`import.meta.url`), so they follow whatever folder name the install created: `PerfectLab`, `comfyui-perfectlab`, `ComfyUI-PerfectLab`, any other.

Also new in the README FAQ: an explicit note that all 700 preview tiles ship inside the package and the panel works fully offline, no VPN or internet needed.
