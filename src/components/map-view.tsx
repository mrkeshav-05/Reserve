"use client";
import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import type { FoodListing, User } from "@shared/schema";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin } from "lucide-react";
import { formatDistanceToNow, isPast } from "date-fns";

// Fix leaflet default icons
const customIcon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// A green version of the icon for donations
const greenIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

interface MapViewProps {
  listings: (FoodListing & { provider: User })[];
  onClaim?: (id: number) => void;
  userRole?: string;
}

export function MapView({ listings, onClaim, userRole }: MapViewProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return <div className="w-full h-[600px] bg-muted animate-pulse rounded-2xl" />;

  // Default to a central coordinate if no listings have location, e.g. London or New York
  const defaultCenter: [number, number] = [40.7128, -74.0060];

  const validListings = listings.filter(l => 
    l.provider.locationLat && l.provider.locationLng && l.status === "Available" && !isPast(new Date(l.expiryTimestamp))
  );

  const center = validListings.length > 0 
    ? [Number(validListings[0].provider.locationLat), Number(validListings[0].provider.locationLng)] as [number, number]
    : defaultCenter;

  return (
    <div className="w-full h-[600px] rounded-2xl overflow-hidden shadow-xl border border-border/50">
      <MapContainer center={center} zoom={13} scrollWheelZoom={false} style={{ height: "100%", width: "100%" }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {validListings.map((listing) => (
          <Marker 
            key={listing.id} 
            position={[Number(listing.provider.locationLat), Number(listing.provider.locationLng)]}
            icon={listing.isDonation ? greenIcon : customIcon}
          >
            <Popup className="rounded-xl">
              <div className="p-1 max-w-[200px]">
                <h4 className="font-bold text-base mb-1">{listing.title}</h4>
                <p className="text-sm text-muted-foreground flex items-center gap-1 mb-2">
                  <MapPin className="w-3 h-3" /> {listing.provider.name}
                </p>
                <div className="flex items-center justify-between mb-3">
                  <Badge variant={listing.isDonation ? "default" : "secondary"}>
                    {listing.isDonation ? "Free" : `$${Number(listing.currentPrice).toFixed(2)}`}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    Ends {formatDistanceToNow(new Date(listing.expiryTimestamp))}
                  </span>
                </div>
                {userRole !== "Provider" && (
                  <Button 
                    size="sm" 
                    className="w-full h-8"
                    onClick={() => onClaim?.(listing.id)}
                  >
                    Claim
                  </Button>
                )}
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
