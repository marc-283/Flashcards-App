/* ================= Theory: grammar chapters, verb lookup, new words, exercises ================= */
const L10 = (o) => (o == null ? "" : typeof o === "string" ? o : UI === "en" ? o.en : o.de);
const stripTags = (h) => String(h).replace(/<[^>]+>/g, "");
const THEORY_SECS = [["words", TB("Wörter & Grammatik", "Words & grammar")], ["verbs", TB("Verben & Zeitformen", "Verbs & tenses")], ["phrases", TB("Wendungen & Stolperfallen", "Phrases & pitfalls")]];
const theoryLangs = () => langs().filter((L) => THEORY[L.code] && THEORY[L.code].length);
const chapterOf = (code, id) => (THEORY[code] || []).find((c) => c.id === id) || null;
const sayBtn = (text, code, big) => (canSpeak() ? `<button class="th-say${big ? " big" : ""}" data-action="th-say" data-arg="${esc(text)}" data-p="${esc(code)}" aria-label="${T("Anhören")}">${ICON_SPEAK}</button>` : "");

/* ---------- Verb tables for the lookup and the exercises ---------- */
const IT_PERS = ["io", "tu", "lui / lei", "noi", "voi", "loro"], IT_PERS_IMP = ["tu", "Lei", "noi", "voi", "Loro"];
const IT_LOOKUP_TENSES = ["Presente", "Passato prossimo", "Imperfetto", "Futuro semplice", "Condizionale presente", "Imperativo", "Congiuntivo presente"];
function starterVerbsIt() {
  const out = [];
  for (const p of STARTER.it || []) for (const part of p.parts || []) if (part.kind === "verbs") out.push(...part.verbs);
  return out;
}
const AUX_OF = new Map(QZ.itAux.map(([v, a]) => [v, a]));
function itTables(inf0) {
  const inf = normAns(inf0), sv = starterVerbsIt().find((x) => normAns(x.v) === inf) || {};
  const card = state.cards.find((c) => c.lang === "it" && c.type === "verb" && normAns(c.tg) === inf);
  const o = { ...sv, isc: !!(sv.isc || IT_ISC.has(inf) || (card && card.isc)), aux: sv.aux || (card && card.aux) || (AUX_OF.get(inf) === "essere" ? "essere" : "avere") };
  const r = itConj(inf, o);
  if (!r) return null;
  if (IT_IMP_IRR[inf]) r["Imperativo"] = splitForms(IT_IMP_IRR[inf]);
  if (card && card.tables) for (const [k, f] of Object.entries(card.tables)) if (Array.isArray(f) && f.some(Boolean)) r[k] = f;
  return r;
}
function enIrregular() {
  const out = [];
  for (const p of STARTER.en || []) for (const part of p.parts || []) if (part.kind === "enverbs") for (const line of part.data.split("\n")) {
    const [inf, past, pp, de] = line.split("|").map((x) => (x || "").trim());
    if (inf) out.push({ inf, past, pp, de });
  }
  return out;
}
function enTables(inf0) {
  const inf = normAns(inf0).replace(/^to /, ""), irr = enIrregular().find((x) => x.inf === inf);
  const card = state.cards.find((c) => c.lang === "en" && c.type === "verb" && normAns(c.tg).replace(/^to /, "") === inf);
  const r = enConj(inf, irr ? { past: irr.past, pp: irr.pp } : {});
  if (r && card && card.tables) for (const [k, f] of Object.entries(card.tables)) if (Array.isArray(f) && f.some(Boolean)) r[k] = f;
  return r;
}
function conjCard(code, verb, tense, forms) {
  const L = langOf(code) || { persons: [] };
  const pers = code === "it" ? (tense === "Imperativo" ? IT_PERS_IMP : IT_PERS) : tense === "Stammformen" ? ["infinitive", "past simple", "past participle"] : L.persons;
  const speakText = forms.map((f, i) => (tense === "Imperativo" || tense === "Stammformen" ? f : `${String(pers[i] || "").split("/")[0].trim()} ${f}`)).join(", ");
  return `<div class="th-conj"><div class="th-conj-h"><span><b>${esc(verb)}</b><small>${esc(dn(tense))}</small></span>${sayBtn(speakText, code)}</div>
    <table><tbody>${forms.map((f, i) => `<tr><td class="p">${esc(pers[i] || "")}</td><td><b>${esc(f || "–")}</b></td></tr>`).join("")}</tbody></table></div>`;
}

/* ---------- Blocks ---------- */
function blockHTML(b, code) {
  const [t, a] = b;
  if (t === "p") return `<p class="th-p">${L10(a)}</p>`;
  if (t === "h") return `<h3 class="th-h">${L10(a)}</h3>`;
  if (t === "tip") return `<div class="th-tip"><span aria-hidden="true">💡</span><p>${L10(a)}</p></div>`;
  if (t === "table") {
    return `<div class="tablewrap th-tw"><table class="th-t"><thead><tr>${a.head.map((h) => `<th>${L10(h)}</th>`).join("")}</tr></thead>
      <tbody>${a.rows.map((r) => `<tr>${r.map((c, i) => `<td${i === 0 && a.head.length > 2 ? ' class="th-first"' : ""}>${i === a.say ? `<span class="th-cell">${L10(c)}${sayBtn(stripTags(L10(c)), code)}</span>` : L10(c)}</td>`).join("")}</tr>`).join("")}</tbody></table></div>`;
  }
  if (t === "ex") return `<div class="th-ex">${a.map((x) => { const tr = UI === "en" ? x[2] : x[1]; return `<div class="th-exi">${sayBtn(x[0], code)}<div><span class="th-tg">${x[0]}</span>${tr ? `<small>${tr}</small>` : ""}</div></div>`; }).join("")}</div>`;
  if (t === "conj") {
    const cards = [];
    for (const v of a.verbs) { const r = code === "it" ? itTables(v) : enTables(v); if (!r) continue; for (const tn of a.tenses) if (r[tn]) cards.push(conjCard(code, v, tn, r[tn])); }
    return `<div class="th-conjgrid">${cards.join("")}</div>`;
  }
  if (t === "quiz") { const q = QUIZ_DEF[a]; return q ? `<button class="btn primary th-quizbtn" data-action="quiz-start" data-arg="${esc(a)}">✎ ${T("Üben: {0}", [L10(q.title)])}</button>` : ""; }
  if (t === "irr") {
    return `<div class="tablewrap th-tw"><table class="th-t"><thead><tr><th>Infinitive</th><th>Past simple</th><th>Past participle</th>${UI === "en" ? "" : `<th>${T("Deutsch")}</th>`}</tr></thead>
      <tbody>${enIrregular().map((v) => `<tr><td><span class="th-cell"><b>${esc(v.inf)}</b>${sayBtn(`${v.inf}, ${v.past}, ${v.pp}`, "en")}</span></td><td>${esc(v.past)}</td><td>${esc(v.pp)}</td>${UI === "en" ? "" : `<td class="th-de">${esc(v.de)}</td>`}</tr>`).join("")}</tbody></table></div>`;
  }
  return "";
}

/* ---------- Views ---------- */
function theoryPills(code, view) {
  const ls = theoryLangs();
  if (ls.length < 2) return "";
  return `<div class="pills" role="group" aria-label="${T("Sprache")}">${ls.map((L) => `<button data-action="th-lang" data-arg="${esc(L.code)}" data-p="${esc(view)}" aria-pressed="${L.code === code}">${esc(lname(L))}</button>`).join("")}</div>`;
}
const newCardsOf = (code) => state.cards.filter((c) => c.lang === code && !c.susp && !isLearned(c));
function viewTheory(v) {
  const code = v.p, L = langOf(code), chs = THEORY[code] || [];
  if (!L) return `${backBar()}<h1 class="vtitle">${T("Nicht gefunden")}</h1>`;
  const nw = newCardsOf(code).length;
  const tools = `<section class="sec">
      ${navRow("nav", "conj", T("Verb nachschlagen"), code === "it" ? T("Jedes Verb in allen wichtigen Zeitformen – z. B. essere") : T("Stammformen und Zeitformen – z. B. go, went, gone"), "", badgeTxt("⇄", L.color), ` data-p="${esc(JSON.stringify({ lang: code }))}"`)}
      ${navRow("nav", "newwords", T("Neue Wörter ansehen"), nw ? T("{0} noch nicht gelernt – in Ruhe durchlesen und anhören", [num(nw)]) : T("Alle Wörter sind schon im Lernen"), nw ? `<small>${num(nw)}</small>` : "", badgeTxt("Aa", L.color), ` data-p="${esc(code)}"`)}
    </section>`;
  const secs = THEORY_SECS.map(([k, title]) => {
    const list = chs.filter((c) => c.sec === k);
    if (!list.length) return "";
    return `<section class="sec"><div class="sechead"><h2 class="sectitle">${L10(title)}</h2></div>
      ${list.map((c) => navRow("nav", "chapter", L10(c.title), L10(c.sub), "", badgeTxt(L10(c.title).replace(/[^\p{L}]/gu, "").slice(0, 2), L.color), ` data-p="${esc(JSON.stringify({ lang: code, id: c.id }))}"`)).join("")}</section>`;
  }).join("");
  return `${backBar()}
    <h1 class="vtitle" style="color:${L.color}">${T("Theorie")}</h1>
    <p class="meta">${esc(lname(L))} · ${T("Grammatik zum Nachlesen, mit Beispielen zum Anhören und Übungen")}</p>
    ${theoryPills(code, "theory")}
    ${chs.length ? tools + secs : `<p class="hint">${T("Für diese Sprache gibt es noch keine Theorie.")}</p>${tools}`}`;
}
function viewChapter(v) {
  const { lang: code, id } = v.p || {}, L = langOf(code), ch = chapterOf(code, id);
  if (!L || !ch) return `${backBar()}<h1 class="vtitle">${T("Nicht gefunden")}</h1>`;
  const list = THEORY[code], i = list.indexOf(ch), prev = list[i - 1], next = list[i + 1];
  const nav = (c, lbl) => (c ? `<button class="btn grow th-navbtn" data-action="th-goto" data-arg="${esc(c.id)}"><small>${lbl}</small>${esc(L10(c.title))}</button>` : "");
  return `${backBar()}
    <h1 class="vtitle" style="color:${L.color}">${esc(L10(ch.title))}</h1>
    <p class="meta">${esc(L10(ch.sub))}</p>
    <article class="th-body">${ch.blocks.map((b) => blockHTML(b, code)).join("")}</article>
    <div class="btnrow th-nav">${nav(prev, T("‹ Zurück"))}${nav(next, T("Weiter ›"))}</div>`;
}
function viewConj(v) {
  const p = v.p || {}, code = p.lang || "it", L = langOf(code);
  if (!L) return `${backBar()}<h1 class="vtitle">${T("Nicht gefunden")}</h1>`;
  const verb = (p.verb || "").trim();
  const own = state.cards.filter((c) => c.lang === code && c.type === "verb").map((c) => c.tg);
  const known = [...new Set((code === "it" ? starterVerbsIt().map((x) => x.v).concat(IT_REG_VERBS) : enIrregular().map((x) => x.inf)).concat(own))].sort((a, b) => a.localeCompare(b));
  let body = "";
  if (verb) {
    const r = code === "it" ? itTables(verb) : enTables(verb);
    if (!r) body = `<p class="neg">${code === "it" ? T("„{0}“ ist kein italienischer Infinitiv (-are, -ere, -ire, -arsi …).", [esc(verb)]) : T("„{0}“ wurde nicht erkannt.", [esc(verb)])}</p>`;
    else {
      const tenses = code === "it" ? IT_LOOKUP_TENSES : ["Stammformen"].concat(L.tenses.map((t) => t.n).filter((n) => n !== "Stammformen"));
      const irr = code === "it" ? !!(starterVerbsIt().find((x) => normAns(x.v) === normAns(verb)) || {}).irr : !!enIrregular().find((x) => x.inf === normAns(verb).replace(/^to /, ""));
      const meaning = code === "it" ? ((starterVerbsIt().find((x) => normAns(x.v) === normAns(verb)) || {}).de || ((state.cards.find((c) => c.lang === "it" && normAns(c.tg) === normAns(verb)) || {}).de)) : ((enIrregular().find((x) => x.inf === normAns(verb).replace(/^to /, "")) || {}).de);
      body = `<div class="th-verbhead"><h2>${esc(verb)}</h2>${sayBtn(verb, code, true)}<p class="meta">${[meaning ? esc(meaning) : "", irr ? T("unregelmäßig") : T("regelmäßig"), code === "it" && r._aux ? T("Passato prossimo mit {0}", [r._aux]) : ""].filter(Boolean).join(" · ")}</p></div>
        <div class="th-conjgrid">${tenses.filter((tn) => r[tn]).map((tn) => conjCard(code, verb, tn, r[tn])).join("")}</div>
        ${code === "it" && !irr && !own.some((x) => normAns(x) === normAns(verb)) ? `<p class="hint">${T("Regelmäßig gebildet – bei unbekannten Verben bitte gegenprüfen.")}</p>` : ""}`;
    }
  }
  return `${backBar()}
    <h1 class="vtitle" style="color:${L.color}">${T("Verb nachschlagen")}</h1>
    <p class="meta">${esc(lname(L))}</p>
    <form class="th-search" id="conjForm"><input id="conjIn" class="psel" list="conjList" value="${esc(verb)}" placeholder="${code === "it" ? T("z. B. essere, andare, capire") : T("z. B. go, take, be")}" autocomplete="off" autocapitalize="off" autocorrect="off" spellcheck="false" enterkeyhint="search" aria-label="${T("Verb")}"><datalist id="conjList">${known.map((x) => `<option value="${esc(x)}">`).join("")}</datalist><button class="btn primary" type="submit">${T("Anzeigen")}</button></form>
    ${body || `<div class="chips th-verbchips">${(code === "it" ? ["essere", "avere", "andare", "fare", "stare", "venire", "potere", "volere", "dovere", "sapere", "parlare", "prendere", "dormire", "capire", "chiamarsi"] : ["be", "have", "go", "do", "make", "take", "get", "come", "see", "know", "think", "say"]).map((x) => `<button class="chipbtn" data-action="th-verb" data-arg="${esc(x)}">${esc(x)}</button>`).join("")}</div>`}`;
}
function viewNewWords(v) {
  const code = v.p, L = langOf(code);
  if (!L) return `${backBar()}<h1 class="vtitle">${T("Nicht gefunden")}</h1>`;
  const list = newCardsOf(code).sort((a, b) => a.created - b.created), limit = state.showAll ? list.length : 120;
  const groups = new Map();
  for (const c of list.slice(0, limit)) { const k = `${c.deck}\u0000${c.topic || ""}`; if (!groups.has(k)) groups.set(k, []); groups.get(k).push(c); }
  const rows = [...groups].map(([k, cs]) => { const [deck, topic] = k.split("\u0000"); return `<section class="sec"><div class="sechead"><h2 class="sectitle th-small">${esc(dn(deck))}${topic ? ` · ${esc(dn(topic))}` : ""}</h2></div>
    ${cs.map((c) => `<div class="th-word">${sayBtn(c.type === "cloze" ? fillCloze(c.tg) : c.tg, code)}<div class="th-word-main"><span class="th-tg">${esc(c.type === "cloze" ? fillCloze(c.tg) : c.tg)}</span><span class="th-de">${esc(c.de)}</span>${c.ex ? `<small>${esc(c.ex)}${c.exDe ? ` – ${esc(c.exDe)}` : ""}</small>` : ""}</div></div>`).join("")}</section>`; }).join("");
  return `${backBar()}
    <h1 class="vtitle" style="color:${L.color}">${T("Neue Wörter")}</h1>
    <p class="meta">${esc(lname(L))} · ${T("{0} noch nicht gelernt", [num(list.length)])}</p>
    ${list.length ? `<div class="btnrow"><button class="btn primary grow" data-action="nw-learn" data-arg="${esc(code)}">${T("▶ Lernen")}</button><button class="btn grow" data-action="nw-preview" data-arg="${esc(code)}">${T("Als Karten durchgehen")}</button></div>
      <p class="hint">${T("„Lernen“ nimmt die neuen Wörter in deinen Wiederholungsplan auf (so viele pro Tag, wie eingestellt). „Durchgehen“ zeigt sie nur als Karten, ohne Plan.")}</p>` : `<p class="hint">${T("Alle Wörter sind schon im Lernen. Lade ein Starter-Paket oder importiere neue Wörter.")}</p>`}
    ${rows}
    ${list.length > limit ? `<button class="btn" data-action="show-all">${T("Alle {0} anzeigen", [num(list.length)])}</button>` : ""}`;
}
Object.assign(VIEWS, { theory: viewTheory, chapter: viewChapter, conj: viewConj, newwords: viewNewWords });
Object.assign(VIEW_LABEL, { theory: T("Theorie"), chapter: T("Kapitel"), conj: T("Verb nachschlagen"), newwords: T("Neue Wörter") });

/* ================= Exercises (quiz) ================= */
const pick = (a, n) => shuffle(a.slice()).slice(0, n);
const rnd = (a) => a[Math.floor(Math.random() * a.length)];
function itArt(word, g, def) {
  const w = word.toLowerCase(), pl = g.endsWith("p"), f = g[0] === "f";
  const vowel = /^[aeiouàèéìòù]/.test(w) || /^h[aeiou]/.test(w);
  const special = /^(s[^aeiouàèéìòù]|z|gn|ps|pn|x|y|i[aeiou])/.test(w);
  if (def) { if (f) return pl ? "le" : vowel ? "l'" : "la"; if (pl) return vowel || special ? "gli" : "i"; return vowel ? "l'" : special ? "lo" : "il"; }
  if (f) return vowel ? "un'" : "una";
  return special ? "uno" : "un";
}
const withArt = (art, w) => (art.endsWith("'") ? art + w : `${art} ${w}`);
const gloss = (n) => (UI === "en" ? n[3] : n[2]);
function choiceQ(q, opts, right, extra) {
  const order = extra && extra.keep ? opts.map((_, i) => i) : shuffle(opts.map((_, i) => i));
  return { q, opts: order.map((i) => opts[i]), right: order.indexOf(right), ...(extra || {}) };
}
function genArt(def, n) {
  const pool = QZ.itNouns.filter((x) => def || !x[1].endsWith("p"));
  const qs = pick(pool, n).map((x) => {
    const pl = x[1].endsWith("p"), opts = def ? (pl ? ["i", "gli", "le"] : ["il", "lo", "l'", "la"]) : ["un", "uno", "una", "un'"], art = itArt(x[0], x[1], def);
    return choiceQ(`___ ${x[0]}`, opts, opts.indexOf(art), { sub: gloss(x), say: withArt(art, x[0]), why: artWhy(x[0], x[1], art) });
  });
  if (def) { // a few nouns from the learner's own cards
    const own = state.cards.filter((c) => c.lang === "it" && c.type === "word" && c.pos === "n").map((c) => /^(il|lo|la|l'|i|gli|le)\s*([\p{L}]+)$/u.exec(c.tg.trim())).filter(Boolean);
    for (const m of pick(own, Math.min(3, own.length))) {
      const art = m[1], pl = ["i", "gli", "le"].includes(art), opts = pl ? ["i", "gli", "le"] : ["il", "lo", "l'", "la"];
      if (!qs.some((q) => q.say === withArt(art, m[2]))) qs[Math.floor(Math.random() * qs.length)] = choiceQ(`___ ${m[2]}`, opts, opts.indexOf(art), { say: withArt(art, m[2]), sub: T("aus deinen Karten") });
    }
  }
  return qs;
}
function artWhy(w, g, art) {
  const f = g[0] === "f", pl = g.endsWith("p");
  const gen = f ? T("weiblich") : T("männlich"), num1 = pl ? T("Plural") : T("Singular");
  const start = /^[aeiouàèéìòù]/i.test(w) ? T("Vokal am Anfang") : /^(s[^aeiou]|z|gn|ps|pn|x|y)/i.test(w) ? T("beginnt mit s + Konsonant, z, gn, ps …") : T("Konsonant am Anfang");
  return `${gen}, ${num1}, ${start} → ${art}`;
}
function genForms(verbs, tenses, n, persons) {
  const qs = [], tries = n * 6;
  for (let k = 0; k < tries && qs.length < n; k++) {
    const v = rnd(verbs), tn = rnd(tenses), r = itTables(v);
    if (!r || !r[tn]) continue;
    const pers = tn === "Imperativo" ? IT_PERS_IMP : IT_PERS, idxs = (persons || pers.map((_, i) => i)).filter((i) => r[tn][i]);
    if (!idxs.length) continue;
    const i = rnd(idxs), ans = r[tn][i];
    if (qs.some((q) => q.ans === ans)) continue;
    qs.push({ q: `${pers[i]} · <b>${esc(v)}</b>`, sub: tn === "Imperativo" ? `${tn} (!)` : tn, ans, say: tn === "Imperativo" ? ans.split(" / ")[0] : `${pers[i].split("/")[0].trim()} ${ans.split("/")[0]}` });
  }
  return qs;
}
const IT_IRR_CORE = ["essere", "avere", "andare", "fare", "stare", "venire", "potere", "volere", "dovere", "sapere", "dire", "uscire", "dare", "bere", "rimanere"];
const enGenChoice = (items, n) => pick(items, n).map((x) => choiceQ(esc(x[0]).replace("___", "<span class=\"gap\">…</span>"), x[1], x[2], { why: x[3] ? L10(x[3]) : "", say: x[1][x[2]].includes("…") ? "" : x[0].replace("___", x[1][x[2]]) }));
const QUIZ_DEF = {
  "it-art-def": { lang: "it", title: TB("bestimmter Artikel", "definite article"), gen: () => genArt(true, 12) },
  "it-art-indef": { lang: "it", title: TB("unbestimmter Artikel", "indefinite article"), gen: () => genArt(false, 12) },
  "it-art-mix": { lang: "it", title: TB("alle Artikel gemischt", "all articles mixed"), gen: () => shuffle(genArt(true, 7).concat(genArt(false, 7))) },
  "it-plural": { lang: "it", title: TB("Plural bilden", "forming plurals"), gen: () => pick(QZ.itPlural, 12).map(([s, p]) => ({ q: `${esc(s)} → …`, sub: T("Plural mit Artikel"), ans: p, say: p })) },
  "it-presente-reg": { lang: "it", title: TB("Präsens, regelmäßig", "present tense, regular"), gen: () => genForms(IT_REG_VERBS, ["Presente"], 12) },
  "it-presente-irr": { lang: "it", title: TB("Präsens, unregelmäßig", "present tense, irregular"), gen: () => genForms(IT_IRR_CORE, ["Presente"], 12) },
  "it-aux": { lang: "it", title: TB("avere oder essere?", "avere or essere?"), gen: () => pick(QZ.itAux, 12).map(([v, a]) => { const r = itTables(v); const f = r && r["Passato prossimo"] ? r["Passato prossimo"][0] : ""; return choiceQ(`<b>${esc(v)}</b>`, ["avere", "essere"], a === "essere" ? 1 : 0, { sub: T("Passato prossimo mit …?"), why: f ? `io ${f}` : "", say: f ? `io ${f.split("/")[0]}` : "", keep: true }); }) },
  "it-pp": { lang: "it", title: TB("Passato prossimo bilden", "forming the passato prossimo"), gen: () => genForms(["parlare", "mangiare", "andare", "venire", "fare", "dire", "prendere", "vedere", "leggere", "scrivere", "essere", "stare", "arrivare", "partire", "uscire", "bere", "aprire", "rimanere", "dormire", "capire"], ["Passato prossimo"], 12) },
  "it-imperfetto": { lang: "it", title: TB("Imperfetto bilden", "forming the imperfetto"), gen: () => genForms(["parlare", "abitare", "avere", "essere", "fare", "dire", "bere", "prendere", "leggere", "dormire", "andare", "venire", "stare"], ["Imperfetto"], 12) },
  "it-pp-imp": { lang: "it", title: TB("Passato prossimo oder Imperfetto?", "passato prossimo or imperfetto?"), gen: () => pick(QZ.itPpImp, 10).map((x) => choiceQ(esc(x[0]).replace("___", "<span class=\"gap\">…</span>"), x[1], x[2], { why: L10(x[3]), say: x[0].replace("___", x[1][x[2]]).replace(" ,", ","), keep: true })) },
  "it-futuro": { lang: "it", title: TB("Futuro bilden", "forming the future"), gen: () => genForms(["parlare", "prendere", "dormire", "cercare", "mangiare"].concat(IT_IRR_CORE), ["Futuro semplice"], 12) },
  "it-condizionale": { lang: "it", title: TB("Condizionale bilden", "forming the conditional"), gen: () => genForms(["parlare", "prendere", "dormire", "potere", "volere", "dovere", "essere", "avere", "andare", "fare", "venire", "piacere"], ["Condizionale presente"], 12) },
  "it-imperativo": { lang: "it", title: TB("Imperativ bilden", "forming the imperative"), gen: () => {
    const qs = genForms(["parlare", "aspettare", "prendere", "scrivere", "dormire", "finire", "andare", "fare", "stare", "dire", "venire", "essere", "avere"], ["Imperativo"], 9, [0, 1, 2, 3]);
    for (const v of pick(["parlare", "toccare", "preoccuparsi", "aspettare", "mangiare", "andare"], 3)) { const inf = v.replace(/rsi$/, "rti"); qs.push({ q: `tu · <b>${esc(v)}</b>`, sub: T("verneint (!)"), ans: `non ${inf}`, say: `non ${inf}` }); }
    return shuffle(qs);
  } },
  "it-prep": { lang: "it", title: TB("Präpositionen", "prepositions"), gen: () => {
    const preps = { di: "del dello dell' della dei degli delle", a: "al allo all' alla ai agli alle", da: "dal dallo dall' dalla dai dagli dalle", in: "nel nello nell' nella nei negli nelle", su: "sul sullo sull' sulla sui sugli sulle" };
    const arts = ["il", "lo", "l'", "la", "i", "gli", "le"], typed = [];
    for (let k = 0; k < 6; k++) { const p = rnd(Object.keys(preps)), ai = Math.floor(Math.random() * 7), ans = preps[p].split(" ")[ai]; if (!typed.some((q) => q.ans === ans)) typed.push({ q: `<b>${p} + ${arts[ai]}</b> = …`, ans, say: ans }); }
    return shuffle(typed.concat(pick(QZ.itPrepCtx, 6).map((x) => choiceQ(esc(x[0]).replace("___", "<span class=\"gap\">…</span>"), x[1], x[2], { say: x[0].replace("___ ", x[1][x[2]].endsWith("'") ? x[1][x[2]] : x[1][x[2]] + " ") }))));
  } },
  "en-tense": { lang: "en", title: TB("die richtige Zeitform", "the right tense"), gen: () => enGenChoice(QZ.enTense, 10) },
  "en-ppps": { lang: "en", title: TB("Past simple oder Present perfect?", "past simple or present perfect?"), gen: () => enGenChoice(QZ.enPpPs, 10) },
  "en-cond": { lang: "en", title: TB("If-Sätze", "if-clauses"), gen: () => enGenChoice(QZ.enCond, 8) },
  "en-art": { lang: "en", title: TB("a, an, the oder nichts?", "a, an, the or nothing?"), gen: () => enGenChoice(QZ.enArt, 12) },
  "en-modal": { lang: "en", title: TB("Modalverben", "modal verbs"), gen: () => enGenChoice(QZ.enModal, 8) },
  "en-mistakes": { lang: "en", title: TB("typische Fehler", "typical mistakes"), gen: () => pick(QZ.enMistakes, 10).map((x) => choiceQ(T("Was ist richtig?"), x[1], x[2], { say: x[1][x[2]] })) },
  "en-irr": { lang: "en", title: TB("unregelmäßige Verben", "irregular verbs"), gen: () => pick(enIrregular(), 12).map((v) => { const pp = Math.random() < 0.5; return { q: `<b>${esc(v.inf)}</b>`, sub: pp ? "past participle" : "past simple", ans: pp ? v.pp : v.past, say: `${v.inf}, ${v.past}, ${v.pp}` }; }) }
};

function startQuiz(id) {
  const def = QUIZ_DEF[id]; if (!def) return;
  const qs = def.gen().filter(Boolean);
  if (!qs.length) { toast(T("Dafür gibt es gerade keine Aufgaben")); return; }
  state.quiz = { id, lang: def.lang, qs, i: 0, ok: 0, wrong: [], res: null, t0: Date.now() };
  $("study").hidden = false; document.body.style.overflow = "hidden";
  renderQuiz();
}
function closeQuiz() {
  const Q = state.quiz; if (!Q) return;
  const done = Q.i + (Q.res ? 1 : 0);
  if (done) { const st = statOf(today(), Q.lang, true); st.s += Math.round((Date.now() - Q.t0) / 1000); save(); }
  stopSpeak();
  state.quiz = null; $("study").hidden = true; document.body.style.overflow = ""; render();
}
function renderQuiz() {
  const Q = state.quiz, root = $("studyIn"); if (!Q) return;
  const def = QUIZ_DEF[Q.id], L = langOf(Q.lang) || { color: "var(--accent)", name: "" };
  if (Q.i >= Q.qs.length) {
    const pct = Math.round(Q.ok / Q.qs.length * 100);
    root.innerHTML = `<div class="st-top"><button class="mbtn" data-action="quiz-close" aria-label="${T("Schließen")}">✕</button><span></span><span></span><span></span></div>
      <div class="st-done"><span class="label">${T("Übung · {0}", [esc(L10(def.title))])}</span>
        <h1 class="vtitle">${pct >= 90 ? T("Sehr gut!") : pct >= 70 ? T("Gut!") : T("Dranbleiben!")}</h1>
        <section class="stats" aria-label="${T("Ergebnis")}"><div class="stat"><span class="label">${T("Fragen")}</span><span class="v">${num(Q.qs.length)}</span></div>
          <div class="stat"><span class="label">${T("Richtig")}</span><span class="v ${pct >= 80 ? "pos" : pct < 60 ? "neg" : ""}">${pct} %</span></div></section>
        <div class="btnrow"><button class="btn primary" data-action="quiz-again">${T("Neue Runde")}</button><button class="btn" data-action="quiz-close">${T("Fertig")}</button></div>
        ${Q.wrong.length ? `<section class="sec"><div class="sechead"><h2 class="sectitle">${T("Fehler")}</h2></div>${Q.wrong.map((w) => `<div class="row nochev nobadge"><span class="main"><span class="t1">${w.q}</span><span class="t2">${T("Richtig: {0}", [esc(w.right)])}${w.given ? ` · ${T("deine Antwort: {0}", [esc(w.given)])}` : ""}</span></span><span></span></div>`).join("")}</section>` : ""}
      </div>`;
    return;
  }
  const q = Q.qs[Q.i], res = Q.res, pct = Q.i / Q.qs.length * 100;
  let body = `<span class="label" style="color:${L.color}">${esc(L10(def.title))}</span><div class="fc-prompt th-q">${q.q}</div>${q.sub ? `<div class="fc-sub">${esc(q.sub)}</div>` : ""}`;
  if (q.opts) body += `<div class="choices">${q.opts.map((o, i) => `<button class="choice${res ? (i === q.right ? " ok" : res.chose === i ? " bad" : "") : ""}" data-action="quiz-choose" data-arg="${i}"${res ? " disabled" : ""}><span class="hint" style="margin-right:8px">${i + 1}</span>${esc(o)}</button>`).join("")}</div>`;
  else body += `<form id="quizForm" style="width:100%"><input class="typein${res ? (res.ok ? (res.close ? " close" : " ok") : " bad") : ""}" id="quizIn" autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false" enterkeyhint="done" aria-label="${T("Antwort")}"${res ? ` value="${esc(res.typed)}" readonly` : ""}></form>`;
  if (res) {
    body += `<b class="fc-res ${res.ok ? (res.close ? "close" : "ok") : "bad"}">${res.ok ? (res.close ? T("Fast richtig") : T("Richtig!")) : T("Leider falsch")}</b>`;
    if (!q.opts && (!res.ok || res.close)) body += `<div class="fc-ans">${esc(q.ans)}</div>`;
    if (res.close && res.why) body += `<small class="hint">${esc(res.why)}</small>`;
    if (q.why) body += `<p class="th-why">${esc(q.why)}</p>`;
    if (q.say && canSpeak()) body += `<div class="say-row">${sayBtn(q.say, Q.lang, true)}</div>`;
  }
  const foot = res ? `<div class="st-act"><button class="btn primary" data-action="quiz-next">${Q.i + 1 < Q.qs.length ? T("Weiter ›") : T("Ergebnis ›")}</button></div>`
    : q.opts ? "" : `<div class="st-act"><button class="btn" data-action="quiz-skip">${T("Weiß nicht")}</button><button class="btn primary" data-action="quiz-check">${T("Prüfen")}</button></div>`;
  root.innerHTML = `<div class="st-top"><button class="mbtn" data-action="quiz-close" aria-label="${T("Beenden")}">✕</button>
      <div class="st-prog" role="progressbar" aria-valuemin="0" aria-valuemax="${Q.qs.length}" aria-valuenow="${Q.i}"><span style="width:${pct.toFixed(1)}%"></span></div>
      <span class="st-count"><b>${num(Q.i)}</b> / ${num(Q.qs.length)}</span><span></span></div>
    <div class="fcard th-qcard">${body}</div>${foot}<p class="kbd">${res ? T("Enter: weiter") : q.opts ? T("1–4: Antwort wählen") : T("Enter: prüfen")}</p>`;
  if (!res && !q.opts) setTimeout(() => { const el = $("quizIn"); if (el) el.focus(); }, 30);
}
function quizAnswer(o) {
  const Q = state.quiz; if (!Q || Q.res) return;
  const q = Q.qs[Q.i];
  let ok = false, close = false, why = "", typed = "";
  if (q.opts) { ok = o.chose === q.right; }
  else {
    typed = o.typed || "";
    const L = langOf(Q.lang), r = typed ? checkAnswer(typed, q.ans, { articles: (L && L.articles) || [] }) : { res: "wrong" };
    ok = r.res !== "wrong"; close = r.res === "close";
    why = r.why === "accent" ? T("Fast – achte auf den Akzent") : r.why === "article" ? T("Fast – der Artikel fehlt oder stimmt nicht") : r.why === "typo" ? T("Fast – kleiner Tippfehler") : "";
  }
  Q.res = { ok, close, why, typed, chose: o.chose };
  if (ok) Q.ok++; else Q.wrong.push({ q: q.q, right: q.opts ? q.opts[q.right] : q.ans, given: q.opts ? (o.chose != null ? q.opts[o.chose] : "") : typed });
  const st = statOf(today(), Q.lang, true); st.p++; save(false);
  renderQuiz();
  if (q.say && canSpeak() && state.settings.autoSpeak) speak(q.say, Q.lang, { quiet: true });
}
function quizKey(ev) {
  const Q = state.quiz;
  if (!Q || $("study").hidden) return;
  const k = ev.key, q = Q.qs[Q.i];
  if (k === "Escape") { closeQuiz(); return; }
  if (!q) { if (k === "Enter") { ev.preventDefault(); closeQuiz(); } return; }
  if (Q.res) { if (k === "Enter") { ev.preventDefault(); Q.i++; Q.res = null; renderQuiz(); } return; }
  if (q.opts && /^[1-9]$/.test(k) && Number(k) <= q.opts.length) { ev.preventDefault(); quizAnswer({ chose: Number(k) - 1 }); }
}
document.addEventListener("keydown", quizKey);
document.addEventListener("submit", (e) => { if (e.target && e.target.id === "quizForm") { e.preventDefault(); quizAnswer({ typed: ($("quizIn") || {}).value }); } if (e.target && e.target.id === "conjForm") { e.preventDefault(); const t = topView(); t.p = { ...(t.p || {}), verb: ($("conjIn") || {}).value || "" }; render(); } });
