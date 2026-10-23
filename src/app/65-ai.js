/* ================= KI-Assistent (Claude API, user's own key) ================= */
/* Streams the answer (server-sent events): keeps the connection busy, so Safari never cuts long PDF jobs off, and shows progress */
async function aiCall({ system, content, schema, maxTokens, effort, model, onText }) {
  const cfg = aiCfg();
  if (!cfg.key) throw new Error("Kein KI-Schlüssel hinterlegt (Einstellungen › KI-Assistent)");
  if (navigator.onLine === false) throw new Error("Offline – die KI braucht eine Internetverbindung");
  const body = { model: model || cfg.model, max_tokens: maxTokens || 16000, stream: true, system, messages: [{ role: "user", content }], output_config: { effort: effort || "low", ...(schema ? { format: { type: "json_schema", schema } } : {}) } };
  let r;
  try {
    r = await fetch("https://api.anthropic.com/v1/messages", { method: "POST", headers: { "content-type": "application/json", "x-api-key": cfg.key, "anthropic-version": "2023-06-01", "anthropic-dangerous-direct-browser-access": "true" }, body: JSON.stringify(body) });
  } catch { throw new Error("Keine Verbindung zur KI – bist du online?"); }
  if (!r.ok) {
    let data = null; try { data = await r.json(); } catch { data = null; }
    throw aiError(r.status, (data && data.error && data.error.message) || "");
  }
  let text = "", stop = null, usage = {}, fail = null, buf = "";
  const handle = (ev) => {
    if (ev.type === "message_start" && ev.message && ev.message.usage) usage = { ...ev.message.usage };
    else if (ev.type === "content_block_delta" && ev.delta && ev.delta.type === "text_delta") { text += ev.delta.text; if (onText) onText(text.length); }
    else if (ev.type === "message_delta") { if (ev.delta && ev.delta.stop_reason) stop = ev.delta.stop_reason; if (ev.usage) usage = { ...usage, ...ev.usage }; }
    else if (ev.type === "error") fail = aiError(ev.error && ev.error.type === "overloaded_error" ? 529 : 0, (ev.error && ev.error.message) || "");
  };
  const feed = (chunk) => {
    buf += chunk.replace(/\r\n/g, "\n");
    let i;
    while ((i = buf.indexOf("\n\n")) >= 0) {
      const block = buf.slice(0, i); buf = buf.slice(i + 2);
      for (const line of block.split("\n")) if (line.startsWith("data:")) { let ev = null; try { ev = JSON.parse(line.slice(5).trim()); } catch { ev = null; } if (ev) handle(ev); }
    }
  };
  try {
    if (r.body && r.body.getReader) {
      const rd = r.body.getReader(), dec = new TextDecoder();
      for (;;) { const { value, done } = await rd.read(); if (done) break; feed(dec.decode(value, { stream: true })); if (fail) break; }
    } else feed(await r.text());
    feed("\n\n");
  } catch { if (!fail) fail = new Error("Die Verbindung zur KI ist abgebrochen – bitte nochmal versuchen."); }
  if (fail) throw fail;
  if (stop === "refusal") throw new Error("Die KI hat diese Anfrage abgelehnt.");
  if (stop === "max_tokens") throw new Error("Zu viel Material auf einmal – lade weniger Seiten hoch.");
  let json = null;
  if (schema) { try { json = JSON.parse(text); } catch { throw new Error("Die KI-Antwort war unvollständig – bitte nochmal versuchen."); } }
  return { text, json, usage };
}
function aiError(status, msg) {
  if (status === 401) return new Error("Der KI-Schlüssel ist ungültig.");
  if (status === 402 || /credit|balance|billing/i.test(msg)) return new Error("Kein Guthaben mehr auf deinem Claude-Konto (platform.claude.com › Billing).");
  if (status === 429) return new Error("Zu viele Anfragen – kurz warten und nochmal versuchen.");
  if (status === 413 || /too large|request_too_large/i.test(msg)) return new Error("Die Datei ist zu groß für die KI – teile das PDF auf.");
  if (status >= 500) return new Error("Die KI ist gerade überlastet – bitte gleich nochmal versuchen.");
  return new Error(`KI-Fehler${status ? ` (${status})` : ""}${msg ? ": " + msg.slice(0, 160) : ""}`);
}
async function aiTest() {
  try { const r = await aiCall({ system: "Antworte nur mit OK.", content: "Test", maxTokens: 400, model: "claude-haiku-5-5" }); toast(/ok/i.test(r.text) ? "KI erreichbar ✓" : "KI antwortet ✓"); }
  catch (e) { toast(e.message); }
}

/* ---------- Turn photos / PDFs into a project ---------- */
const AI_CARD = { type: "object", additionalProperties: false, required: ["kind", "target", "german", "example", "example_german", "note"], properties: {
  kind: { type: "string", enum: ["noun", "verb", "adjective", "adverb", "phrase", "sentence", "other", "cloze"] },
  target: { type: "string" }, german: { type: "string" }, example: { type: "string" }, example_german: { type: "string" }, note: { type: "string" } } };
const AI_IMPORT_SCHEMA = { type: "object", additionalProperties: false, required: ["project", "topics", "verbs"], properties: {
  project: { type: "string" },
  topics: { type: "array", items: { type: "object", additionalProperties: false, required: ["name", "cards"], properties: { name: { type: "string" }, cards: { type: "array", items: AI_CARD } } } },
  verbs: { type: "array", items: { type: "object", additionalProperties: false, required: ["infinitive", "german", "auxiliary", "regular", "topic", "example", "example_german", "tenses"], properties: {
    infinitive: { type: "string" }, german: { type: "string" }, auxiliary: { type: "string", enum: ["avere", "essere", "none"] }, regular: { type: "boolean" }, topic: { type: "string" },
    example: { type: "string" }, example_german: { type: "string" },
    tenses: { type: "array", items: { type: "object", additionalProperties: false, required: ["tense", "forms"], properties: { tense: { type: "string" }, forms: { type: "array", items: { type: "string" } } } } } } } } } };
function aiImportSystem(L, decks) {
  const tenses = L.tenses.map((t) => `"${t.n}"${t.labels ? ` (Formen: ${t.labels.join(", ")})` : ""}`).join(", ");
  return `Du erstellst Lernkarten für einen deutschsprachigen Lernenden aus seinem Kursmaterial. Zielsprache: ${L.name}. Niveau: Anfänger (A1–A2), außer das Material ist deutlich höher.

Regeln:
1. Nimm alles auf, was man aus dem Material lernen sollte: Wörter, Wendungen, nützliche Sätze, Verben, Grammatikmuster. Ignoriere Arbeitsanweisungen, Seitenzahlen, Kopf-/Fußzeilen, Namen aus Dialogen, leere Lücken, Bildschirm-Elemente von Screenshots und Lösungsfelder.
2. "target": in ${L.name}, genau so, wie man es schreiben soll, mit korrekten Akzenten. Nomen MIT bestimmtem Artikel${L.code === "it" ? " (il, lo, la, l', i, gli, le)" : ""}. Adjektive mit beiden Endungen, wenn das Material es so zeigt (z. B. italiano/a). Ganze Wörter in Großbuchstaben normal schreiben.
3. "german": natürliche deutsche Übersetzung – immer Deutsch, auch wenn das Material ins Englische übersetzt. Mehrere Bedeutungen mit "; " trennen. Deutsche Nomen mit Artikel.
4. "example" + "example_german": ein kurzer, natürlicher Beispielsatz auf ${L.name}-Niveau A1 mit dem Wort (nicht identisch mit target) und seine deutsche Übersetzung. Bei kind "sentence" und "cloze" leer lassen.
5. "note": optionaler kurzer Tipp auf Deutsch (z. B. Genus-Ausnahme, unregelmäßiger Plural, Ausspracheregel, Gebrauch) – sonst leer.
6. Themen: sinnvolle Gruppen nach den Abschnitten des Materials, deutsche Namen (z. B. "Begrüßung", "Im Kursraum", "Länder & Nationalitäten", "Zahlen", "Nützliche Sätze"). Pro Thema 3–40 Karten.
7. Grammatik: Für jeden Grammatikpunkt im Material 3–8 Karten mit kind "cloze": target ist ein ganzer Satz, die geübte Form steht in doppelten geschweiften Klammern, z. B. "Io {{sono}} di Roma.", german ist die Übersetzung des ganzen Satzes. Thema: "Grammatik: <Punkt>".
8. Verben: Jedes Verb, das das Material einführt oder konjugiert, kommt in "verbs" (nicht zusätzlich in topics). tenses: nur aus dieser Liste, exakt so geschrieben: ${tenses || "Präsens"}. Formen in der Reihenfolge ${(L.persons || []).join(", ") || "der Personen"}; mindestens die erste Zeit, weitere nur, wenn du sicher bist. ${L.code === "it" ? 'auxiliary: avere oder essere.' : 'auxiliary: "none".'} regular: true bei regelmäßigen Verben.
9. Erfinde keine Vokabeln, die nicht im Material stehen (Beispielsätze ausgenommen). Keine Dopplungen.
10. "project": kurzer deutscher Projektname passend zum Material, z. B. "Kurs A1 · Lektion 2". Vorhandene Projekte des Lernenden: ${decks.length ? decks.map((d) => `"${d}"`).join(", ") : "keine"} – wenn das Material eindeutig dazu gehört, nimm genau diesen Namen.`;
}
async function aiExtract(L, blocks, note, onText) {
  const decks = decksOf(L.code).map((d) => d.name).filter((d) => d !== OWN_DECK);
  const content = blocks.concat([{ type: "text", text: `Erstelle die Lernkarten aus diesem Material.${note ? " Hinweis des Lernenden: " + note : ""}` }]);
  return aiCall({ system: aiImportSystem(L, decks), content, schema: AI_IMPORT_SCHEMA, maxTokens: 48000, effort: "low", onText });
}
/* Convert the AI answer into review items */
function aiToItems(L, data) {
  const items = [], kindPos = { noun: "n", verb: "v", adjective: "adj", adverb: "adv", phrase: "ph", sentence: "s", other: "x" };
  for (const t of data.topics || []) for (const c of t.cards || []) {
    if (!c.target) continue;
    const cloze = c.kind === "cloze" && /\{\{.+?\}\}/.test(c.target);
    items.push({ type: cloze ? "cloze" : "word", tg: c.target.trim(), de: (c.german || "").trim(), pos: cloze ? "" : kindPos[c.kind] || "", ex: c.example || "", exDe: c.example_german || "", note: c.note || "", topic: t.name || "" });
  }
  for (const v of data.verbs || []) {
    if (!v.infinitive) continue;
    const tables = {};
    for (const t of v.tenses || []) { const def = L.tenses.find((x) => normAns(x.n) === normAns(t.tense)); if (def && Array.isArray(t.forms) && t.forms.some(Boolean)) tables[def.n] = t.forms.slice(0, 8).map(String); }
    if (L.code === "it" && v.regular) { const r = itConj(v.infinitive, { aux: v.auxiliary === "essere" ? "essere" : "avere" }); if (r) for (const [k, f] of Object.entries(r)) if (!k.startsWith("_") && !tables[k]) tables[k] = f; }
    if (L.code === "en") { const r = enConj(v.infinitive, {}); if (r && v.regular) for (const [k, f] of Object.entries(r)) if (!tables[k]) tables[k] = f; }
    items.push({ type: "verb", tg: v.infinitive.trim(), de: (v.german || "").trim(), pos: "v", ex: v.example || "", exDe: v.example_german || "", note: "", topic: v.topic || "Verben", tables, aux: v.auxiliary === "essere" ? "essere" : undefined });
  }
  return items;
}

/* ---------- Fill in missing translations and examples ---------- */
const AI_FILL_SCHEMA = { type: "object", additionalProperties: false, required: ["items"], properties: { items: { type: "array", items: { type: "object", additionalProperties: false, required: ["i", "target", "german", "example", "example_german", "kind"], properties: {
  i: { type: "integer" }, target: { type: "string" }, german: { type: "string" }, example: { type: "string" }, example_german: { type: "string" }, kind: { type: "string", enum: ["noun", "verb", "adjective", "adverb", "phrase", "sentence", "other"] } } } } } };
async function aiFill(L, list) {
  const lines = list.map((x, i) => `${i}\t${x.tg}\t${x.de || ""}`).join("\n");
  const r = await aiCall({ system: `Du ergänzt Lernkarten für Deutschsprachige, die ${L.name} lernen. Für jede Zeile (Index, Wort in ${L.name}, evtl. vorhandene Übersetzung): korrigiere offensichtliche Texterkennungsfehler im Wort (target, mit Artikel bei Nomen${L.code === "it" ? ", korrekte Akzente" : ""}), gib eine natürliche deutsche Übersetzung (vorhandene englische Übersetzungen ins Deutsche übertragen), einen kurzen A1-Beispielsatz in ${L.name} und seine deutsche Übersetzung. Bei ganzen Sätzen bleiben die Beispielfelder leer.`,
    content: [{ type: "text", text: lines }], schema: AI_FILL_SCHEMA, maxTokens: 24000, effort: "low" });
  return r.json.items || [];
}

/* ---------- Check a built sentence ---------- */
const AI_CHECK_SCHEMA = { type: "object", additionalProperties: false, required: ["correct", "corrected", "explanation"], properties: { correct: { type: "boolean" }, corrected: { type: "string" }, explanation: { type: "string" } } };
async function aiCheckSentence(L, de, ref, user) {
  const r = await aiCall({ model: "claude-haiku-5-5", system: `Du bist ein freundlicher ${L.name}-Lehrer für Deutschsprachige (Niveau A1–A2). Beurteile, ob die Antwort des Lernenden eine korrekte und natürliche Übersetzung des deutschen Satzes ist. Groß-/Kleinschreibung und Satzzeichen ignorieren; andere korrekte Formulierungen als die Musterlösung sind richtig. Wenn nicht korrekt: gib die korrigierte Version, die möglichst nah an der Antwort des Lernenden bleibt, und erkläre den Fehler in 1–2 kurzen deutschen Sätzen. Wenn korrekt: corrected leer, explanation ein kurzer Satz.`,
    content: [{ type: "text", text: `Deutscher Satz: ${de}\nMusterlösung: ${ref}\nAntwort des Lernenden: ${user}` }], schema: AI_CHECK_SCHEMA, maxTokens: 4000, effort: "low" });
  return r.json;
}
async function aiCheckCurrent() {
  const S = state.study, e = S && S.queue[0];
  if (!e || !S.res || !S.res.user) return;
  const c = cardById(e.id), L = langOf(c.lang), sent = e.sent || { tg: c.tg, de: c.de };
  S.ai = { loading: true }; renderStudy();
  try { const j = await aiCheckSentence(L, sent.de, sent.tg, S.res.user); if (state.study !== S) return; S.ai = { ok: j.correct, corrected: j.corrected, explanation: j.explanation }; if (j.correct) { S.res.parts[0] = { res: "exact" }; S.res.sug = 3; } }
  catch (err) { if (state.study !== S) return; S.ai = { error: err.message }; }
  renderStudy();
}
