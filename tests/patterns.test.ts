import { describe, test, expect } from "@jest/globals";
import { Patterns } from "../src/patterns/index.js";

describe("patterns.urgency", () => {
  test("should detect high urgency", () => {
    const messages = ["This is critical!", "I need it ASAP!"];
    expect(Patterns.urgency(messages)).toBe("high");
  });

  test("should detect low urgency", () => {
    const messages = ["No rush on this", "whenever you can"];
    expect(Patterns.urgency(messages)).toBe("low");
  });
});

describe("patterns.style", () => {
  test("should detect formal style", () => {
    const messages = ["Please could you kindly assist me with this request?"];
    const style = Patterns.style(messages);
    expect(style.formal).toBeGreaterThan(0);
  });

  test("should detect casual style", () => {
    const messages = ["hey buddy sup", "lol cool"];
    const style = Patterns.style(messages);
    expect(style.casual).toBeGreaterThan(0);
  });
});
