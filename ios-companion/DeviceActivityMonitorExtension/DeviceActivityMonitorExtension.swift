import DeviceActivity
import ManagedSettings
import FamilyControls
import Foundation

/// Läuft als eigenständige App-Extension (Target "DeviceActivityMonitorExtension").
/// Wird vom System aufgerufen, wenn ein geplantes Zeitfenster endet – dann werden
/// die freigegebenen Apps wieder gesperrt.
final class DeviceActivityMonitorExtension: DeviceActivityMonitor {
    private let store = ManagedSettingsStore()
    private let appGroup = "group.de.example.lerncoach"

    override func intervalDidEnd(for activity: DeviceActivityName) {
        super.intervalDidEnd(for: activity)
        // Auswahl aus der App-Group laden und Sperre wieder anwenden.
        guard
            let defaults = UserDefaults(suiteName: appGroup),
            let data = defaults.data(forKey: "selection"),
            let selection = try? JSONDecoder().decode(FamilyActivitySelection.self, from: data)
        else {
            return
        }
        store.shield.applications = selection.applicationTokens.isEmpty ? nil : selection.applicationTokens
        store.shield.applicationCategories = selection.categoryTokens.isEmpty
            ? nil
            : .specific(selection.categoryTokens)
    }
}
