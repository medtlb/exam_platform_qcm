import type { LessonBlock, LessonEntry } from "../../lib/types";
import { toArabicNumerals } from "../../lib/format";
import { InlineText } from "./InlineText";

function EntryMarker({ ordered, index }: { ordered: boolean; index: number }) {
  if (ordered) {
    return (
      <span className="w-5 shrink-0 font-latin tabular-nums text-brass">
        {toArabicNumerals(String(index + 1))}
      </span>
    );
  }
  return <span aria-hidden="true" className="mt-2.5 h-1.5 w-1.5 shrink-0 bg-brass" />;
}

function EntryList({
  entries,
  ordered,
  depth,
  forPrint,
}: {
  entries: LessonEntry[];
  ordered: boolean;
  depth: number;
  forPrint: boolean;
}) {
  const nested = depth > 0;

  return (
    <ul className={nested ? "mt-2 flex flex-col gap-2 border-s border-brass/40 ps-3" : "flex flex-col"}>
      {entries.map((entry, index) => (
        <li
          key={index}
          className={[
            nested
              ? "flex gap-2"
              : "flex gap-2 border-t border-ink/12 py-3 first:border-t-0 first:pt-0 last:pb-0",
            // Top-level points are the pagination unit of the PDF export: a
            // page may break between two of them, never inside one.
            !nested && forPrint ? "pdf-block print-point" : "",
          ].join(" ")}
        >
          {!nested && <EntryMarker ordered={ordered} index={index} />}
          <div className="min-w-0 flex-1">
            {entry.term && (
              <span className="font-semibold text-green-dk">
                <InlineText text={entry.term} />
                {entry.text ? ": " : ""}
              </span>
            )}
            {entry.text && <InlineText text={entry.text} />}
            {entry.items && entry.items.length > 0 && (
              <EntryList
                entries={entry.items}
                ordered={entry.ordered ?? false}
                depth={depth + 1}
                forPrint={forPrint}
              />
            )}
          </div>
        </li>
      ))}
    </ul>
  );
}

function LessonTable({
  head,
  rows,
  forPrint,
}: {
  head: string[];
  rows: string[][];
  forPrint: boolean;
}) {
  return (
    // Wide reference tables (Incoterms) scroll on their own rather than
    // pushing the sheet sideways on a 360px screen. On paper they fit the
    // column, so they travel as one indivisible block.
    <div className={forPrint ? "pdf-block print-point" : "overflow-x-auto"}>
      <table className="w-full min-w-[32rem] border-collapse text-start">
        <thead>
          <tr>
            {head.map((cell, i) => (
              <th
                key={i}
                scope="col"
                className="border-b border-brass bg-paper px-3 py-2 text-start font-kufi text-[length:var(--text-scale-5)] font-bold text-green-dk"
              >
                <InlineText text={cell} />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, r) => (
            <tr key={r}>
              {row.map((cell, c) => (
                <td key={c} className="border-b border-ink/12 px-3 py-2 align-top">
                  <InlineText text={cell} />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

type LessonBlocksProps = {
  blocks: LessonBlock[];
  /** Tags each point as a `pdf-block` so the PDF export can paginate on it. */
  forPrint?: boolean;
};

export function LessonBlocks({ blocks, forPrint = false }: LessonBlocksProps) {
  return (
    <div className="flex flex-col gap-6 text-[length:var(--text-scale-4)] leading-relaxed">
      {blocks.map((block, index) => {
        if (block.kind === "note") {
          return (
            <p
              key={index}
              className={[
                "border-s-2 border-brass px-4 py-3 text-ink/85",
                forPrint ? "pdf-block print-point" : "bg-paper",
              ].join(" ")}
            >
              <InlineText text={block.text} />
            </p>
          );
        }
        if (block.kind === "table") {
          return (
            <LessonTable key={index} head={block.head} rows={block.rows} forPrint={forPrint} />
          );
        }
        return (
          <EntryList
            key={index}
            entries={block.items}
            ordered={block.ordered}
            depth={0}
            forPrint={forPrint}
          />
        );
      })}
    </div>
  );
}
