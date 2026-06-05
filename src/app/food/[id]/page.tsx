"use client";
import { useParams, useRouter } from "next/navigation";
import { useListing, useClaimListing } from "@/hooks/use-listings";
import { useAuth } from "@/hooks/use-auth";
import { Layout } from "@/components/layout";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Clock, MapPin, Ticket, ShieldCheck, Tag, Info } from "lucide-react";
import { formatDistanceToNow, isPast, format } from "date-fns";

export default function FoodDetailPage() {
  const { id } = useParams();
  const listingId = Number(id);
  const router = useRouter();

  const { data: listing, isLoading } = useListing(listingId);
  const { data: user } = useAuth();
  const claimMutation = useClaimListing();

  if (isLoading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8 max-w-5xl">
          <Skeleton className="w-32 h-10 mb-8 rounded-xl" />
          <div className="flex flex-col md:flex-row gap-8">
            <div className="w-full md:w-2/3">
              <Skeleton className="w-full h-[300px] rounded-3xl mb-8" />
              <Skeleton className="w-3/4 h-8 mb-4" />
              <Skeleton className="w-full h-24 mb-8" />
            </div>
            <div className="w-full md:w-1/3">
              <Skeleton className="w-full h-[400px] rounded-3xl" />
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!listing) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-24 text-center max-w-xl">
          <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
            <Tag className="w-10 h-10 text-muted-foreground opacity-50" />
          </div>
          <h1 className="text-3xl font-display font-bold mb-4">Listing Not Found</h1>
          <p className="text-muted-foreground mb-8 text-lg">
            This food listing might have been removed or the URL is incorrect.
          </p>
          <Button onClick={() => router.push("/")} size="lg" className="rounded-xl">
            Back to Available Food
          </Button>
        </div>
      </Layout>
    );
  }

  const expired = isPast(new Date(listing.expiryTimestamp));
  const isClaimed = listing.status === "Reserved" || listing.status === "Completed";
  const canClaim = !expired && !isClaimed && user && user.role !== "Provider";

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
  const imageUrl = `https://images.unsplash.com/photo-${imageId}?auto=format&fit=crop&q=80&w=1200`;

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="mb-6 -ml-4 text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-xl"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>

        <div className="flex flex-col lg:flex-row gap-10">
          {/* Main Content Column */}
          <div className="flex-1">
            {/* Hero Image Section */}
            <div
              className="relative h-[300px] md:h-[400px] rounded-3xl overflow-hidden mb-8 border border-border/50"
              style={{
                backgroundImage: `url(${imageUrl})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center'
              }}
            >
              {/* Dark overlay for text readability */}
              <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/20 to-black/60" />

              <div className="absolute inset-0 p-8 flex flex-col justify-between z-10">
                <div className="flex justify-between items-start">
                  <Badge variant={listing.isDonation ? "default" : "secondary"} className="shadow-sm text-sm px-4 py-1.5 rounded-full backdrop-blur-md bg-opacity-90">
                    {listing.isDonation ? "Donation (Free)" : `${discountPercent}% OFF`}
                  </Badge>

                  <div className="bg-white/90 backdrop-blur-md px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2 shadow-sm text-emerald-800">
                    <Clock className="w-4 h-4" />
                    {expired ? "Expired" : `Expires ${formatDistanceToNow(new Date(listing.expiryTimestamp), { addSuffix: true })}`}
                  </div>
                </div>
              </div>
            </div>

            <h1 className="text-4xl md:text-5xl font-display font-bold text-foreground mb-4">
              {listing.title}
            </h1>

            <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
              {listing.description}
            </p>

            {/* Nutritional Info */}
            {!!listing.nutritionalInfo && (
              <div className="bg-white rounded-2xl p-6 border border-border/50 mb-8 shadow-sm">
                <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <Info className="w-5 h-5 text-orange-500" />
                  Estimated Nutritional Value (per 100g)
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {(listing.nutritionalInfo as any).calories && (
                    <div className="bg-orange-50 rounded-xl p-4 text-center border border-orange-100">
                      <p className="text-sm text-orange-600/80 font-medium mb-1">Calories</p>
                      <p className="text-2xl font-bold text-orange-700">{(listing.nutritionalInfo as any).calories} <span className="text-base font-normal text-orange-600">kcal</span></p>
                    </div>
                  )}
                  {(listing.nutritionalInfo as any).protein && (
                    <div className="bg-blue-50 rounded-xl p-4 text-center border border-blue-100">
                      <p className="text-sm text-blue-600/80 font-medium mb-1">Protein</p>
                      <p className="text-2xl font-bold text-blue-700">{(listing.nutritionalInfo as any).protein} <span className="text-base font-normal text-blue-600">g</span></p>
                    </div>
                  )}
                  {(listing.nutritionalInfo as any).carbs && (
                    <div className="bg-yellow-50 rounded-xl p-4 text-center border border-yellow-100">
                      <p className="text-sm text-yellow-600/80 font-medium mb-1">Carbs</p>
                      <p className="text-2xl font-bold text-yellow-700">{(listing.nutritionalInfo as any).carbs} <span className="text-base font-normal text-yellow-600">g</span></p>
                    </div>
                  )}
                  {(listing.nutritionalInfo as any).fats && (
                    <div className="bg-emerald-50 rounded-xl p-4 text-center border border-emerald-100">
                      <p className="text-sm text-emerald-600/80 font-medium mb-1">Fats</p>
                      <p className="text-2xl font-bold text-emerald-700">{(listing.nutritionalInfo as any).fats} <span className="text-base font-normal text-emerald-600">g</span></p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Provider and Location Details */}
            <div className="bg-muted/30 rounded-2xl p-6 border border-border/50">
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-primary" />
                Pickup Location
              </h3>
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-white rounded-2xl shadow-sm border border-border flex items-center justify-center text-2xl font-bold text-primary">
                  {listing.provider.name.charAt(0)}
                </div>
                <div>
                  <p className="font-semibold text-lg">{listing.provider.name}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Sticky Sidebar */}
          <div className="w-full lg:w-[380px]">
            <div className="sticky top-24 bg-card rounded-3xl p-8 border border-border shadow-xl shadow-emerald-500/5">

              <div className="mb-8">
                {listing.isDonation ? (
                  <p className="text-5xl font-bold text-primary">$0.00</p>
                ) : (
                  <div className="flex items-end gap-3 flex-wrap">
                    <p className="text-4xl font-bold text-foreground">
                      ${Number(listing.currentPrice).toFixed(2)}
                    </p>
                    <p className="text-lg text-muted-foreground line-through mb-1">
                      ${Number(listing.originalPrice).toFixed(2)}
                    </p>
                  </div>
                )}
                <p className="text-sm text-muted-foreground mt-2 font-medium">
                  {listing.quantity} portion{listing.quantity !== 1 && 's'} available
                </p>
              </div>

              <div className="space-y-4 mb-8">
                <div className="flex items-start gap-3 p-4 bg-muted/50 rounded-2xl">
                  <Clock className="w-5 h-5 text-primary mt-0.5" />
                  <div>
                    <p className="font-semibold text-sm">Pickup Window</p>
                    <p className="text-foreground">{listing.pickupWindow}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 bg-muted/50 rounded-2xl">
                  <ShieldCheck className="w-5 h-5 text-emerald-500 mt-0.5" />
                  <div>
                    <p className="font-semibold text-sm">Quality Checked</p>
                    <p className="text-muted-foreground text-sm">This food meets our safety and quality standards.</p>
                  </div>
                </div>
              </div>

              {/* Action Area */}
              {!user ? (
                <Button className="w-full py-6 text-lg rounded-xl shadow-lg shadow-primary/20" onClick={() => router.push("/auth")}>
                  Sign In to Claim
                </Button>
              ) : isClaimed ? (
                listing.claimerId === user.id ? (
                  <div className="text-center p-6 bg-emerald-50/50 rounded-2xl border border-emerald-100">
                    <p className="text-emerald-800 font-semibold mb-2">Claimed Successfully</p>
                    <p className="text-sm text-emerald-600/80 mb-4">Show this code to the provider when picking up your food.</p>
                    <Badge variant="outline" className="text-2xl px-6 py-3 bg-white text-emerald-700 border-emerald-200">
                      <Ticket className="w-6 h-6 mr-3" />
                      {listing.claimCode}
                    </Badge>
                  </div>
                ) : (
                  <div className="text-center p-6 bg-muted/50 rounded-2xl border border-border/50">
                    <p className="font-semibold text-muted-foreground flex items-center justify-center gap-2">
                      <ShieldCheck className="w-5 h-5" /> Already Reserved
                    </p>
                    <p className="text-sm text-muted-foreground/80 mt-2">Someone else beat you to this one!</p>
                  </div>
                )
              ) : (
                <Button
                  onClick={() => claimMutation.mutate(listing.id)}
                  disabled={!canClaim || claimMutation.isPending}
                  className="w-full py-6 text-lg rounded-xl shadow-xl shadow-primary/20 hover:shadow-primary/30 hover:-translate-y-0.5 transition-all text-white"
                >
                  {claimMutation.isPending ? "Claiming..." : "Claim This Food Now"}
                </Button>
              )}

              {expired && !isClaimed && (
                <div className="mt-4 text-center">
                  <p className="text-red-500 font-medium text-sm">This listing has expired.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
