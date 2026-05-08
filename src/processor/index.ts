import type { ShrinkOptions } from "../@types/index.js";

// ─────────────────────────────────────────────
// STOPWORDS
// ─────────────────────────────────────────────

// Extended English stopword list
const STOPWORDS = new Set([
  "a",
  "an",
  "the",
  "and",
  "or",
  "but",
  "in",
  "on",
  "at",
  "to",
  "for",
  "of",
  "with",
  "by",
  "from",
  "is",
  "was",
  "are",
  "were",
  "be",
  "been",
  "being",
  "have",
  "has",
  "had",
  "do",
  "does",
  "did",
  "will",
  "would",
  "could",
  "should",
  "may",
  "might",
  "shall",
  "can",
  "need",
  "dare",
  "it",
  "its",
  "this",
  "that",
  "these",
  "those",
  "i",
  "me",
  "my",
  "we",
  "our",
  "you",
  "your",
  "he",
  "she",
  "they",
  "them",
  "their",
  "who",
  "what",
  "which",
  "when",
  "where",
  "how",
  "if",
  "so",
  "as",
  "up",
  "out",
  "about",
  "into",
  "than",
  "then",
  "just",
  "also",
  "very",
  "too",
  "not",
  "no",
  "nor",
  "only",
  "even",
  "both",
  "few",
  "more",
  "most",
  "other",
  "some",
  "such",
  "own",
  "same",
  "while",
  "after",
  "before",
  "over",
  "again",
  "further",
  "once",
  "here",
  "there",
  "why",
  "all",
  "any",
  "each",
  "every",
  "both",
  "either",
  "neither",
]);

// ─────────────────────────────────────────────
// EMAIL SIGNATURE MARKERS
// ─────────────────────────────────────────────

const SIGNATURE_MARKERS: RegExp[] = [
  /^[-–—]{2,}\s*$/m,
  /^(?:best|regards|sincerely|thanks|thank you|cheers|yours|kind regards|warm regards),?\s*$/im,
  /^(?:sent from|get outlook|sent via)/im,
  /^unsubscribe\s+/im,
];

// ─────────────────────────────────────────────
// CORE FUNCTIONS
// ─────────────────────────────────────────────

/**
 * Removes common English stopwords from text, preserving word order.
 */
function removeStopwords(text: string): string {
  return text
    .split(/\s+/)
    .filter((word) => {
      const clean = word.toLowerCase().replace(/[^a-z]/g, "");
      return clean.length > 0 && !STOPWORDS.has(clean);
    })
    .join(" ")
    .trim();
}

/**
 * Normalizes multiple spaces, tabs, and newlines to single spaces.
 */
function normalizeWhitespace(text: string): string {
  return text.replace(/\s+/g, " ").trim();
}

/**
 * Removes email signatures and boilerplate footers from text.
 * Cuts everything from the first signature marker onward.
 */
function removeSignature(text: string): string {
  const lines = text.split("\n");
  for (let i = 0; i < lines.length; i++) {
    if (SIGNATURE_MARKERS.some((p) => p.test(lines[i]))) {
      return lines.slice(0, i).join("\n").trim();
    }
  }
  return text.trim();
}

/**
 * Estimates the number of tokens in text using the ~4 chars/token heuristic
 * (consistent with OpenAI and Anthropic tokenizer approximations for English).
 */
function countTokens(text: string): number {
  return Math.ceil(text.length / 4);
}

/**
 * Truncates text to a maximum token count, keeping the most recent content.
 * Useful for trimming conversation history before sending to an LLM.
 */
function truncate(text: string, maxTokens: number): string {
  const maxChars = maxTokens * 4;
  if (text.length <= maxChars) return text;

  // Keep the tail — most recent content is most valuable in chat history
  const trimmed = text.slice(text.length - maxChars);

  // Don't start mid-sentence — find the first full sentence boundary
  const firstSentence = trimmed.search(/[.!?\n]/);
  return firstSentence > 0
    ? trimmed.slice(firstSentence + 1).trim()
    : trimmed.trim();
}

/**
 * Full compression pipeline: removes signature, normalizes whitespace,
 * and strips stopwords. Reduces token count by 20–40% on typical messages.
 *
 * @param text - Raw input text
 * @param options - Optional flags to control which steps run (all enabled by default)
 */
function shrink(text: string, options: ShrinkOptions = {}): string {
  const {
    removeStopwords: doStopwords = true,
    normalizeWhitespace: doWhitespace = true,
    removeSignature: doSignature = true,
  } = options;

  let result = text;
  if (doSignature) result = removeSignature(result);
  if (doWhitespace) result = normalizeWhitespace(result);
  if (doStopwords) result = removeStopwords(result);
  return result;
}

// ─────────────────────────────────────────────
// EXPORT
// ─────────────────────────────────────────────

export const processor = {
  shrink,
  removeStopwords,
  normalizeWhitespace,
  removeSignature,
  countTokens,
  truncate,
} as const;
