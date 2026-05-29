import { redirect } from "next/navigation";

/** Site entry point — send visitors straight to member login. */
export default function Home() {
  redirect("/login");
}
