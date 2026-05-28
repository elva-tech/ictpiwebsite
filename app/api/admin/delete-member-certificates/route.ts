import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const CERT_BUCKET = "certificates";

function getSupabaseAdmin() {
  if (!url || !(serviceKey || anonKey)) {
    throw new Error("Missing Supabase environment variables");
  }
  return createClient(url, serviceKey || anonKey!, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

async function collectMemberCertificatePaths(
  supabase: ReturnType<typeof getSupabaseAdmin>,
  bucket: string,
  membershipId: string
) {
  const normalizedIds = [membershipId, membershipId.padStart(5, "0")];
  const paths = new Set<string>();
  const year = String(new Date().getFullYear());

  // Deterministic path candidates based on current project storage conventions.
  // This avoids depending only on recursive listing behavior.
  const directFolders = ["ncvet", "skill-india", "practicing", "ictpi"];
  for (const id of normalizedIds) {
    for (const folder of directFolders) {
      paths.add(`${folder}/${id}.pdf`);
      paths.add(`${folder}/${year}/${id}.pdf`);
    }
    // Legacy ICTPI internal subfolders seen in prior versions.
    paths.add(`ictpi/practicing_member_certificate/${year}/${id}.pdf`);
    paths.add(`ictpi/membership_certificate/${id}.pdf`);
  }

  const isMatch = (fullPath: string) => {
    const lowerPath = fullPath.toLowerCase();
    if (!lowerPath.endsWith(".pdf")) return false;
    const base = lowerPath.split("/").pop() ?? "";
    // Strict match only: "<membership_id>.pdf" (including zero-padded variant).
    return normalizedIds.some((id) => base === `${id}.pdf`);
  };

  // Recursively scan the bucket so all certificate types for this member get removed.
  const queue: string[] = [""];
  const seen = new Set<string>();

  while (queue.length > 0) {
    const prefix = queue.shift() ?? "";
    if (seen.has(prefix)) continue;
    seen.add(prefix);

    const { data: entries, error } = await supabase.storage
      .from(bucket)
      .list(prefix, { limit: 1000 });
    if (error || !entries) continue;

    for (const entry of entries) {
      if (!entry?.name) continue;
      const path = prefix ? `${prefix}/${entry.name}` : entry.name;
      const isFolderLike = !entry.metadata;
      if (isFolderLike) {
        queue.push(path);
        continue;
      }
      if (isMatch(path)) {
        paths.add(path);
      }
    }
  }

  return Array.from(paths);
}

export async function POST(req: Request) {
  try {
    const body = (await req.json().catch(() => null)) as
      | { membershipId?: string | number }
      | null;
    const membershipId = String(body?.membershipId ?? "")
      .trim()
      .replace(/\D/g, "");
    if (!membershipId) {
      return NextResponse.json(
        { error: "membershipId is required" },
        { status: 400 }
      );
    }

    const supabase = getSupabaseAdmin();
    const deletedByFolder: Record<string, number> = {};
    const allDeletedPaths: string[] = [];
    const paths = await collectMemberCertificatePaths(
      supabase,
      CERT_BUCKET,
      membershipId
    );
    if (paths.length > 0) {
      const { error } = await supabase.storage.from(CERT_BUCKET).remove(paths);
      if (error) throw new Error(`[${CERT_BUCKET}] ${error.message}`);
      for (const p of paths) {
        const folder = p.split("/")[0] || "root";
        deletedByFolder[folder] = (deletedByFolder[folder] ?? 0) + 1;
        allDeletedPaths.push(`${CERT_BUCKET}/${p}`);
      }
    }

    const deleted = allDeletedPaths.length;
    return NextResponse.json({
      ok: true,
      deleted,
      deletedByFolder,
      paths: allDeletedPaths,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Server error";
    console.error("delete-member-certificates error:", err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

