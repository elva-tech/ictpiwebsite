import { supabase } from "@/lib/Supabase";

/** Supabase storage bucket for standard course PDFs, model papers, and HTML tests. */
export const NOTES_BUCKET = "notes";

/** Premium member course materials — same folder layout as `notes`. */
export const PRENOTES_BUCKET = "prenotes";

/** View-only premium paths in `prenotes` (no download in the portal). */
export const PREM_NOTES_PREFIX = "prem";

/** Course/subsystem folders at the root of `prenotes` — not view-only root files. */
export const PRENOTES_MANAGED_ROOT_FOLDERS = new Set([
  "appliedfinance",
  "bussiness",
  "directtax",
  "indirecttax",
  PREM_NOTES_PREFIX,
  "blogs",
  "tests",
]);

export function isPremViewOnlyStoragePath(storagePath: string): boolean {
  const normalized = storagePath.replace(/^\/+/, "");
  return (
    normalized === PREM_NOTES_PREFIX ||
    normalized.startsWith(`${PREM_NOTES_PREFIX}/`)
  );
}

/** @deprecated Use PRENOTES_BUCKET — bucket id is `prenotes`. */
export const PREMNOTES_BUCKET = PRENOTES_BUCKET;

export function getNotesBucketName(isPremium = false): string {
  return isPremium ? PRENOTES_BUCKET : NOTES_BUCKET;
}

/** True for legacy app paths that pointed at `public/pdf/` or `public/tests/`. */
export function isNotesBucketPath(publicPath: string): boolean {
  const p = publicPath.startsWith("/") ? publicPath : `/${publicPath}`;
  return (
    p.startsWith("/pdf/") ||
    p.startsWith("/tests/") ||
    p.startsWith("/premium/pdf/") ||
    p.startsWith("/premium/tests/")
  );
}

/**
 * Align legacy app folder names with the `notes` bucket layout.
 * e.g. appliedfinance/chapter1/ → appliedfinance/chapter 1/
 */
function normalizeNotesBucketKey(key: string): string {
  return key.replace(
    /(^|\/)chapter(\d+)(\/|$)/gi,
    (_, prefix, num, suffix) => `${prefix}chapter ${num}${suffix}`
  );
}

/**
 * Map app path → object key in the `notes` bucket.
 *
 * Bucket layout (matches Supabase upload — no `pdf/` wrapper):
 *   appliedfinance/chapter 1/Accounting Assumptions and Concepts.pdf
 *   bussiness/advising/Choice of Business Organisation.pdf
 *   directtax/domestic/Basic Concepts of IT.pdf
 *   Business Regulatory Laws and compliances.pdf  (root-level faculty PDFs)
 *   tests/01.1_INDIRECT_TAXES_GST.html
 */
export function notesStorageKeyFromPublicPath(publicPath: string): string {
  let key = publicPath.startsWith("/") ? publicPath.slice(1) : publicPath;

  if (key.startsWith("premium/")) {
    key = key.slice("premium/".length);
  }

  if (key.startsWith("pdf/")) {
    key = key.slice("pdf/".length);
  }

  return normalizeNotesBucketKey(key);
}

/** Public URL for a file in the `notes` or `prenotes` bucket. */
export function getNotesStorageUrl(
  publicPath: string,
  options?: { isPremium?: boolean }
): string {
  const bucket = getNotesBucketName(options?.isPremium ?? false);
  const key = notesStorageKeyFromPublicPath(publicPath);
  const baseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

  if (baseUrl) {
    const encodedKey = key
      .split("/")
      .map((segment) => encodeURIComponent(segment))
      .join("/");
    return `${baseUrl}/storage/v1/object/public/${bucket}/${encodedKey}`;
  }

  const { data } = supabase.storage.from(bucket).getPublicUrl(key);
  return data.publicUrl;
}
