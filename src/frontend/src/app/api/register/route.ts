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

  let fullName = "";
  let username = "";
  let email = "";
  let password = "";

  if (contentType.includes("application/json")) {
    const body = await request.json();
    fullName = body.full_name || body.fullName || "";
    username = body.username || "";
    email = body.email || "";
    password = body.password || "";
  } else {
    const formData = await request.formData();
    fullName = String(formData.get("full_name") || "");
    username = String(formData.get("username") || "");
    email = String(formData.get("email") || "");
    password = String(formData.get("password") || "");
  }

  if (!fullName || !username || !email || !password) {
    return NextResponse.json(
      { error: "Dados invalidos" },
      { status: 400 }
    );
  }

  const response = await fetch(`${apiUrl}/auth/register/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ full_name: fullName, username, email, password }),
  });

  if (!response.ok) {
    const message = await response.text();
    return NextResponse.json(
      { error: message || "Falha no cadastro" },
      { status: response.status }
    );
  }

  if (!contentType.includes("application/json")) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.json({ ok: true });
}
