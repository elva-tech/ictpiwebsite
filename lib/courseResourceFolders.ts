import { NOTES_BUCKET } from "@/lib/notesStorage";

/** Course resource areas matching the `notes` bucket layout. */
export interface ResourceArea {
  id: string;
  label: string;
  /** Storage prefix inside the `notes` bucket (no leading slash). */
  prefix: string;
  subfolders: string[];
}

const APPLIED_FINANCE_CHAPTERS = Array.from(
  { length: 12 },
  (_, i) => `chapter ${i + 1}`
);

export const RESOURCE_AREAS: ResourceArea[] = [
  {
    id: "appliedfinance",
    label: "Applied Finance",
    prefix: "appliedfinance",
    subfolders: APPLIED_FINANCE_CHAPTERS,
  },
  {
    id: "bussiness",
    label: "Business Regulatory",
    prefix: "bussiness",
    subfolders: ["advising", "bussinessmaintaince", "procedure", "appendix"],
  },
  {
    id: "directtax-domestic",
    label: "Direct Tax — Domestic",
    prefix: "directtax/domestic",
    subfolders: [],
  },
  {
    id: "directtax-international",
    label: "Direct Tax — International",
    prefix: "directtax/international",
    subfolders: [],
  },
  {
    id: "indirecttax-gst",
    label: "Indirect Tax — GST",
    prefix: "indirecttax/goodsandservices(GST)",
    subfolders: [],
  },
  {
    id: "indirecttax-customs",
    label: "Indirect Tax — Customs",
    prefix: "indirecttax/customsact",
    subfolders: [],
  },
  {
    id: "tests",
    label: "Practice Tests (HTML)",
    prefix: "tests",
    subfolders: [],
  },
  {
    id: "root",
    label: "Root (faculty PDFs)",
    prefix: "",
    subfolders: [],
  },
];

export function buildStoragePrefix(areaId: string, subfolder?: string): string {
  const area = RESOURCE_AREAS.find((a) => a.id === areaId);
  if (!area) return "";
  const base = area.prefix;
  const sub = subfolder?.trim();
  if (!sub) return base;
  return base ? `${base}/${sub}` : sub;
}

export function publicUrlForStorageKey(key: string): string {
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!base) return "";
  const encoded = key
    .split("/")
    .filter(Boolean)
    .map((s) => encodeURIComponent(s))
    .join("/");
  return `${base}/storage/v1/object/public/${NOTES_BUCKET}/${encoded}`;
}
