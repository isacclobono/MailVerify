import { SyntaxCheck } from "./types";

// Standard RFC-compliant clean regex that avoids ReDoS
const EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;

export function checkSyntax(email: string): SyntaxCheck {
  if (!email || typeof email !== "string") {
    return "FAIL";
  }

  // Length constraints
  if (email.length > 254) {
    return "FAIL";
  }

  const atIndex = email.lastIndexOf("@");
  if (atIndex <= 0 || atIndex === email.length - 1) {
    return "FAIL";
  }

  const localPart = email.slice(0, atIndex);
  const domain = email.slice(atIndex + 1);

  if (localPart.length > 64 || domain.length > 253) {
    return "FAIL";
  }

  // No consecutive dots or leading/trailing dots
  if (localPart.startsWith(".") || localPart.endsWith(".") || localPart.includes("..")) {
    return "FAIL";
  }
  if (domain.startsWith(".") || domain.endsWith(".") || domain.includes("..")) {
    return "FAIL";
  }

  // Must have at least one dot in domain and a valid TLD (at least 2 letters)
  const domainParts = domain.split(".");
  if (domainParts.length < 2) {
    return "FAIL";
  }
  const tld = domainParts[domainParts.length - 1];
  if (tld.length < 2 || !/^[a-zA-Z]+$/.test(tld)) {
    return "FAIL";
  }

  return EMAIL_REGEX.test(email) ? "PASS" : "FAIL";
}
