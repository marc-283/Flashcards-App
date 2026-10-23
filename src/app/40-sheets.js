/* ================= Sheets ================= */
const SHEETS = ["cardSheet", "langSheet", "formSheet"];
let sheetTok = 0;
function showSheet(id) { sheetTok++; $("backdrop").hidden = false; $(id).hidden = false; }
function sheetOpen() { return SHEETS.map((id) => $(id)).find((el) => el && !el.hidden) || null; }
function closeSheets() {
  SHEETS.forEach((id) => { const el = $(id); if (el) { el.hidden = true; el.style.transform = ""; el.style.transition = ""; el.style.animation = ""; el.classList.remove("dragging"); } });
  $("backdrop").hidden = true; $("backdrop").style.opacity = ""; $("backdrop").style.transition = "";
  state.editing = null; state.armed = state.armed && state.armed.startsWith("card") ? null : state.armed;
}
function dismissSheet(sh, fromY) {
  const b = $("backdrop"), H = sh.offsetHeight || window.innerHeight;
  if (document.activeElement && sh.contains(document.activeElement)) document.activeElement.blur();
  sh.style.animation = "none"; sh.style.transition = "none"; sh.style.transform = `translateY(${fromY || 0}px)`;
  void sh.offsetHeight;
  sh.style.transition = "transform .24s cubic-bezier(.2,.7,.3,1)"; sh.style.transform = `translateY(${H + 24}px)`;
  b.style.transition = "opacity .24s ease-out"; b.style.opacity = "0";
  const tok = ++sheetTok;
  setTimeout(() => { if (tok === sheetTok) closeSheets(); }, 240);
}
function closeSheetsAnimated() { const sh = sheetOpen(); if (sh) dismissSheet(sh, 0); else closeSheets(); }

let toastTimer;
function toast(msg, action) {
  const t = $("toast");
  t.textContent = "";
  const span = document.createElement("span"); span.textContent = msg; t.appendChild(span);
  if (action) { const b = document.createElement("button"); b.className = "toastbtn"; b.type = "button"; b.textContent = action.label; b.addEventListener("click", () => { t.hidden = true; action.fn(); }); t.appendChild(b); }
  t.hidden = false; clearTimeout(toastTimer); toastTimer = setTimeout(() => { t.hidden = true; }, action ? 7000 : 3200);
}

/* ---------- Card editor ---------- */
function curLangCode() {
  const top = state.stack[state.stack.length - 1];
  if (top.v === "lang" || top.v === "verbs" || top.v === "import" || top.v === "starter") return top.p;
  if (top.v === "cards") return top.p.lang;
  if (top.v === "search" && state.q.lang !== "all") return state.q.lang;
  let last = null; try { last = localStorage.getItem("plm.lastLang"); } catch { /* ignore */ }
  return (last && langOf(last) ? last : null) || (langs()[0] && langs()[0].code);
}
function openCard(card, preset) {
  closeSheets();
  preset = preset || {};
  const code = card ? card.lang : (preset.lang || curLangCode());
  state.editing = card ? card.id : null; state.armed = null;
  state.cType = card ? card.type : (preset.type || "word");
  $("cardTitle").textContent = card ? "Karte bearbeiten" : "Neue Karte";
  $("cLang").innerHTML = langs().map((l) => `<option value="${esc(l.code)}"${l.code === code ? " selected" : ""}>${esc(l.name)}</option>`).join("");
  const top = state.stack[state.stack.length - 1];
  const topic = card ? card.topic : preset.topic != null ? preset.topic : top.v === "cards" && top.p.topic != null ? top.p.topic : (() => { try { return localStorage.getItem("plm.lastTopic." + code) || ""; } catch { return ""; } })();
  fillTopics(code, topic);
  $("cTg").value = card ? card.tg : (preset.tg || "");
  $("cDe").value = card ? card.de : (preset.de || "");
  $("cEx").value = card ? card.ex : ""; $("cExDe").value = card ? card.exDe : ""; $("cNote").value = card ? card.note : "";
  $("cMore").open = !!(card && (card.ex || card.note));
  state.cPos = card ? card.pos : "";
  state.cAux = card && card.aux === "essere" ? "essere" : "avere";
  $("cIsc").checked = !!(card && card.isc);
  state.cTables = card && card.tables ? JSON.parse(JSON.stringify(card.tables)) : {};
  $("cDelete").hidden = !card; $("cDelete").classList.remove("armed"); $("cDelete").textContent = "Löschen";
  $("cSaveNext").hidden = !!card;
  $("cExtra").hidden = !card;
  if (card) { $("cSusp").textContent = card.susp ? "Fortsetzen" : "Pausieren"; $("cReset").textContent = "Fortschritt zurücksetzen"; $("cReset").classList.remove("armed"); }
  const st = card ? cardState(card) : null;
  $("cInfo").textContent = card ? `${STATE_TXT[st]}${st !== "new" && st !== "susp" ? ` · nächste Wiederholung ${dueText(card)}` : ""} · ${Object.values(card.srs).reduce((a, s) => a + s.reps, 0)} Wiederholungen · angelegt ${dateFmt.format(new Date(card.created))}` : "";
  $("cErr").textContent = "";
  syncCardForm();
  showSheet("cardSheet");
  if (!card) setTimeout(() => $("cTg").focus(), 80);
}
function fillTopics(code, sel) {
  const ts = topicsOf(code).filter(Boolean);
  if (sel && !ts.includes(sel)) ts.push(sel);
  $("cTopic").innerHTML = `<option value="">Ohne Thema</option>` + ts.map((t) => `<option${t === sel ? " selected" : ""}>${esc(t)}</option>`).join("") + `<option value="__new">+ Neues Thema …</option>`;
  $("cNewTopic").hidden = true; $("cNewTopicName").value = "";
}
function readTables() {
  const box = $("cTables");
  box.querySelectorAll("input[data-t]").forEach((inp) => {
    const t = inp.dataset.t, i = Number(inp.dataset.i);
    if (!state.cTables[t]) state.cTables[t] = [];
    state.cTables[t][i] = inp.value.trim();
  });
}
function syncCardForm() {
  const code = $("cLang").value, L = langOf(code), t = state.cType;
  $("ctWord").setAttribute("aria-pressed", String(t === "word"));
  $("ctVerb").setAttribute("aria-pressed", String(t === "verb"));
  $("ctCloze").setAttribute("aria-pressed", String(t === "cloze"));
  $("cTgLabel").textContent = t === "verb" ? `Infinitiv (${L.name})` : t === "cloze" ? `Satz auf ${L.name}` : L.name;
  $("cDeLabel").textContent = t === "cloze" ? "Übersetzung (Hinweis)" : "Deutsch";
  $("cTg").placeholder = t === "verb" ? (code === "it" ? "z. B. andare" : code === "en" ? "z. B. go" : "Infinitiv") : t === "cloze" ? (code === "it" ? "Vado {{a}} Roma domani." : code === "en" ? "I'm looking forward {{to}} it." : "Satz mit {{Lücke}}") : (hasGenderedNouns(L) ? "z. B. la casa" : code === "en" ? "z. B. to look forward to" : "");
  $("cDe").placeholder = t === "cloze" ? "z. B. Ich fahre morgen nach Rom." : t === "verb" ? "z. B. gehen; fahren" : "z. B. das Haus";
  $("cTgHint").textContent = t === "cloze" ? "Lücke in doppelte geschweifte Klammern setzen: {{a}}. Mehrere Lücken sind möglich." : t === "word" ? `${hasGenderedNouns(L) ? "Nomen mit Artikel eintragen. " : ""}Mehrere richtige Antworten mit ; trennen. Optionales in Klammern: (to) cope with.` : "";
  $("cPosWrap").hidden = t !== "word";
  $("cPos").innerHTML = Object.entries(POS).filter(([k]) => k !== "v" || t === "word").map(([k, v]) => `<label class="chip"><input type="radio" name="cpos" value="${k}"${state.cPos === k ? " checked" : ""}><span>${esc(v)}</span></label>`).join("");
  $("cVerbWrap").hidden = t !== "verb";
  if (t === "verb") {
    $("cItOpts").hidden = code !== "it";
    $("cAuxAvere").setAttribute("aria-pressed", String(state.cAux === "avere"));
    $("cAuxEssere").setAttribute("aria-pressed", String(state.cAux === "essere"));
    $("cIscWrap").hidden = !/ire$/.test(normAns($("cTg").value));
    $("cFill").hidden = $("cFillHint").hidden = !["it", "en"].includes(code);
    renderTables(L);
  }
}
function renderTables(L) {
  const box = $("cTables");
  box.innerHTML = L.tenses.map((t) => {
    const labels = tenseLabels(L, t), forms = state.cTables[t.n] || [], active = L.active.includes(t.n), filled = forms.filter(Boolean).length;
    const rows = (labels.length ? labels : ["Form"]).map((lab, i) => `<label for="ct-${esc(t.n)}-${i}">${esc(lab)}</label><input id="ct-${esc(t.n)}-${i}" data-t="${esc(t.n)}" data-i="${i}" value="${esc(forms[i] || "")}" autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false">`).join("");
    return `<details class="tensebox"${active ? " open" : ""}><summary><span>${esc(t.n)}</span><span class="hint">${active ? "wird abgefragt" : "nicht aktiv"}${filled ? ` · ${filled}/${labels.length || 1}` : ""}</span></summary><div class="formtable">${rows}</div></details>`;
  }).join("") + `<p class="hint">Welche Zeiten abgefragt werden, legst du pro Sprache fest (Verbtabellen).</p>`;
}
function autoFill() {
  readTables();
  const code = $("cLang").value, inf = $("cTg").value.trim();
  if (!inf) { $("cErr").textContent = "Trag zuerst den Infinitiv ein."; return; }
  let r = null;
  if (code === "it") r = itConj(inf, { aux: state.cAux, isc: $("cIsc").checked });
  if (code === "en") { const sf = state.cTables["Stammformen"] || []; r = enConj(inf, { past: sf[1] || undefined, pp: sf[2] || undefined }); }
  if (!r) { $("cErr").textContent = code === "it" ? "Der Infinitiv muss auf -are, -ere, -ire (oder -arsi …) enden." : "Konnte keine Formen bilden."; return; }
  let n = 0;
  for (const [t, forms] of Object.entries(r)) {
    if (t.startsWith("_")) continue;
    const cur = state.cTables[t] || [];
    state.cTables[t] = forms.map((f, i) => { if (cur[i]) return cur[i]; n++; return f; });
  }
  $("cErr").textContent = "";
  renderTables(langOf(code));
  toast(n ? `${n} Formen ergänzt – bitte kurz prüfen` : "Alle Formen waren schon ausgefüllt");
}
async function saveCard(next) {
  readTables();
  const code = $("cLang").value, L = langOf(code), t = state.cType;
  const tg = $("cTg").value.trim(), de = $("cDe").value.trim();
  if (!tg) { $("cErr").textContent = t === "verb" ? "Trag den Infinitiv ein." : t === "cloze" ? "Trag einen Satz ein." : `Trag das Wort auf ${L.name} ein.`; $("cTg").focus(); return; }
  if (t === "cloze" && !parseCloze(tg).gaps.length) { $("cErr").textContent = "Markiere die Lücke mit doppelten geschweiften Klammern, z. B. Vado {{a}} Roma."; $("cTg").focus(); return; }
  if (!de && t !== "cloze") { $("cErr").textContent = "Trag die deutsche Bedeutung ein."; $("cDe").focus(); return; }
  let topic = $("cTopic").value;
  if (topic === "__new") topic = $("cNewTopicName").value.trim().slice(0, 40);
  const old = state.editing ? cardById(state.editing) : null;
  const posEl = document.querySelector('input[name="cpos"]:checked');
  const base = {
    ...(old || {}), id: old ? old.id : newId(), lang: code, type: t, tg, de, topic,
    pos: t === "word" ? (posEl ? posEl.value : "") : t === "verb" ? "v" : "",
    ex: $("cEx").value.trim(), exDe: $("cExDe").value.trim(), note: $("cNote").value.trim(),
    created: old ? old.created : nowTs(), updated: nowTs(), srs: old && old.lang === code ? old.srs : {}
  };
  if (t === "verb") {
    base.tables = {};
    for (const [k, v] of Object.entries(state.cTables)) if (Array.isArray(v) && v.some(Boolean)) base.tables[k] = v.map((x) => x || "");
    if (code === "it") { base.aux = state.cAux; base.isc = $("cIsc").checked; }
  } else { delete base.tables; delete base.aux; delete base.isc; }
  if (old && old.type !== t) base.srs = {};
  const c = normCard(base);
  if (!old) {
    const sig = cardSig(c), dup = state.cards.find((x) => cardSig(x) === sig);
    if (dup) { $("cErr").textContent = "Diese Karte gibt es schon."; return; }
  }
  state.cards = old ? state.cards.map((x) => (x.id === old.id ? c : x)) : state.cards.concat(c);
  reindex(); save();
  try { localStorage.setItem("plm.lastLang", code); localStorage.setItem("plm.lastTopic." + code, topic); } catch { /* ignore */ }
  if (next) {
    const keepType = t;
    openCard(null, { lang: code, type: keepType, topic });
    toast("Gespeichert");
  } else {
    closeSheets();
    toast(old ? "Karte gespeichert" : `Karte angelegt${langOf(code).newPerDay ? "" : " – neue Karten pro Tag ist auf 0"}`);
  }
  if (state.study) { renderStudy(); return; }
  render();
}
function deleteCards(ids) {
  const set = new Set(ids), removed = state.cards.filter((c) => set.has(c.id));
  if (!removed.length) return;
  state.cards = state.cards.filter((c) => !set.has(c.id)); reindex(); save();
  toast(`${plural(removed.length, "Karte", "Karten")} gelöscht`, { label: "Rückgängig", fn: () => { const have = new Set(state.cards.map((c) => c.id)); state.cards = state.cards.concat(removed.filter((c) => !have.has(c.id))); reindex(); save(); state.study ? renderStudy() : render(); } });
}

/* ---------- Generic form sheet ---------- */
let fsCfg = null;
function openForm(cfg) {
  closeSheets(); fsCfg = cfg; state.fsArmed = false;
  $("fsTitle").textContent = cfg.title; $("fsHint").textContent = cfg.hint || ""; $("fsHint").hidden = !cfg.hint;
  const v = cfg.values || {};
  const fld = (f) => {
    const id = "fs-" + f.k, val = v[f.k];
    if (f.type === "check") return `<label class="check"><input type="checkbox" id="${id}"${val ? " checked" : ""}><span>${esc(f.label)}${f.sub ? `<br><span class="hint">${esc(f.sub)}</span>` : ""}</span></label>`;
    if (f.type === "chips") return `<div class="field"><span class="label">${esc(f.label)}</span><div class="chips" id="${id}">${f.opts.map(([o, t]) => `<label class="chip"><input type="checkbox" value="${esc(o)}"${(val || []).includes(o) ? " checked" : ""}><span>${esc(t)}</span></label>`).join("")}</div>${f.sub ? `<span class="hint">${esc(f.sub)}</span>` : ""}</div>`;
    const lab = `<label class="label" for="${id}">${esc(f.label)}</label>`;
    if (f.type === "select") return `<div class="field">${lab}<select id="${id}">${f.opts.map(([o, t]) => `<option value="${esc(o)}"${String(val) === String(o) ? " selected" : ""}>${esc(t)}</option>`).join("")}</select>${f.sub ? `<span class="hint">${esc(f.sub)}</span>` : ""}</div>`;
    return `<div class="field">${lab}<input id="${id}"${f.type === "num" ? ' inputmode="numeric"' : ""} value="${esc(val == null ? "" : val)}" placeholder="${esc(f.ph || "")}"${f.max ? ` maxlength="${f.max}"` : ""} autocomplete="off">${f.sub ? `<span class="hint">${esc(f.sub)}</span>` : ""}</div>`;
  };
  let html = ""; const F = cfg.fields;
  for (let i = 0; i < F.length; i++) { if (F[i].half && F[i + 1] && F[i + 1].half) { html += `<div class="two">${fld(F[i])}${fld(F[i + 1])}</div>`; i++; } else html += fld(F[i]); }
  $("fsFields").innerHTML = html;
  $("fsSave").textContent = cfg.saveLabel || "Speichern";
  const d = $("fsDelete"); d.hidden = !cfg.onDelete; d.textContent = cfg.deleteLabel || "Löschen"; d.classList.remove("armed");
  $("fsErr").textContent = "";
  showSheet("formSheet");
}
$("fsForm").addEventListener("submit", (ev) => {
  ev.preventDefault(); if (!fsCfg) return;
  const vals = {};
  for (const f of fsCfg.fields) {
    const el = $("fs-" + f.k); if (!el) continue;
    if (f.type === "check") vals[f.k] = el.checked;
    else if (f.type === "chips") vals[f.k] = [...el.querySelectorAll("input:checked")].map((x) => x.value);
    else if (f.type === "num") { const n = parseInt(el.value, 10); if (!Number.isFinite(n) || n < (f.min || 0) || n > (f.maxv || 9999)) { $("fsErr").textContent = `„${f.label}“: bitte eine Zahl zwischen ${f.min || 0} und ${f.maxv || 9999}.`; el.focus(); return; } vals[f.k] = n; }
    else vals[f.k] = el.value.trim();
  }
  const err = fsCfg.validate ? fsCfg.validate(vals) : ""; if (err) { $("fsErr").textContent = err; return; }
  const cfg = fsCfg; closeSheets(); cfg.onSave(vals);
});
$("fsDelete").addEventListener("click", () => {
  const b = $("fsDelete");
  if (!state.fsArmed) { state.fsArmed = true; b.classList.add("armed"); b.textContent = fsCfg.deleteArmed || "Wirklich löschen?"; return; }
  const cfg = fsCfg; closeSheets(); cfg.onDelete();
});

/* ---------- Languages ---------- */
function openLangChooser() {
  closeSheets();
  const have = new Set(langs().map((l) => l.code));
  $("langChoices").innerHTML = Object.values(PRESETS).filter((p) => !have.has(p.code)).map((p) => `<button type="button" class="choice" data-action="lang-add" data-arg="${p.code}" style="display:flex;flex-direction:column;gap:3px"><b style="font-family:var(--f-display);font-weight:800;font-size:20px;text-transform:uppercase;letter-spacing:.02em;color:${p.color}">${esc(p.name)}</b><span class="hint">${p.persons.length ? esc(p.persons.join(", ")) + " · " : ""}${esc(p.tenses.map((t) => t.n).slice(0, 3).join(", "))} …</span></button>`).join("")
    + `<button type="button" class="choice" data-action="lang-add" data-arg="__custom" style="display:flex;flex-direction:column;gap:3px"><b style="font-family:var(--f-display);font-weight:800;font-size:20px;text-transform:uppercase;letter-spacing:.02em">Andere Sprache</b><span class="hint">Name, Aussprache und Personen selbst festlegen</span></button>`;
  showSheet("langSheet");
}
function addLang(code) {
  if (code === "__custom") {
    openForm({ title: "Neue Sprache", hint: "Für Verben trägst du die Personen ein, z. B. ich-Form bis sie-Form. Zeiten kannst du später ergänzen.",
      fields: [{ k: "name", label: "Name", ph: "z. B. Polnisch", max: 30 }, { k: "tts", label: "Aussprache", type: "select", opts: TTS_LIST.concat([["", "keine"]]) },
        { k: "persons", label: "Personen (mit Komma getrennt)", ph: "ja, ty, on/ona, my, wy, oni" }, { k: "tenses", label: "Zeiten (mit Komma getrennt)", ph: "Präsens, Vergangenheit, Futur" }],
      values: { tts: "" }, validate: (v) => (!v.name ? "Gib der Sprache einen Namen." : langs().some((l) => l.name.toLowerCase() === v.name.toLowerCase()) ? "Diese Sprache gibt es schon." : ""),
      onSave: (v) => {
        const id = "x" + Date.now().toString(36).slice(-5);
        const tenses = v.tenses.split(",").map((x) => x.trim()).filter(Boolean).map((n) => ({ n }));
        const L = normLang({ code: id, name: v.name, tts: v.tts, color: LANG_COLORS[langs().length % LANG_COLORS.length], persons: v.persons.split(",").map((x) => x.trim()).filter(Boolean), tenses, active: tenses.slice(0, 1).map((t) => t.n), articles: [] });
        state.settings.langs.push(L); save(); go("lang", L.code); toast(`${L.name} hinzugefügt`);
      } });
    return;
  }
  if (langOf(code)) return;
  state.settings.langs.push(defaultLang(code)); save(); closeSheets(); go("lang", code); toast(`${PRESETS[code].name} hinzugefügt`);
}
function openLangSettings(code) {
  const L = langOf(code); if (!L) return;
  const n = cardsOf(code).length;
  openForm({ title: L.name, hint: "",
    fields: [
      { k: "name", label: "Name", max: 30, half: true }, { k: "newPerDay", label: "Neue Karten pro Tag", type: "num", min: 0, maxv: 200, half: true },
      { k: "dirs", label: "Abfragerichtung", type: "select", opts: [["both", "Beide Richtungen"], ["f", `Nur Deutsch → ${L.name}`], ["r", `Nur ${L.name} → Deutsch`]], sub: "Beide Richtungen: erst erkennen, später selbst aktiv wissen. Gilt für Vokabeln und Verbbedeutungen." },
      { k: "order", label: "Reihenfolge neuer Karten", type: "select", opts: [["seq", "Wie angelegt (Themen nacheinander)"], ["random", "Zufällig"]] },
      { k: "active", label: "Abgefragte Zeiten", type: "chips", opts: L.tenses.map((t) => [t.n, t.n]) },
      { k: "persons", label: "Personen (mit Komma getrennt)", ph: "io, tu, lui/lei …" },
      { k: "tts", label: "Aussprache", type: "select", opts: TTS_LIST.concat([["", "keine"]]).concat(TTS_LIST.some(([c]) => c === L.tts) || !L.tts ? [] : [[L.tts, L.tts]]) },
      { k: "addTense", label: "Weitere Zeit hinzufügen", ph: "z. B. Trapassato prossimo", max: 40 }
    ],
    values: { name: L.name, newPerDay: L.newPerDay, dirs: L.dirs, order: L.order, active: L.active, persons: L.persons.join(", "), tts: L.tts },
    validate: (v) => (!v.name ? "Gib der Sprache einen Namen." : ""),
    onSave: (v) => {
      Object.assign(L, { name: v.name.slice(0, 30), newPerDay: v.newPerDay, dirs: v.dirs, order: v.order, active: v.active, persons: v.persons.split(",").map((x) => x.trim()).filter(Boolean), tts: v.tts });
      if (v.addTense && !L.tenses.some((t) => t.n === v.addTense)) { L.tenses.push({ n: v.addTense }); L.active.push(v.addTense); }
      save(); render(); toast("Gespeichert");
    },
    onDelete: () => { state.settings.langs = langs().filter((x) => x.code !== code); state.cards = state.cards.filter((c) => c.lang !== code); reindex(); save(); state.stack = [{ v: "hub" }]; render(); toast(`${L.name} gelöscht`); },
    deleteLabel: "Sprache löschen", deleteArmed: n ? `Mit ${plural(n, "Karte", "Karten")} löschen?` : "Wirklich löschen?"
  });
}
function openPractice(code, topic, ids) {
  const L = code ? langOf(code) : null, topics = code ? topicsOf(code) : [];
  const fields = [];
  if (!ids && !code) fields.push({ k: "lang", label: "Sprache", type: "select", opts: [["", "Alle Sprachen"]].concat(langs().map((l) => [l.code, l.name])) });
  if (!ids && code && topic == null && topics.length > 1) fields.push({ k: "topic", label: "Thema", type: "select", opts: [["__all", "Alle Themen"]].concat(topics.map((t) => [t, t || "Ohne Thema"])) });
  if (!ids) fields.push({ k: "sel", label: "Auswahl", type: "select", opts: [["random", "Zufällig aus allen"], ["hard", "Am häufigsten vergessen"], ["recent", "Kürzlich neu gelernt"], ["new", "Noch nicht gelernt (Vorschau)"], ["verbs", "Nur Verbformen"]] });
  fields.push({ k: "count", label: "Anzahl", type: "select", opts: [[10, "10 Karten"], [20, "20 Karten"], [30, "30 Karten"], [50, "50 Karten"], [9999, "Alle"]], half: true }, { k: "mode", label: "Modus", type: "select", opts: MODES, half: true });
  openForm({ title: "Üben", hint: `Freie Runde${L ? " in " + L.name : ""} – zählt für deine Serie, ändert aber nicht den Wiederholungsplan.`, saveLabel: "Los geht's", fields,
    values: { lang: code || "", topic: topic != null ? topic : "__all", sel: "random", count: 20, mode: state.settings.mode },
    onSave: (v) => { state.settings.mode = v.mode; save(); startPractice({ lang: ids ? null : code || v.lang || null, topic: ids ? null : topic != null ? topic : (v.topic && v.topic !== "__all" ? v.topic : null), ids: ids || null, sel: v.sel || "random", count: Number(v.count) }); } });
}
function openDrill(code) {
  const verbLangs = langs().filter((l) => state.cards.some((c) => c.lang === l.code && c.type === "verb"));
  if (!code) { if (!verbLangs.length) { toast("Noch keine Verben – lade den Starter oder leg ein Verb an"); return; } if (verbLangs.length > 1) { openForm({ title: "Konjugation", fields: [{ k: "lang", label: "Sprache", type: "select", opts: verbLangs.map((l) => [l.code, l.name]) }], saveLabel: "Weiter", onSave: (v) => setTimeout(() => openDrill(v.lang), 260) }); return; } code = verbLangs[0].code; }
  const L = langOf(code), withForms = L.tenses.filter((t) => state.cards.some((c) => c.lang === code && c.type === "verb" && c.tables && c.tables[t.n] && c.tables[t.n].some(Boolean)));
  if (!withForms.length) { toast("Noch keine Verbformen eingetragen"); return; }
  const def = L.active.filter((n) => withForms.some((t) => t.n === n));
  openForm({ title: "Formen üben", hint: `${L.name}: PLM fragt zufällige Personen ab – schnell tippen, sofortiges Feedback. Ändert den Wiederholungsplan nicht.`, saveLabel: "Los geht's",
    fields: [{ k: "tenses", label: "Zeiten", type: "chips", opts: withForms.map((t) => [t.n, t.n]) }, { k: "count", label: "Anzahl", type: "select", opts: [[10, "10 Formen"], [20, "20 Formen"], [40, "40 Formen"], [80, "80 Formen"]] }],
    values: { tenses: def.length ? def : [withForms[0].n], count: 20 },
    validate: (v) => (!v.tenses.length ? "Wähle mindestens eine Zeit." : ""),
    onSave: (v) => startDrill({ lang: code, tenses: v.tenses, count: Number(v.count) }) });
}
function openTopicPicker(ids) {
  const code = cardById(ids[0]).lang;
  openForm({ title: "Thema ändern", hint: `${plural(ids.length, "Karte", "Karten")} verschieben`, fields: [{ k: "topic", label: "Thema", type: "select", opts: [["", "Ohne Thema"]].concat(topicsOf(code).filter(Boolean).map((t) => [t, t])) }, { k: "newTopic", label: "Oder neues Thema", ph: "z. B. Reisen", max: 40 }],
    onSave: (v) => { const t = v.newTopic || v.topic, set = new Set(ids); state.cards.forEach((c) => { if (set.has(c.id)) c.topic = t; }); save(); state.sel = null; render(); toast("Thema geändert"); } });
}

/* ---------- Import ---------- */
function impParse(text) {
  const imp = state.imp;
  imp.text = text; imp.error = "";
  const { rows } = parseCSV(text);
  if (!rows.length || rows.every((r) => r.length < 2)) { imp.rows = null; imp.error = "Keine zwei Spalten erkannt. Trenne Wort und Übersetzung mit Tab, Semikolon, Komma oder „ - “."; render(); return; }
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
  const imp = state.imp, recs = impRecords(imp).filter((r) => r.c && !r.skip), now = nowTs();
  recs.forEach((r, i) => { r.c.created = now + i; r.c.id = newId() + i; });
  state.cards = state.cards.concat(recs.map((r) => r.c)); reindex(); save();
  const code = imp.lang;
  state.imp = null;
  toast(`${plural(recs.length, "Karte", "Karten")} importiert`);
  goBack();
  if (state.stack[state.stack.length - 1].v !== "lang") go("lang", code);
}

/* ---------- Files: backup, CSV, calendar ---------- */
async function offerFile(filename, data, type) {
  const file = new File([data], filename, { type });
  if (navigator.canShare && navigator.canShare({ files: [file] }) && /iPhone|iPad|Android/i.test(navigator.userAgent)) {
    try { await navigator.share({ files: [file], title: filename }); return true; }
    catch (e) { if (e && e.name === "AbortError") return false; }
  }
  const url = URL.createObjectURL(file), a = document.createElement("a");
  a.href = url; a.download = filename; document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 4000);
  return true;
}
async function exportJson() {
  saveNow();
  const ok = await offerFile(`plm-backup-${dayKey(today())}.json`, JSON.stringify({ app: "plm", version: 1, exportedAt: new Date().toISOString(), settings: state.settings, cards: state.cards, stats: state.stats }), "application/json");
  if (ok) { try { localStorage.setItem(BACKUP_KEY, new Date().toISOString()); } catch { /* ignore */ } render(); }
}
function exportCsv() {
  const q = (v) => `"${String(v == null ? "" : v).replace(/"/g, '""')}"`;
  const lines = ["Sprache;Art;Fremdsprache;Deutsch;Thema;Beispiel;Beispiel DE;Notiz;Status"].concat(state.cards.map((c) => [q(langName(c.lang)), q(c.type === "verb" ? "Verb" : c.type === "cloze" ? "Lückensatz" : "Vokabel"), q(c.tg), q(c.de), q(c.topic), q(c.ex), q(c.exDe), q(c.note), q(STATE_TXT[cardState(c)])].join(";")));
  offerFile(`plm-karten-${dayKey(today())}.csv`, "﻿" + lines.join("\r\n"), "text/csv");
}
async function importBackup(input) {
  const file = input.files && input.files[0]; input.value = "";
  if (!file) return;
  try {
    const d = JSON.parse(await file.text());
    if (!d || d.app !== "plm" || !Array.isArray(d.cards)) { toast("Das ist kein PLM-Backup"); return; }
    const s = normSettings(d.settings);
    for (const L of s.langs) if (!langOf(L.code)) state.settings.langs.push(L);
    const incoming = d.cards.map(normCard).filter(Boolean), map = new Map(state.cards.map((c) => [c.id, c]));
    for (const c of incoming) { const cur = map.get(c.id); if (!cur || (c.updated || 0) >= (cur.updated || 0)) map.set(c.id, c); }
    state.cards = [...map.values()]; reindex();
    if (d.stats && typeof d.stats === "object") for (const [k, v] of Object.entries(d.stats)) { if (!/^\d{4}-\d{2}-\d{2}$/.test(k) || !v || typeof v !== "object") continue; state.stats[k] = state.stats[k] || {}; for (const [code, x] of Object.entries(v)) { const cur = state.stats[k][code] || {}; state.stats[k][code] = { r: Math.max(cur.r || 0, x.r || 0), ok: Math.max(cur.ok || 0, x.ok || 0), n: Math.max(cur.n || 0, x.n || 0), s: Math.max(cur.s || 0, x.s || 0), p: Math.max(cur.p || 0, x.p || 0) }; } }
    save(); render(); toast(`${plural(incoming.length, "Karte", "Karten")} geladen`);
  } catch { toast("Die Datei konnte nicht gelesen werden"); }
}
function downloadIcs() {
  const v = ($("setRemind") && $("setRemind").value) || state.settings.remind;
  state.settings.remind = v; save();
  const url = location.protocol.startsWith("http") ? location.href.split("#")[0] + "#learn" : "";
  offerFile("plm-erinnerung.ics", icsDaily(v, "Vokabeln wiederholen (PLM)", url, dayKey(today() + 1)), "text/calendar");
  toast("Öffne die Datei und tippe auf „Hinzufügen“");
}
async function setBadgeSetting(on) {
  if (on && window.Notification && Notification.permission !== "granted") {
    try { const p = await Notification.requestPermission(); if (p !== "granted") { state.settings.badge = false; save(); render(); toast("Ohne Erlaubnis kann PLM keine Zahl anzeigen"); return; } } catch { /* ignore */ }
  }
  state.settings.badge = on; save();
  if (on) updateBadge(); else if (navigator.clearAppBadge) navigator.clearAppBadge().catch(() => {});
}
