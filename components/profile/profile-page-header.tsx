"use client";

import { BackButton } from "@/components/ui/back-button";

export function ProfilePageHeader() {
  return (
    <div className="flex items-center">
      <BackButton href="/app" />
    </div>
  );
}
