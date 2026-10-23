/* ================= Building blocks ================= */
const ICON_SEARCH = '<svg class="ic" viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6.5" fill="none" stroke="currentColor" stroke-width="2.2"/><path d="M15.5 15.5L20.5 20.5" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/></svg>';
const ICON_SPEAK = '<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="M4 9h4l5-4v14l-5-4H4z" fill="currentColor"/><path d="M16.5 8.5a5 5 0 0 1 0 7M19 6a8.5 8.5 0 0 1 0 12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>';
const VIEW_LABEL = { hub: "Menü", lang: "Sprache", cards: "Karten", verbs: "Verben", verb: "Verb", search: "Suche", stats: "Statistik", settings: "Einstellungen", import: "Import", starter: "Starter" };
const backBar = () => { const prev = state.stack[state.stack.length - 2]; return `<button class="backbtn" data-action="back"><span aria-hidden="true">‹</span>${esc(prev ? (prev.v === "lang" ? langName(prev.p) : VIEW_LABEL[prev.v] || "Zurück") : "Menü")}</button>`; };
const badgeTxt = (txt, color) => `<span class="badge" style="color:${color};background:${color}24" aria-hidden="true">${esc(txt)}</span>`;
function navRow(action, arg, title, sub, val, badgeHTML) {
  return `<button class="row${badgeHTML ? "" : " nobadge"}" data-action="${action}" data-arg="${esc(arg)}">
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
function cardRow(c) {
  const L = langOf(c.lang), stt = cardState(c), on = state.sel && state.sel.ids.has(c.id);
  const tags = (c.type === "verb" ? '<span class="tag">Verb</span>' : c.type === "cloze" ? '<span class="tag">Satz</span>' : "") +
    (stt === "new" ? '<span class="tag attn">Neu</span>' : stt === "hard" ? '<span class="tag bad">Schwierig</span>' : stt === "susp" ? '<span class="tag">Pausiert</span>' : "");
  const title = c.type === "cloze" ? parseCloze(c.tg).text : c.tg;
  const sub = [c.de, c.type === "word" && c.pos ? POS[c.pos] : "", c.topic].filter(Boolean).join(" · ");
  const dt = stt === "new" || stt === "susp" ? "" : dueText(c);
  return `<button class="row nochev" data-action="card" data-arg="${esc(c.id)}"${state.sel ? ` aria-pressed="${on}"` : ""}>
    ${state.sel ? `<span class="checkc${on ? " on" : ""}" aria-hidden="true">${on ? "✓" : ""}</span>` : badgeTxt((c.tg.replace(/^(il|lo|la|l'|i|gli|le|the|to|a|an|el|los|las|le|les|un|une|uno|una|de|het|en|ett)\s+|^l'/i, "") || "?").slice(0, 2), L ? L.color : "#8E8E96")}
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
/* History (done per day, correct vs. again) or forecast (due per day) */
function chartBlock(id, code, mode, days) {
  const t = today();
  let points, colors, total, sub, legend, base;
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
    legend = `<span><i style="background:var(--pos)"></i>Gewusst</span><span><i style="background:var(--neg)"></i>Nochmal</span>`;
  }
  sub = base;
  charts.push({ id, points, colors, aria: mode === "fc" ? "Vorschau fälliger Karten" : "Gelernte Karten pro Tag",
    onScrub: (i) => { const el = $(id + "Sub"); if (!el) return; if (i == null) { el.textContent = base; return; } const p = points[i]; el.textContent = mode === "fc" ? `${p.label}: ${plural(p.segs[0], "Karte", "Karten")} fällig` : `${p.label}: ${plural(p.d.r + p.d.p, "Karte", "Karten")}${p.d.r ? ` · ${Math.round(p.d.ok / p.d.r * 100)} % gewusst` : ""}${p.d.n ? ` · ${p.d.n} neu` : ""}`; } });
  return `<section class="chartblock" aria-label="Diagramm">
    <div class="split"><div class="pills" role="group" aria-label="Diagramm">${[["hist", "Verlauf"], ["fc", "Vorschau"]].map(([k, l]) => `<button data-action="chartmode" data-arg="${k}" aria-pressed="${mode === k}">${l}</button>`).join("")}</div></div>
    <div class="herosub" id="${id}Sub">${esc(sub)}</div>
    <div class="chart" id="${id}"></div>
    <div class="legend">${legend}</div></section>`;
}

/* ================= Views ================= */
function viewHub() {
  const all = dueInfo(null), td = dayTotals(today()), stk = streakInfo(), m = countByState(null);
  const n = state.cards.length;
  const week = histArr(null, 7, "all").reduce((a, b) => a + b, 0);
  let big;
  if (!n) big = `<button class="addbig" data-action="starter-first"><span aria-hidden="true">★</span>Starter-Wortschatz laden</button>`;
  else if (all.total) big = `<button class="addbig" data-action="learn"><span aria-hidden="true">▶</span>Lernen <small>${num(all.total)} ${all.total === 1 ? "Karte" : "Karten"} · ca. ${minutesFor(all)} Min.</small></button>`;
  else big = `<button class="addbig done" data-action="practice"><span aria-hidden="true">✓</span>Alles erledigt <small>· Üben</small></button>`;
  const tiles = langs().map((L) => {
    const d = dueInfo(L.code), cs = cardsOf(L.code), mm = countByState(L.code), act = cs.length - mm.susp;
    return `<button class="tile" data-action="lang" data-arg="${esc(L.code)}">
      <span class="tile-l"><span class="tile-t" style="color:${L.color}">${esc(L.name)}</span>
        <span class="tile-v">${cs.length ? (d.due ? `${num(d.due)} fällig${d.nw ? ` <span class="tile-s">· ${num(d.nw)} neu</span>` : ""}` : d.nw ? `${num(d.nw)} neue Karten` : "Für heute erledigt ✓") : `<span class="tile-s">Noch keine Karten – tippen zum Starten</span>`}</span>
        ${cs.length ? `<span class="tile-s">${plural(cs.length, "Karte", "Karten")} · ${act ? Math.round(mm.known / act * 100) : 0} % sicher</span>` : ""}</span>
      ${spark(histArr(L.code, 14, "all"), L.color)}<span class="chev" aria-hidden="true">›</span></button>`;
  }).join("");
  const verbs = state.cards.filter((c) => c.type === "verb").length;
  return `
    <header class="hubhead">
      <div class="brand"><h1 class="wordmark">P<b>L</b>M</h1><span class="label">Personal Language Management</span></div>
      <button class="mbtn" data-action="nav" data-arg="settings" aria-label="Einstellungen">⚙</button>
    </header>
    ${big}
    <div class="hubrow"><button class="searchbar hubsearch" data-action="nav" data-arg="search">${ICON_SEARCH}<span>Karten suchen</span></button><button class="sqbtn" data-action="add" aria-label="Neue Karte">+</button></div>
    ${n && (lastBackupDays() == null ? n >= 30 && Date.now() - Math.min(...state.cards.map((c) => c.created)) > 7 * 864e5 : lastBackupDays() > 14) ? `<button class="notice" data-action="export-json">Letztes Backup: ${esc(lastBackupText())} · Jetzt sichern ›</button>` : ""}
    <nav class="tiles" aria-label="Sprachen">${tiles}<button class="tile dash" data-action="add-lang"><span class="tile-l"><span class="tile-t" style="font-size:20px;color:var(--muted)">+ Sprache</span><span class="tile-s">Spanisch, Französisch, Portugiesisch …</span></span><span></span><span class="chev" aria-hidden="true">›</span></button></nav>
    <div class="minitiles">
      <button class="mtile" data-action="drill-any"><span class="tile-t">Konjugation</span>${verbs ? `<span class="tile-v">${num(verbs)}</span><span class="tile-s">Verben – Formen schnell üben</span>` : `<span class="tile-s">Verbformen trainieren</span>`}</button>
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
    </section>`;
}

function viewLang(v) {
  const L = langOf(v.p);
  if (!L) return `${backBar()}<h1 class="vtitle">Sprache nicht gefunden</h1>`;
  const cs = cardsOf(L.code), d = dueInfo(L.code), m = countByState(L.code);
  const head = `${backBar()}<h1 class="vtitle" style="color:${L.color}">${esc(L.name)}</h1>`;
  const packs = STARTER[L.code] || [];
  if (!cs.length) return `${head}
    <section class="empty"><strong>Noch keine Karten</strong><span>${packs.length ? "Lade einen Starter-Wortschatz, leg eigene Karten an oder importiere eine Liste (z. B. aus Quizlet, Anki oder Excel)." : "Leg eigene Karten an oder importiere eine Liste (z. B. aus Quizlet, Anki oder Excel)."}</span>
      <div class="btnrow">${packs.length ? `<button class="btn primary" data-action="nav" data-arg="starter" data-p="${esc(L.code)}">Starter-Wortschatz</button>` : ""}<button class="btn" data-action="add">+ Karte</button><button class="btn" data-action="nav" data-arg="import" data-p="${esc(L.code)}">Importieren</button></div></section>
    <section class="sec">${navRow("lang-settings", L.code, "Spracheinstellungen", "Neue Karten pro Tag, Richtung, Zeiten, Aussprache")}</section>`;
  const topics = topicsOf(L.code);
  const topicRows = topics.map((t) => {
    const tc = cs.filter((c) => (c.topic || "") === t), dd = dueInfo(L.code, t), unseen = tc.filter((c) => !c.susp && !Object.keys(c.srs).length).length, known = tc.filter((c) => cardState(c) === "known").length;
    return navRow("topic", t, t || "Ohne Thema", `${plural(tc.length, "Karte", "Karten")}${known ? ` · ${num(known)} sicher` : ""}${unseen ? ` · ${num(unseen)} noch neu` : ""}`, dd.due ? `<span class="acc-t">${num(dd.due)}</span><small>fällig</small>` : "", badgeTxt((t || "–").slice(0, 2), L.color));
  }).join("");
  const verbs = cs.filter((c) => c.type === "verb").length;
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
    <section class="sec" aria-labelledby="hTop">
      <div class="sechead"><h2 class="sectitle" id="hTop">Themen</h2><button class="more" data-action="cards" data-arg="">Alle Karten ›</button></div>
      ${topicRows}
    </section>
    <section class="sec" aria-labelledby="hConj">
      <div class="sechead"><h2 class="sectitle" id="hConj">Konjugation</h2></div>
      ${navRow("nav", "verbs", "Verbtabellen", verbs ? `${plural(verbs, "Verb", "Verben")} · aktiv: ${L.active.join(", ") || "keine Zeit"}` : "Noch keine Verben – leg eins an", "", badgeTxt("V", L.color)).replace('data-arg="verbs"', `data-arg="verbs" data-p="${esc(L.code)}"`)}
      ${verbs ? navRow("drill", L.code, "Formen schnell üben", "Zufällige Personen und Zeiten abfragen", "", badgeTxt("⚡", L.color)) : ""}
    </section>
    ${m.hard ? `<section class="sec">${navRow("cards-hard", L.code, `Schwierige Karten (${m.hard})`, "Oft vergessen – gezielt üben oder Eselsbrücke ergänzen", "", badgeTxt("!", "#FF4F45"))}</section>` : ""}
    <section class="sec" aria-labelledby="hMore">
      <div class="sechead"><h2 class="sectitle" id="hMore">Mehr</h2></div>
      ${packs.length ? navRow("nav", "starter", "Starter-Wortschatz", packs.map((p) => p.name).join(", ")).replace('data-arg="starter"', `data-arg="starter" data-p="${esc(L.code)}"`) : ""}
      ${navRow("nav", "import", "Importieren", "Liste einfügen oder CSV aus Quizlet, Anki, Excel").replace('data-arg="import"', `data-arg="import" data-p="${esc(L.code)}"`)}
      ${navRow("lang-settings", L.code, "Spracheinstellungen", `${L.newPerDay} neue pro Tag · ${L.dirs === "both" ? "beide Richtungen" : L.dirs === "f" ? "nur Deutsch → " + L.name : "nur " + L.name + " → Deutsch"}`)}
    </section>`;
}

function viewCards(v) {
  const p = v.p || {}, L = langOf(p.lang);
  if (!L) return `${backBar()}<h1 class="vtitle">Nicht gefunden</h1>`;
  const filt = state.listFilter;
  let list = cardsOf(L.code);
  if (p.topic != null) list = list.filter((c) => (c.topic || "") === p.topic);
  if (p.verbs) list = list.filter((c) => c.type === "verb");
  const counts = { all: list.length, new: 0, learn: 0, known: 0, hard: 0, susp: 0 };
  const stOf = new Map(list.map((c) => { const s = cardState(c); counts[s]++; return [c.id, s]; }));
  const shown = filt === "all" ? list : list.filter((c) => stOf.get(c.id) === filt);
  shown.sort((a, b) => a.created - b.created);
  state.scopeIds = shown.map((c) => c.id);
  const cap = state.sel ? shown : shown.slice(0, state.showAll ? 5000 : 200);
  const title = p.hard ? "Schwierige Karten" : p.topic != null ? (p.topic || "Ohne Thema") : "Alle Karten";
  const dd = dueInfo(L.code, p.topic != null ? p.topic : undefined);
  return `${backBar()}
    <h1 class="vtitle">${esc(title)}</h1>
    <p class="meta">${esc(L.name)} · ${plural(list.length, "Karte", "Karten")}</p>
    <div class="btnrow">${p.topic != null && dd.total ? `<button class="btn primary grow" data-action="learn-topic">▶ Lernen (${num(dd.total)})</button>` : ""}<button class="btn${p.topic != null && dd.total ? "" : " grow"}" data-action="practice-scope">Diese Karten üben</button><button class="btn" data-action="add">+ Karte</button></div>
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
    <h1 class="vtitle">Verben</h1>
    <p class="meta">${esc(L.name)} · ${plural(list.length, "Verb", "Verben")}</p>
    <section class="card"><span class="label">Abgefragte Zeiten</span>
      <div class="chiprow wrap">${L.tenses.map((t) => `<button class="fchip" data-action="tense-toggle" data-arg="${esc(t.n)}" aria-pressed="${L.active.includes(t.n)}">${esc(t.n)}</button>`).join("")}</div>
      <p>Jede aktive Zeit wird pro Verb als eigene Karte wiederholt. Starte mit wenigen Zeiten und schalte weitere dazu, sobald sie sitzen.</p></section>
    <div class="btnrow">${list.length ? `<button class="btn primary grow" data-action="drill" data-arg="${esc(L.code)}">⚡ Formen schnell üben</button>` : ""}<button class="btn" data-action="add-verb">+ Verb</button></div>
    <section class="sec">${list.map((c) => { const n = L.tenses.filter((t) => c.tables && c.tables[t.n] && c.tables[t.n].some(Boolean)).length; return navRow("verb", c.id, c.tg, `${c.de}${c.tables ? ` · ${n} ${n === 1 ? "Zeit" : "Zeiten"}` : ""}`, cardState(c) === "hard" ? '<span class="tag bad">Schwierig</span>' : "", badgeTxt(c.tg.slice(0, 2), L.color)); }).join("") || `<p class="hint" style="padding:12px 0">Noch keine Verben.</p>`}</section>`;
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
    ${c.note ? `<section class="card"><p>${esc(c.note)}</p></section>` : ""}
    <div class="btnrow"><button class="btn grow" data-action="card" data-arg="${esc(c.id)}">Bearbeiten</button>${canSpeak() ? `<button class="btn" data-action="speak" data-arg="${esc(c.tg)}">${ICON_SPEAK} Anhören</button>` : ""}</div>
    ${verbTablesHTML(c, L, false)}`;
}

function searchList() {
  const toks = bareAns(normAns(state.q.text)).split(/\s+/).filter(Boolean);
  return state.cards.filter((c) => {
    if (state.q.lang !== "all" && c.lang !== state.q.lang) return false;
    if (!toks.length) return false;
    const hay = bareAns(normAns([c.tg, c.de, c.ex, c.exDe, c.note, c.topic, c.tables ? Object.values(c.tables).flat().join(" ") : ""].join(" ")));
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
      <div class="legend" style="margin-top:10px"><span><i style="background:var(--pos)"></i>Sicher (Abstand ≥ 3 Wochen)</span><span><i style="background:#3FA9FF"></i>Im Lernen</span><span><i style="background:var(--neg)"></i>Schwierig</span></div></section>`;
}

function viewStarter(v) {
  const L = langOf(v.p), packs = (L && STARTER[L.code]) || [];
  return `${backBar()}
    <h1 class="vtitle">Starter-Wortschatz</h1>
    <p class="meta">${esc(L ? L.name : "")}</p>
    ${packs.map((p) => {
      const have = state.cards.filter((c) => c.pack === p.id).length, total = packCards(L.code, p).length;
      return `<section class="card"><div class="split"><h2>${esc(p.name)}</h2><span class="hint">${num(total)} Karten</span></div><p>${esc(p.desc)}</p>
        <div class="btnrow">${have ? `<span class="hint" style="align-self:center;flex:1">✓ ${num(have)} geladen</span><button class="btn danger${state.armed === "pack:" + p.id ? " armed" : ""}" data-action="pack-remove" data-arg="${esc(p.id)}">${state.armed === "pack:" + p.id ? `${num(have)} Karten löschen?` : "Entfernen"}</button>` : `<button class="btn primary grow" data-action="pack-load" data-arg="${esc(p.id)}">Laden</button>`}</div></section>`;
    }).join("") || `<p class="hint">Für diese Sprache gibt es noch keinen Starter. Importiere eine Liste oder leg Karten an.</p>`}
    <p class="hint">Neue Karten kommen nach und nach – so viele pro Tag, wie du in den Spracheinstellungen festlegst.</p>`;
}

/* ---------- Import ---------- */
const IMP_FIELDS = [["tg", "Fremdsprache *"], ["de", "Deutsch *"], ["ex", "Beispielsatz"], ["topic", "Thema"], ["note", "Notiz"]];
function impRecords(imp) {
  const m = imp.map, rows = imp.header ? imp.rows.slice(1) : imp.rows, have = new Set(state.cards.map(cardSig));
  const out = [];
  for (const r of rows) {
    const g = (k) => (m[k] >= 0 ? (r[m[k]] || "").trim() : "");
    const tg = g("tg"), de = g("de");
    if (!tg || !de) { out.push({ skip: "empty" }); continue; }
    const isCloze = /\{\{.+?\}\}/.test(tg);
    const c = normCard({ lang: imp.lang, type: isCloze ? "cloze" : "word", tg, de, ex: g("ex"), note: g("note"), topic: g("topic") || imp.topic || "Import", created: 0 });
    if (!c) { out.push({ skip: "empty" }); continue; }
    if (have.has(cardSig(c))) { out.push({ skip: "dup", c }); continue; }
    have.add(cardSig(c)); out.push({ c });
  }
  return out;
}
function viewImport(v) {
  const imp = state.imp && state.imp.lang === v.p ? state.imp : (state.imp = { lang: v.p, text: "", rows: null, topic: "" });
  const L = langOf(imp.lang);
  let body = "";
  if (imp.rows && imp.rows.length) {
    const cols = Math.max(...imp.rows.slice(0, 50).map((r) => r.length));
    const colName = (i) => (imp.header ? imp.rows[0][i] : "") || `Spalte ${i + 1}`;
    const opts = (sel) => `<option value="-1"${sel < 0 ? " selected" : ""}>—</option>` + Array.from({ length: cols }, (_, i) => `<option value="${i}"${sel === i ? " selected" : ""}>${esc(colName(i))}</option>`).join("");
    const recs = impRecords(imp), ok = recs.filter((r) => r.c && !r.skip), dup = recs.filter((r) => r.skip === "dup").length, empty = recs.filter((r) => r.skip === "empty").length;
    body = `<section class="card"><h2>Spalten</h2>
      <p>${num(imp.rows.length - (imp.header ? 1 : 0))} Zeilen erkannt. Wähle, welche Spalte was ist.</p>
      <div class="mapgrid">${IMP_FIELDS.map(([k, l]) => `<div class="field"><label class="label" for="map-${k}">${esc(l)}</label><select class="psel" id="map-${k}" data-action="impmap" data-field="${k}">${opts(imp.map[k])}</select></div>`).join("")}</div>
      <div class="btnrow"><button class="btn" data-action="imp-swap">⇄ Sprachen tauschen</button></div>
      <label class="check"><input type="checkbox" data-action="imp-header"${imp.header ? " checked" : ""}><span>Erste Zeile ist eine Überschrift</span></label>
      <div class="field"><label class="label" for="impTopic">Thema für Zeilen ohne Thema</label><input id="impTopic" class="psel" style="background-image:none" value="${esc(imp.topic)}" placeholder="Import" maxlength="40"></div></section>
      <section class="card"><h2>Vorschau</h2>
      ${ok.length ? `<div class="tablewrap"><table><thead><tr><th>${esc(L.name)}</th><th>Deutsch</th></tr></thead><tbody>${ok.slice(0, 8).map((r) => `<tr><td>${esc(r.c.type === "cloze" ? parseCloze(r.c.tg).text : r.c.tg)}</td><td>${esc(r.c.de)}</td></tr>`).join("")}</tbody></table></div>` : `<p>Nichts Neues zu importieren.</p>`}
      <div class="sumlist"><div><span>Neue Karten</span><b>${num(ok.length)}</b></div>${dup ? `<div><span class="hint">Schon vorhanden (übersprungen)</span><b class="hint">${num(dup)}</b></div>` : ""}${empty ? `<div><span class="hint">Leer oder unvollständig (übersprungen)</span><b class="hint">${num(empty)}</b></div>` : ""}</div>
      <div class="btnrow"><button class="btn primary grow" data-action="imp-run"${ok.length ? "" : " disabled"}>${num(ok.length)} Karten importieren</button></div></section>`;
  }
  return `${backBar()}
    <h1 class="vtitle">Importieren</h1>
    <p class="meta">${esc(L ? L.name : "")}</p>
    <section class="card"><h2>Liste einfügen</h2>
      <p>Eine Karte pro Zeile: Wort und Übersetzung getrennt durch Tab, Semikolon, Komma oder „ - “. Quizlet-Export (Tab), Anki-Textexport und Excel/Numbers-Tabellen funktionieren direkt. Lückensätze mit {{Lücke}} werden erkannt.</p>
      <textarea class="paste" id="impText" placeholder="la casa;das Haus&#10;il cane;der Hund&#10;Vado {{a}} Roma.;Ich fahre nach Rom.">${esc(imp.text)}</textarea>
      <div class="btnrow"><button class="btn primary" data-action="imp-parse">Erkennen</button><label class="btn filebtn">Datei wählen<input type="file" id="impFile" accept=".csv,.tsv,.txt,text/csv,text/plain"></label></div>
      ${imp.error ? `<p class="neg">${esc(imp.error)}</p>` : ""}</section>
    ${body}`;
}

/* ---------- Settings ---------- */
const BACKUP_KEY = KEYS.backup;
function lastBackupDays() { try { const v = localStorage.getItem(BACKUP_KEY); return v ? Math.floor((Date.now() - Date.parse(v)) / 864e5) : null; } catch { return null; } }
function lastBackupText() { const d = lastBackupDays(); return d == null ? "noch nie" : d === 0 ? "heute" : d === 1 ? "gestern" : `vor ${d} Tagen`; }
function openMode() { try { const v = localStorage.getItem(KEYS.open); return ["splash", "menu", "learn"].includes(v) ? v : "splash"; } catch { return "splash"; } }
function storageKB() { let n = 0; try { for (const k of Object.values(KEYS)) n += (localStorage.getItem(k) || "").length; } catch { /* ignore */ } return Math.round(n / 1024); }
function viewSettings() {
  const S = state.settings, sel = (id, cur, opts) => `<select class="psel" id="${id}" data-action="setting">${opts.map(([v, t]) => `<option value="${v}"${String(cur) === String(v) ? " selected" : ""}>${esc(t)}</option>`).join("")}</select>`;
  const badgeOk = !!navigator.setAppBadge;
  return `${backBar()}
    <h1 class="vtitle">Einstellungen</h1>
    <section class="card"><h2>Lernen</h2>
      <div class="field"><span class="label">Antwortmodus</span>${modePills()}</div>
      <p><b>Umdrehen</b>: selbst einschätzen. <b>Tippen</b>: Antwort schreiben, PLM prüft – auch Akzente, Artikel und Tippfehler. <b>Auswahl</b>: eine von vier Antworten.</p>
      <div class="mapgrid">
        <label class="field"><span class="label">Ziel: so viel behalten</span>${sel("setRet", S.ret, [[0.8, "80 % – weniger Wiederholungen"], [0.85, "85 %"], [0.9, "90 % – empfohlen"], [0.95, "95 % – mehr Wiederholungen"]])}</label>
        <label class="field"><span class="label">Wiederholungen pro Tag max.</span>${sel("setMax", S.maxReviews, [[50, "50"], [100, "100"], [200, "200"], [500, "500"], [9999, "unbegrenzt"]])}</label>
        <label class="field"><span class="label">Neuer Lerntag beginnt um</span>${sel("setRoll", S.roll, [0, 1, 2, 3, 4, 5, 6].map((h) => [h, `${h}:00 Uhr`]))}</label>
      </div>
      <label class="check"><input type="checkbox" id="setIntro" data-action="setting"${S.intro ? " checked" : ""}><span>Neue Karten zuerst zeigen, dann abfragen<br><span class="hint">Sonst wird ein neues Wort gleich abgefragt.</span></span></label>
      <label class="check"><input type="checkbox" id="setSpeak" data-action="setting"${S.autoSpeak ? " checked" : ""}><span>Fremdsprache automatisch vorlesen${canSpeak() ? "" : '<br><span class="hint">Wird von diesem Browser nicht unterstützt.</span>'}</span></label>
      <p>PLM plant jede Karte mit FSRS – dem Verfahren, das auch Anki nutzt: Was du gut kannst, kommt seltener, was du vergisst, früher wieder.</p></section>
    <section class="card"><h2>Erinnerung</h2>
      <p>iPhone-Web-Apps können sich nicht selbst zu einer Uhrzeit melden. Am zuverlässigsten ist ein täglicher Kalender-Termin mit Hinweis – PLM erstellt ihn für dich.</p>
      <div class="two"><label class="field"><span class="label">Täglich um</span><input type="time" id="setRemind" class="psel" style="background-image:none;padding-right:15px" value="${esc(S.remind)}"></label><div style="display:flex;align-items:end"><button class="btn primary" style="width:100%" data-action="ics">Zum Kalender</button></div></div>
      ${badgeOk ? `<label class="check"><input type="checkbox" id="setBadge" data-action="setting"${S.badge ? " checked" : ""}><span>Fällige Karten als Zahl am App-Symbol<br><span class="hint">Fragt einmal nach der Mitteilungs-Erlaubnis. Die Zahl aktualisiert sich, wenn du PLM öffnest oder schließt.</span></span></label>` : ""}</section>
    <section class="card"><h2>Sprachen</h2>
      ${langs().map((L) => navRow("lang-settings", L.code, L.name, `${L.newPerDay} neue pro Tag · ${plural(cardsOf(L.code).length, "Karte", "Karten")}`, "", badgeTxt(L.name.slice(0, 2), L.color))).join("")}
      <div class="btnrow"><button class="btn" data-action="add-lang">+ Sprache hinzufügen</button></div></section>
    <section class="card"><h2>Daten &amp; Backup</h2>
      <p>Alles liegt nur auf diesem Gerät, in PLM. Nichts wird verschickt, es läuft auch offline. Wenn du PLM vom Home-Bildschirm löschst, sind die Daten weg – sichere also regelmäßig ein Backup, z. B. in iCloud Drive.</p>
      <p>Letztes Backup: ${esc(lastBackupText())} · ${plural(state.cards.length, "Karte", "Karten")} · ${num(storageKB())} KB</p>
      <div class="btnrow"><button class="btn primary" data-action="export-json">Backup sichern</button><label class="btn filebtn">Backup laden<input type="file" id="backupFile" accept=".json,application/json"></label><button class="btn" data-action="export-csv">CSV exportieren</button></div></section>
    <section class="card"><label class="field"><span class="label">Wenn PLM öffnet</span>${sel("setOpen", openMode(), [["splash", "Startbildschirm, dann Menü"], ["menu", "Menü"], ["learn", "Direkt lernen"]])}</label></section>
    <section class="card"><h2>Zurücksetzen</h2><p>Löscht alle Karten, Fortschritte und Statistiken auf diesem Gerät.</p>
      <div class="btnrow"><button class="btn danger${state.armed === "wipe" ? " armed" : ""}" data-action="wipe">${state.armed === "wipe" ? "Wirklich alles löschen?" : "Alles löschen"}</button></div></section>
    <p class="hint">PLM ${esc(window.PLM_VERSION || "")} · Personal Language Management</p>
    <footer class="motto"><span>Sometimes I feel like giving up.</span><span>Then I remember I have a lot of people to prove wrong.</span></footer>`;
}

const VIEWS = { hub: viewHub, lang: viewLang, cards: viewCards, verbs: viewVerbs, verb: viewVerb, search: viewSearch, stats: viewStats, starter: viewStarter, import: viewImport, settings: viewSettings };

function render() {
  dueCache.clear();
  const top = state.stack[state.stack.length - 1], root = $("view");
  const focusId = document.activeElement && document.activeElement.id;
  charts = [];
  root.innerHTML = VIEWS[top.v](top);
  root.classList.toggle("hub", top.v === "hub");
  document.body.classList.toggle("hubmode", top.v === "hub");
  root.classList.remove("enter");
  if (state.enter) { void root.offsetWidth; root.classList.add("enter"); state.enter = false; }
  if (focusId && root.contains($(focusId))) $(focusId).focus({ preventScroll: true });
  charts.forEach((c) => drawChart($(c.id), c));
  $("addBtn").hidden = !["lang", "cards", "verbs"].includes(top.v) || !!state.sel;
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
