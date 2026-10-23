/* ================= Merge (backup import + sync) ================= */
const GIST_FILE = "plm-sync.json";
function snapshotData(full) {
  return { app: "plm", version: 2, exportedAt: new Date().toISOString(), dev: devId, settings: state.settings, cards: state.cards, tomb: state.tomb, tests: state.tests, devStats: { ...state.statsOther, [devId]: state.stats }, ...(full ? { stats: state.stats } : {}) };
}
const srsT = (s) => (s ? (Number.isFinite(s.t) ? s.t : (s.ld || 0) * 864e5) : -1);
function mergeCard(a, b) {
  const newer = (b.updated || 0) > (a.updated || 0) ? b : a;
  const out = { ...newer, srs: {} };
  for (const k of new Set([...Object.keys(a.srs || {}), ...Object.keys(b.srs || {})])) {
    const x = a.srs[k], y = b.srs[k];
    out.srs[k] = !x ? y : !y ? x : srsT(y) > srsT(x) || (srsT(y) === srsT(x) && (y.reps || 0) > (x.reps || 0)) ? y : x;
  }
  const rs = Math.max(a.resetAt || 0, b.resetAt || 0);
  if (rs) { out.resetAt = rs; for (const [k, v] of Object.entries(out.srs)) if (srsT(v) < rs) delete out.srs[k]; }
  return out;
}
const maxStat = (cur, x) => ({ r: Math.max(cur.r || 0, x.r || 0), ok: Math.max(cur.ok || 0, x.ok || 0), n: Math.max(cur.n || 0, x.n || 0), s: Math.max(cur.s || 0, x.s || 0), p: Math.max(cur.p || 0, x.p || 0) });
function mergeStatsInto(target, src) {
  if (!src || typeof src !== "object") return;
  for (const [k, v] of Object.entries(src)) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(k) || !v || typeof v !== "object") continue;
    target[k] = target[k] || {};
    for (const [code, x] of Object.entries(v)) if (x && typeof x === "object") target[k][code] = maxStat(target[k][code] || {}, x);
  }
}
/* Two devices loaded the same pack before syncing → keep the copy with more progress */
function dedupeCards() {
  const seen = new Map(), drop = [];
  for (const c of state.cards) {
    const k = `${sameKey(c)}|${normAns(c.de)}|${c.deck}`, o = seen.get(k);
    if (!o) { seen.set(k, c); continue; }
    const score = (x) => Object.values(x.srs).reduce((a, s) => a + (s.reps || 0), 0);
    const keep = score(c) > score(o) || (score(c) === score(o) && c.created < o.created) ? c : o, lose = keep === c ? o : c;
    seen.set(k, keep); drop.push(lose.id);
  }
  if (!drop.length) return 0;
  const set = new Set(drop), ts = nowTs();
  state.cards = state.cards.filter((c) => !set.has(c.id)); for (const id of drop) state.tomb[id] = ts;
  return drop.length;
}
function mergeData(d, o) {
  o = o || {};
  if (!d || typeof d !== "object") return;
  // settings: newer wins, languages from the other side are never lost
  if (d.settings) {
    const s = normSettings(d.settings);
    if ((s.updatedAt || 0) > (state.settings.updatedAt || 0)) {
      const mine = state.settings.langs;
      state.settings = s;
      for (const L of mine) if (!langOf(L.code)) state.settings.langs.push(L);
    } else for (const L of s.langs) if (!langOf(L.code)) state.settings.langs.push(L);
  }
  // tombstones
  if (d.tomb && typeof d.tomb === "object") for (const [id, ts] of Object.entries(d.tomb)) if (Number.isFinite(ts) && (!state.tomb[id] || ts > state.tomb[id])) state.tomb[id] = ts;
  // cards
  const map = new Map(state.cards.map((c) => [c.id, c]));
  for (const raw of Array.isArray(d.cards) ? d.cards : []) {
    const c = normCard(raw); if (!c) continue;
    const cur = map.get(c.id);
    map.set(c.id, cur ? mergeCard(cur, c) : c);
  }
  state.cards = [...map.values()].filter((c) => !(state.tomb[c.id] && state.tomb[c.id] >= (c.updated || 0)));
  for (const c of state.cards) if (state.tomb[c.id]) delete state.tomb[c.id];
  const cutoff = nowTs() - 120 * 864e5;
  for (const [id, ts] of Object.entries(state.tomb)) if (ts < cutoff) delete state.tomb[id];
  // tests
  if (d.tests && typeof d.tests === "object") for (const [k, list] of Object.entries(d.tests)) {
    if (!Array.isArray(list)) continue;
    const have = new Set((state.tests[k] || []).map((t) => t.at));
    state.tests[k] = (state.tests[k] || []).concat(list.filter((t) => t && Number.isFinite(t.at) && !have.has(t.at))).sort((a, b) => a.at - b.at).slice(-30);
  }
  // statistics: every device owns its own numbers
  if (d.devStats && typeof d.devStats === "object") {
    for (const [dev, st] of Object.entries(d.devStats)) {
      if (!st || typeof st !== "object") continue;
      if (dev === devId) mergeStatsInto(state.stats, st);
      else state.statsOther[dev] = st;
    }
  } else if (d.stats) mergeStatsInto(state.stats, d.stats);
  dedupeCards();
  reindex();
}

/* ================= Sync via a secret GitHub Gist ================= */
function syncCfg() { const v = readJSON(KEYS.sync, {}); return { token: v.token || "", gistId: v.gistId || "", login: v.login || "", last: v.last || 0, error: v.error || "" }; }
function setSync(patch) { lsSet(KEYS.sync, JSON.stringify({ ...readJSON(KEYS.sync, {}), ...patch })); }
const syncOn = () => !!syncCfg().token;
let syncing = false, syncTimer = 0, syncAgain = false;
function syncStatusText() {
  const s = syncCfg();
  if (syncing) return T("↻ Synchronisiere …");
  if (s.error) return T("⚠ Sync: {0}", [s.error]);
  if (!s.last) return T("Noch nicht synchronisiert");
  const m = Math.round((Date.now() - s.last) / 60000);
  return T("✓ Synchronisiert {0}", [m < 1 ? T("gerade eben") : m < 60 ? T("vor {0} Min.", [m]) : dayNum(s.last, 0) === dayNum(Date.now(), 0) ? T("um {0}", [timeFmt.format(new Date(s.last))]) : T("am {0}", [dayMonFmt.format(new Date(s.last))])]);
}
function updateSyncLine() { const el = $("syncLine"); if (el) el.textContent = syncStatusText(); }
function syncSoon(ms) {
  if (!syncOn()) return;
  clearTimeout(syncTimer);
  syncTimer = setTimeout(() => syncNow(false), ms == null ? 15000 : ms);
}
async function gh(path, opt) {
  const s = syncCfg();
  let r;
  try {
    r = await fetch("https://api.github.com" + path, { ...(opt || {}), cache: "no-store", headers: { Accept: "application/vnd.github+json", Authorization: `Bearer ${(opt && opt.token) || s.token}`, "X-GitHub-Api-Version": "2022-11-28", ...(opt && opt.body ? { "Content-Type": "application/json" } : {}) } });
  } catch { throw new Error(T("Keine Verbindung zu GitHub")); }
  if (r.status === 401) throw new Error(T("Token ungültig oder abgelaufen"));
  if (r.status === 403) throw new Error(T("Token hat keine Gist-Berechtigung oder GitHub-Limit erreicht"));
  return r;
}
const gistPayload = () => ({ ...snapshotData(false), updatedAt: nowTs() });
async function findOrCreateGist() {
  for (let page = 1; page <= 5; page++) {
    const r = await gh(`/gists?per_page=100&page=${page}`);
    if (!r.ok) throw new Error(T("GitHub antwortet mit {0}", [r.status]));
    const list = await r.json();
    const g = list.find((x) => x.files && x.files[GIST_FILE]);
    if (g) { setSync({ gistId: g.id }); return { id: g.id, created: false }; }
    if (list.length < 100) break;
  }
  const r = await gh("/gists", { method: "POST", body: JSON.stringify({ description: "PLM – Personal Language Management (Sync, bitte nicht löschen)", public: false, files: { [GIST_FILE]: { content: JSON.stringify(gistPayload()) } } }) });
  if (r.status === 404 || r.status === 403) throw new Error(T("Dem Token fehlt die Berechtigung „gist“ – neues Token mit Häkchen bei „gist“ anlegen"));
  if (!r.ok) throw new Error(T("Gist konnte nicht angelegt werden ({0})", [r.status]));
  const g = await r.json();
  setSync({ gistId: g.id });
  return { id: g.id, created: true };
}
async function syncNow(manual) {
  const s0 = syncCfg();
  if (!s0.token) return;
  if (syncing) { syncAgain = true; return; }
  if (navigator.onLine === false) { if (manual) toast(T("Offline – Sync folgt, sobald du online bist")); return; }
  syncing = true; clearTimeout(syncTimer); updateSyncLine();
  const before = state.cards.length;
  try {
    let s = syncCfg();
    if (!s.gistId) await findOrCreateGist();
    s = syncCfg();
    let r = await gh(`/gists/${s.gistId}`);
    if (r.status === 404) { setSync({ gistId: "" }); await findOrCreateGist(); s = syncCfg(); r = await gh(`/gists/${s.gistId}`); }
    if (!r.ok) throw new Error(T("GitHub antwortet mit {0}", [r.status]));
    const g = await r.json(), f = g.files && g.files[GIST_FILE];
    if (f) {
      let txt = f.content;
      if (f.truncated && f.raw_url) { const rr = await fetch(f.raw_url, { cache: "no-store" }); txt = await rr.text(); }
      let remote = null; try { remote = JSON.parse(txt); } catch { remote = null; }
      if (remote && remote.app === "plm") mergeData(remote);
    }
    saveNow();
    const p = await gh(`/gists/${s.gistId}`, { method: "PATCH", body: JSON.stringify({ files: { [GIST_FILE]: { content: JSON.stringify(gistPayload()) } } }) });
    if (!p.ok) throw new Error(T("Speichern fehlgeschlagen ({0})", [p.status]));
    setSync({ last: Date.now(), error: "" });
    if (manual) toast(state.cards.length !== before ? T("Synchronisiert · {0}{1} Karten", [state.cards.length - before > 0 ? "+" : "", state.cards.length - before]) : T("Synchronisiert"));
  } catch (e) {
    setSync({ error: (e && e.message) || "fehlgeschlagen" });
    if (manual) toast((e && e.message) || T("Sync fehlgeschlagen"));
  } finally {
    syncing = false;
    const a = document.activeElement, typing = a && /INPUT|TEXTAREA|SELECT/.test(a.tagName) && $("view").contains(a);
    if (!typing && !state.sel) render(); else updateSyncLine();
    if (syncAgain) { syncAgain = false; syncSoon(1500); }
  }
}
async function syncConnect(token) {
  token = String(token || "").trim();
  if (!/^(ghp_|github_pat_|gho_)[A-Za-z0-9_]{20,}$/.test(token)) { toast(T("Das sieht nicht wie ein GitHub-Token aus (beginnt mit ghp_ …)")); return; }
  toast(T("Verbinde mit GitHub …"));
  try {
    const r = await gh("/user", { token });
    if (!r.ok) throw new Error(T("GitHub antwortet mit {0}", [r.status]));
    const u = await r.json();
    const scopes = r.headers.get("x-oauth-scopes");
    if (scopes != null && !/\bgist\b/.test(scopes)) throw new Error(T("Dem Token fehlt die Berechtigung „gist“"));
    setSync({ token, login: u.login || "", gistId: "", last: 0, error: "" });
    const g = await findOrCreateGist();
    await syncNow(false);
    toast(g.created ? T("Verbunden – deine Karten liegen jetzt auch in GitHub") : T("Verbunden – Daten vom anderen Gerät übernommen"));
  } catch (e) {
    setSync({ token: "", error: "" });
    toast((e && e.message) || T("Verbindung fehlgeschlagen"));
  }
  render();
}
function syncDisconnect() { lsSet(KEYS.sync, "{}"); state.armed = null; render(); toast(T("Sync getrennt – die Daten im Gist bleiben erhalten")); }
addEventListener("online", () => syncSoon(1000));
document.addEventListener("visibilitychange", () => {
  if (!syncOn()) return;
  if (document.hidden) { if (syncTimer) syncNow(false); }
  else if (Date.now() - syncCfg().last > 60e3) syncSoon(400);
});
