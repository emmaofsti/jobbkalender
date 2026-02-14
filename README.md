# Jobbkalender

Minimal, rask og ryddig jobbkalender for én bruker – med kundekort, dagsplan og quick‑add.

## Kom i gang

1. Installer avhengigheter

```bash
npm install
```

2. Kjør lokalt

```bash
npm run dev
```

Appen starter på `http://localhost:3000` og ruter til `/day` som startside.

## Google Calendar (lesetilgang)

For å vise møter i dagens tidslinje kobler du Google Calendar via OAuth.

1. Gå til Google Cloud Console og lag et nytt prosjekt.
2. Aktiver **Google Calendar API** for prosjektet.
3. Sett opp **OAuth consent screen** (External).
4. Lag **OAuth Client ID** av typen **Web application**.
5. Legg til redirect URI:
   - `http://localhost:3000/api/google/callback`
6. Lag en `.env.local` i rotmappen:

```bash
GOOGLE_CLIENT_ID=din-client-id
GOOGLE_CLIENT_SECRET=din-client-secret
GOOGLE_REDIRECT_URI=http://localhost:3000/api/google/callback
GOOGLE_CALENDAR_ID=primary
```

7. Start appen og trykk **Koble Google** i `/day`.

Etter tilkobling vises møtene dine i tidslinjen og heldagsmøter under “Uten tid i dag”.

## Ruter

- `/day` – Dagens plan (tidslinje + uten tid + quick‑add)
- `/week` – Enkel ukeoversikt
- `/customers` – Kundekort + filtrering

## Quick‑add (eksempler)

- `13-14 Waynor: artikkel`
- `13:00-14:30 Radisson: statusmøte`
- `kl 16 RED tilbud`

Parseren tolker tid, kunde og tittel automatisk. Hvis kunde ikke finnes i teksten, velg den i “Auto‑kunde”‑listen.

## Snarveier

- `/` – fokus på quick‑add
- `Enter` – lagrer i quick‑add
- `1-4` – status for valgt oppgave
  - `1` = gjort
  - `2` = holder på
  - `3` = står ikke på meg
  - `4` = ferdig

## Struktur

```
app/
components/
components/ui/
models/
screens/
store/
utils/
```

## Data og lagring

- LocalStorage via Zustand `persist`
- Seed‑data lastes første gang
- Struktur er klargjort for å bytte til database senere

## Seed‑data (eksempel)

Kunder: Radisson, Waynor, Sport1, Internt, Annet
Byer/tagger: Bergen, Stavanger, Trondheim + interne tagger

Oppgaver er lagt inn for “i dag” + kommende dager for å vise timeline og ukevisning.

## Hvordan legge til kunder og oppgaver

- Legg til oppgaver i `/day` via quick‑add
- Rediger alle felter i “Oppgavedetaljer” når en oppgave er valgt
- Legg til oppgaver direkte fra kundekortene i `/customers`
