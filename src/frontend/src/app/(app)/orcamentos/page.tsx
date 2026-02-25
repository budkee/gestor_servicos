import Link from "next/link";
import { listarOrcamentos } from "@/services/orcamentos";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
} from "@/components/ui/table";

export default async function OrcamentosPage() {
  const orcamentos = await listarOrcamentos();

  return (
    <div className="flex flex-col gap-6">
      {/* Card  */}
      <section className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Total de orçamentos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold">{orcamentos.length}</div>
            <p className="text-sm text-slate-500">
              Atualizado em tempo real via API
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Ticket médio</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold">R$ 0,00</div>
            <p className="text-sm text-slate-500">
              Cálculo pendente de ajuste
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Última atualização</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold">Hoje</div>
            <p className="text-sm text-slate-500">
              Aguardando eventos do backend
            </p>
          </CardContent>
        </Card>
      </section>
      {/* Lista de orçamentos */}
      <Card>
        <CardHeader className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <CardTitle>Lista de orçamentos</CardTitle>
            <p className="text-sm text-slate-500">
              Visualização central dos registros
            </p>
          </div>
          {/* Novo orçamento */}
          <Link
            href="/orcamentos/novo"
            className="inline-flex items-center justify-center rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2"
          >
            Criar novo
          </Link>
        </CardHeader>
        <CardContent>
          {orcamentos.length === 0 ? (
            <div className="rounded-lg border border-dashed border-slate-200 p-8 text-center text-sm text-slate-500">
              Nenhum orçamento encontrado. Crie o primeiro registro.
            </div>
          ) : (
            <Table>
              <TableHead>
                <TableRow>
                  <TableHeaderCell>Registro</TableHeaderCell>
                  <TableHeaderCell>Cliente</TableHeaderCell>
                  <TableHeaderCell>Tipo</TableHeaderCell>
                  <TableHeaderCell>Subtotal</TableHeaderCell>
                  <TableHeaderCell>Desconto</TableHeaderCell>
                  <TableHeaderCell>Total</TableHeaderCell>
                  <TableHeaderCell></TableHeaderCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {orcamentos.map((orcamento) => (
                  <TableRow key={orcamento.id}>
                    <TableCell className="font-medium">
                      {orcamento.numero_registro}
                    </TableCell>
                    <TableCell>{orcamento.cliente_nome}</TableCell>
                    <TableCell>{orcamento.tipo_servico}</TableCell>
                    <TableCell>R$ {orcamento.subtotal}</TableCell>
                    <TableCell>
                      <Badge tone="warning">
                        {orcamento.desconto_percentual}% (
                        R$ {orcamento.desconto_valor})
                      </Badge>
                    </TableCell>
                    <TableCell className="font-semibold">
                      R$ {orcamento.total}
                    </TableCell>
                    <TableCell>
                      <Link
                        href={`/orcamentos/${orcamento.id}`}
                        className="text-sm font-semibold text-slate-700 hover:text-slate-900"
                      >
                        Ver detalhes
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
