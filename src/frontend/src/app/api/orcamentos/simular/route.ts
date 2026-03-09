import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST(request: Request) {
  const apiUrl = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL;
  if (!apiUrl) {
    return NextResponse.json(
      { error: "API_URL env var is not set" },
      { status: 500 }
    );
  }

  const cookieStore = await cookies();
  const token = cookieStore.get("access_token")?.value;

  if (!token) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  const payload = await request.json();

  const response = await fetch(`${apiUrl}/orcamentos/api/simular/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
    cache: "no-store",
  });

  if (!response.ok) {
    const message = await response.text();
    return NextResponse.json(
      { error: message || "Falha ao simular" },
      { status: response.status }
    );
  }

  const data = await response.json();
  return NextResponse.json(data);
}
