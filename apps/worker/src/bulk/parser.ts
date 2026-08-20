export function parseEmailsMultiFormat(input: string | unknown, maxEmails = 500): string[] {
  if (!input) return [];

  const emailsSet = new Set<string>();

  // 1. If input is already an array or parsed object
  if (Array.isArray(input)) {
    for (const item of input) {
      if (emailsSet.size >= maxEmails) break;
      if (typeof item === "string" && item.includes("@")) {
        emailsSet.add(item.trim());
      } else if (item && typeof item === "object") {
        const candidate = findEmailInObject(item as Record<string, unknown>);
        if (candidate) emailsSet.add(candidate);
      }
    }
    return Array.from(emailsSet);
  }

  // 2. If input is a string
  if (typeof input === "string") {
    const trimmed = input.trim();

    // Check if it's JSON
    if (trimmed.startsWith("[") || trimmed.startsWith("{")) {
      try {
        const parsed = JSON.parse(trimmed);
        return parseEmailsMultiFormat(parsed, maxEmails);
      } catch {
        // Not valid JSON, continue with text/CSV parsing
      }
    }

    // Parse as CSV / Delimited text
    const lines = trimmed.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
    if (lines.length === 0) return [];

    // Check if first line is a header
    const firstLineCols = lines[0].split(/[,\t;]/).map((c) => c.trim().replace(/^["']|["']$/g, "").toLowerCase());
    let emailColIdx = firstLineCols.findIndex((col) => col.includes("email") || col.includes("mail"));

    let startIndex = 0;
    if (emailColIdx !== -1) {
      startIndex = 1;
    } else {
      emailColIdx = 0;
    }

    for (let i = startIndex; i < lines.length; i++) {
      if (emailsSet.size >= maxEmails) break;
      const row = lines[i];
      const cols = row.split(/[,\t;]/).map((c) => c.trim().replace(/^["']|["']$/g, ""));
      const candidate = cols[emailColIdx] || cols[0];

      if (candidate && candidate.includes("@")) {
        // Extract plain email address in case of "Name <email@domain.com>" format
        const match = candidate.match(/[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
        if (match) {
          emailsSet.add(match[0].trim());
        }
      }
    }
  }

  return Array.from(emailsSet);
}

function findEmailInObject(obj: Record<string, unknown>): string | null {
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === "string" && (key.toLowerCase().includes("email") || key.toLowerCase().includes("mail") || value.includes("@"))) {
      const match = value.match(/[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
      if (match) return match[0].trim();
    }
  }
  return null;
}
