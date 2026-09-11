import { useQuery } from "@tanstack/react-query";

import { fetchCertificates } from "@/lib/certificates";

export function useCertificates(uid: string | undefined) {
  return useQuery({
    queryKey: ["certificates", uid ?? ""],
    enabled: Boolean(uid),
    staleTime: 30 * 1000,
    queryFn: () => fetchCertificates(uid as string),
  });
}
