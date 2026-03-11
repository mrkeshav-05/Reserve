import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { getUserByEmail } from "@/lib/storage";
import { z } from "zod";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string()
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, password } = loginSchema.parse(body);
    
    const user = await getUserByEmail(email);
    if (!user || user.password !== password) {
      return NextResponse.json({ message: "Invalid credentials" }, { status: 401 });
    }
    
    const session = await getSession();
    session.userId = user.id;
    await session.save();
    
    return NextResponse.json(user);
  } catch (err) {
    return NextResponse.json({ message: "Invalid input" }, { status: 400 });
  }
}
