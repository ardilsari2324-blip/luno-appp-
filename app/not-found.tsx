import Link from "next/link";
import { Button } from "@/components/ui/button";
import { FileQuestion } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-background">
      <div className="max-w-sm w-full text-center space-y-6">
        <div className="flex justify-center">
          <div className="rounded-full bg-muted p-4">
            <FileQuestion className="h-12 w-12 text-muted-foreground" />
          </div>
        </div>
        <div>
          <h1 className="text-2xl font-bold">404</h1>
          <p className="text-muted-foreground mt-2">
            Bu sayfa bulunamadı.
          </p>
        </div>
        <Button asChild>
          <Link href="/">Ana sayfaya dön</Link>
        </Button>
      </div>
    </div>
  );
}
