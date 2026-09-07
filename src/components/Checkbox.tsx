type CheckboxProps = {
  id?: string;
  label: string;
  checked: boolean;
  onChange: () => void;
  className?: string;
};

/**
 * A ticked square + its text, as one button.
 *
 * Deliberately not a native <input type="checkbox">: the checked state is
 * rendered straight from the `checked` prop rather than from CSS `:checked`,
 * and the click is a plain onClick rather than label-to-input forwarding.
 * That keeps it working regardless of label nesting, and avoids the
 * `has-checked:` variant, which this Tailwind version does not compile.
 */
export function Checkbox({ id, label, checked, onChange, className = "" }: CheckboxProps) {
  return (
    <button
      type="button"
      id={id}
      role="checkbox"
      aria-checked={checked}
      onClick={onChange}
      className={[
        "flex flex-1 cursor-pointer items-center gap-3 text-start select-none",
        className,
      ].join(" ")}
    >
      <span
        aria-hidden="true"
        className={[
          "inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-[2px] border",
          checked ? "border-brass bg-brass" : "border-ink/50",
        ].join(" ")}
      >
        {checked && (
          <svg viewBox="0 0 16 16" className="h-3 w-3 fill-none stroke-paper-2 stroke-2">
            <path d="M3 8.5 6.5 12 13 4" strokeLinecap="square" />
          </svg>
        )}
      </span>
      <span className="text-[length:var(--text-scale-4)]">{label}</span>
    </button>
  );
}
