# Skill Systems Summary
## For SlideTheory & Consulting Work

**Source:** Kimi Agent Guide to Powerful OpenClaw Agent - Skill Systems Guide  
**Focus:** Practical patterns for presentation software consulting and client work

---

## 1. Skill Architecture Patterns

### Core Registry Pattern
```python
# Central registry enables dynamic skill management
class SkillRegistry:
    def register(self, skill: Skill) -> bool
    def get(self, skill_id: str) -> Optional[Skill]
    def find_by_capability(self, capability: str) -> List[Skill]
    def search(self, query: str) -> List[Skill]
    def get_all_functions(self) -> List[Dict]  # OpenAI format
```

**Key Design Principles:**
- **Dynamic loading** - Add/remove skills without restart
- **Composability** - Chain skills for complex workflows
- **Self-documentation** - Skills describe themselves via JSON schema
- **Versioning** - Semantic versioning for compatibility
- **Capability indexing** - Fast lookup by capability tags

### Skill Schema (Minimal Viable)
```json
{
  "id": "content_creation",
  "name": "Content Creation",
  "version": "2.0.0",
  "description": "Create monetizable content",
  "capabilities": ["content", "creation", "marketing"],
  "functions": [...],
  "dependencies": [{"skill_id": "file_system", "version_range": ">=1.0.0"}]
}
```

---

## 2. Essential Money-Making Skills Catalog

### For SlideTheory (Presentation Software)

| Skill | Purpose | Key Functions |
|-------|---------|---------------|
| **content_creation** | Generate pitch decks, proposals | `optimize_seo()`, `generate_variations()` |
| **web_browsing** | Research competitors, gather intel | `navigate()`, `extract_text()`, `extract_table()` |
| **file_system** | Manage deliverables, templates | `read()`, `write()`, `search()` |
| **code_generation** | Build presentation tools, automation | `generate_function()`, `refactor()` |
| **project_scaffolding** | Start client projects fast | `scaffold()` for FastAPI/web apps |

### For Blake's Consulting Work

| Skill | Purpose | Key Functions |
|-------|---------|---------------|
| **market_research** | Analyze client industries | `analyze_competitors()`, `calculate_tam_sam_som()` |
| **ecommerce** | Pricing strategy, product work | `calculate_pricing()`, `generate_description()` |
| **content_creation** | Proposals, reports, SOWs | SEO optimization, A/B variations |
| **database** | Client data management | `query()`, `get_schema()` |
| **api_integrations** | Connect client systems | Stripe, GitHub, custom APIs |

---

## 3. Tool Integration Patterns

### Function Calling Best Practices
```python
class FunctionCaller:
    # Strategies for tool selection
    FIRST_MATCH = "first_match"     # Use first viable tool
    BEST_MATCH = "best_match"       # Score and select optimal
    ALL_MATCHING = "all_matching"   # Run all candidates
    SEQUENTIAL = "sequential"       # Ordered execution
    PARALLEL = "parallel"           # Concurrent execution
```

**Tool Call Structure:**
```python
@dataclass
class ToolCall:
    tool_name: str           # Format: "skill_id.function_name"
    parameters: Dict
    priority: int = 0
    dependencies: List[str]  # Other tool calls that must complete first
```

### API Integration Template
```python
class APIConfig:
    base_url: str
    headers: Dict
    timeout: int = 30
    retries: int = 3
    rate_limit: int = 60  # requests per minute
    auth_type: str = "bearer"  # none, bearer, api_key, oauth
    auth_config: Dict

class APIClient:
    async def request(self, method, endpoint, 
                      use_cache=True, cache_key=None)
    async def get(self, endpoint, **kwargs)
    async def post(self, endpoint, **kwargs)
```

**Pre-built Integrations:**
- `GitHubAPI` - Client repos, issue tracking
- `StripeAPI` - Payment processing for consulting

---

## 4. Tool Composition & Chaining

### Chain Types
```python
class ChainType(Enum):
    SEQUENTIAL = "sequential"   # Step-by-step, pass results forward
    PARALLEL = "parallel"       # Independent operations concurrently
    CONDITIONAL = "conditional" # Branch based on results
    LOOP = "loop"              # Iterate until condition met
    BRANCH = "branch"          # Multiple paths, merge results
```

### Building a Workflow Chain
```python
# Example: Research & summarize for client work
chain = (
    ToolChain(caller)
    .sequential()
    .add_step(ChainStep(
        name="search",
        tool_call=ToolCall("web_search.search", {"query": query})
    ))
    .add_step(ChainStep(
        name="extract",
        tool_call=ToolCall("web_scraper.extract", {}),
        transform=lambda x: {"urls": [r["url"] for r in x[:5]]}
    ))
    .add_step(ChainStep(
        name="summarize",
        tool_call=ToolCall("content.summarize", {})
    ))
)
result = await chain.execute()
```

### Pre-built Workflow Chains
```python
class WorkflowChains:
    def research_and_summarize(self, query: str) -> ToolChain
    # Research → Extract → Summarize
    
    def content_pipeline(self, topic: str) -> ToolChain  
    # Research → Draft → Optimize → Variations
```

---

## 5. Skill Refinement & A/B Testing

### Content Variation Generation
```python
# For testing pitch decks, proposals, marketing copy
@skill_function(name="generate_variations")
def generate_variations(content: str, count: int = 3) -> List[str]:
    """Generate A/B test variations of content"""
    # Variations include:
    # - Short version (50% length)
    # - Hook variation (bold opening)
    # - Urgency variation (CTA emphasis)
```

### SEO Optimization Loop
```python
@skill_function(name="optimize_seo")
def optimize_seo(content: str, keywords: List[str]) -> Dict:
    """Optimize content for SEO with metrics"""
    Returns: {
        "word_count": int,
        "keyword_density": {"keyword": {"count": int, "density": float}},
        "suggestions": ["Increase 'keyword X'", "Reduce 'keyword Y'"]
    }
```

### A/B Testing Workflow
```python
# 1. Generate base content
base_content = generate_proposal(client_brief)

# 2. Create variations for testing
variations = generate_variations(base_content, count=3)

# 3. Optimize each for specific keywords
for variant in variations:
    metrics = optimize_seo(variant, target_keywords)
    # Apply suggestions if density < 0.5% or > 3%

# 4. Track which variant converts better
# 5. Feed winner back into skill refinement
```

### Skill Improvement Cycle
```python
# Track execution history
execution_history = caller.get_history()

# Analyze patterns
successful_patterns = [
    call for call in execution_history
    if call["result"].success and call["result"].execution_time < threshold
]

# Refine skill parameters based on success patterns
# Update skill schema with new examples from successful runs
```

---

## Quick Reference: Most Used Patterns

### For SlideTheory
```python
# 1. Research competitor presentations
chain.research_and_summarize("pitch deck design trends 2025")

# 2. Generate proposal variations
variations = content_creation.generate_variations(proposal_text)

# 3. Scaffold new presentation tool project
scaffolder.scaffold("fastapi_app", "slide-automation", "API for slide generation")

# 4. Optimize client content for SEO
metrics = content_creation.optimize_seo(client_content, keywords)
```

### For Consulting Work
```python
# 1. Analyze client competitors
researcher.analyze_competitors(industry, competitor_list)

# 2. Calculate market opportunity
researcher.calculate_tam_sam_som(total_market_value)

# 3. Price consulting services
manager.calculate_pricing(
    cost=hourly_rate * hours,
    target_margin=0.5,
    competitor_prices=market_rates
)

# 4. Generate SOW document
chain.content_pipeline(project_description)
```

---

## Key Takeaways

1. **Registry pattern** enables modular, dynamic skill systems
2. **Tool chains** turn simple skills into powerful workflows
3. **A/B testing** content variations improves conversion
4. **Composition > Monolith** - Small focused skills that chain together
5. **Self-documenting** skills reduce maintenance burden
6. **Capability indexing** makes skill discovery fast

**Next Steps:**
- Implement core registry for SlideTheory skill suite
- Build `content_creation` + `market_research` chains for consulting
- Add execution history tracking for continuous refinement
