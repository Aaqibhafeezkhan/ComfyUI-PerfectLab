# -*- coding: utf-8 -*-
"""Model profiles and the custom prompt template, engine side.

The panel writes session.model_profile / session.token_limit ("Name · N")
and session.template; the guard and the composer must both read them.
"""
import os
import sys

CUSTOM_NODES = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "..")
sys.path.insert(0, CUSTOM_NODES)

from PerfectLab.series_nodes import _limit_of, DEFAULT_TEMPLATE  # noqa: E402
from PerfectLab import perfectlab_studio  # noqa: E402


def test_limit_parses_the_last_number():
    # model names carry digits of their own ("Krea 2", "Flux.1")
    assert _limit_of("Krea 2 · 512") == 512
    assert _limit_of("Flux.1 · 512") == 512
    assert _limit_of("Z-Image · 400") == 400
    assert _limit_of("Qwen-Image · 1024") == 1024
    assert _limit_of("SDXL · 75") == 75


def test_limit_off_and_bare_numbers():
    assert _limit_of("off") is None
    assert _limit_of("512") == 512
    assert _limit_of(["512"]) == 512
    assert _limit_of("") == 512


def _base_config(**session_over):
    """a minimal but complete studio config, session fields overridable"""
    session = {"count": 1, "takes": 1, "look_rotation": "blocks",
               "mood_subject": False, "token_limit": "off"}
    session.update(session_over)
    return {
        "_v": 2,
        "persona": {"trigger": "", "fields": {"gender": "a young woman"}},
        "look": {"looks": []},
        "scene": {"location": "a marble studio"},
        "light": {"setup": ""},
        "style": {"grade": "", "film": "", "palette": ""},
        "camera": {"framings": {"mode": "pin", "set": [], "pin": 4},
                   "focus": {"mode": "pin", "set": [], "pin": 0},
                   "formats": {"mode": "pin", "set": [], "pin": 0},
                   "framing_order": "", "lens": ""},
        "pose": {"poses": {"mode": "pin", "set": [], "pin": 0}},
        "expression": {"arc": "", "expressions": {"mode": "pin", "set": [], "pin": 0}},
        "negative": {"enabled": False, "text": "", "presets": []},
        "shot": {"main_prompt": "", "custom": "", "style_mode": "natural"},
        "session": session,
    }


def test_default_template_composes():
    prompts, _, _, _, _ = perfectlab_studio._run_session(_base_config(), 1, 1000, -1)
    assert prompts, "the composer returned nothing"
    assert "focused on" in prompts[0]
    assert "a young woman" in prompts[0]


def test_custom_template_rides():
    cfg = _base_config(template="TEST {person} | {scene} END")
    prompts, _, _, _, _ = perfectlab_studio._run_session(cfg, 1, 1000, -1)
    assert prompts[0].startswith("TEST "), prompts[0]
    assert prompts[0].endswith("END."), prompts[0]   # the composer normalizes the trailing period
    assert "a young woman" in prompts[0]
    assert "a marble studio" in prompts[0]


def test_template_unknown_slot_leaks_as_a_word():
    # the braces dissolve, the bare word rides the prompt; the panel linter flags it
    cfg = _base_config(template="X {notaslot} Y")
    prompts, _, _, _, _ = perfectlab_studio._run_session(cfg, 1, 1000, -1)
    assert "notaslot" in prompts[0]
    assert "{notaslot}" not in prompts[0]
