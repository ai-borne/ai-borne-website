---
slug: zero-allocation-pdf-stream-demuxing-tax-tech
title: Zero-Allocation PDF Stream Demuxing for Sensitive Financial Extraction
summary: Architecting an on-device zero-copy C++ stream parser bridged to Kotlin to extract confidential payroll artifacts without cloud leakage.
category: Tax Tech
publishedDate: 2026-10-20
author: AI-Borne Engineering
readTimeMinutes: 6
metricBadge: ⚡ Engineered
difficulty: Advanced
tags: ['C++', 'JNI', 'Android', 'Tax Tech', 'Zero Trust']
---

Every month, thousands of employees blindly upload password-protected military and corporate compensation records to third-party cloud OCR endpoints. The trade-off is unacceptable: you hand raw taxable income, social identifiers, and allowances over the wire to rented infrastructure just to extract a tabular statement. Concurrently, native runtime runaways occur when standard JVM-based PDF tooling attempts to decode nested xref streams inside mobile constraints, triggering indiscriminate heap fragmentation and out-of-memory crashes on entry-level hardware.

Building **PayslipMax** demanded abandoning conventional JVM PDF engines entirely. We engineered a native zero-allocation stream demuxer in modern C++ linked directly into Kotlin via the Java Native Interface (JNI). By treating the underlying byte array as a memory-mapped, immutable virtual slice, we parse structural objects, deflate flate-encoded cross-reference streams, and extract dimensional text coordinates on-device without leaking a single byte outside the sandboxed process.

## In 30 Seconds

*   **Zero-Trust Guarantee:** Payroll artifacts are processed locally in native memory; zero network transactions occur during the entire extraction lifecycle.
*   **Zero-Copy Virtual Buffers:** PDF streams pass from the platform's native file descriptor into modern C++ `std::string_view` windows without allocating heap memory for parsing boundaries.
*   **Custom Deflate Pipe:** Instead of decoding the entire document graph into an AST, we lazily hydrate only targeted content streams using direct zlib memory channels.
*   **Deterministic Coordinate Extraction:** Tabular columns are deduced from raw `BT ... ET` PDF operator positions, avoiding stochastic hallucinations inherent to large vision models.
*   **Safe JNI Interop:** Direct `ByteBuffer` bindings pass parsed structured records into Kotlin coroutines without bridging intermediate String objects across the boundary.

## Architecture Blueprint

```
+-------------------------------------------------------------+
|                      Kotlin / Android Layer                 |
|  +-------------------------+   +-------------------------+  |
|  | Storage Access Framework|   | Coroutine Dispatcher    |  |
|  | (Raw FileDescriptor)    |   | (Immutable Domain Model)|  |
+--------------+------------------------------^---------------+|
               |                              |                
       mmap fd |                              | Direct Buffer  
+--------------v------------------------------+---------------+|
|                    JNI C++ Engine Boundary                  |
|  +-------------------------------------------------------+  |
|  | DirectByteBuffer / MemoryMappedFile                   |  |
|  | (No JVM heap copy; byte slices via std::string_view)   |  |
|  +---------------------------+---------------------------+  |
|                              |                               
|  +---------------------------v---------------------------+  |
|  | Custom Lexer: /XRef Streams & Trailer Object Decoder   |  |
|  +---------------------------+---------------------------+  |
|                              |                               
|  +---------------------------v---------------------------+  |
|  | Streaming Inflate Engine (zlib chunk-fed pipeline)    |  |
|  +---------------------------+---------------------------+  |
|                              |                               
|  +---------------------------v---------------------------+  |
|  | Deterministic Operator Evaluator: Tm, Td, TJ, ET, BT  |  |
|  +---------------------------+---------------------------+  |
|                              |                               
|  +---------------------------v---------------------------+  |
|  | Columnar Bounds Classifier (Taxable / Non-Taxable)    |  |
+-------------------------------------------------------------+
```

## Parsing Strategy Trade-Offs

| Dimension | Cloud OCR Engine | JVM PDF Engine (iText/PDFBox) | PayslipMax Native Demuxer |
| :--- | :--- | :--- | :--- |
| **Data Residency** | Remote cloud ingestion (high risk) | On-device, local sandbox | Fully isolated on-device native memory |
| **Memory Profile** | Low local footstep (heavy network) | Unbounded JVM allocations, GC spikes | Bound to bounded static buffers and zero-copy mmap |
| **Execution Guarantees** | Network & latency dependent | Prone to native JVM OOMs on 2GB devices | Direct POSIX mmap with lazy page-in semantics |
| **Parsing Model** | Probabilistic vision bounding boxes | Full AST hydration into object trees | Selective byte-stream scanner with zero AST overhead |
| **Tabular Precision** | Prone to coordinate drift | Structural parsing, heavy memory footprint | Exact coordinate geometry extraction via raw PDF ops |

## Implementing the Native Stream Scanner

Below is an architectural recipe demonstrating the zero-copy C++ stream demuxer hooked directly to Android's memory via JNI. Notice the usage of `std::string_view` to slice byte chunks without spawning intermediate memory allocations.

```cpp
#include <jni.h>
#include <string_view>
#include <vector>
#include <zlib.h>
#include <android/log.h>

struct TextFragment {
    float x, y;
    std::string_view text;
};

class NativePdfStreamScanner {
private:
    const uint8_t* raw_buffer_;
    size_t length_;

public:
    NativePdfStreamScanner(const uint8_t* buffer, size_t length)
        : raw_buffer_(buffer), length_(length) {}

    bool FindStreamBounds(size_t obj_offset, size_t& out_start, size_t& out_end) {
        std::string_view doc(reinterpret_cast<const char*>(raw_buffer_), length_);
        size_t stream_pos = doc.find("stream", obj_offset);
        if (stream_pos == std::string_view::npos) return false;

        // Skip trailing CRLF after stream token
        size_t data_start = (doc[stream_pos + 6] == '\r') ? stream_pos + 8 : stream_pos + 7;
        size_t end_pos = doc.find("endstream", data_start);
        if (end_pos == std::string_view::npos) return false;

        out_start = data_start;
        out_end = end_pos;
        return true;
    }

    std::vector<uint8_t> DecompressChunk(size_t start, size_t end) {
        std::vector<uint8_t> decompressed(65536);
        z_stream strm{};
        strm.next_in = const_cast<Bytef*>(raw_buffer_ + start);
        strm.avail_in = static_cast<uInt>(end - start);
        strm.next_out = decompressed.data();
        strm.avail_out = static_cast<uInt>(decompressed.size());

        if (inflateInit(&strm) != Z_OK) return {};
        int ret = inflate(&strm, Z_FINISH);
        inflateEnd(&strm);

        if (ret == Z_STREAM_END || ret == Z_OK) {
            decompressed.resize(strm.total_out);
            return decompressed;
        }
        return {};
    }
};

extern "C" JNIEXPORT jint JNICALL
Java_in_aiborne_payslipmax_parser_NativePdfEngine_parseStream(
    JNIEnv* env,
    jobject /* this */,
    jobject directBuffer,
    jlong bufferLength) {
    
    auto* buffer = reinterpret_cast<const uint8_t*>(
        env->GetDirectBufferAddress(directBuffer)
    );
    
    if (!buffer || bufferLength <= 0) return -1;

    NativePdfStreamScanner scanner(buffer, static_cast<size_t>(bufferLength));
    size_t stream_start = 0, stream_end = 0;
    
    if (scanner.FindStreamBounds(0, stream_start, stream_end)) {
        auto bytes = scanner.DecompressChunk(stream_start, stream_end);
        return static_cast<jint>(bytes.size());
    }
    
    return 0;
}
```

## Battle Scars & Hard Lessons Learned

1. **Garbage-Collector Thrashing Across JNI:** In earlier iterations, passing decoded tokens as dynamic `jobjectArray` instances containing `java.lang.String` caused the ART collector to trigger continuous compaction cycles on lower-tier hardware. We eradicated this by allocating a single contiguous native memory block (direct byte buffer) where text fragments, offsets, and scalar coordinates are packed as serialized binary flat buffers, accessed from Kotlin using pointer offsets.
2. **The Non-Linear XRef Trap:** Standard PDF specifications allow cross-reference updates to append to the end of the file. Legacy payslip generation software used by government accounts offices frequently outputs non-standard incremental offsets or broken `/Prev` links. Relying on an AST walker caused deadlocks. We altered our lexer to scan backwards from the trailing boundary (`%%EOF`) using a sliding window to parse the primary xref table without traversing historical document modifications.
3. **Font Matrix Non-Standard Glyph Mapping:** Some enterprise enterprise-resource-planning engines strip standard Adobe Latin encoding tables, rendering payslips with custom `/ToUnicode` CMaps or raw octal char codes. Relying on character casting yielded scrambled garbage text for gross salary metrics. We had to build a fall-back glyph-width matrix resolver that infers glyph offsets via font boundary metrics when `/ToUnicode` maps are missing or corrupt.
4. **Page Cache Eviction Pressure:** Processing large PDF payloads directly in Android memory without triggering the Low Memory Killer (LMK) required explicitly configuring POSIX `madvise` with `MADV_WILLNEED` on specific byte offsets containing content streams, followed immediately by `MADV_DONTNEED` once token extraction concludes. This avoids memory spikes and leaves the operational page cache intact.
