---
slug: zero-copy-bytestream-parsing-jni-direct-buffers
title: Zero-Copy ByteStream Parsing: Bridging Native C++ Core to Kotlin via Direct Buffers
summary: Eliminate memory churn and GC stalls when processing encrypted payroll PDFs by streaming direct off-heap byte buffers between C++ and Kotlin via JNI.
category: App Engineering
publishedDate: 2026-10-13
author: AI-Borne Engineering
readTimeMinutes: 5
metricBadge: ⚡ Engineered
difficulty: Advanced
tags: ['Android', 'C++', 'JNI', 'Memory Management', 'PayslipMax']
---

Android PDF rendering and extraction pipelines are notoriously fragile. When parsing complex, encrypted defence payslips containing thousands of vector objects and nested glyph matrices, conventional Android architectures fail in an embarrassingly predictable fashion: catastrophic GC pressure, frame drops, and out-of-memory (OOM) aborts. The culprit is rarely the parsing algorithm itself; it is the reckless serialization and copying of byte arrays across the Java Native Interface (JNI) boundary.

Duplicating multi-megabyte decrypted payload buffers between managed ART heaps and native runtime buffers turns device garbage collectors into bottlenecks. At AI-Borne Studio, our on-device zero-trust engine, **PayslipMax**, sidesteps managed memory entirely for cryptographic operations and PDF tokenization. Here is how we architected a zero-copy direct buffer bridge between modern C++ and Kotlin.

## In 30 Seconds

* **Heap Pinning is a Trap:** Relying on `GetByteArrayElements` frequently forces the ART runtime to allocate a copy of the primitive array rather than pinning it, doubling your memory footprint instantaneously.
* **Off-Heap Direct Buffers:** By creating `java.nio.ByteBuffer` instances directly backed by native C++ memory addresses (`NewDirectByteBuffer`), Kotlin operates over native memory without garbage collection overhead.
* **Strict RAII Lifecycles:** Buffer ownership must be anchored to native stack frames or atomic reference counters. Letting Kotlin own the pointer leads to dangling references or fatal SIGSEGVs.
* **Deterministic Parsing:** Direct pointer arithmetic inside native C++ decoders yields predictable, sub-frame layout extraction without triggering Android runtime compaction pauses.

## Architecture Blueprint

```
+-------------------------------------------------------------+
|                      KOTLIN RUNTIME (ART)                   |
|                                                             |
|  +--------------------+         +------------------------+  |
|  | PayslipDocument    | <-----> | DirectByteBuffer       |  |
|  | (Type-safe views)  |         | (Non-backed by JVM)    |  |
|  +--------------------+         +-----------+------------+  |
+---------------------------------------------|---------------+
                                              | JNI Boundary
                                              | (GetDirectBufferAddress)
+---------------------------------------------|---------------+
|                   NATIVE CORE (libpayslip.so)               |
|                                             v               |
|  +-------------------------------------------------------+  |
|  | Native Memory Arena (std::span<const uint8_t>)        |  |
|  | - PDF Stream Tokenizer                                |  |
|  | - TrueType / Type 3 Font Mapping                      |  |
|  | - Table Bounding Box Detection Engine                 |  |
|  +-------------------------------------------------------+  |
|                                                             |
|  +-------------------------------------------------------+  |
|  | Secure Arena Deallocator (Zeroize on Dispose)         |  |
|  +-------------------------------------------------------+  |
+-------------------------------------------------------------+
```

## Interface Comparison: Memory Transfer Strategies

| Strategy | JVM Heap Impact | Native Copy Cost | JNI Overhead | Safety Guardrails |
| :--- | :--- | :--- | :--- | :--- |
| **`jbyteArray` (`GetByteArrayRegion`)** | High (JVM allocates) | Copies entire buffer | Low | High (Automatic JVM cleanup) |
| **Pinned `jbyteArray` (`GetPrimitiveArrayCritical`)** | High (JVM pins heap) | Zero (if runtime supports) | High (Blocks GC pauses) | Extremely Low (Deadlock risk) |
| **File-backed IPC (mmap via fd)** | Negligible | Zero kernel copies | Medium | Moderate (Linux file descriptor leaks) |
| **Direct Byte Buffers (`NewDirectByteBuffer`)** | Zero (Off-heap) | Zero copy | Negligible | Requires strict native RAII |

## The Zero-Copy Implementation Recipe

To bridge native C++ buffers into Kotlin without intermediate memory allocations, we construct the backing memory in native space, expose it via `env->NewDirectByteBuffer`, and wrap it in a custom, lifecycle-aware Kotlin class.

### 1. Native C++ Allocation and Registration

```cpp
#include <jni.h>
#include <vector>
#include <span>
#include <memory>
#include <cstring>

struct DecryptedPayload {
    std::vector<uint8_t> buffer;
    
    ~DecryptedPayload() {
        // Zeroize memory for zero-trust compliance before free
        if (!buffer.empty()) {
            std::memset(buffer.data(), 0, buffer.size());
        }
    }
};

extern "C" JNIEXPORT jobject JNICALL
Java_in_aaborne_payslipmax_core_NativePdfBridge_openDirectStream(
    JNIEnv* env,
    jobject /* this */,
    jlong native_handle,
    jint stream_length
) {
    auto* payload = reinterpret_cast<DecryptedPayload*>(native_handle);
    if (!payload || payload->buffer.size() < static_cast<size_t>(stream_length)) {
        env->ThrowNew(env->FindClass("java/lang/IllegalStateException"), "Invalid native stream context");
        return nullptr;
    }

    // Create a managed java.nio.ByteBuffer pointing directly to native memory
    jobject direct_buffer = env->NewDirectByteBuffer(
        payload->buffer.data(),
        static_cast<jlong>(stream_length)
    );

    if (!direct_buffer) {
        env->ThrowNew(env->FindClass("java/lang/OutOfMemoryError"), "Failed to allocate direct buffer");
        return nullptr;
    }

    return direct_buffer;
}
```

### 2. Kotlin Lifecycle Consumer

```kotlin
package in.aaborne.payslipmax.core

import java.io.Closeable
import java.nio.ByteBuffer

class NativePdfStream private constructor(
    private var nativeHandle: Long,
    val buffer: ByteBuffer
) : Closeable {

    private var isClosed = false

    override fun close() {
        if (!isClosed) {
            isClosed = true
            nativeRelease(nativeHandle)
            nativeHandle = 0L
        }
    }

    fun readToken(offset: Int, length: Int): ByteArray {
        check(!isClosed) { "Attempted access to closed native payload" }
        val out = ByteArray(length)
        val duplicate = buffer.duplicate()
        duplicate.position(offset)
        duplicate.get(out, 0, length)
        return out
    }

    companion object {
        init {
            System.loadLibrary("payslip_core")
        }

        external fun nativeRelease(handle: Long)
        private external fun openDirectStream(handle: Long, length: Int): ByteBuffer

        fun wrap(handle: Long, length: Int): NativePdfStream {
            val directBuffer = openDirectStream(handle, length)
            return NativePdfStream(handle, directBuffer)
        }
    }
}
```

## Battle Scars & Hard Lessons Learned

During high-density stress testing on diverse ARM64 implementations, our engineering team ran into several deep architectural constraints:

* **The 8-Byte Alignment Pitfall:** ARMv8-A instructions like `LDP`/`STP` generate unaligned access faults if your direct pointer offsets are not aligned to 64-bit boundaries. When exposing sliced direct buffers to Kotlin, always ensure sub-slices retain 8-byte alignment, or native tokenizers will crash with an uncatchable `SIGBUS`.
* **Phantom Reference Leaks:** Kotlin developers frequently assume that discarding a `ByteBuffer` triggers native memory reclamation. Direct byte buffers allocated via native addresses are completely invisible to the ART GC heap accounting. We enforced explicit `AutoCloseable` usage across every internal pipeline and added runtime leak checkers during development builds.
* **ByteBuffer Endianness Traps:** The default byte order of a freshly initialized `NewDirectByteBuffer` is `ByteOrder.BIG_ENDIAN`, whereas native ARM64 processes run in little-endian mode. Always explicitly set `buffer.order(ByteOrder.nativeOrder())` on the Kotlin side before executing primitive reads to avoid silent data corruption.
