/* ================= Settings ================= */
const BACKUP_KEY = KEYS.backup;
function lastBackupDays() { const v = lsGet(BACKUP_KEY); return v ? Math.floor((Date.now() - Date.parse(v)) / 864e5) : null; }
function lastBackupText() { const d = lastBackupDays(); return d == null ? "noch nie" : d === 0 ? "heute" : d === 1 ? "gestern" : `vor ${d} Tagen`; }
function openMode() { const v = lsGet(KEYS.open); return ["splash", "menu", "learn"].includes(v) ? v : "splash"; }
function storageKB() { let n = 0; for (const k of Object.values(KEYS)) n += (lsGet(k) || "").length; return Math.round(n / 1024); }
const AI_MODELS = [["claude-sonnet-5-5", "Genau – Claude Sonnet 5.5"], ["claude-haiku-5-5", "Günstig – Claude Haiku 5.5"]];
function aiCfg() { const v = readJSON(KEYS.ai, {}); return { key: typeof v.key === "string" ? v.key : "", model: AI_MODELS.some(([m]) => m === v.model) ? v.model : AI_MODELS[0][0] }; }
const aiOn = () => !!aiCfg().key;
const maskKey = (k) => (k.length > 14 ? `${k.slice(0, 10)}…${k.slice(-4)}` : "••••");

function viewSettings() {
  const S = state.settings, sel = (id, cur, opts) => `<select class="psel" id="${id}" data-action="setting">${opts.map(([v, t]) => `<option value="${esc(v)}"${String(cur) === String(v) ? " selected" : ""}>${esc(t)}</option>`).join("")}</select>`;
  const badgeOk = !!navigator.setAppBadge, ai = aiCfg(), sy = syncCfg();
  return `${backBar()}
    <h1 class="vtitle">Einstellungen</h1>
    <section class="card"><h2>Lernen</h2>
      <div class="field"><span class="label">Antwortmodus</span>${modePills()}</div>
      <p><b>Umdrehen</b>: Karte antippen, selbst einschätzen. <b>Tippen</b>: Antwort schreiben, PLM prüft – auch Akzente, Artikel und Tippfehler. <b>Auswahl</b>: eine von vier Antworten.</p>
      <div class="mapgrid">
        <label class="field"><span class="label">Ziel: so viel behalten</span>${sel("setRet", S.ret, [[0.8, "80 % – weniger Wiederholungen"], [0.85, "85 %"], [0.9, "90 % – empfohlen"], [0.95, "95 % – mehr Wiederholungen"]])}</label>
        <label class="field"><span class="label">Wiederholungen pro Tag max.</span>${sel("setMax", S.maxReviews, [[50, "50"], [100, "100"], [200, "200"], [500, "500"], [9999, "unbegrenzt"]])}</label>
        <label class="field"><span class="label">Neuer Lerntag beginnt um</span>${sel("setRoll", S.roll, [0, 1, 2, 3, 4, 5, 6].map((h) => [h, `${h}:00 Uhr`]))}</label>
      </div>
      <label class="check"><input type="checkbox" id="setIntro" data-action="setting"${S.intro ? " checked" : ""}><span>Neue Karten erst kennenlernen, dann abfragen<br><span class="hint">Vorne steht nur das Wort – antippen dreht die Karte mit Übersetzung und Beispiel.</span></span></label>
      <p>PLM plant jede Karte mit FSRS – dem Verfahren, das auch Anki nutzt: Was du gut kannst, kommt seltener, was du vergisst, früher wieder.</p></section>
    <section class="card" id="secVoice"><h2>Aussprache</h2>
      <label class="check"><input type="checkbox" id="setSpeak" data-action="setting"${S.autoSpeak ? " checked" : ""}><span>Fremdsprache automatisch vorlesen</span></label>
      <label class="field"><span class="label">Sprechtempo</span>${sel("setRate", S.rate, [[0.8, "Langsam"], [0.9, "Etwas langsamer – empfohlen"], [1, "Normal"], [1.1, "Schnell"]])}</label>
      ${canSpeak() ? `<div class="btnrow">${langs().map((L) => `<button class="btn" data-action="voice-test" data-arg="${esc(L.code)}">${ICON_SPEAK} ${esc(L.name)}</button>`).join("")}</div>
      <p>Die Stimme pro Sprache wählst du in den Spracheinstellungen. Bessere Stimmen lädst du auf dem iPhone unter <b>Einstellungen › Bedienungshilfen › Gesprochene Inhalte › Stimmen</b> (z. B. Italienisch „Alice“ oder „Federica“ in der Version „Erweitert“). Nichts zu hören? Lautstärke hoch, Stummschalter prüfen.</p>`
        : `<p>Dieser Browser kann nicht vorlesen.</p>`}
      <p>${canListen() ? "Mit dem Mikrofon-Knopf auf der Kartenrückseite sprichst du nach – PLM prüft per Spracherkennung, ob du verstanden wurdest." : "Nachsprechen mit Mikrofon wird in diesem Browser nicht unterstützt. Auf dem iPhone funktioniert es in Safari, wenn „Diktieren“ eingeschaltet ist (Einstellungen › Allgemein › Tastatur)."}</p></section>
    <section class="card"><h2>Erinnerung</h2>
      <p>iPhone-Web-Apps können sich nicht selbst zu einer Uhrzeit melden. Am zuverlässigsten ist ein täglicher Kalender-Termin mit Hinweis – PLM erstellt ihn für dich.</p>
      <div class="two"><label class="field"><span class="label">Täglich um</span><input type="time" id="setRemind" class="psel" style="background-image:none;padding-right:15px" value="${esc(S.remind)}"></label><div style="display:flex;align-items:end"><button class="btn primary" style="width:100%" data-action="ics">Zum Kalender</button></div></div>
      ${badgeOk ? `<label class="check"><input type="checkbox" id="setBadge" data-action="setting"${S.badge ? " checked" : ""}><span>Fällige Karten als Zahl am App-Symbol<br><span class="hint">Fragt einmal nach der Mitteilungs-Erlaubnis. Die Zahl aktualisiert sich, wenn du PLM öffnest oder schließt.</span></span></label>` : ""}</section>
    <section class="card"><h2>Sprachen</h2>
      ${langs().map((L) => navRow("lang-settings", L.code, L.name, `${L.newPerDay} neue pro Tag · ${plural(cardsOf(L.code).length, "Karte", "Karten")}`, "", badgeTxt(L.name.slice(0, 2), L.color))).join("")}
      <div class="btnrow"><button class="btn" data-action="add-lang">+ Sprache hinzufügen</button></div></section>
    <section class="card" id="secSync"><h2>iPhone ↔ iPad</h2>
      ${sy.token ? `<p>Synchronisiert über dein GitHub-Konto${sy.login ? ` <b>${esc(sy.login)}</b>` : ""}. ${esc(syncStatusText())}</p>
        <div class="btnrow"><button class="btn primary" data-action="sync-now">Jetzt synchronisieren</button><button class="btn danger${state.armed === "sync-off" ? " armed" : ""}" data-action="sync-off">${state.armed === "sync-off" ? "Wirklich trennen?" : "Trennen"}</button></div>
        <p>Auf dem anderen Gerät denselben Token eintragen – PLM findet die Daten automatisch. Karten, Fortschritt, Statistik und Einstellungen werden zusammengeführt.</p>`
      : `<p>Damit iPhone und iPad dieselben Karten und denselben Lernstand haben, speichert PLM eine Kopie in einem privaten „Gist“ in deinem GitHub-Konto. Kostenlos, ohne Server dazwischen.</p>
        <ol class="steps"><li>Auf github.com: <b>Settings › Developer settings › Personal access tokens › Tokens (classic) › Generate new token (classic)</b></li><li>Name „PLM“, Ablauf z. B. „No expiration“, nur den Haken bei <b>gist</b> setzen, erstellen.</li><li>Token kopieren, hier einfügen – auf iPhone <i>und</i> iPad.</li></ol>
        <div class="field"><label class="label" for="syncToken">GitHub-Token</label><input id="syncToken" class="psel" style="background-image:none" type="password" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="ghp_…"></div>
        <div class="btnrow"><button class="btn primary" data-action="sync-connect">Verbinden</button></div>`}
      ${sy.error ? `<p class="neg">${esc(sy.error)}</p>` : ""}</section>
    <section class="card" id="secAi"><h2>KI-Assistent (optional)</h2>
      <p>Mit einem eigenen Claude-API-Schlüssel wertet PLM Fotos und Kurs-PDFs schlau aus: Projekte und Themen, deutsche Übersetzungen, Beispielsätze, Verbtabellen und Lückensätze. Außerdem gibt die KI beim Sätzebauen Feedback. Ohne Schlüssel erkennt PLM Wortlisten und Tabellen direkt auf dem Gerät.</p>
      ${ai.key ? `<p>Schlüssel: <b>${esc(maskKey(ai.key))}</b></p>
        <label class="field"><span class="label">Modell</span>${sel("setAiModel", ai.model, AI_MODELS)}</label>
        <div class="btnrow"><button class="btn" data-action="ai-test">Testen</button><button class="btn danger${state.armed === "ai-off" ? " armed" : ""}" data-action="ai-off">${state.armed === "ai-off" ? "Wirklich entfernen?" : "Schlüssel entfernen"}</button></div>`
      : `<ol class="steps"><li>Auf <b>platform.claude.com</b> anmelden, unter <b>Billing</b> etwas Guthaben aufladen.</li><li>Unter <b>API Keys</b> einen Schlüssel erstellen und hier einfügen.</li></ol>
        <div class="field"><label class="label" for="aiKey">Claude-API-Schlüssel</label><input id="aiKey" class="psel" style="background-image:none" type="password" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="sk-ant-…"></div>
        <div class="btnrow"><button class="btn primary" data-action="ai-save">Speichern</button></div>`}
      <p>Kosten nach Verbrauch: ein Foto kostet meist unter 1 Cent, ein Kurs-PDF mit 10 Seiten einige Cent. Der Schlüssel bleibt nur auf diesem Gerät und wird nicht synchronisiert. Dein Material geht dafür direkt an Anthropic.</p></section>
    <section class="card"><h2>Daten &amp; Backup</h2>
      <p>Alles liegt auf diesem Gerät in PLM und läuft auch offline${sy.token ? " – zusätzlich in deinem GitHub-Gist" : ""}. Wenn du PLM vom Home-Bildschirm löschst, sind die lokalen Daten weg – ein Backup in iCloud Drive schadet nie.</p>
      <p>Letztes Backup: ${esc(lastBackupText())} · ${plural(state.cards.length, "Karte", "Karten")} · ${num(storageKB())} KB</p>
      <div class="btnrow"><button class="btn primary" data-action="export-json">Backup sichern</button><label class="btn filebtn">Backup laden<input type="file" id="backupFile" accept=".json,application/json"></label><button class="btn" data-action="export-csv">CSV exportieren</button></div></section>
    <section class="card"><label class="field"><span class="label">Wenn PLM öffnet</span>${sel("setOpen", openMode(), [["splash", "Startbildschirm, dann Menü"], ["menu", "Menü"], ["learn", "Direkt lernen"]])}</label></section>
    <section class="card"><h2>Zurücksetzen</h2><p>Löscht alle Karten, Fortschritte und Statistiken auf diesem Gerät${sy.token ? " und im Gist" : ""}.</p>
      <div class="btnrow"><button class="btn danger${state.armed === "wipe" ? " armed" : ""}" data-action="wipe">${state.armed === "wipe" ? "Wirklich alles löschen?" : "Alles löschen"}</button></div></section>
    <p class="hint">PLM ${esc(window.PLM_VERSION || "")} · Personal Language Management</p>
    <footer class="motto"><span>Sometimes I feel like giving up.</span><span>Then I remember I have a lot of people to prove wrong.</span></footer>`;
}
VIEWS.settings = viewSettings;
