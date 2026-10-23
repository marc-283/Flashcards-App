/* ================= Import: photo, PDF, list ================= */
const OCR_LANG = { it: "ita", en: "eng", de: "deu", es: "spa", fr: "fra", pt: "por", nl: "nld", sv: "swe" };
const OCR_LOCAL = new Set(["ita", "eng", "deu"]);
const absUrl = (p) => new URL(p, location.href).href;
const fmtSecs = (s) => (s < 60 ? `${s} s` : `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")} min`);

/* ---------- Loaders (only fetched when needed) ---------- */
let tessP = null, pdfjsP = null;
function loadScript(src) { return new Promise((res, rej) => { const s = document.createElement("script"); s.src = src; s.onload = res; s.onerror = () => rej(new Error(T("Texterkennung konnte nicht geladen werden – einmal mit Internet öffnen"))); document.head.appendChild(s); }); }
function loadTesseract() { if (!tessP) tessP = loadScript("ocr/tesseract.min.js").then(() => window.Tesseract).catch((e) => { tessP = null; throw e; }); return tessP; }
function loadPdfjs() {
  if (!pdfjsP) pdfjsP = import(absUrl("lib/pdfjs/pdf.min.mjs")).then((m) => { m.GlobalWorkerOptions.workerSrc = absUrl("lib/pdfjs/pdf.worker.min.mjs"); return m; }).catch((e) => { pdfjsP = null; throw new Error(T("PDF-Leser konnte nicht geladen werden – einmal mit Internet öffnen")); });
  return pdfjsP;
}
async function ocrWorker(code, onProg) {
  const T = await loadTesseract();
  const langs = [...new Set([OCR_LANG[code] || "eng", "deu", "eng"])];
  const local = langs.every((l) => OCR_LOCAL.has(l));
  return T.createWorker(langs, 1, { workerPath: absUrl("ocr/worker.min.js"), corePath: absUrl("ocr/core"), ...(local ? { langPath: absUrl("ocr/lang") } : {}), logger: (m) => onProg && onProg(m) });
}
const linesOf = (data) => (data.blocks || []).flatMap((b) => b.paragraphs.flatMap((p) => p.lines)).map((l) => ({ words: l.words.map((w) => ({ text: w.text, x0: w.bbox.x0, x1: w.bbox.x1, y0: w.bbox.y0, y1: w.bbox.y1, conf: w.confidence })) }));
async function ocrCanvas(worker, canvas) {
  let r = await worker.recognize(canvas, {}, { blocks: true });
  let lines = linesOf(r.data);
  if (lines.reduce((a, l) => a + l.words.length, 0) < 6) {
    await worker.setParameters({ tessedit_pageseg_mode: "11" });
    r = await worker.recognize(canvas, {}, { blocks: true });
    await worker.setParameters({ tessedit_pageseg_mode: "3" });
    const sparse = linesOf(r.data);
    if (sparse.reduce((a, l) => a + l.words.length, 0) > lines.reduce((a, l) => a + l.words.length, 0)) lines = sparse;
  }
  return lines;
}

/* ---------- Images ---------- */
function loadImage(file) {
  return new Promise((res, rej) => {
    const url = URL.createObjectURL(file), img = new Image();
    img.onload = () => { URL.revokeObjectURL(url); res(img); };
    img.onerror = () => { URL.revokeObjectURL(url); rej(new Error(T("„{0}“ ist kein lesbares Bild (HEIC bitte als JPEG teilen)", [file.name]))); };
    img.src = url;
  });
}
/* up: small pictures (screenshots, chat images) are enlarged for the text recognition – it reads small print much better at about 2000 px */
async function imageCanvas(file, maxSide, up) {
  const img = await loadImage(file), long = Math.max(img.naturalWidth, img.naturalHeight);
  const k = Math.min(maxSide / long, up ? Math.max(1, Math.min(2, up / long)) : 1);
  const c = document.createElement("canvas");
  c.width = Math.round(img.naturalWidth * k); c.height = Math.round(img.naturalHeight * k);
  const g = c.getContext("2d"); g.fillStyle = "#fff"; g.fillRect(0, 0, c.width, c.height); g.imageSmoothingQuality = "high"; g.drawImage(img, 0, 0, c.width, c.height);
  return c;
}
const canvasB64 = (c) => c.toDataURL("image/jpeg", 0.85).split(",")[1];
const fileB64 = (file) => new Promise((res, rej) => { const r = new FileReader(); r.onload = () => res(String(r.result).split(",")[1]); r.onerror = () => rej(new Error(T("Datei konnte nicht gelesen werden"))); r.readAsDataURL(file); });

/* ---------- PDF text with positions ---------- */
function pdfTextLines(tc, vp) {
  const words = [];
  for (const it of tc.items) {
    const str = it.str || ""; if (!str.trim()) continue;
    const t = it.transform, x = t[4], h = Math.hypot(t[2], t[3]) || it.height || 10, yTop = vp.height - t[5] - h;
    const cw = (it.width || str.length * h * 0.5) / Math.max(1, str.length);
    let k = 0;
    for (const part of str.split(/(\s+)/)) { if (part.trim()) words.push({ text: part, x0: x + k * cw, x1: x + (k + part.length) * cw, y0: yTop, y1: yTop + h }); k += part.length; }
  }
  words.sort((a, b) => a.y0 - b.y0 || a.x0 - b.x0);
  const lines = [];
  for (const w of words) {
    const h = w.y1 - w.y0, line = lines.find((l) => Math.abs(l.y - w.y0) < h * 0.5);
    if (line) line.words.push(w); else lines.push({ y: w.y0, words: [w] });
  }
  for (const l of lines) l.words.sort((a, b) => a.x0 - b.x0);
  return lines.sort((a, b) => a.y - b.y).map((l) => ({ words: l.words }));
}

/* ---------- Run an import ---------- */
function impProgress(patch) { Object.assign(state.imp2, patch); const top = state.stack[state.stack.length - 1]; if (top.v === "import") { const el = $("impProg"); if (el) el.outerHTML = progHTML(); else render(); } }
function progHTML() {
  const I = state.imp2;
  if (!I || I.status !== "work") return `<div id="impProg"></div>`;
  return `<section class="card" id="impProg"><div class="split"><h2>${I.ai ? T("KI liest dein Material") : T("Texterkennung läuft")}</h2><span class="hint">${esc(fmtSecs(I.secs || 0))}</span></div>
    <div class="st-prog"><span style="width:${I.progress != null ? Math.round(I.progress * 100) : 8}%"${I.progress == null ? ' class="indet"' : ""}></span></div>
    <p>${esc(I.msg || "")}</p><p class="hint">${T("Lass PLM geöffnet, bis es fertig ist{0}.", [I.ai ? ` ${T("– bei großen PDFs einige Minuten")}` : ""])}</p></section>`;
}
let impTick = 0;
async function runImport(kind, files, code, useAi) {
  const L = langOf(code);
  if (!files || !files.length || !L) return;
  if (state.imp2 && state.imp2.status === "work") { toast(T("Es läuft schon ein Import")); return; }
  const name = files.length > 1 ? T("{0} Fotos", [files.length]) : files[0].name;
  state.imp2 = { lang: code, kind, name, status: "work", ai: useAi, msg: T("Vorbereiten …"), progress: null, secs: 0, t0: Date.now() };
  clearInterval(impTick); impTick = setInterval(() => { if (!state.imp2 || state.imp2.status !== "work") { clearInterval(impTick); return; } impProgress({ secs: Math.round((Date.now() - state.imp2.t0) / 1000) }); }, 1000);
  render();
  try {
    let items = [], project = "", ml = "";
    if (useAi) {
      const blocks = [];
      if (kind === "pdf") {
        const f = files[0];
        if (f.size > 30e6) throw new Error(T("Das PDF ist größer als 30 MB – bitte aufteilen."));
        impProgress({ msg: T("PDF wird hochgeladen …") });
        blocks.push({ type: "document", source: { type: "base64", media_type: "application/pdf", data: await fileB64(f) } });
      } else {
        for (const [i, f] of files.slice(0, 12).entries()) { impProgress({ msg: T("Foto {0} von {1} vorbereiten …", [i + 1, Math.min(files.length, 12)]) }); blocks.push({ type: "image", source: { type: "base64", media_type: "image/jpeg", data: canvasB64(await imageCanvas(f, 1568)) } }); }
      }
      impProgress({ msg: T("Die KI erkennt Wörter, Sätze, Verben und Grammatik und ordnet sie in Themen …") });
      let lastN = 0;
      const r = await aiExtract(L, blocks, "", (n) => { if (n - lastN < 400) return; lastN = n; impProgress({ msg: T("Die KI schreibt deine Karten … ({0}k Zeichen)", [num(Math.round(n / 1000))]) }); });
      items = aiToItems(L, r.json); project = r.json.project || "";
      state.imp2.usage = r.usage;
    } else if (kind === "photo") {
      impProgress({ msg: T("Texterkennung wird geladen …") });
      const w = await ocrWorker(code, (m) => { if (m.status === "recognizing text") impProgress({ progress: ((state.imp2.page || 0) + m.progress) / files.length }); });
      for (const [i, f] of files.entries()) {
        state.imp2.page = i; impProgress({ msg: T("Foto {0} von {1} wird gelesen …", [i + 1, files.length]) });
        const c = await imageCanvas(f, 2400, 2000), lines = await ocrCanvas(w, c);
        const res = parseLayout(lines, { target: code, width: c.width });
        if (res.ml) ml = res.ml;
        items = items.concat(res.items.map((x) => ({ ...x, topic: x.topic || (files.length > 1 ? T("Foto {0}", [i + 1]) : "") })));
      }
      await w.terminate();
    } else {
      impProgress({ msg: T("PDF wird geöffnet …") });
      const pdfjs = await loadPdfjs();
      const doc = await pdfjs.getDocument({ data: new Uint8Array(await files[0].arrayBuffer()) }).promise;
      const n = Math.min(doc.numPages, 80);
      let w = null;
      for (let p = 1; p <= n; p++) {
        impProgress({ msg: T("Seite {0} von {1} …", [p, n]), progress: (p - 1) / n });
        const page = await doc.getPage(p), vp = page.getViewport({ scale: 1 });
        let lines = pdfTextLines(await page.getTextContent(), vp), width = vp.width, pdf = true;
        if (lines.reduce((a, l) => a + l.words.reduce((b, x) => b + x.text.length, 0), 0) < 12) {
          if (!w) { impProgress({ msg: T("Seite {0}: gescannt – Texterkennung wird geladen …", [p]) }); w = await ocrWorker(code); }
          impProgress({ msg: T("Seite {0} von {1} wird gelesen (Scan) …", [p, n]) });
          const scale = Math.min(3, 2200 / Math.max(vp.width, vp.height)), v2 = page.getViewport({ scale }), c = document.createElement("canvas");
          c.width = Math.round(v2.width); c.height = Math.round(v2.height);
          const g = c.getContext("2d"); g.fillStyle = "#fff"; g.fillRect(0, 0, c.width, c.height);
          await page.render({ canvasContext: g, viewport: v2 }).promise;
          lines = await ocrCanvas(w, c); width = c.width; pdf = false;
        }
        const res = parseLayout(lines, { target: code, width, pdf });
        if (res.ml) ml = res.ml;
        items = items.concat(res.items.map((x) => ({ ...x, topic: x.topic || (n > 1 ? T("Seite {0}", [p]) : "") })));
      }
      if (w) await w.terminate();
    }
    finishImport(code, items, project, ml, name, useAi);
  } catch (e) {
    state.imp2 = { lang: code, status: "error", msg: (e && e.message) || T("Das hat nicht geklappt.") };
    render(); toast(state.imp2.msg);
  } finally { clearInterval(impTick); }
}
function finishImport(code, raw, project, ml, name, ai) {
  const have = new Map(state.cards.filter((c) => c.lang === code).map((c) => [sameKey(c), c]));
  const seen = new Set();
  const items = [];
  raw.forEach((x, i) => {
    const it = { key: "i" + i, type: x.type || (/\{\{.+?\}\}/.test(x.tg) ? "cloze" : "word"), tg: String(x.tg || "").trim(), de: String(x.de || "").trim(), pos: x.pos || "", ex: x.ex || "", exDe: x.exDe || "", note: x.note || "", topic: (x.topic || "").slice(0, 40), tables: x.tables, aux: x.aux, ml: x.ml && x.ml !== "de" && x.de ? x.ml : "" };
    if (!it.tg) return;
    if (!it.pos && it.type === "word" && looksSentence(it.tg)) it.pos = "s";
    const k = sameKey({ lang: code, type: it.type, tg: it.tg });
    if (seen.has(k)) return; seen.add(k);
    const dup = have.get(k);
    it.dup = dup ? dup.deck : "";
    it.sel = !dup && !x.doubt && (!!it.de || it.type === "cloze");
    items.push(it);
  });
  const deckDefault = project || (decksOf(code).some((d) => d.name === "Kurs A1") && /lezion|unit|kurs|corso|lektion/i.test(name) ? "Kurs A1" : T("Import {0}", [dayMonFmt.format(new Date())]));
  state.imp2 = { lang: code, status: "done", items, deck: deckDefault, name, ai, ml };
  const top = state.stack[state.stack.length - 1];
  if (!items.length) { state.imp2.status = "error"; state.imp2.msg = ai ? T("Die KI hat in diesem Material nichts zum Lernen gefunden.") : T("Keine Wörter erkannt. Tipp: gerade von oben fotografieren, gutes Licht – oder den KI-Assistenten nutzen."); render(); toast(state.imp2.msg); return; }
  if (top.v === "import") go("review", code); else toast(T("{0} erkannt – unter Importieren prüfen", [plural(items.length, T("Eintrag"), T("Einträge"))]));
}

/* ---------- Views ---------- */
function viewImport(v) {
  const code = v.p, L = langOf(code), I = state.imp2 && state.imp2.lang === code ? state.imp2 : null;
  if (!L) return `${backBar()}<h1 class="vtitle">${T("Nicht gefunden")}</h1>`;
  const ai = aiOn(), useAi = ai && lsGet("plm.useAi") !== "0";
  return `${backBar()}
    <h1 class="vtitle">${T("Importieren")}</h1>
    <p class="meta">${T("{0} · aus Fotos, Kurs-PDFs oder Listen werden Karten", [esc(lname(L))])}</p>
    ${I && I.status === "work" ? progHTML() : ""}
    ${I && I.status === "error" ? `<section class="card"><p class="neg">${esc(I.msg)}</p></section>` : ""}
    ${I && I.status === "done" ? `<button class="notice" data-action="nav" data-arg="review" data-p="${esc(code)}">${T("{0} warten auf Prüfung ›", [plural(I.items.length, T("erkannter Eintrag"), T("erkannte Einträge"))])}</button>` : ""}
    <section class="card"><h2>${T("Foto oder PDF")}</h2>
      <p>${T("Fotografiere eine Vokabelliste, ein Glossar oder eine Buchseite – oder lade ein PDF aus deinem Kurs. Du prüfst alles, bevor es Karten werden.")}</p>
      ${ai ? `<div class="seg" role="group" aria-label="${T("Auswertung")}"><button type="button" data-action="imp-ai" data-arg="1" aria-pressed="${useAi}">${T("Mit KI")}</button><button type="button" data-action="imp-ai" data-arg="0" aria-pressed="${!useAi}">${T("Auf dem Gerät")}</button></div>
        <p class="hint">${useAi ? T("Die KI ordnet in Themen, übersetzt ins Deutsche, ergänzt Beispielsätze und baut Lückensätze und Verbtabellen.") : T("Kostenlos und offline: erkennt Listen und zweispaltige Tabellen. Übersetzungen nur, wenn sie im Material stehen.")}</p>`
        : `<p class="hint">${T("Auf dem Gerät erkennt PLM Listen und zweispaltige Tabellen. Für Buchseiten mit Übungen, deutsche Übersetzungen und automatische Themen:")} <button class="more" data-action="nav" data-arg="settings">${T("KI-Assistent einrichten ›")}</button></p>`}
      <div class="btnrow"><label class="btn primary filebtn grow">${T("📷 Foto aufnehmen / wählen")}<input type="file" id="impPhoto" accept="image/*" multiple></label><label class="btn filebtn grow">${T("PDF wählen")}<input type="file" id="impPdf" accept="application/pdf,.pdf"></label></div></section>
    ${listImportHTML(code)}`;
}
function itemRow(it) {
  return `<button class="row nochev imp-row" data-action="imp-item" data-arg="${esc(it.key)}" aria-pressed="${it.sel}">
    <span class="checkc${it.sel ? " on" : ""}" aria-hidden="true">${it.sel ? "✓" : ""}</span>
    <span class="main"><span class="t1">${esc(it.type === "cloze" ? parseCloze(it.tg).text : it.tg)}${it.type === "verb" ? `<span class="tag">${T("Verb")}</span>` : it.type === "cloze" ? `<span class="tag">${T("Lücke")}</span>` : it.pos === "s" ? `<span class="tag">${T("Satz")}</span>` : ""}${it.dup ? `<span class="tag">${T("schon in {0}", [esc(dn(it.dup))])}</span>` : ""}</span>
      <span class="t2">${it.de ? esc(it.de) + (it.ml ? ` <i>(${esc(MEANING_LANGS[it.ml] || it.ml)})</i>` : "") : `<span class="neg">${T("Übersetzung fehlt")}</span>`}${it.ex ? " · " + esc(it.ex) : ""}</span></span>
    <span class="val"><small class="more" data-action="imp-edit" data-arg="${esc(it.key)}">${T("Ändern")}</small></span></button>`;
}
function viewReview(v) {
  const code = v.p, L = langOf(code), I = state.imp2;
  if (!L || !I || I.lang !== code || I.status !== "done") return `${backBar()}<h1 class="vtitle">${T("Nichts zu prüfen")}</h1><p class="hint">${T("Starte unter Importieren ein Foto oder PDF.")}</p>`;
  const sel = I.items.filter((x) => x.sel), noDe = I.items.filter((x) => !x.de && x.type !== "cloze"), en = I.items.filter((x) => x.ml);
  const topics = [...new Set(I.items.map((x) => x.topic || ""))];
  const decks = decksOf(code).map((d) => d.name);
  return `${backBar()}
    <h1 class="vtitle">${T("Prüfen")}</h1>
    <p class="meta">${esc(lname(L))} · ${esc(I.name || "")} · ${plural(I.items.length, T("Eintrag"), T("Einträge"))}${I.usage ? ` ${T("· KI: {0} Tokens", [num((I.usage.input_tokens || 0) + (I.usage.output_tokens || 0))])}` : ""}</p>
    <section class="card">
      <div class="field"><label class="label" for="impDeck">${T("In Projekt")}</label><input id="impDeck" class="psel" style="background-image:none" list="impDecks" value="${esc(I.deck)}" maxlength="40"><datalist id="impDecks">${decks.map((d) => `<option value="${esc(d)}">`).join("")}</datalist></div>
      ${noDe.length || en.length ? `<p>${noDe.length ? `${T("<b>{0} ohne Übersetzung</b> – {1}.", [plural(noDe.length, T("Eintrag"), T("Einträge")), aiOn() ? T("die KI kann sie ergänzen") : T("tippe auf „Ändern“, um sie einzutragen, oder richte den KI-Assistenten ein")])} ` : ""}${en.length ? T("{0} auf Englisch.", [plural(en.length, T("Übersetzung ist"), T("Übersetzungen sind"))]) : ""}</p>` : ""}
      ${aiOn() ? `<div class="btnrow"><button class="btn${noDe.length || en.length ? " primary" : ""}" data-action="imp-aifill"${I.filling ? " disabled" : ""}>${I.filling ? T("KI ergänzt …") : T("Mit KI ergänzen{0}", [noDe.length || en.length ? "" : ` ${T("(Beispielsätze)")}`])}</button></div>` : ""}
      <div class="btnrow"><button class="btn" data-action="imp-all">${T("Alle")}</button><button class="btn" data-action="imp-none">${T("Keine")}</button><button class="btn" data-action="imp-swap2">${T("⇄ Seiten tauschen")}</button></div>
    </section>
    ${topics.map((t) => { const list = I.items.filter((x) => (x.topic || "") === t); return `<section class="sec"><div class="sechead"><h2 class="sectitle">${esc(t || T("Ohne Thema"))}</h2><button class="more" data-action="imp-topic" data-arg="${esc(t)}">${list.every((x) => x.sel) ? T("Keine") : T("Alle")}</button></div>${list.map(itemRow).join("")}</section>`; }).join("")}
    <div class="btnrow sticky-act"><button class="btn primary grow" data-action="imp-commit"${sel.length ? "" : " disabled"}>${T("{0} übernehmen", [plural(sel.length, T("Karte"), T("Karten"))])}</button></div>`;
}
function editImpItem(key) {
  const I = state.imp2, it = I && I.items.find((x) => x.key === key); if (!it) return;
  const L = langOf(I.lang);
  openForm({ title: T("Eintrag bearbeiten"), fields: [
    { k: "tg", label: lname(L), max: 300 }, { k: "de", label: it.ml ? T("Bedeutung ({0})", [MEANING_LANGS[it.ml]]) : T("Deutsch"), max: 300 },
    { k: "type", label: T("Art"), type: "select", opts: [["word", T("Vokabel")], ["s", T("Satz")], ["cloze", T("Lückensatz")], ["verb", T("Verb")]], half: true }, { k: "topic", label: T("Thema"), max: 40, half: true },
    { k: "ex", label: T("Beispielsatz"), max: 300 }, { k: "exDe", label: T("Übersetzung des Beispiels"), max: 300 }, { k: "note", label: T("Notiz"), max: 300 },
    { k: "en", label: T("Die Bedeutung ist Englisch"), type: "check" }],
    values: { ...it, type: it.type === "word" && it.pos === "s" ? "s" : it.type, en: it.ml === "en" },
    validate: (v) => (!v.tg ? T("Der Eintrag braucht einen Text.") : v.type === "cloze" && !parseCloze(v.tg).gaps.length ? T("Lücke mit {{…}} markieren.") : ""),
    onSave: (v) => { Object.assign(it, { tg: v.tg, de: v.de, topic: v.topic, ex: v.ex, exDe: v.exDe, note: v.note, ml: v.en && v.de ? "en" : "", type: v.type === "s" ? "word" : v.type, pos: v.type === "s" ? "s" : it.pos === "s" ? "" : it.pos, sel: !!(v.de || v.type === "cloze") }); render(); },
    onDelete: () => { I.items = I.items.filter((x) => x !== it); render(); }, deleteLabel: T("Entfernen") });
}
async function impAiFill() {
  const I = state.imp2; if (!I || I.filling) return;
  const L = langOf(I.lang);
  const list = I.items.filter((x) => x.type === "word" && (!x.de || x.ml || (x.sel && !x.ex))).slice(0, 150);
  if (!list.length) { toast(T("Alles schon vollständig")); return; }
  I.filling = true; render();
  try {
    const out = await aiFill(L, list);
    for (const o of out) {
      const it = list[o.i]; if (!it) continue;
      if (o.target) it.tg = o.target; if (o.german) { it.de = o.german; it.ml = ""; }
      if (o.example) { it.ex = o.example; it.exDe = o.example_german; }
      if (o.kind === "sentence") it.pos = "s";
      it.sel = !!it.de && !it.dup;
    }
    toast(T("{0} ergänzt", [plural(out.length, T("Eintrag"), T("Einträge"))]));
  } catch (e) { toast(e.message); }
  I.filling = false; render();
}
function impCommit() {
  const I = state.imp2; if (!I) return;
  const deck = (($("impDeck") && $("impDeck").value) || I.deck || T("Import")).trim().slice(0, 40);
  const now = Math.max(nowTs(), ...state.cards.map((c) => c.created + 1));
  const add = I.items.filter((x) => x.sel).map((x, i) => normCard({ lang: I.lang, type: x.type, tg: x.tg, de: x.de, pos: x.type === "verb" ? "v" : x.pos, ex: x.ex, exDe: x.exDe, note: x.note, topic: x.topic, deck, ml: x.ml, tables: x.tables, aux: x.aux, created: now + i })).filter(Boolean);
  state.cards = state.cards.concat(add); reindex(); save();
  const code = I.lang; state.imp2 = null;
  toast(T("{0} in „{1}“ angelegt", [plural(add.length, T("Karte"), T("Karten")), deck]));
  state.stack = [{ v: "hub" }, { v: "lang", p: code }];
  go("deck", { lang: code, deck });
}

/* ---------- Pasted list / CSV ---------- */
const IMP_FIELDS = [["tg", T("Fremdsprache *")], ["de", T("Deutsch *")], ["ex", T("Beispielsatz")], ["topic", T("Thema")], ["note", T("Notiz")]];
function impRecords(imp) {
  const m = imp.map, rows = imp.header ? imp.rows.slice(1) : imp.rows, have = new Set(state.cards.filter((c) => c.lang === imp.lang).map(sameKey));
  const out = [];
  for (const r of rows) {
    const g = (k) => (m[k] >= 0 ? (r[m[k]] || "").trim() : "");
    const tg = g("tg"), de = g("de");
    if (!tg || !de) { out.push({ skip: "empty" }); continue; }
    const isCloze = /\{\{.+?\}\}/.test(tg);
    const c = normCard({ lang: imp.lang, type: isCloze ? "cloze" : "word", tg, de, ex: g("ex"), note: g("note"), topic: g("topic") || imp.topic || "", deck: imp.deck || T("Import"), pos: !isCloze && wordCount(tg) >= 4 && /[.?!]$/.test(tg) ? "s" : "", created: 0 });
    if (!c) { out.push({ skip: "empty" }); continue; }
    if (have.has(sameKey(c))) { out.push({ skip: "dup", c }); continue; }
    have.add(sameKey(c)); out.push({ c });
  }
  return out;
}
function listImportHTML(code) {
  const imp = state.imp && state.imp.lang === code ? state.imp : (state.imp = { lang: code, text: "", rows: null, topic: "", deck: T("Import {0}", [dayMonFmt.format(new Date())]) });
  const L = langOf(code);
  let body = "";
  if (imp.rows && imp.rows.length) {
    const cols = Math.max(...imp.rows.slice(0, 50).map((r) => r.length));
    const colName = (i) => (imp.header ? imp.rows[0][i] : "") || T("Spalte {0}", [i + 1]);
    const opts = (sel) => `<option value="-1"${sel < 0 ? " selected" : ""}>—</option>` + Array.from({ length: cols }, (_, i) => `<option value="${i}"${sel === i ? " selected" : ""}>${esc(colName(i))}</option>`).join("");
    const recs = impRecords(imp), ok = recs.filter((r) => r.c && !r.skip), dup = recs.filter((r) => r.skip === "dup").length, empty = recs.filter((r) => r.skip === "empty").length;
    body = `<section class="card"><h2>${T("Spalten")}</h2>
      <p>${T("{0} Zeilen erkannt. Wähle, welche Spalte was ist.", [num(imp.rows.length - (imp.header ? 1 : 0))])}</p>
      <div class="mapgrid">${IMP_FIELDS.map(([k, l]) => `<div class="field"><label class="label" for="map-${k}">${esc(l)}</label><select class="psel" id="map-${k}" data-action="impmap" data-field="${k}">${opts(imp.map[k])}</select></div>`).join("")}</div>
      <div class="btnrow"><button class="btn" data-action="imp-swap">${T("⇄ Sprachen tauschen")}</button></div>
      <label class="check"><input type="checkbox" data-action="imp-header"${imp.header ? " checked" : ""}><span>${T("Erste Zeile ist eine Überschrift")}</span></label>
      <div class="two"><div class="field"><label class="label" for="impDeckL">${T("Projekt")}</label><input id="impDeckL" class="psel" style="background-image:none" list="impDecksL" value="${esc(imp.deck)}" maxlength="40"><datalist id="impDecksL">${decksOf(code).map((d) => `<option value="${esc(d.name)}">`).join("")}</datalist></div>
      <div class="field"><label class="label" for="impTopic">${T("Thema")}</label><input id="impTopic" class="psel" style="background-image:none" value="${esc(imp.topic)}" placeholder="${T("optional")}" maxlength="40"></div></div></section>
      <section class="card"><h2>${T("Vorschau")}</h2>
      ${ok.length ? `<div class="tablewrap"><table><thead><tr><th>${esc(lname(L))}</th><th>${T("Deutsch")}</th></tr></thead><tbody>${ok.slice(0, 8).map((r) => `<tr><td>${esc(r.c.type === "cloze" ? parseCloze(r.c.tg).text : r.c.tg)}</td><td>${esc(r.c.de)}</td></tr>`).join("")}</tbody></table></div>` : `<p>${T("Nichts Neues zu importieren.")}</p>`}
      <div class="sumlist"><div><span>${T("Neue Karten")}</span><b>${num(ok.length)}</b></div>${dup ? `<div><span class="hint">${T("Schon vorhanden (übersprungen)")}</span><b class="hint">${num(dup)}</b></div>` : ""}${empty ? `<div><span class="hint">${T("Leer oder unvollständig (übersprungen)")}</span><b class="hint">${num(empty)}</b></div>` : ""}</div>
      <div class="btnrow"><button class="btn primary grow" data-action="imp-run"${ok.length ? "" : " disabled"}>${T("{0} Karten importieren", [num(ok.length)])}</button></div></section>`;
  }
  return `<section class="card"><h2>${T("Liste einfügen")}</h2>
      <p>${T("Eine Karte pro Zeile: Wort und Übersetzung getrennt durch Tab, Semikolon, Komma oder „ - “. Quizlet-Export (Tab), Anki-Textexport und Excel/Numbers-Tabellen funktionieren direkt. Lückensätze mit {{Lücke}} werden erkannt.")}</p>
      <textarea class="paste" id="impText" placeholder="la casa;das Haus&#10;il cane;der Hund&#10;Vado {{a}} Roma.;Ich fahre nach Rom.">${esc(imp.text)}</textarea>
      <div class="btnrow"><button class="btn primary" data-action="imp-parse">${T("Erkennen")}</button><label class="btn filebtn">${T("Datei wählen")}<input type="file" id="impFile" accept=".csv,.tsv,.txt,text/csv,text/plain"></label></div>
      ${imp.error ? `<p class="neg">${esc(imp.error)}</p>` : ""}</section>
    ${body}`;
}
function impParse(text) {
  const imp = state.imp;
  imp.text = text; imp.error = "";
  const { rows } = parseCSV(text);
  if (!rows.length || rows.every((r) => r.length < 2)) { imp.rows = null; imp.error = T("Keine zwei Spalten erkannt. Trenne Wort und Übersetzung mit Tab, Semikolon, Komma oder „ - “."); render(); return; }
  imp.rows = rows;
  const first = rows[0], hits = {};
  first.forEach((h, i) => { for (const [k, re] of Object.entries(IMPORT_H)) if (re.test(h.trim()) && hits[k] == null) hits[k] = i; });
  const L = langOf(imp.lang);
  if (L && first.some((h) => normAns(h) === normAns(L.name))) hits.tg = first.findIndex((h) => normAns(h) === normAns(L.name));
  imp.header = Object.keys(hits).length >= 1 && (hits.tg != null || hits.de != null);
  imp.map = { tg: hits.tg != null ? hits.tg : 0, de: hits.de != null ? hits.de : (hits.tg === 1 ? 0 : 1), ex: hits.ex != null ? hits.ex : -1, topic: hits.topic != null ? hits.topic : -1, note: hits.note != null ? hits.note : -1 };
  if (!imp.header) {
    const sample = rows.slice(0, 30), deLike = (col) => sample.filter((r) => /\b(der|die|das|ein|eine|sich)\b|[äöüß]/i.test(r[col] || "")).length;
    if (deLike(0) > deLike(1) + 2) imp.map = { ...imp.map, tg: 1, de: 0 };
  }
  render();
}
function impRun() {
  const imp = state.imp; if ($("impDeckL")) imp.deck = $("impDeckL").value.trim() || imp.deck;
  const recs = impRecords(imp).filter((r) => r.c && !r.skip), now = Math.max(nowTs(), ...state.cards.map((c) => c.created + 1));
  recs.forEach((r, i) => { r.c.created = now + i; r.c.id = newId() + i; });
  state.cards = state.cards.concat(recs.map((r) => r.c)); reindex(); save();
  const code = imp.lang, deck = imp.deck;
  state.imp = null;
  toast(`${plural(recs.length, T("Karte"), T("Karten"))} importiert`);
  state.stack = [{ v: "hub" }, { v: "lang", p: code }];
  go("deck", { lang: code, deck });
}
VIEWS.import = viewImport;
VIEWS.review = viewReview;
