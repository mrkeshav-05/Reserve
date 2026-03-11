import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { getListing, updateListing, getUser } from "@/lib/storage";
import crypto from "crypto";

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session.userId) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const user = await getUser(session.userId);
  if (user?.role === 'Provider') {
    return NextResponse.json({ message: "Providers cannot claim food" }, { status: 401 });
  }

  const id = parseInt(params.id);
  if (isNaN(id)) return NextResponse.json({ message: "Invalid ID" }, { status: 400 });

  const listing = await getListing(id);
  if (!listing) return NextResponse.json({ message: "Not found" }, { status: 404 });
  if (listing.status !== 'Available') return NextResponse.json({ message: "Listing not available" }, { status: 400 });

  const claimCode = crypto.randomBytes(3).toString('hex').toUpperCase(); 
  
  const updated = await updateListing(listing.id, {
    status: 'Reserved',
    claimerId: user!.id,
    claimCode
  });

  return NextResponse.json(updated);
}
