import type { SupabaseClient } from "@supabase/supabase-js";
import { enquiryMembershipIdVariants } from "@/lib/enquiry";
import {
  certificateFileNameToTitle,
  getCertificatePublicUrl,
  listFolderRecursive,
  storageObjectExists,
} from "@/lib/certificateStorageShared";

export const ICPA_CERTIFICATES_BUCKET = "icpa_certificates";

export interface IcpaCertificateFile {
  title: string;
  storagePath: string;
  download: string;
  url: string;
}

export function getIcpaCertificatePublicUrl(storagePath: string): string {
  return getCertificatePublicUrl(ICPA_CERTIFICATES_BUCKET, storagePath);
}

function pathMatchesMembership(storagePath: string, variants: string[]): boolean {
  const lower = storagePath.toLowerCase();
  const base = lower.split("/").pop() ?? lower;
  return variants.some((v) => {
    const id = String(v).toLowerCase();
    if (!id) return false;
    if (lower === `${id}.pdf`) return true;
    if (base === `${id}.pdf`) return true;
    if (lower.includes(`/${id}/`) || lower.startsWith(`${id}/`)) return true;
    if (base.includes(id)) return true;
    return false;
  });
}

/** PDFs in `icpa_certificates` whose path/filename matches the member's ID. */
export async function listMemberIcpaCertificates(
  supabase: SupabaseClient,
  membershipIdRaw: string | number
): Promise<IcpaCertificateFile[]> {
  const variants = enquiryMembershipIdVariants(membershipIdRaw);
  if (!variants.length) return [];

  const year = String(new Date().getFullYear());
  const directPaths = new Set<string>();
  for (const v of variants) {
    directPaths.add(`${v}.pdf`);
    directPaths.add(`${year}/${v}.pdf`);
    directPaths.add(`${v}/${v}.pdf`);
    directPaths.add(`${v}/certificate.pdf`);
  }

  const found = new Map<string, IcpaCertificateFile>();

  for (const path of directPaths) {
    if (!(await storageObjectExists(supabase, ICPA_CERTIFICATES_BUCKET, path))) {
      continue;
    }
    found.set(path, {
      title: certificateFileNameToTitle(path.split("/").pop() ?? path),
      storagePath: path,
      download: path.split("/").pop() ?? path,
      url: getIcpaCertificatePublicUrl(path),
    });
  }

  const recursive = await listFolderRecursive(supabase, "", ICPA_CERTIFICATES_BUCKET);
  for (const file of recursive) {
    if (!pathMatchesMembership(file.path, variants)) continue;
    if (!found.has(file.path)) {
      found.set(file.path, {
        title: certificateFileNameToTitle(file.name),
        storagePath: file.path,
        download: file.name,
        url: getIcpaCertificatePublicUrl(file.path),
      });
    }
  }

  return [...found.values()].sort((a, b) =>
    a.title.localeCompare(b.title, undefined, { numeric: true })
  );
}
