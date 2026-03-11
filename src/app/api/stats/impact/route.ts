import { NextResponse } from "next/server";
import { getListings } from "@/lib/storage";

export async function GET() {
  const listings = await getListings();
  const claimed = listings.filter(l => l.status === 'Reserved' || l.status === 'Completed');
  
  const mealsSaved = claimed.reduce((sum, l) => sum + l.quantity, 0);
  const co2Offset = mealsSaved * 2.5;

  return NextResponse.json({ mealsSaved, co2Offset });
}
