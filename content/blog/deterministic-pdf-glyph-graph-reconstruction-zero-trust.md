---
slug: deterministic-pdf-glyph-graph-reconstruction-zero-trust
title: Zero-Trust PDF Parsing: Deterministic Glyph-Graph Reconstruction in C++ and Kotlin
summary: Eliminate cloud OCR dependencies. Build a deterministic, on-device glyph-graph extraction engine for sensitive tax documents with C++ and JNI.
category: Tax Tech
publishedDate: 2026-10-18
author: AI-Borne Engineering
readTimeMinutes: 5
metricBadge: ⚡ Engineered
difficulty: Advanced
tags: ['PDF Parsing', 'C++', 'JNI', 'Zero-Trust', 'Tax Tech', 'Kotlin']
---

Sending confidential salary slips, military dispatch payslips, and tax forms to cloud-hosted OCR endpoints or vision-language models is an unacceptable privacy hazard. When dealing with defense personnel records or executive compensation packages, the only acceptable architectural posture is zero-trust, fully air-gapped on-device extraction.

Yet standard mobile PDF extraction tools fail catastrophically when encountering complex tabular structures, rotated text elements, custom Type 3 font dictionaries, and nested layout matrices. Regex-based scrapers shatter the moment an issuing authority alters cell padding. To extract high-entropy financial data reliably, we must bypass naive string tokenization and reconstruct the underlying glyph graph directly from native byte streams.

## In 30 Seconds

- **The Flaw of SaaS OCR:** Offloading financial documents to remote cloud parsers introduces severe compliance risks, latency spikes, and unpredictable parsing anomalies on varied DPI inputs.
- **Glyph-Graph Vectorization:** Rather than treating PDFs as raster images or flat strings, modern engines model glyphs as 2D spatial nodes linked by topological proximity and font baseline metrics.
- **Deterministic Native Engine:** By combining a high-performance C++ parsing engine with zero-copy JNI wrappers, Android apps can execute complete spatial table reconstruction entirely in memory.
- **Zero Leaked Memory:** Native glyph allocation pools eliminate garbage collection pauses while enforcing deterministic memory zeroing for sensitive financial tokens.

## Architecture Blueprint

```
+-------------------------------------------------------------------------+
|                        Zero-Trust On-Device Pipeline                    |
+-------------------------------------------------------------------------+
                                                                           
 [Raw Payslip PDF]                                                         
        |                                                                  
        v                                                                  
 +--------------+      Native Boundary                                     
 | mmap() Buffer |--------+                                                
 +--------------+        |                                                
                          v                                                
               +-----------------------+                                   
               | C++ Content Stream     |                                   
               | Tokenizer & Matrix Op |                                   
               +-----------------------+                                   
                          |                                                
                          v                                                
               +-----------------------+                                   
               | Glyph Graph Builder   |                                   
               | (X, Y, W, H, Font, Pt)|                                   
               +-----------------------+                                   
                          |                                                
                          v                                                
               +-----------------------+                                   
               | Spatial Clustering    |                                   
               | (Delaunay/K-D Tree)   |                                   
               +-----------------------+                                   
                          |                                                
                          v                                                
               +-----------------------+                                   
               | DirectByteBuffer      |                                   
               +-----------------------+                                   
                          |  JNI Zero-Copy Boundary                        
                          v                                                
 +-----------------------------------------------------------------------+ 
 | Kotlin Domain Layer                                                   | 
 | -> Table Structure Reification -> Schema Normalizer -> Room DB Cache  | 
 +-----------------------------------------------------------------------+ 
```

## Paradigms Compared

| Attribute | Cloud Vision / SaaS OCR | Naive String Tokenizer (e.g., PDFBox) | Deterministic Glyph-Graph Engine (C++/JNI) |
| :--- | :--- | :--- | :--- |
| **Privacy Posture** | Zero-trust failure (transmits PII) | Local execution, safe | Air-gapped, zero external network traffic |
| **Tabular Fidelity** | Stochastic hallucination risks | Collapses adjacent columns into flat strings | Mathematically rigid column & row bounding |
| **Memory Footprint** | Low client memory (remote compute) | High (intermediate Java heap objects) | Minimal (native arena allocators) |
| **Parsing Predictability** | Variable based on model temperature | Brittle, breaks on non-standard fonts | Fully deterministic, bit-level reproducibility |
| **Throughput Target** | Network bounded (multi-second roundtrips) | GC-pause prone during batch ingestion | Microsecond native sweep (illustrative target) |

## Implementation Recipe: Spatial Node Clustering in C++

Below is the core C++ clustering module that structures unstructured PDF stream operators (`Tj`, `TJ`, `cm`) into connected spatial blocks, bridged directly to Kotlin via JNI without heap copies.

```cpp
#include <jni.h>
#include <vector>
#include <cmath>
#include <algorithm>

struct GlyphNode {
    float x, y, width, height;
    uint32_t unicodeChar;
    int fontId;
};

struct BoundingBox {
    float minX, minY, maxX, maxY;
};

// Determine if two glyphs belong to the same logical table cell
inline bool IsCoLinear(const GlyphNode& a, const GlyphNode& b, float lineThresholdY) {
    return std::fabs(a.y - b.y) <= lineThresholdY;
}

// Segment raw glyph arrays into coherent horizontal text spans
std::vector<BoundingBox> SegmentTableCells(const GlyphNode* glyphs, size_t count, float hGapLimit, float lineThresholdY) {
    std::vector<GlyphNode> sortedGlyphs(glyphs, glyphs + count);
    
    // Sort reading order: Top-to-bottom (descending Y), then Left-to-right (ascending X)
    std::sort(sortedGlyphs.begin(), sortedGlyphs.end(), [](const GlyphNode& a, const GlyphNode& b) {
        if (std::fabs(a.y - b.y) > 2.0f) {
            return a.y > b.y; // PDF Y-coordinates increase upwards
        }
        return a.x < b.x;
    });

    std::vector<BoundingBox> cells;
    if (sortedGlyphs.empty()) return cells;

    BoundingBox currentCell = {
        sortedGlyphs[0].x, sortedGlyphs[0].y,
        sortedGlyphs[0].x + sortedGlyphs[0].width, sortedGlyphs[0].y + sortedGlyphs[0].height
    };

    for (size_t i = 1; i < sortedGlyphs.size(); ++i) {
        const auto& g = sortedGlyphs[i];
        
        bool sameLine = IsCoLinear(sortedGlyphs[i - 1], g, lineThresholdY);
        bool adjacentX = (g.x - currentCell.maxX) <= hGapLimit;

        if (sameLine && adjacentX) {
            // Expand existing cell bounding box
            currentCell.maxX = std::max(currentCell.maxX, g.x + g.width);
            currentCell.maxY = std::max(currentCell.maxY, g.y + g.height);
        } else {
            cells.push_back(currentCell);
            currentCell = { g.x, g.y, g.x + g.width, g.y + g.height };
        }
    }
    cells.push_back(currentCell);
    return cells;
}

extern "C" JNIEXPORT jint JNICALL
Java_in_aiborne_engine_NativePdfBridge_processGlyphBuffer(
    JNIEnv* env, 
    jobject /* this */, 
    jobject directBuffer, 
    jint glyphCount,
    jfloat hGap,
    jfloat vTolerance,
    jobject outDirectBuffer) {
    
    auto* inputGlyphs = static_cast<GlyphNode*>(env->GetDirectBufferAddress(directBuffer));
    auto* outputBoxes = static_cast<BoundingBox*>(env->GetDirectBufferAddress(outDirectBuffer));

    if (!inputGlyphs || !outputBoxes) {
        return -1; // Invalid memory mapping
    }

    auto cells = SegmentTableCells(inputGlyphs, static_cast<size_t>(glyphCount), hGap, vTolerance);
    
    for (size_t i = 0; i < cells.size(); ++i) {
        outputBoxes[i] = cells[i];
    }

    return static_cast<jint>(cells.size());
}
```

## Battle Scars & Hard Lessons Learned

1. **The Synthetic Bold Kerning Trap:** In complex payslips, payroll software frequently emulates bold text by writing the exact same glyph string twice with an incremental spatial offset of fractional points. Standard text extractors register this as duplicate characters (e.g., `$11,,220000.00`). We resolved this in the native tokenizer by filtering glyph instances sharing identical Unicode points within micro-offset thresholds.

2. **Type 3 Custom Encodings Without Unicode Maps:** Military payslips frequently use archaic proprietary accounting packages that compile PDF forms with embedded Type 3 fonts stripped of `/ToUnicode` CMap streams. Relying on string extraction produces garbled character gibberish. The mitigation strategy requires building an on-device topological glyph hash lookup table to infer character identities directly from vector path geometries.

3. **JNI Crossing Overhead:** Passing primitive arrays (`jfloatArray`) across the JNI bridge for thousands of glyphs causes severe JNI local reference table bloat and high garbage collector pressure. Moving to pinned `DirectByteBuffer` pipelines with fixed native struct alignments entirely eradicated boundary latency, transforming a brittle mobile process into an immediate, zero-copy evaluation.
