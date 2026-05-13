import { NextResponse } from "next/server";
import { getAdminAuth } from "@/lib/firebaseAdmin";

/**
 * POST /api/admin/delete-firebase-user
 * Body: { email?: string; uid?: string }
 *
 * Looks up a Firebase Auth user by email (or uid) and deletes them. Used by
 * the admin "Eliminate user" flow — fires automatically when an admin clicks
 * Delete on the Users page, no password prompt.
 */
export async function POST(req: Request) {
  try {
    const body = (await req.json().catch(() => null)) as
      | { email?: string; uid?: string }
      | null;
    const email = (body?.email ?? "").trim().toLowerCase();
    const uid = (body?.uid ?? "").trim();

    if (!email && !uid) {
      return NextResponse.json(
        { error: "email or uid is required" },
        { status: 400 }
      );
    }

    const adminAuth = getAdminAuth();

    let resolvedUid = uid;
    if (!resolvedUid) {
      try {
        const user = await adminAuth.getUserByEmail(email);
        resolvedUid = user.uid;
      } catch (err: unknown) {
        const code =
          err && typeof err === "object" && "code" in err
            ? String((err as { code: string }).code)
            : "";
        if (code === "auth/user-not-found") {
          return NextResponse.json({
            ok: true,
            deleted: false,
            reason: "no_firebase_user",
          });
        }
        throw err;
      }
    }

    await adminAuth.deleteUser(resolvedUid);

    return NextResponse.json({ ok: true, deleted: true, uid: resolvedUid });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Server error";
    console.error("delete-firebase-user error:", err);
    // Surface the underlying reason so the admin UI can show it.
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
