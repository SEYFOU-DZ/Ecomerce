import { NextResponse } from "next/server";

// This API route receives the JWT token from the client after a successful login
// and stores it in a frontend-domain cookie readable by middleware.js
export async function POST(request) {
  try {
    const { token } = await request.json();

    if (!token) {
      return NextResponse.json({ error: "Token required" }, { status: 400 });
    }

    const response = NextResponse.json({ ok: true });

    // Store as a non-httpOnly cookie so Next.js middleware can read it
    // (middleware cannot read httpOnly cookies set by a different domain)
    response.cookies.set("token", token, {
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days (will be refreshed automatically)
      path: "/",
    });

    return response;
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
