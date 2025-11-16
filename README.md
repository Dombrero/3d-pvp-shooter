# 3D Ego-Shooter 🎯 (Multiplayer)

Ein webbasierter 3D First-Person Shooter mit Multiplayer-Funktionalität, erstellt mit Three.js und PeerJS.

## 🚀 Installation & Start

### Option 1: Mit npm (empfohlen)
```bash
npm install
npm start
```

### Option 2: Mit Python
```bash
# Python 3
python -m http.server 8080

# Dann im Browser öffnen: http://localhost:8080
```

### Option 3: GitHub Pages (für Multiplayer empfohlen)
1. Lade alle Dateien auf GitHub hoch
2. Gehe zu Repository Settings → Pages
3. Wähle den Branch aus (meist `main`)
4. Speichere - deine Seite ist unter `https://dein-username.github.io/repository-name` verfügbar
5. Teile diese URL mit deinem Freund für Multiplayer!

### Option 4: Direkt öffnen
Einfach die `index.html` Datei im Browser öffnen (moderne Browser mit ES6-Modul-Support erforderlich).
**Hinweis:** Multiplayer funktioniert nur über HTTP/HTTPS, nicht über `file://`

## 🎮 Steuerung

- **WASD**: Bewegen
- **Maus**: Schauen (First-Person-Kamera)
- **Linksklick**: Schießen
- **R**: Nachladen

## 🌐 Multiplayer

### Lobby hosten:
1. Klicke auf "Lobby hosten"
2. Teile die Lobby-ID mit deinem Freund
3. Warte bis dein Freund beitritt
4. Starte das Spiel

### Lobby beitreten:
1. Klicke auf "Lobby beitreten"
2. Gib die Lobby-ID ein, die dir dein Freund gegeben hat
3. Klicke auf "Verbinden"
4. Warte bis der Host das Spiel startet

## 🎯 Spielziel

- Eliminiere alle Feinde!
- Nutze deine Waffe strategisch
- Überlebe so lange wie möglich
- Sammle so viele Kills wie möglich

## 🛠️ Technologien

- **Three.js**: 3D-Grafik und Rendering
- **PeerJS**: Peer-to-Peer Multiplayer-Verbindungen
- **WebGL**: Hardware-beschleunigte 3D-Grafik
- **Raycasting**: Präzise Treffererkennung
- **Vanilla JavaScript**: Keine zusätzlichen Frameworks nötig

## 📝 Features

- ✅ **Multiplayer-Modus**: Spiele mit einem Freund zusammen!
  - Lobby-System (Host/Join)
  - Echtzeit-Synchronisation von Spieler-Positionen
  - Synchronisierte Feinde und Schüsse
  - Anderer Spieler wird als blaue Figur angezeigt
- ✅ First-Person-Kamera mit Maus-Look
- ✅ Realistische Bewegungssteuerung
- ✅ Schieß-Mechanik mit Raycasting
- ✅ Feinde mit KI (verfolgen den Spieler)
- ✅ Partikeleffekte (Mündungsfeuer, Impact)
- ✅ Munitions- und Health-System
- ✅ Score-System (Kills)
- ✅ Moderne FPS-UI mit Fadenkreuz
- ✅ Waffen-Visualisierung

## 🎨 Anpassungen

Du kannst das Spiel leicht anpassen:
- Feind-Anzahl und -Geschwindigkeit in `game.js` ändern
- Schaden und Munition anpassen
- Neue Waffen oder Features hinzufügen
- Arena-Größe ändern

Viel Spaß beim Spielen! 🎮
