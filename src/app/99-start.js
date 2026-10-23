/* Runs last, after every file has defined its functions and constants */
/* ================= Start ================= */
translateStatic(document.body);
loadAll();
try { if (navigator.storage && navigator.storage.persist) navigator.storage.persist(); } catch { /* not supported */ }
buildSplash();
let deep = "", deepHandled = false;
try { deep = (location.hash || "").replace(/^#/, "").toLowerCase(); } catch { deep = ""; }
const DEEP_VIEWS = ["stats", "search", "settings"];
if (deep === "learn" || deep === "add" || DEEP_VIEWS.includes(deep)) { $("splash").hidden = true; splashDone = true; deepHandled = true; }
else if (openMode() !== "splash") { $("splash").hidden = true; splashDone = true; }
if (DEEP_VIEWS.includes(deep)) state.stack.push({ v: deep });
render();
if (deep === "learn") { if (!startLearn({})) render(); }
if (deep === "add") openCard(null);
if (splashDone && !deepHandled) afterSplash();
try { if (deep) history.replaceState(null, "", location.pathname + location.search); } catch { /* ignore */ }
updateBadge();
if (syncOn()) syncSoon(1200);
addEventListener("hashchange", () => {
  const h = (location.hash || "").replace(/^#/, "").toLowerCase();
  if (!h) return;
  if (!splashDone) hideSplash();
  if (h === "learn") startLearn({}); else if (h === "add") openCard(null); else if (DEEP_VIEWS.includes(h)) { if (state.study) closeStudy(); state.stack = [{ v: "hub" }]; go(h); }
  try { history.replaceState(null, "", location.pathname + location.search); } catch { /* ignore */ }
});
let lastDay = today();
document.addEventListener("visibilitychange", () => { if (!document.hidden && today() !== lastDay) { lastDay = today(); if (!state.study) render(); } });
/* test hook (only when plm.debug is set) */
try { if (localStorage.getItem("plm.debug")) window.__plm = { get state() { return state; }, render, mergeData, syncNow, saveNow }; } catch { /* ignore */ }
