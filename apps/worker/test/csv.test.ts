import { describe, it, expect } from "vitest";
import { parseEmailsMultiFormat } from "../src/bulk/parser";

describe("Multi-Format Email Extractor (DRY)", () => {
  it("should extract emails from standard CSV with headers", () => {
    const csv = `name,email,company\nAlice,alice@example.com,Acme\nBob,bob@example.com,Beta`;
    const emails = parseEmailsMultiFormat(csv);
    expect(emails).toEqual(["alice@example.com", "bob@example.com"]);
  });

  it("should extract emails from headerless CSV / plain text", () => {
    const text = `alice@example.com\nbob@example.com\ncarol@domain.io`;
    const emails = parseEmailsMultiFormat(text);
    expect(emails).toEqual(["alice@example.com", "bob@example.com", "carol@domain.io"]);
  });

  it("should extract emails from JSON string arrays", () => {
    const jsonStr = `["alice@example.com", "bob@example.com"]`;
    const emails = parseEmailsMultiFormat(jsonStr);
    expect(emails).toEqual(["alice@example.com", "bob@example.com"]);
  });

  it("should extract emails from JSON object arrays", () => {
    const jsonObjects = `[{"email": "alice@example.com", "name": "Alice"}, {"contact_email": "bob@example.com"}]`;
    const emails = parseEmailsMultiFormat(jsonObjects);
    expect(emails).toEqual(["alice@example.com", "bob@example.com"]);
  });

  it("should deduplicate emails and extract clean addresses from names", () => {
    const input = `"Alice <alice@example.com>"\nalice@example.com\nbob@example.com`;
    const emails = parseEmailsMultiFormat(input);
    expect(emails).toEqual(["alice@example.com", "bob@example.com"]);
  });
});
