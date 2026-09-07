import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";

const A4_WIDTH_MM = 210;
const A4_HEIGHT_MM = 297;
const MARGIN_X_MM = 16;
const MARGIN_Y_MM = 18;
const CONTENT_WIDTH_MM = A4_WIDTH_MM - 2 * MARGIN_X_MM;
const CONTENT_HEIGHT_MM = A4_HEIGHT_MM - 2 * MARGIN_Y_MM;

export type PdfExportProgress = { current: number; total: number };

// Arabic descenders paint below their line box, and html2canvas crops to the
// container's border box — without this bleed the last line of every page
// loses its tails.
const INK_BLEED_PX = 12;

// Tailwind v4's opacity-modifier utilities (e.g. `border-ink/12`) compile to
// `color-mix(in oklab, ...)`, and Chrome's computed style serializes those as
// `oklab(...)`. html2canvas's color parser doesn't understand that syntax
// and throws. Canvas fillStyle preserves whatever color space was given
// (setting it to an oklab string reads back as oklab), so round-tripping
// through the setter/getter alone doesn't help — instead we paint a 1x1
// pixel and read the rasterized bytes back, which are always concrete sRGB
// regardless of the input color space, then format those as a plain rgba().
let sanitizeCtx: CanvasRenderingContext2D | null | undefined;

function toSafeColor(value: string): string {
  if (!value) return value;
  if (sanitizeCtx === undefined) {
    const canvas = document.createElement("canvas");
    canvas.width = 1;
    canvas.height = 1;
    sanitizeCtx = canvas.getContext("2d", { willReadFrequently: true });
  }
  if (!sanitizeCtx) return value;
  try {
    sanitizeCtx.clearRect(0, 0, 1, 1);
    sanitizeCtx.fillStyle = value;
    sanitizeCtx.fillRect(0, 0, 1, 1);
    const [r, g, b, a] = sanitizeCtx.getImageData(0, 0, 1, 1).data;
    return `rgba(${r}, ${g}, ${b}, ${(a / 255).toFixed(3)})`;
  } catch {
    return value;
  }
}

const COLOR_PROPS = [
  "color",
  "backgroundColor",
  "borderTopColor",
  "borderRightColor",
  "borderBottomColor",
  "borderLeftColor",
] as const;

/** Copies computed colors from `source` onto `clone` (identical structure), normalized to rgb(). */
function sanitizeColorsDeep(source: Element, clone: Element): void {
  if (!(source instanceof HTMLElement) || !(clone instanceof HTMLElement)) return;
  const computed = getComputedStyle(source);
  for (const prop of COLOR_PROPS) {
    const value = computed[prop];
    if (value) clone.style[prop] = toSafeColor(value);
  }
  for (let i = 0; i < source.children.length; i++) {
    sanitizeColorsDeep(source.children[i], clone.children[i]);
  }
}

/**
 * Styles a block inherits from its on-page ancestors rather than from its own
 * classes. A clone lifted into a bare container loses them and re-wraps at a
 * different height, so they are copied onto each clone's root.
 */
const INHERITED_PROPS = [
  "direction",
  "fontFamily",
  "fontSize",
  "fontWeight",
  "lineHeight",
  "letterSpacing",
  "textAlign",
  "whiteSpace",
] as const;

/** Outer height including vertical margins, which the border box excludes. */
function outerHeight(el: HTMLElement): number {
  const style = getComputedStyle(el);
  return (
    el.getBoundingClientRect().height +
    parseFloat(style.marginTop || "0") +
    parseFloat(style.marginBottom || "0")
  );
}

/**
 * Renders `blocks` (already-laid-out DOM elements, one per question/section —
 * never split mid-element) offscreen and assembles them into an A4 jsPDF
 * document, one browser-rasterized page at a time. Cuts pages only at block
 * boundaries. Yields to the event loop between pages so the UI stays responsive.
 */
export async function exportBlocksToPdf(
  blocks: HTMLElement[],
  filename: string,
  onProgress?: (p: PdfExportProgress) => void,
): Promise<void> {
  if (blocks.length === 0) return;

  const referenceWidthPx = blocks[0].getBoundingClientRect().width;
  const pxPerMm = referenceWidthPx / CONTENT_WIDTH_MM;
  const contentHeightPx = CONTENT_HEIGHT_MM * pxPerMm;

  const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

  // Physical `left`, not `inset-inline-start`: the container is dir="rtl", so
  // the logical property would resolve to `right` and park it off the far side
  // of the document.
  const offscreen = document.createElement("div");
  offscreen.style.position = "absolute";
  offscreen.style.top = "0";
  offscreen.style.left = "-10000px";
  offscreen.style.width = `${referenceWidthPx}px`;
  offscreen.style.background = "#ffffff";
  offscreen.style.paddingBottom = `${INK_BLEED_PX}px`;
  offscreen.setAttribute("dir", "rtl");
  document.body.appendChild(offscreen);

  try {
    const clones = blocks.map((el) => {
      const clone = el.cloneNode(true) as HTMLElement;
      sanitizeColorsDeep(el, clone);
      const computed = getComputedStyle(el);
      for (const prop of INHERITED_PROPS) {
        const value = computed[prop];
        if (value) clone.style[prop] = value;
      }
      return clone;
    });

    // Paginate on the clones as they actually lay out in the container that
    // will be rasterized — measuring the originals instead lets a page render
    // taller than it measured and lose its last lines off the bottom.
    offscreen.replaceChildren(...clones);
    const heights = clones.map(outerHeight);

    const pages: HTMLElement[][] = [];
    let current: HTMLElement[] = [];
    let currentHeight = 0;
    clones.forEach((clone, i) => {
      if (current.length > 0 && currentHeight + heights[i] > contentHeightPx) {
        pages.push(current);
        current = [];
        currentHeight = 0;
      }
      current.push(clone);
      currentHeight += heights[i];
    });
    if (current.length > 0) pages.push(current);

    for (let i = 0; i < pages.length; i++) {
      offscreen.replaceChildren(...pages[i]);

      const canvas = await html2canvas(offscreen, {
        scale: 2,
        backgroundColor: "#ffffff",
        useCORS: true,
      });

      // Fit the printable box without ever distorting: a page that still comes
      // out too tall is scaled down on both axes, not squashed on one.
      const naturalHeightMm = (canvas.height / canvas.width) * CONTENT_WIDTH_MM;
      const scale = Math.min(1, CONTENT_HEIGHT_MM / naturalHeightMm);
      const drawWidthMm = CONTENT_WIDTH_MM * scale;

      if (i > 0) pdf.addPage();
      pdf.addImage(
        canvas.toDataURL("image/jpeg", 0.92),
        "JPEG",
        MARGIN_X_MM + (CONTENT_WIDTH_MM - drawWidthMm) / 2,
        MARGIN_Y_MM,
        drawWidthMm,
        naturalHeightMm * scale,
      );
      pdf.setFontSize(9);
      pdf.text(String(i + 1), A4_WIDTH_MM / 2, A4_HEIGHT_MM - 8, { align: "center" });

      onProgress?.({ current: i + 1, total: pages.length });
      await new Promise((resolve) => setTimeout(resolve, 0));
    }
  } finally {
    document.body.removeChild(offscreen);
  }

  pdf.save(`${filename}.pdf`);
}
