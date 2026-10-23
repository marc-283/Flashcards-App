/* ================= Theory: English grammar (B1–C1, with the typical mistakes of German speakers) =================
   Same block format as the Italian chapters; examples are [English, German] */
THEORY.en.push(
{ id: "tenses", sec: "verbs", title: TB("Zeitformen im Überblick", "Tenses at a glance"), sub: TB("Welche Zeit wofür – auf einen Blick", "Which tense for what – at a glance"), blocks: [
  ["table", { head: [TB("Zeitform", "Tense"), TB("Beispiel", "Example"), TB("Wofür?", "Used for")], say: 1, rows: [
    ["Present simple", "I work", TB("Gewohnheiten, Fakten, Fahrpläne", "habits, facts, timetables")],
    ["Present continuous", "I am working", TB("jetzt gerade, vorübergehend, feste Pläne", "right now, temporary, fixed plans")],
    ["Past simple", "I worked", TB("abgeschlossen, Zeitpunkt in der Vergangenheit", "finished, at a time in the past")],
    ["Past continuous", "I was working", TB("lief gerade in der Vergangenheit", "in progress in the past")],
    ["Present perfect", "I have worked", TB("Vergangenheit mit Bezug zu jetzt, ohne Zeitpunkt", "past with a link to now, no time given")],
    ["Present perfect continuous", "I have been working", TB("Dauer bis jetzt", "duration up to now")],
    ["Past perfect", "I had worked", TB("vor einem anderen Ereignis in der Vergangenheit", "before another past event")],
    ["will-future", "I will work", TB("spontane Entscheidung, Vorhersage, Versprechen", "spontaneous decision, prediction, promise")],
    ["going to", "I am going to work", TB("Absicht, Plan, sichtbare Anzeichen", "intention, plan, visible signs")]] }],
  ["tip", TB("Die drei Klassiker für Deutsche: <b>Gestern</b> immer Past simple (<i>I saw him yesterday</i>), <b>seit</b> immer Present perfect (<i>I have lived here since 2020</i>) und keine -ing-Form bei Zustandsverben (<i>I know</i>, nicht <i>I am knowing</i>).", "The three classics for German speakers: <b>yesterday</b> always takes the past simple (<i>I saw him yesterday</i>), <b>since/for</b> takes the present perfect (<i>I have lived here since 2020</i>), and state verbs have no -ing form (<i>I know</i>, not <i>I am knowing</i>).")],
  ["quiz", "en-tense"]
]},
{ id: "present", sec: "verbs", title: TB("Present simple & continuous", "Present simple & continuous"), sub: TB("I work oder I'm working?", "I work or I'm working?"), blocks: [
  ["table", { head: ["", "Present simple", "Present continuous"], rows: [
    [TB("Form", "Form"), "I work, she work<b>s</b>", "I am working, she is working"],
    [TB("Frage", "Question"), "Do you work? Does she work?", "Are you working?"],
    [TB("Verneinung", "Negative"), "I don't work, she doesn't work", "I'm not working"],
    [TB("Wofür?", "Used for"), TB("Gewohnheit, Fakt, Fahrplan", "habit, fact, timetable"), TB("jetzt, vorübergehend, Verabredung", "now, temporary, arrangement")],
    [TB("Signalwörter", "Signal words"), "always, usually, often, every day, on Mondays", "now, at the moment, currently, today, this week"]] }],
  ["ex", [["She works in a bank.", "Sie arbeitet in einer Bank."], ["She's working from home this week.", "Diese Woche arbeitet sie von zu Hause."], ["The train leaves at 8.15.", "Der Zug fährt um 8.15 Uhr."], ["I'm meeting Tom tomorrow.", "Ich treffe mich morgen mit Tom."]]],
  ["tip", TB("Das <b>-s</b> in der 3. Person (he/she/it works) ist der häufigste Fehler überhaupt.", "The <b>-s</b> in the third person (he/she/it works) is the most common mistake of all.")],
  ["p", TB("Zustandsverben stehen fast nie in der -ing-Form: know, understand, believe, like, love, hate, want, need, prefer, mean, belong, seem.", "State verbs are almost never used in the -ing form: know, understand, believe, like, love, hate, want, need, prefer, mean, belong, seem.")],
  ["ex", [["I know what you mean.", "Ich weiß, was du meinst."], ["Do you understand?", "Verstehst du?"]]]
]},
{ id: "pastperf", sec: "verbs", title: TB("Past simple oder Present perfect?", "Past simple or present perfect?"), sub: TB("„Ich habe gestern …“ – und since / for", "“Yesterday I …” – and since / for"), blocks: [
  ["p", TB("Das deutsche Perfekt ist kein Present perfect! Sobald ein <b>abgeschlossener Zeitpunkt</b> genannt oder gemeint ist, steht das Past simple.", "Past events with a <b>finished time</b> (stated or understood) take the past simple – even though German uses its perfect tense there.")],
  ["table", { head: ["Past simple", "Present perfect"], rows: [
    [TB("abgeschlossener Zeitpunkt", "finished time"), TB("kein Zeitpunkt, Bezug zur Gegenwart", "no time given, link to the present")],
    ["yesterday, last week, in 2019, two days ago, when …", "already, yet, ever, never, just, so far, since, for"],
    ["I <b>saw</b> the film last week.", "I <b>have</b> already <b>seen</b> the film."],
    ["She <b>left</b> the company in 2022.", TB("She <b>has left</b> the company. (Sie ist jetzt weg.)", "She <b>has left</b> the company. (She's gone now.)")]] }],
  ["h", TB("seit = since / for", "since vs. for")],
  ["p", TB("„seit“ mit Zeitpunkt → <b>since</b> (since Monday, since 2020), mit Zeitraum → <b>for</b> (for three years). Das Verb steht im Present perfect, nicht im Präsens!", "<b>since</b> + a point in time (since Monday, since 2020), <b>for</b> + a period (for three years). The verb goes in the present perfect, not the present!")],
  ["ex", [["I have lived here for five years.", "Ich wohne seit fünf Jahren hier."], ["We have known each other since school.", "Wir kennen uns seit der Schule."], ["I've been waiting for twenty minutes.", "Ich warte seit zwanzig Minuten."], ["Have you ever been to Italy?", "Warst du schon mal in Italien?"], ["I went to Italy last summer.", "Ich war letzten Sommer in Italien."]]],
  ["tip", TB("Falsch: <i>I live here since five years.</i> Richtig: <i>I have lived here for five years.</i>", "Wrong: <i>I live here since five years.</i> Right: <i>I have lived here for five years.</i>")],
  ["quiz", "en-ppps"]
]},
{ id: "pastcont", sec: "verbs", title: TB("Past continuous & past perfect", "Past continuous & past perfect"), sub: TB("was doing, had done", "was doing, had done"), blocks: [
  ["p", TB("<b>Past continuous</b> (was/were + -ing): Eine Handlung lief gerade, als etwas anderes passierte – oder zwei Dinge liefen gleichzeitig.", "<b>Past continuous</b> (was/were + -ing): an action was in progress when something else happened – or two things were going on at the same time.")],
  ["ex", [["I was cooking when you called.", "Ich habe gerade gekocht, als du angerufen hast."], ["While she was talking, I was checking my emails.", "Während sie redete, habe ich meine E-Mails gelesen."]]],
  ["p", TB("<b>Past perfect</b> (had + Partizip): etwas war <b>vorher</b> schon passiert – die Vorvergangenheit.", "<b>Past perfect</b> (had + participle): something had already happened <b>before</b> another past event.")],
  ["ex", [["When I arrived, the train had already left.", "Als ich ankam, war der Zug schon abgefahren."], ["She was nervous because she had never flown before.", "Sie war nervös, weil sie noch nie geflogen war."]]]
]},
{ id: "future", sec: "verbs", title: TB("Zukunft: will, going to & Co.", "Future: will, going to & co."), sub: TB("Vier Wege, über die Zukunft zu sprechen", "Four ways to talk about the future"), blocks: [
  ["table", { head: [TB("Form", "Form"), TB("Wofür?", "Used for"), TB("Beispiel", "Example")], say: 2, rows: [
    ["will", TB("spontane Entscheidung, Vorhersage, Versprechen, Angebot", "spontaneous decision, prediction, promise, offer"), "I'll help you. It will rain tomorrow."],
    ["going to", TB("Absicht, schon entschieden; sichtbare Anzeichen", "intention, already decided; visible evidence"), "I'm going to study abroad. Look at the clouds – it's going to rain."],
    ["present continuous", TB("feste Verabredung mit Zeit/Ort", "fixed arrangement with time/place"), "I'm meeting the client at 10."],
    ["present simple", TB("Fahrplan, Programm", "timetable, schedule"), "The meeting starts at 9."]] }],
  ["tip", TB("Nach when, if, as soon as, before, after steht im Englischen kein will: <i>I'll call you when I <b>arrive</b></i> (nicht: when I will arrive).", "No will after when, if, as soon as, before, after: <i>I'll call you when I <b>arrive</b></i> (not: when I will arrive).")]
]},
{ id: "cond", sec: "verbs", title: TB("If-Sätze (Conditionals)", "If-clauses (conditionals)"), sub: TB("Typ 0, 1, 2, 3 – und nie would im if-Teil", "Types 0, 1, 2, 3 – and never would in the if-clause"), blocks: [
  ["table", { head: [TB("Typ", "Type"), TB("if-Teil", "if-clause"), TB("Hauptsatz", "main clause"), TB("Beispiel", "Example")], say: 3, rows: [
    ["0", "present", "present", "If you heat ice, it melts."],
    ["1", "present", "will + inf.", "If it rains, I'll stay at home."],
    ["2", "past", "would + inf.", "If I had more time, I would travel more."],
    ["3", "past perfect", "would have + pp", "If I had known, I would have come."]] }],
  ["p", TB("Typ 1: realistisch. Typ 2: unwahrscheinlich oder erfunden (Gegenwart). Typ 3: verpasste Chance in der Vergangenheit.", "Type 1: realistic. Type 2: unlikely or imaginary (present). Type 3: missed chance in the past.")],
  ["tip", TB("<b>would</b> nie in den if-Teil: <i>If I <b>had</b> time …</i>, nicht <i>If I would have time …</i>. Bei be in Typ 2 sagt man förmlich <i>If I were you …</i>", "Never put <b>would</b> in the if-clause: <i>If I <b>had</b> time …</i>, not <i>If I would have time …</i>. With be in type 2 the formal form is <i>If I were you …</i>")],
  ["quiz", "en-cond"]
]},
{ id: "modals", sec: "verbs", title: TB("Modalverben", "Modal verbs"), sub: TB("must, mustn't, don't have to, should …", "must, mustn't, don't have to, should …"), blocks: [
  ["table", { head: [TB("Modalverb", "Modal"), TB("Bedeutung", "Meaning"), TB("Beispiel", "Example")], say: 2, rows: [
    ["can / could", TB("können; Bitte", "ability; request"), "Can you swim? Could you help me?"],
    ["be able to", TB("können (andere Zeiten)", "ability (other tenses)"), "I'll be able to come tomorrow."],
    ["must / have to", TB("müssen", "obligation"), "I have to leave at six."],
    ["mustn't", TB("nicht dürfen!", "not allowed!"), "You mustn't smoke here."],
    ["don't have to", TB("nicht müssen", "not necessary"), "You don't have to come."],
    ["should", TB("sollte", "advice"), "You should talk to her."],
    ["may / might", TB("vielleicht; dürfen", "possibility; permission"), "It might rain. May I come in?"],
    ["would like", TB("hätte gern", "would like"), "I'd like a coffee, please."]] }],
  ["tip", TB("Achtung: <b>mustn't</b> heißt „nicht dürfen“, nicht „nicht müssen“. „Ich muss nicht“ = <i>I don't have to</i>.", "Careful: <b>mustn't</b> means “not allowed to”. “Not necessary” is <i>don't have to</i>.")],
  ["quiz", "en-modal"]
]},
{ id: "passive", sec: "verbs", title: TB("Passiv", "Passive voice"), sub: TB("is made, was sent, has been done", "is made, was sent, has been done"), blocks: [
  ["p", TB("Form von <b>be</b> in der passenden Zeit + Partizip. Wer es tut, kommt mit <b>by</b>.", "A form of <b>be</b> in the right tense + participle. The doer comes with <b>by</b>.")],
  ["table", { head: [TB("Zeit", "Tense"), TB("Beispiel", "Example")], say: 1, rows: [
    ["present simple", "The reports are checked every week."], ["past simple", "The email was sent yesterday."], ["present perfect", "The contract has been signed."],
    ["will", "The results will be published on Monday."], ["modal", "The form must be completed online."]] }],
  ["ex", [["The project was finished on time.", "Das Projekt wurde rechtzeitig fertig."], ["English is spoken all over the world.", "Englisch wird auf der ganzen Welt gesprochen."], ["The meeting has been cancelled.", "Das Meeting wurde abgesagt."]]]
]},
{ id: "articles", sec: "words", title: TB("Artikel: a, an, the", "Articles: a, an, the"), sub: TB("… und wann gar keiner", "… and when to use none"), blocks: [
  ["p", TB("<b>a</b> oder <b>an</b> richtet sich nach dem <b>Laut</b>, nicht nach dem Buchstaben: an apple, an hour, an MBA – aber a university, a European, a one-way ticket.", "<b>a</b> or <b>an</b> depends on the <b>sound</b>, not the letter: an apple, an hour, an MBA – but a university, a European, a one-way ticket.")],
  ["table", { head: [TB("Situation", "Situation"), TB("Artikel", "Article"), TB("Beispiel", "Example")], say: 2, rows: [
    [TB("eins von vielen, erstmals erwähnt", "one of many, first mention"), "a / an", "I had an idea."],
    [TB("bestimmtes, bekanntes Ding", "specific, known thing"), "the", "The idea was good."],
    [TB("Beruf", "job"), "a / an", "She's an engineer."],
    [TB("allgemein: Plural, nicht zählbar", "general: plural, uncountable"), "–", "I like dogs. Life is short."],
    [TB("Mahlzeiten, Sprachen, Fächer", "meals, languages, subjects"), "–", "after lunch, in English, she studies economics"],
    [TB("Institutionen in ihrer Funktion", "institutions in their function"), "–", "at school, at university, in hospital, at work"]] }],
  ["tip", TB("Nicht zählbar – kein a, kein Plural: information, advice, news, furniture, equipment, feedback, research. Richtig: <i>some information, a piece of advice.</i>", "Uncountable – no a, no plural: information, advice, news, furniture, equipment, feedback, research. Right: <i>some information, a piece of advice.</i>")],
  ["quiz", "en-art"]
]},
{ id: "compare", sec: "words", title: TB("Steigerung", "Comparison"), sub: TB("bigger, more interesting, the best", "bigger, more interesting, the best"), blocks: [
  ["table", { head: [TB("Adjektiv", "Adjective"), TB("Komparativ", "Comparative"), TB("Superlativ", "Superlative")], rows: [
    [TB("kurz: cheap", "short: cheap"), "cheaper", "the cheapest"], [TB("auf -y: easy", "ending in -y: easy"), "easier", "the easiest"], [TB("lang: expensive", "long: expensive"), "more expensive", "the most expensive"],
    ["good", "better", "the best"], ["bad", "worse", "the worst"], ["far", "further / farther", "the furthest"]] }],
  ["ex", [["London is bigger than Munich.", "London ist größer als München."], ["This option is more expensive than the other one.", "Diese Option ist teurer als die andere."], ["It's not as easy as it looks.", "Es ist nicht so einfach, wie es aussieht."]]],
  ["tip", TB("„als“ = <b>than</b> (nicht then): bigger than. „so … wie“ = <b>as … as</b>.", "“als” = <b>than</b> (not then): bigger than. “so … wie” = <b>as … as</b>.")]
]},
{ id: "mistakes", sec: "phrases", title: TB("Typische Fehler von Deutschen", "Typical mistakes of German speakers"), sub: TB("make/do, say/tell, become, since, informations …", "make/do, say/tell, become, since, informations …"), blocks: [
  ["table", { head: [TB("Falsch", "Wrong"), TB("Richtig", "Right"), TB("Warum", "Why")], say: 1, rows: [
    ["I become a new laptop.", "I'm getting a new laptop.", TB("become = werden, nicht bekommen", "become = werden, not bekommen")],
    ["I live here since 2020.", "I have lived here since 2020.", TB("seit → Present perfect", "seit → present perfect")],
    ["Can you explain me this?", "Can you explain this to me?", TB("explain something to someone", "explain something to someone")],
    ["I make my homework.", "I do my homework.", TB("do: Aufgaben, Arbeit; make: etwas herstellen", "do: tasks, work; make: create something")],
    ["She said me the truth.", "She told me the truth.", TB("tell someone; say something", "tell someone; say something")],
    ["I'm looking forward to see you.", "I'm looking forward to seeing you.", TB("look forward to + -ing", "look forward to + -ing")],
    ["Thanks for the informations.", "Thanks for the information.", TB("nicht zählbar", "uncountable")],
    ["If I would know it …", "If I knew it …", TB("kein would im if-Teil", "no would in the if-clause")],
    ["He is with 30 the youngest.", "At 30, he is the youngest.", TB("Altersangabe mit at", "age with at")],
    ["Since when are you here?", "How long have you been here?", TB("Dauer → how long + Present perfect", "duration → how long + present perfect")]] }],
  ["p", TB("Weitere Verwechslungsgefahr findest du im Paket „False Friends“: actually, eventually, sensible, chef, gift …", "More traps are in the “False friends” pack: actually, eventually, sensible, chef, gift …")],
  ["quiz", "en-mistakes"]
]},
{ id: "irregular", sec: "verbs", title: TB("Unregelmäßige Verben", "Irregular verbs"), sub: TB("go – went – gone", "go – went – gone"), blocks: [
  ["p", TB("Past simple und Partizip musst du bei diesen Verben auswendig lernen. Das Partizip brauchst du für Present perfect, Past perfect und Passiv.", "You have to learn the past simple and participle of these verbs by heart. You need the participle for the present perfect, past perfect and passive.")],
  ["irr", {}],
  ["quiz", "en-irr"]
]}
);
