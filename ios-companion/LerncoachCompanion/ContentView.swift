import SwiftUI
import FamilyControls

/// Minimaler Ablauf zum Ausprobieren:
/// 1) Berechtigung anfordern (einmalig)
/// 2) Eltern wählen die zu sperrenden Apps (FamilyActivityPicker)
/// 3) Kind-Login
/// 4) "Belohnungen prüfen" holt genehmigte Freigaben und gibt Apps frei
///
/// In der Praxis würde Schritt 4 automatisch/periodisch laufen (z. B. per
/// BackgroundTasks oder beim App-Start). Hier bewusst als Knopf zum Testen.
struct ContentView: View {
    @StateObject private var stm = ScreenTimeManager.shared
    @State private var api = RewardAPI(baseURL: URL(string: "https://DEINE-DOMAIN.example")!)

    @State private var username = ""
    @State private var password = ""
    @State private var showPicker = false
    @State private var status = ""

    var body: some View {
        NavigationStack {
            Form {
                Section("1. Berechtigung") {
                    Button(stm.authorized ? "Berechtigt ✓" : "Bildschirmzeit erlauben") {
                        Task { await stm.requestAuthorization() }
                    }
                    .disabled(stm.authorized)
                }

                Section("2. Zu sperrende Apps (Eltern)") {
                    Button("Apps auswählen") { showPicker = true }
                    Text("Ausgewählt: \(stm.selection.applicationTokens.count) Apps, \(stm.selection.categoryTokens.count) Kategorien")
                        .font(.footnote).foregroundStyle(.secondary)
                }

                Section("3. Kind-Login") {
                    TextField("Benutzername", text: $username).textInputAutocapitalization(.never)
                    SecureField("Passwort", text: $password)
                    Button("Anmelden") {
                        Task {
                            do { try await api.login(identifier: username, password: password); status = "Angemeldet ✓" }
                            catch { status = "Login fehlgeschlagen" }
                        }
                    }
                }

                Section("4. Belohnungen") {
                    Button("Belohnungen prüfen & Zeit freigeben") { Task { await redeem() } }
                    if !status.isEmpty { Text(status).font(.footnote).foregroundStyle(.secondary) }
                }

                Section {
                    Button("Jetzt sperren (Test)") { stm.applyShield() }
                    Button("Jetzt entsperren (Test)") { stm.removeShield() }
                }
            }
            .navigationTitle("Lerncoach Zeit")
            .familyActivityPicker(isPresented: $showPicker, selection: $stm.selection)
            .onChange(of: stm.selection) { _, _ in stm.saveSelection() }
            .task { await stm.requestAuthorization() }
        }
    }

    private func redeem() async {
        do {
            let resp = try await api.fetchGrants()
            guard resp.totalMinutes > 0 else { status = "Keine offenen Freigaben."; return }
            stm.startFreeTime(minutes: resp.totalMinutes)
            try await api.consume(ids: resp.grants.map(\.id))
            status = "\(resp.totalMinutes) Min freigegeben 🎉"
        } catch {
            status = "Fehler: \(error)"
        }
    }
}
