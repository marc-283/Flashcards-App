/*CORE-START*/
/* ================= Helpers ================= */
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const pad2 = (n) => String(n).padStart(2, "0");

/* Learning day: a new day starts at the rollover hour (default 4:00), like Anki */
function dayNum(ts, roll) {
  const d = new Date(ts - (roll || 0) * 3600e3);
  return Math.round(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) / 864e5);
}
function dayStart(n, roll) {
  const d = new Date(n * 864e5);
  return new Date(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), roll || 0).getTime();
}
function dayKey(n) { const d = new Date(n * 864e5); return `${d.getUTCFullYear()}-${pad2(d.getUTCMonth() + 1)}-${pad2(d.getUTCDate())}`; }
function keyDay(k) { const [y, m, d] = k.split("-").map(Number); return Math.round(Date.UTC(y, m - 1, d) / 864e5); }

/* ================= Spaced repetition: FSRS-5 ================= */
const FS = {
  w: [0.40255, 1.18385, 3.173, 15.69105, 7.1949, 0.5345, 1.4604, 0.0046, 1.54575, 0.1192, 1.01925, 1.9395, 0.11, 0.29605, 2.2698, 0.2315, 2.9898, 0.51655, 0.6621],
  DECAY: -0.5, FACTOR: 19 / 81
};
const fsR = (t, s) => Math.pow(1 + FS.FACTOR * t / s, FS.DECAY);
const fsIvl = (s, r) => s / FS.FACTOR * (Math.pow(r, 1 / FS.DECAY) - 1);
const fsD0 = (g) => clamp(FS.w[4] - Math.exp(FS.w[5] * (g - 1)) + 1, 1, 10);
function fsNextD(d, g) {
  const w = FS.w, d2 = d + (-w[6] * (g - 3)) * (10 - d) / 9;
  return clamp(w[7] * (w[4] - Math.exp(w[5] * 3) + 1) + (1 - w[7]) * d2, 1, 10);
}
function fsRecall(d, s, r, g) {
  const w = FS.w;
  return s * (1 + Math.exp(w[8]) * (11 - d) * Math.pow(s, -w[9]) * (Math.exp(w[10] * (1 - r)) - 1) * (g === 2 ? w[15] : 1) * (g === 4 ? w[16] : 1));
}
function fsForget(d, s, r) {
  const w = FS.w;
  const f = w[11] * Math.pow(d, -w[12]) * (Math.pow(s + 1, w[13]) - 1) * Math.exp(w[14] * (1 - r));
  return Math.min(f, s / Math.exp(w[17] * w[18]));
}
const fsShort = (s, g) => s * Math.exp(FS.w[17] * (g - 3 + FS.w[18]));
function hashStr(s) { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return (h >>> 0) / 4294967296; }

/* One answer. st: previous state or null (new). g: 1 again, 2 hard, 3 good, 4 easy.
   cfg: { now, roll, ret (desired retention), max (max interval days), seed, fresh (seen the first time in this session) } */
function srsCalc(st, g, cfg) {
  const today = dayNum(cfg.now, cfg.roll);
  let s, d;
  if (!st || !st.s) { s = FS.w[g - 1]; d = fsD0(g); }
  else {
    const t = today - st.ld;
    d = fsNextD(st.d, g);
    if (t <= 0) s = fsShort(st.s, g);
    else { const r = fsR(t, st.s); s = g === 1 ? fsForget(st.d, st.s, r) : fsRecall(st.d, st.s, r, g); }
  }
  s = clamp(s, 0.05, 36500);
  let ivl = 0;
  if (g > 1) {
    ivl = Math.round(fsIvl(s, cfg.ret || 0.9));
    if (ivl >= 3) ivl = Math.round(ivl * (0.95 + 0.1 * hashStr((cfg.seed || "") + "|" + ((st && st.reps) || 0))));
    ivl = clamp(ivl, 1, cfg.max || 3650);
    if (cfg.fresh) ivl = Math.min(ivl, g === 4 ? 4 : g === 3 ? 1 : 1);
  }
  return {
    st: g === 1 ? "lrn" : "rev", s: Math.round(s * 1000) / 1000, d: Math.round(d * 1000) / 1000, ld: today, ivl,
    due: g === 1 ? cfg.now + 10 * 60e3 : dayStart(today + ivl, cfg.roll),
    reps: ((st && st.reps) || 0) + 1, lapses: ((st && st.lapses) || 0) + (g === 1 && st && st.st === "rev" ? 1 : 0), lg: g
  };
}
/* All four outcomes, kept in order so Hard ≤ Good < Easy */
function srsOptions(st, cfg) {
  const o = [1, 2, 3, 4].map((g) => srsCalc(st, g, cfg));
  if (o[2].ivl <= o[1].ivl && !cfg.fresh) { o[2].ivl = o[1].ivl + 1; o[2].due = dayStart(o[2].ld + o[2].ivl, cfg.roll); }
  if (o[3].ivl <= o[2].ivl) { o[3].ivl = Math.min(cfg.max || 3650, o[2].ivl + 1); o[3].due = dayStart(o[3].ld + o[3].ivl, cfg.roll); }
  return o;
}
/* UI texts: the app defines T() (German/English); without it (tests) the German text is used */
const tr = (s, a) => (typeof T === "function" ? T(s, a) : String(s).replace(/\{(\d+)\}/g, (_, i) => (a ? a[i] : "")));
function fmtIvl(r) {
  if (!r || r.st === "lrn") return tr("<10 Min");
  const d = r.ivl;
  if (d < 14) return tr("{0} T", [d]);
  if (d < 60) return tr("{0} Wo", [Math.round(d / 7)]);
  if (d < 365) return tr("{0} Mo", [Math.round(d / 30.4)]);
  const y = (Math.round(d / 36.5) / 10).toString();
  return tr("{0} J", [typeof UI !== "undefined" && UI === "en" ? y : y.replace(".", ",")]);
}

/* ================= Languages ================= */
const IT_TENSES = ["Presente", "Passato prossimo", "Imperfetto", "Futuro semplice", "Condizionale presente", "Congiuntivo presente", "Congiuntivo imperfetto", "Passato remoto", "Imperativo"];
const PRESETS = {
  en: { code: "en", name: "Englisch", tts: "en-GB", color: "#3FA9FF", persons: ["I", "you", "he/she/it", "we", "you (pl.)", "they"],
    tenses: [{ n: "Stammformen", labels: ["infinitive", "past simple", "past participle"], given: [0] }, { n: "Present simple" }, { n: "Present progressive" }, { n: "Past simple" }, { n: "Present perfect" }, { n: "Future (will)" }],
    active: ["Stammformen"], articles: ["the", "a", "an", "to"] },
  it: { code: "it", name: "Italienisch", tts: "it-IT", color: "#2EE6D6", persons: ["io", "tu", "lui/lei", "noi", "voi", "loro"],
    tenses: IT_TENSES.map((n) => (n === "Imperativo" ? { n, labels: ["tu", "Lei", "noi", "voi", "Loro"] } : { n })),
    active: ["Presente", "Passato prossimo"], articles: ["il", "lo", "la", "l'", "i", "gli", "le", "un", "uno", "una", "un'"] },
  es: { code: "es", name: "Spanisch", tts: "es-ES", color: "#FF8A3D", persons: ["yo", "tú", "él/ella/usted", "nosotros", "vosotros", "ellos/ustedes"],
    tenses: ["Presente", "Pretérito perfecto", "Pretérito indefinido", "Pretérito imperfecto", "Futuro simple", "Condicional", "Subjuntivo presente"].map((n) => ({ n })),
    active: ["Presente"], articles: ["el", "la", "los", "las", "un", "una", "unos", "unas", "lo"] },
  fr: { code: "fr", name: "Französisch", tts: "fr-FR", color: "#C77DFF", persons: ["je", "tu", "il/elle", "nous", "vous", "ils/elles"],
    tenses: ["Présent", "Passé composé", "Imparfait", "Futur simple", "Conditionnel présent", "Subjonctif présent"].map((n) => ({ n })),
    active: ["Présent"], articles: ["le", "la", "l'", "les", "un", "une", "des", "du", "de la"] },
  pt: { code: "pt", name: "Portugiesisch", tts: "pt-PT", color: "#30D97F", persons: ["eu", "tu", "ele/ela/você", "nós", "vós", "eles/elas/vocês"],
    tenses: ["Presente", "Pretérito perfeito", "Pretérito imperfeito", "Futuro", "Condicional"].map((n) => ({ n })),
    active: ["Presente"], articles: ["o", "a", "os", "as", "um", "uma"] },
  nl: { code: "nl", name: "Niederländisch", tts: "nl-NL", color: "#FF5FA8", persons: ["ik", "jij", "hij/zij", "wij", "jullie", "zij"],
    tenses: [{ n: "Stammformen", labels: ["infinitief", "imperfectum", "voltooid deelwoord"], given: [0] }, { n: "Presens" }, { n: "Imperfectum" }, { n: "Perfectum" }],
    active: ["Stammformen"], articles: ["de", "het", "een"] },
  sv: { code: "sv", name: "Schwedisch", tts: "sv-SE", color: "#F5C04A", persons: [],
    tenses: [{ n: "Stammformen", labels: ["infinitiv", "presens", "preteritum", "supinum"], given: [0] }],
    active: ["Stammformen"], articles: ["en", "ett", "att"] }
};
const DE_ARTICLES = ["der", "die", "das", "den", "dem", "des", "ein", "eine", "einen", "einem", "einer", "sich", "etw.", "jdn.", "jdm."];
function tenseLabels(L, t) { return t.labels || L.persons || []; }

/* ================= Answer checking ================= */
function normAns(s) {
  return String(s == null ? "" : s).normalize("NFC").toLowerCase().replace(/[’‘`´ʼ]/g, "'").replace(/[.!?¿¡…"“”„«»]+/g, " ").replace(/\s+/g, " ").trim();
}
const bareAns = (s) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/ß/g, "ss");
const flat = (s) => s.replace(/[,;:]/g, " ").replace(/\s+/g, " ").trim();
function expandParens(p) {
  let out = [p];
  for (let k = 0; k < 3; k++) {
    const next = [];
    for (const s of out) {
      const m = /\(([^()]*)\)/.exec(s);
      if (!m) { next.push(s); continue; }
      const before = s.slice(0, m.index), after = s.slice(m.index + m[0].length), inner = m[1];
      const glued = /\S$/.test(before) && !/^\s/.test(inner);
      if (glued && inner.includes("/")) {
        next.push(before + after);
        inner.split("/").forEach((o) => next.push(before + o.trim() + after));
      } else {
        next.push((before + after).replace(/\s+/g, " ").trim());
        next.push((before + inner + after).replace(/\s+/g, " ").trim());
      }
    }
    out = next;
  }
  return out;
}
/* "andato/a" → andato, andata; "stati/e" → stati, state */
function expandGender(p) {
  const toks = p.split(" ");
  let out = [""];
  for (const t of toks) {
    const m = /^(.+?[aeiouàèéìòù])\/([aeiou]{1,2})$/i.exec(t);
    let opts = [t];
    if (m && m[1].length > m[2].length) { const base = m[1]; opts = [base, base.slice(0, base.length - m[2].length) + m[2], t]; }
    const next = [];
    for (const o of out) for (const x of opts) next.push(o ? o + " " + x : x);
    out = next.slice(0, 24);
  }
  return out;
}
function answerVariants(expected, native) {
  const parts = String(expected || "").split(native ? /\s*[;,|]\s*|\s+\/\s+/ : /\s*[;|]\s*|\s+\/\s+/).filter((x) => x.trim());
  const out = new Set();
  for (const p of parts) for (const v of expandParens(p)) for (const g of expandGender(v)) { const n = normAns(g); if (n) out.add(n); }
  return [...out];
}
function lev(a, b) {
  if (a === b) return 0;
  if (!a.length) return b.length; if (!b.length) return a.length;
  let prev = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    const cur = [i];
    for (let j = 1; j <= b.length; j++) cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    prev = cur;
  }
  return prev[b.length];
}
function stripArticle(s, arts) {
  for (const a of arts) {
    if (a.endsWith("'")) { if (s.startsWith(a)) return s.slice(a.length).trim(); }
    else if (s.startsWith(a + " ")) return s.slice(a.length + 1).trim();
  }
  return s;
}
/* Returns { res: "exact" | "close" | "wrong", why: "" | "accent" | "article" | "typo" } */
function checkAnswer(input, expected, o) {
  o = o || {};
  const inp = flat(normAns(input));
  if (!inp) return { res: "wrong", why: "" };
  const vars = answerVariants(expected, o.native).map(flat);
  if (!vars.length) return { res: "wrong", why: "" };
  if (vars.includes(inp)) return { res: "exact", why: "" };
  const arts = o.native ? DE_ARTICLES : (o.articles || []);
  const sa = (s) => stripArticle(s, arts);
  if (o.native && vars.some((v) => sa(v) === sa(inp))) return { res: "exact", why: "" };
  if (vars.some((v) => sa(v) === v && sa(inp) === v)) return { res: "exact", why: "" };
  if (vars.some((v) => bareAns(v) === bareAns(inp))) return { res: "close", why: "accent" };
  if (vars.some((v) => sa(v) === sa(inp) || bareAns(sa(v)) === bareAns(sa(inp)))) return { res: o.native ? "exact" : "close", why: o.native ? "" : "article" };
  let best = 99, len = 0;
  for (const v of vars) { const a = bareAns(sa(v)), b = bareAns(sa(inp)), d = lev(a, b); if (d < best) { best = d; len = a.length; } }
  const allowed = len >= 9 ? 2 : len >= 4 ? 1 : 0;
  if (best <= allowed) return { res: "close", why: "typo" };
  return { res: "wrong", why: "" };
}
/* Cloze: "Vado {{a}} Roma" → { text: "Vado ___ Roma", gaps: ["a"] } */
function parseCloze(s) {
  const gaps = [];
  const text = String(s || "").replace(/\{\{(.+?)\}\}/g, (_, g) => { gaps.push(g.trim()); return "___"; });
  return { text, gaps };
}

/* ================= Conjugation: Italian (regular verbs, spelling rules, reflexives) ================= */
const IT_E = {
  P: { are: ["o", "i", "a", "iamo", "ate", "ano"], ere: ["o", "i", "e", "iamo", "ete", "ono"], ire: ["o", "i", "e", "iamo", "ite", "ono"], isc: ["isco", "isci", "isce", "iamo", "ite", "iscono"] },
  I: { are: ["avo", "avi", "ava", "avamo", "avate", "avano"], ere: ["evo", "evi", "eva", "evamo", "evate", "evano"], ire: ["ivo", "ivi", "iva", "ivamo", "ivate", "ivano"] },
  F: { are: ["erò", "erai", "erà", "eremo", "erete", "eranno"], ere: ["erò", "erai", "erà", "eremo", "erete", "eranno"], ire: ["irò", "irai", "irà", "iremo", "irete", "iranno"] },
  C: { are: ["erei", "eresti", "erebbe", "eremmo", "ereste", "erebbero"], ere: ["erei", "eresti", "erebbe", "eremmo", "ereste", "erebbero"], ire: ["irei", "iresti", "irebbe", "iremmo", "ireste", "irebbero"] },
  CP: { are: ["i", "i", "i", "iamo", "iate", "ino"], ere: ["a", "a", "a", "iamo", "iate", "ano"], ire: ["a", "a", "a", "iamo", "iate", "ano"], isc: ["isca", "isca", "isca", "iamo", "iate", "iscano"] },
  CI: { are: ["assi", "assi", "asse", "assimo", "aste", "assero"], ere: ["essi", "essi", "esse", "essimo", "este", "essero"], ire: ["issi", "issi", "isse", "issimo", "iste", "issero"] },
  PR: { are: ["ai", "asti", "ò", "ammo", "aste", "arono"], ere: ["ei", "esti", "é", "emmo", "este", "erono"], ire: ["ii", "isti", "ì", "immo", "iste", "irono"] },
  IMP: { are: ["a", "i", "iamo", "ate", "ino"], ere: ["i", "a", "iamo", "ete", "ano"], ire: ["i", "a", "iamo", "ite", "ano"], isc: ["isci", "isca", "iamo", "ite", "iscano"] }
};
const IT_AUX = { avere: ["ho", "hai", "ha", "abbiamo", "avete", "hanno"], essere: ["sono", "sei", "è", "siamo", "siete", "sono"] };
const IT_REFL = ["mi", "ti", "si", "ci", "vi", "si"];
const IT_KEYS = { P: "Presente", PP: "Passato prossimo", I: "Imperfetto", F: "Futuro semplice", C: "Condizionale presente", CP: "Congiuntivo presente", CI: "Congiuntivo imperfetto", PR: "Passato remoto", IMP: "Imperativo" };
const splitForms = (s) => (Array.isArray(s) ? s : String(s || "").split(",")).map((x) => x.trim());
/* o: { isc, aux, pp, irr, P, I, F, CP, ... (overrides as "a, b, c" strings) } → { "Presente": [...], ... } */
function itConj(inf0, o) {
  o = o || {};
  let inf = normAns(inf0), refl = false;
  if (/rsi$/.test(inf)) { refl = true; inf = inf.slice(0, -2) + "e"; }
  const m = /^(.+?)(are|ere|ire)$/.exec(inf);
  if (!m) return null;
  const st = m[1], cl = m[2], isc = cl === "ire" && !!o.isc;
  const aux = refl ? "essere" : (o.aux === "essere" ? "essere" : "avere");
  const hardCG = cl === "are" && /[cg]$/.test(st), endI = cl === "are" && /i$/.test(st), softI = cl === "are" && /[cg]i$/.test(st);
  const join = (e) => {
    let s = st;
    if (hardCG && /^[ie]/.test(e)) s += "h";
    if (endI && /^i/.test(e)) s = s.slice(0, -1);
    else if (softI && /^e/.test(e)) s = s.slice(0, -1);
    return s + e;
  };
  const tab = (k) => (IT_E[k][isc && IT_E[k].isc ? "isc" : cl]).map(join);
  const out = {};
  const ov = (k) => (o[k] ? splitForms(o[k]) : null);
  out.P = ov("P") || tab("P");
  out.I = ov("I") || tab("I");
  out.F = ov("F") || tab("F");
  out.C = ov("C") || (o.F ? ["ei", "esti", "ebbe", "emmo", "este", "ebbero"].map((e) => out.F[0].slice(0, -1) + e) : tab("C"));
  out.CP = ov("CP") || (o.irr ? null : tab("CP"));
  if (!o.irr) {
    out.CI = ov("CI") || tab("CI");
    if (!o.pp || cl !== "ere") out.PR = ov("PR") || tab("PR");
    out.IMP = ov("IMP") || tab("IMP");
  }
  const pp = o.pp || (st + (cl === "are" ? "ato" : cl === "ere" ? "uto" : "ito"));
  const agree = (i) => (aux === "essere" && /o$/.test(pp) ? (i < 3 ? pp + "/a" : pp.slice(0, -1) + "i/e") : pp);
  out.PP = ov("PP") || IT_AUX[aux].map((a, i) => `${a} ${agree(i)}`);
  if (refl) {
    for (const k of ["P", "I", "F", "C", "CP", "CI", "PR"]) if (out[k] && !o[k]) out[k] = out[k].map((f, i) => `${IT_REFL[i]} ${f}`);
    if (!o.PP) out.PP = out.PP.map((f, i) => `${IT_REFL[i]} ${f}`);
    if (out.IMP && !o.IMP) { const e = ["ti", null, "ci", "vi", null]; out.IMP = out.IMP.map((f, i) => (e[i] ? f + e[i] : "si " + f)); }
  }
  const res = {};
  for (const [k, n] of Object.entries(IT_KEYS)) if (out[k]) res[n] = out[k];
  res._pp = pp; res._aux = aux;
  return res;
}

/* ================= Conjugation: English ================= */
function enPast(v) {
  if (/e$/.test(v)) return v + "d";
  if (/[^aeiou]y$/.test(v)) return v.slice(0, -1) + "ied";
  if (/^[^aeiou]*[aeiou][^aeiouwxy]$/.test(v)) return v + v.slice(-1) + "ed";
  return v + "ed";
}
function en3(v) {
  if (v === "have") return "has";
  if (/(s|sh|ch|x|z|o)$/.test(v)) return v + "es";
  if (/[^aeiou]y$/.test(v)) return v.slice(0, -1) + "ies";
  return v + "s";
}
function enIng(v) {
  if (/ie$/.test(v)) return v.slice(0, -2) + "ying";
  if (/[^e]e$/.test(v) && v !== "be") return v.slice(0, -1) + "ing";
  if (/^[^aeiou]*[aeiou][^aeiouwxy]$/.test(v)) return v + v.slice(-1) + "ing";
  return v + "ing";
}
function enConj(inf0, o) {
  o = o || {};
  const inf = normAns(inf0).replace(/^to /, "");
  if (!inf || /\s/.test(inf.trim()) && !o.past) return null;
  const past = o.past || enPast(inf), pp = o.pp || past;
  const first = (s) => s.split(/\s*\/\s*|;/)[0].trim();
  const res = { "Stammformen": [inf, past, pp] };
  if (inf === "be") {
    res["Present simple"] = ["am", "are", "is", "are", "are", "are"];
    res["Past simple"] = ["was", "were", "was", "were", "were", "were"];
  } else {
    res["Present simple"] = [inf, inf, en3(inf), inf, inf, inf];
    res["Past simple"] = Array(6).fill(first(past));
  }
  const ing = enIng(inf);
  res["Present progressive"] = ["am", "are", "is", "are", "are", "are"].map((a) => `${a} ${ing}`);
  res["Present perfect"] = ["have", "have", "has", "have", "have", "have"].map((a) => `${a} ${first(pp)}`);
  res["Future (will)"] = Array(6).fill(`will ${inf}`);
  return res;
}

/* ================= CSV / text import ================= */
function decodeBytes(buf) {
  try { return new TextDecoder("utf-8", { fatal: true }).decode(buf); }
  catch { return new TextDecoder("windows-1252").decode(buf); }
}
function parseCSV(text) {
  text = String(text).replace(/^﻿/, "");
  const sample = text.split(/\r?\n/).filter((l) => l.trim()).slice(0, 40);
  let delim = "\t", bestScore = -1;
  for (const d of ["\t", ";", ",", "|"]) {
    const counts = sample.map((l) => { let c = 0, q = false; for (const ch of l) { if (ch === '"') q = !q; else if (ch === d && !q) c++; } return c; });
    const freq = {}; counts.filter((c) => c > 0).forEach((c) => { freq[c] = (freq[c] || 0) + 1; });
    for (const [c, n] of Object.entries(freq)) { const score = n * 10 - Number(c); if (n >= sample.length * 0.6 && score > bestScore) { bestScore = score; delim = d; } }
  }
  if (bestScore < 0) {
    if (sample.every((l) => / - | – | = /.test(l))) return { delim: "-", rows: text.split(/\r?\n/).filter((l) => l.trim()).map((l) => l.split(/\s+[-–=]\s+/).map((c) => c.trim())) };
  }
  const rows = []; let row = [], field = "", q = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (q) { if (ch === '"') { if (text[i + 1] === '"') { field += '"'; i++; } else q = false; } else field += ch; }
    else if (ch === '"' && field === "") q = true;
    else if (ch === delim) { row.push(field); field = ""; }
    else if (ch === "\n" || ch === "\r") { if (ch === "\r" && text[i + 1] === "\n") i++; row.push(field); rows.push(row); row = []; field = ""; }
    else field += ch;
  }
  if (field !== "" || row.length) { row.push(field); rows.push(row); }
  return { delim, rows: rows.map((r) => r.map((c) => c.trim())).filter((r) => r.some((c) => c !== "")) };
}
const IMPORT_H = {
  de: /^(de|deutsch|german|übersetzung|uebersetzung|translation|bedeutung|meaning|definition)$/i,
  tg: /^(word|wort|term|begriff|vokabel|english|englisch|italiano|italian|italienisch|español|spanish|spanisch|français|french|französisch|front|vorderseite|target|fremdsprache)$/i,
  ex: /^(beispiel|example|satz|sentence)$/i,
  topic: /^(thema|topic|tag|tags|kategorie|category|deck|lektion|lesson)$/i,
  note: /^(notiz|note|notes|hinweis|kommentar|comment)$/i
};

/* ================= Calendar reminder (.ics) ================= */
function icsDaily(hhmm, title, url, startKey) {
  const [h, m] = String(hhmm || "19:00").split(":").map(Number);
  const d = (startKey || "2026-01-01").replace(/-/g, "");
  const t = `${pad2(h || 0)}${pad2(m || 0)}00`;
  const uid = "plm-reminder-" + d + t + "@plm";
  return ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//PLM//Flashcards//DE", "CALSCALE:GREGORIAN", "BEGIN:VEVENT", `UID:${uid}`, `DTSTAMP:${d}T000000Z`,
    `DTSTART:${d}T${t}`, "DURATION:PT10M", "RRULE:FREQ=DAILY", `SUMMARY:${title}`, url ? `URL:${url}` : "", `DESCRIPTION:${tr("Zeit für deine Karten in PLM.")}${url ? "\\n" + url : ""}`,
    "BEGIN:VALARM", "ACTION:DISPLAY", `DESCRIPTION:${title}`, "TRIGGER:PT0M", "END:VALARM", "END:VEVENT", "END:VCALENDAR"].filter(Boolean).join("\r\n");
}

/* ================= Layout recognition (photo / PDF text → card pairs) ================= */
const LANG_HINTS = {
  it: { w: "il lo la i gli le un una uno di da che è e non per sono come dove sei mi ti si ci del della alla al nel con ho hai ha questo cosa anche molto ma io tu lui lei noi voi loro buongiorno grazie prego ciao scusa", end: /[aeiouàèéìòù]$/, chars: /[àèìòù]|zione|gli|gn|cch|zz/ },
  en: { w: "the a an to of and is are you your it in on at what how do don't i my me be see good night is it's for with this that can where name hi hello bye goodbye soon tomorrow morning evening live work study speak listen visit spell repeat mean say", end: /[^aeiou]$|y$/, chars: /th|w|y|k|[a-z]'[a-z]|ck|sh|ing\b|ee|oo|ea|ou/ },
  de: { w: "der die das den dem des ein eine einen und ist nicht ich du sie es zu mit von wie was wo bitte danke auf für im am sich", end: /[^aeiou]$|e$/, chars: /[äöüß]|sch|ung\b|ch/ },
  es: { w: "el la los las un una de que y en es no por con para mi tu su muy", end: /[aeoos]$/, chars: /ñ|[áéíóú]|ción/ },
  fr: { w: "le la les un une de du des et est ne pas je tu il elle nous vous", end: /e$|[^aeiou]$/, chars: /[çâêîôûëïœ]|eau|oui/ }
};
for (const v of Object.values(LANG_HINTS)) v.set = new Set(v.w.split(" "));
function langScores(text, cands) {
  const words = String(text).toLowerCase().replace(/[^\p{L}' ’]/gu, " ").split(/\s+/).filter((x) => x.length > 0);
  const out = {};
  for (const c of cands) {
    const H = LANG_HINTS[c]; if (!H) { out[c] = 0; continue; }
    let s = 0;
    for (const w of words) { if (H.set.has(w)) s += 2; if (H.chars.test(w)) s += 1.5; if (w.length > 2 && H.end.test(w)) s += 0.5; }
    if (c === "de" && /\b[A-ZÄÖÜ][a-zäöüß]+/.test(text.slice(1))) s += 1;
    out[c] = s / Math.max(1, words.length);
  }
  return out;
}
const bestLang = (sc) => Object.entries(sc).sort((a, b) => b[1] - a[1])[0][0];
/* Italian article for a noun marked (m.) / (f.) */
function itArticle(word, g) {
  const w = word.toLowerCase();
  if (/^[aeiouàèéìòùh]/.test(w)) return "l'";
  if (g === "f") return "la ";
  if (/^(s[^aeiou]|z|gn|ps|pn|x|y|i[aeiou])/.test(w)) return "lo ";
  return "il ";
}
const SEP_TOK = /^[=→⟶➝➔—–\-:>»|•·+]+$/;
const ARTIFACT = /^[|\\/\][{}_~^°*'"`´.,;:]+$/;
function cleanCell(t) {
  return t.replace(/\s+/g, " ").replace(/^[^\p{L}\p{N}¿¡"'(«]+/u, "").replace(/^[b-df-hj-np-tv-z]\s+(?=\p{Lu})/u, "").replace(/[\s|•·*"“”=+→—–»-]+$/g, "").trim();
}
/* lines: [{ words: [{ text, x0, x1, y0, y1, conf? }] }]; o: { target, meanings: ["de","en"], width } */
function parseLayout(lines, o) {
  o = o || {};
  const target = o.target || "it", others = (o.meanings || ["de", "en"]).filter((x) => x !== target), cands = [target].concat(others);
  const W = o.width || Math.max(1, ...lines.flatMap((l) => l.words.map((w) => w.x1)));
  // low OCR confidence is fine when the cell clearly reads as real words of one of the languages
  const wordy = (t) => { const ws = t.split(/\s+/); return ws.every((w) => /^[\p{L}'’]{2,}[.,!?;:…]*$/u.test(w) && /[aeiouyàèéìòùäöü]/i.test(w)) && Math.max(...cands.map((k) => langScores(t, [k])[k])) >= 1; };
  const weak = (w) => ARTIFACT.test(w.text) || (w.conf != null && w.conf < 35 && w.text.length <= 2) || w.text === "|" || (/^[Il1]$/.test(w.text) && w.conf != null && w.conf < 60);
  // 1. clean words
  const L = lines.map((l) => {
    let ws = l.words.filter((w) => w.text && w.text.trim());
    while (ws.length && weak(ws[0])) ws = ws.slice(1);
    while (ws.length && weak(ws[ws.length - 1])) ws = ws.slice(0, -1);
    return ws.map((w) => ({ ...w, text: w.text.replace(/[’‘]/g, "'") }));
  }).filter((ws) => ws.length);
  const gaps = [];
  for (const ws of L) for (let i = 1; i < ws.length; i++) gaps.push(ws[i].x0 - ws[i - 1].x1);
  gaps.sort((a, b) => a - b);
  const medGap = gaps.length ? gaps[Math.floor(gaps.length / 2)] : 8;
  const hs = L.flatMap((ws) => ws.map((w) => w.y1 - w.y0)).sort((a, b) => a - b), medH = hs.length ? hs[Math.floor(hs.length / 2)] : 12;
  const cut = Math.max(medGap * 2.4, medH * 1.1, W * 0.022);
  // 2. cells (split on wide gaps and on arrows/dashes)
  const rows = L.map((ws) => {
    const cells = []; let cur = null, sepNext = false;
    const push = () => { if (cur && cur.words.length) cells.push(cur); cur = null; };
    for (const w of ws) {
      const t = w.text;
      if (SEP_TOK.test(t)) { push(); sepNext = true; continue; }
      const gm = /^\((m|f|m\.\/f\.|m\/f)\.?\)$/i.exec(t.replace(/[£€]/g, "f"));
      if (gm) { const g = gm[1].toLowerCase(); if (cur) cur.g = g === "f" ? "f" : g === "m" ? "m" : "mf"; continue; }
      if (cur && w.x0 - cur.x1 > cut) push();
      if (!cur) { cur = { words: [], confs: [], x0: w.x0, x1: w.x1, y0: w.y0, y1: w.y1, sep: sepNext }; sepNext = false; }
      cur.words.push(t); cur.confs.push(w.conf == null ? 90 : w.conf); cur.x1 = w.x1; cur.y0 = Math.min(cur.y0, w.y0); cur.y1 = Math.max(cur.y1, w.y1);
    }
    push();
    for (const c of cells) { c.text = cleanCell(c.words.join(" ")); c.h = c.y1 - c.y0; c.conf = c.confs.reduce((a, b) => a + b, 0) / c.confs.length; }
    return cells.filter((c) => (/\p{L}/u.test(c.text) || /^\d{1,4}$/.test(c.text)) && !c.words.some((w) => w.length > 24) && (c.conf >= 45 || (c.conf >= 20 && wordy(c.text)) || (c.text.replace(/[^\p{L}]/gu, "").length >= 4 && c.text === c.text.toUpperCase() && /^[\p{Lu}\s'"*.-]+$/u.test(c.text))));
  }).filter((r) => r.length);
  const allCells = rows.flat();
  // 3. which language are the translations in? (page level)
  for (const c of allCells) c.sc = langScores(c.text, cands);
  const ml = others.length ? others.map((k) => [k, allCells.reduce((a, c) => a + (c.sc[k] > c.sc[target] ? c.sc[k] : 0), 0)]).sort((a, b) => b[1] - a[1])[0][0] : "de";
  // 4. target vs. meaning per cell, smoothed by its column
  const xs = allCells.map((c) => c.x0).sort((a, b) => a - b), tol = W * 0.03, cols = [];
  for (const x of xs) { const last = cols[cols.length - 1]; if (last && x - last.max <= tol) { last.n++; last.max = x; last.sum += x; } else cols.push({ n: 1, max: x, sum: x }); }
  const anchors = cols.map((c) => c.sum / c.n);
  const colOf = (x) => anchors.reduce((b, a, i) => (Math.abs(a - x) < Math.abs(anchors[b] - x) ? i : b), 0);
  const colT = anchors.map(() => [0, 0]);
  for (const c of allCells) { c.col = colOf(c.x0); c.num = /^\d{1,4}$/.test(c.text); c.d = c.num ? -5 : c.sc[target] - c.sc[ml]; if (Math.abs(c.d) >= 0.5 && !c.num) colT[c.col][c.d > 0 ? 0 : 1]++; }
  for (const c of allCells) { const ct = colT[c.col], n = ct[0] + ct[1], bias = n >= 3 ? 0.8 * (2 * ct[0] / n - 1) : 0; c.isT = c.d + bias > 0 || (c.d + bias === 0 && (n === 0 || ct[0] >= ct[1])); }
  // 5. orientation: target left of meaning, or the other way round?
  let tm = 0, mt = 0;
  for (const r of rows) for (let i = 0; i < r.length - 1; i++) { if (r[i].isT && !r[i + 1].isT) tm++; if (!r[i].isT && r[i + 1].isT) mt++; }
  const tFirst = tm >= mt;
  const caps = (t) => t.replace(/[^\p{L}]/gu, "").length >= 3 && t === t.toUpperCase();
  const fixIt = (t) => (target === "it" ? t.replace(/(^|\s)&(?=\s)/g, "$1è").replace(/^lo (sono|ho|mi chiamo|abito|parlo|lavoro|vado)\b/, "Io $1") : t);
  const fixCase = (t) => fixIt(caps(t) ? t.toLowerCase() : t);
  const withArt = (c) => {
    if (target === "it" && c.g && !/\s/.test(c.text) && !/^(il|lo|la|l'|i|gli|le)\s/i.test(c.text)) return (c.g === "mf" ? (/^[aeiouh]/i.test(c.text) ? "l'" : "") : itArticle(c.text, c.g)) + c.text.toLowerCase();
    return fixCase(c.text);
  };
  const pairsTotal = tm + mt, items = [], heads = [];
  const medCellH = (() => { const a = allCells.map((c) => c.h).sort((a, b) => a - b); return a[Math.floor(a.length / 2)] || 12; })();
  const headOk = pairsTotal >= 2;
  const isHead = (c) => headOk && c.text.split(/\s+/).length <= 6 && c.text.replace(/[^\p{L}]/gu, "").length >= 3 && (caps(c.text) || (o.pdf && c.h > medCellH * 1.35));
  for (const r0 of rows) {
    const r = r0.filter((c) => { if (isHead(c)) { heads.push({ x: c.x0, x1: c.x1, y: c.y0, text: c.text }); return false; } return true; });
    for (let i = 0; i < r.length; i++) {
      const a = r[i], b = r[i + 1];
      if (b && a.num && b.isT) {
        // "1 uno" in a numbers list – but not "3 Gioco" / "5 Esercizio" (numbered exercises)
        if (/^[\p{Ll}'’]{3,}$/u.test(b.text) && b.conf >= 75 && Number(a.text) <= 1000) items.push({ tg: withArt(b), de: a.text, x: b.x0, y: b.y0, pair: true });
        i++; continue;
      }
      if (a.num) continue;
      const pa = tFirst ? a : b, pb = tFirst ? b : a;
      if (b && pa.isT && !pb.isT && !pb.num) { items.push({ tg: withArt(pa), de: fixCase(pb.text), ml, x: a.x0, y: a.y0, pair: true, cf: Math.min(a.conf, b.conf) }); i++; continue; }
      if (b && b.sep && pb.isT && !pa.isT && !pa.num) { items.push({ tg: withArt(pb), de: fixCase(pa.text), ml, x: a.x0, y: a.y0, pair: true, cf: Math.min(a.conf, b.conf) }); i++; continue; }
      const parts = a.text.split(/\s+[=–—-]\s+|\s*→\s*/);
      if (parts.length === 2 && parts[0] && parts[1]) {
        const s0 = langScores(parts[0], cands), s1 = langScores(parts[1], cands), d0 = s0[target] - s0[ml], d1 = s1[target] - s1[ml];
        if (d0 >= d1 && d1 < 0.5) { items.push({ tg: fixCase(parts[0]), de: fixCase(parts[1]), ml, x: a.x0, y: a.y0, pair: true }); continue; }
        if (d1 > d0 && d0 < 0.5) { items.push({ tg: fixCase(parts[1]), de: fixCase(parts[0]), ml, x: a.x0, y: a.y0, pair: true }); continue; }
      }
      if (!a.isT) continue;
      const letters = a.text.replace(/[^\p{L}]/gu, "").length;
      const junkWord = (w) => (w.replace(/[^\p{L}]/gu, "").length === 1 && !/^[aeioèàù]$/i.test(w.replace(/[^\p{L}]/gu, ""))) || (!caps(a.text) && /^\p{Lu}{2,3}[.,]?$/u.test(w));
      if (letters >= 3 && a.text.split(/\s+/).length <= 8 && a.conf >= 60 && !a.text.split(/\s+/).some(junkWord)) items.push({ tg: withArt(a), de: "", x: a.x0, y: a.y0, pair: false });
    }
  }
  // drop OCR noise from pictures: one-letter sides, bracket fragments, tiny low-confidence bits
  const letters = (t) => t.replace(/[^\p{L}]/gu, "").length;
  for (let i = items.length - 1; i >= 0; i--) {
    const it = items[i]; if (!it.pair || /^\d{1,4}$/.test(it.de)) continue;
    const lt = letters(it.tg), lm = letters(it.de), cf = it.cf == null ? 90 : it.cf;
    if (lt < 2 || lm < 2 || /[[\]{}<>]/.test(it.tg + it.de) || ((lt <= 3 || lm <= 3) && cf < 80) || (lt <= 3 && lm <= 3 && cf < 88) || (lm <= 3 && it.de === it.de.toUpperCase())) items.splice(i, 1);
  }
  // explanations next to an example ("o refer to singular masculine nouns,") look like pairs – keep them, but unticked
  const wc = (t) => t.split(/\s+/).filter(Boolean).length;
  const shout = (t) => t.split(/\s+/).filter((w) => w.replace(/[^\p{L}]/gu, "").length >= 3 && w === w.toUpperCase() && /\p{L}/u.test(w)).length;
  for (const it of items) {
    if (!it.pair || /^\d{1,4}$/.test(it.de)) continue;
    const sentence = /[.?!]$/.test(it.tg) && wc(it.tg) >= 2;
    if ((wc(it.de) >= 5 && wc(it.de) > 1.6 * wc(it.tg) + 1) || /[,;:]$/.test(it.de) || (/^\p{Ll}/u.test(it.de) && (wc(it.de) >= 5 || sentence)) || (it.cf != null && it.cf < 70) ||
      (letters(it.de) <= 2 && letters(it.tg) >= 4) || shout(it.de) >= 2) it.doubt = true;
  }
  // 6. topic = nearest heading above in the same column region
  for (const it of items) {
    let best = null;
    for (const h of heads) if (h.y < it.y && it.x >= h.x - W * 0.03 && it.x <= Math.max(h.x1, h.x + W * 0.12) + W * 0.03 && (!best || h.y > best.y)) best = h;
    if (!best) for (const h of heads) if (h.y < it.y && (!best || h.y > best.y)) best = h;
    it.topic = best ? best.text.charAt(0) + best.text.slice(1).toLowerCase().replace(/[*"”]+$/, "").trim() : "";
  }
  return { items: items.map(({ x, y, cf, ...rest }) => rest), pairs: items.filter((x) => x.pair).length, ml };
}
/*CORE-END*/
