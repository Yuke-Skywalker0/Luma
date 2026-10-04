# Luma Music 7.4 — percorso iOS lavorando da Windows

## Stato reale
- Il codice web/PWA può essere sviluppato e compilato su Windows.
- Il progetto Capacitor può essere preparato e sincronizzato su Windows per Android.
- La compilazione, la firma e il packaging nativo iOS richiedono macOS e Xcode. Questa cartella non contiene una build iOS verificata e non va distribuita come IPA.

## Percorso consigliato
1. Sviluppa e prova l'interfaccia web su Windows con Node.js 24.x.
2. Esegui `npm run install:all` e `npm run build:frontend` dalla cartella principale.
3. Pubblica la PWA/servizio web su Render e verifica la libreria offline nel browser supportato.
4. Per una vera app iOS, usa in seguito un Mac disponibile personalmente o tramite un collaboratore/servizio Mac remoto affidabile.
5. Sul Mac installa Xcode e le dipendenze Node, scarica il repository privato, esegui `npm run install:all`, poi `npm run native:add:ios` (solo la prima volta), `npm run native:build` e `npm run native:open:ios`.
6. In Xcode configura il Team di firma, Bundle Identifier `com.lumamusic.app`, provisioning e dispositivo di test. Compila e prova su un iPhone reale prima di distribuire.
7. Per distribuire senza App Store, scegli con attenzione una modalità Apple supportata (per esempio Ad Hoc con dispositivi registrati o TestFlight); ogni opzione ha requisiti e limiti propri.

## Test da eseguire su Mac/iPhone
- Avvio a freddo e aggiornamento app.
- Importazione di file audio autorizzati, riproduzione in modalità aereo e riavvio app.
- Memoria disponibile, file audio grandi, rimozione file e gestione errori.
- Permessi, firma, compatibilità iOS e comportamento in background.

Non inserire segreti o chiavi API nel frontend. Questo documento è una guida operativa, non una certificazione della build iOS.
