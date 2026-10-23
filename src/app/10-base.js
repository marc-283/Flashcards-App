/* ================= Basics ================= */
const KEYS = {
  cards: "plm.cards.v1", settings: "plm.settings.v1", stats: "plm.stats.v1", backup: "plm.lastBackup", open: "plm.open",
  tomb: "plm.tomb.v1", statsOther: "plm.statsOther.v1", tests: "plm.tests.v1", dev: "plm.dev", ai: "plm.ai.v1", sync: "plm.sync.v1"
};
const POS = { n: T("Nomen"), v: T("Verb"), adj: T("Adjektiv"), adv: T("Adverb"), ph: T("Ausdruck"), s: T("Satz"), x: T("Sonstiges") };
const MODES = [["flip", T("Umdrehen")], ["type", T("Tippen")], ["choice", T("Auswahl")]];
const TTS_LIST = [["en-GB", T("Englisch (UK)")], ["en-US", T("Englisch (USA)")], ["it-IT", T("Italienisch")], ["es-ES", T("Spanisch (Spanien)")], ["es-MX", T("Spanisch (Mexiko)")], ["fr-FR", T("Französisch")], ["pt-PT", T("Portugiesisch (Portugal)")], ["pt-BR", T("Portugiesisch (Brasilien)")], ["nl-NL", T("Niederländisch")], ["sv-SE", T("Schwedisch")], ["da-DK", T("Dänisch")], ["nb-NO", T("Norwegisch")], ["pl-PL", T("Polnisch")], ["tr-TR", T("Türkisch")], ["ru-RU", T("Russisch")], ["el-GR", T("Griechisch")], ["ja-JP", T("Japanisch")], ["zh-CN", T("Chinesisch")], ["ko-KR", T("Koreanisch")], ["ar-SA", T("Arabisch")]];
const LANG_COLORS = ["#3FA9FF", "#2EE6D6", "#FF8A3D", "#C77DFF", "#30D97F", "#FF5FA8", "#F5C04A", "#8E8BFF", "#FFB4A2", "#7FD1FF"];
const MEANING_LANGS = { en: T("Englisch"), it: T("Italienisch"), es: T("Spanisch"), fr: T("Französisch") };
const OWN_DECK = "Eigene Karten";

const $ = (id) => document.getElementById(id);
const esc = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const newId = () => "c" + Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
const nowTs = () => Date.now();
const shuffle = (a) => { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const LOC = UI === "en" ? "en-GB" : "de-DE";
const nf = new Intl.NumberFormat(LOC);
const num = (n) => nf.format(Math.round(n));
const dateFmt = new Intl.DateTimeFormat(LOC, { day: "numeric", month: "short", year: "numeric" });
const dayMonFmt = new Intl.DateTimeFormat(LOC, { day: "numeric", month: "short" });
const wdFmt = new Intl.DateTimeFormat(LOC, { weekday: "short", day: "numeric", month: "short" });
const timeFmt = new Intl.DateTimeFormat(LOC, { hour: "2-digit", minute: "2-digit" });
const dateOfDay = (n) => { const d = new Date(n * 864e5); return new Date(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()); };
/* English nouns are lower case inside a sentence ("5 cards"); German ones keep their capital */
const lc = (w) => (UI === "en" && /^[A-Z][a-z]/.test(w) ? w.charAt(0).toLowerCase() + w.slice(1) : w);
const plural = (n, one, many) => `${num(n)} ${lc(n === 1 ? one : many)}`;
const noun = (n, one, many) => lc(T(n === 1 ? one : many));
const lsGet = (k) => { try { return localStorage.getItem(k); } catch { return null; } };
const lsSet = (k, v) => { try { localStorage.setItem(k, v); return true; } catch { return false; } };

/* ================= State ================= */
const state = {
  cards: [], settings: null, stats: {}, statsOther: {}, tomb: {}, tests: {},
  stack: [{ v: "hub" }], enter: false, sel: null, armed: null,
  q: { text: "", lang: "all" }, chart: "hist", statRange: 30, listFilter: "all",
  editing: null, cType: "word", study: null, imp: null, imp2: null
};
let byId = new Map();
const cardById = (id) => byId.get(id);
const reindex = () => { byId = new Map(state.cards.map((c) => [c.id, c])); };
let devId = lsGet(KEYS.dev);
if (!devId) { devId = "d" + Math.random().toString(36).slice(2, 10); lsSet(KEYS.dev, devId); }

/* ================= Storage (this device, localStorage) ================= */
const readJSON = (k, fb) => { try { const v = JSON.parse(localStorage.getItem(k)); return v == null ? fb : v; } catch { return fb; } };
let saveTimer = 0, saveWarned = false;
function saveNow() {
  clearTimeout(saveTimer); saveTimer = 0;
  try {
    localStorage.setItem(KEYS.cards, JSON.stringify(state.cards));
    localStorage.setItem(KEYS.settings, JSON.stringify(state.settings));
    localStorage.setItem(KEYS.stats, JSON.stringify(state.stats));
    localStorage.setItem(KEYS.statsOther, JSON.stringify(state.statsOther));
    localStorage.setItem(KEYS.tomb, JSON.stringify(state.tomb));
    localStorage.setItem(KEYS.tests, JSON.stringify(state.tests));
    saveWarned = false;
  } catch {
    if (!saveWarned) { saveWarned = true; toast(T("Speichern fehlgeschlagen – Speicher voll? Sichere ein Backup.")); }
  }
}
/* dirty = data that should go to the other devices */
const save = (dirty) => { if (!saveTimer) saveTimer = setTimeout(saveNow, 250); if (dirty !== false && typeof syncSoon === "function") syncSoon(); };
const touchSettings = () => { state.settings.updatedAt = nowTs(); save(); };
addEventListener("visibilitychange", () => { if (document.hidden) { saveNow(); updateBadge(); } });
addEventListener("pagehide", saveNow);

function defaultLang(code) {
  const p = PRESETS[code];
  return JSON.parse(JSON.stringify({ code: p.code, name: p.name, tts: p.tts, color: p.color, persons: p.persons, tenses: p.tenses, active: p.active, articles: p.articles, newPerDay: 15, dirs: "both", order: "seq", voice: "" }));
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
    order: l.order === "random" ? "random" : "seq",
    voice: typeof l.voice === "string" ? l.voice : ""
  };
}
function normSettings(s) {
  s = s && typeof s === "object" ? s : {};
  let langs = Array.isArray(s.langs) ? s.langs.map(normLang).filter(Boolean) : null;
  if (!langs) langs = [defaultLang("en"), defaultLang("it")];
  const seen = new Set(); langs = langs.filter((l) => !seen.has(l.code) && seen.add(l.code));
  return {
    version: 2, langs,
    ret: [0.8, 0.85, 0.9, 0.95].includes(s.ret) ? s.ret : 0.9,
    maxReviews: Number.isFinite(s.maxReviews) ? s.maxReviews : 200,
    roll: Number.isInteger(s.roll) && s.roll >= 0 && s.roll <= 6 ? s.roll : 4,
    mode: MODES.some(([k]) => k === s.mode) ? s.mode : "flip",
    intro: s.intro !== false, autoSpeak: s.autoSpeak !== false,
    rate: [0.8, 0.9, 1, 1.1].includes(s.rate) ? s.rate : 0.9,
    remind: /^\d{2}:\d{2}$/.test(s.remind || "") ? s.remind : "19:00",
    badge: !!s.badge,
    ui: s.ui === "en" || s.ui === "de" ? s.ui : UI,
    updatedAt: Number.isFinite(s.updatedAt) ? s.updatedAt : 0
  };
}
const PACK_NAMES = {};
for (const packs of Object.values(STARTER)) for (const p of packs) PACK_NAMES[p.id] = p.name;
function normSrs(v) {
  if (!v || typeof v !== "object" || !Number.isFinite(v.s) || !Number.isFinite(v.due)) return null;
  const o = { st: v.st === "lrn" ? "lrn" : "rev", s: v.s, d: Number.isFinite(v.d) ? v.d : 5, ld: Number.isFinite(v.ld) ? v.ld : 0, ivl: Number.isFinite(v.ivl) ? v.ivl : 0, due: v.due, reps: v.reps | 0, lapses: v.lapses | 0, lg: v.lg | 0 };
  o.t = Number.isFinite(v.t) ? v.t : o.ld * 864e5;
  return o;
}
function normCard(c) {
  if (!c || typeof c !== "object" || typeof c.lang !== "string") return null;
  const type = ["word", "verb", "cloze"].includes(c.type) ? c.type : "word";
  const out = {
    id: typeof c.id === "string" && c.id ? c.id.slice(0, 60) : newId(), lang: c.lang, type,
    tg: String(c.tg || "").slice(0, 300), de: String(c.de || "").slice(0, 300),
    pos: POS[c.pos] ? c.pos : (type === "verb" ? "v" : ""), topic: String(c.topic || "").slice(0, 40),
    deck: String(c.deck || (c.pack && PACK_NAMES[c.pack]) || OWN_DECK).slice(0, 40),
    ex: String(c.ex || "").slice(0, 300), exDe: String(c.exDe || "").slice(0, 300), note: String(c.note || "").slice(0, 300),
    created: Number.isFinite(c.created) ? c.created : nowTs(), srs: {}
  };
  if (!out.tg) return null;
  if (c.srs && typeof c.srs === "object") for (const [k, v] of Object.entries(c.srs)) { const n = normSrs(v); if (n) out.srs[k] = n; }
  if (type === "verb") {
    out.tables = {};
    if (c.tables && typeof c.tables === "object") for (const [k, v] of Object.entries(c.tables)) if (Array.isArray(v)) out.tables[k] = v.map((x) => String(x || "").slice(0, 80));
    if (c.aux === "essere") out.aux = "essere";
    if (c.isc) out.isc = true;
  }
  if (c.susp) out.susp = true;
  if (c.pack) out.pack = String(c.pack);
  if (MEANING_LANGS[c.ml] && c.ml !== c.lang) out.ml = c.ml;
  if (Number.isFinite(c.resetAt)) out.resetAt = c.resetAt;
  out.updated = Number.isFinite(c.updated) ? c.updated : out.created;
  return out;
}
function loadAll() {
  state.settings = normSettings(readJSON(KEYS.settings, null));
  const raw = readJSON(KEYS.cards, []);
  state.cards = (Array.isArray(raw) ? raw : []).map(normCard).filter(Boolean);
  const obj = (k) => { const v = readJSON(k, {}); return v && typeof v === "object" && !Array.isArray(v) ? v : {}; };
  state.stats = obj(KEYS.stats); state.statsOther = obj(KEYS.statsOther); state.tomb = obj(KEYS.tomb); state.tests = obj(KEYS.tests);
  reindex();
}

/* ================= Languages, projects, topics ================= */
const langs = () => state.settings.langs;
const langOf = (code) => langs().find((l) => l.code === code) || null;
/* display name: built-in language names follow the app language */
/* built-in project and topic names (starter packs) are shown in the app language; the stored name stays */
const dn = (name) => (name ? T(name) : name);
const lname = (L) => (L ? T(L.name) : "");
const langName = (code) => lname(langOf(code) || { name: code });
const cardsOf = (code) => state.cards.filter((c) => c.lang === code);
const hasGenderedNouns = (L) => L && ["it", "es", "fr", "pt"].includes(L.code);
const meaningName = (c) => (c.ml ? MEANING_LANGS[c.ml] : T("Deutsch"));
function decksOf(code) {
  const m = new Map();
  for (const c of state.cards) if (c.lang === code) { const d = m.get(c.deck) || { name: c.deck, n: 0, first: c.created }; d.n++; d.first = Math.min(d.first, c.created); m.set(c.deck, d); }
  return [...m.values()].sort((a, b) => (a.name === OWN_DECK) - (b.name === OWN_DECK) || a.first - b.first);
}
function topicsOf(code, deck) {
  const m = new Map();
  for (const c of state.cards) if (c.lang === code && (deck == null || c.deck === deck)) { const t = c.topic || ""; if (!m.has(t)) m.set(t, c.created); m.set(t, Math.min(m.get(t), c.created)); }
  return [...m.entries()].sort((a, b) => (a[0] === "") - (b[0] === "") || a[1] - b[1]).map(([t]) => t);
}
/* scope filter: { lang, deck, topic, ids } */
function inScope(c, o) {
  if (!o) return true;
  if (o.lang && c.lang !== o.lang) return false;
  if (o.deck != null && c.deck !== o.deck) return false;
  if (o.topic != null && (c.topic || "") !== o.topic) return false;
  if (o.ids && !o.ids.includes(c.id)) return false;
  return true;
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
/* Totals over this device and all synced devices */
function dayTotals(dayN, code) {
  const k = dayKey(dayN), t = { r: 0, ok: 0, n: 0, s: 0, p: 0 };
  const add = (d) => { for (const [c, v] of Object.entries(d || {})) if (!code || c === code) for (const f of Object.keys(t)) t[f] += v[f] || 0; };
  add(state.stats[k]);
  for (const st of Object.values(state.statsOther)) add(st && st[k]);
  return t;
}
function newToday(code) {
  const k = dayKey(today()); let n = 0;
  const add = (d) => { if (d && d[code]) n += d[code].n || 0; };
  add(state.stats[k]); for (const st of Object.values(state.statsOther)) add(st && st[k]);
  return n;
}
function histArr(code, days, field) {
  const t = today(), out = [];
  for (let i = days - 1; i >= 0; i--) { const d = dayTotals(t - i, code); out.push(field === "all" ? d.r + d.p : d[field]); }
  return out;
}
function allStatDays() {
  const s = new Set(Object.keys(state.stats));
  for (const st of Object.values(state.statsOther)) for (const k of Object.keys(st || {})) s.add(k);
  return [...s].filter((k) => /^\d{4}-\d{2}-\d{2}$/.test(k));
}
function streakInfo() {
  const t = today(), active = (n) => { const d = dayTotals(n); return d.r + d.p > 0; };
  let cur = 0, n = active(t) ? t : t - 1;
  while (active(n)) { cur++; n--; }
  const days = allStatDays().map(keyDay).filter((d) => { const x = dayTotals(d); return x.r + x.p > 0; }).sort((a, b) => a - b);
  let best = 0, run = 0, prev = null;
  for (const d of days) { run = prev != null && d === prev + 1 ? run + 1 : 1; best = Math.max(best, run); prev = d; }
  return { cur, best: Math.max(best, cur), days: days.length, todayDone: active(t) };
}

/* ================= Items, states, queue ================= */
/* Every card yields review items: r = foreign → meaning, f = meaning → foreign, c = cloze, t:<tense> = conjugation table */
function itemsOf(c, L) {
  if (c.susp) return [];
  L = L || langOf(c.lang);
  if (!L) return [];
  if (c.type === "cloze") return parseCloze(c.tg).gaps.length ? ["c"] : [];
  if (!c.de) return [];
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
const STATE_TXT = { new: T("Neu"), learn: T("Im Lernen"), known: T("Sicher"), hard: T("Schwierig"), susp: T("Pausiert") };
const isLearned = (c) => Object.keys(c.srs).length > 0;
function nextDue(c) {
  let m = Infinity;
  for (const k of itemsOf(c)) { const s = c.srs[k]; if (s) m = Math.min(m, s.due); }
  return m;
}
function dueText(c) {
  const d = nextDue(c);
  if (d === Infinity) return "";
  const dd = dayNum(d, roll()) - today();
  return dd <= 0 ? T("heute") : dd === 1 ? T("morgen") : dd < 30 ? T("in {0} T.", [dd]) : T("in {0} Mon.", [Math.round(dd / 30.4)]);
}
function srsCfg(entry, c) { return { now: nowTs(), roll: roll(), ret: state.settings.ret, max: 3650, seed: c.id + entry.k, fresh: !!entry.fresh }; }

/* Build today's queue. o: { lang, deck, topic, extraNew, countOnly } */
function buildQueue(o) {
  o = o || {};
  const now = nowTs(), t = today(), tomorrow0 = dayStart(t + 1, roll());
  const learn = [], reviews = [], news = {};
  for (const c of state.cards) {
    if (!inScope(c, o)) continue;
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
    const L = langOf(code);
    const left = Math.max(0, L.newPerDay - newToday(code)) + (o.extraNew || 0);
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
function dueInfo(o) {
  o = o || {};
  const key = `${o.lang || "*"}|${o.deck == null ? "*" : o.deck}|${o.topic == null ? "*" : o.topic}`;
  if (!dueCache.has(key)) dueCache.set(key, buildQueue({ lang: o.lang || null, deck: o.deck, topic: o.topic, countOnly: true }));
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
function countByState(o) {
  const m = { new: 0, learn: 0, known: 0, hard: 0, susp: 0 };
  for (const c of state.cards) if (inScope(c, typeof o === "string" ? { lang: o } : o)) m[cardState(c)]++;
  return m;
}
const minutesFor = (d) => Math.max(1, Math.round((d.due * 9 + d.nw * 22) / 60));

/* ================= Text-to-speech ================= */
let voices = [];
function loadVoices() { try { voices = window.speechSynthesis ? speechSynthesis.getVoices() : []; } catch { voices = []; } }
if (window.speechSynthesis) {
  loadVoices();
  try { speechSynthesis.addEventListener("voiceschanged", loadVoices); } catch { speechSynthesis.onvoiceschanged = loadVoices; }
}
const canSpeak = () => !!window.speechSynthesis;
const langTag = (code) => { const L = langOf(code); return (L && L.tts) || code; };
function voicesFor(code) {
  if (!voices.length) loadVoices();
  const base = langTag(code).slice(0, 2).toLowerCase();
  return voices.filter((v) => (v.lang || "").replace("_", "-").toLowerCase().startsWith(base));
}
const NOVELTY = /compact|eloquence|novelty|bad news|good news|bells|bubbles|jester|whisper|zarvox|trinoids|superstar|organ|boing|cellos|albert|bahh|wobble|fred|junior|ralph|kathy|grandma|grandpa|rocko|shelley|flo|reed|sandy/;
function voiceScore(v, tag) {
  let s = 0;
  const lang = (v.lang || "").replace("_", "-").toLowerCase(), id = `${v.voiceURI} ${v.name}`.toLowerCase();
  if (lang === tag.toLowerCase()) s += 10;
  if (/premium/.test(id)) s += 6; else if (/enhanced|erweitert|verbessert|neural|natural|online/.test(id)) s += 4;
  if (NOVELTY.test(id)) s -= 8;
  if (v.default) s += 1;
  return s;
}
function pickVoice(code) {
  const L = langOf(code), tag = langTag(code), list = voicesFor(code);
  if (L && L.voice) { const v = list.find((x) => x.voiceURI === L.voice); if (v) return v; }
  return list.slice().sort((a, b) => voiceScore(b, tag) - voiceScore(a, tag))[0] || null;
}
/* curUtter keeps the utterance referenced – Safari otherwise drops it and never finishes speaking */
let speakTimer = 0, curUtter = null; // eslint-disable-line no-unused-vars
const noVoiceWarned = new Set();
function speak(text, code, o) {
  o = o || {};
  const ss = window.speechSynthesis;
  if (!ss || !text) return false;
  const clean = String(text).replace(/\{\{|\}\}/g, "").replace(/\s\/\s/g, ", ").replace(/[…_]+/g, " ").replace(/\s+/g, " ").trim();
  if (!clean) return false;
  const u = new SpeechSynthesisUtterance(clean);
  u.lang = langTag(code); u.rate = o.slow ? 0.62 : state.settings.rate; u.pitch = 1; u.volume = 1;
  const v = pickVoice(code);
  if (v) u.voice = v;
  else if (voices.length && !noVoiceWarned.has(code) && !o.quiet) { noVoiceWarned.add(code); toast(T("Keine {0}-Stimme auf diesem Gerät – siehe Einstellungen › Aussprache", [langName(code)])); }
  if (o.onend) { u.onend = o.onend; u.onerror = o.onend; }
  curUtter = u;
  try {
    clearTimeout(speakTimer);
    if (ss.speaking || ss.pending) { ss.cancel(); speakTimer = setTimeout(() => { try { ss.speak(u); } catch { /* ignore */ } }, 80); }
    else { if (ss.paused) ss.resume(); ss.speak(u); }
  } catch { return false; }
  return true;
}
function stopSpeak() { try { clearTimeout(speakTimer); if (window.speechSynthesis) speechSynthesis.cancel(); } catch { /* ignore */ } }
/* iOS only plays speech after a user gesture – unlock it on the first touch */
let ttsUnlocked = false;
function unlockTTS() {
  if (ttsUnlocked || !window.speechSynthesis) return;
  ttsUnlocked = true;
  try { const u = new SpeechSynthesisUtterance(" "); u.volume = 0; speechSynthesis.speak(u); } catch { /* ignore */ }
}
document.addEventListener("touchend", unlockTTS, { capture: true, once: true });
document.addEventListener("click", unlockTTS, { capture: true, once: true });

/* ================= Speech recognition (pronunciation check) ================= */
const SR = window.SpeechRecognition || window.webkitSpeechRecognition || null;
const canListen = () => !!SR;
let curRec = null;
function listen(code, cb) {
  if (!SR) { cb({ error: "unsupported" }); return; }
  stopSpeak();
  try { if (curRec) curRec.abort(); } catch { /* ignore */ }
  const r = new SR();
  curRec = r;
  r.lang = langTag(code); r.interimResults = false; r.maxAlternatives = 5; r.continuous = false;
  let done = false;
  const fin = (x) => { if (done) return; done = true; clearTimeout(tm); curRec = null; cb(x); };
  const tm = setTimeout(() => { try { r.stop(); } catch { /* ignore */ } }, 8000);
  r.onresult = (e) => { const res = e.results[0]; const alts = []; for (let i = 0; i < res.length; i++) alts.push(res[i].transcript); fin({ alts }); };
  r.onerror = (e) => fin({ error: e.error || "error" });
  r.onend = () => fin({ error: "no-speech" });
  try { r.start(); } catch { fin({ error: "start" }); }
}
/* Compare what was heard with the target, word by word */
const wordsOf = (s) => bareAns(normAns(String(s).replace(/\{\{|\}\}/g, ""))).replace(/[,;:()"]/g, " ").replace(/'/g, "' ").split(/\s+/).filter(Boolean);
function speechMatch(target, alts) {
  const tw = wordsOf(target);
  let best = { score: 0, heard: alts[0] || "", hit: tw.map(() => false) };
  for (const a of alts) {
    const hw = wordsOf(a), used = new Array(hw.length).fill(false), hit = tw.map((w) => {
      const j = hw.findIndex((h, i) => !used[i] && (h === w || (w.length >= 4 && lev(h, w) <= 1) || h.replace(/'/g, "") === w.replace(/'/g, "")));
      if (j >= 0) { used[j] = true; return true; }
      return false;
    });
    const score = tw.length ? hit.filter(Boolean).length / tw.length : 0;
    if (score > best.score) best = { score, heard: a, hit };
  }
  return best;
}

/* ================= App badge (number on the Home Screen icon) ================= */
function updateBadge() {
  if (!state.settings || !state.settings.badge || !navigator.setAppBadge) return;
  try { const n = dueInfo().total; dueCache.clear(); n ? navigator.setAppBadge(n) : navigator.clearAppBadge(); } catch { /* not supported */ }
}

/* ================= Starter packs ================= */
function parseWordLines(text, defPos) {
  const out = []; let topic = "";
  for (const raw of String(text).split("\n")) {
    const line = raw.trim();
    if (!line) continue;
    if (line.startsWith("# ")) { topic = line.slice(2).trim(); continue; }
    const [tg, de, type, ex, exDe, note] = line.split("|").map((x) => (x || "").trim());
    if (!tg) continue;
    let pos = type || defPos || "";
    if (/^n[mfn]$/.test(pos)) pos = "n";
    out.push({ tg, de, pos: POS[pos] ? pos : "", ex, exDe, note, topic });
  }
  return out;
}
function packCards(code, pack) {
  const now = Math.max(nowTs(), ...state.cards.map((c) => c.created + 1)), out = [];
  let i = 0;
  const mk = (o) => normCard({ ...o, lang: code, pack: pack.id, deck: pack.name, created: now + i++ });
  for (const part of pack.parts || []) {
    if (part.kind === "words") for (const w of parseWordLines(part.data, part.pos)) out.push(mk({ type: "word", tg: w.tg, de: w.de, pos: w.pos, ex: w.ex, exDe: w.exDe, note: w.note, topic: w.topic || part.topic || "" }));
    if (part.kind === "cloze") for (const w of parseWordLines(part.data)) out.push(mk({ type: "cloze", tg: w.tg, de: w.de, note: w.note, topic: w.topic || part.topic || "Grammatik" }));
    if (part.kind === "verbs") for (const v of part.verbs) {
      const r = itConj(v.v, v) || {};
      const tables = {}; for (const [k, f] of Object.entries(r)) if (!k.startsWith("_")) tables[k] = f;
      out.push(mk({ type: "verb", tg: v.v, de: v.de, pos: "v", topic: part.topic || "Verben", note: v.note || "", ex: v.ex || "", exDe: v.exDe || "", tables, aux: r._aux, isc: !!v.isc }));
    }
    if (part.kind === "enverbs") for (const line of part.data.split("\n")) {
      const [inf, past, pp, de, ex, exDe] = line.split("|").map((x) => (x || "").trim());
      if (!inf) continue;
      const r = enConj(inf, { past, pp }) || {};
      out.push(mk({ type: "verb", tg: inf, de, pos: "v", topic: part.topic || "Unregelmäßige Verben", ex: ex || "", exDe: exDe || "", tables: r }));
    }
  }
  return out.filter(Boolean);
}
/* Same word = same language, same kind, same text (ignoring case, punctuation and accents) */
const sameKey = (c) => `${c.lang}|${c.type === "cloze" ? "c" : "w"}|${bareAns(flat(normAns(c.tg)))}`;
function loadPack(code, packId) {
  const pack = (STARTER[code] || []).find((p) => p.id === packId);
  if (!pack) return { added: 0, adopted: 0, skipped: 0 };
  const have = new Map(state.cards.filter((c) => c.lang === code).map((c) => [sameKey(c), c]));
  const add = []; let adopted = 0, skipped = 0;
  for (const c of packCards(code, pack)) {
    const old = have.get(sameKey(c));
    if (!old) { add.push(c); have.set(sameKey(c), c); continue; }
    if (pack.adopt && old.deck !== pack.name) {
      old.deck = pack.name; old.topic = c.topic;
      if (!old.ex && c.ex) { old.ex = c.ex; old.exDe = c.exDe; }
      if (!old.note && c.note) old.note = c.note;
      old.updated = nowTs(); adopted++;
    } else skipped++;
  }
  state.cards = state.cards.concat(add); reindex(); save();
  return { added: add.length, adopted, skipped };
}
