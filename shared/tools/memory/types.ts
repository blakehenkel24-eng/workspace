/**
 * Memory System Types
 * 
 * TypeScript definitions for the hybrid memory architecture
 * combining Supermemory.ai + file-based notes + MEMORY.md
 */

// Container tags for organizing memories
export type MemoryContainer = 
  | 'blake'           // User profile and preferences
  | 'slidetheory'     // Project-specific knowledge
  | 'decisions'       // Key decisions with rationale
  | 'learnings'       // Lessons and insights
  | 'sessions'        // Session summaries
  | 'people'          // Relationships and contacts
  | 'system';         // System configuration

// Categories for filtering within containers
export type MemoryCategory =
  | 'preferences'
  | 'status'
  | 'technical-insight'
  | 'decision'
  | 'milestone'
  | 'contact'
  | 'session-summary'
  | 'bug-fix'
  | 'feature'
  | 'architecture'
  | 'communication';

// Confidence level for memory accuracy
export type ConfidenceLevel = 'low' | 'medium' | 'high' | 'certain';

// Source of the memory
export type MemorySource = 
  | 'explicit'        // User explicitly stated
  | 'inferred'        // Inferred from behavior
  | 'session'         // From daily session notes
  | 'commit'          // From code commits
  | 'document';       // From documents/files

// Metadata attached to each memory
export interface MemoryMetadata {
  category?: MemoryCategory;
  topics?: string[];
  confidence?: ConfidenceLevel;
  source?: MemorySource;
  sourceDate?: string;      // ISO date string
  expirationDate?: string;  // For time-sensitive memories
  relatedIds?: string[];    // IDs of related memories
  tags?: string[];
  [key: string]: any;       // Extensible
}

// Memory entry structure (matches Supermemory API)
export interface MemoryEntry {
  content: string;
  customId?: string;
  containerTag: MemoryContainer;
  metadata?: MemoryMetadata;
}

// Search options
export interface SearchOptions {
  container?: MemoryContainer;
  containers?: MemoryContainer[];
  category?: MemoryCategory;
  limit?: number;
  searchMode?: 'semantic' | 'keyword' | 'hybrid';
  threshold?: number;       // Similarity threshold (0-1)
  recencyBoost?: boolean;   // Boost recent memories
}

// Search result
export interface MemoryResult {
  id: string;
  content: string;
  container: MemoryContainer;
  metadata: MemoryMetadata;
  score: number;            // Relevance score
  createdAt: string;
}

// Store options
export interface StoreOptions {
  container: MemoryContainer;
  customId?: string;
  category?: MemoryCategory;
  topics?: string[];
  confidence?: ConfidenceLevel;
  source?: MemorySource;
  metadata?: Record<string, any>;
  preventDuplicates?: boolean;  // Check for similar content before storing
}

// User preference structure
export interface UserPreference {
  topic: string;
  value: string;
  confidence: ConfidenceLevel;
  firstObserved: string;
  lastConfirmed: string;
  sources: string[];
}

// Project status structure
export interface ProjectStatus {
  name: string;
  status: 'planning' | 'in-progress' | 'mvp' | 'live' | 'maintenance' | 'sunset';
  url?: string;
  repository?: string;
  stack: string[];
  goals?: string[];
  blockers?: string[];
  lastUpdated: string;
}

// Decision record
export interface DecisionRecord {
  decision: string;
  rationale: string;
  alternativesConsidered?: string[];
  date: string;
  context?: string;
  reversible: boolean;
  confidence: ConfidenceLevel;
}

// Learning/insight record
export interface LearningRecord {
  insight: string;
  context: string;
  date: string;
  category: string;
  impact: 'low' | 'medium' | 'high' | 'critical';
  relatedDecisions?: string[];
}

// Session summary for archival
export interface SessionSummary {
  date: string;
  focus: string;
  accomplishments: string[];
  decisions: DecisionRecord[];
  learnings: LearningRecord[];
  openThreads: string[];
  commits: string[];
  duration?: number;  // Minutes
}

// API Response types
export interface SupermemoryAddResponse {
  success: boolean;
  id?: string;
  error?: string;
}

export interface SupermemorySearchResponse {
  memories: MemoryResult[];
  total: number;
  query: string;
}

// Configuration
export interface MemoryConfig {
  apiKey: string;
  defaultContainer: MemoryContainer;
  defaultLimit: number;
  cacheEnabled: boolean;
  cacheTTL: number;  // Seconds
}

// Query intent for intelligent routing
export type QueryIntent =
  | 'user_preference'
  | 'project_status'
  | 'technical_knowledge'
  | 'recent_activity'
  | 'decision_rationale'
  | 'contact_info'
  | 'general_knowledge';

// Parsed query for routing
export interface ParsedQuery {
  intent: QueryIntent;
  keywords: string[];
  temporal?: 'recent' | 'past' | 'all';
  project?: string;
  person?: string;
}
