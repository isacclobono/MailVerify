import { describe, it, expect } from "vitest";
import { checkSyntax } from "../src/verification/syntax";

describe("Email Syntax Validation", () => {
  it("should PASS standard valid emails", () => {
    expect(checkSyntax("user@example.com")).toBe("PASS");
    expect(checkSyntax("first.last@company.org")).toBe("PASS");
    expect(checkSyntax("user+tag@domain.co.uk")).toBe("PASS");
    expect(checkSyntax("dev123@sub.domain.io")).toBe("PASS");
  });

  it("should FAIL invalid emails", () => {
    expect(checkSyntax("abc")).toBe("FAIL");
    expect(checkSyntax("@example.com")).toBe("FAIL");
    expect(checkSyntax("user@")).toBe("FAIL");
    expect(checkSyntax("abc@@example.com")).toBe("FAIL");
    expect(checkSyntax("user..name@example.com")).toBe("FAIL");
    expect(checkSyntax("user@domain..com")).toBe("FAIL");
    expect(checkSyntax("user@domain")).toBe("FAIL");
    expect(checkSyntax("")).toBe("FAIL");
  });

  it("should FAIL oversized emails", () => {
    const longLocalPart = "a".repeat(65);
    expect(checkSyntax(`${longLocalPart}@example.com`)).toBe("FAIL");
    const longDomain = "a".repeat(250) + ".com";
    expect(checkSyntax(`user@${longDomain}`)).toBe("FAIL");
  });
});
