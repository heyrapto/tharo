import { describe, test, expect } from "@jest/globals";
import { Entities } from "../src/entities/index.js";

describe("entities.extract", () => {
  test("should extract mentions", () => {
    const text = "Remind @alice and @bob to check the status";
    const result = Entities.extract(text);
    expect(result.mentions).toEqual(["@alice", "@bob"]);
  });

  test("should extract tracking IDs", () => {
    const text = "Where is order ORD-12345?";
    const result = Entities.extract(text);
    expect(result.trackingId).toBe("ORD-12345");
  });

  test("should extract time", () => {
    const text = "Meeting at 2:30pm";
    const result = Entities.extract(text);
    expect(result.time).toBe("14:30");
  });

  test("should extract quantities", () => {
    expect(Entities.quantity("three apples")).toBe(3);
    expect(Entities.quantity("5 oranges")).toBe(5);
  });
});

describe("entities.date", () => {
  test("should extract relative dates", () => {
    const now = new Date();
    const result = Entities.date("tomorrow");
    expect(result).not.toBeNull();
    if (result) {
      const tomorrow = new Date();
      tomorrow.setDate(now.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0);
      expect(result.getTime()).toBe(tomorrow.getTime());
    }
  });
});
