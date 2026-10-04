# Offline Player 7.4

La schermata Offline consente di importare file audio locali dal file picker e conservarli in IndexedDB sul dispositivo/browser corrente. Il player crea un URL locale temporaneo per riprodurre il blob senza richiedere una sorgente streaming online.

- Sono accettati file riconosciuti come audio e comuni estensioni audio.
- I file restano nel database locale del browser/WebView; cancellare dati del sito o disinstallare l'app può eliminarli.
- Lo spazio indicato è la somma delle dimensioni dei file importati in Luma, non una misura dello spazio totale del dispositivo.
- Non vengono scaricati né estratti brani da Spotify o da altri provider.
- La compatibilità del file dipende dai codec supportati dal browser/WebView.
- La build iOS non è stata compilata né testata: verificare su macOS/Xcode e iPhone reale prima della distribuzione.
