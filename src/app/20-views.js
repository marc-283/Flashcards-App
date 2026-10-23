/* ================= Building blocks ================= */
const ICON_SEARCH = '<svg class="ic" viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6.5" fill="none" stroke="currentColor" stroke-width="2.2"/><path d="M15.5 15.5L20.5 20.5" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/></svg>';
const ICON_SPEAK = '<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="M4 9h4l5-4v14l-5-4H4z" fill="currentColor"/><path d="M16.5 8.5a5 5 0 0 1 0 7M19 6a8.5 8.5 0 0 1 0 12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>';
const ICON_SPEAK_BIG = '<svg viewBox="0 0 24 24" width="30" height="30" aria-hidden="true"><path d="M3.5 9h4l5.5-4.5v15L7.5 15h-4z" fill="currentColor"/><path d="M16.5 8.5a5 5 0 0 1 0 7M19.2 5.8a8.8 8.8 0 0 1 0 12.4" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/></svg>';
const ICON_SLOW = '<svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><path d="M4 16.5c0-3.6 2.9-6.5 6.5-6.5s6.5 2.9 6.5 6.5" fill="none" stroke="currentColor" stroke-width="2"/><path d="M17 16.5h2.2a1.8 1.8 0 0 0 0-3.6H17" fill="none" stroke="currentColor" stroke-width="2"/><path d="M3 16.5h16" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path d="M7 16.5v2M14 16.5v2" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><circle cx="19.5" cy="11" r="1" fill="currentColor"/></svg>';
const ICON_MIC = '<svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true"><rect x="8.5" y="3" width="7" height="12" rx="3.5" fill="currentColor"/><path d="M5.5 11.5a6.5 6.5 0 0 0 13 0M12 18v3" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>';
const VIEW_LABEL = { hub: T("Menü"), lang: T("Sprache"), deck: T("Projekt"), cards: T("Karten"), verbs: T("Verben"), verb: T("Verb"), search: T("Suche"), stats: T("Statistik"), settings: T("Einstellungen"), import: T("Import"), review: T("Prüfen"), starter: T("Starter") };
const backLabel = (prev) => (prev.v === "lang" ? langName(prev.p) : prev.v === "deck" ? dn(prev.p.deck) : VIEW_LABEL[prev.v] || T("Zurück"));
const backBar = () => { const prev = state.stack[state.stack.length - 2]; return `<button class="backbtn" data-action="back"><span aria-hidden="true">‹</span>${esc(prev ? backLabel(prev) : T("Menü"))}</button>`; };
const badgeTxt = (txt, color) => `<span class="badge" style="color:${color};background:${color}24" aria-hidden="true">${esc(txt)}</span>`;
function navRow(action, arg, title, sub, val, badgeHTML, extra) {
  return `<button class="row${badgeHTML ? "" : " nobadge"}" data-action="${action}" data-arg="${esc(arg)}"${extra || ""}>
    ${badgeHTML || ""}<span class="main"><span class="t1">${esc(title)}</span>${sub ? `<span class="t2">${esc(sub)}</span>` : ""}</span>
    <span class="val">${val || ""}</span><span class="chev" aria-hidden="true">›</span></button>`;
}
function bigNum(n, unit) { return `<span>${num(n)}</span>${unit ? `<span class="dec"> ${esc(unit)}</span>` : ""}`; }
function spark(vals, color) {
  if (vals.length < 2 || vals.every((v) => v === 0)) return "";
  const max = Math.max(...vals) || 1, W = 84, Hs = 30, n = vals.length;
  const pts = vals.map((v, i) => `${(i * W / (n - 1)).toFixed(1)},${(Hs - 3 - (v / max) * (Hs - 6)).toFixed(1)}`).join(" ");
  return `<svg class="spark" viewBox="0 0 ${W} ${Hs}" preserveAspectRatio="none" aria-hidden="true"><polyline points="${pts}" style="fill:none;stroke:${color};stroke-width:2;stroke-linejoin:round;stroke-linecap:round"/></svg>`;
}
function stateBar(m) {
  const tot = m.new + m.learn + m.known + m.hard || 1;
  return `<div class="bar" aria-hidden="true"><span style="width:${m.known / tot * 100}%;background:var(--pos)"></span><span style="width:${m.learn / tot * 100}%;background:#3FA9FF"></span><span style="width:${m.hard / tot * 100}%;background:var(--neg)"></span></div>`;
}
const stripArt = (s) => s.replace(/^(il|lo|la|i|gli|le|the|to|a|an|el|los|las|les|un|une|uno|una|de|het|en|ett|o|os|as)\s+|^l'/i, "");
function cardRow(c) {
  const L = langOf(c.lang), stt = cardState(c), on = state.sel && state.sel.ids.has(c.id);
  const tags = (c.type === "verb" ? `<span class="tag">${T("Verb")}</span>` : c.type === "cloze" ? `<span class="tag">${T("Lücke")}</span>` : c.pos === "s" ? `<span class="tag">${T("Satz")}</span>` : "") +
    (!c.de && c.type !== "cloze" ? `<span class="tag bad">${T("Ohne Übersetzung")}</span>` : stt === "new" ? `<span class="tag attn">${T("Neu")}</span>` : stt === "hard" ? `<span class="tag bad">${T("Schwierig")}</span>` : stt === "susp" ? `<span class="tag">${T("Pausiert")}</span>` : "");
  const title = c.type === "cloze" ? parseCloze(c.tg).text : c.tg;
  const sub = [c.de, c.type === "word" && c.pos && c.pos !== "s" ? POS[c.pos] : "", dn(c.topic)].filter(Boolean).join(" · ");
  const dt = stt === "new" || stt === "susp" ? "" : dueText(c);
  return `<button class="row nochev" data-action="card" data-arg="${esc(c.id)}"${state.sel ? ` aria-pressed="${on}"` : ""}>
    ${state.sel ? `<span class="checkc${on ? " on" : ""}" aria-hidden="true">${on ? "✓" : ""}</span>` : badgeTxt((stripArt(c.tg) || "?").slice(0, 2), L ? L.color : "#8E8E96")}
    <span class="main"><span class="t1">${esc(title)}${tags}</span><span class="t2">${esc(sub)}</span></span>
    <span class="val">${dt ? `<small>${esc(dt)}</small>` : ""}</span></button>`;
}
function selToolbar() {
  if (state.sel) return `<div class="seltools"><button class="more" data-action="sel-all">${T("Alle auswählen")}</button><button class="more" data-action="sel-cancel">${T("Abbrechen")}</button></div>`;
  return `<div class="seltools"><button class="more" data-action="sel-start">${T("Auswählen")}</button></div>`;
}
const modePills = () => `<div class="pills" role="group" aria-label="${T("Antwortmodus")}">${MODES.map(([k, t]) => `<button data-action="mode" data-arg="${k}" aria-pressed="${state.settings.mode === k}">${t}</button>`).join("")}</div>`;

/* ================= Chart (bars, stacked) ================= */
let charts = [];
const shortDate = (n) => { const d = dateOfDay(n); return UI === "en" ? `${d.getDate()}/${d.getMonth() + 1}` : `${d.getDate()}.${d.getMonth() + 1}.`; };
function niceStep(max) { const raw = max / 4, p = Math.pow(10, Math.floor(Math.log10(raw || 1))), f = raw / p; return Math.max(1, (f <= 1 ? 1 : f <= 2 ? 2 : f <= 5 ? 5 : 10) * p); }
function drawChart(host, cfg) {
  if (!host) return;
  const W = Math.max(260, Math.round(host.clientWidth || 320)), Hh = cfg.height || 200, L = 40, R = 6, T = 12, B = 24;
  const pw = W - L - R, ph = Hh - T - B, n = cfg.points.length;
  const totals = cfg.points.map((p) => p.segs.reduce((a, s) => a + s, 0));
  const max = Math.max(4, ...totals), step = niceStep(max), yMax = step * Math.ceil(max / step);
  const Y = (v) => T + ph - (v / yMax) * ph, f = (v) => v.toFixed(1), slot = pw / Math.max(1, n), X = (i) => L + (i + 0.5) * slot;
  let s = "";
  for (let v = 0; v <= yMax + step / 2; v += step) s += `<line class="grid${v === 0 ? " base" : ""}" x1="${L}" x2="${W - R}" y1="${f(Y(v))}" y2="${f(Y(v))}"/><text class="ylab" x="${L - 8}" y="${f(Y(v) + 4)}" text-anchor="end">${num(v)}</text>`;
  const stride = Math.max(1, Math.ceil(58 / slot));
  cfg.points.forEach((p, i) => { if ((n - 1 - i) % stride === 0) s += `<text class="xlab" x="${f(X(i))}" y="${Hh - 6}" text-anchor="${i === n - 1 ? "end" : i === 0 ? "start" : "middle"}">${esc(p.tick)}</text>`; });
  const bw = Math.max(2, Math.min(22, slot * 0.66));
  cfg.points.forEach((p, i) => {
    let acc = 0;
    p.segs.forEach((v, j) => { if (v <= 0) return; const y0 = Y(acc), y1 = Y(acc + v); acc += v; s += `<rect x="${f(X(i) - bw / 2)}" y="${f(y1)}" width="${f(bw)}" height="${f(Math.max(1, y0 - y1))}" rx="2" style="fill:${cfg.colors[j]}"/>`; });
  });
  s += `<g class="cur" visibility="hidden"><line class="cursor" x1="0" x2="0" y1="${T}" y2="${T + ph}"/></g>`;
  host.innerHTML = `<svg viewBox="0 0 ${W} ${Hh}" style="height:${Hh}px" role="img" aria-label="${esc(cfg.aria)}">${s}</svg>`;
  const svg = host.firstElementChild, cur = svg.querySelector(".cur");
  const hide = () => { cur.setAttribute("visibility", "hidden"); cfg.onScrub && cfg.onScrub(null); };
  const at = (ev) => {
    const r = svg.getBoundingClientRect(), x = (ev.clientX - r.left) * (W / r.width);
    const i = clamp(Math.floor((x - L) / slot), 0, n - 1), cx = f(X(i));
    cur.firstElementChild.setAttribute("x1", cx); cur.firstElementChild.setAttribute("x2", cx); cur.setAttribute("visibility", "visible");
    cfg.onScrub && cfg.onScrub(i);
  };
  svg.addEventListener("pointerdown", at); svg.addEventListener("pointermove", at);
  svg.addEventListener("pointerleave", hide); svg.addEventListener("pointercancel", hide);
  svg.addEventListener("pointerup", (e) => { if (e.pointerType !== "mouse") hide(); });
}
function chartBlock(id, code, mode, days) {
  const t = today();
  let points, colors, total, legend, base;
  if (mode === "fc") {
    const fc = forecast(code, days);
    points = fc.map((v, i) => ({ segs: [v], tick: i === 0 ? T("heute") : shortDate(t + i), label: i === 0 ? T("Heute (inkl. überfällig)") : i === 1 ? T("Morgen") : wdFmt.format(dateOfDay(t + i)) }));
    colors = ["var(--accent)"]; total = fc.reduce((a, b) => a + b, 0);
    base = T("{0} in den nächsten {1} Tagen", [plural(total, T("Wiederholung"), T("Wiederholungen")), days]);
    legend = `<span><i style="background:var(--accent)"></i>${T("Fällige Wiederholungen")}</span>`;
  } else {
    points = []; total = 0; let ok = 0, secs = 0;
    for (let i = days - 1; i >= 0; i--) {
      const d = dayTotals(t - i, code); total += d.r + d.p; ok += d.ok; secs += d.s;
      points.push({ segs: [d.ok + d.p, d.r - d.ok], tick: shortDate(t - i), label: i === 0 ? T("Heute") : wdFmt.format(dateOfDay(t - i)), d });
    }
    colors = ["var(--pos)", "var(--neg)"];
    const rv = points.reduce((a, p) => a + p.d.r, 0);
    base = T("{0} in {1} Tagen{2} · {3} Min.", [plural(total, T("Karte"), T("Karten")), days, rv ? ` ${T("· {0} % gewusst", [Math.round(ok / rv * 100)])}` : "", Math.round(secs / 60)]);
    legend = `<span><i style="background:var(--pos)"></i>${T("Gewusst / geübt")}</span><span><i style="background:var(--neg)"></i>${T("Nochmal")}</span>`;
  }
  charts.push({ id, points, colors, aria: mode === "fc" ? T("Vorschau fälliger Karten") : T("Gelernte Karten pro Tag"),
    onScrub: (i) => { const el = $(id + "Sub"); if (!el) return; if (i == null) { el.textContent = base; return; } const p = points[i]; el.textContent = mode === "fc" ? T("{0}: {1} fällig", [p.label, plural(p.segs[0], T("Karte"), T("Karten"))]) : `${p.label}: ${plural(p.d.r + p.d.p, T("Karte"), T("Karten"))}${p.d.r ? ` ${T("· {0} % gewusst", [Math.round(p.d.ok / p.d.r * 100)])}` : ""}${p.d.n ? ` ${T("· {0} neu", [p.d.n])}` : ""}`; } });
  return `<section class="chartblock" aria-label="${T("Diagramm")}">
    <div class="split"><div class="pills" role="group" aria-label="${T("Diagramm")}">${[["hist", T("Verlauf")], ["fc", T("Vorschau")]].map(([k, l]) => `<button data-action="chartmode" data-arg="${k}" aria-pressed="${mode === k}">${l}</button>`).join("")}</div></div>
    <div class="herosub" id="${id}Sub">${esc(base)}</div>
    <div class="chart" id="${id}"></div>
    <div class="legend">${legend}</div></section>`;
}

/* ================= Views ================= */
function viewHub() {
  const all = dueInfo(), td = dayTotals(today()), stk = streakInfo(), m = countByState(null);
  const n = state.cards.length;
  const week = histArr(null, 7, "all").reduce((a, b) => a + b, 0);
  let big;
  if (!n) big = `<button class="addbig" data-action="starter-first"><span aria-hidden="true">★</span>${T("Starter-Wortschatz laden")}</button>`;
  else if (all.total) big = `<button class="addbig" data-action="learn"><span aria-hidden="true">▶</span>${T("Lernen")} <small>${T("{0} {1} · ca. {2} Min.", [num(all.total),noun(all.total, "Karte", "Karten"), minutesFor(all)])}</small></button>`;
  else big = `<button class="addbig done" data-action="practice"><span aria-hidden="true">✓</span>${T("Alles erledigt")} <small>${T("· Üben")}</small></button>`;
  const tiles = langs().map((L) => {
    const d = dueInfo({ lang: L.code }), cs = cardsOf(L.code), mm = countByState(L.code), act = cs.length - mm.susp;
    return `<button class="tile" data-action="lang" data-arg="${esc(L.code)}">
      <span class="tile-l"><span class="tile-t" style="color:${L.color}">${esc(lname(L))}</span>
        <span class="tile-v">${cs.length ? (d.due ? T("{0} fällig{1}", [num(d.due), d.nw ? ` <span class="tile-s">${T("· {0} neu", [num(d.nw)])}</span>` : ""]) : d.nw ? T("{0} neue Karten", [num(d.nw)]) : T("Für heute erledigt ✓")) : `<span class="tile-s">${T("Noch keine Karten – tippen zum Starten")}</span>`}</span>
        ${cs.length ? `<span class="tile-s">${T("{0} · {1} % sicher", [plural(cs.length, T("Karte"), T("Karten")), act ? Math.round(mm.known / act * 100) : 0])}</span>` : ""}</span>
      ${spark(histArr(L.code, 14, "all"), L.color)}<span class="chev" aria-hidden="true">›</span></button>`;
  }).join("");
  const verbs = state.cards.filter((c) => c.type === "verb").length;
  const sentences = n ? sentenceBank(null).length : 0;
  return `
    <header class="hubhead">
      <div class="brand"><h1 class="wordmark">P<b>L</b>M</h1><span class="label">Personal Language Management</span></div>
      <button class="mbtn" data-action="nav" data-arg="settings" aria-label="${T("Einstellungen")}">⚙</button>
    </header>
    ${big}
    <div class="hubrow"><button class="searchbar hubsearch" data-action="nav" data-arg="search">${ICON_SEARCH}<span>${T("Karten suchen")}</span></button><button class="sqbtn" data-action="add" aria-label="${T("Neue Karte")}">+</button></div>
    ${n && !syncOn() && (lastBackupDays() == null ? n >= 30 && Date.now() - Math.min(...state.cards.map((c) => c.created)) > 7 * 864e5 : lastBackupDays() > 14) ? `<button class="notice" data-action="export-json">${T("Letztes Backup: {0} · Jetzt sichern ›", [esc(lastBackupText())])}</button>` : ""}
    <nav class="tiles" aria-label="${T("Sprachen")}">${tiles}<button class="tile dash" data-action="add-lang"><span class="tile-l"><span class="tile-t" style="font-size:20px;color:var(--muted)">${T("+ Sprache")}</span><span class="tile-s">${T("Spanisch, Französisch, Portugiesisch …")}</span></span><span></span><span class="chev" aria-hidden="true">›</span></button></nav>
    <div class="minitiles">
      <button class="mtile" data-action="build-any"><span class="tile-t">${T("Sätze bauen")}</span>${sentences ? `<span class="tile-v">${num(sentences)}</span><span class="tile-s">${T("Sätze aus deinen Wörtern")}</span>` : `<span class="tile-s">${T("Sätze bilden und korrigieren lassen")}</span>`}</button>
      <button class="mtile" data-action="drill-any"><span class="tile-t">${T("Konjugation")}</span>${verbs ? `<span class="tile-v">${num(verbs)}</span><span class="tile-s">${T("Verben – Formen üben")}</span>` : `<span class="tile-s">${T("Verbformen trainieren")}</span>`}</button>
      <button class="mtile" data-action="import-any"><span class="tile-t">${T("Importieren")}</span><span class="tile-s">${T("Foto, PDF oder Liste in Karten verwandeln")}</span></button>
      <button class="mtile" data-action="theory-any"><span class="tile-t">${T("Theorie")}</span><span class="tile-s">${T("Grammatik, Zeitformen, Artikel – mit Übungen")}</span></button>
      <button class="mtile" data-action="newwords-any"><span class="tile-t">${T("Neue Wörter")}</span>${n ? `<span class="tile-v">${num(state.cards.filter((c) => !c.susp && !isLearned(c)).length)}</span>` : ""}<span class="tile-s">${T("Noch nicht gelernt – lesen und anhören")}</span></button>
      <button class="mtile" data-action="nav" data-arg="stats"><span class="tile-t">${T("Statistik")}</span><span class="tile-v">${num(m.known)}</span><span class="tile-s">${T("Karten sicher gelernt")}</span></button>
    </div>
    <section class="accounts" aria-label="${T("Heute")}">
      <span class="label">${T("Heute gelernt")}</span>
      <div class="acc-total">${bigNum(td.r + td.p,noun(td.r + td.p, "Karte", "Karten"))}</div>
      <div class="acc-split">
        <div class="acc"><span class="label">${T("Serie")}</span><b>${stk.cur ? `🔥 ${num(stk.cur)} ${noun(stk.cur, "Tag", "Tage")}` : "–"}</b></div>
        <div class="acc"><span class="label">${T("Gewusst")}</span><b>${td.r ? Math.round(td.ok / td.r * 100) + " %" : "–"}</b></div>
        <div class="acc"><span class="label">${T("Zeit")}</span><b>${td.s ? Math.max(1, Math.round(td.s / 60)) + ` ${T("Min.")}` : "–"}</b></div>
      </div>
      <div class="ytd"><span class="label">${T("Diese Woche")}</span><b>${num(week)}</b><span class="label">${T("Karten")}</span></div>
      ${syncOn() ? `<button class="syncline" data-action="sync-now" id="syncLine">${esc(syncStatusText())}</button>` : ""}
    </section>`;
}

function deckRows(L) {
  return decksOf(L.code).map((d) => {
    const dd = dueInfo({ lang: L.code, deck: d.name }), m = countByState({ lang: L.code, deck: d.name });
    const act = d.n - m.susp;
    return navRow("deck", d.name, dn(d.name), `${plural(d.n, T("Karte"), T("Karten"))}${act ? ` ${T("· {0} % sicher", [Math.round(m.known / act * 100)])}` : ""}${m.new ? ` ${T("· {0} noch neu", [num(m.new)])}` : ""}`,
      dd.due ? `<span class="acc-t">${num(dd.due)}</span><small>${T("fällig")}</small>` : dd.nw ? `<small>${T("{0} neu", [num(dd.nw)])}</small>` : "", badgeTxt(dn(d.name).slice(0, 2), L.color));
  }).join("");
}
function viewLang(v) {
  const L = langOf(v.p);
  if (!L) return `${backBar()}<h1 class="vtitle">${T("Sprache nicht gefunden")}</h1>`;
  const cs = cardsOf(L.code), d = dueInfo({ lang: L.code }), m = countByState(L.code);
  const head = `${backBar()}<h1 class="vtitle" style="color:${L.color}">${esc(lname(L))}</h1>`;
  const packs = STARTER[L.code] || [];
  const lp = ` data-p="${esc(L.code)}"`;
  if (!cs.length) return `${head}
    <section class="empty">${T("<strong>Noch keine Karten</strong>")}<span>${packs.length ? T("Lade ein Starter-Paket, fotografiere eine Vokabelliste, lade ein PDF aus deinem Kurs hoch oder leg eigene Karten an.") : T("Fotografiere eine Vokabelliste, lade ein PDF hoch, importiere eine Liste oder leg eigene Karten an.")}</span>
      <div class="btnrow">${packs.length ? `<button class="btn primary" data-action="nav" data-arg="starter"${lp}>${T("Starter-Pakete")}</button>` : ""}<button class="btn" data-action="nav" data-arg="import"${lp}>${T("Foto / PDF / Liste")}</button><button class="btn" data-action="add">${T("+ Karte")}</button></div></section>
    <section class="sec">${navRow("lang-settings", L.code, T("Spracheinstellungen"), T("Neue Karten pro Tag, Richtung, Zeiten, Stimme"))}</section>`;
  const verbs = cs.filter((c) => c.type === "verb").length, sb = sentenceBank(L.code).length;
  return `${head}
    <section class="hero">
      <span class="label">${T("Heute dran")}</span>
      <div class="heroval">${bigNum(d.total,noun(d.total, "Karte", "Karten"))}</div>
      <div class="herosub">${d.total ? T("{0} · {1} neu · ca. {2} Min.", [plural(d.due, T("Wiederholung"), T("Wiederholungen")), num(d.nw), minutesFor(d)]) : d.moreNew ? T("Für heute erledigt · {0} neue Karten warten", [num(d.moreNew)]) : T("Für heute erledigt")}</div>
    </section>
    <div class="btnrow">${d.total ? `<button class="btn primary grow" data-action="learn" data-arg="${esc(L.code)}">${T("▶ Lernen")}</button>` : d.moreNew ? `<button class="btn primary grow" data-action="learn-more" data-arg="${esc(L.code)}">${T("+ 10 neue Karten")}</button>` : ""}<button class="btn${d.total || d.moreNew ? "" : " grow"}" data-action="practice" data-arg="${esc(L.code)}">${T("Üben")}</button></div>
    ${modePills()}
    ${chartBlock("chLang", L.code, state.chart, 30)}
    <section class="stats" aria-label="${T("Kartenstand")}">
      <div class="stat"><span class="label">${T("Neu")}</span><span class="v">${num(m.new)}</span></div>
      <div class="stat"><span class="label">${T("Im Lernen")}</span><span class="v" style="color:#3FA9FF">${num(m.learn + m.hard)}</span></div>
      <div class="stat"><span class="label">${T("Sicher")}</span><span class="v pos">${num(m.known)}</span></div>
    </section>
    <section class="sec" aria-labelledby="hDecks">
      <div class="sechead"><h2 class="sectitle" id="hDecks">${T("Projekte")}</h2><button class="more" data-action="cards" data-arg="">${T("Alle Karten ›")}</button></div>
      ${deckRows(L)}
    </section>
    <section class="sec" aria-labelledby="hPrac">
      <div class="sechead"><h2 class="sectitle" id="hPrac">${T("Üben")}</h2></div>
      ${THEORY[L.code] && THEORY[L.code].length ? navRow("nav", "theory", T("Theorie & Grammatik"), L.code === "it" ? T("Artikel, Zeitformen, Konjugation – mit Übungen") : T("Zeitformen, if-Sätze, Artikel – mit Übungen"), "", badgeTxt("§", L.color), lp) : ""}
      ${cs.length ? navRow("nav", "newwords", T("Neue Wörter ansehen"), T("Wörter, die noch nicht gelernt sind – lesen und anhören"), (() => { const k = newCardsOf(L.code).length; return k ? `<small>${num(k)}</small>` : ""; })(), badgeTxt("Aa", L.color), lp) : ""}
      ${navRow("build", L.code, T("Sätze bauen"), sb ? T("{0} – aus Bausteinen oder frei tippen, mit Korrektur", [plural(sb, T("Satz"), T("Sätze"))]) : T("Sätze entstehen aus Beispielsätzen und Satzkarten"), "", badgeTxt("✎", L.color))}
      ${navRow("nav", "verbs", T("Konjugation"), verbs ? T("{0} · aktiv: {1}", [plural(verbs, T("Verb"), T("Verben")), L.active.join(", ") || T("keine Zeit")]) : T("Noch keine Verben – leg eins an"), "", badgeTxt("V", L.color), lp)}
      ${verbs ? navRow("drill", L.code, T("Formen schnell üben"), T("Zufällige Personen und Zeiten"), "", badgeTxt("⚡", L.color)) : ""}
      ${m.hard ? navRow("cards-hard", L.code, T("Schwierige Karten ({0})", [m.hard]), T("Oft vergessen – gezielt üben oder Eselsbrücke ergänzen"), "", badgeTxt("!", "#FF4F45")) : ""}
    </section>
    <section class="sec" aria-labelledby="hMore">
      <div class="sechead"><h2 class="sectitle" id="hMore">${T("Mehr")}</h2></div>
      ${navRow("nav", "import", T("Importieren"), T("Foto, PDF aus dem Kurs oder Liste (Quizlet, Anki, Excel)"), "", "", lp)}
      ${packs.length ? navRow("nav", "starter", T("Starter-Pakete"), packs.map((p) => dn(p.name)).join(", "), "", "", lp) : ""}
      ${navRow("lang-settings", L.code, T("Spracheinstellungen"), T("{0} neue pro Tag · {1}", [L.newPerDay, L.dirs === "both" ? T("beide Richtungen") : L.dirs === "f" ? T("nur Deutsch → {0}", [lname(L)]) : T("nur {0} → Deutsch", [lname(L)])]))}
    </section>`;
}

function lastTest(code, deck) {
  const list = state.tests[`${code}|${deck}`] || [];
  return list.length ? list[list.length - 1] : null;
}
function viewDeck(v) {
  const p = v.p || {}, L = langOf(p.lang);
  const cs = L ? state.cards.filter((c) => c.lang === L.code && c.deck === p.deck) : [];
  if (!L || !cs.length) return `${backBar()}<h1 class="vtitle">${T("Projekt leer")}</h1><p class="hint">${T("In diesem Projekt sind keine Karten mehr.")}</p>`;
  const d = dueInfo({ lang: L.code, deck: p.deck }), m = countByState({ lang: L.code, deck: p.deck }), lt = lastTest(L.code, p.deck);
  const topics = topicsOf(L.code, p.deck);
  const rows = topics.map((t) => {
    const tc = cs.filter((c) => (c.topic || "") === t), dd = dueInfo({ lang: L.code, deck: p.deck, topic: t });
    const unseen = tc.filter((c) => !c.susp && !isLearned(c)).length, known = tc.filter((c) => cardState(c) === "known").length;
    return navRow("topic", t, dn(t) || T("Ohne Thema"), `${plural(tc.length, T("Karte"), T("Karten"))}${known ? ` ${T("· {0} sicher", [num(known)])}` : ""}${unseen ? ` ${T("· {0} noch neu", [num(unseen)])}` : ""}`, dd.due ? `<span class="acc-t">${num(dd.due)}</span><small>${T("fällig")}</small>` : "", badgeTxt((dn(t) || "–").replace(/^L\d+\s*·\s*/, "").slice(0, 2), L.color));
  }).join("");
  const sb = sentenceBank(L.code, p.deck).length;
  return `${backBar()}
    <h1 class="vtitle">${esc(dn(p.deck))}</h1>
    <p class="meta">${esc(lname(L))} · ${plural(cs.length, T("Karte"), T("Karten"))} · ${plural(topics.length, T("Thema"), T("Themen"))}</p>
    <section class="stats" aria-label="${T("Kartenstand")}">
      <div class="stat"><span class="label">${T("Heute dran")}</span><span class="v acc-t">${num(d.total)}</span></div>
      <div class="stat"><span class="label">${T("Im Lernen")}</span><span class="v" style="color:#3FA9FF">${num(m.learn + m.hard)}</span></div>
      <div class="stat"><span class="label">${T("Sicher")}</span><span class="v pos">${num(m.known)}</span></div>
    </section>
    <div class="btnrow">${d.total ? `<button class="btn primary grow" data-action="learn-deck">${T("▶ Lernen ({0})", [num(d.total)])}</button>` : d.moreNew ? `<button class="btn primary grow" data-action="learn-deck-more">${T("+ 10 neue Karten")}</button>` : ""}<button class="btn${d.total || d.moreNew ? "" : " grow"}" data-action="practice-deck">${T("Üben")}</button></div>
    <div class="actgrid">
      <button class="mtile" data-action="test-deck"><span class="tile-t">${T("Test")}</span><span class="tile-s">${lt ? T("Zuletzt {0} % · {1}", [lt.s, esc(dayMonFmt.format(dateOfDay(keyDay(lt.d))))]) : T("Gemischte Fragen mit Note")}</span></button>
      <button class="mtile" data-action="build-deck"${sb ? "" : " disabled"}><span class="tile-t">${T("Sätze bauen")}</span><span class="tile-s">${sb ? plural(sb, T("Satz"), T("Sätze")) : T("Keine Sätze in diesem Projekt")}</span></button>
    </div>
    <section class="sec" aria-labelledby="hTop">
      <div class="sechead"><h2 class="sectitle" id="hTop">${T("Themen")}</h2><button class="more" data-action="deck-cards">${T("Alle Karten ›")}</button></div>
      ${rows}
    </section>
    <section class="sec">
      ${navRow("deck-rename", p.deck, T("Projekt umbenennen"), "")}
      <button class="row nobadge nochev" data-action="deck-delete"><span class="main"><span class="t1 neg">${state.armed === "deck" ? T("Wirklich {0} löschen?", [plural(cs.length, T("Karte"), T("Karten"))]) : T("Projekt löschen")}</span><span class="t2">${T("Löscht alle Karten dieses Projekts samt Fortschritt")}</span></span><span></span></button>
    </section>`;
}

function viewCards(v) {
  const p = v.p || {}, L = langOf(p.lang);
  if (!L) return `${backBar()}<h1 class="vtitle">${T("Nicht gefunden")}</h1>`;
  const filt = state.listFilter;
  let list = state.cards.filter((c) => inScope(c, { lang: L.code, deck: p.deck, topic: p.topic }));
  if (p.verbs) list = list.filter((c) => c.type === "verb");
  const counts = { all: list.length, new: 0, learn: 0, known: 0, hard: 0, susp: 0 };
  const stOf = new Map(list.map((c) => { const s = cardState(c); counts[s]++; return [c.id, s]; }));
  const shown = filt === "all" ? list : list.filter((c) => stOf.get(c.id) === filt);
  shown.sort((a, b) => a.created - b.created);
  state.scopeIds = shown.map((c) => c.id);
  const cap = state.sel ? shown : shown.slice(0, state.showAll ? 5000 : 200);
  const title = p.hard ? T("Schwierige Karten") : p.topic != null ? (dn(p.topic) || T("Ohne Thema")) : p.deck != null ? dn(p.deck) : T("Alle Karten");
  const scoped = p.topic != null || p.deck != null;
  const dd = dueInfo({ lang: L.code, deck: p.deck, topic: p.topic });
  return `${backBar()}
    <h1 class="vtitle">${esc(title)}</h1>
    <p class="meta">${esc([lname(L), p.topic != null ? dn(p.deck) : ""].filter(Boolean).join(" · "))} · ${plural(list.length, T("Karte"), T("Karten"))}</p>
    <div class="btnrow">${scoped && dd.total ? `<button class="btn primary grow" data-action="learn-scope">${T("▶ Lernen ({0})", [num(dd.total)])}</button>` : ""}<button class="btn${scoped && dd.total ? "" : " grow"}" data-action="practice-scope">${T("Diese Karten üben")}</button><button class="btn" data-action="add">${T("+ Karte")}</button></div>
    <div class="pills" role="group" aria-label="${T("Filter")}">${[["all", T("Alle")], ["new", T("Neu")], ["learn", T("Lernen")], ["known", T("Sicher")], ["hard", T("Schwierig")], ["susp", T("Pausiert")]].filter(([k]) => k === "all" || counts[k] || filt === k).map(([k, t]) => `<button data-action="listfilter" data-arg="${k}" aria-pressed="${filt === k}">${t} ${counts[k]}</button>`).join("")}</div>
    ${shown.length ? selToolbar() : ""}
    <section class="sec" aria-label="${T("Karten")}">${cap.map(cardRow).join("") || `<p class="hint" style="padding:12px 0">${T("Keine Karten in dieser Auswahl.")}</p>`}</section>
    ${shown.length > cap.length ? `<div class="btnrow"><button class="btn" data-action="show-all">${T("Alle {0} anzeigen", [num(shown.length)])}</button></div>` : ""}`;
}

function viewVerbs(v) {
  const L = langOf(v.p);
  if (!L) return `${backBar()}<h1 class="vtitle">${T("Nicht gefunden")}</h1>`;
  const list = cardsOf(L.code).filter((c) => c.type === "verb").sort((a, b) => a.created - b.created);
  return `${backBar()}
    <h1 class="vtitle">${T("Konjugation")}</h1>
    <p class="meta">${esc(lname(L))} · ${plural(list.length, T("Verb"), T("Verben"))}</p>
    <section class="card"><span class="label">${T("Abgefragte Zeiten")}</span>
      <div class="chiprow wrap">${L.tenses.map((t) => `<button class="fchip" data-action="tense-toggle" data-arg="${esc(t.n)}" aria-pressed="${L.active.includes(t.n)}">${esc(t.n)}</button>`).join("")}</div>
      <p>${T("Jede aktive Zeit wird pro Verb als eigene Karte wiederholt. Starte mit wenigen Zeiten und schalte weitere dazu, sobald sie sitzen.")}</p></section>
    <div class="btnrow">${list.length ? `<button class="btn primary grow" data-action="drill" data-arg="${esc(L.code)}">${T("⚡ Formen schnell üben")}</button>` : ""}<button class="btn" data-action="add-verb">${T("+ Verb")}</button></div>
    <section class="sec">${list.map((c) => { const n = L.tenses.filter((t) => c.tables && c.tables[t.n] && c.tables[t.n].some(Boolean)).length; return navRow("verb", c.id, c.tg, `${c.de}${c.tables ? ` · ${n} ${noun(n, "Zeitform", "Zeitformen")}` : ""} · ${dn(c.deck)}`, cardState(c) === "hard" ? `<span class="tag bad">${T("Schwierig")}</span>` : "", badgeTxt(c.tg.slice(0, 2), L.color)); }).join("") || `<p class="hint" style="padding:12px 0">${T("Noch keine Verben.")}</p>`}</section>`;
}

function verbTablesHTML(c, L, onlyActive) {
  const out = [];
  for (const t of L.tenses) {
    const forms = c.tables && c.tables[t.n];
    if (!forms || !forms.some(Boolean)) continue;
    if (onlyActive && !L.active.includes(t.n)) continue;
    const labels = tenseLabels(L, t);
    out.push(`<section class="card"><div style="display:flex;align-items:center;gap:8px"><h2 style="flex:1;min-width:0">${esc(t.n)}${L.active.includes(t.n) ? "" : `<span class="tag" style="vertical-align:middle">${T("nicht aktiv")}</span>`}</h2>${canSpeak() ? `<button class="mbtn" data-action="speak-table" data-arg="${esc(t.n)}" aria-label="${T("Vorlesen")}">${ICON_SPEAK}</button>` : ""}</div>
      <table><tbody>${forms.map((f, i) => `<tr><td class="p">${esc(labels[i] || "")}</td><td><b>${esc(f)}</b></td></tr>`).join("")}</tbody></table></section>`);
  }
  return out.join("") || `<p class="hint">${T("Noch keine Formen eingetragen.")}</p>`;
}
function viewVerb(v) {
  const c = cardById(v.p), L = c && langOf(c.lang);
  if (!c || !L) return `${backBar()}<h1 class="vtitle">${T("Nicht gefunden")}</h1>`;
  return `${backBar()}
    <h1 class="vtitle" style="color:${L.color}">${esc(c.tg)}</h1>
    <p class="meta">${esc(c.de)}${c.aux === "essere" ? ` ${T("· Passato prossimo mit essere")}` : ""}</p>
    ${c.ex ? `<section class="card"><p style="color:var(--ink)">${esc(c.ex)}</p>${c.exDe ? `<p>${esc(c.exDe)}</p>` : ""}</section>` : ""}
    ${c.note ? `<section class="card"><p>${esc(c.note)}</p></section>` : ""}
    <div class="btnrow"><button class="btn grow" data-action="card" data-arg="${esc(c.id)}">${T("Bearbeiten")}</button>${canSpeak() ? `<button class="btn" data-action="speak" data-arg="${esc(c.tg)}">${T("{0} Anhören", [ICON_SPEAK])}</button>` : ""}</div>
    ${verbTablesHTML(c, L, false)}`;
}

function searchList() {
  const toks = bareAns(normAns(state.q.text)).split(/\s+/).filter(Boolean);
  return state.cards.filter((c) => {
    if (state.q.lang !== "all" && c.lang !== state.q.lang) return false;
    if (!toks.length) return false;
    const hay = bareAns(normAns([c.tg, c.de, c.ex, c.exDe, c.note, c.topic, c.deck, c.tables ? Object.values(c.tables).flat().join(" ") : ""].join(" ")));
    return toks.every((t) => hay.includes(t));
  }).slice(0, 300);
}
function searchBody() {
  if (!state.q.text.trim()) return `<p class="hint" style="padding:12px 0">${T("Suche in beiden Sprachen, in Beispielsätzen, Notizen und Verbformen.")}</p>`;
  const list = searchList();
  return list.length ? list.map(cardRow).join("") : `<p class="hint" style="padding:12px 0">${T("Nichts gefunden.")} <button class="more" data-action="add-from-search">${T("„{0}“ als Karte anlegen ›", [esc(state.q.text.trim())])}</button></p>`;
}
function viewSearch() {
  return `${backBar()}
    <h1 class="vtitle">${T("Suche")}</h1>
    <label class="searchbar">${ICON_SEARCH}<input id="q" type="search" enterkeyhint="search" autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false" placeholder="${T("Wort, Übersetzung, Verbform …")}" value="${esc(state.q.text)}" aria-label="${T("Karten suchen")}"><button type="button" id="qClear" data-action="q-clear" aria-label="${T("Suche leeren")}"${state.q.text ? "" : " hidden"}>✕</button></label>
    <div class="pills" role="group" aria-label="${T("Sprache")}">${[["all", T("Alle")]].concat(langs().map((l) => [l.code, lname(l)])).map(([k, t]) => `<button data-action="q-lang" data-arg="${esc(k)}" aria-pressed="${state.q.lang === k}">${esc(t)}</button>`).join("")}</div>
    <section class="sec" id="qRes" aria-label="${T("Ergebnisse")}">${searchBody()}</section>`;
}

function viewStats() {
  const days = state.statRange, stk = streakInfo(), m = countByState(null);
  const hist = histArr(null, days, "all"), total = hist.reduce((a, b) => a + b, 0);
  let secs = 0, rv = 0, ok = 0, nw = 0;
  for (let i = 0; i < days; i++) { const d = dayTotals(today() - i); secs += d.s; rv += d.r; ok += d.ok; nw += d.n; }
  const perLang = langs().map((L) => { const mm = countByState(L.code), n = mm.new + mm.learn + mm.known + mm.hard; return n + mm.susp ? `<div class="row nochev" style="grid-template-columns:auto minmax(0,1fr) auto">${badgeTxt(lname(L).slice(0, 2), L.color)}<span class="main"><span class="t1">${esc(lname(L))}</span><span class="t2">${T("{0} sicher · {1} im Lernen · {2} neu", [num(mm.known), num(mm.learn + mm.hard), num(mm.new)])}</span>${stateBar(mm)}</span><span class="val">${num(n)}</span></div>` : ""; }).join("");
  const tests = Object.entries(state.tests).flatMap(([k, list]) => (list || []).map((t) => ({ ...t, k }))).sort((a, b) => b.at - a.at).slice(0, 5);
  return `${backBar()}
    <h1 class="vtitle">${T("Statistik")}</h1>
    <div class="pills" role="group" aria-label="${T("Zeitraum")}">${[[30, T("30 Tage")], [90, T("90 Tage")], [365, T("1 Jahr")]].map(([k, t]) => `<button data-action="statrange" data-arg="${k}" aria-pressed="${days === k}">${t}</button>`).join("")}</div>
    <section class="hero"><span class="label">${T("Gelernte Karten")}</span><div class="heroval">${bigNum(total)}</div>
      <div class="herosub">${T("Ø {0} pro Tag · {1} % gewusst · {2} neue Karten · {3}", [(Math.round(total / days * 10) / 10).toLocaleString(LOC), rv ? Math.round(ok / rv * 100) : 0, num(nw), secs >= 3600 ? T("{0} Std. {1} Min.", [Math.floor(secs / 3600), Math.round(secs % 3600 / 60)]) : T("{0} Min.", [Math.round(secs / 60)])])}</div></section>
    ${chartBlock("chStats", null, state.chart, Math.min(days, 90))}
    <section class="stats" aria-label="${T("Serie")}">
      <div class="stat"><span class="label">${T("Serie")}</span><span class="v">${stk.cur ? "🔥 " + num(stk.cur) : "0"}</span></div>
      <div class="stat"><span class="label">${T("Rekord")}</span><span class="v">${num(stk.best)} ${noun(stk.best, "Tag", "Tage")}</span></div>
      <div class="stat"><span class="label">${T("Lerntage")}</span><span class="v">${num(stk.days)}</span></div>
    </section>
    <section class="sec" aria-labelledby="hPL"><div class="sechead"><h2 class="sectitle" id="hPL">${T("Sprachen")}</h2><span class="hint">${T("{0} sicher", [num(m.known)])}</span></div>${perLang || `<p class="hint">${T("Noch keine Karten.")}</p>`}
      <div class="legend" style="margin-top:10px"><span><i style="background:var(--pos)"></i>${T("Sicher (Abstand ≥ 3 Wochen)")}</span><span><i style="background:#3FA9FF"></i>${T("Im Lernen")}</span><span><i style="background:var(--neg)"></i>${T("Schwierig")}</span></div></section>
    ${tests.length ? `<section class="sec" aria-labelledby="hTests"><div class="sechead"><h2 class="sectitle" id="hTests">${T("Tests")}</h2></div>${tests.map((t) => { const [code, deck] = t.k.split("|"); return `<div class="row nochev nobadge"><span class="main"><span class="t1">${esc(dn(deck))}</span><span class="t2">${esc(langName(code))} · ${esc(dateFmt.format(new Date(t.at)))} · ${plural(t.n, T("Frage"), T("Fragen"))}</span></span><span class="val ${t.s >= 75 ? "pos" : t.s < 60 ? "neg" : ""}">${t.s} %</span></div>`; }).join("")}</section>` : ""}`;
}

function viewStarter(v) {
  const L = langOf(v.p), packs = (L && STARTER[L.code]) || [];
  return `${backBar()}
    <h1 class="vtitle">${T("Starter-Pakete")}</h1>
    <p class="meta">${T("{0} · jedes Paket wird ein Projekt", [esc(L ? lname(L) : "")])}</p>
    ${packs.map((p) => {
      const have = state.cards.filter((c) => c.lang === L.code && c.deck === p.name).length, total = packCards(L.code, p).length;
      return `<section class="card"><div class="split"><h2>${esc(dn(p.name))}</h2><span class="hint">${T("{0} Karten", [num(total)])}</span></div><p>${esc(T(p.desc))}</p>
        <div class="btnrow">${have ? `<span class="hint" style="align-self:center;flex:1">${T("✓ {0} im Projekt", [num(have)])}</span><button class="btn" data-action="pack-load" data-arg="${esc(p.id)}">${T("Ergänzen")}</button><button class="btn danger${state.armed === "pack:" + p.id ? " armed" : ""}" data-action="pack-remove" data-arg="${esc(p.id)}">${state.armed === "pack:" + p.id ? T("{0} löschen?", [num(have)]) : T("Entfernen")}</button>` : `<button class="btn primary grow" data-action="pack-load" data-arg="${esc(p.id)}">${T("Laden")}</button>`}</div></section>`;
    }).join("") || `<p class="hint">${T("Für diese Sprache gibt es noch keine Starter-Pakete. Importiere ein Foto, PDF oder eine Liste.")}</p>`}
    <p class="hint">${T("Neue Karten kommen nach und nach – so viele pro Tag, wie du in den Spracheinstellungen festlegst. Karten, die es schon gibt, werden nicht doppelt angelegt.")}</p>`;
}

const VIEWS = { hub: viewHub, lang: viewLang, deck: viewDeck, cards: viewCards, verbs: viewVerbs, verb: viewVerb, search: viewSearch, stats: viewStats, starter: viewStarter };

function render() {
  dueCache.clear();
  const top = state.stack[state.stack.length - 1], root = $("view");
  const focusId = document.activeElement && document.activeElement.id;
  charts = [];
  root.innerHTML = (VIEWS[top.v] || viewHub)(top);
  root.classList.toggle("hub", top.v === "hub");
  document.body.classList.toggle("hubmode", top.v === "hub");
  root.classList.remove("enter");
  if (state.enter) { void root.offsetWidth; root.classList.add("enter"); state.enter = false; }
  if (focusId && root.contains($(focusId))) $(focusId).focus({ preventScroll: true });
  charts.forEach((c) => drawChart($(c.id), c));
  $("addBtn").hidden = !["lang", "deck", "cards", "verbs"].includes(top.v) || !!state.sel;
  const bar = $("selbar");
  bar.hidden = !state.sel;
  if (state.sel) {
    const n = state.sel.ids.size, b = $("selDelete");
    $("selCount").textContent = T("{0} ausgewählt", [n]);
    [b, $("selTopic"), $("selSusp")].forEach((x) => { x.disabled = n === 0; });
    b.classList.toggle("armed", !!state.sel.armed);
    b.textContent = state.sel.armed ? T("{0} löschen?", [n]) : T("Löschen");
  }
}
let resizeTimer;
window.addEventListener("resize", () => { clearTimeout(resizeTimer); resizeTimer = setTimeout(() => charts.forEach((c) => drawChart($(c.id), c)), 120); });
