import natural from "natural";
import type {
  IntentResult,
  IntentScore,
  ActionScores,
  ActionType,
  IntentType,
  ScopeType,
} from "../@types/index.js";

const { WordTokenizer } = natural;
const tokenizer = new WordTokenizer();

// ─────────────────────────────────────────────
// KEYWORD BANKS
// ─────────────────────────────────────────────

const KEYWORDS = {
  action: {
    creation: [
      "create",
      "add",
      "make",
      "new",
      "schedule",
      "set",
      "plan",
      "book",
      "arrange",
      "assign",
      "put",
      "insert",
      "build",
      "start",
      "setup",
      "remind",
    ],
    deletion: [
      "delete",
      "remove",
      "clear",
      "erase",
      "cancel",
      "drop",
      "wipe",
      "destroy",
      "purge",
      "clean",
    ],
    viewing: [
      "show",
      "list",
      "view",
      "see",
      "display",
      "check",
      "get",
      "retrieve",
      "find",
      "search",
      "look",
      "what",
      "give",
    ],
    completion: [
      "complete",
      "finish",
      "done",
      "mark",
      "tick",
      "close",
      "resolve",
      "accomplish",
      "end",
      "check",
    ],
    update: [
      "update",
      "change",
      "edit",
      "modify",
      "reschedule",
      "move",
      "rename",
      "adjust",
      "fix",
      "correct",
      "shift",
    ],
    reminder: [
      "remind",
      "reminder",
      "alert",
      "notify",
      "notification",
      "ping",
      "flag",
    ],
  },
  scope: {
    all: ["all", "every", "everything", "entire", "whole", "each", "any"],
    single: [
      "this",
      "that",
      "the",
      "my",
      "a",
      "one",
      "it",
      "specific",
      "particular",
    ],
    team: ["team", "everyone", "group", "shared", "us", "we", "our"],
  },
  objects: {
    task: [
      "task",
      "tasks",
      "todo",
      "todos",
      "item",
      "items",
      "assignment",
      "job",
      "work",
      "chore",
    ],
    event: [
      "event",
      "events",
      "meeting",
      "meetings",
      "appointment",
      "appointments",
      "schedule",
      "session",
      "call",
      "standup",
      "sync",
    ],
    time: [
      "today",
      "tomorrow",
      "yesterday",
      "morning",
      "afternoon",
      "evening",
      "night",
      "week",
      "monday",
      "tuesday",
      "wednesday",
      "thursday",
      "friday",
      "saturday",
      "sunday",
      "am",
      "pm",
    ],
  },
  greeting: [
    "hi",
    "hey",
    "hello",
    "howdy",
    "sup",
    "greetings",
    "yo",
    "hiya",
    "morning",
    "afternoon",
    "evening",
  ],
} as const;

const PROXIMITY_WINDOW = 3;

// ─────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────

function tokenize(text: string): string[] {
  return tokenizer.tokenize(text.toLowerCase()) ?? [];
}

function areNearby(indexA: number, indexB: number): boolean {
  return Math.abs(indexA - indexB) <= PROXIMITY_WINDOW;
}

// ─────────────────────────────────────────────
// VIEW PATTERNS
// ─────────────────────────────────────────────

const VIEW_PATTERNS: RegExp[] = [
  /^(?:show|display|list|view|see|check|what)\s+(?:my\s+|the\s+|all\s+)?(?:tasks?|schedule|appointments?|events?|todos?)/i,
  /^(?:what|how)\s+(?:do\s+i\s+have|are|is)\s+(?:my|the|any)\s+(?:tasks?|schedule|appointments?|events?)/i,
  /^(?:tasks?|schedule|appointments?|events?)\s+(?:for|on|today|tomorrow|this\s+week)/i,
  /^(?:get|retrieve|give\s+me)\s+(?:my\s+)?(?:tasks?|schedule|events?|appointments?)/i,
];

const DELETE_PATTERNS: RegExp[] = [
  /^(?:delete|remove|clear|erase|cancel)\s+(?:my\s+|the\s+|all\s+|every\s+|everything\s*)?(?:tasks?|schedule|appointments?|events?|todos?)?/i,
  /^(?:delete|remove|clear|erase|cancel)\s+(?:all|every|everything)/i,
  /(?:wipe|purge|clean)\s+(?:my\s+)?(?:tasks?|schedule|all|everything)/i,
];

const COMPLETE_PATTERNS: RegExp[] = [
  /^(?:complete|finish|done|mark\s+(?:as\s+)?done|check\s+off)\s+(?:my\s+|the\s+|all\s+)?(?:tasks?|todos?|items?)?/i,
  /^(?:mark|set)\s+(?:all\s+)?(?:tasks?|todos?)\s+(?:as\s+)?(?:done|complete|finished)/i,
];

const UPDATE_PATTERNS: RegExp[] = [
  /^(?:update|change|modify|edit|reschedule|move)\s+(?:my\s+|the\s+)?(?:task|schedule|appointment|event|meeting)/i,
  /^(?:change|modify|edit)\s+(?:the\s+)?(?:time|date|duration|location|title|name)/i,
  /^(?:reschedule|move)\s+(?:my\s+)?(?:meeting|appointment|event|task)/i,
];

const REMINDER_PATTERNS: RegExp[] = [
  /^(?:remind|reminder|alert|notify)\s+(?:me|us)/i,
  /^(?:set\s+(?:a\s+)?(?:reminder|alert)|create\s+(?:a\s+)?(?:reminder|alert))/i,
  /^(?:don'?t\s+let\s+me\s+forget|make\s+sure\s+(?:i|we)\s+(?:don'?t\s+forget|remember))/i,
];

const GREETING_PATTERNS: RegExp[] = [
  /^(?:hi|hey|hello|howdy|sup|yo|hiya)[\s!.,?]*$/i,
  /^(?:good\s+)?(?:morning|afternoon|evening)[\s!.,?]*$/i,
  /^(?:what'?s\s+up|how\s+(?:are\s+you|is\s+it\s+going|goes\s+it))[\s!.,?]*$/i,
];

// ─────────────────────────────────────────────
// CORE FUNCTIONS
// ─────────────────────────────────────────────

/**
 * Returns raw token-level scoring for all action categories.
 */
function score(text: string): IntentScore {
  const tokens = tokenize(text);

  const scores: ActionScores = {
    creation: 0,
    deletion: 0,
    viewing: 0,
    completion: 0,
    update: 0,
    reminder: 0,
  };

  let allScopeScore = 0;
  let singleScopeScore = 0;
  let hasTaskObjects = false;

  tokens.forEach((token, index) => {
    // Score each action category
    (
      Object.keys(KEYWORDS.action) as Array<keyof typeof KEYWORDS.action>
    ).forEach((action) => {
      if (KEYWORDS.action[action].includes(token as never)) {
        scores[action] += 1;

        // Boost score when scope words are nearby
        tokens.forEach((other, otherIndex) => {
          if (!areNearby(index, otherIndex)) return;
          if (KEYWORDS.scope.all.includes(other as never)) allScopeScore += 2;
          if (KEYWORDS.scope.single.includes(other as never))
            singleScopeScore += 1;
        });
      }
    });

    // Detect task/event objects — boosts whichever action already has the highest score
    if (
      KEYWORDS.objects.task.includes(token as never) ||
      KEYWORDS.objects.event.includes(token as never)
    ) {
      hasTaskObjects = true;
      (Object.keys(scores) as Array<keyof ActionScores>).forEach((key) => {
        if (scores[key] > 0) scores[key] += 0.5;
      });
    }
  });

  // Determine primary action by highest score
  const entries = Object.entries(scores) as [keyof ActionScores, number][];
  const maxScore = Math.max(...entries.map(([, v]) => v));
  const primaryEntry = entries.find(([, v]) => v === maxScore);
  const primaryAction: ActionType =
    maxScore > 0 ? ((primaryEntry?.[0] as ActionType) ?? "unknown") : "unknown";

  return {
    scores,
    primaryAction,
    isAllScope: allScopeScore > singleScopeScore,
    hasTaskObjects,
    allScopeScore,
    singleScopeScore,
  };
}

/**
 * Returns a structured intent result for use in agent routing logic.
 */
function analyze(text: string): IntentResult {
  const clean = text.trim();

  // Greeting check first — fastest path
  if (GREETING_PATTERNS.some((p) => p.test(clean))) {
    return {
      type: "greeting",
      action: "chat",
      scope: "single",
      confidence: 1.0,
    };
  }

  // Boolean helpers in priority order
  if (isDelete(clean)) {
    const allScope = /(?:all|every|everything)/i.test(clean);
    const teamScope = /(?:team|shared|group)/i.test(clean);
    return {
      type: "task",
      action: "delete",
      scope: allScope ? "all" : teamScope ? "team" : "single",
      confidence: 0.9,
    };
  }

  if (isComplete(clean)) {
    return {
      type: "task",
      action: "complete",
      scope: /(?:all|every)/i.test(clean) ? "all" : "single",
      confidence: 0.9,
    };
  }

  if (isReminder(clean)) {
    return {
      type: "task",
      action: "reminder",
      scope: "single",
      confidence: 0.85,
    };
  }

  if (isUpdate(clean)) {
    return {
      type: "task",
      action: "update",
      scope: "single",
      confidence: 0.85,
    };
  }

  if (isView(clean)) {
    return { type: "task", action: "view", scope: "all", confidence: 0.9 };
  }

  if (isCreate(clean)) {
    const teamScope = /(?:team|@\w+|everyone|group)/i.test(clean);
    return {
      type: "task",
      action: "create",
      scope: teamScope ? "team" : "single",
      confidence: 0.85,
    };
  }

  // Fall back to scoring
  const scored = score(clean);
  if (
    scored.primaryAction !== "unknown" &&
    Math.max(...Object.values(scored.scores)) >= 1
  ) {
    const type: IntentType = scored.hasTaskObjects ? "task" : "conversation";
    const scope: ScopeType = scored.isAllScope ? "all" : "single";
    const confidence = Math.min(
      0.5 + Math.max(...Object.values(scored.scores)) * 0.1,
      0.8,
    );
    return { type, action: scored.primaryAction, scope, confidence };
  }

  return {
    type: "conversation",
    action: "chat",
    scope: "single",
    confidence: 1.0,
  };
}

// ─────────────────────────────────────────────
// BOOLEAN HELPERS
// ─────────────────────────────────────────────

function isView(text: string): boolean {
  return VIEW_PATTERNS.some((p) => p.test(text.trim()));
}

function isCreate(text: string): boolean {
  const tokens = tokenize(text);
  const hasCreationWord = KEYWORDS.action.creation.some((w) =>
    tokens.includes(w),
  );
  const hasTimeOrObject =
    tokens.some((t) => KEYWORDS.objects.time.includes(t as never)) ||
    tokens.some(
      (t) =>
        KEYWORDS.objects.task.includes(t as never) ||
        KEYWORDS.objects.event.includes(t as never),
    );
  return hasCreationWord && hasTimeOrObject;
}

function isDelete(text: string): boolean {
  return DELETE_PATTERNS.some((p) => p.test(text.trim()));
}

function isUpdate(text: string): boolean {
  return UPDATE_PATTERNS.some((p) => p.test(text.trim()));
}

function isComplete(text: string): boolean {
  return COMPLETE_PATTERNS.some((p) => p.test(text.trim()));
}

function isReminder(text: string): boolean {
  return REMINDER_PATTERNS.some((p) => p.test(text.trim()));
}

// ─────────────────────────────────────────────
// EXPORT
// ─────────────────────────────────────────────

export const Intent = {
  analyze,
  score,
  isView,
  isCreate,
  isDelete,
  isUpdate,
  isComplete,
  isReminder,
} as const;
