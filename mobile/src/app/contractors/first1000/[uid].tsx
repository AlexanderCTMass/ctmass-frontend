import { Redirect, useLocalSearchParams } from "expo-router";

import { toHref } from "@/lib/navigation";

export default function ContractorDeepLinkRoute() {
  const params = useLocalSearchParams<{ uid?: string; connect?: string }>();
  const uid = typeof params.uid === "string" ? params.uid : "";

  if (!uid) return <Redirect href={toHref("/home")} />;

  const connect = params.connect === "1";
  const href = connect
    ? `/user/${encodeURIComponent(uid)}?connect=1`
    : `/user/${encodeURIComponent(uid)}`;

  return <Redirect href={toHref(href)} />;
}
