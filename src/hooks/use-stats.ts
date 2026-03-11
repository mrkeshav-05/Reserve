import { useQuery } from "@tanstack/react-query";
import { api } from "@shared/routes";

export function useImpactStats() {
  return useQuery({
    queryKey: [api.stats.impact.path],
    queryFn: async () => {
      const res = await fetch(api.stats.impact.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch stats");
      return api.stats.impact.responses[200].parse(await res.json());
    },
    // Don't refetch stats too often
    staleTime: 60 * 1000 * 5,
  });
}
