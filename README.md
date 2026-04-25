# My Active Morning Routine

Bodyweight-Trainingsplan-App mit KI-gestützter Plananpassung. 5 Trainingstage (Mo–Fr), automatischer Timer mit Satz-/Seiten-Tracking und ein Chat-Assistent der den Plan auf Zuruf umbaut.

## Features

- **5 Trainingstage** mit Warmup, Training, Cooldown
- **Automatischer Flow** — Workout starten, läuft durch alle Übungen inkl. Sätze, Seiten und Pausen
- **Control Bar** mit Zurück, Neustart, Play/Pause, Skip
- **Satz- und Seiten-Tracking** innerhalb einer Übungskarte (keine separaten Einträge)
- **Akustischer Countdown** in den letzten 3 Sekunden jeder Phase
- **KI-Chat** zum Anpassen des Plans (Übungen tauschen, Dauer ändern, Fokus setzen, ganzen Wochenplan umbauen)
- **Bestätigungs-Flow** — KI-Änderungen werden als Vorschlag angezeigt, erst nach Bestätigung übernommen
- **Persistenz** — Trainingsplan und Chat-Historie in localStorage, überlebt Page-Reloads
- **Wake Lock** — verhindert Bildschirm-Abdunklung während des Trainings (iOS Safari + PWA kompatibel)
- **YouTube-Links** pro Übung für Video-Anleitungen
- **Mobile-first** mit Safe-Area-Support (Dynamic Island, Home-Indicator)

## Struktur

Jeder Trainingstag hat drei Sektionen:

| Sektion | Inhalt |
|---------|--------|
| **Warmup** | Aufwärmen, Mobilisation, Aktivierung |
| **Training** | Kraft, Core, Mobility, HIIT — je nach Tagesfokus |
| **Cooldown** | Dehnung, Entspannung, Runterkommen |

Der KI-Chat kann den Inhalt jeder Sektion frei anpassen.

## Setup

### 1. Repository klonen

```bash
git clone <repo-url>
cd My-Active-Morning-Routine
npm install
```

### 2. Anthropic API Key

Für den KI-Chat wird ein [Anthropic API Key](https://console.anthropic.com/) benötigt.

```bash
cp .env.example .env.local
# ANTHROPIC_API_KEY=sk-ant-... eintragen
```

### 3. Lokal starten

```bash
# Nur Frontend (Chat funktioniert nicht ohne API-Proxy)
npm run dev

# Mit API-Proxy (empfohlen)
npx vercel dev
```

## Deployment auf Vercel

1. Repo auf GitHub pushen
2. [vercel.com/new](https://vercel.com/new) → Repo importieren
3. Environment Variable setzen: `ANTHROPIC_API_KEY` = `sk-ant-...`
4. Deploy

Vercel erkennt Vite automatisch. Die Serverless Function unter `api/chat.js` proxied die Anthropic API serverseitig.

## Projektstruktur

```
├── api/
│   └── chat.js              # Vercel Serverless Function (Anthropic Proxy, 60s Timeout)
├── public/
│   ├── favicon.svg
│   ├── favicon-192.png
│   ├── favicon-512.png
│   └── manifest.json         # PWA Manifest
├── src/
│   ├── App.jsx               # Haupt-App (Workout + Chat)
│   ├── index.css              # Tailwind + Fonts
│   └── main.jsx               # React Entry Point
├── index.html
├── package.json
├── vercel.json                # Vercel Config
├── vite.config.js
├── tailwind.config.js
└── postcss.config.js
```

## KI-Chat

Der Chat-Assistent kann:

- Einzelne Übungen tauschen, hinzufügen oder entfernen
- Sätze, Zeiten und Pausen anpassen
- Fokus auf Muskelgruppen setzen (z.B. "Mehr Schultern am Montag")
- Kompletten Wochenplan umbauen (z.B. "Mach alles zu HIIT")
- Schwierigkeitsgrad anpassen

Änderungen werden als Vorschlagskarten im Chat angezeigt. Jeder Vorschlag kann einzeln übernommen oder verworfen werden. Bei mehreren Tagen gibt es einen "Alle übernehmen"-Button. Der Status (übernommen/verworfen) bleibt in der Chat-Historie sichtbar.

### Zurücksetzen

- **Chat leeren**: Im Chat-Header
- **Plan auf Standard zurücksetzen**: Am Ende der Übungsliste — stellt den Original-Trainingsplan wieder her

## Technische Details

### Wake Lock (iOS Safari)

Dual-Strategie: Screen Wake Lock API (Safari 16.4+) + stummer Video-Loop als Fallback für PWAs. Aktiviert sich nur während eines laufenden Workouts.

### Persistenz

| Daten | Storage Key | Inhalt |
|-------|-------------|--------|
| Trainingsplan | `mam-training-plan` | Alle 5 Tage als JSON |
| Chat-Historie | `mam-chat-history` | Nachrichten inkl. Vorschlagsstatus |

### API

Die Serverless Function (`api/chat.js`) proxied Anfragen an die Anthropic API mit:
- Modell: `claude-sonnet-4-20250514`
- Max Tokens: 8000
- Timeout: 60 Sekunden

## Kosten

Bei typischer Nutzung (ein paar Chat-Nachrichten pro Woche) liegen die API-Kosten bei wenigen Cent pro Monat.
