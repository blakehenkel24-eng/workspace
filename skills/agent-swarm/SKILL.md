---
name: agent-swarm
description: Orchestrate multiple specialized AI agents to tackle complex problems through parallel execution and intelligent synthesis. Use when the user needs to (1) Research complex topics requiring multiple perspectives, (2) Solve coding/technical problems requiring architecture + implementation, (3) Develop go-to-market or marketing strategies, (4) Analyze competitive landscapes, (5) Optimize business metrics or processes, or (6) Any problem where multiple domain experts would provide better results than a single agent. Acts as Chief Strategy Officer selecting 5-8 domain-specialized agents, coordinating their work, and synthesizing outputs into actionable deliverables.
---

# Agent Swarm

An intelligent orchestration system that deploys domain-specialized agents in parallel to solve complex problems, then synthesizes their outputs into cohesive, actionable deliverables.

## When to Use This Skill

Activate Agent Swarm when problems require:
- **Multiple perspectives** (market + technical + financial analysis)
- **Parallel research** (competitors, trends, and data simultaneously)
- **Complex coordination** (strategy requiring alignment across domains)
- **High-stakes decisions** (where thoroughness matters more than speed)

**Examples:**
- "Research the competitive landscape for AI slide tools"
- "Help me build a user analytics dashboard feature"
- "Create a go-to-market strategy for SlideTheory"
- "Analyze our churn data and recommend retention strategies"
- "Develop a social media marketing plan for product launch"

## How It Works

### Phase 1: Problem Decomposition
1. Analyze the user's request
2. Identify the problem type (research, coding, GTM, competitive response, optimization)
3. Select relevant agent domains from `references/agent-roles.md`
4. Choose orchestration pattern from `references/orchestration-patterns.md`

### Phase 2: Agent Deployment
1. Spawn 5-8 specialized agents in parallel using `sessions_spawn`
2. Give each agent specific, bounded tasks with shared context
3. Set appropriate timeouts (2-10 minutes depending on complexity)

### Phase 3: Synthesis
1. Collect all agent outputs
2. Identify agreements, conflicts, and gaps
3. Apply synthesis framework from `references/synthesis-frameworks.md`
4. Produce unified deliverable (report, spec, playbook, or plan)

## Agent Domains

**Read `references/agent-roles.md` for complete definitions:**

| Agent | Domain | Best For |
|-------|--------|----------|
| Market Research | Industry trends, market sizing | New market entry, TAM analysis |
| Competitive Intelligence | Competitor analysis, positioning | Competitive landscaping |
| Technical Architect | System design, implementation | Feature development, tech decisions |
| Data Science | Analysis, patterns, forecasting | Churn analysis, user insights |
| Marketing Strategist | GTM, channels, campaigns | Marketing plans, growth strategy |
| Financial Analyst | Modeling, pricing, projections | Financial strategy, unit economics |
| Product Strategist | Roadmap, prioritization | Product decisions, feature trade-offs |
| Content & Creative | Copy, brand, creative | Messaging, content strategy |

## Orchestration Patterns

**Read `references/orchestration-patterns.md` for detailed workflows:**

1. **Deep Research** → 5-6 agents on market/competitive analysis
2. **Feature Development** → 4-5 agents on technical implementation
3. **Go-to-Market** → 6-7 agents on launch strategy
4. **Competitive Response** → 4-5 agents on threat assessment
5. **Optimization** → 4-5 agents on metric improvement

## Quick Start

### Step 1: Understand the Problem
```
Problem: [User's request]
Type: [Research / Coding / GTM / Competitive / Optimization]
Goal: [What success looks like]
Constraints: [Time, budget, scope limitations]
```

### Step 2: Select Agents
Choose 5-8 agents from `references/agent-roles.md` based on problem type.

### Step 3: Spawn Agents (Parallel)
Use `sessions_spawn` for each agent with this instruction structure:

```
ROLE: [Agent Name]
DOMAIN: [Specialization]
TASK: [Specific assignment for this agent]
CONTEXT: [Shared problem background]
USER GOAL: [What we're trying to achieve]
DELIVERABLE: [Expected output format]
CONSTRAINTS: [Scope boundaries]
COORDINATION: [How this connects to other agents]
```

**Example spawn call:**
```javascript
sessions_spawn({
  agentId: "sonnet",
  task: `ROLE: Competitive Intelligence Agent
DOMAIN: Competitor analysis and positioning
TASK: Analyze the top 5 AI presentation tools competing with SlideTheory. For each: pricing, key features, target audience, positioning, and weaknesses.
CONTEXT: SlideTheory is an AI-powered slide generator for strategy consultants. Target: $1K MRR.
USER GOAL: Understand competitive landscape to differentiate effectively.
DELIVERABLE: Competitive matrix + positioning recommendations.
CONSTRAINTS: Focus on direct competitors only (AI + presentations + professional use).`,
  timeoutSeconds: 180
})
```

### Step 4: Collect Results
Wait for all agents to complete. Gather outputs.

### Step 5: Synthesize
Apply framework from `references/synthesis-frameworks.md`:

1. **Executive Summary** — Key findings + recommendations
2. **Detailed Findings** — Organized by domain
3. **Action Plan** — Prioritized by impact/effort
4. **Appendix** — Full agent outputs

### Step 6: Deliver
Present unified report with clear next steps.

## Best Practices

### DO:
- Give agents **specific, bounded tasks** (not "research everything")
- Provide **shared context** so agents work from same baseline
- **Parallelize** — spawn all agents at once, don't wait
- Include **coordination notes** so agents understand the bigger picture
- **Resolve conflicts** explicitly when agents disagree
- Add **confidence scores** to synthesized findings

### DON'T:
- Spawn agents without clear deliverable expectations
- Skip the synthesis step (raw agent outputs ≠ actionable plan)
- Overlap agent responsibilities (causes redundancy)
- Ask agents to wait for each other (defeats parallelization)

## Synthesis Quality Checklist

Before delivering:
- [ ] All 5-8 agent inputs incorporated
- [ ] Contradictions identified and resolved
- [ ] Findings backed by data/examples
- [ ] Recommendations are specific and actionable
- [ ] Timeline is realistic with dependencies noted
- [ ] Resource requirements estimated
- [ ] Risks identified with mitigations
- [ ] Success metrics defined
- [ ] User can act immediately on recommendations

## Troubleshooting

**Agent returns incomplete output:**
→ Spawn follow-up agent to fill specific gaps

**Agents contradict each other:**
→ Evaluate evidence, weight by confidence, present both views or reconcile

**Output too long:**
→ Prioritize top 3-5 findings, move details to appendix

**User needs specific format:**
→ Reference `references/synthesis-frameworks.md` for templates

## Example Output Structure

```
# [Problem] — Agent Swarm Analysis

## Executive Summary
[2-3 paragraphs + 5 key takeaways]

## Detailed Findings
### Market Landscape
[Market Research Agent findings]

### Competitive Position
[Competitive Intelligence + Product Strategist synthesis]

### Technical Considerations
[Technical Architect findings]

### Financial Implications
[Financial Analyst findings]

## Recommended Actions
### Immediate (0-30 days)
1. [Action] — Owner: [X] — Impact: [High/Med/Low]

### Short-term (1-3 months)
...

## Risk Assessment
[Risks + mitigations]

## Appendix: Full Agent Outputs
[Complete outputs from each agent]
```
