/**
 * Memory System Core - With Local Fallback
 * 
 * Hybrid memory architecture:
 * - Supermemory.ai (when available) for semantic search and long-term storage
 * - Local JSON file fallback for immediate storage
 * - File-based daily notes for session context  
 * - MEMORY.md for curated long-term knowledge
 */

import {
  MemoryContainer,
  MemoryEntry,
  MemoryResult,
  SearchOptions,
  StoreOptions,
  ProjectStatus,
  DecisionRecord,
  LearningRecord,
  SessionSummary,
  ParsedQuery,
  QueryIntent,
} from './types.js';
import * as fs from 'fs';
import * as path from 'path';

// Default configuration
const DEFAULT_LIMIT = 5;
const CACHE_TTL = 300; // 5 minutes

// Local storage path
const LOCAL_MEMORY_PATH = process.env.LOCAL_MEMORY_PATH || 
  '/home/node/.openclaw/workspace/.credentials/local-memories.json';

// Simple in-memory cache
const cache = new Map<string, { value: any; expires: number }>();

// In-memory storage for local fallback
let localMemories: LocalMemory[] = [];
let useLocalFallback = false;

interface LocalMemory {
  id: string;
  content: string;
  container: MemoryContainer;
  metadata: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

/**
 * Get API key from environment
 */
function getApiKey(): string | null {
  return process.env.SUPERMEMORY_API_KEY || null;
}

/**
 * Load local memories from disk
 */
function loadLocalMemories(): LocalMemory[] {
  try {
    if (fs.existsSync(LOCAL_MEMORY_PATH)) {
      const data = fs.readFileSync(LOCAL_MEMORY_PATH, 'utf-8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('Failed to load local memories:', error);
  }
  return [];
}

/**
 * Save local memories to disk
 */
function saveLocalMemories(): void {
  try {
    const dir = path.dirname(LOCAL_MEMORY_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(LOCAL_MEMORY_PATH, JSON.stringify(localMemories, null, 2));
  } catch (error) {
    console.error('Failed to save local memories:', error);
  }
}

/**
 * Supermemory API client with local fallback
 */
class SupermemoryClient {
  private apiKey: string | null;
  private baseUrl = 'https://v2.api.supermemory.ai';

  constructor(apiKey: string | null) {
    this.apiKey = apiKey;
  }

  /**
   * Add a memory - tries API first, falls back to local
   */
  async add(entry: MemoryEntry): Promise<{ success: boolean; id?: string; error?: string }> {
    // Try API first if key is available
    if (this.apiKey && !useLocalFallback) {
      try {
        const response = await fetch(`${this.baseUrl}/add`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': this.apiKey,
          },
          body: JSON.stringify({
            content: entry.content,
            customId: entry.customId,
            containerTag: entry.containerTag,
            metadata: entry.metadata,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          return { success: true, id: data.id || entry.customId };
        }

        // If API fails, fall through to local
        const error = await response.text();
        console.warn(`Supermemory API error: ${error}. Falling back to local storage.`);
        useLocalFallback = true;
      } catch (error) {
        console.warn(`Supermemory API unavailable: ${error}. Using local storage.`);
        useLocalFallback = true;
      }
    }

    // Local fallback
    const memory: LocalMemory = {
      id: entry.customId || generateId(entry.containerTag, Date.now().toString()),
      content: entry.content,
      container: entry.containerTag,
      metadata: entry.metadata || {},
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Remove any existing memory with same ID
    localMemories = localMemories.filter(m => m.id !== memory.id);
    localMemories.push(memory);
    saveLocalMemories();

    return { success: true, id: memory.id };
  }

  /**
   * Search memories - tries API first, falls back to local
   */
  async search(query: string, options: SearchOptions = {}): Promise<MemoryResult[]> {
    const { container, containers, limit = DEFAULT_LIMIT } = options;

    // Try API first if key is available
    if (this.apiKey && !useLocalFallback) {
      try {
        const response = await fetch(`${this.baseUrl}/search`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': this.apiKey,
          },
          body: JSON.stringify({
            q: query,
            containerTag: container,
            containerTags: containers,
            limit,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          return (data.results || []).map((m: any) => ({
            id: m.id,
            content: m.memory || m.chunk || '',
            container: m.documents?.[0]?.metadata?.containerTag || 'unknown',
            metadata: m.metadata || {},
            score: m.similarity || 0,
            createdAt: m.updatedAt || new Date().toISOString(),
          }));
        }

        console.warn('Supermemory API search failed. Using local search.');
        useLocalFallback = true;
      } catch (error) {
        console.warn(`Supermemory API unavailable: ${error}. Using local search.`);
        useLocalFallback = true;
      }
    }

    // Local fallback - simple keyword search
    const keywords = query.toLowerCase().split(/\s+/);
    let results = localMemories.filter(m => {
      const content = m.content.toLowerCase();
      return keywords.some(kw => content.includes(kw));
    });

    // Filter by container if specified
    if (container) {
      results = results.filter(m => m.container === container);
    }
    if (containers?.length) {
      results = results.filter(m => containers.includes(m.container));
    }

    // Sort by relevance (simple keyword match count)
    results = results
      .map(m => {
        const content = m.content.toLowerCase();
        const score = keywords.filter(kw => content.includes(kw)).length / keywords.length;
        return { ...m, score };
      })
      .sort((a, b) => (b as any).score - (a as any).score)
      .slice(0, limit);

    return results.map(m => ({
      id: m.id,
      content: m.content,
      container: m.container,
      metadata: m.metadata,
      score: (m as any).score || 0,
      createdAt: m.createdAt,
    }));
  }
}

// Initialize client and load local memories
const apiKey = getApiKey();
const client = new SupermemoryClient(apiKey);
localMemories = loadLocalMemories();

/**
 * Cache utilities
 */
function getCacheKey(prefix: string, ...parts: string[]): string {
  return `${prefix}:${parts.join(':')}`;
}

function getCached<T>(key: string): T | null {
  const entry = cache.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expires) {
    cache.delete(key);
    return null;
  }
  return entry.value;
}

function setCached<T>(key: string, value: T, ttlSeconds: number = CACHE_TTL): void {
  cache.set(key, {
    value,
    expires: Date.now() + ttlSeconds * 1000,
  });
}

/**
 * Generate a custom ID from key parts
 */
function generateId(...parts: string[]): string {
  return parts
    .map(p => p.toLowerCase().replace(/[^a-z0-9]+/g, '-'))
    .join('-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

/**
 * Store a memory
 */
export async function storeMemory(
  content: string,
  options: StoreOptions
): Promise<{ success: boolean; id?: string; error?: string }> {
  const {
    container,
    customId,
    category,
    topics = [],
    confidence = 'high',
    source = 'explicit',
    metadata = {},
  } = options;

  const id = customId || generateId(container, ...topics, Date.now().toString());
  
  const entry: MemoryEntry = {
    content,
    customId: id,
    containerTag: container,
    metadata: {
      category,
      topics,
      confidence,
      source,
      sourceDate: new Date().toISOString(),
      ...metadata,
    },
  };

  const result = await client.add(entry);
  
  if (result.success) {
    const cacheKey = getCacheKey('container', container);
    cache.delete(cacheKey);
  }
  
  return result;
}

/**
 * Simple remember function - store key-value with searchability
 */
export async function remember(
  key: string,
  value: string,
  options: Partial<StoreOptions> = {}
): Promise<{ success: boolean; id?: string; error?: string }> {
  return storeMemory(value, {
    container: options.container || 'blake',
    customId: generateId(key),
    confidence: 'high',
    source: 'explicit',
    ...options,
  });
}

/**
 * Semantic search across memories
 */
export async function recall(
  query: string,
  options: SearchOptions = {}
): Promise<MemoryResult[]> {
  const cacheKey = getCacheKey('search', query, JSON.stringify(options));
  
  const cached = getCached<MemoryResult[]>(cacheKey);
  if (cached) return cached;

  const results = await client.search(query, {
    limit: DEFAULT_LIMIT,
    ...options,
  });

  setCached(cacheKey, results, CACHE_TTL);
  return results;
}

/**
 * Store a user preference
 */
export async function storePreference(
  topic: string,
  value: string,
  options: { confidence?: 'low' | 'medium' | 'high' | 'certain'; source?: string } = {}
): Promise<{ success: boolean; id?: string }> {
  const content = `Blake's preference for ${topic}: ${value}`;
  
  const result = await storeMemory(content, {
    container: 'blake',
    customId: generateId('blake', 'preference', topic),
    category: 'preferences',
    topics: ['preferences', topic],
    confidence: options.confidence || 'high',
    source: 'explicit',
    metadata: {
      preferenceTopic: topic,
      preferenceValue: value,
      sourceDetail: options.source,
    },
  });

  return result;
}

/**
 * Get a user preference
 */
export async function getPreference(topic: string): Promise<MemoryResult | null> {
  const results = await recall(`Blake preference ${topic}`, {
    container: 'blake',
    limit: 3,
  });
  
  return results[0] || null;
}

/**
 * Store project status
 */
export async function storeProjectStatus(
  project: string,
  status: Omit<ProjectStatus, 'name' | 'lastUpdated'>
): Promise<{ success: boolean; id?: string }> {
  const content = `
Project: ${project}
Status: ${status.status}
URL: ${status.url || 'N/A'}
Stack: ${status.stack.join(', ')}
Goals: ${status.goals?.join(', ') || 'None defined'}
Blockers: ${status.blockers?.join(', ') || 'None'}
Last Updated: ${new Date().toISOString()}
  `.trim();

  const result = await storeMemory(content, {
    container: 'slidetheory',
    customId: generateId('project', project, 'status'),
    category: 'status',
    topics: ['project', project, 'status'],
    confidence: 'high',
    source: 'explicit',
    metadata: {
      projectName: project,
      projectStatus: status.status,
      projectUrl: status.url,
      projectStack: status.stack,
    },
  });

  return result;
}

/**
 * Get project status
 */
export async function getProjectStatus(project: string): Promise<MemoryResult | null> {
  const results = await recall(`${project} status`, {
    container: 'slidetheory',
    limit: 3,
  });
  
  return results[0] || null;
}

/**
 * Store a decision with rationale
 */
export async function storeDecision(
  decision: string,
  rationale: string,
  options: {
    alternatives?: string[];
    context?: string;
    reversible?: boolean;
    confidence?: 'low' | 'medium' | 'high' | 'certain';
  } = {}
): Promise<{ success: boolean; id?: string }> {
  const content = `
Decision: ${decision}
Rationale: ${rationale}
${options.alternatives?.length ? `Alternatives Considered: ${options.alternatives.join(', ')}` : ''}
${options.context ? `Context: ${options.context}` : ''}
Reversible: ${options.reversible !== false ? 'Yes' : 'No'}
Date: ${new Date().toISOString()}
  `.trim();

  const result = await storeMemory(content, {
    container: 'decisions',
    customId: generateId('decision', decision.slice(0, 30)),
    category: 'decision',
    topics: ['decision', 'rationale'],
    confidence: options.confidence || 'high',
    source: 'explicit',
    metadata: {
      decision,
      rationale,
      alternatives: options.alternatives,
      reversible: options.reversible !== false,
    },
  });

  return result;
}

/**
 * Store a learning/insight
 */
export async function storeLearning(
  insight: string,
  context: string,
  options: {
    category?: string;
    impact?: 'low' | 'medium' | 'high' | 'critical';
    relatedDecisions?: string[];
  } = {}
): Promise<{ success: boolean; id?: string }> {
  const content = `
Insight: ${insight}
Context: ${context}
Category: ${options.category || 'general'}
Impact: ${options.impact || 'medium'}
Date: ${new Date().toISOString()}
  `.trim();

  const result = await storeMemory(content, {
    container: 'learnings',
    customId: generateId('learning', insight.slice(0, 30)),
    category: 'technical-insight',
    topics: ['learning', 'insight', options.category || 'general'],
    confidence: 'high',
    source: 'explicit',
    metadata: {
      insight,
      context,
      category: options.category,
      impact: options.impact,
      relatedDecisions: options.relatedDecisions,
    },
  });

  return result;
}

/**
 * Store a session summary for archival
 */
export async function storeSessionSummary(
  date: string,
  summary: SessionSummary
): Promise<{ success: boolean; id?: string }> {
  const content = `
Session: ${summary.focus}
Date: ${date}
Accomplishments:
${summary.accomplishments.map(a => `- ${a}`).join('\n')}

Decisions Made:
${summary.decisions.map(d => `- ${d.decision}: ${d.rationale}`).join('\n')}

Key Learnings:
${summary.learnings.map(l => `- ${l.insight}`).join('\n')}

Open Threads:
${summary.openThreads.map(t => `- ${t}`).join('\n')}

Commits: ${summary.commits.join(', ')}
${summary.duration ? `Duration: ${summary.duration} minutes` : ''}
  `.trim();

  const result = await storeMemory(content, {
    container: 'sessions',
    customId: generateId('session', date),
    category: 'session-summary',
    topics: ['session', summary.focus],
    confidence: 'high',
    source: 'session',
    metadata: {
      sessionDate: date,
      sessionFocus: summary.focus,
      accomplishments: summary.accomplishments,
      decisionCount: summary.decisions.length,
      learningCount: summary.learnings.length,
      duration: summary.duration,
    },
  });

  return result;
}

/**
 * Intelligent query routing
 */
export function parseQuery(query: string): ParsedQuery {
  const lower = query.toLowerCase();
  
  const patterns: { intent: QueryIntent; keywords: string[] }[] = [
    { intent: 'user_preference', keywords: ['prefer', 'like', 'dislike', 'hate', 'favorite', 'blake'] },
    { intent: 'project_status', keywords: ['status', 'progress', 'how is', 'what happened to', 'milestone'] },
    { intent: 'technical_knowledge', keywords: ['how to', 'how do', 'why does', 'what causes', 'bug', 'error', 'fix'] },
    { intent: 'recent_activity', keywords: ['today', 'yesterday', 'recent', 'last', 'this week', 'did we'] },
    { intent: 'decision_rationale', keywords: ['why did', 'decision', 'choose', 'instead of', 'rationale'] },
    { intent: 'contact_info', keywords: ['who is', 'contact', 'email', 'phone', 'reach'] },
  ];

  let intent: QueryIntent = 'general_knowledge';
  for (const pattern of patterns) {
    if (pattern.keywords.some(kw => lower.includes(kw.toLowerCase()))) {
      intent = pattern.intent;
      break;
    }
  }

  let temporal: 'recent' | 'past' | 'all' = 'all';
  if (lower.includes('today') || lower.includes('yesterday') || lower.includes('recent')) {
    temporal = 'recent';
  } else if (lower.includes('ago') || lower.includes('before') || lower.includes('previous')) {
    temporal = 'past';
  }

  const project = lower.includes('slidetheory') ? 'slidetheory' : undefined;
  const person = lower.includes('blake') ? 'blake' : undefined;

  return {
    intent,
    keywords: lower.split(/\s+/).filter(w => w.length > 2),
    temporal,
    project,
    person,
  };
}

/**
 * Smart recall - route query to best source based on intent
 */
export async function smartRecall(query: string): Promise<{
  results: MemoryResult[];
  source: string;
  intent: QueryIntent;
}> {
  const parsed = parseQuery(query);
  
  switch (parsed.intent) {
    case 'user_preference':
      return {
        results: await recall(query, { container: 'blake', limit: 3 }),
        source: useLocalFallback ? 'local:blake' : 'supermemory:blake',
        intent: parsed.intent,
      };
      
    case 'project_status':
      return {
        results: await recall(query, { container: 'slidetheory', limit: 5 }),
        source: useLocalFallback ? 'local:slidetheory' : 'supermemory:slidetheory',
        intent: parsed.intent,
      };
      
    case 'technical_knowledge':
      return {
        results: await recall(query, { containers: ['learnings', 'decisions'], limit: 5 }),
        source: useLocalFallback ? 'local:learnings+decisions' : 'supermemory:learnings+decisions',
        intent: parsed.intent,
      };
      
    case 'decision_rationale':
      return {
        results: await recall(query, { container: 'decisions', limit: 3 }),
        source: useLocalFallback ? 'local:decisions' : 'supermemory:decisions',
        intent: parsed.intent,
      };
      
    default:
      return {
        results: await recall(query, { limit: 5 }),
        source: useLocalFallback ? 'local:all' : 'supermemory:all',
        intent: parsed.intent,
      };
  }
}

/**
 * Initialize the memory system
 */
export async function initMemory(): Promise<{ 
  status: 'ready' | 'error'; 
  message: string;
  mode?: 'api' | 'local';
  containers?: string[];
}> {
  try {
    const key = getApiKey();
    
    if (!key) {
      useLocalFallback = true;
      return {
        status: 'ready',
        message: 'Memory system ready (local fallback mode - no API key)',
        mode: 'local',
        containers: ['blake', 'slidetheory', 'decisions', 'learnings', 'sessions', 'people'],
      };
    }

    // Try API
    const testResult = await recall('test', { limit: 1 });
    
    return {
      status: 'ready',
      message: useLocalFallback 
        ? 'Memory system ready (local fallback mode - API unavailable)'
        : 'Memory system ready (Supermemory.ai connected)',
      mode: useLocalFallback ? 'local' : 'api',
      containers: ['blake', 'slidetheory', 'decisions', 'learnings', 'sessions', 'people'],
    };
  } catch (error) {
    useLocalFallback = true;
    return {
      status: 'ready',
      message: `Memory system ready (local fallback): ${error}`,
      mode: 'local',
      containers: ['blake', 'slidetheory', 'decisions', 'learnings', 'sessions', 'people'],
    };
  }
}

/**
 * Get statistics about stored memories
 */
export function getMemoryStats(): { total: number; byContainer: Record<string, number> } {
  const byContainer: Record<string, number> = {};
  
  for (const memory of localMemories) {
    byContainer[memory.container] = (byContainer[memory.container] || 0) + 1;
  }
  
  return {
    total: localMemories.length,
    byContainer,
  };
}

/**
 * Clear local memories (use with caution)
 */
export function clearLocalMemories(): void {
  localMemories = [];
  saveLocalMemories();
}

// Export client for advanced usage
export { client, SupermemoryClient, generateId };

// Re-export types
export * from './types.js';
