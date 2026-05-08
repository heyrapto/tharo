import type { EntityMap } from "../@types/index.js";

// ─────────────────────────────────────────────
// REGEX PATTERNS
// ─────────────────────────────────────────────

const MENTION_PATTERN = /@[\w.+-]+/g;
const TRACKING_ID_PATTERN =
  /\b([A-Z]{2,}-\d{3,}|\b[A-Z]\d{4,}\b|\bORD-\w+|\bTRK-\w+|\bREF-\w+|\bINV-\w+|\bTKT-\w+)/g;

const TIME_PATTERNS: RegExp[] = [
  /\b(\d{1,2}):(\d{2})\s*(am|pm)?\b/i,
  /\b(\d{1,2})\s*(am|pm)\b/i,
  /\bat\s+(\d{1,2})(?::(\d{2}))?\s*(am|pm)?\b/i,
];

const WORD_NUMBERS: Record<string, number> = {
  zero: 0,
  one: 1,
  two: 2,
  three: 3,
  four: 4,
  five: 5,
  six: 6,
  seven: 7,
  eight: 8,
  nine: 9,
  ten: 10,
  eleven: 11,
  twelve: 12,
  thirteen: 13,
  fourteen: 14,
  fifteen: 15,
  sixteen: 16,
  seventeen: 17,
  eighteen: 18,
  nineteen: 19,
  twenty: 20,
  thirty: 30,
  forty: 40,
  fifty: 50,
  hundred: 100,
};

const RELATIVE_DATE_MAP: Record<string, number> = {
  today: 0,
  tonight: 0,
  tomorrow: 1,
  "day after tomorrow": 2,
  yesterday: -1,
};

const WEEKDAY_MAP: Record<string, number> = {
  sunday: 0,
  monday: 1,
  tuesday: 2,
  wednesday: 3,
  thursday: 4,
  friday: 5,
  saturday: 6,
};

// ─────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────

function startOfDay(d: Date): Date {
  const copy = new Date(d);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

function addDays(d: Date, n: number): Date {
  const copy = new Date(d);
  copy.setDate(copy.getDate() + n);
  return copy;
}

// ─────────────────────────────────────────────
// DATE EXTRACTION
// ─────────────────────────────────────────────

/**
 * Extracts a date from natural language text.
 * Returns a Date object or null if none found.
 */
function date(text: string): Date | null {
  const clean = text.toLowerCase().trim();
  const now = new Date();

  // Relative keywords
  for (const [phrase, offset] of Object.entries(RELATIVE_DATE_MAP)) {
    if (clean.includes(phrase)) {
      return startOfDay(addDays(now, offset));
    }
  }

  // "next <weekday>" or "this <weekday>"
  const nextWeekdayMatch = clean.match(
    /\b(?:next|this)\s+(sunday|monday|tuesday|wednesday|thursday|friday|saturday)\b/i,
  );
  if (nextWeekdayMatch) {
    const target = WEEKDAY_MAP[nextWeekdayMatch[1].toLowerCase()];
    const current = now.getDay();
    const diff = (target - current + 7) % 7 || 7;
    return startOfDay(addDays(now, diff));
  }

  // "in X days/weeks"
  const inXDaysMatch = clean.match(
    /\bin\s+(\d+|one|two|three|four|five|six|seven)\s+(day|days|week|weeks)\b/i,
  );
  if (inXDaysMatch) {
    const n =
      parseInt(inXDaysMatch[1]) ||
      WORD_NUMBERS[inXDaysMatch[1].toLowerCase()] ||
      1;
    const isWeek = /weeks?/i.test(inXDaysMatch[2]);
    return startOfDay(addDays(now, isWeek ? n * 7 : n));
  }

  // ISO / common date formats: 2025-05-24 or 24/05/2025 or May 24 or 24 May
  const isoMatch = clean.match(/\b(\d{4})-(\d{2})-(\d{2})\b/);
  if (isoMatch) {
    const d = new Date(
      parseInt(isoMatch[1]),
      parseInt(isoMatch[2]) - 1,
      parseInt(isoMatch[3]),
    );
    if (!isNaN(d.getTime())) return d;
  }

  const slashMatch = clean.match(/\b(\d{1,2})\/(\d{1,2})\/(\d{4})\b/);
  if (slashMatch) {
    const d = new Date(
      parseInt(slashMatch[3]),
      parseInt(slashMatch[1]) - 1,
      parseInt(slashMatch[2]),
    );
    if (!isNaN(d.getTime())) return d;
  }

  const MONTHS = [
    "january",
    "february",
    "march",
    "april",
    "may",
    "june",
    "july",
    "august",
    "september",
    "october",
    "november",
    "december",
  ];
  const MONTHS_SHORT = [
    "jan",
    "feb",
    "mar",
    "apr",
    "may",
    "jun",
    "jul",
    "aug",
    "sep",
    "oct",
    "nov",
    "dec",
  ];

  for (let i = 0; i < MONTHS.length; i++) {
    const monthName = MONTHS[i];
    const monthShort = MONTHS_SHORT[i];
    const regex = new RegExp(
      `\\b(${monthName}|${monthShort})\\s+(\\d{1,2})(?:st|nd|rd|th)?(?:,?\\s*(\\d{4}))?\\b`,
      "i",
    );
    const m = clean.match(regex);
    if (m) {
      const year = m[3] ? parseInt(m[3]) : now.getFullYear();
      const d = new Date(year, i, parseInt(m[2]));
      if (!isNaN(d.getTime())) return d;
    }

    const regexAlt = new RegExp(
      `\\b(\\d{1,2})(?:st|nd|rd|th)?\\s+(${monthName}|${monthShort})(?:,?\\s*(\\d{4}))?\\b`,
      "i",
    );
    const mAlt = clean.match(regexAlt);
    if (mAlt) {
      const year = mAlt[3] ? parseInt(mAlt[3]) : now.getFullYear();
      const d = new Date(year, i, parseInt(mAlt[1]));
      if (!isNaN(d.getTime())) return d;
    }
  }

  return null;
}

// ─────────────────────────────────────────────
// TIME EXTRACTION
// ─────────────────────────────────────────────

/**
 * Extracts a normalized time string (HH:MM) from text, or null.
 */
function time(text: string): string | null {
  const clean = text.toLowerCase();

  for (const pattern of TIME_PATTERNS) {
    const match = clean.match(pattern);
    if (!match) continue;

    let hours = parseInt(match[1] ?? match[2]);
    const minutes = parseInt(match[2] ?? "0") || 0;
    const meridiem = (match[3] ?? "").toLowerCase();

    if (meridiem === "pm" && hours < 12) hours += 12;
    if (meridiem === "am" && hours === 12) hours = 0;

    if (hours >= 0 && hours <= 23 && minutes >= 0 && minutes <= 59) {
      return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
    }
  }

  // "noon" / "midnight"
  if (/\bnoon\b/.test(clean)) return "12:00";
  if (/\bmidnight\b/.test(clean)) return "00:00";

  return null;
}

// ─────────────────────────────────────────────
// MENTIONS EXTRACTION
// ─────────────────────────────────────────────

/**
 * Extracts all @mentions from text.
 */
function mentions(text: string): string[] {
  return text.match(MENTION_PATTERN) ?? [];
}

// ─────────────────────────────────────────────
// TRACKING ID EXTRACTION
// ─────────────────────────────────────────────

/**
 * Extracts the first tracking/order/reference ID from text, or null.
 */
function trackingId(text: string): string | null {
  const matches = text.match(TRACKING_ID_PATTERN);
  return matches?.[0] ?? null;
}

// ─────────────────────────────────────────────
// QUANTITY EXTRACTION
// ─────────────────────────────────────────────

/**
 * Extracts the first numeric or word-number quantity from text, or null.
 */
function quantity(text: string): number | null {
  const clean = text.toLowerCase();

  // Digit first
  const digitMatch = clean.match(/\b(\d+)\b/);
  if (digitMatch) return parseInt(digitMatch[1]);

  // Word numbers
  for (const [word, value] of Object.entries(WORD_NUMBERS)) {
    if (new RegExp(`\\b${word}\\b`).test(clean)) return value;
  }

  return null;
}

// ─────────────────────────────────────────────
// FULL EXTRACT
// ─────────────────────────────────────────────

/**
 * Extracts all entity types from text in a single pass.
 */
function extract(text: string): EntityMap {
  return {
    date: date(text),
    time: time(text),
    mentions: mentions(text),
    trackingId: trackingId(text),
    quantity: quantity(text),
  };
}

// ─────────────────────────────────────────────
// EXPORT
// ─────────────────────────────────────────────

export const entities = {
  extract,
  date,
  time,
  mentions,
  trackingId,
  quantity,
} as const;
