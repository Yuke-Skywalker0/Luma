# Installare Luma su iPhone senza pubblicarla sull’App Store

## La via più semplice subito: PWA

Finché Luma è una web app servita via HTTPS da Render, apri il link in Safari → Condividi → **Aggiungi alla schermata Home**. Non è un binario nativo, ma si installa senza App Store e può usare cache/offline per la shell. La musica è offline solo se l’audio è stato salvato localmente da una fonte che lo consente.

## Per installare una vera app nativa iOS

Non esiste un metodo universale per distribuire liberamente un `.ipa` non firmato. Opzioni legittime:

1. **Sviluppo sul proprio iPhone**: Mac + Xcode, collegare iPhone, abilitare Developer Mode e usare una firma di sviluppo. La firma gratuita personale ha limiti e scadenze; è soprattutto per uso personale/test.
2. **Ad Hoc**: Apple Developer Program, registrare l’UDID di ogni dispositivo e generare provisioning profile/certificato; adatto a pochi dispositivi registrati.
3. **TestFlight**: richiede App Store Connect e l’app TestFlight, non è pubblicazione pubblica sull’App Store, ma passa comunque dall’infrastruttura Apple.
4. **Distribuzione web alternativa nell’UE**: esiste, ma richiede requisiti, approvazione/notarizzazione Apple e configurazione specifica; non è un semplice link a un IPA.

Per la tua situazione, consiglio: PWA installabile da Render subito; in parallelo, build nativa iOS firmata per il tuo dispositivo tramite Xcode/Ad Hoc. Render può ospitare il sito e il backend, ma non può compilare/firma autonomamente un’app iOS: serve macOS/Xcode e i certificati necessari.

## Passi per build nativa iOS

1. Su Mac installare Node.js 24 e Xcode.
2. Estrarre il progetto e configurare `frontend/.env.production` con `VITE_API_BASE_URL=https://TUO-SERVIZIO.onrender.com`.
3. Eseguire `npm run install:all`, `npm install`, `npm run build:frontend`.
4. `npm run native:add:ios` (solo la prima volta), quindi `npm run native:sync` e `npm run native:open:ios`.
5. In Xcode impostare Team, Bundle Identifier `com.lumamusic.app`, signing e dispositivo.
6. Eseguire su iPhone. Per Ad Hoc, registrare prima l’UDID nel portale Apple Developer e generare la distribuzione firmata.

## Offline: limiti importanti

Il codice `frontend/src/native-offline.ts` salva solo se il chiamante passa `downloadable: true` e un URL HTTPS autorizzato. Un flag del provider è un prerequisito tecnico, non sostituisce la verifica delle condizioni/licenza. Non usare Spotify come fonte di file audio scaricati: l’import playlist conserva metadati, non audio. La UI di download e il flusso completo di playback locale devono essere verificati con una sorgente che autorizzi il download prima di considerare l’offline completo.
