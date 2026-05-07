//
//  appApp.swift
//  app
//
//  Created by Aleksander Baska on 07/05/2026.
//

import SwiftUI

@main
struct appApp: App {
    @StateObject private var languageSettings = LanguageSettings()

    var body: some Scene {
        WindowGroup {
            ContentView()
                .environmentObject(languageSettings)
                .environment(\.locale, languageSettings.language.locale)
        }
    }
}
