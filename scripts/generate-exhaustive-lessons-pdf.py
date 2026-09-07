#!/usr/bin/env python3
"""
Generate an Exhaustive Study Guide & Lessons Handbook (comprehensive-study-guide.html)
Synthesizes all 1,000 questions and explanations from questions.json into a structured textbook
that prepares a candidate to answer every single question in the Mauritanian Customs Exam.
"""

import json
import html
import os
import re

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_DIR = os.path.dirname(SCRIPT_DIR)
BANK_PATH = os.path.join(PROJECT_DIR, "src", "data", "questions.json")
OUTPUT_PATH = os.path.join(PROJECT_DIR, "comprehensive-study-guide.html")


def load_questions():
    with open(BANK_PATH, "r", encoding="utf-8") as f:
        return json.load(f)


def esc(text):
    return html.escape(str(text))


def generate_exhaustive_guide():
    questions = load_questions()
    print(f"Processing {len(questions)} questions for exhaustive study guide...")

    # Categorize questions by topic
    topics_map = {}
    for q in questions:
        sec = q.get("section", "general")
        top = q.get("topic", "عام")
        key = f"{sec}::{top}"
        topics_map.setdefault(key, []).append(q)

    # Build Lesson Sections with embedded question knowledge items
    sections_code = []

    # -------------------------------------------------------------
    # MODULE 1: CUSTOMS LAW & PROCEDURES
    # -------------------------------------------------------------
    customs_qs = [q for q in questions if "douane" in q.get("topic", "").lower() or "customs" in q.get("topic", "").lower() or q.get("section") == "general" and any(k in q.get("prompt", "") for k in ["جمارك", "جمركي", "إيداع", "عبور", "تصريح", "دائرة", "تعريفة"])]
    
    mod1_items = []
    for idx, q in enumerate(customs_qs, 1):
        correct_opts = [opt["text"] for opt in q.get("options", []) if opt["id"] in q.get("correct", [])]
        correct_str = " | ".join(correct_opts)
        source = f" <em>({esc(q['source'])})</em>" if q.get("source") else ""
        mod1_items.append(f'''
        <div class="concept-card">
            <div class="concept-head">
                <span class="c-num">مفهوم {idx}</span>
                <span class="c-title">{esc(q['prompt'])}</span>
            </div>
            <div class="c-answer"><strong>الإجابة الصحيحة:</strong> {esc(correct_str)}</div>
            <div class="c-expl"><strong>الشرح القانوني والتفصيلي:</strong> {esc(q.get('explanation', ''))}{source}</div>
        </div>
        ''')

    # -------------------------------------------------------------
    # MODULE 2: MAURITANIAN GENERAL CULTURE (HISTORY, GEOGRAPHY, INSTITUTIONS)
    # -------------------------------------------------------------
    mau_qs = [q for q in questions if q.get("section") == "general" and any(k in (q.get("topic", "") + q.get("prompt", "")) for k in ["موريتانيا", "نواكشوط", "نواذيبو", "ولاية", "استقلال", "دستور", "رئيس", "حدود", "شينقيط", "آدرار", "سنيم", "أرغين"])]
    
    mod2_items = []
    for idx, q in enumerate(mau_qs, 1):
        correct_opts = [opt["text"] for opt in q.get("options", []) if opt["id"] in q.get("correct", [])]
        correct_str = " | ".join(correct_opts)
        mod2_items.append(f'''
        <div class="concept-card">
            <div class="concept-head">
                <span class="c-num">حقيقة {idx}</span>
                <span class="c-title">{esc(q['prompt'])}</span>
            </div>
            <div class="c-answer"><strong>الإجابة الصحيحة:</strong> {esc(correct_str)}</div>
            <div class="c-expl"><strong>التوضيح المرجعي:</strong> {esc(q.get('explanation', ''))}</div>
        </div>
        ''')

    # -------------------------------------------------------------
    # MODULE 3: PUBLIC FINANCE, ECONOMICS & LAW
    # -------------------------------------------------------------
    econ_qs = [q for q in questions if q.get("section") == "general" and q not in customs_qs and q not in mau_qs]
    
    mod3_items = []
    for idx, q in enumerate(econ_qs, 1):
        correct_opts = [opt["text"] for opt in q.get("options", []) if opt["id"] in q.get("correct", [])]
        correct_str = " | ".join(correct_opts)
        mod3_items.append(f'''
        <div class="concept-card">
            <div class="concept-head">
                <span class="c-num">نقطة {idx}</span>
                <span class="c-title">{esc(q['prompt'])}</span>
            </div>
            <div class="c-answer"><strong>الإجابة الصحيحة:</strong> {esc(correct_str)}</div>
            <div class="c-expl"><strong>الشرح:</strong> {esc(q.get('explanation', ''))}</div>
        </div>
        ''')

    # -------------------------------------------------------------
    # MODULE 4: ARABIC LANGUAGE (ALL 300 QUESTIONS EXPLAINED)
    # -------------------------------------------------------------
    arabic_qs = [q for q in questions if q.get("section") == "arabic"]
    
    # Group Arabic by topic
    arabic_by_topic = {}
    for q in arabic_qs:
        arabic_by_topic.setdefault(q.get("topic", "عربي"), []).append(q)

    mod4_sections = []
    for top_name, q_list in arabic_by_topic.items():
        cards = []
        for idx, q in enumerate(q_list, 1):
            correct_opts = [opt["text"] for opt in q.get("options", []) if opt["id"] in q.get("correct", [])]
            correct_str = " | ".join(correct_opts)
            cards.append(f'''
            <div class="concept-card">
                <div class="concept-head">
                    <span class="c-num">{esc(top_name)} #{idx}</span>
                    <span class="c-title">{esc(q['prompt'])}</span>
                </div>
                <div class="c-answer"><strong>القاعدة / الإجابة الصحيحة:</strong> {esc(correct_str)}</div>
                <div class="c-expl"><strong>الشرح والتعليل اللغوي:</strong> {esc(q.get('explanation', ''))}</div>
            </div>
            ''')
        mod4_sections.append(f'''
        <div class="sub-topic-group">
            <h3 class="sub-topic-title">فرع: {esc(top_name)} ({len(q_list)} مسألة)</h3>
            {"".join(cards)}
        </div>
        ''')

    # -------------------------------------------------------------
    # MODULE 5: FRENCH LANGUAGE (ALL 300 QUESTIONS EXPLAINED)
    # -------------------------------------------------------------
    french_qs = [q for q in questions if q.get("section") == "french"]
    
    french_by_topic = {}
    for q in french_qs:
        french_by_topic.setdefault(q.get("topic", "Français"), []).append(q)

    mod5_sections = []
    for top_name, q_list in french_by_topic.items():
        cards = []
        for idx, q in enumerate(q_list, 1):
            correct_opts = [opt["text"] for opt in q.get("options", []) if opt["id"] in q.get("correct", [])]
            correct_str = " | ".join(correct_opts)
            cards.append(f'''
            <div class="concept-card fr-card" dir="ltr">
                <div class="concept-head">
                    <span class="c-num">{esc(top_name.upper())} #{idx}</span>
                    <span class="c-title">{esc(q['prompt'])}</span>
                </div>
                <div class="c-answer"><strong>Réponse correcte :</strong> {esc(correct_str)}</div>
                <div class="c-expl"><strong>Explication :</strong> {esc(q.get('explanation', ''))}</div>
            </div>
            ''')
        mod5_sections.append(f'''
        <div class="sub-topic-group">
            <h3 class="sub-topic-title" dir="ltr" style="text-align:left">Section: {esc(top_name.capitalize())} ({len(q_list)} questions)</h3>
            {"".join(cards)}
        </div>
        ''')

    # HTML Template
    full_html = f'''<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>الكتاب المرجعي الشامل لتحضير مسابقة الجمارك الموريتانية (1000 سؤال وشرح)</title>
<style>
@import url('https://fonts.googleapis.com/css2?family=Noto+Kufi+Arabic:wght@400;600;700&family=IBM+Plex+Sans+Arabic:wght@400;500;600;700&family=IBM+Plex+Sans:wght@400;500;600;700&display=swap');

:root {{
    --ink: #14261C;
    --green: #0E4D33;
    --green-dk: #082D1F;
    --brass: #A9812B;
    --paper: #EFEDE4;
    --paper-2: #FFFFFF;
    --stamp: #8E2B24;
}}

* {{ margin: 0; padding: 0; box-sizing: border-box; }}

body {{
    font-family: 'IBM Plex Sans Arabic', 'IBM Plex Sans', sans-serif;
    font-size: 13px;
    line-height: 1.7;
    color: var(--ink);
    background: var(--paper);
}}

@page {{
    size: A4 portrait;
    margin: 12mm 10mm;
}}

@media print {{
    body {{ background: white; font-size: 11px; }}
    .cover-page {{ page-break-after: always; }}
    .chapter-header {{ page-break-before: always; }}
    .concept-card {{ break-inside: avoid; page-break-inside: avoid; margin-bottom: 10px; }}
    .no-print {{ display: none !important; }}
}}

/* Cover styling */
.cover-page {{
    text-align: center;
    padding: 80px 40px;
    background: var(--paper-2);
    border: 3px double var(--green);
    margin: 20px auto;
    max-width: 860px;
    box-shadow: 0 4px 15px rgba(0,0,0,0.06);
}}
.cover-page img {{
    width: 140px;
    height: auto;
    margin-bottom: 25px;
}}
.cover-page h1 {{
    font-family: 'Noto Kufi Arabic', serif;
    font-size: 28px;
    color: var(--green-dk);
    margin-bottom: 12px;
}}
.cover-page .subtitle {{
    font-size: 19px;
    color: var(--brass);
    font-weight: 700;
    margin-bottom: 30px;
}}
.cover-page .stats-box {{
    background: #f7f4ea;
    border: 1px solid var(--brass);
    border-inline-start: 6px solid var(--green);
    padding: 20px 24px;
    text-align: right;
    font-size: 14px;
    line-height: 1.9;
    margin: 0 auto;
    max-width: 720px;
}}

/* Layout Container */
.container {{
    max-width: 880px;
    margin: 0 auto;
    padding: 20px;
}}

/* Chapter Header */
.chapter-header {{
    background: var(--green-dk);
    color: white;
    padding: 20px 25px;
    margin: 35px 0 20px;
    border-inline-start: 8px solid var(--brass);
    border-radius: 2px;
}}
.chapter-header h2 {{
    font-family: 'Noto Kufi Arabic', serif;
    font-size: 22px;
    margin-bottom: 6px;
}}
.chapter-desc {{
    font-size: 13px;
    color: #d2e4d9;
}}

/* Sub Topic Group */
.sub-topic-group {{
    margin-bottom: 25px;
}}
.sub-topic-title {{
    font-family: 'Noto Kufi Arabic', serif;
    font-size: 16px;
    color: var(--green-dk);
    border-bottom: 2px solid var(--brass);
    padding-bottom: 6px;
    margin-bottom: 14px;
}}

/* Concept Card */
.concept-card {{
    background: var(--paper-2);
    border: 1px solid #dcd7ca;
    padding: 12px 16px;
    margin-bottom: 10px;
    border-radius: 2px;
    border-inline-start: 4px solid var(--green);
}}
.concept-card.fr-card {{
    border-inline-start-color: var(--brass);
    text-align: left;
}}

.concept-head {{
    display: flex;
    align-items: baseline;
    gap: 10px;
    margin-bottom: 6px;
}}
.c-num {{
    font-weight: 700;
    color: var(--brass);
    font-size: 12px;
    white-space: nowrap;
    background: #f5f0e3;
    padding: 2px 8px;
    border-radius: 2px;
}}
.c-title {{
    font-size: 14px;
    font-weight: 600;
    color: var(--ink);
    flex: 1;
}}
.c-answer {{
    font-size: 13px;
    color: var(--green-dk);
    background: #eaf4ed;
    padding: 6px 12px;
    margin: 6px 0;
    border-radius: 2px;
    line-height: 1.6;
}}
.c-expl {{
    font-size: 12px;
    color: #3b5243;
    background: #f8faf8;
    padding: 8px 12px;
    border-inline-start: 2px solid var(--brass);
    margin-top: 6px;
    line-height: 1.7;
}}

/* Floating print button */
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
    box-shadow: 0 4px 12px rgba(0,0,0,0.25);
    z-index: 1000;
}}
.print-btn:hover {{
    background: var(--green-dk);
}}
</style>
</head>
<body>

<button class="print-btn no-print" onclick="window.print()">طباعة / حفظ PDF</button>

<div class="cover-page">
    <img src="public/emblem.png" alt="شعار الجمارك" onerror="this.style.display='none'">
    <h1>الكتاب المرجعي الشامل للتحضير لمسابقة الجمارك</h1>
    <div class="subtitle">الشرح الفقهي والتفصيلي لجميع المفاهيم الـ 1000 المقررة في الامتحان</div>
    <div class="stats-box">
        <strong>محتويات الكتاب المرجعي:</strong><br>
        • <strong>الباب الأول:</strong> التشريع والمدونة الجمركية الموريتانية (قانون 015-2026 والأنظمة والأنشطة الجمركية) — <strong>{len(customs_qs)} مسألة ومشروح</strong><br>
        • <strong>الباب الثاني:</strong> الثقافة العامة والمؤسسات والجغرافيا والتاريخ الموريتاني — <strong>{len(mau_qs)} حقيقة ومشروح</strong><br>
        • <strong>الباب الثالث:</strong> الاقتصاد، المالية العامة، القانون الإداري والمنظمات الدولية — <strong>{len(econ_qs)} مفهوم ومشروح</strong><br>
        • <strong>الباب الرابع:</strong> الشرح الشامل لقواعد اللغة العربية (النحو، الصرف، البلاغة، والإملاء) — <strong>{len(arabic_qs)} مسألة وقاعدة</strong><br>
        • <strong>الباب الخامس:</strong> Guide de la Langue Française & Style Administratif — <strong>{len(french_qs)} règles et questions</strong><br>
        <br>
        <strong>المجموع الكلي: 1000 مسألة وشرح تفصيلي مغطي بالكامل لجميع أسئلة المسابقة.</strong>
    </div>
</div>

<div class="container">

    <!-- CHAPTER 1 -->
    <div class="chapter-header">
        <h2>الباب الأول: التشريع والمدونة الجمركية الموريتانية (قانون 015-2026)</h2>
        <div class="chapter-desc">يتضمن جميع المفاهيم والمواد القانونية والأنظمة الجمركية الواردة في أسئلة المسابقة ({len(customs_qs)} موضوع).</div>
    </div>
    {"".join(mod1_items)}

    <!-- CHAPTER 2 -->
    <div class="chapter-header">
        <h2>الباب الثاني: الثقافة العامة — التاريخ، الجغرافيا والمؤسسات الموريتانية</h2>
        <div class="chapter-desc">شرح كامل لجميع الحقائق التاريخية، التقسيمات الإدارية، الجغرافيا، والرموز الوطنية ({len(mau_qs)} موضوع).</div>
    </div>
    {"".join(mod2_items)}

    <!-- CHAPTER 3 -->
    <div class="chapter-header">
        <h2>الباب الثالث: الاقتصاد، المالية العامة، القانون الإداري والمنظمات الدولية</h2>
        <div class="chapter-desc">شرح قواعد التجارة الدولية، مصطلحات Incoterms 2020، الميزانية العامة والقانون الإداري ({len(econ_qs)} موضوع).</div>
    </div>
    {"".join(mod3_items)}

    <!-- CHAPTER 4 -->
    <div class="chapter-header">
        <h2>الباب الرابع: قواعد وشروحات اللغة العربية الكاملة</h2>
        <div class="chapter-desc">تغطية شاملة لـ 300 مسألة في النحو والصرف والبلاغة والإملاء مع التعليل والتوجيه اللغوي.</div>
    </div>
    {"".join(mod4_sections)}

    <!-- CHAPTER 5 -->
    <div class="chapter-header" dir="ltr" style="text-align:left">
        <h2>Module 5: Guide Complet de la Langue Française et Style Administratif</h2>
        <div class="chapter-desc">Explication détaillée de l'ensemble des 300 questions de français (Grammaire, Conjugaison, Vocabulaire, Rédaction).</div>
    </div>
    {"".join(mod5_sections)}

</div>

</body>
</html>'''

    with open(OUTPUT_PATH, "w", encoding="utf-8") as f:
        f.write(full_html)

    print(f"Generated Exhaustive Guide HTML → {OUTPUT_PATH}")


if __name__ == "__main__":
    generate_exhaustive_guide()
