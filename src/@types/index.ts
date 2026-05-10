// ─────────────────────────────────────────────
// SHARED TYPES
// ─────────────────────────────────────────────

export type UrgencyLevel = "high" | "medium" | "low";

export type IntentType =
  | "task"
  | "conversation"
  | "greeting"
  | "information"
  | "unknown";

export type ActionType =
  | "create"
  | "delete"
  | "view"
  | "update"
  | "complete"
  | "reminder"
  | "chat"
  | "unknown";

export type ScopeType = "all" | "single" | "team";

// ─────────────────────────────────────────────
// INTENT TYPES
// ─────────────────────────────────────────────

export interface IntentResult {
  type: IntentType;
  action: ActionType;
  scope: ScopeType;
  confidence: number;
}

export interface ActionScores {
  creation: number;
  deletion: number;
  viewing: number;
  completion: number;
  update: number;
  reminder: number;
}

export interface IntentScore {
  scores: ActionScores;
  primaryAction: ActionType;
  isAllScope: boolean;
  hasTaskObjects: boolean;
  allScopeScore: number;
  singleScopeScore: number;
}

// ─────────────────────────────────────────────
// PATTERNS TYPES
// ─────────────────────────────────────────────

export interface CommunicationStyle {
  formal: number;
  casual: number;
  detailed: number;
  concise: number;
}

export interface TimePreferences {
  prefersMorning: boolean;
  prefersAfternoon: boolean;
  prefersEvening: boolean;
  prefersWeekdays: boolean;
  prefersWeekends: boolean;
}

export interface TaskPreferences {
  prefersTeamTasks: boolean;
  prefersDetailedTasks: boolean;
  prefersQuickTasks: boolean;
  prefersReminders: boolean;
}

export interface UserProfile {
  urgency: UrgencyLevel;
  style: CommunicationStyle;
  time: TimePreferences;
  taskPrefs: TaskPreferences;
}

export interface ConversationMessage {
  role: "user" | "assistant";
  content: string;
}

export interface ConversationContext {
  userPatterns?: UserProfile;
  [key: string]: unknown;
}

export interface Conversation {
  history: ConversationMessage[];
  context: ConversationContext;
}

// ─────────────────────────────────────────────
// ENTITIES TYPES
// ─────────────────────────────────────────────

export interface EntityMap {
  date: Date | null;
  time: string | null;
  mentions: string[];
  trackingId: string | null;
  quantity: number | null;
}

// ─────────────────────────────────────────────
// GUARD TYPES
// ─────────────────────────────────────────────

export type RedactedString = string;

// ─────────────────────────────────────────────
// PROCESSOR TYPES
// ─────────────────────────────────────────────

export interface ShrinkOptions {
  removeStopwords?: boolean;
  normalizeWhitespace?: boolean;
  removeSignature?: boolean;
}

// ─────────────────────────────────────────────
// PARSER TYPES
// ─────────────────────────────────────────────

export interface ASTNode {
  type: "Document" | "Sentence" | "Word" | string;
  value: string;
  children?: ASTNode[];
}

// ─────────────────────────────────────────────
// CLASSIFIER TYPES
// ─────────────────────────────────────────────

export interface ClassificationResult {
  label: string;
  value: number;
}
