/**
 * Server-side Firebase Admin SDK initializer.
 *
 * Reads service account credentials from env. Supports either:
 *   FIREBASE_SERVICE_ACCOUNT_JSON  — entire service account JSON as a string,
 * or the three individual fields:
 *   FIREBASE_PROJECT_ID
 *   FIREBASE_CLIENT_EMAIL
 *   FIREBASE_PRIVATE_KEY  (with literal "\n" allowed for newlines)
 *
 * Throws a descriptive error if no credentials are configured.
 */

import {
  cert,
  getApp,
  getApps,
  initializeApp,
  type ServiceAccount,
} from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";

function buildServiceAccount(): ServiceAccount {
  const blob = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if (blob && blob.trim().length > 0) {
    try {
      const parsed = JSON.parse(blob) as Record<string, string>;
      return {
        projectId: parsed.project_id ?? parsed.projectId,
        clientEmail: parsed.client_email ?? parsed.clientEmail,
        privateKey: (parsed.private_key ?? parsed.privateKey ?? "").replace(
          /\\n/g,
          "\n"
        ),
      };
    } catch (err) {
      throw new Error(
        "FIREBASE_SERVICE_ACCOUNT_JSON is set but is not valid JSON: " +
          (err instanceof Error ? err.message : String(err))
      );
    }
  }

  const projectId =
    process.env.FIREBASE_PROJECT_ID ??
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = (process.env.FIREBASE_PRIVATE_KEY ?? "").replace(
    /\\n/g,
    "\n"
  );

  if (!projectId || !clientEmail || !privateKey) {
    throw new Error(
      "Firebase Admin credentials are not configured. Set either FIREBASE_SERVICE_ACCOUNT_JSON or FIREBASE_PROJECT_ID + FIREBASE_CLIENT_EMAIL + FIREBASE_PRIVATE_KEY."
    );
  }

  return { projectId, clientEmail, privateKey };
}

function getAdminApp() {
  if (getApps().length > 0) return getApp();
  return initializeApp({ credential: cert(buildServiceAccount()) });
}

export function getAdminAuth() {
  return getAuth(getAdminApp());
}
