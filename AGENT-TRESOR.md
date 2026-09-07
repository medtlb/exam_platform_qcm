# AGENT-TRESOR.md — "Concours Trésor" track (مفتش خزينة رئيس)

Second exam track inside the same app built from `AGENT.md`. **Everything in `AGENT.md` still
applies** (stack, scoring formula, non-repetition, timer, auth, PDF export mechanics, quality
floor, banned-aesthetic rules) unless explicitly overridden below. This file only records the
deltas needed to add a **Principal Treasury Inspector** (مفتش خزينة رئيس) track alongside the
existing Douanes track, selected by the candidate after login.

---

## 0. Source of the job description

`inspecteur/jb.jpeg` — official exam-topics card, 7 headings (محاور الامتحان), no language
sections (no Arabic/French language testing, unlike the Douanes exam). Confirmed with the
candidate: build subject-matter only, same 60-question / 90-minute format as the Douanes track,
no separate official announcement PDF exists for this competition.

## 1. Multi-track architecture

- `Question.track: "douanes" | "tresor"`. `Section` stays a plain string; each track owns its
  own section keys — no shared meaning between `douanes:"general"` and any tresor section.
- `trackConfig.ts` holds, per track: id, label (ar), composition (`Record<Section, number>`),
  section labels, timer minutes, session size, palette token prefix, whether a per-difficulty
  breakdown block applies to the results screen (only Douanes' French subset has one).
- After login, a **track picker** screen (no exam-type meaning leaks into the exam UI copy)
  lets the candidate choose which competition to train for; the choice is remembered per
  candidate in the persisted store. History, seenIds and settings are tracked **separately per
  track** — training progress on one exam must not touch the other's non-repetition pool.
- `buildExam`/`pickSection` in `selection.ts` become track-agnostic: they take a composition map
  and iterate its keys instead of the hardcoded general/arabic/french triple. The
  ascending-difficulty sort that used to be French-only becomes an opt-in per-section flag in
  `trackConfig` (on for nothing in the Trésor track).
- `Attempt.bySection` becomes `Record<string, SectionScore>`; `byFrenchDifficulty` becomes
  optional and is only computed/rendered when the track config marks a section as a level test.

## 2. Emblem and palette (per the candidate's decision)

- No Ministry of Finance / Trésor logo file exists in the project and none should be invented or
  copied from the web. Use a **generic seal**: Mauritania's star-and-crescent motif redrawn as a
  plain circular administrative seal (own original line-art `public/seal-tresor.svg`), not a
  copy of any specific institution's logo. Reused as favicon **only while the Trésor track is
  active** (favicon swaps with the active track, same mechanism as the login screen swapping
  copy).
- Distinct palette, same restrained administrative-paper language as §8 of `AGENT.md`, defined
  once in `tokens.css` under a `[data-track="tresor"]` scope so both palettes ship in one build:
```
--ink-t:      #14181F   /* near-black, cool cast — all body text on this track */
--navy:       #1C3352   /* primary surfaces & primary button */
--navy-dk:    #0F2038   /* header, hover */
--silver:     #6B7686   /* accents, rules, selected state — the brass equivalent */
--paper-t:    #ECEDEF   /* page background */
--paper-2:    #FFFFFF   /* answer sheet surface — shared token, same value both tracks */
--stamp:      #8E2B24   /* shared — wrong answers/negative marks, same semantic red both tracks */
```
No gradient, no purple, same 2px/0 border-radius rule, same hairline-not-shadow rule, same
signature-stamp results treatment (drawn in `--navy` for a pass instead of `--green`).

## 3. Topics, weights and the 1000-item bank

Distribution mirrors the exam-topics card exactly, weighted by how central each topic is to the
job (public accounting and treasury operations are the core of the role, so they carry the most
weight):

| # | Section key | Topic (from job card) | Share | Count | Exam Q's (of 60) |
|---|---|---|---|---|---|
| 1 | `accounting-execution` | المحاسبة العمومية وتنفيذ العمليات المالية | 20% | 200 | 12 |
| 2 | `public-finance-budget` | المالية العامة والميزانية | 15% | 150 | 9 |
| 3 | `treasury-accountant` | الخزينة والآمر بالصرف والمحاسب العمومي | 15% | 150 | 9 |
| 4 | `control-audit` | الرقابة والتفتيش المالي | 15% | 150 | 9 |
| 5 | `economics-policy` | الاقتصاد والسياسات الاقتصادية | 15% | 150 | 9 |
| 6 | `tax-debt` | النظام الضريبي والدين العام | 10% | 100 | 6 |
| 7 | `law-governance` | القانون والإدارة والحوكمة العمومية | 10% | 100 | 6 |

Sum = 1000 items / 60 per exam. Same per-item rules as `AGENT.md` §4 (≥5 options, 25%+ with ≥6,
~35% multi-correct, no duplicates, shuffled option order, plausible same-register distractors).
Written in Arabic; French appears only where a term is genuinely technical (accounting/economic
vocabulary), inline, not as a separate register — no dedicated French section this track.
**Do not invent article numbers.** Only cite an article/decree number that was actually read in
one of the sources below; otherwise write the question at concept level with no `source`.

### 3.1 Section 1 — المحاسبة العمومية وتنفيذ العمليات المالية (200)
Public accounting principles, the expenditure cycle, budget/general accounting distinction.
Primary source: **Décret n° 2019-186 du 31 juillet 2019** portant règlement général de gestion
budgétaire et comptable (full text extracted to
`scratch/tresor/decret-2019-186.txt` — verified article numbers up to Art. 64: définitions,
séparation ordonnateur/comptable (Art. 7-8), les 4 phases de la dépense — engagement/
liquidation/ordonnancement/paiement (Art. 33-38), comptabilité budgétaire vs générale
(Art. 55-61), pièces justificatives, valeurs inactives). DGTCP *Recueil des normes comptables de
l'État* (tresor.mr) for standards-level questions.

### 3.2 Section 2 — المالية العامة والميزانية (150)
LOLF structure: Loi organique n° 2018-039 (replaced Loi n° 78-011 du 19/01/1978), amended by
Loi organique n° 2019-2026. Five budget principles (annualité, unité, universalité, spécialité,
sincérité), program budgeting reform (programmes/actions/activités, unité de vote =
programme), types of lois de finances (initiale, rectificative, règlement — Art. 44 LOLF governs
the loi de règlement), the annual budget cycle, circulaire de préparation. Sources: `Présentation
de la nouvelle LOLF.pdf` (extracted to `scratch/tresor/presentation-lolf.txt`), Loi de Finances
2026 text, Guide PAP&RAP (finances.gov.mr).

### 3.3 Section 3 — الخزينة والآمر بالصرف والمحاسب العمومي (150)
Deep dive on the same décret 2019-186 articles as 3.1 but from the actors' side: ordonnateur
principal/secondaire/délégué, comptable principal/secondaire, incompatibilité des fonctions
(Art. 8, Art. 24), responsabilité personnelle et pécuniaire du comptable (Art. 18), serment
devant la Cour des Comptes (Art. 15), contrôles exercés par le comptable (Art. 20-21), opérations
de trésorerie (Art. 46-51), rôle du Trésor Public (dépôt obligatoire des fonds publics, Art. 49).
Organizational chart of the DGTCP (Direction Générale du Trésor et de la Comptabilité Publique)
from tresor.mr.

### 3.4 Section 4 — الرقابة والتفتيش المالي (150)
Layers of financial control in Mauritania: contrôle a priori (contrôle financier/CGED-style),
contrôle du comptable (Art. 20-21 décret 2019-186), **Cour des Comptes** — constitutional basis
Article 68 de la Constitution du 20 juillet 1992, successor to the Contrôle d'État (Loi n° 68-66
de 1968), structure (Chambre des Finances Publiques, Chambre des Entreprises Publiques),
certification role, gestion de fait, mise en débet. Inspection Générale des Finances / Inspection
Générale d'État — general concepts (do not invent article numbers not verified). Concepts of
contrôle interne vs externe, contrôle de régularité vs de performance.

### 3.5 Section 5 — الاقتصاد والسياسات الاقتصادية (150)
General economics theory (doctrines, schools, markets) from the reference textbook *أسس علم
الاقتصاد، الجزء الأول* (ضياء مجيد الموسوي) — table of contents extracted (35 chapters):
physiocrates, mercantilistes, classiques (Smith, Ricardo), néoclassiques, keynésiens, théories de
la croissance et du développement, up to privatisation/mondialisation. Use this for
doctrine-identification and concept questions (no page-specific citation — the book is a scanned
image PDF with no article/page-anchored facts to verify, so treat it as general theory, not a
quotable legal source). Mauritania-specific applied economics: public debt-to-GDP ~39.9% (2025,
down from 43.6% in 2024 per IMF), dependency on extractive-sector revenue, Comité National de la
Dette Publique, SDMT (Stratégie de gestion de la Dette à Moyen Terme). Cross-reference
`references/notes-mauritania.md` for the general economy/mining/fisheries facts already
researched for the Douanes track — reusable here without redoing that research.

### 3.6 Section 6 — النظام الضريبي والدين العام (100)
Code Général des Impôts (CGI) 2024, Mauritania — full text extracted to
`scratch/tresor/cgi-full.txt` (172 pages, DGI/Ministère des Finances, January 2024 official
edition). Structure: impôts directs (IS, ITS/impôt sur traitements et salaires, impôt foncier),
impôts indirects (TVA), droits d'enregistrement, régimes des contribuables. Use the extracted
text to write concept-level questions on tax categories, taxable base logic, and general
mechanisms; only cite a specific article number confirmed present in the extracted text. Public
debt: same SDMT/IMF facts as 3.5, debt categories (dette intérieure/extérieure), rôle du Comité
national de la dette publique.

### 3.7 Section 7 — القانون والإدارة والحوكمة العمومية (100)
Reuse and extend `references/notes-mauritania.md` and `references/notes-customs-code.md`'s
general administrative-law groundwork (sources of law, administrative law basics, public
service) already vetted for the Douanes bank — do not duplicate the exact same items, write new
ones at the same verified-concept level. Add: public procurement bases, principes de la fonction
publique, hiérarchie des normes, notions de gouvernance publique et de redevabilité
(accountability), rôle du Parlement dans le contrôle budgétaire (vote de la loi de règlement).

## 4. Session composition

`SESSION_SIZE = 60`, composition = the "Exam Q's" column in §3's table (12/9/9/9/9/6/6). No
section gets an ascending-difficulty sort (unlike Douanes' French subset) — sections interleave
by the same balanced-ratio `interleave()` already in `selection.ts`, unmodified.

## 5. Results screen delta

Same seal, same per-section table (7 rows instead of 3), same arithmetic-spelled-out review
list, same three export buttons. **Drop** the per-difficulty breakdown block entirely for this
track (§9.3 of `AGENT.md` is Douanes-French-specific) — `ResultsScreen`/`PrintView` render it
conditionally on `trackConfig.hasDifficultyBreakdown`.

## 6. Build order for this track

1. Generalize `types.ts`, `selection.ts` (+ tests), `Attempt` shape, `bankTargets.ts` for
   multi-track without changing Douanes' behavior (its tests must stay green untouched).
2. `trackConfig.ts`, track picker screen, per-track persisted store slices (seenIds, history).
3. Palette tokens + seal asset + favicon-swap wiring.
4. Question bank generation batch by batch into `src/data/tresor/raw/*.json`, validated with the
   same `validate-bank.mjs` extended to accept a `--track` flag.
5. Merge into `src/data/tresor/questions.json`, run validation, report the distribution table.
6. Wire results/PDF conditionals, final pass at 360px/1280px, confirm bank size never leaks.
