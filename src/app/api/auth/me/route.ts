import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { getUser } from "@/lib/storage";

export async function GET() {
  const session = await getSession();
  
  if (!session.userId) {
    return NextResponse.json({ message: "Not logged in" }, { status: 401 });
  }
  
  const user = await getUser(session.userId);
  if (!user) {
    return NextResponse.json({ message: "User not found" }, { status: 404 });
  }
  
  return NextResponse.json(user);
}
