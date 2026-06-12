import { redirect } from "next/navigation";

/**
 * Root entry — every visitor goes to the dashboard.
 * The auth guard inside the (dashboard) route group handles unauth redirect.
 */
export default function RootPage() {
  redirect("/dashboard");
}
