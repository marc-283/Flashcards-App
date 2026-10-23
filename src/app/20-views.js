/* ================= Building blocks ================= */
const ICON_SEARCH = '<svg class="ic" viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6.5" fill="none" stroke="currentColor" stroke-width="2.2"/><path d="M15.5 15.5L20.5 20.5" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/></svg>';
const ICON_SPEAK = '<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="M4 9h4l5-4v14l-5-4H4z" fill="currentColor"/><path d="M16.5 8.5a5 5 0 0 1 0 7M19 6a8.5 8.5 0 0 1 0 12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>';
const ICON_SPEAK_BIG = '<svg viewBox="0 0 24 24" width="30" height="30" aria-hidden="true"><path d="M3.5 9h4l5.5-4.5v15L7.5 15h-4z" fill="currentColor"/><path d="M16.5 8.5a5 5 0 0 1 0 7M19.2 5.8a8.8 8.8 0 0 1 0 12.4" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/></svg>';
const ICON_SLOW = '<svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><path d="M4 16.5c0-3.6 2.9-6.5 6.5-6.5s6.5 2.9 6.5 6.5" fill="none" stroke="currentColor" stroke-width="2"/><path d="M17 16.5h2.2a1.8 1.8 0 0 0 0-3.6H17" fill="none" stroke="currentColor" stroke-width="2"/><path d="M3 16.5h16" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path d="M7 16.5v2M14 16.5v2" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><circle cx="19.5" cy="11" r="1" fill="currentColor"/></svg>';
const ICON_MIC = '<svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true"><rect x="8.5" y="3" width="7" height="12" rx="3.5" fill="currentColor"/><path d="M5.5 11.5a6.5 6.5 0 0 0 13 0M12 18v3" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>';
const VIEW_LABEL = { hub: "Menü", lang: "Sprache", deck: "Projekt", cards: "Karten", verbs: "Verben", verb: "Verb", search: "Suche", stats: "Statistik", settings: "Einstellungen", import: "Import", review: "Prüfen", starter: "Starter" };
const backLabel = (prev) => (prev.v === "lang" ? langName(prev.p) : prev.v === "deck" ? prev.p.deck : VIEW_LABEL[prev.v] || "Zurück");
const backBar = () => { const prev = state.stack[state.stack.length - 2]; return `<button class="backbtn" data-action="back"><span aria-hidden="true">‹</span>${esc(prev ? backLabel(prev) : "Menü")}</button>`; };
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
  const tags = (c.type === "verb" ? '<span class="tag">Verb</span>' : c.type === "cloze" ? '<span class="tag">Lücke</span>' : c.pos === "s" ? '<span class="tag">Satz</span>' : "") +
    (!c.de && c.type !== "cloze" ? '<span class="tag bad">Ohne Übersetzung</span>' : stt === "new" ? '<span class="tag attn">Neu</span>' : stt === "hard" ? '<span class="tag bad">Schwierig</span>' : stt === "susp" ? '<span class="tag">Pausiert</span>' : "");
  const title = c.type === "cloze" ? parseCloze(c.tg).text : c.tg;
  const sub = [c.de, c.type === "word" && c.pos && c.pos !== "s" ? POS[c.pos] : "", c.topic].filter(Boolean).join(" · ");
  const dt = stt === "new" || stt === "susp" ? "" : dueText(c);
  return `<button class="row nochev" data-action="card" data-arg="${esc(c.id)}"${state.sel ? ` aria-pressed="${on}"` : ""}>
    ${state.sel ? `<span class="checkc${on ? " on" : ""}" aria-hidden="true">${on ? "✓" : ""}</span>` : badgeTxt((stripArt(c.tg) || "?").slice(0, 2), L ? L.color : "#8E8E96")}
    <span class="main"><span class="t1">${esc(title)}${tags}</span><span class="t2">${esc(sub)}</span></span>
    <span class="val">${dt ? `<small>${esc(dt)}</small>` : ""}</span></button>`;
}
function selToolbar() {
  if (state.sel) return `<div class="seltools"><button class="more" data-action="sel-all">Alle auswählen</button><button class="more" data-action="sel-cancel">Abbrechen</button></div>`;
  return `<div class="seltools"><button class="more" data-action="sel-start">Auswählen</button></div>`;
}
const modePills = () => `<div class="pills" role="group" aria-label="Antwortmodus">${MODES.map(([k, t]) => `<button data-action="mode" data-arg="${k}" aria-pressed="${state.settings.mode === k}">${t}</button>`).join("")}</div>`;

/* ================= Chart (bars, stacked) ================= */
let charts = [];
const shortDate = (n) => { const d = dateOfDay(n); return `${d.getDate()}.${d.getMonth() + 1}.`; };
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
    points = fc.map((v, i) => ({ segs: [v], tick: i === 0 ? "heute" : shortDate(t + i), label: i === 0 ? "Heute (inkl. überfällig)" : i === 1 ? "Morgen" : wdFmt.format(dateOfDay(t + i)) }));
    colors = ["var(--accent)"]; total = fc.reduce((a, b) => a + b, 0);
    base = `${plural(total, "Wiederholung", "Wiederholungen")} in den nächsten ${days} Tagen`;
    legend = `<span><i style="background:var(--accent)"></i>Fällige Wiederholungen</span>`;
  } else {
    points = []; total = 0; let ok = 0, secs = 0;
    for (let i = days - 1; i >= 0; i--) {
      const d = dayTotals(t - i, code); total += d.r + d.p; ok += d.ok; secs += d.s;
      points.push({ segs: [d.ok + d.p, d.r - d.ok], tick: shortDate(t - i), label: i === 0 ? "Heute" : wdFmt.format(dateOfDay(t - i)), d });
    }
    colors = ["var(--pos)", "var(--neg)"];
    const rv = points.reduce((a, p) => a + p.d.r, 0);
    base = `${plural(total, "Karte", "Karten")} in ${days} Tagen${rv ? ` · ${Math.round(ok / rv * 100)} % gewusst` : ""} · ${Math.round(secs / 60)} Min.`;
    legend = `<span><i style="background:var(--pos)"></i>Gewusst / geübt</span><span><i style="background:var(--neg)"></i>Nochmal</span>`;
  }
  charts.push({ id, points, colors, aria: mode === "fc" ? "Vorschau fälliger Karten" : "Gelernte Karten pro Tag",
    onScrub: (i) => { const el = $(id + "Sub"); if (!el) return; if (i == null) { el.textContent = base; return; } const p = points[i]; el.textContent = mode === "fc" ? `${p.label}: ${plural(p.segs[0], "Karte", "Karten")} fällig` : `${p.label}: ${plural(p.d.r + p.d.p, "Karte", "Karten")}${p.d.r ? ` · ${Math.round(p.d.ok / p.d.r * 100)} % gewusst` : ""}${p.d.n ? ` · ${p.d.n} neu` : ""}`; } });
  return `<section class="chartblock" aria-label="Diagramm">
    <div class="split"><div class="pills" role="group" aria-label="Diagramm">${[["hist", "Verlauf"], ["fc", "Vorschau"]].map(([k, l]) => `<button data-action="chartmode" data-arg="${k}" aria-pressed="${mode === k}">${l}</button>`).join("")}</div></div>
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
  if (!n) big = `<button class="addbig" data-action="starter-first"><span aria-hidden="true">★</span>Starter-Wortschatz laden</button>`;
  else if (all.total) big = `<button class="addbig" data-action="learn"><span aria-hidden="true">▶</span>Lernen <small>${num(all.total)} ${all.total === 1 ? "Karte" : "Karten"} · ca. ${minutesFor(all)} Min.</small></button>`;
  else big = `<button class="addbig done" data-action="practice"><span aria-hidden="true">✓</span>Alles erledigt <small>· Üben</small></button>`;
  const tiles = langs().map((L) => {
    const d = dueInfo({ lang: L.code }), cs = cardsOf(L.code), mm = countByState(L.code), act = cs.length - mm.susp;
    return `<button class="tile" data-action="lang" data-arg="${esc(L.code)}">
      <span class="tile-l"><span class="tile-t" style="color:${L.color}">${esc(L.name)}</span>
        <span class="tile-v">${cs.length ? (d.due ? `${num(d.due)} fällig${d.nw ? ` <span class="tile-s">· ${num(d.nw)} neu</span>` : ""}` : d.nw ? `${num(d.nw)} neue Karten` : "Für heute erledigt ✓") : `<span class="tile-s">Noch keine Karten – tippen zum Starten</span>`}</span>
        ${cs.length ? `<span class="tile-s">${plural(cs.length, "Karte", "Karten")} · ${act ? Math.round(mm.known / act * 100) : 0} % sicher</span>` : ""}</span>
      ${spark(histArr(L.code, 14, "all"), L.color)}<span class="chev" aria-hidden="true">›</span></button>`;
  }).join("");
  const verbs = state.cards.filter((c) => c.type === "verb").length;
  const sentences = n ? sentenceBank(null).length : 0;
  return `
    <header class="hubhead">
      <div class="brand"><h1 class="wordmark">P<b>L</b>M</h1><span class="label">Personal Language Management</span></div>
      <button class="mbtn" data-action="nav" data-arg="settings" aria-label="Einstellungen">⚙</button>
    </header>
    ${big}
    <div class="hubrow"><button class="searchbar hubsearch" data-action="nav" data-arg="search">${ICON_SEARCH}<span>Karten suchen</span></button><button class="sqbtn" data-action="add" aria-label="Neue Karte">+</button></div>
    ${n && !syncOn() && (lastBackupDays() == null ? n >= 30 && Date.now() - Math.min(...state.cards.map((c) => c.created)) > 7 * 864e5 : lastBackupDays() > 14) ? `<button class="notice" data-action="export-json">Letztes Backup: ${esc(lastBackupText())} · Jetzt sichern ›</button>` : ""}
    <nav class="tiles" aria-label="Sprachen">${tiles}<button class="tile dash" data-action="add-lang"><span class="tile-l"><span class="tile-t" style="font-size:20px;color:var(--muted)">+ Sprache</span><span class="tile-s">Spanisch, Französisch, Portugiesisch …</span></span><span></span><span class="chev" aria-hidden="true">›</span></button></nav>
    <div class="minitiles">
      <button class="mtile" data-action="build-any"><span class="tile-t">Sätze bauen</span>${sentences ? `<span class="tile-v">${num(sentences)}</span><span class="tile-s">Sätze aus deinen Wörtern</span>` : `<span class="tile-s">Sätze bilden und korrigieren lassen</span>`}</button>
      <button class="mtile" data-action="drill-any"><span class="tile-t">Konjugation</span>${verbs ? `<span class="tile-v">${num(verbs)}</span><span class="tile-s">Verben – Formen üben</span>` : `<span class="tile-s">Verbformen trainieren</span>`}</button>
      <button class="mtile" data-action="import-any"><span class="tile-t">Importieren</span><span class="tile-s">Foto, PDF oder Liste in Karten verwandeln</span></button>
      <button class="mtile" data-action="nav" data-arg="stats"><span class="tile-t">Statistik</span><span class="tile-v">${num(m.known)}</span><span class="tile-s">Karten sicher gelernt</span></button>
    </div>
    <section class="accounts" aria-label="Heute">
      <span class="label">Heute gelernt</span>
      <div class="acc-total">${bigNum(td.r + td.p, td.r + td.p === 1 ? "Karte" : "Karten")}</div>
      <div class="acc-split">
        <div class="acc"><span class="label">Serie</span><b>${stk.cur ? `🔥 ${num(stk.cur)} ${stk.cur === 1 ? "Tag" : "Tage"}` : "–"}</b></div>
        <div class="acc"><span class="label">Gewusst</span><b>${td.r ? Math.round(td.ok / td.r * 100) + " %" : "–"}</b></div>
        <div class="acc"><span class="label">Zeit</span><b>${td.s ? Math.max(1, Math.round(td.s / 60)) + " Min." : "–"}</b></div>
      </div>
      <div class="ytd"><span class="label">Diese Woche</span><b>${num(week)}</b><span class="label">Karten</span></div>
      ${syncOn() ? `<button class="syncline" data-action="sync-now" id="syncLine">${esc(syncStatusText())}</button>` : ""}
    </section>`;
}

function deckRows(L) {
  return decksOf(L.code).map((d) => {
    const dd = dueInfo({ lang: L.code, deck: d.name }), m = countByState({ lang: L.code, deck: d.name });
    const act = d.n - m.susp;
    return navRow("deck", d.name, d.name, `${plural(d.n, "Karte", "Karten")}${act ? ` · ${Math.round(m.known / act * 100)} % sicher` : ""}${m.new ? ` · ${num(m.new)} noch neu` : ""}`,
      dd.due ? `<span class="acc-t">${num(dd.due)}</span><small>fällig</small>` : dd.nw ? `<small>${num(dd.nw)} neu</small>` : "", badgeTxt(d.name.slice(0, 2), L.color));
  }).join("");
}
function viewLang(v) {
  const L = langOf(v.p);
  if (!L) return `${backBar()}<h1 class="vtitle">Sprache nicht gefunden</h1>`;
  const cs = cardsOf(L.code), d = dueInfo({ lang: L.code }), m = countByState(L.code);
  const head = `${backBar()}<h1 class="vtitle" style="color:${L.color}">${esc(L.name)}</h1>`;
  const packs = STARTER[L.code] || [];
  const lp = ` data-p="${esc(L.code)}"`;
  if (!cs.length) return `${head}
    <section class="empty"><strong>Noch keine Karten</strong><span>${packs.length ? "Lade ein Starter-Paket, fotografiere eine Vokabelliste, lade ein PDF aus deinem Kurs hoch oder leg eigene Karten an." : "Fotografiere eine Vokabelliste, lade ein PDF hoch, importiere eine Liste oder leg eigene Karten an."}</span>
      <div class="btnrow">${packs.length ? `<button class="btn primary" data-action="nav" data-arg="starter"${lp}>Starter-Pakete</button>` : ""}<button class="btn" data-action="nav" data-arg="import"${lp}>Foto / PDF / Liste</button><button class="btn" data-action="add">+ Karte</button></div></section>
    <section class="sec">${navRow("lang-settings", L.code, "Spracheinstellungen", "Neue Karten pro Tag, Richtung, Zeiten, Stimme")}</section>`;
  const verbs = cs.filter((c) => c.type === "verb").length, sb = sentenceBank(L.code).length;
  return `${head}
    <section class="hero">
      <span class="label">Heute dran</span>
      <div class="heroval">${bigNum(d.total, d.total === 1 ? "Karte" : "Karten")}</div>
      <div class="herosub">${d.total ? `${plural(d.due, "Wiederholung", "Wiederholungen")} · ${num(d.nw)} neu · ca. ${minutesFor(d)} Min.` : d.moreNew ? `Für heute erledigt · ${num(d.moreNew)} neue Karten warten` : "Für heute erledigt"}</div>
    </section>
    <div class="btnrow">${d.total ? `<button class="btn primary grow" data-action="learn" data-arg="${esc(L.code)}">▶ Lernen</button>` : d.moreNew ? `<button class="btn primary grow" data-action="learn-more" data-arg="${esc(L.code)}">+ 10 neue Karten</button>` : ""}<button class="btn${d.total || d.moreNew ? "" : " grow"}" data-action="practice" data-arg="${esc(L.code)}">Üben</button></div>
    ${modePills()}
    ${chartBlock("chLang", L.code, state.chart, 30)}
    <section class="stats" aria-label="Kartenstand">
      <div class="stat"><span class="label">Neu</span><span class="v">${num(m.new)}</span></div>
      <div class="stat"><span class="label">Im Lernen</span><span class="v" style="color:#3FA9FF">${num(m.learn + m.hard)}</span></div>
      <div class="stat"><span class="label">Sicher</span><span class="v pos">${num(m.known)}</span></div>
    </section>
    <section class="sec" aria-labelledby="hDecks">
      <div class="sechead"><h2 class="sectitle" id="hDecks">Projekte</h2><button class="more" data-action="cards" data-arg="">Alle Karten ›</button></div>
      ${deckRows(L)}
    </section>
    <section class="sec" aria-labelledby="hPrac">
      <div class="sechead"><h2 class="sectitle" id="hPrac">Üben</h2></div>
      ${navRow("build", L.code, "Sätze bauen", sb ? `${plural(sb, "Satz", "Sätze")} – aus Bausteinen oder frei tippen, mit Korrektur` : "Sätze entstehen aus Beispielsätzen und Satzkarten", "", badgeTxt("✎", L.color))}
      ${navRow("nav", "verbs", "Konjugation", verbs ? `${plural(verbs, "Verb", "Verben")} · aktiv: ${L.active.join(", ") || "keine Zeit"}` : "Noch keine Verben – leg eins an", "", badgeTxt("V", L.color), lp)}
      ${verbs ? navRow("drill", L.code, "Formen schnell üben", "Zufällige Personen und Zeiten", "", badgeTxt("⚡", L.color)) : ""}
      ${m.hard ? navRow("cards-hard", L.code, `Schwierige Karten (${m.hard})`, "Oft vergessen – gezielt üben oder Eselsbrücke ergänzen", "", badgeTxt("!", "#FF4F45")) : ""}
    </section>
    <section class="sec" aria-labelledby="hMore">
      <div class="sechead"><h2 class="sectitle" id="hMore">Mehr</h2></div>
      ${navRow("nav", "import", "Importieren", "Foto, PDF aus dem Kurs oder Liste (Quizlet, Anki, Excel)", "", "", lp)}
      ${packs.length ? navRow("nav", "starter", "Starter-Pakete", packs.map((p) => p.name).join(", "), "", "", lp) : ""}
      ${navRow("lang-settings", L.code, "Spracheinstellungen", `${L.newPerDay} neue pro Tag · ${L.dirs === "both" ? "beide Richtungen" : L.dirs === "f" ? "nur Deutsch → " + L.name : "nur " + L.name + " → Deutsch"}`)}
    </section>`;
}

function lastTest(code, deck) {
  const list = state.tests[`${code}|${deck}`] || [];
  return list.length ? list[list.length - 1] : null;
}
function viewDeck(v) {
  const p = v.p || {}, L = langOf(p.lang);
  const cs = L ? state.cards.filter((c) => c.lang === L.code && c.deck === p.deck) : [];
  if (!L || !cs.length) return `${backBar()}<h1 class="vtitle">Projekt leer</h1><p class="hint">In diesem Projekt sind keine Karten mehr.</p>`;
  const d = dueInfo({ lang: L.code, deck: p.deck }), m = countByState({ lang: L.code, deck: p.deck }), lt = lastTest(L.code, p.deck);
  const topics = topicsOf(L.code, p.deck);
  const rows = topics.map((t) => {
    const tc = cs.filter((c) => (c.topic || "") === t), dd = dueInfo({ lang: L.code, deck: p.deck, topic: t });
    const unseen = tc.filter((c) => !c.susp && !isLearned(c)).length, known = tc.filter((c) => cardState(c) === "known").length;
    return navRow("topic", t, t || "Ohne Thema", `${plural(tc.length, "Karte", "Karten")}${known ? ` · ${num(known)} sicher` : ""}${unseen ? ` · ${num(unseen)} noch neu` : ""}`, dd.due ? `<span class="acc-t">${num(dd.due)}</span><small>fällig</small>` : "", badgeTxt((t || "–").replace(/^L\d+\s*·\s*/, "").slice(0, 2), L.color));
  }).join("");
  const sb = sentenceBank(L.code, p.deck).length;
  return `${backBar()}
    <h1 class="vtitle">${esc(p.deck)}</h1>
    <p class="meta">${esc(L.name)} · ${plural(cs.length, "Karte", "Karten")} · ${plural(topics.length, "Thema", "Themen")}</p>
    <section class="stats" aria-label="Kartenstand">
      <div class="stat"><span class="label">Heute dran</span><span class="v acc-t">${num(d.total)}</span></div>
      <div class="stat"><span class="label">Im Lernen</span><span class="v" style="color:#3FA9FF">${num(m.learn + m.hard)}</span></div>
      <div class="stat"><span class="label">Sicher</span><span class="v pos">${num(m.known)}</span></div>
    </section>
    <div class="btnrow">${d.total ? `<button class="btn primary grow" data-action="learn-deck">▶ Lernen (${num(d.total)})</button>` : d.moreNew ? `<button class="btn primary grow" data-action="learn-deck-more">+ 10 neue Karten</button>` : ""}<button class="btn${d.total || d.moreNew ? "" : " grow"}" data-action="practice-deck">Üben</button></div>
    <div class="actgrid">
      <button class="mtile" data-action="test-deck"><span class="tile-t">Test</span><span class="tile-s">${lt ? `Zuletzt ${lt.s} % · ${esc(dayMonFmt.format(dateOfDay(keyDay(lt.d))))}` : "Gemischte Fragen mit Note"}</span></button>
      <button class="mtile" data-action="build-deck"${sb ? "" : " disabled"}><span class="tile-t">Sätze bauen</span><span class="tile-s">${sb ? plural(sb, "Satz", "Sätze") : "Keine Sätze in diesem Projekt"}</span></button>
    </div>
    <section class="sec" aria-labelledby="hTop">
      <div class="sechead"><h2 class="sectitle" id="hTop">Themen</h2><button class="more" data-action="deck-cards">Alle Karten ›</button></div>
      ${rows}
    </section>
    <section class="sec">
      ${navRow("deck-rename", p.deck, "Projekt umbenennen", "")}
      <button class="row nobadge nochev" data-action="deck-delete"><span class="main"><span class="t1 neg">${state.armed === "deck" ? `Wirklich ${plural(cs.length, "Karte", "Karten")} löschen?` : "Projekt löschen"}</span><span class="t2">Löscht alle Karten dieses Projekts samt Fortschritt</span></span><span></span></button>
    </section>`;
}

function viewCards(v) {
  const p = v.p || {}, L = langOf(p.lang);
  if (!L) return `${backBar()}<h1 class="vtitle">Nicht gefunden</h1>`;
  const filt = state.listFilter;
  let list = state.cards.filter((c) => inScope(c, { lang: L.code, deck: p.deck, topic: p.topic }));
  if (p.verbs) list = list.filter((c) => c.type === "verb");
  const counts = { all: list.length, new: 0, learn: 0, known: 0, hard: 0, susp: 0 };
  const stOf = new Map(list.map((c) => { const s = cardState(c); counts[s]++; return [c.id, s]; }));
  const shown = filt === "all" ? list : list.filter((c) => stOf.get(c.id) === filt);
  shown.sort((a, b) => a.created - b.created);
  state.scopeIds = shown.map((c) => c.id);
  const cap = state.sel ? shown : shown.slice(0, state.showAll ? 5000 : 200);
  const title = p.hard ? "Schwierige Karten" : p.topic != null ? (p.topic || "Ohne Thema") : p.deck != null ? p.deck : "Alle Karten";
  const scoped = p.topic != null || p.deck != null;
  const dd = dueInfo({ lang: L.code, deck: p.deck, topic: p.topic });
  return `${backBar()}
    <h1 class="vtitle">${esc(title)}</h1>
    <p class="meta">${esc([L.name, p.topic != null ? p.deck : ""].filter(Boolean).join(" · "))} · ${plural(list.length, "Karte", "Karten")}</p>
    <div class="btnrow">${scoped && dd.total ? `<button class="btn primary grow" data-action="learn-scope">▶ Lernen (${num(dd.total)})</button>` : ""}<button class="btn${scoped && dd.total ? "" : " grow"}" data-action="practice-scope">Diese Karten üben</button><button class="btn" data-action="add">+ Karte</button></div>
    <div class="pills" role="group" aria-label="Filter">${[["all", "Alle"], ["new", "Neu"], ["learn", "Lernen"], ["known", "Sicher"], ["hard", "Schwierig"], ["susp", "Pausiert"]].filter(([k]) => k === "all" || counts[k] || filt === k).map(([k, t]) => `<button data-action="listfilter" data-arg="${k}" aria-pressed="${filt === k}">${t} ${counts[k]}</button>`).join("")}</div>
    ${shown.length ? selToolbar() : ""}
    <section class="sec" aria-label="Karten">${cap.map(cardRow).join("") || `<p class="hint" style="padding:12px 0">Keine Karten in dieser Auswahl.</p>`}</section>
    ${shown.length > cap.length ? `<div class="btnrow"><button class="btn" data-action="show-all">Alle ${num(shown.length)} anzeigen</button></div>` : ""}`;
}

function viewVerbs(v) {
  const L = langOf(v.p);
  if (!L) return `${backBar()}<h1 class="vtitle">Nicht gefunden</h1>`;
  const list = cardsOf(L.code).filter((c) => c.type === "verb").sort((a, b) => a.created - b.created);
  return `${backBar()}
    <h1 class="vtitle">Konjugation</h1>
    <p class="meta">${esc(L.name)} · ${plural(list.length, "Verb", "Verben")}</p>
    <section class="card"><span class="label">Abgefragte Zeiten</span>
      <div class="chiprow wrap">${L.tenses.map((t) => `<button class="fchip" data-action="tense-toggle" data-arg="${esc(t.n)}" aria-pressed="${L.active.includes(t.n)}">${esc(t.n)}</button>`).join("")}</div>
      <p>Jede aktive Zeit wird pro Verb als eigene Karte wiederholt. Starte mit wenigen Zeiten und schalte weitere dazu, sobald sie sitzen.</p></section>
    <div class="btnrow">${list.length ? `<button class="btn primary grow" data-action="drill" data-arg="${esc(L.code)}">⚡ Formen schnell üben</button>` : ""}<button class="btn" data-action="add-verb">+ Verb</button></div>
    <section class="sec">${list.map((c) => { const n = L.tenses.filter((t) => c.tables && c.tables[t.n] && c.tables[t.n].some(Boolean)).length; return navRow("verb", c.id, c.tg, `${c.de}${c.tables ? ` · ${n} ${n === 1 ? "Zeit" : "Zeiten"}` : ""} · ${c.deck}`, cardState(c) === "hard" ? '<span class="tag bad">Schwierig</span>' : "", badgeTxt(c.tg.slice(0, 2), L.color)); }).join("") || `<p class="hint" style="padding:12px 0">Noch keine Verben.</p>`}</section>`;
}

function verbTablesHTML(c, L, onlyActive) {
  const out = [];
  for (const t of L.tenses) {
    const forms = c.tables && c.tables[t.n];
    if (!forms || !forms.some(Boolean)) continue;
    if (onlyActive && !L.active.includes(t.n)) continue;
    const labels = tenseLabels(L, t);
    out.push(`<section class="card"><div style="display:flex;align-items:center;gap:8px"><h2 style="flex:1;min-width:0">${esc(t.n)}${L.active.includes(t.n) ? "" : '<span class="tag" style="vertical-align:middle">nicht aktiv</span>'}</h2>${canSpeak() ? `<button class="mbtn" data-action="speak-table" data-arg="${esc(t.n)}" aria-label="Vorlesen">${ICON_SPEAK}</button>` : ""}</div>
      <table><tbody>${forms.map((f, i) => `<tr><td class="p">${esc(labels[i] || "")}</td><td><b>${esc(f)}</b></td></tr>`).join("")}</tbody></table></section>`);
  }
  return out.join("") || `<p class="hint">Noch keine Formen eingetragen.</p>`;
}
function viewVerb(v) {
  const c = cardById(v.p), L = c && langOf(c.lang);
  if (!c || !L) return `${backBar()}<h1 class="vtitle">Nicht gefunden</h1>`;
  return `${backBar()}
    <h1 class="vtitle" style="color:${L.color}">${esc(c.tg)}</h1>
    <p class="meta">${esc(c.de)}${c.aux === "essere" ? " · Passato prossimo mit essere" : ""}</p>
    ${c.ex ? `<section class="card"><p style="color:var(--ink)">${esc(c.ex)}</p>${c.exDe ? `<p>${esc(c.exDe)}</p>` : ""}</section>` : ""}
    ${c.note ? `<section class="card"><p>${esc(c.note)}</p></section>` : ""}
    <div class="btnrow"><button class="btn grow" data-action="card" data-arg="${esc(c.id)}">Bearbeiten</button>${canSpeak() ? `<button class="btn" data-action="speak" data-arg="${esc(c.tg)}">${ICON_SPEAK} Anhören</button>` : ""}</div>
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
  if (!state.q.text.trim()) return `<p class="hint" style="padding:12px 0">Suche in beiden Sprachen, in Beispielsätzen, Notizen und Verbformen.</p>`;
  const list = searchList();
  return list.length ? list.map(cardRow).join("") : `<p class="hint" style="padding:12px 0">Nichts gefunden. <button class="more" data-action="add-from-search">„${esc(state.q.text.trim())}“ als Karte anlegen ›</button></p>`;
}
function viewSearch() {
  return `${backBar()}
    <h1 class="vtitle">Suche</h1>
    <label class="searchbar">${ICON_SEARCH}<input id="q" type="search" enterkeyhint="search" autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false" placeholder="Wort, Übersetzung, Verbform …" value="${esc(state.q.text)}" aria-label="Karten suchen"><button type="button" id="qClear" data-action="q-clear" aria-label="Suche leeren"${state.q.text ? "" : " hidden"}>✕</button></label>
    <div class="pills" role="group" aria-label="Sprache">${[["all", "Alle"]].concat(langs().map((l) => [l.code, l.name])).map(([k, t]) => `<button data-action="q-lang" data-arg="${esc(k)}" aria-pressed="${state.q.lang === k}">${esc(t)}</button>`).join("")}</div>
    <section class="sec" id="qRes" aria-label="Ergebnisse">${searchBody()}</section>`;
}

function viewStats() {
  const days = state.statRange, stk = streakInfo(), m = countByState(null);
  const hist = histArr(null, days, "all"), total = hist.reduce((a, b) => a + b, 0);
  let secs = 0, rv = 0, ok = 0, nw = 0;
  for (let i = 0; i < days; i++) { const d = dayTotals(today() - i); secs += d.s; rv += d.r; ok += d.ok; nw += d.n; }
  const perLang = langs().map((L) => { const mm = countByState(L.code), n = mm.new + mm.learn + mm.known + mm.hard; return n + mm.susp ? `<div class="row nochev" style="grid-template-columns:auto minmax(0,1fr) auto">${badgeTxt(L.name.slice(0, 2), L.color)}<span class="main"><span class="t1">${esc(L.name)}</span><span class="t2">${num(mm.known)} sicher · ${num(mm.learn + mm.hard)} im Lernen · ${num(mm.new)} neu</span>${stateBar(mm)}</span><span class="val">${num(n)}</span></div>` : ""; }).join("");
  const tests = Object.entries(state.tests).flatMap(([k, list]) => (list || []).map((t) => ({ ...t, k }))).sort((a, b) => b.at - a.at).slice(0, 5);
  return `${backBar()}
    <h1 class="vtitle">Statistik</h1>
    <div class="pills" role="group" aria-label="Zeitraum">${[[30, "30 Tage"], [90, "90 Tage"], [365, "1 Jahr"]].map(([k, t]) => `<button data-action="statrange" data-arg="${k}" aria-pressed="${days === k}">${t}</button>`).join("")}</div>
    <section class="hero"><span class="label">Gelernte Karten</span><div class="heroval">${bigNum(total)}</div>
      <div class="herosub">Ø ${(Math.round(total / days * 10) / 10).toLocaleString("de-DE")} pro Tag · ${rv ? Math.round(ok / rv * 100) : 0} % gewusst · ${num(nw)} neue Karten · ${secs >= 3600 ? `${Math.floor(secs / 3600)} Std. ${Math.round(secs % 3600 / 60)} Min.` : `${Math.round(secs / 60)} Min.`}</div></section>
    ${chartBlock("chStats", null, state.chart, Math.min(days, 90))}
    <section class="stats" aria-label="Serie">
      <div class="stat"><span class="label">Serie</span><span class="v">${stk.cur ? "🔥 " + num(stk.cur) : "0"}</span></div>
      <div class="stat"><span class="label">Rekord</span><span class="v">${num(stk.best)} ${stk.best === 1 ? "Tag" : "Tage"}</span></div>
      <div class="stat"><span class="label">Lerntage</span><span class="v">${num(stk.days)}</span></div>
    </section>
    <section class="sec" aria-labelledby="hPL"><div class="sechead"><h2 class="sectitle" id="hPL">Sprachen</h2><span class="hint">${num(m.known)} sicher</span></div>${perLang || `<p class="hint">Noch keine Karten.</p>`}
      <div class="legend" style="margin-top:10px"><span><i style="background:var(--pos)"></i>Sicher (Abstand ≥ 3 Wochen)</span><span><i style="background:#3FA9FF"></i>Im Lernen</span><span><i style="background:var(--neg)"></i>Schwierig</span></div></section>
    ${tests.length ? `<section class="sec" aria-labelledby="hTests"><div class="sechead"><h2 class="sectitle" id="hTests">Tests</h2></div>${tests.map((t) => { const [code, deck] = t.k.split("|"); return `<div class="row nochev nobadge"><span class="main"><span class="t1">${esc(deck)}</span><span class="t2">${esc(langName(code))} · ${esc(dateFmt.format(new Date(t.at)))} · ${plural(t.n, "Frage", "Fragen")}</span></span><span class="val ${t.s >= 75 ? "pos" : t.s < 60 ? "neg" : ""}">${t.s} %</span></div>`; }).join("")}</section>` : ""}`;
}

function viewStarter(v) {
  const L = langOf(v.p), packs = (L && STARTER[L.code]) || [];
  return `${backBar()}
    <h1 class="vtitle">Starter-Pakete</h1>
    <p class="meta">${esc(L ? L.name : "")} · jedes Paket wird ein Projekt</p>
    ${packs.map((p) => {
      const have = state.cards.filter((c) => c.lang === L.code && c.deck === p.name).length, total = packCards(L.code, p).length;
      return `<section class="card"><div class="split"><h2>${esc(p.name)}</h2><span class="hint">${num(total)} Karten</span></div><p>${esc(p.desc)}</p>
        <div class="btnrow">${have ? `<span class="hint" style="align-self:center;flex:1">✓ ${num(have)} im Projekt</span><button class="btn" data-action="pack-load" data-arg="${esc(p.id)}">Ergänzen</button><button class="btn danger${state.armed === "pack:" + p.id ? " armed" : ""}" data-action="pack-remove" data-arg="${esc(p.id)}">${state.armed === "pack:" + p.id ? `${num(have)} löschen?` : "Entfernen"}</button>` : `<button class="btn primary grow" data-action="pack-load" data-arg="${esc(p.id)}">Laden</button>`}</div></section>`;
    }).join("") || `<p class="hint">Für diese Sprache gibt es noch keine Starter-Pakete. Importiere ein Foto, PDF oder eine Liste.</p>`}
    <p class="hint">Neue Karten kommen nach und nach – so viele pro Tag, wie du in den Spracheinstellungen festlegst. Karten, die es schon gibt, werden nicht doppelt angelegt.</p>`;
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
    $("selCount").textContent = `${n} ausgewählt`;
    [b, $("selTopic"), $("selSusp")].forEach((x) => { x.disabled = n === 0; });
    b.classList.toggle("armed", !!state.sel.armed);
    b.textContent = state.sel.armed ? `${n} löschen?` : "Löschen";
  }
}
let resizeTimer;
window.addEventListener("resize", () => { clearTimeout(resizeTimer); resizeTimer = setTimeout(() => charts.forEach((c) => drawChart($(c.id), c)), 120); });
