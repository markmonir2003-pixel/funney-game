import { useUser } from "@clerk/nextjs";
import { useEffect } from "react";
import { fetchCloudData, syncCloudData } from "@/lib/storage";

export function useSyncProgress() {
  const { isSignedIn, isLoaded } = useUser();

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      // Load cloud data on initial login/refresh
      fetchCloudData();
    }
  }, [isSignedIn, isLoaded]);

  // Function to manually trigger sync (useful after completing a level)
  const sync = async () => {
    if (isSignedIn) {
      await syncCloudData();
    }
  };

  return { sync };
}
