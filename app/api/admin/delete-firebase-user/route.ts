import { NextResponse } from "next/server";
import { getAdminAuth } from "@/lib/firebaseAdmin";

/**
 * POST /api/admin/delete-firebase-user
 * Body: { email: string }
 * Header: x-admin-password: <NEXT_PUBLIC_ADMIN_PASSWORD>
 *
 * Looks up a Firebase Auth user by email and deletes them. Used by the admin
 * "Eliminate user" flow.
 *
 * Authorization: matches the same admin password the UI logs in with. This is
 * intentionally minimal — production should switch to a server-only secret.
 */
export async function POST(req: Request) {
  try {
    const expected =
      process.env.ADMIN_API_SECRET ??
      process.env.NEXT_PUBLIC_ADMIN_PASSWORD ??
      "";
    const provided = req.headers.get("x-admin-password") ?? "";
    if (!expected || provided !== expected) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

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
