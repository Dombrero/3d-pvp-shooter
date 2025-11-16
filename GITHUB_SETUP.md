# GitHub Setup Anleitung 🚀

## Schritt 1: GitHub Repository erstellen

1. Gehe zu [github.com](https://github.com) und logge dich ein
2. Klicke auf das **+** Symbol oben rechts → **New repository**
3. Gib einen Namen ein (z.B. `3d-ego-shooter`)
4. Wähle **Public** (für kostenloses GitHub Pages)
5. **NICHT** "Initialize with README" ankreuzen (du hast schon Dateien)
6. Klicke auf **Create repository**

## Schritt 2: Git im Projekt initialisieren

Öffne ein Terminal/PowerShell im Projektordner und führe aus:

```bash
# Git initialisieren
git init

# Alle Dateien hinzufügen
git add .

# Ersten Commit erstellen
git commit -m "Initial commit: 3D Ego-Shooter mit Multiplayer"

# GitHub Repository als Remote hinzufügen
# ERsetze USERNAME und REPO-NAME mit deinen Werten!
git remote add origin https://github.com/USERNAME/REPO-NAME.git

# Auf GitHub pushen
git branch -M main
git push -u origin main
```

**Wichtig:** Ersetze `USERNAME` mit deinem GitHub-Benutzernamen und `REPO-NAME` mit dem Namen deines Repositories!

## Schritt 3: GitHub Pages aktivieren

1. Gehe zu deinem Repository auf GitHub
2. Klicke auf **Settings** (oben rechts)
3. Scrolle runter zu **Pages** (links im Menü)
4. Unter **Source** wähle **Deploy from a branch**
5. Wähle **main** als Branch
6. Wähle **/ (root)** als Folder
7. Klicke **Save**

## Schritt 4: Deine Seite ist live! 🎉

Nach ein paar Minuten ist deine Seite verfügbar unter:
```
https://USERNAME.github.io/REPO-NAME
```

Teile diese URL mit deinem Freund für Multiplayer!

## Beispiel-Befehle

Wenn dein GitHub-Username `maxmustermann` ist und das Repository `3d-shooter` heißt:

```bash
git remote add origin https://github.com/maxmustermann/3d-shooter.git
git push -u origin main
```

Die Seite wäre dann: `https://maxmustermann.github.io/3d-shooter`

## Troubleshooting

### "Repository already exists" Fehler
```bash
git remote remove origin
git remote add origin https://github.com/USERNAME/REPO-NAME.git
```

### Dateien nicht committed
```bash
git status  # Zeigt welche Dateien noch nicht committed sind
git add .   # Fügt alle Dateien hinzu
git commit -m "Deine Nachricht"
git push    # Pusht die Änderungen
```

### GitHub Pages zeigt nichts
- Warte 1-2 Minuten (kann etwas dauern)
- Prüfe ob der Branch `main` heißt (nicht `master`)
- Stelle sicher, dass `index.html` im Root-Ordner ist

