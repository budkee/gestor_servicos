"use client";

import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

type FormaPagamento = "PIX" | "DINHEIRO" | "CREDITO" | "DEBITO";

type Props = {
  initialFormaPagamento?: FormaPagamento;
  initialPrazoEntrega?: string;
  initialDescontoPercentual?: string;
  initialSubtotal?: string;
};

function parseDecimal(valor: string) {
  const normalizado = (valor || "0").replace(",", ".").trim();
  const numero = Number(normalizado);
  return Number.isFinite(numero) ? numero : 0;
}

function moeda(valor: number) {
  return valor.toFixed(2);
}

export function OrcamentoPagamentoCard({
  initialFormaPagamento = "PIX",
  initialPrazoEntrega = "",
  initialDescontoPercentual = "0",
  initialSubtotal = "0",
}: Props) {
  const [formaPagamento, setFormaPagamento] = useState<FormaPagamento>(initialFormaPagamento);
  const [prazoEntrega, setPrazoEntrega] = useState(initialPrazoEntrega);
  const [descontoPercentual, setDescontoPercentual] = useState(initialDescontoPercentual);
  const [subtotal, setSubtotal] = useState(parseDecimal(initialSubtotal));

  useEffect(() => {
    const handler = (event: Event) => {
      const custom = event as CustomEvent<{ subtotal?: number }>;
      setSubtotal(custom.detail?.subtotal ?? 0);
    };

    window.addEventListener("orcamento:subtotal-change", handler as EventListener);
    return () => window.removeEventListener("orcamento:subtotal-change", handler as EventListener);
  }, []);

  const descontoValor = useMemo(() => {
    const percentual = parseDecimal(descontoPercentual);
    const limitado = Math.max(0, Math.min(100, percentual));
    return subtotal * (limitado / 100);
  }, [descontoPercentual, subtotal]);

  const total = useMemo(() => Math.max(0, subtotal - descontoValor), [descontoValor, subtotal]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Pagamento</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="text-sm font-medium text-slate-700">Forma de pagamento</label>
          <select
            name="pagamento_forma_pagamento"
            value={formaPagamento}
            onChange={(event) => setFormaPagamento(event.target.value as FormaPagamento)}
            className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-900 shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900"
          >
            <option value="PIX">PIX</option>
            <option value="DINHEIRO">Dinheiro</option>
            <option value="CREDITO">Cartão de Crédito</option>
            <option value="DEBITO">Cartão de Débito</option>
          </select>
        </div>
        <div>
          <label className="text-sm font-medium text-slate-700">Prazo de entrega</label>
          <Input
            name="pagamento_prazo_entrega"
            value={prazoEntrega}
            onChange={(event) => setPrazoEntrega(event.target.value)}
            placeholder="Ex: 7 dias úteis"
            required
          />
        </div>
        <div>
          <label className="text-sm font-medium text-slate-700">Subtotal</label>
          <Input value={moeda(subtotal)} readOnly />
        </div>
        <div>
          <label className="text-sm font-medium text-slate-700">Desconto (%)</label>
          <Input
            name="desconto_percentual"
            type="text"
            inputMode="decimal"
            value={descontoPercentual}
            onChange={(event) => setDescontoPercentual(event.target.value)}
          />
          <input type="hidden" name="pagamento_desconto_percentual" value={descontoPercentual} />
        </div>
        <div>
          <label className="text-sm font-medium text-slate-700">Desconto (R$)</label>
          <Input value={moeda(descontoValor)} readOnly />
        </div>
        <div>
          <label className="text-sm font-medium text-slate-700">Total</label>
          <Input value={moeda(total)} readOnly />
        </div>
      </CardContent>
    </Card>
  );
}
