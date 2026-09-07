/**
 * Resolves a file shipped in `public/` against the deployment's base path.
 *
 * Vite rewrites the asset URLs it can see (bundled imports, `index.html`), but
 * not plain runtime strings like the emblem paths in `trackConfig`. A literal
 * "/emblem.png" therefore points at the domain root, which 404s wherever the
 * app is served from a subpath — e.g. GitHub Pages at /exam_platform_qcm/.
 *
 * `BASE_URL` is "/" in dev and "./" in the build (see `base` in vite.config).
 * The relative form is safe here because the app uses hash routing, so the
 * document's path never changes and "./" always resolves to the app root.
 */
export function assetUrl(file: string): string {
  return `${import.meta.env.BASE_URL}${file}`;
}
