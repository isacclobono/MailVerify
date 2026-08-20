export const MAX_EMAIL_LENGTH = 254;
export const MAX_JSON_BODY_SIZE = 100 * 1024; // 100KB
export const MAX_CSV_SIZE = 2 * 1024 * 1024; // 2MB
export const MAX_BULK_EMAILS = 500;

export function validateEmailInput(input: unknown): { valid: boolean; email: string; error?: string } {
  if (!input || typeof input !== "object") {
    return { valid: false, email: "", error: "Missing request body" };
  }

  const { email } = input as { email?: unknown };

  if (typeof email !== "string" || !email.trim()) {
    return { valid: false, email: "", error: "Email field is required and must be a string." };
  }

  const trimmed = email.trim();
  if (trimmed.length > MAX_EMAIL_LENGTH) {
    return {
      valid: false,
      email: trimmed,
      error: `Email exceeds maximum allowed length of ${MAX_EMAIL_LENGTH} characters.`,
    };
  }

  return { valid: true, email: trimmed };
}
