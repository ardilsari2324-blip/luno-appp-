import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { AdminReportsClient } from "@/components/admin/reports-client";

const ADMIN_IDS = (process.env.ADMIN_USER_IDS ?? process.env.ADMIN_USER_ID ?? "")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

export default async function AdminPage() {
  const session = await auth();
  if (!session?.user?.id || !ADMIN_IDS.includes(session.user.id)) {
    redirect("/app");
  }
  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Şikayetler (Admin)</h1>
      <AdminReportsClient />
    </div>
  );
}
