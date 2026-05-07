# Requirements Traceability

## Scope

This document maps the Shopping List App requirements into implementation tasks and verification checkpoints. It is the tracked source of truth for translating the local planning notes into repository-visible delivery criteria.

## Functional Stories

| Story | Requirement | Implementation Tasks | Verification |
| --- | --- | --- | --- |
| US.01 | Create a shopping list | T7 | Create list with valid name |
| US.02 | Name a shopping list | T7 | Name entered during create persists |
| US.03 | View shopping lists | T7 | Lists overview loads owned lists |
| US.04 | Open shopping list | T7, T8 | Tapping a list opens item detail |
| US.05 | Rename shopping list | T7 | Rename flow updates UI and persistence |
| US.06 | Delete shopping list | T7, T5 | Delete confirmation shown; data removed |
| US.07 | Add item to list | T8 | Add item with valid name succeeds |
| US.08 | Edit item name | T8 | Edit existing item name persists |
| US.09 | Remove item from list | T8, T10 | Delete item confirmation and removal |
| US.10 | Set item quantity | T8 | Optional free-form quantity persists |
| US.11 | Mark item as completed | T9 | Completion toggle sets completed state |
| US.12 | Unmark item as completed | T9 | Completion toggle clears completed state |
| US.13 | Distinguish item status visually | T9 | Completed rows render distinct styling |
| US.14 | View all items in list | T8 | Detail view loads and shows list items |
| US.15 | Use list during shopping | T8, T9, T11 | Core actions remain quick on mobile |
| US.16 | Real-time item updates | T8, T9 | Current-session UI updates instantly after local actions |
| US.17 | Identify missing items | T9 | Incomplete items remain visible and countable |
| US.18 | Review shopping progress | T9 | Progress summary reflects completed vs total |
| US.19 | Save shopping lists | T4, T6, T7, T8 | Data stored in Postgres for authenticated user |
| US.20 | Auto-save changes | T7, T8, T9 | CRUD actions persist without explicit save button |
| US.21 | Persist lists after restart | T6, T7, T8, T9 | Session restore and refetch preserve data |
| US.22 | Remove deleted data from storage/view | T5, T7, T8 | Delete operations remove data from UI and DB |
| US.23 | Simple interface | T2, T7, T8, T11 | UX remains minimal and easy to scan |
| US.24 | Clear UI actions | T7, T8, T10, T11 | Buttons, forms, alerts, and confirmations are explicit |
| US.25 | Mobile usability | T2, T11 | iPhone layouts remain usable on common sizes |
| US.26 | Feedback messages | T10 | Validation, error, and retry messaging present |

## UC1 Alternate Scenarios

| Scenario | Requirement | Implementation Tasks | Verification |
| --- | --- | --- | --- |
| 3a | Invalid or empty item name | T8, T10 | Inline validation blocks empty save |
| 3b | Remove item | T8, T10 | Confirmation required before deletion |
| 3c | Cancel operation | T10 | Cancel leaves persisted data unchanged |
| 3d | No items | T10 | Empty-state message shown on detail screen |
| 3e | Data save failure | T10 | Error surfaced with retry path |
| 3f | Duplicate item behavior defined | T8, T10 | Duplicates explicitly allowed and documented in UI copy |

## Non-Functional Requirements

| NFR | Requirement | Implementation Tasks | Measurable Check |
| --- | --- | --- | --- |
| NFR2 | Performance <=2s for list display/update up to 100 items | T11 | Seed 100 items and verify common actions remain responsive |
| NFR3 | iOS 15+ compatibility and common iPhone sizes | T2, T11 | Build on iOS 15 target and verify compact layouts |
| NFR4 | Key actions in <=3 interaction steps | T7, T8, T11 | Create list, add item, complete item, delete item each fit target |
| NFR5 | Reliability/persistence after restart | T6, T7, T8, T9 | Relaunch retains session and refetches persisted data |
| NFR6 | Security/auth required and user data isolated | T5, T6 | RLS denies cross-user access; app gates unauthenticated users |
| NFR7 | Maintainability/modular structure | T2 | Code organized by App/Auth/Lists/Items/Data/Shared/Config |
| NFR8 | Flexibility for future extensions | T2, T12 | Repositories/config/docs leave room for future features |
| NFR9 | Safety for irreversible actions | T7, T8, T10 | Delete actions require explicit confirmation |

## Assumptions Locked For MVP

- App target name remains `app`.
- Languages are English and Polish.
- Duplicate item names are allowed within a list.
- Quantity is optional free-form text.
- `US.16` is satisfied by immediate local UI updates within the active app session, not live multi-device sync.
- MVP backend uses self-hosted Supabase Auth and Postgres only.
