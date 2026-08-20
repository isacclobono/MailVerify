export function normalizeEmail(rawEmail: string): { normalized: string; localPart: string; domain: string; isValidFormat: boolean } {
  if (!rawEmail || typeof rawEmail !== "string") {
    return { normalized: "", localPart: "", domain: "", isValidFormat: false };
  }

  const trimmed = rawEmail.trim();
  const atIndex = trimmed.lastIndexOf("@");

  if (atIndex <= 0 || atIndex === trimmed.length - 1) {
    return { normalized: trimmed.toLowerCase(), localPart: "", domain: "", isValidFormat: false };
  }

  const localPart = trimmed.slice(0, atIndex);
  const domain = trimmed.slice(atIndex + 1).toLowerCase();

  // Combine preserved localPart with lowercased domain
  const normalized = `${localPart}@${domain}`;

  return {
    normalized,
    localPart,
    domain,
    isValidFormat: true,
  };
}
