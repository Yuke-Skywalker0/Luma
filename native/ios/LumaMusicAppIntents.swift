import AppIntents
import UIKit

// V7.1 contract for the future native iOS/Capacitor shell.
// Add this file to the Xcode iOS target in V7.2.

struct LumaPlayMusicIntent: AppIntent {
    static var title: LocalizedStringResource = "Riproduci su Luma"
    static var description = IntentDescription("Riproduce musica in Luma Music.")
    @Parameter(title: "Cerca") var query: String
    func perform() async throws -> some IntentResult {
        let encoded = query.addingPercentEncoding(withAllowedCharacters: .urlQueryAllowed) ?? query
        if let url = URL(string: "https://YOUR-LUMA-RENDER.onrender.com/voice?command=play&query=\(encoded)") {
            await MainActor.run { UIApplication.shared.open(url) }
        }
        return .result()
    }
}

struct LumaPauseIntent: AppIntent {
    static var title: LocalizedStringResource = "Metti in pausa Luma"
    func perform() async throws -> some IntentResult {
        if let url = URL(string: "https://YOUR-LUMA-RENDER.onrender.com/voice?command=pause") {
            await MainActor.run { UIApplication.shared.open(url) }
        }
        return .result()
    }
}

struct LumaNextTrackIntent: AppIntent {
    static var title: LocalizedStringResource = "Brano successivo su Luma"
    func perform() async throws -> some IntentResult {
        if let url = URL(string: "https://YOUR-LUMA-RENDER.onrender.com/voice?command=next") {
            await MainActor.run { UIApplication.shared.open(url) }
        }
        return .result()
    }
}

struct LumaShortcuts: AppShortcutsProvider {
    static var appShortcuts: [AppShortcut] {
        [
            AppShortcut(intent: LumaPauseIntent(), phrases: ["Metti in pausa su Luma", "Pausa Luma"], shortTitle: "Pausa Luma", systemImageName: "pause.circle"),
            AppShortcut(intent: LumaNextTrackIntent(), phrases: ["Brano successivo su Luma", "Prossima su Luma"], shortTitle: "Prossima Luma", systemImageName: "forward.end"),
            AppShortcut(intent: LumaPlayMusicIntent(), phrases: ["Riproduci su Luma", "Ascolta su Luma"], shortTitle: "Riproduci Luma", systemImageName: "play.circle")
        ]
    }
}
