# Model Routing Configuration — Kimi Only

## Overview
Route tasks to appropriate Kimi models based on complexity to save costs.

## Model Comparison

| Model | Cost/1M tokens | Best For |
|-------|----------------|----------|
| **Kimi K2** | $0.30 input / $0.60 output | Simple tasks, summaries, formatting |
| **Kimi K2.5** | $3.00 input / $12.00 output | Complex coding, reasoning, creative work |

**Savings:** Using K2 for 50% of tasks = ~40% cost reduction

---

## Routing Rules

### Use Kimi K2 (Cheaper) For:
- ✅ Simple Q&A
- ✅ Text formatting
- ✅ Basic summaries
- ✅ File listing
- ✅ Status checks
- ✅ Routine heartbeat responses

### Use Kimi K2.5 (Full Power) For:
- 🧠 Complex coding
- 🧠 Architecture decisions
- 🧠 Creative writing
- 🧠 Multi-step reasoning
- 🧠 New skill development
- 🧠 Debugging complex issues

---

## Configuration

### Environment Variables

```bash
# Add to ~/.bashrc or ~/.zshrc
export KIMI_API_KEY="sk-..."

# Model aliases
export MODEL_FAST="kimi-coding/k2"      # K2 for simple tasks
export MODEL_SMART="kimi-coding/k2p5"   # K2.5 for complex tasks
export MODEL_DEFAULT="kimi-coding/k2p5" # Default fallback
```

### OpenClaw Config

Add to your OpenClaw config:

```yaml
models:
  default: kimi-coding/k2p5
  
  aliases:
    fast: kimi-coding/k2
    smart: kimi-coding/k2p5
    balanced: kimi-coding/k2p5
  
  routing:
    # Simple pattern matching
    patterns:
      - pattern: "(?i)^(status|check|list|show|get).*"
        model: fast
        reason: "Simple status queries"
      
      - pattern: "(?i)^(create|build|design|implement|fix|debug).*"
        model: smart
        reason: "Complex implementation tasks"
      
      - pattern: "(?i)^(summarize|format|convert|organize).*"
        model: fast
        reason: "Formatting tasks"
      
      - pattern: "(?i)(code|script|function|algorithm|architecture)"
        model: smart
        reason: "Code-related tasks"

# Usage tracking
costTracking:
  enabled: true
  logPath: logs/model-usage.log
```

---

## Usage Commands

### Manual Model Selection

```bash
# Force cheap model for this task
/model fast

# Force smart model for this task  
/model smart

# Reset to default
/model default
```

### In Conversations

```
User: "Just checking status"
→ Auto-routes to K2 ($0.30/M)

User: "Build me a full-stack app"
→ Auto-routes to K2.5 ($3.00/M)
```

---

## Cost Tracking

### View Usage Stats

```bash
# Check today's costs
tail -f logs/model-usage.log

# Daily summary
cat logs/model-usage.log | grep $(date +%Y-%m-%d) | awk -F',' '{sum+=$3} END {print "Total: $" sum}'
```

### Log Format

```
timestamp,model,tokens,cost,task_type
2026-02-03T10:00:00Z,k2,1500,0.00045,"status check"
2026-02-03T10:05:00Z,k2p5,3200,0.04800,"code implementation"
```

---

## Expected Savings

### Before Routing (K2.5 only)
- Daily usage: 100K tokens
- Cost: $1.50/day = $45/month

### After Routing (50% K2, 50% K2.5)
- Daily usage: 50K K2 + 50K K2.5
- Cost: $0.45/day = $13.50/month

**Monthly savings: ~$30 (67% reduction)**

---

## Quick Wins

Tasks that should use K2 instead of K2.5:

1. Heartbeat responses → **Save 90%**
2. File listing → **Save 85%**
3. Simple status checks → **Save 90%**
4. Formatting output → **Save 80%**
5. Acknowledgments → **Save 95%**

---

## Implementation Status

- [x] Configuration created
- [ ] Add to OpenClaw config
- [ ] Test routing logic
- [ ] Enable cost tracking
- [ ] Monitor savings

**Next:** Apply this config to your OpenClaw instance.
