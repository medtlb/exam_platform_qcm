import { formatMark20 } from "../lib/format";
import { assetUrl } from "../lib/assets";

type StampBadgeProps = {
  mark20: number;
  date: string;
  pass: boolean;
  emblemSrc?: string;
};

export function StampBadge({ mark20, date, pass, emblemSrc = assetUrl("emblem.png") }: StampBadgeProps) {
  const color = pass ? "var(--color-green)" : "var(--color-stamp)";

  return (
    <div
      className="animate-stamp-press mx-auto flex h-44 w-44 -rotate-6 flex-col items-center justify-center rounded-full border-4"
      style={{ borderColor: color, color }}
    >
      <img src={emblemSrc} alt="" aria-hidden="true" className="h-10 w-10 object-contain" />
      <span className="mt-1 font-kufi text-[length:var(--text-scale-1)] font-bold">
        {formatMark20(mark20)}
      </span>
      <span className="text-[length:var(--text-scale-5)]">٢٠ / </span>
      <span className="mt-1 text-[length:var(--text-scale-5)]">{date}</span>
    </div>
  );
}
