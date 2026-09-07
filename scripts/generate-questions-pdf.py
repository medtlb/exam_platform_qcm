#!/usr/bin/env python3
"""
Generate an A4-ready HTML document with all questions and correct answers.
Open the output HTML in a browser and print to PDF (Ctrl+P → Save as PDF).
Arabic text renders RTL, French text renders LTR. Correct answers are marked.
"""

import json
import html
import os

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_DIR = os.path.dirname(SCRIPT_DIR)
BANK_PATH = os.path.join(PROJECT_DIR, "src", "data", "questions.json")
OUTPUT_PATH = os.path.join(PROJECT_DIR, "all-questions.html")

SECTION_LABELS = {
    "general": ("الثقافة العامة", "General Culture"),
    "arabic": ("اللغة العربية", "Arabic Language"),
    "french": ("اللغة الفرنسية", "French Language"),
}

DIFFICULTY_LABELS = {1: "١", 2: "٢", 3: "٣", 4: "٤", 5: "٥"}


def load_bank():
    with open(BANK_PATH, "r", encoding="utf-8") as f:
        return json.load(f)


def esc(text):
    return html.escape(str(text))


def build_html(questions):
    # Group by section in order
    grouped = {"general": [], "arabic": [], "french": []}
    for q in questions:
        grouped.setdefault(q["section"], []).append(q)

    sections_html = []
    global_num = 0

    for section_key in ["general", "arabic", "french"]:
        items = grouped.get(section_key, [])
        if not items:
            continue

        ar_label, en_label = SECTION_LABELS[section_key]
        sections_html.append(f'''
        <div class="section-header">
            <h2>{esc(ar_label)}</h2>
            <span class="section-sub">{esc(en_label)} — {len(items)} سؤال</span>
        </div>
        ''')

        for q in items:
            global_num += 1
            correct_set = set(q.get("correct", []))
            is_multi = len(correct_set) > 1
            lang = q.get("lang", "ar")
            text_dir = "rtl" if lang == "ar" else "ltr"
            text_align = "right" if lang == "ar" else "left"

            # Build options
            options_html = ""
            for opt in q.get("options", []):
                is_correct = opt["id"] in correct_set
                cls = "option correct" if is_correct else "option"
                marker = "✓" if is_correct else ""
                options_html += f'''
                <div class="{cls}" dir="{text_dir}" style="text-align:{text_align}">
                    <span class="opt-marker">{marker}</span>
                    <span class="opt-id">{esc(opt["id"]).upper()}</span>
                    <span class="opt-text">{esc(opt["text"])}</span>
                </div>
                '''

            # Explanation
            explanation = q.get("explanation", "")
            explanation_html = ""
            if explanation:
                explanation_html = f'''
                <div class="explanation" dir="{text_dir}" style="text-align:{text_align}">
                    <strong>{"الشرح" if lang == "ar" else "Explication"} :</strong> {esc(explanation)}
                </div>
                '''

            # Source
            source = q.get("source", "")
            source_html = ""
            if source:
                source_html = f'<div class="source" dir="{text_dir}" style="text-align:{text_align}">📎 {esc(source)}</div>'

            # Topic & difficulty
            topic = q.get("topic", "")
            diff = q.get("difficulty", 1)
            multi_badge = '<span class="badge multi">متعدد</span>' if is_multi else ""

            sections_html.append(f'''
            <div class="question-block" dir="{text_dir}">
                <div class="q-header">
                    <span class="q-num">{global_num}</span>
                    <span class="q-meta">
                        <span class="badge topic">{esc(topic)}</span>
                        <span class="badge diff">مستوى {DIFFICULTY_LABELS.get(diff, str(diff))}</span>
                        {multi_badge}
                    </span>
                </div>
                <div class="q-prompt" dir="{text_dir}" style="text-align:{text_align}">
                    {esc(q.get("prompt", ""))}
                </div>
                <div class="options-list">
                    {options_html}
                </div>
                {explanation_html}
                {source_html}
            </div>
            ''')

    return f'''<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>بنك الأسئلة — مسابقة مفتشي الجمارك</title>
<style>
@import url('https://fonts.googleapis.com/css2?family=Noto+Kufi+Arabic:wght@400;700&family=IBM+Plex+Sans+Arabic:wght@400;500;600&family=IBM+Plex+Sans:wght@400;500;600&display=swap');

:root {{
    --ink: #14261C;
    --green: #0E4D33;
    --green-dk: #082D1F;
    --brass: #A9812B;
    --paper: #EFEDE4;
    --paper-2: #FFFFFF;
    --stamp: #8E2B24;
    --correct-bg: #e8f5e9;
    --correct-border: #0E4D33;
}}

* {{ margin: 0; padding: 0; box-sizing: border-box; }}

body {{
    font-family: 'IBM Plex Sans Arabic', 'IBM Plex Sans', sans-serif;
    font-size: 13px;
    line-height: 1.6;
    color: var(--ink);
    background: var(--paper);
    padding: 0;
}}

@page {{
    size: A4 portrait;
    margin: 14mm 12mm;
}}

@media print {{
    body {{ background: white; padding: 0; font-size: 11px; }}
    .cover {{ page-break-after: always; }}
    .section-header {{ page-break-before: always; }}
    .question-block {{ break-inside: avoid; }}
    .no-print {{ display: none !important; }}
}}

/* Cover page */
.cover {{
    text-align: center;
    padding: 80px 40px;
    background: var(--paper-2);
    border: 2px solid var(--green);
    margin: 20px auto;
    max-width: 800px;
}}
.cover img {{
    width: 120px;
    height: auto;
    margin-bottom: 30px;
}}
.cover h1 {{
    font-family: 'Noto Kufi Arabic', serif;
    font-size: 28px;
    color: var(--green-dk);
    margin-bottom: 10px;
}}
.cover .subtitle {{
    font-size: 18px;
    color: var(--brass);
    margin-bottom: 40px;
}}
.cover .stats {{
    font-size: 15px;
    color: var(--ink);
    line-height: 2;
}}
.cover .stats strong {{
    color: var(--green);
}}

/* Content container */
.content {{
    max-width: 800px;
    margin: 0 auto;
    padding: 10px 20px;
}}

/* Section headers */
.section-header {{
    background: var(--green-dk);
    color: white;
    padding: 16px 24px;
    margin: 30px 0 16px;
    border-inline-start: 5px solid var(--brass);
}}
.section-header h2 {{
    font-family: 'Noto Kufi Arabic', serif;
    font-size: 22px;
    margin-bottom: 4px;
}}
.section-sub {{
    font-size: 13px;
    opacity: 0.85;
}}

/* Question block */
.question-block {{
    background: var(--paper-2);
    border: 1px solid #d5d0c4;
    padding: 14px 18px;
    margin-bottom: 12px;
    border-radius: 2px;
}}

.q-header {{
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 8px;
    flex-wrap: wrap;
}}
.q-num {{
    font-family: 'Noto Kufi Arabic', serif;
    font-size: 18px;
    font-weight: 700;
    color: var(--brass);
    min-width: 36px;
}}
.q-meta {{
    display: flex;
    gap: 6px;
    flex-wrap: wrap;
}}
.badge {{
    font-size: 11px;
    padding: 2px 8px;
    border-radius: 2px;
    border: 1px solid;
}}
.badge.topic {{
    background: #f5f0e0;
    border-color: var(--brass);
    color: var(--brass);
}}
.badge.diff {{
    background: #eef5f0;
    border-color: var(--green);
    color: var(--green);
}}
.badge.multi {{
    background: #fef3e0;
    border-color: #c67c00;
    color: #c67c00;
}}

.q-prompt {{
    font-size: 14px;
    font-weight: 500;
    margin-bottom: 10px;
    line-height: 1.7;
    color: var(--ink);
}}

/* Options */
.options-list {{
    margin-bottom: 8px;
}}
.option {{
    display: flex;
    align-items: baseline;
    gap: 8px;
    padding: 5px 10px;
    border-bottom: 1px solid rgba(20,38,28,0.08);
    font-size: 13px;
    line-height: 1.6;
}}
.option:last-child {{
    border-bottom: none;
}}
.option.correct {{
    background: var(--correct-bg);
    border-inline-start: 3px solid var(--correct-border);
    font-weight: 500;
}}
.opt-marker {{
    color: var(--green);
    font-weight: 700;
    min-width: 16px;
    font-size: 14px;
}}
.opt-id {{
    color: var(--brass);
    font-weight: 600;
    min-width: 20px;
    font-size: 12px;
}}
.opt-text {{
    flex: 1;
}}

/* Explanation */
.explanation {{
    font-size: 12px;
    color: #3a5a45;
    background: #f3f7f4;
    padding: 8px 12px;
    margin-top: 6px;
    border-radius: 2px;
    line-height: 1.7;
    border-inline-start: 2px solid var(--green);
}}

.source {{
    font-size: 11px;
    color: #777;
    margin-top: 4px;
}}

/* Print button */
.print-btn {{
    position: fixed;
    bottom: 24px;
    left: 24px;
    background: var(--green);
    color: white;
    border: none;
    padding: 14px 28px;
    font-size: 16px;
    font-family: 'Noto Kufi Arabic', serif;
    cursor: pointer;
    border-radius: 2px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.2);
    z-index: 1000;
}}
.print-btn:hover {{
    background: var(--green-dk);
}}
</style>
</head>
<body>

<button class="print-btn no-print" onclick="window.print()">طباعة / حفظ PDF</button>

<div class="cover">
    <img src="public/emblem.png" alt="شعار الجمارك" onerror="this.style.display='none'">
    <h1>بنك الأسئلة الكامل</h1>
    <div class="subtitle">مسابقة الاكتتاب في سلك مفتشي الجمارك — موريتانيا</div>
    <div class="stats">
        <strong>الثقافة العامة:</strong> {len(grouped.get("general",[]))} سؤال<br>
        <strong>اللغة العربية:</strong> {len(grouped.get("arabic",[]))} سؤال<br>
        <strong>اللغة الفرنسية:</strong> {len(grouped.get("french",[]))} سؤال<br>
        <br>
        <strong>المجموع:</strong> {len(questions)} سؤال
    </div>
</div>

<div class="content">
    {"".join(sections_html)}
</div>

</body>
</html>'''


def main():
    questions = load_bank()
    print(f"Loaded {len(questions)} questions from {BANK_PATH}")

    html_content = build_html(questions)

    with open(OUTPUT_PATH, "w", encoding="utf-8") as f:
        f.write(html_content)

    print(f"Generated HTML → {OUTPUT_PATH}")
    print(f"Open in browser and press Ctrl+P to save as PDF.")
    print(f"Or click the '🖨 طباعة / حفظ PDF' button in the page.")


if __name__ == "__main__":
    main()
