/* ================= Basics ================= */
const KEYS = { cards: "plm.cards.v1", settings: "plm.settings.v1", stats: "plm.stats.v1", backup: "plm.lastBackup", open: "plm.open" };
const POS = { n: "Nomen", v: "Verb", adj: "Adjektiv", adv: "Adverb", ph: "Ausdruck", x: "Sonstiges" };
const POS_SHORT = { n: "Nom", v: "Verb", adj: "Adj", adv: "Adv", ph: "Ausdr", x: "" };
const MODES = [["flip", "Umdrehen"], ["type", "Tippen"], ["choice", "Auswahl"]];
const TTS_LIST = [["en-GB", "Englisch (UK)"], ["en-US", "Englisch (USA)"], ["it-IT", "Italienisch"], ["es-ES", "Spanisch (Spanien)"], ["es-MX", "Spanisch (Mexiko)"], ["fr-FR", "Französisch"], ["pt-PT", "Portugiesisch (Portugal)"], ["pt-BR", "Portugiesisch (Brasilien)"], ["nl-NL", "Niederländisch"], ["sv-SE", "Schwedisch"], ["da-DK", "Dänisch"], ["nb-NO", "Norwegisch"], ["pl-PL", "Polnisch"], ["tr-TR", "Türkisch"], ["ru-RU", "Russisch"], ["el-GR", "Griechisch"], ["ja-JP", "Japanisch"], ["zh-CN", "Chinesisch"], ["ko-KR", "Koreanisch"], ["ar-SA", "Arabisch"]];
const LANG_COLORS = ["#3FA9FF", "#2EE6D6", "#FF8A3D", "#C77DFF", "#30D97F", "#FF5FA8", "#F5C04A", "#8E8BFF", "#FFB4A2", "#7FD1FF"];

const $ = (id) => document.getElementById(id);
const esc = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const newId = () => "c" + Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
const nowTs = () => Date.now();
const shuffle = (a) => { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const nf = new Intl.NumberFormat("de-DE");
const num = (n) => nf.format(Math.round(n));
const dateFmt = new Intl.DateTimeFormat("de-DE", { day: "numeric", month: "short", year: "numeric" });
const dayMonFmt = new Intl.DateTimeFormat("de-DE", { day: "numeric", month: "short" });
const wdFmt = new Intl.DateTimeFormat("de-DE", { weekday: "short", day: "numeric", month: "short" });
const dateOfDay = (n) => { const d = new Date(n * 864e5); return new Date(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()); };
const plural = (n, one, many) => `${num(n)} ${n === 1 ? one : many}`;

/* ================= State ================= */
const state = {
  cards: [], settings: null, stats: {},
  stack: [{ v: "hub" }], enter: false, sel: null, armed: null,
  q: { text: "", lang: "all" }, chart: "hist", statRange: 30, listFilter: "all",
  editing: null, cType: "word", cLangFixed: null, study: null, imp: null, trashUndo: null
};
let byId = new Map();
const cardById = (id) => byId.get(id);
const reindex = () => { byId = new Map(state.cards.map((c) => [c.id, c])); };

/* ================= Storage (this device, localStorage) ================= */
const readJSON = (k, fb) => { try { const v = JSON.parse(localStorage.getItem(k)); return v == null ? fb : v; } catch { return fb; } };
let saveTimer = 0, saveWarned = false;
function saveNow() {
  clearTimeout(saveTimer); saveTimer = 0;
  try {
    localStorage.setItem(KEYS.cards, JSON.stringify(state.cards));
    localStorage.setItem(KEYS.settings, JSON.stringify(state.settings));
    localStorage.setItem(KEYS.stats, JSON.stringify(state.stats));
    saveWarned = false;
  } catch (e) {
    if (!saveWarned) { saveWarned = true; toast("Speichern fehlgeschlagen – Speicher voll? Sichere ein Backup."); }
  }
}
const save = () => { if (!saveTimer) saveTimer = setTimeout(saveNow, 250); };
addEventListener("visibilitychange", () => { if (document.hidden) { saveNow(); updateBadge(); } });
addEventListener("pagehide", saveNow);

function defaultLang(code) {
  const p = PRESETS[code];
  return JSON.parse(JSON.stringify({ code: p.code, name: p.name, tts: p.tts, color: p.color, persons: p.persons, tenses: p.tenses, active: p.active, articles: p.articles, newPerDay: 15, dirs: "both", order: "seq" }));
}
function normLang(l) {
  if (!l || typeof l.code !== "string" || typeof l.name !== "string") return null;
  const p = PRESETS[l.code] || {};
  return {
    code: l.code, name: l.name.slice(0, 30), tts: l.tts || p.tts || "", color: l.color || p.color || LANG_COLORS[0],
    persons: Array.isArray(l.persons) ? l.persons.map(String) : (p.persons || []),
    tenses: Array.isArray(l.tenses) ? l.tenses.filter((t) => t && t.n).map((t) => ({ n: String(t.n), ...(Array.isArray(t.labels) ? { labels: t.labels.map(String) } : {}), ...(Array.isArray(t.given) ? { given: t.given } : {}) })) : (p.tenses || []),
    active: Array.isArray(l.active) ? l.active.map(String) : (p.active || []),
    articles: Array.isArray(l.articles) ? l.articles.map(String) : (p.articles || []),
    newPerDay: Number.isFinite(l.newPerDay) ? clamp(Math.round(l.newPerDay), 0, 200) : 15,
    dirs: ["both", "f", "r"].includes(l.dirs) ? l.dirs : "both",
    order: l.order === "random" ? "random" : "seq"
  };
}
function normSettings(s) {
  s = s && typeof s === "object" ? s : {};
  let langs = Array.isArray(s.langs) ? s.langs.map(normLang).filter(Boolean) : null;
  if (!langs) langs = [defaultLang("en"), defaultLang("it")];
  const seen = new Set(); langs = langs.filter((l) => !seen.has(l.code) && seen.add(l.code));
  return {
    version: 1, langs,
    ret: [0.8, 0.85, 0.9, 0.95].includes(s.ret) ? s.ret : 0.9,
    maxReviews: Number.isFinite(s.maxReviews) ? s.maxReviews : 200,
    roll: Number.isInteger(s.roll) && s.roll >= 0 && s.roll <= 6 ? s.roll : 4,
    mode: MODES.some(([k]) => k === s.mode) ? s.mode : "flip",
    intro: s.intro !== false, autoSpeak: s.autoSpeak !== false,
    remind: /^\d{2}:\d{2}$/.test(s.remind || "") ? s.remind : "19:00",
    badge: !!s.badge, topicsOrder: s.topicsOrder && typeof s.topicsOrder === "object" ? s.topicsOrder : {}
  };
}
function normCard(c) {
  if (!c || typeof c !== "object" || typeof c.lang !== "string") return null;
  const type = ["word", "verb", "cloze"].includes(c.type) ? c.type : "word";
  const out = {
    id: typeof c.id === "string" && c.id ? c.id.slice(0, 60) : newId(), lang: c.lang, type,
    tg: String(c.tg || "").slice(0, 300), de: String(c.de || "").slice(0, 300),
    pos: POS[c.pos] ? c.pos : (type === "verb" ? "v" : ""), topic: String(c.topic || "").slice(0, 40),
    ex: String(c.ex || "").slice(0, 300), exDe: String(c.exDe || "").slice(0, 300), note: String(c.note || "").slice(0, 300),
    created: Number.isFinite(c.created) ? c.created : nowTs(), srs: {}
  };
  if (!out.tg) return null;
  if (c.srs && typeof c.srs === "object") for (const [k, v] of Object.entries(c.srs)) if (v && typeof v === "object" && Number.isFinite(v.s) && Number.isFinite(v.due)) out.srs[k] = v;
  if (type === "verb") {
    out.tables = {};
    if (c.tables && typeof c.tables === "object") for (const [k, v] of Object.entries(c.tables)) if (Array.isArray(v)) out.tables[k] = v.map((x) => String(x || "").slice(0, 80));
    if (c.aux === "essere") out.aux = "essere";
    if (c.isc) out.isc = true;
  }
  if (c.susp) out.susp = true;
  if (c.pack) out.pack = String(c.pack);
  if (Number.isFinite(c.updated)) out.updated = c.updated;
  return out;
}
function loadAll() {
  state.settings = normSettings(readJSON(KEYS.settings, null));
  const raw = readJSON(KEYS.cards, []);
  state.cards = (Array.isArray(raw) ? raw : []).map(normCard).filter(Boolean);
  const st = readJSON(KEYS.stats, {});
  state.stats = st && typeof st === "object" && !Array.isArray(st) ? st : {};
  reindex();
}

/* ================= Languages ================= */
const langs = () => state.settings.langs;
const langOf = (code) => langs().find((l) => l.code === code) || null;
const langName = (code) => (langOf(code) || { name: code }).name;
const langColor = (code) => (langOf(code) || { color: "#8E8E96" }).color;
const cardsOf = (code) => state.cards.filter((c) => c.lang === code);
const hasGenderedNouns = (L) => L && ["it", "es", "fr", "pt"].includes(L.code);
function topicsOf(code) {
  const m = new Map();
  for (const c of state.cards) if (c.lang === code) m.set(c.topic || "", (m.get(c.topic || "") || 0) + 1);
  return [...m.entries()].sort((a, b) => (a[0] === "" ? 1 : b[0] === "" ? -1 : 0)).map(([t]) => t);
}

/* ================= Learning day + stats ================= */
const roll = () => state.settings.roll;
const today = () => dayNum(nowTs(), roll());
function statOf(dayN, code, create) {
  const k = dayKey(dayN);
  if (!state.stats[k]) { if (!create) return null; state.stats[k] = {}; }
  if (!state.stats[k][code]) { if (!create) return null; state.stats[k][code] = { r: 0, ok: 0, n: 0, s: 0, p: 0 }; }
  return state.stats[k][code];
}
function dayTotals(dayN, code) {
  const d = state.stats[dayKey(dayN)] || {}, t = { r: 0, ok: 0, n: 0, s: 0, p: 0 };
  for (const [c, v] of Object.entries(d)) if (!code || c === code) for (const f of Object.keys(t)) t[f] += v[f] || 0;
  return t;
}
function histArr(code, days, field) {
  const t = today(), out = [];
  for (let i = days - 1; i >= 0; i--) { const d = dayTotals(t - i, code); out.push(field === "all" ? d.r + d.p : d[field]); }
  return out;
}
function streakInfo() {
  const t = today(), active = (n) => { const d = dayTotals(n); return d.r + d.p > 0; };
  let cur = 0, n = active(t) ? t : t - 1;
  while (active(n)) { cur++; n--; }
  const days = Object.keys(state.stats).map(keyDay).filter((d) => { const x = dayTotals(d); return x.r + x.p > 0; }).sort((a, b) => a - b);
  let best = 0, run = 0, prev = null;
  for (const d of days) { run = prev != null && d === prev + 1 ? run + 1 : 1; best = Math.max(best, run); prev = d; }
  return { cur, best: Math.max(best, cur), days: days.length, todayDone: active(t) };
}

/* ================= Items, states, queue ================= */
/* Every card yields review items: r = foreign → German, f = German → foreign, c = cloze, t:<tense> = conjugation table */
function itemsOf(c, L) {
  if (c.susp) return [];
  L = L || langOf(c.lang);
  if (!L) return [];
  if (c.type === "cloze") return parseCloze(c.tg).gaps.length ? ["c"] : [];
  const out = [];
  if (L.dirs !== "f") out.push("r");
  if (L.dirs !== "r") out.push("f");
  if (c.type === "verb" && c.tables) for (const t of L.tenses) if (L.active.includes(t.n) && Array.isArray(c.tables[t.n]) && c.tables[t.n].some((x, i) => x && !(t.given || []).includes(i))) out.push("t:" + t.n);
  return out;
}
function cardState(c) {
  const items = itemsOf(c), sts = items.map((k) => c.srs[k]).filter(Boolean);
  if (c.susp) return "susp";
  if (!sts.length) return "new";
  const lapses = sts.reduce((a, s) => a + (s.lapses || 0), 0), maxD = Math.max(...sts.map((s) => s.d || 0));
  if (lapses >= 3 || maxD >= 8.5) return "hard";
  if (sts.length === items.length && sts.every((s) => s.st === "rev" && s.ivl >= 21)) return "known";
  return "learn";
}
const STATE_TXT = { new: "Neu", learn: "Lernen", known: "Sicher", hard: "Schwierig", susp: "Pausiert" };
function nextDue(c) {
  let m = Infinity;
  for (const k of itemsOf(c)) { const s = c.srs[k]; if (s) m = Math.min(m, s.due); }
  return m;
}
function dueText(c) {
  const d = nextDue(c);
  if (d === Infinity) return "";
  const dd = dayNum(d, roll()) - today();
  return dd <= 0 ? "heute" : dd === 1 ? "morgen" : dd < 30 ? `in ${dd} T.` : `in ${Math.round(dd / 30.4)} Mon.`;
}
function srsCfg(entry, c) { return { now: nowTs(), roll: roll(), ret: state.settings.ret, max: 3650, seed: c.id + entry.k, fresh: !!entry.fresh }; }

/* Build today's queue. o: { lang, topic, extraNew, countOnly } */
function buildQueue(o) {
  o = o || {};
  const now = nowTs(), t = today(), tomorrow0 = dayStart(t + 1, roll());
  const learn = [], reviews = [], news = {};
  for (const c of state.cards) {
    if (o.lang && c.lang !== o.lang) continue;
    if (o.topic != null && (c.topic || "") !== o.topic) continue;
    const L = langOf(c.lang); if (!L) continue;
    const items = itemsOf(c, L); if (!items.length) continue;
    let touched = false, lrn = null, rev = null, nw = null;
    for (const k of items) {
      const s = c.srs[k];
      if (!s) { if (!nw) nw = k; continue; }
      if (s.ld === t) touched = true;
      if (s.st === "lrn" && s.due <= now + 20 * 60e3 && !lrn) lrn = k;
      if (s.st === "rev" && s.due < tomorrow0 && (!rev || s.due < c.srs[rev].due)) rev = k;
    }
    if (lrn) { learn.push({ id: c.id, k: lrn, lang: c.lang }); continue; }
    if (touched) continue;
    if (rev) { reviews.push({ id: c.id, k: rev, lang: c.lang, due: c.srs[rev].due }); continue; }
    if (nw) (news[c.lang] = news[c.lang] || []).push({ id: c.id, k: nw, lang: c.lang, isNew: true, created: c.created });
  }
  const doneToday = dayTotals(t).r;
  reviews.sort((a, b) => a.due - b.due);
  const revCap = Math.max(0, state.settings.maxReviews - doneToday);
  const revs = reviews.slice(0, revCap);
  let newList = [];
  for (const [code, list] of Object.entries(news)) {
    const L = langOf(code), st = statOf(t, code, false);
    const left = Math.max(0, L.newPerDay - (st ? st.n : 0)) + (o.extraNew || 0);
    if (L.order === "random") shuffle(list); else list.sort((a, b) => a.created - b.created);
    newList = newList.concat(list.slice(0, left));
  }
  if (o.countOnly) return { lrn: learn.length, rev: revs.length, nw: newList.length, due: learn.length + revs.length, total: learn.length + revs.length + newList.length, moreNew: Object.values(news).reduce((a, l) => a + l.length, 0) - newList.length };
  shuffle(revs);
  if (Object.keys(news).length > 1) shuffle(newList);
  const out = learn.slice(), gap = newList.length ? Math.max(1, Math.floor(revs.length / newList.length)) : 0;
  let ni = 0;
  revs.forEach((r, i) => { out.push(r); if (gap && (i + 1) % gap === 0 && ni < newList.length) out.push(newList[ni++]); });
  while (ni < newList.length) out.push(newList[ni++]);
  return out;
}
const dueCache = new Map();
function dueInfo(code, topic) {
  const key = `${code || "*"}|${topic == null ? "*" : topic}`;
  if (!dueCache.has(key)) dueCache.set(key, buildQueue({ lang: code || null, topic, countOnly: true }));
  return dueCache.get(key);
}
function forecast(code, days) {
  const t = today(), out = new Array(days).fill(0);
  for (const c of state.cards) {
    if (code && c.lang !== code) continue;
    for (const k of itemsOf(c)) { const s = c.srs[k]; if (!s) continue; const d = Math.max(0, dayNum(s.due, roll()) - t); if (d < days) out[d]++; }
  }
  return out;
}
function countByState(code) {
  const m = { new: 0, learn: 0, known: 0, hard: 0, susp: 0 };
  for (const c of state.cards) if (!code || c.lang === code) m[cardState(c)]++;
  return m;
}
const minutesFor = (d) => Math.max(1, Math.round((d.due * 9 + d.nw * 22) / 60));

/* ================= Text-to-speech ================= */
let voices = [];
function loadVoices() { try { voices = window.speechSynthesis ? speechSynthesis.getVoices() : []; } catch { voices = []; } }
if (window.speechSynthesis) { loadVoices(); speechSynthesis.addEventListener ? speechSynthesis.addEventListener("voiceschanged", loadVoices) : (speechSynthesis.onvoiceschanged = loadVoices); }
function speak(text, code) {
  if (!window.speechSynthesis || !text) return;
  const L = langOf(code), tag = (L && L.tts) || code;
  const u = new SpeechSynthesisUtterance(String(text).replace(/\{\{|\}\}/g, "").replace(/\s\/\s/g, ", "));
  u.lang = tag; u.rate = 0.92;
  const base = tag.slice(0, 2).toLowerCase();
  const v = voices.find((x) => x.lang === tag) || voices.find((x) => x.lang.replace("_", "-").toLowerCase().startsWith(base));
  if (v) u.voice = v;
  try { speechSynthesis.cancel(); speechSynthesis.speak(u); } catch { /* ignore */ }
}
const canSpeak = () => !!window.speechSynthesis;

/* ================= App badge (number on the Home Screen icon) ================= */
function updateBadge() {
  if (!state.settings || !state.settings.badge || !navigator.setAppBadge) return;
  try { const n = dueInfo(null).total; dueCache.clear(); n ? navigator.setAppBadge(n) : navigator.clearAppBadge(); } catch { /* not supported */ }
}

/* ================= Starter packs ================= */
function parseWordLines(text, code) {
  const out = []; let topic = "";
  for (const raw of String(text).split("\n")) {
    const line = raw.trim();
    if (!line) continue;
    if (line.startsWith("# ")) { topic = line.slice(2).trim(); continue; }
    const [tg, de, type, ex, exDe, note] = line.split("|").map((x) => (x || "").trim());
    if (!tg) continue;
    let pos = type || "";
    if (/^n[mfn]$/.test(pos)) pos = "n";
    out.push({ tg, de, pos: POS[pos] ? pos : "", ex, exDe, note, topic });
  }
  return out;
}
function packCards(code, pack) {
  const now = Math.max(nowTs(), ...state.cards.map((c) => c.created + 1)), out = [];
  let i = 0;
  const mk = (o) => normCard({ ...o, lang: code, pack: pack.id, created: now + i++ });
  if (pack.kind === "words") for (const w of parseWordLines(pack.data, code)) out.push(mk({ type: "word", tg: w.tg, de: w.de, pos: w.pos, ex: w.ex, exDe: w.exDe, note: w.note, topic: w.topic }));
  if (pack.kind === "cloze") for (const w of parseWordLines(pack.data, code)) out.push(mk({ type: "cloze", tg: w.tg, de: w.de, topic: w.topic }));
  if (pack.kind === "verbs") for (const v of pack.verbs) {
    const r = itConj(v.v, v) || {};
    const tables = {}; for (const [k, f] of Object.entries(r)) if (!k.startsWith("_")) tables[k] = f;
    out.push(mk({ type: "verb", tg: v.v, de: v.de, pos: "v", topic: "Verben", note: v.note || "", tables, aux: r._aux, isc: !!v.isc }));
  }
  if (pack.kind === "enverbs") for (const line of pack.data.split("\n")) {
    const [inf, past, pp, de] = line.split("|").map((x) => (x || "").trim());
    if (!inf) continue;
    const r = enConj(inf, { past, pp }) || {};
    out.push(mk({ type: "verb", tg: inf, de, pos: "v", topic: "Unregelmäßige Verben", tables: r }));
  }
  return out.filter(Boolean);
}
const cardSig = (c) => `${c.lang}|${c.type}|${normAns(c.tg)}|${normAns(c.de)}`;
function loadPack(code, packId) {
  const pack = (STARTER[code] || []).find((p) => p.id === packId);
  if (!pack) return 0;
  const have = new Set(state.cards.map(cardSig));
  const add = packCards(code, pack).filter((c) => !have.has(cardSig(c)));
  state.cards = state.cards.concat(add); reindex(); save();
  return add.length;
}
