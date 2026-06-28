import { isPremViewOnlyStoragePath } from "@/lib/notesStorage";

/** Paths in `prenotes` that may be streamed for ICPA view-only (no direct public embed). */
export function isIcpaConfidentialViewPath(storagePath: string): boolean {
  const path = storagePath.replace(/^\/+/, "").trim();
  if (!path || path.includes("..")) return false;
  if (isPremViewOnlyStoragePath(path)) return true;
  return !path.includes("/");
}
