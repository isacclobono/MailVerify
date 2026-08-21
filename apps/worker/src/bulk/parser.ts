const EMAIL_REGEX = /[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;

export function parseEmailsMultiFormat(input: unknown, maxEmails = 500): string[] {
  if (!input) return [];

  const emailsSet = new Set<string>();

  // Helper to add matching email
  const addEmail = (str: string) => {
    if (emailsSet.size >= maxEmails) return;
    const matches = str.match(EMAIL_REGEX);
    if (matches) {
      for (const m of matches) {
        if (emailsSet.size >= maxEmails) break;
        emailsSet.add(m.trim().toLowerCase());
      }
    }
  };

  // 1. If input is an Array
  if (Array.isArray(input)) {
    for (const item of input) {
      if (emailsSet.size >= maxEmails) break;
      if (typeof item === "string") {
        addEmail(item);
      } else if (item && typeof item === "object") {
        findAndAddEmailsInObject(item as Record<string, unknown>, addEmail);
      }
    }
    return Array.from(emailsSet);
  }

  // 2. If input is an Object (e.g. { emails: [...] } or { data: [...] })
  if (typeof input === "object" && input !== null) {
    const obj = input as Record<string, unknown>;
    
    // Check common container keys: emails, data, list, items
    if (Array.isArray(obj.emails)) {
      return parseEmailsMultiFormat(obj.emails, maxEmails);
    }
    if (Array.isArray(obj.data)) {
      return parseEmailsMultiFormat(obj.data, maxEmails);
    }
    if (Array.isArray(obj.list)) {
      return parseEmailsMultiFormat(obj.list, maxEmails);
    }
    if (Array.isArray(obj.items)) {
      return parseEmailsMultiFormat(obj.items, maxEmails);
    }

    findAndAddEmailsInObject(obj, addEmail);
    return Array.from(emailsSet);
  }

  // 3. If input is a String (Text, CSV, TSV, JSON string)
  if (typeof input === "string") {
    const trimmed = input.trim();
    if (!trimmed) return [];

    // Check if it's a JSON string
    if (trimmed.startsWith("[") || trimmed.startsWith("{")) {
      try {
        const parsed = JSON.parse(trimmed);
        return parseEmailsMultiFormat(parsed, maxEmails);
      } catch {
        // Continue with text/csv parsing
      }
    }

    // Direct regex extraction across all text / CSV lines
    const matches = trimmed.match(EMAIL_REGEX);
    if (matches) {
      for (const m of matches) {
        if (emailsSet.size >= maxEmails) break;
        emailsSet.add(m.trim().toLowerCase());
      }
    }
  }

  return Array.from(emailsSet);
}

function findAndAddEmailsInObject(obj: Record<string, unknown>, addFn: (str: string) => void) {
  for (const [_, value] of Object.entries(obj)) {
    if (typeof value === "string") {
      addFn(value);
    } else if (Array.isArray(value)) {
      for (const v of value) {
        if (typeof v === "string") addFn(v);
      }
    }
  }
}
