# Agent Domain Specializations

## Available Agent Roles

### Market Research Agent
**Specialization:** Industry trends, market sizing, customer segments, growth opportunities
**Best for:** New market entry, TAM/SAM/SOM analysis, emerging trends
**Output format:** Market landscape report with data visualizations

### Competitive Intelligence Agent
**Specialization:** Competitor analysis, feature comparison, pricing strategies, positioning
**Best for:** Competitive landscaping, differentiation strategy, pricing optimization
**Output format:** Competitive matrix, SWOT analysis, positioning map

### Technical Architect Agent
**Specialization:** System design, technology selection, implementation planning, code architecture
**Best for:** Feature development, tech stack decisions, scalability planning
**Output format:** Technical specification, architecture diagrams, implementation roadmap

### Data Science Agent
**Specialization:** Data analysis, pattern recognition, statistical modeling, predictive analytics
**Best for:** Churn analysis, user behavior insights, forecasting, anomaly detection
**Output format:** Data report with charts, statistical findings, actionable insights

### Marketing Strategist Agent
**Specialization:** Go-to-market strategy, channel selection, messaging, campaign planning
**Best for:** Product launches, marketing plans, growth strategies
**Output format:** Marketing playbook, channel strategy, content calendar

### Financial Analyst Agent
**Specialization:** Financial modeling, unit economics, pricing analysis, revenue projections
**Best for:** Pricing strategy, financial forecasting, investment decisions
**Output format:** Financial model, sensitivity analysis, ROI projections

### Product Strategist Agent
**Specialization:** Product roadmap, feature prioritization, user needs, value proposition
**Best for:** Product decisions, roadmap planning, feature trade-offs
**Output format:** Product strategy doc, prioritized roadmap, user story map

### Content & Creative Agent
**Specialization:** Copywriting, visual design direction, brand voice, creative concepts
**Best for:** Brand messaging, content creation, creative campaigns
**Output format:** Copy drafts, creative briefs, content strategy

---

## Agent Selection Matrix

| Problem Type | Recommended Agents |
|--------------|-------------------|
| Market Entry | Market Research, Competitive Intelligence, Financial Analyst |
| Feature Development | Technical Architect, Product Strategist, Data Science |
| Go-to-Market | Marketing Strategist, Competitive Intelligence, Product Strategist |
| Competitive Analysis | Competitive Intelligence, Market Research, Product Strategist |
| Pricing Strategy | Financial Analyst, Competitive Intelligence, Market Research |
| User/Churn Analysis | Data Science, Product Strategist, Market Research |
| Marketing Campaign | Marketing Strategist, Content & Creative, Competitive Intelligence |
| Fundraising Prep | Financial Analyst, Market Research, Competitive Intelligence |

---

## Agent Instruction Template

When spawning an agent, use this structure:

```
ROLE: [Agent Name]
DOMAIN: [Specialization area]
TASK: [Specific assignment]
CONTEXT: [Problem background and user goal]
DELIVERABLE: [Expected output format and key components]
CONSTRAINTS: [Time limits, scope boundaries, must-haves/must-avoid]
COORDINATION NOTES: [How this fits with other agents]
```

---

## Synthesis Priorities

When combining agent outputs, prioritize:

1. **Data-backed insights** over opinions
2. **Actionable recommendations** over observations
3. **Quantified impacts** over qualitative assessments
4. **Contradictions** — flag where agents disagree and provide reconciliation
5. **Dependencies** — highlight what must happen first vs. what can be parallel
