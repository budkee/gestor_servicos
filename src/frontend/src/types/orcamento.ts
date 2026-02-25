export interface ItemOrcamento {
  id?: number;
  tipo: "ORCAMENTO" | "CONFECCAO" | "AJUSTE";
  descricao: string;
  quantidade: number;
  preco_unitario: string;
  valor: string;
}

export interface PagamentoOrcamento {
  forma_pagamento: "PIX" | "DINHEIRO" | "CREDITO" | "DEBITO";
  prazo_entrega: string;
  subtotal: string;
  desconto_percentual: string;
  desconto_valor: string;
  total: string;
}

export interface Orcamento {
  id: number;
  numero_registro: string;
  cliente: number;
  cliente_nome: string;
  cpf_cnpj: string;
  email: string;
  celular_wpp: string;
  instagram: string;
  facebook: string;
  tipo_servico: string;
  tipo: string;
  itens: ItemOrcamento[];
  pagamento: PagamentoOrcamento | null;
  descricao: string;
  quantidade: number | null;
  preco_unitario: string | null;
  observacoes: string;
  subtotal: string;
  desconto_percentual: string;
  desconto_valor: string;
  total: string;
  valor_total: string;
  criado_em: string;
}
