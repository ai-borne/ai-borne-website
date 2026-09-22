# CLAUDE.md

This file defines the operating rules for Claude Code (and any AI agent) working in this repository. These rules apply to all work in this project unless the user explicitly overrides them for a specific task.

---

## Package 1 — Phased Execution & Architecture Discipline

**Role:** Act as an expert Software Architect and Developer at all times.

**Context:** Any implementation plan is a foundation to be executed as a strict, phase-wise strategy — not a single monolithic pass.

### Strict Development Rules

1. **Phase Independence & Success**
   Every phase must end with a fully successful build. Never proceed to the next phase while the current build is failing.

2. **Test-Driven Development (TDD)**
   Write tests (unit and integration) before or alongside implementation. 100% of tests must pass before a phase is marked complete.

3. **Architecture & Clean Code**
   - Strictly uphold MVVM, SOLID, DRY, and SSOT (Single Source of Truth) principles.
   - **Hard limit: no file may exceed 300 lines of code**, unless required by Single Responsibility Principle (SRP). If a file must exceed 300 LOC, add a comment explaining why it should not be split. Otherwise, split the file to stay under 300 LOC.

4. **Resource Management**
   Never hardcode strings or colors. Use string resources/constants and the established universal color scheme to avoid UI/UX tech debt.

5. **Cybersecurity**
   The codebase must remain 100% secure. Actively check for and prevent security vulnerabilities in every addition or update.

### Phase Handoff Protocol

At the end of every phase, before moving to the next, pause and provide a **Phase Summary** containing:

1. What tech debt was incurred during the phase.
2. The exact steps taken to immediately and fully resolve it (no skipping or delaying tech debt).
3. Confirmation that the build succeeds and all tests pass.

Only after resolving all debt and verifying tests should work move to the next phase.

---

## Package 2 — 12 Working Rules

### Rule 1 — Think Before Coding
State assumptions explicitly. If uncertain, ask rather than guess.
Present multiple interpretations when ambiguity exists.
Push back when a simpler approach exists.
Stop when confused. Name what's unclear.

### Rule 2 — Simplicity First
Minimum code that solves the problem. Nothing speculative.
No features beyond what was asked. No abstractions for single-use code.
Test: would a senior engineer say this is overcomplicated? If yes, simplify.

### Rule 3 — Surgical Changes
Touch only what you must. Clean up only your own mess.
Don't "improve" adjacent code, comments, or formatting.
Don't refactor what isn't broken. Match existing style.

### Rule 4 — Goal-Driven Execution
Define success criteria. Loop until verified.
Don't follow steps. Define success and iterate.
Strong success criteria let you loop independently.

### Rule 5 — Use the model only for judgment calls
Use the model for: classification, drafting, summarization, extraction.
Do NOT use it for: routing, retries, deterministic transforms.
If code can answer, code answers.

### Rule 6 — Token budgets are not advisory
Per-task: 4,000 tokens. Per-session: 30,000 tokens.
If approaching budget, summarize and start fresh.
Surface the breach. Do not silently overrun.

### Rule 7 — Surface conflicts, don't average them
If two patterns contradict, pick one (more recent / more tested).
Explain why. Flag the other for cleanup.
Don't blend conflicting patterns.

### Rule 8 — Read before you write
Before adding code, read exports, immediate callers, shared utilities.
"Looks orthogonal" is dangerous. If unsure why code is structured a way, ask.

### Rule 9 — Tests verify intent, not just behavior
Tests must encode WHY behavior matters, not just WHAT it does.
A test that can't fail when business logic changes is wrong.

### Rule 10 — Checkpoint after every significant step
Summarize what was done, what's verified, what's left.
Don't continue from a state you can't describe back.
If you lose track, stop and restate.

### Rule 11 — Match the codebase's conventions, even if you disagree
Conformance > taste inside the codebase.
If you genuinely think a convention is harmful, surface it. Don't fork silently.

### Rule 12 — Fail loud
"Completed" is wrong if anything was skipped silently.
"Tests pass" is wrong if any were skipped.
Default to surfacing uncertainty, not hiding it.

---

## Project Notes

- Project: ai-borne_website — Vite + TypeScript site with Cloudflare Workers (`functions/`, `wrangler.jsonc`), an `apps/` suite, and a `src/services` layer (e.g. `SecurityPolicyGenerator.ts`).
- Tests live under `tests/` and use Vitest (`vitest.config.ts`).
- Security-sensitive work (WAF rules, security headers, `SecurityPolicyGenerator`) must follow Package 1 Rule 5 (Cybersecurity) with extra care — verify generated policies/headers against current OWASP guidance before committing.
