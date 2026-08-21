// Mapping of popular domains to their common typos and misspellings
const POPULAR_DOMAINS = [
  "gmail.com",
  "yahoo.com",
  "hotmail.com",
  "outlook.com",
  "icloud.com",
  "proton.me",
  "protonmail.com",
  "zoho.com",
  "aol.com",
  "live.com",
  "mail.com",
  "gmx.com",
  "yandex.com",
];

const COMMON_TYPOS: Record<string, string> = {
  // Gmail typos
  "gmial.com": "gmail.com",
  "gmai.com": "gmail.com",
  "gamil.com": "gmail.com",
  "gmaill.com": "gmail.com",
  "gmaili.com": "gmail.com",
  "gmail.co": "gmail.com",
  "gmail.con": "gmail.com",
  "gmail.cm": "gmail.com",
  "gmal.com": "gmail.com",
  "gmaik.com": "gmail.com",
  "gmaio.com": "gmail.com",
  "gmail.cpm": "gmail.com",
  "gmail.vom": "gmail.com",
  "gmaul.com": "gmail.com",
  "gemail.com": "gmail.com",
  "gmeil.com": "gmail.com",
  "googlemail.con": "googlemail.com",

  // Yahoo typos
  "yaho.com": "yahoo.com",
  "yahooo.com": "yahoo.com",
  "yhaoo.com": "yahoo.com",
  "yaho.co": "yahoo.com",
  "yahoo.con": "yahoo.com",
  "yahoo.cm": "yahoo.com",
  "yaho.con": "yahoo.com",
  "yaho.cpm": "yahoo.com",
  "yaoo.com": "yahoo.com",

  // Hotmail typos
  "hotmial.com": "hotmail.com",
  "hotmaill.com": "hotmail.com",
  "hotmal.com": "hotmail.com",
  "hotmai.com": "hotmail.com",
  "hotamil.com": "hotmail.com",
  "hotmail.con": "hotmail.com",
  "hotmail.co": "hotmail.com",
  "hotmali.com": "hotmail.com",

  // Outlook typos
  "outlok.com": "outlook.com",
  "outloo.com": "outlook.com",
  "outllok.com": "outlook.com",
  "outlook.con": "outlook.com",
  "outlokk.com": "outlook.com",
  "otlook.com": "outlook.com",

  // iCloud typos
  "icld.com": "icloud.com",
  "iclou.com": "icloud.com",
  "iclud.com": "icloud.com",
  "icloud.con": "icloud.com",

  // ProtonMail typos
  "protomail.com": "protonmail.com",
  "protonmial.com": "protonmail.com",
  "proton.con": "proton.me",

  // AOL typos
  "ail.com": "aol.com",
  "aol.con": "aol.com",
};

// Levenshtein distance for fuzzy matching
function levenshtein(a: string, b: string): number {
  const an = a ? a.length : 0;
  const bn = b ? b.length : 0;
  if (an === 0) return bn;
  if (bn === 0) return an;
  const matrix = Array.from({ length: bn + 1 }, (_, i) => [i]);
  for (let j = 0; j <= an; j++) matrix[0][j] = j;

  for (let i = 1; i <= bn; i++) {
    for (let j = 1; j <= an; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          Math.min(matrix[i][j - 1] + 1, matrix[i - 1][j] + 1) // insertion / deletion
        );
      }
    }
  }
  return matrix[bn][an];
}

export function detectTypo(domain: string, localPart = ""): { hasTypo: boolean; suggestedDomain: string | null; suggestedEmail: string | null } {
  if (!domain) return { hasTypo: false, suggestedDomain: null, suggestedEmail: null };
  const d = domain.toLowerCase().trim();

  // 1. Direct dictionary match
  if (COMMON_TYPOS[d]) {
    const suggestedDomain = COMMON_TYPOS[d];
    return {
      hasTypo: true,
      suggestedDomain,
      suggestedEmail: localPart ? `${localPart}@${suggestedDomain}` : null,
    };
  }

  // 2. Fuzzy match against popular domains (Distance of 1)
  for (const target of POPULAR_DOMAINS) {
    if (d !== target && Math.abs(d.length - target.length) <= 2) {
      const dist = levenshtein(d, target);
      if (dist === 1) {
        return {
          hasTypo: true,
          suggestedDomain: target,
          suggestedEmail: localPart ? `${localPart}@${target}` : null,
        };
      }
    }
  }

  return { hasTypo: false, suggestedDomain: null, suggestedEmail: null };
}
