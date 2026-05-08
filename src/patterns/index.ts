import type {
  UrgencyLevel,
  CommunicationStyle,
  TimePreferences,
  TaskPreferences,
  UserProfile,
  Conversation,
} from "../@types/index.js";

// ─────────────────────────────────────────────
// KEYWORD BANKS
// ─────────────────────────────────────────────

const URGENCY = {
  high: [
    "urgent",
    "urgently",
    "asap",
    "immediately",
    "now",
    "critical",
    "emergency",
    "right away",
    "straight away",
    "crucial",
    "priority",
    "swamped",
    "stuck",
    "blocked",
    "deadline",
  ],
  medium: [
    "soon",
    "quick",
    "quickly",
    "fast",
    "shortly",
    "whenever possible",
    "fairly soon",
    "at some point today",
  ],
  low: [
    "whenever",
    "eventually",
    "no rush",
    "no hurry",
    "take your time",
    "when you can",
    "at your convenience",
    "not urgent",
    "low priority",
    "someday",
  ],
} as const;

const STYLE = {
  formal: [
    "please",
    "would you",
    "could you",
    "kindly",
    "i would appreciate",
    "thank you",
    "regards",
    "sincerely",
    "dear",
    "i request",
    "furthermore",
    "therefore",
  ],
  casual: [
    "hey",
    "hi",
    "hello",
    "thanks",
    "cheers",
    "cool",
    "awesome",
    "great",
    "ok",
    "okay",
    "yeah",
    "yep",
    "nope",
    "lol",
    "btw",
    "fyi",
  ],
} as const;

const TIME = {
  morning: ["morning", "am", "dawn", "early", "breakfast"],
  afternoon: ["afternoon", "noon", "midday", "lunch", "pm"],
  evening: ["evening", "night", "tonight", "dusk", "dinner"],
  weekdays: [
    "weekday",
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "workday",
    "work day",
  ],
  weekends: ["weekend", "saturday", "sunday", "sat", "sun"],
} as const;

const TASK_PREF = {
  team: [
    "team",
    "everyone",
    "group",
    "shared",
    "assign",
    "colleague",
    "member",
  ],
  mentions: ["@"],
  detailed: [
    "detailed",
    "specific",
    "description",
    "in detail",
    "thoroughly",
    "full",
    "explain",
  ],
  quick: ["quick", "fast", "short", "brief", "simple", "easy", "small", "tiny"],
  reminder: [
    "remind",
    "reminder",
    "alert",
    "notify",
    "notification",
    "don't forget",
    "remember",
  ],
} as const;

// ─────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────

function joinMessages(messages: string[]): string {
  return messages.join(" ").toLowerCase();
}

function averageMessageLength(messages: string[]): number {
  if (messages.length === 0) return 0;
  return messages.reduce((sum, m) => sum + m.length, 0) / messages.length;
}

// ─────────────────────────────────────────────
// CORE FUNCTIONS
// ─────────────────────────────────────────────

/**
 * Detects urgency level from a list of messages.
 */
function urgency(messages: string[]): UrgencyLevel {
  const allText = joinMessages(messages);
  let score = 0;

  URGENCY.high.forEach((w) => {
    if (allText.includes(w)) score += 3;
  });
  URGENCY.medium.forEach((w) => {
    if (allText.includes(w)) score += 2;
  });
  URGENCY.low.forEach((w) => {
    if (allText.includes(w)) score -= 1;
  });

  // Caps lock or exclamation marks signal heightened urgency
  const capsRatio =
    messages
      .join(" ")
      .replace(/[^A-Za-z]/g, "")
      .split("")
      .filter((c) => c === c.toUpperCase()).length /
    Math.max(messages.join("").replace(/[^A-Za-z]/g, "").length, 1);
  if (capsRatio > 0.4) score += 2;

  const exclamations = (messages.join(" ").match(/!/g) ?? []).length;
  if (exclamations >= 2) score += 1;

  if (score >= 3) return "high";
  if (score >= 1) return "medium";
  return "low";
}

/**
 * Analyzes communication style from a list of messages.
 */
function style(messages: string[]): CommunicationStyle {
  const allText = joinMessages(messages);
  const avgLength = averageMessageLength(messages);

  const result: CommunicationStyle = {
    formal: 0,
    casual: 0,
    detailed: 0,
    concise: 0,
  };

  STYLE.formal.forEach((w) => {
    if (allText.includes(w)) result.formal += 1;
  });
  STYLE.casual.forEach((w) => {
    if (allText.includes(w)) result.casual += 1;
  });

  if (avgLength > 80) result.detailed += 1;
  if (avgLength > 150) result.detailed += 1;
  if (avgLength < 30) result.concise += 1;
  if (avgLength < 15) result.concise += 1;

  return result;
}

/**
 * Detects time-of-day and day-of-week preferences from messages.
 */
function time(messages: string[]): TimePreferences {
  const allText = joinMessages(messages);

  return {
    prefersMorning: TIME.morning.some((w) => allText.includes(w)),
    prefersAfternoon: TIME.afternoon.some((w) => allText.includes(w)),
    prefersEvening: TIME.evening.some((w) => allText.includes(w)),
    prefersWeekdays: TIME.weekdays.some((w) => allText.includes(w)),
    prefersWeekends: TIME.weekends.some((w) => allText.includes(w)),
  };
}

/**
 * Detects task style preferences from messages.
 */
function taskPrefs(messages: string[]): TaskPreferences {
  const allText = joinMessages(messages);

  return {
    prefersTeamTasks:
      TASK_PREF.team.some((w) => allText.includes(w)) || allText.includes("@"),
    prefersDetailedTasks: TASK_PREF.detailed.some((w) => allText.includes(w)),
    prefersQuickTasks: TASK_PREF.quick.some((w) => allText.includes(w)),
    prefersReminders: TASK_PREF.reminder.some((w) => allText.includes(w)),
  };
}

/**
 * Builds a full user profile from a conversation object.
 * Mutates conversation.context.userPatterns as a side effect.
 */
function profile(conversation: Conversation): UserProfile {
  const userMessages = conversation.history
    .filter((m) => m.role === "user")
    .map((m) => m.content);

  const result: UserProfile = {
    urgency: urgency(userMessages),
    style: style(userMessages),
    time: time(userMessages),
    taskPrefs: taskPrefs(userMessages),
  };

  conversation.context.userPatterns = result;
  return result;
}

// ─────────────────────────────────────────────
// EXPORT
// ─────────────────────────────────────────────

export const patterns = {
  urgency,
  style,
  time,
  taskPrefs,
  profile,
} as const;
