export function extractEmailsFromCsv(csvText: string, maxEmails = 500): string[] {
  if (!csvText || typeof csvText !== "string") return [];

  const lines = csvText.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  if (lines.length === 0) return [];

  // Find column index for email if header is present
  const firstLineCols = lines[0].split(",").map((c) => c.trim().replace(/^["']|["']$/g, "").toLowerCase());
  let emailColIdx = firstLineCols.findIndex((col) => col.includes("email") || col.includes("mail"));

  let startIndex = 0;
  if (emailColIdx !== -1) {
    // Header found, skip first line
    startIndex = 1;
  } else {
    // No explicit email header; default to first column (index 0)
    emailColIdx = 0;
  }

  const emailsSet = new Set<string>();

  for (let i = startIndex; i < lines.length; i++) {
    if (emailsSet.size >= maxEmails) break;

    const row = lines[i];
    // Simple CSV parser handling quotes
    const cols = row.split(",").map((c) => c.trim().replace(/^["']|["']$/g, ""));
    const emailCandidate = cols[emailColIdx] || cols[0];

    if (emailCandidate && emailCandidate.includes("@")) {
      emailsSet.add(emailCandidate.trim());
    }
  }

  return Array.from(emailsSet);
}
