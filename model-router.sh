#!/bin/bash
# Model Router for OpenClaw
# Routes tasks to appropriate Kimi model based on complexity

# Model definitions
MODEL_FAST="kimi-coding/k2"
MODEL_SMART="kimi-coding/k2p5"

# Simple heuristic for task complexity
analyze_complexity() {
    local task="$1"
    local complexity=0
    
    # Complex indicators (add points)
    if echo "$task" | grep -qiE "(code|build|create|design|implement|fix|debug|architecture|algorithm|complex|hard)"; then
        complexity=$((complexity + 3))
    fi
    
    if echo "$task" | grep -qiE "(full.*stack|complete|entire|system|framework|api|database)"; then
        complexity=$((complexity + 2))
    fi
    
    # Simple indicators (subtract points)
    if echo "$task" | grep -qiE "^(check|status|list|show|get|what|how.*is|simple|quick|just)"; then
        complexity=$((complexity - 2))
    fi
    
    if echo "$task" | grep -qiE "(summarize|format|convert|organize|sort)"; then
        complexity=$((complexity - 1))
    fi
    
    # Decide model
    if [ $complexity -ge 2 ]; then
        echo "$MODEL_SMART"
    else
        echo "$MODEL_FAST"
    fi
}

# Main router
route_task() {
    local task="$1"
    local model=$(analyze_complexity "$task")
    
    echo "Task: $task"
    echo "Routed to: $model"
    echo ""
    
    if [ "$model" = "$MODEL_FAST" ]; then
        echo "💰 Using cheaper K2 model (save ~90%)"
    else
        echo "🧠 Using powerful K2.5 model (full capability)"
    fi
}

# Example usage
if [ $# -eq 0 ]; then
    echo "Model Router for Kimi"
    echo ""
    echo "Usage: ./model-router.sh 'your task here'"
    echo ""
    echo "Examples:"
    echo "  ./model-router.sh 'check status'"
    echo "  ./model-router.sh 'build a full-stack app'"
    echo ""
    echo "Models:"
    echo "  K2 (fast):  $0.30/M tokens - Simple tasks"
    echo "  K2.5 (smart): $3.00/M tokens - Complex tasks"
else
    route_task "$1"
fi
