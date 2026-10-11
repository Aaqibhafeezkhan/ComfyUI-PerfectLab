# Registry copy: ready-to-paste texts

Texts for the ComfyUI Registry listing (registry.comfy.org), the GitHub repo
About field and the telegram channel. Written for search: the words people
actually type (ComfyUI photoshoot, prompt builder, AI photo studio, consistent
character, LoRA, Z-Image, Flux, SDXL, dataset) appear in the first sentences.

## GitHub repo About (one line)

A single-node photoshoot prompt builder for ComfyUI: 625 photo-previewed picks, multi-shot sessions with dramaturgy arcs, wildcards, a prompt linter and model-aware token budgets for Z-Image, Flux, Qwen-Image and SDXL.

## Registry summary (short, under 200 chars)

One node, one panel: pick person, outfit, scene, light and camera from photo libraries, press one button, get a whole AI photoshoot in your graph.

## Registry description (long)

PerfectLab Studio is a photoshoot prompt builder that lives in one ComfyUI node. Instead of writing prompts by hand, you pick from libraries where every entry has a photo preview: 625 values across persona, wardrobe, scene, style and camera, rendered as 553 photo tiles through a real graph.

What a session gives you:

- **Multi-shot sessions.** Set shots (1 to 100) and takes per shot. Every frame gets its own crop, pose, expression, seed and a META line with the full recipe.
- **Consistent character.** Persona fields (hair, eyes, makeup, skin, figure, signature marks, nails), a LoRA trigger line and a fixed-seed option keep the same person across the whole shoot.
- **Dramaturgy arcs.** Seven built-in emotional curves drive takes, poses, placement, crops and focus: quiet points render once, climaxes pull closer and stronger. Your own curves load from a JSON file.
- **Model-aware prompts.** Natural language for Z-Image, Flux and Qwen-Image, comma tags for SDXL. The prompt style switch, a token estimate and a linter (token overflow, duplicates, unbalanced braces, missing wildcards) keep prompts inside each encoder's budget.
- **Your own library.** Type custom wardrobe, props and places, attach photo tiles from disk or shoot previews through your own graph. Custom entries, presets, wildcards and arcs live in the ComfyUI user folder and survive updates.
- **Text tools.** Inline choices `{a|b|c}` resolved per shot, wildcard files with a built-in manager, a 300-character guard on own lines.
- **RU/EN interface.** Captions and chrome translate on a button; prompts stay English.

No Python dependencies. MIT license. Works with any text-to-image model through your own graph: SDXL, Flux, Z-Image, Qwen-Image and others.

## Описание для телеграма / русская версия

PerfectLab Studio: конструктор фотосессий для ComfyUI в одной ноде.

Выбираете персону, образ, локацию, свет и камеру в библиотеках с фото-превью: 625 значений и 553 плитки, снятые реальным графом. Одна кнопка собирает промты под вашу модель, раскладывает сиды и отправляет всю съёмку в граф.

Что внутри:

- Сессии до 100 кадров: у каждого свой кадр, поза, выражение, сид и META-строка с полным рецептом.
- Один человек на всю съёмку: поля персоны, триггер LoRA, режим одного сида.
- Драматургические арки: 7 встроенных эмоциональных кривых управляют тейками, позами, кадрированием и фокусом; свои арки из JSON.
- Промты под модель: естественный язык для Z-Image, Flux, Qwen-Image; теги для SDXL. Линтер следит за лимитами токенов, дублями и скобками.
- Свои вещи и места: вписываете в карточку, вешаете фото или снимаете плитку своим графом.
- Вайлкарды с редактором прямо в панели, выборы {a|b|c}, пресеты, горячие клавиши.
- Интерфейс на русском и английском; промты всегда на английском.

Без Python-зависимостей, лицензия MIT. Подходит к любой text-to-image модели: SDXL, Flux, Z-Image, Qwen-Image и другие.
