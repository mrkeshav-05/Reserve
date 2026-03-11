"use client";
import { useState } from "react";
import { Layout } from "@/components/layout";
import { ImpactStats } from "@/components/impact-stats";
import { FoodCard } from "@/components/food-card";
import dynamic from "next/dynamic";

const MapView = dynamic(() => import('@/components/map-view').then(mod => mod.MapView), { 
  ssr: false, 
  loading: () => <div className="w-full h-[600px] bg-muted animate-pulse rounded-2xl" /> 
});

import { useListings, useClaimListing } from "@/hooks/use-listings";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Map, Grid2X2, Filter } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function Home() {
  const { data: listings, isLoading } = useListings();
  const { data: user } = useAuth();
  const claimMutation = useClaimListing();

  const [filter, setFilter] = useState<"all" | "free" | "discount">("all");

  const filteredListings = listings?.filter(l => {
    if (filter === "free") return l.isDonation;
    if (filter === "discount") return !l.isDonation;
    return true;
  }) || [];

  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative py-16 md:py-24 rounded-3xl overflow-hidden mb-16 bg-emerald-900 text-white">
        {/* Abstract background blobs */}
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-emerald-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-primary/30 rounded-full blur-3xl translate-y-1/3 -translate-x-1/4" />
        
        <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center text-center">
          <Badge className="bg-emerald-800 text-emerald-100 hover:bg-emerald-700 mb-6 px-4 py-1.5 rounded-full border border-emerald-600/50 backdrop-blur-sm shadow-sm">
            🌱 Join the zero-waste movement
          </Badge>
          <h1 className="text-5xl md:text-7xl font-display font-bold max-w-4xl tracking-tight leading-tight mb-8">
            Rescue Delicious Food. <span className="text-emerald-400">Save the Planet.</span>
          </h1>
          <p className="text-xl text-emerald-100/80 max-w-2xl mb-12">
            Connect with local restaurants and grocery stores to claim surplus food at massive discounts or for free.
          </p>
          
          <ImpactStats />
        </div>
      </section>

      {/* Main Feed Section */}
      <section className="pb-24">
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
          <div>
            <h2 className="text-3xl font-display font-bold text-foreground">Available Food Near You</h2>
            <p className="text-muted-foreground mt-1">Grab these deals before they expire</p>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto bg-white p-2 rounded-2xl shadow-sm border border-border/50">
            <Tabs defaultValue="grid" className="w-full md:w-[200px]">
              <TabsList className="grid w-full grid-cols-2 h-11 p-1 bg-muted/50 rounded-xl">
                <TabsTrigger value="grid" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">
                  <Grid2X2 className="w-4 h-4 mr-2" /> Grid
                </TabsTrigger>
                <TabsTrigger value="map" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">
                  <Map className="w-4 h-4 mr-2" /> Map
                </TabsTrigger>
              </TabsList>

              <div className="hidden"> {/* We extract the state indirectly, but better to render conditionally below */}</div>
            </Tabs>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="h-11 rounded-xl border-border bg-white text-foreground">
                  <Filter className="w-4 h-4 mr-2" />
                  Filter
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 rounded-xl p-2">
                <DropdownMenuCheckboxItem 
                  checked={filter === "all"} 
                  onCheckedChange={() => setFilter("all")}
                >
                  All Food
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem 
                  checked={filter === "free"} 
                  onCheckedChange={() => setFilter("free")}
                >
                  Donations (Free)
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem 
                  checked={filter === "discount"} 
                  onCheckedChange={() => setFilter("discount")}
                >
                  Discounted Deals
                </DropdownMenuCheckboxItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1,2,3,4,5,6].map(i => (
              <Skeleton key={i} className="h-[400px] rounded-2xl w-full" />
            ))}
          </div>
        ) : filteredListings.length === 0 ? (
          <div className="text-center py-24 bg-card rounded-3xl border border-border/50 shadow-sm">
            <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <Map className="w-10 h-10 text-muted-foreground opacity-50" />
            </div>
            <h3 className="text-2xl font-display font-bold text-foreground mb-2">No food listings found</h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              We couldn't find any available food matching your current filters. Check back later or adjust your filters.
            </p>
            <Button variant="outline" className="mt-6 rounded-xl" onClick={() => setFilter("all")}>
              Clear Filters
            </Button>
          </div>
        ) : (
          <Tabs defaultValue="grid" className="w-full">
            {/* Using Tabs to handle the view switching cleanly */}
            <TabsContent value="grid" className="mt-0 outline-none">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredListings.map(listing => (
                  <FoodCard key={listing.id} listing={listing} />
                ))}
              </div>
            </TabsContent>
            <TabsContent value="map" className="mt-0 outline-none">
              <MapView 
                listings={filteredListings} 
                userRole={user?.role}
                onClaim={(id) => claimMutation.mutate(id)}
              />
            </TabsContent>
          </Tabs>
        )}
      </section>
    </Layout>
  );
}

// Inline fallback Badge since not imported everywhere correctly yet
function Badge({ children, className, variant = "default" }: any) {
  return <span className={className}>{children}</span>;
}
