import { NextResponse } from "next/server";
import { getListings, createListing, updateListing, getUser } from "@/lib/storage";
import { getSession } from "@/lib/session";
import { insertFoodListingSchema } from "@shared/schema";
import { z } from "zod";

function calculateDynamicPrice(originalPrice: number, expiry: Date): number {
  const now = new Date();
  const msLeft = expiry.getTime() - now.getTime();
  const hoursLeft = msLeft / (1000 * 60 * 60);

  if (hoursLeft <= 0.5) return originalPrice * 0.4;
  if (hoursLeft <= 1) return originalPrice * 0.6;
  if (hoursLeft <= 2) return originalPrice * 0.8;
  return originalPrice;
}

export async function GET() {
  const listings = await getListings();
  const now = new Date();
  
  const updatedListings = await Promise.all(listings.map(async (l) => {
    if (l.status === 'Available' && new Date(l.expiryTimestamp) < now) {
      l.status = 'Expired';
      await updateListing(l.id, { status: 'Expired' });
    } else if (l.status === 'Available' && !l.isDonation) {
      const newPrice = calculateDynamicPrice(parseFloat(l.originalPrice?.toString() || "0"), new Date(l.expiryTimestamp));
      l.currentPrice = newPrice.toFixed(2);
    }
    return l;
  }));

  return NextResponse.json(updatedListings);
}

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session.userId) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    
    const user = await getUser(session.userId);
    if (user?.role !== 'Provider') {
      return NextResponse.json({ message: "Only providers can create listings" }, { status: 401 });
    }
    
    const body = await req.json();
    const input = insertFoodListingSchema.parse(body);
    
    const listing = await createListing({
      ...input,
      providerId: user.id
    });
    
    return NextResponse.json(listing, { status: 201 });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ message: err.errors[0].message }, { status: 400 });
    }
    return NextResponse.json({ message: "Internal error" }, { status: 500 });
  }
}
