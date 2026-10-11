# -*- coding: utf-8 -*-
"""Find English UI strings in the panel that are not covered by the RU chrome dict. v2"""
import io, re, sys, os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
FILES = [
    os.path.join(ROOT, "web", "perfectlab_studio_panel.js"),
    os.path.join(ROOT, "web", "perfectlab_panel_factory.js"),
]

def ru_keys_of(src):
    m = re.search(r'const RU = \{(.*?)\n\};', src, re.S)
    keys = set()
    if m:
        keys = set(re.findall(r'"((?:[^"\\]|\\.)+)"\s*:', m.group(1)))
    return keys

def tr_used(src):
    return set(re.findall(r'tr\(\s*"((?:[^"\\]|\\.)+)"', src))

def is_code(s):
    if "${" in s or "${" == s[:2:2]:
        return True
    if "plx-" in s or "plp-" in s or "plx" in s.split()[0:1]:
        return True
    if re.search(r'[;{}]|=>|function|return |const |let |var |if\(|\.js|http', s):
        return True
    if re.match(r'^[\s\-–—*#.,:;()\[\]|/\\+=<>~^&%$@!?"\'`_0-9]+$', s):
        return True
    if s.startswith("--") and ":" in s:  # css var
        return True
    if s.startswith(("grid-", "display", "position", "font", "color:", "background", "margin", "padding", "width", "height", "top:", "left:", "right:", "bottom:", "transform", "border", "overflow", "flex", "gap:", "align", "justify", "z-index", "opacity", "filter", "box-", "text-", "letter", "line-", "max-", "min-", "cursor", "scroll", "transition", "object-", "white-", "word", "aspect", "backdrop")):
        return True
    if re.search(r'\.(value|name|widgets|type|id|src|href|style|classList|push|join|map|filter|find|includes|replace|split|trim|slice|length|label)\b', s):
        return True
    if re.search(r'(s|l|k|i|n|o|r|ci|idx|cat|hex|off|hot|vals|field|item|list|next|node|img|im|p|u|ui)\s*[=?+]', s):
        return True
    return False

def looks_like_ui_text(s):
    s = s.strip()
    if not s or not re.search(r'[A-Za-z]', s):
        return False
    if is_code(s):
        return False
    return True

def main():
    for path in FILES:
        src = io.open(path, encoding="utf-8").read()
        rkeys = ru_keys_of(src)
        tused = tr_used(src)
        cands = set()

        # 1) markup text between tags (incl. around ${...} inside backticks)
        for m in re.finditer(r'>([^<>{}\n][^<>{}\n]*?)<', src):
            t = m.group(1).strip()
            if t and looks_like_ui_text(t) and "${" not in t:
                cands.add(("markup", t))
        # 2) static title/placeholder attributes
        for attr in ("title", "placeholder", "aria-label"):
            for m in re.finditer(attr + r'="([^"${}\n]+)"', src):
                t = m.group(1).strip()
                if t and looks_like_ui_text(t):
                    cands.add((attr, t))
        # 3) template-literal plain segments: text around ${...} between backticks
        #    find backtick spans, replace ${...} with a marker, then pull wordy segments
        for tb in re.finditer(r'`((?:[^`\\]|\\.)*)`', src):
            body = re.sub(r'\$\{[^}]*\}', '\x00', tb.group(1))
            for seg in re.split(r'[\x00\n]', body):
                seg = seg.strip()
                # strip residual html tags
                seg = re.sub(r'</?[a-zA-Z][^>]*>', ' ', seg)
                seg = seg.strip()
                if seg and looks_like_ui_text(seg):
                    cands.add(("tmpl", seg))
        # 4) quoted literals that look like sentences / labels (multiword or Capitalized words)
        for m in re.finditer(r'"((?:[^"\\\n]|\\.)+)"', src):
            s = m.group(1).replace("\\n", " ").strip()
            if looks_like_ui_text(s) and (' ' in s or re.match(r'^[A-Z]', s)):
                cands.add(("lit", s))

        print("=" * 70)
        print(os.path.basename(path), "- RU dict keys:", len(rkeys), " tr() used:", len(tused))
        un = [(k, t) for (k, t) in sorted(cands) if t not in rkeys and t not in tused]
        for kind, t in un:
            print("[%s] %r" % (kind, t))
        print("total flagged:", len(un))

if __name__ == "__main__":
    main()
