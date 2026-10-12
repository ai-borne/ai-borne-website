---
slug: zero-trust-payslip-pdf-stream-parsing-cpp-jni
title: Deterministic Salary Stream Parsing: Building a Zero-Trust C++ PDF Engine for Android
summary: Eliminate cloud leak risks in payroll data with an embedded zero-allocation C++ and JNI stream parser for deterministic salary slip extraction.
category: Tax Tech
publishedDate: 2026-10-12
author: AI-Borne Engineering
readTimeMinutes: 6
metricBadge: ⚡ Engineered
difficulty: Advanced
tags: ['C++', 'JNI', 'Android', 'Tax Tech', 'Zero Trust']
---

Uploading sensitive defense or enterprise payroll documents to third-party cloud OCR microservices represents a critical privacy exposure. Salary slips contain sensitive information: Permanent Account Numbers (PAN), bank account details, grade pay, defense allowances, and personal identifiers. Relying on remote computer vision models to parse these structured documents introduces network latency, recurring API costs, and serious attack surfaces. When an edge device already possesses the raw bytes of a vector PDF, shipping those bytes over the wire to parse basic text is an architectural failure.

At AI-Borne Studio, we engineered **PayslipMax** around a strict zero-trust principle: zero network calls, zero external storage writes, and fully deterministic parsing inside an on-device native C++ runtime. Here is how we bypassed monolithic PDF renderers to achieve deterministic payroll extraction on resource-constrained devices.

## In 30 Seconds

- **Zero-Egress Security:** Payslips are parsed entirely in-memory using an embedded C++ core exposed via JNI, ensuring personal financial data never touches an egress socket.
- **Stream Decoding vs. Rasterization:** Instead of rasterizing pages to bitmaps for OCR, the engine directly parses PDF content streams (`/Contents`), extracting glyph positions, fonts, and bounding boxes deterministically.
- **Spatial Table Reconstruction:** A coordinate-driven grid-snapping algorithm reconstructs ragged earning/deduction matrices without neural network hallucinations.
- **Zero-Allocation JNI Interface:** Direct memory buffers eliminate intermediate object allocation and Garbage Collection (GC) pauses during parsing.

## Architecture Blueprint

```
+-------------------------------------------------------------------------+
|                       PayslipMax Android Host                           |
|                                                                         |
|   [ Encrypted PDF Uri ]                                                 |
|             |                                                           |
|             v                                                           |
|   [ ContentResolver ] ---> (Read Into DirectByteBuffer)                 |
+-------------|-----------------------------------------------------------+
              | (Raw Memory Pointer via JNI)
              v
+-------------------------------------------------------------------------+
|                       Native C++ Core (Zero-Trust)                      |
|                                                                         |
|   +-----------------------+     +-----------------------------------+   |
|   | Cross-Reference Table | --> | Object Lexer & FlateDecode Stream |   |
|   | (/XRef & Object Streams)    | (Zero-heap decompressor)          |   |
|   +-----------------------+     +-----------------------------------+   |
|                                                   |                     |
|                                                   v                     |
|   +-----------------------+     +-----------------------------------+   |
|   | Type1 / TrueType / CID| <-- | Operator Interpreter (BT, ET, Tm) |   |
|   | ToUnicode CMap Mapper |     | Extracts Text State + Bounding Box|   |
|   +-----------------------+     +-----------------------------------+   |
|               |                                                         |
|               v                                                         |
|   +-----------------------------------------------------------------+   |
|   | Spatial 2D Grid Assembler (KD-Tree Clusterer & Row/Col Snapping)|   |
|   +-----------------------------------------------------------------+   |
|               |                                                         |
|               v                                                         |
|   +-----------------------------------------------------------------+   |
|   | Tax Engine Domain Model (Earnings, Deductions, Allowances)      |   |
|   +-----------------------------------------------------------------+   |
+-------------|-----------------------------------------------------------+
              | (FlatBuffer Serialized Struct)
              v
+-------------------------------------------------------------------------+
|                     Kotlin Tax Calculation Engine                       |
|         (Computes Regime Comparison, Deductions & Surcharges)           |
+-------------------------------------------------------------------------+
```

## Comparative Architectural Evaluation

| Dimension | Cloud Vision OCR (AWS/GCP) | PDFBox / Poppler Wrapper | PayslipMax Native C++ Core |
| :--- | :--- | :--- | :--- |
| **Data Sovereignty** | Zero (Payload sent to cloud) | Local (Device-bound) | Total Zero-Trust (Local volatile memory) |
| **Memory Footprint** | Low on client (Heavy network payload) | High (JVM heap pressure & large bindings) | Ultra-compact (Arena-allocated, native C++) |
| **Parser Determinism** | Stochastic (Hallucination risk) | High (Token-based) | Fully Deterministic (Spatial CMap binding) |
| **Network Dependency** | Mandatory (Fails offline) | None | None (Complete air-gapped operation) |
| **Defense Air-Gap Ready** | No | Yes | Yes (Field tested for armed forces formats) |

## Native Token Stream Extractor Implementation

Below is the core C++ spatial stream token parser implemented for parsing text matrices (`Tm`), setting text positions (`Td`), and reading strings from PDF content streams without rasterization overhead:

```cpp
#include <string>
#include <vector>
#include <memory>
#include <cmath>

struct GlyphToken {
    std::string text;
    float x;
    float y;
    float fontSize;
};

class PdfStreamInterpreter {
private:
    // Transformation Matrix State: [a, b, c, d, e, f]
    float ctm[6] = {1.0f, 0.0f, 0.0f, 1.0f, 0.0f, 0.0f};
    float textMatrix[6] = {1.0f, 0.0f, 0.0f, 1.0f, 0.0f, 0.0f};
    float lineMatrix[6] = {1.0f, 0.0f, 0.0f, 1.0f, 0.0f, 0.0f};
    float currentFontSize = 10.0f;

public:
    std::vector<GlyphToken> parsedTokens;

    void setFont(float size) {
        this->currentFontSize = size;
    }

    void setTextMatrix(float a, float b, float c, float d, float e, float f) {
        textMatrix[0] = a; textMatrix[1] = b;
        textMatrix[2] = c; textMatrix[3] = d;
        textMatrix[4] = e; textMatrix[5] = f;
        // Reset line matrix on explicit matrix definition
        for (int i = 0; i < 6; ++i) lineMatrix[i] = textMatrix[i];
    }

    void moveTextPosition(float tx, float ty) {
        // 'Td' operator updates line matrix and sets textMatrix to lineMatrix
        lineMatrix[4] += (tx * lineMatrix[0] + ty * lineMatrix[2]);
        lineMatrix[5] += (tx * lineMatrix[1] + ty * lineMatrix[3]);
        for (int i = 0; i < 6; ++i) textMatrix[i] = lineMatrix[i];
    }

    void emitString(const std::string& decodedUtf8) {
        if (decodedUtf8.empty()) return;

        // The absolute spatial point coordinates
        float absoluteX = textMatrix[4];
        float absoluteY = textMatrix[5];

        parsedTokens.push_back({
            decodedUtf8,
            absoluteX,
            absoluteY,
            currentFontSize
        });
    }
};

// JNI Zero-Copy Interface bridge
extern "C" JNIEXPORT jint JNICALL
Java_in_aiborne_payslipmax_parser_NativePdfEngine_parseDirectStream(
    JNIEnv* env,
    jobject /* this */,
    jobject directBuffer,
    jint bufferLength,
    jobject resultSink) {
    
    auto* rawBytes = static_cast<uint8_t*>(env->GetDirectBufferAddress(directBuffer));
    if (!rawBytes || bufferLength <= 0) return -1;

    // Parse xref and contents using stack arena allocator
    PdfStreamInterpreter interpreter;
    
    // Deterministic lexical parsing occurs directly across rawBytes
    // ... (Stream parsing pipeline logic) ...
    
    return static_cast<jint>(interpreter.parsedTokens.size());
}
```

## Battle Scars & Hard Lessons Learned

1. **The Broken /ToUnicode CMap Trap:** Legacy defense payroll generators often omit or corrupt standard `/ToUnicode` mapping tables. Glyphs decode into arbitrary ASCII characters or private use area codes (e.g., character code `0x0041` emitting a rupee symbol or a colon). We resolved this by building a secondary glyph width and kerning fingerprinting fallback, which identifies critical financial keywords even when font stream identifiers are stripped.

2. **Garbage Collection Pressure Across the JNI Boundary:** Emitting thousands of individual token objects from C++ into the JVM via `FindClass` and `NewObject` causes noticeable frame drops and memory spikes during batch analysis. We eliminated all fine-grained JNI callbacks. Instead, the native core packs parsed tokens and calculated salary line-items into an off-heap flat binary buffer. Kotlin decodes the table structure in a single pass using memory-mapped pointers.

3. **Ragged Grid Alignments:** PDF tables rarely consist of actual vector lines. Most payroll software generates visual tables using whitespace and explicit `Tm` (Text Matrix) coordinates. Relying solely on raw coordinates fails when columns contain line wraps. We implemented a dynamic 2D clustering algorithm: horizontal bounds are grouped using adaptive band intervals, while vertical alignments are snapped to a virtual baseline grid. This reliably aligns basic pay, DA, HRA, and tax deductions without relying on heavy OCR engines.
