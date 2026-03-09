import { NextResponse } from "next/server";
import { cookies } from "next/headers";

type Props = {
  params: Promise<{ id: string }> | { id: string };
};

function extractFilename(contentDisposition: string | null): string {
  if (!contentDisposition) {
    return "orcamento.pdf";
  }

  const match = contentDisposition.match(/filename=\"?([^\";]+)\"?/i);
  return match?.[1] || "orcamento.pdf";
}

export async function GET(request: Request, { params }: Props) {
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

  const { id } = await Promise.resolve(params);

  const response = await fetch(`${apiUrl}/orcamentos/${id}/pdf/`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    cache: "no-store",
  });

  if (!response.ok) {
    const message = await response.text();
    return NextResponse.json(
      { error: message || "Falha ao exportar PDF" },
      { status: response.status }
    );
  }

  const pdfBuffer = await response.arrayBuffer();
  const preview = new URL(request.url).searchParams.get("preview") === "1";
  const filename = extractFilename(response.headers.get("content-disposition"));
  const contentDisposition = preview
    ? `inline; filename="${filename}"`
    : `attachment; filename="${filename}"`;

  return new NextResponse(pdfBuffer, {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": contentDisposition,
    },
  });
}
