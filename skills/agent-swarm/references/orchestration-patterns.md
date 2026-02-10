# Orchestration Patterns by Problem Type

## Pattern 1: Deep Research & Analysis

**Use when:** Investigating a market, competitor, or opportunity
**Agents:** 5-6 (Market Research, Competitive Intelligence, Data Science, Financial Analyst, Product Strategist)
**Flow:**
1. Market Research → Landscape and trends
2. Competitive Intelligence → Competitor deep-dive
3. Data Science → Available data analysis
4. Financial Analyst → Economics and modeling
5. Product Strategist → Implications and opportunities
6. Synthesis → Consolidated strategic assessment

**Key Coordination:**
- Market Research provides context for Competitive Intelligence
- Data Science findings inform Financial Analyst models
- All feed into Product Strategist for recommendations

---

## Pattern 2: Feature Development & Coding

**Use when:** Building a new feature or solving technical problems
**Agents:** 4-5 (Technical Architect, Data Science, Product Strategist, [Domain Specialist])
**Flow:**
1. Product Strategist → Requirements and user value
2. Data Science → Usage patterns and constraints
3. Technical Architect → Design and implementation plan
4. Domain Specialist → Specific expertise (security, UX, etc.)
5. Synthesis → Technical spec + implementation roadmap

**Key Coordination:**
- Product Strategist defines "what" and "why"
- Technical Architect defines "how" and "with what"
- Data Science identifies edge cases and constraints

---

## Pattern 3: Go-to-Market Strategy

**Use when:** Launching a product or entering a market
**Agents:** 6-7 (Market Research, Competitive Intelligence, Marketing Strategist, Product Strategist, Financial Analyst, Content & Creative)
**Flow:**
1. Market Research → Market opportunity sizing
2. Competitive Intelligence → Positioning and differentiation
3. Product Strategist → Value proposition and messaging
4. Marketing Strategist → Channel strategy and tactics
5. Financial Analyst → Budget and unit economics
6. Content & Creative → Campaign assets and copy
7. Synthesis → Complete GTM playbook

**Key Coordination:**
- Competitive positioning drives marketing messaging
- Financial constraints inform channel selection
- All elements must align on target customer definition

---

## Pattern 4: Competitive Response

**Use when:** Competitor makes a move requiring response
**Agents:** 4-5 (Competitive Intelligence, Product Strategist, Marketing Strategist, Technical Architect)
**Flow:**
1. Competitive Intelligence → Threat assessment
2. Product Strategist → Capability gap analysis
3. Technical Architect → Implementation feasibility
4. Marketing Strategist → Response messaging
5. Synthesis → Recommended response plan

**Key Coordination:**
- Speed matters — identify quick wins vs. long-term responses
- Technical feasibility must be validated before committing

---

## Pattern 5: Optimization & Analysis

**Use when:** Improving existing metrics (churn, conversion, engagement)
**Agents:** 4-5 (Data Science, Product Strategist, Technical Architect, Financial Analyst)
**Flow:**
1. Data Science → Root cause analysis
2. Product Strategist → Solution hypotheses
3. Technical Architect → Implementation approaches
4. Financial Analyst → Impact quantification
5. Synthesis → Prioritized optimization roadmap

**Key Coordination:**
- Data Science identifies the "what" (what's happening)
- Product Strategist proposes the "why" (underlying causes)
- Financial Analyst validates ROI of solutions

---

## Orchestration Rules

### DO:
- Give agents specific, bounded tasks
- Provide shared context upfront so agents work from same baseline
- Set clear deliverable expectations
- Include coordination notes so agents know how their work connects

### DON'T:
- Spawn agents without clear task boundaries (causes overlap)
- Skip the synthesis step (uncoordinated outputs are not actionable)
- Ask agents to wait for each other (parallelize where possible)
- Over-specify "how" — let agents determine best approach

### Timing:
- Most agent tasks: 2-5 minutes
- Complex analysis tasks: 5-10 minutes
- Always set timeouts slightly above expected completion

### Quality Gates:
Before synthesis, verify each agent output has:
- Clear findings/recommendations
- Supporting reasoning
- Specific data or examples
- Actionable next steps

If an agent output is incomplete, spawn a follow-up agent to fill gaps.
