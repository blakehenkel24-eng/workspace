# Architecture & Framework Design Guide
## Building the Most Powerful Autonomous Agent: OpenClaw/ClawdBot

---

## Table of Contents

1. [Core Architecture Patterns](#1-core-architecture-patterns)
2. [Memory Systems](#2-memory-systems)
3. [Planning & Execution](#3-planning--execution)
4. [Multi-Agent Orchestration](#4-multi-agent-orchestration)
5. [Scalability Considerations](#5-scalability-considerations)

---

## 1. CORE ARCHITECTURE PATTERNS

### 1.1 Cognitive Architecture Patterns Overview

The cognitive architecture defines how your agent thinks, reasons, and acts. Here are the most powerful patterns for building autonomous agents:

#### 1.1.1 ReAct (Reasoning + Acting)

**Concept**: Interleave reasoning traces with actions, allowing the agent to think through problems step-by-step while taking actions.

**Best For**: Complex problem-solving, tool use, multi-step reasoning tasks

**Pattern Flow**:
```
Thought → Action → Observation → Thought → Action → ... → Answer
```

**Implementation Example**:
```python
from typing import List, Dict, Any, Optional
from dataclasses import dataclass
from enum import Enum

class StepType(Enum):
    THOUGHT = "thought"
    ACTION = "action"
    OBSERVATION = "observation"

@dataclass
class ReActStep:
    step_type: StepType
    content: str
    tool_name: Optional[str] = None
    tool_input: Optional[Dict] = None
    tool_output: Optional[Any] = None

class ReActAgent:
    def __init__(self, llm, tools: Dict[str, callable], max_iterations: int = 10):
        self.llm = llm
        self.tools = tools
        self.max_iterations = max_iterations
        self.history: List[ReActStep] = []
    
    def run(self, query: str) -> str:
        """Execute ReAct loop until completion or max iterations."""
        
        for iteration in range(self.max_iterations):
            # Generate thought
            thought = self._generate_thought(query)
            self.history.append(ReActStep(StepType.THOUGHT, thought))
            
            # Decide action
            action = self._decide_action(thought)
            
            if action["type"] == "finish":
                return action["answer"]
            
            # Execute action
            self.history.append(ReActStep(
                StepType.ACTION,
                f"Using {action['tool']} with {action['input']}",
                tool_name=action["tool"],
                tool_input=action["input"]
            ))
            
            # Get observation
            observation = self._execute_tool(action["tool"], action["input"])
            self.history.append(ReActStep(
                StepType.OBSERVATION,
                str(observation),
                tool_output=observation
            ))
        
        return self._generate_final_answer()
    
    def _generate_thought(self, query: str) -> str:
        """Generate reasoning based on history and query."""
        context = self._format_history()
        prompt = f"""Given the following context and query, what should I think about next?

Query: {query}

History:
{context}

Think step by step about what to do next."""
        return self.llm.generate(prompt)
    
    def _decide_action(self, thought: str) -> Dict:
        """Decide next action based on thought."""
        prompt = f"""Based on this thought: {thought}

Decide the next action. Format as JSON:
{{
    "type": "tool|finish",
    "tool": "tool_name (if type=tool)",
    "input": {{"param": "value"}} (if type=tool),
    "answer": "final answer (if type=finish)"
}}"""
        return self.llm.generate_json(prompt)
    
    def _execute_tool(self, tool_name: str, tool_input: Dict) -> Any:
        """Execute tool and return observation."""
        if tool_name not in self.tools:
            return f"Error: Tool '{tool_name}' not found"
        return self.tools[tool_name](**tool_input)
    
    def _format_history(self) -> str:
        """Format history for context."""
        return "\n".join([
            f"{step.step_type.value}: {step.content}"
            for step in self.history[-5:]  # Keep last 5 steps
        ])
```

**When to Use**:
- Multi-step reasoning problems
- When tool selection is dynamic
- Complex decision trees
- Research and analysis tasks

**Pro Tips**:
- Limit history to prevent context overflow
- Add self-correction prompts
- Use structured output for action decisions
- Implement timeout mechanisms

---

#### 1.1.2 Plan-and-Solve

**Concept**: First create a comprehensive plan, then execute it step by step with monitoring.

**Best For**: Well-defined tasks, complex workflows, predictable execution paths

**Pattern Flow**:
```
Query → Plan Generation → Step Execution (with monitoring) → Result
```

**Implementation Example**:
```python
from typing import List, Dict, Any
from dataclasses import dataclass, field
from enum import Enum
import json

class PlanStatus(Enum):
    PENDING = "pending"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    FAILED = "failed"

@dataclass
class PlanStep:
    id: str
    description: str
    dependencies: List[str] = field(default_factory=list)
    status: PlanStatus = PlanStatus.PENDING
    result: Any = None
    error: str = None
    estimated_cost: float = 0.0

class PlanAndSolveAgent:
    def __init__(self, llm, tools: Dict[str, callable], validator=None):
        self.llm = llm
        self.tools = tools
        self.validator = validator or self._default_validator
        self.current_plan: List[PlanStep] = []
    
    def run(self, query: str) -> Dict[str, Any]:
        """Execute plan-and-solve workflow."""
        
        # Phase 1: Plan Generation
        self.current_plan = self._generate_plan(query)
        
        # Phase 2: Plan Validation
        if not self._validate_plan():
            self.current_plan = self._regenerate_plan(query)
        
        # Phase 3: Execution
        results = self._execute_plan()
        
        # Phase 4: Result Synthesis
        return self._synthesize_results(query, results)
    
    def _generate_plan(self, query: str) -> List[PlanStep]:
        """Generate structured plan from query."""
        prompt = f"""Create a detailed execution plan for this task:

Task: {query}

Available tools: {list(self.tools.keys())}

Generate a plan as JSON array:
[
    {{
        "id": "step_1",
        "description": "Clear action description",
        "dependencies": [],
        "estimated_cost": 0.1
    }},
    {{
        "id": "step_2", 
        "description": "Next action",
        "dependencies": ["step_1"],
        "estimated_cost": 0.05
    }}
]

Rules:
- Each step should be atomic and verifiable
- Include dependencies to create execution order
- Estimate costs for resource planning"""
        
        plan_json = self.llm.generate_json(prompt)
        return [PlanStep(**step) for step in plan_json]
    
    def _execute_plan(self) -> Dict[str, Any]:
        """Execute plan with dependency resolution."""
        results = {}
        completed_steps = set()
        
        while len(completed_steps) < len(self.current_plan):
            # Find executable steps (all dependencies satisfied)
            executable = [
                step for step in self.current_plan
                if step.status == PlanStatus.PENDING
                and all(dep in completed_steps for dep in step.dependencies)
            ]
            
            if not executable:
                # Deadlock detected
                raise Exception("Plan execution deadlock - circular dependencies?")
            
            for step in executable:
                step.status = PlanStatus.IN_PROGRESS
                
                try:
                    # Execute step
                    result = self._execute_step(step, results)
                    step.result = result
                    step.status = PlanStatus.COMPLETED
                    results[step.id] = result
                    completed_steps.add(step.id)
                    
                except Exception as e:
                    step.status = PlanStatus.FAILED
                    step.error = str(e)
                    
                    # Attempt recovery
                    if not self._handle_step_failure(step, e):
                        raise
        
        return results
    
    def _execute_step(self, step: PlanStep, context: Dict) -> Any:
        """Execute a single plan step."""
        prompt = f"""Execute this step:

Step: {step.description}

Context from previous steps:
{json.dumps(context, indent=2)}

Available tools: {list(self.tools.keys())}

What tool should I use and with what parameters?"""
        
        action = self.llm.generate_json(prompt)
        tool_name = action.get("tool")
        tool_input = action.get("input", {})
        
        if tool_name not in self.tools:
            raise ValueError(f"Unknown tool: {tool_name}")
        
        return self.tools[tool_name](**tool_input)
    
    def _handle_step_failure(self, step: PlanStep, error: Exception) -> bool:
        """Attempt to recover from step failure."""
        # Try alternative approaches
        recovery_prompt = f"""Step failed: {step.description}
Error: {error}

Can this step be accomplished differently? Suggest alternative approach."""
        
        alternative = self.llm.generate(recovery_prompt)
        
        if alternative and "cannot" not in alternative.lower():
            step.description = alternative
            step.status = PlanStatus.PENDING
            return True
        
        return False
    
    def _validate_plan(self) -> bool:
        """Validate plan feasibility."""
        # Check for circular dependencies
        # Check tool availability
        # Estimate total cost
        return True
    
    def _regenerate_plan(self, query: str) -> List[PlanStep]:
        """Regenerate plan if validation fails."""
        return self._generate_plan(query + "\n\n(Previous plan was invalid, please create a better one)")
    
    def _synthesize_results(self, query: str, results: Dict) -> Dict[str, Any]:
        """Synthesize final answer from step results."""
        prompt = f"""Synthesize final answer for: {query}

Step results:
{json.dumps(results, indent=2)}

Provide a comprehensive answer."""
        
        return {
            "answer": self.llm.generate(prompt),
            "plan": self.current_plan,
            "results": results
        }
    
    def _default_validator(self, plan: List[PlanStep]) -> bool:
        """Default plan validation."""
        return True
```

**When to Use**:
- Complex multi-step tasks
- When cost estimation is important
- Predictable workflows
- Tasks requiring rollback capability

**Pro Tips**:
- Always validate plans before execution
- Implement checkpoint/restart capability
- Use dependency graphs for visualization
- Add progress tracking

---

#### 1.1.3 Reflexion (Self-Reflective Agents)

**Concept**: Agent reflects on its own performance and improves over time through self-evaluation.

**Best For**: Learning agents, iterative improvement, complex creative tasks

**Pattern Flow**:
```
Attempt → Evaluate → Reflect → Improve → Retry
```

**Implementation Example**:
```python
from typing import List, Dict, Any, Optional
from dataclasses import dataclass, field
from datetime import datetime
import json

@dataclass
class Attempt:
    id: str
    input_query: str
    output: Any
    success: bool
    feedback: str
    timestamp: datetime
    reflections: List[str] = field(default_factory=list)
    improvements: List[str] = field(default_factory=list)

class ReflexionAgent:
    def __init__(self, llm, max_reflexion_iterations: int = 3):
        self.llm = llm
        self.max_iterations = max_reflexion_iterations
        self.attempt_history: List[Attempt] = []
        self.learned_patterns: Dict[str, Any] = {}
    
    def run(self, query: str, evaluator: callable) -> Dict[str, Any]:
        """Execute with reflexion loop."""
        
        best_attempt = None
        best_score = 0
        
        for iteration in range(self.max_iterations):
            # Generate attempt
            if iteration == 0:
                output = self._initial_attempt(query)
            else:
                output = self._improved_attempt(query, self.attempt_history[-1])
            
            # Evaluate
            score, feedback = evaluator(query, output)
            
            # Create attempt record
            attempt = Attempt(
                id=f"attempt_{iteration}",
                input_query=query,
                output=output,
                success=score >= 0.8,
                feedback=feedback,
                timestamp=datetime.now()
            )
            
            # Reflexion
            if not attempt.success:
                reflections = self._generate_reflections(attempt)
                attempt.reflections = reflections
                
                improvements = self._generate_improvements(attempt, reflections)
                attempt.improvements = improvements
                
                # Update learned patterns
                self._update_patterns(attempt)
            
            self.attempt_history.append(attempt)
            
            # Track best attempt
            if score > best_score:
                best_score = score
                best_attempt = attempt
            
            # Exit if successful
            if attempt.success:
                break
        
        return {
            "best_output": best_attempt.output if best_attempt else None,
            "best_score": best_score,
            "attempts": len(self.attempt_history),
            "learned_patterns": self.learned_patterns
        }
    
    def _initial_attempt(self, query: str) -> Any:
        """Generate initial attempt."""
        prompt = f"""Complete this task to the best of your ability:

Task: {query}

Apply any learned patterns you have."""
        return self.llm.generate(prompt)
    
    def _improved_attempt(self, query: str, previous: Attempt) -> Any:
        """Generate improved attempt based on previous failure."""
        prompt = f"""Previous attempt failed. Let's improve.

Task: {query}

Previous output: {previous.output}

Feedback: {previous.feedback}

Reflections on what went wrong:
{chr(10).join(f"- {r}" for r in previous.reflections)}

Improvements to apply:
{chr(10).join(f"- {i}" for i in previous.improvements)}

Learned patterns:
{json.dumps(self.learned_patterns, indent=2)}

Now generate a much better response."""
        return self.llm.generate(prompt)
    
    def _generate_reflections(self, attempt: Attempt) -> List[str]:
        """Generate reflections on failed attempt."""
        prompt = f"""Analyze this failed attempt:

Task: {attempt.input_query}
Output: {attempt.output}
Feedback: {attempt.feedback}

What went wrong? Provide 3-5 specific reflections:
1. 
2. 
3. """
        
        response = self.llm.generate(prompt)
        return [r.strip() for r in response.split('\n') if r.strip() and r[0].isdigit()]
    
    def _generate_improvements(self, attempt: Attempt, reflections: List[str]) -> List[str]:
        """Generate specific improvements based on reflections."""
        prompt = f"""Based on these reflections:
{chr(10).join(reflections)}

What specific improvements should be made for the next attempt?
Provide 3-5 actionable improvements:
1. 
2. 
3. """
        
        response = self.llm.generate(prompt)
        return [i.strip() for i in response.split('\n') if i.strip() and i[0].isdigit()]
    
    def _update_patterns(self, attempt: Attempt):
        """Update learned patterns from attempt."""
        prompt = f"""Extract generalizable patterns from this learning experience:

Task type: {attempt.input_query[:50]}...
Reflections: {attempt.reflections}
Improvements: {attempt.improvements}

What patterns should be remembered for future similar tasks?
Format as JSON key-value pairs."""
        
        patterns = self.llm.generate_json(prompt)
        self.learned_patterns.update(patterns)
```

**When to Use**:
- Creative tasks (writing, design)
- Code generation
- When quality matters more than speed
- Learning scenarios

**Pro Tips**:
- Store learned patterns persistently
- Use similarity matching for pattern retrieval
- Limit max iterations to control costs
- Implement success criteria clearly

---

### 1.2 Multi-Layer Agent Design

For truly powerful autonomous agents, implement a three-layer architecture:

```
┌─────────────────────────────────────────────────────────────┐
│                    STRATEGIC LAYER                           │
│         (Goal Setting, High-Level Planning)                  │
├─────────────────────────────────────────────────────────────┤
│                    TACTICAL LAYER                            │
│       (Task Decomposition, Resource Allocation)              │
├─────────────────────────────────────────────────────────────┤
│                   OPERATIONAL LAYER                          │
│              (Tool Execution, Data Processing)               │
└─────────────────────────────────────────────────────────────┘
```

#### 1.2.1 Strategic Layer

**Purpose**: Define what should be done and why

**Responsibilities**:
- Goal interpretation and clarification
- High-level strategy selection
- Resource allocation decisions
- Success criteria definition

**Implementation**:
```python
class StrategicLayer:
    def __init__(self, llm):
        self.llm = llm
        self.active_goals: List[Goal] = []
    
    def process_request(self, user_input: str) -> StrategicPlan:
        """Convert user request into strategic plan."""
        
        # Clarify intent
        clarified = self._clarify_intent(user_input)
        
        # Define goal
        goal = self._define_goal(clarified)
        
        # Select strategy
        strategy = self._select_strategy(goal)
        
        # Allocate resources
        resources = self._allocate_resources(goal, strategy)
        
        # Define success criteria
        success_criteria = self._define_success_criteria(goal)
        
        return StrategicPlan(
            goal=goal,
            strategy=strategy,
            resources=resources,
            success_criteria=success_criteria
        )
    
    def _clarify_intent(self, user_input: str) -> str:
        """Clarify ambiguous user requests."""
        prompt = f"""Clarify this user request:
"{user_input}"

What is the user really trying to accomplish?
What are the implicit requirements?
What constraints should we consider?"""
        return self.llm.generate(prompt)
    
    def _define_goal(self, clarified_intent: str) -> Goal:
        """Define structured goal from clarified intent."""
        prompt = f"""Define a SMART goal from this intent:
{clarified_intent}

Format as JSON:
{{
    "description": "clear goal statement",
    "measurable_outcomes": ["outcome1", "outcome2"],
    "constraints": ["constraint1"],
    "priority": "high|medium|low",
    "deadline": "timeframe or null"
}}"""
        return Goal(**self.llm.generate_json(prompt))
    
    def _select_strategy(self, goal: Goal) -> Strategy:
        """Select best strategy for achieving goal."""
        # Strategy selection logic
        pass
    
    def _allocate_resources(self, goal: Goal, strategy: Strategy) -> Resources:
        """Allocate budget, time, and compute resources."""
        pass
    
    def _define_success_criteria(self, goal: Goal) -> List[SuccessCriterion]:
        """Define measurable success criteria."""
        pass
```

---

#### 1.2.2 Tactical Layer

**Purpose**: Determine how to execute the strategy

**Responsibilities**:
- Task decomposition
- Workflow design
- Sub-agent coordination
- Progress monitoring

**Implementation**:
```python
class TacticalLayer:
    def __init__(self, strategic_plan: StrategicPlan, llm):
        self.plan = strategic_plan
        self.llm = llm
        self.workflows: List[Workflow] = []
    
    def create_execution_plan(self) -> ExecutionPlan:
        """Create detailed execution plan from strategy."""
        
        # Decompose into tasks
        tasks = self._decompose_goal()
        
        # Design workflows
        workflows = self._design_workflows(tasks)
        
        # Assign sub-agents
        assignments = self._assign_agents(workflows)
        
        # Create monitoring plan
        monitoring = self._create_monitoring_plan()
        
        return ExecutionPlan(
            tasks=tasks,
            workflows=workflows,
            assignments=assignments,
            monitoring=monitoring
        )
    
    def _decompose_goal(self) -> List[Task]:
        """Decompose goal into atomic tasks."""
        prompt = f"""Decompose this goal into tasks:

Goal: {self.plan.goal.description}
Strategy: {self.plan.strategy.name}

Break down into atomic, actionable tasks.
Format as JSON array with dependencies."""
        return [Task(**t) for t in self.llm.generate_json(prompt)]
    
    def _design_workflows(self, tasks: List[Task]) -> List[Workflow]:
        """Design execution workflows for tasks."""
        # Group tasks into workflows
        # Define execution order
        # Identify parallelization opportunities
        pass
    
    def _assign_agents(self, workflows: List[Workflow]) -> Dict[str, Agent]:
        """Assign specialized agents to workflows."""
        pass
    
    def _create_monitoring_plan(self) -> MonitoringPlan:
        """Create plan for monitoring execution."""
        pass
```

---

#### 1.2.3 Operational Layer

**Purpose**: Execute tasks using available tools

**Responsibilities**:
- Tool execution
- Data transformation
- Error handling
- Result formatting

**Implementation**:
```python
class OperationalLayer:
    def __init__(self, tools: Dict[str, Tool], llm):
        self.tools = tools
        self.llm = llm
        self.execution_log: List[ExecutionRecord] = []
    
    def execute_task(self, task: Task, context: Dict) -> ExecutionResult:
        """Execute a single task."""
        
        start_time = time.time()
        
        try:
            # Select appropriate tool
            tool = self._select_tool(task)
            
            # Prepare inputs
            inputs = self._prepare_inputs(task, context)
            
            # Execute
            raw_result = tool.execute(**inputs)
            
            # Transform output
            result = self._transform_output(raw_result, task.expected_format)
            
            # Log execution
            self._log_execution(task, tool, inputs, result, time.time() - start_time)
            
            return ExecutionResult(
                success=True,
                data=result,
                execution_time=time.time() - start_time
            )
            
        except Exception as e:
            return self._handle_execution_error(task, e, context)
    
    def _select_tool(self, task: Task) -> Tool:
        """Select best tool for task."""
        prompt = f"""Select the best tool for this task:

Task: {task.description}
Required capabilities: {task.required_capabilities}

Available tools: {[t.name for t in self.tools.values()]}

Which tool is most appropriate?"""
        
        tool_name = self.llm.generate(prompt).strip()
        return self.tools.get(tool_name, self.tools.get("default"))
    
    def _prepare_inputs(self, task: Task, context: Dict) -> Dict:
        """Prepare tool inputs from task and context."""
        pass
    
    def _transform_output(self, raw_result: Any, expected_format: str) -> Any:
        """Transform raw output to expected format."""
        pass
    
    def _handle_execution_error(self, task: Task, error: Exception, context: Dict) -> ExecutionResult:
        """Handle execution errors with recovery attempts."""
        
        # Log error
        self._log_error(task, error)
        
        # Attempt recovery
        recovery_result = self._attempt_recovery(task, error, context)
        
        if recovery_result:
            return recovery_result
        
        # Return failure
        return ExecutionResult(
            success=False,
            error=str(error),
            recoverable=False
        )
```

---

### 1.3 Decision-Making Frameworks

#### 1.3.1 Utility-Based Decision Making

```python
from typing import List, Dict, Any
from dataclasses import dataclass

@dataclass
class Action:
    name: str
    expected_outcome: Any
    probability: float
    cost: float
    time: float

class UtilityBasedDecisionMaker:
    def __init__(self, utility_weights: Dict[str, float]):
        self.weights = utility_weights
    
    def select_action(self, actions: List[Action], goal: Goal) -> Action:
        """Select action with highest expected utility."""
        
        best_action = None
        best_utility = float('-inf')
        
        for action in actions:
            utility = self._calculate_utility(action, goal)
            if utility > best_utility:
                best_utility = utility
                best_action = action
        
        return best_action
    
    def _calculate_utility(self, action: Action, goal: Goal) -> float:
        """Calculate expected utility of action."""
        
        # Expected value
        expected_value = action.probability * self._value_of_outcome(
            action.expected_outcome, goal
        )
        
        # Cost penalty
        cost_penalty = self.weights.get('cost', 0.3) * action.cost
        
        # Time penalty
        time_penalty = self.weights.get('time', 0.2) * action.time
        
        return expected_value - cost_penalty - time_penalty
```

---

#### 1.3.2 Multi-Criteria Decision Making

```python
class MCDMDecisionMaker:
    def __init__(self, criteria: List[str], weights: Dict[str, float]):
        self.criteria = criteria
        self.weights = weights
    
    def decide(self, alternatives: List[Dict[str, float]]) -> Dict[str, Any]:
        """Select best alternative using weighted scoring."""
        
        scores = []
        for alt in alternatives:
            score = sum(
                self.weights.get(criterion, 0) * alt.get(criterion, 0)
                for criterion in self.criteria
            )
            scores.append((alt, score))
        
        # Sort by score
        scores.sort(key=lambda x: x[1], reverse=True)
        
        return {
            "best": scores[0][0],
            "score": scores[0][1],
            "ranking": scores
        }
```

---

### 1.4 State Management Approaches

#### 1.4.1 Finite State Machine (FSM)

```python
from enum import Enum, auto
from typing import Dict, Callable, Optional
from dataclasses import dataclass

class AgentState(Enum):
    IDLE = auto()
    PLANNING = auto()
    EXECUTING = auto()
    WAITING = auto()
    ERROR = auto()
    COMPLETED = auto()

@dataclass
class Transition:
    from_state: AgentState
    to_state: AgentState
    condition: Callable[[Any], bool]
    action: Optional[Callable] = None

class AgentStateMachine:
    def __init__(self):
        self.state = AgentState.IDLE
        self.transitions: Dict[tuple, Transition] = {}
        self.state_handlers: Dict[AgentState, Callable] = {}
        self.context: Dict[str, Any] = {}
    
    def add_transition(self, transition: Transition):
        """Add state transition."""
        key = (transition.from_state, transition.to_state)
        self.transitions[key] = transition
    
    def set_state_handler(self, state: AgentState, handler: Callable):
        """Set handler for state entry."""
        self.state_handlers[state] = handler
    
    def transition_to(self, new_state: AgentState, data: Any = None):
        """Attempt state transition."""
        key = (self.state, new_state)
        
        if key not in self.transitions:
            raise ValueError(f"Invalid transition: {self.state} -> {new_state}")
        
        transition = self.transitions[key]
        
        if not transition.condition(data):
            return False
        
        # Execute transition action
        if transition.action:
            transition.action(data)
        
        # Update state
        old_state = self.state
        self.state = new_state
        
        # Execute state handler
        if new_state in self.state_handlers:
            self.state_handlers[new_state](data)
        
        return True
    
    def run(self, initial_data: Any = None):
        """Run state machine."""
        while self.state != AgentState.COMPLETED:
            handler = self.state_handlers.get(self.state)
            if handler:
                result = handler(self.context)
                
                # Determine next state based on result
                if result:
                    self._auto_transition(result)
    
    def _auto_transition(self, result: Any):
        """Automatically transition based on result."""
        # Implementation depends on specific logic
        pass
```

---

#### 1.4.2 Hierarchical State Machine

```python
class HierarchicalStateMachine:
    def __init__(self):
        self.root_state: Optional[State] = None
        self.current_state: Optional[State] = None
        self.state_stack: List[State] = []
    
    def transition_to(self, state_name: str, push: bool = False):
        """Transition to state, optionally pushing current to stack."""
        if push and self.current_state:
            self.state_stack.append(self.current_state)
        
        new_state = self._find_state(state_name)
        
        # Exit current state
        if self.current_state:
            self.current_state.on_exit()
        
        # Enter new state
        self.current_state = new_state
        self.current_state.on_enter()
    
    def pop_state(self):
        """Return to previous state."""
        if self.state_stack:
            previous = self.state_stack.pop()
            self.transition_to(previous.name)
    
    def update(self, delta_time: float):
        """Update current state."""
        if self.current_state:
            self.current_state.update(delta_time)
            
            # Update parent states (for hierarchical)
            parent = self.current_state.parent
            while parent:
                parent.update(delta_time)
                parent = parent.parent
```

---

## 2. MEMORY SYSTEMS

### 2.1 Memory Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    MEMORY HIERARCHY                          │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │   Working   │  │   Short-    │  │     Long-Term       │  │
│  │   Memory    │  │   Term      │  │      Memory         │  │
│  │  (Context)  │  │   Memory    │  │   (Vector DB)       │  │
│  │   ~128K     │  │   ~1M       │  │    Unlimited        │  │
│  └─────────────┘  └─────────────┘  └─────────────────────┘  │
│         │                │                    │              │
│         └────────────────┴────────────────────┘              │
│                         │                                    │
│                  ┌─────────────┐                             │
│                  │   Memory    │                             │
│                  │   Manager   │                             │
│                  └─────────────┘                             │
└─────────────────────────────────────────────────────────────┘
```

---

### 2.2 Working Memory Management

**Purpose**: Active context for current task execution

**Implementation**:
```python
from typing import List, Dict, Any, Optional
from dataclasses import dataclass, field
from collections import deque
import json

@dataclass
class WorkingMemoryItem:
    content: str
    importance: float  # 0-1
    timestamp: float
    source: str
    metadata: Dict[str, Any] = field(default_factory=dict)

class WorkingMemory:
    def __init__(self, max_items: int = 50, max_tokens: int = 8000):
        self.max_items = max_items
        self.max_tokens = max_tokens
        self.items: deque = deque(maxlen=max_items)
        self.current_tokens = 0
        self.summarizer = None  # LLM for summarization
    
    def add(self, content: str, importance: float = 0.5, source: str = "unknown", 
            metadata: Dict = None) -> bool:
        """Add item to working memory, managing capacity."""
        
        item_tokens = self._estimate_tokens(content)
        
        # If adding would exceed capacity, compress or remove
        while self.current_tokens + item_tokens > self.max_tokens:
            if not self._compress_or_remove():
                return False
        
        item = WorkingMemoryItem(
            content=content,
            importance=importance,
            timestamp=time.time(),
            source=source,
            metadata=metadata or {}
        )
        
        self.items.append(item)
        self.current_tokens += item_tokens
        
        return True
    
    def get_context(self, query: str = None, max_items: int = 20) -> str:
        """Get relevant context from working memory."""
        
        if not query:
            # Return most recent and important items
            sorted_items = sorted(
                self.items,
                key=lambda x: (x.importance, x.timestamp),
                reverse=True
            )
            selected = sorted_items[:max_items]
        else:
            # Relevance-based retrieval
            selected = self._retrieve_relevant(query, max_items)
        
        # Sort by timestamp for chronological context
        selected.sort(key=lambda x: x.timestamp)
        
        return "\n".join([
            f"[{item.source}] {item.content}"
            for item in selected
        ])
    
    def _compress_or_remove(self) -> bool:
        """Compress or remove items to free space."""
        
        # Try to compress low-importance items first
        for item in self.items:
            if item.importance < 0.3 and len(item.content) > 100:
                item.content = self._summarize(item.content)
                self.current_tokens = sum(
                    self._estimate_tokens(i.content) for i in self.items
                )
                return True
        
        # Remove least important item
        if self.items:
            least_important = min(self.items, key=lambda x: x.importance)
            self.items.remove(least_important)
            self.current_tokens = sum(
                self._estimate_tokens(i.content) for i in self.items
            )
            return True
        
        return False
    
    def _summarize(self, content: str) -> str:
        """Summarize content to reduce size."""
        if self.summarizer:
            return self.summarizer(f"Summarize: {content}")
        return content[:200] + "..."
    
    def _estimate_tokens(self, text: str) -> int:
        """Estimate token count (rough approximation)."""
        return len(text.split()) * 1.3
    
    def _retrieve_relevant(self, query: str, max_items: int) -> List[WorkingMemoryItem]:
        """Retrieve items relevant to query."""
        # Simple keyword matching - replace with embedding similarity
        query_words = set(query.lower().split())
        
        scored_items = []
        for item in self.items:
            item_words = set(item.content.lower().split())
            overlap = len(query_words & item_words)
            score = overlap * item.importance
            scored_items.append((item, score))
        
        scored_items.sort(key=lambda x: x[1], reverse=True)
        return [item for item, _ in scored_items[:max_items]]
```

---

### 2.3 Short-Term Memory (Episodic Buffer)

**Purpose**: Recent experiences and conversations

**Implementation**:
```python
from typing import List, Dict, Any
from dataclasses import dataclass
from datetime import datetime, timedelta
import json

@dataclass
class Episode:
    id: str
    timestamp: datetime
    type: str  # conversation, action, observation
    content: Dict[str, Any]
    emotions: List[str] = None
    outcome: str = None
    related_episodes: List[str] = None

class EpisodicMemory:
    def __init__(self, storage_path: str = "episodes.json"):
        self.storage_path = storage_path
        self.episodes: List[Episode] = []
        self.index: Dict[str, List[str]] = {}  # keyword -> episode ids
        self.load()
    
    def add_episode(self, episode_type: str, content: Dict, 
                    emotions: List[str] = None, outcome: str = None):
        """Add new episode to memory."""
        
        episode = Episode(
            id=f"ep_{datetime.now().isoformat()}",
            timestamp=datetime.now(),
            type=episode_type,
            content=content,
            emotions=emotions or [],
            outcome=outcome,
            related_episodes=[]
        )
        
        self.episodes.append(episode)
        self._index_episode(episode)
        self._link_related(episode)
        
        # Auto-save
        self.save()
    
    def recall_recent(self, hours: int = 24, episode_type: str = None) -> List[Episode]:
        """Recall recent episodes."""
        cutoff = datetime.now() - timedelta(hours=hours)
        
        recent = [
            ep for ep in self.episodes
            if ep.timestamp > cutoff
            and (episode_type is None or ep.type == episode_type)
        ]
        
        return sorted(recent, key=lambda x: x.timestamp, reverse=True)
    
    def recall_similar(self, query: str, n: int = 5) -> List[Episode]:
        """Recall episodes similar to query."""
        # Use indexed keywords for fast retrieval
        query_words = set(query.lower().split())
        
        episode_scores = {}
        for word in query_words:
            if word in self.index:
                for ep_id in self.index[word]:
                    episode_scores[ep_id] = episode_scores.get(ep_id, 0) + 1
        
        # Sort by score
        sorted_eps = sorted(
            episode_scores.items(),
            key=lambda x: x[1],
            reverse=True
        )
        
        episode_map = {ep.id: ep for ep in self.episodes}
        return [episode_map[ep_id] for ep_id, _ in sorted_eps[:n] if ep_id in episode_map]
    
    def recall_by_emotion(self, emotion: str) -> List[Episode]:
        """Recall episodes associated with emotion."""
        return [
            ep for ep in self.episodes
            if emotion in (ep.emotions or [])
        ]
    
    def _index_episode(self, episode: Episode):
        """Index episode for fast retrieval."""
        content_str = json.dumps(episode.content).lower()
        words = set(content_str.split())
        
        for word in words:
            if len(word) > 3:  # Only index meaningful words
                if word not in self.index:
                    self.index[word] = []
                self.index[word].append(episode.id)
    
    def _link_related(self, episode: Episode):
        """Link episode to related past episodes."""
        # Find episodes with similar content
        similar = self.recall_similar(json.dumps(episode.content), n=3)
        episode.related_episodes = [ep.id for ep in similar if ep.id != episode.id]
    
    def save(self):
        """Save episodes to disk."""
        data = [
            {
                "id": ep.id,
                "timestamp": ep.timestamp.isoformat(),
                "type": ep.type,
                "content": ep.content,
                "emotions": ep.emotions,
                "outcome": ep.outcome,
                "related_episodes": ep.related_episodes
            }
            for ep in self.episodes
        ]
        
        with open(self.storage_path, 'w') as f:
            json.dump(data, f, indent=2)
    
    def load(self):
        """Load episodes from disk."""
        try:
            with open(self.storage_path, 'r') as f:
                data = json.load(f)
            
            self.episodes = [
                Episode(
                    id=ep["id"],
                    timestamp=datetime.fromisoformat(ep["timestamp"]),
                    type=ep["type"],
                    content=ep["content"],
                    emotions=ep.get("emotions"),
                    outcome=ep.get("outcome"),
                    related_episodes=ep.get("related_episodes", [])
                )
                for ep in data
            ]
            
            # Rebuild index
            for ep in self.episodes:
                self._index_episode(ep)
                
        except FileNotFoundError:
            pass
```

---

### 2.4 Long-Term Memory (Semantic Memory)

**Purpose**: Persistent knowledge and learned patterns

**Implementation with Vector Database**:
```python
from typing import List, Dict, Any, Optional
import numpy as np
from dataclasses import dataclass

@dataclass
class MemoryItem:
    id: str
    content: str
    embedding: np.ndarray
    metadata: Dict[str, Any]
    importance: float
    access_count: int
    last_accessed: float

class SemanticMemory:
    def __init__(self, embedding_model, vector_store):
        self.embedding_model = embedding_model
        self.vector_store = vector_store
        self.cache: Dict[str, MemoryItem] = {}
    
    def store(self, content: str, metadata: Dict = None, importance: float = 0.5) -> str:
        """Store new knowledge in long-term memory."""
        
        # Generate embedding
        embedding = self.embedding_model.encode(content)
        
        # Create memory item
        memory_id = f"mem_{hash(content) % 10000000}"
        item = MemoryItem(
            id=memory_id,
            content=content,
            embedding=embedding,
            metadata=metadata or {},
            importance=importance,
            access_count=0,
            last_accessed=time.time()
        )
        
        # Store in vector database
        self.vector_store.add(
            ids=[memory_id],
            embeddings=[embedding.tolist()],
            documents=[content],
            metadatas=[{**metadata, "importance": importance}]
        )
        
        # Cache
        self.cache[memory_id] = item
        
        return memory_id
    
    def retrieve(self, query: str, n: int = 5, 
                 filter_metadata: Dict = None) -> List[Dict]:
        """Retrieve relevant memories."""
        
        # Generate query embedding
        query_embedding = self.embedding_model.encode(query)
        
        # Search vector store
        results = self.vector_store.query(
            query_embeddings=[query_embedding.tolist()],
            n_results=n,
            where=filter_metadata
        )
        
        # Update access statistics
        retrieved = []
        for i, memory_id in enumerate(results['ids'][0]):
            if memory_id in self.cache:
                self.cache[memory_id].access_count += 1
                self.cache[memory_id].last_accessed = time.time()
            
            retrieved.append({
                "id": memory_id,
                "content": results['documents'][0][i],
                "metadata": results['metadatas'][0][i],
                "similarity": 1 - results['distances'][0][i]
            })
        
        return retrieved
    
    def consolidate(self):
        """Consolidate memories - merge similar, forget unimportant."""
        
        # Find similar memories
        all_memories = self.vector_store.get()
        
        to_merge = []
        to_forget = []
        
        for i, mem_id in enumerate(all_memories['ids']):
            metadata = all_memories['metadatas'][i]
            
            # Check if should be forgotten
            if metadata.get('importance', 0.5) < 0.2:
                if mem_id in self.cache:
                    item = self.cache[mem_id]
                    # Forget if not accessed recently
                    if time.time() - item.last_accessed > 86400 * 30:  # 30 days
                        to_forget.append(mem_id)
        
        # Remove forgotten memories
        if to_forget:
            self.vector_store.delete(ids=to_forget)
            for mem_id in to_forget:
                if mem_id in self.cache:
                    del self.cache[mem_id]
    
    def update_importance(self, memory_id: str, delta: float):
        """Update importance score based on feedback."""
        if memory_id in self.cache:
            self.cache[memory_id].importance = max(0, min(1, 
                self.cache[memory_id].importance + delta
            ))
```

---

### 2.5 Memory Integration Layer

```python
class IntegratedMemorySystem:
    def __init__(self, working_memory: WorkingMemory, 
                 episodic_memory: EpisodicMemory,
                 semantic_memory: SemanticMemory):
        self.working = working_memory
        self.episodic = episodic_memory
        self.semantic = semantic_memory
    
    def query(self, query: str, context: Dict = None) -> Dict[str, Any]:
        """Query all memory systems and synthesize response."""
        
        # Query each memory type
        working_context = self.working.get_context(query)
        recent_episodes = self.episodic.recall_recent(hours=24)
        similar_episodes = self.episodic.recall_similar(query, n=3)
        semantic_knowledge = self.semantic.retrieve(query, n=5)
        
        # Synthesize
        return {
            "working_context": working_context,
            "recent_experiences": [
                {"type": ep.type, "content": ep.content}
                for ep in recent_episodes[:3]
            ],
            "similar_past": [
                {"type": ep.type, "outcome": ep.outcome}
                for ep in similar_episodes
            ],
            "relevant_knowledge": semantic_knowledge,
            "synthesized": self._synthesize_memories(
                working_context, recent_episodes, similar_episodes, semantic_knowledge
            )
        }
    
    def _synthesize_memories(self, working, recent, similar, semantic) -> str:
        """Synthesize memories into coherent context."""
        # Implementation depends on specific needs
        pass
    
    def learn_from_experience(self, experience: Dict, outcome: str):
        """Learn from experience across all memory systems."""
        
        # Add to episodic memory
        self.episodic.add_episode(
            episode_type="learning",
            content=experience,
            outcome=outcome
        )
        
        # Extract and store knowledge
        knowledge = self._extract_knowledge(experience, outcome)
        if knowledge:
            self.semantic.store(
                content=knowledge,
                metadata={"source": "experience", "outcome": outcome}
            )
    
    def _extract_knowledge(self, experience: Dict, outcome: str) -> Optional[str]:
        """Extract generalizable knowledge from experience."""
        # Use LLM to extract patterns
        pass
```

---

## 3. PLANNING & EXECUTION

### 3.1 Hierarchical Task Planning

```python
from typing import List, Dict, Any, Optional
from dataclasses import dataclass, field
from enum import Enum
import json

class TaskStatus(Enum):
    PENDING = "pending"
    READY = "ready"
    IN_PROGRESS = "in_progress"
    BLOCKED = "blocked"
    COMPLETED = "completed"
    FAILED = "failed"
    CANCELLED = "cancelled"

@dataclass
class Task:
    id: str
    description: str
    status: TaskStatus = TaskStatus.PENDING
    parent_id: Optional[str] = None
    subtasks: List['Task'] = field(default_factory=list)
    dependencies: List[str] = field(default_factory=list)
    estimated_effort: float = 1.0  # hours
    actual_effort: float = 0.0
    priority: int = 5  # 1-10
    required_tools: List[str] = field(default_factory=list)
    expected_output: Dict[str, Any] = field(default_factory=dict)
    actual_output: Any = None
    metadata: Dict[str, Any] = field(default_factory=dict)

class HierarchicalTaskPlanner:
    def __init__(self, llm, max_depth: int = 5):
        self.llm = llm
        self.max_depth = max_depth
    
    def create_plan(self, goal: str, context: Dict = None) -> Task:
        """Create hierarchical task plan from goal."""
        
        root_task = Task(
            id="root",
            description=goal,
            status=TaskStatus.PENDING
        )
        
        self._decompose_task(root_task, depth=0, context=context)
        
        return root_task
    
    def _decompose_task(self, task: Task, depth: int, context: Dict):
        """Recursively decompose task into subtasks."""
        
        if depth >= self.max_depth:
            task.status = TaskStatus.READY
            return
        
        # Check if task is atomic
        if self._is_atomic(task):
            task.status = TaskStatus.READY
            return
        
        # Generate subtasks
        subtasks = self._generate_subtasks(task, context)
        
        for subtask_data in subtasks:
            subtask = Task(
                id=f"{task.id}_{len(task.subtasks)}",
                description=subtask_data["description"],
                parent_id=task.id,
                dependencies=subtask_data.get("dependencies", []),
                estimated_effort=subtask_data.get("effort", 1.0),
                priority=subtask_data.get("priority", 5),
                required_tools=subtask_data.get("tools", [])
            )
            
            task.subtasks.append(subtask)
            
            # Recursively decompose
            self._decompose_task(subtask, depth + 1, context)
        
        # Update task status based on subtasks
        task.status = TaskStatus.PENDING
    
    def _is_atomic(self, task: Task) -> bool:
        """Check if task is atomic (cannot be decomposed)."""
        prompt = f"""Can this task be broken down into smaller subtasks?

Task: {task.description}

Answer with just YES or NO."""
        
        response = self.llm.generate(prompt).strip().upper()
        return response == "NO"
    
    def _generate_subtasks(self, task: Task, context: Dict) -> List[Dict]:
        """Generate subtasks for a task."""
        prompt = f"""Break down this task into subtasks:

Task: {task.description}
Context: {json.dumps(context, indent=2)}

Generate subtasks as JSON array:
[
    {{
        "description": "subtask description",
        "dependencies": [],
        "effort": 1.0,
        "priority": 5,
        "tools": ["tool1"]
    }}
]

Guidelines:
- Each subtask should be independently completable
- Include dependencies between subtasks
- Estimate effort in hours
- Assign priority (1-10)"""
        
        return self.llm.generate_json(prompt)
    
    def get_ready_tasks(self, root: Task) -> List[Task]:
        """Get all tasks ready for execution."""
        ready = []
        self._collect_ready_tasks(root, ready, set())
        return ready
    
    def _collect_ready_tasks(self, task: Task, ready: List[Task], completed: set):
        """Recursively collect ready tasks."""
        
        if task.status == TaskStatus.READY:
            ready.append(task)
        elif task.status == TaskStatus.PENDING:
            # Check if all dependencies are completed
            if all(dep in completed for dep in task.dependencies):
                # Check if all subtasks are completed
                if all(st.status == TaskStatus.COMPLETED for st in task.subtasks):
                    task.status = TaskStatus.READY
                    ready.append(task)
            
            # Recurse into subtasks
            for subtask in task.subtasks:
                self._collect_ready_tasks(subtask, ready, completed)
    
    def update_task_status(self, task: Task, new_status: TaskStatus, output: Any = None):
        """Update task status and propagate to parent."""
        
        task.status = new_status
        task.actual_output = output
        
        if new_status == TaskStatus.COMPLETED:
            # Check if parent can be completed
            if task.parent_id:
                parent = self._find_task_by_id(root_task, task.parent_id)
                if parent and all(st.status == TaskStatus.COMPLETED for st in parent.subtasks):
                    parent.status = TaskStatus.READY
    
    def _find_task_by_id(self, root: Task, task_id: str) -> Optional[Task]:
        """Find task by ID in hierarchy."""
        if root.id == task_id:
            return root
        for subtask in root.subtasks:
            found = self._find_task_by_id(subtask, task_id)
            if found:
                return found
        return None
```

---

### 3.2 Goal Decomposition Strategies

#### 3.2.1 MECE (Mutually Exclusive, Collectively Exhaustive)

```python
class MECEDecomposer:
    """Decompose goals using MECE principle."""
    
    def __init__(self, llm):
        self.llm = llm
    
    def decompose(self, goal: str, dimension: str = None) -> List[Dict]:
        """Decompose goal into MECE components."""
        
        prompt = f"""Decompose this goal using MECE principle:

Goal: {goal}
Dimension: {dimension or "appropriate"}

Provide decomposition as JSON:
{{
    "dimension": "how you're splitting (e.g., by phase, by component)",
    "components": [
        {{
            "name": "component name",
            "description": "what this covers",
            "completeness_check": "how to verify this is complete"
        }}
    ],
    "mece_verification": "explanation of why this is MECE"
}}

Rules:
- Mutually Exclusive: No overlap between components
- Collectively Exhaustive: Together they cover everything
- Same level of abstraction for all components"""
        
        return self.llm.generate_json(prompt)
```

---

#### 3.2.2 Dependency-Based Decomposition

```python
class DependencyDecomposer:
    """Decompose based on task dependencies."""
    
    def __init__(self, llm):
        self.llm = llm
    
    def decompose(self, goal: str) -> Dict:
        """Decompose with dependency analysis."""
        
        prompt = f"""Decompose this goal and identify dependencies:

Goal: {goal}

Provide as JSON:
{{
    "tasks": [
        {{
            "id": "task_1",
            "description": "task description",
            "type": "sequential|parallel|conditional",
            "dependencies": ["task_ids that must complete first"],
            "provides": ["outputs for other tasks"],
            "estimated_duration": "time estimate"
        }}
    ],
    "critical_path": ["task_ids on critical path"],
    "parallel_groups": [["tasks that can run in parallel"]]
}}"""
        
        return self.llm.generate_json(prompt)
```

---

### 3.3 Execution Monitoring

```python
from typing import Callable, Dict, Any
from dataclasses import dataclass
from datetime import datetime, timedelta
import time

@dataclass
class ExecutionMetrics:
    task_id: str
    start_time: datetime
    end_time: datetime = None
    status: str = "running"
    progress: float = 0.0
    estimated_remaining: float = None
    cost_incurred: float = 0.0
    errors: list = None

class ExecutionMonitor:
    def __init__(self, alert_handlers: Dict[str, Callable] = None):
        self.metrics: Dict[str, ExecutionMetrics] = {}
        self.alert_handlers = alert_handlers or {}
        self.check_interval = 5  # seconds
    
    def start_monitoring(self, task_id: str, estimated_duration: float):
        """Start monitoring a task."""
        self.metrics[task_id] = ExecutionMetrics(
            task_id=task_id,
            start_time=datetime.now(),
            estimated_remaining=estimated_duration
        )
    
    def update_progress(self, task_id: str, progress: float, cost: float = 0):
        """Update task progress."""
        if task_id in self.metrics:
            metric = self.metrics[task_id]
            metric.progress = progress
            metric.cost_incurred += cost
            
            # Update estimated remaining
            elapsed = (datetime.now() - metric.start_time).total_seconds()
            if progress > 0:
                total_estimated = elapsed / progress
                metric.estimated_remaining = total_estimated * (1 - progress)
            
            # Check for issues
            self._check_for_issues(task_id)
    
    def _check_for_issues(self, task_id: str):
        """Check for execution issues and alert."""
        metric = self.metrics[task_id]
        
        # Check for timeout
        elapsed = (datetime.now() - metric.start_time).total_seconds()
        if elapsed > 3600:  # 1 hour
            self._alert("timeout", task_id, metric)
        
        # Check for cost overrun
        if metric.cost_incurred > 10.0:  # $10
            self._alert("cost_overrun", task_id, metric)
        
        # Check for stall
        if metric.progress == 0 and elapsed > 300:  # 5 min with no progress
            self._alert("stalled", task_id, metric)
    
    def _alert(self, alert_type: str, task_id: str, metric: ExecutionMetrics):
        """Send alert."""
        if alert_type in self.alert_handlers:
            self.alert_handlers[alert_type](task_id, metric)
    
    def complete_task(self, task_id: str, success: bool):
        """Mark task as complete."""
        if task_id in self.metrics:
            self.metrics[task_id].end_time = datetime.now()
            self.metrics[task_id].status = "completed" if success else "failed"
    
    def get_report(self, task_id: str = None) -> Dict:
        """Get execution report."""
        if task_id:
            metric = self.metrics.get(task_id)
            return self._format_metric(metric) if metric else {}
        
        return {
            "total_tasks": len(self.metrics),
            "completed": sum(1 for m in self.metrics.values() if m.status == "completed"),
            "failed": sum(1 for m in self.metrics.values() if m.status == "failed"),
            "running": sum(1 for m in self.metrics.values() if m.status == "running"),
            "total_cost": sum(m.cost_incurred for m in self.metrics.values()),
            "tasks": [self._format_metric(m) for m in self.metrics.values()]
        }
    
    def _format_metric(self, metric: ExecutionMetrics) -> Dict:
        """Format metric for reporting."""
        return {
            "task_id": metric.task_id,
            "status": metric.status,
            "progress": metric.progress,
            "duration": (metric.end_time - metric.start_time).total_seconds() if metric.end_time else None,
            "cost": metric.cost_incurred,
            "estimated_remaining": metric.estimated_remaining
        }
```

---

### 3.4 Error Recovery Mechanisms

```python
from typing import List, Dict, Any, Callable
from enum import Enum
from dataclasses import dataclass

class RecoveryStrategy(Enum):
    RETRY = "retry"
    FALLBACK = "fallback"
    SKIP = "skip"
    ESCALATE = "escalate"
    RECOMPOSE = "recompose"

@dataclass
class RecoveryAction:
    strategy: RecoveryStrategy
    params: Dict[str, Any]
    max_attempts: int = 3

class ErrorRecoverySystem:
    def __init__(self, llm):
        self.llm = llm
        self.recovery_handlers: Dict[str, Callable] = {
            RecoveryStrategy.RETRY: self._handle_retry,
            RecoveryStrategy.FALLBACK: self._handle_fallback,
            RecoveryStrategy.SKIP: self._handle_skip,
            RecoveryStrategy.ESCALATE: self._handle_escalate,
            RecoveryStrategy.RECOMPOSE: self._handle_recompose
        }
        self.error_history: List[Dict] = []
    
    def recover(self, task: Task, error: Exception, context: Dict) -> Any:
        """Attempt to recover from error."""
        
        # Log error
        self._log_error(task, error, context)
        
        # Analyze error
        analysis = self._analyze_error(error, context)
        
        # Select recovery strategy
        strategy = self._select_recovery_strategy(analysis, task)
        
        # Execute recovery
        handler = self.recovery_handlers.get(strategy.strategy)
        if handler:
            return handler(task, error, context, strategy.params)
        
        raise error  # No recovery possible
    
    def _analyze_error(self, error: Exception, context: Dict) -> Dict:
        """Analyze error to determine cause and recovery options."""
        
        prompt = f"""Analyze this error:

Error: {type(error).__name__}: {str(error)}
Context: {context}

Provide analysis as JSON:
{{
    "error_type": "classification of error",
    "root_cause": "likely cause",
    "recoverable": true/false,
    "suggested_strategies": ["retry", "fallback", "skip", "escalate"],
    "confidence": 0.8
}}"""
        
        return self.llm.generate_json(prompt)
    
    def _select_recovery_strategy(self, analysis: Dict, task: Task) -> RecoveryAction:
        """Select best recovery strategy based on analysis."""
        
        strategies = analysis.get("suggested_strategies", ["retry"])
        
        for strategy_name in strategies:
            strategy = RecoveryStrategy(strategy_name)
            
            if strategy == RecoveryStrategy.RETRY:
                return RecoveryAction(
                    strategy=strategy,
                    params={"delay": 1.0, "backoff": 2.0}
                )
            elif strategy == RecoveryStrategy.FALLBACK:
                return RecoveryAction(
                    strategy=strategy,
                    params={"alternative_approach": None}
                )
            elif strategy == RecoveryStrategy.SKIP:
                return RecoveryAction(
                    strategy=strategy,
                    params={"can_skip": task.metadata.get("optional", False)}
                )
            elif strategy == RecoveryStrategy.RECOMPOSE:
                return RecoveryAction(
                    strategy=strategy,
                    params={"deeper_decomposition": True}
                )
        
        return RecoveryAction(strategy=RecoveryStrategy.ESCALATE, params={})
    
    def _handle_retry(self, task: Task, error: Exception, context: Dict, params: Dict) -> Any:
        """Retry task with delay and backoff."""
        delay = params.get("delay", 1.0)
        backoff = params.get("backoff", 2.0)
        max_attempts = params.get("max_attempts", 3)
        
        for attempt in range(max_attempts):
            time.sleep(delay)
            
            try:
                # Retry execution
                result = self._retry_task(task, context)
                return result
            except Exception as e:
                delay *= backoff
                if attempt == max_attempts - 1:
                    raise
        
        raise error
    
    def _handle_fallback(self, task: Task, error: Exception, context: Dict, params: Dict) -> Any:
        """Use alternative approach."""
        
        # Generate alternative approach
        prompt = f"""The following approach failed:

Task: {task.description}
Error: {error}

Suggest an alternative approach that might work."""
        
        alternative = self.llm.generate(prompt)
        
        # Create new task with alternative
        fallback_task = Task(
            id=f"{task.id}_fallback",
            description=alternative,
            parent_id=task.parent_id,
            metadata={"is_fallback": True, "original_error": str(error)}
        )
        
        # Execute fallback
        return self._execute_task(fallback_task, context)
    
    def _handle_skip(self, task: Task, error: Exception, context: Dict, params: Dict) -> Any:
        """Skip task if optional."""
        if params.get("can_skip", False):
            return {"skipped": True, "reason": str(error)}
        raise error
    
    def _handle_escalate(self, task: Task, error: Exception, context: Dict, params: Dict) -> Any:
        """Escalate to human or higher-level agent."""
        # Implementation depends on escalation mechanism
        raise NotImplementedError("Escalation not implemented")
    
    def _handle_recompose(self, task: Task, error: Exception, context: Dict, params: Dict) -> Any:
        """Recompose task into smaller subtasks."""
        
        # Create more granular decomposition
        decomposer = HierarchicalTaskPlanner(self.llm, max_depth=task.metadata.get("depth", 0) + 2)
        new_plan = decomposer.create_plan(task.description, context)
        
        # Execute new plan
        return self._execute_plan(new_plan, context)
    
    def _log_error(self, task: Task, error: Exception, context: Dict):
        """Log error for learning."""
        self.error_history.append({
            "task_id": task.id,
            "task_description": task.description,
            "error_type": type(error).__name__,
            "error_message": str(error),
            "context": context,
            "timestamp": time.time()
        })
```

---

## 4. MULTI-AGENT ORCHESTRATION

### 4.1 When to Use Sub-Agents

Use sub-agents when:

| Scenario | Recommendation | Example |
|----------|---------------|---------|
| Task complexity > threshold | Create specialist agent | Research agent for deep dives |
| Different expertise needed | Domain-specific agents | Code agent, Design agent |
| Parallel execution possible | Spawn multiple agents | Process multiple files |
| Need for isolation | Separate agent | Untrusted code execution |
| Different rate limits | Separate agent | API-heavy vs compute-heavy |
| Cost optimization needed | Lightweight sub-agents | Simple tasks with cheaper model |

---

### 4.2 Agent Communication Patterns

#### 4.2.1 Hub-and-Spoke Pattern

```python
from typing import Dict, List, Any, Callable
from dataclasses import dataclass
from queue import Queue
import threading

@dataclass
class Message:
    sender: str
    recipient: str
    message_type: str
    payload: Any
    priority: int = 5
    timestamp: float = None

class AgentBus:
    """Central message bus for agent communication."""
    
    def __init__(self):
        self.agents: Dict[str, 'Agent'] = {}
        self.message_queue: Queue = Queue()
        self.subscriptions: Dict[str, List[str]] = {}  # message_type -> agent_ids
        self.running = False
    
    def register_agent(self, agent_id: str, agent: 'Agent'):
        """Register agent with bus."""
        self.agents[agent_id] = agent
        agent.set_bus(self)
    
    def subscribe(self, agent_id: str, message_types: List[str]):
        """Subscribe agent to message types."""
        for msg_type in message_types:
            if msg_type not in self.subscriptions:
                self.subscriptions[msg_type] = []
            self.subscriptions[msg_type].append(agent_id)
    
    def send(self, message: Message):
        """Send message to queue."""
        message.timestamp = time.time()
        self.message_queue.put(message)
    
    def broadcast(self, sender: str, message_type: str, payload: Any):
        """Broadcast message to all subscribers."""
        for agent_id in self.subscriptions.get(message_type, []):
            if agent_id != sender:
                self.send(Message(
                    sender=sender,
                    recipient=agent_id,
                    message_type=message_type,
                    payload=payload
                ))
    
    def start(self):
        """Start message processing."""
        self.running = True
        threading.Thread(target=self._process_messages, daemon=True).start()
    
    def _process_messages(self):
        """Process messages from queue."""
        while self.running:
            try:
                message = self.message_queue.get(timeout=1)
                self._deliver(message)
            except:
                continue
    
    def _deliver(self, message: Message):
        """Deliver message to recipient."""
        if message.recipient in self.agents:
            self.agents[message.recipient].receive(message)
```

---

#### 4.2.2 Direct Communication Pattern

```python
class DirectCommunicationAgent:
    """Agent with direct communication capability."""
    
    def __init__(self, agent_id: str, peers: Dict[str, 'DirectCommunicationAgent'] = None):
        self.agent_id = agent_id
        self.peers = peers or {}
        self.inbox: Queue = Queue()
        self.message_handlers: Dict[str, Callable] = {}
    
    def connect(self, peer_id: str, peer: 'DirectCommunicationAgent'):
        """Connect to peer agent."""
        self.peers[peer_id] = peer
    
    def send_direct(self, recipient_id: str, message_type: str, payload: Any):
        """Send direct message to peer."""
        if recipient_id in self.peers:
            message = Message(
                sender=self.agent_id,
                recipient=recipient_id,
                message_type=message_type,
                payload=payload
            )
            self.peers[recipient_id].inbox.put(message)
    
    def register_handler(self, message_type: str, handler: Callable):
        """Register message handler."""
        self.message_handlers[message_type] = handler
    
    def process_inbox(self):
        """Process incoming messages."""
        while not self.inbox.empty():
            message = self.inbox.get()
            handler = self.message_handlers.get(message.message_type)
            if handler:
                handler(message)
```

---

### 4.3 Load Balancing and Parallelization

```python
from typing import List, Dict, Any
from concurrent.futures import ThreadPoolExecutor, as_completed
from dataclasses import dataclass
import time

@dataclass
class WorkUnit:
    id: str
    task: Dict[str, Any]
    priority: int
    estimated_duration: float
    agent_type: str

class LoadBalancer:
    """Distribute work across agent pool."""
    
    def __init__(self, agent_factory: Callable, pool_size: int = 5):
        self.agent_factory = agent_factory
        self.pool_size = pool_size
        self.agent_pool: List['Agent'] = []
        self.work_queue: List[WorkUnit] = []
        self.agent_load: Dict[str, float] = {}
        self.executor = ThreadPoolExecutor(max_workers=pool_size)
    
    def initialize_pool(self):
        """Initialize agent pool."""
        for i in range(self.pool_size):
            agent = self.agent_factory()
            self.agent_pool.append(agent)
            self.agent_load[agent.agent_id] = 0.0
    
    def submit_work(self, work_units: List[WorkUnit]) -> Dict[str, Any]:
        """Submit work units for execution."""
        
        # Sort by priority
        work_units.sort(key=lambda x: x.priority, reverse=True)
        
        # Group by agent type for batching
        grouped = self._group_by_type(work_units)
        
        results = {}
        futures = {}
        
        # Submit to executor
        for agent_type, units in grouped.items():
            for unit in units:
                agent = self._select_agent(agent_type)
                future = self.executor.submit(self._execute_unit, agent, unit)
                futures[future] = unit.id
        
        # Collect results
        for future in as_completed(futures):
            unit_id = futures[future]
            try:
                results[unit_id] = future.result()
            except Exception as e:
                results[unit_id] = {"error": str(e)}
        
        return results
    
    def _select_agent(self, agent_type: str) -> 'Agent':
        """Select least loaded agent of given type."""
        candidates = [
            agent for agent in self.agent_pool
            if agent.agent_type == agent_type
        ]
        
        if not candidates:
            # Create new agent of required type
            agent = self.agent_factory(agent_type)
            self.agent_pool.append(agent)
            return agent
        
        # Select least loaded
        return min(candidates, key=lambda a: self.agent_load.get(a.agent_id, 0))
    
    def _execute_unit(self, agent: 'Agent', unit: WorkUnit) -> Any:
        """Execute work unit on agent."""
        start_time = time.time()
        
        # Update load
        self.agent_load[agent.agent_id] += unit.estimated_duration
        
        try:
            result = agent.execute(unit.task)
            return {
                "success": True,
                "result": result,
                "duration": time.time() - start_time
            }
        finally:
            # Update load
            self.agent_load[agent.agent_id] -= unit.estimated_duration
    
    def _group_by_type(self, work_units: List[WorkUnit]) -> Dict[str, List[WorkUnit]]:
        """Group work units by agent type."""
        grouped = {}
        for unit in work_units:
            if unit.agent_type not in grouped:
                grouped[unit.agent_type] = []
            grouped[unit.agent_type].append(unit)
        return grouped
```

---

### 4.4 Result Aggregation

```python
from typing import List, Dict, Any, Callable
from dataclasses import dataclass

@dataclass
class PartialResult:
    agent_id: str
    result: Any
    confidence: float
    metadata: Dict[str, Any]

class ResultAggregator:
    """Aggregate results from multiple agents."""
    
    def __init__(self, llm, aggregation_strategy: str = "consensus"):
        self.llm = llm
        self.strategy = aggregation_strategy
        self.strategies: Dict[str, Callable] = {
            "consensus": self._consensus_aggregation,
            "voting": self._voting_aggregation,
            "weighted": self._weighted_aggregation,
            "hierarchical": self._hierarchical_aggregation,
            "synthesis": self._synthesis_aggregation
        }
    
    def aggregate(self, partial_results: List[PartialResult], 
                  query: str = None) -> Dict[str, Any]:
        """Aggregate partial results using selected strategy."""
        
        aggregator = self.strategies.get(self.strategy, self._consensus_aggregation)
        return aggregator(partial_results, query)
    
    def _consensus_aggregation(self, results: List[PartialResult], 
                               query: str = None) -> Dict[str, Any]:
        """Find consensus among results."""
        
        # Group similar results
        clusters = self._cluster_results(results)
        
        # Find largest cluster
        largest_cluster = max(clusters, key=len)
        
        # Calculate consensus confidence
        avg_confidence = sum(r.confidence for r in largest_cluster) / len(largest_cluster)
        
        return {
            "consensus": self._extract_consensus(largest_cluster),
            "confidence": avg_confidence,
            "agreement_ratio": len(largest_cluster) / len(results),
            "dissenting_views": [r.result for r in results if r not in largest_cluster]
        }
    
    def _voting_aggregation(self, results: List[PartialResult], 
                            query: str = None) -> Dict[str, Any]:
        """Aggregate by weighted voting."""
        
        votes = {}
        for result in results:
            key = self._normalize_result(result.result)
            if key not in votes:
                votes[key] = {"count": 0, "agents": [], "total_confidence": 0}
            votes[key]["count"] += 1
            votes[key]["agents"].append(result.agent_id)
            votes[key]["total_confidence"] += result.confidence
        
        # Find winner
        winner = max(votes.items(), key=lambda x: x[1]["total_confidence"])
        
        return {
            "winner": winner[0],
            "votes": winner[1]["count"],
            "confidence": winner[1]["total_confidence"] / winner[1]["count"],
            "all_votes": votes
        }
    
    def _weighted_aggregation(self, results: List[PartialResult], 
                              query: str = None) -> Dict[str, Any]:
        """Aggregate with confidence weighting."""
        
        # Normalize confidences to weights
        total_confidence = sum(r.confidence for r in results)
        weights = [r.confidence / total_confidence for r in results]
        
        # Weighted combination (for numeric results)
        if all(isinstance(r.result, (int, float)) for r in results):
            weighted_sum = sum(r.result * w for r, w in zip(results, weights))
            return {
                "aggregated_value": weighted_sum,
                "variance": self._calculate_variance(results, weighted_sum),
                "confidence": sum(r.confidence for r in results) / len(results)
            }
        
        # For non-numeric, use synthesis
        return self._synthesis_aggregation(results, query)
    
    def _hierarchical_aggregation(self, results: List[PartialResult], 
                                  query: str = None) -> Dict[str, Any]:
        """Hierarchical aggregation for complex results."""
        
        # Group by sub-component
        components = self._extract_components(results)
        
        aggregated = {}
        for component, component_results in components.items():
            aggregated[component] = self.aggregate(component_results, query)
        
        return {
            "components": aggregated,
            "overall_confidence": sum(r.confidence for r in results) / len(results)
        }
    
    def _synthesis_aggregation(self, results: List[PartialResult], 
                               query: str = None) -> Dict[str, Any]:
        """Use LLM to synthesize results."""
        
        prompt = f"""Synthesize these results into a coherent answer:

Query: {query or "N/A"}

Results from {len(results)} agents:
"""
        
        for i, result in enumerate(results):
            prompt += f"\nAgent {i+1} (confidence: {result.confidence}):\n{result.result}\n"
        
        prompt += """
Synthesize these results, resolving any conflicts and creating a comprehensive answer.
Format as JSON:
{
    "synthesized_answer": "...",
    "confidence": 0.85,
    "key_agreements": [...],
    "key_disagreements": [...],
    "reasoning": "..."
}"""
        
        return self.llm.generate_json(prompt)
    
    def _cluster_results(self, results: List[PartialResult]) -> List[List[PartialResult]]:
        """Cluster similar results."""
        # Simple clustering based on result similarity
        clusters = []
        for result in results:
            added = False
            for cluster in clusters:
                if self._results_similar(result, cluster[0]):
                    cluster.append(result)
                    added = True
                    break
            if not added:
                clusters.append([result])
        return clusters
    
    def _results_similar(self, r1: PartialResult, r2: PartialResult) -> bool:
        """Check if two results are similar."""
        # Use embedding similarity or string comparison
        return str(r1.result).lower() == str(r2.result).lower()
    
    def _normalize_result(self, result: Any) -> str:
        """Normalize result for voting."""
        return str(result).lower().strip()
    
    def _extract_consensus(self, cluster: List[PartialResult]) -> Any:
        """Extract consensus from cluster."""
        # Return most common or synthesized
        return cluster[0].result
    
    def _extract_components(self, results: List[PartialResult]) -> Dict[str, List[PartialResult]]:
        """Extract components from complex results."""
        # Implementation depends on result structure
        return {"main": results}
    
    def _calculate_variance(self, results: List[PartialResult], mean: float) -> float:
        """Calculate variance of results."""
        return sum((r.result - mean) ** 2 for r in results) / len(results)
```

---

## 5. SCALABILITY CONSIDERATIONS

### 5.1 Resource Management

```python
from typing import Dict, Any, Optional
from dataclasses import dataclass
import psutil
import time

@dataclass
class ResourceLimits:
    max_memory_mb: int = 4096
    max_cpu_percent: float = 80.0
    max_disk_gb: float = 10.0
    max_api_calls_per_minute: int = 60

class ResourceManager:
    """Manage system resources for agent execution."""
    
    def __init__(self, limits: ResourceLimits = None):
        self.limits = limits or ResourceLimits()
        self.usage_history: List[Dict] = []
        self.api_call_times: List[float] = []
    
    def check_resources(self) -> Dict[str, Any]:
        """Check current resource usage."""
        
        memory = psutil.virtual_memory()
        cpu = psutil.cpu_percent(interval=1)
        disk = psutil.disk_usage('/')
        
        status = {
            "memory": {
                "used_mb": memory.used / (1024 * 1024),
                "available_mb": memory.available / (1024 * 1024),
                "percent": memory.percent,
                "status": "ok" if memory.percent < 80 else "warning"
            },
            "cpu": {
                "percent": cpu,
                "status": "ok" if cpu < self.limits.max_cpu_percent else "warning"
            },
            "disk": {
                "used_gb": disk.used / (1024 * 1024 * 1024),
                "free_gb": disk.free / (1024 * 1024 * 1024),
                "percent": disk.percent,
                "status": "ok" if disk.percent < 80 else "warning"
            },
            "api_rate": {
                "calls_per_minute": self._calculate_api_rate(),
                "status": "ok" if self._calculate_api_rate() < self.limits.max_api_calls_per_minute else "warning"
            }
        }
        
        self.usage_history.append({
            "timestamp": time.time(),
            "status": status
        })
        
        return status
    
    def can_execute(self, estimated_cost: Dict[str, float]) -> bool:
        """Check if task can be executed given resource constraints."""
        
        status = self.check_resources()
        
        # Check memory
        if status["memory"]["status"] == "warning":
            estimated_memory = estimated_cost.get("memory_mb", 0)
            if status["memory"]["available_mb"] < estimated_memory:
                return False
        
        # Check API rate
        if status["api_rate"]["status"] == "warning":
            return False
        
        return True
    
    def record_api_call(self):
        """Record API call for rate limiting."""
        now = time.time()
        self.api_call_times.append(now)
        
        # Clean old calls
        cutoff = now - 60
        self.api_call_times = [t for t in self.api_call_times if t > cutoff]
    
    def _calculate_api_rate(self) -> int:
        """Calculate API calls per minute."""
        now = time.time()
        cutoff = now - 60
        recent_calls = [t for t in self.api_call_times if t > cutoff]
        return len(recent_calls)
    
    def get_recommendations(self) -> List[str]:
        """Get resource optimization recommendations."""
        
        status = self.check_resources()
        recommendations = []
        
        if status["memory"]["status"] == "warning":
            recommendations.append("Consider reducing working memory size or offloading to disk")
        
        if status["cpu"]["status"] == "warning":
            recommendations.append("Consider reducing parallel execution or using lighter models")
        
        if status["api_rate"]["status"] == "warning":
            recommendations.append("Implement request batching or caching")
        
        return recommendations
```

---

### 5.2 Rate Limiting and Cost Control

```python
from typing import Dict, Any, Optional, Callable
from dataclasses import dataclass
from functools import wraps
import time

@dataclass
class RateLimit:
    calls: int
    period: int  # seconds
    burst: int = 1

@dataclass
class CostBudget:
    daily_limit: float
    per_task_limit: float
    alert_threshold: float = 0.8

class RateLimiter:
    """Rate limiter for API calls."""
    
    def __init__(self):
        self.limits: Dict[str, RateLimit] = {}
        self.call_times: Dict[str, List[float]] = {}
    
    def add_limit(self, resource: str, limit: RateLimit):
        """Add rate limit for resource."""
        self.limits[resource] = limit
        self.call_times[resource] = []
    
    def can_call(self, resource: str) -> bool:
        """Check if call is allowed under rate limit."""
        
        if resource not in self.limits:
            return True
        
        limit = self.limits[resource]
        now = time.time()
        
        # Clean old calls
        cutoff = now - limit.period
        self.call_times[resource] = [
            t for t in self.call_times[resource] if t > cutoff
        ]
        
        # Check if under limit
        return len(self.call_times[resource]) < limit.calls
    
    def record_call(self, resource: str):
        """Record a call."""
        if resource in self.call_times:
            self.call_times[resource].append(time.time())
    
    def wait_time(self, resource: str) -> float:
        """Get time to wait before next call allowed."""
        
        if resource not in self.limits:
            return 0
        
        if self.can_call(resource):
            return 0
        
        limit = self.limits[resource]
        now = time.time()
        
        # Find oldest call
        oldest = min(self.call_times[resource])
        return (oldest + limit.period) - now


class CostController:
    """Control and track API costs."""
    
    def __init__(self, budget: CostBudget):
        self.budget = budget
        self.daily_spent = 0.0
        self.task_costs: Dict[str, float] = {}
        self.last_reset = time.time()
        self.cost_callbacks: List[Callable] = []
    
    def reset_daily(self):
        """Reset daily spending."""
        self.daily_spent = 0.0
        self.last_reset = time.time()
    
    def record_cost(self, task_id: str, cost: float, model: str = None):
        """Record cost for a task."""
        
        # Check if daily reset needed
        if time.time() - self.last_reset > 86400:
            self.reset_daily()
        
        # Record cost
        self.daily_spent += cost
        
        if task_id not in self.task_costs:
            self.task_costs[task_id] = 0.0
        self.task_costs[task_id] += cost
        
        # Check thresholds
        self._check_thresholds(task_id, cost)
    
    def _check_thresholds(self, task_id: str, cost: float):
        """Check if cost thresholds exceeded."""
        
        # Check daily budget
        if self.daily_spent > self.budget.daily_limit * self.budget.alert_threshold:
            self._alert("daily_budget_warning", {
                "spent": self.daily_spent,
                "limit": self.budget.daily_limit
            })
        
        if self.daily_spent > self.budget.daily_limit:
            self._alert("daily_budget_exceeded", {
                "spent": self.daily_spent,
                "limit": self.budget.daily_limit
            })
        
        # Check per-task budget
        task_total = self.task_costs.get(task_id, 0)
        if task_total > self.budget.per_task_limit:
            self._alert("task_budget_exceeded", {
                "task_id": task_id,
                "spent": task_total,
                "limit": self.budget.per_task_limit
            })
    
    def _alert(self, alert_type: str, data: Dict):
        """Send cost alert."""
        for callback in self.cost_callbacks:
            callback(alert_type, data)
    
    def can_spend(self, estimated_cost: float) -> bool:
        """Check if estimated cost is within budget."""
        
        # Check daily budget
        if self.daily_spent + estimated_cost > self.budget.daily_limit:
            return False
        
        return True
    
    def get_summary(self) -> Dict[str, Any]:
        """Get cost summary."""
        return {
            "daily_spent": self.daily_spent,
            "daily_limit": self.budget.daily_limit,
            "remaining": self.budget.daily_limit - self.daily_spent,
            "task_costs": self.task_costs,
            "most_expensive_tasks": sorted(
                self.task_costs.items(),
                key=lambda x: x[1],
                reverse=True
            )[:5]
        }


def rate_limited(resource: str, rate_limiter: RateLimiter):
    """Decorator for rate-limited functions."""
    def decorator(func: Callable):
        @wraps(func)
        def wrapper(*args, **kwargs):
            while not rate_limiter.can_call(resource):
                wait = rate_limiter.wait_time(resource)
                time.sleep(wait)
            
            rate_limiter.record_call(resource)
            return func(*args, **kwargs)
        return wrapper
    return decorator


def cost_tracked(task_id: str, cost_controller: CostController, cost_per_call: float = 0.01):
    """Decorator for cost-tracked functions."""
    def decorator(func: Callable):
        @wraps(func)
        def wrapper(*args, **kwargs):
            if not cost_controller.can_spend(cost_per_call):
                raise Exception("Cost budget exceeded")
            
            result = func(*args, **kwargs)
            cost_controller.record_cost(task_id, cost_per_call)
            return result
        return wrapper
    return decorator
```

---

### 5.3 Performance Optimization

```python
from typing import Dict, Any, List, Optional
from dataclasses import dataclass
from functools import lru_cache
import time
import hashlib
import json

@dataclass
class PerformanceMetrics:
    total_calls: int = 0
    total_time: float = 0.0
    cache_hits: int = 0
    cache_misses: int = 0
    errors: int = 0

class PerformanceOptimizer:
    """Optimize agent performance through caching and batching."""
    
    def __init__(self, cache_size: int = 1000):
        self.cache: Dict[str, Any] = {}
        self.cache_size = cache_size
        self.metrics = PerformanceMetrics()
        self.batch_queue: List[Dict] = []
        self.batch_size = 10
        self.batch_timeout = 1.0
    
    def cached_call(self, func: callable, *args, **kwargs) -> Any:
        """Execute function with caching."""
        
        # Generate cache key
        cache_key = self._generate_cache_key(func.__name__, args, kwargs)
        
        # Check cache
        if cache_key in self.cache:
            self.metrics.cache_hits += 1
            return self.cache[cache_key]
        
        self.metrics.cache_misses += 1
        
        # Execute function
        start = time.time()
        try:
            result = func(*args, **kwargs)
            self.metrics.total_calls += 1
            self.metrics.total_time += time.time() - start
            
            # Cache result
            self._cache_result(cache_key, result)
            
            return result
        except Exception as e:
            self.metrics.errors += 1
            raise
    
    def _generate_cache_key(self, func_name: str, args: tuple, kwargs: dict) -> str:
        """Generate cache key from function call."""
        key_data = {
            "func": func_name,
            "args": args,
            "kwargs": kwargs
        }
        key_str = json.dumps(key_data, sort_keys=True)
        return hashlib.md5(key_str.encode()).hexdigest()
    
    def _cache_result(self, key: str, result: Any):
        """Cache result with LRU eviction."""
        
        if len(self.cache) >= self.cache_size:
            # Remove oldest entry (simple FIFO)
            oldest = next(iter(self.cache))
            del self.cache[oldest]
        
        self.cache[key] = result
    
    def batch_call(self, item: Dict, batch_processor: callable) -> Any:
        """Add item to batch queue."""
        
        self.batch_queue.append(item)
        
        # Process batch if full
        if len(self.batch_queue) >= self.batch_size:
            return self._process_batch(batch_processor)
        
        # Or wait for timeout
        # (In real implementation, use async/await)
        return None
    
    def _process_batch(self, batch_processor: callable) -> List[Any]:
        """Process batch of items."""
        
        if not self.batch_queue:
            return []
        
        batch = self.batch_queue[:self.batch_size]
        self.batch_queue = self.batch_queue[self.batch_size:]
        
        start = time.time()
        results = batch_processor(batch)
        self.metrics.total_time += time.time() - start
        self.metrics.total_calls += 1
        
        return results
    
    def get_metrics(self) -> Dict[str, Any]:
        """Get performance metrics."""
        
        avg_time = self.metrics.total_time / max(self.metrics.total_calls, 1)
        cache_hit_rate = self.metrics.cache_hits / max(
            self.metrics.cache_hits + self.metrics.cache_misses, 1
        )
        
        return {
            "total_calls": self.metrics.total_calls,
            "average_time": avg_time,
            "cache_hit_rate": cache_hit_rate,
            "cache_hits": self.metrics.cache_hits,
            "cache_misses": self.metrics.cache_misses,
            "errors": self.metrics.errors,
            "cache_size": len(self.cache),
            "batch_queue_size": len(self.batch_queue)
        }
    
    def get_optimization_recommendations(self) -> List[str]:
        """Get optimization recommendations."""
        
        metrics = self.get_metrics()
        recommendations = []
        
        if metrics["cache_hit_rate"] < 0.3:
            recommendations.append("Cache hit rate is low. Consider increasing cache size or improving cache key generation.")
        
        if metrics["average_time"] > 2.0:
            recommendations.append("Average call time is high. Consider using faster models or implementing async processing.")
        
        if metrics["errors"] / max(metrics["total_calls"], 1) > 0.1:
            recommendations.append("Error rate is high. Review error handling and input validation.")
        
        return recommendations
```

---

### 5.4 Scalability Patterns Summary

| Pattern | Use Case | Implementation |
|---------|----------|----------------|
| **Horizontal Scaling** | Handle increased load | Agent pool with load balancer |
| **Caching** | Reduce redundant API calls | LRU cache with intelligent keys |
| **Batching** | Optimize API usage | Queue-based batch processor |
| **Async Processing** | Non-blocking operations | Async/await with task queues |
| **Circuit Breaker** | Handle service failures | Fail-fast with recovery logic |
| **Retry with Backoff** | Handle transient failures | Exponential backoff |
| **Request Coalescing** | Deduplicate concurrent requests | In-flight request tracking |

---

## CONCLUSION

This comprehensive guide provides the architectural foundation for building powerful autonomous agents like OpenClaw/ClawdBot. Key takeaways:

1. **Choose the right cognitive architecture** based on task complexity (ReAct for dynamic reasoning, Plan-and-Solve for structured tasks, Reflexion for learning)

2. **Implement multi-layer design** with clear separation between strategic, tactical, and operational concerns

3. **Design robust memory systems** that balance recency, relevance, and capacity constraints

4. **Use hierarchical planning** with proper error recovery and execution monitoring

5. **Orchestrate multiple agents** when tasks require parallelization or specialized expertise

6. **Build in scalability** from the start with resource management, rate limiting, and performance optimization

The most powerful agents combine these patterns intelligently, adapting their architecture to the specific demands of each task while maintaining robustness and efficiency.

---

*Generated for OpenClaw/ClawdBot Architecture Guide*
