import { NextResponse } from "next/server";

const API_URL = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL;

if (!API_URL) {
  throw new Error("API_URL env var is not set");
}

export async function POST(request: Request) {
  const contentType = request.headers.get("content-type") || "";

  let username = "";
  let password = "";

  if (contentType.includes("application/json")) {
    const body = await request.json();
    username = body.username || "";
    password = body.password || "";
  } else {
    const formData = await request.formData();
    username = String(formData.get("username") || "");
    password = String(formData.get("password") || "");
  }

  if (!username || !password) {
    return NextResponse.json(
      { error: "Credenciais invalidas" },
      { status: 400 }
    );
  }

  const response = await fetch(`${API_URL}/token/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });

  if (!response.ok) {
    const message = await response.text();
    return NextResponse.json(
      { error: message || "Falha no login" },
      { status: response.status }
    );
  }

  const data = await response.json();
  const res = contentType.includes("application/json")
    ? NextResponse.json({ ok: true })
    : NextResponse.redirect(new URL("/orcamentos", request.url));

  const isProduction = process.env.NODE_ENV === "production";

  if (data.access) {
    res.cookies.set("access_token", data.access, {
      httpOnly: true,
      secure: isProduction,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60,
    });
  }

  if (data.refresh) {
    res.cookies.set("refresh_token", data.refresh, {
      httpOnly: true,
      secure: isProduction,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24,
    });
  }

  return res;
}
