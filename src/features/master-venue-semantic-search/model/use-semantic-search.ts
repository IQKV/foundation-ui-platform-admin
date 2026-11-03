import { useQuery } from "@tanstack/react-query";
import { catalogApi } from "@/shared/api";

interface UseSemanticSearchProps {
  query: string;
  city?: string | null;
  limit?: number;
  enabled?: boolean;
}

export function useSemanticSearch({
  query,
  city,
  limit = 20,
  enabled = false,
}: UseSemanticSearchProps) {
  return useQuery({
    queryKey: ["admin", "master-venues", "semantic", query, city, limit],
    queryFn: () =>
      catalogApi.semanticSearch({
        q: query,
        city: city || undefined,
        limit,
      }),
    enabled: enabled && query.trim().length > 0,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
