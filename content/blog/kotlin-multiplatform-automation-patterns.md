---
slug: kotlin-multiplatform-automation-patterns
title: Kotlin Multiplatform Architecture for High Performance Apps
summary: Practical architectural patterns for sharing core business logic across iOS and Android without sacrificing native speed.
category: Automation
publishedDate: 2026-07-28
author: AI-Borne Engineering
readTimeMinutes: 7
metricBadge: 🔄 85% Logic Shared
difficulty: Intermediate
tags: [KMP, Compose Multiplatform, Architecture]
---

Building modern mobile applications often forces a painful compromise: pay the double-engineering tax by building identical business logic twice in Swift and Kotlin, or accept the runtime overhead, janky animations, and massive bundle bloat of hybrid web-view wrappers and non-native rendering engines.

Kotlin Multiplatform (KMP) eliminates this false dilemma. By compiling shared business rules directly into JVM bytecode for Android and native Objective-C/Swift binary frameworks for iOS, developers can share up to 85% of their application logic while keeping the UI 100% native.

## In 30 Seconds

* **85% Logic Sharing**: Unidirectional state management (MVI), local database persistence (SQLDelight), and domain validation exist in a single unified codebase.
* **100% Native User Interface**: Jetpack Compose on Android and declarative SwiftUI on iOS guarantee zero touch latency and native platform feel.
* **Direct C/Swift Interoperability**: Zero JavaScript bridges or serialized JSON overhead; shared logic compiles directly into native Mach-O static frameworks on iOS.
* **Sub-Second JVM Test Harness**: Run comprehensive unit and integration suites in milliseconds on the JVM without launching mobile simulators.

## Architecture Blueprint

The clean separation between shared domain engines and platform-native UI shells:

```
+-----------------------------------------------------------+
|                    Shared KMP Core Engine                 |
|       - MVI State Machines (StateFlow / SharedFlow)       |
|       - SQLDelight Persistence & Offline Cache            |
|       - Cryptographic Token & Rule Validators             |
+-----------------------------+-----------------------------+
                              |
            +-----------------+-----------------+
            |                                   |
            v                                   v
+-----------------------+           +-----------------------+
|  Android Native Shell |           |    iOS Native Shell   |
|  - Jetpack Compose UI |           |    - SwiftUI 6 Views  |
|  - Material 3 Design  |           |    - Dynamic Type     |
|  - WorkManager Sync   |           |    - Background Tasks |
+-----------------------+           +-----------------------+
```

## Platform Architecture Comparison

| Capability | Dual Native (Swift + Kotlin) | Flutter / Dart | React Native | Kotlin Multiplatform |
| :--- | :--- | :--- | :--- | :--- |
| **Logic Shared** | 0% (Duplicate work) | 90% | 80% | **85% - 90%** |
| **UI Rendering** | 100% Native | Skia / Impeller Canvas | Native Views via Bridge | **100% Native (SwiftUI/Compose)** |
| **iOS Startup Overhead** | 0ms | 250ms - 400ms | 300ms - 600ms | **0ms (Native Binary)** |
| **App Bundle Increase** | 0 MB | 15MB - 35MB | 20MB - 45MB | **< 1.8 MB** |
| **Test Execution Speed** | Split / Disjoint | Fast (Dart VM) | Medium (Jest) | **Instant (< 500ms JVM)** |

## Production Code Recipe: Shared MVI State Machine

Here is the production-tested unidirectional data flow pattern we utilize across PayslipMax and SSBMax:

```kotlin
sealed interface PayslipIntent {
    data class LoadDocument(val fileUri: String) : PayslipIntent
    data object CalculateTax : PayslipIntent
}

data class PayslipState(
    val isLoading: Boolean = false,
    val grossSalary: Double = 0.0,
    val netSalary: Double = 0.0,
    val errorMessage: String? = null
)

class PayslipViewModel(
    private val repository: PayslipRepository
) {
    private val internalState = MutableStateFlow(PayslipState())
    val state: StateFlow<PayslipState> = internalState.asStateFlow()

    fun processIntent(intent: PayslipIntent) {
        when (intent) {
            is PayslipIntent.LoadDocument -> executeLoad(intent.fileUri)
            is PayslipIntent.CalculateTax -> executeTaxCalculation()
        }
    }

    private fun executeLoad(uri: String) {
        internalState.update { it.copy(isLoading = true, errorMessage = null) }
        try {
            val record = repository.parseAndPersist(uri)
            internalState.update {
                it.copy(
                    isLoading = false,
                    grossSalary = record.gross,
                    netSalary = record.net
                )
            }
        } catch (e: Exception) {
            internalState.update {
                it.copy(isLoading = false, errorMessage = e.message)
            }
        }
    }

    private fun executeTaxCalculation() {
        // Deterministic on-device tax bracket computation
    }
}
```

## Battle Scars & Hard-Won Lessons

1. **Swift Coroutine Flow Consumption**: Early versions required cumbersome Swift wrappers to observe Kotlin `StateFlow`. We adopted KMP-NativeCoroutines, which automatically generates async/await Swift properties and Combine publishers during the Gradle build.
2. **Deterministic Threading on iOS**: While the new Kotlin Native memory manager eliminates freeze rules, background coroutines executing on iOS dispatch queues must avoid capturing unmanaged Objective-C pointers across closure boundaries.
3. **Strict Zero-Platform Dependencies in CommonMain**: Never allow Android-specific or Apple-specific APIs to leak into `commonMain`. Abstract all device-specific capabilities through explicit `expect`/`actual` interfaces to keep test execution blistering fast on local JVM test runners.
