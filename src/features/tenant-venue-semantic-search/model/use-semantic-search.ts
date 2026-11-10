import { useQuery } from "@tanstack/react-query";
import { tenantVenueApi } from "@/shared/api";

interface UseSemanticSearchProps {
  tenantKey: string;
  query: string;
  city?: string | null;
  limit?: number;
  enabled?: boolean;
}

export function useSemanticSearch({
  tenantKey,
  query,
  city,
  limit = 20,
  enabled = false,
}: UseSemanticSearchProps) {
  return useQuery({
    queryKey: ["admin", "tenant-venues", "semantic", tenantKey, query, city, limit],
    queryFn: () =>
      tenantVenueApi.semanticSearch(tenantKey, {
        q: query,
        city: city || undefined,
        limit,
      }),
    enabled: enabled && !!tenantKey && query.trim().length > 0,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
