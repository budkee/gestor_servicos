import Link from "next/link";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { OrcamentoItensCard } from "@/components/orcamento-itens-card";
import { OrcamentoPagamentoCard } from "@/components/orcamento-pagamento-card";
import {
  obterOrcamento,
  atualizarOrcamento,
  removerOrcamento,
} from "@/services/orcamentos";

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ status?: string; erro?: string }>;
};

async function atualizarOrcamentoAction(id: number, formData: FormData) {
  "use server";

  const itensJson = String(formData.get("itens_json") || "[]");
  const tipoServico = String(formData.get("tipo_servico"));
  const desconto = String(formData.get("desconto_percentual") || "0");
  const clienteNome = String(formData.get("cliente_nome") || "");
  const cpfCnpj = String(formData.get("cpf_cnpj") || "");
  const email = String(formData.get("email") || "");
  const celularWpp = String(formData.get("celular_wpp") || "");
  const instagram = String(formData.get("instagram") || "");
  const facebook = String(formData.get("facebook") || "");
  const pagamentoForma = String(formData.get("pagamento_forma_pagamento") || "");
  const pagamentoPrazo = String(formData.get("pagamento_prazo_entrega") || "").trim();
  const pagamentoDescontoPercentual = String(formData.get("pagamento_desconto_percentual") || "").trim();

  if (!["ORCAMENTO", "CONFECCAO", "AJUSTE"].includes(tipoServico)) {
    redirect(`/orcamentos/${id}?erro=1`);
  }

  let itens: Array<{
    id?: number;
    tipo: "ORCAMENTO" | "CONFECCAO" | "AJUSTE";
    descricao: string;
    quantidade: number;
    preco_unitario: string;
  }> = [];
  try {
    const parsed = JSON.parse(itensJson);
    if (!Array.isArray(parsed)) throw new Error("itens_invalidos");
    itens = parsed.map((item) => {
      const idRaw = item.id;
      const id = idRaw === undefined || idRaw === null || idRaw === "" ? undefined : Number(idRaw);
      const tipoItem = String(item.tipo || "");
      const quantidade = Number(item.quantidade);
      const precoUnitario = Number(item.preco_unitario || 0);

      if (id !== undefined && (!Number.isInteger(id) || id < 1)) {
        throw new Error("item_id_invalido");
      }
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
        id,
        tipo: tipoItem as "ORCAMENTO" | "CONFECCAO" | "AJUSTE",
        descricao: String(item.descricao || "").trim(),
        quantidade,
        preco_unitario: precoUnitario.toFixed(2),
      };
    });
  } catch {
    redirect(`/orcamentos/${id}?erro=1`);
  }

  if (itens.length === 0 || itens.some((item) => !item.descricao)) {
    redirect(`/orcamentos/${id}?erro=1`);
  }

  if (!["PIX", "DINHEIRO", "CREDITO", "DEBITO"].includes(pagamentoForma) || !pagamentoPrazo) {
    redirect(`/orcamentos/${id}?erro=1`);
  }

  const descontoPagamentoNumero = pagamentoDescontoPercentual === "" ? Number(desconto) : Number(pagamentoDescontoPercentual);
  if (!Number.isFinite(descontoPagamentoNumero) || descontoPagamentoNumero < 0 || descontoPagamentoNumero > 100) {
    redirect(`/orcamentos/${id}?erro=1`);
  }

  try {
    await atualizarOrcamento(id, {
      tipo: tipoServico as "ORCAMENTO" | "CONFECCAO" | "AJUSTE",
      tipo_servico: tipoServico as "ORCAMENTO" | "CONFECCAO" | "AJUSTE",
      itens: itens.map((item) => ({
        id: item.id,
        tipo: item.tipo,
        descricao: item.descricao,
        quantidade: item.quantidade,
        preco_unitario: item.preco_unitario,
      })),
      desconto_percentual: Number(desconto),
      cliente_nome: clienteNome,
      cpf_cnpj: cpfCnpj,
      email,
      celular_wpp: celularWpp,
      instagram,
      facebook,
      pagamento: {
        forma_pagamento: pagamentoForma as "PIX" | "DINHEIRO" | "CREDITO" | "DEBITO",
        prazo_entrega: pagamentoPrazo,
        desconto_percentual: descontoPagamentoNumero,
      },
    });
  } catch {
    redirect(`/orcamentos/${id}?erro=1`);
  }

  revalidatePath(`/orcamentos/${id}`);
  revalidatePath("/orcamentos");
  redirect(`/orcamentos/${id}?status=salvo`);
}

async function removerOrcamentoAction(id: number) {
  "use server";

  try {
    await removerOrcamento(id);
  } catch {
    redirect(`/orcamentos/${id}?erro=1`);
  }

  revalidatePath("/orcamentos");
  redirect("/orcamentos?status=excluido");
}

export default async function OrcamentoDetalhePage({ params, searchParams }: Props) {
  const resolvedParams = await params;
  const query = await searchParams;
  const id = Number(resolvedParams.id);

  if (!id) {
    redirect("/orcamentos");
  }

  const orcamento = await obterOrcamento(id);

  return (
    <div className="flex max-w-full flex-col gap-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Orçamento {orcamento.numero_registro}</CardTitle>
          <div className="flex items-center gap-2">
            <a
              href={`/api/orcamentos/${id}/pdf?preview=1`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex h-10 items-center justify-center rounded-md bg-white px-4 text-sm font-medium text-slate-900 ring-1 ring-slate-300 transition hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-300 focus-visible:ring-offset-2"
            >
              Visualizar PDF
            </a>
            <a
              href={`/api/orcamentos/${id}/pdf`}
              className="inline-flex h-10 items-center justify-center rounded-md bg-slate-100 px-4 text-sm font-medium text-slate-900 transition hover:bg-slate-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-300 focus-visible:ring-offset-2"
            >
              Exportar PDF
            </a>
            <Link href="/orcamentos">
              <Button variant="secondary" type="button">
                Voltar
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {query.status === "criado" ? (
            <p className="text-sm font-medium text-emerald-700">Orçamento criado com sucesso.</p>
          ) : null}
          {query.status === "salvo" ? (
            <p className="text-sm font-medium text-emerald-700">Orçamento atualizado com sucesso.</p>
          ) : null}
          {query.erro === "1" ? (
            <p className="text-sm font-medium text-red-600">Não foi possível concluir a operação.</p>
          ) : null}

          <form action={atualizarOrcamentoAction.bind(null, id)} className="flex flex-col gap-4">
            <div className="rounded-md border border-slate-200 p-4">
              <h3 className="mb-3 text-sm font-semibold text-slate-800">Dados do cliente</h3>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="md:col-span-2">
                  <label className="text-sm font-medium text-slate-700">Cliente</label>
                  <Input name="cliente_nome" defaultValue={orcamento.cliente_nome} required />
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700">CPF/CNPJ</label>
                  <Input name="cpf_cnpj" defaultValue={orcamento.cpf_cnpj} required />
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700">E-mail</label>
                  <Input name="email" type="email" defaultValue={orcamento.email} required />
                </div>
                <div className="md:col-span-2">
                  <label className="text-sm font-medium text-slate-700">Celular/WPP</label>
                  <Input name="celular_wpp" defaultValue={orcamento.celular_wpp} required />
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700">Instagram</label>
                  <Input name="instagram" defaultValue={orcamento.instagram || ""} placeholder="@cliente" />
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700">Facebook</label>
                  <Input name="facebook" defaultValue={orcamento.facebook || ""} placeholder="Nome no Facebook" />
                </div>
              </div>
            </div>

            <OrcamentoItensCard
              initialTipo={(orcamento.tipo || orcamento.tipo_servico) as "ORCAMENTO" | "CONFECCAO" | "AJUSTE"}
              initialItens={orcamento.itens.map((item) => ({
                id: item.id,
                tipo: item.tipo,
                descricao: item.descricao,
                quantidade: String(item.quantidade),
                preco_unitario: item.preco_unitario,
              }))}
            />

            <OrcamentoPagamentoCard
              initialFormaPagamento={orcamento.pagamento?.forma_pagamento}
              initialPrazoEntrega={orcamento.pagamento?.prazo_entrega}
              initialDescontoPercentual={orcamento.pagamento?.desconto_percentual || orcamento.desconto_percentual}
              initialSubtotal={orcamento.pagamento?.subtotal || orcamento.subtotal}
            />

            <div className="flex flex-col gap-2">
              <p className="text-xs text-slate-500">Excluir remove orçamento e itens vinculados.</p>
            </div>
            <div className="mt-2 flex justify-end gap-2">
              <Link href="/orcamentos">
                <Button type="button" variant="secondary">
                  Cancelar
                </Button>
              </Link>
              <Button type="submit">Salvar alterações</Button>
            </div>
          </form>

          <form action={removerOrcamentoAction.bind(null, id)}>
            <Button type="submit" variant="ghost" className="text-red-700 hover:bg-red-50">
              Excluir orçamento
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
