import type { SupabaseClient } from "@supabase/supabase-js";
import {
  getCertificatePublicUrl,
  listFolderRecursive,
  membershipIdVariantsForCerts,
  pathMatchesMemberCertificatePdf,
  storageObjectExists,
  toStoredCertificateFile,
  type StoredCertificateFile,
} from "@/lib/certificateStorageShared";

export const COMMON_CERTIFICATES_BUCKET = "certificates";

export type CommonCertificateFile = StoredCertificateFile;

const KNOWN_FOLDERS = ["ncvet", "skill-india", "practicing", "ictpi"] as const;

function knownPathCandidates(variants: string[]): string[] {
  const year = String(new Date().getFullYear());
  const paths = new Set<string>();
  for (const v of variants) {
    paths.add(`${v}.pdf`);
    paths.add(`${year}/${v}.pdf`);
    for (const folder of KNOWN_FOLDERS) {
      paths.add(`${folder}/${v}.pdf`);
      paths.add(`${folder}/${year}/${v}.pdf`);
    }
    paths.add(`ictpi/practicing_member_certificate/${year}/${v}.pdf`);
    paths.add(`ictpi/membership_certificate/${v}.pdf`);
    paths.add(`practicing/${year}/${v}.pdf`);
  }
  return [...paths];
}

/** PDFs in `certificates` bucket matching the member's membership ID. */
export async function listMemberCommonCertificates(
  supabase: SupabaseClient,
  membershipIdRaw: string | number
): Promise<CommonCertificateFile[]> {
  const variants = membershipIdVariantsForCerts(membershipIdRaw);
  if (!variants.length) return [];

  const found = new Map<string, CommonCertificateFile>();

  for (const path of knownPathCandidates(variants)) {
    if (!(await storageObjectExists(supabase, COMMON_CERTIFICATES_BUCKET, path))) {
      continue;
    }
    const name = path.split("/").pop() ?? path;
    found.set(path, {
      title: name.replace(/\.pdf$/i, ""),
      storagePath: path,
      download: name,
      url: getCertificatePublicUrl(COMMON_CERTIFICATES_BUCKET, path),
      folder: path.includes("/") ? path.split("/")[0] : "root",
    });
  }

  const recursive = await listFolderRecursive(
    supabase,
    "",
    COMMON_CERTIFICATES_BUCKET
  );
  for (const file of recursive) {
    if (!pathMatchesMemberCertificatePdf(file.path, variants)) continue;
    if (!found.has(file.path)) {
      found.set(file.path, toStoredCertificateFile(COMMON_CERTIFICATES_BUCKET, file));
    }
  }

  return [...found.values()].sort((a, b) =>
    a.storagePath.localeCompare(b.storagePath, undefined, { numeric: true })
  );
}

/** Batch lookup for admin table — one bucket scan, grouped by membership ID. */
export async function listCommonCertificatesForMembers(
  supabase: SupabaseClient,
  membershipIds: string[]
): Promise<Record<string, CommonCertificateFile[]>> {
  const ids = [...new Set(membershipIds.map((id) => id.trim()).filter(Boolean))];
  const result: Record<string, CommonCertificateFile[]> = Object.fromEntries(
    ids.map((id) => [id, []])
  );
  if (!ids.length) return result;

  const variantById = new Map(
    ids.map((id) => [id, membershipIdVariantsForCerts(id)] as const)
  );

  const allFiles = await listFolderRecursive(
    supabase,
    "",
    COMMON_CERTIFICATES_BUCKET
  );

  for (const file of allFiles) {
    for (const id of ids) {
      const variants = variantById.get(id) ?? [];
      if (!pathMatchesMemberCertificatePdf(file.path, variants)) continue;
      const entry = toStoredCertificateFile(COMMON_CERTIFICATES_BUCKET, file);
      const bucket = result[id];
      if (!bucket.some((c) => c.storagePath === entry.storagePath)) {
        bucket.push(entry);
      }
    }
  }

  for (const id of ids) {
    result[id].sort((a, b) =>
      a.storagePath.localeCompare(b.storagePath, undefined, { numeric: true })
    );
  }

  return result;
}
