import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { getUserByEmail, createUser } from "@/lib/storage";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");

  if (!code) {
    return NextResponse.redirect(new URL("/login?error=OAuthCodeMissing", req.url));
  }

  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const redirectUri = "http://localhost:5001";

  try {
    // 1. Exchange code for access token
    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: clientId!,
        client_secret: clientSecret!,
        code,
        grant_type: "authorization_code",
        redirect_uri: redirectUri,
      }),
    });

    const tokenData = await tokenResponse.json();
    if (!tokenResponse.ok) throw new Error(tokenData.error_description || "Failed to fetch token");

    // 2. Get user info
    const userResponse = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });

    const userData = await userResponse.json();
    if (!userResponse.ok) throw new Error("Failed to fetch user data");

    // 3. Find or Create User
    let dbUser = await getUserByEmail(userData.email);

    if (!dbUser) {
      dbUser = await createUser({
        email: userData.email,
        name: userData.name || "Google User",
        role: "Individual", // Default role for Google Sign Ins
      });
    }

    // 4. Set Session
    const session = await getSession();
    session.userId = dbUser.id;
    await session.save();

    // 5. Redirect to Dashboard or Home
    return NextResponse.redirect(new URL("/", req.url));

  } catch (error) {
    console.error("Google OAuth Error:", error);
    return NextResponse.redirect(new URL("/login?error=OAuthFailed", req.url));
  }
}
