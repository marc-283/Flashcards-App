/* ================= Study session (learn, practice, conjugation drill) ================= */
const GRADE_TXT = ["Nochmal", "Schwer", "Gut", "Leicht"];
const WHY_TXT = { accent: "Fast – achte auf den Akzent", article: "Fast – der Artikel fehlt oder stimmt nicht", typo: "Fast – kleiner Tippfehler" };

function startLearn(o) {
  o = o || {};
  const q = buildQueue(o);
  if (!q.length) { toast(o.extraNew ? "Keine weiteren neuen Karten" : "Für heute ist nichts mehr fällig"); return false; }
  state.study = { kind: "learn", o, queue: q.map((e) => ({ ...e, intro: !!e.isNew && state.settings.intro })), total: q.length, done: 0, correct: 0, missed: new Set(), history: [], t0: nowTs(), secs: 0 };
  openStudy();
  return true;
}
function practiceEntries(o) {
  let pool = o.ids ? o.ids.map(cardById).filter(Boolean) : state.cards.filter((c) => (!o.lang || c.lang === o.lang) && (o.topic == null || (c.topic || "") === o.topic));
  pool = pool.filter((c) => !c.susp);
  const t = today();
  if (o.sel === "hard") pool = pool.filter((c) => Object.values(c.srs).some((s) => s.lapses || s.d >= 7)).sort((a, b) => cardHardness(b) - cardHardness(a)).slice(0, Math.max(o.count * 2, 20));
  if (o.sel === "recent") pool = pool.filter((c) => Object.values(c.srs).some((s) => s.reps <= 3 && s.ld >= t - 3));
  if (o.sel === "new") pool = pool.filter((c) => !Object.keys(c.srs).length);
  if (o.sel === "verbs") pool = pool.filter((c) => c.type === "verb");
  shuffle(pool);
  return pool.slice(0, o.count || 20).map((c) => {
    const L = langOf(c.lang); let items = itemsOf(c, L);
    if (!items.length) items = c.type === "cloze" ? ["c"] : ["r"];
    if (o.sel === "verbs") { const tb = items.filter((k) => k.startsWith("t:")); if (tb.length) items = tb; }
    return { id: c.id, k: items[Math.floor(Math.random() * items.length)], lang: c.lang };
  });
}
const cardHardness = (c) => Object.values(c.srs).reduce((a, s) => a + (s.lapses || 0) * 3 + (s.d || 0), 0);
function startPractice(o) {
  const q = practiceEntries(o);
  if (!q.length) { toast("Keine passenden Karten zum Üben"); return; }
  state.study = { kind: "practice", o, queue: q, total: q.length, done: 0, correct: 0, missed: new Set(), history: [], t0: nowTs(), secs: 0 };
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
  if (!q.length) { toast("Für diese Zeiten sind noch keine Formen eingetragen"); return; }
  state.study = { kind: "drill", o, queue: q, total: q.length, done: 0, correct: 0, missed: new Set(), history: [], t0: nowTs(), secs: 0 };
  openStudy();
}
function openStudy() {
  closeSheets();
  $("study").hidden = false; document.body.style.overflow = "hidden";
  state.study.stage = null; showEntry();
}
function closeStudy() {
  saveNow();
  try { speechSynthesis.cancel(); } catch { /* ignore */ }
  $("study").hidden = true; state.study = null; document.body.style.overflow = "";
  render(); updateBadge();
}

/* ---------- Faces ---------- */
/* English verbs: "to" is optional when typing (go = to go, to come up with = come up with) */
function answerFor(c, L) {
  if (L.code !== "en" || /[;|]|\s\/\s|\(/.test(c.tg)) return c.tg;
  if (/^to\s/i.test(c.tg)) return "(to) " + c.tg.slice(3);
  if (c.type === "verb" || c.pos === "v") return "(to) " + c.tg;
  return c.tg;
}
function faceOf(c, k, L) {
  if (k === "f") return { dir: `Deutsch → ${L.name}`, prompt: c.de, ans: answerFor(c, L), shown: c.tg, native: false, hint: c.type === "verb" ? "Verb" : c.pos ? POS[c.pos] + (c.pos === "n" && hasGenderedNouns(L) ? " · mit Artikel" : "") : "", sayAns: c.tg };
  if (k === "r") return { dir: `${L.name} → Deutsch`, prompt: c.tg, ans: c.de, native: true, hint: c.type === "verb" ? "Verb" : c.pos ? POS[c.pos] : "", sayPrompt: c.tg };
  if (k === "c") { const cz = parseCloze(c.tg); return { dir: "Lückensatz", cloze: cz, prompt: cz.text, hint: c.de, sayAns: c.tg.replace(/\{\{(.+?)\}\}/g, "$1") }; }
  const tense = k.slice(2), t = L.tenses.find((x) => x.n === tense) || { n: tense };
  const labels = tenseLabels(L, t), forms = (c.tables && c.tables[tense]) || [];
  return { dir: tense, prompt: c.tg, hint: c.de, table: { labels, forms, given: t.given || [] }, sayAns: forms.map((f, i) => (labels[i] && !t.given ? `${labels[i].split("/")[0]} ${f}` : f)).join(", ") };
}
function choicesFor(c, k) {
  let right, cands;
  const same = state.cards.filter((x) => x.lang === c.lang && x.id !== c.id && (k === "c" ? x.type === "cloze" : x.type !== "cloze"));
  if (k === "c") {
    const cz = parseCloze(c.tg); if (cz.gaps.length !== 1) return null;
    right = cz.gaps[0];
    cands = same.flatMap((x) => parseCloze(x.tg).gaps.map((g) => ({ t: g, s: (x.topic === c.topic ? 2 : 0) + Math.random() })));
  } else {
    const field = k === "f" ? "tg" : "de"; right = c[field];
    cands = same.map((x) => ({ t: x[field], s: (x.pos === c.pos ? 2 : 0) + (x.type === c.type ? 1 : 0) + (x.topic === c.topic ? 1 : 0) + Math.random() * 1.5 }));
  }
  const seen = new Set([normAns(right)]), pick = [];
  for (const x of cands.sort((a, b) => b.s - a.s)) { const n = normAns(x.t); if (!n || seen.has(n)) continue; seen.add(n); pick.push(x.t); if (pick.length === 3) break; }
  return pick.length < 3 ? null : shuffle([right, ...pick]);
}
function modeFor(e, c) {
  const S = state.study;
  if (S.kind === "drill") return "type";
  const m = state.settings.mode;
  if (e.k.startsWith("t:")) return m === "choice" ? "flip" : m;
  if (m === "choice") { if (!e.choices) e.choices = choicesFor(c, e.k); if (!e.choices) return e.k === "c" ? "type" : "flip"; }
  return m;
}

/* ---------- Flow ---------- */
function showEntry() {
  const S = state.study;
  while (S.queue.length && !cardById(S.queue[0].id)) S.queue.shift();
  const e = S.queue[0];
  if (!e) { S.stage = "done"; renderStudy(); return; }
  S.res = null; S.typed = null; e.t0 = nowTs();
  S.stage = e.intro ? "intro" : "ask";
  renderStudy();
  const c = cardById(e.id), L = langOf(c.lang);
  if (state.settings.autoSpeak && S.kind !== "drill") {
    if (S.stage === "intro") speak(c.type === "cloze" ? faceOf(c, "c", L).sayAns : c.tg, c.lang);
    else if (e.k === "r") speak(c.tg, c.lang);
  }
  const inp = $("studyIn").querySelector("input");
  if (inp && matchMedia("(hover: hover) and (pointer: fine)").matches) inp.focus();
  else if (inp && S.stage === "ask") setTimeout(() => { try { inp.focus(); } catch { /* ignore */ } }, 60);
}
function reveal() {
  const S = state.study, e = S.queue[0], c = cardById(e.id);
  S.stage = "shown"; renderStudy();
  if (state.settings.autoSpeak && S.kind !== "drill" && (e.k === "f" || e.k === "c")) speak(faceOf(c, e.k, langOf(c.lang)).sayAns, c.lang);
}
function checkTyped() {
  const S = state.study, e = S.queue[0], c = cardById(e.id), L = langOf(c.lang);
  const inputs = [...$("studyIn").querySelectorAll("input[data-i]")];
  const vals = inputs.map((x) => x.value);
  S.typed = vals;
  if (e.k === "f" || e.k === "r") {
    const fc = faceOf(c, e.k, L), r = checkAnswer(vals[0], fc.ans, { native: fc.native, articles: L.articles });
    S.res = { parts: [r], sug: r.res === "exact" ? 3 : r.res === "close" ? 2 : 1 };
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
  const fc0 = e.k === "c" ? null : faceOf(c, e.k, L), right = e.k === "c" ? parseCloze(c.tg).gaps[0] : (fc0.shown || fc0.ans), pickd = e.choices[idx];
  const ok = normAns(pickd) === normAns(right);
  S.res = { chose: idx, parts: [{ res: ok ? "exact" : "wrong" }], sug: ok ? 3 : 1 };
  reveal();
}
function grade(g) {
  const S = state.study, e = S.queue[0]; if (!e) return;
  const c = cardById(e.id), secs = Math.min(60, Math.round((nowTs() - (e.t0 || nowTs())) / 1000));
  const st = statOf(today(), c.lang, true);
  S.history.push({ queue: S.queue.map((x) => ({ ...x })), done: S.done, correct: S.correct, missed: [...S.missed], id: c.id, k: e.k, prev: c.srs[e.k] ? { ...c.srs[e.k] } : null, code: c.lang, stat: { ...st } });
  if (S.history.length > 30) S.history.shift();
  const key = e.id + "|" + e.k + "|" + (e.i == null ? "" : e.i);
  if (S.kind === "learn") {
    const nst = srsOptions(c.srs[e.k] || null, srsCfg(e, c))[g - 1];
    c.srs = { ...c.srs, [e.k]: nst }; c.updated = nowTs();
    st.r++; if (g > 1) st.ok++; if (e.isNew && !e.counted) { st.n++; e.counted = true; }
  } else st.p++;
  st.s += secs; S.secs += secs;
  S.queue.shift();
  if (g === 1) {
    S.missed.add(key);
    const back = { ...e, isNew: false, fresh: true, intro: false, choices: null, again: (e.again || 0) + 1 };
    if (S.kind === "drill") { S.done++; }
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
  S.queue = h.queue; S.done = h.done; S.correct = h.correct; S.missed = new Set(h.missed);
  save(); S.res = null; S.stage = "ask"; S.queue[0].t0 = nowTs(); renderStudy();
}

/* ---------- Rendering ---------- */
function studyTop(S) {
  const total = S.done + S.queue.length, pct = total ? S.done / total * 100 : 100;
  return `<div class="st-top">
    <button class="mbtn" data-action="study-close" aria-label="Beenden">✕</button>
    <div class="st-prog" role="progressbar" aria-valuemin="0" aria-valuemax="${total}" aria-valuenow="${S.done}"><span style="width:${pct.toFixed(1)}%"></span></div>
    <span class="st-count"><b>${num(S.done)}</b> / ${num(total)}</span>
    <button class="mbtn" data-action="study-undo" aria-label="Rückgängig"${S.history.length ? "" : " disabled"}>↶</button>
  </div>`;
}
function tableGrid(fc, mode, res, typed) {
  const { labels, forms, given } = fc.table;
  let k = 0;
  return `<div class="conj">${forms.map((f, i) => {
    if (!f && !given.includes(i)) return "";
    const lab = `<span class="p">${esc(labels[i] || "")}</span>`;
    if (given.includes(i)) return `${lab}<span class="f">${esc(f)}</span>`;
    if (mode === "ask") return `${lab}<input data-i="${i}" autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false" enterkeyhint="${k++ === forms.length - 1 ? "done" : "next"}" aria-label="${esc(labels[i] || "Form")}">`;
    const p = res && res.parts[i], cls = p ? (p.res === "exact" ? "ok" : p.res === "close" ? "close" : "bad") : "";
    const yours = p && p.res !== "exact" && typed ? typed[[...forms.keys()].filter((j) => !given.includes(j) && (forms[j] || given.includes(j))).indexOf(i)] : "";
    return `${lab}<span class="f ${cls}">${esc(f)}${yours ? `<small>${esc(yours)}</small>` : ""}</span>`;
  }).join("")}</div>`;
}
function resLine(res) {
  if (!res) return "";
  const p = res.parts.filter(Boolean), bad = p.filter((x) => x.res === "wrong").length, close = p.filter((x) => x.res === "close");
  if (p.length > 1) return `<div class="fc-res ${bad ? "bad" : close.length ? "close" : "ok"}">${bad ? `${p.length - bad} von ${p.length} richtig` : close.length ? `Fast alles richtig${close[0].why ? " – " + WHY_TXT[close[0].why].split("– ")[1] : ""}` : "Alles richtig!"}</div>`;
  const r = p[0];
  return `<div class="fc-res ${r.res === "exact" ? "ok" : r.res === "close" ? "close" : "bad"}">${r.res === "exact" ? "Richtig!" : r.res === "close" ? WHY_TXT[r.why] || "Fast richtig" : "Leider falsch"}</div>`;
}
function renderStudy() {
  const S = state.study, root = $("studyIn");
  if (!S) return;
  if (S.stage === "done") { root.innerHTML = doneHTML(S); return; }
  const e = S.queue[0], c = cardById(e.id), L = langOf(c.lang);
  const tools = `<div class="fc-tools">${canSpeak() ? `<button class="mbtn" data-action="study-speak" aria-label="Vorlesen">${ICON_SPEAK}</button>` : ""}<button class="mbtn" data-action="study-edit" aria-label="Karte bearbeiten">✎</button></div>`;
  const tag = S.kind === "practice" ? "Üben · " : S.kind === "drill" ? "Konjugation · " : e.isNew ? "Neu · " : e.again ? "Nochmal · " : "";
  let body = "", foot = "", tap = false;

  if (S.kind === "drill") {
    const tense = e.k.slice(2), t = L.tenses.find((x) => x.n === tense) || { n: tense }, labels = tenseLabels(L, t), form = c.tables[tense][e.i];
    const r = S.res && S.res.parts[0];
    body = `<span class="label acc-t">${esc(tense)}</span><div class="fc-prompt">${esc(labels[e.i] || "")} …</div><div class="fc-sub">${esc(c.tg)} · ${esc(c.de)}</div>
      ${S.stage === "ask" ? `<form id="typeForm" style="width:100%"><input class="typein" data-i="0" autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false" enterkeyhint="done" aria-label="Form"></form>`
        : `${resLine(S.res)}<div class="fc-ans">${esc(form)}</div>${r && r.res !== "exact" && S.typed[0] ? `<div class="fc-yours">${esc(S.typed[0])}</div>` : ""}`}`;
    foot = S.stage === "ask" ? `<div class="st-act"><button class="btn" data-action="study-dunno">Weiß nicht</button><button class="btn primary" data-action="study-check">Prüfen</button></div>`
      : `<div class="st-act"><button class="btn primary" data-action="study-grade" data-arg="${r && r.res !== "wrong" ? 3 : 1}">Weiter ›</button></div>`;
    root.innerHTML = `${studyTop(S)}<div class="fcard"><div class="fc-head"><span class="label" style="color:${L.color}">${esc(L.name)} · Konjugation</span>${tools}</div><div class="fc-body">${body}</div></div>${foot}<p class="kbd">Enter: prüfen / weiter</p>`;
    return;
  }

  const fc = faceOf(c, e.k, L);
  if (S.stage === "intro") {
    if (fc.table) body = `<div class="fc-prompt">${esc(c.tg)}</div><div class="fc-sub">${esc(c.de)}</div><span class="label acc-t">${esc(fc.dir)}</span>${tableGrid(fc, "shown")}`;
    else if (fc.cloze) body = `<div class="cloze">${esc(c.tg).replace(/\{\{(.+?)\}\}/g, '<span class="gap">$1</span>')}</div><div class="fc-sub">${esc(c.de)}</div>`;
    else body = `<div class="fc-ans" style="font-size:clamp(30px,8vw,42px)">${esc(c.tg)}</div><div class="fc-line"></div><div class="fc-prompt long">${esc(c.de)}</div>${fc.hint ? `<div class="fc-sub">${esc(fc.hint)}</div>` : ""}`;
    body += extrasHTML(c);
    foot = `<div class="st-act"><button class="btn" data-action="intro-known">Kenne ich schon</button><button class="btn primary" data-action="intro-next">Merken ›</button></div>`;
    root.innerHTML = `${studyTop(S)}<div class="fcard"><div class="fc-head"><span class="label" style="color:${L.color}">Neu · ${esc(L.name)}</span>${tools}</div><div class="fc-body">${body}</div></div>${foot}<p class="kbd">Enter: merken · K: kenne ich schon</p>`;
    return;
  }

  const mode = modeFor(e, c), shown = S.stage === "shown", res = S.res;
  if (fc.table) {
    body = `<div class="fc-prompt">${esc(c.tg)}</div><div class="fc-sub">${esc(c.de)}</div><span class="label acc-t">${esc(fc.dir)}</span>`;
    if (!shown) body += mode === "type" ? `<form id="typeForm" style="width:100%">${tableGrid(fc, "ask")}<button type="submit" hidden></button></form>` : `<div class="fc-tap">Tippen zum Aufdecken</div>`;
    else body += `${resLine(res)}${tableGrid(fc, "shown", res, S.typed)}`;
  } else if (fc.cloze) {
    const gaps = fc.cloze.gaps;
    let gi = 0;
    const sentence = esc(c.tg).replace(/\{\{(.+?)\}\}/g, (_, g) => { const i = gi++, p = res && res.parts[i]; return shown ? `<span class="gap"${p ? ` style="color:var(--${p.res === "exact" ? "pos" : p.res === "close" ? "accent" : "neg"})"` : ""}>${g}</span>` : `<span class="gap">${gaps.length > 1 ? i + 1 : "…"}</span>`; });
    body = `<div class="cloze">${sentence}</div><div class="fc-sub">${esc(c.de)}</div>`;
    if (!shown) {
      if (mode === "type") body += `<form id="typeForm" style="width:100%;display:flex;flex-direction:column;gap:8px">${gaps.map((_, i) => `<input class="typein" data-i="${i}" placeholder="${gaps.length > 1 ? `Lücke ${i + 1}` : "Lücke"}" autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false" enterkeyhint="done" aria-label="Lücke ${i + 1}">`).join("")}<button type="submit" hidden></button></form>`;
      else if (mode === "choice") body += choicesHTML(e, null);
      else body += `<div class="fc-tap">Tippen zum Aufdecken</div>`;
    } else {
      body += resLine(res);
      if (mode === "choice") body += choicesHTML(e, res, gaps[0]);
      else if (res && S.typed) body += res.parts.map((p, i) => (p.res !== "exact" && S.typed[i] ? `<div class="fc-yours">${esc(S.typed[i])}</div>` : "")).join("");
    }
  } else {
    body = `<div class="fc-prompt${fc.prompt.length > 28 ? " long" : ""}">${esc(fc.prompt)}</div>${fc.hint ? `<div class="fc-sub">${esc(fc.hint)}</div>` : ""}`;
    if (!shown) {
      if (mode === "type") body += `<form id="typeForm" style="width:100%"><input class="typein" data-i="0" placeholder="${fc.native ? "Auf Deutsch" : "Auf " + esc(L.name)}" autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false" enterkeyhint="done" aria-label="Antwort"></form>`;
      else if (mode === "choice") body += choicesHTML(e, null);
      else body += `<div class="fc-tap">Tippen zum Umdrehen</div>`;
    } else {
      body += `<div class="fc-line"></div>`;
      if (mode === "choice") body += `${resLine(res)}${choicesHTML(e, res, fc.shown || fc.ans)}`;
      else body += `${resLine(res)}<div class="fc-ans">${esc(fc.shown || fc.ans)}</div>${res && res.parts[0].res !== "exact" && S.typed && S.typed[0] ? `<div class="fc-yours">${esc(S.typed[0])}</div>` : ""}`;
    }
  }
  if (shown) body += extrasHTML(c, e.k);
  tap = !shown && mode === "flip";

  if (!shown) {
    if (mode === "type") foot = `<div class="st-act"><button class="btn" data-action="study-dunno">Weiß nicht</button><button class="btn primary" data-action="study-check">Prüfen</button></div>`;
    else if (mode === "flip") foot = `<div class="st-act"><button class="btn primary" data-action="study-reveal">Aufdecken</button></div>`;
  } else foot = gradeButtons(S, e, c, res);
  const keys = !shown ? (mode === "flip" ? "Leertaste: aufdecken" : mode === "choice" ? "1–4: Antwort wählen" : "Enter: prüfen") : S.kind === "learn" ? "1–4: bewerten · Enter: Vorschlag" : "1: nochmal · Enter: weiter";
  root.innerHTML = `${studyTop(S)}<div class="fcard${tap ? " tap" : ""}"${tap ? ' data-action="study-reveal"' : ""}><div class="fc-head"><span class="label" style="color:${L.color}">${esc(tag + fc.dir)}</span>${tools}</div><div class="fc-body">${body}</div></div>${foot}<p class="kbd">${keys}</p>`;
}
function choicesHTML(e, res, right) {
  return `<div class="choices">${e.choices.map((t, i) => {
    let cls = "";
    if (res) { if (normAns(t) === normAns(right)) cls = " ok"; else if (res.chose === i) cls = " bad"; }
    return `<button class="choice${cls}" data-action="study-choose" data-arg="${i}"${res ? " disabled" : ""}><span class="hint" style="margin-right:8px">${i + 1}</span>${esc(t)}</button>`;
  }).join("")}</div>`;
}
function extrasHTML(c, k) {
  let h = "";
  if (k === "r" || k === "f" || !k) { /* example belongs to word cards */ }
  if (c.ex && c.type !== "cloze") h += `<div class="fc-ex">${esc(c.ex)}${c.exDe ? `<small>${esc(c.exDe)}</small>` : ""}</div>`;
  if (c.note) h += `<div class="fc-note">${esc(c.note)}</div>`;
  return h;
}
function gradeButtons(S, e, c, res) {
  const sug = res ? res.sug : 0;
  if (S.kind === "practice") return `<div class="st-act"><button class="btn${sug === 1 ? " primary" : ""}" data-action="study-grade" data-arg="1">Nochmal</button><button class="btn${sug !== 1 ? " primary" : ""}" data-action="study-grade" data-arg="3">Gewusst ✓</button></div>`;
  const opts = srsOptions(c.srs[e.k] || null, srsCfg(e, c));
  return `<div class="grades">${opts.map((o, i) => `<button class="g${i + 1}${sug === i + 1 ? " sug" : ""}" data-action="study-grade" data-arg="${i + 1}"><b>${GRADE_TXT[i]}</b><small>${esc(fmtIvl(o))}</small></button>`).join("")}</div>`;
}
function doneHTML(S) {
  const mins = Math.max(1, Math.round(S.secs / 60)), pct = S.done ? Math.round(S.correct / S.done * 100) : 0, stk = streakInfo();
  let more = "";
  if (S.kind === "learn") {
    const d = buildQueue({ ...S.o, countOnly: true });
    more = d.total ? `<button class="btn primary" data-action="study-again">Weiter lernen (${num(d.total)})</button>` : d.moreNew ? `<button class="btn primary" data-action="study-more">+ 10 neue Karten</button>` : "";
  } else more = `<button class="btn primary" data-action="study-repeat">Noch eine Runde</button>`;
  return `<div class="st-top"><button class="mbtn" data-action="study-close" aria-label="Schließen">✕</button><span></span><span></span><span></span></div>
    <div class="st-done">
      <span class="label">${S.kind === "learn" ? "Sitzung beendet" : S.kind === "drill" ? "Konjugation" : "Übungsrunde"}</span>
      <h1 class="vtitle">${pct >= 90 ? "Stark!" : pct >= 70 ? "Geschafft!" : "Dranbleiben!"}</h1>
      <section class="stats" aria-label="Ergebnis">
        <div class="stat"><span class="label">Karten</span><span class="v">${num(S.done)}</span></div>
        <div class="stat"><span class="label">Auf Anhieb</span><span class="v ${pct >= 80 ? "pos" : pct < 60 ? "neg" : ""}">${pct} %</span></div>
        <div class="stat"><span class="label">Zeit</span><span class="v">${mins} Min.</span></div>
      </section>
      ${stk.cur ? `<p class="hint">🔥 ${plural(stk.cur, "Tag", "Tage")} in Folge gelernt${stk.cur >= stk.best && stk.cur > 1 ? " – neuer Rekord!" : ""}</p>` : ""}
      <div class="btnrow">${more}<button class="btn" data-action="study-close">Fertig</button></div>
      ${S.kind === "learn" ? `<p class="hint">Die nächsten Wiederholungen plant PLM automatisch. Komm morgen wieder – kurze tägliche Runden bringen am meisten.</p>` : ""}
    </div>`;
}
function studySpeak() {
  const S = state.study, e = S.queue[0]; if (!e) return;
  const c = cardById(e.id), L = langOf(c.lang);
  if (e.k.startsWith("d:")) { speak(S.stage === "shown" ? c.tables[e.k.slice(2)][e.i] : c.tg, c.lang); return; }
  const fc = faceOf(c, e.k, L);
  if (fc.table) speak(S.stage === "ask" ? c.tg : fc.sayAns, c.lang);
  else if (fc.cloze) speak(fc.sayAns, c.lang);
  else speak(c.tg, c.lang);
}
function studyKey(ev) {
  const S = state.study;
  if (!S || $("study").hidden || !$("cardSheet").hidden || !$("formSheet").hidden) return;
  const k = ev.key, inInput = ev.target && ev.target.tagName === "INPUT";
  if (k === "Escape") { closeStudy(); return; }
  if (S.stage === "done") { if (k === "Enter") { ev.preventDefault(); closeStudy(); } return; }
  const e = S.queue[0], c = e && cardById(e.id);
  if (!c) return;
  if (S.stage === "intro") {
    if (k === "Enter" || k === " ") { ev.preventDefault(); introDone(false); }
    else if (k.toLowerCase() === "k" && !inInput) introDone(true);
    return;
  }
  const mode = modeFor(e, c);
  if (S.stage === "ask") {
    if (mode === "flip" && (k === " " || k === "Enter")) { ev.preventDefault(); reveal(); }
    else if (mode === "choice" && /^[1-4]$/.test(k) && e.choices) chooseOption(Number(k) - 1);
    else if (mode === "type" && k === "Enter" && inInput) {
      const ins = [...$("studyIn").querySelectorAll("input[data-i]")], i = ins.indexOf(ev.target);
      ev.preventDefault();
      if (i >= 0 && i < ins.length - 1) ins[i + 1].focus(); else checkTyped();
    }
    return;
  }
  if (S.stage === "shown") {
    if (/^[1-4]$/.test(k)) { if (S.kind === "learn") grade(Number(k)); else grade(k === "1" ? 1 : 3); }
    else if (k === "Enter" || k === " ") { ev.preventDefault(); const sg = S.res ? S.res.sug : 3; grade(S.kind === "learn" ? sg : sg === 1 ? 1 : 3); }
  }
}
document.addEventListener("keydown", studyKey);
document.addEventListener("submit", (ev) => { if (ev.target && ev.target.id === "typeForm") { ev.preventDefault(); checkTyped(); } });
