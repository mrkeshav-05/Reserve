import { format, formatDistanceToNow, isPast } from "date-fns";
import { Clock, MapPin, Tag, ShieldCheck, Ticket } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useClaimListing } from "@/hooks/use-listings";
import { useAuth } from "@/hooks/use-auth";
import type { FoodListing, User } from "@shared/schema";
import { useRouter } from "next/navigation";

interface FoodCardProps {
  listing: FoodListing & { provider: User };
  showProviderControls?: boolean;
}

export function FoodCard({ listing, showProviderControls = false }: FoodCardProps) {
  const { data: user } = useAuth();
  const claimMutation = useClaimListing();
  const router = useRouter();

  const expired = isPast(new Date(listing.expiryTimestamp));
  const isClaimed = listing.status === "Reserved" || listing.status === "Completed";

  // Calculate dynamic price based on time to expiry (mock logic, actual should be in backend)
  // But we render whatever the backend sent as currentPrice
  const discountPercent = Math.round(
    ((Number(listing.originalPrice) - Number(listing.currentPrice)) / Number(listing.originalPrice)) * 100
  );

  const foodImageIds = [
    "1546069901-ba9599a7e63c",
    "1565299624946-b28f40a0ae38",
    "1473093295043-cdd812d0e601",
    "1482049016688-2d3e1b311543",
    "1493770348161-369560ae357d",
    "1504674900247-0877df9cc836",
  ];
  const imageId = foodImageIds[listing.id % foodImageIds.length];
  const imageUrl = listing.imageUrl || `https://images.unsplash.com/photo-${imageId}?auto=format&fit=crop&q=80&w=800`;

  const canClaim = !expired && !isClaimed && user && user.role !== "Provider";

  const handleCardClick = () => {
    router.push(`/food/${listing.id}`);
  };

  return (
    <div
      onClick={handleCardClick}
      className={`
      relative group bg-card rounded-2xl overflow-hidden
      border border-border/50 transition-all duration-300
      hover:shadow-xl hover:shadow-emerald-500/5 hover:-translate-y-1
      flex flex-col h-full cursor-pointer
      ${expired ? 'opacity-75 grayscale-[0.5]' : ''}
    `}>
      {/* Image / Header area */}
      <div
        className="h-48 p-6 flex flex-col justify-between relative overflow-hidden"
        style={{
          backgroundImage: `url(${imageUrl})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        {/* Dark overlay for text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/60" />

        <div className="flex justify-between items-start relative z-10">
          <Badge variant={listing.isDonation ? "default" : "secondary"} className="shadow-sm">
            {listing.isDonation ? "Donation (Free)" : `${discountPercent}% OFF`}
          </Badge>

          <div className="bg-white/80 backdrop-blur-sm px-3 py-1.5 rounded-full text-sm font-medium flex items-center gap-1.5 shadow-sm text-emerald-800">
            <Clock className="w-4 h-4" />
            {expired ? "Expired" : formatDistanceToNow(new Date(listing.expiryTimestamp), { addSuffix: true })}
          </div>
        </div>

        <div className="relative z-10 mt-auto">
          <h3 className="text-xl font-display font-bold text-white line-clamp-2 drop-shadow-md">{listing.title}</h3>
          <p className="text-emerald-50 flex items-center gap-1.5 text-sm mt-2 drop-shadow-md">
            <MapPin className="w-4 h-4" />
            {listing.provider.name}
          </p>
        </div>
      </div>

      <div className="p-6 flex-1 flex flex-col">
        <p className="text-muted-foreground text-sm line-clamp-3 mb-4 flex-1">
          {listing.description}
        </p>

        {!!listing.nutritionalInfo && (
          <div className="flex flex-wrap gap-2 mb-4">
            {(listing.nutritionalInfo as any).calories && (
              <Badge variant="outline" className="text-[10px] px-2 py-0.5 bg-orange-50 text-orange-700 border-orange-200">
                {(listing.nutritionalInfo as any).calories} kcal
              </Badge>
            )}
            {(listing.nutritionalInfo as any).protein && (
              <Badge variant="outline" className="text-[10px] px-2 py-0.5 bg-blue-50 text-blue-700 border-blue-200">
                Protein: {(listing.nutritionalInfo as any).protein} g
              </Badge>
            )}
            {(listing.nutritionalInfo as any).carbs && (
              <Badge variant="outline" className="text-[10px] px-2 py-0.5 bg-yellow-50 text-yellow-700 border-yellow-200">
                Carbs: {(listing.nutritionalInfo as any).carbs} g
              </Badge>
            )}
          </div>
        )}

        <div className="grid grid-cols-2 gap-4 mb-6 py-4 border-y border-border/50">
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-1">Quantity</p>
            <p className="font-medium text-foreground">{listing.quantity} portions</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-1">Pickup Time</p>
            <p className="font-medium text-foreground">{listing.pickupWindow}</p>
          </div>
        </div>

        <div className="flex items-end justify-between mt-auto">
          <div>
            {listing.isDonation ? (
              <p className="text-2xl font-bold text-primary">$0.00</p>
            ) : (
              <>
                <p className="text-sm text-muted-foreground line-through">${Number(listing.originalPrice).toFixed(2)}</p>
                <p className="text-2xl font-bold text-foreground">${Number(listing.currentPrice).toFixed(2)}</p>
              </>
            )}
          </div>

          {!showProviderControls ? (
            isClaimed ? (
              listing.claimerId === user?.id ? (
                <div className="text-right">
                  <p className="text-xs text-muted-foreground mb-1">Your Claim Code</p>
                  <Badge variant="outline" className="text-lg px-3 py-1 bg-emerald-50 text-emerald-700 border-emerald-200">
                    <Ticket className="w-4 h-4 mr-2" />
                    {listing.claimCode}
                  </Badge>
                </div>
              ) : (
                <Badge variant="secondary" className="px-4 py-2 text-sm bg-gray-100 text-gray-500 hover:bg-gray-100">
                  <ShieldCheck className="w-4 h-4 mr-2" /> Reserved
                </Badge>
              )
            ) : !user ? (
              <Button
                onClick={(e) => {
                  e.stopPropagation();
                  router.push('/auth');
                }}
                className="rounded-xl shadow-md shadow-primary/20 hover:shadow-lg transition-all"
              >
                Sign In to Claim
              </Button>
            ) : (
              <Button
                onClick={(e) => {
                  e.stopPropagation();
                  claimMutation.mutate(listing.id);
                }}
                disabled={!canClaim || claimMutation.isPending}
                className="rounded-xl shadow-md shadow-primary/20 hover:shadow-lg transition-all"
              >
                {claimMutation.isPending ? "Claiming..." : "Claim Now"}
              </Button>
            )
          ) : (
            <Badge variant={listing.status === 'Available' ? "outline" : "secondary"} className="px-3 py-1">
              Status: {listing.status}
            </Badge>
          )}
        </div>
      </div>
    </div>
  );
}
