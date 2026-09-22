---
slug: multi-agent-ai-scoring-engine-architecture
title: "Engineering Multi-Agent Evaluation Systems: Calibrating the 15 Officer Like Qualities in SSBMax"
summary: Decoupled multi-agent evaluation pipelines, speech-to-text processing, and adversarial referee prompts for defense interviews.
category: AI
publishedDate: 2026-09-05
author: AI-Borne Engineering
readTimeMinutes: 8
metricBadge: 🎯 15 OLQs Evaluated
difficulty: Advanced
tags: [Multi-Agent, Speech-to-Text, LLM Calibration, SSBMax]
---

Evaluating human leadership, emotional stability, decision-making under stress, and psychological fitness is one of the most demanding problems in applied artificial intelligence. In India's Services Selection Board (SSB) interviews, military assessors evaluate candidates across four distinct psychological factors comprising 15 Officer Like Qualities (OLQ)—ranging from Effective Intelligence and Social Adaptability to Courage and Stamina.

Attempting to evaluate these subtle behavioral traits with a single LLM prompt results in severe failure modes: sycophantic score inflation, inability to catch contradictory responses, and wild score fluctuations across identical transcripts.

In SSBMax, we solved this by designing a decoupled multi-agent evaluation architecture. By assigning specialized personas to distinct evaluation factors and introducing an adversarial referee agent to reconcile divergent assessments, we achieved reliable, calibrated scoring aligned with official military rubrics.

## In 30 Seconds

* **Factor-Decoupled Evaluator Swarm**: Four specialized agents evaluate candidate transcripts strictly within their domain: Planning & Organizing, Social Adjustment, Social Effectiveness, and Dynamic Energy.
* **Adversarial Referee Agent**: A supervisory model cross-examines individual agent ratings against candidate transcripts to punish unwarranted score inflation.
* **Rubric Calibration Clamps**: Qualitative agent judgements are mapped to deterministic scoring bounds (1 to 10 scale) using strict anchor rubrics.
* **On-Device Audio Ingestion**: Audio responses are transcribed via client-side or streaming models with speech disfluency and hesitation pause tracking.

## Architecture Blueprint

The multi-agent evaluation and calibration pipeline in SSBMax:

```
+-----------------------------------------------------------+
|                   Candidate Audio Stream                  |
+-----------------------------+-----------------------------+
                              |
                              v
+-----------------------------------------------------------+
|               Speech-to-Text & Acoustic Analysis          |
|       - Whisper STT transcript generation                 |
|       - Hesitation marker & speech rate extraction        |
+-----------------------------+-----------------------------+
                              |
                              v
+-----------------------------------------------------------+
|               Factor-Specific Evaluator Agents            |
|       - Agent 1: Factor I (Planning & Organizing)         |
|       - Agent 2: Factor II (Social Adjustment)            |
|       - Agent 3: Factor III (Social Effectiveness)        |
|       - Agent 4: Factor IV (Dynamic Energy & Courage)     |
+-----------------------------+-----------------------------+
                              |
                              v
+-----------------------------------------------------------+
|               Adversarial Referee Calibration Model       |
|       - Detects sycophancy and unsubstantiated praise     |
|       - Reconciles conflicting factor ratings             |
+-----------------------------+-----------------------------+
                              |
                              v
+-----------------------------------------------------------+
|               Calibrated 15-Factor OLQ Radar Report       |
|       (Executive breakdown, strengths & remediation plan) |
+-----------------------------------------------------------+
```

## Evaluation Paradigm Comparison

| Evaluation Dimension | Single-Prompt LLM | Human Mock Assessor | SSBMax Decoupled Multi-Agent |
| :--- | :--- | :--- | :--- |
| **Sycophancy Resistance** | Very Low (Gives easy 9s) | High | **High (Adversarial Referee)** |
| **Scoring Consistency** | High stochastic variance | Moderate (Subjective) | **Deterministic Normalized Clamps** |
| **Turnaround Time** | 3 seconds | 24 - 48 hours | **Under 15 seconds** |
| **Assessment Cost** | $0.01 / query | $50.00 - $120.00 / session | **< $0.05 / full interview** |
| **Dimensional Granularity** | Generic qualitative text | Narrative notes | **15 Factor Radar + Action Plan** |

## Production Code Recipe: Structured Multi-Agent Scoring Aggregator

Here is how SSBMax aggregates individual factor ratings and executes calibration checks to prevent score skew:

```typescript
export interface IOlqScore {
  factor: string;
  quality: string;
  rawScore: number;
  calibratedScore: number;
  evidence: string;
}

export class OlqScoringEngine {
  public static calibrateScore(rawScore: number, refereeConfidence: number, speechHesitations: number): number {
    // Punish excessive hesitation markers or low referee grounding confidence
    let score = rawScore;
    if (speechHesitations > 8) {
      score -= 1.0;
    }
    if (refereeConfidence < 0.70) {
      score *= 0.85;
    }

    // Clamp firmly between 1.0 and 10.0 scale
    return Math.max(1.0, Math.min(10.0, Math.round(score * 10) / 10));
  }

  public static generateRadarProfile(scores: IOlqScore[]): Record<string, number> {
    const profile: Record<string, number> = {};
    for (const item of scores) {
      profile[item.quality] = item.calibratedScore;
    }
    return profile;
  }
}
```

## Battle Scars & Hard-Won Lessons

1. **Eliminating Agent Echo Chambers**: When evaluators share context with each other in a sequential chain, downstream agents blindly agree with early assessments. Running the four factor evaluators in completely isolated parallel contexts eliminated groupthink.
2. **Combating LLM Sycophancy**: Without strict guardrails, models routinely tell candidates: "Excellent answer! You demonstrated great courage!" We introduced an adversarial prompt instruction: *"Your primary role is to find flaws, inconsistencies, and unverified assertions in candidate answers."*
3. **Structured Schema Enforcement**: Using JSON mode with strict runtime validation ensured that missing attributes or corrupted markdown formatting never crashes the visual radar UI.
