import { supabase } from "@/lib/Supabase";

export const PROFILE_IMAGES_BUCKET = "profileimages";

export const PROFILE_IMAGE_EXTENSIONS = ["jpg", "jpeg", "png", "webp"] as const;

export type ProfileImageExtension = (typeof PROFILE_IMAGE_EXTENSIONS)[number];

export function normalizeProfileImageExtension(
  fileName: string
): ProfileImageExtension {
  const ext = (fileName.split(".").pop() || "jpg").toLowerCase();
  return PROFILE_IMAGE_EXTENSIONS.includes(ext as ProfileImageExtension)
    ? (ext as ProfileImageExtension)
    : "jpg";
}

export function profileImageObjectName(
  membershipId: number | string,
  ext: string
): string {
  return `${membershipId}.${ext}`;
}

export function getProfileImagePublicUrl(
  membershipId: number | string,
  ext: string,
  cacheBust?: number
): string {
  const { data } = supabase.storage
    .from(PROFILE_IMAGES_BUCKET)
    .getPublicUrl(profileImageObjectName(membershipId, ext));
  const base = data.publicUrl;
  if (!base) return "";
  return cacheBust != null ? `${base}?v=${cacheBust}` : base;
}

/** Remove stale files when the member uploads a new extension (e.g. png after jpg). */
export async function removeOtherProfileImageVariants(
  membershipId: number | string,
  keepExt: string
): Promise<void> {
  const paths = PROFILE_IMAGE_EXTENSIONS.filter((e) => e !== keepExt).map((e) =>
    profileImageObjectName(membershipId, e)
  );
  if (paths.length === 0) return;
  const { error } = await supabase.storage
    .from(PROFILE_IMAGES_BUCKET)
    .remove(paths);
  if (error) {
    console.warn("Could not remove old profile image variants:", error.message);
  }
}

export async function uploadMemberProfileImage(
  membershipId: number | string,
  file: File
): Promise<{ ext: ProfileImageExtension; publicUrl: string }> {
  const ext = normalizeProfileImageExtension(file.name);
  const objectName = profileImageObjectName(membershipId, ext);

  const { error: uploadError } = await supabase.storage
    .from(PROFILE_IMAGES_BUCKET)
    .upload(objectName, file, { upsert: true, cacheControl: "3600" });

  if (uploadError) throw uploadError;

  await removeOtherProfileImageVariants(membershipId, ext);

  const version = Date.now();
  return {
    ext,
    publicUrl: getProfileImagePublicUrl(membershipId, ext, version),
  };
}
