import type { ButtonHTMLAttributes, ReactNode } from "react";

type Variant = "primary" | "secondary" | "danger";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  children: ReactNode;
};

const variantClasses: Record<Variant, string> = {
  primary:
    "bg-green text-paper-2 hover:bg-green-dk disabled:bg-ink/30 disabled:text-paper-2",
  secondary:
    "bg-transparent text-ink border border-ink/40 hover:border-ink disabled:border-ink/15 disabled:text-ink/40",
  danger:
    "bg-transparent text-stamp border border-stamp/60 hover:border-stamp disabled:border-stamp/20 disabled:text-stamp/40",
};

export function Button({
  variant = "primary",
  className = "",
  children,
  ...rest
}: ButtonProps) {
  return (
    <button
      className={[
        "rounded-[2px] px-5 py-2.5 text-[length:var(--text-scale-4)] font-medium transition-colors",
        "disabled:cursor-not-allowed",
        variantClasses[variant],
        className,
      ].join(" ")}
      {...rest}
    >
      {children}
    </button>
  );
}
