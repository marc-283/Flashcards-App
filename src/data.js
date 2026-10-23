/*DATA-START*/
/* Starter packs. Word lines: target | Deutsch | type | example | example (DE) | note
   type: nm/nf = noun masc./fem., v verb, adj, adv, ph phrase, x other. "# Topic" starts a topic. */
const STARTER = {
  it: [
    { id: "it-basis", name: "Grundwortschatz", desc: "Rund 230 Wörter für Alltag, Essen, Reisen, Uni und Arbeit", kind: "words", data: `
# Begrüßung & Floskeln
ciao|hallo; tschüss|ph
buongiorno|guten Morgen; guten Tag|ph
buonasera|guten Abend|ph
buonanotte|gute Nacht|ph
arrivederci|auf Wiedersehen|ph
a presto|bis bald|ph
grazie|danke|ph
grazie mille|vielen Dank|ph
prego|bitte; gern geschehen|ph|||Antwort auf „grazie“ – oder „Bitte sehr“ beim Anbieten
per favore|bitte|ph|Un caffè, per favore.|Einen Kaffee, bitte.
scusa|Entschuldigung (du)|ph
mi scusi|Entschuldigen Sie|ph
va bene|in Ordnung; okay|ph
d'accordo|einverstanden|ph
come stai?|wie geht es dir?|ph
sto bene, grazie|mir geht es gut, danke|ph
piacere|freut mich|ph|Piacere, sono Marco.|Freut mich, ich bin Marco.
non lo so|ich weiß es nicht|ph
non capisco|ich verstehe nicht|ph
può ripetere, per favore?|können Sie das bitte wiederholen?|ph
quanto costa?|wie viel kostet das?|ph
il conto, per favore|die Rechnung, bitte|ph
dov'è il bagno?|wo ist die Toilette?|ph
che ore sono?|wie spät ist es?|ph
in bocca al lupo|viel Glück|ph|||Antwort: „Crepi!“
salute!|Gesundheit!; Prost!|ph
dai!|komm schon!; los!|ph
magari|schön wär's; vielleicht|x|Vieni anche tu? – Magari!|Kommst du auch? – Schön wär's!
allora|also; dann|x
comunque|jedenfalls; trotzdem|x
ecco|hier ist; da ist|x|Ecco il tuo caffè.|Hier ist dein Kaffee.
# Alltag
la casa|das Haus; das Zuhause|nf|Torno a casa.|Ich gehe nach Hause.
l'appartamento|die Wohnung|nm
la camera|das Zimmer|nf
la cucina|die Küche|nf
il bagno|das Bad; die Toilette|nm
la chiave|der Schlüssel|nf
il letto|das Bett|nm
la finestra|das Fenster|nf
la porta|die Tür|nf
il cellulare|das Handy|nm
il lavoro|die Arbeit|nm
il tempo|die Zeit; das Wetter|nm|Che tempo fa?|Wie ist das Wetter?
i soldi|das Geld|nm|||nur Plural
l'amico|der Freund|nm|||weiblich: l'amica
la gente|die Leute|nf|||Singular! La gente è simpatica.
la vita|das Leben|nf
la cosa|die Sache; das Ding|nf
il problema|das Problem|nm|Non c'è problema.|Kein Problem.|maskulin trotz -a
la domanda|die Frage|nf
la risposta|die Antwort|nf
il giorno|der Tag|nm
la settimana|die Woche|nf
il mese|der Monat|nm
l'anno|das Jahr|nm
la mattina|der Morgen; der Vormittag|nf
il pomeriggio|der Nachmittag|nm
la sera|der Abend|nf
la notte|die Nacht|nf
oggi|heute|adv
domani|morgen|adv
ieri|gestern|adv
adesso|jetzt|adv
sempre|immer|adv
mai|nie|adv|Non bevo mai caffè.|Ich trinke nie Kaffee.|mit „non“ davor
spesso|oft|adv
ancora|noch; wieder|adv
già|schon|adv
subito|sofort|adv
presto|früh; bald|adv
tardi|spät|adv
qui|hier|adv
lì|dort|adv
molto|sehr; viel|adv
poco|wenig|adv
troppo|zu viel; zu sehr|adv
anche|auch|adv
solo|nur; allein|adv
# Essen & Trinken
il caffè|der Kaffee|nm
l'acqua|das Wasser|nf|Un bicchiere d'acqua, per favore.|Ein Glas Wasser, bitte.
il vino|der Wein|nm
la birra|das Bier|nf
il pane|das Brot|nm
il formaggio|der Käse|nm
la carne|das Fleisch|nf
il pesce|der Fisch|nm
la verdura|das Gemüse|nf
la frutta|das Obst|nf
la mela|der Apfel|nf
il pomodoro|die Tomate|nm
il latte|die Milch|nm
lo zucchero|der Zucker|nm
il sale|das Salz|nm
l'olio|das Öl|nm
il gelato|das Eis (Speiseeis)|nm
la colazione|das Frühstück|nf|Faccio colazione alle otto.|Ich frühstücke um acht.
il pranzo|das Mittagessen|nm
la cena|das Abendessen|nf
il piatto|der Teller; das Gericht|nm
il bicchiere|das Glas (Trinkglas)|nm
la forchetta|die Gabel|nf
il coltello|das Messer|nm
il cucchiaio|der Löffel|nm
la mancia|das Trinkgeld|nf
il cameriere|der Kellner|nm
buono|gut; lecker|adj
avere fame|Hunger haben|ph|Ho fame!|Ich habe Hunger!
avere sete|Durst haben|ph
# Reisen & Stadt
il treno|der Zug|nm
la stazione|der Bahnhof|nf
l'aereo|das Flugzeug|nm
l'aeroporto|der Flughafen|nm
il biglietto|die Fahrkarte; das Ticket|nm
la valigia|der Koffer|nf
il viaggio|die Reise|nm|Buon viaggio!|Gute Reise!
l'albergo|das Hotel|nm
la strada|die Straße|nf
la piazza|der Platz|nf
la città|die Stadt|nf
il paese|das Land; das Dorf|nm
il mare|das Meer|nm
la spiaggia|der Strand|nf
la montagna|der Berg; das Gebirge|nf
a destra|rechts|adv
a sinistra|links|adv
dritto|geradeaus|adv
vicino|nah; in der Nähe|adj
lontano|weit (entfernt)|adj
la fermata|die Haltestelle|nf
l'autobus|der Bus|nm
la macchina|das Auto|nf
il negozio|das Geschäft; der Laden|nm
la farmacia|die Apotheke|nf
l'ospedale|das Krankenhaus|nm
la banca|die Bank (Geldinstitut)|nf
la chiesa|die Kirche|nf
il museo|das Museum|nm
l'indirizzo|die Adresse|nm
# Familie & Menschen
la famiglia|die Familie|nf
la madre|die Mutter|nf
il padre|der Vater|nm
i genitori|die Eltern|nm
il fratello|der Bruder|nm
la sorella|die Schwester|nf
il figlio|der Sohn|nm
la figlia|die Tochter|nf
il nonno|der Großvater|nm
la nonna|die Großmutter|nf
il ragazzo|der Junge; der Freund (Partner)|nm
la ragazza|das Mädchen; die Freundin (Partnerin)|nf
l'uomo|der Mann; der Mensch|nm|||Plural: gli uomini
la donna|die Frau|nf
il bambino|das Kind|nm
# Uni & Arbeit
l'università|die Universität|nf
lo studente|der Student|nm|||weiblich: la studentessa
la lezione|die Vorlesung; die Unterrichtsstunde|nf
l'esame|die Prüfung|nm|Domani ho un esame.|Morgen habe ich eine Prüfung.
il libro|das Buch|nm
la tesi|die Abschlussarbeit|nf
il corso|der Kurs|nm
la riunione|die Besprechung; das Meeting|nf
l'ufficio|das Büro|nm
il collega|der Kollege|nm|||weiblich: la collega
l'azienda|das Unternehmen; die Firma|nf
lo stipendio|das Gehalt|nm
il capo|der Chef|nm
la scadenza|die Frist; die Deadline|nf
# Eigenschaften
grande|groß|adj
piccolo|klein|adj
bello|schön|adj
brutto|hässlich|adj
nuovo|neu|adj
vecchio|alt|adj
giovane|jung|adj
caldo|warm; heiß|adj
freddo|kalt|adj
facile|leicht; einfach|adj
difficile|schwierig|adj
caro|teuer; lieb|adj
economico|günstig; billig|adj
stanco|müde|adj
contento|zufrieden; froh|adj
triste|traurig|adj
pieno|voll|adj
vuoto|leer|adj
aperto|offen; geöffnet|adj
chiuso|geschlossen|adj
lungo|lang|adj
corto|kurz|adj
veloce|schnell|adj
lento|langsam|adj
importante|wichtig|adj
libero|frei|adj
occupato|besetzt; beschäftigt|adj
pronto|bereit; fertig|adj|Pronto!|Hallo! (am Telefon)
simpatico|sympathisch; nett|adj
gentile|freundlich; höflich|adj
# Kleine Wörter
chi?|wer?|x
che cosa?|was?|x
dove?|wo?|x
quando?|wann?|x
perché|warum; weil|x|Perché no?|Warum nicht?
come?|wie?|x
quanto?|wie viel?|x
quale?|welche(r/s)?|x
ma|aber|x
però|aber; jedoch|x
o|oder|x
e|und|x
se|wenn; ob|x
quindi|also; deshalb|x
mentre|während|x
con|mit|x
senza|ohne|x
per|für|x
fra|zwischen; in (zeitlich)|x|Ci vediamo fra due giorni.|Wir sehen uns in zwei Tagen.|auch: tra
# Zahlen
uno|eins|x
due|zwei|x
tre|drei|x
quattro|vier|x
cinque|fünf|x
sei|sechs|x
sette|sieben|x
otto|acht|x
nove|neun|x
dieci|zehn|x
undici|elf|x
dodici|zwölf|x
venti|zwanzig|x
trenta|dreißig|x
cento|hundert|x
mille|tausend|x
` },
    { id: "it-verbi", name: "Wichtige Verben", desc: "45 Verben mit Konjugation – Presente, Passato prossimo, Imperfetto, Futuro und mehr", kind: "verbs", verbs: [
      { v: "essere", de: "sein", aux: "essere", irr: 1, pp: "stato", P: "sono, sei, è, siamo, siete, sono", I: "ero, eri, era, eravamo, eravate, erano", F: "sarò, sarai, sarà, saremo, sarete, saranno", CP: "sia, sia, sia, siamo, siate, siano" },
      { v: "avere", de: "haben", irr: 1, pp: "avuto", P: "ho, hai, ha, abbiamo, avete, hanno", F: "avrò, avrai, avrà, avremo, avrete, avranno", CP: "abbia, abbia, abbia, abbiamo, abbiate, abbiano" },
      { v: "fare", de: "machen; tun", irr: 1, pp: "fatto", P: "faccio, fai, fa, facciamo, fate, fanno", I: "facevo, facevi, faceva, facevamo, facevate, facevano", F: "farò, farai, farà, faremo, farete, faranno", CP: "faccia, faccia, faccia, facciamo, facciate, facciano" },
      { v: "andare", de: "gehen; fahren", aux: "essere", irr: 1, P: "vado, vai, va, andiamo, andate, vanno", F: "andrò, andrai, andrà, andremo, andrete, andranno", CP: "vada, vada, vada, andiamo, andiate, vadano" },
      { v: "venire", de: "kommen", aux: "essere", irr: 1, pp: "venuto", P: "vengo, vieni, viene, veniamo, venite, vengono", F: "verrò, verrai, verrà, verremo, verrete, verranno", CP: "venga, venga, venga, veniamo, veniate, vengano" },
      { v: "dire", de: "sagen", irr: 1, pp: "detto", P: "dico, dici, dice, diciamo, dite, dicono", I: "dicevo, dicevi, diceva, dicevamo, dicevate, dicevano", F: "dirò, dirai, dirà, diremo, direte, diranno", CP: "dica, dica, dica, diciamo, diciate, dicano" },
      { v: "potere", de: "können; dürfen", irr: 1, P: "posso, puoi, può, possiamo, potete, possono", F: "potrò, potrai, potrà, potremo, potrete, potranno", CP: "possa, possa, possa, possiamo, possiate, possano", note: "Im Passato prossimo mit essere, wenn das folgende Verb essere verlangt: Non sono potuto venire." },
      { v: "volere", de: "wollen", irr: 1, P: "voglio, vuoi, vuole, vogliamo, volete, vogliono", F: "vorrò, vorrai, vorrà, vorremo, vorrete, vorranno", CP: "voglia, voglia, voglia, vogliamo, vogliate, vogliano", note: "Vorrei … = Ich hätte gern …" },
      { v: "dovere", de: "müssen", irr: 1, P: "devo, devi, deve, dobbiamo, dovete, devono", F: "dovrò, dovrai, dovrà, dovremo, dovrete, dovranno", CP: "debba, debba, debba, dobbiamo, dobbiate, debbano" },
      { v: "sapere", de: "wissen; können (gelernt)", irr: 1, P: "so, sai, sa, sappiamo, sapete, sanno", F: "saprò, saprai, saprà, sapremo, saprete, sapranno", CP: "sappia, sappia, sappia, sappiamo, sappiate, sappiano", note: "So nuotare = Ich kann schwimmen." },
      { v: "stare", de: "bleiben; sich befinden", aux: "essere", irr: 1, pp: "stato", P: "sto, stai, sta, stiamo, state, stanno", F: "starò, starai, starà, staremo, starete, staranno", CP: "stia, stia, stia, stiamo, stiate, stiano", note: "stare + Gerundium: Sto mangiando = Ich esse gerade." },
      { v: "dare", de: "geben", irr: 1, P: "do, dai, dà, diamo, date, danno", F: "darò, darai, darà, daremo, darete, daranno", CP: "dia, dia, dia, diamo, diate, diano" },
      { v: "uscire", de: "ausgehen; hinausgehen", aux: "essere", irr: 1, P: "esco, esci, esce, usciamo, uscite, escono", CP: "esca, esca, esca, usciamo, usciate, escano" },
      { v: "bere", de: "trinken", irr: 1, pp: "bevuto", P: "bevo, bevi, beve, beviamo, bevete, bevono", I: "bevevo, bevevi, beveva, bevevamo, bevevate, bevevano", F: "berrò, berrai, berrà, berremo, berrete, berranno", CP: "beva, beva, beva, beviamo, beviate, bevano" },
      { v: "rimanere", de: "bleiben", aux: "essere", irr: 1, pp: "rimasto", P: "rimango, rimani, rimane, rimaniamo, rimanete, rimangono", F: "rimarrò, rimarrai, rimarrà, rimarremo, rimarrete, rimarranno", CP: "rimanga, rimanga, rimanga, rimaniamo, rimaniate, rimangano" },
      { v: "tenere", de: "halten", irr: 1, P: "tengo, tieni, tiene, teniamo, tenete, tengono", F: "terrò, terrai, terrà, terremo, terrete, terranno", CP: "tenga, tenga, tenga, teniamo, teniate, tengano" },
      { v: "piacere", de: "gefallen; mögen", aux: "essere", irr: 1, pp: "piaciuto", P: "piaccio, piaci, piace, piacciamo, piacete, piacciono", CP: "piaccia, piaccia, piaccia, piacciamo, piacciate, piacciano", note: "Mi piace il caffè. Mi piacciono i libri." },
      { v: "scegliere", de: "wählen; aussuchen", irr: 1, pp: "scelto", P: "scelgo, scegli, sceglie, scegliamo, scegliete, scelgono", CP: "scelga, scelga, scelga, scegliamo, scegliate, scelgano" },
      { v: "vedere", de: "sehen", pp: "visto", F: "vedrò, vedrai, vedrà, vedremo, vedrete, vedranno" },
      { v: "vivere", de: "leben", pp: "vissuto", F: "vivrò, vivrai, vivrà, vivremo, vivrete, vivranno" },
      { v: "prendere", de: "nehmen", pp: "preso" },
      { v: "mettere", de: "legen; stellen; setzen", pp: "messo" },
      { v: "leggere", de: "lesen", pp: "letto" },
      { v: "scrivere", de: "schreiben", pp: "scritto" },
      { v: "chiedere", de: "fragen; bitten", pp: "chiesto" },
      { v: "rispondere", de: "antworten", pp: "risposto" },
      { v: "chiudere", de: "schließen", pp: "chiuso" },
      { v: "aprire", de: "öffnen", pp: "aperto" },
      { v: "conoscere", de: "kennen; kennenlernen", pp: "conosciuto" },
      { v: "parlare", de: "sprechen" },
      { v: "mangiare", de: "essen" },
      { v: "studiare", de: "lernen; studieren" },
      { v: "lavorare", de: "arbeiten" },
      { v: "abitare", de: "wohnen" },
      { v: "comprare", de: "kaufen" },
      { v: "aspettare", de: "warten" },
      { v: "arrivare", de: "ankommen", aux: "essere" },
      { v: "cercare", de: "suchen" },
      { v: "pagare", de: "bezahlen" },
      { v: "credere", de: "glauben" },
      { v: "dormire", de: "schlafen" },
      { v: "partire", de: "abfahren; abreisen", aux: "essere" },
      { v: "capire", de: "verstehen", isc: 1 },
      { v: "finire", de: "beenden; aufhören", isc: 1, note: "Ohne Objekt mit essere: Il film è finito." },
      { v: "chiamarsi", de: "heißen", note: "Come ti chiami? – Mi chiamo Marc." }
    ] },
    { id: "it-frasi", name: "Grammatik in Sätzen", desc: "Lückensätze zu Präpositionen, Artikeln und Zeiten", kind: "cloze", data: `
# Präpositionen
Vado {{a}} Roma domani.|Ich fahre morgen nach Rom.
Sono {{di}} Berlino.|Ich komme aus Berlin (Herkunft).
Abito {{in}} Germania.|Ich wohne in Deutschland.
Vado {{al}} cinema stasera.|Ich gehe heute Abend ins Kino.
Andiamo {{dal}} medico.|Wir gehen zum Arzt.
Studio italiano {{da}} due anni.|Ich lerne seit zwei Jahren Italienisch.
Il libro è {{sul}} tavolo.|Das Buch liegt auf dem Tisch.
Vado {{in}} ufficio in bici.|Ich fahre mit dem Rad ins Büro.
Ci vediamo {{fra}} una settimana.|Wir sehen uns in einer Woche.
# Artikel
{{Gli}} studenti sono in aula.|Die Studenten sind im Hörsaal.
Ho {{lo}} zaino in macchina.|Ich habe den Rucksack im Auto.
È {{un'}}amica di Paola.|Sie ist eine Freundin von Paola.
# Zeiten & Formen
Ieri {{sono}} andato al mare.|Gestern bin ich ans Meer gefahren.
Ieri {{ho}} mangiato una pizza.|Gestern habe ich eine Pizza gegessen.
Da piccolo {{andavo}} spesso al mare.|Als Kind ging ich oft ans Meer.
Domani {{andrò}} a Napoli.|Morgen werde ich nach Neapel fahren.
{{Vorrei}} un caffè, per favore.|Ich hätte gern einen Kaffee, bitte.
Penso che {{sia}} vero.|Ich glaube, dass es wahr ist.
Mi {{piace}} il caffè.|Ich mag Kaffee.
Mi {{piacciono}} i libri.|Ich mag Bücher.
{{C'è}} un problema.|Es gibt ein Problem.
{{Ci sono}} tre problemi.|Es gibt drei Probleme.
Quanti fratelli hai? {{Ne}} ho due.|Wie viele Brüder hast du? Ich habe zwei.
Sto {{mangiando}}.|Ich esse gerade.
` }
  ],
  en: [
    { id: "en-business", name: "Business & Uni", desc: "Rund 90 Fachbegriffe aus Finance, Management und Studium", kind: "words", data: `
# Finance
revenue / turnover|Umsatz|nm|Revenue grew by 12% last year.|Der Umsatz stieg letztes Jahr um 12 %.|turnover ist eher britisch
profit|Gewinn|nm
return / yield|Rendite|nf|The investment yields a return of 8%.|Die Investition erzielt eine Rendite von 8 %.
liabilities|Verbindlichkeiten|nf
assets|Vermögenswerte|nm
equity|Eigenkapital|nm
debt capital / borrowed capital|Fremdkapital|nm
depreciation|Abschreibung|nf|||bei immateriellen Werten: amortisation
balance sheet|Bilanz|nf
income statement / profit and loss statement|Gewinn- und Verlustrechnung|nf
current assets|Umlaufvermögen|nm
fixed assets / non-current assets|Anlagevermögen|nm
provision|Rückstellung|nf
interest|Zinsen|nm|The interest rate is 4%.|Der Zinssatz beträgt 4 %.
loan|Darlehen; Kredit|nm
key figure / ratio / KPI|Kennzahl|nf
cash flow|Cashflow; Zahlungsstrom|nm
working capital|Betriebskapital; Working Capital|nm
valuation|Bewertung (Unternehmen)|nf
venture capital|Risikokapital|nm
stake / equity stake|Beteiligung|nf|They acquired a 20% stake in the start-up.|Sie erwarben eine Beteiligung von 20 % an dem Start-up.
shareholder|Gesellschafter; Anteilseigner|nm
dividend|Dividende|nf
budget|Budget; Etat|nm
forecast|Prognose|nf
# Management
competition|Wettbewerb|nm
competitive advantage|Wettbewerbsvorteil|nm
market share|Marktanteil|nm
demand|Nachfrage|nf
supply|Angebot (Markt)|nm
supply chain|Lieferkette|nf
customer / client|Kunde|nm|||client eher bei Dienstleistungen
supplier|Lieferant|nm
contract|Vertrag|nm
negotiation|Verhandlung|nf
tender / call for bids|Ausschreibung|nf
quote / quotation|Angebot (an Kunden)|nm|Could you send us a quote?|Könnten Sie uns ein Angebot schicken?
invoice|Rechnung|nf
deadline|Frist|nf|The deadline is next Friday.|Die Frist endet nächsten Freitag.
agenda|Tagesordnung|nf
minutes|Protokoll (Besprechung)|nm|Who's taking the minutes?|Wer schreibt Protokoll?
proposal|Vorschlag; Angebot (Projekt)|nm
to make a decision|eine Entscheidung treffen|ph|||nicht: to „take“ a decision (eher britisch, seltener)
implementation|Umsetzung|nf
sustainable|nachhaltig|adj
sustainability|Nachhaltigkeit|nf
challenge|Herausforderung|nf
opportunity|Chance; Gelegenheit|nf|||chance = eher Wahrscheinlichkeit / Zufall
growth|Wachstum|nm
decline / decrease|Rückgang|nm
founder|Gründer|nm
executive board / management board|Vorstand|nm
supervisory board|Aufsichtsrat|nm
managing director / CEO|Geschäftsführer|nm
workforce / staff|Belegschaft|nf
to hire|einstellen (Personal)|v
to resign / to quit|kündigen (als Mitarbeiter)|v
to lay off|entlassen (betriebsbedingt)|v
stakeholder|Interessengruppe; Stakeholder|nm
# Bewerbung & Studium
application|Bewerbung|nf
CV / résumé|Lebenslauf|nm|||CV = britisch, résumé = amerikanisch
job interview|Vorstellungsgespräch|nn
internship|Praktikum|nn
thesis|Abschlussarbeit|nf
lecture|Vorlesung|nf
assignment / term paper|Hausarbeit|nf
exam / examination|Prüfung|nf
grade / mark|Note|nf|||grade = US, mark = UK
tuition fees|Studiengebühren|nf
degree programme / course of study|Studiengang|nm
master's degree|Masterabschluss|nm
result / outcome|Ergebnis|nn
assumption|Annahme|nf
hypothesis|Hypothese|nf
estimate|Schätzung|nf
sample|Stichprobe|nf
correlation|Zusammenhang; Korrelation|nm
significant / considerable|erheblich|adj
negligible|vernachlässigbar|adj
to collect data|Daten erheben|ph
sensitivity analysis|Sensitivitätsanalyse|nf
to outline|skizzieren; umreißen|v
to evaluate|bewerten; auswerten|v
to emphasise|betonen|v|||US: emphasize
consequently|folglich|adv
whereas|wohingegen|x
furthermore|außerdem; ferner|adv
nevertheless|dennoch; trotzdem|adv
` },
    { id: "en-false", name: "False Friends", desc: "28 Wörter, die Deutsche gern verwechseln", kind: "words", data: `
# False Friends
to get / to receive|bekommen|v|I got your email.|Ich habe deine E-Mail bekommen.|become = werden
to become|werden|v
current / up-to-date|aktuell|adj|||actual = tatsächlich
actual|tatsächlich|adj|The actual costs were higher.|Die tatsächlichen Kosten waren höher.
possibly / perhaps|eventuell|adv|||eventually = schließlich
eventually|schließlich; letztendlich|adv
sensitive|sensibel; empfindlich|adj|||sensible = vernünftig
sensible|vernünftig|adj
boss|Chef|nm|||chef = Koch
mobile phone / cell phone|Handy|nn|||mobile = UK, cell phone = US
poison|Gift|nn|||gift = Geschenk
so / therefore|also|x|||also = auch
soon|bald|adv|||bald = glatzköpfig
prescription|Rezept (vom Arzt)|nn|||recipe = Kochrezept
billion|Milliarde|nf|||Billion = trillion
trillion|Billion|nf
likeable / nice|sympathisch|adj|||sympathetic = mitfühlend
consistent|konsequent|adj|||consequent = daraus folgend
criticism|Kritik|nf|||critic = Kritiker
to donate|spenden|v|||to spend = ausgeben
factory|Fabrik|nf|||fabric = Stoff
well-behaved|brav|adj|||brave = mutig
commitment|Engagement|nn|||engagement = Verlobung
folder|Mappe|nf|||map = Landkarte
staff / personnel|Personal|nn|||personal = persönlich
commission|Provision|nf|||provision = Rückstellung; Bereitstellung
pension|Rente|nf|||rent = Miete
reputable / trustworthy|seriös|adj|||serious = ernst
` },
    { id: "en-phrasal", name: "Phrasal Verbs & Redewendungen", desc: "30 Ausdrücke für Meetings, E-Mails und Gespräche", kind: "words", data: `
# Phrasal Verbs
to come up with|sich etw. ausdenken|v|She came up with a great idea.|Sie hat sich eine tolle Idee ausgedacht.
to carry out|durchführen|v|We carried out a survey.|Wir haben eine Umfrage durchgeführt.
to figure out|herausfinden; verstehen|v
to look into|untersuchen; prüfen|v|I'll look into it.|Ich kümmere mich darum.
to point out|hinweisen auf|v
to put off|verschieben; aufschieben|v
to set up|einrichten; gründen|v
to take over|übernehmen|v
to turn down|ablehnen|v|They turned down our offer.|Sie haben unser Angebot abgelehnt.
to run out of|ausgehen (Vorrat)|v|We're running out of time.|Uns läuft die Zeit davon.
to get along with|sich verstehen mit|v
to bring up|ansprechen (Thema)|v
to call off|absagen|v
to follow up on|nachfassen; weiterverfolgen|v
to deal with|sich befassen mit; umgehen mit|v
to rely on|sich verlassen auf|v
to sort out|klären; regeln|v
to catch up on|nachholen; aufholen|v
to give up|aufgeben|v
to back up|unterstützen; sichern (Daten)|v
# Redewendungen
the bottom line|unterm Strich; das Fazit|ph
to be on the same page|auf dem gleichen Stand sein|ph|Let's make sure we're on the same page.|Lasst uns sicherstellen, dass wir auf dem gleichen Stand sind.
a ballpark figure|eine grobe Schätzung|ph
to cut corners|an der falschen Stelle sparen|ph
to touch base|sich kurz abstimmen|ph
to think outside the box|über den Tellerrand hinausdenken|ph
to get the ball rolling|den Stein ins Rollen bringen|ph
in the long run|auf lange Sicht|ph
a steep learning curve|eine steile Lernkurve|ph
to hit the ground running|sofort voll durchstarten|ph
` },
    { id: "en-irregular", name: "Unregelmäßige Verben", desc: "81 Verben mit Stammformen (go – went – gone)", kind: "enverbs", data: `
arise|arose|arisen|entstehen
be|was / were|been|sein
bear|bore|borne|tragen; ertragen
become|became|become|werden
begin|began|begun|beginnen
bind|bound|bound|binden
break|broke|broken|brechen
bring|brought|brought|bringen
build|built|built|bauen
buy|bought|bought|kaufen
catch|caught|caught|fangen
choose|chose|chosen|wählen
come|came|come|kommen
cost|cost|cost|kosten
cut|cut|cut|schneiden
deal|dealt|dealt|handeln; sich befassen
do|did|done|tun; machen
draw|drew|drawn|zeichnen; ziehen
drink|drank|drunk|trinken
drive|drove|driven|fahren
eat|ate|eaten|essen
fall|fell|fallen|fallen
feel|felt|felt|fühlen
fight|fought|fought|kämpfen
find|found|found|finden
fly|flew|flown|fliegen
forbid|forbade|forbidden|verbieten
forget|forgot|forgotten|vergessen
forgive|forgave|forgiven|vergeben
freeze|froze|frozen|frieren; einfrieren
get|got|got / gotten|bekommen
give|gave|given|geben
go|went|gone|gehen
grow|grew|grown|wachsen
hang|hung|hung|hängen
have|had|had|haben
hear|heard|heard|hören
hide|hid|hidden|verstecken
hold|held|held|halten
keep|kept|kept|behalten
know|knew|known|wissen; kennen
lead|led|led|führen
leave|left|left|verlassen
lend|lent|lent|leihen (verleihen)
let|let|let|lassen
lie|lay|lain|liegen
lose|lost|lost|verlieren
make|made|made|machen
mean|meant|meant|bedeuten; meinen
meet|met|met|treffen
overcome|overcame|overcome|überwinden
pay|paid|paid|bezahlen
put|put|put|setzen; stellen; legen
read|read|read|lesen
ride|rode|ridden|reiten; fahren (Rad)
rise|rose|risen|steigen
run|ran|run|laufen; rennen
say|said|said|sagen
see|saw|seen|sehen
seek|sought|sought|suchen
sell|sold|sold|verkaufen
send|sent|sent|senden; schicken
set|set|set|setzen; festlegen
show|showed|shown|zeigen
shut|shut|shut|schließen
sit|sat|sat|sitzen
sleep|slept|slept|schlafen
speak|spoke|spoken|sprechen
spend|spent|spent|ausgeben; verbringen
stand|stood|stood|stehen
take|took|taken|nehmen
teach|taught|taught|unterrichten
tell|told|told|erzählen
think|thought|thought|denken
throw|threw|thrown|werfen
understand|understood|understood|verstehen
undertake|undertook|undertaken|unternehmen; übernehmen
wear|wore|worn|tragen (Kleidung)
win|won|won|gewinnen
withdraw|withdrew|withdrawn|zurückziehen; abheben (Geld)
write|wrote|written|schreiben
` }
  ]
};
/*DATA-END*/
