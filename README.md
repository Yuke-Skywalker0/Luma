# Luma Music V6.8 — Smart Queue & Micro-UX

Base: V6.6 Music Graph + Performance.

## V6.8 additions
- Smart Queue based on playable search results, favorites and recent history.
- Persistent listening history (last 100 unique tracks).
- Online/offline indicator.
- Keyboard shortcuts: Space, arrows, N, P, M, ?.
- Persistent volume.
- Toast feedback for player/library actions.
- AbortController for stale searches.
- Lazy-loaded artwork.
- Previous-track behavior (restart if >5s, otherwise previous queue item).
- Queue highlight + Smart Queue button.
- Better mobile player controls.
- Clear history and remove individual history entries.

## Test
Backend health reports version 6.7.0. Frontend build is verified with `npm run build` after installing dependencies.

## Run
1. `cd backend && npm install && npm run dev`
2. `cd frontend && npm install && npm run dev`
3. Set `VITE_API_BASE_URL` if backend is not on `http://localhost:8787`.


## V6.8 — Artist & Album Experience
- Full artist detail endpoint with top tracks and discography.
- Full album detail endpoint with tracklist, label and copyright metadata.
- Artist and album pages in the frontend.
- Save albums and follow artists in the local library.
- Play all / shuffle / add to queue / favorites / playlist actions.
- Responsive mobile and desktop layouts.
- Artist/album cards, breadcrumbs/back navigation, loading states and empty states.
- Full player overlay on mobile/desktop.

### Verification
- TypeScript parser checks completed for frontend and backend source.
- Full npm install/build could not be completed in the execution environment because dependency installation timed out; run `npm install` and `npm run build` locally for the final production build.

## V7.0
- Google profile authentication (Google Identity Services)
- JWT session
- optional MongoDB Atlas profile persistence
- Spotify public playlist URL import
- imported playlist metadata is matched by the Luma Music Graph
- no Spotify audio downloading/ripping
- Render-only deployment with private GitHub repository

## V7.3 — Voice Center

Luma now supports voice commands in browsers that expose SpeechRecognition/Web Speech. Examples: `Riproduci Lazza`, `Pausa`, `Prossima`, `Precedente`, `Aggiungi ai preferiti`, `Apri libreria`, `Attiva Auto Mode`.

The `native/` folder contains the first Siri App Intents and Android App Actions contracts. True system-level Siri/Google Assistant invocation requires adding the native files to an iOS/Android app target; the PWA alone cannot guarantee native assistant integration.


## Native app (Capacitor)
See `native/README.md` for Android/iOS setup. Render remains the backend. Native binaries use `frontend/.env.production` with `VITE_API_BASE_URL=https://YOUR-SERVICE.onrender.com` (origin only).

## V7.4 — Libreria offline locale
- Nuova schermata Offline su desktop e mobile.
- Importa file audio dal dispositivo tramite selettore file.
- Persistenza locale tramite IndexedDB, con conteggio file e spazio occupato.
- Riproduzione dal file locale senza chiamare il resolver streaming online.
- Rimozione dei file importati dalla libreria locale.
- Nessun download/ripping da Spotify o provider commerciali.
- Guida iOS per chi sviluppa su Windows: `native/IOS-BUILD-FROM-WINDOWS.md`.

### Limiti e verifica
La libreria offline salva i file nel browser/WebView corrente: cancellare i dati del sito o disinstallare l'app può rimuoverli. La compatibilità dei codec dipende dal dispositivo. La compilazione npm non è stata verificata qui perché l'installazione delle dipendenze è andata in timeout. Non è stata eseguita alcuna build iOS: serve macOS con Xcode e test su dispositivo reale.
