// PerfectLab Studio -- the single photoshoot node and its panel.
//
// One fixed-height panel: a left rail of sections, a center editor for
// the active section, a right LIVE TEXT column and a pinned bottom
// PREVIEW dock with 8 tiles per page. The height never changes, so
// ComfyUI plays no slow collapse animation. SINGLE SHOT / SESSION in the
// header; START SHOOT queues the current graph through the API and fills
// the dock with the rendered frames.
import { app } from "../../scripts/app.js";
import { chipGrid, tile, itemImg, fitNode, toggleFav, attachPresets,
         libAdd, libImgPut, libChips, wireLib, libSync, plRead, plWrite, plDrop,
         PL_VERSION }
    from "./perfectlab_panel_factory.js?v=1.0.3";
import { POSE_LIB, EXPRESSION_LIB, FRAMING_LIB, FOCUS_LIB, FORMAT_LIB,
         arcList, arcNote, isUserArc, framingText, resolveChoices, resolveWildcards,
         setUserArcs, setUserToneSwaps, setUserEnergy,
         TEMPLATE_KEYS, DEFAULT_TEMPLATE, subjectWeave, focusForShot,
         PLACEMENT_LIB, TIERS, TIER_FALLBACK_FOCUS, MACRO_SHOES, walk,
         arcSeq }
    from "./perfectlab_lib.js?v=1.0.3";
import { PERSONA_FIELDS, TOPS_LIB, BOTTOMS_LIB, FOOTWEAR_LIB, HEADWEAR_LIB,
         ACCESSORIES_LIB, LOOK_COLORS, FOOTWEAR_COLORS, HEADWEAR_COLORS,
         ACC_COLORS, FOOTWEAR_MATERIALS, MATERIALS, MAT_EXTRA, MATERIAL_TINT,
         LIGHT_SETUPS, STYLES, FILMS, LOCATIONS, WEATHER,
         PROPS_LIB, COMPOSITION_LIB, LENS_LIB, LINGERIE_LIB, NEG_PRESETS,
         COMBO_LOOKS, RU_DISPLAY } from "./perfectlab_libraries.js?v=1.0.3";

// the kit's stylesheet rides along with this module
{
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = new URL("styles.css", import.meta.url).href + "?v=1.0.3";
    document.head.append(link);
}

const GUIDE_V = "1.0.3";
// the user's override files (own arcs, tone swaps, energy re-tunes) --
// the engine reads them from the userdata tree, the preview mirrors them
// so LIVE TEXT shows what will actually render
for (const [file, setter] of [["perfectlab_arcs.json", setUserArcs],
                              ["perfectlab_tone.json", setUserToneSwaps],
                              ["perfectlab_energy.json", setUserEnergy]]) {
    plRead(file).then(t => { try { if (t) setter(JSON.parse(t)); } catch (e) {} });
}






// ---- the panel language: RU chrome over English prompt words ----------------
// library values stay English on purpose -- they are the words that go into
// the prompt; only the chrome the user reads is translated. Unknown strings
// fall back to themselves, so partial coverage degrades gracefully.
const RU = {
    "OVERVIEW": "ОБЗОР", "PERSONA": "ПЕРСОНА", "LOOK": "ОБРАЗ", "SCENE": "СЦЕНА",
    "STYLE": "СТИЛЬ", "CAMERA": "КАМЕРА", "POSE": "ПОЗА", "EXPRESSION": "ВЫРАЖЕНИЕ",
    "SESSION": "СЕССИЯ", "NEGATIVE": "НЕГАТИВ",
    "SINGLE SHOT": "ОДИН КАДР", "● START SHOOT": "● НАЧАТЬ СЪЁМКУ",
    "↺ RESET ALL": "↺ СБРОС ВСЕГО", "RESET ALL": "СБРОС ВСЕГО", "undo the last pick": "отменить последний выбор",
    "redo": "повторить", "clear every pick": "сбросить все выборы",
    "Tops": "Верх", "Bottoms": "Низ", "Footwear": "Обувь", "Headwear": "Головные уборы",
    "Accessories": "Аксессуары", "Lingerie": "Бельё", "Location": "Локация",
    "Weather": "Погода", "Light": "Свет", "Grade": "Грейд", "Film": "Плёнка",
    "Framing": "Кадр", "Focus": "Фокус", "Lens": "Объектив", "Composition": "Композиция",
    "Format": "Формат", "The pose walk": "позы списком", "Expressions": "Выражения",
    "Main": "Основное", "Gender": "Пол", "Age": "Возраст", "Figure": "Фигура",
    "Hair": "Причёска", "Hair color": "Цвет волос", "Eyes": "Глаза", "Makeup": "Макияж",
    "Skin": "Кожа", "Signature": "Приметы", "Nails": "Ногти",
    "TOPS": "ВЕРХ", "BOTTOMS": "НИЗ", "FOOTWEAR": "ОБУВЬ", "HEADWEAR": "ГОЛОВНЫЕ УБОРЫ",
    "LINGERIE": "БЕЛЬЁ", "ACCESSORIES": "АКСЕССУАРЫ", "LOCATION": "ЛОКАЦИЯ",
    "WEATHER": "ПОГОДА", "LIGHT": "СВЕТ", "GRADE": "ГРЕЙД", "FILM": "ПЛЁНКА",
    "FRAMING": "КАДР", "FOCUS": "ФОКУС", "LENS": "ОБЪЕКТИВ", "COMPOSITION": "КОМПОЗИЦИЯ",
    "FORMAT": "ФОРМАТ", "POSES": "ПОЗЫ", "EXPRESSIONS": "ВЫРАЖЕНИЯ",
    "clear persona": "очистить персону", "clear look": "очистить образ",
    "clear scene": "очистить сцену", "clear style": "очистить стиль",
    "clear camera": "очистить камеру", "clear pose": "очистить позы",
    "clear expression": "очистить выражения", "clear session": "очистить сессию",
    "clear negative": "очистить негатив", "reset everything": "сбросить всё",
    "clear card": "очистить карту", "clear": "очистить", "random pick in this card": "случайный выбор в этой карте",
    "X -- clear this card": "X — очистить эту карту",
    "every pick of every section, one wall": "все выборы всех секций, одна стена",
    "click: open the section and its subsections": "клик: открыть секцию и её подразделы",
    "replaces: one pick per slot -- the latest click wins": "заменяет: один выбор на слот — последний клик побеждает",
    "replaces: the lens line of every shot; click again to clear": "заменяет: строку объектива каждого кадра; повторный клик снимает",
    "multi: each frame takes the next picked ratio; empty = follows the framing": "несколько: каждый кадр берёт следующее выбранное соотношение; пусто = как кадр",
    "how the frame is built; click again to clear": "как построен кадр; повторный клик снимает",
    "walk: the session walks the picked set": "списком: сессия проходит выбранное множество",
    "one pick: click again to clear": "один выбор: повторный клик снимает",
    "one setup or the clock hour": "одна схема или час на циферблате",
    "what a run renders": "что рендерит один прогон",
    "what the shot carries, beyond the outfit": "что кадр несёт, помимо наряда",
    "props": "реквизит", "light setup": "световая схема", "location": "локация",
    "weather": "погода", "free scene line…": "свободная строка сцены…",
    "own location…": "своя локация…", "own setup line…": "своя схема света…",
    "own line…": "своя строка…", "own negative line…": "свой негатив…",
    "trigger / prefix": "триггер / префикс",
    "LoRA trigger (JW…)": "триггер LoRA (JW…)",
    "prefix / trigger line (JW, JWBody, …)": "строка префикса/триггера (JW, JWBody, …)",
    "own prompt additions": "свои добавки", "appended to every shot": "к каждому кадру",
    "SESSION PLAN": "ПЛАН СЕССИИ",
    "anything you want in every prompt: quality tags, camera quirks, extra words…": "что угодно в каждый промт: теги качества, особенности камеры, слова…",
    "prompt style": "стиль промта", "SDXL reads tags, not sentences": "SDXL читает теги, не предложения",
    "natural language (Flux / Z-Image)": "естественный язык (Flux / Z-Image)",
    "SDXL tags (comma list)": "SDXL-теги (через запятую)",
    "expression placement": "размещение выражения",
    "mood on the subject line": "настроение в строке подлежащего",
    "the expression rides the persona's lead clause instead of standing after the crop -- moods read stronger": "выражение едет в лид-клаузе персоны, а не стоит после кадра — настроение читается сильнее",
    "one seed for every shot": "один сид на все кадры",
    "the whole session rides the same noise -- a clean A/B where only the framings, poses and looks vary": "вся сессия на одном шуме — чистое A/B, меняются только кадры, позы и образы",
    "dramaturgy arc": "дуга драматургии", "the session's emotional curve": "эмоциональная кривая сессии",
    "flat walk": "ровный список", "the arc's couplings": "связки дуги",
    "what follows the curve": "что следует кривой",
    "takes follow the arc": "тейки следуют дуге",
    "quiet points render once, climaxes get the full stack to pick from": "тихие точки рендерятся один раз, кульминации получают весь стек на выбор",
    "pose follows the arc": "поза следует дуге",
    "a contradicting pose swaps for a compatible one from the same feed": "противоречащая поза меняется на совместимую из того же списка",
    "placement follows the arc": "размещение следует дуге",
    "a climax closes the stance in, a quiet point steps back": "кульминация сжимает стойку, тихая точка отступает",
    "crop follows the arc": "кадр следует дуге",
    "a climax tightens the crop, a quiet point lets it breathe wider": "кульминация сужает кадр, тихая точка дышит шире",
    "focus follows the arc": "фокус следует дуге",
    "a climax draws the eye onto the person, a quiet point lets it drift off": "кульминация приковывает взгляд к персоне, тихая точка отпускает его",
    "what a run does": "что делает один прогон",
    "shots": "кадры", "takes per shot": "тейков на кадр",
    "look rotation": "ротация луков", "token guard": "лимит токенов",
    "prompt issues": "проблемы промта", "search libraries…": "поиск по библиотекам…",
    "common guards": "частые запреты", "toggle into the negative line": "переключите в строку негатива",
    "negative": "негатив", "variations": "вариации",
    "picked": "выбрано", "picks active": "есть выборы", "on": "вкл",
    "model profile": "профиль модели", "Custom": "Свой",
    "re-shoot every frame you did not keep": "переснять все кадры без звёзд",
    "ready-made looks": "готовые образы", "hair, makeup and the first look's outfit in one click": "причёска, макияж и наряд первого образа одним кликом",
    "the arc's expression route": "роут выражений по дуге",
    "update available": "доступно обновление",
    "keep this frame -- the batch re-shoot skips it": "оставить этот кадр — батч-пересъём его пропустит",
    "character cards…": "карточки персонажей…",
    "save the persona as a character card": "сохранить персону карточкой",
    "delete this character card": "удалить эту карточку",
    "Character card name:": "Имя карточки персонажа:",
    "prompt template": "шаблон промта", "the engine fills the slots from your picks": "движок заполняет слоты из ваших выборов",
    "reset to default": "вернуть стандартный", "template": "шаблон",
    "is not a template slot -- the bare word leaks into the prompt.": "не слот шаблона — слово уйдёт в промт как есть.",
    "The template has no {person} slot -- the persona never reaches the prompt.": "В шаблоне нет слота {person} — персона не попадёт в промт.",
    "the token budget this profile watches": "какой бюджет токенов профиль проверяет",
    "tokens -- over the ~n~ token budget. Trim picks, or the engine's guard drops slots.": "токенов — за бюджетом (~n~). Уберите лишние выборы, иначе защита движка сбросит слоты.",
    "over the token budget, trim picks or the guard drops slots": "за бюджетом токенов — уберите лишнее, иначе защита сбросит слоты",
    "ownline": "строка", "tokens": "токены", "duplicate": "дубль",
    "braces": "скобки", "choice": "выбор", "wildcard": "вайлкард",
    "LAST SHOOT": "ПОСЛЕДНЯЯ СЪЁМКА", "close the results, back to the panel": "закрыть результаты, назад к панели",
    "re-shoot this frame": "переснять этот кадр",
    "nothing picked yet -- the subsections below are all yours": "пока ничего не выбрано — подразделы ниже к вашим услугам",
    "Press ● START SHOOT in the header when the picture looks right.": "Нажмите ● НАЧАТЬ СЪЁМКУ в шапке, когда картинка собрана.",
    "THE SHOOT AT A GLANCE": "СЪЁМКА ОДНИМ ВЗГЛЯДОМ",
    "WILDCARDS": "ВАЙЛКАРДЫ",
    "your own __wildcard__ lists, editable right here": "ваши списки __имя__, редактируются прямо здесь",
    "how it works": "как это работает",
    "Write __name__ in any own line -- the location line, the free scene line, your additions. Every shot pulls one line of that file, picked from the shot's own seed. One phrase per line, # comments skip. Your files live in the profile folder and survive node updates.": "Напишите __имя__ в любой своей строке -- локации, сцене, добавках. Каждый кадр вытянет одну строку этого файла, выбранную по сиду кадра. Одна фраза на строку, # комментарии пропускаются. Ваши файлы живут в папке профиля и переживают обновления ноды.",
    "your files": "ваши файлы", "none yet -- create one below": "пока нет -- создайте ниже",
    "bundled starters": "встроенные стартеры", "bundled": "встроенный",
    "bundled starter -- editing makes your own copy": "встроенный -- редактирование создаст вашу копию",
    "your own copy overrides the starter": "ваша копия перекрывает стартер",
    "new file": "новый файл", "name -- letters, digits, _ -": "имя -- буквы, цифры, _ -",
    "create": "создать", "editing": "редактирование", "save": "сохранить",
    "cancel": "отмена", "remove from the library": "удалить из библиотеки",
    "what this section has picked so far": "что эта секция уже выбрала",
    // ---- chrome: sections, chips, buttons, hints -------------------------
    "PREVIEW": "ПРЕВЬЮ", "no tiles": "нет плиток", "SHOOTING…": "СЪЁМКА…",
    "SHOT": "КАДР", "LIVE TEXT": "ЖИВОЙ ТЕКСТ", "estimate": "оценка", "tok": "ток",
    "over the Z-Image budget, trim picks or the guard drops slots": "за бюджетом Z-Image — уберите лишнее, иначе защита сбросит слоты",
    "author & support": "автор и поддержка",
    "the words switch off nothing -- a picked value replaces, ＋ picks toggle": "слова ничего не выключают — выбранное значение заменяет, ＋ переключает",
    "(multi)": "(несколько)", "no library": "библиотека пуста",
    "✕ clear": "✕ очистить", "X -- clear this field": "X — очистить это поле",
    "own ~f~ line…": "своя строка ~f~…",
    "one look per block -- a look replaces the whole outfit between shots; the preview strip shows the picked pieces": "один образ на блок — образ заменяет весь наряд между кадрами; лента превью показывает выбранные вещи",
    "the picked pieces": "выбранные вещи", "look name": "имя образа",
    "shoot a preview tile for this piece with your graph": "снять плитку-превью этой вещи вашим графом",
    "accessories, comma-separated": "аксессуары, через запятую",
    "own accessories, comma-separated…": "свои аксессуары, через запятую…",
    "free line": "свободная строка",
    "free line (fit, state, texture note)…": "свободная строка (посадка, состояние, фактура)…",
    "own palette line…": "своя строка палитры…",
    "pick pieces": "выберите вещи",
    "click a tile to fill the slot, click again to clear": "клик по плитке заполняет слот, повторный клик снимает",
    "top color / material": "верх: цвет / материал", "bottom color / material": "низ: цвет / материал",
    "color / material of this piece": "цвет / материал этой вещи",
    "accessory color": "цвет аксессуара",
    "applies to every picked accessory": "относится ко всем выбранным аксессуарам",
    "＋ add look": "＋ добавить образ",
    "One look for the whole session.": "Один образ на всю сессию.",
    "top": "верх", "bottom": "низ", "footwear": "обувь",
    "accessories": "аксессуары", "details": "детали",
    "palette": "палитра", "up to 5 colors + a modifier": "до 5 цветов + модификатор",
    "grade": "грейд", "film": "плёнка", "framing": "кадр", "focus": "фокус", "format": "формат",
    "the seven crops, readable wording under each": "семь кадров, подпись под каждым",
    "the classic crop": "классический кроп",
    "open wide, end on the closest crop": "от общего плана к самому крупному",
    "hour of the day: -1 = off": "час суток: -1 = выкл", "hour": "час",
    "blocks": "блоками", "mixed": "вперемешку", "off": "выкл", "none": "нет",
    "main prompt": "основной промт", "scene line": "строка сцены",
    "PIECES": "ВЕЩИ", "COLORS & MATERIALS": "ЦВЕТА И МАТЕРИАЛЫ", "FILM LOOK": "ПЛЁНОЧНЫЙ ВИД",
    "Session": "Сессия",
    // ---- card rules (card() translates the rule line itself) -------------
    "combines: every picked value joins the persona": "несколько: все выбранные значения складываются в персону",
    "one pick: the value replaces the field": "один выбор: значение заменяет поле",
    "replaces: one garment per slot -- a look replaces the whole outfit": "замена: по одной вещи на слот — образ заменяет весь наряд",
    "rides the picked garment -- 'silk satin slip dress in champagne gold'": "ложится поверх выбранной вещи — «шёлковое платье-комбинация в золоте шампань»",
    "combines: every picked accessory joins the look": "несколько: все выбранные аксессуары складываются в образ",
    "one pick: the whole-image aesthetic": "один выбор: эстетика всего кадра",
    "one pick: the film stock feel": "один выбор: характер плёнки",
    "walk: the session walks the picked crops; pin for one": "списком: сессия проходит выбранные кадры; закрепите один",
    "walk: where the eye lands, per shot": "списком: куда падает взгляд в каждом кадре",
    "walk: the expressions the session repeats": "списком: выражения, которые повторяет сессия",
    // ---- session plan ------------------------------------------------------
    "START SHOOT queues <b>~n~</b> ~shot~ × <b>~t~</b> ~take~": "«НАЧАТЬ СЪЁМКУ» ставит в очередь <b>~n~</b> ~shot~ × <b>~t~</b> ~take~",
    "across ~n~ ~look~ in ~rot~ rotation": "через ~n~ ~look~ в ротации «~rot~»",
    "on the ~arc~ arc": "по дуге «~arc~»",
    "One START SHOOT renders": "Один прогон съёмки рендерит",
    "rotate": "сменяются в ротации",
    "On the ~arc~ arc~tail~.": "Дуга: ~arc~~tail~.",
    "takes ride the curve": "тейки следуют кривой",
    // ---- linter ------------------------------------------------------------
    "~w~ is ~n~ characters -- over the ~max~ the model still reads as one intent. Split it or trim.": "~w~ — ~n~ символов: больше ~max~ модель читает текст как отдельные намерения. Разбейте или сократите.",
    "tokens -- over the Z-Image budget (400). Trim picks, or the engine's guard drops slots.": "токенов — за бюджетом Z-Image (400). Уберите лишние выборы, иначе защита движка сбросит слоты.",
    "appears twice in the prompt.": "встречается в промте дважды.",
    "Unbalanced { } in the prompt -- a choice or wildcard never resolved.": "Непарные { } в промте — выбор или вайлкард не разрешились.",
    "has no | -- drop the braces or add alternatives.": "не содержит | — уберите скобки или добавьте варианты.",
    "has no file in web/wildcards/ -- the token goes to the model as-is.": "не имеет файла в web/wildcards/ — токен уйдёт модели как есть.",
    "The negative is ON but empty -- pick guards or write a line.": "Негатив включён, но пуст — выберите запреты или напишите строку.",
    // ---- rail hotkeys / stage ---------------------------------------------
    "X · clear card": "X — очистить карту",
    "Shift+X · clear section": "Shift+X — очистить секцию",
    "Alt+X · reset all": "Alt+X — сбросить всё",
    "Nothing picked yet. Walk the sections on the left -- every tile you click lands here, one line per section, the whole shoot on one wall.": "Пока ничего не выбрано. Пройдитесь по секциям слева — каждый клик по плитке ложится сюда: строка на секцию, вся съёмка на одной стене.",
    // framing tile captions (keys = the full EN framing texts)
    "extreme close-up shot": "экстремально крупный план",
    "close-up shot": "крупный план",
    "portrait shot, head and shoulders": "портрет, голова и плечи",
    "profile shot, exact side view, the contour of her face drawing the frame": "профиль, строгий вид сбоку, контур лица строит кадр",
    "over-the-shoulder shot, the camera just behind her shoulder, her face and the far scene visible": "через плечо, камера сразу за плечом, видно лицо и дальний план",
    "low-angle shot, the camera below eye level looking up, a heroic perspective, sky or ceiling behind the figure": "нижний ракурс, камера ниже уровня глаз, героическая перспектива, за фигурой небо или потолок",
    "high-angle shot, the camera above eye level looking down, the ground visible behind the figure": "верхний ракурс, камера выше уровня глаз, за фигурой виден пол",
    "dutch-angle shot, the camera tilted, a dynamic diagonal horizon": "голландский угол, камера наклонена, динамичная диагональ горизонта",
    "medium shot, waist up, natural head-to-body proportions, visible space around the subject": "средний план, по пояс, естественные пропорции, вокруг объекта есть воздух",
    "cowboy shot, from mid-thigh up, realistic head-to-body proportions, clear space around the figure": "ковбойский план, от середины бедра, реалистичные пропорции, вокруг фигуры есть воздух",
    "full body shot, entire figure visible head to toe, realistic head-to-body proportions with a proportionally small head": "в полный рост, вся фигура с головы до ног, реалистичные пропорции с пропорционально небольшой головой",
    "environmental wide establishing shot, the figure small in the middle ground, ample negative space, realistic proportions": "широкий общий план, фигура небольшая в среднем плане, много свободного пространства, реалистичные пропорции",
    "mirror shot, the subject facing her own reflection, both the face and its mirror image in frame": "зеркальный кадр, модель лицом к своему отражению, в кадре лицо и его отражение",
    "top-down flat lay, the camera directly overhead, the subject and props arranged on the surface below": "съёмка сверху, камера строго над сценой, модель и реквизит разложены на поверхности",
    "extreme wide establishing shot, the figure a distant small element in the environment, ample negative space": "экстремально общий план, фигура далёкая и маленькая в окружении, много свободного пространства",
    // dramaturgy arc routes (keys = the bundled EN descriptions)
    "serene → curious → soft smile → half-smile → excited → laughing out loud": "безмятежность → любопытство → мягкая улыбка → полуулыбка → воодушевление → громкий смех",
    "pensive → daydream → sideways glance → curious → smirk → biting her lip": "задумчивость → мечтательность → взгляд искоса → любопытство → ухмылка → прикушенная губа",
    "shy smile → curious tilt → tongue-in-cheek → wink → biting her lip → a kiss": "робкая улыбка → любопытный наклон головы → шутка → подмигивание → прикушенная губа → поцелуй",
    "shy smile → soft smile → curious → toothy grin → excited → laughing": "робкая улыбка → мягкая улыбка → любопытство → улыбка до ушей → воодушевление → смех",
    "serene → chin up → skeptical → cold stare → steely → fierce glare": "безмятежность → подбородок вверх → скепсис → холодный взгляд → сталь → яростный прищур",
    "tired gaze → daydream → pensive → melancholic → serene → eyes closed": "уставший взгляд → мечтательность → задумчивость → меланхолия → безмятежность → закрытые глаза",
    "a full session: quiet → rise → laughter → playfulness → fall → tired stillness": "вся сессия: тихое начало → подъём → смех → игривость → спад → усталая тишина",
    // persona own-line placeholders use these lowercase labels
    "gender": "пол", "age": "возраст", "figure": "фигура", "hair": "причёска",
    "hair color": "цвет волос", "eyes": "глаза", "makeup": "макияж", "skin": "кожа",
    "signature": "приметы", "nails": "ногти", "body": "тело",
};
let LANG = localStorage.getItem("perfectlab_lang") || "ru";
// the caption under a tile: RU when a translation exists, the English
// value minus its article otherwise. The prompt NEVER sees disp().
const disp = (v) => {
    const t = String(v ?? "");
    if (LANG === "ru" && RU_DISPLAY[t]) return RU_DISPLAY[t];
    return t.replace(/^(a|an|the) /i, "");
};
const tr = (t) => (LANG === "ru" && t && RU[t]) ? RU[t] : t;
// the caption under a framing tile: translated full text, the part after
// the name; the two no-comma entries show the whole line
const framCap = (f) => {
    const ft = tr(framingText(f));
    const at = ft.indexOf(",");
    return at >= 0 ? ft.slice(at + 1).trim() : ft;
};
// RU-aware plural: plural(3, "frame") -> "кадра" / "frames"
const plural = (n, word) => {
    const F = {
        frame: [["frame", "frames"], ["кадр", "кадра", "кадров"]],
        shot: [["shot", "shots"], ["кадр", "кадра", "кадров"]],
        take: [["take", "takes"], ["тейк", "тейка", "тейков"]],
        look: [["look", "looks"], ["образ", "образа", "образов"]],
    }[word];
    const [en, ru] = F || [[word, word + "s"], [word, word, word + "s"]];
    if (LANG !== "ru") return n == 1 ? en[0] : en[1];
    const a = Math.abs(n) % 100, b = a % 10;
    return (a > 10 && a < 20) ? ru[2] : (b > 1 && b < 5) ? ru[1] : b === 1 ? ru[0] : ru[2];
};
// translate a space-separated label word by word ("look 1 top" -> "образ 1 верх")
const trw = (s) => String(s ?? "").split(" ").map(w => tr(w)).join(" ");
// model profiles: a named token budget the linter watches and the engine's
// guard reads (session.token_limit carries the same "Name · N" string).
// "custom" takes the number from the token_budget field, "off" disables
const MODEL_PROFILES = [
    { id: "z_image", label: "Z-Image / Turbo", budget: 400, style: "natural" },
    { id: "flux", label: "Flux.1", budget: 512, style: "natural" },
    { id: "krea2", label: "Krea 2", budget: 512, style: "natural" },
    { id: "qwen", label: "Qwen-Image", budget: 1024, style: "natural" },
    { id: "sdxl", label: "SDXL", budget: 75, style: "tags" },
    { id: "custom", label: "Custom", budget: 0, style: null },
    { id: "off", label: "Off", budget: 0, style: null },
];
const profileOf = (s) => MODEL_PROFILES.find(p => p.id === (s.session.model_profile || "z_image")) || MODEL_PROFILES[0];
const budgetOf = (s) => {
    const p = profileOf(s);
    if (p.id === "off") return 0;
    return p.id === "custom" ? Math.max(0, Math.round(+s.session.token_budget || 0)) : p.budget;
};
const tokenLimitOf = (s) => {
    const b = budgetOf(s);
    return b ? profileOf(s).label + " · " + b : "off";
};

// every section: key, label, the tile category the dock previews, and a
// center-render function producing HTML
const E = { "&": "&" + "amp;", "<": "&" + "lt;", ">": "&" + "gt;", '"': "&" + "quot;", "'": "&" + "#39;" };
const esc = (s) => String(s ?? "").replace(/[&<>"']/g, c => E[c]);
const uid = () => Math.random().toString(36).slice(2, 10);

// the global search index: every pickable word of every library, one row.
// persona / look / scene / style ride by value label, the walks by index --
// the click-through finds the chip by its visible label either way.
const searchIndex = () => {
    const out = [];
    const add = (sec, sub, lib, cat) => lib.forEach((label, idx) => out.push({ sec, sub, label, idx, cat }));
    PERSONA_FIELDS.forEach(f => add("persona", f.key, f.options, f.imgcat));
    add("look", "top", TOPS_LIB, "tops");
    add("look", "bottom", BOTTOMS_LIB, "bottoms");
    add("look", "footwear", FOOTWEAR_LIB, "footwear");
    add("look", "headwear", HEADWEAR_LIB, "headwear");
    add("look", "accessories", ACCESSORIES_LIB, null);
    add("scene", "location", LOCATIONS, "location");
    add("scene", "weather", WEATHER, "weather");
    add("scene", "light", LIGHT_SETUPS, "lighting");
    add("style", "grade", STYLES, "style");
    add("style", "film", FILMS, "film");
    add("camera", "framings", FRAMING_LIB, "framing");
    add("camera", "focus", FOCUS_LIB, "focus");
    add("camera", "lens", LENS_LIB, "lens");
    add("pose", "walk", POSE_LIB, "pose");
    add("expression", "walk", EXPRESSION_LIB, "expression");
    return out;
};

const DEFAULT_STATE = () => ({
    _v: 2, off: [], negative: { enabled: false, text: "", presets: [] },
    persona: { trigger: "", fields: {} },
    look: { looks: [{ name: "Look 1", top: "", top_color: "", top_material: "",
                      bottom: "", bottom_color: "", bottom_material: "",
                      footwear: "", footwear_color: "", footwear_material: "",
                      headwear: "", headwear_color: "", headwear_material: "",
                      lingerie: "", lingerie_color: "", lingerie_material: "",
                      accessories: [], acc_color: "", details: "" }] },
    scene: { location: "", weather: "", details: "" },
    light: { setup: "", hour: -1 },
    style: { grade: "", film: "", palette: "" },
    pose: { poses: { mode: "all", set: [], pin: null } },
    expression: { arc: "", expressions: { mode: "all", set: [], pin: null } },
    camera: { framings: { mode: "all", set: [], pin: null },
              focus: { mode: "all", set: [], pin: null },
              formats: { mode: "pin", set: [], pin: 0 },
              framing_order: "", lens: "" },
    shot: { main_prompt: "", custom: "", style_mode: "natural" },
    session: { count: 6, takes: 1, mood_subject: true, takes_arc: false, fixed_seed: false,
               pose_arc: false, place_arc: false, crop_arc: false, focus_arc: false,
               look_rotation: "blocks", reshoot_shot: 0,
               model_profile: "z_image", token_budget: 400, template: "",
               token_limit: "Z-Image / Turbo · 400" },
});

function readState(node) {
    try {
        const raw = node.widgets?.find(w => w.name === "node_data")?.value;
        const s = raw ? JSON.parse(raw) : null;
        if (s && s._v === 2) return s;
    } catch (e) { /* fall through */ }
    return DEFAULT_STATE();
}
const writeState = (node, s) => {
    const w = node.widgets?.find(w => w.name === "node_data");
    if (w) w.value = JSON.stringify(s);
};

// ---- center editors ----------------------------------------------------

const grid = (options, sel, imgcat, multi, scopeKey) =>
    chipGrid({ options, imgs: imgcat, cell: "1 / 1", sel,
               scope: "plx." + scopeKey, multi, base: options.length });

const personaEditor = (s, active) => {
    const f = s.persona.fields || {};
    const field = PERSONA_FIELDS.find(x => x.key === active.personaField) || PERSONA_FIELDS[0];
    const vals = f[field.key];
    const have = Array.isArray(vals) ? vals : (vals ? [vals] : []);
    const chips = field.options.map((o, i) => `
        <div class="plx-chip ${have.includes(o) ? "act" : ""}" data-val="${esc(o)}" data-multi="${field.multi}">
            ${tile(o, field.imgcat, i)}
            <span>${esc(disp(o))}</span>
        </div>`).join("");
    return `
    <div class="plx-hint">${tr("the words switch off nothing -- a picked value replaces, ＋ picks toggle")}${field.multi ? ` ${tr("(multi)")}` : ""}</div>
    <div class="plx-chips">${chips || `<div class="plx-hint">${tr("no library")}</div>`}</div>
    <div class="plx-row">
        <input class="plx-inp" data-own="${field.key}" placeholder="${tr("own ~f~ line…").replace("~f~", esc(tr(field.label.toLowerCase())))}"
               value="${esc(Array.isArray(vals) ? "" : (vals && !field.options.includes(vals) ? vals : ""))}">
        <button class="plx-btn plx-clear" data-clear="${field.key}" title="${tr("X -- clear this field")}">${tr("✕ clear")}</button>
    </div>`;
};


// swatch libraries: colors render as real CSS swatches, materials as tinted chips
// the footwear and headwear slots offer their own materials (canvas, patent
// leather, rubber, straw, felt, tweed) -- every material anywhere resolves
// to one photo tile through this index
const MAT_INDEX = {};
[...MATERIALS, ...MAT_EXTRA].forEach((m, i) => { MAT_INDEX[m] = i; });
// the tile of a picked garment -- the library index gives the photo, custom
// entries fall back to the branded letter tile
const slotTile = (value, imgcat, lib) => {
    const i = lib.indexOf(value);
    if (i >= 0 && imgcat) return `<img draggable="false" src="${itemImg(imgcat, i)}">`;
    const letters = (value || "?").replace(/^(a|an|the) /i, "").slice(0, 2).toUpperCase();
    return `<span class="plp-tile">${esc(letters)}</span>`;
};

const lookEditor = (s) => `
    <div class="plx-hint">${tr("one look per block -- a look replaces the whole outfit between shots; the preview strip shows the picked pieces")}</div>
    ${(s.look.looks || []).map((l, li) => `
    <div class="plx-look" data-li-card="${li}">
        <div class="plx-look-head">
            <div class="plx-look-strip" title="${tr("the picked pieces")}">
                ${slotTile(l.top, "tops", TOPS_LIB)}
                ${slotTile(l.bottom, "bottoms", BOTTOMS_LIB)}
                ${slotTile(l.footwear, "footwear", FOOTWEAR_LIB)}
            </div>
            <input class="plx-inp plx-name" data-li="${li}" data-k="name" value="${esc(l.name)}" placeholder="${tr("look name")}">
            <button class="plx-btn warn" data-dellook="${li}">✕</button>
        </div>
        <div class="plx-grid2">
            ${[["top", "top", TOPS_LIB], ["bottom", "bottom", BOTTOMS_LIB],
               ["footwear", "footwear", FOOTWEAR_LIB], ["accessories", "accessories, comma-separated", null],
               ["details", "free line", null]]
              .map(([k, ph, list]) => `
              <div><label>${tr(k)}</label><input class="plx-inp" data-li="${li}" data-k="${k}"
                    list="${list ? "plx-" + k : ""}" value="${esc((k === "accessories" && Array.isArray(l.accessories)) ? l.accessories.join(", ") : (l[k] || ""))}" placeholder="${tr(ph)}">${["top", "bottom", "footwear"].includes(k) ? `<button class="plx-btn" data-shoottile="wardrobe__${k}" title="${tr("shoot a preview tile for this piece with your graph")}">🎬</button>` : ""}</div>`).join("")}
        </div>
        <div class="plx-sub">${tr("pick pieces")} <span class="plx-dim">${tr("click a tile to fill the slot, click again to clear")}</span></div>
        ${[["top", TOPS_LIB, "tops"], ["bottom", BOTTOMS_LIB, "bottoms"],
           ["footwear", FOOTWEAR_LIB, "footwear"]].map(([k, lib, cat]) => `
            <div class="plx-chips tight">${lib.map((o, i) => `
                <div class="plx-chip ${l[k] === o ? "act" : ""}" data-pick="${k}" data-val="${esc(o)}">
                    ${tile(o, cat, i)}<span>${esc(disp(o))}</span></div>`).join("")}</div>`).join("")}
        <div class="plx-chips tight">${ACCESSORIES_LIB.map((o, i) => `
            <div class="plx-chip ${(Array.isArray(l.accessories) && l.accessories.includes(o)) ? "act" : ""}" data-pick-acc="${esc(o)}">
                ${tile(o, "accessories", i)}<span>${esc(disp(o))}</span></div>`).join("")}</div>
        <div class="plx-sub">${tr("top color / material")}</div>
        <div class="plx-swatches">${LOOK_COLORS.map(([n, hex]) => `
            <button class="plx-swatch ${l.top_color === n ? "act" : ""}" data-li="${li}" data-ck="top_color" data-color="${esc(n)}"
                style="--sw:${hex}" title="${esc(disp(n))}"></button>`).join("")}</div>
        <div class="plx-chips tight">${MATERIALS.map(m => `
            <div class="plx-chip plain ${l.top_material === m ? "act" : ""}" data-li="${li}" data-ck="top_material" data-mat="${esc(m)}">
                ${tile(m, "materials", (MAT_INDEX[m] ?? -1))}<span>${esc(disp(m))}</span></div>`).join("")}</div>
        <div class="plx-sub">${tr("bottom color / material")}</div>
        <div class="plx-swatches">${LOOK_COLORS.map(([n, hex]) => `
            <button class="plx-swatch ${l.bottom_color === n ? "act" : ""}" data-li="${li}" data-ck="bottom_color" data-color="${esc(n)}"
                style="--sw:${hex}" title="${esc(disp(n))}"></button>`).join("")}</div>
        <div class="plx-chips tight">${MATERIALS.map(m => `
            <div class="plx-chip plain ${l.bottom_material === m ? "act" : ""}" data-li="${li}" data-ck="bottom_material" data-mat="${esc(m)}">
                ${tile(m, "materials", (MAT_INDEX[m] ?? -1))}<span>${esc(disp(m))}</span></div>`).join("")}</div>
    </div>`).join("")}
    <datalist id="plx-top">${TOPS_LIB.map(o => `<option value="${esc(o)}">`).join("")}</datalist>
    <datalist id="plx-bottom">${BOTTOMS_LIB.map(o => `<option value="${esc(o)}">`).join("")}</datalist>
    <datalist id="plx-footwear">${FOOTWEAR_LIB.map(o => `<option value="${esc(o)}">`).join("")}</datalist>
    <button class="plx-btn" data-addlook>${tr("＋ add look")}</button>`;

const sceneEditor = (s) => `
    <div class="plx-sub">${tr("location")}</div>
    <div class="plx-chips">${LOCATIONS.map((o, i) => `
        <div class="plx-chip ${s.scene.location === o ? "act" : ""}" data-val="${esc(o)}" data-t="location">
            ${tile(o, "location", i)}<span>${esc(disp(o))}</span></div>`).join("")}</div>
    <div class="plx-row"><input class="plx-inp" data-ownscene="location" value="${esc(s.scene.location && !LOCATIONS.includes(s.scene.location) ? s.scene.location : "")}" placeholder="${tr("own location…")}"></div>
    <div class="plx-sub">${tr("weather")}</div>
    <div class="plx-chips">${WEATHER.map((o, i) => `
        <div class="plx-chip ${s.scene.weather === o ? "act" : ""}" data-val="${esc(o)}" data-t="weather">
            ${tile(o, "weather", i)}<span>${esc(disp(o))}</span></div>`).join("")}</div>
    <div class="plx-row"><input class="plx-inp" data-ownscene="details" value="${esc(s.scene.details)}" placeholder="${tr("free scene line…")}"></div>
    <div class="plx-sub">${tr("light setup")}</div>
    <div class="plx-chips">${LIGHT_SETUPS.map((o, i) => `
        <div class="plx-chip ${s.light.setup === o ? "act" : ""}" data-val="${esc(o)}" data-t="setup">
            ${tile(o, "lighting", i)}<span>${esc(disp(o))}</span></div>`).join("")}</div>
    <div class="plx-row">
        <input class="plx-inp" type="number" min="-1" max="24" data-hour value="${s.light.hour ?? -1}" title="${tr("hour of the day: -1 = off")}">
        <input class="plx-inp" data-ownlight="setup" value="${esc(s.light.setup && !LIGHT_SETUPS.includes(s.light.setup) ? s.light.setup : "")}" placeholder="${tr("own setup line…")}">
    </div>`;

const PALETTE_MODS = ["neon", "pastel", "matte", "metallic", "earthy"];
// the palette line reads "mod color, color" -- these keep the chips in sync
const paletteColors = (s) => (s.style.palette || "")
    .replace(/^(neon|pastel|matte|metallic|earthy)\s+/, "").replace(/^color palette:\s*/i, "")
    .split(",").map(x => x.trim()).filter(Boolean).slice(0, 5);
const paletteMod = (s) => {
    const m = (s.style.palette || "").match(/^(neon|pastel|matte|metallic|earthy)\b/);
    return m ? m[1] : "";
};
const paletteBlock = (s) => `
    <div class="plx-sub">${tr("palette")} <span class="plx-dim">${tr("up to 5 colors + a modifier")}</span></div>
    <div class="plx-swatches">${LOOK_COLORS.map(([n, hex]) => `
        <button class="plx-swatch ${paletteColors(s).includes(n) ? "act" : ""}" data-pal="${esc(n)}"
            style="--sw:${hex}" title="${esc(disp(n))}"></button>`).join("")}</div>
    <div class="plx-chips tight">${PALETTE_MODS.map(m => `
        <div class="plx-chip plain ${paletteMod(s) === m ? "act" : ""}" data-palmod="${esc(m)}">${esc(disp(m))}</div>`).join("")}
        <div class="plx-chip plain ${!paletteMod(s) ? "act" : ""}" data-palmod="">${tr("none")}</div></div>
    <div class="plx-row"><input class="plx-inp" data-ownstyle="palette" value="${esc(s.style.palette)}" placeholder="${tr("own palette line…")}"></div>`;

const styleEditor = (s) => `
    <div class="plx-sub">${tr("grade")}</div>
    <div class="plx-chips">${STYLES.map((o, i) => `
        <div class="plx-chip ${s.style.grade === o ? "act" : ""}" data-val="${esc(o)}" data-t="grade">
            ${tile(o, "style", i)}<span>${esc(disp(o))}</span></div>`).join("")}</div>
    <div class="plx-sub">${tr("film")}</div>
    <div class="plx-chips">${FILMS.map((o, i) => `
        <div class="plx-chip ${s.style.film === o ? "act" : ""}" data-val="${esc(o)}" data-t="film">
            ${tile(o, "film", i)}<span>${esc(disp(o))}</span></div>`).join("")}
    ${paletteBlock(s)}`;

// an aspect-ratio box drawn in CSS -- the format's real preview
const ratioBox = (fmt) => {
    const map = { "follows framing": "16/9", "1:1": "1/1", "4:5": "4/5", "3:4": "3/4",
                  "2:3": "2/3", "9:16": "9/16", "3:2": "3/2", "16:9": "16/9" };
    const ratio = map[fmt] || "1/1";
    const isFollow = fmt === "follows framing";
    return `<span class="plx-ratio ${isFollow ? "follow" : ""}" style="aspect-ratio:${ratio}"></span>`;
};
const cameraEditor = (s) => `
    <div class="plx-sub">${tr("framing")} <span class="plx-dim">${tr("the seven crops, readable wording under each")}</span></div>
    <div class="plx-chips">${FRAMING_LIB.map((f, i) => `
        <div class="plx-chip ${s.camera.framings.mode === "pin" && s.camera.framings.pin === i ? "act" : ""}
             ${s.camera.framings.mode === "multi" && (s.camera.framings.set || []).includes(i) ? "act" : ""}"
             data-fr="${i}">
            ${tile(f, "framing", i)}<span><b>${esc(disp(f))}</b><br><i class="plx-dim">${esc(framCap(f))}</i></span></div>`).join("")}</div>
    <div class="plx-sub">${tr("focus")}</div>
    ${grid(FOCUS_LIB, s.camera.focus, "focus", true, "cam.focus")}
    <div class="plx-sub">${tr("format")}</div>
    <div class="plx-chips">${FORMAT_LIB.map((f, i) => `
        <div class="plx-chip ${s.camera.formats.mode === "pin" && s.camera.formats.pin === i ? "act" : ""}" data-fmt="${i}">
            ${ratioBox(f)}<span>${esc(disp(f))}</span></div>`).join("")}</div>
    <div class="plx-row"><label class="plx-check"><input type="checkbox" data-order ${s.camera.framing_order ? "checked" : ""}> ${tr("open wide, end on the closest crop")}</label></div>`;

const poseEditor = (s) => grid(POSE_LIB, s.pose.poses, "pose", true, "poses");

const expressionEditor = (s) => grid(EXPRESSION_LIB, s.expression.expressions, "expression", true, "expressions");

const sessionEditor = (s) => `
    <div class="plx-grid2">
        <div><label>${tr("shots")}</label><input class="plx-inp" type="number" min="1" max="100" data-count value="${s.session.count}"></div>
        <div><label>${tr("takes per shot")}</label><input class="plx-inp" type="number" min="1" max="4" data-takes value="${s.session.takes}"></div>
    </div>
    <div class="plx-grid2">
        <div><label>${tr("look rotation")}</label><select class="plx-inp" data-rotation>
            <option value="blocks" ${s.session.look_rotation === "blocks" ? "selected" : ""}>${tr("blocks")}</option>
            <option value="mixed" ${s.session.look_rotation === "mixed" ? "selected" : ""}>${tr("mixed")}</option></select></div>
        <div><label>${tr("model profile")}</label><select class="plx-inp" data-modelprofile>
            ${MODEL_PROFILES.map(p => `<option value="${p.id}" ${s.session.model_profile === p.id ? "selected" : ""}>${tr(p.label)}</option>`).join("")}</select>
            ${profileOf(s).id === "custom" ? `<input class="plx-inp tiny" type="number" min="0" max="4096" data-tokenbudget value="${s.session.token_budget ?? 400}" title="${tr("the token budget this profile watches")}">` : ""}</div>
    </div>
    <div class="plx-sub">${tr("expression placement")}</div>
    ${[["mood_subject", "mood on the subject line", "the expression rides the persona's lead clause instead of standing after the crop -- moods read stronger"],
       ["fixed_seed", "one seed for every shot", "the whole session rides the same noise -- a clean A/B where only the framings, poses and looks vary"]]
      .map(([k, t, d]) => `<label class="plx-check"><input type="checkbox" data-coup="${k}" ${s.session[k] ? "checked" : ""}> <b>${tr(t)}</b><br><i class="plx-dim">${tr(d)}</i></label>`).join("")}
    <div class="plx-sub">${tr("dramaturgy arc")} <span class="plx-dim">${tr("the session's emotional curve")}</span></div>
    <div class="plx-chips tight">
        <div class="plx-chip plain ${!s.expression.arc ? "act" : ""}" data-arc="">${tr("flat walk")}</div>
        ${arcList().map(a => `<div class="plx-chip plain ${s.expression.arc === a ? "act" : ""}" data-arc="${esc(a)}"
             title="${esc(tr(arcNote(a)))}">${esc(disp(a))}${isUserArc(a) ? " ✎" : ""}</div>`).join("")}
    </div>
    ${s.expression.arc ? `<div class="plx-hint">${esc(tr(arcNote(s.expression.arc)))}</div>` : ""}
    ${s.expression.arc ? `<div class="plx-sub">${tr("the arc's couplings")} <span class="plx-dim">${tr("what follows the curve")}</span></div>
    ${[["takes_arc", "takes follow the arc", "quiet points render once, climaxes get the full stack to pick from"],
       ["pose_arc", "pose follows the arc", "a contradicting pose swaps for a compatible one from the same feed"],
       ["place_arc", "placement follows the arc", "a climax closes the stance in, a quiet point steps back"],
       ["crop_arc", "crop follows the arc", "a climax tightens the crop, a quiet point lets it breathe wider"],
       ["focus_arc", "focus follows the arc", "a climax draws the eye onto the person, a quiet point lets it drift off"]]
      .map(([k, t, d]) => `<label class="plx-check"><input type="checkbox" data-coup="${k}" ${s.session[k] ? "checked" : ""}> <b>${tr(t)}</b><br><i class="plx-dim">${tr(d)}</i></label>`).join("")}` : ""}
    <div class="plx-sub">${tr("prompt template")} <span class="plx-dim">${tr("the engine fills the slots from your picks")}</span></div>
    <textarea class="plx-inp plx-wide" data-template rows="3" placeholder="${esc(DEFAULT_TEMPLATE)}">${esc(s.session.template || "")}</textarea>
    <div class="plx-row"><span class="plx-dim">{style} {expression} {framing} {focus} {scene} {lighting} {person} {pose} {outfit} {placement} {quality}</span>
        <button class="plx-btn" data-templatereset>${tr("reset to default")}</button></div>
    <div class="plx-sub">${tr("what a run does")}</div>
    <div class="plx-session">
        ${tr("START SHOOT queues <b>~n~</b> ~shot~ × <b>~t~</b> ~take~")
            .replace("~n~", s.session.count).replace("~shot~", plural(s.session.count, "shot"))
            .replace("~t~", s.session.takes).replace("~take~", plural(s.session.takes, "take"))}${(s.look.looks || []).length > 1 ? ` ${tr("across ~n~ ~look~ in ~rot~ rotation").replace("~n~", (s.look.looks || []).length).replace("~look~", plural((s.look.looks || []).length, "look")).replace("~rot~", esc(tr(s.session.look_rotation)))}` : ""}${s.expression.arc ? ` ${tr("on the ~arc~ arc").replace("~arc~", esc(disp(s.expression.arc)))}` : ""}.

    </div>`;

const NEGATIVE = (s) => `
    <div class="plx-row"><label class="plx-check"><input type="checkbox" data-negon ${s.negative.enabled ? "checked" : ""}> ${tr("negative")}</label></div>
    <div class="plx-sub">${tr("common guards")} <span class="plx-dim">${tr("toggle into the negative line")}</span></div>
    <div class="plx-chips tight">${NEG_PRESETS.map(p => `
        <div class="plx-chip plain ${((s.negative.presets || []).includes(p)) ? "act" : ""}" data-negp="${esc(p)}">${esc(disp(p))}</div>`).join("")}</div>
    <div class="plx-row"><input class="plx-inp" data-neg value="${esc(s.negative.text)}" placeholder="${tr("own negative line…")}"></div>`;

const SECTIONS = [
    { key: "persona", label: "PERSONA", imgcat: "body",
      render: (s, ui) => personaEditor(s, ui) },
    { key: "look", label: "LOOK", imgcat: "outfit", render: lookEditor },
    { key: "scene", label: "SCENE", imgcat: "location", render: sceneEditor },
    { key: "style", label: "STYLE", imgcat: "style", render: styleEditor },
    { key: "camera", label: "CAMERA", imgcat: "framing", render: cameraEditor },
    { key: "pose", label: "POSE", imgcat: "pose", render: poseEditor },
    { key: "expression", label: "EXPRESSION", imgcat: "expression", render: expressionEditor },
    { key: "session", label: "SESSION", imgcat: null, render: sessionEditor },
];

// ---- wildcard files ----------------------------------------------------
// web/wildcards/*.txt serves statically; __name__ tokens fetch their file
// once and the right column re-renders when the lines arrive. The engine
// reads the same folder from disk and re-reads on file change.
const WC_CACHE = new Map();   // name -> string[] (loaded) | null (missing)
let wcRerender = () => {};    // set by the panel once renderRight exists
const wcGet = (name) => {
    if (WC_CACHE.has(name)) return WC_CACHE.get(name);
    WC_CACHE.set(name, null);   // missing until proven otherwise
    // the user's own copy (the wildcard manager writes it) wins; the
    // bundled starters ride with the package
    const pkg = () => fetch(new URL(`wildcards/${encodeURIComponent(name)}.txt`, import.meta.url).href)
        .then(r => (r.ok ? r.text() : null)).catch(() => null);
    plRead(`perfectlab_wildcards/${name}.txt`)
        .then(t => t || pkg())
        .then(t => {
            if (t) {
                WC_CACHE.set(name, t.split("\n").map(x => x.trim())
                    .filter(x => x && !x.startsWith("#")));
                wcRerender();
            }
        }).catch(() => {});
    return null;
};

// ---- LIVE TEXT estimate -------------------------------------------------

const liveText = (s, seed = 0) => {
    const f = s.persona.fields || {};
    // the engine's rule: a set trigger leads and drops the face
    // blocks; no trigger, no prefix
    const FACE_KEYS = ["hair", "hair_color", "eyes", "makeup", "skin"];
    const perVals = s.persona.trigger
        ? Object.entries(f).filter(([k]) => !FACE_KEYS.includes(k)).map(([, v]) => v)
        : Object.values(f);
    const per = perVals.flat().filter(Boolean).join(", ");
    const look0 = (s.look.looks || [])[0] || {};
    const piece = (name, color, material) =>
        [material, name].filter(Boolean).join(" ") + (color ? ` in ${color}` : "");
    const wearing = [look0.top && piece(look0.top, look0.top_color, look0.top_material),
                     look0.bottom && piece(look0.bottom, look0.bottom_color, look0.bottom_material)]
                    .filter(Boolean).join(" with ");
    const shoePiece = (l) => [l.footwear_material, l.footwear].filter(Boolean).join(" ")
        + (l.footwear_color ? ` in ${l.footwear_color}` : "");
    const extras = [look0.footwear && shoePiece(look0),
                     look0.headwear && (look0.headwear_color ? look0.headwear_color + " " : "") + look0.headwear,
                     Array.isArray(look0.accessories) && look0.accessories.length
                       ? look0.accessories.join(", ") + (look0.acc_color ? ` in ${look0.acc_color}` : "")
                       : "",
                     look0.details].filter(Boolean).join(", ");
    const poses = (s.pose.poses.mode === "pin" ? [POSE_LIB[s.pose.poses.pin]] :
                    s.pose.poses.set || []).map(i => POSE_LIB[i]).filter(Boolean);
    const framings = (s.camera.framings.mode === "pin"
                       ? [FRAMING_LIB[s.camera.framings.pin]]
                       : (s.camera.framings.set || []).map(i => FRAMING_LIB[i])).filter(Boolean);
    const focus = (s.camera.focus.mode === "pin" ? [FOCUS_LIB[s.camera.focus.pin]]
                   : (s.camera.focus.set || []).map(i => FOCUS_LIB[i])).filter(Boolean);
    const fmtSel = s.camera.formats;
    const fmt = (fmtSel.set || (fmtSel.mode === "pin" ? [fmtSel.pin] : []))
        .map(i => FORMAT_LIB[i]).filter(f => f && f !== "follows framing");
    const light = s.light.setup || (s.light.hour >= 0 ? `hour ${s.light.hour}: the clock lighting` : "");
    const expressions = (s.expression.expressions.mode === "pin"
        ? [s.expression.expressions.pin] : (s.expression.expressions.set || []))
        .map(i => EXPRESSION_LIB[i]).filter(Boolean);
    // SDXL tag mode: a flat comma list, no prose labels -- the same shape
    // the engine's tag branch produces
    if ((s.shot.style_mode || "natural") === "tags") {
        // tags carry no leading articles: one off the start of every comma
        // segment (and after a "with" bridge) -- the user's own lines stay
        const stripArticles = (t) => String(t).replace(
            /(^|,\s*|\)\s+|\blayered with\s+|\bwith\s+)(a|an|the)\s+/gi, "$1");
        const tags = [
            s.shot.main_prompt,
            per && stripArticles(s.persona.trigger ? `${per} (${s.persona.trigger})` : per),
            (wearing || extras) && stripArticles(wearing
                ? `${wearing}${extras ? ", " + extras : ""}`.replace("wearing ", "")
                : extras),
            s.scene.location, s.scene.weather, s.scene.details,
        (s.scene.props || []).length && "with " + (s.scene.props.length > 1
            ? s.scene.props.slice(0, -1).join(", ") + " and " + s.scene.props[s.scene.props.length - 1]
            : s.scene.props[0]),
            light, [s.style.grade, s.style.style_film || s.style.film, s.style.palette].filter(Boolean).join(", "),
            framings.join(", "),
            focus.join(", "),
            poses.join(", "),
            expressions.join(", "),
            s.camera.lens,
            s.shot.custom,
        ].filter(Boolean).map(t => (t === s.shot.main_prompt || t === s.shot.custom) ? t : stripArticles(t));
        const rawTags = tags.join(", ");
        const textTags = resolveChoices(resolveWildcards(rawTags, seed, wcGet), seed);
        return { text: textTags, raw: rawTags, parts: tags.filter(Boolean),
                 tokens: Math.max(1, Math.round(textTags.length / 3.6)) };
    }
    const parts = [
        s.shot.main_prompt,
        per && (s.persona.trigger ? `${per} (${s.persona.trigger})` : per),
        (wearing || extras) && (wearing
            ? `wearing ${wearing}${extras ? ", " + extras : ""}`
            : extras),
        s.scene.location, s.scene.weather, s.scene.details,
        (s.scene.props || []).length && "with " + (s.scene.props.length > 1
            ? s.scene.props.slice(0, -1).join(", ") + " and " + s.scene.props[s.scene.props.length - 1]
            : s.scene.props[0]),
        light, [s.style.grade, s.style.style_film || s.style.film, s.style.palette].filter(Boolean).join(", "),
        framings.length && `framings: ${framings.join(", ")}`,
        focus.length && `focus: ${focus.join(", ")}`,
        fmt.length && `format: ${fmt.join(", ")}${s.camera.framing_order ? " (wide to close)" : ""}`,
        s.camera.lens && `lens: ${s.camera.lens}`,
        s.camera.composition && `composition: ${s.camera.composition}`,
        poses.length && `poses: ${poses.join(", ")}`,
        expressions.length && `expressions: ${expressions.join(", ")}`,
        s.shot.custom,
    ].filter(Boolean);
    const raw = parts.join("\n\n");
    // the engine's own shape: the template's slots filled from this draft.
    // The JS builders mirror the composers closely enough for a preview;
    // the engine's text stays the source of truth for what renders
    const firstOf = (arr) => (arr && arr.length ? arr[0] : "");
    const tier = TIERS[framings[0]] || "medium";
    let personSlot = per && (s.persona.trigger ? `${per} (${s.persona.trigger})` : per) || "";
    const exprPicked = firstOf(expressions) || "";
    let exprSlot = exprPicked;
    if (s.session.mood_subject && exprSlot && personSlot && framings[0] !== MACRO_SHOES) {
        personSlot = subjectWeave(personSlot, exprSlot);
        exprSlot = "";
    }
    const focusV = focusForShot(firstOf(focus), tier, firstOf(poses)) || TIER_FALLBACK_FOCUS[tier] || "";
    const sceneSlot = [s.scene.location, s.scene.weather, s.scene.details,
        (s.scene.props || []).length && "with " + (s.scene.props.length > 1
            ? s.scene.props.slice(0, -1).join(", ") + " and " + s.scene.props[s.scene.props.length - 1]
            : s.scene.props[0])].filter(Boolean).join(", ");
    const slotVals = { person: personSlot, scene: sceneSlot,
        style: [s.style.grade, s.style.style_film || s.style.film, s.style.palette].filter(Boolean).join(", "),
        framing: framings[0] ? framingText(framings[0]) : "",
        focus: focusV, pose: firstOf(poses) || "",
        placement: walk(PLACEMENT_LIB, null, 1, seed)[0] || "",
        expression: exprSlot, lighting: light,
        outfit: [wearing, extras].filter(Boolean).join(", "),
        quality: "editorial photography, natural light" };
    const tmpl = (s.session.template || "").trim() || DEFAULT_TEMPLATE;
    let filled = tmpl;
    for (const k of TEMPLATE_KEYS) filled = filled.split("{" + k + "}").join(slotVals[k] || "");
    if (!focusV) filled = filled.replace(/focused on\s*(\.|,|$)\s*/g, " ");
    const text = resolveChoices(resolveWildcards(filled, seed, wcGet), seed);
    return { text, raw, parts: parts.filter(Boolean),
             tokens: Math.max(1, Math.round(text.length / 3.6)) };
};


// ---- the picks of a section, as one line of tiles ----
// every section shows what its subsections have picked, the same way the
// look strip does -- one glance answers "what is already chosen here"
const pickThumb = (value, imgcat, lib) => {
    const i = lib ? lib.indexOf(value) : -1;
    if (i >= 0 && imgcat) return `<img draggable="false" src="${itemImg(imgcat, i)}" title="${esc(value)}">`;
    const letters = (value || "?").replace(/^(a|an|the) /i, "").slice(0, 2).toUpperCase();
    return `<span class="plx-pick-letter" title="${esc(value)}">${esc(letters)}</span>`;
};
const swatchThumb = (name, hex) => hex
    ? `<span class="plx-pick-swatch" style="background:${hex}" title="${esc(name)}"></span>`
    : "";
const matThumb = (name) => {
    if (!name) return "";
    const idx = MAT_INDEX[name] ?? -1;
    if (idx >= 0)
        return `<img src="${itemImg("materials", idx)}" title="${esc(name)}" style="width:56px;height:56px;border-radius:50%;border:3px solid #33290f;object-fit:cover;display:inline-block">`;
    return `<span class="plx-pick-mat" title="${esc(name)}">${esc(name)}</span>`;
};

const sectionPicks = (secKey, s) => {
    const out = [];
    const push = (html) => { if (html) out.push(html); };
    if (secKey === "persona") {
        PERSONA_FIELDS.forEach(fd => {
            const v = (s.persona.fields || {})[fd.key];
            (Array.isArray(v) ? v : v ? [v] : []).forEach(val =>
                push(pickThumb(val, fd.imgcat, fd.options)));
        });
    } else if (secKey === "look") {
        (s.look.looks || []).forEach(l => {
            push(pickThumb(l.top, "tops", TOPS_LIB));
            push(pickThumb(l.bottom, "bottoms", BOTTOMS_LIB));
            push(pickThumb(l.footwear, "footwear", FOOTWEAR_LIB));
            push(pickThumb(l.headwear, "headwear", HEADWEAR_LIB));
            push(pickThumb(l.lingerie, "lingerie", LINGERIE_LIB));
            (Array.isArray(l.accessories) ? l.accessories : []).forEach(a =>
                push(pickThumb(a, "accessories", ACCESSORIES_LIB)));
            push(swatchThumb(l.top_color, (LOOK_COLORS.find(c => c[0] === l.top_color) || [])[1]));
            push(matThumb(l.top_material));
            push(swatchThumb(l.bottom_color, (LOOK_COLORS.find(c => c[0] === l.bottom_color) || [])[1]));
            push(matThumb(l.bottom_material));
            push(l.details ? `<span class="plx-pick-letter" title="${esc(l.details)}">···</span>` : "");
        });
    } else if (secKey === "scene") {
        push(pickThumb(s.scene.location, "location", LOCATIONS));
        push(pickThumb(s.scene.weather, "weather", WEATHER));
        (s.scene.props || []).forEach(pr => push(pickThumb(pr, "props", PROPS_LIB)));
        push(s.scene.details ? `<span class="plx-pick-letter" title="${esc(s.scene.details)}">···</span>` : "");
        push(pickThumb(s.light.setup, "lighting", LIGHT_SETUPS));
        push(s.light.hour >= 0 ? `<span class="plx-pick-letter" title="${tr("hour")} ${s.light.hour}">${s.light.hour}${LANG === "ru" ? "ч" : "h"}</span>` : "");
    } else if (secKey === "style") {
        push(pickThumb(s.style.grade, "style", STYLES));
        push(pickThumb(s.style.film, "film", FILMS));
        paletteColors(s).forEach(c =>
            push(swatchThumb(c, (LOOK_COLORS.find(x => x[0] === c) || [])[1])));
        if (paletteMod(s)) push(pickThumb(paletteMod(s), null, PALETTE_MODS));
    } else if (secKey === "camera") {
        const fSel = s.camera.framings, foSel = s.camera.focus;
        (fSel.mode === "pin" ? [fSel.pin] : (fSel.set || [])).forEach(i =>
            push(pickThumb(FRAMING_LIB[i], "framing", FRAMING_LIB)));
        (foSel.mode === "pin" ? [foSel.pin] : (foSel.set || [])).forEach(i =>
            push(pickThumb(FOCUS_LIB[i], "focus", FOCUS_LIB)));
        if (s.camera.lens) push(pickThumb(s.camera.lens, "lens", LENS_LIB));
        if (s.camera.composition) push(pickThumb(s.camera.composition, null, COMPOSITION_LIB));
        if (s.camera.formats.mode === "pin") push(
            `<span class="plx-pick-letter" title="${esc(FORMAT_LIB[s.camera.formats.pin] || "")}">${esc((FORMAT_LIB[s.camera.formats.pin] || "?").replace("follows framing", LANG === "ru" ? "авто" : "auto"))}</span>`);
    } else if (secKey === "pose") {
        const sel = s.pose.poses;
        (sel.mode === "pin" ? [sel.pin] : (sel.set || [])).forEach(i =>
            push(pickThumb(POSE_LIB[i], "pose", POSE_LIB)));
    } else if (secKey === "expression") {
        const sel = s.expression.expressions;
        (sel.mode === "pin" ? [sel.pin] : (sel.set || [])).forEach(i =>
            push(pickThumb(EXPRESSION_LIB[i], "expression", EXPRESSION_LIB)));
        if (s.expression.arc) push(`<span class="plx-pick-letter" title="${esc(tr(arcNote(s.expression.arc)) || "")}">${esc(disp(s.expression.arc))}</span>`);
    }
    return out;
};

// ---- sub-section cards -------------------------------------------------
// one card per rail subsection: the center never stacks tile streams, every
// card says its combining rule and carries its own clear
const card = (title, rule, bodyHtml, clearKey) => `
    <div class="plx-card">
        <div class="plx-card-head">
            <span class="plx-card-title">${tr(title)}</span>
            <span class="plx-dim">${tr(rule)}</span>
            <button class="plx-btn plx-roll" data-reroll="${clearKey}" title="${tr("random pick in this card")}">🎲</button>
            <button class="plx-btn plx-clear" data-clearsub="${clearKey}" title="${tr("X -- clear this card")}">✕ ${tr("clear card")}</button>
        </div>
        ${bodyHtml}
    </div>`;

const personaSub = (s, ui, fieldKey) => {
    const field = PERSONA_FIELDS.find(x => x.key === fieldKey) || PERSONA_FIELDS[0];
    const f = s.persona.fields || {};
    const vals = f[field.key];
    const have = Array.isArray(vals) ? vals : (vals ? [vals] : []);
    // character cards: the persona fields + the trigger word under one name,
    // stored in userdata -- switching characters is a one-click load
    const charRow = `
        <div class="plx-row">
            <select class="plx-inp" data-chars><option value="">${tr("character cards…")}</option>
                ${(ui.chars || []).map(n => `<option value="${esc(n)}">${esc(n)}</option>`).join("")}</select>
            <button class="plx-btn" data-charsave title="${tr("save the persona as a character card")}">💾 ${tr("save")}</button>
            <button class="plx-btn warn" data-chardel title="${tr("delete this character card")}">✕</button>
        </div>`;
    const body = `
        ${charRow}
        <div class="plx-chips">${field.options.map((o, i) => `
            <div class="plx-chip ${have.includes(o) ? "act" : ""}" data-val="${esc(o)}" data-multi="${field.multi}">
                ${tile(o, field.imgcat, i)}<span>${esc(disp(o))}</span></div>`).join("")}</div>
        <div class="plx-row"><input class="plx-inp" data-own="${field.key}"
            placeholder="${tr("own ~f~ line…").replace("~f~", esc(tr(field.label.toLowerCase())))}"
            value="${esc(Array.isArray(vals) ? "" : (vals && !field.options.includes(vals) ? vals : ""))}"></div>`;
    return card(field.label,
        field.multi ? "combines: every picked value joins the persona" :
            "one pick: the value replaces the field",
        body, "persona." + field.key);
};

const lookPiecesSub = (s) => card("PIECES",
    "replaces: one garment per slot -- a look replaces the whole outfit",
    (s.look.looks || []).map((l, li) => `
    <div class="plx-look" data-li-card="${li}">
        <div class="plx-look-head">
            <div class="plx-look-strip">
                ${slotTile(l.top, "tops", TOPS_LIB)}
                ${slotTile(l.bottom, "bottoms", BOTTOMS_LIB)}
                ${slotTile(l.footwear, "footwear", FOOTWEAR_LIB)}
            </div>
            <input class="plx-inp plx-name" data-li="${li}" data-k="name" value="${esc(l.name)}" placeholder="${tr("look name")}">
            <button class="plx-btn warn" data-dellook="${li}">✕</button>
        </div>
        ${[["top", TOPS_LIB, "tops"], ["bottom", BOTTOMS_LIB, "bottoms"],
           ["footwear", FOOTWEAR_LIB, "footwear"]].map(([k, lib, cat]) => `
            <div class="plx-chips tight">${lib.map((o, i) => `
                <div class="plx-chip ${l[k] === o ? "act" : ""}" data-pick="${k}" data-val="${esc(o)}">
                    ${tile(o, cat, i)}<span>${esc(disp(o))}</span></div>`).join("")}</div>`).join("")}
        <div class="plx-row">
            <input class="plx-inp" data-li="${li}" data-k="details" value="${esc(l.details || "")}" placeholder="${tr("free line (fit, state, texture note)…")}">
        </div>
    </div>`).join("") + `<button class="plx-btn" data-addlook>${tr("＋ add look")}</button>`,
    "look.pieces");

const lookColorsSub = (s) => card("COLORS & MATERIALS",
    "rides the picked garment -- 'silk satin slip dress in champagne gold'",
    (s.look.looks || []).map((l, li) => `
    <div class="plx-look" data-li-card="${li}">
        <div class="plx-look-head"><span class="plx-card-title">${esc(l.name || (LANG === "ru" ? "Образ " + (li + 1) : "Look " + (li + 1)))}</span></div>
        <div class="plx-sub">${tr("top color / material")}</div>
        <div class="plx-swatches">${LOOK_COLORS.map(([n, hex]) => `
            <button class="plx-swatch ${l.top_color === n ? "act" : ""}" data-li="${li}" data-ck="top_color" data-color="${esc(n)}" style="--sw:${hex}" title="${esc(disp(n))}"></button>`).join("")}</div>
        <div class="plx-chips tight">${MATERIALS.map(m => `
            <div class="plx-chip plain ${l.top_material === m ? "act" : ""}" data-li="${li}" data-ck="top_material" data-mat="${esc(m)}">
                ${tile(m, "materials", (MAT_INDEX[m] ?? -1))}<span>${esc(disp(m))}</span></div>`).join("")}</div>
        <div class="plx-sub">${tr("bottom color / material")}</div>
        <div class="plx-swatches">${LOOK_COLORS.map(([n, hex]) => `
            <button class="plx-swatch ${l.bottom_color === n ? "act" : ""}" data-li="${li}" data-ck="bottom_color" data-color="${esc(n)}" style="--sw:${hex}" title="${esc(disp(n))}"></button>`).join("")}</div>
        <div class="plx-chips tight">${MATERIALS.map(m => `
            <div class="plx-chip plain ${l.bottom_material === m ? "act" : ""}" data-li="${li}" data-ck="bottom_material" data-mat="${esc(m)}">
                ${tile(m, "materials", (MAT_INDEX[m] ?? -1))}<span>${esc(disp(m))}</span></div>`).join("")}</div>
    </div>`).join(""),
    "look.colors");

const lookAccSub = (s) => card("ACCESSORIES",
    "combines: every picked accessory joins the look",
    (s.look.looks || []).map((l, li) => `
    <div class="plx-look" data-li-card="${li}">
        <div class="plx-look-head"><span class="plx-card-title">${esc(l.name || (LANG === "ru" ? "Образ " + (li + 1) : "Look " + (li + 1)))}</span></div>
        <div class="plx-chips tight">${ACCESSORIES_LIB.map((o, i) => `
            <div class="plx-chip ${(Array.isArray(l.accessories) && l.accessories.includes(o)) ? "act" : ""}" data-pick-acc="${esc(o)}">
                ${tile(o, "accessories", i)}<span>${esc(disp(o))}</span></div>`).join("")}</div>
        <div class="plx-row"><input class="plx-inp" data-li="${li}" data-k="accessories"
            value="${esc(Array.isArray(l.accessories) ? l.accessories.join(", ") : "")}" placeholder="${tr("own accessories, comma-separated…")}"></div>
    </div>`).join(""),
    "look.accessories");

const sceneLocSub = (s) => card("LOCATION", "one pick: click again to clear", `
    <div class="plx-chips">${LOCATIONS.map((o, i) => `
        <div class="plx-chip ${s.scene.location === o ? "act" : ""}" data-val="${esc(o)}" data-t="location">
            ${tile(o, "location", i)}<span>${esc(disp(o))}</span></div>`).join("")}</div>
    <div class="plx-row"><input class="plx-inp" data-ownscene="location"
        value="${esc(s.scene.location && !LOCATIONS.includes(s.scene.location) ? s.scene.location : "")}" placeholder="own location…"></div>
    <div class="plx-sub">${tr("props")} <span class="plx-dim">${tr("what the shot carries, beyond the outfit")}</span></div>
    <div class="plx-chips">${PROPS_LIB.map((o, i) => `
        <div class="plx-chip ${((s.scene.props || []).includes(o)) ? "act" : ""}" data-val="${esc(o)}" data-prop>
            ${tile(o, "props", i)}<span>${esc(disp(o))}</span></div>`).join("")}</div>`,
    "scene.location");

const sceneWeatherSub = (s) => card("WEATHER", "one pick: click again to clear", `
    <div class="plx-chips">${WEATHER.map((o, i) => `
        <div class="plx-chip ${s.scene.weather === o ? "act" : ""}" data-val="${esc(o)}" data-t="weather">
            ${tile(o, "weather", i)}<span>${esc(disp(o))}</span></div>`).join("")}</div>
    <div class="plx-row"><input class="plx-inp" data-ownscene="details" value="${esc(s.scene.details)}" placeholder="${tr("free scene line…")}"></div>`,
    "scene.weather");

const sceneLightSub = (s) => card("LIGHT", "one setup or the clock hour", `
    <div class="plx-chips">${LIGHT_SETUPS.map((o, i) => `
        <div class="plx-chip ${s.light.setup === o ? "act" : ""}" data-val="${esc(o)}" data-t="setup">
            ${tile(o, "lighting", i)}<span>${esc(disp(o))}</span></div>`).join("")}</div>
    <div class="plx-row">
        <input class="plx-inp" type="number" min="-1" max="24" data-hour value="${s.light.hour ?? -1}" title="${tr("hour of the day: -1 = off")}">
        <input class="plx-inp" data-ownlight="setup" value="${esc(s.light.setup && !LIGHT_SETUPS.includes(s.light.setup) ? s.light.setup : "")}" placeholder="own setup line…">
    </div>`,
    "scene.light");

const styleGradeSub = (s) => card("GRADE", "one pick: the whole-image aesthetic", `
    <div class="plx-chips">${STYLES.map((o, i) => `
        <div class="plx-chip ${s.style.grade === o ? "act" : ""}" data-val="${esc(o)}" data-t="grade">
            ${tile(o, "style", i)}<span>${esc(disp(o))}</span></div>`).join("")}</div>`,
    "style.grade");

const styleFilmSub = (s) => card("FILM LOOK", "one pick: the film stock feel", `
    <div class="plx-chips">${FILMS.map((o, i) => `
        <div class="plx-chip ${s.style.film === o ? "act" : ""}" data-val="${esc(o)}" data-t="film">
            ${tile(o, "film", i)}<span>${esc(disp(o))}</span></div>`).join("")}</div>
    ${paletteBlock(s)}`,
    "style.film");

const camFramingSub = (s) => card("FRAMING", "walk: the session walks the picked crops; pin for one", `
    <div class="plx-chips">${FRAMING_LIB.map((f, i) => `
        <div class="plx-chip ${s.camera.framings.mode === "pin" && s.camera.framings.pin === i ? "act" : ""}
             ${s.camera.framings.mode === "multi" && (s.camera.framings.set || []).includes(i) ? "act" : ""}" data-fr="${i}">
            ${tile(f, "framing", i)}<span><b>${esc(disp(f))}</b><br><i class="plx-dim">${esc(framCap(f))}</i></span></div>`).join("")}</div>
    <div class="plx-row"><label class="plx-check"><input type="checkbox" data-order ${s.camera.framing_order ? "checked" : ""}> ${tr("open wide, end on the closest crop")}</label></div>`,
    "camera.framings");

const camFocusSub = (s) => card("FOCUS", "walk: where the eye lands, per shot", `
    ${grid(FOCUS_LIB, s.camera.focus, "focus", true, "cam.focus")}`,
    "camera.focus");

const camFormatSub = (s) => {
    const fSel = s.camera.formats;
    const active = (i) => (fSel.mode === "pin" && fSel.pin === i)
        || (fSel.mode === "multi" && (fSel.set || []).includes(i));
    return card("FORMAT", "multi: each frame takes the next picked ratio; empty = follows the framing", `
        <div class="plx-chips">${FORMAT_LIB.map((f, i) => `
            <div class="plx-chip ${active(i) ? "act" : ""}" data-fmt="${i}">
                ${ratioBox(f)}<span>${esc(disp(f))}</span></div>`).join("")}</div>`,
        "camera.formats");
};

const camLensSub = (s) => card("LENS", "replaces: the lens line of every shot; click again to clear", `
    <div class="plx-chips">${LENS_LIB.map((o, i) => `
        <div class="plx-chip ${s.camera.lens === o ? "act" : ""}" data-lens="${esc(o)}">
            ${tile(o, "lens", i)}<span>${esc(o.replace(/^(a|an) /, ""))}</span></div>`).join("")}</div>`,
    "camera.lens");

const camCompSub = (s) => card("COMPOSITION", "how the frame is built; click again to clear", `
    <div class="plx-chips">${COMPOSITION_LIB.map((o) => `
        <div class="plx-chip plain ${s.camera.composition === o ? "act" : ""}" data-comp="${esc(o)}">
            <span>${esc(disp(o))}</span></div>`).join("")}</div>`,
    "camera.composition");

const poseSub = (s) => card("POSES", "walk: the session walks the picked set", `
    ${grid(POSE_LIB, s.pose.poses, "pose", true, "poses")}`,
    "pose.poses");

const exprWalkSub = (s) => card("EXPRESSIONS", "walk: the expressions the session repeats", `
    ${grid(EXPRESSION_LIB, s.expression.expressions, "expression", true, "expressions")}`,
    "expression.expressions");

const sessionSub = (s) => card("SESSION", "what a run renders", sessionEditor(s), "session");

// the rail map: section -> its subsections, in order; a section with one
// group keeps a single sub so the center stays one-card-at-a-time
const SUBS = {
    persona: PERSONA_FIELDS.map(fd => ({ key: fd.key, label: fd.label })),
    look: [{ key: "top", label: "Tops" }, { key: "bottom", label: "Bottoms" },
           { key: "footwear", label: "Footwear" }, { key: "headwear", label: "Headwear" },
           { key: "lingerie", label: "Lingerie" },
           { key: "accessories", label: "Accessories" }],
    scene: [{ key: "location", label: "Location" }, { key: "weather", label: "Weather" },
            { key: "light", label: "Light" }],
    style: [{ key: "grade", label: "Grade" }, { key: "film", label: "Film" }],
    camera: [{ key: "framings", label: "Framing" }, { key: "focus", label: "Focus" },
             { key: "lens", label: "Lens" }, { key: "composition", label: "Composition" },
             { key: "formats", label: "Format" }],
    pose: [{ key: "walk", label: "The pose walk" }],
    expression: [{ key: "walk", label: "Expressions" }],
    session: [{ key: "main", label: "Session" }],
};

const lookSlotSub = (slot, lib, cat, title) => (s) => card(title,
    "replaces: one pick per slot -- the latest click wins",
    (s.look.looks || []).map((l, li) => `
    <div class="plx-look" data-li-card="${li}" data-slot-card="${slot}">
        <div class="plx-look-head">
            <div class="plx-look-strip">${slotTile(l[slot], cat, lib)}</div>
            <span class="plx-card-title">${esc(l.name || (LANG === "ru" ? "Образ " + (li + 1) : "Look " + (li + 1)))}</span>
            <input class="plx-inp plx-name" data-li="${li}" data-k="${slot}" list="plx-${slot}"
                   value="${esc(l[slot] || "")}" placeholder="${tr("own line…")}">
            <button class="plx-btn" data-shoottile="wardrobe__${slot}" title="${tr("shoot a preview tile for this piece with your graph")}">🎬</button>
        </div>
        ${slot === "top" ? `<div class="plx-sub">${tr("ready-made looks")} <span class="plx-dim">${tr("hair, makeup and the first look's outfit in one click")}</span></div>
        <div class="plx-chips tight">${COMBO_LOOKS.map(cb => `
            <div class="plx-chip ${l.top === cb.top && l.bottom === cb.bottom && l.footwear === cb.footwear ? "act" : ""}" data-combo="${esc(cb.name)}">
                ${tile(cb.name, "tops", TOPS_LIB.indexOf(cb.top))}<span>${esc(disp(cb.name))}</span></div>`).join("")}</div>` : ""}
        <div class="plx-chips tight">${lib.map((o, i) => `
            <div class="plx-chip ${l[slot] === o ? "act" : ""}" data-pick="${slot}" data-val="${esc(o)}">
                ${tile(o, cat, i)}<span>${esc(disp(o))}</span></div>`).join("")}</div> ${libChips("wardrobe__" + slot, { act: o => l[slot] === o })}
    </div>`).join("") +
    `<datalist id="plx-top">${TOPS_LIB.map(o => `<option value="${esc(o)}">`).join("")}</datalist>` +
    `<datalist id="plx-bottom">${BOTTOMS_LIB.map(o => `<option value="${esc(o)}">`).join("")}</datalist>` +
    `<datalist id="plx-footwear">${FOOTWEAR_LIB.map(o => `<option value="${esc(o)}">`).join("")}</datalist>`,
    "look." + slot);
const lookTopSub = lookSlotSub("top", TOPS_LIB, "tops", "TOPS");
const lookBottomSub = lookSlotSub("bottom", BOTTOMS_LIB, "bottoms", "BOTTOMS");
const lookFootwearSub = lookSlotSub("footwear", FOOTWEAR_LIB, "footwear", "FOOTWEAR");

// the colors live in the garment's own card: pick the piece first, its color
// swatches and materials sit right under the grid
const slotColorBlock = (l, li, slotKey, colors, materials, matKey, colorCat) => `
    <div class="plx-sub">${tr("color / material of this piece")}</div>
    <div class="plx-swatches">${colors.map(([n, hex], ci) => `
        <button class="plx-swatch ${l[slotKey + "_color"] === n ? "act" : ""}"
            data-li="${li}" data-ck="${slotKey}_color" data-color="${esc(n)}"
            style="--sw:${hex}; background-image:url('${colorCat ? itemImg(colorCat, ci) : ""}')"
            title="${esc(disp(n))}"></button>`).join("")}</div>
    <div class="plx-chips tight">${materials.map(m => `
        <div class="plx-chip plain ${l[matKey] === m ? "act" : ""}" data-li="${li}" data-ck="${matKey}" data-mat="${esc(m)}">
            ${tile(m, "materials", (MAT_INDEX[m] ?? -1))}<span>${esc(disp(m))}</span></div>`).join("")}</div>`;
const lookSlotWithColors = (base, slotKey, colors, materials, matKey, colorCat) => (s) => {
    const inner = base(s);
    const blocks = (s.look.looks || []).map((l, li) =>
        slotColorBlock(l, li, slotKey, colors, materials, matKey, colorCat)).join("");
    const at = inner.lastIndexOf("</div>");
    return inner.slice(0, at) + blocks + inner.slice(at);
};
const lookTopColored = lookSlotWithColors(lookTopSub, "top", LOOK_COLORS, MATERIALS, "top_material", "look_color");
const lookBottomColored = lookSlotWithColors(lookBottomSub, "bottom", LOOK_COLORS, MATERIALS, "bottom_material", "look_color");
const lookFootwearColored = lookSlotWithColors(lookFootwearSub, "footwear", FOOTWEAR_COLORS, FOOTWEAR_MATERIALS, "footwear_material", "footwear_color");
const lookHeadwearSub = lookSlotSub("headwear", HEADWEAR_LIB, "headwear", "HEADWEAR");
const lookHeadwearColored = lookSlotWithColors(lookHeadwearSub, "headwear", HEADWEAR_COLORS,
    ["knit", "wool", "cotton", "leather", "silk", "straw", "denim", "felt", "corduroy", "velvet", "tweed"],
    "headwear_material", "headwear_color");
// lingerie: its own slot -- the set is the whole outfit when nothing covers it
const lookLingerieSub = lookSlotSub("lingerie", LINGERIE_LIB, "lingerie", "LINGERIE");
const lookLingerieColored = lookSlotWithColors(lookLingerieSub, "lingerie", LOOK_COLORS,
    ["silk", "satin", "lace", "velvet", "mesh", "cotton", "knit"],
    "lingerie_material", "lingerie_color");
// accessories: the pick grid plus one color swatch row for the whole set
const lookAccColoredSub = (s) => {
    const base = lookAccSub(s);
    const blocks = (s.look.looks || []).map((l, li) => `
        <div class="plx-sub">${tr("accessory color")} <span class="plx-dim">${tr("applies to every picked accessory")}</span></div>
        <div class="plx-swatches">${ACC_COLORS.map(([n, hex], ci) => `
            <button class="plx-swatch ${l.acc_color === n ? "act" : ""}"
                data-li="${li}" data-ck="acc_color" data-color="${esc(n)}"
                style="--sw:${hex}; background-image:url('${itemImg("acc_color", ci)}')"
                title="${esc(disp(n))}"></button>`).join("")}</div>`).join("");
    const at = base.lastIndexOf("</div>");
    return base.slice(0, at) + blocks + base.slice(at);
};

const SUB_RENDER = {
    look: { top: lookTopColored, bottom: lookBottomColored, footwear: lookFootwearColored,
            headwear: lookHeadwearColored, lingerie: lookLingerieColored,
            accessories: lookAccColoredSub },
    scene: { location: sceneLocSub, weather: sceneWeatherSub, light: sceneLightSub },
    style: { grade: styleGradeSub, film: styleFilmSub },
    camera: { framings: camFramingSub, focus: camFocusSub, lens: camLensSub, composition: camCompSub, formats: camFormatSub },
    pose: { walk: poseSub },
    expression: { walk: exprWalkSub },
    session: { main: sessionSub },
};

// ---- panel --------------------------------------------------------------

function buildPanel(node) {
    const state = readState(node);
    // states saved before the model profiles carry no token_limit: the
    // engine would guard at its own default while the linter watched the
    // profile's -- normalize both to the same string
    if (state.session && state.session.model_profile === undefined) {
        state.session.model_profile = "z_image";
        state.session.token_budget = 400;
        state.session.token_limit = tokenLimitOf(state);
    }
    // the panel opens on the photo-rich hair field -- the value-only fields
    // (who, age) sit further along the tab row
    const ui = { section: "persona", personaField: "hair", dockPage: 0, results: null, dockOpen: false,
                 chars: [], wc: { files: [], editing: null, text: "", newName: "" } };
    // character cards live in userdata/perfectlab_characters, the same shelf
    // presets and wildcards use
    const loadChars = async () => {
        try {
            const d = await (await fetch("/api/userdata?dir=perfectlab_characters&recurse=false&split=false&full_info=false")).json();
            ui.chars = (Array.isArray(d) ? d : (d.tracks || d.files || [])).filter(t => typeof t === "string")
                .map(t => t.replace(/\.json$/, ""));
        } catch (e) { ui.chars = []; }
    };
    loadChars();
    // the update indicator: read the stored verdict first (no network on
    // load), refresh it from the registry at most once a day
    let updVer = "";
    try {
        const st = JSON.parse(localStorage.getItem("plx_vercheck") || "{}");
        updVer = st.newer || "";
        if (Date.now() - (st.checked || 0) > 20 * 3600 * 1000) {
            fetch("https://api.comfy.org/nodes/comfyui-perfectlab")
                .then(r => r.json())
                .then(d => {
                    const latest = String((d.latest_version || {}).version || "").trim();
                    const cur = PL_VERSION;
                    const num = (v) => String(v).split(".").map(x => parseInt(x, 10) || 0);
                    const [a, b, c3] = num(cur), [x, y, z] = num(latest);
                    const newer = latest && (x > a || (x === a && y > b) || (x === a && y === b && z > c3));
                    localStorage.setItem("plx_vercheck",
                        JSON.stringify({ checked: Date.now(), newer: newer ? latest : "" }));
                    if (newer && updVer !== latest) { updVer = latest; renderRail(); }
                })
                .catch(() => {});
        }
    } catch (e) {}

    const el = document.createElement("div");
    el.className = "plx";
    el.addEventListener("mousedown", e => e.stopPropagation());
    el.addEventListener("wheel", e => e.stopPropagation());

    const rail = document.createElement("div");
    const center = document.createElement("div");
    const right = document.createElement("div");
    const dock = document.createElement("div");
    rail.className = "plx-rail"; center.className = "plx-center";
    right.className = "plx-right"; dock.className = "plx-dock";
    const mid = document.createElement("div");
    mid.className = "plx-mid";
    mid.append(rail, center, right);
    el.append(mid, dock);

    let syncSize = null;
    const widget = node.addDOMWidget("plx_panel", "plx_panel", el,
                                    { serialize: false, hideOnZoom: false });
    const i = node.widgets.indexOf(widget);
    if (i > 0) { node.widgets.splice(i, 1); node.widgets.unshift(widget); }

    // the panel header owns the controls -- the native widgets only carry
    // values into the queue, so they leave the visual surface
    node.widgets.forEach(w => {
        if (["node_data", "mode", "stage", "seed", "variations"].includes(w.name))
            w.type = "hidden";
    });

    // a fixed height -- no grow/shrink, no collapse animation
    const H = 720;
    el.style.height = H + "px";
    node.size = [790, H + 60];

    // proportional scaling: the panel's base font tracks the node width and
    // the em-sized controls (buttons, rail, cards, captions) grow with it --
    // stretch the node and the whole UI grows, not just the preview tiles
    const syncFont = () => {
        const wpx = el.getBoundingClientRect().width;
        if (wpx < 10) return;
        const base = Math.max(11, Math.min(19, Math.round(wpx / 58)));
        if (el.style.fontSize !== base + "px") el.style.fontSize = base + "px";
    };
    // the panel box is exact: the DOM widget reports its own height and the
    // node grows to fit -- the kit's proven fitNode formula, no scale math
    syncSize = () => {
        syncFont();
        fitNode(node, el, widget);
        // generous slack: the panel sits fully inside the node box even when
        // the frontend's own row heights drift -- a taller box is harmless,
        // a clipped panel is not
        const need = el.scrollHeight + 160;
        if (node.size[1] < need) node.setSize([node.size[0], need]);
        // tiles breathe: a panel narrower than this squeezes the 4-column
        // chip grid to thumbnails, so the node gets a floor width
        if (node.size[0] < 1200) node.setSize([1200, node.size[1]]);
    };
    requestAnimationFrame(() => requestAnimationFrame(syncSize));
    setTimeout(syncSize, 400);
    setTimeout(syncSize, 1200);
    const sizeObs = new ResizeObserver(() => requestAnimationFrame(syncSize));
    sizeObs.observe(el);
    // a resize can ride on the frontend's own relayout without tripping the
    // observer -- a slow tick keeps the font honest on every frontend
    const sizeTick = setInterval(() => {
        if (!document.contains(el)) { clearInterval(sizeTick); sizeObs.disconnect(); return; }
        syncSize();
    }, 900);
    const prevOnRemoved = node.onRemoved;
    node.onRemoved = function () {
        clearInterval(sizeTick);
        sizeObs.disconnect();
        return prevOnRemoved && prevOnRemoved.apply(this, arguments);
    };

    const header = document.createElement("div");
    header.className = "plx-head";
    el.prepend(header);

    // ---- undo/redo: every mutation lands in sync(); the previous snapshot
    // rides onto the undo stack the moment the state actually changed ----
    const undoStack = [];
    const redoStack = [];
    let lastSnapshot = JSON.stringify(state);
    const sync = () => {
        const snap = JSON.stringify(state);
        if (snap !== lastSnapshot) {
            undoStack.push(lastSnapshot);
            if (undoStack.length > 50) undoStack.shift();
            redoStack.length = 0;
            lastSnapshot = snap;
        }
        writeState(node, state);
        renderAll();
    };
    const undo = () => {
        if (!undoStack.length) return;
        redoStack.push(JSON.stringify(state));
        Object.assign(state, JSON.parse(undoStack.pop()));
        lastSnapshot = JSON.stringify(state);
        writeState(node, state);
        renderAll();
    };
    const redo = () => {
        if (!redoStack.length) return;
        undoStack.push(JSON.stringify(state));
        Object.assign(state, JSON.parse(redoStack.pop()));
        lastSnapshot = JSON.stringify(state);
        writeState(node, state);
        renderAll();
    };

    // ---- clearing: one card, one section, or the whole preset ----
    // ---- reroll: a random pick inside one card ----
    const rnd = (arr) => arr[Math.floor(Math.random() * arr.length)];
    const rndN = (arr, n) => {
        const a = [...arr];
        const out = [];
        while (out.length < Math.min(n, a.length)) out.push(a.splice(Math.floor(Math.random() * a.length), 1)[0]);
        return out;
    };
    const rndPersona = (key, multi) => {
        const field = PERSONA_FIELDS.find(f => f.key === key);
        if (!field) return;
        state.persona.fields[key] = multi ? rndN(field.options, 2) : rnd(field.options);
    };
    const reroll = (subKey) => {
        const [sec, sub] = subKey.split(".");
        const s = state;
        if (sec === "persona") {
            const multi = ["makeup", "signature", "figure"].includes(sub);
            rndPersona(sub, multi);
        } else if (sec === "look") {
            (s.look.looks || []).forEach(l => {
                if (sub === "top" || sub === "bottom" || sub === "footwear" || sub === "headwear") {
                    const lib = { top: TOPS_LIB, bottom: BOTTOMS_LIB, footwear: FOOTWEAR_LIB, headwear: HEADWEAR_LIB }[sub];
                    l[sub] = rnd(lib);
                    l[sub + "_color"] = rnd({ top: LOOK_COLORS, bottom: LOOK_COLORS,
                        footwear: FOOTWEAR_COLORS, headwear: HEADWEAR_COLORS }[sub])[0];
                    l[sub + "_material"] = rnd({ top: MATERIALS, bottom: MATERIALS,
                        footwear: FOOTWEAR_MATERIALS, headwear: ["knit", "wool", "cotton", "leather", "silk", "straw"] }[sub]);
                }
                if (sub === "accessories") {
                    l.accessories = rndN(ACCESSORIES_LIB, 2);
                    l.acc_color = rnd(ACC_COLORS)[0];
                }
            });
        } else if (sec === "scene") {
            if (sub === "location") s.scene.location = rnd(LOCATIONS);
            if (sub === "weather") s.scene.weather = rnd(WEATHER);
            if (sub === "light") s.light.setup = rnd(LIGHT_SETUPS);
        } else if (sec === "style") {
            if (sub === "grade") s.style.grade = rnd(STYLES);
            if (sub === "film") s.style.film = rnd(FILMS);
        } else if (sec === "camera") {
            if (sub === "framings") s.camera.framings = { mode: "multi", set: rndN(FRAMING_LIB.map((_, i) => i), 2), pin: null };
            if (sub === "focus") s.camera.focus = { mode: "multi", set: rndN(FOCUS_LIB.map((_, i) => i), 2), pin: null };
            if (sub === "lens") s.camera.lens = rnd(LENS_LIB);
            else if (sub === "formats") s.camera.formats = { mode: "multi", set: rndN(FORMAT_LIB.map((_, i) => i), 2), pin: 0 };
        } else if (sec === "pose") {
            s.pose.poses = { mode: "multi", set: rndN(POSE_LIB.map((_, i) => i), 3), pin: null };
        } else if (sec === "expression") {
            s.expression.expressions = { mode: "multi", set: rndN(EXPRESSION_LIB.map((_, i) => i), 2), pin: null };
        }
        sync();
    };

    const clearSub = (subKey) => {
        const [sec, sub] = subKey.split(".");
        const s = state;
        if (sec === "persona") { delete s.persona.fields[sub]; }
        else if (sec === "look") {
            (s.look.looks || []).forEach(l => {
                if (sub === "top" || sub === "bottom" || sub === "footwear") {
                    l[sub] = "";
                    l[sub + "_color"] = "";
                    l[sub + "_material"] = "";
                }
                if (sub === "headwear") { l.headwear = ""; l.headwear_color = ""; l.headwear_material = ""; }
                if (sub === "lingerie") { l.lingerie = ""; l.lingerie_color = ""; l.lingerie_material = ""; }
                if (sub === "accessories") { l.accessories = []; l.acc_color = ""; }
            });
        }
        else if (sec === "scene") {
            if (sub === "light") { s.light.setup = ""; s.light.hour = -1; }
            else if (sub === "location") s.scene.location = "";
            else if (sub === "weather") { s.scene.weather = ""; s.scene.details = ""; }
        }
        else if (sec === "style") { s.style[sub] = ""; }
        else if (sec === "camera") {
            if (sub === "formats") s.camera.formats = { mode: "multi", set: [0], pin: 0 };
            else if (sub === "lens") s.camera.lens = "";
            else s.camera[sub] = { mode: "all", set: [], pin: null };
        }
        else if (sec === "pose") s.pose.poses = { mode: "all", set: [], pin: null };
        else if (sec === "expression") {
            s.expression.expressions = { mode: "all", set: [], pin: null };
        }
        sync();
    };
    const clearSection = (secKey) => {
        (SUBS[secKey] || []).forEach(sb => clearSub(secKey + "." + sb.key));
    };
    const resetAll = () => {
        Object.assign(state, DEFAULT_STATE());
        writeState(node, state);
        renderAll();
    };
    const hotkeys = (e) => {
        if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA" || e.target.tagName === "SELECT") return;
        const k = (e.key || "").toLowerCase();
        if (e.ctrlKey && k === "z") {
            e.preventDefault(); e.stopPropagation();
            e.shiftKey ? redo() : undo(); return;
        }
        if (e.ctrlKey && k === "y") {
            e.preventDefault(); e.stopPropagation(); redo(); return;
        }
        if (k !== "x") return;
        e.preventDefault();
        if (e.altKey) resetAll();
        else if (e.shiftKey) clearSection(ui.section);
        else {
            const subKey = ui.section === "persona" ? "persona." + ui.sub : ui.section + "." + ui.sub;
            if (ui.section === "session" || ui.section === "__neg") return;
            clearSub(subKey);
        }
    };
    el.addEventListener("keydown", hotkeys);
    el.tabIndex = 0;

    function renderAll() { renderHeader(); renderRail(); renderCenter(); renderRight(); renderDock(); }

    function renderHeader() {
        const seedW = node.widgets.find(w => w.name === "seed");
        const modes = [["single shot", tr("SINGLE SHOT")], ["session", tr("SESSION")]];
        const cur = node.widgets.find(w => w.name === "mode")?.value || "single shot";
        header.innerHTML = `
            <div class="plx-brand">PERFECTLAB STUDIO</div>
            <div class="plx-seg">${modes.map(([v, l]) =>
                `<button class="plx-seg-b ${cur === v ? "act" : ""}" data-mode="${v}">${l}</button>`).join("")}</div>
            <div class="plx-spacer"></div>
            <button class="plx-lint" data-lint style="display:none" title="${tr("prompt issues")}"></button>
            <input class="plx-inp" data-search placeholder="🔍 ${tr("search libraries…")}" style="width:150px">
            ${cur === "single shot" ? `<input class="plx-inp tiny" type="number" min="1" max="100" data-variations title="${tr("variations")}" value="${node.widgets.find(w => w.name === "variations")?.value || 1}">` : ""}
            <button class="plx-go" data-shoot>${tr("● START SHOOT")}</button>
            ${ui.results && ui.results.length
                ? `<button class="plx-btn ${ui.dockOpen ? "act" : ""}" data-results
                     title="${tr("LAST SHOOT")}">🖼 ${ui.results.length}</button>` : ""}
            <button class="plx-reset" data-undo title="${tr("undo the last pick")}">↶</button>
            <button class="plx-reset" data-redo title="${tr("redo")}">↷</button>
            <button class="plx-reset plx-reset-all" data-resetall title="${tr("clear every pick")}">↺ ${tr("RESET ALL")}</button>
            <button class="plx-btn ${LANG === "ru" ? "act" : ""}" data-lang title="EN / RU — язык интерфейса">${LANG === "ru" ? "RU" : "EN"}</button>`;
        header.querySelectorAll("[data-mode]").forEach(b => b.onclick = () => {
            const w = node.widgets.find(w => w.name === "mode");
            if (w) w.value = b.dataset.mode;
            renderHeader();
            renderCenter();
        });
        const resultsBtn = header.querySelector("[data-results]");
        if (resultsBtn) resultsBtn.onclick = () => {
            ui.dockOpen = !ui.dockOpen;
            renderHeader();
            renderDock();
        };
        const varIn = header.querySelector("[data-variations]");
        if (varIn) varIn.onchange = () => {
            const w = node.widgets.find(w => w.name === "variations");
            if (w) w.value = Math.max(1, +varIn.value || 1);
        };
        header.querySelector("[data-shoot]").onclick = () => startShoot();
        const langBtn = header.querySelector("[data-lang]");
        if (langBtn) langBtn.onclick = () => {
            LANG = LANG === "ru" ? "en" : "ru";
            localStorage.setItem("perfectlab_lang", LANG);
            renderAll();
        };
        const sbox = header.querySelector("[data-search]");
        if (sbox) {
            sbox.oninput = () => renderSearch(sbox.value);
            sbox.onkeydown = (e) => { if (e.key === "Escape") { sbox.value = ""; hideSearch(); } };
        }
        header.querySelector("[data-resetall]").onclick = () => { resetAll(); };
        header.querySelector("[data-undo]").onclick = () => undo();
        header.querySelector("[data-redo]").onclick = () => redo();
    }

    // does the section carry any active pick? the dot turns amber when it does
    const hasPicks = (sec) => {
        const s = state;
        switch (sec.key) {
            case "persona": return Object.values(s.persona.fields || {}).some(v =>
                Array.isArray(v) ? v.length : v);
            case "look": return (s.look.looks || []).some(l => !!(l.top || l.bottom || l.footwear
                || l.headwear || l.lingerie || (l.accessories || []).length || l.details
                || l.top_color || l.top_material || l.bottom_color || l.bottom_material));
            case "scene": return !!(s.scene.location || s.scene.weather || s.scene.details
                                    || s.light.setup || s.light.hour >= 0
                                    || (s.scene.props || []).length);
            case "style": return !!(s.style.grade || s.style.film || s.style.palette);
            case "camera": return s.camera.framings.mode !== "all" || s.camera.focus.mode !== "all"
                                    || (s.camera.formats.pin || 0) > 0 || !!s.camera.framing_order
                                    || !!s.camera.lens || !!s.camera.composition;
            case "pose": return s.pose.poses.mode !== "all";
            case "expression": return s.expression.expressions.mode !== "all" || !!s.expression.arc;
            default: return false;
        }
    };

    // presets row (userdata-backed, the panel factory helper): lives once,
    // re-attached at the end of every rail render
    const presetsHost = document.createElement("div");
    presetsHost.className = "plx-presets-host";
    attachPresets(node, presetsHost, "node_data", "plstudio");
    node._plpReload = () => {
        const w = node.widgets.find(w2 => w2.name === "node_data");
        try { Object.assign(state, JSON.parse(w.value)); } catch (e) {}
        lastSnapshot = JSON.stringify(state);
        renderAll();
    };

    function renderRail() {
        rail.innerHTML = `<div>
                <div class="plx-rail-i overview ${ui.section === "__overview" ? "act" : ""}" data-sec="__overview" title="${tr("every pick of every section, one wall")}">
                    <span class="plx-tw"></span>
                    <span class="plx-rail-label">◈ ${tr("OVERVIEW")}</span>
                </div>
            </div>` + SECTIONS.map(sec => {
            const off = (state.off || []).includes(sec.key);
            const on = ui.section === sec.key;
            const hot = !off && hasPicks(sec);
            const pickCount = sec.key === "persona" || sec.key === "look" || sec.key === "scene"
                || sec.key === "style" || sec.key === "camera" || sec.key === "pose"
                || sec.key === "expression"
                ? sectionPicks(sec.key, state).length : 0;
            const open = ui.railOpen === sec.key;
            const subsList = SUBS[sec.key] || [];
            const subs = open ? subsList.map(sb => `
                <div class="plx-rail-sub ${on && ui.sub === sb.key ? "act" : ""}"
                     data-subnav="${sb.key}">${tr(sb.label)}</div>`).join("") : "";
            return `<div data-sec="${sec.key}">
                <div class="plx-rail-i ${on ? "act" : ""}" data-sec="${sec.key}" title="click: open the section${subsList.length ? " and its subsections" : ""}">
                    <span class="plx-tw ${open ? "open" : ""} ${subsList.length ? "has" : ""}">${subsList.length ? "▸" : ""}</span>
                    <span class="plx-rail-label">${tr(sec.label)}</span>
                    ${pickCount ? `<span class="plx-rail-count" title="${pickCount} ${tr("picked")}">${pickCount}</span>` : ""}
                    ${sec.key !== "session" ? `<button class="plx-dot ${off ? "" : hot ? "hot" : "on"}" data-off="${sec.key}" title="${tr(off ? "off" : hot ? "picks active" : "on")}"></button>` : ""}
                </div>
                ${open && subsList.length > 1 ? `<div class="plx-rail-subs">${subs}</div>` : ""}
            </div>`;
        }).join("") + `<div class="plx-rail-i dim" data-sec="__neg">${tr("NEGATIVE")}</div>
        <div class="plx-rail-i dim" data-sec="__wc" title="${tr("your own __wildcard__ lists, editable right here")}">${tr("WILDCARDS")}</div>
        <a class="plx-tg" href="https://t.me/PerfectJohny" target="_blank" rel="noopener"
           title="${tr("author & support")}">
            <svg viewBox="0 0 24 24" width="13" height="13"><path fill="currentColor" d="M21.9 4.6c.3-1.3-.8-2-1.9-1.6L2.7 9.7c-1.3.5-1.2 1.9-.1 2.3l4.4 1.4 1.7 5.2c.3.9 1.5 1.2 2.2.5l2.3-2.1 4.4 3.2c.9.6 2.1.2 2.3-.9l3.3-14.7zM8.2 12.9l9.4-5.9c.4-.3.8.2.5.6l-7.7 7-.3 3.1-1.9-4.8z"/></svg>
            @PerfectJohny</a>
        <div class="plx-rail-keys">${tr("X · clear card")}<br>${tr("Shift+X · clear section")}<br>${tr("Alt+X · reset all")}</div>
        <div class="plx-rail-ver">PerfectLab v${PL_VERSION}</div>
        ${updVer ? `<a class="plx-rail-upd" href="https://github.com/perfectmodelslab/ComfyUI-PerfectLab/releases" target="_blank" rel="noopener">↑ ${tr("update available")}: v${esc(updVer)}</a>` : ""}`;
        // the category row: one click opens (and selects); a second closes
        rail.querySelectorAll("[data-sec]").forEach(r => r.onclick = e => {
            if (e.target.dataset.off !== undefined || e.target.dataset.subnav) return;
            const key = r.dataset.sec;
            if (key === "__neg" || key === "__wc" || key === "__overview") { ui.section = key; renderAll(); return; }
            ui.section = key;
            ui.railOpen = key;
            const subsList = SUBS[key] || [];
            if (!subsList.some(sb => sb.key === ui.sub)) ui.sub = subsList[0]?.key || "";
            if (key === "persona" && subsList.some(sb => sb.key === ui.sub)) ui.personaField = ui.sub;
            renderAll();
        });
        rail.querySelectorAll("[data-subnav]").forEach(f => f.onclick = e => {
            e.stopPropagation();
            ui.section = f.closest("[data-sec]")?.dataset.sec || ui.section;
            ui.sub = f.dataset.subnav;
            if (ui.section === "persona") ui.personaField = ui.sub;
            ui.railOpen = ui.section;
            renderAll();
        });
        rail.appendChild(presetsHost);
        rail.querySelectorAll("[data-off]").forEach(d => d.onclick = e => {
            e.stopPropagation();
            const k = d.dataset.off;
            state.off = state.off || [];
            const i2 = state.off.indexOf(k);
            if (i2 >= 0) state.off.splice(i2, 1); else state.off.push(k);
            sync();
        });
    }

    // the overview screen: every pick of every section on one wall --
    // the visual picture of the assembled tags
    const renderOverview = () => {
        const rows = SECTIONS.filter(sec => sec.key !== "session").map(sec => {
            const picks = sectionPicks(sec.key, state);
            if (!picks.length) return "";
            return `<div class="plx-ov-row">
                <div class="plx-ov-label" data-sec="${sec.key}">${tr(sec.label)}</div>
                <div class="plx-ov-picks">${picks.join("")}</div>
            </div>`;
        }).join("");
        const anyPicks = SECTIONS.some(sec =>
            sectionPicks(sec.key, state).length);
        center.innerHTML = `
            <div class="plx-sec-head">
                <div class="plx-sec-title">THE SHOOT AT A GLANCE</div>
                <button class="plx-btn warn" data-clearall title="Alt+X">reset everything</button>
            </div>
            ${anyPicks ? rows : `<div class="plx-stage-hint">${tr("Nothing picked yet. Walk the sections on the left -- every tile you click lands here, one line per section, the whole shoot on one wall.")}</div>`}
            <div class="plx-stage-hint">${tr("Press ● START SHOOT in the header when the picture looks right.")}</div>`;
        center.querySelectorAll("[data-clearall]").forEach(b => b.onclick = () => resetAll());
        center.querySelectorAll(".plx-ov-label").forEach(l => l.onclick = () => {
            ui.section = l.dataset.sec;
            ui.railOpen = ui.section;
            const subsList = SUBS[ui.section] || [];
            if (!subsList.some(sb => sb.key === ui.sub)) ui.sub = subsList[0]?.key || "";
            renderAll();
        });
    };

    // ---- the wildcard manager: your own __name__ lists, editable here ----
    const WC_BUNDLED = ["mood", "time_of_day"];

    function wcList() {
        return fetch("/api/userdata?dir=perfectlab_wildcards&recurse=false&split=false&full_info=false")
            .then(r => r.ok ? r.json() : [])
            .then(d => (Array.isArray(d) ? d : (d.tracks || d.files || []))
                .map(f => String(f).replace(/\.txt$/, "")))
            .catch(() => []);
    }

    function wcLoad(name) {
        // the user's copy first, the bundled starter as the base
        return plRead(`perfectlab_wildcards/${name}.txt`)
            .then(t => t || fetch(new URL(`wildcards/${encodeURIComponent(name)}.txt`, import.meta.url).href)
                .then(r => r.ok ? r.text() : ""))
            .catch(() => "");
    }

    function renderWildcards() {
        const w = ui.wc;
        const rows = w.files.map(n => `
            <div class="plx-chip plain act" data-wc-edit="${esc(n)}">${esc(n)}
                <button class="plx-lib-x" data-wc-del="${esc(n)}" title="${tr("remove from the library")}">✕</button>
            </div>`).join("");
        const bundled = WC_BUNDLED.map(n => `
            <div class="plx-chip plain" data-wc-edit="${esc(n)}" title="${tr("bundled starter -- editing makes your own copy")}">${esc(n)} <i class="plx-dim">${tr("bundled")}</i></div>`).join("");
        center.innerHTML = `
            <div class="plx-card">
                <div class="plx-card-head">
                    <span class="plx-card-title">${tr("WILDCARDS")}</span>
                    <span class="plx-dim">${tr("your own __wildcard__ lists, editable right here")}</span>
                </div>
                <div class="plx-sub">${tr("how it works")}</div>
                <div class="plx-hint">${tr("Write __name__ in any own line -- the location line, the free scene line, your additions. Every shot pulls one line of that file, picked from the shot's own seed. One phrase per line, # comments skip. Your files live in the profile folder and survive node updates.")}</div>
                <div class="plx-sub">${tr("your files")}</div>
                <div class="plx-chips tight">${rows || `<i class="plx-dim">${tr("none yet -- create one below")}</i>`}</div>
                ${w.files.length || bundled ? `<div class="plx-sub">${tr("bundled starters")}</div>
                <div class="plx-chips tight">${bundled}</div>` : ""}
                <div class="plx-sub">${tr("new file")}</div>
                <div class="plx-row">
                    <input class="plx-inp" data-wc-name value="${esc(w.newName)}"
                           placeholder="${tr("name -- letters, digits, _ -")}">
                    <button class="plx-btn" data-wc-new>${tr("create")}</button>
                </div>
                ${w.editing ? `
                <div class="plx-sub">${tr("editing")} <b>${esc(w.editing)}</b>
                    ${w.editingBundled ? ` <span class="plx-dim">(${tr("your own copy overrides the starter")})</span>` : ""}</div>
                <div class="plx-row"><textarea class="plx-inp plx-wide" data-wc-text rows="8">${esc(w.text)}</textarea></div>
                <div class="plx-row">
                    <button class="plx-btn" data-wc-save>${tr("save")}</button>
                    <button class="plx-btn" data-wc-cancel>${tr("cancel")}</button>
                </div>` : ""}
            </div>`;
        center.querySelectorAll("[data-wc-new]").forEach(b => b.onclick = () => {
            const inp = center.querySelector("[data-wc-name]");
            const name = (inp.value || "").trim();
            if (!/^[A-Za-z0-9_-]+$/.test(name)) { inp.focus(); return; }
            ui.wc.editing = name;
            ui.wc.editingBundled = false;
            ui.wc.text = "";
            ui.wc.newName = "";
            renderWildcards();
        });
        center.querySelectorAll("[data-wc-edit]").forEach(c => c.onclick = (e) => {
            if (e.target.dataset.wcDel !== undefined) return;
            const name = c.dataset.wcEdit;
            wcLoad(name).then(t => {
                ui.wc.editing = name;
                ui.wc.editingBundled = WC_BUNDLED.includes(name) && !ui.wc.files.includes(name);
                ui.wc.text = t;
                renderWildcards();
            });
        });
        center.querySelectorAll("[data-wc-del]").forEach(b => b.onclick = (e) => {
            e.stopPropagation();
            const name = b.dataset.wcDel;
            plDrop(`perfectlab_wildcards/${name}.txt`).then(() => {
                WC_CACHE.delete(name);
                ui.wc.files = ui.wc.files.filter(f => f !== name);
                if (ui.wc.editing === name) { ui.wc.editing = null; ui.wc.text = ""; }
                wcRerender();
                renderWildcards();
            });
        });
        center.querySelectorAll("[data-wc-save]").forEach(b => b.onclick = () => {
            const name = ui.wc.editing;
            const text = center.querySelector("[data-wc-text]").value;
            plWrite(`perfectlab_wildcards/${name}.txt`, text).then(() => {
                WC_CACHE.delete(name);
                if (!ui.wc.files.includes(name)) ui.wc.files.push(name);
                ui.wc.editingBundled = false;
                wcRerender();
                renderWildcards();
            });
        });
        center.querySelectorAll("[data-wc-cancel]").forEach(b => b.onclick = () => {
            ui.wc.editing = null; ui.wc.text = ""; renderWildcards();
        });
        const nameInp = center.querySelector("[data-wc-name]");
        if (nameInp) nameInp.oninput = () => { ui.wc.newName = nameInp.value; };
    }

    function renderCenter() {
        if (ui.section === "__overview") { renderOverview(); return; }
        if (ui.section === "__wc") {
            wcList().then(files => { ui.wc.files = files; renderWildcards(); });
            return;
        }
        const sec = SECTIONS.find(s2 => s2.key === ui.section);
        const stageHints = null;
        const stage = null;
        if (!sec) { center.innerHTML = NEGATIVE(state); wireCenter(); return; }
        const subsList = SUBS[sec.key] || [];
        if (!ui.sub || !subsList.some(sb => sb.key === ui.sub)) ui.sub = subsList[0]?.key || "";
        let body;
        if (sec.key === "persona") body = personaSub(state, ui, ui.sub);
        else body = (SUB_RENDER[sec.key] && SUB_RENDER[sec.key][ui.sub])
            ? SUB_RENDER[sec.key][ui.sub](state, ui) : sec.render(state, ui);
        const picks = sectionPicks(sec.key, state);
        const picksLine = sec.key === "session"
            ? "" : (picks.length
                ? `<div class="plx-picks-line" title="${tr("what this section has picked so far")}">${picks.join("")}</div>`
                : `<div class="plx-picks-line empty">${tr("nothing picked yet -- the subsections below are all yours")}</div>`);
        center.innerHTML = `
            ${stageHints ? `<div class="plx-stage-hint">${stageHints[stage] || ""}</div>` : ""}
            ${picksLine}
            <div class="plx-sec-head">
                <div class="plx-sec-title">${tr(sec.label)}</div>
                <button class="plx-btn warn" data-clearsec="${sec.key}" title="Shift+X">${tr("clear " + sec.label.toLowerCase())}</button>
            </div>
            ${body}`;
        wireCenter();
    }

    function wireCenter() {
        // persona
        center.querySelectorAll("[data-field]").forEach(b => b.onclick = () => {
            ui.personaField = b.dataset.field; renderCenter(); renderDock(); });
        center.querySelectorAll(".plx-chip[data-val]").forEach(c => c.onclick = () => {
            const v = c.dataset.val;
            if (ui.section === "persona") {
                const key = ui.personaField;
                const multi = c.dataset.multi === "true";
                const cur = state.persona.fields[key];
                if (multi) {
                    const arr = Array.isArray(cur) ? cur : (cur ? [cur] : []);
                    const i2 = arr.indexOf(v);
                    if (i2 >= 0) arr.splice(i2, 1); else arr.push(v);
                    state.persona.fields[key] = arr;
                } else {
                    state.persona.fields[key] = state.persona.fields[key] === v ? "" : v;
                }
            } else if (ui.section === "scene") {
                const t = c.dataset.t;
                if (t === "setup") state.light.setup = state.light.setup === v ? "" : v;
                else state.scene[t] = state.scene[t] === v ? "" : v;
            } else if (ui.section === "style") {
                state.style[c.dataset.t] = state.style[c.dataset.t] === v ? "" : v;
                ui.styleCat = c.dataset.t === "film" ? "film" : "style";
            }
            sync();
        });
        // chipGrid pins/multis (camera, pose, expression) -- identify the
        // grid by its position among the section's chip grids. The card
        // layout has no .plx-sec-body anymore -- the section owns its grids.
        // Camera keeps one walk grid (focus), pose its 32, expression its 28.
        center.querySelectorAll(".plp-chip[data-i]").forEach(c => c.onclick = e => {
            if (e.target.dataset.fav !== undefined) return;
            const idx = +c.dataset.i;
            const gridEl = c.closest(".plp-chips");
            if (!gridEl || !center.contains(gridEl)) return;
            let selObj, multi;
            if (ui.section === "camera") {
                selObj = state.camera.focus; multi = true;
            } else if (ui.section === "pose") {
                selObj = state.pose.poses; multi = true;
            } else {
                selObj = state.expression.expressions; multi = true;
            }
            if (!selObj) return;
            if (multi) {
                selObj.mode = "multi";
                selObj.set = selObj.set || [];
                const i2 = selObj.set.indexOf(idx);
                if (i2 >= 0) selObj.set.splice(i2, 1); else selObj.set.push(idx);
            } else {
                selObj.mode = "pin"; selObj.pin = idx;
            }
            sync();
        });
        center.querySelectorAll('[data-mode="all"]').forEach(b => b.onclick = e => {
            e.stopPropagation();
            if (!center.contains(b.closest(".plp-chips"))) return;
            if (ui.section === "camera") {
                state.camera.focus = { mode: "all", set: [], pin: null };
            } else if (ui.section === "pose") {
                state.pose.poses = { mode: "all", set: [], pin: null };
            } else {
                state.expression.expressions = { mode: "all", set: [], pin: null };
            }
            sync();
        });
        // inputs
        center.querySelectorAll("[data-own]").forEach(inp => inp.onchange = () => {
            const key = inp.dataset.own;
            if (inp.value.trim()) state.persona.fields[key] = inp.value.trim();
            else if (PERSONA_FIELDS.find(f2 => f2.key === key) && !PERSONA_FIELDS.find(f2 => f2.key === key).options.includes(state.persona.fields[key]))
                state.persona.fields[key] = "";
            sync();
        });
        center.querySelectorAll("[data-clear]").forEach(b => b.onclick = () => {
            delete state.persona.fields[b.dataset.clear]; sync(); });
        center.querySelectorAll("[data-ownscene]").forEach(inp => inp.onchange = () => {
            state.scene[inp.dataset.ownscene] = inp.value.trim(); sync(); });
        center.querySelectorAll("[data-prop]").forEach(c => c.onclick = () => {
            const list = state.scene.props || (state.scene.props = []);
            const v = c.dataset.val;
            const j = list.indexOf(v);
            if (j >= 0) list.splice(j, 1); else list.push(v);
            sync(); });
        center.querySelectorAll("[data-ownlight]").forEach(inp => inp.onchange = () => {
            state.light.setup = inp.value.trim(); sync(); });
        center.querySelectorAll("[data-ownstyle]").forEach(inp => inp.onchange = () => {
            state.style[inp.dataset.ownstyle] = inp.value.trim(); sync(); });
        // the v1 palette, back: swatch picks + modifier presets write the line
        center.querySelectorAll("[data-pal]").forEach(b => b.onclick = () => {
            const cur = paletteColors(state);
            const n = b.dataset.pal;
            const next = cur.includes(n) ? cur.filter(x => x !== n)
                : (cur.length >= 5 ? cur : [...cur, n]);
            state.style.palette = (paletteMod(state) ? paletteMod(state) + " " : "") + next.join(", ");
            sync(); });
        center.querySelectorAll("[data-palmod]").forEach(c => c.onclick = () => {
            const colors = paletteColors(state).join(", ");
            state.style.palette = c.dataset.palmod
                ? c.dataset.palmod + " " + colors : colors;
            sync(); });
        center.querySelectorAll("[data-hour]").forEach(inp => inp.onchange = () => {
            state.light.hour = Math.max(-1, Math.min(24, +inp.value || -1)); sync(); });
        center.querySelectorAll("[data-li]").forEach(inp => inp.onchange = () => {
            const k = inp.dataset.k;
            const value = inp.value.trim();
            if (k === "accessories") {
                state.look.looks[+inp.dataset.li].accessories =
                    value ? value.split(",").map(x => x.trim()).filter(Boolean) : [];
            } else {
                state.look.looks[+inp.dataset.li][k] = value;
                // a typed piece outside the catalog stays in the LIBRARY
                // row, as the row's own header promises
                const SLOT_LIB = { top: TOPS_LIB, bottom: BOTTOMS_LIB,
                                   footwear: FOOTWEAR_LIB, headwear: HEADWEAR_LIB };
                if (value && SLOT_LIB[k] && !SLOT_LIB[k].includes(value))
                    libAdd("wardrobe__" + k, value);
            }
            if (k === "name") sync(); else { writeState(node, state); renderRight(); renderCenter(); } });
        // garment picks: click a tile -> fill the slot; click again -> clear
        center.querySelectorAll("[data-pick]").forEach(gc => gc.onclick = () => {
            const l = state.look.looks[+gc.closest(".plx-look").dataset.liCard];
            l[gc.dataset.pick] = l[gc.dataset.pick] === gc.dataset.val ? "" : gc.dataset.val;
            sync(); });
        // the LIBRARY row: typed-before entries with their shot/photo tiles
        center.querySelectorAll(".plx-look").forEach(card => {
            const slotName = card.dataset.slotCard;
            if (!slotName) return;
            const li = +card.dataset.liCard;
            wireLib(card, "wardrobe__" + slotName,
                (entry) => { state.look.looks[li][slotName] = entry; sync(); },
                () => { renderCenter(); });
            libSync("wardrobe__" + slotName, card, () => renderCenter());
        });
        center.querySelectorAll("[data-pick-acc]").forEach(gc => gc.onclick = () => {
            const l = state.look.looks[+gc.closest(".plx-look").dataset.liCard];
            const arr = Array.isArray(l.accessories) ? l.accessories : [];
            const v = gc.dataset.pickAcc;
            const j = arr.indexOf(v);
            if (j >= 0) arr.splice(j, 1); else arr.push(v);
            l.accessories = arr;
            sync(); });
        // color swatches and material chips on a look
        center.querySelectorAll("[data-color]").forEach(sw => sw.onclick = () => {
            const l = state.look.looks[+sw.dataset.li];
            l[sw.dataset.ck] = l[sw.dataset.ck] === sw.dataset.color ? "" : sw.dataset.color;
            sync(); });
        center.querySelectorAll("[data-mat]").forEach(mc => mc.onclick = () => {
            const l = state.look.looks[+mc.dataset.li];
            l[mc.dataset.ck] = l[mc.dataset.ck] === mc.dataset.mat ? "" : mc.dataset.mat;
            sync(); });
        // format chips: multi-select -- each frame takes the next picked ratio
        center.querySelectorAll("[data-fmt]").forEach(fc => fc.onclick = () => {
            const idx = +fc.dataset.fmt;
            const sel = state.camera.formats;
            sel.mode = "multi";
            sel.set = sel.set || [];
            const j = sel.set.indexOf(idx);
            if (j >= 0) sel.set.splice(j, 1); else sel.set.push(idx);
            if (!sel.set.length) sel.set = [idx];   // never empty: one pick remains
            sync(); });
        // framing chips: multi-select walk (same contract as the other walks)
        center.querySelectorAll("[data-fr]").forEach(fc => fc.onclick = () => {
            const sel = state.camera.framings;
            const idx = +fc.dataset.fr;
            sel.mode = "multi";
            sel.set = sel.set || [];
            const j = sel.set.indexOf(idx);
            if (j >= 0) sel.set.splice(j, 1); else sel.set.push(idx);
            sync(); });
        // favourites: the star works again -- stable scope per grid
        const favScope = () => {
            if (ui.section === "camera") return ["plx.cam.framings", "plx.cam.focus"];
            if (ui.section === "pose") return ["plx.poses"];
            return ["plx.expressions"];
        };
        center.querySelectorAll(".plp-star").forEach(st => st.onclick = (e) => {
            e.stopPropagation();
            const gi = [...center.querySelectorAll(".plp-chips")]
                .indexOf(st.closest(".plp-chips"));
            const scopes = favScope();
            const scope = scopes[Math.min(gi, scopes.length - 1)];
            toggleFav(scope, +st.dataset.fav);
            renderCenter(); renderDock();
        });
        center.querySelectorAll("[data-addlook]").forEach(b => b.onclick = () => {
            state.look.looks.push({ name: "Look " + (state.look.looks.length + 1),
                                    top: "", bottom: "", footwear: "", details: "" }); sync(); });
        center.querySelectorAll("[data-dellook]").forEach(b => b.onclick = () => {
            state.look.looks.splice(+b.dataset.dellook, 1);
            if (!state.look.looks.length) state.look.looks.push({ name: "Look 1" });
            sync(); });
        center.querySelectorAll("[data-clearsub]").forEach(b => b.onclick = () => clearSub(b.dataset.clearsub));
        center.querySelectorAll("[data-reroll]").forEach(b => b.onclick = () => reroll(b.dataset.reroll));
        center.querySelectorAll("[data-clearsec]").forEach(b => b.onclick = () => clearSection(b.dataset.clearsec));
        center.querySelectorAll("[data-order]").forEach(c => c.onchange = () => {
            state.camera.framing_order = c.checked ? "wide-to-close" : ""; sync(); });
        center.querySelectorAll("[data-count]").forEach(inp => inp.onchange = () => {
            state.session.count = Math.max(1, Math.min(100, +inp.value || 1)); sync(); });
        center.querySelectorAll("[data-takes]").forEach(inp => inp.onchange = () => {
            state.session.takes = Math.max(1, Math.min(4, +inp.value || 1)); sync(); });
        center.querySelectorAll("[data-rotation]").forEach(inp => inp.onchange = () => {
            state.session.look_rotation = inp.value; sync(); });
        center.querySelectorAll("[data-modelprofile]").forEach(inp => inp.onchange = () => {
            state.session.model_profile = inp.value;
            const pr = profileOf(state);
            if (pr.style) state.shot.style_mode = pr.style;   // the family's own wording
            state.session.token_limit = tokenLimitOf(state);   // the engine guard reads this
            sync();
        });
        // character cards: load / save / delete in userdata
        center.querySelectorAll("[data-chars]").forEach(sel2 => sel2.onchange = async () => {
            if (!sel2.value) return;
            try {
                const card = JSON.parse(await plRead(`perfectlab_characters/${encodeURIComponent(sel2.value)}.json`));
                state.persona.fields = card.fields || {};
                state.persona.trigger = card.trigger || "";
                sync();
            } catch (e) {}
        });
        center.querySelectorAll("[data-charsave]").forEach(b => b.onclick = async () => {
            const name = prompt(tr("Character card name:"), "");
            if (!name) return;
            await plWrite(`perfectlab_characters/${encodeURIComponent(name)}.json`,
                JSON.stringify({ name, fields: state.persona.fields || {}, trigger: state.persona.trigger || "" }));
            await loadChars();
            sync();
        });
        center.querySelectorAll("[data-chardel]").forEach(b => b.onclick = async () => {
            const sel2 = center.querySelector("[data-chars]");
            if (!sel2 || !sel2.value) return;
            await plDrop(`perfectlab_characters/${encodeURIComponent(sel2.value)}.json`);
            await loadChars();
            sync();
        });
        // curated full looks: hair + makeup + the first look's outfit
        center.querySelectorAll("[data-combo]").forEach(c2 => c2.onclick = () => {
            const cb = COMBO_LOOKS.find(x => x.name === c2.dataset.combo);
            if (!cb) return;
            const l0 = (state.look.looks || [])[0];
            if (!l0) return;
            if (!state.persona.fields) state.persona.fields = {};
            if (cb.hair) state.persona.fields.hair = cb.hair;
            if (cb.makeup) state.persona.fields.makeup = cb.makeup;
            if (cb.top) l0.top = cb.top;
            if (cb.bottom) l0.bottom = cb.bottom;
            if (cb.footwear) l0.footwear = cb.footwear;
            sync();
        });
        center.querySelectorAll("[data-template]").forEach(t => t.onchange = () => {
            state.session.template = t.value; sync(); });
        center.querySelectorAll("[data-templatereset]").forEach(b => b.onclick = () => {
            state.session.template = ""; sync(); });
        center.querySelectorAll("[data-tokenbudget]").forEach(inp => inp.onchange = () => {
            state.session.token_budget = Math.max(0, Math.round(+inp.value || 0));
            state.session.token_limit = tokenLimitOf(state);
            sync();
        });
        center.querySelectorAll("[data-coup]").forEach(c => c.onchange = () => {
            state.session[c.dataset.coup] = c.checked; sync(); });
        center.querySelectorAll("[data-arc]").forEach(c => c.onclick = () => {
            state.expression.arc = c.dataset.arc; sync(); });
        center.querySelectorAll("[data-negon]").forEach(c => c.onchange = () => {
            state.negative.enabled = c.checked; sync(); });
        center.querySelectorAll("[data-neg]").forEach(inp => inp.onchange = () => {
            state.negative.text = inp.value; writeState(node, state); });
        center.querySelectorAll("[data-negp]").forEach(c => c.onclick = () => {
            const list = state.negative.presets || [];
            state.negative.presets = list.includes(c.dataset.negp)
                ? list.filter(x => x !== c.dataset.negp)
                : [...list, c.dataset.negp];
            sync(); });
        center.querySelectorAll("[data-lens]").forEach(c => c.onclick = () => {
            state.camera.lens = state.camera.lens === c.dataset.lens ? "" : c.dataset.lens;
            sync(); });
        center.querySelectorAll("[data-comp]").forEach(c => c.onclick = () => {
            state.camera.composition = state.camera.composition === c.dataset.comp ? "" : c.dataset.comp;
            sync(); });
        center.querySelectorAll("[data-shoottile]").forEach(b => b.onclick = () => {
            const v = (b.parentElement.querySelector("input")?.value || "").trim();
            if (v) shootTile(b.dataset.shoottile, v); });
    }

    // ---- the prompt linter: token budget, duplicates, brace balance,
    // choice syntax, wildcard names ----------------------------------------
    function lintPrompt(lt, s) {
        const issues = [];
        // the encoder budget for a self-written entry: 300 characters
        const OWN_MAX = 300;
        const ownLines = [
            ["main prompt", s.shot.main_prompt],
            ["own prompt additions", s.shot.custom],
            ["scene line", s.scene.details],
            ...((s.look.looks || [])).flatMap((l, i) =>
                Object.entries(l).filter(([k, v]) => typeof v === "string" &&
                    !k.endsWith("_color") && !k.endsWith("_material") &&
                    !["name", "base", "lingerie"].includes(k) &&
                    v.length > OWN_MAX).map(([k, v]) => [`look ${i + 1} ${k.replace(/_.*$/, "")}`, v])),
        ];
        for (const [where, line] of ownLines) {
            if (typeof line === "string" && line.length > OWN_MAX)
                issues.push({ t: "ownline", d: tr("~w~ is ~n~ characters -- over the ~max~ the model still reads as one intent. Split it or trim.")
                    .replace("~w~", trw(where)).replace("~n~", line.length).replace("~max~", OWN_MAX) });
        }
        const budget = budgetOf(state);
        if (budget && lt.tokens > budget) issues.push({
            t: "tokens", d: `${lt.tokens} ${tr("tokens -- over the ~n~ token budget. Trim picks, or the engine's guard drops slots.").replace("~n~", budget)}` });
        // duplicates: same value picked twice (a pick and a typed copy)
        const seen = new Set();
        for (const part of lt.parts) {
            const k = (part || "").toLowerCase().replace(/[.,]/g, "").trim();
            if (k.length < 4 || k.includes(":") || k.includes("\n")) continue;
            if (seen.has(k)) issues.push({ t: "duplicate", d: `"${k}" ${tr("appears twice in the prompt.")}` });
            seen.add(k);
        }
        // unbalanced braces: leftovers after both resolvers ran
        if ((lt.text.match(/\{/g) || []).length !== (lt.text.match(/\}/g) || []).length)
            issues.push({ t: "braces", d: tr("Unbalanced { } in the prompt -- a choice or wildcard never resolved.") });
        // a choice without a pipe is not a choice
        const pointless = (lt.raw || "").match(/\{[^{}|]+\}/g);
        if (pointless) issues.push({
            t: "choice", d: `"${pointless[0]}" ${tr("has no | -- drop the braces or add alternatives.")}` });
        // a wildcard token that stayed after resolution
        const wc = lt.text.match(/__([A-Za-z0-9_-]+)__/g);
        if (wc) issues.push({
            t: "wildcard", d: `__${wc[0].replace(/__/g, "")}__ ${tr("has no file in web/wildcards/ -- the token goes to the model as-is.")}` });
        // a custom template: unknown slots leak into the prompt verbatim,
        // and a template without the person slot loses the persona
        const tmplStr = ((s.session || {}).template || "").trim();
        if (tmplStr) {
            const unknown = (tmplStr.match(/\{[a-z_]+\}/g) || [])
                .filter(m => !TEMPLATE_KEYS.includes(m.slice(1, -1)));
            if (unknown.length) issues.push({
                t: "template", d: `"${unknown[0].slice(1, -1)}" ${tr("is not a template slot -- the bare word leaks into the prompt.")}` });
            if (!tmplStr.includes("{person}")) issues.push({
                t: "template", d: tr("The template has no {person} slot -- the persona never reaches the prompt.") });
        }
        // negative enabled but empty
        if (s.negative.enabled && !s.negative.text
            && !(s.negative.presets || []).length)
            issues.push({ t: "negative", d: tr("The negative is ON but empty -- pick guards or write a line.") });
        return issues;
    }

    function renderRight() {
        const lt = liveText(state,
            +node.widgets.find(w => w.name === "seed")?.value || 0);
        const { text, tokens } = lt;
        const issues = lintPrompt(lt, state);
        right.innerHTML = `
            <div class="plx-sub">${tr("trigger / prefix")}</div>
            <div class="plx-row"><input class="plx-inp" data-trigger value="${esc(state.persona.trigger)}" placeholder="${tr("LoRA trigger (JW…)")}"></div>
            <div class="plx-row"><input class="plx-inp" data-main value="${esc(state.shot.main_prompt)}" placeholder="${tr("prefix / trigger line (JW, JWBody, …)")}"></div>
            <div class="plx-sub">${tr("own prompt additions")} <span class="plx-dim">${tr("appended to every shot")}</span></div>
            <div class="plx-row"><textarea class="plx-inp plx-wide" data-custom rows="4"
                placeholder="${tr("anything you want in every prompt: quality tags, camera quirks, extra words…")}">${esc(state.shot.custom || "")}</textarea></div>
            <div class="plx-sub">${tr("prompt style")} <span class="plx-dim">${tr("SDXL reads tags, not sentences")}</span></div>
            <div class="plx-row"><select class="plx-inp" data-stylemode>
                <option value="natural" ${(state.shot.style_mode || "natural") === "natural" ? "selected" : ""}>${tr("natural language (Flux / Z-Image)")}</option>
                <option value="tags" ${(state.shot.style_mode || "natural") === "tags" ? "selected" : ""}>${tr("SDXL tags (comma list)")}</option>
            </select></div>
            <div class="plx-sub">${tr("LIVE TEXT")} <span class="plx-dim ${(budgetOf(state) && tokens > budgetOf(state)) ? "over" : ""}">${tr("estimate")} · ${budgetOf(state) ? `${tokens}/${budgetOf(state)}` : tokens} ${tr("tok")}${budgetOf(state) && tokens > budgetOf(state) ? ` -- ${tr("over the token budget, trim picks or the guard drops slots")}` : ""}</span></div>
            <div class="plx-live">${esc(text)}</div>
            <div class="plx-sub">${tr("SESSION PLAN")}</div>
            <div class="plx-session">
                ${tr("One START SHOOT renders")} <b>${state.session.count * state.session.takes}</b> ${plural(state.session.count * state.session.takes, "frame")}
                (<b>${state.session.count}</b> ${plural(state.session.count, "shot")} × <b>${state.session.takes}</b> ${plural(state.session.takes, "take")}).<br>
                ${(state.look.looks || []).length > 1 ? `${(state.look.looks || []).length} ${plural((state.look.looks || []).length, "look")} ${tr("rotate")} ${esc(tr(state.session.look_rotation))}.` : tr("One look for the whole session.")}<br>
                ${state.expression.arc ? tr("On the ~arc~ arc~tail~.").replace("~arc~", `<b>${esc(disp(state.expression.arc))}</b>`).replace("~tail~", state.session.takes_arc ? ` -- ${tr("takes ride the curve")}` : "") : ""}
            </div>
            ${state.expression.arc && state.session.count > 1 ? `<div class="plx-sub">${tr("the arc's expression route")}</div>
            <div class="plx-chips tight">${arcSeq(state.expression.arc, state.session.count).map((e, i) => `
                <span class="plx-route"><b>${i + 1}</b> ${esc(disp(e))}</span>`).join("")}</div>` : ""}`;
        // the linter badge: amber when issues exist, its title carries the list
        const lintBtn = header.querySelector("[data-lint]");
        if (lintBtn) {
            lintBtn.style.display = issues.length ? "" : "none";
            lintBtn.textContent = `⚠ ${issues.length}`;
            lintBtn.className = `plx-lint ${issues.length ? "on" : ""}`;
            lintBtn.onclick = () => {
                lintOverlay.innerHTML = issues.map(i =>
                    `<div class="plx-sr"><span class="plx-lint-tag">${esc(tr(i.t))}</span>${esc(i.d)}</div>`).join("");
                lintOverlay.style.display = lintOverlay.style.display === "none" ? "" : "none";
            };
        }
        right.querySelector("[data-main]").onchange = e => {
            state.shot.main_prompt = e.target.value; writeState(node, state); renderRight(); };
        right.querySelector("[data-custom]").onchange = e => {
            state.shot.custom = e.target.value; writeState(node, state); renderRight(); };
        right.querySelector("[data-stylemode]").onchange = e => {
            state.shot.style_mode = e.target.value; writeState(node, state); renderRight(); };
        right.querySelector("[data-trigger]").onchange = e => {
            state.persona.trigger = e.target.value; writeState(node, state); renderRight(); };
    }

    // ---- preview dock: 8 tiles, paging ---------------------------------
    function dockItems() {
        if (ui.results) return { imgs: ui.results.map(r => r.src), label: `${tr("LAST SHOOT")} · ${ui.results.length} ${plural(ui.results.length, "frame")}` };
        const sec = SECTIONS.find(s2 => s2.key === ui.section);
        if (!sec) return { imgs: [], label: tr("PREVIEW") };
        const label = `${tr(sec.label)} · ${tr("PREVIEW")}`;
        // tile counts derive straight from the libraries -- they cannot drift
        const CAT_COUNT = {};
        PERSONA_FIELDS.forEach(fd => { CAT_COUNT[fd.imgcat] = fd.options.length; });
        Object.assign(CAT_COUNT, {
            outfit: 14, // the outfit mood-board has no library array behind it
            location: LOCATIONS.length, weather: WEATHER.length, lighting: LIGHT_SETUPS.length,
            style: STYLES.length, film: FILMS.length, framing: FRAMING_LIB.length,
            lens: LENS_LIB.length, focus: FOCUS_LIB.length,
            pose: POSE_LIB.length, expression: EXPRESSION_LIB.length,
            accessories: ACCESSORIES_LIB.length, headwear: HEADWEAR_LIB.length,
            look_color: LOOK_COLORS.length, footwear_color: FOOTWEAR_COLORS.length,
            headwear_color: HEADWEAR_COLORS.length, acc_color: ACC_COLORS.length,
        });
        let imgcat, count;
        if (sec.key === "persona") {
            const f = PERSONA_FIELDS.find(x => x.key === ui.personaField);
            imgcat = f.imgcat; count = CAT_COUNT[f.imgcat] || 0;
        } else if (sec.key === "style") {
            imgcat = ui.styleCat || "style"; count = CAT_COUNT[imgcat] || 0;
        } else {
            imgcat = sec.imgcat; count = CAT_COUNT[sec.imgcat] || 0;
        }
        if (!imgcat || !count) return { imgs: [], label: `${tr(sec.label)} · ${tr("no tiles")}` };
        return { imgs: Array.from({ length: count }, (_, i) => itemImg(imgcat, i)), label };
    }

    function renderDock() {
        // the dock exists for ONE thing: the frames the last START SHOOT
        // rendered (and their re-shoot clicks). It opens on the header's
        // results button and stays closed while planning, so the editor
        // keeps its space.
        if (!ui.results || !ui.results.length || !ui.dockOpen) { dock.style.display = "none"; return; }
        dock.style.display = "";
        const { imgs, label } = dockItems();
        const per = 8;   // one page: a 4x2 grid of large tiles
        const pages = Math.max(1, Math.ceil(imgs.length / per));
        ui.dockPage = Math.min(ui.dockPage, pages - 1);
        const slice = imgs.slice(ui.dockPage * per, ui.dockPage * per + per);
        const reshootable = node.widgets.find(w => w.name === "mode")?.value === "session";
        dock.innerHTML = `
            <div class="plx-dock-bar">
                <span class="plx-dock-label">${label}</span>
                <div class="plx-dots">${Array.from({ length: pages }, (_, p) =>
                    `<i class="${p === ui.dockPage ? "on" : ""}" data-page="${p}"></i>`).join("")}</div>
                <button class="plx-nav" data-prev>‹</button>
                <button class="plx-nav" data-next>›</button>
                ${reshootable && ui.results.some(r => !r.keep)
                    ? `<button class="plx-nav plx-rej" data-reshootrej title="${tr("re-shoot every frame you did not keep")}">↺ ${ui.results.filter(r => !r.keep).length}</button>` : ""}
                <button class="plx-nav" data-close title="${tr("close the results, back to the panel")}">✕</button>
            </div>
            <div class="plx-dock-tiles" style="grid-template-columns:repeat(8, 1fr)">${slice.map((src, k) => `
                <div class="plx-tile ${ui.results && reshootable ? "pick" : ""} ${ui.results && ui.results[ui.dockPage * per + k]?.keep ? "kept" : ""}" data-t="${ui.dockPage * per + k}" title="${ui.results ? tr("re-shoot this frame") : ""}">
                    ${src.startsWith("data:") || src.includes("/view?") || src.includes("filename=")
                        ? `<img src="${src}">` : `<img src="${src}?v=${GUIDE_V}">`}
                    ${ui.results ? `<button class="plx-keep ${ui.results[ui.dockPage * per + k]?.keep ? "on" : ""}" data-keep="${ui.dockPage * per + k}" title="${tr("keep this frame -- the batch re-shoot skips it")}">★</button>` : ""}
                </div>`).join("")}</div>`;
        dock.querySelector("[data-prev]").onclick = () => { ui.dockPage = Math.max(0, ui.dockPage - 1); renderDock(); };
        dock.querySelector("[data-next]").onclick = () => { ui.dockPage = Math.min(pages - 1, ui.dockPage + 1); renderDock(); };
        dock.querySelector("[data-close]").onclick = () => { ui.dockOpen = false; renderDock(); renderHeader(); };
        dock.querySelectorAll("[data-page]").forEach(d => d.onclick = () => { ui.dockPage = +d.dataset.page; renderDock(); });
        dock.querySelectorAll("[data-keep]").forEach(b => b.onclick = (e) => {
            e.stopPropagation();
            const r = ui.results && ui.results[+b.dataset.keep];
            if (r) r.keep = !r.keep;
            renderDock();
        });
        const rejBtn = dock.querySelector("[data-reshootrej]");
        if (rejBtn) rejBtn.onclick = async () => {
            const rej = (ui.results || []).map((r, i) => (r.keep ? -1 : i)).filter(i => i >= 0);
            if (!rej.length) return;
            for (const i of rej) {
                state.session.reshoot_shot = i + 1;   // 1-based, 0 = off
                writeState(node, state);
                const pid = await queueShoot();
                if (pid) watchShoot(pid, i, true);
            }
            state.session.reshoot_shot = 0;           // the next START SHOOT renders the whole session
            writeState(node, state);
            renderHeader();
        };
        dock.querySelectorAll(".plx-tile.pick").forEach(t => t.onclick = () => {
            state.session.reshoot_shot = +t.dataset.t + 1;   // 1-based, 0 = off
            writeState(node, state);
            renderHeader();
            startShoot();
        });
    }

    // ---- START SHOOT ---------------------------------------------------
    // queueShoot: one queued prompt; watchShoot: poll it and lay the frames
    // down. A full shoot rebuilds the results wall; a re-shoot (slot >= 0)
    // swaps the fresh frame into that slot, so the wall survives the pick
    async function queueShoot() {
        writeState(node, state);
        let p;
        try { p = await app.graphToPrompt(); }
        catch (e) { console.warn("PerfectLab: graphToPrompt failed", e); return null; }
        // the workflow rides in extra_data.extra_pnginfo -- SaveImage copies
        // it into the PNG, so dragging the rendered file back onto the
        // canvas restores this node with its whole panel state
        const body = JSON.stringify({ prompt: p.output,
            extra_data: { extra_pnginfo: { workflow: p.workflow } },
            client_id: "plx-" + uid() });
        const r = await fetch("/prompt", { method: "POST",
            headers: { "Content-Type": "application/json" }, body });
        const { prompt_id, error } = await r.json().catch(() => ({}));
        if (!prompt_id) { console.warn("PerfectLab: queue failed", error); return null; }
        return prompt_id;
    }
    function watchShoot(prompt_id, slot, keepDockOpen) {
        // the dock may still be hidden with no bar built -- the label writes
        // must survive that
        const setLabel = (t) => {
            const l = dock.querySelector(".plx-dock-label");
            if (l) l.textContent = t;
        };
        setLabel(tr("SHOOTING…"));
        const t0 = Date.now();
        const poll = async () => {
            let hist;
            try { hist = await (await fetch("/history/" + prompt_id)).json(); }
            catch (e) { return setTimeout(poll, 1000); }
            const h = hist[prompt_id];
            if (!h) return setTimeout(poll, 800);
            const imgs = [];
            for (const out of Object.values(h.outputs || {}))
                for (const im of out.images || [])
                    imgs.push(`/view?filename=${encodeURIComponent(im.filename)}&subfolder=${encodeURIComponent(im.subfolder || "")}&type=${im.type || "output"}`);
            if (slot >= 0 && ui.results && ui.results[slot]) {
                // a re-shot frame lands in its own slot; the star resets,
                // the fresh take earns its own judgement
                ui.results[slot] = { src: imgs[0] || ui.results[slot].src, keep: false };
                ui.dockPage = Math.floor(slot / 8);   // show the fresh frame
            } else {
                ui.results = imgs.map(src => ({ src, keep: false }));
                ui.dockPage = 0;
                ui.dockOpen = keepDockOpen;   // full shoots: open via the header button
            }
            renderHeader();
            renderDock();          // builds the bar first, then the label
            setLabel(`${tr("SHOT")} ${(slot >= 0 ? 1 : imgs.length)} · ${Math.round((Date.now() - t0) / 1000)}${LANG === "ru" ? " с" : "s"}`);
        };
        poll();
    }
    async function startShoot() {
        // a re-shoot order rode along in the queued prompt -- drop it after
        // the queue so the next START SHOOT renders the whole session
        const slot = (+state.session.reshoot_shot || 0) - 1;
        const keepDockOpen = slot >= 0;
        const pid = await queueShoot();
        if (slot >= 0) {
            state.session.reshoot_shot = 0;
            writeState(node, state);
        }
        if (pid) watchShoot(pid, slot, keepDockOpen);
    }

    // ---- library search: every list on one type ------------------------
    const searchOverlay = document.createElement("div");
    searchOverlay.className = "plx-searchbox";
    searchOverlay.style.display = "none";
    el.appendChild(searchOverlay);
    // the linter's issue list rides the same overlay style
    const lintOverlay = document.createElement("div");
    lintOverlay.className = "plx-searchbox plx-lintbox";
    lintOverlay.style.display = "none";
    el.appendChild(lintOverlay);
    document.addEventListener("mousedown", (e) => {
        if (!lintOverlay.contains(e.target)) lintOverlay.style.display = "none";
    }, true);
    const SEARCH_INDEX = searchIndex();
    function hideSearch() { searchOverlay.style.display = "none"; }
    function renderSearch(q) {
        q = (q || "").trim().toLowerCase();
        if (q.length < 2) { hideSearch(); return; }
        // match against the English value and its RU caption alike
        const hits = SEARCH_INDEX.filter(r => r.label.toLowerCase().includes(q)
            || disp(r.label).toLowerCase().includes(q)).slice(0, 24);
        if (!hits.length) { hideSearch(); return; }
        searchOverlay.innerHTML = hits.map(r => `
            <div class="plx-sr" data-sr='${esc(JSON.stringify(r))}'>
                ${r.cat ? `<img draggable="false" src="${itemImg(r.cat, r.idx)}">`
                        : `<span class="plx-pick-letter">${esc(r.label.slice(0, 2).toUpperCase())}</span>`}
                <span>${esc(disp(r.label))}</span>
                <span class="plx-sr-sec">${r.sec} · ${r.sub}</span>
            </div>`).join("");
        searchOverlay.style.display = "";
        searchOverlay.querySelectorAll("[data-sr]").forEach(rowEl => rowEl.onclick = () => {
            const r = JSON.parse(rowEl.dataset.sr);
            hideSearch();
            ui.section = r.sec;
            ui.sub = r.sub;
            if (r.sec === "persona") ui.personaField = r.sub;
            renderCenter(); renderRail();
            setTimeout(() => {
                const chip = [...document.querySelectorAll(".plx-center .plx-chip, .plx-center .plp-chip")]
                    .find(c => c.dataset.val === r.label
                        || (c.querySelector("span")?.textContent.trim() || "") === r.label
                        || (c.querySelector("span")?.textContent.trim() || "") === disp(r.label));
                if (chip) chip.click();
            }, 80);
        });
    }
    document.addEventListener("mousedown", (e) => {
        if (!searchOverlay.contains(e.target) && e.target?.dataset?.search === undefined) hideSearch();
    }, true);

    // ---- shoot a preview tile for a custom wardrobe entry ---------------
    // one catalog-style frame through the CURRENT graph (your models, your
    // LoRAs), cropped 240x240 and stored beside the attach-a-photo flow,
    // so the entry's chip shows a real tile in the LIBRARY row.
    async function shootTile(scope, entry) {
        libAdd(scope, entry);
        const cur = JSON.stringify(state);
        const tileState = JSON.parse(cur);
        Object.assign(tileState, {
            negative: { enabled: false, text: "", presets: [] },
            persona: { trigger: "", fields: {} },
            look: { looks: [{ name: "tile" }] },
            scene: { location: "", weather: "", details: "" },
            light: { setup: "", hour: -1 },
            style: { grade: "", film: "", palette: "" },
            pose: { poses: { mode: "all", set: [], pin: null } },
            expression: { arc: "", expressions: { mode: "all", set: [], pin: null } },
            camera: { framings: { mode: "all", set: [], pin: null },
                      focus: { mode: "all", set: [], pin: null },
                      formats: { mode: "pin", set: [], pin: 0 },
                      framing_order: "", lens: "" },
            shot: { main_prompt: "A clean catalog photograph demonstrating: " + entry +
                    ", photorealistic, plain warm light-grey seamless backdrop, the subject alone" +
                    " centered and filling the frame, bright even light, no text, no watermark",
                    custom: "", style_mode: "natural" },
            session: { count: 1, takes: 1, mood_subject: true, takes_arc: false,
                       pose_arc: false, place_arc: false, crop_arc: false, focus_arc: false,
                       look_rotation: "blocks", reshoot_shot: 0,
                       model_profile: "z_image", token_budget: 400, template: "",
                       token_limit: "Z-Image / Turbo · 400" }
        });
        writeState(node, tileState);
        let p;
        try { p = await app.graphToPrompt(); }
        catch (e) { console.warn("PerfectLab: tile graphToPrompt failed", e); writeState(node, JSON.parse(cur)); return; }
        writeState(node, JSON.parse(cur));
        const r = await fetch("/prompt", { method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ prompt: p.output,
                extra_data: { extra_pnginfo: { workflow: p.workflow } },
                client_id: "plx-" + uid() }) });
        const { prompt_id } = await r.json().catch(() => ({}));
        if (!prompt_id) return;
        const poll = async () => {
            let hist;
            try { hist = await (await fetch("/history/" + prompt_id)).json(); }
            catch (e) { return setTimeout(poll, 1000); }
            const h = hist[prompt_id];
            if (!h) return setTimeout(poll, 800);
            let url = null;
            for (const out of Object.values(h.outputs || {}))
                for (const im of out.images || []) {
                    url = "/view?filename=" + encodeURIComponent(im.filename) +
                        "&subfolder=" + encodeURIComponent(im.subfolder || "") +
                        "&type=" + (im.type || "output");
                    break;
                }
            if (!url) return;
            const img = new Image();
            img.crossOrigin = "anonymous";
            img.onload = async () => {
                const S = 240, m = Math.min(img.width, img.height);
                const c = document.createElement("canvas");
                c.width = S; c.height = S;
                c.getContext("2d").drawImage(img, (img.width - m) / 2, (img.height - m) / 2, m, m, 0, 0, S, S);
                c.toBlob(async (blob) => {
                    if (blob && await libImgPut(scope, entry, blob)) renderCenter();
                }, "image/jpeg", 0.88);
            };
            img.src = url;
        };
        poll();
    }

    renderAll();
    wcRerender = renderRight;

    const onConfigure = node.onConfigure;
    node.onConfigure = function () {
        const r = onConfigure ? onConfigure.apply(this, arguments) : undefined;
        Object.assign(state, readState(this));
        renderAll();
        requestAnimationFrame(syncSize);
        return r;
    };
    node._plxState = state;
}

app.registerExtension({
    name: "PerfectLab.Studio",
    async beforeRegisterNodeDef(nodeType, nodeData) {
        if (nodeData.name !== "PerfectLabStudio") return;
        const onNodeCreated = nodeType.prototype.onNodeCreated;
        nodeType.prototype.onNodeCreated = function () {
            const r = onNodeCreated ? onNodeCreated.apply(this, arguments) : undefined;
            buildPanel(this);
            return r;
        };
        // the DOM panel leads the widget list, so LiteGraph's positional
        // value assignment feeds it the first saved value and shifts the
        // real widgets -- re-assign from the raw array ourselves, skipping
        // the panel and tolerating both forms (placeholder present or not)
        const onConfigure = nodeType.prototype.onConfigure;
        nodeType.prototype.onConfigure = function (info) {
            const r = onConfigure ? onConfigure.apply(this, arguments) : undefined;
            const values = info && info.widgets_values;
            if (Array.isArray(values)) {
                const names = ["node_data", "mode", "seed", "control_after_generate", "variations"];
                const v = (values.length === names.length + 1) ? values.slice(1) : values;
                names.forEach((n, i) => {
                    const w = (this.widgets || []).find(x => x.name === n);
                    if (w && v[i] !== undefined) w.value = v[i];
                });
            }
            return r;
        };
    },
});
