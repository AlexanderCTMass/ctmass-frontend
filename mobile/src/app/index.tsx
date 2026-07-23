import { Redirect } from "expo-router";

import { useAppStore } from "@/store/use-app-store";

export default function IndexRoute() {
  const hasCompletedOnboarding = useAppStore(
    (state) => state.hasCompletedOnboarding,
  );

  return <Redirect href={hasCompletedOnboarding ? "/auth" : "/welcome"} />;
}
