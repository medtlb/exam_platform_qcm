# AGENT.md — "Concours Douanes" Exam Trainer (Mauritania, grade: Inspecteur des Douanes)

You are building a **React web app** that lets a candidate train for the Mauritanian customs
service entrance exam (*concours d'accès au corps des Inspecteurs des Douanes*).
Work through the phases in order. Do not skip the data phase and do not stub it with fake data.

---

## 0. Context you must respect

- The real exam is **multiple-choice, AI-generated**, questions have **5 to 7+ options**, and a
  single question can have **more than one correct option**.
- Candidate's declared languages: **Arabic = first language**, **French = second language**.
- So the **interface is Arabic, RTL by default**. French questions are rendered inside an LTR
  block (`dir="ltr"`) but the surrounding UI (buttons, nav, results) stays Arabic.
- The app is a private training tool for one candidate. It must feel like an official
  administrative examination platform, **not** a consumer quiz app.

---

## 1. Hard rules (non-negotiable)

1. **Never reveal the size of the question bank.** No "1000 questions", no counters like
   "42/1000", no progress bar over the whole bank, no "questions remaining in pool".
   The only numbers the user ever sees are: current question index inside the running exam
   (e.g. `12 / 60`), the timer, and the final result.
2. **No generic AI-looking design.** Banned: purple/violet, indigo→pink gradients, any gradient
   wash used as decoration, glassmorphism, neon accents, emoji in the UI, giant rounded blobs,
   identical rounded cards for everything, `rgba(0,0,0,.1)` soft shadows everywhere,
   ALL-CAPS tracked-out eyebrow labels, `→` glued to button text.
3. **Use the Mauritanian Customs emblem** that is already in the project folder. Find it
   (search the repo for image files: `.svg`, `.png`, `.jpg`), copy it to `public/`, and use it in
   the login screen, the header, and as favicon. Do not redraw or invent a logo, do not
   recolor it. If several images exist, ask which one is the official emblem before continuing.
4. **No backend, no external API at runtime.** Everything runs client-side; the question bank
   ships as local JSON. The app must work fully offline after first load.
5. Answers, correct options and explanations must **never** be reachable before the user submits
   the exam — do not print them in the DOM of the running exam.

---

## 2. Stack

- Vite + React 18 + TypeScript
- Tailwind CSS **with a fully custom theme** (see §8) — no default Tailwind palette in the UI
  (`blue-500`, `purple-600`, etc. are forbidden; use the named tokens only)
- `zustand` for state, persisted to `localStorage`
- `react-router-dom`
- No component library (no MUI/Chakra/shadcn default look). Hand-build the few components needed.
- Tests: `vitest` for the scoring and selection logic (mandatory, see §6.4)

---

## 3. Repository layout

```
/public
  emblem.svg              # Mauritanian Customs emblem (copied from project folder)
  favicon.ico
/src
  /app                    # router, layout, providers
  /features
    /auth
    /exam                 # runner, question card, navigation, timer
    /results
  /components             # Button, Checkbox, Sheet, StampBadge...
  /data
    questions.json        # THE BANK — 1000 items, generated in Phase 1
    /raw                  # per-batch files before merge (git-kept)
  /lib
    scoring.ts
    selection.ts
    validate.ts
  /styles/tokens.css
/scripts
  validate-bank.mjs       # runs the validator over questions.json
/references               # PDFs / notes supplied by the candidate — READ THEM FIRST
```

---

## 4. Question schema

```ts
type Question = {
  id: string;              // "gc-0001" | "ar-0001" | "fr-0001"
  section: "general" | "arabic" | "french";
  topic: string;           // e.g. "douane", "constitution", "نحو", "conjugaison"
  difficulty: 1 | 2 | 3 | 4 | 5;
  lang: "ar" | "fr";       // language the question text is written in
  prompt: string;
  options: { id: string; text: string }[];   // 5 to 7 options, MINIMUM 5
  correct: string[];        // 1..n option ids, n < options.length
  explanation: string;      // 1–3 sentences, written in the question's language
  source?: string;          // short reference, e.g. "Code des douanes MR, art. 12"
};
```

Rules for every item:
- `options.length >= 5`, and at least 25% of the bank must have `options.length >= 6`.
- `correct.length >= 1` and `correct.length < options.length`.
- **~35% of the bank must be multi-correct** (`correct.length >= 2`) — this mirrors the real exam.
- Distractors must be plausible, same register and similar length as the correct options.
  Never make the correct option the longest one systematically. Shuffle option order at
  generation time so correct answers are not clustered at position A/B.
- No duplicates and no near-duplicates (normalize text, strip diacritics/punctuation, compare).
- Arabic questions are fully vocalized only where vocalization is the point of the question.

---

## 5. Phase 1 — Build the bank (1000 questions)

### 5.1 Composition

| Section | Share | Count | Content |
|---|---|---|---|
| General culture | 40% | 400 | see 5.2 |
| Arabic language | 30% | 300 | see 5.3 |
| French language | 30% | 300 | see 5.4 |

### 5.2 General culture — 400 items
Written entirely in Arabic (`lang: "ar"`) — including customs/economics terminology items.
Only the French language section (5.4) tests French.

- Mauritania: history, geography, administrative organization, institutions, the Constitution,
  national symbols, economy (mining, fisheries, oil & gas), main public bodies — **90**
- Customs & trade: role and missions of a customs administration, customs declaration,
  customs value, HS nomenclature and tariff classification, rules of origin, transit,
  temporary admission, warehousing, duties and taxes, smuggling and customs offences,
  Incoterms, World Customs Organization, WTO, containers and logistics — **110**
- Public finance, taxation, economics and accounting basics — **60**
- Law and administration: sources of law, public/private law, administrative law basics,
  public service, public procurement — **50**
- International: UN, African Union, ECOWAS/Arab League, IMF/World Bank, major treaties,
  world geography, modern history — **60**
- Science, technology and general knowledge (IT literacy, statistics, logic, current-affairs
  style facts that do not expire quickly) — **30**

Research before writing: use the files in `/references` first, then search the web for
public sources on the Mauritanian customs code, the *Direction Générale des Douanes*
(Mauritania), WCO educational material, Incoterms 2020, HS nomenclature, and past
Mauritanian public-service competitive exams. Put a short `source` on every factual item.
**Do not invent legal article numbers.** If you cannot verify a legal reference, write the
question at concept level and leave `source` empty. Avoid anything that will be outdated in
six months (names of current office-holders, current prices).

### 5.3 Arabic language — 300 items
Written in Arabic, difficulty spread 1→5.

نحو (إعراب، أدوات، أنواع الجمل) 80 · صرف (أوزان، اشتقاق، إعلال وإبدال) 60 ·
بلاغة (تشبيه، استعارة، كناية، مجاز، محسنات بديعية) 50 · إملاء وعلامات الترقيم 30 ·
معجم ودلالة (مترادفات، أضداد، معاني المفردات) 40 · أدب ونصوص وشواهد 25 · عروض 15

### 5.4 French — 300 items
Written in French, built as a **level test that climbs from easy to hard**:
difficulty 1 ≈ A2, 2 ≈ B1, 3 ≈ B2, 4 ≈ C1, 5 ≈ C1+/administrative register.
Target spread: 60 / 70 / 70 / 60 / 40.

grammaire 70 · conjugaison et concordance des temps 55 · orthographe et accords 45 ·
vocabulaire et registres 45 · expressions et locutions 25 · compréhension d'un court texte
(2–4 lines followed by the question) 40 · rédaction administrative (style, formules) 20

### 5.5 Generation workflow

1. Read `/references` completely. Extract every usable fact into a scratch file.
2. Research the web for the topics above; keep a `sources.md` of URLs used.
3. Generate in **batches of 50**, one file per batch in `/src/data/raw/`, so progress is
   resumable and reviewable. After each batch, run the validator.
4. Merge all batches into `questions.json`, re-run validation, and report the final
   distribution table (section × difficulty × topic) in the terminal — not in the app.
5. `scripts/validate-bank.mjs` must fail loudly on: schema violation, `<5` options,
   empty/complete `correct` array, duplicate id, duplicate or near-duplicate prompt,
   composition drift (>2% off the targets in 5.1), missing explanation.

---

## 6. Phase 2 — Exam engine

### 6.1 Session composition
Every exam is exactly **60 questions**: **24 general · 18 Arabic · 18 French**.
Order: sections are interleaved, not blocked, so the candidate switches context like in the
real exam. Within the French subset, order by ascending difficulty.

### 6.2 Non-repetition and "renew"
- `localStorage` keeps a `seenIds` set.
- A new exam draws only from unseen questions, respecting the 24/18/18 split and a balanced
  difficulty spread.
- After the results screen, a primary button **«تجديد الأسئلة»** starts a fresh exam from the
  remaining unseen questions.
- If a section runs out of unseen questions, silently recycle its least-recently-seen items.
  Never tell the user the pool is exhausted, never show how much is left.
- A secondary action lets the user reset history (settings screen only), labelled
  «إعادة ضبط سجل التدريب».

### 6.3 Scoring (implement exactly)

For one question with `C = correct.length` correct options and `W = options.length - C`
wrong options, and a set `S` of options the user ticked:

```ts
export function scoreQuestion(q: Question, selected: string[]): number {
  const correct = new Set(q.correct);
  const C = q.correct.length;
  const W = q.options.length - C;
  let raw = 0;
  for (const id of selected) {
    raw += correct.has(id) ? 1 / C : (W > 0 ? -1 / W : 0);
  }
  return Math.max(0, raw);            // a question can never go below 0
}
```

- Max per question = 1 (all correct, nothing wrong). Unanswered = 0.
- Exam total = sum over 60 questions → also shown as a mark out of 20:
  `mark20 = total / 60 * 20`, rounded to 2 decimals.
- Store both the raw (possibly negative before flooring) and the floored value per question,
  so the review screen can explain *why* a question scored 0.

### 6.4 Required unit tests
`scoring.test.ts`: all-correct = 1 · partial correct = C_selected/C · one wrong tick with
W=4 subtracts 0.25 · net-negative floors to 0 · empty selection = 0 · selecting every option
scores 0. `selection.test.ts`: split is 24/18/18 · no duplicate id in a session · no id from
`seenIds` while unseen ones remain.

### 6.5 Timer
90 minutes per exam, visible and monotonic, persisted so a page reload does not reset it.
At zero, auto-submit. A pause action is allowed but records paused time in the results.

### 6.6 Runtime rules
- One question per screen, with a compact question grid to jump around and a clear marker for
  answered / flagged / untouched.
- Multi-correct questions use checkboxes; single-correct use radios — but **do not tell the
  user how many correct answers exist**, so render checkboxes everywhere and allow multiple
  ticks on every question.
- «مراجعة» flag per question. Submit requires a confirmation sheet.
- Session state is persisted on every change; a crash or reload resumes the exam intact.

---

## 7. Auth

Single local account, no server. First launch asks the candidate to create a name + password
(hashed with WebCrypto SHA-256 + random salt, stored in `localStorage`). Later launches show a
login screen with the emblem. Session unlocks the app; a lock action returns to login.
Copy: no marketing text, no tagline about AI. The login screen states what the app is:
«منصة تدريب على مسابقة مفتشي الجمارك» and nothing more.

---

## 8. Phase 3 — Design direction

The subject matter is a national customs administration: official forms, stamps, seals,
declaration documents, brass insignia. Build from that, not from a generic quiz aesthetic.

**Palette** (define once in `tokens.css`, use nowhere else):
```
--ink:      #14261C   /* near-black with a green cast — all body text */
--green:    #0E4D33   /* Mauritanian green, primary surfaces & primary button */
--green-dk: #082D1F   /* header, hover */
--brass:    #A9812B   /* insignia gold — accents, rules, selected state */
--paper:    #EFEDE4   /* page background, matte administrative paper */
--paper-2:  #FFFFFF   /* answer sheet surface */
--stamp:    #8E2B24   /* reserved: wrong answers and negative marks only */
```
Nothing else. No gradient anywhere except, optionally, a 2% paper-grain texture.

**Type**: `Noto Kufi Arabic` for Arabic headings (official register), `IBM Plex Sans Arabic`
for Arabic body, `IBM Plex Sans` for French text and numerals. Two families max, self-hosted.
Type scale: 32 / 24 / 19 / 16 / 14. Body line length under 75 characters.

**Layout**: the exam screen is an **answer sheet**, not a card deck. A single sheet on
`--paper`, question number set in brass in the margin (numbering is legitimate here: the
questions really are a sequence), options as full-width rows separated by 1px `--ink/12%`
hairlines, square checkboxes with a 1px border and a brass fill when ticked. Border-radius:
2px on interactive elements, 0 elsewhere. Borders instead of shadows.

**Signature element** — spend the boldness here and keep everything else quiet: the results
screen renders the final mark as a **customs stamp** — the emblem, the mark out of 20, and the
date set inside a circular seal, drawn in `--stamp` for a fail and `--green` for a pass, with
one single ink-press animation on entry (respect `prefers-reduced-motion`). Nothing else in the
app animates except state changes the user caused.

**RTL**: use CSS logical properties throughout (`margin-inline-start`, not `margin-left`) so the
French LTR blocks nest correctly. Test both directions.

**Quality floor**: responsive to a 360px phone, visible keyboard focus rings, full keyboard
operation of the exam (1–7 to tick options, arrows to navigate), contrast AA minimum.

---

## 9. Results screen

Shown at the end of every exam:

1. The seal: mark out of 20, plus raw total `xx.xx / 60`.
2. Per-section table: general / Arabic / French → score, max, percentage.
3. Per-difficulty breakdown for the French section (the level-test read: where the candidate
   stops being reliable).
4. Time used, and number of questions left unanswered.
5. Full review list: for each question — what was ticked, which options were correct,
   the score obtained with the arithmetic spelled out
   («اخترت خيارًا صحيحًا من ٢ (+٠٫٥) وخيارًا خاطئًا من ٣ (−٠٫٣٣) → ٠٫١٧»), and the explanation.
   Questions floored to 0 are marked and explained.
6. Buttons: «تجديد الأسئلة» (new 60-question exam from unseen items) and
   «مراجعة الأخطاء فقط» (filter the review list to score < 1), and «تحميل الاختبار PDF» (§10).
7. History screen: past attempts with date, mark out of 20, and a small line chart of the
   marks over time. No reference to the bank size.

---

## 10. PDF export of a finished exam

A button on the results screen, **«تحميل الاختبار PDF»**, produces an A4 PDF of the attempt.
The same action is available on every row of the history screen, so an old attempt can be
exported later — this means an attempt must be persisted as a **full snapshot** (the 60
questions with their options, the user's ticks, per-question score, timings), not just a mark.

### 10.1 What the document contains

1. Header on page 1: the emblem, «منصة تدريب على مسابقة مفتشي الجمارك», candidate name,
   date and time of the attempt, time used.
2. The result block: mark out of 20, raw total out of 60, per-section table, French
   per-difficulty breakdown. Reuse the seal as a monochrome version — it must survive
   black-and-white printing.
3. The 60 questions in exam order. For each: number, section tag, prompt, **all** options with
   the user's ticks marked (✓ for a ticked option) and the correct ones marked in the margin,
   the score with the arithmetic spelled out, then the explanation in a smaller size.
4. Footer on every page: page number, and the attempt date. No app URL, no branding beyond
   the emblem.

Two export modes, offered in a small sheet when the button is pressed:
- **النسخة الكاملة** — everything above.
- **الأخطاء فقط** — same layout, filtered to questions that scored under 1.

Optionally also **نسخة للطباعة بدون إجابات** (the same 60 questions, no ticks, no correct
markers, no explanations, no scores) so the candidate can redo the paper by hand.

### 10.2 How to generate it

Arabic shaping and bidirectional text are the whole difficulty here. Follow this exactly:

- **Do not** write Arabic with `jsPDF.text()` or with `pdfmake`. Neither does Arabic letter
  joining or bidi reordering; the output looks like disconnected reversed letters.
- **Primary path — the browser does the typesetting.** Build a dedicated print view
  (route `/attempt/:id/print`, or a hidden container) styled by a real print stylesheet, and
  call `window.print()`. The user picks "Save as PDF" in the print dialog. Arabic renders
  perfectly, the text stays selectable and searchable, and the file stays small (~200 KB).
  Label the button honestly and add one line of help under it explaining the "Save as PDF"
  step in the dialog.
- **Second path — one-click file.** For a real `.pdf` download without the dialog, render the
  same print view offscreen and rasterize it with `html2canvas` (`scale: 2`, white background),
  then place the slices into `jsPDF` (A4 portrait, `unit: 'mm'`). Cut pages only at element
  boundaries — never mid-question, never mid-option. Show a progress indicator; 60 questions is
  a long document, so yield to the event loop between pages. Accept that this version is
  image-based and heavier.

Implement the primary path first and ship it; add the second path behind the same button as
the default action only once it is verified to produce clean Arabic on a 3-page sample.

### 10.3 Print stylesheet rules

- `@page { size: A4 portrait; margin: 18mm 16mm; }`, page counter in the footer.
- White background, `--ink` text, `--brass` only for hairline rules and question numbers,
  `--stamp` only on wrong ticks. No filled `--green` surfaces — they waste ink and hurt
  legibility on paper.
- `break-inside: avoid` on each question block; `break-after: avoid` on prompts so a prompt is
  never orphaned from its first options.
- `dir="rtl"` on the document, French questions in nested `dir="ltr"` blocks — verify a
  French question containing digits and punctuation renders in the right order.
- Self-host the fonts and reference them from the print stylesheet too, so export works offline.
- Hide all app chrome: nav, timer, buttons, flags.
- Filename: `douanes-<mode>-YYYY-MM-DD-HHmm.pdf` (`mode` = `complet` | `erreurs` | `vierge`).

## 11. Build order

1. Read `/references`, locate the emblem, confirm it with the user.
2. Scaffold Vite + TS + Tailwind + tokens, then the design system primitives.
3. `scoring.ts`, `selection.ts`, `validate.ts` **with their tests passing** — before any UI.
4. Question bank generation, batch by batch, validating as you go.
5. Auth → exam runner → results → history → PDF export.
6. Final pass: run the validator, run the tests, build, check the app at 360px and 1280px in
   both `dir=rtl` and the LTR French blocks, and confirm the bank size appears nowhere in the
   built bundle's UI strings.

## 12. Definition of done

- `npm run build` clean, `npm test` green, `node scripts/validate-bank.mjs` green.
- `questions.json` holds exactly 1000 valid items with the §5.1 distribution.
- Sixteen consecutive exams can be taken without a single repeated question.
- Reloading mid-exam restores the exact state including the timer.
- No purple, no gradient, no Tailwind default color class in the source.
- The emblem is the only decorative image in the app.
- A finished attempt exports to A4 PDF with correctly joined Arabic, no question split across
  two pages, and a French question rendering left-to-right inside the RTL document.
- An attempt from the history screen exports identically to one just finished.

## 13. When to stop and ask

Ask the candidate (do not guess) if: the emblem file is ambiguous · a reference document is
unreadable · a legal fact cannot be verified from a public source · the exam duration or the
60-question format differs from what the official announcement says.
