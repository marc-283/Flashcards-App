# PLM – Personal Language Management

Flashcards-App für Englisch, Italienisch und weitere Sprachen. Gleicher Aufbau wie PFM: eine Web-App, die offline läuft und sich auf dem iPhone wie eine normale App auf den Home-Bildschirm legen lässt.

## Auf GitHub Pages veröffentlichen

1. Neues Repository anlegen, z. B. `plm`.
2. Den **Inhalt** dieses Ordners hochladen (nicht den Ordner selbst), sodass `index.html` direkt im Repository liegt.
3. *Settings → Pages → Branch: main / root → Save*. Nach ein, zwei Minuten läuft die App unter `https://<name>.github.io/plm/`.
4. Auf dem iPhone in **Safari** öffnen → Teilen → **Zum Home-Bildschirm**.

Updates: Dateien im Repository ersetzen. Die App lädt die neue Version beim nächsten Öffnen mit Internet automatisch (der Cache-Name in `sw.js` ändert sich bei jedem Build).

## Was drin ist

- **Lernen mit Wiederholungsplan (FSRS)** – was du kannst, kommt seltener, was du vergisst, früher wieder. Neue Karten pro Tag je Sprache einstellbar.
- **Drei Antwortmodi:** Umdrehen, Tippen (prüft Akzente, Artikel, Tippfehler), Auswahl aus vier.
- **Kartenarten:** Vokabel (beide Richtungen), Verb mit Konjugationstabellen, Lückensatz (`Vado {{a}} Roma.`).
- **Konjugation:** Tabellen pro Zeit als eigene Wiederholungskarten + Schnelldrill einzelner Formen. Automatisches Ausfüllen für regelmäßige italienische und englische Verben.
- **Starter-Wortschatz:** Italienisch (Grundwortschatz, 45 Verben, Grammatik-Lückensätze), Englisch (Business & Uni, False Friends, Phrasal Verbs, 81 unregelmäßige Verben).
- **Import** aus Quizlet, Anki, Excel/Numbers oder einfach eingefügten Listen; Backup/Export als JSON und CSV.
- **Weitere Sprachen:** Spanisch, Französisch, Portugiesisch, Niederländisch, Schwedisch als Vorlage oder jede andere Sprache selbst angelegt.
- **Erinnerung:** täglicher Kalendertermin (.ics) und optional die Zahl fälliger Karten am App-Symbol.

Alle Daten bleiben auf dem Gerät. Regelmäßig unter *Einstellungen → Backup sichern* eine Sicherung in iCloud Drive ablegen.

## Selbst ändern

Der Quellcode liegt in `src/`. Nach Änderungen `python3 build.py` ausführen – das erzeugt `index.html`, `sw.js` und `manifest.webmanifest` neu. Tests der Lernlogik: `node test/core.test.js`.
