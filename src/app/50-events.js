/* ================= Navigation ================= */
function go(v, p) {
  const cur = state.stack[state.stack.length - 1];
  cur.scroll = window.scrollY; cur.snap = $("view").innerHTML; cur.snapCls = $("view").className.replace(/\benter\b/, "").trim();
  state.stack.push({ v, p }); state.enter = true; state.sel = null; state.armed = null; state.showAll = false;
  if (v === "lang") lsSet("plm.lastLang", p);
  render(); window.scrollTo(0, 0);
}
function goBack() {
  if (state.stack.length < 2) return;
  state.stack.pop();
  const top = state.stack[state.stack.length - 1];
  state.sel = null; state.armed = null; state.showAll = false;
  if (top.v !== "cards") state.listFilter = "all";
  render(); window.scrollTo(0, top.scroll || 0);
}
const topView = () => state.stack[state.stack.length - 1];
function viewLangCode() {
  const t = topView();
  if (t.v === "cards" || t.v === "deck") return t.p.lang;
  if (t.v === "verb") return (cardById(t.p) || {}).lang;
  if (t.p && typeof t.p === "object" && t.p.lang) return t.p.lang;
  return typeof t.p === "string" ? t.p : curLangCode();
}
const studyLang = () => { const S = state.study, e = S && S.queue[0]; return e ? e.lang : viewLangCode(); };
function parseP(a) { const raw = a.dataset.p; if (raw == null) return undefined; try { return raw.startsWith("{") ? JSON.parse(raw) : raw; } catch { return raw; } }
function pickLang(title, cb) {
  if (langs().length === 1) { cb(langs()[0].code); return; }
  openForm({ title, fields: [{ k: "lang", label: T("Sprache"), type: "select", opts: langs().map((l) => [l.code, lname(l)]) }], values: { lang: curLangCode() }, saveLabel: T("Weiter"), onSave: (v) => setTimeout(() => cb(v.lang), 260) });
}

function openStarterFirst() {
  const opts = [];
  for (const L of langs()) for (const p of STARTER[L.code] || []) opts.push([`${L.code}:${p.id}`, `${lname(L)}: ${dn(p.name)}`]);
  if (!opts.length) { go("lang", langs()[0].code); return; }
  const def = opts.filter(([k]) => !/alltag|everyday|frasi|phrasal|false/.test(k)).map(([k]) => k);
  openForm({ title: T("Starter-Pakete"), hint: T("Jedes Paket wird ein Projekt. PLM zeigt dir jeden Tag nur ein paar neue Karten (15 pro Sprache, einstellbar). Weitere Pakete kannst du jederzeit nachladen."), saveLabel: T("Laden"),
    fields: [{ k: "packs", label: T("Pakete"), type: "chips", opts }], values: { packs: def },
    validate: (v) => (!v.packs.length ? T("Wähle mindestens ein Paket.") : ""),
    onSave: (v) => { let n = 0; for (const k of v.packs) { const [code, id] = k.split(":"); n += loadPack(code, id).added; } render(); toast(T("{0} geladen – los geht's!", [plural(n, T("Karte"), T("Karten"))])); } });
}
function packToast(r) {
  const parts = [];
  if (r.added) parts.push(`${plural(r.added, T("Karte"), T("Karten"))} geladen`);
  if (r.adopted) parts.push(T("{0} aus anderen Projekten übernommen", [num(r.adopted)]));
  if (r.skipped) parts.push(T("{0} schon vorhanden", [num(r.skipped)]));
  toast(parts.join(" · ") || T("Alle Karten waren schon da"));
}

/* ================= Clicks ================= */
document.addEventListener("click", (ev) => {
  if (ev.target.closest("[data-close]")) { closeSheetsAnimated(); return; }
  const a = ev.target.closest("[data-action]");
  if (!a || a.tagName === "SELECT" || (a.tagName === "INPUT" && a.type !== "button") || a.disabled) return;
  const arg = a.dataset.arg, act = a.dataset.action, S = state.study, top = topView();
  switch (act) {
    case "back": goBack(); break;
    case "nav": go(arg, parseP(a)); break;
    case "lang": go("lang", arg); break;
    case "deck": go("deck", { lang: top.p, deck: arg }); break;
    case "topic": state.listFilter = "all"; go("cards", { lang: top.p.lang, deck: top.p.deck, topic: arg }); break;
    case "deck-cards": state.listFilter = "all"; go("cards", { lang: top.p.lang, deck: top.p.deck }); break;
    case "cards": state.listFilter = "all"; go("cards", { lang: top.p }); break;
    case "cards-hard": state.listFilter = "hard"; go("cards", { lang: arg, hard: true }); break;
    case "card":
      if (state.sel) { state.sel.ids.has(arg) ? state.sel.ids.delete(arg) : state.sel.ids.add(arg); state.sel.armed = false; render(); }
      else openCard(cardById(arg));
      break;
    case "verb": go("verb", arg); break;
    case "add": openCard(null); break;
    case "add-verb": openCard(null, { type: "verb", lang: top.p }); break;
    case "add-from-search": openCard(null, { tg: state.q.text.trim() }); break;
    case "add-lang": openLangChooser(); break;
    case "lang-add": addLang(arg); break;
    case "lang-settings": openLangSettings(arg); break;
    case "learn": startLearn({ lang: arg || null }); break;
    case "learn-more": startLearn({ lang: arg, extraNew: 10 }); break;
    case "learn-deck": startLearn({ lang: top.p.lang, deck: top.p.deck }); break;
    case "learn-deck-more": startLearn({ lang: top.p.lang, deck: top.p.deck, extraNew: 10 }); break;
    case "learn-scope": startLearn({ lang: top.p.lang, deck: top.p.deck, topic: top.p.topic }); break;
    case "practice": openPractice({ lang: arg || null }); break;
    case "practice-deck": openPractice({ lang: top.p.lang, deck: top.p.deck }); break;
    case "practice-scope": openPractice({ lang: top.p.lang, ids: state.scopeIds && state.scopeIds.length ? state.scopeIds.slice() : null }); break;
    case "test-deck": openTest(top.p.lang, top.p.deck); break;
    case "build": openBuild(arg); break;
    case "build-deck": openBuild(top.p.lang, top.p.deck); break;
    case "build-any": openBuild(null); break;
    case "drill": openDrill(arg); break;
    case "drill-any": openDrill(null); break;
    case "theory-any": { const ls = theoryLangs(); if (!ls.length) { toast(T("Für deine Sprachen gibt es noch keine Theorie")); break; } const cur = ls.find((l) => l.code === curLangCode()) || ls[0]; go("theory", cur.code); break; }
    case "newwords-any": pickLang(T("Neue Wörter"), (code) => go("newwords", code)); break;
    case "th-say": speak(arg, a.dataset.p || viewLangCode()); break;
    case "th-lang": { if (top.v === "theory") top.p = arg; else if (top.p && typeof top.p === "object") top.p = { lang: arg }; render(); break; }
    case "th-goto": top.p = { ...top.p, id: arg }; render(); window.scrollTo(0, 0); break;
    case "th-verb": top.p = { ...(top.p || {}), verb: arg }; render(); break;
    case "quiz-start": startQuiz(arg); break;
    case "quiz-choose": quizAnswer({ chose: Number(arg) }); break;
    case "quiz-check": quizAnswer({ typed: ($("quizIn") || {}).value }); break;
    case "quiz-skip": quizAnswer({ typed: "" }); break;
    case "quiz-next": if (state.quiz) { state.quiz.i++; state.quiz.res = null; renderQuiz(); } break;
    case "quiz-again": { const id = state.quiz && state.quiz.id; closeQuiz(); if (id) startQuiz(id); break; }
    case "quiz-close": closeQuiz(); break;
    case "nw-learn": if (!startLearn({ lang: arg })) toast(T("Für heute ist nichts mehr fällig")); break;
    case "nw-preview": startPractice({ lang: arg, sel: "new", count: 30 }); break;
    case "import-any": pickLang(T("Importieren"), (code) => go("import", code)); break;
    case "deck-rename": renameDeck(top.p.lang, top.p.deck); break;
    case "deck-delete":
      if (state.armed !== "deck") { state.armed = "deck"; render(); break; }
      state.armed = null; deleteCards(state.cards.filter((c) => c.lang === top.p.lang && c.deck === top.p.deck).map((c) => c.id)); goBack(); break;
    case "starter-first": openStarterFirst(); break;
    case "mode": state.settings.mode = arg; save(false); render(); break;
    case "chartmode": state.chart = arg; render(); break;
    case "statrange": state.statRange = Number(arg); render(); break;
    case "listfilter": state.listFilter = arg; state.showAll = false; render(); break;
    case "show-all": state.showAll = true; render(); break;
    case "sel-start": state.sel = { ids: new Set(), armed: false }; render(); break;
    case "sel-cancel": state.sel = null; render(); break;
    case "sel-all": { const pool = state.scopeIds || []; const all = pool.length && pool.every((id) => state.sel.ids.has(id)); state.sel.ids = all ? new Set() : new Set(pool); state.sel.armed = false; render(); break; }
    case "tense-toggle": { const L = langOf(top.p); if (!L) break; L.active = L.active.includes(arg) ? L.active.filter((x) => x !== arg) : L.tenses.map((t) => t.n).filter((n) => n === arg || L.active.includes(n)); touchSettings(); render(); break; }
    case "speak": speak(arg, viewLangCode()); break;
    case "speak-table": { const c = cardById(top.p), L = c && langOf(c.lang); if (!c) break; const t = L.tenses.find((x) => x.n === arg) || {}, labels = tenseLabels(L, t); speak(c.tables[arg].map((f, i) => (t.given ? f : `${(labels[i] || "").split("/")[0]} ${f}`)).join(", "), c.lang); break; }
    case "say": speak(arg, studyLang()); break;
    case "say-slow": speak(arg, studyLang(), { slow: true }); break;
    case "voice-test": speak(arg === "it" ? "Ciao! Come stai? Oggi studiamo un po' d'italiano." : arg === "en" ? "Hello! How are you? Let's practise some English today." : (cardsOf(arg)[0] || {}).tg || langName(arg), arg); break;
    case "voice-try": { const sel = $("fs-voice"), L = langOf(arg); if (L && sel) { const old = L.voice; L.voice = sel.value; speak(arg === "it" ? "Buongiorno, piacere di conoscerti!" : arg === "en" ? "Good morning, nice to meet you!" : (cardsOf(arg)[0] || {}).tg || lname(L), arg); L.voice = old; } break; }
    case "mic": micStart(arg); break;
    case "pack-load": { const r = loadPack(top.p, arg); render(); packToast(r); break; }
    case "pack-remove": {
      if (state.armed !== "pack:" + arg) { state.armed = "pack:" + arg; render(); break; }
      const p = (STARTER[top.p] || []).find((x) => x.id === arg);
      state.armed = null; deleteCards(state.cards.filter((c) => c.lang === top.p && (c.pack === arg || (p && c.deck === p.name))).map((c) => c.id)); render(); break;
    }
    case "q-clear": state.q.text = ""; render(); { const i = $("q"); if (i) i.focus(); } break;
    case "q-lang": state.q.lang = arg; render(); break;
    /* import */
    case "imp-parse": impParse(($("impText") || {}).value || ""); break;
    case "imp-swap": { const m = state.imp.map; [m.tg, m.de] = [m.de, m.tg]; render(); break; }
    case "imp-run": impRun(); break;
    case "imp-ai": lsSet("plm.useAi", arg); render(); break;
    case "imp-item": { const it = state.imp2 && state.imp2.items.find((x) => x.key === arg); if (it) { if (!it.de && it.type !== "cloze" && !it.sel) { editImpItem(arg); break; } it.sel = !it.sel; render(); } break; }
    case "imp-edit": ev.stopPropagation(); editImpItem(arg); break;
    case "imp-all": state.imp2.items.forEach((x) => { x.sel = !!(x.de || x.type === "cloze"); }); render(); break;
    case "imp-none": state.imp2.items.forEach((x) => { x.sel = false; }); render(); break;
    case "imp-topic": { const list = state.imp2.items.filter((x) => (x.topic || "") === arg), on = !list.every((x) => x.sel); list.forEach((x) => { x.sel = on && !!(x.de || x.type === "cloze"); }); render(); break; }
    case "imp-swap2": state.imp2.items.forEach((x) => { if (x.type === "word" && x.de) { [x.tg, x.de] = [x.de, x.tg]; x.ml = ""; } }); render(); break;
    case "imp-aifill": impAiFill(); break;
    case "imp-commit": impCommit(); break;
    /* settings */
    case "export-json": exportJson(); break;
    case "export-csv": exportCsv(); break;
    case "ics": downloadIcs(); break;
    case "sync-connect": syncConnect(($("syncToken") || {}).value); break;
    case "sync-now": syncNow(true); updateSyncLine(); break;
    case "sync-off": if (state.armed !== "sync-off") { state.armed = "sync-off"; render(); break; } syncDisconnect(); break;
    case "ui-lang": if (arg !== UI) { state.settings.ui = arg; touchSettings(); saveNow(); lsSet("plm.ui", arg); location.reload(); } break;
    case "ai-save": { const k = (($("aiKey") || {}).value || "").trim(); if (!/^sk-ant-[A-Za-z0-9_-]{20,}$/.test(k)) { toast(T("Das sieht nicht wie ein Claude-API-Schlüssel aus (beginnt mit sk-ant-)")); break; } lsSet(KEYS.ai, JSON.stringify({ ...aiCfg(), key: k })); render(); aiTest(); break; }
    case "ai-test": aiTest(); break;
    case "ai-off": if (state.armed !== "ai-off") { state.armed = "ai-off"; render(); break; } state.armed = null; lsSet(KEYS.ai, "{}"); render(); toast(T("Schlüssel entfernt")); break;
    case "sync-line": syncNow(true); break;
    case "wipe": {
      if (state.armed !== "wipe") { state.armed = "wipe"; render(); break; }
      const ts = nowTs(); for (const c of state.cards) state.tomb[c.id] = ts;
      state.armed = null; state.cards = []; state.stats = {}; state.tests = {}; reindex(); saveNow(); syncSoon(500); state.stack = [{ v: "hub" }]; render(); toast(T("Alles gelöscht")); break;
    }
    /* study */
    case "study-close": closeStudy(); break;
    case "study-undo": undoStudy(); break;
    case "study-reveal": if (S && S.stage === "ask") reveal(); break;
    case "study-check": checkTyped(); break;
    case "study-dunno": if (S && S.stage === "ask") dunno(); break;
    case "study-choose": if (S && S.stage === "ask") chooseOption(Number(arg)); break;
    case "study-grade": grade(Number(arg)); break;
    case "study-override": grade(3, true); break;
    case "study-edit": { const e = S && S.queue[0]; if (e) openCard(cardById(e.id)); break; }
    case "study-again": startLearn(S.o); break;
    case "study-more": startLearn({ ...S.o, extraNew: 10 }); break;
    case "study-repeat": { const k = S.kind, o = S.o; if (k === "drill") startDrill(o); else if (k === "test") startTest(o); else if (k === "build") startBuild(o); else startPractice(o); break; }
    case "study-mistakes": { const ids = [...S.wrongIds]; if (S.kind === "build") startBuild({ ...S.o, count: ids.length }); else startPractice({ ids, count: ids.length, sel: "random" }); break; }
    case "intro-flip": introFlip(); break;
    case "intro-known": introDone(true); break;
    case "intro-next": introDone(false); break;
    case "tile-in": { const e = S && S.queue[0], i = Number(arg); if (e && e.tiles && !e.picked.includes(i)) { e.picked.push(i); renderStudy(); } break; }
    case "tile-out": { const e = S && S.queue[0]; if (e && e.picked) { e.picked.splice(Number(arg), 1); renderStudy(); } break; }
    case "ai-check": aiCheckCurrent(); break;
  }
});

/* ================= Form controls ================= */
document.addEventListener("change", (ev) => {
  const t = ev.target, id = t.id, act = t.dataset.action;
  if (id === "backupFile") return importBackup(t);
  if (id === "impFile") {
    const f = t.files && t.files[0]; t.value = "";
    if (f) f.arrayBuffer().then((b) => impParse(decodeBytes(b))).catch(() => toast(T("Datei konnte nicht gelesen werden")));
    return;
  }
  if (id === "impPhoto" || id === "impPdf") {
    const files = [...(t.files || [])]; t.value = "";
    const code = topView().p, useAi = aiOn() && lsGet("plm.useAi") !== "0";
    if (files.length) runImport(id === "impPdf" ? "pdf" : "photo", files, code, useAi);
    return;
  }
  if (id === "impDeck" && state.imp2) { state.imp2.deck = t.value.trim(); return; }
  if (id === "impDeckL" && state.imp) { state.imp.deck = t.value.trim(); return; }
  if (id === "cLang") { readTables(); const d = curDeck(t.value); fillDecks(t.value, d); fillTopics(t.value, d, ""); syncCardForm(); return; }
  if (id === "cDeck") { $("cNewDeck").hidden = t.value !== "__new"; if (t.value === "__new") $("cNewDeckName").focus(); else fillTopics($("cLang").value, t.value, ""); return; }
  if (id === "cTopic") { $("cNewTopic").hidden = t.value !== "__new"; if (t.value === "__new") $("cNewTopicName").focus(); return; }
  if (t.name === "cpos") { state.cPos = t.value; return; }
  if (act === "setting") {
    const S = state.settings;
    if (id === "setRet") S.ret = Number(t.value);
    else if (id === "setMax") S.maxReviews = Number(t.value);
    else if (id === "setRoll") S.roll = Number(t.value);
    else if (id === "setIntro") S.intro = t.checked;
    else if (id === "setSpeak") S.autoSpeak = t.checked;
    else if (id === "setRate") { S.rate = Number(t.value); speak(langs()[0] && langs()[0].code === "it" ? "Piacere!" : "Nice to meet you!", langs()[0] ? langs()[0].code : "en"); }
    else if (id === "setBadge") { setBadgeSetting(t.checked); return; }
    else if (id === "setOpen") { lsSet(KEYS.open, t.value); toast(T("Gespeichert")); return; }
    else if (id === "setAiModel") { lsSet(KEYS.ai, JSON.stringify({ ...aiCfg(), model: t.value })); toast(T("Gespeichert")); return; }
    touchSettings(); toast(T("Gespeichert")); return;
  }
  if (id === "setRemind") { state.settings.remind = t.value; save(false); return; }
  if (act === "impmap" && state.imp) { state.imp.map[t.dataset.field] = Number(t.value); render(); return; }
  if (act === "imp-header" && state.imp) { state.imp.header = t.checked; render(); return; }
  if (id === "impTopic" && state.imp) { state.imp.topic = t.value.trim(); render(); return; }
});
let qTimer = 0;
document.addEventListener("input", (ev) => {
  const t = ev.target;
  if (t.id === "q") {
    state.q.text = t.value; clearTimeout(qTimer);
    qTimer = setTimeout(() => { const r = $("qRes"); if (r) { r.innerHTML = searchBody(); $("qClear").hidden = !state.q.text; } }, 120);
  }
  if (t.id === "impText" && state.imp) state.imp.text = t.value;
  if (t.id === "cTg" && state.cType === "verb") $("cIscWrap").hidden = !/ire$/.test(normAns(t.value));
});
document.addEventListener("keydown", (e) => { if (e.key === "Enter" && e.target && e.target.id === "q") e.target.blur(); });
document.addEventListener("keydown", (e) => { if (e.key === "Escape" && sheetOpen()) closeSheetsAnimated(); });

$("backdrop").addEventListener("click", closeSheetsAnimated);
$("addBtn").addEventListener("click", () => openCard(null));
$("ctWord").addEventListener("click", () => { readTables(); state.cType = "word"; syncCardForm(); });
$("ctVerb").addEventListener("click", () => { readTables(); state.cType = "verb"; syncCardForm(); });
$("ctCloze").addEventListener("click", () => { readTables(); state.cType = "cloze"; syncCardForm(); });
$("cAuxAvere").addEventListener("click", () => { state.cAux = "avere"; syncAuxBtns(); });
$("cAuxEssere").addEventListener("click", () => { state.cAux = "essere"; syncAuxBtns(); });
function syncAuxBtns() { $("cAuxAvere").setAttribute("aria-pressed", String(state.cAux === "avere")); $("cAuxEssere").setAttribute("aria-pressed", String(state.cAux === "essere")); }
$("cFill").addEventListener("click", autoFill);
$("cNewTopicAdd").addEventListener("click", () => {
  const name = $("cNewTopicName").value.trim().slice(0, 40); if (!name) return;
  fillTopics($("cLang").value, $("cDeck").value === "__new" ? $("cNewDeckName").value.trim() : $("cDeck").value, name);
});
$("cNewDeckAdd").addEventListener("click", () => {
  const name = $("cNewDeckName").value.trim().slice(0, 40); if (!name) return;
  fillDecks($("cLang").value, name); fillTopics($("cLang").value, name, "");
});
$("cardForm").addEventListener("submit", (ev) => { ev.preventDefault(); saveCard(false); });
$("cSaveNext").addEventListener("click", () => saveCard(true));
$("cDelete").addEventListener("click", () => {
  const b = $("cDelete");
  if (state.armed !== "card-del") { state.armed = "card-del"; b.classList.add("armed"); b.textContent = T("Wirklich löschen?"); return; }
  const id = state.editing; closeSheets();
  deleteCards([id]);
  if (state.study) { state.study.queue = state.study.queue.filter((e) => e.id !== id); showEntry(); return; }
  if (topView().v === "verb" && topView().p === id) goBack(); else render();
});
$("cSusp").addEventListener("click", () => {
  const c = cardById(state.editing); if (!c) return;
  c.susp = !c.susp; if (!c.susp) delete c.susp; c.updated = nowTs(); save(); closeSheets();
  toast(c.susp ? T("Pausiert – wird nicht mehr abgefragt") : T("Wird wieder abgefragt"));
  if (state.study) { if (c.susp) state.study.queue = state.study.queue.filter((e) => e.id !== c.id); showEntry(); } else render();
});
$("cReset").addEventListener("click", () => {
  const b = $("cReset"), c = cardById(state.editing); if (!c) return;
  if (state.armed !== "card-reset") { state.armed = "card-reset"; b.classList.add("armed"); b.textContent = T("Wirklich zurücksetzen?"); return; }
  const ts = nowTs(); c.srs = {}; c.updated = ts; c.resetAt = ts;
  save(); closeSheets(); toast(T("Karte gilt wieder als neu")); state.study ? renderStudy() : render();
});
$("selTopic").addEventListener("click", () => { if (state.sel && state.sel.ids.size) openTopicPicker([...state.sel.ids]); });
$("selSusp").addEventListener("click", () => {
  if (!state.sel || !state.sel.ids.size) return;
  const list = state.cards.filter((c) => state.sel.ids.has(c.id)), allSusp = list.every((c) => c.susp), ts = nowTs();
  list.forEach((c) => { if (allSusp) delete c.susp; else c.susp = true; c.updated = ts; });
  save(); state.sel = null; render(); toast(allSusp ? `${plural(list.length, T("Karte"), T("Karten"))} fortgesetzt` : `${plural(list.length, T("Karte"), T("Karten"))} pausiert`);
});
$("selDelete").addEventListener("click", () => {
  if (!state.sel || !state.sel.ids.size) return;
  if (!state.sel.armed) { state.sel.armed = true; render(); return; }
  const ids = [...state.sel.ids]; state.sel = null; deleteCards(ids); render();
});

/* ================= Gestures ================= */
const easeOut = "cubic-bezier(.2,.7,.3,1)";
const vel = (g) => { const n = g.samples.length; if (n < 2) return 0; const a = g.samples[Math.max(0, n - 5)], b = g.samples[n - 1]; return (b.p - a.p) / Math.max(1, b.t - a.t); };
const sample = (g, p) => { g.samples.push({ p, t: performance.now() }); if (g.samples.length > 8) g.samples.shift(); };
let gest = null, gRaf = 0;
const frame = (fn) => { if (!gRaf) gRaf = requestAnimationFrame(() => { gRaf = 0; fn(); }); };

/* 1. Swipe from the left edge to go back – the previous page is visible underneath */
function backStart() {
  const prev = state.stack[state.stack.length - 2], u = $("under");
  u.innerHTML = prev && prev.snap ? `<div class="app" style="transform:translateY(${-(prev.scroll || 0)}px)"><main class="${esc(prev.snapCls || "view")}">${prev.snap}</main></div><div class="under-dim"></div>` : `<div class="under-dim"></div>`;
  u.hidden = false; document.body.classList.add("swiping"); $("app").classList.add("dragging");
}
function backPaint(dx) {
  const W = window.innerWidth, f = Math.min(1, dx / W), app = $("app"), u = $("under"), inner = u.firstElementChild, dim = u.lastElementChild;
  app.style.transform = `translate3d(${dx}px,0,0)`;
  if (inner && inner !== dim) inner.style.translate = `${-0.28 * W * (1 - f)}px 0`;
  dim.style.opacity = String(0.5 * (1 - f));
}
function backFinish(go2) {
  const app = $("app"), u = $("under"), W = window.innerWidth, inner = u.firstElementChild, dim = u.lastElementChild;
  app.style.transition = `transform .26s ${easeOut}`; dim.style.transition = `opacity .26s ${easeOut}`;
  if (inner && inner !== dim) inner.style.transition = `translate .26s ${easeOut}`;
  if (go2) { app.style.transform = `translate3d(${W}px,0,0)`; dim.style.opacity = "0"; if (inner && inner !== dim) inner.style.translate = "0 0"; }
  else { app.style.transform = "translate3d(0,0,0)"; dim.style.opacity = "0.5"; if (inner && inner !== dim) inner.style.translate = `${-0.28 * W}px 0`; }
  setTimeout(() => {
    if (go2) { state.enter = false; goBack(); }
    app.style.transition = "none"; app.style.transform = ""; app.classList.remove("dragging");
    u.hidden = true; u.innerHTML = ""; document.body.classList.remove("swiping");
  }, 270);
}
/* 2. Pull down on the menu to see the start screen again; swipe the start screen up to leave it */
function splashPaint(y) { $("splash").style.transform = `translate3d(0,${y}px,0)`; }
function splashShowForPull() {
  const sp = $("splash");
  sp.classList.remove("gone"); sp.classList.add("static", "dragging"); sp.style.transition = "none"; sp.style.opacity = "1";
  sp.hidden = false; splashPaint(-window.innerHeight);
}
function splashSettle(show) {
  const sp = $("splash"), H = window.innerHeight;
  sp.classList.remove("dragging"); sp.style.transition = `transform .32s ${easeOut}`;
  if (show) { splashPaint(0); splashDone = false; setTimeout(() => { sp.style.transition = ""; sp.style.transform = ""; }, 330); }
  else { splashPaint(-H); splashDone = true; setTimeout(() => { sp.hidden = true; sp.style.transition = ""; sp.style.transform = ""; sp.classList.remove("static"); afterSplash(); }, 330); }
}
/* 3. Drag a sheet down by its top (or anywhere while scrolled to the top) to close it */
function sheetPaint(g) { g.sheet.style.transform = `translate3d(0,${g.d}px,0)`; $("backdrop").style.opacity = String(1 - Math.min(0.85, g.d / (g.sheet.offsetHeight || 1))); }

document.addEventListener("touchstart", (e) => {
  gest = null;
  if (e.touches.length !== 1) return;
  const t = e.touches[0], base = { x: t.clientX, y: t.clientY, d: 0, active: false, samples: [] };
  const sh = sheetOpen();
  if (sh) {
    if (!sh.contains(e.target)) return;
    const r = sh.getBoundingClientRect(), head = t.clientY - r.top < 64;
    if (!head && (sh.scrollTop > 0 || e.target.closest("input, select, textarea, .chiprow, .chips, .pills, .formtable"))) return;
    gest = { ...base, kind: "sheet", sheet: sh, head };
    return;
  }
  if (!$("study").hidden) return;
  const sp = $("splash");
  if (!splashDone && !sp.hidden) { gest = { ...base, kind: "splashUp" }; return; }
  if (!splashDone || state.sel) return;
  if (state.stack.length >= 2 && t.clientX <= 32) { gest = { ...base, kind: "back" }; return; }
  if (state.stack.length === 1 && window.scrollY <= 0) gest = { ...base, kind: "pull" };
}, { passive: true });
document.addEventListener("touchmove", (e) => {
  const g = gest; if (!g) return;
  const t = e.touches[0], dx = t.clientX - g.x, dy = t.clientY - g.y;
  if (!g.active) {
    if (g.kind === "back") {
      if (Math.abs(dy) > 12 && Math.abs(dy) > dx) { gest = null; return; }
      if (dx < 8) return;
      g.active = true; g.x = t.clientX - 8; backStart();
    } else {
      if (Math.abs(dx) > 10 && Math.abs(dx) > Math.abs(dy)) { gest = null; return; }
      const want = g.kind === "splashUp" ? -dy : dy;
      if (want < 6) { if (want < -8) gest = null; return; }
      if (g.kind === "pull" && window.scrollY > 0) { gest = null; return; }
      if (g.kind === "sheet" && !g.head && g.sheet.scrollTop > 0) { gest = null; return; }
      g.active = true; g.y = t.clientY - 6 * Math.sign(dy);
      if (g.kind === "pull") splashShowForPull();
      if (g.kind === "splashUp") $("splash").classList.add("static", "dragging");
      if (g.kind === "sheet") { g.sheet.classList.add("dragging"); g.sheet.style.animation = "none"; g.sheet.style.transition = "none"; $("backdrop").style.transition = "none"; if (document.activeElement && g.sheet.contains(document.activeElement)) document.activeElement.blur(); }
    }
  }
  if (e.cancelable) e.preventDefault();
  if (g.kind === "back") { g.d = Math.max(0, t.clientX - g.x); sample(g, g.d); frame(() => backPaint(g.d)); }
  else if (g.kind === "pull") { g.d = Math.max(0, t.clientY - g.y); sample(g, g.d); frame(() => splashPaint(Math.min(0, g.d - window.innerHeight))); }
  else if (g.kind === "splashUp") { g.d = Math.max(0, g.y - t.clientY); sample(g, g.d); frame(() => splashPaint(-g.d)); }
  else if (g.kind === "sheet") { g.d = Math.max(0, t.clientY - g.y); sample(g, g.d); frame(() => sheetPaint(g)); }
}, { passive: false });
function gestEnd(cancel) {
  const g = gest; gest = null;
  if (!g || !g.active) return;
  cancelAnimationFrame(gRaf); gRaf = 0;
  const v = cancel ? 0 : vel(g), W = window.innerWidth, H = window.innerHeight;
  if (g.kind === "back") { backPaint(g.d); backFinish(!cancel && (g.d > W * 0.35 || (v > 0.45 && g.d > 30))); }
  else if (g.kind === "pull") { splashPaint(Math.min(0, g.d - H)); splashSettle(!cancel && (g.d > H * 0.25 || (v > 0.5 && g.d > 50))); }
  else if (g.kind === "splashUp") { splashPaint(-g.d); splashSettle(!(!cancel && (g.d > H * 0.2 || (v > 0.5 && g.d > 40)))); }
  else if (g.kind === "sheet") {
    const sh = g.sheet; sh.classList.remove("dragging");
    if (!cancel && (g.d > Math.min(160, sh.offsetHeight * 0.3) || (v > 0.5 && g.d > 40))) dismissSheet(sh, g.d);
    else { sh.style.transition = `transform .24s ${easeOut}`; sh.style.transform = "translate3d(0,0,0)"; $("backdrop").style.transition = "opacity .24s"; $("backdrop").style.opacity = "1"; setTimeout(() => { sh.style.transition = ""; }, 260); }
  }
}
document.addEventListener("touchend", () => gestEnd(false));
document.addEventListener("touchcancel", () => gestEnd(true));

/* ================= Start screen ================= */
const SPLASH_WORDS = [["ciao", "hello", "grazie", "cheers", "allora", "magari"], ["eventually", "domani", "piacere", "sustainable", "dai", "bottom line"], ["buongiorno", "deadline", "comunque", "figure out", "in bocca al lupo"], ["to be honest", "va bene", "opportunity", "pronto", "ecco", "I'm on it"], ["perché no", "follow up", "insomma", "boh", "cool", "a presto"]];
const QUOTES = {
  en: ["Sometimes I feel like giving up.", "Then I remember I have a lot of people to prove wrong."],
  it: ["A volte mi viene voglia di mollare.", "Poi mi ricordo che ci sono tante persone a cui devo dimostrare che si sbagliano."]
};
let splashDone = false;
function buildSplash() {
  $("spWords").innerHTML = SPLASH_WORDS.map((row) => { const r = row.map((w, i) => (i % 3 === 1 ? `<b>${esc(w)}</b>` : esc(w))).join(" · "); return `<div>${r} · ${r} · ${r}</div>`; }).join("");
  const codes = langs().map((l) => l.code).filter((c) => QUOTES[c]);
  const pick = codes.length ? codes[today() % codes.length] : "en", q = QUOTES[pick] || QUOTES.en;
  $("splashQuote").innerHTML = `<span>${esc(q[0])}</span><span>${esc(q[1])}</span>`;
}
function hideSplash() {
  if (splashDone) return;
  splashDone = true;
  const sp = $("splash");
  sp.style.transition = ""; sp.style.transform = ""; sp.style.opacity = "";
  sp.classList.add("gone");
  setTimeout(() => { if (!splashDone) return; sp.hidden = true; sp.classList.remove("static"); }, 650);
  afterSplash();
}
let afterSplashOnce = false;
function afterSplash() {
  if (afterSplashOnce) return; afterSplashOnce = true;
  if (openMode() === "learn" && !deepHandled && dueInfo().total) startLearn({});
}
$("splash").addEventListener("click", hideSplash);
$("splash").addEventListener("keydown", (e) => { if (["Enter", " ", "Escape"].includes(e.key)) { e.preventDefault(); hideSplash(); } });
