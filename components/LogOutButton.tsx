import { auth } from "@/lib/firebaseConfig";
import { signOut } from "firebase/auth";

async function logout() {
  try {
    await signOut(auth);
    console.log("User signed out");
  } catch (error) {
    console.error("Error signing out:", error.message);
  }
}
