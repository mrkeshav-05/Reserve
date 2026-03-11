import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { getUserByEmail, createUser } from "@/lib/storage";
import { insertUserSchema } from "@shared/schema";
import { z } from "zod";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const input = insertUserSchema.parse(body);
    
    const existing = await getUserByEmail(input.email);
    if (existing) {
      return NextResponse.json({ message: "Email already in use" }, { status: 400 });
    }
    
    const user = await createUser(input);
    const session = await getSession();
    session.userId = user.id;
    await session.save();
    
    return NextResponse.json(user, { status: 201 });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ message: err.errors[0].message }, { status: 400 });
    }
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
