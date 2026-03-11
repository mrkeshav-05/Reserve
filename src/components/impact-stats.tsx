import { useImpactStats } from "@/hooks/use-stats";
import { Utensils, Wind, ArrowUpRight } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export function ImpactStats() {
  const { data, isLoading } = useImpactStats();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-3xl">
        <Skeleton className="h-32 rounded-2xl" />
        <Skeleton className="h-32 rounded-2xl" />
      </div>
    );
  }

  const meals = data?.mealsSaved || 0;
  const co2 = data?.co2Offset || 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-3xl relative z-10">
      <div className="bg-white/80 backdrop-blur-md rounded-2xl p-6 shadow-xl shadow-emerald-500/5 border border-emerald-100 flex items-center gap-6 hover:scale-[1.02] transition-transform">
        <div className="w-14 h-14 rounded-full bg-emerald-100 flex items-center justify-center text-primary shrink-0">
          <Utensils className="w-7 h-7" />
        </div>
        <div>
          <p className="text-sm font-medium text-emerald-600/80 uppercase tracking-wider mb-1">Meals Rescued</p>
          <div className="flex items-end gap-2">
            <h3 className="text-4xl font-display font-bold text-emerald-950">{meals.toLocaleString()}</h3>
            <span className="text-emerald-500 flex items-center text-sm font-semibold pb-1">
              <ArrowUpRight className="w-4 h-4" /> 12%
            </span>
          </div>
        </div>
      </div>

      <div className="bg-white/80 backdrop-blur-md rounded-2xl p-6 shadow-xl shadow-blue-500/5 border border-blue-100 flex items-center gap-6 hover:scale-[1.02] transition-transform">
        <div className="w-14 h-14 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 shrink-0">
          <Wind className="w-7 h-7" />
        </div>
        <div>
          <p className="text-sm font-medium text-blue-600/80 uppercase tracking-wider mb-1">CO₂ Offset (kg)</p>
          <div className="flex items-end gap-2">
            <h3 className="text-4xl font-display font-bold text-slate-900">{co2.toLocaleString()}</h3>
            <span className="text-blue-500 flex items-center text-sm font-semibold pb-1">
              <ArrowUpRight className="w-4 h-4" /> 8%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
