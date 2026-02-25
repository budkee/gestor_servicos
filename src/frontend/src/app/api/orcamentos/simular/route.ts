import { NextResponse } from "next/server";
import { cookies } from "next/headers";

const API_URL = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL;

if (!API_URL) {
  throw new Error("API_URL env var is not set");
}

export async function POST(request: Request) {
  const cookieStore = await cookies();
  const token = cookieStore.get("access_token")?.value;

  if (!token) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  const payload = await request.json();

  const response = await fetch(`${API_URL}/orcamentos/api/simular/`, {
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
