# Skill Systems & Tool Integration Guide
## Building Powerful Autonomous Agents (OpenClaw/ClawdBot Architecture)

---

## Table of Contents
1. [Skill Architecture](#1-skill-architecture)
2. [Tool Integration Patterns](#2-tool-integration-patterns)
3. [Essential Skills for Productivity](#3-essential-skills-for-productivity)
4. [Money-Making Skills](#4-money-making-skills)
5. [Building Skills](#5-building-skills)
6. [Skill Discovery & Learning](#6-skill-discovery--learning)

---

## 1. SKILL ARCHITECTURE

### 1.1 Core Design Principles

A powerful agent needs a modular, extensible skill system that allows:
- **Dynamic loading**: Add/remove skills without restarting
- **Composability**: Chain skills together for complex workflows
- **Self-documentation**: Skills describe themselves
- **Versioning**: Track skill versions and compatibility
- **Sandboxing**: Isolate skill execution for security

### 1.2 Skill Schema Definition

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "Skill Definition Schema",
  "type": "object",
  "required": ["id", "name", "version", "description", "capabilities", "functions"],
  "properties": {
    "id": {
      "type": "string",
      "pattern": "^[a-z][a-z0-9_]*$",
      "description": "Unique identifier for the skill"
    },
    "name": {
      "type": "string",
      "description": "Human-readable name"
    },
    "version": {
      "type": "string",
      "pattern": "^\\d+\\.\\d+\\.\\d+$",
      "description": "Semantic version"
    },
    "description": {
      "type": "string",
      "description": "What this skill does"
    },
    "author": {
      "type": "string"
    },
    "capabilities": {
      "type": "array",
      "items": {
        "type": "string",
        "enum": ["web", "code", "file", "database", "api", "automation", "content", "analysis"]
      }
    },
    "dependencies": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "skill_id": {"type": "string"},
          "version_range": {"type": "string"}
        }
      }
    },
    "functions": {
      "type": "array",
      "items": {
        "$ref": "#/definitions/function"
      }
    },
    "config_schema": {
      "type": "object",
      "description": "JSON Schema for skill configuration"
    },
    "rate_limits": {
      "type": "object",
      "properties": {
        "requests_per_minute": {"type": "number"},
        "concurrent_executions": {"type": "number"}
      }
    }
  },
  "definitions": {
    "function": {
      "type": "object",
      "required": ["name", "description", "parameters"],
      "properties": {
        "name": {"type": "string"},
        "description": {"type": "string"},
        "parameters": {
          "type": "object",
          "properties": {
            "type": {"const": "object"},
            "properties": {"type": "object"},
            "required": {"type": "array", "items": {"type": "string"}}
          }
        },
        "returns": {
          "type": "object",
          "properties": {
            "type": {"type": "string"},
            "description": {"type": "string"}
          }
        },
        "examples": {
          "type": "array",
          "items": {
            "type": "object",
            "properties": {
              "input": {},
              "output": {},
              "description": {"type": "string"}
            }
          }
        }
      }
    }
  }
}
```

### 1.3 Skill Registration System

```python
# skill_registry.py
from typing import Dict, List, Optional, Callable, Any
from dataclasses import dataclass, field
from datetime import datetime
import json
import importlib
import inspect

@dataclass
class SkillFunction:
    """Represents a function within a skill"""
    name: str
    description: str
    parameters: Dict[str, Any]
    returns: Dict[str, Any]
    handler: Callable
    examples: List[Dict] = field(default_factory=list)
    
    def to_openai_schema(self) -> Dict:
        """Convert to OpenAI function calling format"""
        return {
            "type": "function",
            "function": {
                "name": self.name,
                "description": self.description,
                "parameters": self.parameters
            }
        }

@dataclass
class Skill:
    """Core skill class"""
    id: str
    name: str
    version: str
    description: str
    capabilities: List[str]
    functions: Dict[str, SkillFunction]
    dependencies: List[Dict] = field(default_factory=list)
    config: Dict = field(default_factory=dict)
    metadata: Dict = field(default_factory=dict)
    loaded_at: datetime = field(default_factory=datetime.now)
    
    def get_function(self, name: str) -> Optional[SkillFunction]:
        return self.functions.get(name)
    
    def list_capabilities(self) -> List[str]:
        return self.capabilities
    
    def to_schema(self) -> Dict:
        """Export skill as JSON schema"""
        return {
            "id": self.id,
            "name": self.name,
            "version": self.version,
            "description": self.description,
            "capabilities": self.capabilities,
            "functions": [
                {
                    "name": f.name,
                    "description": f.description,
                    "parameters": f.parameters,
                    "returns": f.returns,
                    "examples": f.examples
                }
                for f in self.functions.values()
            ],
            "dependencies": self.dependencies
        }

class SkillRegistry:
    """Central registry for all skills"""
    
    def __init__(self):
        self._skills: Dict[str, Skill] = {}
        self._capability_index: Dict[str, List[str]] = {}
        self._hooks: Dict[str, List[Callable]] = {
            "pre_register": [],
            "post_register": [],
            "pre_execute": [],
            "post_execute": []
        }
    
    def register(self, skill: Skill) -> bool:
        """Register a new skill"""
        # Run pre-register hooks
        for hook in self._hooks["pre_register"]:
            if not hook(skill):
                return False
        
        # Check dependencies
        for dep in skill.dependencies:
            if dep["skill_id"] not in self._skills:
                raise DependencyError(f"Missing dependency: {dep['skill_id']}")
        
        # Register skill
        self._skills[skill.id] = skill
        
        # Update capability index
        for cap in skill.capabilities:
            if cap not in self._capability_index:
                self._capability_index[cap] = []
            self._capability_index[cap].append(skill.id)
        
        # Run post-register hooks
        for hook in self._hooks["post_register"]:
            hook(skill)
        
        return True
    
    def unregister(self, skill_id: str) -> bool:
        """Remove a skill from registry"""
        if skill_id not in self._skills:
            return False
        
        skill = self._skills[skill_id]
        
        # Remove from capability index
        for cap in skill.capabilities:
            if cap in self._capability_index:
                self._capability_index[cap].remove(skill_id)
        
        del self._skills[skill_id]
        return True
    
    def get(self, skill_id: str) -> Optional[Skill]:
        """Get skill by ID"""
        return self._skills.get(skill_id)
    
    def find_by_capability(self, capability: str) -> List[Skill]:
        """Find all skills with a specific capability"""
        skill_ids = self._capability_index.get(capability, [])
        return [self._skills[sid] for sid in skill_ids if sid in self._skills]
    
    def search(self, query: str) -> List[Skill]:
        """Search skills by name, description, or capability"""
        results = []
        query = query.lower()
        for skill in self._skills.values():
            if (query in skill.name.lower() or 
                query in skill.description.lower() or
                any(query in cap for cap in skill.capabilities)):
                results.append(skill)
        return results
    
    def list_all(self) -> List[Skill]:
        """List all registered skills"""
        return list(self._skills.values())
    
    def get_all_functions(self) -> List[Dict]:
        """Get all functions in OpenAI format"""
        functions = []
        for skill in self._skills.values():
            for func in skill.functions.values():
                functions.append(func.to_openai_schema())
        return functions
    
    def add_hook(self, event: str, handler: Callable):
        """Add lifecycle hook"""
        if event in self._hooks:
            self._hooks[event].append(handler)
    
    async def execute(self, skill_id: str, function_name: str, **kwargs) -> Any:
        """Execute a skill function"""
        skill = self.get(skill_id)
        if not skill:
            raise SkillNotFoundError(f"Skill {skill_id} not found")
        
        func = skill.get_function(function_name)
        if not func:
            raise FunctionNotFoundError(f"Function {function_name} not found in {skill_id}")
        
        # Run pre-execute hooks
        context = {"skill_id": skill_id, "function": function_name, "args": kwargs}
        for hook in self._hooks["pre_execute"]:
            hook(context)
        
        # Execute
        result = await func.handler(**kwargs) if inspect.iscoroutinefunction(func.handler) else func.handler(**kwargs)
        
        # Run post-execute hooks
        context["result"] = result
        for hook in self._hooks["post_execute"]:
            hook(context)
        
        return result

# Exceptions
class DependencyError(Exception): pass
class SkillNotFoundError(Exception): pass
class FunctionNotFoundError(Exception): pass
```

### 1.4 Dynamic Skill Loading

```python
# skill_loader.py
import os
import json
import importlib.util
from pathlib import Path
from typing import Dict, List, Optional
import yaml

class SkillLoader:
    """Dynamic skill loader supporting multiple formats"""
    
    def __init__(self, registry: SkillRegistry):
        self.registry = registry
        self.load_paths: List[Path] = []
        self._watchers: Dict[str, Callable] = {}
    
    def add_path(self, path: str):
        """Add a directory to search for skills"""
        self.load_paths.append(Path(path))
    
    def load_from_directory(self, directory: str) -> List[Skill]:
        """Load all skills from a directory"""
        skills = []
        skill_dir = Path(directory)
        
        for skill_file in skill_dir.glob("**/skill.json"):
            try:
                skill = self._load_from_json(skill_file)
                if self.registry.register(skill):
                    skills.append(skill)
            except Exception as e:
                print(f"Failed to load skill from {skill_file}: {e}")
        
        for skill_file in skill_dir.glob("**/skill.yaml"):
            try:
                skill = self._load_from_yaml(skill_file)
                if self.registry.register(skill):
                    skills.append(skill)
            except Exception as e:
                print(f"Failed to load skill from {skill_file}: {e}")
        
        for skill_file in skill_dir.glob("**/*.py"):
            if skill_file.name != "__init__.py":
                try:
                    skill = self._load_from_python(skill_file)
                    if self.registry.register(skill):
                        skills.append(skill)
                except Exception as e:
                    print(f"Failed to load skill from {skill_file}: {e}")
        
        return skills
    
    def _load_from_json(self, path: Path) -> Skill:
        """Load skill from JSON definition"""
        with open(path) as f:
            definition = json.load(f)
        
        # Load implementation module
        module_path = path.parent / "implementation.py"
        functions = self._load_functions_from_module(module_path, definition["functions"])
        
        return Skill(
            id=definition["id"],
            name=definition["name"],
            version=definition["version"],
            description=definition["description"],
            capabilities=definition.get("capabilities", []),
            functions=functions,
            dependencies=definition.get("dependencies", [])
        )
    
    def _load_from_yaml(self, path: Path) -> Skill:
        """Load skill from YAML definition"""
        with open(path) as f:
            definition = yaml.safe_load(f)
        
        module_path = path.parent / "implementation.py"
        functions = self._load_functions_from_module(module_path, definition["functions"])
        
        return Skill(
            id=definition["id"],
            name=definition["name"],
            version=definition["version"],
            description=definition["description"],
            capabilities=definition.get("capabilities", []),
            functions=functions,
            dependencies=definition.get("dependencies", [])
        )
    
    def _load_from_python(self, path: Path) -> Skill:
        """Load skill from Python module with decorators"""
        spec = importlib.util.spec_from_file_location("skill_module", path)
        module = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(module)
        
        # Extract skill metadata from module
        skill_meta = getattr(module, "SKILL_METADATA", {})
        
        # Extract functions with @skill_function decorator
        functions = {}
        for name in dir(module):
            obj = getattr(module, name)
            if hasattr(obj, "_is_skill_function"):
                func_def = obj._skill_definition
                functions[func_def["name"]] = SkillFunction(
                    name=func_def["name"],
                    description=func_def["description"],
                    parameters=func_def["parameters"],
                    returns=func_def.get("returns", {"type": "any"}),
                    handler=obj,
                    examples=func_def.get("examples", [])
                )
        
        return Skill(
            id=skill_meta.get("id", path.stem),
            name=skill_meta.get("name", path.stem),
            version=skill_meta.get("version", "1.0.0"),
            description=skill_meta.get("description", ""),
            capabilities=skill_meta.get("capabilities", []),
            functions=functions,
            dependencies=skill_meta.get("dependencies", [])
        )
    
    def _load_functions_from_module(self, module_path: Path, function_defs: List[Dict]) -> Dict[str, SkillFunction]:
        """Load function handlers from Python module"""
        if not module_path.exists():
            raise FileNotFoundError(f"Implementation not found: {module_path}")
        
        spec = importlib.util.spec_from_file_location("impl_module", module_path)
        module = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(module)
        
        functions = {}
        for func_def in function_defs:
            handler = getattr(module, func_def["handler"], None)
            if not handler:
                raise ValueError(f"Handler {func_def['handler']} not found")
            
            functions[func_def["name"]] = SkillFunction(
                name=func_def["name"],
                description=func_def["description"],
                parameters=func_def["parameters"],
                returns=func_def.get("returns", {"type": "any"}),
                handler=handler,
                examples=func_def.get("examples", [])
            )
        
        return functions

# Decorator for Python-based skills
def skill_function(name: str = None, description: str = None, 
                   parameters: Dict = None, returns: Dict = None,
                   examples: List[Dict] = None):
    """Decorator to mark a function as a skill function"""
    def decorator(func):
        func._is_skill_function = True
        func._skill_definition = {
            "name": name or func.__name__,
            "description": description or func.__doc__ or "",
            "parameters": parameters or {"type": "object", "properties": {}},
            "returns": returns or {"type": "any"},
            "examples": examples or []
        }
        return func
    return decorator
```

---

## 2. TOOL INTEGRATION PATTERNS

### 2.1 Function Calling Best Practices

```python
# function_caller.py
from typing import Dict, List, Any, Optional, Callable
import json
import asyncio
from dataclasses import dataclass
from enum import Enum

class ToolSelectionStrategy(Enum):
    """Strategies for selecting which tool to use"""
    FIRST_MATCH = "first_match"
    BEST_MATCH = "best_match"
    ALL_MATCHING = "all_matching"
    SEQUENTIAL = "sequential"
    PARALLEL = "parallel"

@dataclass
class ToolCall:
    """Represents a tool call"""
    tool_name: str
    parameters: Dict[str, Any]
    call_id: Optional[str] = None
    priority: int = 0
    dependencies: List[str] = None
    
    def __post_init__(self):
        if self.dependencies is None:
            self.dependencies = []

@dataclass
class ToolResult:
    """Result of a tool execution"""
    tool_name: str
    success: bool
    result: Any
    error: Optional[str] = None
    execution_time: float = 0.0
    metadata: Dict = None
    
    def __post_init__(self):
        if self.metadata is None:
            self.metadata = {}

class FunctionCaller:
    """Advanced function calling system with multiple strategies"""
    
    def __init__(self, registry: SkillRegistry):
        self.registry = registry
        self._middleware: List[Callable] = []
        self._result_handlers: Dict[str, Callable] = {}
        self._execution_history: List[Dict] = []
    
    def add_middleware(self, middleware: Callable):
        """Add middleware to process calls"""
        self._middleware.append(middleware)
    
    def register_result_handler(self, tool_name: str, handler: Callable):
        """Register a custom result handler for a tool"""
        self._result_handlers[tool_name] = handler
    
    async def call(self, tool_call: ToolCall, context: Dict = None) -> ToolResult:
        """Execute a single tool call"""
        start_time = asyncio.get_event_loop().time()
        context = context or {}
        
        try:
            # Apply middleware
            for middleware in self._middleware:
                tool_call = await middleware(tool_call, context)
            
            # Parse tool name (format: skill_id.function_name)
            if "." in tool_call.tool_name:
                skill_id, func_name = tool_call.tool_name.split(".", 1)
            else:
                # Search for tool across all skills
                skill_id, func_name = await self._find_tool(tool_call.tool_name)
            
            # Execute
            result = await self.registry.execute(skill_id, func_name, **tool_call.parameters)
            
            execution_time = asyncio.get_event_loop().time() - start_time
            
            # Apply result handler if registered
            if tool_call.tool_name in self._result_handlers:
                result = self._result_handlers[tool_call.tool_name](result)
            
            tool_result = ToolResult(
                tool_name=tool_call.tool_name,
                success=True,
                result=result,
                execution_time=execution_time
            )
            
        except Exception as e:
            execution_time = asyncio.get_event_loop().time() - start_time
            tool_result = ToolResult(
                tool_name=tool_call.tool_name,
                success=False,
                result=None,
                error=str(e),
                execution_time=execution_time
            )
        
        # Record in history
        self._execution_history.append({
            "call": tool_call,
            "result": tool_result,
            "context": context
        })
        
        return tool_result
    
    async def call_multiple(self, tool_calls: List[ToolCall], 
                           strategy: ToolSelectionStrategy = ToolSelectionStrategy.SEQUENTIAL,
                           context: Dict = None) -> List[ToolResult]:
        """Execute multiple tool calls with a strategy"""
        
        if strategy == ToolSelectionStrategy.SEQUENTIAL:
            results = []
            for call in sorted(tool_calls, key=lambda x: x.priority, reverse=True):
                result = await self.call(call, context)
                results.append(result)
                # Update context with result for next calls
                context = context or {}
                context[f"result_{call.tool_name}"] = result.result
            return results
        
        elif strategy == ToolSelectionStrategy.PARALLEL:
            # Group by dependencies
            independent = [c for c in tool_calls if not c.dependencies]
            dependent = [c for c in tool_calls if c.dependencies]
            
            # Execute independent calls in parallel
            tasks = [self.call(c, context) for c in independent]
            results = await asyncio.gather(*tasks, return_exceptions=True)
            
            # Execute dependent calls
            for call in dependent:
                deps_satisfied = all(
                    any(r.tool_name == dep and r.success for r in results if isinstance(r, ToolResult))
                    for dep in call.dependencies
                )
                if deps_satisfied:
                    result = await self.call(call, context)
                    results.append(result)
            
            return [r for r in results if isinstance(r, ToolResult)]
        
        elif strategy == ToolSelectionStrategy.BEST_MATCH:
            # Score and select best
            scored = []
            for call in tool_calls:
                score = await self._score_tool_match(call, context)
                scored.append((score, call))
            
            best = max(scored, key=lambda x: x[0])
            return [await self.call(best[1], context)]
        
        else:
            raise ValueError(f"Unknown strategy: {strategy}")
    
    async def _find_tool(self, tool_name: str) -> tuple:
        """Find skill and function for a tool name"""
        for skill in self.registry.list_all():
            if tool_name in skill.functions:
                return skill.id, tool_name
            # Check if it's a partial match
            for func_name in skill.functions:
                if tool_name in func_name or func_name in tool_name:
                    return skill.id, func_name
        raise FunctionNotFoundError(f"Tool {tool_name} not found")
    
    async def _score_tool_match(self, tool_call: ToolCall, context: Dict) -> float:
        """Score how well a tool matches the context"""
        score = 0.0
        
        # Check parameter completeness
        skill_id, func_name = await self._find_tool(tool_call.tool_name)
        skill = self.registry.get(skill_id)
        func = skill.get_function(func_name)
        
        required_params = func.parameters.get("required", [])
        provided_params = set(tool_call.parameters.keys())
        
        if all(p in provided_params for p in required_params):
            score += 1.0
        else:
            score += len(provided_params & set(required_params)) / len(required_params)
        
        # Check context relevance
        if context:
            # Boost score if tool name appears in context
            context_str = json.dumps(context).lower()
            if tool_call.tool_name.lower() in context_str:
                score += 0.5
        
        return score
    
    def get_history(self) -> List[Dict]:
        """Get execution history"""
        return self._execution_history
    
    def clear_history(self):
        """Clear execution history"""
        self._execution_history = []
```

### 2.2 API Integration Strategies

```python
# api_integrations.py
import aiohttp
import asyncio
from typing import Dict, Any, Optional, List
from dataclasses import dataclass
from datetime import datetime, timedelta
import json

@dataclass
class APIConfig:
    """Configuration for API integration"""
    base_url: str
    headers: Dict[str, str] = None
    timeout: int = 30
    retries: int = 3
    rate_limit: int = 60  # requests per minute
    auth_type: str = "none"  # none, bearer, api_key, oauth
    auth_config: Dict = None
    
    def __post_init__(self):
        if self.headers is None:
            self.headers = {}
        if self.auth_config is None:
            self.auth_config = {}

class APIClient:
    """Generic API client with built-in features"""
    
    def __init__(self, config: APIConfig):
        self.config = config
        self._session: Optional[aiohttp.ClientSession] = None
        self._request_times: List[datetime] = []
        self._cache: Dict[str, Any] = {}
        self._cache_ttl: int = 300  # 5 minutes
    
    async def __aenter__(self):
        self._session = aiohttp.ClientSession(
            headers=self.config.headers,
            timeout=aiohttp.ClientTimeout(total=self.config.timeout)
        )
        return self
    
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        if self._session:
            await self._session.close()
    
    async def request(self, method: str, endpoint: str, 
                     params: Dict = None, data: Dict = None,
                     use_cache: bool = False, cache_key: str = None) -> Dict:
        """Make an API request with retries and rate limiting"""
        
        # Check cache
        if use_cache and cache_key:
            cached = self._get_cache(cache_key)
            if cached:
                return cached
        
        # Rate limiting
        await self._apply_rate_limit()
        
        url = f"{self.config.base_url}{endpoint}"
        
        # Apply authentication
        headers = await self._get_auth_headers()
        
        for attempt in range(self.config.retries):
            try:
                async with self._session.request(
                    method, url, params=params, json=data, headers=headers
                ) as response:
                    self._request_times.append(datetime.now())
                    
                    if response.status == 429:  # Rate limited
                        retry_after = int(response.headers.get("Retry-After", 60))
                        await asyncio.sleep(retry_after)
                        continue
                    
                    response.raise_for_status()
                    result = await response.json()
                    
                    # Cache result
                    if use_cache and cache_key:
                        self._set_cache(cache_key, result)
                    
                    return result
                    
            except aiohttp.ClientError as e:
                if attempt == self.config.retries - 1:
                    raise APIError(f"API request failed after {self.config.retries} attempts: {e}")
                await asyncio.sleep(2 ** attempt)  # Exponential backoff
        
        raise APIError("Unexpected end of retry loop")
    
    async def get(self, endpoint: str, **kwargs) -> Dict:
        return await self.request("GET", endpoint, **kwargs)
    
    async def post(self, endpoint: str, **kwargs) -> Dict:
        return await self.request("POST", endpoint, **kwargs)
    
    async def put(self, endpoint: str, **kwargs) -> Dict:
        return await self.request("PUT", endpoint, **kwargs)
    
    async def delete(self, endpoint: str, **kwargs) -> Dict:
        return await self.request("DELETE", endpoint, **kwargs)
    
    async def _apply_rate_limit(self):
        """Apply rate limiting"""
        now = datetime.now()
        minute_ago = now - timedelta(minutes=1)
        
        # Remove old requests
        self._request_times = [t for t in self._request_times if t > minute_ago]
        
        # Check if we're at the limit
        if len(self._request_times) >= self.config.rate_limit:
            sleep_time = 60 - (now - self._request_times[0]).total_seconds()
            if sleep_time > 0:
                await asyncio.sleep(sleep_time)
    
    async def _get_auth_headers(self) -> Dict[str, str]:
        """Get authentication headers"""
        headers = {}
        
        if self.config.auth_type == "bearer":
            token = self.config.auth_config.get("token")
            headers["Authorization"] = f"Bearer {token}"
        
        elif self.config.auth_type == "api_key":
            key = self.config.auth_config.get("key")
            header_name = self.config.auth_config.get("header", "X-API-Key")
            headers[header_name] = key
        
        elif self.config.auth_type == "oauth":
            token = await self._get_oauth_token()
            headers["Authorization"] = f"Bearer {token}"
        
        return headers
    
    async def _get_oauth_token(self) -> str:
        """Get OAuth token (implement based on your OAuth flow)"""
        return self.config.auth_config.get("access_token", "")
    
    def _get_cache(self, key: str) -> Optional[Any]:
        """Get cached value"""
        if key in self._cache:
            value, timestamp = self._cache[key]
            if datetime.now().timestamp() - timestamp < self._cache_ttl:
                return value
            del self._cache[key]
        return None
    
    def _set_cache(self, key: str, value: Any):
        """Set cached value"""
        self._cache[key] = (value, datetime.now().timestamp())

class APIError(Exception): pass

# Pre-built API integrations
class GitHubAPI(APIClient):
    """GitHub API client"""
    
    def __init__(self, token: str):
        config = APIConfig(
            base_url="https://api.github.com",
            headers={
                "Accept": "application/vnd.github.v3+json",
                "User-Agent": "ClawdBot/1.0"
            },
            auth_type="bearer",
            auth_config={"token": token},
            rate_limit=5000
        )
        super().__init__(config)
    
    async def get_repo(self, owner: str, repo: str) -> Dict:
        return await self.get(f"/repos/{owner}/{repo}")
    
    async def create_issue(self, owner: str, repo: str, title: str, 
                          body: str = None, labels: List[str] = None) -> Dict:
        return await self.post(
            f"/repos/{owner}/{repo}/issues",
            data={"title": title, "body": body, "labels": labels or []}
        )

class StripeAPI(APIClient):
    """Stripe API client for payment processing"""
    
    def __init__(self, api_key: str):
        config = APIConfig(
            base_url="https://api.stripe.com/v1",
            auth_type="bearer",
            auth_config={"token": api_key},
            rate_limit=100
        )
        super().__init__(config)
    
    async def create_customer(self, email: str, name: str = None) -> Dict:
        return await self.post("/customers", data={"email": email, "name": name})
    
    async def create_payment_intent(self, amount: int, currency: str = "usd",
                                   customer: str = None) -> Dict:
        data = {"amount": amount, "currency": currency}
        if customer:
            data["customer"] = customer
        return await self.post("/payment_intents", data=data)
```

### 2.3 Tool Composition & Chaining

```python
# tool_composition.py
from typing import List, Dict, Any, Callable, Optional
from dataclasses import dataclass, field
import asyncio
from enum import Enum

class ChainType(Enum):
    SEQUENTIAL = "sequential"
    PARALLEL = "parallel"
    CONDITIONAL = "conditional"
    LOOP = "loop"
    BRANCH = "branch"

@dataclass
class ChainStep:
    """A step in a tool chain"""
    name: str
    tool_call: ToolCall
    condition: Optional[Callable] = None
    transform: Optional[Callable] = None
    error_handler: Optional[Callable] = None
    retry_count: int = 0

@dataclass
class ChainResult:
    """Result of executing a chain"""
    success: bool
    steps: List[Dict]
    final_output: Any
    execution_time: float
    errors: List[str] = field(default_factory=list)

class ToolChain:
    """Build and execute tool chains"""
    
    def __init__(self, caller: FunctionCaller):
        self.caller = caller
        self.steps: List[ChainStep] = []
        self.chain_type: ChainType = ChainType.SEQUENTIAL
        self._variables: Dict[str, Any] = {}
    
    def add_step(self, step: ChainStep) -> 'ToolChain':
        """Add a step to the chain (fluent interface)"""
        self.steps.append(step)
        return self
    
    def sequential(self) -> 'ToolChain':
        self.chain_type = ChainType.SEQUENTIAL
        return self
    
    def parallel(self) -> 'ToolChain':
        self.chain_type = ChainType.PARALLEL
        return self
    
    async def execute(self, initial_input: Dict = None) -> ChainResult:
        """Execute the chain"""
        start_time = asyncio.get_event_loop().time()
        step_results = []
        errors = []
        
        try:
            if self.chain_type == ChainType.SEQUENTIAL:
                result = await self._execute_sequential(initial_input, step_results, errors)
            elif self.chain_type == ChainType.PARALLEL:
                result = await self._execute_parallel(initial_input, step_results, errors)
            else:
                raise ValueError(f"Unknown chain type: {self.chain_type}")
            
            execution_time = asyncio.get_event_loop().time() - start_time
            
            return ChainResult(
                success=len(errors) == 0,
                steps=step_results,
                final_output=result,
                execution_time=execution_time,
                errors=errors
            )
            
        except Exception as e:
            execution_time = asyncio.get_event_loop().time() - start_time
            return ChainResult(
                success=False,
                steps=step_results,
                final_output=None,
                execution_time=execution_time,
                errors=errors + [str(e)]
            )
    
    async def _execute_sequential(self, initial_input: Dict, 
                                   step_results: List[Dict], 
                                   errors: List[str]) -> Any:
        """Execute steps sequentially"""
        current_input = initial_input or {}
        
        for step in self.steps:
            try:
                params = {**current_input, **step.tool_call.parameters}
                tool_call = ToolCall(
                    tool_name=step.tool_call.tool_name,
                    parameters=params,
                    call_id=step.tool_call.call_id
                )
                
                result = await self._execute_with_retry(step, tool_call)
                
                if step.transform:
                    result.result = step.transform(result.result)
                
                step_results.append({
                    "step": step.name,
                    "success": result.success,
                    "result": result.result
                })
                
                if not result.success:
                    errors.append(f"Step {step.name} failed: {result.error}")
                    if step.error_handler:
                        current_input = step.error_handler(result.error)
                    else:
                        break
                else:
                    current_input = {"previous_result": result.result}
                    self._variables[step.name] = result.result
                    
            except Exception as e:
                errors.append(f"Step {step.name} exception: {str(e)}")
                break
        
        return current_input.get("previous_result")
    
    async def _execute_parallel(self, initial_input: Dict,
                                 step_results: List[Dict],
                                 errors: List[str]) -> List[Any]:
        """Execute steps in parallel"""
        tasks = []
        
        for step in self.steps:
            params = {**(initial_input or {}), **step.tool_call.parameters}
            tool_call = ToolCall(
                tool_name=step.tool_call.tool_name,
                parameters=params
            )
            tasks.append(self._execute_step_async(step, tool_call, step_results))
        
        results = await asyncio.gather(*tasks, return_exceptions=True)
        
        for i, result in enumerate(results):
            if isinstance(result, Exception):
                errors.append(f"Step {self.steps[i].name} failed: {str(result)}")
        
        return [r for r in results if not isinstance(r, Exception)]
    
    async def _execute_with_retry(self, step: ChainStep, tool_call: ToolCall) -> ToolResult:
        """Execute a step with retry logic"""
        for attempt in range(step.retry_count + 1):
            result = await self.caller.call(tool_call)
            if result.success or attempt == step.retry_count:
                return result
            await asyncio.sleep(2 ** attempt)
        return result
    
    async def _execute_step_async(self, step: ChainStep, tool_call: ToolCall,
                                   step_results: List[Dict]) -> ToolResult:
        """Execute a step asynchronously"""
        result = await self._execute_with_retry(step, tool_call)
        step_results.append({
            "step": step.name,
            "success": result.success,
            "result": result.result
        })
        return result

# Pre-built workflow chains
class WorkflowChains:
    """Pre-built workflow chains"""
    
    def __init__(self, caller: FunctionCaller):
        self.caller = caller
    
    def research_and_summarize(self, query: str) -> ToolChain:
        """Chain: Research topic and summarize findings"""
        return (
            ToolChain(self.caller)
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
```

---

## 3. ESSENTIAL SKILLS FOR PRODUCTIVITY

### 3.1 Web Browsing & Data Extraction

```python
# skills/web_browsing/skill.py
SKILL_METADATA = {
    "id": "web_browsing",
    "name": "Web Browsing",
    "version": "2.0.0",
    "description": "Browse websites and extract data",
    "capabilities": ["web", "research", "data_extraction"]
}

from playwright.async_api import async_playwright
from bs4 import BeautifulSoup
import asyncio
from typing import List, Dict, Optional
import re

class WebBrowser:
    """Advanced web browser with extraction capabilities"""
    
    def __init__(self):
        self.playwright = None
        self.browser = None
        self.context = None
        self.page = None
    
    async def __aenter__(self):
        self.playwright = await async_playwright().start()
        self.browser = await self.playwright.chromium.launch(headless=True)
        self.context = await self.browser.new_context(
            viewport={"width": 1920, "height": 1080},
            user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
        )
        self.page = await self.context.new_page()
        return self
    
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        if self.browser:
            await self.browser.close()
        if self.playwright:
            await self.playwright.stop()
    
    async def navigate(self, url: str, wait_for: str = None, timeout: int = 30000) -> Dict:
        """Navigate to a URL"""
        response = await self.page.goto(url, wait_until="networkidle", timeout=timeout)
        
        if wait_for:
            await self.page.wait_for_selector(wait_for, timeout=timeout)
        
        return {
            "url": self.page.url,
            "title": await self.page.title(),
            "status": response.status if response else None,
            "content": await self.page.content()
        }
    
    async def extract_text(self, selector: str = None) -> str:
        """Extract text from page"""
        if selector:
            elements = await self.page.query_selector_all(selector)
            texts = []
            for el in elements:
                text = await el.text_content()
                if text:
                    texts.append(text.strip())
            return "\n".join(texts)
        else:
            return await self.page.evaluate("() => document.body.innerText")
    
    async def extract_links(self, pattern: str = None) -> List[Dict]:
        """Extract all links from page"""
        links = await self.page.evaluate("""
            () => Array.from(document.querySelectorAll('a')).map(a => ({
                text: a.textContent.trim(),
                href: a.href,
                title: a.title
            }))
        """)
        
        if pattern:
            regex = re.compile(pattern)
            links = [l for l in links if regex.search(l.get("href", ""))]
        
        return links
    
    async def extract_table(self, selector: str) -> List[Dict]:
        """Extract table data"""
        table = await self.page.query_selector(selector)
        if not table:
            return []
        
        html = await table.evaluate("el => el.outerHTML")
        soup = BeautifulSoup(html, 'html.parser')
        
        rows = []
        headers = []
        
        header_row = soup.find('thead')
        if header_row:
            headers = [th.get_text(strip=True) for th in header_row.find_all(['th', 'td'])]
        
        for tr in soup.find_all('tr'):
            cells = tr.find_all(['td', 'th'])
            if cells:
                if not headers:
                    headers = [cell.get_text(strip=True) for cell in cells]
                else:
                    row_data = {}
                    for i, cell in enumerate(cells):
                        key = headers[i] if i < len(headers) else f"col_{i}"
                        row_data[key] = cell.get_text(strip=True)
                    rows.append(row_data)
        
        return rows
    
    async def scroll_to_bottom(self) -> None:
        """Scroll to bottom of page"""
        await self.page.evaluate("""
            async () => {
                await new Promise((resolve) => {
                    let totalHeight = 0;
                    const distance = 100;
                    const timer = setInterval(() => {
                        const scrollHeight = document.body.scrollHeight;
                        window.scrollBy(0, distance);
                        totalHeight += distance;
                        if (totalHeight >= scrollHeight) {
                            clearInterval(timer);
                            resolve();
                        }
                    }, 100);
                });
            }
        """)

# Skill functions
browser_instance: Optional[WebBrowser] = None

@skill_function(
    name="navigate",
    description="Navigate to a URL",
    parameters={
        "type": "object",
        "properties": {
            "url": {"type": "string", "description": "URL to navigate to"},
            "wait_for": {"type": "string", "description": "CSS selector to wait for"}
        },
        "required": ["url"]
    }
)
async def navigate(url: str, wait_for: str = None) -> Dict:
    global browser_instance
    if not browser_instance:
        browser_instance = WebBrowser()
        await browser_instance.__aenter__()
    
    return await browser_instance.navigate(url, wait_for)

@skill_function(
    name="extract_text",
    description="Extract text from the current page",
    parameters={
        "type": "object",
        "properties": {
            "selector": {"type": "string", "description": "CSS selector to extract from"}
        }
    }
)
async def extract_text(selector: str = None) -> str:
    global browser_instance
    if not browser_instance:
        raise RuntimeError("Browser not initialized. Call navigate first.")
    return await browser_instance.extract_text(selector)
```

### 3.2 Code Execution & Development

```python
# skills/code_execution/skill.py
SKILL_METADATA = {
    "id": "code_execution",
    "name": "Code Execution",
    "version": "2.1.0",
    "description": "Execute code safely in isolated environments",
    "capabilities": ["code", "execution", "development"]
}

import subprocess
import tempfile
import os
import json
from typing import Dict, List, Any, Optional
import asyncio
from pathlib import Path

class CodeExecutor:
    """Secure code execution environment"""
    
    SUPPORTED_LANGUAGES = {
        "python": {"extension": ".py", "command": "python3"},
        "javascript": {"extension": ".js", "command": "node"},
        "typescript": {"extension": ".ts", "command": "ts-node"},
        "bash": {"extension": ".sh", "command": "bash"},
        "rust": {"extension": ".rs", "command": "rustc"},
        "go": {"extension": ".go", "command": "go run"}
    }
    
    def __init__(self, timeout: int = 30):
        self.timeout = timeout
        self.execution_history: List[Dict] = []
    
    async def execute(self, code: str, language: str, 
                     inputs: List[str] = None) -> Dict:
        """Execute code in isolated environment"""
        if language not in self.SUPPORTED_LANGUAGES:
            raise ValueError(f"Unsupported language: {language}")
        
        lang_config = self.SUPPORTED_LANGUAGES[language]
        
        with tempfile.TemporaryDirectory() as tmpdir:
            code_file = os.path.join(tmpdir, f"main{lang_config['extension']}")
            with open(code_file, 'w') as f:
                f.write(code)
            
            input_data = "\n".join(inputs) if inputs else ""
            
            try:
                proc = await asyncio.create_subprocess_exec(
                    lang_config['command'], code_file,
                    stdin=asyncio.subprocess.PIPE if input_data else None,
                    stdout=asyncio.subprocess.PIPE,
                    stderr=asyncio.subprocess.PIPE
                )
                
                stdout, stderr = await asyncio.wait_for(
                    proc.communicate(input=input_data.encode() if input_data else None),
                    timeout=self.timeout
                )
                
                execution_result = {
                    "success": proc.returncode == 0,
                    "exit_code": proc.returncode,
                    "stdout": stdout.decode('utf-8'),
                    "stderr": stderr.decode('utf-8'),
                    "language": lang_config['command']
                }
                
                self.execution_history.append(execution_result)
                return execution_result
                
            except asyncio.TimeoutError:
                proc.kill()
                return {"success": False, "error": "Execution timeout"}
            except Exception as e:
                return {"success": False, "error": str(e)}

# Skill functions
executor = CodeExecutor()

@skill_function(
    name="execute",
    description="Execute code in a secure environment",
    parameters={
        "type": "object",
        "properties": {
            "code": {"type": "string", "description": "Code to execute"},
            "language": {
                "type": "string",
                "enum": ["python", "javascript", "typescript", "bash", "rust", "go"]
            },
            "inputs": {"type": "array", "items": {"type": "string"}},
            "timeout": {"type": "integer", "default": 30}
        },
        "required": ["code", "language"]
    }
)
async def execute_code(code: str, language: str, inputs: List[str] = None, timeout: int = 30) -> Dict:
    executor.timeout = timeout
    return await executor.execute(code, language, inputs)

@skill_function(
    name="run_tests",
    description="Run tests for a project",
    parameters={
        "type": "object",
        "properties": {
            "project_path": {"type": "string"},
            "test_command": {"type": "string"}
        },
        "required": ["project_path"]
    }
)
async def run_tests(project_path: str, test_command: str = None) -> Dict:
    if not test_command:
        if os.path.exists(os.path.join(project_path, "pytest.ini")):
            test_command = "pytest"
        elif os.path.exists(os.path.join(project_path, "package.json")):
            test_command = "npm test"
        else:
            return {"success": False, "error": "Could not auto-detect test command"}
    
    proc = await asyncio.create_subprocess_shell(
        f"cd {project_path} && {test_command}",
        stdout=asyncio.subprocess.PIPE,
        stderr=asyncio.subprocess.PIPE
    )
    
    stdout, stderr = await proc.communicate()
    
    return {
        "success": proc.returncode == 0,
        "stdout": stdout.decode(),
        "stderr": stderr.decode()
    }
```

### 3.3 File System Operations

```python
# skills/file_system/skill.py
SKILL_METADATA = {
    "id": "file_system",
    "name": "File System Operations",
    "version": "1.5.0",
    "description": "Read, write, and manage files and directories",
    "capabilities": ["file", "storage"]
}

import os
import shutil
import json
from pathlib import Path
from typing import List, Dict, Optional
import hashlib
import mimetypes
from datetime import datetime

class FileManager:
    """Advanced file system manager"""
    
    def __init__(self, base_path: str = None, allowed_paths: List[str] = None):
        self.base_path = Path(base_path) if base_path else Path.cwd()
        self.allowed_paths = [Path(p) for p in (allowed_paths or [])]
        self.operation_log: List[Dict] = []
    
    def _resolve_path(self, path: str) -> Path:
        """Resolve and validate path"""
        resolved = (self.base_path / path).resolve()
        
        if self.allowed_paths:
            if not any(self._is_subpath(resolved, allowed) for allowed in self.allowed_paths):
                raise PermissionError(f"Path {path} is not in allowed paths")
        
        return resolved
    
    def _is_subpath(self, path: Path, parent: Path) -> bool:
        try:
            path.relative_to(parent)
            return True
        except ValueError:
            return False
    
    def read(self, path: str, offset: int = 0, limit: int = None) -> Dict:
        """Read a file"""
        resolved = self._resolve_path(path)
        
        if not resolved.exists():
            raise FileNotFoundError(f"File not found: {path}")
        
        if resolved.is_dir():
            raise IsADirectoryError(f"Path is a directory: {path}")
        
        try:
            with open(resolved, 'r', encoding='utf-8') as f:
                if offset > 0:
                    f.seek(offset)
                
                content = f.read(limit) if limit else f.read()
            
            return {
                "content": content,
                "path": str(resolved),
                "size": resolved.stat().st_size,
                "encoding": "utf-8",
                "mimetype": mimetypes.guess_type(str(resolved))[0] or "text/plain"
            }
        except UnicodeDecodeError:
            with open(resolved, 'rb') as f:
                content = f.read()
            
            return {
                "content": content.hex(),
                "path": str(resolved),
                "size": len(content),
                "encoding": "hex",
                "mimetype": mimetypes.guess_type(str(resolved))[0] or "application/octet-stream"
            }
    
    def write(self, path: str, content: str, append: bool = False) -> Dict:
        """Write to a file"""
        resolved = self._resolve_path(path)
        resolved.parent.mkdir(parents=True, exist_ok=True)
        
        mode = 'a' if append else 'w'
        with open(resolved, mode, encoding='utf-8') as f:
            f.write(content)
        
        return {
            "path": str(resolved),
            "bytes_written": len(content.encode('utf-8')),
            "operation": "append" if append else "write"
        }
    
    def list_directory(self, path: str = ".", recursive: bool = False) -> Dict:
        """List directory contents"""
        resolved = self._resolve_path(path)
        
        if not resolved.exists():
            raise FileNotFoundError(f"Directory not found: {path}")
        
        items = []
        
        if recursive:
            for item in resolved.rglob("*"):
                items.append(self._get_file_info(item))
        else:
            for item in resolved.iterdir():
                items.append(self._get_file_info(item))
        
        return {
            "path": str(resolved),
            "items": items,
            "count": len(items)
        }
    
    def _get_file_info(self, path: Path) -> Dict:
        stat = path.stat()
        return {
            "name": path.name,
            "path": str(path),
            "type": "directory" if path.is_dir() else "file",
            "size": stat.st_size,
            "modified": datetime.fromtimestamp(stat.st_mtime).isoformat(),
            "created": datetime.fromtimestamp(stat.st_ctime).isoformat(),
            "mimetype": mimetypes.guess_type(str(path))[0] if path.is_file() else None
        }
    
    def search(self, pattern: str, path: str = ".", 
              file_only: bool = False, content_search: bool = False) -> List[Dict]:
        """Search for files matching pattern"""
        resolved = self._resolve_path(path)
        results = []
        
        import fnmatch
        
        for item in resolved.rglob("*"):
            if fnmatch.fnmatch(item.name, pattern):
                if file_only and item.is_dir():
                    continue
                
                info = self._get_file_info(item)
                
                if content_search and item.is_file():
                    try:
                        with open(item, 'r', encoding='utf-8') as f:
                            info["content_preview"] = f.read()[:500]
                    except:
                        pass
                
                results.append(info)
        
        return results

# Skill functions
file_manager = FileManager()

@skill_function(
    name="read",
    description="Read a file",
    parameters={
        "type": "object",
        "properties": {
            "path": {"type": "string"},
            "offset": {"type": "integer", "default": 0},
            "limit": {"type": "integer"}
        },
        "required": ["path"]
    }
)
def read_file(path: str, offset: int = 0, limit: int = None) -> Dict:
    return file_manager.read(path, offset, limit)

@skill_function(
    name="write",
    description="Write to a file",
    parameters={
        "type": "object",
        "properties": {
            "path": {"type": "string"},
            "content": {"type": "string"},
            "append": {"type": "boolean", "default": False}
        },
        "required": ["path", "content"]
    }
)
def write_file(path: str, content: str, append: bool = False) -> Dict:
    return file_manager.write(path, content, append)

@skill_function(
    name="search",
    description="Search for files",
    parameters={
        "type": "object",
        "properties": {
            "pattern": {"type": "string"},
            "path": {"type": "string", "default": "."},
            "file_only": {"type": "boolean", "default": False},
            "content_search": {"type": "boolean", "default": False}
        },
        "required": ["pattern"]
    }
)
def search_files(pattern: str, path: str = ".", file_only: bool = False, content_search: bool = False) -> List[Dict]:
    return file_manager.search(pattern, path, file_only, content_search)
```

### 3.4 Database Interactions

```python
# skills/database/skill.py
SKILL_METADATA = {
    "id": "database",
    "name": "Database Operations",
    "version": "1.3.0",
    "description": "Interact with databases",
    "capabilities": ["database", "storage", "data"]
}

import sqlite3
import asyncio
from typing import List, Dict, Any, Optional
from dataclasses import dataclass

@dataclass
class DatabaseConfig:
    db_type: str
    connection_string: str

class DatabaseManager:
    """Universal database manager"""
    
    def __init__(self):
        self.connections: Dict[str, Any] = {}
        self.configs: Dict[str, DatabaseConfig] = {}
    
    def connect(self, name: str, config: DatabaseConfig) -> bool:
        """Establish database connection"""
        try:
            if config.db_type == "sqlite":
                conn = sqlite3.connect(config.connection_string)
                conn.row_factory = sqlite3.Row
                self.connections[name] = conn
            
            self.configs[name] = config
            return True
            
        except Exception as e:
            print(f"Failed to connect to {name}: {e}")
            return False
    
    def query(self, connection_name: str, sql: str, 
             parameters: List = None) -> List[Dict]:
        """Execute a SELECT query"""
        if connection_name not in self.connections:
            raise ValueError(f"Connection {connection_name} not found")
        
        conn = self.connections[connection_name]
        
        cursor = conn.cursor()
        if parameters:
            cursor.execute(sql, parameters)
        else:
            cursor.execute(sql)
        
        columns = [description[0] for description in cursor.description]
        results = []
        for row in cursor.fetchall():
            results.append(dict(zip(columns, row)))
        return results
    
    def execute(self, connection_name: str, sql: str,
               parameters: List = None) -> Dict:
        """Execute an INSERT, UPDATE, or DELETE"""
        if connection_name not in self.connections:
            raise ValueError(f"Connection {connection_name} not found")
        
        conn = self.connections[connection_name]
        cursor = conn.cursor()
        
        if parameters:
            cursor.execute(sql, parameters)
        else:
            cursor.execute(sql)
        
        conn.commit()
        
        return {
            "rows_affected": cursor.rowcount,
            "last_row_id": cursor.lastrowid
        }
    
    def get_schema(self, connection_name: str) -> List[Dict]:
        """Get database schema"""
        if connection_name not in self.connections:
            raise ValueError(f"Connection {connection_name} not found")
        
        conn = self.connections[connection_name]
        config = self.configs[connection_name]
        
        if config.db_type == "sqlite":
            cursor = conn.cursor()
            cursor.execute("SELECT name FROM sqlite_master WHERE type='table'")
            tables = cursor.fetchall()
            
            schema = []
            for (table_name,) in tables:
                cursor.execute(f"PRAGMA table_info({table_name})")
                columns = cursor.fetchall()
                schema.append({
                    "table": table_name,
                    "columns": [{"name": c[1], "type": c[2]} for c in columns]
                })
            return schema
        
        return []

# Skill functions
db_manager = DatabaseManager()

@skill_function(
    name="connect",
    description="Connect to a database",
    parameters={
        "type": "object",
        "properties": {
            "name": {"type": "string"},
            "db_type": {"type": "string", "enum": ["sqlite", "postgresql", "mysql"]},
            "connection_string": {"type": "string"}
        },
        "required": ["name", "db_type", "connection_string"]
    }
)
def connect_database(name: str, db_type: str, connection_string: str) -> bool:
    config = DatabaseConfig(db_type=db_type, connection_string=connection_string)
    return db_manager.connect(name, config)

@skill_function(
    name="query",
    description="Execute a SELECT query",
    parameters={
        "type": "object",
        "properties": {
            "connection": {"type": "string"},
            "sql": {"type": "string"},
            "parameters": {"type": "array"}
        },
        "required": ["connection", "sql"]
    }
)
def query_database(connection: str, sql: str, parameters: List = None) -> List[Dict]:
    return db_manager.query(connection, sql, parameters)

@skill_function(
    name="get_schema",
    description="Get database schema",
    parameters={
        "type": "object",
        "properties": {
            "connection": {"type": "string"}
        },
        "required": ["connection"]
    }
)
def get_schema(connection: str) -> List[Dict]:
    return db_manager.get_schema(connection)
```

---

## 4. MONEY-MAKING SKILLS

### 4.1 Content Creation

```python
# skills/content_creation/skill.py
SKILL_METADATA = {
    "id": "content_creation",
    "name": "Content Creation",
    "version": "2.0.0",
    "description": "Create various types of content for monetization",
    "capabilities": ["content", "creation", "marketing"]
}

from typing import List, Dict, Optional
import re
from datetime import datetime

class ContentGenerator:
    """Generate various types of content"""
    
    CONTENT_TEMPLATES = {
        "blog_post": {
            "structure": ["title", "introduction", "body", "conclusion", "cta"],
            "prompt": "Write a blog post about {topic}. Target audience: {audience}."
        },
        "social_media": {
            "structure": ["hook", "body", "hashtags", "cta"],
            "prompt": "Create a {platform} post about {topic}."
        },
        "product_description": {
            "structure": ["headline", "features", "benefits", "specs", "cta"],
            "prompt": "Write a product description for {product}."
        },
        "email": {
            "structure": ["subject", "greeting", "body", "cta", "signature"],
            "prompt": "Write an email about {purpose}."
        }
    }
    
    def optimize_for_seo(self, content: str, keywords: List[str]) -> Dict:
        """Optimize content for SEO"""
        word_count = len(content.split())
        keyword_density = {}
        
        for keyword in keywords:
            count = len(re.findall(r'\b' + re.escape(keyword) + r'\b', content, re.IGNORECASE))
            density = (count / word_count) * 100 if word_count > 0 else 0
            keyword_density[keyword] = {
                "count": count,
                "density": round(density, 2)
            }
        
        sentences = len(re.split(r'[.!?]+', content))
        avg_words_per_sentence = word_count / sentences if sentences > 0 else 0
        
        suggestions = []
        for keyword, data in keyword_density.items():
            if data["density"] < 0.5:
                suggestions.append(f"Increase usage of '{keyword}'")
            elif data["density"] > 3:
                suggestions.append(f"Reduce usage of '{keyword}' - risk of keyword stuffing")
        
        return {
            "word_count": word_count,
            "keyword_density": keyword_density,
            "suggestions": suggestions
        }
    
    def generate_variations(self, content: str, count: int = 3) -> List[str]:
        """Generate content variations for A/B testing"""
        variations = []
        
        sentences = re.split(r'(?<=[.!?])\s+', content)
        short_version = ' '.join(sentences[:len(sentences)//2])
        variations.append(short_version)
        
        lines = content.split('\n')
        if len(lines) > 1:
            lines[0] = f"**Breaking:** {lines[0]}"
            variations.append('\n'.join(lines))
        
        variations.append(content + "\n\n⏰ Limited time offer - Act now!")
        
        return variations[:count]

# Skill functions
generator = ContentGenerator()

@skill_function(
    name="optimize_seo",
    description="Optimize content for SEO",
    parameters={
        "type": "object",
        "properties": {
            "content": {"type": "string"},
            "keywords": {"type": "array", "items": {"type": "string"}}
        },
        "required": ["content", "keywords"]
    }
)
def optimize_seo(content: str, keywords: List[str]) -> Dict:
    return generator.optimize_for_seo(content, keywords)

@skill_function(
    name="generate_variations",
    description="Generate content variations for A/B testing",
    parameters={
        "type": "object",
        "properties": {
            "content": {"type": "string"},
            "count": {"type": "integer", "default": 3}
        },
        "required": ["content"]
    }
)
def generate_variations(content: str, count: int = 3) -> List[str]:
    return generator.generate_variations(content, count)
```

### 4.2 Market Research

```python
# skills/market_research/skill.py
SKILL_METADATA = {
    "id": "market_research",
    "name": "Market Research",
    "version": "1.5.0",
    "description": "Research markets, competitors, and trends",
    "capabilities": ["research", "analysis", "data"]
}

from typing import List, Dict, Optional
import statistics

class MarketResearcher:
    """Conduct market research and analysis"""
    
    def analyze_competitors(self, industry: str, 
                           competitors: List[str]) -> Dict:
        """Analyze competitors in an industry"""
        
        competitor_data = []
        for competitor in competitors:
            data = {
                "name": competitor,
                "market_position": "unknown"
            }
            competitor_data.append(data)
        
        total = len(competitor_data)
        
        return {
            "industry": industry,
            "competitors_analyzed": len(competitor_data),
            "market_share_estimate": {
                "fragmentation": "high" if total > 10 else "medium" if total > 5 else "low",
                "estimated_distribution": {c["name"]: round(100/total, 1) for c in competitor_data}
            },
            "recommendations": [
                "Differentiate through unique value proposition",
                "Focus on underserved market segments",
                "Consider competitive pricing strategy"
            ]
        }
    
    def calculate_tam_sam_som(self, total_market: float) -> Dict:
        """Calculate TAM/SAM/SOM"""
        return {
            "tam": {
                "value": total_market,
                "description": "Total Addressable Market"
            },
            "sam": {
                "value": total_market * 0.3,
                "description": "Serviceable Addressable Market"
            },
            "som": {
                "value": total_market * 0.1,
                "description": "Serviceable Obtainable Market"
            }
        }

# Skill functions
researcher = MarketResearcher()

@skill_function(
    name="analyze_competitors",
    description="Analyze competitors in an industry",
    parameters={
        "type": "object",
        "properties": {
            "industry": {"type": "string"},
            "competitors": {"type": "array", "items": {"type": "string"}}
        },
        "required": ["industry", "competitors"]
    }
)
def analyze_competitors(industry: str, competitors: List[str]) -> Dict:
    return researcher.analyze_competitors(industry, competitors)

@skill_function(
    name="calculate_market_size",
    description="Calculate TAM/SAM/SOM",
    parameters={
        "type": "object",
        "properties": {
            "total_market": {"type": "number"}
        },
        "required": ["total_market"]
    }
)
def calculate_market_size(total_market: float) -> Dict:
    return researcher.calculate_tam_sam_som(total_market)
```

### 4.3 E-commerce Integration

```python
# skills/ecommerce/skill.py
SKILL_METADATA = {
    "id": "ecommerce",
    "name": "E-commerce Integration",
    "version": "1.4.0",
    "description": "Integrate with e-commerce platforms",
    "capabilities": ["ecommerce", "sales", "automation"]
}

from typing import List, Dict
from dataclasses import dataclass

@dataclass
class Product:
    name: str
    description: str
    price: float
    category: str = None

class EcommerceManager:
    """Manage e-commerce operations"""
    
    def calculate_pricing(self, cost: float, 
                         target_margin: float = 0.3,
                         competitor_prices: List[float] = None) -> Dict:
        """Calculate optimal pricing"""
        base_price = cost / (1 - target_margin)
        
        pricing = {
            "cost": cost,
            "target_margin": target_margin,
            "suggested_price": round(base_price, 2),
            "minimum_price": round(cost * 1.1, 2)
        }
        
        if competitor_prices:
            avg_competitor = sum(competitor_prices) / len(competitor_prices)
            pricing["competitor_average"] = round(avg_competitor, 2)
            
            if base_price > avg_competitor * 1.1:
                pricing["recommendation"] = "Price above competitors - differentiate value"
            elif base_price < avg_competitor * 0.9:
                pricing["recommendation"] = "Price below competitors - increase margin opportunity"
            else:
                pricing["recommendation"] = "Price is competitive"
        
        return pricing
    
    def generate_product_description(self, product: Product) -> str:
        """Generate optimized product description"""
        return f"""# {product.name}

{product.description}

## Key Features
- High quality
- Great value
- Fast shipping

## Specifications
Price: ${product.price}
Category: {product.category or 'General'}

Order now while supplies last!
"""

# Skill functions
manager = EcommerceManager()

@skill_function(
    name="calculate_pricing",
    description="Calculate optimal product pricing",
    parameters={
        "type": "object",
        "properties": {
            "cost": {"type": "number"},
            "target_margin": {"type": "number", "default": 0.3},
            "competitor_prices": {"type": "array", "items": {"type": "number"}}
        },
        "required": ["cost"]
    }
)
def calculate_pricing(cost: float, target_margin: float = 0.3, 
                     competitor_prices: List[float] = None) -> Dict:
    return manager.calculate_pricing(cost, target_margin, competitor_prices)

@skill_function(
    name="generate_description",
    description="Generate product description",
    parameters={
        "type": "object",
        "properties": {
            "name": {"type": "string"},
            "description": {"type": "string"},
            "price": {"type": "number"},
            "category": {"type": "string"}
        },
        "required": ["name", "description", "price"]
    }
)
def generate_description(name: str, description: str, price: float, category: str = None) -> str:
    product = Product(name=name, description=description, price=price, category=category)
    return manager.generate_product_description(product)
```

---

## 5. BUILDING SKILLS

### 5.1 Code Generation & Modification

```python
# skills/code_generation/skill.py
SKILL_METADATA = {
    "id": "code_generation",
    "name": "Code Generation",
    "version": "1.5.0",
    "description": "Generate and modify code",
    "capabilities": ["code", "generation", "development"]
}

from typing import List, Dict, Optional
import re

class CodeGenerator:
    """Generate and modify code"""
    
    CODE_PATTERNS = {
        "python": {
            "function_template": """def {name}({params}):
    \"\"\"{docstring}\"\"\"
    {body}
    return {return_value}
""",
            "class_template": """class {name}:
    \"\"\"{docstring}\"\"\"
    
    def __init__(self{init_params}):
        {init_body}
"""
        },
        "javascript": {
            "function_template": """/**
 * {docstring}
 */
function {name}({params}) {{
    {body}
    return {return_value};
}}
""",
            "class_template": """class {name} {{
    constructor({init_params}) {{
        {init_body}
    }}
}}
"""
        }
    }
    
    def generate_function(self, name: str, params: List[Dict],
                         return_type: str, description: str,
                         language: str = "python") -> str:
        """Generate a function"""
        template = self.CODE_PATTERNS.get(language, {}).get("function_template", "")
        
        param_str = ", ".join([f"{p['name']}: {p.get('type', 'any')}" for p in params])
        
        return template.format(
            name=name,
            params=param_str,
            docstring=description,
            body="# TODO: Implement",
            return_value="None"
        )
    
    def generate_class(self, name: str, attributes: List[Dict],
                      methods: List[Dict], language: str = "python") -> str:
        """Generate a class"""
        template = self.CODE_PATTERNS.get(language, {}).get("class_template", "")
        
        init_params = ""
        init_body = "pass"
        
        if attributes:
            init_params = ", " + ", ".join([a["name"] for a in attributes])
            init_body = "\n        ".join([f"self.{a['name']} = {a['name']}" for a in attributes])
        
        return template.format(
            name=name,
            docstring=f"{name} class",
            init_params=init_params,
            init_body=init_body
        )
    
    def refactor_code(self, code: str, operation: str, **kwargs) -> str:
        """Refactor existing code"""
        if operation == "extract_method":
            return self._extract_method(code, kwargs.get("start_line"), kwargs.get("end_line"), kwargs.get("method_name"))
        elif operation == "rename_variable":
            return self._rename_variable(code, kwargs.get("old_name"), kwargs.get("new_name"))
        elif operation == "add_type_hints":
            return self._add_type_hints(code)
        else:
            raise ValueError(f"Unknown refactoring operation: {operation}")
    
    def _extract_method(self, code: str, start_line: int, end_line: int, method_name: str) -> str:
        """Extract code into a new method"""
        lines = code.split('\n')
        extracted = '\n'.join(lines[start_line:end_line])
        
        # Create new method
        new_method = f"\n    def {method_name}(self):\n        " + extracted.replace('\n', '\n        ')
        
        # Replace extracted code with method call
        lines[start_line:end_line] = [f"        self.{method_name}()"]
        
        # Add new method at the end
        lines.append(new_method)
        
        return '\n'.join(lines)
    
    def _rename_variable(self, code: str, old_name: str, new_name: str) -> str:
        """Rename a variable throughout the code"""
        # Simple regex-based renaming (use AST for production)
        pattern = r'\b' + re.escape(old_name) + r'\b'
        return re.sub(pattern, new_name, code)
    
    def _add_type_hints(self, code: str) -> str:
        """Add type hints to Python code"""
        # This would use AST parsing in production
        return code  # Placeholder

# Skill functions
generator = CodeGenerator()

@skill_function(
    name="generate_function",
    description="Generate a function",
    parameters={
        "type": "object",
        "properties": {
            "name": {"type": "string"},
            "params": {"type": "array"},
            "return_type": {"type": "string"},
            "description": {"type": "string"},
            "language": {"type": "string", "default": "python"}
        },
        "required": ["name", "params", "description"]
    }
)
def generate_function(name: str, params: List[Dict], return_type: str = None,
                     description: str = "", language: str = "python") -> str:
    return generator.generate_function(name, params, return_type, description, language)

@skill_function(
    name="refactor",
    description="Refactor existing code",
    parameters={
        "type": "object",
        "properties": {
            "code": {"type": "string"},
            "operation": {"type": "string", "enum": ["extract_method", "rename_variable", "add_type_hints"]},
            "kwargs": {"type": "object"}
        },
        "required": ["code", "operation"]
    }
)
def refactor_code(code: str, operation: str, **kwargs) -> str:
    return generator.refactor_code(code, operation, **kwargs)
```

### 5.2 Project Scaffolding

```python
# skills/project_scaffolding/skill.py
SKILL_METADATA = {
    "id": "project_scaffolding",
    "name": "Project Scaffolding",
    "version": "1.3.0",
    "description": "Create project structures and boilerplate",
    "capabilities": ["code", "scaffolding", "development"]
}

from typing import Dict, List
from pathlib import Path
import os

class ProjectScaffolder:
    """Scaffold new projects"""
    
    PROJECT_TEMPLATES = {
        "python_package": {
            "directories": ["src/{name}", "tests", "docs", "scripts"],
            "files": {
                "pyproject.toml": """[build-system]
requires = ["setuptools>=45", "wheel"]
build-backend = "setuptools.build_meta"

[project]
name = "{name}"
version = "0.1.0"
description = "{description}"
readme = "README.md"
requires-python = ">=3.8"
classifiers = [
    "Programming Language :: Python :: 3",
    "License :: OSI Approved :: MIT License",
]
""",
                "README.md": "# {name}\n\n{description}\n",
                "src/{name}/__init__.py": "__version__ = \"0.1.0\"\n",
                "tests/__init__.py": "",
                ".gitignore": "__pycache__/\n*.pyc\n.venv/\n*.egg-info/\n"
            }
        },
        "web_app": {
            "directories": ["src", "public", "tests"],
            "files": {
                "package.json": """{{
  "name": "{name}",
  "version": "0.1.0",
  "description": "{description}",
  "scripts": {{
    "start": "node src/index.js",
    "test": "jest"
  }}
}}""",
                "README.md": "# {name}\n\n{description}\n",
                "src/index.js": "console.log('Hello, World!');\n"
            }
        },
        "fastapi_app": {
            "directories": ["app", "tests", "alembic"],
            "files": {
                "requirements.txt": "fastapi\nuvicorn\nsqlalchemy\nalembic\npytest\n",
                "app/main.py": """from fastapi import FastAPI

app = FastAPI(title="{name}")

@app.get("/")
def read_root():
    return {{"message": "Hello World"}}
""",
                "README.md": "# {name}\n\nFastAPI application\n",
                "Dockerfile": """FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0"]
"""
            }
        }
    }
    
    def scaffold(self, template: str, name: str, description: str,
                output_dir: str = None) -> Dict:
        """Create a new project from template"""
        if template not in self.PROJECT_TEMPLATES:
            raise ValueError(f"Unknown template: {template}")
        
        tmpl = self.PROJECT_TEMPLATES[template]
        
        # Create output directory
        if output_dir:
            base_path = Path(output_dir) / name
        else:
            base_path = Path(name)
        
        base_path.mkdir(parents=True, exist_ok=True)
        
        created_files = []
        
        # Create directories
        for dir_path in tmpl["directories"]:
            dir_path = dir_path.format(name=name)
            (base_path / dir_path).mkdir(parents=True, exist_ok=True)
        
        # Create files
        for file_path, content in tmpl["files"].items():
            file_path = file_path.format(name=name)
            full_path = base_path / file_path
            full_path.parent.mkdir(parents=True, exist_ok=True)
            
            with open(full_path, 'w') as f:
                f.write(content.format(name=name, description=description))
            
            created_files.append(str(full_path))
        
        return {
            "project_name": name,
            "template": template,
            "location": str(base_path),
            "files_created": len(created_files),
            "file_list": created_files
        }
    
    def list_templates(self) -> List[Dict]:
        """List available templates"""
        return [
            {
                "name": name,
                "description": f"{name} project template",
                "directories": len(tmpl["directories"]),
                "files": len(tmpl["files"])
            }
            for name, tmpl in self.PROJECT_TEMPLATES.items()
        ]

# Skill functions
scaffolder = ProjectScaffolder()

@skill_function(
    name="create",
    description="Create a new project from template",
    parameters={
        "type": "object",
        "properties": {
            "template": {"type": "string", "enum": ["python_package", "web_app", "fastapi_app"]},
            "name": {"type": "string"},
            "description": {"type": "string"},
            "output_dir": {"type": "string"}
        },
        "required": ["template", "name", "description"]
    }
)
def create_project(template: str, name: str, description: str, output_dir: str = None) -> Dict:
    return scaffolder.scaffold(template, name, description, output_dir)

@skill_function(
    name="list_templates",
    description="List available project templates",
    parameters={"type": "object", "properties": {}}
)
def list_templates() -> List[Dict]:
    return scaffolder.list_templates()
```

---

## 6. SKILL DISCOVERY & LEARNING

### 6.1 Skill Discovery System

```python
# skill_discovery.py
from typing import List, Dict, Optional
import json
from dataclasses import dataclass

@dataclass
class SkillCapability:
    """Represents a skill capability"""
    name: str
    description: str
    input_schema: Dict
    output_schema: Dict
    examples: List[Dict]

class SkillDiscovery:
    """Discover and catalog skills"""
    
    def __init__(self, registry: SkillRegistry):
        self.registry = registry
        self.capability_catalog: Dict[str, List[str]] = {}
        self._build_catalog()
    
    def _build_catalog(self):
        """Build capability catalog from registered skills"""
        for skill in self.registry.list_all():
            for capability in skill.capabilities:
                if capability not in self.capability_catalog:
                    self.capability_catalog[capability] = []
                self.capability_catalog[capability].append(skill.id)
    
    def discover_for_task(self, task_description: str) -> List[Dict]:
        """Discover skills that can help with a task"""
        task_lower = task_description.lower()
        matching_skills = []
        
        for skill in self.registry.list_all():
            score = 0
            
            # Check name match
            if skill.name.lower() in task_lower:
                score += 3
            
            # Check description match
            if skill.description.lower() in task_lower:
                score += 2
            
            # Check capability match
            for capability in skill.capabilities:
                if capability in task_lower:
                    score += 1
            
            # Check function descriptions
            for func in skill.functions.values():
                if func.description.lower() in task_lower:
                    score += 1
            
            if score > 0:
                matching_skills.append({
                    "skill": skill.to_schema(),
                    "relevance_score": score,
                    "suggested_functions": [
                        {"name": f.name, "description": f.description}
                        for f in skill.functions.values()
                    ]
                })
        
        # Sort by relevance
        matching_skills.sort(key=lambda x: x["relevance_score"], reverse=True)
        return matching_skills
    
    def get_capability_map(self) -> Dict:
        """Get mapping of capabilities to skills"""
        return {
            capability: {
                "skill_count": len(skill_ids),
                "skills": [
                    {"id": sid, "name": self.registry.get(sid).name}
                    for sid in skill_ids
                ]
            }
            for capability, skill_ids in self.capability_catalog.items()
        }
    
    def suggest_combinations(self, task: str) -> List[Dict]:
        """Suggest skill combinations for complex tasks"""
        # Analyze task for multi-step requirements
        combinations = []
        
        # Example: Content creation workflow
        if any(word in task.lower() for word in ["content", "blog", "article"]):
            combinations.append({
                "name": "Content Creation Workflow",
                "skills": ["content_creation", "web_browsing", "file_system"],
                "description": "Research, create, and save content",
                "steps": [
                    "Research topic using web_browsing",
                    "Generate content using content_creation",
                    "Save to file using file_system"
                ]
            })
        
        # Example: Development workflow
        if any(word in task.lower() for word in ["build", "develop", "create app"]):
            combinations.append({
                "name": "Development Workflow",
                "skills": ["project_scaffolding", "code_generation", "code_execution"],
                "description": "Scaffold, generate, and test code",
                "steps": [
                    "Create project structure using project_scaffolding",
                    "Generate code using code_generation",
                    "Test using code_execution"
                ]
            })
        
        return combinations

# Skill functions
@skill_function(
    name="discover",
    description="Discover skills for a task",
    parameters={
        "type": "object",
        "properties": {
            "task_description": {"type": "string"}
        },
        "required": ["task_description"]
    }
)
def discover_skills(task_description: str) -> List[Dict]:
    discovery = SkillDiscovery(registry)
    return discovery.discover_for_task(task_description)

@skill_function(
    name="get_capabilities",
    description="Get all available capabilities",
    parameters={"type": "object", "properties": {}}
)
def get_capabilities() -> Dict:
    discovery = SkillDiscovery(registry)
    return discovery.get_capability_map()

@skill_function(
    name="suggest_combinations",
    description="Suggest skill combinations for a task",
    parameters={
        "type": "object",
        "properties": {
            "task": {"type": "string"}
        },
        "required": ["task"]
    }
)
def suggest_combinations(task: str) -> List[Dict]:
    discovery = SkillDiscovery(registry)
    return discovery.suggest_combinations(task)
```

### 6.2 Self-Documenting Skills

```python
# self_documenting.py
from typing import Dict, List
import inspect
import json

class SkillDocumenter:
    """Auto-generate documentation for skills"""
    
    def document_skill(self, skill: Skill) -> Dict:
        """Generate comprehensive documentation for a skill"""
        return {
            "metadata": {
                "id": skill.id,
                "name": skill.name,
                "version": skill.version,
                "description": skill.description,
                "capabilities": skill.capabilities
            },
            "functions": [
                self._document_function(func)
                for func in skill.functions.values()
            ],
            "usage_examples": self._generate_examples(skill),
            "dependencies": skill.dependencies,
            "configuration": skill.config
        }
    
    def _document_function(self, func: SkillFunction) -> Dict:
        """Document a single function"""
        return {
            "name": func.name,
            "description": func.description,
            "parameters": func.parameters,
            "returns": func.returns,
            "examples": func.examples
        }
    
    def _generate_examples(self, skill: Skill) -> List[Dict]:
        """Generate usage examples"""
        examples = []
        
        for func in skill.functions.values():
            if func.examples:
                examples.extend(func.examples)
            else:
                # Generate example from parameters
                example_params = {}
                for param_name, param_info in func.parameters.get("properties", {}).items():
                    if param_name in func.parameters.get("required", []):
                        example_params[param_name] = self._generate_example_value(param_info)
                
                examples.append({
                    "function": f"{skill.id}.{func.name}",
                    "input": example_params,
                    "description": f"Example usage of {func.name}"
                })
        
        return examples
    
    def _generate_example_value(self, param_info: Dict) -> any:
        """Generate example value for a parameter"""
        param_type = param_info.get("type", "string")
        
        if param_type == "string":
            return param_info.get("example", "example_string")
        elif param_type == "integer":
            return param_info.get("example", 42)
        elif param_type == "number":
            return param_info.get("example", 3.14)
        elif param_type == "boolean":
            return param_info.get("example", True)
        elif param_type == "array":
            return param_info.get("example", [])
        elif param_type == "object":
            return param_info.get("example", {})
        else:
            return None
    
    def generate_markdown_docs(self, skill: Skill) -> str:
        """Generate Markdown documentation"""
        doc = self.document_skill(skill)
        
        md = f"""# {doc['metadata']['name']}

{doc['metadata']['description']}

**Version:** {doc['metadata']['version']}  
**ID:** `{doc['metadata']['id']}`  
**Capabilities:** {', '.join(doc['metadata']['capabilities'])}

## Functions

"""
        
        for func in doc['functions']:
            md += f"""### {func['name']}

{func['description']}

**Parameters:**
```json
{json.dumps(func['parameters'], indent=2)}
```

**Returns:**
```json
{json.dumps(func['returns'], indent=2)}
```

"""
        
        md += """## Usage Examples

"""
        
        for example in doc['usage_examples']:
            md += f"""### {example.get('function', 'Example')}

```python
# Input
{json.dumps(example.get('input', {}), indent=2)}

# Output
{json.dumps(example.get('output', {}), indent=2)}
```

"""
        
        return md

# Skill functions
documenter = SkillDocumenter()

@skill_function(
    name="document",
    description="Generate documentation for a skill",
    parameters={
        "type": "object",
        "properties": {
            "skill_id": {"type": "string"},
            "format": {"type": "string", "enum": ["json", "markdown"], "default": "json"}
        },
        "required": ["skill_id"]
    }
)
def document_skill(skill_id: str, format: str = "json") -> str:
    skill = registry.get(skill_id)
    if not skill:
        raise ValueError(f"Skill {skill_id} not found")
    
    if format == "markdown":
        return documenter.generate_markdown_docs(skill)
    else:
        return json.dumps(documenter.document_skill(skill), indent=2)
```

---

## Summary

This comprehensive guide covers the essential components for building powerful autonomous agents:

### Key Architecture Components:
1. **Skill Registry** - Central management of all capabilities
2. **Function Caller** - Intelligent tool selection and execution
3. **Tool Chains** - Compose skills into workflows
4. **Dynamic Loading** - Add capabilities at runtime

### Essential Skills:
- Web browsing and data extraction
- Code execution and development
- File system operations
- Database interactions
- API communications

### Money-Making Capabilities:
- Content creation and SEO optimization
- Market research and competitor analysis
- E-commerce integration
- Service delivery automation
- Financial transaction handling

### Building Skills:
- Code generation and refactoring
- Project scaffolding
- Deployment automation

### Discovery & Learning:
- Skill discovery based on task requirements
- Self-documenting skills
- Capability mapping
- Combination suggestions

This architecture enables agents to be truly autonomous, capable of discovering new capabilities, composing them into workflows, and continuously improving their effectiveness.
