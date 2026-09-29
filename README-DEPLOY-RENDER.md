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
