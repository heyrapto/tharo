import { describe, test, expect } from "@jest/globals";
import { Processor } from "../src/processor/index.js";

describe("processor.shrink", () => {
  test("should remove stopwords", () => {
    const text = "This is a test of the emergency broadcast system";
    const result = Processor.shrink(text);
    // "test emergency broadcast system"
    expect(result).toContain("test");
    expect(result).toContain("emergency");
    expect(result).not.toContain("This");
    expect(result).not.toContain("the");
  });

  test("should remove email signatures", () => {
    const text = "Hello,\nHow are you?\n--\nBest regards,\nAlice";
    const result = Processor.removeSignature(text);
    expect(result).toBe("Hello,\nHow are you?");
  });

  test("should normalize whitespace", () => {
    const text = "Too   many    spaces";
    expect(Processor.normalizeWhitespace(text)).toBe("Too many spaces");
  });
});

describe("processor.truncate", () => {
  test("should truncate long text", () => {
    const text = "One. Two. Three. Four. Five.";
    // Approx 1 char per token for simple test
    const result = Processor.truncate(text, 2);
    expect(result.length).toBeLessThan(text.length);
  });
});
