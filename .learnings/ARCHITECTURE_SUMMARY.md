# Architecture Summary: Practical Implementation Patterns

## 1. CORE ARCHITECTURE PATTERNS

### 1.1 ReAct (Reasoning + Acting)
**Use When:** Complex problem-solving, tool selection, multi-step reasoning

**Pattern:** `Thought → Action → Observation → Thought → ... → Answer`

**Key Implementation Points:**
- Keep last 5-7 steps in context to prevent overflow
- Use structured JSON output for action decisions
- Implement iteration limits (max 10) with timeout
- Add self-correction prompts between steps

**Quick Pseudocode:**
```
for i in range(max_iterations):
    thought = generate_thought(history, query)
    action = decide_action(thought)  # Returns {tool, input} or "finish"
    if action.type == "finish": return action.answer
    observation = execute_tool(action.tool, action.input)
    history.append({thought, action, observation})
```

---

### 1.2 Plan-and-Solve
**Use When:** Well-defined tasks, predictable workflows, cost estimation needed

**Pattern:** `Query → Plan Generation → Validation → Step Execution → Synthesis`

**Key Implementation Points:**
- Generate structured plan with dependencies and effort estimates
- Validate plan before execution (check circular deps, tool availability)
- Implement checkpoint/restart capability
- Use dependency resolution for execution order
- Progress tracking per step

**Quick Pseudocode:**
```
plan = generate_plan(query)
if not validate_plan(plan): plan = regenerate_plan(query)
completed = set()
while len(completed) < len(plan):
    ready = [step for step in plan if all(d in completed for d in step.dependencies)]
    for step in ready:
        result = execute_step(step)
        if success: completed.add(step.id)
        else: attempt_recovery(step)
return synthesize_results(plan)
```

---

### 1.3 Reflexion (Self-Reflective)
**Use When:** Learning agents, iterative improvement, quality > speed

**Pattern:** `Attempt → Evaluate → Reflect → Improve → Retry`

**Key Implementation Points:**
- Max 3-5 iterations to control costs
- Store "learned patterns" persistently for future use
- Clear success criteria (e.g., score >= 0.8)
- Extract generalizable patterns from failures

**Quick Pseudocode:**
```
learned_patterns = load_patterns()
for attempt in range(max_iterations):
    if attempt == 0: output = generate(query, learned_patterns)
    else: output = generate_improved(query, previous_attempt, reflections)
    score, feedback = evaluate(output)
    if score >= 0.8: return output
    reflections = analyze_failure(output, feedback)
    improvements = suggest_fixes(reflections)
    learned_patterns.update(extract_patterns(reflections))
    save_patterns(learned_patterns)
```

---

### 1.4 Multi-Layer Architecture
**Structure:**
```
┌─────────────────────────────────────┐
│  STRATEGIC  - Goal, Strategy, Scope │
├─────────────────────────────────────┤
│  TACTICAL   - Task Decomposition    │
├─────────────────────────────────────┤
│  OPERATIONAL- Tool Execution        │
└─────────────────────────────────────┘
```

**Separation of Concerns:**
- **Strategic:** What & Why (goal interpretation, resource allocation)
- **Tactical:** How (workflow design, sub-agent coordination)
- **Operational:** Do (tool execution, error handling)

---

## 2. MEMORY SYSTEMS

### 2.1 Working Memory (Active Context)
- **Capacity:** ~128K tokens or 50 items
- **Eviction:** Compress low-importance items first, then remove oldest
- **Retrieval:** Recency + importance weighting

**Implementation:**
```python
class WorkingMemory:
    def add(content, importance=0.5):
        if over_capacity():
            compress_or_remove_low_importance()
        items.append({content, importance, timestamp})
    
    def get_context(query=None, max_items=20):
        if query: return relevance_ranked(query)[:max_items]
        return sorted_by(importance, timestamp)[:max_items]
```

### 2.2 Episodic Memory (Recent Experiences)
- **Scope:** Recent conversations, actions, outcomes
- **Key Features:** Emotion tagging, outcome tracking, related episode linking
- **Retrieval:** Time-based (last 24h), similarity-based, emotion-based

**Implementation:**
```python
class EpisodicMemory:
    def add_episode(type, content, outcome, emotions=None):
        episode = create_episode(type, content, outcome, emotions)
        index_keywords(episode)
        link_related(episode)  # Connect to similar past episodes
    
    def recall_recent(hours=24, type=None) -> List[Episode]
    def recall_similar(query, n=5) -> List[Episode]  # Keyword/index based
```

### 2.3 Semantic Memory (Long-term Knowledge)
- **Storage:** Vector database with embeddings
- **Features:** Importance scoring, access tracking, consolidation
- **Maintenance:** Forget low-importance, unaccessed items (>30 days)

**Implementation:**
```python
class SemanticMemory:
    def store(content, metadata, importance=0.5):
        embedding = embed(content)
        vector_db.add(id, embedding, content, metadata)
    
    def retrieve(query, n=5):
        query_embedding = embed(query)
        return vector_db.similarity_search(query_embedding, n)
    
    def consolidate():
        # Remove unimportant, stale memories
        to_forget = [m for m in memories if importance < 0.2 and last_access > 30d]
        vector_db.delete(to_forget)
```

### 2.4 Memory Integration
```python
class IntegratedMemory:
    def query(query):
        return {
            "working": working.get_context(query),
            "episodes_recent": episodic.recall_recent(24),
            "episodes_similar": episodic.recall_similar(query, 3),
            "knowledge": semantic.retrieve(query, 5)
        }
    
    def learn_from_experience(experience, outcome):
        episodic.add_episode("learning", experience, outcome)
        knowledge = extract_generalizable_knowledge(experience, outcome)
        semantic.store(knowledge, {"source": "experience"})
```

---

## 3. PLANNING & EXECUTION

### 3.1 Hierarchical Task Planning
- Decompose recursively until atomic (max depth 5)
- Track status: PENDING → READY → IN_PROGRESS → COMPLETED/FAILED
- Dependency resolution before execution
- Propagate completion to parent tasks

**Quick Pattern:**
```
function execute_hierarchical(task):
    if task.is_atomic():
        return execute(task)
    
    for subtask in task.subtasks:
        if all_dependencies_complete(subtask):
            result = execute_hierarchical(subtask)
            if result.failed: handle_failure(subtask)
    
    if all_subtasks_complete(task):
        task.status = COMPLETED
```

### 3.2 Goal Decomposition Strategies

**MECE (Mutually Exclusive, Collectively Exhaustive):**
- Use for clean breakdowns (by phase, by component)
- No overlap between components
- Together they cover everything

**Dependency-Based:**
- Identify sequential vs parallel tasks
- Calculate critical path
- Group parallelizable work

### 3.3 Execution Monitoring
Track per task:
- Progress %, estimated remaining time
- Cost incurred, errors encountered
- Alerts: timeout (>1h), cost overrun (>$10), stalled (>5min no progress)

---

## 4. ERROR RECOVERY APPROACHES

### 4.1 Recovery Strategies (in order of preference)
1. **RETRY** - Transient errors, with exponential backoff
2. **FALLBACK** - Alternative approach/tool
3. **SKIP** - If task is optional
4. **RECOMPOSE** - Split into smaller subtasks
5. **ESCALATE** - To human or higher-level agent

### 4.2 Error Recovery Flow
```python
def recover(task, error, context):
    log_error(task, error, context)
    analysis = analyze_error(error)  # type, root_cause, recoverable
    
    for strategy in analysis.suggested_strategies:
        if strategy == RETRY:
            return retry_with_backoff(task, max_attempts=3)
        elif strategy == FALLBACK:
            return use_alternative_approach(task, error)
        elif strategy == RECOMPOSE:
            return decompose_further_and_retry(task)
    
    raise UnrecoverableError(error)
```

### 4.3 Error Analysis Prompt Template
```
Analyze this error:
Error: {type}: {message}
Context: {context}

Provide as JSON:
{
    "error_type": "classification",
    "root_cause": "likely cause",
    "recoverable": true/false,
    "suggested_strategies": ["retry", "fallback", "recompose"],
    "confidence": 0.8
}
```

---

## 5. MULTI-AGENT ORCHESTRATION

### 5.1 When to Spawn Sub-Agents
| Scenario | Action |
|----------|--------|
| Task complexity > threshold | Create specialist |
| Different expertise needed | Domain-specific agents |
| Parallel execution possible | Spawn multiple |
| Need isolation | Separate agent (untrusted code) |
| Rate limit conflicts | Separate (API-heavy vs compute) |
| Cost optimization | Lightweight for simple tasks |

### 5.2 Communication Patterns

**Hub-and-Spoke (Central Bus):**
- Central message bus routes all communication
- Agents subscribe to message types
- Good for: Many-to-many coordination

**Direct (Peer-to-Peer):**
- Agents connect directly to peers
- Each agent has inbox/outbox
- Good for: Tight collaboration between 2-3 agents

### 5.3 Load Balancing
```python
class LoadBalancer:
    def submit_work(work_units):
        for unit in sorted_by_priority(work_units):
            agent = select_least_loaded(unit.agent_type)
            execute_async(agent, unit)
```

### 5.4 Result Aggregation Strategies

| Strategy | When to Use |
|----------|-------------|
| **Consensus** | Most results agree - find largest cluster |
| **Voting** | Discrete choices - weighted by confidence |
| **Weighted** | Numeric results - confidence-weighted average |
| **Synthesis** | Complex/qualitative - use LLM to merge |

**Consensus Aggregation:**
```python
def aggregate_consensus(results):
    clusters = cluster_similar_results(results)
    largest = max(clusters, key=len)
    return {
        "consensus": extract_common_answer(largest),
        "confidence": avg_confidence(largest),
        "agreement_ratio": len(largest) / len(results)
    }
```

---

## 6. QUICK REFERENCE: WHICH PATTERN TO USE

| Problem | Pattern |
|---------|---------|
| Dynamic tool selection needed | ReAct |
| Structured, predictable workflow | Plan-and-Solve |
| Quality/learning over speed | Reflexion |
| Complex multi-step task | Hierarchical Planning |
| Need to remember recent context | Episodic Memory |
| Long-term knowledge storage | Semantic Memory |
| Parallel work distribution | Load Balancer + Agent Pool |
| Service failure handling | Circuit Breaker + Retry |
| Cost control | Rate Limiting + Budget Tracking |

---

## 7. IMPLEMENTATION PRIORITIES

**Week 1:** Working Memory + ReAct pattern
**Week 2:** Error recovery + basic planning
**Week 3:** Episodic memory + monitoring
**Week 4:** Multi-agent orchestration + semantic memory
