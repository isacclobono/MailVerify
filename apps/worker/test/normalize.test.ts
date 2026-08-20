import { describe, it, expect } from "vitest";
import { normalizeEmail } from "../src/verification/normalize";

describe("Email Normalization", () => {
  it("should trim whitespace and lowercase domain while preserving local casing", () => {
    const res = normalizeEmail("  User.Name@Example.COM  ");
    expect(res.isValidFormat).toBe(true);
    expect(res.normalized).toBe("User.Name@example.com");
    expect(res.domain).toBe("example.com");
    expect(res.localPart).toBe("User.Name");
  });

  it("should handle invalid inputs safely", () => {
    expect(normalizeEmail("").isValidFormat).toBe(false);
    expect(normalizeEmail("nodomain").isValidFormat).toBe(false);
  });
});
