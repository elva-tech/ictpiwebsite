"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { AdminShell } from "@/components/AdminShell";
import {
  RESOURCE_AREAS,
  buildStoragePrefix,
  publicUrlForStorageKey,
} from "@/lib/courseResourceFolders";
import {
  ChevronRight,
  ExternalLink,
  FolderOpen,
  Loader2,
  Trash2,
  Upload,
} from "lucide-react";

const NAVY = "#1e2659";

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

function formatBytes(n?: number): string {
  if (n == null || !Number.isFinite(n)) return "—";
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / (1024 * 1024)).toFixed(1)} MB`;
}

export default function AdminResourcesPage() {
  const [areaId, setAreaId] = useState(RESOURCE_AREAS[0].id);
  const [subfolder, setSubfolder] = useState("");
  const [browsePrefix, setBrowsePrefix] = useState("");
  const [items, setItems] = useState<ListedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [deletingPath, setDeletingPath] = useState<string | null>(null);
  const [toast, setToast] = useState<{ type: "ok" | "err"; text: string } | null>(
    null
  );
  const [file, setFile] = useState<File | null>(null);

  const area = useMemo(
    () => RESOURCE_AREAS.find((a) => a.id === areaId) ?? RESOURCE_AREAS[0],
    [areaId]
  );

  const uploadPrefix = useMemo(() => {
    if (browsePrefix) return browsePrefix;
    return buildStoragePrefix(areaId, subfolder || undefined);
  }, [areaId, subfolder, browsePrefix]);

  const loadItems = useCallback(async (prefix: string) => {
    setLoading(true);
    setToast(null);
    try {
      const qs = prefix
        ? `?prefix=${encodeURIComponent(prefix)}`
        : "";
      const res = await fetch(`/api/admin/resources${qs}`);
      const json = (await res.json().catch(() => ({}))) as {
        items?: ListedItem[];
        error?: string;
      };
      if (!res.ok) {
        throw new Error(json.error ?? `List failed (${res.status})`);
      }
      setItems(json.items ?? []);
    } catch (e) {
      console.error(e);
      setItems([]);
      setToast({
        type: "err",
        text: e instanceof Error ? e.message : "Could not list files.",
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const prefix = buildStoragePrefix(areaId, subfolder || undefined);
    setBrowsePrefix("");
    loadItems(prefix);
  }, [areaId, subfolder, loadItems]);

  const openFolder = (path: string) => {
    setBrowsePrefix(path);
    loadItems(path);
  };

  const goUp = () => {
    if (!browsePrefix) return;
    const parts = browsePrefix.split("/").filter(Boolean);
    parts.pop();
    const parent = parts.join("/");
    setBrowsePrefix(parent);
    loadItems(parent);
  };

  const onUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setToast({ type: "err", text: "Choose a PDF or HTML file to upload." });
      return;
    }

    setUploading(true);
    setToast(null);
    try {
      const form = new FormData();
      form.set("folder", uploadPrefix);
      form.set("file", file);
      form.set("fileName", file.name);

      const res = await fetch("/api/admin/resources", {
        method: "POST",
        body: form,
      });
      const json = (await res.json().catch(() => ({}))) as {
        ok?: boolean;
        error?: string;
        publicUrl?: string;
      };
      if (!res.ok) {
        throw new Error(json.error ?? "Upload failed");
      }

      setFile(null);
      const input = document.getElementById(
        "resource-file-input"
      ) as HTMLInputElement | null;
      if (input) input.value = "";

      setToast({
        type: "ok",
        text: `Uploaded to ${uploadPrefix || "(root)"}/${file.name}`,
      });
      await loadItems(browsePrefix || buildStoragePrefix(areaId, subfolder || undefined));
    } catch (err) {
      setToast({
        type: "err",
        text: err instanceof Error ? err.message : "Upload failed",
      });
    } finally {
      setUploading(false);
    }
  };

  const deleteFile = async (path: string, name: string) => {
    if (
      !window.confirm(
        `Delete "${name}" from storage? This cannot be undone.`
      )
    ) {
      return;
    }

    setDeletingPath(path);
    setToast(null);
    try {
      const res = await fetch("/api/admin/resources", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ path }),
      });
      const json = (await res.json().catch(() => ({}))) as {
        ok?: boolean;
        error?: string;
      };
      if (!res.ok) {
        throw new Error(json.error ?? "Delete failed");
      }
      setToast({ type: "ok", text: `Deleted ${name}` });
      await loadItems(
        browsePrefix || buildStoragePrefix(areaId, subfolder || undefined)
      );
    } catch (err) {
      setToast({
        type: "err",
        text: err instanceof Error ? err.message : "Delete failed",
      });
    } finally {
      setDeletingPath(null);
    }
  };

  const currentPrefix =
    browsePrefix || buildStoragePrefix(areaId, subfolder || undefined);

  return (
    <AdminShell title="Course Resources">
      <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
        <aside className="bg-white rounded-xl shadow-sm border border-slate-100 p-4 h-fit">
          <h2 className="text-sm font-semibold text-[#1e2659] mb-3 flex items-center gap-2">
            <FolderOpen className="h-4 w-4" />
            Course folders
          </h2>
          <ul className="space-y-1">
            {RESOURCE_AREAS.map((a) => (
              <li key={a.id}>
                <button
                  type="button"
                  onClick={() => {
                    setAreaId(a.id);
                    setSubfolder("");
                    setBrowsePrefix("");
                  }}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                    areaId === a.id && !browsePrefix
                      ? "bg-[#1e2659] text-white"
                      : "text-slate-700 hover:bg-slate-100"
                  }`}
                >
                  {a.label}
                </button>
                {areaId === a.id && a.subfolders.length > 0 && (
                  <ul className="mt-1 ml-2 border-l border-slate-200 pl-2 space-y-0.5">
                    {a.subfolders.map((sf) => (
                      <li key={sf}>
                        <button
                          type="button"
                          onClick={() => {
                            setSubfolder(sf);
                            setBrowsePrefix("");
                          }}
                          className={`w-full text-left px-2 py-1.5 rounded text-xs transition-colors ${
                            subfolder === sf && !browsePrefix
                              ? "bg-blue-100 text-blue-900 font-medium"
                              : "text-slate-600 hover:bg-slate-50"
                          }`}
                        >
                          {sf}
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ul>
        </aside>

        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-5 md:p-7">
            <h2 className="text-2xl font-bold text-[#1e2659] mb-1">
              Resources
            </h2>
            <p className="text-sm text-slate-500 mb-4">
              Upload PDFs and HTML files to the{" "}
              <span className="font-mono">notes</span> bucket. Course uploads
              appear on member course pages; faculty blog uploads under{" "}
              <span className="font-mono">blogs/</span> appear on the Vlogs &
              Materials page (titled by filename).
            </p>

            {toast && (
              <div
                className={`mb-4 rounded-lg px-4 py-2 text-sm ${
                  toast.type === "ok"
                    ? "bg-emerald-50 border border-emerald-200 text-emerald-800"
                    : "bg-red-50 border border-red-200 text-red-800"
                }`}
              >
                {toast.text}
              </div>
            )}

            <div className="flex flex-wrap items-center gap-2 text-sm text-slate-600 mb-4">
              <span className="font-medium">Current path:</span>
              <code className="bg-slate-100 px-2 py-1 rounded text-xs">
                notes/{currentPrefix || "(root)"}
              </code>
              {browsePrefix && (
                <button
                  type="button"
                  onClick={goUp}
                  className="text-blue-600 hover:underline text-xs"
                >
                  ↑ Up one level
                </button>
              )}
            </div>

            <form
              onSubmit={onUpload}
              className="flex flex-col sm:flex-row gap-3 items-start sm:items-end border border-dashed border-slate-200 rounded-lg p-4 mb-6 bg-slate-50/50"
            >
              <div className="flex-1 w-full">
                <label
                  htmlFor="resource-file-input"
                  className="block text-xs font-semibold text-slate-600 mb-1"
                >
                  Upload file (PDF or HTML)
                </label>
                <input
                  id="resource-file-input"
                  type="file"
                  accept=".pdf,.html,application/pdf,text/html"
                  onChange={(ev) => setFile(ev.target.files?.[0] ?? null)}
                  className="block w-full text-sm text-slate-600 file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-[#1e2659] file:text-white hover:file:bg-[#2a3470]"
                />
              </div>
              <button
                type="submit"
                disabled={uploading || !file}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-white text-sm font-semibold disabled:opacity-50"
                style={{ background: NAVY }}
              >
                {uploading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Upload className="h-4 w-4" />
                )}
                Upload
              </button>
            </form>

            {loading ? (
              <div className="flex items-center justify-center py-12 text-slate-500">
                <Loader2 className="h-6 w-6 animate-spin mr-2" />
                Loading…
              </div>
            ) : items.length === 0 ? (
              <p className="text-center text-slate-500 py-8 text-sm">
                No files or subfolders in this location.
              </p>
            ) : (
              <ul className="divide-y divide-slate-100 border border-slate-100 rounded-lg overflow-hidden">
                {items.map((item) =>
                  item.type === "folder" ? (
                    <li key={item.path}>
                      <button
                        type="button"
                        onClick={() => openFolder(item.path)}
                        className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-slate-50 transition-colors"
                      >
                        <FolderOpen className="h-5 w-5 text-amber-600 shrink-0" />
                        <span className="font-medium text-slate-800">
                          {item.name}
                        </span>
                        <ChevronRight className="h-4 w-4 text-slate-400 ml-auto" />
                      </button>
                    </li>
                  ) : (
                    <li
                      key={item.path}
                      className="flex items-center gap-3 px-4 py-3 hover:bg-slate-50"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-slate-800 truncate">
                          {item.name}
                        </p>
                        <p className="text-xs text-slate-500">
                          {formatBytes(item.size)}
                          {item.updatedAt
                            ? ` · ${new Date(item.updatedAt).toLocaleString()}`
                            : ""}
                        </p>
                      </div>
                      <a
                        href={item.publicUrl || publicUrlForStorageKey(item.path)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                        title="Open"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </a>
                      <button
                        type="button"
                        onClick={() => deleteFile(item.path, item.name)}
                        disabled={deletingPath === item.path}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg disabled:opacity-50"
                        title="Delete"
                      >
                        {deletingPath === item.path ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </button>
                    </li>
                  )
                )}
              </ul>
            )}
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-900">
            <p className="font-semibold mb-1">Filename tips</p>
            <ul className="list-disc ml-4 space-y-1 text-amber-800">
              <li>
                Files are shown to members using the <strong>file name</strong>{" "}
                (without .pdf) as the title.
              </li>
              <li>
                Applied Finance chapters use folders{" "}
                <code>chapter 1</code> … <code>chapter 12</code> (with a space).
              </li>
              <li>
                Faculty blogs / vlogs use{" "}
                <code>blogs/CTPr Sreedhara Parthasarathy</code>,{" "}
                <code>blogs/BR.N. Subramanian</code>, and{" "}
                <code>blogs/CTPr Dr Kalyanasundaram Baskaran</code>.
              </li>
              <li>
                Set <code>SUPABASE_SERVICE_ROLE_KEY</code> in{" "}
                <code>.env.local</code> for uploads to work.
              </li>
            </ul>
          </div>
        </div>
      </div>
    </AdminShell>
  );
}
