# My-Active-Morning-Routine - Calisthenics + Mobility — AI Trainer

Bodyweight-Trainingsplan-App mit KI-gestützter Plananpassung. 5 Trainingstage (MO–FR), Timer, Auto-/Manuell-Modus und ein Chat-Assistent, der Übungen, Dauer, Fokus und Pausen auf Zuruf anpasst.

## Features

- **5 Trainingstage** mit Warmup, Hauptteil, Core, Cooldown
- **Timer** mit Auto- und Manuell-Modus, Beep-Signalen und Wake Lock
- **KI-Chat** zum Anpassen des Plans (Übungen tauschen, Dauer ändern, Fokus setzen)
- **YouTube-Links** für Video-Anleitungen jeder Übung
- **Mobile-first** Design mit PWA-Support

## Setup

### 1. Repository klonen

```bash
git clone <dein-repo-url>
cd calisthenics-app
npm install
```

### 2. Anthropic API Key

Du brauchst einen [Anthropic API Key](https://console.anthropic.com/). Für lokale Entwicklung:

```bash
# .env.local erstellen (wird von Git ignoriert)
echo "ANTHROPIC_API_KEY=sk-ant-..." > .env.local
```

### 3. Lokal starten

```bash
npm run dev
```

Öffne http://localhost:5173. Der KI-Chat funktioniert lokal nur mit dem Vercel CLI (siehe unten).

### 4. Lokal mit API-Proxy testen

```bash
npm i -g vercel
vercel env add ANTHROPIC_API_KEY  # Key eingeben
vercel dev
```

Das startet Vite + die Serverless Function auf http://localhost:3000.

## Deployment auf Vercel

### Option A: Über die Vercel-Website

1. Push das Repo zu GitHub
2. Gehe zu [vercel.com/new](https://vercel.com/new) und importiere das Repo
3. Unter **Settings → Environment Variables** hinzufügen:
   - `ANTHROPIC_API_KEY` = `sk-ant-...`
4. Deploy klicken — fertig

### Option B: Über die CLI

```bash
npm i -g vercel
vercel login
vercel --prod
```

Beim ersten Mal wirst du nach dem Projekt gefragt. Den API Key kannst du über das Dashboard oder CLI setzen:

```bash
vercel env add ANTHROPIC_API_KEY
```

## Projektstruktur

```
calisthenics-app/
├── api/
│   └── chat.js            # Vercel Serverless Function (Anthropic Proxy)
├── public/
│   ├── favicon.svg
│   └── manifest.json       # PWA Manifest
├── src/
│   ├── App.jsx             # Haupt-App (Workout + Chat)
│   ├── index.css            # Tailwind + Fonts
│   └── main.jsx             # React Entry Point
├── index.html
├── package.json
├── postcss.config.js
├── tailwind.config.js
├── vercel.json              # Vercel Konfiguration
└── vite.config.js
```

## KI-Chat Funktionen

Der Chat-Assistent kann:
- Übungen für einzelne Tage austauschen, hinzufügen oder entfernen
- Sätze, Zeiten und Pausen anpassen
- Fokus auf Muskelgruppen setzen
- Übungen ausschließen
- Den aktuellen Plan anzeigen

Er kann bewusst **nicht**: Ernährungsberatung, medizinische Tipps oder Smalltalk.

## Kosten

Die App nutzt `claude-sonnet-4-20250514`. Bei typischer Nutzung (ein paar Chat-Nachrichten pro Workout) liegen die API-Kosten bei wenigen Cent pro Monat. Aktuelle Preise: [anthropic.com/pricing](https://www.anthropic.com/pricing)
