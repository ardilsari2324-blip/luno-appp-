import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { AppSidebar } from "@/components/layout/app-sidebar";

const ADMIN_IDS = (process.env.ADMIN_USER_IDS ?? process.env.ADMIN_USER_ID ?? "")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

export default async function AppLayout({
  children,
}: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) redirect("/login");
  const isAdmin = !!session.user.id && ADMIN_IDS.includes(session.user.id);
  return (
    <div className="flex min-h-screen min-h-[100dvh] bg-background">
      <AppSidebar user={session.user} isAdmin={isAdmin} />
      <main className="flex-1 overflow-auto min-w-0 pb-safe-mobile">
        {children}
      </main>
    </div>
  );
}
