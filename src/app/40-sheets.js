/* ================= Sheets ================= */
const SHEETS = ["cardSheet", "langSheet", "formSheet"];
let sheetTok = 0;
function showSheet(id) { sheetTok++; $("backdrop").hidden = false; $(id).hidden = false; $(id).scrollTop = 0; }
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
  t.hidden = false; clearTimeout(toastTimer); toastTimer = setTimeout(() => { t.hidden = true; }, action ? 7000 : 3600);
}

/* ---------- Card editor ---------- */
function curLangCode() {
  const top = state.stack[state.stack.length - 1];
  if (["lang", "verbs", "import", "starter"].includes(top.v)) return top.p;
  if (top.v === "cards" || top.v === "deck") return top.p.lang;
  if (top.v === "search" && state.q.lang !== "all") return state.q.lang;
  const last = lsGet("plm.lastLang");
  return (last && langOf(last) ? last : null) || (langs()[0] && langs()[0].code);
}
function curDeck(code) {
  const top = state.stack[state.stack.length - 1];
  if ((top.v === "cards" || top.v === "deck") && top.p.deck != null) return top.p.deck;
  return lsGet("plm.lastDeck." + code) || OWN_DECK;
}
function openCard(card, preset) {
  closeSheets();
  preset = preset || {};
  const code = card ? card.lang : (preset.lang || curLangCode());
  state.editing = card ? card.id : null; state.armed = null;
  state.cType = card ? card.type : (preset.type || "word");
  $("cardTitle").textContent = card ? T("Karte bearbeiten") : T("Neue Karte");
  $("cLang").innerHTML = langs().map((l) => `<option value="${esc(l.code)}"${l.code === code ? " selected" : ""}>${esc(lname(l))}</option>`).join("");
  const top = state.stack[state.stack.length - 1];
  const deck = card ? card.deck : preset.deck != null ? preset.deck : curDeck(code);
  const topic = card ? card.topic : preset.topic != null ? preset.topic : top.v === "cards" && top.p.topic != null ? top.p.topic : (lsGet("plm.lastTopic." + code) || "");
  fillDecks(code, deck);
  fillTopics(code, deck, topic);
  $("cTg").value = card ? card.tg : (preset.tg || "");
  $("cDe").value = card ? card.de : (preset.de || "");
  $("cEx").value = card ? card.ex : ""; $("cExDe").value = card ? card.exDe : ""; $("cNote").value = card ? card.note : "";
  $("cMore").open = !!(card && (card.ex || card.note));
  state.cPos = card ? card.pos : "";
  state.cAux = card && card.aux === "essere" ? "essere" : "avere";
  state.cMl = card && card.ml ? card.ml : "";
  $("cIsc").checked = !!(card && card.isc);
  state.cTables = card && card.tables ? JSON.parse(JSON.stringify(card.tables)) : {};
  $("cDelete").hidden = !card; $("cDelete").classList.remove("armed"); $("cDelete").textContent = T("Löschen");
  $("cSaveNext").hidden = !!card;
  $("cExtra").hidden = !card;
  if (card) { $("cSusp").textContent = card.susp ? T("Fortsetzen") : T("Pausieren"); $("cReset").textContent = T("Fortschritt zurücksetzen"); $("cReset").classList.remove("armed"); }
  const st = card ? cardState(card) : null;
  $("cInfo").textContent = card ? T("{0}{1} · {2} Wiederholungen · angelegt {3}", [STATE_TXT[st], st !== "new" && st !== "susp" ? ` ${T("· nächste Wiederholung {0}", [dueText(card)])}` : "", Object.values(card.srs).reduce((a, s) => a + s.reps, 0), dateFmt.format(new Date(card.created))]) : "";
  $("cErr").textContent = "";
  syncCardForm();
  showSheet("cardSheet");
  if (!card) setTimeout(() => $("cTg").focus(), 80);
}
function fillDecks(code, sel) {
  const ds = decksOf(code).map((d) => d.name);
  if (!ds.includes(OWN_DECK)) ds.push(OWN_DECK);
  if (sel && !ds.includes(sel)) ds.push(sel);
  $("cDeck").innerHTML = ds.map((d) => `<option value="${esc(d)}"${d === sel ? " selected" : ""}>${esc(dn(d))}</option>`).join("") + `<option value="__new">${T("+ Neues Projekt …")}</option>`;
  $("cNewDeck").hidden = true; $("cNewDeckName").value = "";
}
function fillTopics(code, deck, sel) {
  const ts = topicsOf(code, deck).filter(Boolean);
  if (sel && !ts.includes(sel)) ts.push(sel);
  $("cTopic").innerHTML = `<option value="">${T("Ohne Thema")}</option>` + ts.map((t) => `<option value="${esc(t)}"${t === sel ? " selected" : ""}>${esc(dn(t))}</option>`).join("") + `<option value="__new">${T("+ Neues Thema …")}</option>`;
  $("cNewTopic").hidden = true; $("cNewTopicName").value = "";
}
function readTables() {
  $("cTables").querySelectorAll("input[data-t]").forEach((inp) => {
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
  $("cTgLabel").textContent = t === "verb" ? T("Infinitiv ({0})", [lname(L)]) : t === "cloze" ? T("Satz auf {0}", [lname(L)]) : lname(L);
  $("cDeLabel").textContent = t === "cloze" ? T("Übersetzung (Hinweis)") : state.cMl ? T("Bedeutung ({0})", [MEANING_LANGS[state.cMl]]) : T("Deutsch");
  $("cTg").placeholder = t === "verb" ? (code === "it" ? T("z. B. andare") : code === "en" ? T("z. B. go") : T("Infinitiv")) : t === "cloze" ? (code === "it" ? "Vado {{a}} Roma domani." : code === "en" ? "I'm looking forward {{to}} it." : T("Satz mit {{Lücke}}")) : (hasGenderedNouns(L) ? T("z. B. la casa") : code === "en" ? T("z. B. to look forward to") : "");
  $("cDe").placeholder = t === "cloze" ? T("z. B. Ich fahre morgen nach Rom.") : t === "verb" ? T("z. B. gehen; fahren") : T("z. B. das Haus");
  $("cTgHint").textContent = t === "cloze" ? T("Lücke in doppelte geschweifte Klammern setzen: {{a}}. Mehrere Lücken sind möglich.") : t === "word" ? T("{0}Mehrere richtige Antworten mit ; trennen. Optionales in Klammern: (to) cope with.", [hasGenderedNouns(L) ? `${T("Nomen mit Artikel eintragen.")} ` : ""]) : "";
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
  $("cTables").innerHTML = L.tenses.map((t) => {
    const labels = tenseLabels(L, t), forms = state.cTables[t.n] || [], active = L.active.includes(t.n), filled = forms.filter(Boolean).length;
    const rows = (labels.length ? labels : [T("Form")]).map((lab, i) => `<label for="ct-${esc(t.n)}-${i}">${esc(lab)}</label><input id="ct-${esc(t.n)}-${i}" data-t="${esc(t.n)}" data-i="${i}" value="${esc(forms[i] || "")}" autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false">`).join("");
    return `<details class="tensebox"${active ? " open" : ""}><summary><span>${esc(t.n)}</span><span class="hint">${active ? T("wird abgefragt") : T("nicht aktiv")}${filled ? ` · ${filled}/${labels.length || 1}` : ""}</span></summary><div class="formtable">${rows}</div></details>`;
  }).join("") + `<p class="hint">${T("Welche Zeiten abgefragt werden, legst du pro Sprache fest (Konjugation).")}</p>`;
}
function autoFill() {
  readTables();
  const code = $("cLang").value, inf = $("cTg").value.trim();
  if (!inf) { $("cErr").textContent = T("Trag zuerst den Infinitiv ein."); return; }
  let r = null;
  if (code === "it") r = itConj(inf, { aux: state.cAux, isc: $("cIsc").checked });
  if (code === "en") { const sf = state.cTables["Stammformen"] || []; r = enConj(inf, { past: sf[1] || undefined, pp: sf[2] || undefined }); }
  if (!r) { $("cErr").textContent = code === "it" ? T("Der Infinitiv muss auf -are, -ere, -ire (oder -arsi …) enden.") : T("Konnte keine Formen bilden."); return; }
  let n = 0;
  for (const [t, forms] of Object.entries(r)) {
    if (t.startsWith("_")) continue;
    const cur = state.cTables[t] || [];
    state.cTables[t] = forms.map((f, i) => { if (cur[i]) return cur[i]; n++; return f; });
  }
  $("cErr").textContent = "";
  renderTables(langOf(code));
  toast(n ? T("{0} Formen ergänzt – bitte kurz prüfen", [n]) : T("Alle Formen waren schon ausgefüllt"));
}
function saveCard(next) {
  readTables();
  const code = $("cLang").value, L = langOf(code), t = state.cType;
  const tg = $("cTg").value.trim(), de = $("cDe").value.trim();
  if (!tg) { $("cErr").textContent = t === "verb" ? T("Trag den Infinitiv ein.") : t === "cloze" ? T("Trag einen Satz ein.") : T("Trag das Wort auf {0} ein.", [lname(L)]); $("cTg").focus(); return; }
  if (t === "cloze" && !parseCloze(tg).gaps.length) { $("cErr").textContent = T("Markiere die Lücke mit doppelten geschweiften Klammern, z. B. Vado {{a}} Roma."); $("cTg").focus(); return; }
  if (!de && t !== "cloze") { $("cErr").textContent = T("Trag die Bedeutung ein."); $("cDe").focus(); return; }
  let topic = $("cTopic").value, deck = $("cDeck").value;
  if (topic === "__new") topic = $("cNewTopicName").value.trim().slice(0, 40);
  if (deck === "__new") deck = $("cNewDeckName").value.trim().slice(0, 40) || OWN_DECK;
  const old = state.editing ? cardById(state.editing) : null;
  const posEl = document.querySelector('input[name="cpos"]:checked');
  const base = {
    ...(old || {}), id: old ? old.id : newId(), lang: code, type: t, tg, de, topic, deck,
    pos: t === "word" ? (posEl ? posEl.value : looksSentence(tg) ? "s" : "") : t === "verb" ? "v" : "",
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
    const dup = state.cards.find((x) => sameKey(x) === sameKey(c) && normAns(x.de) === normAns(c.de));
    if (dup) { $("cErr").textContent = T("Diese Karte gibt es schon ({0}).", [dup.deck]); return; }
  }
  state.cards = old ? state.cards.map((x) => (x.id === old.id ? c : x)) : state.cards.concat(c);
  reindex(); save();
  lsSet("plm.lastLang", code); lsSet("plm.lastTopic." + code, topic); lsSet("plm.lastDeck." + code, deck);
  if (next) { openCard(null, { lang: code, type: t, topic, deck }); toast(T("Gespeichert")); }
  else { closeSheets(); toast(old ? T("Karte gespeichert") : T("Karte angelegt{0}", [langOf(code).newPerDay ? "" : ` ${T("– neue Karten pro Tag ist auf 0")}`])); }
  if (state.study) { renderStudy(); return; }
  render();
}
function deleteCards(ids) {
  const set = new Set(ids), removed = state.cards.filter((c) => set.has(c.id));
  if (!removed.length) return;
  const ts = nowTs();
  state.cards = state.cards.filter((c) => !set.has(c.id)); for (const c of removed) state.tomb[c.id] = ts;
  reindex(); save();
  toast(T("{0} gelöscht", [plural(removed.length, T("Karte"), T("Karten"))]), { label: T("Rückgängig"), fn: () => {
    const have = new Set(state.cards.map((c) => c.id)), now = nowTs();
    for (const c of removed) { delete state.tomb[c.id]; c.updated = now; }
    state.cards = state.cards.concat(removed.filter((c) => !have.has(c.id))); reindex(); save(); state.study ? renderStudy() : render();
  } });
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
    if (f.type === "area") return `<div class="field">${lab}<textarea id="${id}" class="paste" style="min-height:70px" placeholder="${esc(f.ph || "")}">${esc(val == null ? "" : val)}</textarea></div>`;
    return `<div class="field">${lab}<input id="${id}"${f.type === "num" ? ' inputmode="numeric"' : ""} value="${esc(val == null ? "" : val)}" placeholder="${esc(f.ph || "")}"${f.max ? ` maxlength="${f.max}"` : ""} autocomplete="off">${f.sub ? `<span class="hint">${esc(f.sub)}</span>` : ""}</div>`;
  };
  let html = ""; const F = cfg.fields;
  for (let i = 0; i < F.length; i++) { if (F[i].half && F[i + 1] && F[i + 1].half) { html += `<div class="two">${fld(F[i])}${fld(F[i + 1])}</div>`; i++; } else html += fld(F[i]); }
  $("fsFields").innerHTML = html + (cfg.extra || "");
  $("fsSave").textContent = cfg.saveLabel || T("Speichern");
  const d = $("fsDelete"); d.hidden = !cfg.onDelete; d.textContent = cfg.deleteLabel || T("Löschen"); d.classList.remove("armed");
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
    else if (f.type === "num") { const n = parseInt(el.value, 10); if (!Number.isFinite(n) || n < (f.min || 0) || n > (f.maxv || 9999)) { $("fsErr").textContent = T("„{0}“: bitte eine Zahl zwischen {1} und {2}.", [f.label, f.min || 0, f.maxv || 9999]); el.focus(); return; } vals[f.k] = n; }
    else vals[f.k] = el.value.trim();
  }
  const err = fsCfg.validate ? fsCfg.validate(vals) : ""; if (err) { $("fsErr").textContent = err; return; }
  const cfg = fsCfg; closeSheets(); cfg.onSave(vals);
});
$("fsDelete").addEventListener("click", () => {
  const b = $("fsDelete");
  if (!state.fsArmed) { state.fsArmed = true; b.classList.add("armed"); b.textContent = fsCfg.deleteArmed || T("Wirklich löschen?"); return; }
  const cfg = fsCfg; closeSheets(); cfg.onDelete();
});

/* ---------- Languages ---------- */
function openLangChooser() {
  closeSheets();
  const have = new Set(langs().map((l) => l.code));
  $("langChoices").innerHTML = Object.values(PRESETS).filter((p) => !have.has(p.code)).map((p) => `<button type="button" class="choice" data-action="lang-add" data-arg="${p.code}" style="display:flex;flex-direction:column;gap:3px"><b style="font-family:var(--f-display);font-weight:800;font-size:20px;text-transform:uppercase;letter-spacing:.02em;color:${p.color}">${esc(lname(p))}</b><span class="hint">${p.persons.length ? esc(p.persons.join(", ")) + " · " : ""}${esc(p.tenses.map((t) => t.n).slice(0, 3).join(", "))} …</span></button>`).join("")
    + `<button type="button" class="choice" data-action="lang-add" data-arg="__custom" style="display:flex;flex-direction:column;gap:3px"><b style="font-family:var(--f-display);font-weight:800;font-size:20px;text-transform:uppercase;letter-spacing:.02em">${T("Andere Sprache")}</b><span class="hint">${T("Name, Aussprache und Personen selbst festlegen")}</span></button>`;
  showSheet("langSheet");
}
function addLang(code) {
  if (code === "__custom") {
    openForm({ title: T("Neue Sprache"), hint: T("Für Verben trägst du die Personen ein, z. B. ich-Form bis sie-Form. Zeiten kannst du später ergänzen."),
      fields: [{ k: "name", label: T("Name"), ph: T("z. B. Polnisch"), max: 30 }, { k: "tts", label: T("Aussprache"), type: "select", opts: TTS_LIST.concat([["", T("keine")]]) },
        { k: "persons", label: T("Personen (mit Komma getrennt)"), ph: "ja, ty, on/ona, my, wy, oni" }, { k: "tenses", label: T("Zeiten (mit Komma getrennt)"), ph: T("Präsens, Vergangenheit, Futur") }],
      values: { tts: "" }, validate: (v) => (!v.name ? T("Gib der Sprache einen Namen.") : langs().some((l) => l.name.toLowerCase() === v.name.toLowerCase()) ? T("Diese Sprache gibt es schon.") : ""),
      onSave: (v) => {
        const id = "x" + Date.now().toString(36).slice(-5);
        const tenses = v.tenses.split(",").map((x) => x.trim()).filter(Boolean).map((n) => ({ n }));
        const L = normLang({ code: id, name: v.name, tts: v.tts, color: LANG_COLORS[langs().length % LANG_COLORS.length], persons: v.persons.split(",").map((x) => x.trim()).filter(Boolean), tenses, active: tenses.slice(0, 1).map((t) => t.n), articles: [] });
        state.settings.langs.push(L); touchSettings(); go("lang", L.code); toast(T("{0} hinzugefügt", [lname(L)]));
      } });
    return;
  }
  if (langOf(code)) return;
  state.settings.langs.push(defaultLang(code)); touchSettings(); closeSheets(); go("lang", code); toast(T("{0} hinzugefügt", [PRESETS[code].name]));
}
function voiceOpts(code) {
  const tag = langTag(code), list = voicesFor(code).slice().sort((a, b) => voiceScore(b, tag) - voiceScore(a, tag));
  return [["", T("Automatisch{0}", [list[0] ? ` (${list[0].name})` : ""])]].concat(list.map((v) => [v.voiceURI, `${v.name} · ${v.lang}`]));
}
function openLangSettings(code) {
  const L = langOf(code); if (!L) return;
  const n = cardsOf(code).length;
  openForm({ title: lname(L), hint: "",
    fields: [
      { k: "name", label: T("Name"), max: 30, half: true }, { k: "newPerDay", label: T("Neue Karten pro Tag"), type: "num", min: 0, maxv: 200, half: true },
      { k: "dirs", label: T("Abfragerichtung"), type: "select", opts: [["both", T("Beide Richtungen")], ["f", T("Nur Deutsch → {0}", [lname(L)])], ["r", T("Nur {0} → Deutsch", [lname(L)])]], sub: T("Beide Richtungen: erst erkennen, später selbst aktiv wissen. Gilt für Vokabeln und Verbbedeutungen.") },
      { k: "order", label: T("Reihenfolge neuer Karten"), type: "select", opts: [["seq", T("Wie angelegt (Themen nacheinander)")], ["random", T("Zufällig")]] },
      { k: "active", label: T("Abgefragte Zeiten"), type: "chips", opts: L.tenses.map((t) => [t.n, t.n]) },
      { k: "persons", label: T("Personen (mit Komma getrennt)"), ph: "io, tu, lui/lei …" },
      { k: "tts", label: T("Aussprache-Sprache"), type: "select", opts: TTS_LIST.concat([["", T("keine")]]).concat(TTS_LIST.some(([c]) => c === L.tts) || !L.tts ? [] : [[L.tts, L.tts]]), half: true },
      { k: "voice", label: T("Stimme"), type: "select", opts: voiceOpts(code), half: true },
      { k: "addTense", label: T("Weitere Zeit hinzufügen"), ph: T("z. B. Trapassato prossimo"), max: 40 }
    ],
    extra: canSpeak() ? `<div class="btnrow"><button type="button" class="btn" data-action="voice-try" data-arg="${esc(code)}">${T("{0} Stimme testen", [ICON_SPEAK])}</button></div>` : "",
    values: { name: L.name, newPerDay: L.newPerDay, dirs: L.dirs, order: L.order, active: L.active, persons: L.persons.join(", "), tts: L.tts, voice: L.voice },
    validate: (v) => (!v.name ? T("Gib der Sprache einen Namen.") : ""),
    onSave: (v) => {
      Object.assign(L, { name: v.name.slice(0, 30), newPerDay: v.newPerDay, dirs: v.dirs, order: v.order, active: v.active, persons: v.persons.split(",").map((x) => x.trim()).filter(Boolean), tts: v.tts, voice: v.voice });
      if (v.addTense && !L.tenses.some((t) => t.n === v.addTense)) { L.tenses.push({ n: v.addTense }); L.active.push(v.addTense); }
      touchSettings(); render(); toast(T("Gespeichert"));
    },
    onDelete: () => { state.settings.langs = langs().filter((x) => x.code !== code); deleteCards(state.cards.filter((c) => c.lang === code).map((c) => c.id)); touchSettings(); state.stack = [{ v: "hub" }]; render(); toast(T("{0} gelöscht", [lname(L)])); },
    deleteLabel: T("Sprache löschen"), deleteArmed: n ? T("Mit {0} löschen?", [plural(n, T("Karte"), T("Karten"))]) : T("Wirklich löschen?")
  });
}
function openPractice(o) {
  o = o || {};
  const L = o.lang ? langOf(o.lang) : null, decks = o.lang && o.deck == null ? decksOf(o.lang) : [];
  const fields = [];
  if (!o.ids && !o.lang) fields.push({ k: "lang", label: T("Sprache"), type: "select", opts: [["", T("Alle Sprachen")]].concat(langs().map((l) => [l.code, lname(l)])) });
  if (!o.ids && decks.length > 1) fields.push({ k: "deck", label: T("Projekt"), type: "select", opts: [["__all", T("Alle Projekte")]].concat(decks.map((d) => [d.name, dn(d.name)])) });
  if (!o.ids) fields.push({ k: "sel", label: T("Auswahl"), type: "select", opts: [["random", T("Zufällig aus allen")], ["hard", T("Am häufigsten vergessen")], ["recent", T("Kürzlich neu gelernt")], ["new", T("Noch nicht gelernt (Vorschau)")], ["verbs", T("Nur Verbformen")]] });
  fields.push({ k: "count", label: T("Anzahl"), type: "select", opts: [[10, T("10 Karten")], [20, T("20 Karten")], [30, T("30 Karten")], [50, T("50 Karten")], [9999, T("Alle")]], half: true }, { k: "mode", label: T("Modus"), type: "select", opts: MODES, half: true });
  openForm({ title: T("Üben"), hint: T("Freie Runde{0}{1} – zählt für deine Serie, ändert aber nicht den Wiederholungsplan.", [L ? " in " + lname(L) : "", o.deck != null ? " · " + dn(o.deck) : ""]), saveLabel: T("Los geht's"), fields,
    values: { lang: "", deck: "__all", sel: "random", count: 20, mode: state.settings.mode },
    onSave: (v) => {
      state.settings.mode = v.mode; save(false);
      startPractice({ ids: o.ids || null, lang: o.ids ? null : o.lang || v.lang || null, deck: o.ids ? null : o.deck != null ? o.deck : (v.deck && v.deck !== "__all" ? v.deck : null), topic: o.ids ? null : o.topic, sel: v.sel || "random", count: Number(v.count) });
    } });
}
function openTest(code, deck) {
  const n = poolOf({ lang: code, deck }).length;
  openForm({ title: T("Test"), hint: T("{0} · gemischte Fragen: Übersetzen, Auswahl, Lückensätze, Verbformen und Sätze bauen. Am Ende gibt es eine Auswertung – der Wiederholungsplan bleibt unverändert.", [deck]), saveLabel: T("Test starten"),
    fields: [{ k: "count", label: T("Fragen"), type: "select", opts: [[10, T("10 Fragen")], [20, T("20 Fragen")], [30, T("30 Fragen")], [50, T("50 Fragen")]].filter(([k], i) => i === 0 || k <= n + 9) }],
    values: { count: Math.min(20, n) >= 20 ? 20 : 10 },
    onSave: (v) => startTest({ lang: code, deck, count: Number(v.count) }) });
}
function openDrill(code) {
  const verbLangs = langs().filter((l) => state.cards.some((c) => c.lang === l.code && c.type === "verb"));
  if (!code) { if (!verbLangs.length) { toast(T("Noch keine Verben – lade ein Starter-Paket oder leg ein Verb an")); return; } if (verbLangs.length > 1) { openForm({ title: T("Konjugation"), fields: [{ k: "lang", label: T("Sprache"), type: "select", opts: verbLangs.map((l) => [l.code, lname(l)]) }], saveLabel: T("Weiter"), onSave: (v) => setTimeout(() => openDrill(v.lang), 260) }); return; } code = verbLangs[0].code; }
  const L = langOf(code), withForms = L.tenses.filter((t) => state.cards.some((c) => c.lang === code && c.type === "verb" && c.tables && c.tables[t.n] && c.tables[t.n].some(Boolean)));
  if (!withForms.length) { toast(T("Noch keine Verbformen eingetragen")); return; }
  const def = L.active.filter((n) => withForms.some((t) => t.n === n));
  openForm({ title: T("Formen üben"), hint: T("{0}: PLM fragt zufällige Personen ab – schnell tippen, sofortiges Feedback. Ändert den Wiederholungsplan nicht.", [lname(L)]), saveLabel: T("Los geht's"),
    fields: [{ k: "tenses", label: T("Zeiten"), type: "chips", opts: withForms.map((t) => [t.n, t.n]) }, { k: "count", label: T("Anzahl"), type: "select", opts: [[10, T("10 Formen")], [20, T("20 Formen")], [40, T("40 Formen")], [80, T("80 Formen")]] }],
    values: { tenses: def.length ? def : [withForms[0].n], count: 20 },
    validate: (v) => (!v.tenses.length ? T("Wähle mindestens eine Zeit.") : ""),
    onSave: (v) => startDrill({ lang: code, tenses: v.tenses, count: Number(v.count) }) });
}
function openTopicPicker(ids) {
  const first = cardById(ids[0]), code = first.lang;
  openForm({ title: T("Verschieben"), hint: T("{0} in ein anderes Projekt oder Thema", [plural(ids.length, T("Karte"), T("Karten"))]),
    fields: [{ k: "deck", label: T("Projekt"), type: "select", opts: decksOf(code).map((d) => [d.name, dn(d.name)]).concat([["__new", T("+ Neues Projekt")]]) }, { k: "newDeck", label: T("Name des neuen Projekts"), ph: T("z. B. Kurs A2"), max: 40 },
      { k: "topic", label: T("Thema"), type: "select", opts: [["__keep", T("Thema behalten")], ["", T("Ohne Thema")]].concat(topicsOf(code).filter(Boolean).map((t) => [t, dn(t)])) }, { k: "newTopic", label: T("Oder neues Thema"), ph: T("z. B. Reisen"), max: 40 }],
    values: { deck: first.deck, topic: "__keep" },
    onSave: (v) => {
      const deck = v.deck === "__new" ? (v.newDeck || OWN_DECK) : v.deck, set = new Set(ids), ts = nowTs();
      state.cards.forEach((c) => { if (!set.has(c.id)) return; c.deck = deck; if (v.newTopic) c.topic = v.newTopic; else if (v.topic !== "__keep") c.topic = v.topic; c.updated = ts; });
      save(); state.sel = null; render(); toast(T("Verschoben"));
    } });
}
function renameDeck(code, deck) {
  openForm({ title: T("Projekt umbenennen"), fields: [{ k: "name", label: T("Name"), max: 40 }], values: { name: deck },
    validate: (v) => (!v.name ? T("Gib dem Projekt einen Namen.") : v.name !== deck && decksOf(code).some((d) => d.name === v.name) ? T("Ein Projekt mit diesem Namen gibt es schon.") : ""),
    onSave: (v) => {
      const ts = nowTs(); state.cards.forEach((c) => { if (c.lang === code && c.deck === deck) { c.deck = v.name; c.updated = ts; } });
      const k1 = `${code}|${deck}`; if (state.tests[k1]) { state.tests[`${code}|${v.name}`] = state.tests[k1]; delete state.tests[k1]; }
      save(); const top = state.stack[state.stack.length - 1]; if (top.v === "deck") top.p = { lang: code, deck: v.name }; render(); toast(T("Umbenannt"));
    } });
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
  const ok = await offerFile(`plm-backup-${dayKey(today())}.json`, JSON.stringify(snapshotData(true)), "application/json");
  if (ok) { lsSet(BACKUP_KEY, new Date().toISOString()); render(); }
}
function exportCsv() {
  const q = (v) => `"${String(v == null ? "" : v).replace(/"/g, '""')}"`;
  const lines = ["Sprache;Projekt;Thema;Art;Fremdsprache;Deutsch;Beispiel;Beispiel DE;Notiz;Status"].concat(state.cards.map((c) => [q(langName(c.lang)), q(c.deck), q(c.topic), q(c.type === "verb" ? T("Verb") : c.type === "cloze" ? T("Lückensatz") : c.pos === "s" ? T("Satz") : T("Vokabel")), q(c.tg), q(c.de), q(c.ex), q(c.exDe), q(c.note), q(STATE_TXT[cardState(c)])].join(";")));
  offerFile(`plm-karten-${dayKey(today())}.csv`, "﻿" + lines.join("\r\n"), "text/csv");
}
async function importBackup(input) {
  const file = input.files && input.files[0]; input.value = "";
  if (!file) return;
  try {
    const d = JSON.parse(await file.text());
    if (!d || d.app !== "plm" || !Array.isArray(d.cards)) { toast(T("Das ist kein PLM-Backup")); return; }
    const before = state.cards.length;
    mergeData(d, { fromBackup: true });
    save(); render(); toast(T("Backup geladen · {0}", [plural(state.cards.length - before, T("neue Karte"), T("neue Karten"))]));
  } catch { toast(T("Die Datei konnte nicht gelesen werden")); }
}
function downloadIcs() {
  const v = ($("setRemind") && $("setRemind").value) || state.settings.remind;
  state.settings.remind = v; save(false);
  const url = location.protocol.startsWith("http") ? location.href.split("#")[0] + "#learn" : "";
  offerFile("plm-erinnerung.ics", icsDaily(v, T("Vokabeln wiederholen (PLM)"), url, dayKey(today() + 1)), "text/calendar");
  toast(T("Öffne die Datei und tippe auf „Hinzufügen“"));
}
async function setBadgeSetting(on) {
  if (on && window.Notification && Notification.permission !== "granted") {
    try { const p = await Notification.requestPermission(); if (p !== "granted") { state.settings.badge = false; save(false); render(); toast(T("Ohne Erlaubnis kann PLM keine Zahl anzeigen")); return; } } catch { /* ignore */ }
  }
  state.settings.badge = on; save(false);
  if (on) updateBadge(); else if (navigator.clearAppBadge) navigator.clearAppBadge().catch(() => {});
}
