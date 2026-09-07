import type { Section } from "./types";

export const BANK_SIZE = 1000;

/** Section shares from AGENT.md §5.1. */
export const SECTION_TARGETS: Record<Section, number> = {
  general: 0.4,
  arabic: 0.3,
  french: 0.3,
};

/**
 * Topic shares (of the full 1000-item bank) from AGENT.md §5.2/§5.3/§5.4.
 * The `topic` field on every generated question must be one of these exact
 * strings so composition drift can be checked automatically.
 */
export const TOPIC_TARGETS: Record<string, number> = {
  // general culture — 400
  "موريتانيا": 90 / BANK_SIZE,
  "الجمارك والتجارة": 110 / BANK_SIZE,
  "المالية والاقتصاد": 60 / BANK_SIZE,
  "القانون والإدارة": 50 / BANK_SIZE,
  "العلاقات الدولية": 60 / BANK_SIZE,
  "العلوم والمعارف العامة": 30 / BANK_SIZE,

  // Arabic language — 300
  "نحو": 80 / BANK_SIZE,
  "صرف": 60 / BANK_SIZE,
  "بلاغة": 50 / BANK_SIZE,
  "إملاء": 30 / BANK_SIZE,
  "معجم ودلالة": 40 / BANK_SIZE,
  "أدب ونصوص": 25 / BANK_SIZE,
  "عروض": 15 / BANK_SIZE,

  // French — 300
  grammaire: 70 / BANK_SIZE,
  conjugaison: 55 / BANK_SIZE,
  orthographe: 45 / BANK_SIZE,
  vocabulaire: 45 / BANK_SIZE,
  expressions: 25 / BANK_SIZE,
  "compréhension": 40 / BANK_SIZE,
  "rédaction administrative": 20 / BANK_SIZE,
};

export const TOPIC_SECTION: Record<string, Section> = {
  "موريتانيا": "general",
  "الجمارك والتجارة": "general",
  "المالية والاقتصاد": "general",
  "القانون والإدارة": "general",
  "العلاقات الدولية": "general",
  "العلوم والمعارف العامة": "general",
  "نحو": "arabic",
  "صرف": "arabic",
  "بلاغة": "arabic",
  "إملاء": "arabic",
  "معجم ودلالة": "arabic",
  "أدب ونصوص": "arabic",
  "عروض": "arabic",
  grammaire: "french",
  conjugaison: "french",
  orthographe: "french",
  vocabulaire: "french",
  expressions: "french",
  "compréhension": "french",
  "rédaction administrative": "french",
};

/** French difficulty spread from §5.4: 1≈A2 .. 5≈C1+, target 60/70/70/60/40. */
export const FRENCH_DIFFICULTY_TARGETS: Record<1 | 2 | 3 | 4 | 5, number> = {
  1: 60 / 300,
  2: 70 / 300,
  3: 70 / 300,
  4: 60 / 300,
  5: 40 / 300,
};

export const MIN_OPTIONS = 5;
export const MIN_SHARE_WITH_6_PLUS_OPTIONS = 0.25;
export const MULTI_CORRECT_TARGET = 0.35;
export const MULTI_CORRECT_TOLERANCE = 0.05;
export const COMPOSITION_TOLERANCE = 0.02;

// ---------------------------------------------------------------------------
// Trésor track — AGENT-TRESOR.md §3. Same per-item rules as above, no French
// difficulty spread (no language sections on this track).
// ---------------------------------------------------------------------------

export const TRESOR_BANK_SIZE = 1000;

export const TRESOR_SECTION_TARGETS: Record<Section, number> = {
  "accounting-execution": 200 / TRESOR_BANK_SIZE,
  "public-finance-budget": 150 / TRESOR_BANK_SIZE,
  "treasury-accountant": 150 / TRESOR_BANK_SIZE,
  "control-audit": 150 / TRESOR_BANK_SIZE,
  "economics-policy": 150 / TRESOR_BANK_SIZE,
  "tax-debt": 100 / TRESOR_BANK_SIZE,
  "law-governance": 100 / TRESOR_BANK_SIZE,
};

/** Exam composition — 60 questions per session, AGENT-TRESOR.md §4. */
export const TRESOR_SESSION_COMPOSITION: Record<Section, number> = {
  "accounting-execution": 12,
  "public-finance-budget": 9,
  "treasury-accountant": 9,
  "control-audit": 9,
  "economics-policy": 9,
  "tax-debt": 6,
  "law-governance": 6,
};

export const TRESOR_SECTION_LABELS: Record<Section, string> = {
  "accounting-execution": "المحاسبة العمومية وتنفيذ العمليات المالية",
  "public-finance-budget": "المالية العامة والميزانية",
  "treasury-accountant": "الخزينة والآمر بالصرف والمحاسب العمومي",
  "control-audit": "الرقابة والتفتيش المالي",
  "economics-policy": "الاقتصاد والسياسات الاقتصادية",
  "tax-debt": "النظام الضريبي والدين العام",
  "law-governance": "القانون والإدارة والحوكمة العمومية",
};
