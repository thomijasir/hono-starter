import { describe, expect, it } from "bun:test";
import {
  generateUUID,
  generateRandomString,
  generateRandomNumber,
} from "./generate";

describe("Generate Utils", () => {
  it("should generate a valid UUIDv7", () => {
    const uuid = generateUUID();
    expect(uuid).toBeString();
    expect(uuid.length).toBeGreaterThan(0);
  });

  it("should generate a random string of specified length", () => {
    const length = 10;
    const str = generateRandomString(length);
    expect(str).toBeString();
    expect(str).toHaveLength(length);
  });

  it("should generate a random number", () => {
    const num = generateRandomNumber();
    expect(num).toBeNumber();
    expect(num).toBeGreaterThanOrEqual(0);
    expect(num).toBeLessThan(1000000);
  });
});
