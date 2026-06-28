import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import {
  NOTES_BUCKET,
  PRENOTES_BUCKET,
  getNotesBucketName,
  isPremViewOnlyStoragePath,
} from "@/lib/notesStorage";

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
  prefix: string,
  bucket: string = NOTES_BUCKET
): Promise<{ folders: StorageFolderEntry[]; files: StorageFileEntry[] }> {
  const { data, error } = await supabase.storage
    .from(bucket)
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
  prefix: string,
  bucket: string = NOTES_BUCKET
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
      current,
      bucket
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
  /** When true, members can open the file but not download it. */
  viewOnly?: boolean;
}

const PREM_COURSE_PREFIX: Record<CourseId, string> = {
  appliedfinance: "prem/appliedfinance",
  business: "prem/bussiness",
  directtax: "prem/directtax",
  indirecttax: "prem/indirecttax",
};

function mapResourceFile(
  f: StorageFileEntry,
  viewOnly = false
): CourseResourceFile {
  return {
    title: fileNameToTitle(f.name),
    storagePath: f.path,
    download: f.name,
    appPath: storagePathToAppPdfPath(f.path),
    viewOnly: viewOnly || isPremViewOnlyStoragePath(f.path),
  };
}

async function mergePremViewOnlySections(
  courseId: CourseId,
  sections: CourseResourceSections,
  supabase: SupabaseClient,
  bucket: string
) {
  const prefix = PREM_COURSE_PREFIX[courseId];
  let allFiles: StorageFileEntry[] = [];
  try {
    allFiles = await listAllFilesUnderPrefix(prefix, bucket);
  } catch {
    return;
  }
  if (!allFiles.length) return;

  const byGroup = new Map<string, StorageFileEntry[]>();
  for (const file of allFiles) {
    if (!isResourceFile(file.name)) continue;
    const relative = file.path.startsWith(`${prefix}/`)
      ? file.path.slice(prefix.length + 1)
      : file.path;
    const slash = relative.indexOf("/");
    const group =
      slash === -1 ? "ICPA Materials" : relative.slice(0, slash);
    const arr = byGroup.get(group) ?? [];
    arr.push(file);
    byGroup.set(group, arr);
  }

  for (const [label, files] of byGroup) {
    const mapped = files.map((f) => mapResourceFile(f, true));
    sections[label] = [...(sections[label] ?? []), ...mapped];
  }
}

export type CourseResourceSections = Record<string, CourseResourceFile[]>;

export async function buildCourseResourceSections(
  courseId: CourseId,
  options?: { isPremium?: boolean }
): Promise<CourseResourceSections> {
  const bucket = getNotesBucketName(options?.isPremium ?? false);
  const supabase = getSupabaseForStorage();
  const sections: CourseResourceSections = {};

  const addFiles = (label: string, files: StorageFileEntry[]) => {
    const resourceFiles = files.filter((f) => isResourceFile(f.name));
    if (resourceFiles.length === 0) return;
    sections[label] = resourceFiles.map((f) => mapResourceFile(f));
  };

  switch (courseId) {
    case "appliedfinance": {
      const { folders } = await listStorageFolder(supabase, "appliedfinance", bucket);
      const sorted = sortFolders(folders.map((f) => f.name));
      for (const folderName of sorted) {
        const folder = folders.find((f) => f.name === folderName);
        if (!folder) continue;
        const { files } = await listStorageFolder(supabase, folder.path, bucket);
        const label =
          folderName.match(/^chapter\s*\d+/i) != null
            ? folderName.replace(/\bchapter\b/i, "Chapter").replace(/\s+/g, " ")
            : folderName;
        addFiles(label, files);
      }
      break;
    }
    case "business": {
      const { folders } = await listStorageFolder(supabase, "bussiness", bucket);
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
        const { files } = await listStorageFolder(supabase, folder.path, bucket);
        addFiles(BUSINESS_LABELS[folderName] ?? folderName, files);
      }
      break;
    }
    case "directtax": {
      const domestic = await listStorageFolder(supabase, "directtax/domestic", bucket);
      addFiles("Domestic Taxation", domestic.files);
      const international = await listStorageFolder(
        supabase,
        "directtax/international",
        bucket
      );
      addFiles("International Taxation", international.files);
      break;
    }
    case "indirecttax": {
      const gst = await listStorageFolder(
        supabase,
        "indirecttax/goodsandservices(GST)",
        bucket
      );
      addFiles("GST LAWS", gst.files);
      const customs = await listStorageFolder(
        supabase,
        "indirecttax/customsact",
        bucket
      );
      addFiles("Customs Act", customs.files);
      break;
    }
    default:
      break;
  }

  if (options?.isPremium) {
    await mergePremViewOnlySections(courseId, sections, supabase, bucket);
  }

  return sections;
}

/** Root-level PDFs in `prenotes` (Book A–F, course summaries, etc.) — view only. */
export async function buildPrenotesRootViewOnlySections(): Promise<CourseResourceSections> {
  const bucket = PRENOTES_BUCKET;
  const supabase = getSupabaseForStorage();

  let listing: Awaited<ReturnType<typeof listStorageFolder>>;
  try {
    listing = await listStorageFolder(supabase, "", bucket);
  } catch {
    return {};
  }

  const rootFiles = listing.files
    .filter((f) => isResourceFile(f.name))
    .sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }));

  if (!rootFiles.length) return {};

  return {
    "ICPA Study Materials": rootFiles.map((f) => mapResourceFile(f, true)),
  };
}

/** View-only premium materials: root `prenotes` PDFs + everything under `prenotes/prem/`. */
export async function buildPremResourceSections(): Promise<CourseResourceSections> {
  const bucket = PRENOTES_BUCKET;
  const supabase = getSupabaseForStorage();
  const sections: CourseResourceSections = {
    ...(await buildPrenotesRootViewOnlySections()),
  };

  const addViewOnlyGroup = (label: string, files: StorageFileEntry[]) => {
    const resourceFiles = files.filter((f) => isResourceFile(f.name));
    if (!resourceFiles.length) return;
    const mapped = resourceFiles.map((f) => mapResourceFile(f, true));
    sections[label] = [...(sections[label] ?? []), ...mapped];
  };

  let premListing: Awaited<ReturnType<typeof listStorageFolder>>;
  try {
    premListing = await listStorageFolder(supabase, "prem", bucket);
  } catch {
    return sections;
  }

  addViewOnlyGroup("ICPA Folder", premListing.files);

  const sortedFolders = sortFolders(premListing.folders.map((f) => f.name));
  for (const folderName of sortedFolders) {
    const folder = premListing.folders.find((f) => f.name === folderName);
    if (!folder) continue;
    const files = await listAllFilesUnderPrefix(folder.path, bucket);
    const label =
      folderName.match(/^chapter\s*\d+/i) != null
        ? folderName.replace(/\bchapter\b/i, "Chapter").replace(/\s+/g, " ")
        : folderName;
    addViewOnlyGroup(label, files);
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

export async function buildBlogResourceSections(options?: {
  isPremium?: boolean;
}): Promise<BlogResourceSections> {
  const bucket = getNotesBucketName(options?.isPremium ?? false);
  const supabase = getSupabaseForStorage();
  const sections: BlogResourceSections = {};

  const { folders } = await listStorageFolder(supabase, "blogs", bucket);
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
    const { files } = await listStorageFolder(supabase, folderPath, bucket);
    const resourceFiles = files.filter((f) => isResourceFile(f.name));
    if (resourceFiles.length === 0) continue;

    const label =
      BLOG_FACULTY_FOLDERS.find((b) => b.folder === folderName)?.label ??
      folderName;
    sections[label] = resourceFiles.map((f) => mapResourceFile(f));
  }

  return sections;
}
