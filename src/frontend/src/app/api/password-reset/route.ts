import { NextResponse } from "next/server";

const API_URL = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL;

if (!API_URL) {
  throw new Error("API_URL env var is not set");
}

export async function POST(request: Request) {
  const contentType = request.headers.get("content-type") || "";

  let email = "";

  if (contentType.includes("application/json")) {
    const body = await request.json();
    email = body.email || "";
  } else {
    const formData = await request.formData();
    email = String(formData.get("email") || "");
  }

  if (!email) {
    return NextResponse.json({ error: "Email invalido" }, { status: 400 });
  }

  const response = await fetch(`${API_URL}/auth/password-reset/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });

  if (!response.ok) {
    const message = await response.text();
    return NextResponse.json(
      { error: message || "Falha ao enviar link" },
      { status: response.status }
    );
  }

  if (contentType.includes("application/json")) {
    return NextResponse.json({ ok: true });
  }

  return NextResponse.redirect(new URL("/login", request.url));
}
