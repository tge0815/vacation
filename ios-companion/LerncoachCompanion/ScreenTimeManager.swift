import Foundation
import FamilyControls
import ManagedSettings
import DeviceActivity

/// Kapselt Apples Screen-Time-Frameworks:
/// - FamilyControls:  Berechtigung + App-Auswahl (welche Apps werden gesperrt)
/// - ManagedSettings: Apps sperren ("shield") / freigeben
/// - DeviceActivity:  Zeitfenster überwachen, um nach Ablauf wieder zu sperren
///
/// Ablauf: Standardmäßig sind die ausgewählten Apps GESPERRT. Wird eine
/// Belohnung eingelöst, werden sie für X Minuten freigegeben; nach Ablauf
/// sperrt die DeviceActivityMonitor-Extension sie automatisch wieder.
@MainActor
final class ScreenTimeManager: ObservableObject {
    static let shared = ScreenTimeManager()

    // Muss identisch zur App-Group in beiden Targets (App + Extension) sein.
    static let appGroup = "group.de.example.lerncoach"
    static let activityName = DeviceActivityName("lerncoach.freetime")

    private let store = ManagedSettingsStore()
    private let center = AuthorizationCenter.shared

    @Published var authorized = false
    /// Aktuelle App-Auswahl der Eltern (welche Apps überhaupt kontrolliert werden).
    @Published var selection = FamilyActivitySelection()

    private var defaults: UserDefaults? { UserDefaults(suiteName: Self.appGroup) }

    // MARK: Berechtigung
    func requestAuthorization() async {
        do {
            // .individual = dieses Gerät (das iPad/iPhone des Kindes) verwalten.
            try await center.requestAuthorization(for: .individual)
            authorized = center.authorizationStatus == .approved
            loadSelection()
        } catch {
            authorized = false
        }
    }

    // MARK: App-Auswahl speichern/laden (in der App-Group, für die Extension)
    func saveSelection() {
        if let data = try? JSONEncoder().encode(selection) {
            defaults?.set(data, forKey: "selection")
        }
        applyShield() // sofort sperren, sobald ausgewählt
    }

    func loadSelection() {
        if let data = defaults?.data(forKey: "selection"),
           let sel = try? JSONDecoder().decode(FamilyActivitySelection.self, from: data) {
            selection = sel
        }
    }

    // MARK: Sperren / Freigeben
    /// Sperrt alle ausgewählten Apps (Standardzustand).
    func applyShield() {
        store.shield.applications = selection.applicationTokens.isEmpty ? nil : selection.applicationTokens
        store.shield.applicationCategories = selection.categoryTokens.isEmpty
            ? nil
            : .specific(selection.categoryTokens)
    }

    /// Hebt die Sperre auf (Apps nutzbar).
    func removeShield() {
        store.shield.applications = nil
        store.shield.applicationCategories = nil
    }

    /// Gibt die Apps für `minutes` Minuten frei und plant die erneute Sperre.
    func startFreeTime(minutes: Int) {
        removeShield()
        scheduleReshield(after: minutes)
    }

    /// Plant über DeviceActivity ein Fenster; nach Ende sperrt die Extension wieder.
    private func scheduleReshield(after minutes: Int) {
        let now = Date()
        let end = Calendar.current.date(byAdding: .minute, value: max(1, minutes), to: now) ?? now
        let cal = Calendar.current
        let schedule = DeviceActivitySchedule(
            intervalStart: cal.dateComponents([.hour, .minute, .second], from: now),
            intervalEnd: cal.dateComponents([.hour, .minute, .second], from: end),
            repeats: false
        )
        let dac = DeviceActivityCenter()
        dac.stopMonitoring([Self.activityName])
        try? dac.startMonitoring(Self.activityName, during: schedule)
    }
}
