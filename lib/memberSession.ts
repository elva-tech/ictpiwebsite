const MEMBER_ID_KEY = "ictpi_member_id";
const MEMBER_EMAIL_KEY = "ictpi_member_email";
const MEMBER_NAME_KEY = "ictpi_member_name";

export function persistMemberSession(
  membershipId: string | number,
  email: string,
  name?: string | null
): void {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(MEMBER_ID_KEY, String(membershipId).trim());
  sessionStorage.setItem(MEMBER_EMAIL_KEY, email.toLowerCase().trim());
  const trimmedName = name?.trim();
  if (trimmedName) {
    sessionStorage.setItem(MEMBER_NAME_KEY, trimmedName);
  } else {
    sessionStorage.removeItem(MEMBER_NAME_KEY);
  }
}

export function getStoredMembershipId(): string | null {
  if (typeof window === "undefined") return null;
  const v = sessionStorage.getItem(MEMBER_ID_KEY);
  return v?.trim() || null;
}

export function getStoredMemberEmail(): string | null {
  if (typeof window === "undefined") return null;
  const v = sessionStorage.getItem(MEMBER_EMAIL_KEY);
  return v?.trim() || null;
}

export function getStoredMemberName(): string | null {
  if (typeof window === "undefined") return null;
  const v = sessionStorage.getItem(MEMBER_NAME_KEY);
  return v?.trim() || null;
}

export function clearMemberSession(): void {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(MEMBER_ID_KEY);
  sessionStorage.removeItem(MEMBER_EMAIL_KEY);
  sessionStorage.removeItem(MEMBER_NAME_KEY);
}
