import { describe, it, expect } from "vitest";
import { calculateScore } from "../src/verification/scoring";
import { VerificationChecks } from "../src/verification/types";

describe("Email Scoring Engine", () => {
  it("should score DELIVERABLE for clean standard emails", () => {
    const checks: VerificationChecks = {
      syntax: "PASS",
      domain: "DOMAIN_EXISTS",
      mx: "MX_FOUND",
      spf: "SPF_PRESENT",
      dmarc: "DMARC_PRESENT",
      disposable: "NOT_DISPOSABLE",
      role: "PERSONAL_ACCOUNT_LIKELY",
      catch_all: "UNKNOWN",
      smtp: "UNKNOWN",
    };

    const res = calculateScore(checks);
    expect(res.verdict).toBe("LIKELY_DELIVERABLE");
    expect(res.score).toBe(0);
  });

  it("should score INVALID_SYNTAX when syntax check fails", () => {
    const checks: VerificationChecks = {
      syntax: "FAIL",
      domain: "UNKNOWN",
      mx: "UNKNOWN",
      spf: "UNKNOWN",
      dmarc: "UNKNOWN",
      disposable: "UNKNOWN",
      role: "UNKNOWN",
      catch_all: "UNKNOWN",
      smtp: "UNKNOWN",
    };

    const res = calculateScore(checks);
    expect(res.verdict).toBe("INVALID_SYNTAX");
    expect(res.score).toBe(100);
  });

  it("should score DISPOSABLE when domain is disposable", () => {
    const checks: VerificationChecks = {
      syntax: "PASS",
      domain: "DOMAIN_EXISTS",
      mx: "MX_FOUND",
      spf: "SPF_PRESENT",
      dmarc: "DMARC_PRESENT",
      disposable: "DISPOSABLE",
      role: "PERSONAL_ACCOUNT_LIKELY",
      catch_all: "UNKNOWN",
      smtp: "UNKNOWN",
    };

    const res = calculateScore(checks);
    expect(res.verdict).toBe("DISPOSABLE");
    expect(res.score).toBe(95);
  });

  it("should score NO_MX when domain has no MX", () => {
    const checks: VerificationChecks = {
      syntax: "PASS",
      domain: "DOMAIN_EXISTS",
      mx: "NO_MX",
      spf: "SPF_PRESENT",
      dmarc: "DMARC_PRESENT",
      disposable: "NOT_DISPOSABLE",
      role: "PERSONAL_ACCOUNT_LIKELY",
      catch_all: "UNKNOWN",
      smtp: "UNKNOWN",
    };

    const res = calculateScore(checks);
    expect(res.verdict).toBe("NO_MX");
    expect(res.score).toBe(90);
  });

  it("should classify ROLE_ACCOUNT correctly", () => {
    const checks: VerificationChecks = {
      syntax: "PASS",
      domain: "DOMAIN_EXISTS",
      mx: "MX_FOUND",
      spf: "SPF_PRESENT",
      dmarc: "DMARC_PRESENT",
      disposable: "NOT_DISPOSABLE",
      role: "ROLE_ACCOUNT",
      catch_all: "UNKNOWN",
      smtp: "UNKNOWN",
    };

    const res = calculateScore(checks);
    expect(res.verdict).toBe("ROLE_ACCOUNT");
  });
});
