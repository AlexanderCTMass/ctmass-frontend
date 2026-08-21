import { Redirect } from "expo-router";

import { toHref } from "@/lib/navigation";
import { useAppStore } from "@/store/use-app-store";
import { useAuthStore } from "@/store/use-auth-store";

export default function IndexRoute() {
  const hasCompletedOnboarding = useAppStore(
    (state) => state.hasCompletedOnboarding,
  );
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  if (isAuthenticated) {
    return <Redirect href={toHref("/home")} />;
  }

  return <Redirect href={hasCompletedOnboarding ? "/auth" : "/welcome"} />;
}
