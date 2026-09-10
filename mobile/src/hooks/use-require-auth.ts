import { router } from "expo-router";
import { useCallback } from "react";

import { toHref } from "@/lib/navigation";
import { useAuthStore } from "@/store/use-auth-store";

export function useRequireAuth(): () => boolean {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  return useCallback(() => {
    if (isAuthenticated) return true;
    router.push(toHref("/auth"));
    return false;
  }, [isAuthenticated]);
}
