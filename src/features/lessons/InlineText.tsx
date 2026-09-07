import { Fragment } from "react";

// Splits on the **bold** / *italic* markers the lesson bank carries, keeping
// the delimiters so each run can be wrapped in the right element.
const MARKER = /(\*\*[^*]+\*\*|\*[^*]+\*)/g;

/** Renders one lesson string with its inline emphasis, without raw HTML. */
export function InlineText({ text }: { text: string }) {
  return (
    <>
      {text.split(MARKER).map((run, i) => {
        if (run.startsWith("**") && run.endsWith("**")) {
          return (
            <strong key={i} className="font-semibold">
              {run.slice(2, -2)}
            </strong>
          );
        }
        if (run.startsWith("*") && run.endsWith("*") && run.length > 2) {
          return (
            <em key={i} className="italic">
              {run.slice(1, -1)}
            </em>
          );
        }
        return <Fragment key={i}>{run}</Fragment>;
      })}
    </>
  );
}
