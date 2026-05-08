import { describe, test, expect } from "@jest/globals";
import { intent } from "../src/intent/index.js";


describe("intent.analyze", () => {
  test("should detect greetings", () => {
    const result = intent.analyze("hello");
    expect(result.type).toBe("greeting");
    expect(result.action).toBe("chat");
  });

  test("should detect task creation", () => {
    const result = intent.analyze("remind me to buy milk tomorrow");
    expect(result.action).toBe("reminder");
    expect(result.type).toBe("task");
  });

  test("should detect viewing tasks", () => {
    const result = intent.analyze("show my tasks");
    expect(result.action).toBe("view");
    expect(result.type).toBe("task");
  });

  test("should detect deletion", () => {
    const result = intent.analyze("delete all my tasks");
    expect(result.action).toBe("delete");
    expect(result.scope).toBe("all");
  });
});
