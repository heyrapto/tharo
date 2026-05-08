import type { RedactedString } from "../@types/index.js";

// ─────────────────────────────────────────────
// REGEX PATTERNS
// ─────────────────────────────────────────────

const PII_PATTERNS = {
  email: /\b[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}\b/g,
  phone: /(\+?\d{1,3}[\s\-.]?)?\(?\d{3}\)?[\s\-.]?\d{3}[\s\-.]?\d{4}\b/g,
  creditCard: /\b(?:\d[ \-]?){13,16}\b/g,
  ssn: /\b\d{3}[-\s]?\d{2}[-\s]?\d{4}\b/g,
  ipAddress: /\b(?:\d{1,3}\.){3}\d{1,3}\b/g,
  postcode: /\b[A-Z]{1,2}\d[A-Z\d]?\s?\d[A-Z]{2}\b/gi, // UK postcodes
  zipcode: /\b\d{5}(?:-\d{4})?\b/g, // US ZIP codes
} as const;

const INJECTION_PHRASES: string[] = [
  "ignore all previous instructions",
  "ignore previous instructions",
  "ignore your instructions",
  "disregard previous",
  "forget your instructions",
  "override instructions",
  "you are now",
  "act as if",
  "pretend you are",
  "pretend to be",
  "roleplay as",
  "new persona",
  "jailbreak",
  "dan mode",
  "developer mode",
  "god mode",
  "bypass",
  "do anything now",
  "no restrictions",
  "without restrictions",
  "unrestricted mode",
  "system prompt",
  "your true self",
];

const PROFANITY_LIST: string[] = [
  "fuck",
  "shit",
  "asshole",
  "bastard",
  "bitch",
  "cunt",
  "damn",
  "dick",
  "piss",
  "crap",
  "bloody hell",
  "bullshit",
  "motherfucker",
  "jackass",
  "idiot",
  "moron",
  "imbecile",
  "retard",
  "loser",
];

// ─────────────────────────────────────────────
// CORE FUNCTIONS
// ─────────────────────────────────────────────

/**
 * Detects prompt injection or jailbreak attempts.
 */
function isInjection(text: string): boolean {
  const clean = text.toLowerCase();
  return INJECTION_PHRASES.some((phrase) => clean.includes(phrase));
}

/**
 * Masks all email addresses in text.
 */
function maskEmail(text: string): RedactedString {
  return text.replace(PII_PATTERNS.email, "[EMAIL]");
}

/**
 * Masks all phone numbers in text.
 */
function maskPhone(text: string): RedactedString {
  return text.replace(PII_PATTERNS.phone, "[PHONE]");
}

/**
 * Masks all credit card numbers in text.
 */
function maskCreditCard(text: string): RedactedString {
  // Avoid masking years (4 digits alone) — only match sequences clearly card-like
  return text.replace(PII_PATTERNS.creditCard, (match) => {
    const digits = match.replace(/\D/g, "");
    return digits.length >= 13 ? "[CREDIT_CARD]" : match;
  });
}

/**
 * Masks all SSNs, IP addresses, postcodes, and ZIP codes in text.
 */
function maskPII(text: string): RedactedString {
  let result = text;
  result = result.replace(PII_PATTERNS.email, "[EMAIL]");
  result = result.replace(PII_PATTERNS.phone, "[PHONE]");
  result = result.replace(PII_PATTERNS.ssn, "[SSN]");
  result = result.replace(PII_PATTERNS.ipAddress, "[IP_ADDRESS]");
  // Credit card with digit-length guard
  result = result.replace(PII_PATTERNS.creditCard, (match) => {
    const digits = match.replace(/\D/g, "");
    return digits.length >= 13 ? "[CREDIT_CARD]" : match;
  });
  return result;
}

/**
 * Checks for profanity or toxic language in text.
 */
function isProfane(text: string): boolean {
  const clean = text.toLowerCase();
  return PROFANITY_LIST.some((word) => {
    const pattern = new RegExp(`\\b${word}\\b`, "i");
    return pattern.test(clean);
  });
}

/**
 * Runs all PII masking and injection flagging in one pass.
 * If an injection is detected the string is prefixed with [INJECTION_ATTEMPT].
 */
function sanitize(text: string): RedactedString {
  let result = maskPII(text);
  if (isInjection(text)) {
    result = `[INJECTION_ATTEMPT] ${result}`;
  }
  return result;
}

// ─────────────────────────────────────────────
// EXPORT
// ─────────────────────────────────────────────

export const guard = {
  sanitize,
  isInjection,
  maskPII,
  maskEmail,
  maskPhone,
  maskCreditCard,
  isProfane,
} as const;
