# Luma Music V7.2 — Native foundation

This release adds the Capacitor native shell configuration and native plugin foundation. The same React frontend is bundled into iOS/Android; Render remains the backend and web host.

## Requirements
- Node.js 24.x and npm
- Android: Android Studio + Android SDK
- iOS: macOS + Xcode (iOS project cannot be built on Windows)
- For iOS signing/App Store and Android signing, use your own developer accounts/certificates.

## First setup (from repository root)
```bash
npm run install:all
npm install
cp frontend/.env.native.example frontend/.env.production
# Edit frontend/.env.production and set VITE_API_BASE_URL to the origin of your Render service.
npm run build:frontend
npm run native:add:android
# On macOS, also: npm run native:add:ios
npm run native:sync
npm run native:open:android
# On macOS: npm run native:open:ios
```

If using PowerShell, copy the env example with `Copy-Item frontend/.env.native.example frontend/.env.production`. Keep this file out of Git.

## Build after web changes
```bash
npm run native:build
npm run native:open:android
```
Run iOS builds from Xcode on a Mac. The generated `android/` and `ios/` platform folders are created by `cap add`; they are intentionally generated on the developer machine because they contain platform-specific Gradle/Xcode project files. Commit them if you want reproducible native CI builds.

## Native/offline behavior
- Native startup skips the PWA Service Worker update gate; native binary updates must be delivered through Google Play/App Store or an internal signed distribution.
- Native network state uses Capacitor Network.
- `frontend/src/native-offline.ts` provides a native Filesystem/Preferences service. It intentionally refuses to download tracks unless the provider marks them `downloadable` and supplies an authorized HTTPS download URL. The current provider resolver does not yet guarantee such a URL for every track, so offline downloads must not be advertised as universally available.
- WebView background playback and lock-screen integration are not guaranteed by Capacitor alone. A dedicated native audio plugin/implementation is the next step.
- Google GIS web sign-in may require a native OAuth flow for a production native app. Configure OAuth client IDs and redirect schemes per platform before enabling it.

## Render
Keep the private GitHub repository connected to Render as before. Set the production URL in `frontend/.env.production` only for native builds; the Render web build continues to use same-origin `/api` calls. Never put provider secrets in the mobile app.
