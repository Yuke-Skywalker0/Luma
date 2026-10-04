# Luma Music 6.9.0 — Private GitHub + Render

## Architecture
One private GitHub repository -> one Render Web Service -> one public onrender.com URL.
Render serves both the React frontend and the Express API. GitHub remains private.

## Local
1. Copy `backend/.env.example` to `backend/.env` and fill provider credentials.
2. `npm run install:all`
3. `npm run build`
4. `npm start`
5. Open `http://localhost:8787`

## GitHub
```powershell
git init
git branch -M main
git add .
git commit -m "Luma Music 6.9.0"
git remote add origin https://github.com/YOUR_USER/luma-music.git
git push -u origin main
```
Keep the repository private.

## Render
New -> Web Service -> Git Provider -> select the private repo.
- Runtime: Node
- Branch: main
- Build: `npm run build`
- Start: `npm start`
- Health: `/health`
- Auto Deploy: Yes

Render reads `render.yaml`; secret values with `sync: false` must be entered in Render Dashboard -> Environment.

Required secrets:
- SPOTIFY_CLIENT_ID
- SPOTIFY_CLIENT_SECRET
- AUDIUS_API_KEY (optional if the provider endpoint does not require it)
- JAMENDO_CLIENT_ID
- SOUNDCLOUD_CLIENT_ID
- MUSICBRAINZ_USER_AGENT

The frontend does not need `VITE_API_BASE_URL` in production because it uses `/api` on the same Render origin.

## Production URLs
- App: `https://YOUR-SERVICE.onrender.com/`
- Health: `https://YOUR-SERVICE.onrender.com/health`
- Config: `https://YOUR-SERVICE.onrender.com/api/config`
- Version: `https://YOUR-SERVICE.onrender.com/api/version`

Do not commit real `.env` files or API secrets.

## V7 Google Auth + Spotify Playlist Import
Set these Render environment variables:
- `GOOGLE_CLIENT_ID`
- `JWT_SECRET`
- `MONGODB_URI`
- `MONGODB_DB=luma`
Frontend uses `VITE_GOOGLE_CLIENT_ID` at build time; for the single Render service, set it as a build environment variable too. In Google Cloud Console add your Render URL as an Authorized JavaScript origin.
Spotify public playlist import accepts `https://open.spotify.com/playlist/<id>` and imports playlist metadata/track order. It does not download Spotify audio. Private playlists require a Spotify user authorization flow and are not imported by the public-link endpoint yet.


## Native iOS/Android (V7.4)
Render continues to host the web app/API. To build mobile apps, follow `native/README.md`. Set `VITE_API_BASE_URL` to the Render origin for native builds only; the Render web build uses same-origin `/api`. Do not place provider secrets in the app.


## V7.4 offline locale
La schermata Offline importa file audio locali tramite IndexedDB. Eseguire `npm run install:all` e `npm run build:frontend` prima del deploy. L’installazione delle dipendenze non è stata completata in questo ambiente: il build di produzione resta da verificare sul tuo PC. Per iOS consultare `native/IOS-BUILD-FROM-WINDOWS.md`; è necessario macOS/Xcode per compilare e firmare l’app nativa.
