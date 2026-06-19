"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { User } from "lucide-react";
import {
  getProfileImagePublicUrl,
  PROFILE_IMAGE_EXTENSIONS,
} from "@/lib/profileImageStorage";

interface MemberProfileAvatarProps {
  membershipId: number | string | null;
  version?: number;
  preferredExt?: string;
  sizeClass?: string;
  iconClass?: string;
  onResolvedExt?: (ext: string) => void;
}

export function MemberProfileAvatar({
  membershipId,
  version = 0,
  preferredExt = "jpg",
  sizeClass = "w-32 h-32 md:w-40 md:h-40",
  iconClass = "w-20 h-20 md:w-24 md:h-24",
  onResolvedExt,
}: MemberProfileAvatarProps) {
  const startIdx = Math.max(
    0,
    PROFILE_IMAGE_EXTENSIONS.indexOf(
      preferredExt as (typeof PROFILE_IMAGE_EXTENSIONS)[number]
    )
  );
  const [extIdx, setExtIdx] = useState(startIdx);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setExtIdx(startIdx);
    setFailed(false);
  }, [membershipId, version, startIdx]);

  if (membershipId == null) {
    return (
      <div
        className={`${sizeClass} rounded-full overflow-hidden border-4 border-blue-100 bg-gray-100 flex items-center justify-center shadow-md`}
      >
        <User className={`${iconClass} text-gray-400`} />
      </div>
    );
  }

  if (failed) {
    return (
      <div
        className={`${sizeClass} rounded-full overflow-hidden border-4 border-blue-100 bg-gray-100 flex items-center justify-center shadow-md`}
      >
        <User className={`${iconClass} text-gray-400`} />
      </div>
    );
  }

  const ext = PROFILE_IMAGE_EXTENSIONS[extIdx] ?? PROFILE_IMAGE_EXTENSIONS[0];
  const src = getProfileImagePublicUrl(membershipId, ext, version || undefined);

  return (
    <div
      className={`${sizeClass} rounded-full overflow-hidden border-4 border-blue-100 bg-gray-100 flex items-center justify-center shadow-md`}
    >
      <Image
        src={src}
        alt="Profile picture"
        width={160}
        height={160}
        className="object-cover w-full h-full"
        unoptimized
        onLoad={() => onResolvedExt?.(ext)}
        onError={() => {
          if (extIdx < PROFILE_IMAGE_EXTENSIONS.length - 1) {
            setExtIdx((v) => v + 1);
          } else {
            setFailed(true);
          }
        }}
      />
    </div>
  );
}
