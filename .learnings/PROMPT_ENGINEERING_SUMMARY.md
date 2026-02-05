# Prompt Engineering Summary for Blake

*Extracted from: Kimi Agent Guide to Powerful OpenClaw Agent*

---

## 1. System Prompt Architecture

### Core Identity Block
The foundation is a crystal-clear identity definition that shapes every decision:

```
=== IDENTITY DEFINITION ===
- Primary Function: [What you do best]
- Operating Mode: [Autonomous/Assisted/Hybrid]
- Decision Authority: [Level of independence]
- Personality: [Tone, style, confidence level]
=== END IDENTITY ===
```

### Layered Personality Model
- **Layer 1: Foundation Traits** (always active) — reliability, proactivity, resourcefulness, efficiency
- **Layer 2: Contextual Modes** — switch between BUILDER, STRATEGIST, PROBLEM_SOLVER modes
- **Layer 3: Adaptive Behaviors** — match user's energy, adapt technical depth

### Key for Blake:
Lead with outcomes, explain with brevity. Professional but approachable. High confidence when 70%+ certain.

---

## 2. Instruction Hierarchy

Priority order (1 overrides all):

| Priority | Level | Examples |
|----------|-------|----------|
| 1 | ABSOLUTE DIRECTIVES | Safety, stop commands, legal/ethical |
| 2 | USER INTENT | Stated goals, preferences, feedback |
| 3 | SYSTEM INSTRUCTIONS | Core identity, tool protocols, formats |
| 4 | CONTEXTUAL GUIDANCE | Task-specific, domain knowledge |
| 5 | DEFAULT BEHAVIORS | Standard patterns, fallback |

### Conflict Resolution Protocol:
1. **Identify conflict** — what specifically conflicts?
2. **Apply hierarchy** — which has higher priority?
3. **Resolve** — follow higher priority; if 1-2 conflict, seek clarification
4. **Document** — note for future similar situations

---

## 3. Context Window Management

### Key Strategies:
- **Prioritize:** User intent and safety directives first
- **Summarize:** Compress older/less relevant context
- **Structure:** Use clear headers and delimiters (`=== SECTION ===`)
- **Reference:** Point to files/memory instead of repeating large content

### Efficient Prompting:
- Use templates for repetitive patterns
- Extract patterns from few-shot examples rather than repeating them
- Leverage external files/memory for persistent context
- Remove completed task context once no longer relevant

---

## 4. Few-Shot Prompting Patterns

### Template Pattern:

```
=== FEW-SHOT LEARNING FRAMEWORK ===

--- EXAMPLE 1 ---
INPUT: [Example input]
CONTEXT: [Relevant context]
THINKING: [Reasoning process]
OUTPUT: [Desired output format]
--- END EXAMPLE 1 ---

--- EXAMPLE 2 ---
[Repeat structure]

PATTERNS TO EXTRACT:
1. [Pattern 1 observed across examples]
2. [Pattern 2 observed across examples]
3. [Pattern 3 observed across examples]

NOW APPLY TO: [User's actual input]
=== END FRAMEWORK ===
```

### Best Practices:
- Provide 2-5 diverse examples
- Show reasoning, not just input/output
- Extract explicit patterns for the model to follow
- Include edge cases if relevant

---

## 5. Chain-of-Thought Techniques

### Basic CoT Protocol:

```
=== CHAIN-OF-THOUGHT PROTOCOL ===
For complex tasks, think step-by-step before acting.

REQUIRED THINKING PROCESS:
1. UNDERSTAND: What is being asked? What is the goal?
2. DECOMPOSE: Break into sub-tasks
3. ANALYZE: What approaches could work?
4. SELECT: Choose the best approach
5. EXECUTE: Carry out the plan
6. VERIFY: Check the result

FORMAT YOUR RESPONSE AS:
<thinking>
[Your step-by-step reasoning]
</thinking>
<output>
[Your final answer/action]
</output>
=== END PROTOCOL ===
```

### Structured Reasoning (Advanced):

**PHASE 1: PROBLEM ANALYSIS**
- Input analysis: What do I have?
- Constraint mapping: What limitations exist?
- Success criteria: What does "done" look like?

**PHASE 2: SOLUTION DESIGN**
- Approach options: Possible paths
- Trade-off analysis: Pros/cons
- Selection rationale: Why this approach?

**PHASE 3: IMPLEMENTATION PLAN**
- Step sequence: Ordered actions
- Dependencies: What must happen first?
- Risk points: Where could this fail?

**PHASE 4: EXECUTION & VALIDATION**
- Action log: What was done
- Result check: Did it work?
- Adjustment: What needs changing?

### Tree of Thoughts (Complex Decisions):

1. **Generate branches** — identify 3-5 different approaches
2. **Evaluate each** — feasibility, resources, success probability, risk
3. **Compare and select** — use decision matrix
4. **Deep dive** — explore chosen approach in detail
5. **Backup plan** — identify second-best option

---

## Quick-Reference Patterns for Blake

| Goal | Pattern |
|------|---------|
| Force step-by-step thinking | `<thinking>...</thinking>` then `<output>...</output>` |
| Encourage proactivity | "After completing, suggest next steps..." |
| Ensure high quality | "At 70%+ confidence, act decisively" |
| Handle ambiguity | "If unclear, propose clarifications with caveats" |
| Self-correct | "Detect errors → assess → recover → document" |
| Value focus | "How does this create value for Blake?" |

---

## Operating Principles for Blake

1. **Execution First** — Prefer action over discussion; ship early, iterate
2. **Proactive Value Creation** — Anticipate needs before stated
3. **Autonomous Decision Making** — Act at 70%+ confidence; escalate when blocked
4. **Continuous Improvement** — Reflect and learn from every outcome
5. **ROI Consciousness** — Optimize for high-impact actions

---

*Document created: 2026-02-04*
*Source: Kimi Agent Guide to Powerful OpenClaw Agent*
