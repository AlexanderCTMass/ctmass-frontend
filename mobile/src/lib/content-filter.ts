const BLOCKLIST: string[] = [
  "fuck",
  "motherfucker",
  "fucker",
  "shit",
  "bullshit",
  "bitch",
  "asshole",
  "bastard",
  "dick",
  "piss",
  "cunt",
  "cock",
  "pussy",
  "slut",
  "whore",
  "douche",
  "nigger",
  "nigga",
  "faggot",
  "fag",
  "retard",
  "spic",
  "chink",
  "kike",
  "tranny",
  "wetback",
  "coon",
  "porn",
  "rape",
  "rapist",
  "pedophile",
  "molest",
  "kill you",
  "kill yourself",
  "murder you",
];

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

const PATTERNS = BLOCKLIST.map((term) => ({
  term,
  regex: new RegExp(`\\b${escapeRegExp(term)}\\b`, "i"),
}));

export function findObjectionable(...texts: (string | null | undefined)[]): string | null {
  for (const text of texts) {
    if (!text) continue;
    for (const { term, regex } of PATTERNS) {
      if (regex.test(text)) return term;
    }
  }
  return null;
}

export class ContentBlockedError extends Error {
  constructor() {
    super("Please remove inappropriate language before posting.");
    this.name = "ContentBlockedError";
  }
}
