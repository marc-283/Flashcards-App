/* Starter packs. One pack = one project (deck).
   Word lines: target | Deutsch | type | example | example (DE) | note
   type: nm/nf/n = noun, v verb, adj, adv, ph phrase, s sentence, x other. "# Topic" starts a topic. */
const STARTER = { it: [], en: [] };

STARTER.it.push({ id: "it-basis", name: "Grundwortschatz", desc: "Die wichtigsten Wörter für Alltag, Essen, Reisen, Uni und Arbeit – jedes mit Beispielsatz", parts: [{ kind: "words", data: `
# Begrüßung & Floskeln
ciao|hallo; tschüss|ph|Ciao Marco, come va?|Hallo Marco, wie läuft's?
buongiorno|guten Morgen; guten Tag|ph|Buongiorno, un caffè per favore.|Guten Morgen, einen Kaffee bitte.
buonasera|guten Abend|ph|Buonasera, avete un tavolo per due?|Guten Abend, haben Sie einen Tisch für zwei?
buonanotte|gute Nacht|ph|Buonanotte e sogni d'oro!|Gute Nacht und süße Träume!
arrivederci|auf Wiedersehen|ph|Grazie e arrivederci!|Danke und auf Wiedersehen!
a presto|bis bald|ph|Ci sentiamo, a presto!|Wir hören uns, bis bald!
grazie|danke|ph|Grazie per l'aiuto.|Danke für die Hilfe.
grazie mille|vielen Dank|ph|Grazie mille, sei molto gentile.|Vielen Dank, du bist sehr nett.
prego|bitte; gern geschehen|ph|Grazie! – Prego!|Danke! – Gern geschehen!|Antwort auf „grazie“ – oder „Bitte sehr“ beim Anbieten
per favore|bitte|ph|Un caffè, per favore.|Einen Kaffee, bitte.
scusa|Entschuldigung (du)|ph|Scusa, sai che ore sono?|Entschuldige, weißt du, wie spät es ist?
mi scusi|Entschuldigen Sie|ph|Mi scusi, dov'è la stazione?|Entschuldigen Sie, wo ist der Bahnhof?
va bene|in Ordnung; okay|ph|Ci vediamo alle otto? – Va bene!|Sehen wir uns um acht? – Okay!
d'accordo|einverstanden|ph|Sono d'accordo con te.|Ich bin deiner Meinung.
come stai?|wie geht es dir?|ph|Come stai oggi?|Wie geht es dir heute?
sto bene, grazie|mir geht es gut, danke|ph|Sto bene, grazie. E tu?|Mir geht's gut, danke. Und dir?
piacere|freut mich|ph|Piacere, sono Luca.|Freut mich, ich bin Luca.
non lo so|ich weiß es nicht|ph|Dov'è Paolo? – Non lo so.|Wo ist Paolo? – Ich weiß es nicht.
non capisco|ich verstehe nicht|ph|Scusi, non capisco. Può ripetere?|Entschuldigung, ich verstehe nicht. Können Sie das wiederholen?
può ripetere, per favore?|können Sie das bitte wiederholen?|ph|Non ho capito, può ripetere, per favore?|Ich habe es nicht verstanden, können Sie das bitte wiederholen?
quanto costa?|wie viel kostet das?|ph|Quanto costa questa borsa?|Wie viel kostet diese Tasche?
il conto, per favore|die Rechnung, bitte|ph|Scusi, il conto, per favore!|Entschuldigung, die Rechnung bitte!
dov'è il bagno?|wo ist die Toilette?|ph|Mi scusi, dov'è il bagno?|Entschuldigen Sie, wo ist die Toilette?
che ore sono?|wie spät ist es?|ph|Che ore sono? – Sono le tre.|Wie spät ist es? – Es ist drei Uhr.
in bocca al lupo|viel Glück|ph|Domani hai l'esame? In bocca al lupo!|Hast du morgen die Prüfung? Viel Glück!|Antwort: „Crepi!“
salute!|Gesundheit!; Prost!|ph|Etciù! – Salute!|Hatschi! – Gesundheit!|zum Anstoßen auch: Cin cin!
dai!|komm schon!; los!|ph|Dai, andiamo!|Komm, lass uns gehen!
magari|schön wär's; vielleicht|x|Vieni anche tu? – Magari!|Kommst du auch? – Schön wär's!
allora|also; dann|x|Allora, cosa facciamo stasera?|Also, was machen wir heute Abend?
comunque|jedenfalls; trotzdem|x|Fa freddo, ma esco comunque.|Es ist kalt, aber ich gehe trotzdem raus.
ecco|hier ist; da ist|x|Ecco il tuo caffè.|Hier ist dein Kaffee.
# Alltag
la casa|das Haus; das Zuhause|nf|Torno a casa.|Ich gehe nach Hause.
l'appartamento|die Wohnung|nm|Il mio appartamento è piccolo ma bello.|Meine Wohnung ist klein, aber schön.
la camera|das Zimmer|nf|La mia camera è al primo piano.|Mein Zimmer ist im ersten Stock.
la cucina|die Küche|nf|Siamo in cucina.|Wir sind in der Küche.
il bagno|das Bad; die Toilette|nm|Il bagno è a destra.|Das Bad ist rechts.
la chiave|der Schlüssel|nf|Dove sono le chiavi della macchina?|Wo sind die Autoschlüssel?
il letto|das Bett|nm|Stasera vado a letto presto.|Heute Abend gehe ich früh ins Bett.
la finestra|das Fenster|nf|Puoi aprire la finestra?|Kannst du das Fenster öffnen?
la porta|die Tür|nf|Chiudi la porta, per favore.|Mach bitte die Tür zu.
il cellulare|das Handy|nm|Ho dimenticato il cellulare a casa.|Ich habe mein Handy zu Hause vergessen.
il lavoro|die Arbeit|nm|Vado al lavoro in bici.|Ich fahre mit dem Rad zur Arbeit.
il tempo|die Zeit; das Wetter|nm|Che tempo fa?|Wie ist das Wetter?|Non ho tempo = Ich habe keine Zeit.
i soldi|das Geld|nm|Non ho soldi.|Ich habe kein Geld.|nur Plural
l'amico|der Freund|nm|È il mio migliore amico.|Er ist mein bester Freund.|weiblich: l'amica
la gente|die Leute|nf|La gente qui è molto simpatica.|Die Leute hier sind sehr nett.|Singular – das Verb steht im Singular!
la vita|das Leben|nf|La vita è bella.|Das Leben ist schön.
la cosa|die Sache; das Ding|nf|Ho molte cose da fare.|Ich habe viel zu tun.
il problema|das Problem|nm|Non c'è problema.|Kein Problem.|maskulin trotz -a
la domanda|die Frage|nf|Posso fare una domanda?|Darf ich eine Frage stellen?
la risposta|die Antwort|nf|Aspetto la tua risposta.|Ich warte auf deine Antwort.
il giorno|der Tag|nm|Lavoro otto ore al giorno.|Ich arbeite acht Stunden am Tag.
la settimana|die Woche|nf|Vado in palestra tre volte a settimana.|Ich gehe dreimal pro Woche ins Fitnessstudio.
il mese|der Monat|nm|Il prossimo mese vado in Italia.|Nächsten Monat fahre ich nach Italien.
l'anno|das Jahr|nm|Studio italiano da un anno.|Ich lerne seit einem Jahr Italienisch.
la mattina|der Morgen; der Vormittag|nf|La mattina bevo un caffè.|Morgens trinke ich einen Kaffee.
il pomeriggio|der Nachmittag|nm|Oggi pomeriggio sono libero.|Heute Nachmittag habe ich frei.
la sera|der Abend|nf|La sera guardo un film.|Abends schaue ich einen Film.
la notte|die Nacht|nf|Ho dormito bene questa notte.|Ich habe heute Nacht gut geschlafen.
oggi|heute|adv|Oggi fa caldo.|Heute ist es warm.
domani|morgen|adv|Ci vediamo domani.|Wir sehen uns morgen.
ieri|gestern|adv|Ieri sono stato al mare.|Gestern war ich am Meer.
adesso|jetzt|adv|Adesso non ho tempo.|Jetzt habe ich keine Zeit.
sempre|immer|adv|Arrivi sempre in ritardo!|Du kommst immer zu spät!
mai|nie|adv|Non bevo mai caffè.|Ich trinke nie Kaffee.|mit „non“ davor
spesso|oft|adv|Vado spesso al cinema.|Ich gehe oft ins Kino.
ancora|noch; wieder|adv|Sei ancora a casa?|Bist du noch zu Hause?
già|schon|adv|Hai già mangiato?|Hast du schon gegessen?
subito|sofort|adv|Arrivo subito!|Ich komme sofort!
presto|früh; bald|adv|Domani mi alzo presto.|Morgen stehe ich früh auf.
tardi|spät|adv|È tardi, devo andare.|Es ist spät, ich muss gehen.
qui|hier|adv|Abito qui vicino.|Ich wohne hier in der Nähe.
lì|dort|adv|Il bar è lì, a destra.|Die Bar ist dort, rechts.
molto|sehr; viel|adv|Mi piace molto l'Italia.|Ich mag Italien sehr.
poco|wenig|adv|Ho poco tempo oggi.|Ich habe heute wenig Zeit.
troppo|zu viel; zu sehr|adv|Questo caffè è troppo dolce.|Dieser Kaffee ist zu süß.
anche|auch|adv|Vengo anch'io!|Ich komme auch!
solo|nur; allein|adv|Ho solo cinque minuti.|Ich habe nur fünf Minuten.
# Essen & Trinken
il caffè|der Kaffee|nm|Prendo un caffè al bar.|Ich trinke einen Kaffee in der Bar.
l'acqua|das Wasser|nf|Un bicchiere d'acqua, per favore.|Ein Glas Wasser, bitte.|frizzante = mit Kohlensäure, naturale = still
il vino|der Wein|nm|Un bicchiere di vino rosso, per favore.|Ein Glas Rotwein, bitte.
la birra|das Bier|nf|Prendiamo una birra?|Trinken wir ein Bier?
il pane|das Brot|nm|Compro il pane ogni mattina.|Ich kaufe jeden Morgen Brot.
il formaggio|der Käse|nm|Mi piace molto il formaggio.|Ich mag Käse sehr.
la carne|das Fleisch|nf|Non mangio carne.|Ich esse kein Fleisch.
il pesce|der Fisch|nm|Stasera mangiamo pesce.|Heute Abend essen wir Fisch.
la verdura|das Gemüse|nf|Mangio verdura ogni giorno.|Ich esse jeden Tag Gemüse.
la frutta|das Obst|nf|A colazione mangio frutta.|Zum Frühstück esse ich Obst.
la mela|der Apfel|nf|Vorrei un chilo di mele.|Ich hätte gern ein Kilo Äpfel.
il pomodoro|die Tomate|nm|La pasta al pomodoro è semplice e buona.|Nudeln mit Tomatensoße sind einfach und lecker.
il latte|die Milch|nm|Bevo il caffè con il latte.|Ich trinke den Kaffee mit Milch.
lo zucchero|der Zucker|nm|Il caffè senza zucchero, per favore.|Den Kaffee ohne Zucker, bitte.
il sale|das Salz|nm|Mi passi il sale?|Gibst du mir das Salz?
l'olio|das Öl|nm|Un filo d'olio e un po' di sale.|Ein Schuss Öl und etwas Salz.
il gelato|das Eis (Speiseeis)|nm|Un gelato al pistacchio, per favore.|Ein Pistazieneis, bitte.
la colazione|das Frühstück|nf|Faccio colazione alle otto.|Ich frühstücke um acht.
il pranzo|das Mittagessen|nm|A pranzo mangio un panino.|Mittags esse ich ein belegtes Brötchen.
la cena|das Abendessen|nf|Vieni a cena da me stasera?|Kommst du heute Abend zum Essen zu mir?
il piatto|der Teller; das Gericht|nm|Qual è il piatto del giorno?|Was ist das Tagesgericht?
il bicchiere|das Glas (Trinkglas)|nm|Posso avere un altro bicchiere?|Kann ich noch ein Glas haben?
la forchetta|die Gabel|nf|Scusi, mi manca la forchetta.|Entschuldigung, mir fehlt die Gabel.
il coltello|das Messer|nm|Questo coltello non taglia.|Dieses Messer schneidet nicht.
il cucchiaio|der Löffel|nm|Mi serve un cucchiaio per la zuppa.|Ich brauche einen Löffel für die Suppe.
la mancia|das Trinkgeld|nf|Lasciamo la mancia?|Lassen wir Trinkgeld da?
il cameriere|der Kellner|nm|Il cameriere è molto gentile.|Der Kellner ist sehr freundlich.
buono|gut; lecker|adj|Questa pizza è buonissima!|Diese Pizza ist super lecker!
avere fame|Hunger haben|ph|Hai fame? Andiamo a mangiare.|Hast du Hunger? Lass uns essen gehen.
avere sete|Durst haben|ph|Ho sete, prendo un'acqua.|Ich habe Durst, ich nehme ein Wasser.
# Reisen & Stadt
il treno|der Zug|nm|Il treno parte alle nove.|Der Zug fährt um neun ab.
la stazione|der Bahnhof|nf|La stazione è lontana?|Ist der Bahnhof weit weg?
l'aereo|das Flugzeug|nm|Vado a Roma in aereo.|Ich fliege nach Rom.
l'aeroporto|der Flughafen|nm|Come arrivo all'aeroporto?|Wie komme ich zum Flughafen?
il biglietto|die Fahrkarte; das Ticket|nm|Un biglietto per Milano, per favore.|Eine Fahrkarte nach Mailand, bitte.
la valigia|der Koffer|nf|La mia valigia è troppo pesante.|Mein Koffer ist zu schwer.
il viaggio|die Reise|nm|Buon viaggio!|Gute Reise!
l'albergo|das Hotel|nm|L'albergo è vicino al centro.|Das Hotel ist in der Nähe des Zentrums.
la strada|die Straße|nf|Questa strada va in centro?|Führt diese Straße ins Zentrum?
la piazza|der Platz|nf|Ci vediamo in piazza alle sei.|Wir treffen uns um sechs auf dem Platz.
la città|die Stadt|nf|Firenze è una città bellissima.|Florenz ist eine wunderschöne Stadt.
il paese|das Land; das Dorf|nm|Vengo da un piccolo paese.|Ich komme aus einem kleinen Dorf.
il mare|das Meer|nm|D'estate andiamo al mare.|Im Sommer fahren wir ans Meer.
la spiaggia|der Strand|nf|Andiamo in spiaggia?|Gehen wir an den Strand?
la montagna|der Berg; das Gebirge|nf|D'inverno vado in montagna.|Im Winter fahre ich in die Berge.
a destra|rechts|adv|Al semaforo gira a destra.|An der Ampel biegst du rechts ab.
a sinistra|links|adv|Il museo è a sinistra.|Das Museum ist links.
dritto|geradeaus|adv|Vai sempre dritto.|Geh immer geradeaus.
vicino|nah; in der Nähe|adj|C'è un bar qui vicino?|Gibt es hier in der Nähe eine Bar?
lontano|weit (entfernt)|adj|Il centro è lontano da qui?|Ist das Zentrum weit von hier?
la fermata|die Haltestelle|nf|Dov'è la fermata dell'autobus?|Wo ist die Bushaltestelle?
l'autobus|der Bus|nm|Prendo l'autobus numero cinque.|Ich nehme den Bus Nummer fünf.
la macchina|das Auto|nf|Vado al lavoro in macchina.|Ich fahre mit dem Auto zur Arbeit.
il negozio|das Geschäft; der Laden|nm|I negozi chiudono alle otto.|Die Geschäfte schließen um acht.
la farmacia|die Apotheke|nf|C'è una farmacia aperta?|Gibt es eine geöffnete Apotheke?
l'ospedale|das Krankenhaus|nm|L'ospedale è in fondo alla strada.|Das Krankenhaus ist am Ende der Straße.
la banca|die Bank (Geldinstitut)|nf|La banca apre alle otto e mezza.|Die Bank öffnet um halb neun.
la chiesa|die Kirche|nf|La chiesa è in piazza.|Die Kirche ist auf dem Platz.
il museo|das Museum|nm|Il museo è chiuso il lunedì.|Das Museum ist montags geschlossen.
l'indirizzo|die Adresse|nm|Qual è il tuo indirizzo?|Wie ist deine Adresse?
# Familie & Menschen
la famiglia|die Familie|nf|La mia famiglia vive in Germania.|Meine Familie lebt in Deutschland.
la madre|die Mutter|nf|Mia madre è insegnante.|Meine Mutter ist Lehrerin.|mia madre – ohne Artikel bei Familie im Singular
il padre|der Vater|nm|Mio padre lavora in banca.|Mein Vater arbeitet bei einer Bank.
i genitori|die Eltern|nm|I miei genitori abitano a Monaco.|Meine Eltern wohnen in München.
il fratello|der Bruder|nm|Ho un fratello e una sorella.|Ich habe einen Bruder und eine Schwester.
la sorella|die Schwester|nf|Mia sorella studia medicina.|Meine Schwester studiert Medizin.
il figlio|der Sohn|nm|Hanno un figlio di tre anni.|Sie haben einen dreijährigen Sohn.
la figlia|die Tochter|nf|La loro figlia si chiama Giulia.|Ihre Tochter heißt Giulia.
il nonno|der Großvater|nm|Mio nonno ha ottant'anni.|Mein Großvater ist achtzig.
la nonna|die Großmutter|nf|La nonna cucina benissimo.|Oma kocht hervorragend.
il ragazzo|der Junge; der Freund (Partner)|nm|Il ragazzo di Anna è simpatico.|Annas Freund ist nett.
la ragazza|das Mädchen; die Freundin (Partnerin)|nf|Quella ragazza è mia cugina.|Das Mädchen dort ist meine Cousine.
l'uomo|der Mann; der Mensch|nm|Chi è quell'uomo?|Wer ist dieser Mann?|Plural: gli uomini
la donna|die Frau|nf|Quella donna è la mia professoressa.|Diese Frau ist meine Professorin.
il bambino|das Kind|nm|I bambini giocano nel parco.|Die Kinder spielen im Park.
# Uni & Arbeit
l'università|die Universität|nf|Vado all'università in bici.|Ich fahre mit dem Rad zur Uni.
lo studente|der Student|nm|Sono uno studente di economia.|Ich bin Wirtschaftsstudent.|weiblich: la studentessa
la lezione|die Vorlesung; die Unterrichtsstunde|nf|La lezione comincia alle dieci.|Die Vorlesung beginnt um zehn.
l'esame|die Prüfung|nm|Domani ho un esame.|Morgen habe ich eine Prüfung.
il libro|das Buch|nm|Sto leggendo un libro molto interessante.|Ich lese gerade ein sehr interessantes Buch.
la tesi|die Abschlussarbeit|nf|Sto scrivendo la tesi.|Ich schreibe gerade meine Abschlussarbeit.
il corso|der Kurs|nm|Faccio un corso d'italiano.|Ich mache einen Italienischkurs.
la riunione|die Besprechung; das Meeting|nf|La riunione è alle tre.|Die Besprechung ist um drei.
l'ufficio|das Büro|nm|Oggi lavoro da casa, non in ufficio.|Heute arbeite ich von zu Hause, nicht im Büro.
il collega|der Kollege|nm|I miei colleghi sono simpatici.|Meine Kollegen sind nett.|weiblich: la collega
l'azienda|das Unternehmen; die Firma|nf|Lavoro in un'azienda tedesca.|Ich arbeite in einem deutschen Unternehmen.
lo stipendio|das Gehalt|nm|Lo stipendio arriva a fine mese.|Das Gehalt kommt am Monatsende.
il capo|der Chef|nm|Il mio capo è in ferie.|Mein Chef ist im Urlaub.
la scadenza|die Frist; die Deadline|nf|La scadenza è venerdì.|Die Frist endet am Freitag.
# Eigenschaften
grande|groß|adj|Milano è una città grande.|Mailand ist eine große Stadt.
piccolo|klein|adj|Ho un appartamento piccolo.|Ich habe eine kleine Wohnung.
bello|schön|adj|Che bella giornata!|Was für ein schöner Tag!
brutto|hässlich|adj|Oggi fa brutto tempo.|Heute ist schlechtes Wetter.|auch: schlecht (Wetter)
nuovo|neu|adj|Ho un telefono nuovo.|Ich habe ein neues Handy.
vecchio|alt|adj|Questa macchina è vecchia.|Dieses Auto ist alt.
giovane|jung|adj|Il professore è molto giovane.|Der Professor ist sehr jung.
caldo|warm; heiß|adj|Oggi fa molto caldo.|Heute ist es sehr heiß.
freddo|kalt|adj|L'acqua è fredda.|Das Wasser ist kalt.
facile|leicht; einfach|adj|Questo esercizio è facile.|Diese Übung ist leicht.
difficile|schwierig|adj|L'esame è stato difficile.|Die Prüfung war schwierig.
caro|teuer; lieb|adj|A Milano tutto è caro.|In Mailand ist alles teuer.
economico|günstig; billig|adj|Questo ristorante è economico.|Dieses Restaurant ist günstig.
stanco|müde|adj|Sono stanco morto.|Ich bin todmüde.
contento|zufrieden; froh|adj|Sono contento di vederti.|Ich freue mich, dich zu sehen.
triste|traurig|adj|Perché sei triste?|Warum bist du traurig?
pieno|voll|adj|Il bar è pieno di gente.|Die Bar ist voller Leute.
vuoto|leer|adj|Il frigo è vuoto.|Der Kühlschrank ist leer.
aperto|offen; geöffnet|adj|Il supermercato è aperto la domenica?|Hat der Supermarkt sonntags geöffnet?
chiuso|geschlossen|adj|Il negozio è chiuso.|Das Geschäft ist geschlossen.
lungo|lang|adj|È una storia lunga.|Das ist eine lange Geschichte.
corto|kurz|adj|Ho i capelli corti.|Ich habe kurze Haare.
veloce|schnell|adj|Il treno è veloce.|Der Zug ist schnell.
lento|langsam|adj|Internet oggi è lentissimo.|Das Internet ist heute extrem langsam.
importante|wichtig|adj|È molto importante.|Das ist sehr wichtig.
libero|frei|adj|Scusa, è libero questo posto?|Entschuldige, ist dieser Platz frei?
occupato|besetzt; beschäftigt|adj|Il bagno è occupato.|Die Toilette ist besetzt.
pronto|bereit; fertig|adj|La cena è pronta!|Das Abendessen ist fertig!|am Telefon: Pronto? = Hallo?
simpatico|sympathisch; nett|adj|Il tuo amico è molto simpatico.|Dein Freund ist sehr nett.
gentile|freundlich; höflich|adj|Grazie, è molto gentile.|Danke, das ist sehr freundlich.
# Kleine Wörter
chi?|wer?|x|Chi è?|Wer ist das?
che cosa?|was?|x|Che cosa fai stasera?|Was machst du heute Abend?
dove?|wo?|x|Dove abiti?|Wo wohnst du?
quando?|wann?|x|Quando parti?|Wann fährst du ab?
perché|warum; weil|x|Perché no?|Warum nicht?
come?|wie?|x|Come si dice in italiano?|Wie sagt man das auf Italienisch?
quanto?|wie viel?|x|Quanto costa il biglietto?|Wie viel kostet die Fahrkarte?
quale?|welche(r/s)?|x|Quale preferisci, il rosso o il blu?|Welchen magst du lieber, den roten oder den blauen?
ma|aber|x|È caro, ma è buono.|Es ist teuer, aber gut.
però|aber; jedoch|x|Mi piace, però è troppo caro.|Es gefällt mir, aber es ist zu teuer.
o|oder|x|Caffè o tè?|Kaffee oder Tee?
e|und|x|Io e Marco andiamo al cinema.|Marco und ich gehen ins Kino.
se|wenn; ob|x|Se piove, restiamo a casa.|Wenn es regnet, bleiben wir zu Hause.
quindi|also; deshalb|x|Piove, quindi prendo l'ombrello.|Es regnet, deshalb nehme ich den Schirm.
mentre|während|x|Ascolto musica mentre cucino.|Ich höre Musik, während ich koche.
con|mit|x|Vado al cinema con Anna.|Ich gehe mit Anna ins Kino.
senza|ohne|x|Un caffè senza zucchero.|Einen Kaffee ohne Zucker.
per|für|x|Questo regalo è per te.|Dieses Geschenk ist für dich.
fra|zwischen; in (zeitlich)|x|Ci vediamo fra due giorni.|Wir sehen uns in zwei Tagen.|auch: tra
# Zahlen
uno|eins|x|Un caffè e una brioche.|Einen Kaffee und ein Croissant.|vor Nomen: un / una
due|zwei|x|Due biglietti, per favore.|Zwei Fahrkarten, bitte.
tre|drei|x|Ho tre fratelli.|Ich habe drei Geschwister.
quattro|vier|x|Siamo in quattro.|Wir sind zu viert.
cinque|fünf|x|Arrivo fra cinque minuti.|Ich bin in fünf Minuten da.
sei|sechs|x|Ci vediamo alle sei.|Wir sehen uns um sechs.|auch: (tu) sei = du bist
sette|sieben|x|Una settimana ha sette giorni.|Eine Woche hat sieben Tage.
otto|acht|x|Mi alzo alle otto.|Ich stehe um acht auf.
nove|neun|x|La lezione è alle nove.|Der Unterricht ist um neun.
dieci|zehn|x|Sono le dieci.|Es ist zehn Uhr.
undici|elf|x|Una squadra di calcio ha undici giocatori.|Eine Fußballmannschaft hat elf Spieler.
dodici|zwölf|x|Un anno ha dodici mesi.|Ein Jahr hat zwölf Monate.
venti|zwanzig|x|Costa venti euro.|Es kostet zwanzig Euro.
trenta|dreißig|x|Settembre ha trenta giorni.|Der September hat dreißig Tage.
cento|hundert|x|Cento grammi di prosciutto, per favore.|Hundert Gramm Schinken, bitte.
mille|tausend|x|Grazie mille!|Tausend Dank!
` }] });
