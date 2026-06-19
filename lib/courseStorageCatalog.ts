import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { NOTES_BUCKET } from "@/lib/notesStorage";

export interface StorageFileEntry {
  name: string;
  path: string;
}

export interface StorageFolderEntry {
  name: string;
  path: string;
}

function getSupabaseForStorage() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) {
    throw new Error("Missing Supabase configuration");
  }
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export async function listStorageFolder(
  supabase: SupabaseClient,
  prefix: string
): Promise<{ folders: StorageFolderEntry[]; files: StorageFileEntry[] }> {
  const { data, error } = await supabase.storage
    .from(NOTES_BUCKET)
    .list(prefix, {
      limit: 1000,
      sortBy: { column: "name", order: "asc" },
    });

  if (error) {
    throw new Error(error.message);
  }

  const folders: StorageFolderEntry[] = [];
  const files: StorageFileEntry[] = [];

  for (const entry of data ?? []) {
    const name = entry.name;
    const path = prefix ? `${prefix}/${name}` : name;
    if (entry.id == null) {
      folders.push({ name, path });
    } else {
      files.push({ name, path });
    }
  }

  return { folders, files };
}

export async function listAllFilesUnderPrefix(
  prefix: string
): Promise<StorageFileEntry[]> {
  const supabase = getSupabaseForStorage();
  const queue = [prefix];
  const seen = new Set<string>();
  const files: StorageFileEntry[] = [];

  while (queue.length > 0) {
    const current = queue.shift()!;
    if (seen.has(current)) continue;
    seen.add(current);

    const { folders, files: levelFiles } = await listStorageFolder(
      supabase,
      current
    );
    files.push(...levelFiles);
    for (const folder of folders) {
      queue.push(folder.path);
    }
  }

  return files.sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }));
}

export function fileNameToTitle(fileName: string): string {
  if (fileName.toLowerCase().endsWith(".pdf")) {
    return fileName.slice(0, -4);
  }
  if (fileName.toLowerCase().endsWith(".html")) {
    return fileName.slice(0, -5);
  }
  return fileName;
}

export function storagePathToAppPdfPath(storagePath: string): string {
  return `/pdf/${storagePath}`;
}

function isResourceFile(name: string): boolean {
  const lower = name.toLowerCase();
  return lower.endsWith(".pdf") || lower.endsWith(".html");
}

function chapterSortKey(folderName: string): number {
  const m = folderName.match(/(\d+)/);
  return m ? parseInt(m[1], 10) : 9999;
}

function sortFolders(names: string[]): string[] {
  return [...names].sort((a, b) => {
    const ca = chapterSortKey(a);
    const cb = chapterSortKey(b);
    if (ca !== cb) return ca - cb;
    return a.localeCompare(b, undefined, { numeric: true });
  });
}

const BUSINESS_LABELS: Record<string, string> = {
  advising: "Advising on Setting Up a Business",
  bussinessmaintaince: "Business Maintenance",
  procedure: "Procedure to Close a Business",
  appendix: "Appendix of Lessons",
};

export type CourseId =
  | "appliedfinance"
  | "business"
  | "directtax"
  | "indirecttax";

export interface CourseResourceFile {
  title: string;
  storagePath: string;
  download: string;
  appPath: string;
}

export type CourseResourceSections = Record<string, CourseResourceFile[]>;

export async function buildCourseResourceSections(
  courseId: CourseId
): Promise<CourseResourceSections> {
  const supabase = getSupabaseForStorage();
  const sections: CourseResourceSections = {};

  const addFiles = (label: string, files: StorageFileEntry[]) => {
    const resourceFiles = files.filter((f) => isResourceFile(f.name));
    if (resourceFiles.length === 0) return;
    sections[label] = resourceFiles.map((f) => ({
      title: fileNameToTitle(f.name),
      storagePath: f.path,
      download: f.name,
      appPath: storagePathToAppPdfPath(f.path),
    }));
  };

  switch (courseId) {
    case "appliedfinance": {
      const { folders } = await listStorageFolder(supabase, "appliedfinance");
      const sorted = sortFolders(folders.map((f) => f.name));
      for (const folderName of sorted) {
        const folder = folders.find((f) => f.name === folderName);
        if (!folder) continue;
        const { files } = await listStorageFolder(supabase, folder.path);
        const label =
          folderName.match(/^chapter\s*\d+/i) != null
            ? folderName.replace(/\bchapter\b/i, "Chapter").replace(/\s+/g, " ")
            : folderName;
        addFiles(label, files);
      }
      break;
    }
    case "business": {
      const { folders } = await listStorageFolder(supabase, "bussiness");
      const order = [
        "advising",
        "bussinessmaintaince",
        "procedure",
        "appendix",
        ...folders.map((f) => f.name).filter(
          (n) => !["advising", "bussinessmaintaince", "procedure", "appendix"].includes(n)
        ),
      ];
      const seen = new Set<string>();
      for (const folderName of order) {
        if (seen.has(folderName)) continue;
        seen.add(folderName);
        const folder = folders.find((f) => f.name === folderName);
        if (!folder) continue;
        const { files } = await listStorageFolder(supabase, folder.path);
        addFiles(BUSINESS_LABELS[folderName] ?? folderName, files);
      }
      break;
    }
    case "directtax": {
      const domestic = await listStorageFolder(supabase, "directtax/domestic");
      addFiles("Domestic Taxation", domestic.files);
      const international = await listStorageFolder(
        supabase,
        "directtax/international"
      );
      addFiles("International Taxation", international.files);
      break;
    }
    case "indirecttax": {
      const gst = await listStorageFolder(
        supabase,
        "indirecttax/goodsandservices(GST)"
      );
      addFiles("GST LAWS", gst.files);
      const customs = await listStorageFolder(
        supabase,
        "indirecttax/customsact"
      );
      addFiles("Customs Act", customs.files);
      break;
    }
    default:
      break;
  }

  return sections;
}

/** Faculty blog folders under `blogs/` in the notes bucket. */
export const BLOG_FACULTY_FOLDERS = [
  {
    folder: "CTPr Sreedhara Parthasarathy",
    label: "CTPr Sreedhara Parthasarathy",
  },
  {
    folder: "BR.N. Subramanian",
    label: "BR.N. Subramanian",
  },
  {
    folder: "CTPr Dr Kalyanasundaram Baskaran",
    label: "CTPr Dr Kalyanasundaram Baskaran",
  },
] as const;

export type BlogResourceSections = CourseResourceSections;

export async function buildBlogResourceSections(): Promise<BlogResourceSections> {
  const supabase = getSupabaseForStorage();
  const sections: BlogResourceSections = {};

  const { folders } = await listStorageFolder(supabase, "blogs");
  const folderByName = new Map(folders.map((f) => [f.name, f]));

  const orderedNames: string[] = [];
  for (const { folder } of BLOG_FACULTY_FOLDERS) {
    orderedNames.push(folder);
  }
  for (const f of folders) {
    if (!orderedNames.includes(f.name)) orderedNames.push(f.name);
  }

  for (const folderName of orderedNames) {
    const folder = folderByName.get(folderName);
    const folderPath = folder?.path ?? `blogs/${folderName}`;
    const { files } = await listStorageFolder(supabase, folderPath);
    const resourceFiles = files.filter((f) => isResourceFile(f.name));
    if (resourceFiles.length === 0) continue;

    const label =
      BLOG_FACULTY_FOLDERS.find((b) => b.folder === folderName)?.label ??
      folderName;
    sections[label] = resourceFiles.map((f) => ({
      title: fileNameToTitle(f.name),
      storagePath: f.path,
      download: f.name,
      appPath: storagePathToAppPdfPath(f.path),
    }));
  }

  return sections;
}
