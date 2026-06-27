import type { SupabaseClient } from "@supabase/supabase-js";
import { enquiryMembershipIdVariants } from "@/lib/enquiry";

export interface StoredCertificateFile {
  title: string;
  storagePath: string;
  download: string;
  url: string;
  folder: string;
}

export function certificateFileNameToTitle(fileName: string): string {
  if (fileName.toLowerCase().endsWith(".pdf")) {
    return fileName.slice(0, -4);
  }
  return fileName;
}

export function getCertificatePublicUrl(bucket: string, storagePath: string): string {
  const baseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const encoded = storagePath
    .split("/")
    .map((segment) => encodeURIComponent(segment))
    .join("/");
  if (baseUrl) {
    return `${baseUrl}/storage/v1/object/public/${bucket}/${encoded}`;
  }
  return `/${bucket}/${encoded}`;
}

export function membershipIdVariantsForCerts(raw: string | number): string[] {
  const out = new Set<string>();
  for (const v of enquiryMembershipIdVariants(raw)) {
    out.add(String(v));
    out.add(String(v).padStart(5, "0"));
  }
  return [...out];
}

export function pathMatchesMemberCertificatePdf(
  storagePath: string,
  variants: string[]
): boolean {
  if (!storagePath.toLowerCase().endsWith(".pdf")) return false;
  const base = (storagePath.split("/").pop() ?? "").toLowerCase();
  return variants.some((v) => {
    const id = String(v).toLowerCase();
    return base === `${id}.pdf`;
  });
}

export async function storageObjectExists(
  supabase: SupabaseClient,
  bucket: string,
  path: string
): Promise<boolean> {
  const idx = path.lastIndexOf("/");
  const folder = idx >= 0 ? path.slice(0, idx) : "";
  const name = idx >= 0 ? path.slice(idx + 1) : path;
  const { data, error } = await supabase.storage.from(bucket).list(folder, {
    limit: 1000,
  });
  if (error) return false;
  return (data ?? []).some((e) => e.name === name && e.id != null);
}

export async function listFolderRecursive(
  supabase: SupabaseClient,
  prefix: string,
  bucket: string
): Promise<{ name: string; path: string }[]> {
  const queue = [prefix];
  const seen = new Set<string>();
  const files: { name: string; path: string }[] = [];

  while (queue.length > 0) {
    const current = queue.shift()!;
    if (seen.has(current)) continue;
    seen.add(current);

    const { data, error } = await supabase.storage.from(bucket).list(current, {
      limit: 1000,
      sortBy: { column: "name", order: "asc" },
    });
    if (error) continue;

    for (const entry of data ?? []) {
      const path = current ? `${current}/${entry.name}` : entry.name;
      if (entry.id == null) {
        queue.push(path);
      } else if (entry.name.toLowerCase().endsWith(".pdf")) {
        files.push({ name: entry.name, path });
      }
    }
  }

  return files;
}

export function toStoredCertificateFile(
  bucket: string,
  file: { name: string; path: string }
): StoredCertificateFile {
  return {
    title: certificateFileNameToTitle(file.name),
    storagePath: file.path,
    download: file.name,
    url: getCertificatePublicUrl(bucket, file.path),
    folder: file.path.includes("/") ? file.path.split("/")[0] : "root",
  };
}
