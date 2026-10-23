const fs = require("fs"), vm = require("vm"), assert = require("assert");
const src = fs.readFileSync(__dirname + "/../src/core.js", "utf8");
const ctx = {}; vm.createContext(ctx); vm.runInContext(src + "\n;globalThis.X={srsOptions,srsCalc,fmtIvl,checkAnswer,answerVariants,itConj,enConj,parseCSV,parseCloze,dayNum,dayStart,dayKey,icsDaily,parseLayout,itArticle,langScores};", ctx);
const X = ctx.X;
let fails = 0; const t = (name, fn) => { try { fn(); console.log("ok  ", name); } catch (e) { fails++; console.log("FAIL", name, "\n   ", e.message); } };
const eq = (a, b) => assert.deepStrictEqual(JSON.parse(JSON.stringify(a)), b);

// --- SRS
const now = new Date(2026, 9, 22, 20, 0).getTime(), cfg = { now, roll: 4, ret: 0.9, max: 3650, seed: "x" };
t("new card intervals", () => { const o = X.srsOptions(null, cfg); console.log("     new:", o.map(X.fmtIvl).join(" | ")); assert(o[0].st === "lrn" && o[1].ivl >= 1 && o[2].ivl > o[1].ivl - 1 && o[3].ivl > o[2].ivl); });
t("fresh cap", () => { const o = X.srsOptions(null, { ...cfg, fresh: true }); console.log("     fresh:", o.map(X.fmtIvl).join(" | ")); assert(o[2].ivl === 1 && o[3].ivl <= 4); });
t("review growth", () => {
  let st = X.srsCalc(null, 3, cfg), n = now, seq = [];
  for (let i = 0; i < 6; i++) { n = st.due + 3600e3 * 10; st = X.srsCalc(st, 3, { ...cfg, now: n }); seq.push(st.ivl); }
  console.log("     good chain:", seq.join(","), "S=", st.s); assert(seq[5] > seq[0] * 5);
});
t("lapse", () => { let st = X.srsCalc(null, 3, cfg); st = X.srsCalc(st, 3, { ...cfg, now: st.due + 1e3 }); const s0 = st.s; const st2 = X.srsCalc(st, 1, { ...cfg, now: st.due + 1e3 }); assert(st2.s < s0 && st2.lapses === 1 && st2.st === "lrn"); const st3 = X.srsCalc(st2, 3, { ...cfg, now: st.due + 700e3 }); console.log("     after lapse+good same day:", st3.ivl, "d"); assert(st3.ivl >= 1); });
t("again then good same session", () => { const a = X.srsCalc(null, 1, cfg); const b = X.srsCalc(a, 3, { ...cfg, now: now + 120e3 }); console.log("     again→good:", b.ivl, "S", b.s); assert(b.ivl === 1); });
t("day rollover", () => { const late = new Date(2026, 9, 23, 2, 0).getTime(); assert.strictEqual(X.dayNum(late, 4), X.dayNum(now, 4)); assert.strictEqual(new Date(X.dayStart(X.dayNum(now, 4) + 1, 4)).getHours(), 4); assert.strictEqual(X.dayKey(X.dayNum(now, 4)), "2026-10-22"); });

// --- answers
const it = { articles: ["il","lo","la","l'","i","gli","le","un","uno","una","un'"] };
const c = (i, e, o) => X.checkAnswer(i, e, o);
t("exact", () => { eq(c("la casa", "la casa", it), { res: "exact", why: "" }); eq(c(" La Casa! ", "la casa", it).res, "exact"); });
t("accent", () => eq(c("perche", "perché", it), { res: "close", why: "accent" }));
t("article missing", () => eq(c("casa", "la casa", it), { res: "close", why: "article" }));
t("elided article", () => eq(c("acqua", "l'acqua", it).why, "article"));
t("apostrophe types", () => eq(c("l’acqua", "l'acqua", it).res, "exact"));
t("typo", () => eq(c("ristorrante", "il ristorante", it).res, "close"));
t("wrong", () => eq(c("cane", "la casa", it).res, "wrong"));
t("alternatives ;", () => { eq(c("fahren", "gehen; fahren", { native: true }).res, "exact"); eq(c("Bus", "der Bus", { native: true }).res, "exact"); });
t("native comma alt", () => eq(c("hoch", "groß, hoch", { native: true }).res, "exact"));
t("parens", () => { eq(c("cope with", "(to) cope with", {}).res, "exact"); eq(c("to cope with", "(to) cope with", {}).res, "exact"); eq(c("Glas", "das Glas (Trinkglas)", { native: true }).res, "exact"); });
t("gender expand", () => { eq(c("sono andata", "sono andato/a", it).res, "exact"); eq(c("sono andato/a", "sono andato/a", it).res, "exact"); eq(c("siamo andate", "siamo andati/e", it).res, "exact"); });
t("slash alternatives", () => { eq(c("was", "was / were", {}).res, "exact"); eq(c("gotten", "got / gotten", {}).res, "exact"); });
t("welche(r/s)", () => eq(c("welcher", "welche(r/s)?", { native: true }).res, "exact"));
t("short words no typo", () => eq(c("mi", "ma", it).res, "wrong"));
t("extra article ok", () => { eq(c("the balance sheet", "balance sheet", { articles: ["the","a","an","to"] }).res, "exact"); eq(c("casa", "la casa", it).why, "article"); });
t("cloze", () => eq(X.parseCloze("Vado {{a}} Roma {{domani}}."), { text: "Vado ___ Roma ___.", gaps: ["a", "domani"] }));

// --- Italian conjugation
const C = (v, o) => X.itConj(v, o);
t("parlare", () => { const r = C("parlare"); eq(r["Presente"], ["parlo","parli","parla","parliamo","parlate","parlano"]); eq(r["Passato prossimo"][0], "ho parlato"); eq(r["Futuro semplice"][0], "parlerò"); eq(r["Imperativo"], ["parla","parli","parliamo","parlate","parlino"]); eq(r["Passato remoto"][2], "parlò"); });
t("cercare", () => { const r = C("cercare"); eq(r["Presente"], ["cerco","cerchi","cerca","cerchiamo","cercate","cercano"]); eq(r["Futuro semplice"][0], "cercherò"); eq(r["Congiuntivo presente"], ["cerchi","cerchi","cerchi","cerchiamo","cerchiate","cerchino"]); eq(r["Condizionale presente"][1], "cercheresti"); });
t("pagare", () => eq(C("pagare")["Presente"][1], "paghi"));
t("mangiare", () => { const r = C("mangiare"); eq(r["Presente"], ["mangio","mangi","mangia","mangiamo","mangiate","mangiano"]); eq(r["Futuro semplice"][0], "mangerò"); eq(r["Imperfetto"][0], "mangiavo"); eq(r["Congiuntivo presente"][0], "mangi"); });
t("studiare", () => { const r = C("studiare"); eq(r["Presente"], ["studio","studi","studia","studiamo","studiate","studiano"]); eq(r["Futuro semplice"][0], "studierò"); eq(r["Imperativo"][4], "studino"); });
t("lasciare", () => eq(C("lasciare")["Futuro semplice"][0], "lascerò"));
t("credere", () => { const r = C("credere"); eq(r["Presente"], ["credo","credi","crede","crediamo","credete","credono"]); eq(r["Congiuntivo presente"][0], "creda"); eq(r["Passato prossimo"][3], "abbiamo creduto"); });
t("dormire", () => eq(C("dormire")["Presente"][5], "dormono"));
t("capire isc", () => { const r = C("capire", { isc: true }); eq(r["Presente"], ["capisco","capisci","capisce","capiamo","capite","capiscono"]); eq(r["Congiuntivo presente"][5], "capiscano"); eq(r["Imperativo"][0], "capisci"); });
t("arrivare essere", () => eq(C("arrivare", { aux: "essere" })["Passato prossimo"], ["sono arrivato/a","sei arrivato/a","è arrivato/a","siamo arrivati/e","siete arrivati/e","sono arrivati/e"]));
t("chiamarsi", () => { const r = C("chiamarsi"); eq(r["Presente"][0], "mi chiamo"); eq(r["Passato prossimo"][2], "si è chiamato/a"); eq(r["Imperativo"], ["chiamati","si chiami","chiamiamoci","chiamatevi","si chiamino"]); });
t("irregular with F derives C", () => { const r = C("andare", { irr: true, aux: "essere", P: "vado, vai, va, andiamo, andate, vanno", F: "andrò, andrai, andrà, andremo, andrete, andranno", CP: "vada, vada, vada, andiamo, andiate, vadano" }); eq(r["Condizionale presente"][0], "andrei"); assert(!r["Passato remoto"] && !r["Imperativo"]); eq(r["Passato prossimo"][0], "sono andato/a"); });
t("prendere pp", () => { const r = C("prendere", { pp: "preso" }); eq(r["Passato prossimo"][1], "hai preso"); assert(!r["Passato remoto"]); eq(r["Congiuntivo presente"][0], "prenda"); });

// --- English
t("en regular", () => { const r = X.enConj("work"); eq(r["Stammformen"], ["work","worked","worked"]); eq(r["Present simple"][2], "works"); eq(r["Present perfect"][2], "has worked"); });
t("en stop/study/go", () => { eq(X.enConj("stop")["Stammformen"][1], "stopped"); eq(X.enConj("study")["Stammformen"][1], "studied"); eq(X.enConj("go", { past: "went", pp: "gone" })["Present perfect"][0], "have gone"); eq(X.enConj("go", { past: "went", pp: "gone" })["Present simple"][2], "goes"); eq(X.enConj("make", { past: "made", pp: "made" })["Present progressive"][0], "am making"); eq(X.enConj("lie", { past: "lay", pp: "lain" })["Present progressive"][2], "is lying"); });
t("en be", () => { const r = X.enConj("be", { past: "was / were", pp: "been" }); eq(r["Past simple"][1], "were"); eq(r["Present perfect"][2], "has been"); eq(r["Present progressive"][0], "am being"); });

// --- CSV
t("csv tab", () => { const r = X.parseCSV("ciao\thallo\ngrazie\tdanke\n"); eq(r.rows, [["ciao","hallo"],["grazie","danke"]]); });
t("csv semicolon header", () => { const r = X.parseCSV("Deutsch;Italienisch\nHaus;la casa\nHund;il cane"); eq(r.rows.length, 3); eq(r.rows[1], ["Haus","la casa"]); });
t("dash list", () => { const r = X.parseCSV("la casa - das Haus\nil cane - der Hund"); eq(r.rows[0], ["la casa","das Haus"]); });
t("comma inside", () => { const r = X.parseCSV('"Sì, certo",ja klar\nbene,gut'); eq(r.rows[0], ["Sì, certo","ja klar"]); });
t("ics", () => { const s = X.icsDaily("19:30", "Vokabeln", "https://x.github.io/plm/", "2026-10-23"); assert(s.includes("DTSTART:20261023T193000") && s.includes("RRULE:FREQ=DAILY")); });

// --- layout recognition (photo / PDF)
const fx = (n) => JSON.parse(fs.readFileSync(__dirname + "/fixtures/" + n, "utf8"));
t("photo: 18 Italian–English pairs", () => {
  const r = X.parseLayout(fx("ocr-photo.json"), { target: "it" });
  assert.strictEqual(r.items.length, 18); assert.strictEqual(r.ml, "en");
  eq([r.items[0].tg, r.items[0].de], ["Non toccarlo.", "Don't touch it."]);
  eq([r.items[17].tg, r.items[17].de], ["Non aspettare.", "Don't wait."]);
});
t("photo 2x: low-confidence row is kept, all 18 pairs clean", () => {
  const f = fx("ocr-photo-2x.json"), r = X.parseLayout(f.lines, { target: "it", width: f.width });
  assert.strictEqual(r.items.length, 18, r.items.map((i) => i.tg).join(" | "));
  eq([r.items[5].tg, r.items[5].de], ["Non chiuderlo.", "Don't close it."]);
  eq(r.items[6].tg, "Non andare lì.");
});
t("picture noise is dropped", () => {
  const W = (t, x, c) => ({ text: t, x0: x, x1: x + 40, y0: 0, y1: 20, conf: c });
  const rows = [[W("i", 0, 60), W("h", 300, 40), W("SD,", 340, 30)], [W("po", 0, 70), W("Y", 300, 50)], [W("[li", 0, 80), W("ins", 300, 80)], [W("la", 0, 90), W("casa", 45, 90), W("das", 300, 90), W("Haus", 345, 90)], [W("il", 0, 90), W("cane", 45, 90), W("der", 300, 90), W("Hund", 345, 90)], [W("Lui", 0, 90), W("PA", 300, 60)], [W("la", 0, 90), W("sedia", 45, 90), W("der", 300, 90), W("Stuhl", 345, 90)], [W("il", 0, 90), W("libro", 45, 90), W("das", 300, 90), W("Buch", 345, 90)], [W("la", 0, 90), W("porta", 45, 90), W("die", 300, 90), W("Tür", 345, 90)]]
    .map((ws, i) => ({ words: ws.map((w) => ({ ...w, y0: i * 40, y1: i * 40 + 20 })) }));
  const r = X.parseLayout(rows, { target: "it", width: 600 });
  eq(r.items.map((i) => i.tg + "=" + i.de), ["la casa=das Haus", "il cane=der Hund", "la sedia=der Stuhl", "il libro=das Buch", "la porta=die Tür"]);
});
t("numbered exercises are no number words, OCR fixes, doubtful pairs", () => {
  const row = (i, cells) => ({ words: cells.flatMap(([t, x]) => t.split(" ").map((w, j) => ({ text: w, x0: x + j * 45, x1: x + j * 45 + 40, y0: i * 40, y1: i * 40 + 20, conf: 92 }))) });
  const r = X.parseLayout([row(0, [["1", 0], ["uno", 100]]), row(1, [["3", 0], ["Gioco", 100]]), row(2, [["Qual & il tuo numero?", 0], ["What is your number?", 400]]), row(3, [["lo sono italiano.", 0], ["I am Italian.", 400]]),
    row(4, [["Emily è inglese.", 0], ["and feminine nouns.", 400]]), row(5, [["la casa", 0], ["the house", 400]]), row(6, [["il cane", 0], ["the dog", 400]])], { target: "it", width: 800 });
  const by = (tg) => r.items.find((i) => i.tg === tg) || {};
  eq(by("uno").de, "1"); assert(!r.items.some((i) => /Gioco/.test(i.tg)), "Gioco");
  eq(by("Qual è il tuo numero?").de, "What is your number?"); eq(by("Io sono italiano.").de, "I am Italian.");
  eq(!!by("Emily è inglese.").doubt, true); eq(!!by("la casa").doubt, false);
});
t("glossary: columns, articles, headings", () => {
  const r = X.parseLayout(fx("ocr-glossary.json"), { target: "it" });
  const find = (tg) => r.items.find((i) => i.tg === tg) || {};
  eq([find("la sedia").de, find("la sedia").topic], ["chair", "In the classroom"]);
  eq([find("la signora").de, find("la signora").topic], ["Madam", "Nouns"]);
  eq(find("l'insegnante").de, "teacher");
  eq(find("il tavolo").de, "table");
  eq([find("essere").de, find("essere").topic], ["to be", "Verbs"]);
  eq(find("Come ti chiami?").de, "What's your name?");
  eq(find("uno").de, "1");
  assert(r.pairs >= 60, "pairs " + r.pairs);
});
t("dash lists both directions", () => {
  const lines = ["la casa - das Haus", "andare - gehen", "Wie heißt du? - Come ti chiami?"].map((s, i) => ({ words: s.split(" ").map((w, j) => ({ text: w, x0: j * 60, x1: j * 60 + 50, y0: i * 40, y1: i * 40 + 20 })) }));
  const r = X.parseLayout(lines, { target: "it" });
  eq(r.items.map((i) => [i.tg, i.de]), [["la casa", "das Haus"], ["andare", "gehen"], ["Come ti chiami?", "Wie heißt du?"]]);
});
t("single word list (picture cards)", () => {
  const lines = "LATTE PESCE PANE CARNE".split(" ").map((w, i) => ({ words: [{ text: w, x0: 100, x1: 100 + w.length * 20, y0: i * 50, y1: i * 50 + 30 }] }));
  eq(X.parseLayout(lines, { target: "it" }).items.map((i) => i.tg), ["latte", "pesce", "pane", "carne"]);
});
t("italian article from gender", () => { eq([X.itArticle("sedia", "f"), X.itArticle("tavolo", "m"), X.itArticle("zaino", "m"), X.itArticle("amico", "m"), X.itArticle("studente", "m")], ["la ", "il ", "lo ", "l'", "lo "]); });
console.log(fails ? `\n${fails} FAILED` : "\nall passed"); process.exit(fails ? 1 : 0);
