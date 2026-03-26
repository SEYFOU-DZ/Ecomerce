import { NextResponse } from "next/server";

// Clears the frontend-domain token cookie on logout
export async function POST() {
  const response = NextResponse.json({ ok: true });

  response.cookies.set("token", "", {
    httpOnly: false,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 0,
    path: "/",
  });

  return response;
}
