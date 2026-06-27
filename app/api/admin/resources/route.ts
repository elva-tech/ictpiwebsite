import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { NOTES_BUCKET } from "@/lib/notesStorage";
import {
  isAdminStorageBucket,
  publicUrlForStorageKey,
} from "@/lib/courseResourceFolders";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

function getSupabaseAdmin() {
  if (!url || !(serviceKey || anonKey)) {
    throw new Error("Missing Supabase environment variables");
  }
  if (!serviceKey) {
    console.warn(
      "admin/resources: SUPABASE_SERVICE_ROLE_KEY is not set. Uploads may fail under RLS."
    );
  }
  return createClient(url, serviceKey || anonKey!, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

function resolveBucket(raw: string | null | undefined): string {
  const bucket = (raw ?? NOTES_BUCKET).trim();
  if (!isAdminStorageBucket(bucket)) {
    throw new Error(
      `Invalid bucket. Use one of: notes, prenotes, icpa_certificates.`
    );
  }
  return bucket;
}

function sanitizePrefix(raw: string): string {
  return raw
    .replace(/^\/+/, "")
    .replace(/\.\./g, "")
    .trim();
}

function sanitizeFileName(raw: string): string {
  const name = raw.replace(/[/\\]/g, "").trim();
  if (!name) throw new Error("Invalid file name");
  return name;
}

type ListedItem =
  | { type: "folder"; name: string; path: string }
  | {
      type: "file";
      name: string;
      path: string;
      publicUrl: string;
      size?: number;
      updatedAt?: string;
    };

/** GET ?prefix=...&bucket=notes|prenotes|icpa_certificates */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const prefix = sanitizePrefix(searchParams.get("prefix") ?? "");
    const bucket = resolveBucket(searchParams.get("bucket"));

    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase.storage
      .from(bucket)
      .list(prefix, {
        limit: 1000,
        sortBy: { column: "name", order: "asc" },
      });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    const items: ListedItem[] = (data ?? []).map((entry) => {
      const name = entry.name;
      const path = prefix ? `${prefix}/${name}` : name;
      const isFolder = entry.id == null;

      if (isFolder) {
        return { type: "folder" as const, name, path };
      }

      return {
        type: "file" as const,
        name,
        path,
        publicUrl: publicUrlForStorageKey(path, bucket),
        size: entry.metadata?.size as number | undefined,
        updatedAt: entry.updated_at ?? undefined,
      };
    });

    return NextResponse.json({ bucket, prefix, items });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Server error";
    console.error("admin/resources GET:", err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

/** POST multipart: bucket + folder prefix + file */
export async function POST(req: Request) {
  try {
    const form = await req.formData();
    const bucket = resolveBucket(String(form.get("bucket") ?? NOTES_BUCKET));
    const folder = sanitizePrefix(String(form.get("folder") ?? ""));
    const file = form.get("file");

    if (!(file instanceof File) || file.size === 0) {
      return NextResponse.json({ error: "A file is required." }, { status: 400 });
    }

    const fileName = sanitizeFileName(
      String(form.get("fileName") ?? file.name)
    );
    const storageKey = folder ? `${folder}/${fileName}` : fileName;

    const contentType =
      file.type ||
      (fileName.toLowerCase().endsWith(".pdf")
        ? "application/pdf"
        : fileName.toLowerCase().endsWith(".html")
          ? "text/html"
          : "application/octet-stream");

    const supabase = getSupabaseAdmin();
    const buffer = Buffer.from(await file.arrayBuffer());
    const { error } = await supabase.storage
      .from(bucket)
      .upload(storageKey, buffer, {
        contentType,
        upsert: true,
        cacheControl: "3600",
      });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({
      ok: true,
      bucket,
      path: storageKey,
      publicUrl: publicUrlForStorageKey(storageKey, bucket),
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Server error";
    console.error("admin/resources POST:", err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

/** DELETE { "path": "...", "bucket": "prenotes" } */
export async function DELETE(req: Request) {
  try {
    const body = (await req.json().catch(() => null)) as {
      path?: string;
      bucket?: string;
    } | null;
    const path = sanitizePrefix(body?.path ?? "");
    if (!path) {
      return NextResponse.json({ error: "path is required" }, { status: 400 });
    }
    const bucket = resolveBucket(body?.bucket);

    const supabase = getSupabaseAdmin();
    const { error } = await supabase.storage.from(bucket).remove([path]);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ ok: true, bucket, path });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Server error";
    console.error("admin/resources DELETE:", err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
