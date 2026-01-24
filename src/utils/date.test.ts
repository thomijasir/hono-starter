import { describe, expect, it } from "bun:test";
import { nowDate, nowUnix } from "./date";

describe("Date Utils", () => {
  it("should return current date in ISO string format", () => {
    const date = nowDate();
    expect(date).toBeString();
    // Simple regex for ISO date
    expect(date).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
  });

  it("should return current unix timestamp", () => {
    const unix = nowUnix();
    expect(unix).toBeNumber();
    expect(unix).toBeGreaterThan(0);
  });
});
