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
