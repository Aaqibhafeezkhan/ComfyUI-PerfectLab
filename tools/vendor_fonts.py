"""one-off: vendor the panel fonts locally, next to styles.css.

Orbitron and Roboto come from Google Fonts under OFL 1.1. the panel
used to @import them from fonts.googleapis.com, which dies behind the
GFW and on offline installs. this downloads the latin, latin-ext,
cyrillic and cyrillic-ext subsets as woff2 into web/fonts and prints
the @font-face block to paste in place of the @import.
"""
import pathlib
import re
import urllib.request

UA = ("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
      "(KHTML, like Gecko) Chrome/120.0 Safari/537.36")
CSS_URL = ("https://fonts.googleapis.com/css2?family=Orbitron:wght@500;700;900"
           "&family=Roboto:wght@300;400;500;700;900&display=swap")
ROOT = pathlib.Path(__file__).resolve().parents[1]
FONTS = ROOT / "web" / "fonts"
KEEP = {"latin", "latin-ext", "cyrillic", "cyrillic-ext"}


def fetch(url):
    req = urllib.request.Request(url, headers={"User-Agent": UA})
    with urllib.request.urlopen(req, timeout=30) as r:
        return r.read()


def main():
    FONTS.mkdir(exist_ok=True)
    css = fetch(CSS_URL).decode()
    out, seen = [], set()
    for subset, body in re.findall(r"/\*\s*([\w-]+)\s*\*/\s*@font-face\s*\{([^}]+)\}", css):
        if subset not in KEEP:
            continue
        fam = re.search(r"font-family:\s*'([^']+)'", body).group(1)
        weight = re.search(r"font-weight:\s*(\d+)", body).group(1)
        style = re.search(r"font-style:\s*(\w+)", body).group(1)
        url = re.search(r"url\((https://[^)]+)\)", body).group(1)
        urange = re.search(r"unicode-range:\s*([^;]+)", body).group(1).strip()
        name = f"{fam.lower()}-{weight}-{subset}.woff2"
        if name in seen:
            continue
        seen.add(name)
        (FONTS / name).write_bytes(fetch(url))
        out.append(
            f"@font-face {{\n"
            f"  font-family: '{fam}';\n"
            f"  font-style: {style};\n"
            f"  font-weight: {weight};\n"
            f"  font-display: swap;\n"
            f"  src: url('fonts/{name}') format('woff2');\n"
            f"  unicode-range: {urange};\n"
            f"}}"
        )
        print("saved", name)
    out_css = "\n".join(out) + "\n"
    (ROOT / "web" / "fonts.css").write_text(out_css, encoding="utf-8")
    print(f"\n{len(seen)} files, fonts.css written ({len(out_css)} bytes)")


if __name__ == "__main__":
    main()
