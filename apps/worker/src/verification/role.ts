import { RoleCheck } from "./types";

const ROLE_PREFIXES = new Set<string>([
  "admin",
  "administrator",
  "support",
  "sales",
  "info",
  "contact",
  "help",
  "billing",
  "security",
  "noreply",
  "no-reply",
  "webmaster",
  "postmaster",
  "hostmaster",
  "marketing",
  "team",
  "jobs",
  "careers",
  "press",
  "media",
  "abuse",
  "legal",
  "compliance",
  "privacy",
  "office",
  "operations",
]);

export function checkRoleAccount(localPart: string): RoleCheck {
  if (!localPart) return "UNKNOWN";

  const normalized = localPart.toLowerCase();

  // Check exact match or prefix before + (e.g. support+test@example.com)
  const baseLocalPart = normalized.split("+")[0];

  if (ROLE_PREFIXES.has(baseLocalPart)) {
    return "ROLE_ACCOUNT";
  }

  return "PERSONAL_ACCOUNT_LIKELY";
}
