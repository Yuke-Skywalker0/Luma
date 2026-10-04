# V7.3 — Offline foundation

- Native file persistence is provided by Capacitor Filesystem in `frontend/src/native-offline.ts`.
- Track records are persisted with Capacitor Preferences.
- The function rejects browser/PWA downloads, non-downloadable sources, and non-HTTPS URLs.
- `getOfflineSummary()` exposes saved track count and browser storage estimate (the estimate is not a precise native audio total).

## Integration contract for the player

The provider resolver must return an explicit `downloadable` boolean and a dedicated authorized download URL. Save the track with `saveTrackOffline(track, downloadUrl)`. For playback, pass the stored `localUri` to a native-capable audio layer and verify iOS/Android URL handling. Do not assume a remote stream URL is downloadable or available offline.

This package is the offline storage foundation, not a claim that every provider already supports offline playback. End-to-end offline playback needs device testing with a provider that explicitly permits it.
