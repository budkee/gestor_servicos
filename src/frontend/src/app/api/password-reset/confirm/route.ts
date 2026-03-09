import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const apiUrl = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL;
  if (!apiUrl) {
    return NextResponse.json(
      { error: "API_URL env var is not set" },
      { status: 500 }
    );
  }

  const contentType = request.headers.get("content-type") || "";

  let uid = "";
  let token = "";
  let password = "";

  if (contentType.includes("application/json")) {
    const body = await request.json();
    uid = body.uid || "";
    token = body.token || "";
    password = body.password || "";
  } else {
    const formData = await request.formData();
    uid = String(formData.get("uid") || "");
    token = String(formData.get("token") || "");
    password = String(formData.get("password") || "");
  }

  if (!uid || !token || !password) {
    return NextResponse.json(
      { error: "Dados invalidos para redefinicao" },
      { status: 400 }
    );
  }

  const response = await fetch(`${apiUrl}/auth/password-reset/confirm/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ uid, token, password }),
  });

  if (!response.ok) {
    const message = await response.text();
    return NextResponse.json(
      { error: message || "Falha ao redefinir senha" },
      { status: response.status }
    );
  }

  if (contentType.includes("application/json")) {
    return NextResponse.json({ ok: true });
  }

  return NextResponse.redirect(new URL("/login", request.url));
}
