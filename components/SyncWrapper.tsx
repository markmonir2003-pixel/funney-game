"use client";

import { useSyncProgress } from "@/hooks/useSyncProgress";

export function SyncWrapper() {
  useSyncProgress();
  return null;
}
