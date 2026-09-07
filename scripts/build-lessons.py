#!/usr/bin/env python3
"""Turns all-lessons.html (the printable study guide) into src/data/lessons.json,
the structured bank the /lessons screens read.

Run after editing the guide:  python3 scripts/build-lessons.py
"""

import json
import re
import sys
from pathlib import Path

from bs4 import BeautifulSoup, NavigableString, Tag

ROOT = Path(__file__).resolve().parent.parent
SOURCE = ROOT / "all-lessons.html"
TARGET = ROOT / "src" / "data" / "lessons.json"

# Which bank section / topics each lesson feeds. Keys are "<module>-<lesson>"
# indexes in document order; the topic strings must match TOPIC_TARGETS in
# src/lib/bankTargets.ts so a lesson can be tied back to real questions.
MODULE_SECTION = {1: "general", 2: "general", 3: "general", 4: "arabic", 5: "french"}
MODULE_LANG = {1: "ar", 2: "ar", 3: "ar", 4: "ar", 5: "fr"}
LESSON_TOPICS = {
    "m1-l1": ["الجمارك والتجارة"],
    "m1-l2": ["الجمارك والتجارة"],
    "m1-l3": ["الجمارك والتجارة"],
    "m1-l4": ["الجمارك والتجارة", "القانون والإدارة"],
    "m2-l1": ["العلاقات الدولية", "الجمارك والتجارة"],
    "m2-l2": ["الجمارك والتجارة"],
    "m3-l1": ["موريتانيا"],
    "m3-l2": ["موريتانيا"],
    "m3-l3": ["موريتانيا", "المالية والاقتصاد"],
    "m4-l1": ["نحو"],
    "m4-l2": ["صرف", "بلاغة", "إملاء"],
    "m5-l1": ["grammaire", "conjugaison"],
    "m5-l2": ["vocabulaire", "rédaction administrative", "expressions"],
}



def inline(node) -> str:
    """Flattens a node's children to text, keeping bold/italic as **/* markers."""
    out = []
    for child in node.children:
        if isinstance(child, NavigableString):
            out.append(str(child))
        elif isinstance(child, Tag):
            if child.name in ("ul", "ol"):
                continue  # nested lists are lifted out by parse_list
            text = inline(child)
            if child.name == "strong":
                out.append(f"**{text.strip()}**" if text.strip() else "")
            elif child.name == "em":
                out.append(f"*{text.strip()}*" if text.strip() else "")
            elif child.name == "br":
                out.append(" ")
            else:
                out.append(text)
    return re.sub(r"\s+", " ", "".join(out)).strip()


def split_term(text: str) -> dict:
    """`**الرقابة الجمركية:** هي الإجراءات…` → {term, text}."""
    match = re.match(r"^\*\*(.+?)\*\*\s*(.*)$", text, flags=re.S)
    if not match:
        return {"text": text}
    term, rest = match.group(1).strip(), match.group(2).strip()
    term = re.sub(r"\s*[:：]\s*$", "", term)
    rest = re.sub(r"^[:：]\s*", "", rest)
    item = {"term": term}
    if rest:
        item["text"] = rest
    return item


def parse_list(tag: Tag) -> dict:
    items = []
    for li in tag.find_all("li", recursive=False):
        item = split_term(inline(li))
        children = [parse_list(sub) for sub in li.find_all(("ul", "ol"), recursive=False)]
        if children:
            # A nested list under an <li> is that entry's sub-points.
            item["items"] = [entry for group in children for entry in group["items"]]
            if children[0]["ordered"]:
                item["ordered"] = True
        items.append(item)
    return {"kind": "list", "ordered": tag.name == "ol", "items": items}


def parse_table(tag: Tag) -> dict:
    head = [inline(th) for th in tag.select("thead th")]
    rows = []
    for tr in tag.select("tbody tr"):
        rows.append([inline(td) for td in tr.find_all(("td", "th"), recursive=False)])
    return {"kind": "table", "head": head, "rows": rows}


def parse_blocks(content: Tag) -> list:
    blocks = []
    for child in content.children:
        if not isinstance(child, Tag):
            continue
        if child.name in ("ul", "ol"):
            blocks.append(parse_list(child))
        elif child.name == "table":
            blocks.append(parse_table(child))
        elif child.name in ("p", "div"):
            text = inline(child)
            if text:
                blocks.append({"kind": "note", "text": text})
    return blocks


def block_points(block: dict) -> int:
    """How many memorisable points a block holds — shown on the lesson card so
    the candidate can tell a four-line entry from a full Incoterms table."""
    if block["kind"] == "note":
        return 0
    if block["kind"] == "table":
        return len(block["rows"])
    total = 0
    stack = list(block["items"])
    while stack:
        item = stack.pop()
        children = item.get("items", [])
        # A parent that only introduces its sub-points isn't a point of its own.
        if not children:
            total += 1
        stack.extend(children)
    return total


def main() -> int:
    if not SOURCE.exists():
        print(f"missing source: {SOURCE}", file=sys.stderr)
        return 1

    soup = BeautifulSoup(SOURCE.read_text(encoding="utf-8"), "html.parser")
    intro = soup.select_one(".cover .intro-box")
    modules = []
    missing_topics = []

    for m_index, card in enumerate(soup.select(".module-card"), start=1):
        module_id = f"m{m_index}"
        header = card.select_one(".module-header")
        lessons = []

        for l_index, topic_block in enumerate(card.select(".topic-block"), start=1):
            lesson_id = f"{module_id}-l{l_index}"
            raw_title = topic_block.select_one(".topic-title").get_text(strip=True)
            title = re.sub(r"^\d+[.．]\s*", "", raw_title)
            blocks = parse_blocks(topic_block.select_one(".topic-content"))
            points = sum(block_points(b) for b in blocks)
            if lesson_id not in LESSON_TOPICS:
                missing_topics.append(lesson_id)
            lessons.append(
                {
                    "id": lesson_id,
                    "moduleId": module_id,
                    "order": l_index,
                    "title": title,
                    "lang": MODULE_LANG[m_index],
                    "topics": LESSON_TOPICS.get(lesson_id, []),
                    "points": points,
                    "blocks": blocks,
                }
            )

        modules.append(
            {
                "id": module_id,
                "order": m_index,
                "title": header.select_one("h2").get_text(strip=True),
                "titleFr": header.select_one(".module-fr").get_text(strip=True),
                "subtitle": header.select_one(".module-sub").get_text(strip=True),
                "section": MODULE_SECTION[m_index],
                "lang": MODULE_LANG[m_index],
                "lessons": lessons,
            }
        )

    if missing_topics:
        print(f"warning: no topic mapping for {', '.join(missing_topics)}", file=sys.stderr)

    payload = {
        "intro": re.sub(r"\s+", " ", intro.get_text(strip=True)) if intro else "",
        "modules": modules,
    }
    TARGET.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    lesson_count = sum(len(m["lessons"]) for m in modules)
    print(f"wrote {TARGET.relative_to(ROOT)} — {len(modules)} modules, {lesson_count} lessons")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
