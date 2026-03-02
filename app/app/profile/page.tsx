import { redirect } from "next/navigation";
import { auth } from "@/auth";

export default async function ProfileRedirectPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  redirect(`/app/profile/${session.user.id}`);
}
