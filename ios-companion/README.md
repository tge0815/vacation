# Lerncoach Companion (iOS) — Grundgerüst

Native Begleit-App für das **iPad/iPhone des Kindes**. Sie sperrt ausgewählte
Apps (z. B. Spiele, YouTube) und gibt sie **zeitlich begrenzt frei**, sobald im
Lerncoach eine Bildschirmzeit-Belohnung von den Eltern **bestätigt** wurde.

> Das ist ein **separates Xcode-Projekt** und wird NICHT mit der Web-App
> gebaut/deployt. Die Dateien hier sind ein funktionsfähiger Startpunkt, kein
> fertiges `.xcodeproj`.

## Wie es mit der Web-App zusammenspielt

Die App nutzt genau dasselbe Backend/Login wie der Browser:

1. `POST /api/auth/login` mit **Kind-Zugang** (Benutzername + Passwort) → Session-Cookie.
2. `GET  /api/rewards/screentime` → genehmigte, noch nicht eingelöste Freigaben (Minuten).
3. Apps für die Summe der Minuten freigeben (ManagedSettings), Timer via DeviceActivity.
4. `POST /api/rewards/screentime/consume` → Freigaben als „eingelöst" melden (kein Doppel-Gewähren).

(Diese Endpunkte existieren bereits im Web-Projekt.)

## Was du brauchst

- **Mac mit Xcode 15+** (macOS Sonoma+ empfohlen).
- **Apple Developer Program** – kostenpflichtig, 99 €/Jahr. (Nur damit lässt sich
  das Family-Controls-Entitlement nutzen und die App auf ein echtes Gerät laden.)
- **Echtes iOS-Gerät mit iOS 16+** (iPad/iPhone des Kindes). ⚠️ Das Sperren/
  Freigeben funktioniert **nicht im Simulator** – nur auf echter Hardware.
- **Family Controls Entitlement** `com.apple.developer.family-controls`:
  - Zum Entwickeln/Testen: Capability im Projekt aktivieren, mit deinem Developer-Account signieren.
  - Zur **Veröffentlichung im App Store**: das **Distribution**-Entitlement muss
    bei Apple **beantragt und freigegeben** werden (Formular im Developer-Portal).
- **App Group** (z. B. `group.de.example.lerncoach`) – teilt die App-Auswahl
  zwischen App und Extension. In beiden Targets identisch eintragen.

## Projekt in Xcode anlegen (Schritte)

1. **Neues Projekt** → *App* (SwiftUI, Swift). Deployment Target **iOS 16+**.
2. Dateien aus `LerncoachCompanion/` ins App-Target ziehen
   (`LerncoachCompanionApp.swift`, `ContentView.swift`, `RewardAPI.swift`, `ScreenTimeManager.swift`).
3. **Signing & Capabilities** (App-Target):
   - *+ Capability* → **Family Controls**
   - *+ Capability* → **App Groups** → Gruppe `group.de.example.lerncoach` anlegen/aktivieren.
   - (Entitlements-Datei siehe `LerncoachCompanion.entitlements` als Vorlage.)
4. **Neues Target** → *Device Activity Monitor Extension* anlegen.
   - Datei `DeviceActivityMonitorExtension/DeviceActivityMonitorExtension.swift` verwenden.
   - Beim Extension-Target ebenfalls **App Groups** (gleiche Gruppe) aktivieren.
5. In `ContentView.swift` die **`baseURL`** auf deine Instanz setzen
   (z. B. `https://lerncoach.deine-domain.de`).
6. In `ScreenTimeManager.swift` und der Extension die **App-Group-ID**
   (`appGroup`) an deine anpassen (überall gleich!).
7. Auf dem **echten Gerät** starten, „Bildschirmzeit erlauben" tippen
   (iOS fragt nach Berechtigung), Apps auswählen, Kind-Login, testen.

## Wichtige Einschränkungen (ehrlich)

- Die App steuert **nur ihren eigenen „Shield"-Layer** – also die Apps, die *sie*
  sperrt/freigibt. Die **System-Bildschirmzeit-Limits**, die Eltern in
  *Einstellungen → Bildschirmzeit* setzen, kann keine App programmatisch ändern.
- App-Tokens sind **anonym**: Die App „sieht" nie, welche Apps konkret gewählt
  wurden (Datenschutz by design).
- Für die Steuerung eines **fremden** Kinder-Geräts über Familienfreigabe braucht
  es die `.child`-Autorisierung + iCloud-Familie (Kind < 18). Für eine App, die
  **auf dem Gerät des Kindes selbst** läuft, genügt `.individual` (wie hier).
- Hintergrund-Automatik (regelmäßiges Abrufen ohne Tippen) via `BackgroundTasks`
  ist möglich, aber vom System zeitlich nicht garantiert – hier bewusst als
  Knopf „Belohnungen prüfen" gehalten.

## Dateien

| Datei | Zweck |
|-------|-------|
| `LerncoachCompanion/RewardAPI.swift` | Login + Freigaben abrufen/einlösen (Backend) |
| `LerncoachCompanion/ScreenTimeManager.swift` | Berechtigung, App-Auswahl, Sperren/Freigeben, Timer |
| `LerncoachCompanion/ContentView.swift` | Minimale Test-Oberfläche |
| `LerncoachCompanion/LerncoachCompanionApp.swift` | App-Einstieg |
| `DeviceActivityMonitorExtension/…swift` | Sperrt Apps nach Ablauf wieder |
| `LerncoachCompanion.entitlements` | Vorlage: Family Controls + App Group |
