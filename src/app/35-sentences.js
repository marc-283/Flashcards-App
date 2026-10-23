/* ================= Sentence building ================= */
const FUNCTION_WORDS = {
  it: "il lo la l' i gli le un uno una un' di d' a ad da in con su per tra fra e ed o ma che chi non è sono ho hai ha mi ti si ci vi ne del dello della dell' dei degli delle al allo alla all' ai agli alle dal dalla dai nel nella nei nelle sul sulla questo questa quello quella io tu lui lei noi voi loro mio mia miei mie tuo tua suo sua molto più anche come dove quando cosa perché sì no c' è",
  en: "the a an to of in on at for with and or but is are am was were be been i you he she it we they my your his her our their this that these those not do does did have has had will would can could me him us them so if what how where",
  es: "el la los las un una de del a al en con por para y o pero que no es son yo tú él ella mi tu su",
  fr: "le la les l' un une de du des à au aux en et ou mais que qui ne pas est sont je tu il elle mon ma ton ta son sa",
  pt: "o a os as um uma de do da em no na com por para e ou mas que não é são eu tu ele ela meu minha",
  nl: "de het een van in op met en of maar dat niet is zijn ik jij hij zij mijn je",
  sv: "en ett den det de av i på med och eller men att inte är jag du han hon min din"
};
const elide = (w) => w.replace(/^([a-zàèéìòù]{1,4}')(.+)$/i, "$1 $2").split(" ");
const bankWords = (s) => tokSplit(s).flatMap((w) => elide(normAns(w).replace(/[.,;:!?…]/g, ""))).filter(Boolean);
function sentenceBank(code, deck) {
  const seen = new Set(), out = [];
  const add = (c, tg, de) => {
    if (!tg || !de || /…|\.\.\.|\s[–-]\s|\s\/\s|\{\{/.test(tg)) return;
    const n = wordCount(tg); if (n < 2 || n > 14) return;
    const key = c.lang + "|" + bareAns(normAns(tg)); if (seen.has(key)) return;
    seen.add(key); out.push({ id: c.id, lang: c.lang, tg, de, deck: c.deck });
  };
  for (const c of state.cards) {
    if (c.susp || (code && c.lang !== code) || (deck != null && c.deck !== deck)) continue;
    if (c.type === "cloze") add(c, fillCloze(c.tg), c.de);
    else if (c.pos === "s" && !c.ml) add(c, c.tg, c.de);
    if (c.ex && c.exDe && !c.ml) add(c, c.ex, c.exDe);
  }
  return out;
}
function knownWords(code) {
  const s = new Set((FUNCTION_WORDS[code] || "").split(/\s+/).filter(Boolean));
  for (const c of state.cards) {
    if (c.lang !== code || !isLearned(c)) continue;
    for (const w of bankWords(c.type === "cloze" ? fillCloze(c.tg) : c.tg)) s.add(w);
    if (c.tables) for (const f of Object.values(c.tables).flat()) for (const w of bankWords(f)) s.add(w);
  }
  return s;
}
function coverage(sent, known) {
  const w = bankWords(sent.tg); if (!w.length) return 0;
  return w.filter((x) => known.has(x) || known.has(bareAns(x))).length / w.length;
}
function buildEntries(o) {
  const bank = sentenceBank(o.lang, o.deck);
  if (!bank.length) return [];
  const known = knownWords(o.lang);
  const scored = bank.map((s) => ({ s, cov: coverage(s, known) + Math.random() * 0.15 }));
  let pick = o.sel === "known" ? scored.filter((x) => x.cov >= 0.7) : scored;
  if (pick.length < (o.count || 10)) pick = scored;
  pick.sort((a, b) => b.cov - a.cov);
  if (o.sel !== "known") shuffle(pick);
  return pick.slice(0, o.count || 10).map(({ s }) => ({ id: s.id, k: "b", lang: s.lang, sent: { tg: s.tg, de: s.de } }));
}
function startBuild(o) {
  const q = buildEntries(o);
  if (!q.length) { toast("Noch keine Sätze – lade z. B. „Alltagssätze“ oder lerne Wörter mit Beispielsatz"); return; }
  state.study = newSession("build", o, q);
  openStudy();
}
function openBuild(code, deck) {
  const withSent = langs().filter((l) => sentenceBank(l.code).length);
  if (!code) {
    if (!withSent.length) { toast("Noch keine Sätze – lade z. B. „Alltagssätze“ oder lerne Wörter mit Beispielsatz"); return; }
    if (withSent.length > 1) { openForm({ title: "Sätze bauen", fields: [{ k: "lang", label: "Sprache", type: "select", opts: withSent.map((l) => [l.code, l.name]) }], saveLabel: "Weiter", onSave: (v) => setTimeout(() => openBuild(v.lang), 260) }); return; }
    code = withSent[0].code;
  }
  const L = langOf(code), n = sentenceBank(code, deck).length, learned = state.cards.some((c) => c.lang === code && isLearned(c));
  openForm({ title: "Sätze bauen", hint: `${L.name}${deck != null ? " · " + deck : ""}: Du siehst einen deutschen Satz und baust ihn auf ${L.name} – aus Wort-Bausteinen oder frei getippt. PLM korrigiert Wort für Wort.`, saveLabel: "Los geht's",
    fields: [
      { k: "style", label: "Art", type: "select", opts: [["tiles", "Bausteine antippen"], ["type", "Frei tippen"]], half: true },
      { k: "count", label: "Anzahl", type: "select", opts: [[5, "5 Sätze"], [10, "10 Sätze"], [20, "20 Sätze"]], half: true },
      { k: "sel", label: "Sätze", type: "select", opts: [["known", "Vor allem mit Wörtern, die ich schon kenne"], ["all", "Gemischt – auch neue Wörter erschließen"]] }
    ],
    values: { style: lsGet("plm.buildStyle") || "tiles", count: 10, sel: learned ? "known" : "all" },
    onSave: (v) => { lsSet("plm.buildStyle", v.style); startBuild({ lang: code, deck, style: v.style, count: Math.min(Number(v.count), n), sel: v.sel }); } });
}
