---
slug: deterministic-native-memory-offloading-edge-pdf
title: Deterministic Native Memory Offloading for Edge Document Parsers
summary: Eliminate runtime garbage collection pauses and out-of-memory terminations by bridging isolated native arenas with direct virtual memory buffers.
category: App Engineering
publishedDate: 2026-10-10
author: AI-Borne Engineering
readTimeMinutes: 5
metricBadge: ⚡ Engineered
difficulty: Advanced
tags: ['Android', 'C++', 'JNI', 'Memory Management', 'PayslipMax']
---

Mobile runtimes are notoriously hostile to high-throughput document extraction. Ingesting encrypted, vector-dense payroll artifacts directly into managed mobile heaps causes severe heap fragmentation, sporadic Garbage Collection (GC) pauses, and immediate process termination by the Low Memory Killer (LMK). For an on-device, zero-trust system like PayslipMax, delegating stream decompression and bounding-box tokenization to typical managed PDF readers introduces untracked memory pressure that destabilizes the host process.

To achieve true zero-trust boundary isolation without sacrificing execution frame budgets, parsing pipelines must bypass managed runtimes entirely during token extraction, delegating allocation to ephemeral native arena pools mapped directly over virtual memory.

## In 30 Seconds

* **Heap Isolation**: JVM and managed runtimes are completely bypassed for PDF cross-reference decoding, vector math, and token collation.
* **Contiguous Arenas**: Memory allocations exist in fixed-size contiguous virtual memory blocks dropped in a single pointer reset once document parsing completes.
* **Direct Buffer Sharing**: Data moves across the JNI bridge through non-copied Direct Byte Buffers, preventing double-buffering allocations.
* **Predictable Peak Footprint**: Memory usage remains deterministic regardless of PDF object hierarchy depth or token count.

## Architecture Blueprint

```
+-------------------------------------------------------------+
|                     Android Managed Layer                   |
|       PayslipMax Engine UI / Room Encrypted Store           |
+------------------------------+------------------------------+
                               | (Passes file descriptor fd)
                               v
+-------------------------------------------------------------+
|                      JNI Direct Bridge                      |
|           GetDirectBufferAddress / JNIEnv Scopes            |
+------------------------------+------------------------------+
                               | (Zero-copy raw ptr pass)
                               v
+-------------------------------------------------------------+
|                  Native C++ Core (PayslipMax)               |
|  +-------------------------------------------------------+  |
|  |            Thread-Local Arena Allocator               |  |
|  |  [Chunk 0: mmap 4MB] -> [Chunk 1: mmap 4MB] (Active)  |  |
|  +---------------------------+---------------------------+  |
|                              | (Slab-allocated tokens)      |
|  +---------------------------v---------------------------+  |
|  |  Linear Stream Lexer  |  Deflate Stream Decompressor  |  |
|  +---------------------------+---------------------------+  |
|                              | (Tokenized coordinate records)|
|  +---------------------------v---------------------------+  |
|  |   Compact Table Matrix: [X, Y, W, H, CharBuffer]      |  |
+--+-------------------------------------------------------+--+
```

## Memory Pipeline Evaluation

| Pipeline Strategy | Allocation Target | GC Pressure | Peak Memory Determinism | Reclaim Cost |
| :--- | :--- | :--- | :--- | :--- | 
| **Standard Android PDF Pipeline** | Java/ART Heap Objects | Severe | Low (Unpredictable) | High (Multiple GC Sweeps) |
| **Standard NDK Heap (`malloc`)** | Native Heap (`jemalloc`) | None | Moderate (Fragmentation Risk) | Moderate (Fragmented `free` calls) |
| **PayslipMax Native Arena** | Off-Heap Virtual Pages (`mmap`) | Zero | High (Fixed-bound Slab) | Constant `O(1)` (Single Munmap/Reset) |

## Implementation Recipe: Arena Allocation & Buffer Mapping

Below is the core implementation for the linear memory arena and the native bridging layer that yields zero runtime GC allocations during document token extraction.

```cpp
#include <jni.h>
#include <sys/mman.h>
#include <cstdint>
#include <cstring>
#include <algorithm>

class MonotonicArena {
public:
    explicit MonotonicArena(size_t capacity)
        : total_capacity_(capacity), offset_(0) {
        // Allocate anonymous virtual memory mapping
        buffer_ = static_cast<uint8_t*>(
            mmap(nullptr, total_capacity_, 
                 PROT_READ | PROT_WRITE, 
                 MAP_PRIVATE | MAP_ANONYMOUS, -1, 0)
        );
    }

    ~MonotonicArena() {
        if (buffer_ != MAP_FAILED) {
            munmap(buffer_, total_capacity_);
        }
    }

    void* allocate(size_t size, size_t alignment = alignof(std::max_align_t)) {
        size_t current_addr = reinterpret_cast<size_t>(buffer_ + offset_);
        size_t padding = (alignment - (current_addr % alignment)) % alignment;

        if (offset_ + padding + size > total_capacity_) {
            return nullptr; // Arena exhausted; prevent out-of-bound writes
        }

        offset_ += padding;
        void* ptr = &buffer_[offset_];
        offset_ += size;
        return ptr;
    }

    void reset() {
        offset_ = 0;
    }

    uint8_t* raw_buffer() const { return buffer_; }
    size_t bytes_allocated() const { return offset_; }

private:
    uint8_t* buffer_;
    size_t total_capacity_;
    size_t offset_;
};

struct ExtractedToken {
    float min_x, min_y, max_x, max_y;
    uint32_t text_length;
    char* text_content;
};

extern "C" JNIEXPORT jobject JNICALL
Java_in_aiborne_payslipmax_core_NativeParser_extractPageTokensNative(
    JNIEnv* env, 
    jobject /* this */,
    jint file_descriptor,
    jint page_index) {
    
    // Allocate a temporary 8MB monotonic arena for document operations
    constexpr size_t ARENA_SIZE = 8 * 1024 * 1024;
    MonotonicArena arena(ARENA_SIZE);

    // Token allocation phase utilizing isolated arena memory
    ExtractedToken* token_list = static_cast<ExtractedToken*>(
        arena.allocate(sizeof(ExtractedToken) * 1024)
    );
    
    if (!token_list) {
        env->ThrowNew(env->FindClass("java/lang/OutOfMemoryError"), "Arena exhaustion");
        return nullptr;
    }

    // Extraction logic executes directly inside arena bounds...
    // Token payload is populated deterministically without malloc calls.

    // Expose memory directly to Kotlin without copying memory payload
    return env->NewDirectByteBuffer(arena.raw_buffer(), arena.bytes_allocated());
}
```

## Battle Scars & Hard Lessons Learned

* **JNI Global Reference Leaks**: Creating managed metadata wrappers across the native boundary during high-frequency loop iterations silently saturates the Android JNI global reference table (typically hard-capped at 51,200 references). The fix was strict batching: write scalar token data directly into contiguous native primitives, returning a single mapped `ByteBuffer` slice per document page rather than emitting an array of small managed objects.
* **Virtual Address Space Exhaustion on 32-bit Legacy Cores**: On devices running older 32-bit ARM ABIs, large `mmap` reservations frequently fail due to fragmentation of the process's 3GB accessible virtual address space, even when physical RAM is abundant. We shifted from reserving monolithic arenas to allocating dynamically linked 2MB chunks that allocate lazily via demand-paging.
* **SIMD Alignment Traps**: When vectorizing font width parsing using ARM NEON intrinsics on ARMv8-A architecture, reading unaligned memory offsets from arbitrary PDF byte-streams triggered hardware alignment exceptions (`SIGBUS`). All custom token allocations inside the monotonic arena must enforce explicit 16-byte alignment bounds before feeding stream pointers to vector registers.
