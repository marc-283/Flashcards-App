/* ================= Exercise material for the theory quizzes ================= */
const QZ = {};
/* Italian nouns: [word, gender (m/f, +p = plural), German, English] – articles are derived from the rules */
QZ.itNouns = [
  ["libro", "m", "Buch", "book"], ["studente", "m", "Student", "student"], ["zaino", "m", "Rucksack", "backpack"], ["amico", "m", "Freund", "friend"], ["albero", "m", "Baum", "tree"],
  ["casa", "f", "Haus", "house"], ["amica", "f", "Freundin", "friend (f.)"], ["idea", "f", "Idee", "idea"], ["sport", "m", "Sport", "sport"], ["psicologo", "m", "Psychologe", "psychologist"],
  ["gnocco", "m", "Gnocco (Klößchen)", "gnocco (dumpling)"], ["yogurt", "m", "Joghurt", "yoghurt"], ["zio", "m", "Onkel", "uncle"], ["ora", "f", "Stunde", "hour"], ["università", "f", "Universität", "university"],
  ["problema", "m", "Problem", "problem"], ["mano", "f", "Hand", "hand"], ["orologio", "m", "Uhr", "watch"], ["specchio", "m", "Spiegel", "mirror"], ["stazione", "f", "Bahnhof", "station"],
  ["aereo", "m", "Flugzeug", "plane"], ["treno", "m", "Zug", "train"], ["scuola", "f", "Schule", "school"], ["acqua", "f", "Wasser", "water"], ["uomo", "m", "Mann", "man"],
  ["pane", "m", "Brot", "bread"], ["chiave", "f", "Schlüssel", "key"], ["notte", "f", "Nacht", "night"], ["fiore", "m", "Blume", "flower"], ["telefono", "m", "Telefon", "phone"],
  ["zucchero", "m", "Zucker", "sugar"], ["sbaglio", "m", "Fehler", "mistake"], ["isola", "f", "Insel", "island"], ["euro", "m", "Euro", "euro"], ["sedia", "f", "Stuhl", "chair"],
  ["spettacolo", "m", "Vorstellung", "show"], ["studentessa", "f", "Studentin", "student (f.)"], ["insalata", "f", "Salat", "salad"], ["esame", "m", "Prüfung", "exam"], ["estate", "f", "Sommer", "summer"],
  ["libri", "mp", "Bücher", "books"], ["studenti", "mp", "Studenten", "students"], ["amici", "mp", "Freunde", "friends"], ["case", "fp", "Häuser", "houses"], ["amiche", "fp", "Freundinnen", "friends (f.)"],
  ["zaini", "mp", "Rucksäcke", "backpacks"], ["alberi", "mp", "Bäume", "trees"], ["uomini", "mp", "Männer", "men"], ["ragazzi", "mp", "Jungen", "boys"], ["ore", "fp", "Stunden", "hours"],
  ["spaghetti", "mp", "Spaghetti", "spaghetti"], ["esami", "mp", "Prüfungen", "exams"], ["chiavi", "fp", "Schlüssel (Pl.)", "keys"], ["zii", "mp", "Onkel (Pl.)", "uncles"], ["orologi", "mp", "Uhren", "watches"]
];
/* singular → plural, with article */
QZ.itPlural = [["il libro", "i libri"], ["la casa", "le case"], ["il fiore", "i fiori"], ["la chiave", "le chiavi"], ["l'amico", "gli amici"], ["l'amica", "le amiche"], ["il gioco", "i giochi"],
  ["lo studente", "gli studenti"], ["la città", "le città"], ["il caffè", "i caffè"], ["il problema", "i problemi"], ["la mano", "le mani"], ["l'uomo", "gli uomini"], ["l'uovo", "le uova"],
  ["il negozio", "i negozi"], ["lo zaino", "gli zaini"], ["la lezione", "le lezioni"], ["il bar", "i bar"], ["la foto", "le foto"], ["l'albero", "gli alberi"], ["la bicicletta", "le biciclette"],
  ["il ragazzo", "i ragazzi"], ["la ragazza", "le ragazze"], ["il lago", "i laghi"], ["l'idea", "le idee"], ["lo sport", "gli sport"], ["il film", "i film"], ["il medico", "i medici"],
  ["l'università", "le università"], ["la borsa", "le borse"], ["il treno", "i treni"], ["la notte", "le notti"], ["lo zio", "gli zii"], ["l'ora", "le ore"], ["il tedesco", "i tedeschi"]];
/* passato prossimo: auxiliary */
QZ.itAux = [["andare", "essere"], ["venire", "essere"], ["arrivare", "essere"], ["partire", "essere"], ["uscire", "essere"], ["entrare", "essere"], ["tornare", "essere"], ["restare", "essere"],
  ["rimanere", "essere"], ["stare", "essere"], ["essere", "essere"], ["nascere", "essere"], ["morire", "essere"], ["diventare", "essere"], ["piacere", "essere"], ["alzarsi", "essere"],
  ["divertirsi", "essere"], ["mangiare", "avere"], ["parlare", "avere"], ["fare", "avere"], ["dormire", "avere"], ["leggere", "avere"], ["scrivere", "avere"], ["comprare", "avere"],
  ["vedere", "avere"], ["prendere", "avere"], ["bere", "avere"], ["lavorare", "avere"], ["studiare", "avere"], ["avere", "avere"], ["dire", "avere"], ["aprire", "avere"], ["viaggiare", "avere"], ["ballare", "avere"]];
/* passato prossimo or imperfetto: [sentence, options, index of the right one, why] */
QZ.itPpImp = [
  ["Ieri ___ al cinema con Marco.", ["sono andato", "andavo"], 0, TB("Einmalig, mit Zeitpunkt (ieri).", "Once, at a specific time (ieri).")],
  ["Da bambino ___ sempre al mare.", ["sono andato", "andavo"], 1, TB("Gewohnheit (sempre, da bambino).", "Habit (sempre, da bambino).")],
  ["Mentre ___ , è arrivato Luca.", ["ho mangiato", "mangiavo"], 1, TB("Hintergrund: Was gerade lief.", "Background: what was going on.")],
  ["Mentre mangiavo, ___ Luca.", ["è arrivato", "arrivava"], 0, TB("Neue Handlung tritt ein.", "A new action happens.")],
  ["Quando ero piccolo, ___ biondo.", ["sono stato", "ero"], 1, TB("Beschreibung eines Zustands.", "Describing a state.")],
  ["L'anno scorso ___ due volte a Parigi.", ["sono stato", "ero"], 0, TB("Abgeschlossen, gezählt (due volte).", "Completed, counted (due volte).")],
  ["Che tempo faceva? – ___ e faceva freddo.", ["Ha piovuto", "Pioveva"], 1, TB("Wetter als Kulisse.", "Weather as background.")],
  ["Stamattina ___ un caffè al bar.", ["ho preso", "prendevo"], 0, TB("Einmalige Handlung heute Morgen.", "A single action this morning.")],
  ["Ogni sabato ___ a calcio con gli amici.", ["ho giocato", "giocavo"], 1, TB("Regelmäßige Gewohnheit (ogni sabato).", "Regular habit (ogni sabato).")],
  ["Ero stanco, quindi ___ a letto presto.", ["sono andato", "andavo"], 0, TB("Folge: eine abgeschlossene Handlung.", "Result: a completed action.")],
  ["La casa ___ grande e aveva un bel giardino.", ["è stata", "era"], 1, TB("Beschreibung.", "Description.")],
  ["Improvvisamente ___ il telefono.", ["è squillato", "squillava"], 0, TB("Plötzliches Ereignis (improvvisamente).", "Sudden event (improvvisamente).")]];
/* prepositions in context */
QZ.itPrepCtx = [
  ["Vado ___ medico.", ["dal", "al", "nel", "del"], 0], ["Abito ___ Roma.", ["a", "in", "da", "di"], 0], ["Sono ___ Germania.", ["in", "a", "da", "su"], 0],
  ["Il libro è ___ tavolo.", ["sul", "nel", "al", "del"], 0], ["Vado ___ treno.", ["in", "con", "a", "da"], 0], ["Torno ___ ufficio alle sei.", ["dall'", "dal", "nell'", "all'"], 0],
  ["Sono ___ Milano.", ["di", "da", "in", "su"], 0], ["Studio italiano ___ due anni.", ["da", "per", "in", "di"], 0], ["Ci vediamo ___ otto.", ["alle", "a", "le", "dalle"], 0],
  ["Il treno ___ Napoli parte alle nove.", ["per", "in", "a", "su"], 0], ["Metto il latte ___ frigorifero.", ["nel", "al", "sul", "dal"], 0], ["Vado ___ piedi.", ["a", "in", "con", "da"], 0]];
/* English: [sentence, options, index, why] */
QZ.enTense = [
  ["She ___ in London since 2020.", ["has lived", "lives", "lived", "is living"], 0, TB("since → Present perfect.", "since → present perfect.")],
  ["I ___ him yesterday.", ["saw", "have seen", "see", "had seen"], 0, TB("yesterday → Past simple.", "yesterday → past simple.")],
  ["Look! It ___ .", ["is snowing", "snows", "snowed", "has snowed"], 0, TB("Jetzt gerade → Present continuous.", "Right now → present continuous.")],
  ["He usually ___ the bus to work.", ["takes", "is taking", "took", "has taken"], 0, TB("Gewohnheit (usually) → Present simple.", "Habit (usually) → present simple.")],
  ["When I arrived, the meeting ___ already ___ .", ["had … started", "has … started", "was … starting", "did … start"], 0, TB("Vor einem Ereignis in der Vergangenheit → Past perfect.", "Before another past event → past perfect.")],
  ["I ___ dinner when you called.", ["was cooking", "cooked", "have cooked", "am cooking"], 0, TB("Lief gerade, als … → Past continuous.", "In progress when … → past continuous.")],
  ["___ you ever ___ sushi?", ["Have … eaten", "Did … eat", "Do … eat", "Are … eating"], 0, TB("ever ohne Zeitpunkt → Present perfect.", "ever, no time given → present perfect.")],
  ["The train ___ at 7.45 tomorrow.", ["leaves", "will be leaving", "is leaving", "has left"], 0, TB("Fahrplan → Present simple.", "Timetable → present simple.")],
  ["I'm tired. I ___ all day.", ["have been working", "worked", "work", "am working"], 0, TB("Dauer bis jetzt → Present perfect continuous.", "Duration up to now → present perfect continuous.")],
  ["I ___ my keys. I can't find them.", ["have lost", "lost", "was losing", "lose"], 0, TB("Ergebnis jetzt sichtbar → Present perfect.", "Result visible now → present perfect.")],
  ["We ___ to Spain last summer.", ["went", "have gone", "go", "had gone"], 0, TB("last summer → Past simple.", "last summer → past simple.")],
  ["I ___ what you mean.", ["know", "am knowing", "have known", "knew"], 0, TB("Zustandsverb → keine -ing-Form.", "State verb → no -ing form.")]];
QZ.enPpPs = [
  ["I ___ that film last week.", ["saw", "have seen"], 0], ["I ___ already ___ that film.", ["have … seen", "did … see"], 0], ["She ___ here for ten years.", ["has worked", "worked"], 0],
  ["They ___ married in 2015.", ["got", "have got"], 0], ["___ you finished the report yet?", ["Have", "Did"], 0], ["When ___ you arrive?", ["did", "have"], 0],
  ["I ___ never been to Japan.", ["have", "had"], 0], ["He ___ the company two years ago.", ["left", "has left"], 0], ["We ___ each other since university.", ["have known", "knew"], 0],
  ["I ___ just ___ an email from the client.", ["have … received", "did … receive"], 0]];
QZ.enCond = [
  ["If it ___ tomorrow, we'll stay at home.", ["rains", "will rain", "would rain", "rained"], 0, TB("Typ 1: if + present.", "Type 1: if + present.")],
  ["If I ___ more money, I would buy a flat.", ["had", "have", "would have", "will have"], 0, TB("Typ 2: if + past.", "Type 2: if + past.")],
  ["If I had known, I ___ you.", ["would have told", "would tell", "will tell", "told"], 0, TB("Typ 3: would have + Partizip.", "Type 3: would have + participle.")],
  ["If you heat water to 100 °C, it ___ .", ["boils", "will boil", "would boil", "boiled"], 0, TB("Typ 0: allgemeine Wahrheit.", "Type 0: general truth.")],
  ["If I ___ you, I would accept the offer.", ["were", "am", "would be", "will be"], 0, TB("Typ 2 mit be: If I were you.", "Type 2 with be: If I were you.")],
  ["We ___ the train if we hadn't left so late.", ["wouldn't have missed", "wouldn't miss", "won't miss", "didn't miss"], 0, TB("Typ 3.", "Type 3.")],
  ["I'll call you as soon as I ___ .", ["arrive", "will arrive", "would arrive", "arrived"], 0, TB("Kein will nach as soon as / when / if.", "No will after as soon as / when / if.")],
  ["What would you do if you ___ the lottery?", ["won", "win", "would win", "will win"], 0, TB("Typ 2: if + past.", "Type 2: if + past.")]];
QZ.enArt = [
  ["___ hour", ["an", "a"], 0], ["___ university", ["a", "an"], 0], ["___ MBA", ["an", "a"], 0], ["___ European country", ["a", "an"], 0], ["___ honest answer", ["an", "a"], 0], ["___ one-way ticket", ["a", "an"], 0],
  ["She's ___ engineer.", ["an", "the", "–"], 0], ["I love ___ music.", ["–", "the", "a"], 0], ["Can you pass me ___ salt, please?", ["the", "a", "–"], 0], ["He's at ___ work.", ["–", "the", "a"], 0],
  ["I need ___ information about the course.", ["some", "an", "a"], 0], ["___ sun rises in the east.", ["The", "A", "–"], 0], ["We had ___ lunch at noon.", ["–", "a", "the"], 0], ["She speaks ___ Italian.", ["–", "the", "an"], 0]];
QZ.enModal = [
  ["You ___ smoke here – it's forbidden.", ["mustn't", "don't have to", "shouldn't have"], 0], ["Tomorrow is a holiday, so we ___ work.", ["don't have to", "mustn't", "can't"], 0],
  ["You look tired. You ___ go to bed.", ["should", "must not", "may"], 0], ["___ you help me with this, please?", ["Could", "Must", "Should"], 0],
  ["Take an umbrella – it ___ rain.", ["might", "must", "should"], 0], ["I ___ swim when I was five.", ["could", "can", "was able"], 0],
  ["I'd like ___ a table for two.", ["to book", "booking", "book"], 0], ["Employees ___ wear a badge at all times.", ["have to", "don't have to", "might"], 0]];
QZ.enMistakes = [
  ["Which is right?", ["I'm getting a new phone.", "I become a new phone."], 0], ["Which is right?", ["Can you explain this to me?", "Can you explain me this?"], 0],
  ["Which is right?", ["She told me the truth.", "She said me the truth."], 0], ["Which is right?", ["I do my homework in the evening.", "I make my homework in the evening."], 0],
  ["Which is right?", ["I'm looking forward to seeing you.", "I'm looking forward to see you."], 0], ["Which is right?", ["Thanks for the information.", "Thanks for the informations."], 0],
  ["Which is right?", ["How long have you been here?", "Since when are you here?"], 0], ["Which is right?", ["If I knew, I would tell you.", "If I would know, I would tell you."], 0],
  ["Which is right?", ["This is cheaper than the other one.", "This is cheaper then the other one."], 0], ["Which is right?", ["Can you do me a favour?", "Can you make me a favour?"], 0]];
