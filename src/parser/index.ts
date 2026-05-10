import natural from "natural";
import type { ASTNode } from "../@types/index.js";

const { SentenceTokenizer, WordTokenizer } = natural;
const sentenceTokenizer = new SentenceTokenizer();
const wordTokenizer = new WordTokenizer();

// ─────────────────────────────────────────────
// PARSER
// ─────────────────────────────────────────────

/**
 * Parses input text into an Abstract Syntax Tree (AST)
 * allowing traversal of documents, sentences, and words.
 */
function parse(input: string): ASTNode {
  const sentences = sentenceTokenizer.tokenize(input) || [];

  return {
    type: "Document",
    value: input,
    children: sentences.map((sentence) => ({
      type: "Sentence",
      value: sentence,
      children: (wordTokenizer.tokenize(sentence) || []).map((word) => ({
        type: "Word",
        value: word,
      })),
    })),
  };
}

/**
 * Recursively traverses the AST and applies a callback function to each node.
 */
function traverse(node: ASTNode, callback: (node: ASTNode) => void) {
  callback(node);
  if (node.children) {
    node.children.forEach((child) => traverse(child, callback));
  }
}

/**
 * Extracts semantically self-sufficient statements from the AST.
 * Currently uses a heuristic based on token count to determine sufficiency.
 */
function extractSelfSufficientStatements(root: ASTNode): string[] {
  const statements: string[] = [];

  traverse(root, (node) => {
    if (node.type === "Sentence") {
      const words = node.children || [];
      // A naive check for "semantically self-sufficient" statement:
      // Must contain at least a minimal structure (e.g., subject-verb context, roughly >= 3 words).
      if (words.length >= 3) {
        statements.push(node.value);
      }
    }
  });

  return statements;
}

// ─────────────────────────────────────────────
// EXPORT
// ─────────────────────────────────────────────

export const Parser = {
  parse,
  traverse,
  extractSelfSufficientStatements,
} as const;
