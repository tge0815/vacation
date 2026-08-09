import Foundation

/// Spricht mit dem Lerncoach-Backend (dieselbe Web-App / dasselbe Login wie im Browser).
///
/// Login erfolgt mit dem KIND-Zugang (Benutzername + Passwort, den die Eltern
/// vergeben). Die Session steckt danach als Cookie in `URLSession.shared`
/// (HTTPCookieStorage übernimmt das automatisch), daher brauchen die weiteren
/// Aufrufe keine extra Auth.
struct Grant: Codable, Identifiable {
    let id: Int
    let minutes: Int
    let approvedAt: Int?
}

struct ScreenTimeResponse: Codable {
    let userId: Int
    let grants: [Grant]
    let totalMinutes: Int
}

enum RewardAPIError: Error { case badURL, http(Int), noUser }

final class RewardAPI {
    /// Basis-URL deiner Instanz, z. B. https://lerncoach.example.de
    let baseURL: URL
    /// Wird nach dem Login gesetzt (vom Server als redirect "/kind/<id>").
    private(set) var userId: Int?

    init(baseURL: URL) { self.baseURL = baseURL }

    private func request(_ path: String, method: String = "GET", body: [String: Any]? = nil) async throws -> Data {
        guard let url = URL(string: path, relativeTo: baseURL) else { throw RewardAPIError.badURL }
        var req = URLRequest(url: url)
        req.httpMethod = method
        req.setValue("application/json", forHTTPHeaderField: "Content-Type")
        if let body { req.httpBody = try JSONSerialization.data(withJSONObject: body) }
        let (data, resp) = try await URLSession.shared.data(for: req)
        if let http = resp as? HTTPURLResponse, !(200..<300).contains(http.statusCode) {
            throw RewardAPIError.http(http.statusCode)
        }
        return data
    }

    /// Kind-Login. Merkt sich die userId aus dem redirect ("/kind/<id>").
    func login(identifier: String, password: String) async throws {
        let data = try await request("/api/auth/login", method: "POST",
                                     body: ["identifier": identifier, "password": password])
        struct LoginResp: Codable { let ok: Bool?; let redirect: String? }
        let r = try JSONDecoder().decode(LoginResp.self, from: data)
        if let redirect = r.redirect, let idStr = redirect.split(separator: "/").last, let id = Int(idStr) {
            userId = id
        }
    }

    /// Genehmigte, noch nicht auf dem Gerät eingelöste Freigaben abrufen.
    func fetchGrants() async throws -> ScreenTimeResponse {
        let data = try await request("/api/rewards/screentime")
        return try JSONDecoder().decode(ScreenTimeResponse.self, from: data)
    }

    /// Freigaben als eingelöst melden, sobald sie auf dem Gerät aktiviert wurden.
    func consume(ids: [Int]) async throws {
        guard let userId else { throw RewardAPIError.noUser }
        _ = try await request("/api/rewards/screentime/consume", method: "POST",
                              body: ["userId": userId, "ids": ids])
    }
}
