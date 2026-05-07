//
//  ContentView.swift
//  app
//
//  Created by Aleksander Baska on 07/05/2026.
//

import SwiftUI

struct ContentView: View {
    @EnvironmentObject private var languageSettings: LanguageSettings

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(alignment: .leading, spacing: 24) {
                    VStack(alignment: .leading, spacing: 8) {
                        Text("app.title")
                            .font(.largeTitle.bold())

                        Text("app.subtitle")
                            .font(.title3)
                            .foregroundStyle(.secondary)
                    }

                    VStack(alignment: .leading, spacing: 12) {
                        Text("language.section.title")
                            .font(.headline)

                        Picker("language.section.title", selection: $languageSettings.language) {
                            ForEach(AppLanguage.allCases) { language in
                                Text(language.titleKey)
                                    .tag(language)
                            }
                        }
                        .pickerStyle(.segmented)

                        Text("language.section.description")
                            .font(.footnote)
                            .foregroundStyle(.secondary)
                    }

                    VStack(alignment: .leading, spacing: 16) {
                        Label("welcome.card.title", systemImage: "cart.fill.badge.plus")
                            .font(.headline)

                        Text("welcome.card.body")
                            .foregroundStyle(.secondary)
                    }
                    .padding(20)
                    .frame(maxWidth: .infinity, alignment: .leading)
                    .background(.thinMaterial, in: RoundedRectangle(cornerRadius: 20, style: .continuous))
                }
                .padding(24)
                .frame(maxWidth: .infinity, alignment: .leading)
            }
            .background(Color(.systemGroupedBackground))
        }
    }
}

struct ContentView_Previews: PreviewProvider {
    static var previews: some View {
        ContentView()
            .environmentObject(LanguageSettings())
    }
}
