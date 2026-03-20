import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { SettingsForm } from "@/components/settings/settings-form";
import { SettingsPageHeader } from "@/components/settings/settings-page-header";

export default async function SettingsPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  return (
    <div className="min-h-screen bg-background">
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b border-border">
        <SettingsPageHeader />
      </div>
      <div className="max-w-xl mx-auto p-4 sm:p-6 pb-safe">
        <SettingsForm
          user={{
            id: session.user.id!,
            name: session.user.name ?? undefined,
            email: session.user.email ?? undefined,
          }}
        />
      </div>
    </div>
  );
}
