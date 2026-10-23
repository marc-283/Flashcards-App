/* ================= Study session: learn, practice, drill, test, build ================= */
const GRADE_TXT = [T("Nochmal"), T("Schwer"), T("Gut"), T("Leicht")];
const WHY_TXT = { accent: T("Fast – achte auf den Akzent"), article: T("Fast – der Artikel fehlt oder stimmt nicht"), typo: T("Fast – kleiner Tippfehler") };
const reduceMotion = () => matchMedia("(prefers-reduced-motion: reduce)").matches;
const newSession = (kind, o, queue) => ({ kind, o, queue, total: queue.length, done: 0, correct: 0, missed: new Set(), wrongIds: new Set(), history: [], t0: nowTs(), secs: 0 });

function startLearn(o) {
  o = o || {};
  const q = buildQueue(o);
  if (!q.length) { toast(o.extraNew ? T("Keine weiteren neuen Karten") : T("Für heute ist nichts mehr fällig")); return false; }
  state.study = newSession("learn", o, q.map((e) => ({ ...e, intro: !!e.isNew && state.settings.intro })));
  openStudy();
  return true;
}
const cardHardness = (c) => Object.values(c.srs).reduce((a, s) => a + (s.lapses || 0) * 3 + (s.d || 0), 0);
function poolOf(o) {
  return (o.ids ? o.ids.map(cardById).filter(Boolean) : state.cards.filter((c) => inScope(c, o))).filter((c) => !c.susp && (c.de || c.type === "cloze"));
}
function practiceEntries(o) {
  let pool = poolOf(o);
  const t = today();
  if (o.sel === "hard") pool = pool.filter((c) => Object.values(c.srs).some((s) => s.lapses || s.d >= 7)).sort((a, b) => cardHardness(b) - cardHardness(a)).slice(0, Math.max(o.count * 2, 20));
  if (o.sel === "recent") pool = pool.filter((c) => Object.values(c.srs).some((s) => s.reps <= 3 && s.ld >= t - 3));
  if (o.sel === "new") pool = pool.filter((c) => !isLearned(c));
  if (o.sel === "verbs") pool = pool.filter((c) => c.type === "verb");
  shuffle(pool);
  return pool.slice(0, o.count || 20).map((c) => {
    const L = langOf(c.lang); let items = itemsOf(c, L);
    if (!items.length) items = c.type === "cloze" ? ["c"] : ["r"];
    if (o.sel === "verbs") { const tb = items.filter((k) => k.startsWith("t:")); if (tb.length) items = tb; }
    return { id: c.id, k: items[Math.floor(Math.random() * items.length)], lang: c.lang };
  });
}
function startPractice(o) {
  const q = practiceEntries(o);
  if (!q.length) { toast(T("Keine passenden Karten zum Üben")); return; }
  state.study = newSession("practice", o, q);
  openStudy();
}
function drillEntries(o) {
  const L = langOf(o.lang); if (!L) return [];
  const verbs = state.cards.filter((c) => c.lang === o.lang && c.type === "verb" && !c.susp && (!o.ids || o.ids.includes(c.id)));
  const out = [];
  for (const c of verbs) for (const t of L.tenses) {
    if (!o.tenses.includes(t.n)) continue;
    const f = c.tables && c.tables[t.n]; if (!f) continue;
    f.forEach((x, i) => { if (x && !(t.given || []).includes(i)) out.push({ id: c.id, k: "d:" + t.n, i, lang: c.lang }); });
  }
  return shuffle(out).slice(0, o.count || 20);
}
function startDrill(o) {
  const q = drillEntries(o);
  if (!q.length) { toast(T("Für diese Zeiten sind noch keine Formen eingetragen")); return; }
  state.study = newSession("drill", o, q);
  openStudy();
}
/* Test: mixed, auto-checked questions, scored at the end */
function testEntries(o) {
  const pool = shuffle(poolOf(o)).slice(0, o.count || 20);
  return pool.map((c) => {
    const L = langOf(c.lang), r = Math.random();
    if (c.type === "cloze") return { id: c.id, k: "c", lang: c.lang, mode: r < 0.5 ? "choice" : "type" };
    if (c.type === "verb" && c.tables && r < 0.55) {
      const ts = L.tenses.filter((t) => L.active.includes(t.n) && c.tables[t.n] && c.tables[t.n].some(Boolean));
      if (ts.length) { const t = ts[Math.floor(Math.random() * ts.length)], idx = c.tables[t.n].map((x, i) => (x && !(t.given || []).includes(i) ? i : -1)).filter((i) => i >= 0); if (idx.length) return { id: c.id, k: "d:" + t.n, i: idx[Math.floor(Math.random() * idx.length)], lang: c.lang, mode: "type" }; }
    }
    if (c.pos === "s" && wordCount(c.tg) >= 2) return { id: c.id, k: "b", lang: c.lang, mode: "tiles", sent: { tg: c.tg, de: c.de } };
    if (r < 0.5) return { id: c.id, k: "f", lang: c.lang, mode: "type" };
    return { id: c.id, k: r < 0.75 ? "r" : "f", lang: c.lang, mode: "choice" };
  });
}
function startTest(o) {
  const q = testEntries(o);
  if (q.length < 3) { toast(T("Für einen Test braucht das Projekt mindestens 3 Karten")); return; }
  state.study = newSession("test", o, q);
  state.study.answers = [];
  openStudy();
}
function openStudy() {
  closeSheets();
  $("study").hidden = false; document.body.style.overflow = "hidden";
  state.study.stage = null; showEntry();
}
function closeStudy() {
  saveNow();
  stopSpeak();
  try { if (curRec) curRec.abort(); } catch { /* ignore */ }
  $("study").hidden = true; state.study = null; document.body.style.overflow = "";
  render(); updateBadge();
  if (typeof syncSoon === "function") syncSoon(2000);
}

/* ---------- Faces ---------- */
/* English verbs: "to" is optional when typing (go = to go, to come up with = come up with) */
function answerFor(c, L) {
  if (L.code !== "en" || /[;|]|\s\/\s|\(/.test(c.tg)) return c.tg;
  if (/^to\s/i.test(c.tg)) return "(to) " + c.tg.slice(3);
  if (c.type === "verb" || c.pos === "v") return "(to) " + c.tg;
  return c.tg;
}
const isSentence = (c) => c.pos === "s" || wordCount(c.tg) >= 5;
function faceOf(c, k, L) {
  const ml = meaningName(c);
  if (k === "f") return { dir: `${ml} → ${lname(L)}`, prompt: c.de, ans: answerFor(c, L), shown: c.tg, native: false, hint: c.pos === "n" && hasGenderedNouns(L) ? T("mit Artikel") : "", sayAns: c.tg };
  if (k === "r") return { dir: `${lname(L)} → ${ml}`, prompt: c.tg, ans: c.de, native: !c.ml, sayPrompt: c.tg };
  if (k === "c") { const cz = parseCloze(c.tg); return { dir: T("Lückensatz"), cloze: cz, prompt: cz.text, hint: c.de, sayAns: fillCloze(c.tg) }; }
  const tense = k.slice(2), t = L.tenses.find((x) => x.n === tense) || { n: tense };
  const labels = tenseLabels(L, t), forms = (c.tables && c.tables[tense]) || [];
  return { dir: tense, prompt: c.tg, hint: c.de, table: { labels, forms, given: t.given || [] }, sayAns: forms.map((f, i) => (labels[i] && !t.given ? `${labels[i].split("/")[0]} ${f}` : f)).filter((x) => x.trim()).join(", ") };
}
const fillCloze = (s) => String(s).replace(/\{\{(.+?)\}\}/g, "$1");
function choicesFor(c, k) {
  let right, cands;
  const same = state.cards.filter((x) => x.lang === c.lang && x.id !== c.id && (k === "c" ? x.type === "cloze" : x.type !== "cloze" && x.de));
  if (k === "c") {
    const cz = parseCloze(c.tg); if (cz.gaps.length !== 1) return null;
    right = cz.gaps[0];
    cands = same.flatMap((x) => parseCloze(x.tg).gaps.map((g) => ({ t: g, s: (x.topic === c.topic ? 2 : 0) + Math.random() })));
  } else {
    const field = k === "f" ? "tg" : "de"; right = c[field];
    const sent = c.pos === "s";
    cands = same.filter((x) => (x.pos === "s") === sent).map((x) => ({ t: x[field], s: (x.pos === c.pos ? 2 : 0) + (x.type === c.type ? 1 : 0) + (x.topic === c.topic ? 1 : 0) + (x.deck === c.deck ? 0.5 : 0) + Math.random() * 1.5 }));
  }
  const seen = new Set([normAns(right)]), pick = [];
  for (const x of cands.sort((a, b) => b.s - a.s)) { const n = normAns(x.t); if (!n || seen.has(n)) continue; seen.add(n); pick.push(x.t); if (pick.length === 3) break; }
  return pick.length < 3 ? null : shuffle([right, ...pick]);
}
function modeFor(e, c) {
  const S = state.study;
  if (e.k === "b") return S.kind === "build" ? S.o.style || "tiles" : e.mode || "tiles";
  if (S.kind === "drill" || e.k.startsWith("d:")) return "type";
  let m = e.mode || state.settings.mode;
  if (e.k.startsWith("t:")) return m === "choice" ? "flip" : m;
  if (m === "type" && e.k === "r" && isSentence(c) && S.kind !== "test") return "flip";
  if (m === "choice") { if (!e.choices) e.choices = choicesFor(c, e.k); if (!e.choices) return e.k === "c" || S.kind === "test" ? "type" : "flip"; }
  return m;
}

/* ---------- Flow ---------- */
function showEntry() {
  const S = state.study;
  while (S.queue.length && !cardById(S.queue[0].id)) S.queue.shift();
  const e = S.queue[0];
  if (!e) { S.stage = "done"; finishSession(S); renderStudy(); return; }
  S.res = null; S.typed = null; S.mic = null; S.ai = null; e.t0 = nowTs();
  if (e.k === "b" && !e.tiles) prepTiles(e);
  S.stage = e.intro ? "intro" : "ask";
  renderStudy();
  const c = cardById(e.id);
  if (state.settings.autoSpeak && S.kind !== "drill" && S.kind !== "test" && e.k !== "b") {
    if (S.stage === "intro" && e.k !== "c") speak(c.tg, c.lang, { quiet: true });
    else if (S.stage === "ask" && e.k === "r") speak(c.tg, c.lang, { quiet: true });
  }
  focusInput();
}
function focusInput() {
  const inp = $("studyIn").querySelector("input[data-i], textarea[data-i]");
  if (!inp || state.study.stage !== "ask") return;
  if (matchMedia("(hover: hover) and (pointer: fine)").matches) inp.focus();
  else setTimeout(() => { try { inp.focus(); } catch { /* ignore */ } }, 60);
}
/* Turn the card: animate out, swap content, animate in */
function flipThen(fn) {
  const S = state.study, card = $("studyIn").querySelector(".fcard");
  if (!S || S.busy) return;
  if (!card || reduceMotion()) { fn(); return; }
  S.busy = true;
  card.classList.add("flip-out");
  setTimeout(() => { if (!state.study) return; S.busy = false; S.flipIn = true; fn(); }, 150);
}
function reveal() {
  const S = state.study, e = S.queue[0], c = cardById(e.id);
  flipThen(() => {
    S.stage = "shown"; renderStudy();
    if (state.settings.autoSpeak && S.kind !== "drill" && (e.k === "f" || e.k === "c" || e.k === "b")) speak(e.k === "b" ? e.sent.tg : faceOf(c, e.k, langOf(c.lang)).sayAns, c.lang, { quiet: true });
  });
}
function introFlip() {
  const S = state.study;
  if (S.stage !== "intro") return;
  flipThen(() => { S.stage = "introBack"; renderStudy(); });
}
function checkTyped() {
  const S = state.study, e = S.queue[0], c = cardById(e.id), L = langOf(c.lang);
  if (S.stage !== "ask") return;
  const inputs = [...$("studyIn").querySelectorAll("[data-i]")];
  const vals = inputs.map((x) => x.value);
  S.typed = vals;
  if (e.k === "b") {
    const user = modeFor(e, c) === "tiles" ? e.picked.map((i) => e.tiles[i].t).join(" ") : vals[0] || "";
    const r = compareSentence(user, e.sent.tg, L);
    S.res = { parts: [r], sug: r.res === "exact" ? 3 : r.res === "close" ? 2 : 1, cmp: r, user };
  } else if (e.k === "f" || e.k === "r") {
    const fc = faceOf(c, e.k, L);
    const r = isSentence(c) && e.k === "f" ? compareSentence(vals[0], fc.shown, L) : checkAnswer(vals[0], fc.ans, { native: fc.native, articles: fc.native ? [] : L.articles });
    S.res = { parts: [r], sug: r.res === "exact" ? 3 : r.res === "close" ? 2 : 1, cmp: r.toks ? r : null, user: vals[0] };
  } else if (e.k === "c") {
    const gaps = parseCloze(c.tg).gaps, parts = gaps.map((g, i) => checkAnswer(vals[i] || "", g, { articles: L.articles }));
    S.res = { parts, sug: sugOf(parts) };
  } else if (e.k.startsWith("d:")) {
    const form = c.tables[e.k.slice(2)][e.i], r = checkAnswer(vals[0], form, {});
    S.res = { parts: [r], sug: r.res === "exact" ? 3 : r.res === "close" ? 2 : 1 };
  } else {
    const fc = faceOf(c, e.k, L), parts = fc.table.forms.map((f, i) => (fc.table.given.includes(i) || !f ? null : checkAnswer(vals[inputs.findIndex((x) => Number(x.dataset.i) === i)] || "", f, {})));
    S.res = { parts, sug: sugOf(parts.filter(Boolean)) };
  }
  reveal();
}
const sugOf = (parts) => { const bad = parts.filter((p) => p.res === "wrong").length, close = parts.filter((p) => p.res === "close").length; return bad === 0 && close === 0 ? 3 : bad === 0 || (bad === 1 && parts.length >= 4) ? 2 : 1; };
function chooseOption(idx) {
  const S = state.study, e = S.queue[0], c = cardById(e.id), L = langOf(c.lang);
  if (S.stage !== "ask" || !e.choices) return;
  const fc0 = e.k === "c" ? null : faceOf(c, e.k, L), right = e.k === "c" ? parseCloze(c.tg).gaps[0] : (e.k === "f" ? fc0.shown : fc0.ans), pickd = e.choices[idx];
  const ok = normAns(pickd) === normAns(right);
  S.res = { chose: idx, parts: [{ res: ok ? "exact" : "wrong" }], sug: ok ? 3 : 1 };
  reveal();
}
function dunno() {
  const S = state.study, e = S.queue[0], c = cardById(e.id), L = langOf(c.lang);
  let n = 1;
  if (e.k === "c") n = parseCloze(c.tg).gaps.length;
  if (e.k.startsWith("t:")) { const fc = faceOf(c, e.k, L); S.res = { parts: fc.table.forms.map((f, i) => (fc.table.given.includes(i) || !f ? null : { res: "wrong" })), sug: 1 }; }
  else S.res = { parts: Array.from({ length: n }, () => ({ res: "wrong" })), sug: 1, dunno: true };
  S.typed = [];
  reveal();
}
function grade(g, override) {
  const S = state.study, e = S.queue[0]; if (!e || S.busy) return;
  const c = cardById(e.id), secs = Math.min(90, Math.round((nowTs() - (e.t0 || nowTs())) / 1000));
  const st = statOf(today(), c.lang, true);
  S.history.push({ queue: S.queue.map((x) => ({ ...x })), done: S.done, correct: S.correct, missed: [...S.missed], wrongIds: [...S.wrongIds], answers: S.answers ? S.answers.slice() : null, id: c.id, k: e.k, prev: c.srs[e.k] ? { ...c.srs[e.k] } : null, code: c.lang, stat: { ...st } });
  if (S.history.length > 30) S.history.shift();
  const key = e.id + "|" + e.k + "|" + (e.i == null ? "" : e.i);
  if (S.kind === "learn") {
    const nst = srsOptions(c.srs[e.k] || null, srsCfg(e, c))[g - 1];
    c.srs = { ...c.srs, [e.k]: { ...nst, t: nowTs() } };
    st.r++; if (g > 1) st.ok++; if (e.isNew && !e.counted) { st.n++; e.counted = true; }
  } else st.p++;
  st.s += secs; S.secs += secs;
  S.queue.shift();
  if (S.kind === "test") {
    S.answers.push({ id: c.id, k: e.k, ok: g > 1, override: !!override });
    S.done++; if (g > 1) S.correct++; else { S.missed.add(key); S.wrongIds.add(c.id); }
  } else if (g === 1) {
    S.missed.add(key); S.wrongIds.add(c.id);
    const back = { ...e, isNew: false, fresh: true, intro: false, choices: null, tiles: null, picked: null, again: (e.again || 0) + 1 };
    if (S.kind === "drill" || (S.kind === "build" && e.again)) S.done++;
    else S.queue.splice(Math.min(S.queue.length, 3 + Math.floor(Math.random() * 2)), 0, back);
  } else { S.done++; if (!S.missed.has(key)) S.correct++; }
  save();
  showEntry();
}
function introDone(known) {
  const S = state.study, e = S.queue[0];
  if (known) { e.intro = false; e.t0 = nowTs(); grade(4); return; }
  S.queue.shift();
  S.queue.splice(Math.min(S.queue.length, 2 + Math.floor(Math.random() * 2)), 0, { ...e, intro: false, fresh: true });
  showEntry();
}
function undoStudy() {
  const S = state.study, h = S.history.pop(); if (!h) return;
  const c = cardById(h.id);
  if (c) { const srs = { ...c.srs }; if (h.prev) srs[h.k] = h.prev; else delete srs[h.k]; c.srs = srs; }
  const st = statOf(today(), h.code, true); Object.assign(st, h.stat);
  S.queue = h.queue; S.done = h.done; S.correct = h.correct; S.missed = new Set(h.missed); S.wrongIds = new Set(h.wrongIds);
  if (h.answers) S.answers = h.answers;
  const e = S.queue[0]; e.picked = []; e.t0 = nowTs();
  save(); S.res = null; S.mic = null; S.stage = "ask"; renderStudy();
}
function finishSession(S) {
  if (S.kind !== "test" || S.saved || !S.done) return;
  S.saved = true;
  const pct = Math.round(S.correct / S.done * 100), key = `${S.o.lang}|${S.o.deck}`;
  if (S.o.deck != null) { (state.tests[key] = state.tests[key] || []).push({ d: dayKey(today()), at: nowTs(), s: pct, n: S.done }); if (state.tests[key].length > 30) state.tests[key].shift(); save(); }
}

/* ---------- Sentence tools ---------- */
const wordCount = (s) => String(s || "").trim().split(/\s+/).filter(Boolean).length;
const looksSentence = (t) => wordCount(t) >= 3 && /[.?!…]["»”]?$/.test(String(t).trim());
const tokSplit = (s) => String(s || "").replace(/[¿¡«»“”„"]/g, "").trim().split(/\s+/).map((w) => w.replace(/^[(]+|[.,;:!?…)]+$/g, "")).filter(Boolean);
/* Word-by-word comparison with tolerance for accents and small typos */
function compareSentence(input, target, L) {
  const norm = (w) => normAns(w).replace(/[.,;:!?…]/g, "");
  const u = tokSplit(input).map(norm).filter(Boolean), t = tokSplit(target).map(norm).filter(Boolean);
  const eq = (a, b) => a === b ? 2 : (bareAns(a) === bareAns(b) || (b.length >= 4 && lev(bareAns(a), bareAns(b)) <= 1)) ? 1 : 0;
  const n = u.length, m = t.length, D = Array.from({ length: n + 1 }, () => new Array(m + 1).fill(0));
  for (let i = n - 1; i >= 0; i--) for (let j = m - 1; j >= 0; j--) D[i][j] = eq(u[i], t[j]) ? 1 + D[i + 1][j + 1] : Math.max(D[i + 1][j], D[i][j + 1]);
  const toks = [], hitT = new Array(m).fill(0);
  let i = 0, j = 0;
  while (i < n && j < m) {
    const q = eq(u[i], t[j]);
    if (q && D[i][j] === 1 + D[i + 1][j + 1]) { toks.push({ w: tokSplit(input)[i] || u[i], st: q === 2 ? "ok" : "close" }); hitT[j] = q; i++; j++; }
    else if (D[i + 1][j] >= D[i][j + 1]) { toks.push({ w: tokSplit(input)[i] || u[i], st: "bad" }); i++; }
    else j++;
  }
  while (i < n) { toks.push({ w: tokSplit(input)[i] || u[i], st: "bad" }); i++; }
  const tt = tokSplit(target), missing = tt.filter((_, k) => !hitT[k]);
  const bad = toks.filter((x) => x.st === "bad").length, close = toks.filter((x) => x.st === "close").length;
  const res = !n ? "wrong" : !bad && !missing.length ? (close ? "close" : "exact") : "wrong";
  return { res, why: close && res === "close" ? "accent" : "", toks, missing, tHit: hitT, tToks: tt };
}
function prepTiles(e) {
  const toks = tokSplit(e.sent.tg), have = new Set(toks.map((t) => normAns(t)));
  const extra = [];
  if (toks.length >= 3) {
    const bank = sentenceBank(e.lang).filter((s) => s.tg !== e.sent.tg);
    for (const s of shuffle(bank.slice())) {
      for (const w of tokSplit(s.tg)) { const n = normAns(w); if (!have.has(n) && w.length <= 12 && !extra.some((x) => normAns(x) === n)) { extra.push(w); break; } }
      if (extra.length >= (toks.length >= 6 ? 3 : 2)) break;
    }
  }
  e.tiles = shuffle(toks.concat(extra).map((t) => ({ t })));
  e.picked = [];
}

/* ---------- Rendering ---------- */
function studyTop(S) {
  const total = S.done + S.queue.length, pct = total ? S.done / total * 100 : 100;
  return `<div class="st-top">
    <button class="mbtn" data-action="study-close" aria-label="${T("Beenden")}">✕</button>
    <div class="st-prog" role="progressbar" aria-valuemin="0" aria-valuemax="${total}" aria-valuenow="${S.done}"><span style="width:${pct.toFixed(1)}%"></span></div>
    <span class="st-count"><b>${num(S.done)}</b> / ${num(total)}</span>
    <button class="mbtn" data-action="study-undo" aria-label="${T("Rückgängig")}"${S.history.length && S.kind !== "test" ? "" : " disabled"}>↶</button>
  </div>`;
}
/* Big speaker, slow speaker and (on the answer side) the microphone */
function sayRow(text, back) {
  if (!text || (!canSpeak() && !(back && canListen()))) return "";
  return `<div class="say">${canSpeak() ? `<button class="say-big" data-action="say" data-arg="${esc(text)}" aria-label="${T("Anhören")}">${ICON_SPEAK_BIG}</button><button class="say-small" data-action="say-slow" data-arg="${esc(text)}" aria-label="${T("Langsam anhören")}">${ICON_SLOW}</button>` : ""}${back && canListen() ? `<button class="say-small mic" data-action="mic" data-arg="${esc(text)}" aria-label="${T("Nachsprechen und prüfen")}">${ICON_MIC}</button>` : ""}</div>${back ? micHTML() : ""}`;
}
function micHTML() {
  const S = state.study, m = S && S.mic;
  if (!m) return `<div class="mic-res" id="micRes" hidden></div>`;
  if (m.state === "listen") return `<div class="mic-res" id="micRes"><span class="pulse"></span>${T("Sprich jetzt …")}</div>`;
  if (m.error) return `<div class="mic-res" id="micRes">${esc(m.error)}</div>`;
  const words = tokSplit(m.target);
  const verdict = m.score >= 0.9 ? ["ok", T("Sehr gut verstanden!")] : m.score >= 0.6 ? ["close", T("Fast – die rot markierten Wörter nochmal üben")] : ["bad", T("Nicht verstanden – hör es dir an und versuch es nochmal")];
  return `<div class="mic-res" id="micRes"><b class="fc-res ${verdict[0]}">${verdict[1]}</b><span class="mic-words">${words.map((w, i) => `<span class="${m.hit[i] ? "pos" : "neg"}">${esc(w)}</span>`).join(" ")}</span><small>${T("Gehört: „{0}“", [esc(m.heard || "–")])}</small></div>`;
}
function exampleHTML(c) {
  let h = "";
  if (c.ex && c.type !== "cloze") h += `<div class="fc-ex"><div class="fc-ex-row"><span>${esc(c.ex)}</span>${canSpeak() ? `<button class="say-mini" data-action="say" data-arg="${esc(c.ex)}" aria-label="${T("Beispiel anhören")}">${ICON_SPEAK}</button>` : ""}</div>${c.exDe ? `<small>${esc(c.exDe)}</small>` : ""}</div>`;
  if (c.note) h += `<div class="fc-note">${esc(c.note)}</div>`;
  return h;
}
function tableGrid(fc, mode, res, typed) {
  const { labels, forms, given } = fc.table;
  let k = 0;
  const ask = forms.map((f, i) => (f && !given.includes(i) ? i : -1)).filter((i) => i >= 0);
  return `<div class="conj">${forms.map((f, i) => {
    if (!f && !given.includes(i)) return "";
    const lab = `<span class="p">${esc(labels[i] || "")}</span>`;
    if (given.includes(i)) return `${lab}<span class="f">${esc(f)}</span>`;
    if (mode === "ask") return `${lab}<input data-i="${i}" autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false" enterkeyhint="${++k === ask.length ? "done" : "next"}" aria-label="${esc(labels[i] || T("Form"))}">`;
    const p = res && res.parts[i], cls = p ? (p.res === "exact" ? "ok" : p.res === "close" ? "close" : "bad") : "";
    const yours = p && p.res !== "exact" && typed ? typed[ask.indexOf(i)] : "";
    return `${lab}<span class="f ${cls}">${esc(f)}${yours ? `<small>${esc(yours)}</small>` : ""}</span>`;
  }).join("")}</div>`;
}
function resLine(res) {
  if (!res) return "";
  const p = res.parts.filter(Boolean), bad = p.filter((x) => x.res === "wrong").length, close = p.filter((x) => x.res === "close");
  if (res.dunno) return `<div class="fc-res bad">${T("So geht's:")}</div>`;
  if (p.length > 1) return `<div class="fc-res ${bad ? "bad" : close.length ? "close" : "ok"}">${bad ? T("{0} von {1} richtig", [p.length - bad, p.length]) : close.length ? T("Fast alles richtig{0}", [close[0].why ? " – " + WHY_TXT[close[0].why].split("– ")[1] : ""]) : T("Alles richtig!")}</div>`;
  const r = p[0];
  return `<div class="fc-res ${r.res === "exact" ? "ok" : r.res === "close" ? "close" : "bad"}">${r.res === "exact" ? T("Richtig!") : r.res === "close" ? WHY_TXT[r.why] || T("Fast richtig") : T("Leider falsch")}</div>`;
}
function cmpHTML(cmp) {
  if (!cmp || !cmp.toks) return "";
  return `<div class="cmp">${cmp.toks.map((t) => `<span class="w ${t.st}">${esc(t.w)}</span>`).join(" ")}${cmp.missing.length ? `<small>${T("Fehlt: {0}", [cmp.missing.map(esc).join(", ")])}</small>` : ""}</div>`;
}
const cardWrap = (S, label, color, body, tap, extraCls) => `<div class="fcard${tap ? " tap" : ""}${S.flipIn ? " flip-in" : ""}${extraCls ? " " + extraCls : ""}"${tap ? ` data-action="${tap}"` : ""}><div class="fc-head"><span class="label" style="color:${color}">${esc(label)}</span><div class="fc-tools"><button class="mbtn" data-action="study-edit" aria-label="${T("Karte bearbeiten")}">✎</button></div></div><div class="fc-body">${body}</div></div>`;

function renderStudy() {
  const S = state.study, root = $("studyIn");
  if (!S) return;
  if (S.stage === "done") { root.innerHTML = doneHTML(S); return; }
  const e = S.queue[0], c = cardById(e.id), L = langOf(c.lang);
  const kindTag = S.kind === "practice" ? `${T("Üben ·")} ` : S.kind === "test" ? `${T("Test ·")} ` : S.kind === "build" ? `${T("Sätze bauen ·")} ` : e.isNew ? `${T("Neu ·")} ` : e.again ? `${T("Nochmal ·")} ` : "";
  let html;
  if (e.k === "b") html = renderBuild(S, e, c, L, kindTag);
  else if (e.k.startsWith("d:")) html = renderDrill(S, e, c, L, kindTag);
  else if (S.stage === "intro" || S.stage === "introBack") html = renderIntro(S, e, c, L);
  else html = renderAsk(S, e, c, L, kindTag);
  S.flipIn = false;
  root.innerHTML = studyTop(S) + html;
}
function renderIntro(S, e, c, L) {
  const fc = faceOf(c, e.k, L), back = S.stage === "introBack";
  let body;
  if (!back) {
    if (fc.table) body = `<span class="label acc-t">${esc(fc.dir)}</span><div class="fc-prompt">${esc(c.tg)}</div>${sayRow(c.tg)}`;
    else if (fc.cloze) body = `<div class="cloze">${esc(c.tg).replace(/\{\{(.+?)\}\}/g, '<span class="gap">…</span>')}</div><div class="fc-sub">${esc(c.de)}</div>`;
    else body = `<div class="fc-prompt${c.tg.length > 28 ? " long" : ""}">${esc(c.tg)}</div>${sayRow(c.tg)}`;
    body += `<div class="fc-tap">${T("Tippen zum Umdrehen")}</div>`;
    return cardWrap(S, T("Neu · {0}", [lname(L)]), L.color, body, "intro-flip") + `<div class="st-act"><button class="btn primary" data-action="intro-flip">${T("Umdrehen")}</button></div><p class="kbd">${T("Leertaste: umdrehen")}</p>`;
  }
  if (fc.table) body = `<div class="fc-front">${esc(c.tg)} · ${esc(c.de)}</div><span class="label acc-t">${esc(fc.dir)}</span>${tableGrid(fc, "shown")}${sayRow(fc.sayAns, true)}`;
  else if (fc.cloze) body = `<div class="cloze">${esc(c.tg).replace(/\{\{(.+?)\}\}/g, '<span class="gap">$1</span>')}</div><div class="fc-sub">${esc(c.de)}</div>${sayRow(fc.sayAns, true)}`;
  else body = `<div class="fc-front">${esc(c.tg)}</div><div class="fc-ans big">${esc(c.de)}</div>${sayRow(c.tg, true)}`;
  body += exampleHTML(c);
  return cardWrap(S, T("Neu · {0}", [lname(L)]), L.color, body) + `<div class="st-act"><button class="btn" data-action="intro-known">${T("Kenne ich schon")}</button><button class="btn primary" data-action="intro-next">${T("Merken ›")}</button></div><p class="kbd">${T("Enter: merken · K: kenne ich schon")}</p>`;
}
function renderAsk(S, e, c, L, kindTag) {
  const fc = faceOf(c, e.k, L), mode = modeFor(e, c), shown = S.stage === "shown", res = S.res;
  let body = "", foot = "";
  if (fc.table) {
    body = shown ? `<div class="fc-front">${esc(c.tg)} · ${esc(c.de)}</div><span class="label acc-t">${esc(fc.dir)}</span>` : `<span class="label acc-t">${esc(fc.dir)}</span><div class="fc-prompt">${esc(c.tg)}</div><div class="fc-sub">${esc(c.de)}</div>`;
    if (!shown) body += mode === "type" ? `<form id="typeForm" style="width:100%">${tableGrid(fc, "ask")}<button type="submit" hidden></button></form>` : `${sayRow(c.tg)}<div class="fc-tap">${T("Tippen zum Umdrehen")}</div>`;
    else body += `${resLine(res)}${tableGrid(fc, "shown", res, S.typed)}${sayRow(fc.sayAns, true)}`;
  } else if (fc.cloze) {
    const gaps = fc.cloze.gaps;
    let gi = 0;
    const sentence = esc(c.tg).replace(/\{\{(.+?)\}\}/g, (_, g) => { const i = gi++, p = res && res.parts[i]; return shown ? `<span class="gap"${p ? ` style="color:var(--${p.res === "exact" ? "pos" : p.res === "close" ? "accent" : "neg"})"` : ""}>${g}</span>` : `<span class="gap">${gaps.length > 1 ? i + 1 : "…"}</span>`; });
    body = `<div class="cloze">${sentence}</div><div class="fc-sub">${esc(c.de)}</div>`;
    if (!shown) {
      if (mode === "type") body += `<form id="typeForm" style="width:100%;display:flex;flex-direction:column;gap:8px">${gaps.map((_, i) => `<input class="typein" data-i="${i}" placeholder="${gaps.length > 1 ? T("Lücke {0}", [i + 1]) : T("Lücke")}" autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false" enterkeyhint="done" aria-label="${T("Lücke {0}", [i + 1])}">`).join("")}<button type="submit" hidden></button></form>`;
      else if (mode === "choice") body += choicesHTML(e, null);
      else body += `<div class="fc-tap">${T("Tippen zum Umdrehen")}</div>`;
    } else {
      body += resLine(res);
      if (mode === "choice") body += choicesHTML(e, res, gaps[0]);
      else if (res && S.typed) body += res.parts.map((p, i) => (p.res !== "exact" && S.typed[i] ? `<div class="fc-yours">${esc(S.typed[i])}</div>` : "")).join("");
      body += sayRow(fc.sayAns, true);
    }
  } else if (!shown) {
    body = `<div class="fc-prompt${fc.prompt.length > 28 ? " long" : ""}">${esc(fc.prompt)}</div>${fc.hint ? `<div class="fc-sub">${esc(fc.hint)}</div>` : ""}`;
    if (e.k === "r") body += sayRow(c.tg);
    if (mode === "type") body += `<form id="typeForm" style="width:100%"><input class="typein" data-i="0" placeholder="${fc.native ? T("Auf Deutsch") : `${T("Auf")} ` + esc(e.k === "f" ? lname(L) : meaningName(c))}" autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false" enterkeyhint="done" aria-label="${T("Antwort")}"></form>`;
    else if (mode === "choice") body += choicesHTML(e, null);
    else body += `<div class="fc-tap">${T("Tippen zum Umdrehen")}</div>`;
  } else {
    body = `<div class="fc-front">${esc(fc.prompt)}</div>`;
    if (mode === "choice") body += `${resLine(res)}${choicesHTML(e, res, e.k === "f" ? fc.shown : fc.ans)}`;
    else {
      body += resLine(res);
      if (e.k === "f") body += `<div class="fc-ans big">${esc(fc.shown)}</div>`;
      else body += `<div class="fc-ans big">${esc(fc.ans)}</div>`;
      if (res && res.cmp) body += cmpHTML(res.cmp);
      else if (res && res.parts[0].res !== "exact" && S.typed && S.typed[0]) body += `<div class="fc-yours">${esc(S.typed[0])}</div>`;
    }
    body += sayRow(c.tg, true);
  }
  if (shown) body += exampleHTML(c);
  const tap = !shown && mode === "flip" ? "study-reveal" : "";
  if (!shown) {
    if (mode === "type") foot = `<div class="st-act"><button class="btn" data-action="study-dunno">${T("Weiß nicht")}</button><button class="btn primary" data-action="study-check">${T("Prüfen")}</button></div>`;
    else if (mode === "flip") foot = `<div class="st-act"><button class="btn primary" data-action="study-reveal">${T("Umdrehen")}</button></div>`;
  } else foot = gradeButtons(S, e, c, res, mode);
  const keys = !shown ? (mode === "flip" ? T("Leertaste: umdrehen") : mode === "choice" ? T("1–4: Antwort wählen") : T("Enter: prüfen")) : S.kind === "learn" ? T("1–4: bewerten · Enter: Vorschlag") : T("Enter: weiter");
  return cardWrap(S, kindTag + fc.dir, L.color, body, tap) + foot + `<p class="kbd">${keys}</p>`;
}
function renderDrill(S, e, c, L, kindTag) {
  const tense = e.k.slice(2), t = L.tenses.find((x) => x.n === tense) || { n: tense }, labels = tenseLabels(L, t), form = c.tables[tense][e.i];
  const r = S.res && S.res.parts[0], shown = S.stage === "shown";
  const body = `<span class="label acc-t">${esc(tense)}</span><div class="fc-prompt">${esc(labels[e.i] || "")} …</div><div class="fc-sub">${esc(c.tg)} · ${esc(c.de)}</div>
    ${!shown ? `<form id="typeForm" style="width:100%"><input class="typein" data-i="0" autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false" enterkeyhint="done" aria-label="${T("Form")}"></form>`
      : `${resLine(S.res)}<div class="fc-ans big">${esc(form)}</div>${r && r.res !== "exact" && S.typed && S.typed[0] ? `<div class="fc-yours">${esc(S.typed[0])}</div>` : ""}${sayRow(`${(labels[e.i] || "").split("/")[0]} ${form}`, true)}`}`;
  const foot = !shown ? `<div class="st-act"><button class="btn" data-action="study-dunno">${T("Weiß nicht")}</button><button class="btn primary" data-action="study-check">${T("Prüfen")}</button></div>`
    : nextButtons(S, r && r.res !== "wrong");
  return cardWrap(S, T("{0}{1} · Konjugation", [kindTag || "", lname(L)]), L.color, body) + foot + `<p class="kbd">${T("Enter: prüfen / weiter")}</p>`;
}
function renderBuild(S, e, c, L, kindTag) {
  const mode = modeFor(e, c), shown = S.stage === "shown", res = S.res;
  let body = `<span class="label acc-t">${T("Übersetze ins {0}e", [esc(lname(L))])}</span><div class="fc-prompt long">${esc(e.sent.de)}</div>`;
  let foot;
  if (!shown) {
    if (mode === "tiles") {
      const end = (e.sent.tg.match(/[.?!…]+$/) || [""])[0];
      body += `<div class="tiles-ans" aria-label="${T("Dein Satz")}">${e.picked.map((ti, j) => `<button class="tile-w on" data-action="tile-out" data-arg="${j}">${esc(e.tiles[ti].t)}</button>`).join("") || `<span class="hint">${T("Tippe die Wörter in der richtigen Reihenfolge an")}</span>`}${e.picked.length && end ? `<span class="tile-end">${esc(end)}</span>` : ""}</div>
        <div class="tiles-pool">${e.tiles.map((x, i) => `<button class="tile-w${e.picked.includes(i) ? " used" : ""}" data-action="tile-in" data-arg="${i}"${e.picked.includes(i) ? " disabled" : ""}>${esc(x.t)}</button>`).join("")}</div>`;
    } else body += `<form id="typeForm" style="width:100%"><textarea class="typein area" data-i="0" rows="2" placeholder="${T("Auf {0}", [esc(lname(L))])}" autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false" enterkeyhint="done" aria-label="${T("Dein Satz")}"></textarea></form>`;
    foot = `<div class="st-act"><button class="btn" data-action="study-dunno">${T("Weiß nicht")}</button><button class="btn primary" data-action="study-check"${mode === "tiles" && !e.picked.length ? " disabled" : ""}>${T("Prüfen")}</button></div>`;
  } else {
    body += resLine(res);
    if (res && res.cmp && res.user && !(S.ai && S.ai.ok)) body += cmpHTML(res.cmp);
    body += `<div class="fc-ans big">${esc(e.sent.tg)}</div>${sayRow(e.sent.tg, true)}`;
    if (S.ai) body += `<div class="ai-res">${S.ai.loading ? `<span class="pulse"></span>${T("KI prüft …")}` : S.ai.error ? esc(S.ai.error) : `<b class="fc-res ${S.ai.ok ? "ok" : "bad"}">${S.ai.ok ? T("Laut KI richtig") : T("Laut KI nicht ganz richtig")}</b>${S.ai.corrected ? `<div>${esc(S.ai.corrected)}</div>` : ""}<small>${esc(S.ai.explanation || "")}</small>`}</div>`;
    const canAi = aiOn() && res && res.user && res.parts[0].res !== "exact" && !S.ai;
    foot = nextButtons(S, res && res.parts[0].res !== "wrong", canAi);
  }
  return cardWrap(S, kindTag + T("{0} · Satz", [lname(L)]), L.color, body) + foot + `<p class="kbd">${shown ? T("Enter: weiter") : T("Enter: prüfen")}</p>`;
}
function nextButtons(S, ok, canAi) {
  const typed = S.res && !S.res.dunno && S.res.parts[0] && S.res.parts[0].res === "wrong";
  return `<div class="st-act">${canAi ? `<button class="btn" data-action="ai-check">${T("KI fragen")}</button>` : ""}${!ok && typed ? `<button class="btn" data-action="study-override">${T("War richtig ✓")}</button>` : ""}<button class="btn primary" data-action="study-grade" data-arg="${ok ? 3 : 1}">${T("Weiter ›")}</button></div>`;
}
function choicesHTML(e, res, right) {
  return `<div class="choices">${e.choices.map((t, i) => {
    let cls = "";
    if (res) { if (normAns(t) === normAns(right)) cls = " ok"; else if (res.chose === i) cls = " bad"; }
    return `<button class="choice${cls}" data-action="study-choose" data-arg="${i}"${res ? " disabled" : ""}><span class="hint" style="margin-right:8px">${i + 1}</span>${esc(t)}</button>`;
  }).join("")}</div>`;
}
function gradeButtons(S, e, c, res, mode) {
  const sug = res ? res.sug : 0;
  if (S.kind === "test") return nextButtons(S, sug > 1);
  if (S.kind !== "learn") return `<div class="st-act"><button class="btn${sug === 1 ? " primary" : ""}" data-action="study-grade" data-arg="1">${T("Nochmal")}</button><button class="btn${sug !== 1 ? " primary" : ""}" data-action="study-grade" data-arg="3">${T("Gewusst ✓")}</button></div>`;
  const opts = srsOptions(c.srs[e.k] || null, srsCfg(e, c));
  return `<div class="grades">${opts.map((o, i) => `<button class="g${i + 1}${sug === i + 1 ? " sug" : ""}" data-action="study-grade" data-arg="${i + 1}"><b>${GRADE_TXT[i]}</b><small>${esc(fmtIvl(o))}</small></button>`).join("")}</div>`;
}
function doneHTML(S) {
  const mins = Math.max(1, Math.round(S.secs / 60)), pct = S.done ? Math.round(S.correct / S.done * 100) : 0, stk = streakInfo();
  let more = "", extra = "";
  if (S.kind === "learn") {
    const d = buildQueue({ ...S.o, countOnly: true });
    more = d.total ? `<button class="btn primary" data-action="study-again">${T("Weiter lernen ({0})", [num(d.total)])}</button>` : d.moreNew ? `<button class="btn primary" data-action="study-more">${T("+ 10 neue Karten")}</button>` : "";
  } else more = `<button class="btn primary" data-action="study-repeat">${S.kind === "test" ? T("Neuer Test") : T("Noch eine Runde")}</button>`;
  if (S.wrongIds.size && S.kind !== "learn") more += `<button class="btn" data-action="study-mistakes">${T("Fehler üben ({0})", [S.wrongIds.size])}</button>`;
  if (S.kind === "test") {
    const wrong = S.answers.filter((a) => !a.ok).map((a) => cardById(a.id)).filter(Boolean);
    extra = wrong.length ? `<section class="sec"><div class="sechead"><h2 class="sectitle">${T("Fehler")}</h2></div>${wrong.map((c) => `<div class="row nochev nobadge"><span class="main"><span class="t1">${esc(c.type === "cloze" ? fillCloze(c.tg) : c.tg)}</span><span class="t2">${esc(c.de)}</span></span><span></span></div>`).join("")}</section>` : "";
  }
  const title = S.kind === "test" ? (pct >= 90 ? T("Sehr gut!") : pct >= 75 ? T("Gut!") : pct >= 60 ? T("Bestanden") : T("Noch nicht ganz")) : pct >= 90 ? T("Stark!") : pct >= 70 ? T("Geschafft!") : T("Dranbleiben!");
  const label = { learn: T("Sitzung beendet"), drill: T("Konjugation"), test: T("Test · {0}", [dn(S.o.deck) || ""]), build: T("Sätze bauen"), practice: T("Übungsrunde") }[S.kind];
  return `<div class="st-top"><button class="mbtn" data-action="study-close" aria-label="${T("Schließen")}">✕</button><span></span><span></span><span></span></div>
    <div class="st-done">
      <span class="label">${esc(label)}</span>
      <h1 class="vtitle">${title}</h1>
      <section class="stats" aria-label="${T("Ergebnis")}">
        <div class="stat"><span class="label">${S.kind === "test" ? T("Fragen") : S.kind === "build" ? T("Sätze") : T("Karten")}</span><span class="v">${num(S.done)}</span></div>
        <div class="stat"><span class="label">${S.kind === "test" ? T("Ergebnis") : T("Auf Anhieb")}</span><span class="v ${pct >= 80 ? "pos" : pct < 60 ? "neg" : ""}">${pct} %</span></div>
        <div class="stat"><span class="label">${T("Zeit")}</span><span class="v">${T("{0} Min.", [mins])}</span></div>
      </section>
      ${stk.cur ? `<p class="hint">${T("🔥 {0} in Folge gelernt{1}", [plural(stk.cur, T("Tag"), T("Tage")), stk.cur >= stk.best && stk.cur > 1 ? ` ${T("– neuer Rekord!")}` : ""])}</p>` : ""}
      <div class="btnrow">${more}<button class="btn" data-action="study-close">${T("Fertig")}</button></div>
      ${extra}
      ${S.kind === "learn" ? `<p class="hint">${T("Die nächsten Wiederholungen plant PLM automatisch. Komm morgen wieder – kurze tägliche Runden bringen am meisten.")}</p>` : ""}
    </div>`;
}

/* ---------- Pronunciation check ---------- */
function micStart(target) {
  const S = state.study; if (!S) return;
  const e = S.queue[0], code = e ? e.lang : null;
  S.mic = { state: "listen", target };
  const box = $("micRes"); if (box) { box.hidden = false; box.outerHTML = micHTML(); }
  listen(code, (r) => {
    if (!state.study) return;
    if (r.error) {
      const msg = r.error === "not-allowed" || r.error === "service-not-allowed" ? T("Kein Zugriff aufs Mikrofon – erlaube es in den Einstellungen bzw. schalte „Diktieren“ ein.") : r.error === "no-speech" ? T("Nichts gehört – tippe aufs Mikrofon und sprich direkt los.") : r.error === "unsupported" ? T("Spracherkennung wird hier nicht unterstützt.") : T("Spracherkennung gerade nicht verfügbar – versuch es nochmal.");
      S.mic = { error: msg, target };
    } else { const m = speechMatch(target, r.alts); S.mic = { target, score: m.score, heard: m.heard, hit: m.hit }; }
    const b = $("micRes"); if (b) b.outerHTML = micHTML();
  });
}

/* ---------- Keyboard ---------- */
function studyKey(ev) {
  const S = state.study;
  if (!S || $("study").hidden || !$("cardSheet").hidden || !$("formSheet").hidden) return;
  const k = ev.key, inInput = ev.target && (ev.target.tagName === "INPUT" || ev.target.tagName === "TEXTAREA");
  if (k === "Escape") { closeStudy(); return; }
  if (S.stage === "done") { if (k === "Enter") { ev.preventDefault(); closeStudy(); } return; }
  const e = S.queue[0], c = e && cardById(e.id);
  if (!c) return;
  if (S.stage === "intro") { if (k === " " || k === "Enter") { ev.preventDefault(); introFlip(); } return; }
  if (S.stage === "introBack") {
    if (k === "Enter" || k === " ") { ev.preventDefault(); introDone(false); }
    else if (k.toLowerCase() === "k" && !inInput) introDone(true);
    return;
  }
  const mode = modeFor(e, c);
  if (S.stage === "ask") {
    if (mode === "flip" && (k === " " || k === "Enter")) { ev.preventDefault(); reveal(); }
    else if (mode === "choice" && /^[1-4]$/.test(k) && e.choices) chooseOption(Number(k) - 1);
    else if (k === "Enter" && (inInput || mode === "tiles")) {
      const ins = [...$("studyIn").querySelectorAll("[data-i]")], i = ins.indexOf(ev.target);
      ev.preventDefault();
      if (i >= 0 && i < ins.length - 1) ins[i + 1].focus(); else checkTyped();
    }
    return;
  }
  if (S.stage === "shown") {
    if (S.kind === "learn" && /^[1-4]$/.test(k) && !inInput) grade(Number(k));
    else if (k === "Enter" || (k === " " && !inInput)) {
      ev.preventDefault();
      const sg = S.res ? S.res.sug : 3;
      if (S.kind === "learn" && e.k !== "b" && !e.k.startsWith("d:")) grade(sg); else grade(sg === 1 ? 1 : 3);
    }
  }
}
document.addEventListener("keydown", studyKey);
document.addEventListener("submit", (ev) => { if (ev.target && ev.target.id === "typeForm") { ev.preventDefault(); checkTyped(); } });
