import "server-only";
import { redirect } from "next/navigation";
import { session } from "./auth";
export async function requireAdminPage() {
  const admin = await session("admin");
  if (!admin || admin.rotate) redirect("/admin");
  return admin;
}
