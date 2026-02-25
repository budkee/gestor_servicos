"use client";

import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

type TipoServico = "ORCAMENTO" | "CONFECCAO" | "AJUSTE";

type ItemForm = {
  id?: number;
  tipo: TipoServico;
  descricao: string;
  quantidade: string;
  preco_unitario: string;
};

type Props = {
  initialTipo?: TipoServico;
  initialItens?: ItemForm[];
  className?: string;
};

function moeda(valor: number) {
  return valor.toFixed(2);
}

export function OrcamentoItensCard({
  initialTipo = "ORCAMENTO",
  initialItens = [{ tipo: initialTipo, descricao: "", quantidade: "1", preco_unitario: "0.00" }],
  className = "",
}: Props) {
  const [itens, setItens] = useState<ItemForm[]>(
    initialItens.length > 0 ? initialItens : [{ tipo: initialTipo, descricao: "", quantidade: "1", preco_unitario: "0.00" }]
  );

  const subtotal = useMemo(() => {
    return itens.reduce((acc, item) => {
      const quantidade = Number(item.quantidade || 0);
      const preco = Number(item.preco_unitario || 0);
      return acc + quantidade * preco;
    }, 0);
  }, [itens]);

  const itensJson = useMemo(() => JSON.stringify(itens), [itens]);

  useEffect(() => {
    window.dispatchEvent(
      new CustomEvent("orcamento:subtotal-change", {
        detail: { subtotal },
      })
    );
  }, [subtotal]);

  function atualizarItem(indice: number, patch: Partial<ItemForm>) {
    setItens((atual) => atual.map((item, i) => (i === indice ? { ...item, ...patch } : item)));
  }

  function adicionarItem() {
    setItens((atual) => [...atual, { tipo: initialTipo, descricao: "", quantidade: "1", preco_unitario: "0.00" }]);
  }

  function removerItem(indice: number) {
    setItens((atual) => {
      const proximo = atual.filter((_, i) => i !== indice);
      return proximo.length > 0 ? proximo : [{ tipo: initialTipo, descricao: "", quantidade: "1", preco_unitario: "0.00" }];
    });
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Serviços e Itens</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <input type="hidden" name="itens_json" value={itensJson} />
        <input type="hidden" name="tipo_servico" value={itens[0]?.tipo ?? initialTipo} />

        <div className="flex flex-col gap-3">
          {itens.map((item, indice) => (
            <div key={item.id ?? `novo-${indice}`} className="rounded-md border border-slate-200 p-3">
              <input type="hidden" value={item.id ?? ""} readOnly />
              <div className="flex flex-wrap items-start gap-3">
                <div className="min-w-44 flex-1 md:max-w-56">
                  <label className="text-sm font-medium text-slate-700">Tipo</label>
                  <select
                    value={item.tipo}
                    onChange={(event) => atualizarItem(indice, { tipo: event.target.value as TipoServico })}
                    className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-900 shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900"
                  >
                    <option value="ORCAMENTO">Orçamento</option>
                    <option value="CONFECCAO">Confecção</option>
                    <option value="AJUSTE">Ajuste</option>
                  </select>
                </div>
                <div className="min-w-56 flex-[2_1_28rem]">
                  <label className="text-sm font-medium text-slate-700">Descrição</label>
                  <textarea
                    value={item.descricao}
                    onChange={(event) => atualizarItem(indice, { descricao: event.target.value })}
                    rows={1}
                    className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900"
                    required
                  />
                </div>
                <div className="min-w-28 flex-1 md:max-w-36">
                  <label className="text-sm font-medium text-slate-700">Qtd</label>
                  <Input
                    type="text"
                    inputMode="numeric"
                    value={item.quantidade}
                    onChange={(event) => atualizarItem(indice, { quantidade: event.target.value })}
                    required
                  />
                </div>
                <div className="min-w-36 flex-1 md:max-w-48">
                  <label className="text-sm font-medium text-slate-700">Preço unitário</label>
                  <Input
                    type="text"
                    inputMode="decimal"
                    value={item.preco_unitario}
                    onChange={(event) => atualizarItem(indice, { preco_unitario: event.target.value })}
                    required
                  />
                </div>
                <div className="ml-auto self-center">
                  <Button
                    type="button"
                    variant="ghost"
                    className="h-10 px-3 text-red-700 hover:bg-red-50"
                    onClick={() => removerItem(indice)}
                  >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                  </svg>
                  </Button>

                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-center">
          <Button type="button" variant="secondary" onClick={adicionarItem}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="size-5">
              <path fillRule="evenodd" d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm.75-11.25a.75.75 0 0 0-1.5 0v2.5h-2.5a.75.75 0 0 0 0 1.5h2.5v2.5a.75.75 0 0 0 1.5 0v-2.5h2.5a.75.75 0 0 0 0-1.5h-2.5v-2.5Z" clipRule="evenodd" />
            </svg> <p className="p-3">Novo item</p>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
