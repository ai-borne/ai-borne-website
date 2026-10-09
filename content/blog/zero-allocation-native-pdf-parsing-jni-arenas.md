---
slug: zero-allocation-native-pdf-parsing-jni-arenas
title: Zero-Allocation Native PDF Stream Parsing: Hardening JNI and C++ Memory Arenas
summary: A deep dive into building an in-memory, zero-copy PDF parser using C++ arenas and JNI primitives for zero-trust document processing.
category: App Engineering
publishedDate: 2026-10-09
author: AI-Borne Engineering
readTimeMinutes: 5
metricBadge: ⚡ Engineered
difficulty: Advanced
tags: ['Android', 'C++', 'JNI', 'Zero Trust', 'PDF Parsing']
---

Sending defence payroll manifests and employee salary slips to server-side OCR endpoints is a structural security failure. In zero-trust mobile deployments, document data must never transit network boundaries. Yet, executing complex PDF document extraction on-device typically crushes the Android runtime: Java-based document parsers allocate millions of transient string and node objects per document, destabilizing the ART heap and triggering aggressive garbage collection freezes on resource-constrained devices.

To eliminate both PII exfiltration and runtime thrashing, PayslipMax isolates parsing in a custom, sandboxed C++ core that leverages fixed-size region allocators and direct JNI memory mappings.

## In 30 Seconds

* **Heap Isolation:** Bypasses ART garbage collection entirely by confining tokenization to native, monotonic memory arenas.
* **Zero-Copy Boundary:** Uses `java.nio.DirectByteBuffer` to hand raw byte vectors from Kotlin to C++ without intermediary memory duplicates.
* **Vectorized Lexing:** Reads PDF cross-reference tables and content streams using an iterative, non-backtracking state machine.
* **Strict Zero-Trust:** All glyph mapping, boundary bounding-box recovery, and financial tabular assembly happen completely offline in RAM.

## Architecture Blueprint

```
+-------------------------------------------------------------+
|                     Android ART / Kotlin                    |
|                                                             |
|  +-------------------------+     +-----------------------+  |
|  | Storage Access Framework|     | Tabular Extraction UI |  |
|  +------------+------------+     +-----------^-----------+  |
|               |                              |              |
|               | Raw Document FileChannel     | Flat Primitive|
|               v                              | Result Array |
|  +-------------------------+                 |              |
|  | DirectByteBuffer Bridge |-----------------+              |
+---------------+---------------------------------------------+
                | (Direct JNI Pointer Mapping - Zero Copy)
+---------------v---------------------------------------------+
|                 PayslipMax Native C++ Core                  |
|                                                             |
|  +--------------------+      +---------------------------+  |
|  | Fixed-Size Arena   | ---> | Cross-Reference Parser    |  |
|  | Linear Allocator   |      +-------------+-------------+  |
|  +---------+----------+                    |                |
|            | Resets Per Page               v                |
|            +---------------> +---------------------------+  |
|                              | Lexer & Operator Scanner  |  |
|                              +-------------+-------------+  |
|                                            |                |
|                                            v                |
|                              +---------------------------+  |
|                              | Matrix Grid Reconstructor |  |
+------------------------------+---------------------------+--+
```

## Memory and Performance Topology

| Dimension | JVM-Centric Parser (e.g., PdfBox-Android) | Edge WASM Runtime | PayslipMax Native Arena Core |
| :--- | :--- | :--- | :--- | 
| **Allocation Strategy** | Ephemeral dynamic heap objects | Linear WASM pages (clamped heap) | Fixed pre-allocated C++ monotonic arena |
| **Bridge Overhead** | Zero (Native Java context) | Serialization through JS wrapper | Zero-copy direct buffer pointers |
| **GC Pressure** | Severe; high nursery-space churn | None (managed host heap isolated) | Zero ART GC impact |
| **Binary Footprint** | Bloated runtime jars | Heavy engine runtime inclusion | Minimal stripped static C++ binary |
| **Privacy Posture** | Local on-device execution | Local sandboxed browser thread | Local zero-trust hardened native binary |

## Code Recipe: Zero-Copy Stream Processing and Arena Allocation

The following recipe demonstrates passing a direct memory descriptor across the JNI bridge and using a non-fragmenting linear allocator to parse stream dictionaries.

```cpp
#include <jni.h>
#include <cstdint>
#include <cstdlib>
#include <cstring>
#include <string_view>

class LinearArena {
private:
    uint8_t* buffer;
    size_t capacity;
    size_t offset;

public:
    LinearArena(size_t size) : capacity(size), offset(0) {
        buffer = static_cast<uint8_t*>(std::malloc(size));
    }

    ~LinearArena() {
        std::free(buffer);
    }

    void* allocate(size_t size) {
        // Align allocations to 8-byte boundaries
        size_t aligned_size = (size + 7) & ~7;
        if (offset + aligned_size > capacity) {
            return nullptr; // Arena exhausted
        }
        void* ptr = &buffer[offset];
        offset += aligned_size;
        return ptr;
    }

    void reset() {
        offset = 0;
    }
};

struct ExtractedCell {
    float x;
    float y;
    uint32_t charCount;
    char* text;
};

extern "C" JNIEXPORT jint JNICALL
Java_in_aaborne_payslipmax_parser_NativePdfEngine_parseStreamInternal(
    JNIEnv* env,
    jobject /* thiz */,
    jobject directBuffer,
    jlong bufferLength,
    jlong arenaCapacityBytes
) {
    // Acquire pointer without creating a byte array copy
    auto* streamData = static_cast<const uint8_t*>(
        env->GetDirectBufferAddress(directBuffer)
    );

    if (!streamData || bufferLength <= 0) {
        return -1; // Invalid memory pointer
    }

    // Initialize linear arena for deterministic zero-allocation parsing
    LinearArena arena(static_cast<size_t>(arenaCapacityBytes));

    // Tokenize document stream sequentially
    size_t cursor = 0;
    size_t cellCount = 0;
    while (cursor < static_cast<size_t>(bufferLength)) {
        // Match simple PDF text showing operator: (Text) Tj
        if (streamData[cursor] == '(') {
            size_t start = ++cursor;
            while (cursor < static_cast<size_t>(bufferLength) && streamData[cursor] != ')') {
                cursor++;
            }
            
            size_t tokenLength = cursor - start;
            if (cursor < static_cast<size_t>(bufferLength) && tokenLength > 0) {
                auto* cell = static_cast<ExtractedCell*>(arena.allocate(sizeof(ExtractedCell)));
                if (!cell) break; // Out of arena bounds

                cell->text = static_cast<char*>(arena.allocate(tokenLength + 1));
                if (!cell->text) break;

                std::memcpy(cell->text, &streamData[start], tokenLength);
                cell->text[tokenLength] = '\0';
                cell->charCount = tokenLength;
                cellCount++;
            }
        }
        cursor++;
    }

    // Arena safely deallocates all cells together on scope exit
    return static_cast<jint>(cellCount);
}
```

## Battle Scars & Hard Lessons Learned

* **DirectByteBuffer Alignment Hazards:** Passing a memory mapped file using `FileChannel.MapMode.READ_ONLY` into JNI allows rapid zero-copy parsing. However, unaligned memory reads across page boundaries on older ARMv7 architectures can cause hardware abort signals. Always enforce strict pointer alignment inside C++ access paths.
* **Corrupt Cross-Reference Stream Offsets:** Defence-grade payslips generated by decades-old enterprise ERP engines frequently contain inaccurate xref offsets. A production parser must implement a speculative sliding-window byte scan that identifies trailing xref anchors rather than blindly trusting the header metadata.
* **JNI Local Reference Table Saturation:** When returning parsed tables back up to Java, calling JNI reflection methods inside tight lexical loops quickly saturates the standard local reference table (capped at 512 entries). Instead, populate a pre-allocated primitive array or direct contiguous buffer, passing the entire payload back in a single boundary traversal.
* **Malformed Identity Font Maps:** Real-world payslips often drop standard ASCII fonts in favor of synthetic subsets with scrambled ToUnicode mapping tables. Failing to compute native CMap translation leads to gibberish text output. We embed a minimal native CMap resolution engine directly inside the arena context to map raw glyph codes back to UTF-8 without JVM string conversion.
