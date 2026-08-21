import { describe, it, expect } from "vitest";
import { checkIsAdmin } from "../src/auth/sessions";

describe("Admin Authorization Check", () => {
  const adminConfig = "admin@example.com, owner@mailverify.dev ,superadmin@domain.org";

  it("identifies configured admin emails correctly", () => {
    expect(checkIsAdmin("admin@example.com", adminConfig)).toBe(true);
    expect(checkIsAdmin("owner@mailverify.dev", adminConfig)).toBe(true);
    expect(checkIsAdmin("superadmin@domain.org", adminConfig)).toBe(true);
  });

  it("handles case insensitivity for admin emails", () => {
    expect(checkIsAdmin("ADMIN@EXAMPLE.COM", adminConfig)).toBe(true);
    expect(checkIsAdmin("Owner@MailVerify.Dev", adminConfig)).toBe(true);
  });

  it("rejects non-admin emails", () => {
    expect(checkIsAdmin("user@example.com", adminConfig)).toBe(false);
    expect(checkIsAdmin("hacker@malicious.com", adminConfig)).toBe(false);
  });

  it("safely handles empty or missing admin config", () => {
    expect(checkIsAdmin("admin@example.com", undefined)).toBe(false);
    expect(checkIsAdmin("admin@example.com", "")).toBe(false);
    expect(checkIsAdmin("", adminConfig)).toBe(false);
  });
});
