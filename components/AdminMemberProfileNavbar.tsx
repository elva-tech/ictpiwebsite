"use client";

import { useMemo, useState } from "react";
import { supabase } from "@/lib/Supabase";
import { Camera, Loader2 } from "lucide-react";

type MemberItem = {
  membershipId: number;
  name: string | null;
};

const IMAGE_EXTENSIONS = ["jpg", "jpeg", "png", "webp"];

function buildProfileImageUrl(membershipId: number, ext: string, version: number) {
  const { data } = supabase.storage
    .from("profileimages")
    .getPublicUrl(`${membershipId}.${ext}`);
  return `${data.publicUrl}?v=${version}`;
}

function initialsOf(name: string | null, membershipId: number) {
  const t = (name ?? "").trim();
  if (!t) return String(membershipId).slice(-2);
  const parts = t.split(/\s+/).filter(Boolean);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0] ?? ""}${parts[parts.length - 1][0] ?? ""}`.toUpperCase();
}

export function AdminMemberProfileNavbar({ members }: { members: MemberItem[] }) {
  const [busyMembershipId, setBusyMembershipId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [extById, setExtById] = useState<Record<number, string>>({});
  const [versionById, setVersionById] = useState<Record<number, number>>({});

  const uniqueMembers = useMemo(() => {
    const seen = new Set<number>();
    return members.filter((m) => {
      if (!m?.membershipId || seen.has(m.membershipId)) return false;
      seen.add(m.membershipId);
      return true;
    });
  }, [members]);

  const handleUpload = async (
    membershipId: number,
    file: File | null | undefined
  ) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Please choose an image file (jpg, jpeg, png, webp).");
      return;
    }
    if (file.size > 4 * 1024 * 1024) {
      setError("Image must be below 4MB.");
      return;
    }

    const ext = (file.name.split(".").pop() || "jpg").toLowerCase();
    const safeExt = IMAGE_EXTENSIONS.includes(ext) ? ext : "jpg";
    const objectName = `${membershipId}.${safeExt}`;

    setBusyMembershipId(membershipId);
    setError(null);
    try {
      const { error: uploadErr } = await supabase.storage
        .from("profileimages")
        .upload(objectName, file, { upsert: true, cacheControl: "3600" });
      if (uploadErr) throw uploadErr;

      setExtById((prev) => ({ ...prev, [membershipId]: safeExt }));
      setVersionById((prev) => ({ ...prev, [membershipId]: Date.now() }));
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Upload failed.";
      setError(msg);
    } finally {
      setBusyMembershipId(null);
    }
  };

  if (uniqueMembers.length === 0) return null;

  return (
    <div className="mb-5 rounded-xl border border-slate-200 bg-slate-50/70 p-4">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-bold text-[#1e2659]">
          Member Profile Images
        </h3>
        <p className="text-xs text-slate-500">
          Admin can update profile pictures by Membership ID.
        </p>
      </div>

      {error && (
        <div className="mb-3 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
          {error}
        </div>
      )}

      <div className="flex gap-3 overflow-x-auto pb-1">
        {uniqueMembers.map((member) => {
          const selectedExt = extById[member.membershipId] ?? "jpg";
          const version = versionById[member.membershipId] ?? 0;

          return (
            <div
              key={member.membershipId}
              className="min-w-[172px] rounded-lg border border-slate-200 bg-white p-3 shadow-sm"
            >
              <div className="mb-2 flex items-center gap-3">
                <ProfileImage
                  membershipId={member.membershipId}
                  selectedExt={selectedExt}
                  version={version}
                  fallbackText={initialsOf(member.name, member.membershipId)}
                  onResolvedExt={(ext) =>
                    setExtById((prev) =>
                      prev[member.membershipId] === ext
                        ? prev
                        : { ...prev, [member.membershipId]: ext }
                    )
                  }
                />
                <div className="min-w-0">
                  <p className="truncate text-xs font-semibold text-slate-800">
                    {member.name?.trim() || "Member"}
                  </p>
                  <p className="font-mono text-xs text-slate-500">
                    ID: {String(member.membershipId).padStart(5, "0")}
                  </p>
                </div>
              </div>

              <label className="inline-flex cursor-pointer items-center gap-2 rounded-md bg-[#1e2659] px-2.5 py-1.5 text-xs font-semibold text-white hover:opacity-95">
                {busyMembershipId === member.membershipId ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Camera className="h-3.5 w-3.5" />
                )}
                Change
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/jpg,image/webp"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    void handleUpload(member.membershipId, f);
                    e.currentTarget.value = "";
                  }}
                />
              </label>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ProfileImage({
  membershipId,
  selectedExt,
  version,
  fallbackText,
  onResolvedExt,
}: {
  membershipId: number;
  selectedExt: string;
  version: number;
  fallbackText: string;
  onResolvedExt: (ext: string) => void;
}) {
  const [idx, setIdx] = useState(Math.max(0, IMAGE_EXTENSIONS.indexOf(selectedExt)));
  const [failed, setFailed] = useState(false);

  const ext = IMAGE_EXTENSIONS[idx] ?? IMAGE_EXTENSIONS[0];
  const src = buildProfileImageUrl(membershipId, ext, version);

  if (failed) {
    return (
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-200 text-xs font-bold text-slate-600">
        {fallbackText}
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={`Member ${membershipId}`}
      className="h-12 w-12 rounded-full border border-slate-200 object-cover bg-slate-100"
      onLoad={() => onResolvedExt(ext)}
      onError={() => {
        if (idx < IMAGE_EXTENSIONS.length - 1) {
          setIdx((v) => v + 1);
        } else {
          setFailed(true);
        }
      }}
    />
  );
}
