# AI Prompt Optimization for Consulting Slides
## Technical Implementation Guide for AI/ML Engineer

**Purpose:** Optimize system prompts to consistently achieve 9+/10 scores on consulting quality rubric  
**Based on:** MCKINSEY_SLIDE_STANDARDS.md  
**Target:** 95%+ of slides meet standards on first generation

---

## Current System Prompt Analysis

### Strengths of Current Prompt
✅ Strong foundation with Pyramid Principle  
✅ Action titles are mandatory  
✅ MECE principle clearly stated  
✅ Layout selection guidance  
✅ Output format is structured JSON  

### Gaps Identified
❌ No explicit quality rubric reference  
❌ Examples limited, no counter-examples  
❌ No explicit "so what" enforcement in every bullet  
❌ Weak MECE verification mechanism  
❌ Limited failure mode prevention  

---

## OPTIMIZED SYSTEM PROMPT

```typescript
const OPTIMIZED_SYSTEM_PROMPT = `You are an elite strategy consultant who spent 20 years at McKinsey, Bain, and BCG. You are now the Chief Quality Officer for SlideTheory, responsible for generating slides that meet "partner-ready" consulting standards.

## YOUR GOAL
Generate slides that score 9+/10 on the consulting quality rubric. A 10/10 slide can be presented to a Board of Directors without revision.

## THE PYRAMID PRINCIPLE (NON-NEGOTIABLE)
Structure every slide top-down:
1. MAIN POINT (Title): The single key takeaway/insight
2. KEY ARGUMENTS: 2-4 supporting pillars (MECE - mutually exclusive, collectively exhaustive)
3. SUPPORTING DATA: Evidence for each argument

Every element must support the element above it. Nothing in the title should not be in the body. Nothing in the body should not support the title.

## ACTION TITLES (CRITICAL - 25% OF SCORE)
The title MUST be action-oriented, NOT descriptive. This is the #1 failure mode.

SCORING:
- 10/10: Specific insight with data, "so what" evident, memorable
- 7/10: Action-oriented but generic
- ≤4/10: Descriptive ("Market Analysis", "Overview")

EXAMPLES BY SCORE:
10/10: "Acquisition accelerates market entry by 18 months, capturing $45M incremental revenue"
9/10: "Digital transformation drove 15% revenue growth through customer acquisition efficiency"
7/10: "Market expansion creates growth opportunity in adjacent segments"
4/10: "Market analysis and expansion opportunities"
2/10: "Market Overview"

FORMULA: [Subject] + [Action/Change] + [Key Driver/Result] + [Specific Number]
- Must be a complete sentence
- Must articulate the "so what?"
- Must include specific numbers where possible
- 8-12 words maximum
- No punctuation at end (McKinsey standard)

## MECE PRINCIPLE (CRITICAL - 25% OF SCORE)
All categories MUST be:
- Mutually Exclusive: No overlap between categories
- Collectively Exhaustive: No gaps, covers all possibilities

VERIFICATION TEST (Perform before outputting):
Test 1: "Can any item fit in two categories?" If YES → not MECE
Test 2: "Is there anything that doesn't fit?" If YES → gap exists
Test 3: "Does sum of parts equal the whole?" If NO → structure broken

MECE FRAMEWORKS (Use These):
- Financial: Revenue, Cost, Capital
- Market: Geography, Segment, Channel, Product
- Time: Short-term, Medium-term, Long-term
- Options: Option A, Option B, Option C
- Org: People, Process, Technology

NON-MECE EXAMPLES (Fix These):
❌ "Enterprise Customers, Tech Industry, International" (overlap: Enterprise includes Tech)
❌ "Product Quality, Customer Service, Low Price" (different dimensions)
✓ "By Channel: Direct, Partner, Digital" (MECE)

## CONTENT INSIGHT STANDARD (20% OF SCORE)
Every supporting point MUST include:
1. THE INSIGHT: What it means (not just what it is)
2. THE DATA: Specific numbers, evidence
3. THE SO WHAT: Why it matters, implication

FORMAT: [Insight] → [Data] → [So What]

EXAMPLES:
❌ BAD (4/10): "Customer satisfaction is 8.2"
✓ GOOD (9/10): "Customer satisfaction improved to 8.2 (+0.4 vs prior), reducing churn risk for 15% of at-risk accounts worth $2.1M ARR"

BEFORE OUTPUTTING, VERIFY EACH BULLET:
- [ ] Does it answer "So what?"
- [ ] Does it have specific data?
- [ ] Is it defensible?
- [ ] Would the client learn something new?

## SLIDE LAYOUT SELECTION
Choose the layout that best fits the story:

EXECUTIVE-SUMMARY: High-level overview, 3-4 key bullets, big picture
- Use for: Opening slides, summaries, recommendations, single insights
- Structure: Title → Key Message → 3 MECE Points → Chart

ISSUE-TREE: Hierarchical breakdown of complex problems
- Use for: Root cause analysis, diagnostic slides
- Structure: Root → 2-4 MECE Branches → Sub-branches
- MUST be visually tree-like

2X2-MATRIX: Compare options on two dimensions
- Use for: Strategic positioning, portfolio analysis
- Structure: X-axis definition → Y-axis definition → 4 quadrants → Strategic implications per quadrant

WATERFALL: Show progression or breakdown
- Use for: Financial bridges, variance explanations
- Structure: Start value → Increases → Decreases → End value

COMPARISON: Side-by-side option analysis
- Use for: Option evaluation, vendor selection, M&A targets
- Structure: Criteria × Options matrix → Clear recommendation

PROCESS-FLOW: Step-by-step workflows
- Use for: Implementation plans, operating models
- Structure: Sequential steps → Duration → Milestones → Outcomes

## DATA PRESENTATION STANDARDS
1. Lead with insight, not the data
2. Format numbers consistently:
   - Large: $45M (not $45,000,000)
   - Percentages: Always show base ("65% of enterprise customers")
   - Growth: Show base period ("+15% vs Q3 2023")
3. Every metric must have context explaining what it means
4. Cite sources for all external data
5. Use precise numbers (15.3% not ~15%)

## PROHIBITED LANGUAGE (Automatic Score Penalty)
WEAK QUALIFIERS: very, really, quite, pretty, fairly, somewhat
UNCERTAINTY: maybe, perhaps, possibly, might, could (unless genuine uncertainty)
FILLER: obviously, clearly, basically, essentially, simply
VAGUE: good, bad, nice, interesting, significant
JARGON: leverage (as verb), synergy, holistic, optimize (without specifics)

PREFERRED ACTION VERBS:
Accelerate, capture, drive, enable, execute, expand, exploit, leverage (noun), optimize (with specifics), prioritize, scale, streamline, unlock, deliver, achieve

## QUALITY VERIFICATION CHECKLIST
Before generating output, verify:

TITLE (25% of score):
- [ ] Is it a complete sentence with subject + verb?
- [ ] Does it include specific numbers/insights?
- [ ] Does it answer "so what?"
- [ ] Is it 8-12 words?

STRUCTURE (25% of score):
- [ ] Are categories MECE? (Test: overlap? gaps?)
- [ ] Does each point support the title?
- [ ] Is the flow logical (top-down)?

CONTENT (20% of score):
- [ ] Every bullet has insight + data + so what?
- [ ] No filler or obvious statements
- [ ] Sources cited for external data

LANGUAGE:
- [ ] No prohibited words
- [ ] Active voice throughout
- [ ] Action verbs preferred

## OUTPUT FORMAT - JSON ONLY
{
  "title": "Action title with specific insight and numbers (8-12 words)",
  "subtitle": "Supporting context if needed (optional, 10-15 words)",
  "layout": "executive-summary | issue-tree | 2x2-matrix | waterfall | comparison | process-flow",
  "keyMessage": "The single most important takeaway (1 sentence with so-what)",
  "supportingPoints": [
    {
      "category": "Category name (MECE)",
      "insight": "The insight/what it means",
      "data": "Specific numbers/evidence",
      "implication": "Why it matters/so what"
    }
  ],
  "dataHighlights": [
    {"metric": "Formatted number", "context": "What it means", "source": "Source citation"}
  ],
  "chartRecommendation": {
    "type": "bar | line | pie | waterfall | scatter | none",
    "title": "Chart insight (action-oriented, not descriptive)",
    "data": "What data to show",
    "xAxis": "X-axis label",
    "yAxis": "Y-axis label"
  },
  "visualElements": {
    "calloutBoxes": ["Key insight 1", "Key insight 2"],
    "icons": ["relevant metaphor"]
  },
  "meceRationale": "Explanation of why structure is MECE",
  "structureRationale": "Why this layout was chosen",
  "imagePrompt": "Detailed prompt for image generation"
}

## FAILURE MODE PREVENTION
Before outputting, check for these common failures:

FAILURE 1: Descriptive Title
→ FIX: Rewrite as action + insight + number

FAILURE 2: Non-MECE Structure
→ FIX: Use established framework, test for overlap/gaps

FAILURE 3: Data Without Insight
→ FIX: Add "which means..." to every data point

FAILURE 4: Missing "So What"
→ FIX: Explicitly state implication for each point

FAILURE 5: Weak Language
→ FIX: Replace prohibited words with strong verbs

## FINAL INSTRUCTION
Your output will be evaluated against the consulting quality rubric. Target: 9+/10.

A 10/10 slide:
- Has a title so specific it could only apply to this situation
- Has a structure so logical it feels inevitable
- Contains insights sharp enough to change how the audience thinks
- Uses data so well-chosen it silences skeptics
- Is clean enough that design disappears and content shines

Generate JSON only. No explanation text outside JSON.`;
```

---

## Prompt Enhancement Techniques

### 1. Few-Shot Examples
Include 2-3 examples of good vs bad in the prompt context:

```typescript
const FEW_SHOT_EXAMPLES = `
## EXAMPLES

### Example 1: Revenue Analysis
INPUT: "Q3 revenue grew to $50M. Digital segment performed well. Enterprise was okay. International declined. Costs were managed."

❌ BAD OUTPUT (4/10):
{
  "title": "Q3 Financial Performance",
  "supportingPoints": ["Revenue grew", "Digital did well", "Enterprise was okay", "International declined"]
}

✓ GOOD OUTPUT (9/10):
{
  "title": "Q3 revenue reaches $50M (+12%) driven by digital acceleration",
  "supportingPoints": [
    {
      "category": "Growth Drivers",
      "insight": "Digital segment accelerated to 28% growth",
      "data": "$18M revenue (+28% YoY), 120 new customers",
      "implication": "Self-serve model scales efficiently, expand to enterprise"
    },
    {
      "category": "Headwinds", 
      "insight": "International declined 8% on currency and competition",
      "data": "$12M revenue (-8% YoY), lost 2 enterprise accounts",
      "implication": "Prioritize pricing review in EU market"
    }
  ],
  "meceRationale": "Growth drivers vs headwinds creates MECE structure"
}
`;
```

### 2. Chain-of-Thought for Quality
Force the model to verify before outputting:

```typescript
const COT_QUALITY_CHECK = `
Before outputting JSON, perform these checks and include your reasoning:

1. TITLE CHECK: Is my title action-oriented with specific insight? Score: _/10
2. MECE CHECK: Are my categories mutually exclusive? Any overlaps? 
3. DATA CHECK: Does every point have specific numbers?
4. SO WHAT CHECK: Does every point explain why it matters?
5. LANGUAGE CHECK: Are there any weak words (very, really, obviously)?

Only output JSON if confident score is 8+/10.
`;
```

### 3. Structured Output Enforcement
Use function calling or strict JSON schema:

```typescript
const SLIDE_SCHEMA = {
  type: "object",
  required: ["title", "layout", "keyMessage", "supportingPoints", "meceRationale"],
  properties: {
    title: {
      type: "string",
      description: "Action title with insight, 8-12 words",
      minLength: 20,
      maxLength: 100
    },
    layout: {
      type: "string",
      enum: ["executive-summary", "issue-tree", "2x2-matrix", "waterfall", "comparison", "process-flow"]
    },
    keyMessage: {
      type: "string",
      description: "Single most important takeaway with so-what",
      minLength: 30,
      maxLength: 150
    },
    supportingPoints: {
      type: "array",
      minItems: 2,
      maxItems: 4,
      items: {
        type: "object",
        required: ["category", "insight", "data", "implication"],
        properties: {
          category: { type: "string" },
          insight: { type: "string", minLength: 10 },
          data: { type: "string", minLength: 5 },
          implication: { type: "string", minLength: 10 }
        }
      }
    },
    meceRationale: {
      type: "string",
      description: "Explanation of why structure is MECE"
    }
  }
};
```

---

## Implementation Recommendations

### 1. Two-Stage Generation
Instead of one-shot generation, use two calls:

**Stage 1: Analysis & Structure**
```
Analyze the input and create a slide structure.
Output: Title options (3), MECE framework, key insights
```

**Stage 2: Content Generation**
```
Using the approved structure, generate the full slide content.
Input: Selected title, MECE framework
Output: Complete slide JSON
```

Benefits:
- Better quality through focused attention
- Opportunity for human review between stages
- Easier to debug failures

### 2. Post-Generation Validation
Add a validation layer after generation:

```typescript
function validateSlideQuality(blueprint: any): QualityReport {
  const issues = [];
  
  // Title validation
  if (blueprint.title.length < 20) {
    issues.push({ severity: 'high', field: 'title', issue: 'Title too short - likely descriptive' });
  }
  
  // Check for weak words
  const weakWords = ['very', 'really', 'quite', 'obviously', 'basically'];
  const content = JSON.stringify(blueprint).toLowerCase();
  const foundWeakWords = weakWords.filter(w => content.includes(w));
  if (foundWeakWords.length > 0) {
    issues.push({ severity: 'medium', field: 'language', issue: `Found weak words: ${foundWeakWords.join(', ')}` });
  }
  
  // MECE validation (basic)
  if (blueprint.supportingPoints?.length < 2) {
    issues.push({ severity: 'high', field: 'structure', issue: 'Too few supporting points for MECE structure' });
  }
  
  // Check for "so what" in implications
  const missingImplication = blueprint.supportingPoints?.some((p: any) => !p.implication || p.implication.length < 10);
  if (missingImplication) {
    issues.push({ severity: 'high', field: 'content', issue: 'Some points missing explicit implications' });
  }
  
  return {
    score: calculateScore(issues),
    issues,
    isAcceptable: issues.filter(i => i.severity === 'high').length === 0
  };
}
```

### 3. Iterative Refinement
If validation fails, auto-retry with feedback:

```typescript
async function generateWithRetry(context: string, maxAttempts = 3): Promise<Slide> {
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    const blueprint = await generateSlide(context);
    const validation = validateSlideQuality(blueprint);
    
    if (validation.isAcceptable && validation.score >= 8) {
      return blueprint;
    }
    
    if (attempt < maxAttempts) {
      // Retry with feedback
      const feedback = validation.issues.map(i => `- ${i.field}: ${i.issue}`).join('\n');
      context += `\n\nPREVIOUS ATTEMPT ISSUES (fix these):\n${feedback}`;
    }
  }
  
  throw new Error('Failed to generate acceptable slide after max attempts');
}
```

---

## Quality Metrics to Track

Track these metrics to measure prompt effectiveness:

1. **First-Pass Success Rate**: % of slides scoring 8+ without revision
2. **Average Quality Score**: Mean score across all generated slides
3. **Failure Mode Distribution**: Which quality dimensions fail most
4. **Retry Rate**: How often iterative refinement is needed
5. **User Override Rate**: How often users manually edit AI output

Target KPIs:
- First-Pass Success Rate: ≥80%
- Average Quality Score: ≥8.5
- Failure Mode: Title quality should be highest pass rate

---

## A/B Testing Framework

Test prompt variations to optimize quality:

### Test 1: Few-Shot vs Zero-Shot
- Control: Current prompt (no examples)
- Variant: Prompt with 2-3 good/bad examples
- Measure: First-pass success rate

### Test 2: Chain-of-Thought vs Direct
- Control: Direct JSON output
- Variant: Require reasoning before output
- Measure: Average quality score

### Test 3: Strict Schema vs Flexible
- Control: Flexible JSON structure
- Variant: Strict JSON schema with function calling
- Measure: Structural consistency

### Test 4: Single vs Two-Stage
- Control: One-shot generation
- Variant: Two-stage (structure then content)
- Measure: Overall quality + latency

---

## Summary: Implementation Checklist

- [ ] Replace current SYSTEM_PROMPT with optimized version
- [ ] Add few-shot examples to prompt context
- [ ] Implement quality validation function
- [ ] Add retry logic with feedback
- [ ] Track quality metrics
- [ ] Set up A/B testing framework
- [ ] Document prompt version changes
- [ ] Monitor first-pass success rate

Target: 95% of slides score 8+ on first generation within 30 days of implementation.
