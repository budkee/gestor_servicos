import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const res = NextResponse.redirect(new URL("/login", request.url));

  res.cookies.set("access_token", "", {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });

  res.cookies.set("refresh_token", "", {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });

  return res;
}
