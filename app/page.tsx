import { auth } from "@/auth";
import { LandingContent } from "@/components/landing/landing-content";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  let session = null;
  try {
    session = await auth();
  } catch {
    // Auth/DB hatasında bile sayfa açılsın
  }
  return <LandingContent session={session} />;
}
