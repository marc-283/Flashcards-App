/* ================= Navigation ================= */
function go(v, p) {
  const cur = state.stack[state.stack.length - 1];
  cur.scroll = window.scrollY; cur.snap = $("view").innerHTML; cur.snapCls = $("view").className.replace(/\benter\b/, "").trim();
  state.stack.push({ v, p }); state.enter = true; state.sel = null; state.armed = null; state.showAll = false;
  if (v === "lang") { try { localStorage.setItem("plm.lastLang", p); } catch { /* ignore */ } }
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
const viewLangCode = () => { const t = topView(); return t.v === "cards" ? t.p.lang : t.v === "verb" ? (cardById(t.p) || {}).lang : t.p; };

function openStarterFirst() {
  const opts = [];
  for (const L of langs()) for (const p of STARTER[L.code] || []) opts.push([`${L.code}:${p.id}`, `${L.name}: ${p.name}`]);
  if (!opts.length) { go("lang", langs()[0].code); return; }
  openForm({ title: "Starter-Wortschatz", hint: "Wähle, womit du anfangen willst. PLM zeigt dir jeden Tag nur ein paar neue Karten (15 pro Sprache, einstellbar).", saveLabel: "Laden",
    fields: [{ k: "packs", label: "Pakete", type: "chips", opts }], values: { packs: opts.map(([k]) => k) },
    validate: (v) => (!v.packs.length ? "Wähle mindestens ein Paket." : ""),
    onSave: (v) => { let n = 0; for (const k of v.packs) { const [code, id] = k.split(":"); n += loadPack(code, id); } render(); toast(`${plural(n, "Karte", "Karten")} geladen – los geht's!`); } });
}

/* ================= Clicks ================= */
document.addEventListener("click", (ev) => {
  if (ev.target.closest("[data-close]")) { closeSheetsAnimated(); return; }
  const a = ev.target.closest("[data-action]");
  if (!a || a.tagName === "SELECT" || (a.tagName === "INPUT" && a.type !== "button")) return;
  const arg = a.dataset.arg, act = a.dataset.action, S = state.study;
  switch (act) {
    case "back": goBack(); break;
    case "nav": go(arg, a.dataset.p); break;
    case "lang": go("lang", arg); break;
    case "topic": state.listFilter = "all"; go("cards", { lang: topView().p, topic: arg }); break;
    case "cards": state.listFilter = "all"; go("cards", { lang: topView().p }); break;
    case "cards-hard": state.listFilter = "hard"; go("cards", { lang: arg, hard: true }); break;
    case "card":
      if (state.sel) { state.sel.ids.has(arg) ? state.sel.ids.delete(arg) : state.sel.ids.add(arg); state.sel.armed = false; render(); }
      else openCard(cardById(arg));
      break;
    case "verb": go("verb", arg); break;
    case "add": openCard(null); break;
    case "add-verb": openCard(null, { type: "verb", lang: topView().p }); break;
    case "add-from-search": openCard(null, { tg: state.q.text.trim() }); break;
    case "add-lang": openLangChooser(); break;
    case "lang-add": addLang(arg); break;
    case "lang-settings": openLangSettings(arg); break;
    case "learn": startLearn({ lang: arg || null }); break;
    case "learn-more": startLearn({ lang: arg, extraNew: 10 }); break;
    case "learn-topic": startLearn({ lang: topView().p.lang, topic: topView().p.topic }); break;
    case "practice": openPractice(arg || null); break;
    case "practice-scope": openPractice(topView().p.lang, null, state.scopeIds && state.scopeIds.length ? state.scopeIds.slice() : null); break;
    case "drill": openDrill(arg); break;
    case "drill-any": openDrill(null); break;
    case "starter-first": openStarterFirst(); break;
    case "mode": state.settings.mode = arg; save(); render(); break;
    case "chartmode": state.chart = arg; render(); break;
    case "statrange": state.statRange = Number(arg); render(); break;
    case "listfilter": state.listFilter = arg; state.showAll = false; render(); break;
    case "show-all": state.showAll = true; render(); break;
    case "sel-start": state.sel = { ids: new Set(), armed: false }; render(); break;
    case "sel-cancel": state.sel = null; render(); break;
    case "sel-all": { const pool = state.scopeIds || []; const all = pool.length && pool.every((id) => state.sel.ids.has(id)); state.sel.ids = all ? new Set() : new Set(pool); state.sel.armed = false; render(); break; }
    case "tense-toggle": { const L = langOf(topView().p); if (!L) break; L.active = L.active.includes(arg) ? L.active.filter((x) => x !== arg) : L.tenses.map((t) => t.n).filter((n) => n === arg || L.active.includes(n)); save(); render(); break; }
    case "speak": speak(arg, viewLangCode()); break;
    case "speak-table": { const c = cardById(topView().p), L = c && langOf(c.lang); if (!c) break; const t = L.tenses.find((x) => x.n === arg) || {}, labels = tenseLabels(L, t); speak(c.tables[arg].map((f, i) => (t.given ? f : `${(labels[i] || "").split("/")[0]} ${f}`)).join(", "), c.lang); break; }
    case "pack-load": { const n = loadPack(topView().p, arg); render(); toast(n ? `${plural(n, "Karte", "Karten")} geladen` : "Alle Karten waren schon da"); break; }
    case "pack-remove": {
      if (state.armed !== "pack:" + arg) { state.armed = "pack:" + arg; render(); break; }
      state.armed = null; deleteCards(state.cards.filter((c) => c.pack === arg).map((c) => c.id)); render(); break;
    }
    case "q-clear": state.q.text = ""; render(); { const i = $("q"); if (i) i.focus(); } break;
    case "q-lang": state.q.lang = arg; render(); break;
    case "imp-parse": impParse(($("impText") || {}).value || ""); break;
    case "imp-swap": { const m = state.imp.map; [m.tg, m.de] = [m.de, m.tg]; render(); break; }
    case "imp-run": impRun(); break;
    case "export-json": exportJson(); break;
    case "export-csv": exportCsv(); break;
    case "ics": downloadIcs(); break;
    case "wipe":
      if (state.armed !== "wipe") { state.armed = "wipe"; render(); break; }
      state.armed = null; state.cards = []; state.stats = {}; reindex(); saveNow(); state.stack = [{ v: "hub" }]; render(); toast("Alles gelöscht"); break;
    /* study */
    case "study-close": closeStudy(); break;
    case "study-undo": undoStudy(); break;
    case "study-reveal": if (S && S.stage === "ask") reveal(); break;
    case "study-check": checkTyped(); break;
    case "study-dunno": {
      const e = S.queue[0], c = cardById(e.id), L = langOf(c.lang);
      let n = 1;
      if (e.k === "c") n = parseCloze(c.tg).gaps.length;
      else if (e.k.startsWith("t:")) { const fc = faceOf(c, e.k, L); S.res = { parts: fc.table.forms.map((f, i) => (fc.table.given.includes(i) || !f ? null : { res: "wrong" })), sug: 1 }; S.typed = []; reveal(); break; }
      S.res = { parts: Array.from({ length: n }, () => ({ res: "wrong" })), sug: 1 }; S.typed = []; reveal(); break;
    }
    case "study-choose": if (S && S.stage === "ask") chooseOption(Number(arg)); break;
    case "study-grade": grade(Number(arg)); break;
    case "study-speak": studySpeak(); break;
    case "study-edit": { const e = S && S.queue[0]; if (e) openCard(cardById(e.id)); break; }
    case "study-again": startLearn(S.o); break;
    case "study-more": startLearn({ ...S.o, extraNew: 10 }); break;
    case "study-repeat": if (S.kind === "drill") startDrill(S.o); else startPractice(S.o); break;
    case "intro-known": introDone(true); break;
    case "intro-next": introDone(false); break;
  }
});

/* ================= Form controls ================= */
document.addEventListener("change", (ev) => {
  const t = ev.target, id = t.id, act = t.dataset.action;
  if (id === "backupFile") return importBackup(t);
  if (id === "impFile") {
    const f = t.files && t.files[0]; t.value = "";
    if (f) f.arrayBuffer().then((b) => impParse(decodeBytes(b))).catch(() => toast("Datei konnte nicht gelesen werden"));
    return;
  }
  if (id === "cLang") { readTables(); fillTopics(t.value, $("cTopic").value === "__new" ? "" : $("cTopic").value); syncCardForm(); return; }
  if (id === "cTopic") { $("cNewTopic").hidden = t.value !== "__new"; if (t.value === "__new") $("cNewTopicName").focus(); return; }
  if (t.name === "cpos") { state.cPos = t.value; return; }
  if (act === "setting") {
    const S = state.settings;
    if (id === "setRet") S.ret = Number(t.value);
    else if (id === "setMax") S.maxReviews = Number(t.value);
    else if (id === "setRoll") S.roll = Number(t.value);
    else if (id === "setIntro") S.intro = t.checked;
    else if (id === "setSpeak") S.autoSpeak = t.checked;
    else if (id === "setBadge") { setBadgeSetting(t.checked); return; }
    else if (id === "setOpen") { try { localStorage.setItem(KEYS.open, t.value); } catch { /* ignore */ } toast("Gespeichert"); return; }
    save(); toast("Gespeichert"); return;
  }
  if (id === "setRemind") { state.settings.remind = t.value; save(); return; }
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
  fillTopics($("cLang").value, name);
});
$("cardForm").addEventListener("submit", (ev) => { ev.preventDefault(); saveCard(false); });
$("cSaveNext").addEventListener("click", () => saveCard(true));
$("cDelete").addEventListener("click", () => {
  const b = $("cDelete");
  if (state.armed !== "card-del") { state.armed = "card-del"; b.classList.add("armed"); b.textContent = "Wirklich löschen?"; return; }
  const id = state.editing; closeSheets();
  deleteCards([id]);
  if (state.study) { state.study.queue = state.study.queue.filter((e) => e.id !== id); showEntry(); return; }
  if (topView().v === "verb" && topView().p === id) goBack(); else render();
});
$("cSusp").addEventListener("click", () => {
  const c = cardById(state.editing); if (!c) return;
  c.susp = !c.susp; if (!c.susp) delete c.susp; save(); closeSheets();
  toast(c.susp ? "Pausiert – wird nicht mehr abgefragt" : "Wird wieder abgefragt");
  if (state.study) { if (c.susp) state.study.queue = state.study.queue.filter((e) => e.id !== c.id); showEntry(); } else render();
});
$("cReset").addEventListener("click", () => {
  const b = $("cReset"), c = cardById(state.editing); if (!c) return;
  if (state.armed !== "card-reset") { state.armed = "card-reset"; b.classList.add("armed"); b.textContent = "Wirklich zurücksetzen?"; return; }
  c.srs = {}; save(); closeSheets(); toast("Karte gilt wieder als neu"); state.study ? renderStudy() : render();
});
$("selTopic").addEventListener("click", () => { if (state.sel && state.sel.ids.size) openTopicPicker([...state.sel.ids]); });
$("selSusp").addEventListener("click", () => {
  if (!state.sel || !state.sel.ids.size) return;
  const list = state.cards.filter((c) => state.sel.ids.has(c.id)), allSusp = list.every((c) => c.susp);
  list.forEach((c) => { if (allSusp) delete c.susp; else c.susp = true; });
  save(); state.sel = null; render(); toast(allSusp ? `${plural(list.length, "Karte", "Karten")} fortgesetzt` : `${plural(list.length, "Karte", "Karten")} pausiert`);
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
  if (openMode() === "learn" && !deepHandled && dueInfo(null).total) startLearn({});
}
$("splash").addEventListener("click", hideSplash);
$("splash").addEventListener("keydown", (e) => { if (["Enter", " ", "Escape"].includes(e.key)) { e.preventDefault(); hideSplash(); } });

/* ================= Start ================= */
loadAll();
try { if (navigator.storage && navigator.storage.persist) navigator.storage.persist(); } catch { /* not supported */ }
buildSplash();
let deep = "", deepHandled = false;
try { deep = (location.hash || "").replace(/^#/, "").toLowerCase(); } catch { deep = ""; }
const DEEP_VIEWS = ["stats", "search", "settings"];
if (deep === "learn" || deep === "add" || DEEP_VIEWS.includes(deep)) { $("splash").hidden = true; splashDone = true; deepHandled = true; }
else if (openMode() !== "splash") { $("splash").hidden = true; splashDone = true; }
if (DEEP_VIEWS.includes(deep)) state.stack.push({ v: deep });
render();
if (deep === "learn") { if (!startLearn({})) render(); }
if (deep === "add") openCard(null);
if (splashDone && !deepHandled) afterSplash();
try { if (deep) history.replaceState(null, "", location.pathname + location.search); } catch { /* ignore */ }
updateBadge();
addEventListener("hashchange", () => {
  const h = (location.hash || "").replace(/^#/, "").toLowerCase();
  if (!h) return;
  if (!splashDone) hideSplash();
  if (h === "learn") startLearn({}); else if (h === "add") openCard(null); else if (DEEP_VIEWS.includes(h)) { if (state.study) closeStudy(); state.stack = [{ v: "hub" }]; go(h); }
  try { history.replaceState(null, "", location.pathname + location.search); } catch { /* ignore */ }
});
let lastDay = today();
document.addEventListener("visibilitychange", () => { if (!document.hidden && today() !== lastDay) { lastDay = today(); if (!state.study) render(); } });
