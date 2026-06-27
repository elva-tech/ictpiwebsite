import { COMMON_CERTIFICATES_BUCKET } from "@/lib/commonCertificateStorage";
import { NOTES_BUCKET, PRENOTES_BUCKET } from "@/lib/notesStorage";
import { ICPA_CERTIFICATES_BUCKET } from "@/lib/icpaCertificateStorage";

/** Buckets the admin Resources page can manage. */
export const ADMIN_STORAGE_BUCKETS = [
  {
    id: NOTES_BUCKET,
    label: "Standard members",
    description: "Course PDFs, tests, and vlogs for normal members (`notes`).",
  },
  {
    id: PRENOTES_BUCKET,
    label: "Premium members",
    description:
      "Same folder layout as standard — course materials for premium (`prenotes`).",
  },
  {
    id: ICPA_CERTIFICATES_BUCKET,
    label: "Premium ICPA certificates",
    description:
      "Per-member certificate PDFs shown on the premium Certificates page.",
  },
  {
    id: COMMON_CERTIFICATES_BUCKET,
    label: "Member certificates",
    description:
      "Common ICTPI certificate PDFs (`certificates`) — practicing, NCVET, Skill India, etc.",
  },
] as const;

export type AdminStorageBucketId =
  (typeof ADMIN_STORAGE_BUCKETS)[number]["id"];

export function isAdminStorageBucket(
  value: string
): value is AdminStorageBucketId {
  return ADMIN_STORAGE_BUCKETS.some((b) => b.id === value);
}

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

export const ICPA_RESOURCE_AREAS: ResourceArea[] = [
  {
    id: "root",
    label: "All member certificates",
    prefix: "",
    subfolders: [],
  },
];

export const CERTIFICATES_RESOURCE_AREAS: ResourceArea[] = [
  {
    id: "practicing",
    label: "Practicing",
    prefix: "practicing",
    subfolders: [],
  },
  {
    id: "ncvet",
    label: "NCVET",
    prefix: "ncvet",
    subfolders: [],
  },
  {
    id: "skill-india",
    label: "Skill India",
    prefix: "skill-india",
    subfolders: [],
  },
  {
    id: "ictpi",
    label: "ICTPI (legacy)",
    prefix: "ictpi",
    subfolders: [],
  },
  {
    id: "root",
    label: "Root",
    prefix: "",
    subfolders: [],
  },
];

export function getResourceAreasForBucket(bucket: string): ResourceArea[] {
  if (bucket === ICPA_CERTIFICATES_BUCKET) return ICPA_RESOURCE_AREAS;
  if (bucket === COMMON_CERTIFICATES_BUCKET) return CERTIFICATES_RESOURCE_AREAS;
  return RESOURCE_AREAS;
}

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
    id: "blogs",
    label: "Blogs / Vlogs (Faculty)",
    prefix: "blogs",
    subfolders: [
      "CTPr Sreedhara Parthasarathy",
      "BR.N. Subramanian",
      "CTPr Dr Kalyanasundaram Baskaran",
    ],
  },
  {
    id: "root",
    label: "Root (faculty PDFs)",
    prefix: "",
    subfolders: [],
  },
];

export function buildStoragePrefix(
  areaId: string,
  subfolder?: string,
  areas: ResourceArea[] = RESOURCE_AREAS
): string {
  const area = areas.find((a) => a.id === areaId);
  if (!area) return "";
  const base = area.prefix;
  const sub = subfolder?.trim();
  if (!sub) return base;
  return base ? `${base}/${sub}` : sub;
}

export function publicUrlForStorageKey(
  key: string,
  bucket: string = NOTES_BUCKET
): string {
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!base) return "";
  const encoded = key
    .split("/")
    .filter(Boolean)
    .map((s) => encodeURIComponent(s))
    .join("/");
  return `${base}/storage/v1/object/public/${bucket}/${encoded}`;
}
