import { NextResponse } from "next/server";
import { getListing } from "@/lib/storage";

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const id = parseInt(params.id);
  if (isNaN(id)) return NextResponse.json({ message: "Invalid ID" }, { status: 400 });

  const listing = await getListing(id);
  if (!listing) return NextResponse.json({ message: "Not found" }, { status: 404 });
  
  return NextResponse.json(listing);
}
