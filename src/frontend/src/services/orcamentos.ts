import { serverFetcher } from "@/lib/server-fetcher";
import { Orcamento, ItemOrcamento } from "@/types/orcamento";

export type OrcamentoItemPayload = Pick<
  ItemOrcamento,
  "tipo" | "descricao" | "quantidade" | "preco_unitario"
> & { id?: number };

export type OrcamentoPagamentoPayload = {
  forma_pagamento: "PIX" | "DINHEIRO" | "CREDITO" | "DEBITO";
  prazo_entrega: string;
  desconto_percentual?: number;
};

export type OrcamentoPayload = {
  cliente?: number;
  cliente_nome?: string;
  cpf_cnpj?: string;
  celular_wpp?: string;
  email?: string;
  instagram?: string;
  facebook?: string;
  tipo?: "ORCAMENTO" | "CONFECCAO" | "AJUSTE";
  tipo_servico: "ORCAMENTO" | "CONFECCAO" | "AJUSTE";
  itens?: OrcamentoItemPayload[];
  pagamento?: OrcamentoPagamentoPayload;
  descricao?: string;
  quantidade?: number;
  preco_unitario?: number;
  desconto_percentual?: number;
  observacoes?: string;
};

export async function listarOrcamentos(): Promise<Orcamento[]> {
  return serverFetcher<Orcamento[]>("/orcamentos/api/");
}

export async function obterOrcamento(id: number): Promise<Orcamento> {
  return serverFetcher<Orcamento>(`/orcamentos/api/${id}/`);
}

export async function criarOrcamento(data: OrcamentoPayload): Promise<Orcamento> {
  return serverFetcher<Orcamento>("/orcamentos/api/", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function atualizarOrcamento(
  id: number,
  data: Partial<OrcamentoPayload>
): Promise<Orcamento> {
  return serverFetcher<Orcamento>(`/orcamentos/api/${id}/`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

export async function removerOrcamento(id: number): Promise<void> {
  await serverFetcher<void>(`/orcamentos/api/${id}/`, {
    method: "DELETE",
  });
}
