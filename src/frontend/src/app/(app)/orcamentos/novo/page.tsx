import Link from "next/link";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { criarOrcamento } from "@/services/orcamentos";
import { OrcamentoItensCard } from "@/components/orcamento-itens-card";
import { OrcamentoPagamentoCard } from "@/components/orcamento-pagamento-card";

type Props = {
  searchParams: Promise<{ erro?: string }>;
};

async function criarOrcamentoAction(formData: FormData) {
  "use server";

  const itensJson = String(formData.get("itens_json") || "[]");
  const tipoServico = String(formData.get("tipo_servico"));
  const desconto = String(formData.get("desconto_percentual") || "0");
  const clienteNome = String(formData.get("cliente_nome") || "").trim();
  const cpfCnpj = String(formData.get("cpf_cnpj") || "").trim();
  const celularWpp = String(formData.get("celular_wpp") || "").trim();
  const email = String(formData.get("email") || "").trim();
  const instagram = String(formData.get("instagram") || "").trim();
  const facebook = String(formData.get("facebook") || "").trim();
  const pagamentoForma = String(formData.get("pagamento_forma_pagamento") || "");
  const pagamentoPrazo = String(formData.get("pagamento_prazo_entrega") || "").trim();
  const pagamentoDescontoPercentual = String(formData.get("pagamento_desconto_percentual") || "").trim();

  let itens: Array<{
    tipo: "ORCAMENTO" | "CONFECCAO" | "AJUSTE";
    descricao: string;
    quantidade: number;
    preco_unitario: string;
  }> = [];
  try {
    const parsed = JSON.parse(itensJson);
    if (!Array.isArray(parsed)) throw new Error("itens_invalidos");
    itens = parsed.map((item) => {
      const tipoItem = String(item.tipo || "");
      const quantidade = Number(item.quantidade);
      const precoUnitario = Number(item.preco_unitario || 0);
      if (!["ORCAMENTO", "CONFECCAO", "AJUSTE"].includes(tipoItem)) {
        throw new Error("item_tipo_invalido");
      }
      if (!Number.isFinite(quantidade) || !Number.isInteger(quantidade) || quantidade < 1) {
        throw new Error("item_quantidade_invalida");
      }
      if (!Number.isFinite(precoUnitario) || precoUnitario < 0) {
        throw new Error("item_preco_invalido");
      }

      return {
        tipo: tipoItem as "ORCAMENTO" | "CONFECCAO" | "AJUSTE",
        descricao: String(item.descricao || "").trim(),
        quantidade,
        preco_unitario: precoUnitario.toFixed(2),
      };
    });
  } catch {
    redirect("/orcamentos/novo?erro=1");
  }

  if (!["ORCAMENTO", "CONFECCAO", "AJUSTE"].includes(tipoServico)) {
    redirect("/orcamentos/novo?erro=1");
  }

  if (itens.length === 0 || itens.some((item) => !item.descricao)) {
    redirect("/orcamentos/novo?erro=1");
  }

  if (!["PIX", "DINHEIRO", "CREDITO", "DEBITO"].includes(pagamentoForma) || !pagamentoPrazo) {
    redirect("/orcamentos/novo?erro=1");
  }

  const descontoPagamentoNumero = pagamentoDescontoPercentual === "" ? Number(desconto) : Number(pagamentoDescontoPercentual);
  if (!Number.isFinite(descontoPagamentoNumero) || descontoPagamentoNumero < 0 || descontoPagamentoNumero > 100) {
    redirect("/orcamentos/novo?erro=1");
  }

  try {
    const novo = await criarOrcamento({
      tipo: tipoServico as "ORCAMENTO" | "CONFECCAO" | "AJUSTE",
      tipo_servico: tipoServico as "ORCAMENTO" | "CONFECCAO" | "AJUSTE",
      itens: itens.map((item) => ({
        tipo: item.tipo,
        descricao: item.descricao,
        quantidade: item.quantidade,
        preco_unitario: item.preco_unitario,
      })),
      desconto_percentual: Number(desconto),
      cliente_nome: clienteNome,
      cpf_cnpj: cpfCnpj,
      celular_wpp: celularWpp,
      email,
      instagram,
      facebook,
      pagamento: {
        forma_pagamento: pagamentoForma as "PIX" | "DINHEIRO" | "CREDITO" | "DEBITO",
        prazo_entrega: pagamentoPrazo,
        desconto_percentual: descontoPagamentoNumero,
      },
    });

    revalidatePath("/orcamentos");
    redirect(`/orcamentos/${novo.id}?status=criado`);
  } catch {
    redirect("/orcamentos/novo?erro=1");
  }
}

export default async function NovoOrcamentoPage({ searchParams }: Props) {
  const query = await searchParams;
  const hasError = query.erro === "1";

  return (
    <form action={criarOrcamentoAction} className="flex w-full max-w-none flex-col gap-4">
      <OrcamentoItensCard className="w-full" />

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Sobre o Cliente</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div className="md:col-span-2">
              <label className="text-sm font-medium text-slate-700">Nome</label>
              <Input name="cliente_nome" placeholder="Nome completo" required />
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700">CPF/CNPJ</label>
              <Input name="cpf_cnpj" placeholder="000.000.000-00" required />
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700">WhatsApp</label>
              <Input name="celular_wpp" placeholder="(00) 00000-0000" required />
            </div>

            <div className="md:col-span-2">
              <label className="text-sm font-medium text-slate-700">E-mail</label>
              <Input name="email" type="email" placeholder="cliente@email.com" required />
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700">Instagram</label>
              <Input name="instagram" placeholder="@cliente" />
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700">Facebook</label>
              <Input name="facebook" placeholder="Nome no Facebook" />
            </div>
          </CardContent>
        </Card>

        <OrcamentoPagamentoCard />
      </div>

      {hasError ? (
        <p className="text-sm font-medium text-red-600">
          Não foi possível criar o orçamento. Revise os campos.
        </p>
      ) : null}

      <div className="mt-2 flex justify-end gap-2">
        <Link href="/orcamentos">
          <Button type="button" variant="secondary">
            Cancelar
          </Button>
        </Link>
        <Button type="submit">Salvar</Button>
      </div>
    </form>
  );
}
