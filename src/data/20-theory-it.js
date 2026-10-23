/* ================= Theory: Italian grammar (A1–A2) =================
   Blocks: ["p", text] ["h", text] ["tip", text] ["table", {head, rows, say}] ["ex", [[it, de, en], …]] ["conj", {verbs, tenses}] ["quiz", id]
   text = TB(German, English); table cells are Italian strings or TB(…) */
const TB = (de, en) => ({ de, en });
const THEORY = { it: [], en: [] };
/* imperative of irregular verbs (tu, Lei, noi, voi, Loro) */
const IT_IMP_IRR = {
  essere: "sii, sia, siamo, siate, siano", avere: "abbi, abbia, abbiamo, abbiate, abbiano", andare: "va' / vai, vada, andiamo, andate, vadano",
  fare: "fa' / fai, faccia, facciamo, fate, facciano", stare: "sta' / stai, stia, stiamo, state, stiano", dare: "da' / dai, dia, diamo, date, diano",
  dire: "di', dica, diciamo, dite, dicano", venire: "vieni, venga, veniamo, venite, vengano", uscire: "esci, esca, usciamo, uscite, escano",
  bere: "bevi, beva, beviamo, bevete, bevano", rimanere: "rimani, rimanga, rimaniamo, rimanete, rimangano", tenere: "tieni, tenga, teniamo, tenete, tengano",
  sapere: "sappi, sappia, sappiamo, sappiate, sappiano", scegliere: "scegli, scelga, scegliamo, scegliete, scelgano", sedersi: "siediti, si sieda, sediamoci, sedetevi, si siedano"
};
const IT_REG_VERBS = ["parlare", "abitare", "lavorare", "studiare", "mangiare", "cercare", "pagare", "comprare", "ascoltare", "aspettare", "prendere", "leggere", "scrivere", "vedere", "vivere", "credere", "dormire", "partire", "sentire", "aprire", "capire", "finire", "preferire", "pulire"];
const IT_ISC = new Set(["capire", "finire", "preferire", "pulire", "spedire", "costruire"]);

THEORY.it.push(
{ id: "pron", sec: "words", title: TB("Aussprache", "Pronunciation"), sub: TB("c, g, sc, gn, gli – und die Betonung", "c, g, sc, gn, gli – and word stress"), blocks: [
  ["p", TB("Italienisch spricht man fast so, wie man es schreibt. Ein paar Buchstabenkombinationen klingen aber anders als im Deutschen.", "Italian is pronounced almost exactly as it is written. A few letter combinations sound different from English, though.")],
  ["table", { head: [TB("Schreibung", "Spelling"), TB("Klang", "Sound"), TB("Beispiele", "Examples")], say: 2, rows: [
    ["c + a, o, u", TB("k", "k"), "casa, cosa, cucina"],
    ["c + e, i", TB("tsch", "ch as in “chair”"), "cena, ciao, città"],
    ["ch + e, i", TB("k", "k"), "che, chiave, perché"],
    ["g + a, o, u", TB("g", "g as in “go”"), "gatto, gonna, gusto"],
    ["g + e, i", TB("dsch", "j as in “jam”"), "gelato, giorno, gita"],
    ["gh + e, i", TB("g", "g as in “go”"), "spaghetti, ghiaccio"],
    ["sc + e, i", TB("sch", "sh"), "pesce, sci, sciarpa"],
    ["sch + e, i", TB("sk", "sk"), "schema, schiena"],
    ["gn", TB("nj wie in „Cognac“", "ny as in “canyon”"), "gnocchi, bagno, signora"],
    ["gli", TB("weiches lj", "lli as in “million”"), "famiglia, figlio, luglio"],
    ["h", TB("stumm", "silent"), "ho, hai, hotel"],
    ["z", TB("ts oder ds", "ts or dz"), "pizza, zero, zaino"],
    ["qu", TB("kw", "kw"), "quando, quattro"]] }],
  ["h", TB("Doppelte Konsonanten", "Double consonants")],
  ["p", TB("Doppelte Konsonanten werden deutlich länger gesprochen – das kann die Bedeutung ändern.", "Double consonants are held noticeably longer – this can change the meaning.")],
  ["ex", [["nono – nonno", "neunter – Großvater", "ninth – grandfather"], ["pala – palla", "Schaufel – Ball", "shovel – ball"], ["caro – carro", "lieb, teuer – Karren", "dear, expensive – cart"], ["sete – sette", "Durst – sieben", "thirst – seven"]]],
  ["h", TB("Betonung", "Stress")],
  ["p", TB("Meist liegt die Betonung auf der vorletzten Silbe: a<b>mi</b>co, ita<b>lia</b>no, ra<b>gaz</b>za. Ein Akzent zeigt eine betonte letzte Silbe: città, perché, caffè, così, però.", "Stress usually falls on the second-to-last syllable: a<b>mi</b>co, ita<b>lia</b>no, ra<b>gaz</b>za. A written accent marks a stressed last syllable: città, perché, caffè, così, però.")],
  ["tip", TB("Der Akzent kann die Bedeutung ändern: è (ist) – e (und), là (dort) – la (die), sì (ja) – si (sich), dà (gibt) – da (von).", "The accent can change the meaning: è (is) – e (and), là (there) – la (the), sì (yes) – si (oneself), dà (gives) – da (from).")]
]},
{ id: "art", sec: "words", title: TB("Artikel: il, lo, la, un, uno, una …", "Articles: il, lo, la, un, uno, una …"), sub: TB("Welcher Artikel wann – bestimmt und unbestimmt", "Which article when – definite and indefinite"), blocks: [
  ["p", TB("Jedes Nomen ist männlich oder weiblich. Welcher Artikel davor steht, hängt vom Geschlecht, von der Zahl – und vom <b>Anfangsbuchstaben</b> des nächsten Wortes ab.", "Every noun is masculine or feminine. Which article goes before it depends on gender, number – and on the <b>first letter</b> of the next word.")],
  ["h", TB("Bestimmter Artikel (der, die, das)", "Definite article (the)")],
  ["table", { head: [TB("Wann?", "When?"), TB("Singular", "Singular"), TB("Plural", "Plural"), TB("Beispiel", "Example")], say: 3, rows: [
    [TB("männlich, vor Konsonant", "masculine, before a consonant"), "il", "i", "il libro → i libri"],
    [TB("männlich, vor s + Konsonant, z, gn, ps, x, y", "masculine, before s + consonant, z, gn, ps, x, y"), "lo", "gli", "lo studente → gli studenti"],
    [TB("männlich, vor Vokal", "masculine, before a vowel"), "l'", "gli", "l'amico → gli amici"],
    [TB("weiblich, vor Konsonant", "feminine, before a consonant"), "la", "le", "la casa → le case"],
    [TB("weiblich, vor Vokal", "feminine, before a vowel"), "l'", "le", "l'amica → le amiche"]] }],
  ["ex", [["il ragazzo – i ragazzi", "der Junge – die Jungen", "the boy – the boys"], ["lo zaino – gli zaini", "der Rucksack – die Rucksäcke", "the backpack – the backpacks"], ["lo sport – gli sport", "der Sport – die Sportarten", "the sport – the sports"], ["l'albero – gli alberi", "der Baum – die Bäume", "the tree – the trees"], ["la donna – le donne", "die Frau – die Frauen", "the woman – the women"], ["l'università – le università", "die Universität – die Universitäten", "the university – the universities"]]],
  ["tip", TB("Merkregel: <b>lo</b> und <b>gli</b> stehen vor s + Konsonant (lo stadio, gli studenti) und vor z (lo zio, lo zucchero). Vor einem Vokal wird lo/la zu <b>l'</b>.", "Rule of thumb: <b>lo</b> and <b>gli</b> go before s + consonant (lo stadio, gli studenti) and before z (lo zio, lo zucchero). Before a vowel, lo/la become <b>l'</b>.")],
  ["quiz", "it-art-def"],
  ["h", TB("Unbestimmter Artikel (ein, eine)", "Indefinite article (a, an)")],
  ["table", { head: [TB("Wann?", "When?"), TB("Artikel", "Article"), TB("Beispiel", "Example")], say: 2, rows: [
    [TB("männlich, vor Konsonant oder Vokal", "masculine, before a consonant or vowel"), "un", "un libro, un amico"],
    [TB("männlich, vor s + Konsonant, z, gn, ps", "masculine, before s + consonant, z, gn, ps"), "uno", "uno studente, uno zaino"],
    [TB("weiblich, vor Konsonant", "feminine, before a consonant"), "una", "una casa, una studentessa"],
    [TB("weiblich, vor Vokal", "feminine, before a vowel"), "un'", "un'amica, un'idea"]] }],
  ["tip", TB("Apostroph nur bei weiblichen Wörtern: <b>un amico</b> (ein Freund), aber <b>un'amica</b> (eine Freundin).", "Apostrophe only with feminine words: <b>un amico</b> (a male friend), but <b>un'amica</b> (a female friend).")],
  ["p", TB("Im Plural gibt es keinen unbestimmten Artikel. Für „einige“ nimmt man <b>dei, degli, delle</b>: dei libri, degli amici, delle case.", "There is no indefinite article in the plural. For “some” you use <b>dei, degli, delle</b>: dei libri, degli amici, delle case.")],
  ["quiz", "it-art-indef"],
  ["h", TB("Wann steht überhaupt ein Artikel?", "When do you use an article at all?")],
  ["p", TB("Öfter als im Deutschen: bei Ländern (<i>l'Italia è bella</i>), bei Possessiva (<i>la mia casa</i>), bei Uhrzeiten (<i>alle otto</i>) und bei Wochentagen für Gewohnheiten (<i>il sabato vado in palestra</i> = samstags). Ohne Artikel: Städte (<i>Roma</i>) und Familienmitglieder mit Possessiv im Singular (<i>mia madre</i>).", "More often than in English: with countries (<i>l'Italia è bella</i>), with possessives (<i>la mia casa</i>), with times (<i>alle otto</i>) and with weekdays for habits (<i>il sabato vado in palestra</i> = on Saturdays). No article with cities (<i>Roma</i>) and with family members after a possessive in the singular (<i>mia madre</i>).")],
  ["quiz", "it-art-mix"]
]},
{ id: "nouns", sec: "words", title: TB("Nomen: Geschlecht & Plural", "Nouns: gender & plural"), sub: TB("-o, -a, -e und die Ausnahmen", "-o, -a, -e and the exceptions"), blocks: [
  ["p", TB("Am Wortende erkennt man meist das Geschlecht – und wie der Plural gebildet wird.", "The ending usually tells you the gender – and how the plural is formed.")],
  ["table", { head: [TB("Singular", "Singular"), TB("Plural", "Plural"), TB("Beispiel", "Example")], say: 2, rows: [
    [TB("-o (männlich)", "-o (masculine)"), "-i", "il libro → i libri"],
    [TB("-a (weiblich)", "-a (feminine)"), "-e", "la casa → le case"],
    [TB("-e (m. oder w.)", "-e (m. or f.)"), "-i", "il fiore → i fiori, la chiave → le chiavi"],
    ["-ca / -ga", "-che / -ghe", "l'amica → le amiche, la riga → le righe"],
    ["-co / -go", TB("-chi / -ghi (manchmal -ci / -gi)", "-chi / -ghi (sometimes -ci / -gi)"), "il gioco → i giochi, l'amico → gli amici"],
    ["-io", "-i", "il negozio → i negozi"],
    [TB("Akzent am Ende, Fremdwort, Kurzwort", "accent at the end, foreign word, short form"), TB("bleibt gleich", "stays the same"), "la città → le città, il bar → i bar, la foto → le foto"]] }],
  ["h", TB("Ausnahmen, die man oft braucht", "Common exceptions")],
  ["ex", [["il problema → i problemi", "das Problem → die Probleme", "the problem → the problems"], ["la mano → le mani", "die Hand → die Hände", "the hand → the hands"], ["l'uomo → gli uomini", "der Mann → die Männer", "the man → the men"], ["l'uovo → le uova", "das Ei → die Eier", "the egg → the eggs"], ["il braccio → le braccia", "der Arm → die Arme", "the arm → the arms"]]],
  ["tip", TB("Bei Wörtern auf -e das Geschlecht mitlernen: il fiore, il pane, il mare – aber la chiave, la notte, la lezione. Wörter auf <b>-zione</b> sind weiblich, auf <b>-ore</b> männlich. Wörter auf -ma aus dem Griechischen sind männlich: il problema, il sistema, il programma.", "Learn the gender of words ending in -e: il fiore, il pane, il mare – but la chiave, la notte, la lezione. Words ending in <b>-zione</b> are feminine, those in <b>-ore</b> masculine. Greek words in -ma are masculine: il problema, il sistema, il programma.")],
  ["quiz", "it-plural"]
]},
{ id: "adj", sec: "words", title: TB("Adjektive", "Adjectives"), sub: TB("italiano, italiana, italiani, italiane", "italiano, italiana, italiani, italiane"), blocks: [
  ["p", TB("Adjektive passen sich in Geschlecht und Zahl an das Nomen an und stehen meist <b>dahinter</b>: una macchina rossa, un film interessante.", "Adjectives agree with the noun in gender and number and usually come <b>after</b> it: una macchina rossa, un film interessante.")],
  ["table", { head: [TB("Typ", "Type"), TB("m. Sg.", "m. sg."), TB("w. Sg.", "f. sg."), TB("m. Pl.", "m. pl."), TB("w. Pl.", "f. pl.")], rows: [
    ["-o", "italiano", "italiana", "italiani", "italiane"],
    ["-e", "inglese", "inglese", "inglesi", "inglesi"]] }],
  ["ex", [["un ragazzo alto, una ragazza alta", "ein großer Junge, ein großes Mädchen", "a tall boy, a tall girl"], ["dei libri nuovi, delle case nuove", "neue Bücher, neue Häuser", "new books, new houses"], ["un esercizio difficile, una lingua difficile", "eine schwierige Übung, eine schwierige Sprache", "a difficult exercise, a difficult language"], ["Marco è stanco. Giulia è stanca.", "Marco ist müde. Giulia ist müde.", "Marco is tired. Giulia is tired."], ["Marco e Giulia sono italiani.", "Marco und Giulia sind Italiener.", "Marco and Giulia are Italian."]]],
  ["tip", TB("Gemischte Gruppe → männliche Form: Marco e Giulia sono italian<b>i</b>.", "Mixed group → masculine form: Marco e Giulia sono italian<b>i</b>.")],
  ["p", TB("Ein paar häufige Adjektive stehen oft <b>vor</b> dem Nomen: bello, buono, grande, piccolo, nuovo, vecchio – una bella giornata, un buon caffè, una piccola casa.", "A few common adjectives often come <b>before</b> the noun: bello, buono, grande, piccolo, nuovo, vecchio – una bella giornata, un buon caffè, una piccola casa.")],
  ["tip", TB("<b>molto</b> als „sehr“ bleibt gleich (molto bello, molto belle), als „viel“ passt es sich an (molti amici, molte persone).", "<b>molto</b> meaning “very” never changes (molto bello, molto belle); meaning “much/many” it agrees (molti amici, molte persone).")]
]},
{ id: "pronouns", sec: "words", title: TB("Pronomen & Anrede", "Pronouns & formal address"), sub: TB("io, tu, Lei … und mi, ti, lo, gli", "io, tu, Lei … and mi, ti, lo, gli"), blocks: [
  ["table", { head: [TB("Person", "Person"), TB("Italienisch", "Italian"), TB("Bedeutung", "Meaning")], say: 1, rows: [
    ["1. Sg.", "io", TB("ich", "I")], ["2. Sg.", "tu", TB("du", "you")], ["3. Sg.", "lui / lei", TB("er / sie", "he / she")], [TB("höflich", "formal"), "Lei", TB("Sie", "you (formal)")],
    ["1. Pl.", "noi", TB("wir", "we")], ["2. Pl.", "voi", TB("ihr", "you (plural)")], ["3. Pl.", "loro", TB("sie", "they")]] }],
  ["p", TB("Das Subjektpronomen fällt meist weg – die Verbendung zeigt schon die Person: <i>Parlo italiano.</i> Man setzt es nur zur Betonung: <i>Io sono di Roma, e tu?</i>", "The subject pronoun is usually left out – the verb ending already shows the person: <i>Parlo italiano.</i> You only use it for emphasis: <i>Io sono di Roma, e tu?</i>")],
  ["h", TB("Siezen mit Lei", "Formal “you” with Lei")],
  ["p", TB("Die Höflichkeitsform ist <b>Lei</b> mit dem Verb in der 3. Person Singular – egal ob man einen Mann oder eine Frau anspricht.", "The formal form is <b>Lei</b> with the verb in the 3rd person singular – whether you talk to a man or a woman.")],
  ["ex", [["Come stai? – Come sta?", "Wie geht's dir? – Wie geht es Ihnen?", "How are you? (informal – formal)"], ["Di dove sei? – Di dov'è?", "Woher kommst du? – Woher kommen Sie?", "Where are you from? (informal – formal)"], ["Scusa! – Scusi!", "Entschuldige! – Entschuldigen Sie!", "Sorry! (informal – formal)"]]],
  ["h", TB("Objektpronomen (A2)", "Object pronouns (A2)")],
  ["table", { head: [TB("Person", "Person"), TB("direkt (mich, dich …)", "direct (me, you …)"), TB("indirekt (mir, dir …)", "indirect (to me, to you …)")], rows: [
    ["io", "mi", "mi"], ["tu", "ti", "ti"], ["lui", "lo", "gli"], ["lei / Lei", "la / La", "le / Le"], ["noi", "ci", "ci"], ["voi", "vi", "vi"], ["loro", "li / le", "gli"]] }],
  ["ex", [["Ti chiamo domani.", "Ich rufe dich morgen an.", "I'll call you tomorrow."], ["Lo conosci?", "Kennst du ihn?", "Do you know him?"], ["Le scrivo un messaggio.", "Ich schreibe ihr eine Nachricht.", "I'm writing her a message."], ["Gli piace il calcio.", "Ihm gefällt Fußball.", "He likes football."]]],
  ["tip", TB("Das Pronomen steht vor dem konjugierten Verb. Beim Infinitiv und beim Imperativ (du, wir, ihr) wird es angehängt: <i>Voglio vederti. Dimmi!</i>", "The pronoun comes before the conjugated verb. With the infinitive and the imperative (tu, noi, voi) it is attached: <i>Voglio vederti. Dimmi!</i>")]
]},
{ id: "poss", sec: "words", title: TB("Possessiv: il mio, la mia …", "Possessives: il mio, la mia …"), sub: TB("mein, dein, sein – mit Artikel", "my, your, his – with the article"), blocks: [
  ["table", { head: [TB("Besitzer", "Owner"), TB("m. Sg.", "m. sg."), TB("w. Sg.", "f. sg."), TB("m. Pl.", "m. pl."), TB("w. Pl.", "f. pl.")], rows: [
    ["io", "il mio", "la mia", "i miei", "le mie"], ["tu", "il tuo", "la tua", "i tuoi", "le tue"], ["lui / lei / Lei", "il suo", "la sua", "i suoi", "le sue"],
    ["noi", "il nostro", "la nostra", "i nostri", "le nostre"], ["voi", "il vostro", "la vostra", "i vostri", "le vostre"], ["loro", "il loro", "la loro", "i loro", "le loro"]] }],
  ["p", TB("Das Possessiv richtet sich nach dem <b>Besitz</b>, nicht nach dem Besitzer: <i>Marco e la sua macchina</i> (Marco und sein Auto), <i>Giulia e il suo libro</i> (Giulia und ihr Buch).", "The possessive agrees with the <b>thing owned</b>, not with the owner: <i>Marco e la sua macchina</i> (Marco and his car), <i>Giulia e il suo libro</i> (Giulia and her book).")],
  ["tip", TB("Familienmitglieder im Singular stehen ohne Artikel: <i>mia madre, tuo fratello</i>. Mit Artikel: im Plural (<i>i miei genitori</i>), bei Koseformen (<i>la mia mamma</i>) und immer bei <i>loro</i> (<i>il loro padre</i>).", "Family members in the singular take no article: <i>mia madre, tuo fratello</i>. With article: in the plural (<i>i miei genitori</i>), with pet names (<i>la mia mamma</i>) and always with <i>loro</i> (<i>il loro padre</i>).")],
  ["ex", [["Questa è la mia casa.", "Das ist mein Haus.", "This is my house."], ["Mia sorella vive a Milano.", "Meine Schwester lebt in Mailand.", "My sister lives in Milan."], ["I miei amici sono simpatici.", "Meine Freunde sind nett.", "My friends are nice."], ["Qual è il Suo nome?", "Wie ist Ihr Name?", "What is your name? (formal)"]]]
]},
{ id: "prep", sec: "words", title: TB("Präpositionen", "Prepositions"), sub: TB("a, in, da, di … und del, al, nel", "a, in, da, di … and del, al, nel"), blocks: [
  ["table", { head: [TB("Präposition", "Preposition"), TB("Gebrauch", "Use"), TB("Beispiel", "Example")], say: 2, rows: [
    ["a", TB("Städte; Richtung; Uhrzeit", "cities; direction; time"), "Vivo a Roma. Vado a casa. Alle otto."],
    ["in", TB("Länder, Regionen; Verkehrsmittel; Räume", "countries, regions; transport; rooms"), "in Italia, in treno, in cucina"],
    ["da", TB("von, seit; bei / zu Personen", "from, since; at / to someone's place"), "da Milano, da due anni, dal medico"],
    ["di", TB("von, aus (Herkunft); Besitz", "of, from (origin); possession"), "Sono di Napoli. Il libro di Marco."],
    ["su", TB("auf, über", "on, about"), "sul tavolo, un libro sulla storia"],
    ["con", TB("mit", "with"), "con gli amici"],
    ["per", TB("für; nach (Ziel); Dauer", "for; to (destination); duration"), "per te, il treno per Roma, per due ore"],
    ["tra / fra", TB("zwischen; in (Zeit)", "between; in (time)"), "tra un'ora"]] }],
  ["h", TB("Präposition + Artikel verschmelzen", "Preposition + article merge")],
  ["p", TB("di, a, da, in und su verbinden sich mit dem bestimmten Artikel zu einem Wort. Die Regeln für il/lo/l'/la gelten weiter.", "di, a, da, in and su merge with the definite article into one word. The il/lo/l'/la rules still apply.")],
  ["table", { head: ["", "il", "lo", "l'", "la", "i", "gli", "le"], rows: [
    ["di", "del", "dello", "dell'", "della", "dei", "degli", "delle"], ["a", "al", "allo", "all'", "alla", "ai", "agli", "alle"], ["da", "dal", "dallo", "dall'", "dalla", "dai", "dagli", "dalle"],
    ["in", "nel", "nello", "nell'", "nella", "nei", "negli", "nelle"], ["su", "sul", "sullo", "sull'", "sulla", "sui", "sugli", "sulle"]] }],
  ["ex", [["Vado al bar.", "Ich gehe in die Bar.", "I'm going to the bar."], ["Torno dall'ufficio alle sei.", "Ich komme um sechs aus dem Büro zurück.", "I get back from the office at six."], ["Il libro è sul tavolo.", "Das Buch liegt auf dem Tisch.", "The book is on the table."], ["Vivo nel centro della città.", "Ich wohne im Stadtzentrum.", "I live in the city centre."], ["Vado dal medico.", "Ich gehe zum Arzt.", "I'm going to the doctor's."]]],
  ["tip", TB("con und per verschmelzen meist nicht: <i>con il treno, per la mamma</i>. Bei Verkehrsmitteln ohne Artikel: <i>in treno, in macchina</i> – aber <i>a piedi</i> (zu Fuß).", "con and per usually don't merge: <i>con il treno, per la mamma</i>. Transport takes no article: <i>in treno, in macchina</i> – but <i>a piedi</i> (on foot).")],
  ["quiz", "it-prep"]
]},
{ id: "questions", sec: "words", title: TB("Fragewörter", "Question words"), sub: TB("chi, che cosa, dove, quando, come …", "chi, che cosa, dove, quando, come …"), blocks: [
  ["table", { head: [TB("Italienisch", "Italian"), TB("Bedeutung", "Meaning")], say: 0, rows: [
    ["chi?", TB("wer? wen?", "who?")], ["che cosa? / cosa?", TB("was?", "what?")], ["dove?", TB("wo? wohin?", "where?")], ["di dove?", TB("woher?", "where from?")],
    ["quando?", TB("wann?", "when?")], ["come?", TB("wie?", "how?")], ["perché?", TB("warum?", "why?")], ["quanto / quanta / quanti / quante?", TB("wie viel? wie viele?", "how much? how many?")],
    ["quale / quali?", TB("welche(r, s)?", "which?")], ["a che ora?", TB("um wie viel Uhr?", "at what time?")]] }],
  ["ex", [["Chi è?", "Wer ist das?", "Who is it?"], ["Che cosa fai stasera?", "Was machst du heute Abend?", "What are you doing tonight?"], ["Dove abiti?", "Wo wohnst du?", "Where do you live?"], ["Quanto costa?", "Wie viel kostet das?", "How much is it?"], ["Quanti anni hai?", "Wie alt bist du?", "How old are you?"], ["Qual è il tuo numero?", "Was ist deine Nummer?", "What's your number?"]]],
  ["tip", TB("<b>perché</b> heißt „warum“ und „weil“: <i>Perché studi l'italiano? – Perché mi piace.</i> Und: <b>Qual è</b> schreibt man ohne Apostroph.", "<b>perché</b> means both “why” and “because”: <i>Perché studi l'italiano? – Perché mi piace.</i> And: <b>Qual è</b> is written without an apostrophe.")]
]},
{ id: "presente", sec: "verbs", title: TB("Präsens: regelmäßige Verben", "Present tense: regular verbs"), sub: TB("-are, -ere, -ire und -isc-", "-are, -ere, -ire and -isc-"), blocks: [
  ["p", TB("Der Infinitiv endet auf <b>-are, -ere</b> oder <b>-ire</b>. Man streicht die Endung und hängt die Personalendung an.", "The infinitive ends in <b>-are, -ere</b> or <b>-ire</b>. Drop the ending and add the personal ending.")],
  ["table", { head: [TB("Person", "Person"), "parlare", "prendere", "dormire", "capire"], rows: [
    ["io", "parlo", "prendo", "dormo", "capisco"], ["tu", "parli", "prendi", "dormi", "capisci"], ["lui / lei", "parla", "prende", "dorme", "capisce"],
    ["noi", "parliamo", "prendiamo", "dormiamo", "capiamo"], ["voi", "parlate", "prendete", "dormite", "capite"], ["loro", "parlano", "prendono", "dormono", "capiscono"]] }],
  ["tip", TB("Einige -ire-Verben schieben bei io, tu, lui/lei und loro ein <b>-isc-</b> ein: capire, finire, preferire, pulire, spedire.", "Some -ire verbs insert <b>-isc-</b> for io, tu, lui/lei and loro: capire, finire, preferire, pulire, spedire.")],
  ["h", TB("Schreibregeln", "Spelling rules")],
  ["ex", [["cercare: cerco, cerchi, cerca, cerchiamo", "suchen – das h hält den k-Laut", "to look for – the h keeps the k sound"], ["pagare: pago, paghi, paga, paghiamo", "bezahlen – das h hält den g-Laut", "to pay – the h keeps the hard g"], ["mangiare: mangio, mangi, mangia, mangiamo", "essen – nur ein i", "to eat – only one i"], ["studiare: studio, studi, studia, studiamo", "lernen, studieren – nur ein i", "to study – only one i"]]],
  ["h", TB("Wann?", "When?")],
  ["p", TB("Für die Gegenwart, für Gewohnheiten und oft auch für die nahe Zukunft: <i>Domani parto per Roma.</i>", "For the present, for habits and often for the near future: <i>Domani parto per Roma.</i>")],
  ["quiz", "it-presente-reg"]
]},
{ id: "irregolari", sec: "verbs", title: TB("Präsens: unregelmäßige Verben", "Present tense: irregular verbs"), sub: TB("essere, avere, andare, fare und Co.", "essere, avere, andare, fare and co."), blocks: [
  ["p", TB("Die wichtigsten Verben sind unregelmäßig – sie lohnen sich zuerst. Tippe auf 🔊, um eine Reihe anzuhören.", "The most important verbs are irregular – learn them first. Tap 🔊 to hear a row.")],
  ["conj", { verbs: ["essere", "avere", "andare", "fare", "stare", "venire", "potere", "volere", "dovere", "sapere", "dire", "uscire", "dare", "bere"], tenses: ["Presente"] }],
  ["tip", TB("<b>essere</b> = sein (Eigenschaft, Herkunft, Beruf): <i>Sono stanco. Sono di Monaco.</i> <b>stare</b> = sich befinden, (sich) fühlen: <i>Come stai? – Sto bene.</i>", "<b>essere</b> = to be (quality, origin, job): <i>Sono stanco. Sono di Monaco.</i> <b>stare</b> = to be, to feel, to stay: <i>Come stai? – Sto bene.</i>")],
  ["tip", TB("Modalverben + Infinitiv: <i>Posso entrare? Voglio dormire. Devo lavorare.</i> Höflicher als voglio ist <b>vorrei</b> (ich hätte gern).", "Modal verbs + infinitive: <i>Posso entrare? Voglio dormire. Devo lavorare.</i> More polite than voglio is <b>vorrei</b> (I'd like).")],
  ["quiz", "it-presente-irr"]
]},
{ id: "pp", sec: "verbs", title: TB("Passato prossimo", "Passato prossimo"), sub: TB("Perfekt: ho mangiato, sono andato", "Perfect tense: ho mangiato, sono andato"), blocks: [
  ["p", TB("Die wichtigste Vergangenheit für <b>abgeschlossene</b> Handlungen: Hilfsverb <b>avere</b> oder <b>essere</b> im Präsens + Partizip.", "The main past tense for <b>completed</b> actions: auxiliary <b>avere</b> or <b>essere</b> in the present + past participle.")],
  ["table", { head: [TB("Infinitiv", "Infinitive"), TB("Partizip", "Participle"), TB("Beispiel", "Example")], say: 2, rows: [
    ["-are", "-ato", "parlare → ho parlato"], ["-ere", "-uto", "avere → ho avuto"], ["-ire", "-ito", "dormire → ho dormito"]] }],
  ["conj", { verbs: ["parlare", "andare"], tenses: ["Passato prossimo"] }],
  ["h", TB("avere oder essere?", "avere or essere?")],
  ["p", TB("Die meisten Verben bilden das Passato prossimo mit <b>avere</b>. Mit <b>essere</b>: Verben der Bewegung von A nach B und der Veränderung – andare, venire, arrivare, partire, uscire, entrare, tornare, restare, rimanere, stare, essere, nascere, morire, diventare, succedere, piacere – und alle <b>reflexiven</b> Verben.", "Most verbs form the passato prossimo with <b>avere</b>. With <b>essere</b>: verbs of moving from A to B and of change – andare, venire, arrivare, partire, uscire, entrare, tornare, restare, rimanere, stare, essere, nascere, morire, diventare, succedere, piacere – and all <b>reflexive</b> verbs.")],
  ["p", TB("Mit essere passt sich das Partizip an wie ein Adjektiv: <i>Marco è andato – Giulia è andata – siamo andati / andate.</i>", "With essere the participle agrees like an adjective: <i>Marco è andato – Giulia è andata – siamo andati / andate.</i>")],
  ["quiz", "it-aux"],
  ["h", TB("Unregelmäßige Partizipien", "Irregular participles")],
  ["table", { head: [TB("Infinitiv", "Infinitive"), TB("Partizip", "Participle"), TB("Bedeutung", "Meaning")], say: 1, rows: [
    ["fare", "fatto", TB("machen", "to do, make")], ["dire", "detto", TB("sagen", "to say")], ["essere / stare", "stato", TB("sein / bleiben", "to be / stay")], ["prendere", "preso", TB("nehmen", "to take")],
    ["mettere", "messo", TB("legen, stellen", "to put")], ["vedere", "visto", TB("sehen", "to see")], ["leggere", "letto", TB("lesen", "to read")], ["scrivere", "scritto", TB("schreiben", "to write")],
    ["aprire", "aperto", TB("öffnen", "to open")], ["chiudere", "chiuso", TB("schließen", "to close")], ["venire", "venuto", TB("kommen", "to come")], ["rimanere", "rimasto", TB("bleiben", "to stay")],
    ["bere", "bevuto", TB("trinken", "to drink")], ["chiedere", "chiesto", TB("fragen", "to ask")], ["rispondere", "risposto", TB("antworten", "to answer")], ["scegliere", "scelto", TB("wählen", "to choose")],
    ["vivere", "vissuto", TB("leben", "to live")], ["nascere", "nato", TB("geboren werden", "to be born")], ["morire", "morto", TB("sterben", "to die")], ["perdere", "perso", TB("verlieren", "to lose")],
    ["correre", "corso", TB("laufen", "to run")], ["spendere", "speso", TB("ausgeben", "to spend")], ["vincere", "vinto", TB("gewinnen", "to win")]] }],
  ["ex", [["Ieri ho lavorato fino alle sette.", "Gestern habe ich bis sieben gearbeitet.", "Yesterday I worked until seven."], ["Sabato siamo andati al mare.", "Am Samstag sind wir ans Meer gefahren.", "On Saturday we went to the seaside."], ["Giulia è arrivata tardi.", "Giulia ist spät angekommen.", "Giulia arrived late."], ["Hai già mangiato?", "Hast du schon gegessen?", "Have you eaten yet?"], ["Non ho capito.", "Ich habe nicht verstanden.", "I didn't understand."]]],
  ["tip", TB("Signalwörter: ieri, l'altro ieri, la settimana scorsa, l'anno scorso, due giorni fa, stamattina, già, appena.", "Signal words: ieri, l'altro ieri, la settimana scorsa, l'anno scorso, due giorni fa, stamattina, già, appena.")],
  ["quiz", "it-pp"]
]},
{ id: "imperfetto", sec: "verbs", title: TB("Imperfetto", "Imperfetto"), sub: TB("Wie es war, was man früher immer tat", "How things were, what you used to do"), blocks: [
  ["p", TB("Das Imperfetto beschreibt Zustände und Hintergründe in der Vergangenheit, Gewohnheiten (früher immer …) und Handlungen, die gerade im Gange waren.", "The imperfetto describes states and background in the past, habits (used to …) and actions that were in progress.")],
  ["table", { head: [TB("Person", "Person"), "parlare", "prendere", "dormire"], rows: [
    ["io", "parlavo", "prendevo", "dormivo"], ["tu", "parlavi", "prendevi", "dormivi"], ["lui / lei", "parlava", "prendeva", "dormiva"],
    ["noi", "parlavamo", "prendevamo", "dormivamo"], ["voi", "parlavate", "prendevate", "dormivate"], ["loro", "parlavano", "prendevano", "dormivano"]] }],
  ["tip", TB("Nur wenige Verben sind unregelmäßig: <b>essere</b> (ero, eri, era …), <b>fare</b> (facevo), <b>dire</b> (dicevo), <b>bere</b> (bevevo).", "Only a few verbs are irregular: <b>essere</b> (ero, eri, era …), <b>fare</b> (facevo), <b>dire</b> (dicevo), <b>bere</b> (bevevo).")],
  ["conj", { verbs: ["essere", "fare"], tenses: ["Imperfetto"] }],
  ["ex", [["Da bambino giocavo a calcio ogni giorno.", "Als Kind habe ich jeden Tag Fußball gespielt.", "As a child I played football every day."], ["Era una bella giornata e faceva caldo.", "Es war ein schöner Tag und es war heiß.", "It was a beautiful day and it was hot."], ["Mentre cucinavo, ascoltavo la radio.", "Während ich kochte, hörte ich Radio.", "While I was cooking, I was listening to the radio."]]],
  ["tip", TB("Signalwörter: di solito, sempre, ogni giorno, mentre, da bambino, una volta (früher).", "Signal words: di solito, sempre, ogni giorno, mentre, da bambino, una volta (in the past).")],
  ["quiz", "it-imperfetto"]
]},
{ id: "ppimp", sec: "verbs", title: TB("Passato prossimo oder Imperfetto?", "Passato prossimo or imperfetto?"), sub: TB("Handlung oder Hintergrund", "Event or background"), blocks: [
  ["table", { head: ["Passato prossimo", "Imperfetto"], rows: [
    [TB("abgeschlossene Handlung", "completed action"), TB("Beschreibung, Zustand", "description, state")],
    [TB("einmal, zu einem bestimmten Zeitpunkt", "once, at a specific time"), TB("Gewohnheit, Wiederholung", "habit, repetition")],
    [TB("etwas Neues passiert", "something new happens"), TB("Hintergrund: was gerade lief", "background: what was going on")]] }],
  ["ex", [["Mentre leggevo, è squillato il telefono.", "Während ich las, klingelte das Telefon.", "While I was reading, the phone rang."], ["Ieri sono andato al cinema. Il film era bello.", "Gestern war ich im Kino. Der Film war schön.", "Yesterday I went to the cinema. The film was good."], ["Ogni estate andavamo al mare, ma quell'anno siamo rimasti a casa.", "Jeden Sommer fuhren wir ans Meer, aber in dem Jahr sind wir zu Hause geblieben.", "Every summer we went to the seaside, but that year we stayed at home."], ["Ero stanco, quindi sono andato a letto presto.", "Ich war müde, also bin ich früh ins Bett gegangen.", "I was tired, so I went to bed early."]]],
  ["tip", TB("Denk an einen Film: Das Imperfetto ist die Kulisse, das Passato prossimo die Handlung.", "Think of a film: the imperfetto is the set, the passato prossimo is the action.")],
  ["quiz", "it-pp-imp"]
]},
{ id: "futuro", sec: "verbs", title: TB("Futuro semplice", "Futuro semplice"), sub: TB("Zukunft und Vermutung", "Future and assumptions"), blocks: [
  ["table", { head: [TB("Person", "Person"), "parlare", "prendere", "dormire"], rows: [
    ["io", "parlerò", "prenderò", "dormirò"], ["tu", "parlerai", "prenderai", "dormirai"], ["lui / lei", "parlerà", "prenderà", "dormirà"],
    ["noi", "parleremo", "prenderemo", "dormiremo"], ["voi", "parlerete", "prenderete", "dormirete"], ["loro", "parleranno", "prenderanno", "dormiranno"]] }],
  ["tip", TB("Bei -are wird das a zum e: parlare → parl<b>e</b>rò. Schreibregeln: cercare → cercherò, mangiare → mangerò.", "With -are the a becomes e: parlare → parl<b>e</b>rò. Spelling: cercare → cercherò, mangiare → mangerò.")],
  ["conj", { verbs: ["essere", "avere", "andare", "fare", "venire", "potere"], tenses: ["Futuro semplice"] }],
  ["p", TB("Für die Zukunft und für Vermutungen: <i>Sarà vero?</i> (Ob das wohl stimmt?). Im Alltag steht für die nahe Zukunft oft einfach das Präsens: <i>Domani vado a Milano.</i>", "For the future and for assumptions: <i>Sarà vero?</i> (I wonder if it's true). In everyday speech the present is often used for the near future: <i>Domani vado a Milano.</i>")],
  ["ex", [["L'anno prossimo andrò in Italia.", "Nächstes Jahr fahre ich nach Italien.", "Next year I'll go to Italy."], ["Ti chiamerò stasera.", "Ich rufe dich heute Abend an.", "I'll call you tonight."], ["Dov'è Marco? – Sarà a casa.", "Wo ist Marco? – Er wird wohl zu Hause sein.", "Where's Marco? – He's probably at home."]]],
  ["quiz", "it-futuro"]
]},
{ id: "condizionale", sec: "verbs", title: TB("Condizionale presente", "Condizionale presente"), sub: TB("vorrei, potresti, dovresti – höflich bitten", "vorrei, potresti, dovresti – asking politely"), blocks: [
  ["table", { head: [TB("Person", "Person"), "parlare", "prendere", "dormire"], rows: [
    ["io", "parlerei", "prenderei", "dormirei"], ["tu", "parleresti", "prenderesti", "dormiresti"], ["lui / lei", "parlerebbe", "prenderebbe", "dormirebbe"],
    ["noi", "parleremmo", "prenderemmo", "dormiremmo"], ["voi", "parlereste", "prendereste", "dormireste"], ["loro", "parlerebbero", "prenderebbero", "dormirebbero"]] }],
  ["p", TB("Gleicher Stamm wie das Futur, andere Endungen. Unregelmäßige Verben genauso: sarei, avrei, andrei, farei, vorrei, potrei, dovrei, verrei.", "Same stem as the future, different endings. Irregular verbs work the same way: sarei, avrei, andrei, farei, vorrei, potrei, dovrei, verrei.")],
  ["ex", [["Vorrei un caffè, per favore.", "Ich hätte gern einen Kaffee, bitte.", "I'd like a coffee, please."], ["Potrebbe ripetere, per favore?", "Könnten Sie das bitte wiederholen?", "Could you repeat that, please?"], ["Dovresti dormire di più.", "Du solltest mehr schlafen.", "You should sleep more."], ["Mi piacerebbe vivere a Roma.", "Ich würde gern in Rom leben.", "I'd love to live in Rome."]]],
  ["quiz", "it-condizionale"]
]},
{ id: "imperativo", sec: "verbs", title: TB("Imperativo", "Imperativo"), sub: TB("Aufforderungen – und „Non …!“", "Commands – and “Non …!”"), blocks: [
  ["table", { head: [TB("Person", "Person"), "parlare", "prendere", "dormire", "finire"], rows: [
    ["tu", "parla!", "prendi!", "dormi!", "finisci!"], ["Lei", "parli!", "prenda!", "dorma!", "finisca!"], ["noi", "parliamo!", "prendiamo!", "dormiamo!", "finiamo!"], ["voi", "parlate!", "prendete!", "dormite!", "finite!"]] }],
  ["p", TB("Verneinung bei <b>tu</b>: <b>non + Infinitiv</b> – <i>Non parlare! Non toccarlo! Non preoccuparti!</i> Bei allen anderen Personen kommt einfach non davor: <i>Non parlate! Non si preoccupi!</i>", "Negative with <b>tu</b>: <b>non + infinitive</b> – <i>Non parlare! Non toccarlo! Non preoccuparti!</i> With all other persons just put non in front: <i>Non parlate! Non si preoccupi!</i>")],
  ["conj", { verbs: ["andare", "fare", "stare", "dare", "dire", "essere", "avere", "venire"], tenses: ["Imperativo"] }],
  ["p", TB("Pronomen werden angehängt (außer bei Lei): <i>Dimmi! Aspettami! Fallo!</i> – aber <i>Mi dica!</i> Bei den Kurzformen va', fa', sta', da', di' verdoppelt sich der Konsonant: <i>Dimmi! Fammi vedere!</i>", "Pronouns are attached (except with Lei): <i>Dimmi! Aspettami! Fallo!</i> – but <i>Mi dica!</i> After the short forms va', fa', sta', da', di' the consonant doubles: <i>Dimmi! Fammi vedere!</i>")],
  ["ex", [["Aspetta un attimo!", "Warte einen Moment!", "Wait a moment!"], ["Non preoccuparti!", "Mach dir keine Sorgen!", "Don't worry!"], ["Andiamo!", "Lass uns gehen!", "Let's go!"], ["Dimmi la verità!", "Sag mir die Wahrheit!", "Tell me the truth!"], ["Prego, si accomodi!", "Bitte, nehmen Sie Platz!", "Please take a seat!"]]],
  ["quiz", "it-imperativo"]
]},
{ id: "reflexive", sec: "verbs", title: TB("Reflexive Verben", "Reflexive verbs"), sub: TB("chiamarsi, alzarsi, divertirsi …", "chiamarsi, alzarsi, divertirsi …"), blocks: [
  ["conj", { verbs: ["chiamarsi", "alzarsi"], tenses: ["Presente", "Passato prossimo"] }],
  ["p", TB("Das Reflexivpronomen (mi, ti, si, ci, vi, si) steht vor dem Verb. Im Passato prossimo immer mit <b>essere</b>: <i>Mi sono alzato/a alle sette.</i>", "The reflexive pronoun (mi, ti, si, ci, vi, si) goes before the verb. The passato prossimo always uses <b>essere</b>: <i>Mi sono alzato/a alle sette.</i>")],
  ["p", TB("Mit Modalverb steht es vorn oder hängt am Infinitiv: <i>Mi devo alzare = Devo alzarmi.</i>", "With a modal verb it goes in front or is attached to the infinitive: <i>Mi devo alzare = Devo alzarmi.</i>")],
  ["ex", [["Come ti chiami?", "Wie heißt du?", "What's your name?"], ["Mi alzo alle sette.", "Ich stehe um sieben auf.", "I get up at seven."], ["Ci vediamo domani!", "Wir sehen uns morgen!", "See you tomorrow!"], ["Ti sei divertito alla festa?", "Hattest du Spaß auf der Party?", "Did you have fun at the party?"], ["Non mi sento bene.", "Ich fühle mich nicht gut.", "I don't feel well."]]],
  ["tip", TB("Häufig: alzarsi (aufstehen), svegliarsi (aufwachen), lavarsi (sich waschen), vestirsi (sich anziehen), sentirsi (sich fühlen), divertirsi (Spaß haben), sedersi (sich setzen), ricordarsi (sich erinnern), trovarsi (sich befinden).", "Common: alzarsi (get up), svegliarsi (wake up), lavarsi (wash), vestirsi (get dressed), sentirsi (feel), divertirsi (have fun), sedersi (sit down), ricordarsi (remember), trovarsi (be located).")]
]},
{ id: "strutture", sec: "phrases", title: TB("Wichtige Strukturen", "Key structures"), sub: TB("c'è, mi piace, sto facendo, ho fame, non … mai", "c'è, mi piace, sto facendo, ho fame, non … mai"), blocks: [
  ["h", TB("c'è / ci sono – es gibt", "c'è / ci sono – there is / there are")],
  ["ex", [["C'è un bar qui vicino?", "Gibt es hier in der Nähe eine Bar?", "Is there a bar near here?"], ["Ci sono molti turisti.", "Es gibt viele Touristen.", "There are a lot of tourists."], ["Non c'è problema.", "Kein Problem.", "No problem."]]],
  ["h", TB("piacere – gefallen, mögen", "piacere – to like")],
  ["p", TB("Wörtlich „mir gefällt“: <b>mi piace</b> + Singular oder Infinitiv, <b>mi piacciono</b> + Plural.", "Literally “it pleases me”: <b>mi piace</b> + singular or infinitive, <b>mi piacciono</b> + plural.")],
  ["table", { head: ["", TB("+ Singular", "+ singular"), TB("+ Plural", "+ plural")], say: 1, rows: [
    ["a me", "mi piace", "mi piacciono"], ["a te", "ti piace", "ti piacciono"], ["a lui", "gli piace", "gli piacciono"], ["a lei / a Lei", "le / Le piace", "le / Le piacciono"],
    ["a noi", "ci piace", "ci piacciono"], ["a voi", "vi piace", "vi piacciono"], ["a loro", "gli piace", "gli piacciono"]] }],
  ["ex", [["Mi piace il caffè.", "Ich mag Kaffee.", "I like coffee."], ["Mi piacciono i film italiani.", "Ich mag italienische Filme.", "I like Italian films."], ["Ti piace ballare?", "Tanzt du gern?", "Do you like dancing?"], ["Non mi piace per niente.", "Das mag ich überhaupt nicht.", "I don't like it at all."]]],
  ["h", TB("stare + Gerundium – gerade etwas tun", "stare + gerund – doing something right now")],
  ["p", TB("-are → <b>-ando</b>, -ere/-ire → <b>-endo</b>: <i>Sto mangiando. Che cosa stai facendo?</i>", "-are → <b>-ando</b>, -ere/-ire → <b>-endo</b>: <i>Sto mangiando. Che cosa stai facendo?</i>")],
  ["ex", [["Sto lavorando, ti chiamo dopo.", "Ich arbeite gerade, ich rufe dich später an.", "I'm working, I'll call you later."], ["Che cosa state facendo?", "Was macht ihr gerade?", "What are you doing?"]]],
  ["h", TB("Ausdrücke mit avere", "Expressions with avere")],
  ["ex", [["Ho fame. / Ho sete.", "Ich habe Hunger. / Ich habe Durst.", "I'm hungry. / I'm thirsty."], ["Ho freddo. / Ho caldo.", "Mir ist kalt. / Mir ist warm.", "I'm cold. / I'm hot."], ["Ho sonno.", "Ich bin müde.", "I'm sleepy."], ["Hai ragione.", "Du hast recht.", "You're right."], ["Ho trent'anni.", "Ich bin dreißig Jahre alt.", "I'm thirty years old."], ["Ho bisogno di aiuto.", "Ich brauche Hilfe.", "I need help."]]],
  ["h", TB("Verneinung", "Negation")],
  ["p", TB("<b>non</b> steht immer vor dem Verb. mai, niente, nessuno und ancora brauchen trotzdem non – doppelte Verneinung ist im Italienischen richtig.", "<b>non</b> always goes before the verb. mai, niente, nessuno and ancora still need non – a double negative is correct in Italian.")],
  ["ex", [["Non lo so.", "Ich weiß es nicht.", "I don't know."], ["Non sono mai stato a Roma.", "Ich war noch nie in Rom.", "I've never been to Rome."], ["Non c'è nessuno.", "Es ist niemand da.", "There's nobody here."], ["Non voglio niente.", "Ich will nichts.", "I don't want anything."], ["Non ancora.", "Noch nicht.", "Not yet."]]]
]}
);
