"use client";

/**
 * Helpers used by the admin UI to create / manage Firebase Authentication
 * users from the browser.
 *
 * IMPORTANT: We deliberately use a **secondary Firebase app instance** so
 * calling `createUserWithEmailAndPassword` does not replace the admin's
 * Firebase session (or anyone else who might be signed in) with the newly
 * created member.
 *
 * Note about deletion: Firebase Auth user deletion cannot be performed by an
 * arbitrary client — it requires the Firebase Admin SDK (server side) or the
 * user themselves to be re-authenticated. The admin "eliminate user" action
 * therefore only removes our Supabase records.
 */

import { FirebaseApp, getApp, getApps, initializeApp } from "firebase/app";
import {
  Auth,
  createUserWithEmailAndPassword,
  getAuth,
  signOut,
} from "firebase/auth";

const SECONDARY_NAME = "ictpi-admin-secondary";

function getSecondaryApp(): FirebaseApp {
  if (getApps().some((a) => a.name === SECONDARY_NAME)) {
    return getApp(SECONDARY_NAME);
  }
  const primary = getApp(); // throws if no primary; expected to be initialized in lib/firebase.tsx
  return initializeApp(primary.options, SECONDARY_NAME);
}

function getSecondaryAuth(): Auth {
  return getAuth(getSecondaryApp());
}

/**
 * Creates a new Firebase Authentication user. Uses a secondary Firebase app
 * so the calling page's auth state isn't affected.
 *
 * Returns the new user's UID on success.
 */
export async function createFirebaseUser(
  email: string,
  password: string
): Promise<string> {
  const secondary = getSecondaryAuth();
  try {
    const cred = await createUserWithEmailAndPassword(secondary, email, password);
    const uid = cred.user.uid;
    // Sign out so the secondary instance doesn't hold a session for the new
    // user (defensive — admin's primary app should not be affected anyway).
    try {
      await signOut(secondary);
    } catch {
      /* ignore */
    }
    return uid;
  } catch (err: unknown) {
    throw err;
  }
}
