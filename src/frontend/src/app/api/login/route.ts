import { NextResponse } from "next/server";
import { resolveServerApiUrl } from "@/lib/server-api-url";

export async function POST(request: Request) {
  const apiUrl = resolveServerApiUrl();
  if (!apiUrl) {
    return NextResponse.json(
      { error: "API_URL env var is not set" },
      { status: 500 }
    );
  }

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

  const response = await fetch(`${apiUrl}/token/`, {
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
