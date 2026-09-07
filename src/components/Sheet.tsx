import type { ReactNode } from "react";

type SheetProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
};

export function Sheet({ open, onClose, title, children }: SheetProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink/40 sm:items-center">
      <button
        aria-label="إغلاق"
        onClick={onClose}
        className="absolute inset-0 h-full w-full cursor-default"
      />
      <div className="relative w-full max-w-md rounded-t-[2px] border border-ink/15 bg-paper-2 p-6 sm:rounded-[2px]">
        <h2 className="font-kufi text-[length:var(--text-scale-3)] font-bold text-ink">
          {title}
        </h2>
        <div className="mt-4">{children}</div>
      </div>
    </div>
  );
}
