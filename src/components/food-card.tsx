import { format, formatDistanceToNow, isPast } from "date-fns";
import { Clock, MapPin, Tag, ShieldCheck, Ticket } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useClaimListing } from "@/hooks/use-listings";
import { useAuth } from "@/hooks/use-auth";
import type { FoodListing, User } from "@shared/schema";

interface FoodCardProps {
  listing: FoodListing & { provider: User };
  showProviderControls?: boolean;
}

export function FoodCard({ listing, showProviderControls = false }: FoodCardProps) {
  const { data: user } = useAuth();
  const claimMutation = useClaimListing();

  const expired = isPast(new Date(listing.expiryTimestamp));
  const isClaimed = listing.status === "Reserved" || listing.status === "Completed";
  
  // Calculate dynamic price based on time to expiry (mock logic, actual should be in backend)
  // But we render whatever the backend sent as currentPrice
  const discountPercent = Math.round(
    ((Number(listing.originalPrice) - Number(listing.currentPrice)) / Number(listing.originalPrice)) * 100
  );

  const canClaim = !expired && !isClaimed && user && user.role !== "Provider";

  return (
    <div className={`
      relative group bg-card rounded-2xl overflow-hidden
      border border-border/50 transition-all duration-300
      hover:shadow-xl hover:shadow-emerald-500/5 hover:-translate-y-1
      flex flex-col h-full
      ${expired ? 'opacity-75 grayscale-[0.5]' : ''}
    `}>
      {/* Image / Header area */}
      <div className="h-48 bg-gradient-to-br from-emerald-50 to-emerald-100/50 p-6 flex flex-col justify-between relative overflow-hidden">
        {/* Decorative background shapes */}
        <div className="absolute -top-12 -right-12 w-40 h-40 bg-primary/5 rounded-full blur-2xl" />
        <div className="absolute -bottom-12 -left-12 w-32 h-32 bg-primary/10 rounded-full blur-2xl" />

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
          <h3 className="text-xl font-display font-bold text-foreground line-clamp-2">{listing.title}</h3>
          <p className="text-muted-foreground flex items-center gap-1.5 text-sm mt-2">
            <MapPin className="w-4 h-4" />
            {listing.provider.name}
          </p>
        </div>
      </div>

      <div className="p-6 flex-1 flex flex-col">
        <p className="text-muted-foreground text-sm line-clamp-3 mb-6 flex-1">
          {listing.description}
        </p>

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
            ) : (
              <Button 
                onClick={() => claimMutation.mutate(listing.id)}
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
