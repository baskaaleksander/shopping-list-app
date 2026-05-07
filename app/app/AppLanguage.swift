import Combine
import Foundation
import SwiftUI

enum AppLanguage: String, CaseIterable, Identifiable {
    case english = "en"
    case polish = "pl"

    var id: String { rawValue }

    var locale: Locale {
        Locale(identifier: rawValue)
    }

    var titleKey: LocalizedStringKey {
        switch self {
        case .english:
            "language.english"
        case .polish:
            "language.polish"
        }
    }

    static func preferredLanguage(for identifiers: [String] = Locale.preferredLanguages) -> AppLanguage {
        guard let identifier = identifiers.first else {
            return .english
        }

        return identifier.hasPrefix("pl") ? .polish : .english
    }
}

@MainActor
final class LanguageSettings: ObservableObject {
    private static let storageKey = "selectedAppLanguage"

    @Published var language: AppLanguage {
        didSet {
            userDefaults.set(language.rawValue, forKey: Self.storageKey)
        }
    }

    private let userDefaults: UserDefaults

    init(userDefaults: UserDefaults = .standard) {
        self.userDefaults = userDefaults

        if let savedLanguage = userDefaults.string(forKey: Self.storageKey),
           let appLanguage = AppLanguage(rawValue: savedLanguage) {
            language = appLanguage
        } else {
            language = AppLanguage.preferredLanguage()
        }
    }
}
