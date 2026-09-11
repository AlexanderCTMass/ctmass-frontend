import { Redirect } from "expo-router";

import { toHref } from "@/lib/navigation";
import { useAppStore } from "@/store/use-app-store";

export default function IndexRoute() {
  const hasCompletedOnboarding = useAppStore(
    (state) => state.hasCompletedOnboarding,
  );

  return (
    <Redirect href={toHref(hasCompletedOnboarding ? "/home" : "/welcome")} />
  );
}
